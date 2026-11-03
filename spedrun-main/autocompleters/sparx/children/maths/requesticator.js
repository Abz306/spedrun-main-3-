const { decode, encode } = require('./sm_code.js');
const SparxBase = require('../../requesticator.js');

class SparxMaths extends SparxBase {
    constructor(authToken, login = {}, cookies) {
        super(authToken, login, cookies, decode, encode);
        this.v2Packages = new Map();
        this.v2Activities = new Map();
    }

    async getClientID() {
        const appPage = await this.curlRequests.sendRequest(
            'https://maths.sparx-learning.com/packages',
            null,
            false
        );
        const match = String(appPage?.data || '').match(/maths\/([a-z0-9]{40})\//i);

        if (!match) return null;

        const clientID = match[1];
        this.clientID = clientID;
        this.curlRequests.additionalHeaders = [`spx-app-version: ${clientID} maths`];
        return clientID;
    }

    async ensureClientID() {
        if (!this.clientID) await this.getClientID();
        return this.clientID;
    }

    async getHomeworks() {
        try {
            await this.ensureClientID();

            const endTimestamp = new Date();
            endTimestamp.setMonth(endTimestamp.getMonth() - 3);
            const request = await this.encodeStuff({
                parentName: 'assignments/',
                endTimestampAfter: {
                    seconds: Math.floor(endTimestamp.getTime() / 1000),
                    nanos: 0
                }
            }, 'ListStudentPackagesRequest');
            const response = await this.send(
                'https://api.sparx-learning.com/maths/sparx.packageactivity.v1.Packages/ListStudentPackages',
                request
            );
            const homeworkResponse = await this.decodeStuff(response.data, 'ListStudentPackagesResponse');
            const sourcePackages = Array.isArray(homeworkResponse?.packages) ? homeworkResponse.packages : [];
            const packages = sourcePackages.map(pkg => {
                const totalItems = Math.max(0, Number(pkg.state?.completion?.size) || 0);
                const completedItems = Math.max(
                    0,
                    Math.min(totalItems, Number(pkg.state?.completion?.progress?.C) || 0)
                );

                return {
                    packageID: String(pkg.name || '').split('/').pop(),
                    name: pkg.name,
                    title: pkg.title || 'Sparx homework',
                    endDate: pkg.endTimestamp,
                    numTaskItems: totalItems,
                    numTaskItemsDone: completedItems,
                    status: pkg.status,
                    packageType: pkg.type
                };
            }).filter(pkg => pkg.packageID);
            homeworkResponse.packages = packages;

            this.homeworkDiagnostics = {
                httpStatus: response.status,
                grpcStatus: response.headers?.['grpc-status'] ?? 'missing',
                packageSource: 'Maths v2 ListStudentPackages',
                returnedPackages: packages.length,
                packagesWithId: packages.filter(pkg => pkg?.packageID).length,
                packagesWithTitle: packages.filter(pkg => pkg?.title || pkg?.name).length
            };
            console.info('[Sparx Maths] Homework response:', this.homeworkDiagnostics);
            return homeworkResponse;
        } catch (err) {
            this.log.logToFile(`Error in getHomeworks: ${err.message}`);
            console.error('Error in getHomeworks:', err);
            throw err;
        }
    }

    async sendV2Request(method, requestObject, requestType, responseType) {
        await this.ensureClientID();
        const request = await this.encodeStuff(requestObject, requestType);
        const response = await this.send(
            `https://api.sparx-learning.com/maths/sparx.packageactivity.v1.${method}`,
            request
        );
        if (response.headers?.['grpc-status'] === '5') {
            if (method.startsWith('Activities/')) return 'ActivityExpired';
            throw new Error(`Maths v2 ${method} could not find the requested resource`);
        }
        if (response.headers?.['grpc-status'] && response.headers['grpc-status'] !== '0') {
            throw new Error(`Maths v2 ${method} failed: ${response.headers['grpc-message'] || response.headers['grpc-status']}`);
        }
        return this.decodeStuff(response.data, responseType);
    }

    async getV2Package(packageName, refresh = false) {
        if (!packageName) throw new Error('Maths v2 cannot load a package without a package ID');
        packageName = String(packageName || '').startsWith('packages/')
            ? String(packageName)
            : `packages/${packageName}`;
        if (!refresh && this.v2Packages.has(packageName)) {
            return this.v2Packages.get(packageName);
        }

        const packageResponse = await this.sendV2Request(
            'Packages/GetPackage',
            { packageName },
            'V2GetPackageRequest',
            'V2GetPackageResponse'
        );
        let pkg = packageResponse.package;

        const tasks = pkg?.contents?.tasks || [];
        const hasGeneratedTaskItems = tasks.some(task =>
            task.contents?.oneofKind === 'gamesTask' ||
            (Array.isArray(task.contents?.skillsTask?.taskItems) && task.contents.skillsTask.taskItems.length > 0)
        );
        if (tasks.length === 0 || !hasGeneratedTaskItems) {
            await this.sendV2Request(
                'Packages/GeneratePackageContents',
                { packageName },
                'V2GeneratePackageContentsRequest',
                'V2GeneratePackageContentsResponse'
            );

            const refreshedResponse = await this.sendV2Request(
                'Packages/GetPackage',
                { packageName },
                'V2GetPackageRequest',
                'V2GetPackageResponse'
            );
            pkg = refreshedResponse.package || pkg;
        }

        if (!pkg || !Array.isArray(pkg.contents?.tasks) || pkg.contents.tasks.length === 0) {
            throw new Error(`Maths v2 returned no task contents for ${packageName}`);
        }
        const hasRunnableItems = pkg.contents.tasks.some(task =>
            Array.isArray(task.contents?.skillsTask?.taskItems) && task.contents.skillsTask.taskItems.length > 0
        );
        const onlyGameTasks = pkg.contents.tasks.every(task => task.contents?.oneofKind === 'gamesTask');
        if (!hasRunnableItems && !onlyGameTasks) {
            throw new Error(`Maths v2 package ${packageName} still has no task items after content generation`);
        }

        this.v2Packages.set(packageName, pkg);
        return pkg;
    }

    async getTasksItems(packageID, taskIndex) {
        const pkg = await this.getV2Package(packageID);
        const task = pkg.contents.tasks[taskIndex - 1];
        if (!task) throw new Error(`Maths v2 task ${taskIndex} not found in ${packageID}`);
        const taskItems = task.contents?.skillsTask?.taskItems || [];
        return taskItems.map(item => ({
            ...item,
            status: item.state?.completed ||
                item.state?.status === 1 ||
                (item.contents?.oneofKind === 'flashcards' && item.state?.marks === 1)
                ? 1
                : 0
        }));
    }

    async getTasks(packageID) {
        const pkg = await this.getV2Package(packageID);
        const tasks = pkg.contents.tasks.map((task, index) => {
            const taskItems = task.contents?.skillsTask?.taskItems || [];
            const completion = task.state?.completion || { size: taskItems.length, progress: {} };
            const completedFromItems = taskItems.filter(item =>
                item.state?.completed ||
                item.state?.status === 1 ||
                (item.contents?.oneofKind === 'flashcards' && item.state?.marks === 1)
            ).length;

            return {
                ...task,
                taskIndex: Number.isInteger(task.taskIndex) ? task.taskIndex + 1 : index + 1,
                completion,
                title: task.title || `Task ${index + 1}`,
                numTaskItems: taskItems.length || Number(completion.size) || 0,
                numTaskItemsDone: Math.max(
                    completedFromItems,
                    Number(completion.progress?.C) || 0
                )
            };
        });

        return { ...pkg, tasks };
    }

    async getActivity(timestamp, packageID, taskIndex, taskItemIndex, activityType = 0) {
        const pkg = await this.getV2Package(packageID);
        const task = pkg.contents.tasks[taskIndex - 1];
        const taskItem = task?.contents?.skillsTask?.taskItems?.[taskItemIndex - 1];
        if (!taskItem?.name) {
            throw new Error(`Maths v2 task item not found at task ${taskIndex}, item ${taskItemIndex}`);
        }

        const activityResponse = await this.sendV2Request(
            'Activities/GetActivity',
            { name: '', taskItemName: taskItem.name },
            'V2GetActivityRequest',
            'V2GetActivityResponse'
        );
        if (activityResponse === 'ActivityExpired') return 'break';
        const activity = activityResponse.activity;
        if (!activity?.name) {
            throw new Error(`Maths v2 returned no activity for task item ${taskItem.name}`);
        }

        const viewedResponse = await this.sendV2Request(
            'Activities/ActivityAction',
            {
                name: activity.name,
                action: { oneofKind: 'view', view: { unload: false } },
                token: activity.state?.token || ''
            },
            'V2ActivityActionRequest',
            'V2ActivityActionResponse'
        );
        if (viewedResponse === 'ActivityExpired') return 'break';

        const viewedActivity = viewedResponse.activity || activity;
        const skillActivity = viewedActivity.state?.skillActivity;
        const questionJson = skillActivity?.question?.questionJson;
        if (!questionJson) {
            throw new Error(`Maths v2 activity ${activity.name} did not contain question JSON`);
        }

        const parsedQuestion = JSON.parse(questionJson);
        const currentQuestion = Array.isArray(parsedQuestion)
            ? parsedQuestion[parsedQuestion.length - 1]
            : parsedQuestion;
        const questionSpec = JSON.stringify([currentQuestion]);
        const token = viewedActivity.state?.token || activity.state?.token || '';
        if (!token) {
            throw new Error(`Maths v2 activity ${activity.name} did not provide an activity token`);
        }
        this.v2Activities.set(activity.name, {
            token,
            packageID,
            taskIndex,
            taskItemIndex,
            isFlashcard: taskItem.contents?.oneofKind === 'flashcards'
        });

        return {
            activityIndex: activity.name,
            payload: {
                oneofKind: 'question',
                question: {
                    questionIndex: token,
                    questionSpec,
                    bookworkCode: ''
                }
            }
        };
    }

    async getClientSession() {
        const body = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00]);

        const responseR = await this.curlRequests.sendRequest("https://api.sparx-learning.com/sparx.messaging.server.v1.SWServerSession/ClientSession", body, { responseType: 'arraybuffer', returnHeaders: true  });

        const responseBuffer = responseR.data;
        // console.log(responseBuffer);
        const response = await this.decodeStuff(responseBuffer, "ClientSessionResponse");
        // console.log(response.sessionId);
        this.sessionId = response.sessionId;
        this.curlRequests.headers = this.curlRequests.headers.map(header =>
            header.startsWith('x-session-id:')
                ? `x-session-id: ${this.sessionId}`
                : header
        );

        return response.sessionId;
    }


    async answerQuestion(inputObject) {
        const activityName = inputObject.name || inputObject.activityIndex;
        const activityState = this.v2Activities.get(activityName);
        const action = inputObject.action || {};
        let v2Action = action;

        if (action.oneofKind === 'question') {
            const components = action.question?.answer?.components || [];
            v2Action = {
                oneofKind: 'answer',
                answer: {
                    components: Array.isArray(components)
                        ? Object.fromEntries(components.map(component => [component.key, component.value]))
                        : components,
                    autoProgressStep: false
                }
            };
        } else if (action.oneofKind === 'wac') {
            throw new Error('Maths v2 does not support the legacy bookwork answer action');
        }

        const response = await this.sendV2Request(
            'Activities/ActivityAction',
            {
                name: activityName,
                action: v2Action,
                token: activityState?.token || inputObject.token || ''
            },
            'V2ActivityActionRequest',
            'V2ActivityActionResponse'
        );
        if (response === 'ActivityExpired') return response;

        const updatedActivity = response.activity;
        if (activityState && updatedActivity?.state?.token) {
            this.v2Activities.set(activityName, {
                ...activityState,
                token: updatedActivity.state.token
            });
        }

        const evaluation = updatedActivity?.state?.skillActivity?.evaluation;
        const packageUpdate = response.packageUpdate;
        const updatedTask = packageUpdate?.contents?.tasks?.[activityState?.taskIndex - 1];
        const updatedTaskItem = updatedTask?.contents?.skillsTask?.taskItems?.[activityState?.taskItemIndex - 1];
        const answerStatus = evaluation?.status ?? updatedTaskItem?.state?.status;
        const flashcardSucceeded = activityState?.isFlashcard && (
            updatedTaskItem?.state?.marks === 1 ||
            updatedTaskItem?.state?.completed
        );
        const submittedAnswer = v2Action.answer?.components || {};
        response.response = {
            status: answerStatus === 1 || flashcardSucceeded ? 'SUCCESS' : 'FAILURE',
            givenAnswerXML: JSON.stringify(submittedAnswer)
        };
        return response;
    }

    async startTimesTable(inputObject) {
        const fullMessage = await this.encodeStuff(inputObject, 'GetActivityRequest');

        const answerRequest = await this.send('https://api.sparx-learning.com/sparx.swworker.v1.Sparxweb/GetActivity', fullMessage); // this.authToken

        const answerResponse = await this.decodeStuff(answerRequest.data, 'ActivityAction');

        return answerResponse;
    }

    async answerTimesTable(inputObject) {
        const fullMessage = await this.encodeStuff(inputObject, 'ActivityAction');

        const answerRequest = await this.send('https://api.sparx-learning.com/sparx.swworker.v1.Sparxweb/ActivityAction', fullMessage); // this.authToken

        const answerResponse = await this.decodeStuff(answerRequest.data, 'ActivityActionResponse');

        return answerResponse;
    }

    async searchIndependantLearning(inputObject) {
        const fullMessage = await this.encodeStuff(inputObject, 'Query');

        const answerRequest = await this.send('https://api.sparx-learning.com/sparx.content.search.v1.Search/Search', fullMessage); // this.authToken

        const answerResponse = await this.decodeStuff(answerRequest.data, 'Result');

        return answerResponse;
    }

    async getPackagesIndependantLearning(inputObject) {
        const fullMessage = await this.encodeStuff(inputObject, 'GetPackagesForObjectivesRequest');

        const answerRequest = await this.send('https://api.sparx-learning.com/sparx.revision.v1.Revision/GetPackagesForObjectives', fullMessage); // this.authToken

        const answerResponse = await this.decodeStuff(answerRequest.data, 'GetPackagesForObjectivesResponse');

        return answerResponse;
    }

    async getActivePackages(inputObject) {
        const fullMessage = await this.encodeStuff(inputObject, 'GetActivePackagesRequest');

        const answerRequest = await this.send('https://api.sparx-learning.com/sparx.revision.v1.Revision/GetActivePackages', fullMessage); // this.authToken

        const answerResponse = await this.decodeStuff(answerRequest.data, 'GetActivePackagesResponse');

        return answerResponse;
    }

    async listTopicSummariesRequest(inputObject) {
        const fullMessage = await this.encodeStuff(inputObject, 'ListTopicSummariesRequest');

        const answerRequest = await this.send('https://api.sparx-learning.com/sparx.content.summaries.v1.TopicSummaries/ListTopicSummaries', fullMessage); // this.authToken

        const answerResponse = await this.decodeStuff(answerRequest.data, 'ListTopicSummariesResponse');

        return answerResponse;
    }

    async listCurriculumSummaries(inputObject) {
        const fullMessage = await this.encodeStuff(inputObject, 'ListCurriculumSummariesRequest');

        const answerRequest = await this.send('https://api.sparx-learning.com/sparx.content.summaries.v1.CurriculumSummaries/ListCurriculumSummaries', fullMessage); // this.authToken

        const answerResponse = await this.decodeStuff(answerRequest.data, 'ListCurriculumSummariesResponse');

        return answerResponse;
    }
}

module.exports = SparxMaths;