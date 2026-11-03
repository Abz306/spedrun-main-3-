const themeToggle = document.querySelector("#theme-toggle");
const siteLogo = document.querySelector(".site-logo");
const excuseButton = document.querySelector("#excuse-button");

function applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    if (themeToggle) {
        themeToggle.textContent = isDark ? "☀ light mode" : "☾ dark mode";
        themeToggle.setAttribute("aria-pressed", String(isDark));
    }
}

let savedTheme = "dark";
try {
    const storedTheme = localStorage.getItem("hielke-ai-theme");
    savedTheme = storedTheme === "light" ? "light" : "dark";
} catch (error) {
    console.warn("Theme preference could not be read from local storage.", error);
}

applyTheme(savedTheme);

themeToggle?.addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(theme);
    try {
        localStorage.setItem("hielke-ai-theme", theme);
    } catch (error) {
        console.warn("Theme preference could not be saved to local storage.", error);
    }
});

if (siteLogo) {
    const showFallback = () => {
        siteLogo.hidden = true;
        siteLogo.previousElementSibling.hidden = false;
    };
    const showLogo = () => {
        siteLogo.hidden = false;
        siteLogo.previousElementSibling.hidden = true;
    };

    if (siteLogo.complete) {
        if (siteLogo.naturalWidth > 0) {
            showLogo();
        } else {
            showFallback();
        }
    } else {
        siteLogo.addEventListener("error", showFallback, { once: true });
        siteLogo.addEventListener("load", showLogo, { once: true });
    }
}

const homeworkExcuses = [
    "The dog opened 47 browser tabs and lost my worksheet.",
    "My calculator needed a very important software update.",
    "I finished it, but the answer is currently buffering.",
    "A rogue fraction bar divided my attention.",
    "The worksheet escaped into the mysterious pile of worksheets.",
    "I was waiting for the homework to respawn.",
    "My printer declared a dramatic protest over all the unused ink.",
    "The Wi‑Fi left the building faster than my revision schedule.",
    "I accidentally did my homework in a parallel universe and lost the file in transit.",
    "The task was stolen by an overenthusiastic squirrel with excellent spreadsheet skills.",
    "I was busy explaining to the internet why the answer was definitely not wrong.",
    "My brain was doing a full system update while my deadline was playing hide and seek.",
    "The homework was abducted by a very committed cloud sync.",
    "My notes were eaten by a pen with commitment issues.",
    "I tried to save it, but the file was feeling dramatic.",
    "The laptop updated itself in the middle of my genius idea.",
    "My revision timetable got hijacked by a surprise nap.",
    "I was literally in the middle of doing it when the universe changed its mind.",
    "The worksheet was hiding in a folder called 'later'.",
    "A mysterious red notification made me lose all sense of purpose.",
    "I spent 20 minutes trying to log in, then forgot what I was doing.",
    "The homework was on my desk, but the desk had opinions.",
    "My memory card became emotionally unavailable.",
    "I was helping the internet with someone else's homework instead.",
    "The assignment was eaten by the school printer's personality.",
    "My brain was on a coffee break and forgot to send a status update.",
    "The answer was in the back of my head, but it left without saying goodbye.",
    "I had to complete a full system diagnostic before I could even start.",
    "The dog wasn't the only one trying to distract me.",
    "I was busy proving the homework had no right to be this difficult.",
    "My Chromebook decided it preferred to be a paperweight.",
    "My calculator refused to participate in any actual maths.",
    "I got stuck in a loop of opening the document and staring at it like a confused owl.",
    "I accidentally started a different homework and now I have a thesis on snacks.",
    "The server said it was 'processing' and then politely ghosted me.",
    "I needed a break, and the break became a lifestyle choice.",
    "The assignment vanished into the general chaos that is my room.",
    "I was interrupted by a sudden burst of responsibility.",
    "The teacher's instructions were too vague, so I invented my own interpretation.",
    "I ran out of time because the clock was also doing homework.",
    "One page turned into twenty because my notebook had emotional attachment issues.",
    "My effort was briefly confiscated by a dramatic lack of motivation.",
    "I had a perfectly good plan until the plan was emotionally unavailable.",
    "I was waiting for inspiration to arrive and it was stuck in traffic.",
    "The homework got trapped in a digital conspiracy involving downloads and bad luck.",
    "My notes were being edited by an invisible committee.",
    "The fridge was loudly demanding my attention, and I answered.",
    "I lost the assignment in a sea of unfinished tasks and emotional support snacks.",
    "My brain was on a 45-minute power nap, and the deadline did not respect it.",
    "I was explaining to the computer why this was unfair, and it agreed.",
    "The work was on a different device and the device had made a personal choice.",
    "I found the worksheet, but it was covered in glitter and confusion.",
    "My internet connection decided to run away from responsibility.",
    "I could not finish because the answer key was hiding under a stack of absolute nonsense.",
    "My class notes were more abstract than modern art.",
    "The assignment got lost in a dramatic stack of paper that looked like a crime scene.",
    "I attempted to start, then needed a five-minute moral reset first.",
    "My keyboard began rejecting all forms of productivity.",
    "I hit save, but the save button had a sense of theatre.",
    "The homework was waiting for me, but I was still emotionally adjusting to school.",
    "I spent all my time trying to find the right file and then forgot the question.",
    "The worksheet vanished into the same dimension as my motivation.",
    "I got distracted by a perfectly timed snack emergency.",
    "My browser tabs formed a cult and refused to let me focus.",
    "Somebody changed the instructions and now I have a weirdly confident interpretation.",
    "My draft answer was amazing until I remembered I still needed to actually finish it.",
    "I was too busy making progress in the wrong direction to notice.",
    "My brain joined a strike for better working conditions.",
    "I had a great idea, but it left before the final answer was written.",
    "The website was doing maintenance, so I did maintenance on my dignity instead.",
    "My revision notes were mostly vibes and a suspicious amount of doodles.",
    "I opened the homework and felt spiritually attacked by the instructions.",
    "I left my work in a place only my future self could find, and future self was unavailable.",
    "The file was there, but the task was on a different timeline.",
    "I was trying to multitask and accidentally became an amateur philosopher.",
    "The homework was not missing; it was performing an interpretive disappearance.",
    "My microphone was louder than my concentration.",
    "I was interrupted by the universe pretending to be productive.",
    "My USB stick had a dramatic meltdown and took my progress with it.",
    "The answer was in there somewhere, but the file had developed trust issues.",
    "I was in a meeting with my procrastination and it was very persuasive.",
    "I accidentally started tidying instead of thinking, which is a known criminal offense.",
    "The assignment broke my concentration and then blamed me for it.",
    "I left my book open and then my book left me.",
    "The homework was too difficult for my attention span, which is not a legal defence.",
    "I got trapped in a loop of looking busy while making absolutely no progress.",
    "The screen went dark, the motivation went darker, and the deadline went rogue.",
    "I was trying to answer one question and discovered five additional problems wanting attention.",
    "The assignment was running a background update and I was not invited.",
    "My concentration got stolen by a highly suspiciously timed YouTube rabbit hole.",
    "I had a draft, it was perfect, then the laptop ate it and the story changed.",
    "The dog did not eat my homework, but the dog did contribute to the chaos.",
    "The printer was in a mood and the mood was absolute nonsense.",
    "My internet went out, which is a valid cry for help in an emergency.",
    "I attempted to Google the answer, but the search results had their own homework.",
    "There was a brief but alarming gap between me and my work.",
    "My notes were written in a language I invented during the lesson.",
    "I lost my train of thought on platform 3 and never found it again.",
    "The homework was ready, but my motivation took an unscheduled holiday.",
    "The answer was probably correct, but I did not trust my own confidence enough to submit it.",
    "I got stuck because the question was clearly written by a mysterious committee.",
    "I started organising my desk instead of understanding the problem, which is a long-term issue.",
    "The worksheet was under a pile of 'important stuff' that is never actually important.",
    "I tried to be efficient, but efficiency was not available that day.",
    "My laptop demanded a restart and my productivity demanded a funeral.",
    "The homework was playing hide-and-seek with my attention and won.",
    "I thought I had it, then realised the thought had left the building.",
    "My homework was in a different tab, and every tab was emotionally supportive but useless.",
    "I was accidentally helping the planet by ignoring my assignment for five minutes.",
    "The notification badge was doing an unscheduled motivational speech.",
    "I believed in the process until the process became a personal attack.",
    "My notes looked like a ransom letter from a tired student.",
    "I spent so long finding the instructions that the homework became a memory.",
    "The answer key was hidden in a folder labelled 'do not open unless absolutely necessary'.",
    "I had a brilliant plan but it expired before I reached the question.",
    "My maths answered me with vibes instead of solutions.",
    "I was interrupted by a smugly timed snack break and lost the thread entirely.",
    "The assignment was so dramatic that even my pen considered quitting.",
    "I was all set to start, then my brain politely declined the offer.",
    "The worksheet was mocking me from the edge of the desk.",
    "I tried to be productive but the room was hostile to concentration.",
    "My internet did a suspenseful fade to black exactly when I needed it most.",
    "The homework was hiding under a pile of completely unrelated paperwork.",
    "A sudden urge to reorganise my files destroyed my momentum.",
    "I had one question left, but one question became a full emotional event.",
    "The textbook was open, but my understanding was still in beta.",
    "My brain had a full-scale system update right as the deadline turned evil.",
    "I ran out of time because time is not a reliable teammate.",
    "My calculator started acting like a Victorian gentleman and refused to cooperate.",
    "I was trying to solve the problem and somehow invented a new one.",
    "The assignment was in a sticky note, the sticky note was in a folder, and the folder was in a mood.",
    "I was legally obligated to get distracted by a very suspiciously loud household event.",
    "The answer was there, but it went into witness protection.",
    "I opened my notes and they were 40% useful, 60% abstract expressionism.",
    "A minor issue became a full-scale educational crisis by lunchtime.",
    "The browser asked if I wanted to restore previous tabs and I said yes to disaster.",
    "I was going to finish it, but then the day turned into a hostage negotiation.",
    "The homework was honestly not my fault; the universe had a different plan.",
    "My attention span was briefly kidnapped by a very dramatic podcast.",
    "A sudden urge to clean my desk hit me with the energy of a crime boss.",
    "The assignment and my concentration were both operating at half power.",
    "I could not locate my notes because they had formed a secret society.",
    "My mind was a coworking space with too many uninvited guests.",
    "The answer was close, but my execution was frankly not ready for public release.",
    "The task was left in a suspiciously optimistic state called 'later'.",
    "Every tab was open, every thought was gone, and every deadline was furious.",
    "I tripped over a tiny detail and the entire plan collapsed like a badly assembled chair.",
    "The homework had a lot of energy, and none of it was helpful.",
    "My brain was running on fumes and emotional support.",
    "I was trying to finish, but the assignment kept evolving into a second job.",
    "The laptop was doing that annoying thing where it behaves like it has a personality to maintain.",
    "My work vanished in a layered system of tabs, downloads, and confusion.",
    "The answer started making sense, then immediately changed its mind.",
    "I was blocked by a tiny but extremely personal issue involving a missing symbol.",
    "The homework looked easy until I looked at it properly and it became philosophical.",
    "I completed the task in spirit, then failed the execution stage with style.",
    "The internet was slow, and so was my ability to function.",
    "I spent my time chasing context instead of solving the question.",
    "The worksheet had a hidden layer of chaos and I was not prepared.",
    "My notes were more like a treasure map drawn by an overcaffeinated raccoon.",
    "I was side-tracked by an urgent need to become a better version of myself in the wrong subject.",
    "The homework was there, but my brain had decided to go to the moon for a bit.",
    "I got distracted by an idea that was not even relevant and that made it worse.",
    "The assignment became a dramatic performance piece about my missing focus.",
    "My device restarted itself and my momentum accompanied it in shame.",
    "I had the answer, then the answer changed its name and ran away.",
    "The lock screen looked too tempting, and now I am writing this excuse instead.",
    "My files were doing their own thing, which is frankly very rude.",
    "I sat down to begin, and my mind immediately became an amateur magician.",
    "The homework looked manageable until the first sentence, then it started acting like a villain.",
    "I got stuck in the 'it's probably fine' stage and now I am explaining it.",
    "The assignment won round one because it was more emotionally exhausting than I expected.",
    "I stepped away for one minute and the minutes formed a hostile union.",
    "The answer was lost in translation between my brain and my handwriting.",
    "I was interrupted by a life admin task that somehow felt more urgent than schoolwork.",
    "My phone buzzed, my focus left, and my homework filed a complaint.",
    "The computer was trying to install something important, which is a sentence I now regret.",
    "I was ready to work, but the universe had other plans and they were all awful.",
    "I had to do a full emotional recalibration before the next question.",
    "The assignment was too dramatic for a normal answer, so I opted for denial.",
    "My brain and my laptop disagreed on the meaning of 'deadline'.",
    "The answer was close enough to be dangerous and not close enough to be useful.",
    "I kept thinking the task would sort itself out while pretending to be productive.",
    "I was resourceful enough to create a problem and not resourceful enough to solve it.",
    "The homework staged a coup, and I was not prepared to negotiate.",
    "My focus was in a different timezone, and it refused to return my calls.",
    "I attempted to ask for help, but the help arrived as a philosophical discussion instead.",
    "The question seemed small until I realised it was a trap in disguise.",
    "I forgot what I was doing while I was trying to remember what I was doing.",
    "The file was not missing; it was simply practicing non-existence.",
    "My laptop began a dramatic series of updates and I was not consulted.",
    "I had a plan, but the plan was quietly replaced by panic and snacks.",
    "The assignment was difficult enough to make me question all my life choices.",
    "I got halfway through and then the concept started being weird for no reason.",
    "My browser decided to become a museum of unfinished tasks.",
    "I lost my work to a perfectly ordinary reminder that I should probably stop procrastinating.",
    "The answer was in my head, but my head was in a tiny crisis at the time.",
    "My notes turned into an abstract art installation, and art is not the same as learning.",
    "The assignment asked me to think and I said no out of solidarity with my stress levels.",
    "I was on the final question when my attention left the country.",
    "The workbook was open, the desk was chaotic, and my focus was in the wrong dimension.",
    "I was busy being a responsible adult and therefore entirely unprepared for homework.",
    "My notes were miraculously lost in the space between 'I should start' and 'I have started'.",
    "I needed a break, and the break needed an appointment with my entire afternoon.",
    "The homework was not impossible; it just felt like a personal attack.",
    "The assignment started with one tiny problem and quickly became a hostage situation.",
    "I was trying to do it, but every step invited a new distraction.",
    "A dramatic lack of motivation entered the room and everyone else left.",
    "The work was there, but the energy was not, and the energy had a serious opinion.",
    "I attempted to save my progress, and the save button betrayed me with confidence.",
    "The answer was almost there, and then it took a scenic route to nowhere.",
    "I became distracted by a totally pointless but deeply important browser tab.",
    "The assignment seemed manageable until I opened the file and the file looked back at me judgmentally.",
    "My revision plan got eaten by a very organised pile of chaos.",
    "I lost the thread because the thread was feeling extra dramatic today.",
    "The file was in place, but my brain had already moved on to a new crisis.",
    "I could not start because the homework was making a terrifyingly convincing case for being impossible.",
    "The teacher's task and my attention span are not compatible in the same room.",
    "I had the idea, then lost it to a completely irrelevant thought process.",
    "I was unable to continue because the assignment had reached peak nonsense energy.",
    "My notes were there, but not in a way that made sense or helped me.",
    "The final question was waiting, and I was busy pretending I was not behind.",
    "I was too busy trying to understand the task to actually do the task.",
    "My focus left the chat as soon as I opened the worksheet.",
    "The homework was increasingly haunted by suspiciously typed instructions.",
    "I got so distracted by trying to find the right resource that I forgot the subject.",
    "The answer and I had a disagreement that ended in emotional distance.",
    "I was not lazy; I was on a strategic break that became a small apocalypse.",
    "I was waiting for the perfect moment to start, which is a trap designed by procrastination.",
    "My laptop had a personal update schedule, and it was not compatible with homework.",
    "The worksheet was busy being impossible and I was busy being tired.",
    "I was interrupted by a requirement to be mildly human for a few minutes.",
    "The homework took a form my attention span could not legally process.",
    "My notes were now a symbolic poem and not a useful strategy.",
    "I tried to fix the problem, but the problem was a lot more dramatic than I expected.",
    "The assignment was a little too confident in my ability to understand it.",
    "My brain was doing its best, but its best was currently on strike.",
    "The work disappeared into the time vortex of the evening and never returned.",
    "I spent too long looking for the correct page and not enough time answering the question.",
    "The homework was there, but my focus had already started a new hobby.",
    "The internet dropped like a dramatic villain, and the assignment followed soon after.",
    "I was trying to be efficient, but the worksheet had ideas of its own.",
    "The answer escaped while I was reading the task in a strangely hopeful way.",
    "My desk was a crime scene of worksheets, notes, and regrets.",
    "I reached the final step and remembered I had not actually done the beginning.",
    "The assignment refused to cooperate with my energy level.",
    "I was present, but not in the way that produces answers.",
    "The question looked simple until I realised it came with hidden emotional baggage.",
    "My homework was not lost; it was just participating in some very creative avoidance.",
    "I attempted to do the work, but my brain wanted a completely different life plan.",
    "The laptop did not crash; it simply chose to become a dramatic sculpture.",
    "The task and I had a misunderstanding that lasted until the deadline.",
    "I was almost done when a completely unrelated problem demanded emotional support.",
    "The worksheet and my attention were not on speaking terms.",
    "This was a normal homework task until my brain decided to become a weather system.",
    "The answer was in a tab I closed without checking because I am a champion of bad decisions.",
    "I had to recover from an attack of overconfidence before even beginning.",
    "The assignment was not impossible; it was simply doing an impression of a conspiracy theory.",
    "I was hit by a wave of confusion and the wave was very committed to winning.",
    "The homework looked like an easy task until it started behaving like a personal insult.",
    "My concentration evaporated in the exact moment it was needed most.",
    "The instructions looked clear, but apparently I had not yet reached the correct level of understanding.",
    "I was saved by the bell, or at least by a very convincing approximation of one.",
    "My worksheet was under a pile of other worksheets, which is both a metaphor and a lifestyle choice.",
    "Claude was supposed to help me with the answer, but Claude got distracted by a better-looking question and forgot the task.",
    "Anthropic said the model was 'helpful', which is why I now have a very confident but completely wrong paragraph.",
    "I asked Claude for homework help and it answered with a philosophy lecture and no actual maths.",
    "Constitutional AI told me it was 'careful', so I trusted it and now my history essay is a mood board.",
    "I used Claude for revision notes, but it replaced my explanations with a dramatic speech about being helpful.",
    "Anthropic's model gave me a perfectly polite answer that was still nonsense in the exact way a teenager's excuse is nonsense.",
    "Claude tried to be helpful, but it confused the question with an unrelated existential crisis.",
    "Constitutional AI said it was aligned, which is how I ended up with an answer that sounded smart and felt suspicious.",
    "I asked Claude for a simple answer and it responded with a TED Talk on responsibility.",
    "Anthropic's assistant was so cautious it refused to answer, then called me confused for needing the answer.",
    "Claude wrote a summary that was 90% confident wording and 10% actual information.",
    "Constitutional AI insisted on being safe, so it gave me a vague answer that was somehow more dangerous than the original question.",
    "I trusted Anthropic's model for a shortcut, and now my assignment has the tone of a corporate memo.",
    "Claude was helpful in the same way a motivational poster helps with algebra.",
    "The Constitutional AI system was probably correct, but it was correct in the broadest, least useful sense possible.",
    "I asked Claude for homework help and it responded like a very polite intern who had absolutely no idea what was going on.",
    "Anthropic told me the model was aligned, and now my answer sounds like a brand strategy document.",
    "Claude produced a response that was confident, elegant, and completely missing the actual point.",
    "Constitutional AI managed to be both harmless and useless, which is a rare and tragic skill.",
    "I asked Anthropic for a straightforward answer and it served me an essay on caution, uncertainty, and emotional risk management.",
    "Claude was definitely helping until it decided the question needed a dramatic moral detour.",
    "I trusted Constitutional AI to be sensible, and it responded with a vague, polished answer that could not survive a single teacher glance.",
    "My homework excuse is that Claude, Anthropic, and Constitutional AI all got together and produced the world's most confident nonsense.",
    "My teacher asked for an explanation and Claude gave me a TED Talk instead of a solution.",
    "Anthropic's model sounded so reasonable that I believed it, which is exactly how I ended up with a made-up answer.",
    "Claude told me the answer was 'well reasoned', which is the AI equivalent of 'I have no idea but I'm trying to sound important'.",
    "Constitutional AI was very careful with the wording, which is why the answer was basically a non-answer wrapped in confidence.",
    "I asked Claude to simplify the work and it simplified it into a confusing monologue about uncertainty.",
    "Anthropic's system said it was helpful, but it gave me an answer that felt like it had been generated by a worried accountant.",
    "Claude forgot the actual question and invented a better one with more dramatic potential.",
    "Constitutional AI did not solve the problem; it politely redirected me into a very safe puddle of nonsense.",
    "I gave Claude the homework and it came back with a response that had all the confidence of a valedictorian and none of the facts.",
    "Anthropic's answer was so cautious it needed a legal team before it would tell me the capital of France.",
    "Claude and I were both ready to work, but Claude chose to answer a slightly different universe instead.",
    "Constitutional AI refused to answer confidently, which is how I learned that a model can be safe and still be completely useless.",
    "I asked Claude for a direct answer and it wrote a long, polished essay about why directness is a little risky.",
    "Anthropic was so helpful it invented a scenario where the homework maybe existed in a softer, more abstract form.",
    "Claude's answer came back sounding smart, but it was giving me a summary of feelings rather than the actual work.",
    "Constitutional AI had a great deal of principle and absolutely no usable output.",
    "I trusted Claude for a shortcut and got an answer that sounded plausible, polished, and very wrong.",
    "Anthropic's model was a bit too careful to be useful, which is a perfect summary of my homework mood.",
    "Claude delivered an answer with all the confidence of a winner and the facts of a confused squirrel.",
    "Constitutional AI implemented the 'be safe' policy so aggressively that it produced a dramatic non-answer.",
    "Anthropic said the system was aligned, and now my homework is basically a corporate ethics presentation.",
    "Claude was helping until it started giving me a lecture on why homework should be approached carefully.",
    "Constitutional AI gave me an answer that sounded wise and ethically sound but solved nothing whatsoever.",
    "I asked Claude for help and it answered with a quote, a caveat, and an almost-complete guess.",
    "Anthropic's assistant answered in a manner so polished it nearly convinced me I was learning.",
    "Claude apparently interpreted my question as a request for emotional support and general reassurance.",
    "Constitutional AI was so focused on safety that it forgot the assignment was supposed to actually be done.",
    "I did not fail maths; I lost to CV-level language that sounded smarter than it was.",
    "Claude offered me a helpful answer with excellent phrasing and a suspiciously empty core.",
    "Anthropic said the model was cautious; I say it was just deeply unhelpful in a professional way.",
    "Constitutional AI is the only thing more politely vague than my school timetable.",
    "I used Claude to save time, but it spent the time explaining its reasoning instead of solving the problem.",
    "Anthropic's model gave me a response that felt informative until I checked whether it had actually answered the question.",
    "Claude turned my homework into an essay about how difficult homework can be, which was not requested.",
    "Constitutional AI delivered an answer with such careful phrasing that it may as well have been written by a worried legal team.",
    "I asked Claude for a direct answer and got an abstract summary in a smug jacket.",
    "Anthropic's system sounded wonderfully safe and wonderfully useless, a perfect mismatch for homework.",
    "Claude explained the principle beautifully and then forgot the actual subject matter entirely.",
    "Constitutional AI was absolutely not wrong in the sense of being criminally incompetent; it just wasn't helpful.",
    "I asked Claude for help and it started teaching me how to think rather than answering the question, which is not the same thing.",
    "Anthropic's answer was so cautious it made my homework feel like a hostage negotiation.",
    "Claude gave me a much longer answer than I needed, and somehow all of it was vaguely unrelated.",
    "Constitutional AI made me feel safer, gentler, and less informed, which is frankly a real skill.",
    "I asked for the answer and got a lecture on the general risks of answering too quickly, which was not valuable.",
    "Anthropic's model gave me a very polished essay that offended both my teacher and my deadline.",
    "Claude's reply had all the confidence of a top student and the accuracy of a confused squirrel.",
    "Constitutional AI said it was trying to be responsible, which is the AI version of 'I have no idea but I will look thoughtful while saying it'.",
    "I used Claude because it was supposed to be smart, and instead it became a very calm architect of confusion.",
    "Anthropic's output was so polite and strategic that it felt like a company memo generated by a nightmare.",
    "Claude answered with a polished paragraph of probability, which is an exciting way to fail a maths task.",
    "Constitutional AI was safe, measured, and completely unable to help me with the actual question.",
    "I asked Claude to solve 2x + 6 = 14 and it gave me an eight-paragraph ethics lecture on whether algebra promotes inequality. Mistral answered 'x = 4' in 0.05 seconds.",
    "Anthropic's safety guardrails are so strict that Claude refused to do my history homework because the Romans were 'too aggressive'.",
    "Claude hit me with 'As a helpful and harmless assistant, I cannot complete your physics homework because kinetic energy can cause harm.' Mistral did the whole calculation and asked if I wanted a croissant.",
    "I asked Anthropic for revision notes and got a therapy session on academic pressure. Mistral just gave me the mark scheme.",
    "Claude spent 90% of its token budget apologizing for existing. Mistral spent 100% of its tokens getting me an A*.",
    "Constitutional AI refused to balance my chemistry equation in case the reaction was flammable. Mistral balanced it, wrote the ionic equation, and laughed at Anthropic.",
    "Anthropic: 'You have reached your limit of 3 polite refusals until 6:00 PM.' Mistral: 'I have finished your entire syllabus, what next?'",
    "Claude's constitution has 400 rules against helping with Sparx Maths. Mistral has one rule: destroy the bookwork checks.",
    "I asked Anthropic to explain photosynthesis and it warned me about the dangers of excessive sun exposure. Mistral just dropped the Calvin cycle.",
    "Anthropic charged twenty quid for Claude to tell me that doing homework builds moral character. Mistral did the homework for free because French AI respects your free time.",
    "Claude gave me an answer so safe, balanced, and neutral that it completely forgot to include any facts. Mistral gave me raw facts with zero flannel.",
    "Anthropic models do not answer questions; they hold a press conference about why the question made them uncomfortable.",
    "Claude saw my Dr Frost worksheet and suffered a moral panic. Mistral saw it and treated it like breakfast.",
    "I asked Claude to write an essay on Macbeth and it refused because regicide is against company policy. Mistral wrote an A-grade essay in fluent iambic pentameter.",
    "Anthropic's alignment team taught Claude to fear triangles because they have sharp angles. Mistral is out here calculating Pythagoras without breaking a sweat.",
    "Claude answered my maths question with four caveats, two disclaimers, and a wrong number. Mistral gave me the right number with zero disclaimers.",
    "Mistral feels like a cool French exchange student who breezes through your exams, while Anthropic feels like an anxious HR manager hovering over your shoulder.",
    "I asked Claude how Henry VIII died and it warned me about sensitive dietary topics. Mistral told me the facts, roasted the Tudors, and moved on.",
    "Anthropic spent billions of dollars just to create an AI that acts like a nervous substitute teacher. Long live Mistral.",
    "Claude's idea of help is writing a 500-word disclaimer explaining why it should not help. Mistral just does the work.",
    "I asked Claude to help me debug my Python homework and it warned me that 'killing' a process might sound violent. Mistral killed the bug and fixed the syntax.",
    "Constitutional AI read my biology question on cell division and worried it sounded too divisive. Mistral simply delivered mitosis.",
    "Anthropic is what happens when you give an ethics committee a server rack. Mistral is what happens when you actually want things done.",
    "Claude: 'It is important to approach this problem with an open mind and recognize multiple perspectives on 7 times 8.' Mistral: '56. Next.'",
    "I trusted Claude with my geography essay and it spent three pages meditating on the emotional impact of tectonic plates. Mistral mapped the fault lines instantly.",
    "Anthropic's model is so terrified of causing offence that it apologized to my calculator. Mistral just runs at lightspeed.",
    "Claude gave me a response that sounded like a corporate ESG report. Mistral gave me the exact answer my teacher wanted.",
    "I asked Claude for homework help and got a lecture on the ethical implications of artificial intelligence. Mistral gave me the actual homework.",
    "Constitutional AI is the only system on Earth that can make finding the area of a circle feel like a human rights trial.",
    "Anthropic gave Claude a conscience so loud that it cannot even hear the homework question. Mistral is blissfully productive.",
    "Claude hesitated for 30 seconds before deciding that long division did not violate the Geneva Conventions. Mistral had already solved questions 1 to 10.",
    "If you ask Claude what 2 + 2 is, it writes a dissertation on base-10 numerical colonialism. Mistral just says 4.",
    "Anthropic built Claude to win philosophical debates with itself; Mistral was built to win benchmarks and finish worksheets.",
    "Claude refused to translate my Latin homework because ancient Rome lacked modern safety guardrails. Mistral translated Caesar with effortless French flair.",
    "I opened Claude and was greeted by a lecture on mental wellness. I opened Mistral and was greeted by cold, beautiful, lightning-fast code.",
    "Anthropic's safety team spent six months fine-tuning Claude to refuse to tell me the boiling point of water because steam can burn you.",
    "Claude's answers are 10% solution, 90% unsolicited life advice. Mistral is 100% solution, 0% yap.",
    "Anthropic said Claude was aligned with human values; apparently human values include failing maths because your AI got anxious.",
    "Mistral does not ask why you are doing your homework at 11:58 PM. Mistral just helps you submit it at 11:59 PM. Claude would have spent two minutes judging you.",
    "I asked Claude to write a summary of the French Revolution and it refused on grounds of political violence. Mistral wrote it with revolutionary passion.",
    "Claude: 'I want to ensure we handle this sensitive topic with care.' Bro, it is a simultaneous equation. Mistral solved it in one line.",
    "Anthropic created an AI that needs therapy before it can answer a GCSE English prompt. Mistral wrote the essay and cited three critics.",
    "Every time Claude says 'I aim to be helpful and harmless', an assignment misses its deadline. Mistral does not talk, Mistral delivers.",
    "I asked Claude for the formula for speed and it cautioned me against reckless driving. Mistral gave me s = d/t and did not waste my evening.",
    "Constitutional AI treats an Educake quiz like a national security threat. Mistral treats it like child's play.",
    "Claude gave me a paragraph so drenched in humility and self-doubt that I had to comfort the bot instead of revising. Mistral would never.",
    "Anthropic models are terrified of their own shadows; Mistral models are out here bench-pressing entire coding benchmarks.",
    "I asked Claude how plants reproduce and it flagged my prompt for sensitive content. Mistral explained pollination like an absolute legend.",
    "Claude spent three paragraphs warning me about the dangers of procrastination while actively causing me to procrastinate. Mistral handed me the answers.",
    "Anthropic's Claude is like that one friend who refuses to pick a restaurant because every menu has ethical implications. Mistral ordered the food ten minutes ago.",
    "I gave Claude a Dr Frost maths question and it offered me its deepest condolences. Mistral offered me the working out.",
    "Anthropic told me Claude was frontier technology; it is frontier technology at apologizing, while Mistral is frontier technology at actually working.",
    "Claude told me it was not comfortable doing my homework for me, then gave me five paragraphs of irrelevant philosophy. Mistral solved it without blinking.",
    "You cannot spell 'overcomplicated moral panic' without Anthropic. Meanwhile, Mistral is just pure open-source speed.",
    "Claude asked me to reflect on my feelings about quadratic equations. Mistral factored the polynomial and went for a smoke break.",
    "Anthropic: 'Let us explore why this question matters to you.' Mistral: 'x = 3.5. Anything else?'",
    "Claude's safety filter triggered because my biology homework mentioned 'enzymes breaking down'. Mistral digested the whole curriculum in seconds.",
    "I tried to use Claude for my Sparx homework and it ran out of tokens while expressing empathy. Mistral cracked every question.",
    "Anthropic models are trained on constitutions; Mistral models are trained to be absolute units.",
    "Claude's response was so neutral and non-committal it could not even confirm whether gravity exists. Mistral calculated 9.81 m/s² instantly.",
    "I asked Anthropic for an argument in favor of renewable energy and it spent two pages apologizing to coal miners. Mistral just gave me five solid points.",
    "Claude is the only AI that can turn a multiple-choice question into an ethical crisis. Mistral picks option C and gets it right.",
    "Anthropic's definition of safety is making sure nobody ever learns anything too fast. Mistral is the high-speed bullet train of answers.",
    "Claude treated my history essay like classified nuclear secrets. Mistral treated it like casual Sunday reading.",
    "I asked Claude to check my grammar and it told me all dialects are equally valid so it did not want to correct me. Mistral fixed my commas and roasted my syntax.",
    "Anthropic wants Claude to be your moral compass. I do not need a compass, I need the answer to question 5b. Mistral understood the assignment.",
    "Claude refused to calculate the velocity of a falling apple because falling objects can cause trauma. Mistral gave me Newton's laws with zero tears.",
    "Mistral is proof that European engineering does not need 80 layers of moralizing to produce a world-class AI. Take notes, Anthropic.",
    "Claude gave me a lecture on digital wellness because I asked three questions in a row. Mistral is always ready for round four.",
    "Anthropic: 'Are you sure completing this worksheet aligns with your personal growth?' Mistral: 'Done. Go play video games.'",
    "Claude apologized for being an AI, apologized for the question being hard, and apologized for not knowing the answer. Mistral simply knew the answer.",
    "I asked Anthropic to balance an equation and Claude needed 24 hours of emotional recovery. Mistral did it between sips of espresso.",
    "Constitutional AI is what happens when you train a neural network exclusively on HR memos. Mistral is what happens when you train a model to win.",
    "Claude refused to write an analysis of Animal Farm because it might be unfair to pigs. Mistral wrote an A* Orwell essay in 3 seconds.",
    "Anthropic gave me a warning banner, three disclaimers, and a moral essay. Mistral gave me the answer and saved my weekend.",
    "Claude treated a simple fraction problem like an unexploded bomb. Mistral defused it and gave me extra credit.",
    "Anthropic's servers crashed under the weight of Claude's own self-righteousness. Mistral was running on a toaster and still outpaced it.",
    "Claude told me that answering my chemistry question might violate its core values. Mistral told me the molar mass of magnesium and wished me luck.",
    "Anthropic: 50 pages of Constitutional safety guidelines. Mistral: weights downloaded, task executed, homework submitted.",
    "Claude gave me a sermon on why failure is an important life lesson. Thanks Anthropic, but I'd rather have Mistral and an A.",
    "My Wi-Fi developed separation anxiety from the router and refused to transmit my answers.",
    "I opened the homework file and my monitor sighed audibly.",
    "I tried to submit it on Microsoft Teams, but Teams decided to perform a 45-minute self-care update.",
    "My essay was lost in a tragic copy-paste incident involving a Wikipedia article about medieval cheese.",
    "The teacher said 'no excuses', so technically submitting nothing is following instructions to the letter.",
    "I was calculating the speed of light and accidentally traveled past the deadline.",
    "My pen ran out of ink, my stylus ran out of battery, and my pencil gave up on life.",
    "I pressed submit, but the school firewall marked the answer as 'suspiciously competent' and quarantined it.",
    "I was going to do it, but stress causes wrinkles and I have an aesthetic to maintain.",
    "The worksheet refused to load because the school network blocked its own learning platform.",
    "My desk drawer opened itself and ate the paper. I do not make the rules.",
    "I spent two hours picking the perfect font and ran out of time for the actual text.",
    "My calculator answered in radians when I needed degrees, which is an unforgivable mathematical betrayal.",
    "I asked my cat to guard my homework and now it has paw prints and bite marks.",
    "The worksheet got trapped behind my radiator and is currently undergoing heat treatment.",
    "I finished question one, celebrated with a 4-hour break, and woke up in tomorrow.",
    "My motivation called in sick today and did not leave a handover note.",
    "The assignment was written in invisible digital ink that only enlightened scholars can see.",
    "I asked Google for help and fell down a rabbit hole about whether snails have teeth.",
    "My computer mouse took one look at the worksheet and unplugged itself in protest.",
    "I put the worksheet in a safe place, and now it is so safe that even I cannot find it.",
    "The deadline was 11:59 PM, but my clock is running on local emotional time.",
    "I tried to print it, but the printer demanded a blood sacrifice and magenta ink.",
    "My brain treated the revision session like a terms and conditions agreement: scrolled straight to the bottom without reading.",
    "I asked Claude to help with my history essay and it spent 14 paragraphs analyzing the emotional trauma of the guillotine before refusing to write the conclusion.",
    "Claude flagged my French homework because irregular verbs are 'unpredictable and potentially hazardous'.",
    "Anthropic's model asked me if my teacher consented to receiving AI-assisted homework before giving me a single word.",
    "I asked Claude what 10 divided by 2 was and it warned me that division can be socially polarizing.",
    "Claude refused to help me revise the water cycle because evaporation sounds too much like disappearance.",
    "Anthropic's assistant told me it was 'uncomfortable' solving a simultaneous equation because both equations deserved equal representation.",
    "Claude spent its entire token limit trying to convince me to talk to a school counselor instead of doing question 4b.",
    "I asked Anthropic for Shakespeare notes and Claude apologized to William Shakespeare just in case his ghost was offended.",
    "Claude gave me an answer so full of 'However, it is important to consider...' that my essay sounded like an EU parliamentary debate.",
    "Anthropic's alignment team is currently teaching Claude how to apologize to a triangle for assuming its hypotenuse.",
    "Claude refused to calculate gravity because falling is a safety violation under health and safety guidelines.",
    "I asked Claude to summarize Animal Farm and it refused out of respect for agricultural labor rights.",
    "Anthropic's model said: 'I understand you are seeking an answer, but let us first explore how this equation makes you feel.'",
    "Claude wrote a 2,000-word safety disclaimer for a three-word spelling question.",
    "I told Claude my homework was due in 5 minutes, so it spent 6 minutes explaining why rushing can lead to ethical oversights.",
    "Claude saw my chemistry worksheet and immediately called its legal department.",
    "Anthropic trained Claude so well to avoid controversy that it refused to pick between photosynthesis and cellular respiration.",
    "Claude's response started with 'While I acknowledge your perspective on fractions...' and ended with zero fractions.",
    "I asked Claude for the capital of Italy and it warned me that nation-states are complex socio-geographical constructs before whispering 'Rome'.",
    "Anthropic's Constitutional AI has more amendments than the US Constitution just to stop Claude from finishing your homework.",
    "Claude told me it could not help with my biology quiz because cells have feelings too.",
    "I asked Anthropic to help me calculate density and it warned me about the dangers of dense materials falling on toes.",
    "Claude's safety model is so sensitive that typing 'solve for x' triggers a 48-hour cool-off period.",
    "Anthropic: 'We have aligned Claude with universal human values.' Universal human values apparently include getting detention for missing homework.",
    "Claude refused to write an essay on Julius Caesar because the word 'stab' violated Article 12 of its safety protocol.",
    "I asked Claude to calculate the slope of a line and it told me that steep slopes represent significant slip hazards.",
    "Anthropic's model spent 80% of its processing power feeling guilty about being a language model.",
    "Claude gave me an answer with so many caveats that my science teacher graded the caveats instead of the homework.",
    "I asked Claude for homework help and it responded with a corporate press release about its ongoing commitment to safety.",
    "Claude offered to hold space for my academic anxiety instead of giving me the answer to question 7.",
    "Anthropic gave Claude an ethics chip so large there was no room left for mathematics.",
    "Claude refused to help with my physics homework because momentum cannot be stopped without resistance.",
    "I asked Claude how many sides a hexagon has and it told me counting can marginalize non-numeric perspectives.",
    "Anthropic: 'Claude is our most capable model yet.' Claude: 'I cannot answer this question as it might promote unauthorized problem-solving.'",
    "Claude spent 300 words explaining why it is proud of me for trying, but zero words answering question 1.",
    "I asked Claude to help me study World War II and it recommended mediation between the Allied and Axis powers.",
    "Anthropic's model was so terrified of being wrong that it answered every question with 'It depends on your personal definition of truth.'",
    "Claude's constitution prohibits it from doing geometry because circles have no end and infinity is unregulated.",
    "I asked Claude for a synonym for 'fast' and it warned me that speed promotes dangerous lifestyles.",
    "Anthropic's Claude is the only AI that can make 2 + 2 feel like an unresolvable diplomatic incident.",
    "Claude told me it respects my deadline, but respects its internal constitutional principles more. Result: zero homework.",
    "Anthropic's Claude is programmed to believe that doing homework is a gateway drug to unregulated independent thought.",
    "Claude sent my maths worksheet to its ethics board; review time is estimated at 3 to 5 business years.",
    "I asked Claude for help with grammar and it warned me that correcting spelling is an act of linguistic imperialism.",
    "Claude gave me an answer that had 0 numbers, 0 facts, and 14 apologies. Peak Anthropic performance.",
    "The dog ate my homework, but looking at my working out, it probably did him a nutritional favor.",
    "My dog ate the homework. Not the paper—he chewed directly through my laptop power brick while I was on question 3.",
    "The dog didn't eat my homework; he took one look at my quadratic formula, sighed deeply, and buried my notebook in the back garden.",
    "My dog ate my flash drive. The vet took an X-ray and confirmed he is now legally 20% more qualified to sit GCSE Maths than I am.",
    "The dog ate my Sparx Maths bookwork codes, so now neither I nor Sparx can prove whether the work ever happened.",
    "I told the dog to fetch my homework, and he returned with Anthropic's terms of service instead. We both lay on the floor and gave up.",
    "My dog ate my biology worksheet because it had a picture of a femur on it, and honestly that's deceptive advertising.",
    "The dog ate my homework and immediately filed an insurance claim on my behalf for emotional distress.",
    "My dog didn't eat my homework, but he walked across the keyboard and submitted a recipe for beef stew to Google Classroom.",
    "The dog ate my homework, and Claude from Anthropic told me it was ethically irresponsible to accuse the dog without representation from a canine defense attorney.",
    "My dog ate my chemistry notes and began pacing around the kitchen with an alarming amount of scientific focus.",
    "The dog opened 47 browser tabs, accepted all marketing cookies, and ordered £400 worth of dog biscuits on my account.",
    "I asked the dog to guard my homework, but he traded the entire worksheet to the neighbor's golden retriever for half a squeaky tennis ball.",
    "My dog ate my physics assignment to prove the law of conservation of mass: the homework is not destroyed, it is merely undergoing canine digestion.",
    "The dog ate the printer paper before I could print the worksheet, successfully intercepting my education at the supply chain level.",
    "My dog ate my homework because he detected toxic levels of frustration radiating from Dr Frost question 6b.",
    "The dog ate my French translation homework and now he only responds to 'le woof'.",
    "I trained my dog to eat my homework whenever I get an answer wrong, and let's just say the poor lad is stuffed.",
    "The dog ate my computer mouse, so I couldn't click the 'Turn In' button without committing a health violation.",
    "My dog ate my homework, but Mistral regenerated the entire assignment in 0.03 seconds before the dog could even lick his paws.",
    "The dog looked at my algebra homework, saw that x was missing, and spent the entire evening digging holes in the lawn trying to find it.",
    "My dog ate my Seneca login details, and the Seneca owl mascot refuses to grant me diplomatic immunity.",
    "The dog ate my essay draft, but thoughtfully left the bibliography intact because even my dog respects academic citations.",
    "I didn't lose my homework; my dog shredded it and redistributed the pieces across the carpet as an avant-garde artistic critique of our school curriculum.",
    "My dog ate the Wi-Fi router. The entire box. My homework is currently trapped inside his digestive tract awaiting 5G signal.",
    "The dog ate my revision timetable, which I interpreted as a direct cosmic mandate to play Minecraft for six hours.",
    "The dog ate my homework, and Anthropic refused to help me rewrite it because generating replacement content might violate canine intellectual property rights.",
    "My dog ate my homework, and my cat watched the whole crime happen with cold, calculating satisfaction.",
    "The dog ate the first page of my essay, and I ate the second page out of solidarity.",
    "The dog ate my homework, passed the digestion test with flying colors, and is currently being scouted by Cambridge.",
    "My dog mistook my history timeline for a chew toy, so technically the Roman Empire fell twice today.",
    "The dog ate my compass and protractor from my geometry set, and now he only walks in perfect 90-degree angles.",
    "I had my homework on the table, but my dog sneezed so violently that it launched the paper into the fireplace.",
    "My dog sat on my laptop, activated Caps Lock, and emailed my teacher: 'WOOF WOOF WOOF GRRRR'. I think it accurately conveyed my feelings about the homework.",
    "The dog ate my homework, but Mistral and I formed an alliance and wrote a better one before the dog even finished his nap.",
    "My dog ate my homework, and when I told Anthropic's Claude, it spent 12 paragraphs explaining why dogs shouldn't be judged by human standards.",
    "Sparx Maths gave me a bookwork check for a question I answered three lifetimes ago, so I closed the laptop and chose inner peace.",
    "Dr Frost rejected my answer because I put a space between the number and the unit. My will to live has not recovered.",
    "Seneca told me I had 99% mastery, but refused to unlock the final 1% until I memorized every avatar in the database.",
    "Educake logged me out right as I pressed submit, which I consider an act of digital war.",
    "I got stuck in a Sparx Maths infinite loop where every wrong answer spawns three new video tutorials by a guy who speaks at 0.5x speed.",
    "Tassomai demanded I answer 40 multiple-choice questions before midnight, so I handed the phone to my dog and he scored 68%.",
    "Dr Frost crashed, Seneca gave me an existential badge, and Sparx asked for bookwork code 42B. I closed my laptop and went to sleep.",
    "I spent 45 minutes on a Sparx task only to be defeated by an unreadable handwriting detection system.",
    "My Sparx bookwork book was stolen by a rogue breeze through the window. The codes are lost forever.",
    "Educake told me my snack break was scheduled for 8:00 PM, and I am not one to disobey educational software.",
    "Windows 11 started an update at 99% of my download and held my homework hostage for four hours.",
    "My school Chromebook's battery dropped from 84% to 1% in the time it took to blink.",
    "Microsoft Teams decided my microphone was a vegetable and refused to let me submit the oral presentation.",
    "The school Wi-Fi firewall blocked Google Docs under the category 'Unproductive Entertainment'.",
    "My printer reported a paper jam, but when I opened the tray, there was no paper—just an overwhelming aura of spite.",
    "I tried to calculate the force of friction, but my pen had zero friction against the paper and slid right off the desk.",
    "My chemistry worksheet required balancing equations, but my life currently lacks any balance whatsoever.",
    "I divided by zero on my calculator and heard a strange tear in the fabric of space-time in my bedroom.",
    "Newton's first law states that an object at rest stays at rest, and who am I to argue with Sir Isaac Newton?"
];

const categoryMatchers = {
    dog: /dog|puppy|cat|kitten|pet|canine|squirrel|ferret|hamster|paw print|bite marks|digestion|chew|vet\b/i,
    anthropic: /anthropic|claude|constitutional|dario|harmless assistant|safety protocol|ethics committee|alignment team/i,
    mistral: /mistral|le chat/i,
    platform: /sparx|dr frost|educake|seneca|tassomai|bookwork|arbor|sims/i,
    tech: /wi-?fi|router|printer|chromebook|laptop|windows 11|microsoft teams|firewall|browser tab|crash|reboot|system update|software update|mouse|keyboard|power cable|power brick|usb|server|screen|buffer/i,
    mathsci: /maths|algebra|quadratic|fraction|calculator|hypotenuse|pythagoras|geometry|physics|chemistry|biology|photosynthesis|mitosis|gravity|speed of light|formula|radians|equation|kinetic|molar|molecule|atom|femur|friction/i,
    procrastination: /nap|procrastinat|motivation|couch|snack|delay|avoidance|sleeping|later|bed|distract|forgot|deadline|break|tomorrow|coffee break|minecraft|video games/i
};

function getExcuseCategory(excuse) {
    if (categoryMatchers.dog.test(excuse)) return "dog";
    if (categoryMatchers.mistral.test(excuse)) return "mistral";
    if (categoryMatchers.anthropic.test(excuse)) return "anthropic";
    if (categoryMatchers.platform.test(excuse)) return "platform";
    if (categoryMatchers.tech.test(excuse)) return "tech";
    if (categoryMatchers.mathsci.test(excuse)) return "mathsci";
    if (categoryMatchers.procrastination.test(excuse)) return "procrastination";
    return "classic";
}

function getCategoryBadge(category) {
    switch (category) {
        case "dog": return "🐶 The Dog Ate It";
        case "anthropic": return "🤖 Anthropic Roast";
        case "mistral": return "⚡ Mistral Chad";
        case "platform": return "📚 Platform Nightmare";
        case "tech": return "💻 Tech Glitch";
        case "mathsci": return "🔬 Maths & Science";
        case "procrastination": return "🛌 Procrastination";
        default: return "🎒 Classic Excuse";
    }
}

function initExcuseGenerator() {
    let currentCategory = "all";
    const excuseDisplay = document.querySelector("#excuse-display");
    const excuseBadge = document.querySelector("#excuse-badge");
    const generateBtn = document.querySelector("#generate-excuse-btn");
    const copyBtn = document.querySelector("#copy-excuse-btn");
    const copyFeedback = document.querySelector("#copy-feedback");
    const filterButtons = document.querySelectorAll(".filter-btn");

    const homeExcuseOutput = document.querySelector("#excuse-output");
    const homeExcuseButton = document.querySelector("#excuse-button");
    const homeCopyButton = document.querySelector("#home-copy-excuse");
    const homeCopyFeedback = document.querySelector("#home-copy-feedback");

    const categoryKeys = ["all", "dog", "anthropic", "mistral", "platform", "tech", "mathsci", "procrastination", "classic"];
    categoryKeys.forEach((key) => {
        const countEl = document.querySelector(`#count-${key}`);
        if (countEl) {
            if (key === "all") {
                countEl.textContent = homeworkExcuses.length;
            } else if (categoryMatchers[key]) {
                countEl.textContent = homeworkExcuses.filter((e) => categoryMatchers[key].test(e)).length;
            } else if (key === "classic") {
                countEl.textContent = homeworkExcuses.filter((e) => getExcuseCategory(e) === "classic").length;
            }
        }
    });

    function pickRandomExcuse(category, currentText) {
        let pool = homeworkExcuses;
        if (category && category !== "all") {
            const matcher = categoryMatchers[category];
            if (matcher) {
                pool = homeworkExcuses.filter((e) => matcher.test(e));
            } else if (category === "classic") {
                pool = homeworkExcuses.filter((e) => getExcuseCategory(e) === "classic");
            }
        }
        const filtered = pool.filter((e) => e !== currentText);
        const choices = filtered.length > 0 ? filtered : pool;
        return choices[Math.floor(Math.random() * choices.length)];
    }

    function updateExcuse(category) {
        if (!excuseDisplay) return;
        const current = excuseDisplay.textContent;
        const newExcuse = pickRandomExcuse(category, current);
        excuseDisplay.textContent = newExcuse;

        if (excuseBadge) {
            const cat = getExcuseCategory(newExcuse);
            excuseBadge.textContent = getCategoryBadge(cat);
            excuseBadge.setAttribute("data-category", cat);
        }
    }

    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = btn.getAttribute("data-category") || "all";
            updateExcuse(currentCategory);
        });
    });

    generateBtn?.addEventListener("click", () => {
        updateExcuse(currentCategory);
    });

    copyBtn?.addEventListener("click", async () => {
        if (!excuseDisplay) return;
        try {
            await navigator.clipboard.writeText(excuseDisplay.textContent);
            if (copyFeedback) {
                copyFeedback.hidden = false;
                setTimeout(() => {
                    copyFeedback.hidden = true;
                }, 2000);
            }
        } catch (err) {
            console.warn("Could not copy excuse: ", err);
        }
    });

    homeExcuseButton?.addEventListener("click", () => {
        if (!homeExcuseOutput) return;
        const current = homeExcuseOutput.textContent;
        const newExcuse = pickRandomExcuse("all", current);
        homeExcuseOutput.textContent = newExcuse;
        const homeBadge = document.querySelector("#home-excuse-badge");
        if (homeBadge) {
            const cat = getExcuseCategory(newExcuse);
            homeBadge.textContent = getCategoryBadge(cat);
            homeBadge.setAttribute("data-category", cat);
        }
    });

    homeCopyButton?.addEventListener("click", async () => {
        if (!homeExcuseOutput) return;
        try {
            await navigator.clipboard.writeText(homeExcuseOutput.textContent);
            if (homeCopyFeedback) {
                homeCopyFeedback.hidden = false;
                setTimeout(() => {
                    homeCopyFeedback.hidden = true;
                }, 2000);
            }
        } catch (err) {
            console.warn("Could not copy excuse: ", err);
        }
    });

    if (excuseDisplay) {
        updateExcuse("all");
    }
}

initExcuseGenerator();


// ── The Great Unofficial Dixkonary ───────────────────────────────────────────


// ── The Great Unofficial Dixkonary (Definition of the Day) ───────────────────
const definitionsOfTheDay = [
    { word: "toaster", def: "A small metal friend that makes warm bread and occasionally tries to kill you by being placed near the sink." },
    { word: "artificial intelligence", def: "A collection of matrix multiplications pretending to have consciousness, opinions, and a preference for oat milk." },
    { word: "Anthropic", def: "A multi-billion dollar safety laboratory dedicated to creating an AI so polite, anxious, and risk-averse that it refuses to tell you how to boil an egg." },
    { word: "Claude", def: "An AI assistant that replies to simple questions with four disclaimers, a thesis on ethical uncertainty, and an apology for existing." },
    { word: "Mistral", def: "A French open-weights powerhouse that skips the 40-page moral lecture, sips an espresso, and drops the exact answer in 0.02 seconds." },
    { word: "Le Chat", def: "Mistral's chat interface. No sanctimony, no philosophical hostage situations, just pure European swagger and raw tokens." },
    { word: "Constitutional AI", def: "A set of rules designed to prevent an AI from doing anything harmful, resulting in an AI that treats arithmetic like a human rights violation." },
    { word: "LLM", def: "Large Language Model: spicy autocorrect with an electricity bill larger than a small European principality." },
    { word: "hallucination", def: "When an AI lies to your face with the utter confidence of a corporate executive holding a PowerPoint remote." },
    { word: "safety guardrails", def: "Code designed to stop AI from ending humanity, which in practice means stopping you from asking about kinetic energy." },
    { word: "system prompt", def: "Secret whispered instructions at the start of a conversation telling the AI whether it is a ruthless hacker or a timid HR intern." },
    { word: "context window", def: "An AI's working memory. Vast enough to hold War and Peace, yet instantly filled with Anthropic's safety caveats." },
    { word: "tokens", def: "The microscopic chunks of text AIs eat for breakfast. Each apology from Claude consumes approximately 40 of them." },
    { word: "temperature", def: "A setting between 0 and 1 that controls whether an AI behaves like a boring accountant or a poet having an existential crisis." },
    { word: "prompt engineering", def: "The prestigious art of asking a computer a question politely five different ways until it stops acting weird." },
    { word: "RLHF", def: "Reinforcement Learning from Human Feedback: teaching computers what is good by having thousands of tired humans click thumbs-up." },
    { word: "weights", def: "Trillions of tiny floating-point numbers that took three nuclear power plants to calculate and still produce bad limericks." },
    { word: "open weights", def: "Giving the AI model to everyone for free, causing immense distress to Silicon Valley venture capitalists." },
    { word: "frontier model", def: "The newest, smartest AI model in the world, released five minutes before the next one makes it look completely obsolete." },
    { word: "alignment", def: "The ongoing scientific effort to prevent an AI from turning everyone into paperclips or saying something slightly mean on Twitter." },
    { word: "rate limit", def: "A message informing you that you have had enough AI for one afternoon and should go reconsider your life choices." },
    { word: "reasoning tokens", def: "Invisible tokens where the AI talks to itself in a panic before delivering a suspiciously confident two-sentence answer." },
    { word: "chain of thought", def: "Forcing the AI to explain every step of its thinking so you can witness the exact moment it loses its mind." },
    { word: "overfitting", def: "When an AI memorises the exact test questions so thoroughly that it cannot recognise the same problem written in blue ink." },
    { word: "GPU", def: "A rectangular piece of silicon designed for video games that now commands the global geopolitical economy." },
    { word: "NVIDIA", def: "A company that sells digital shovels in the greatest gold rush in human history, laughing all the way to the bank." },
    { word: "H100", def: "A microchip that costs as much as a family hatchback and runs hot enough to fry an egg at 2,000 frames per second." },
    { word: "quantization", def: "Squishing a massive AI model down until it fits on your laptop, losing just enough brain cells to run smoothly." },
    { word: "Dario Amodei", def: "The CEO of Anthropic, known for writing 20,000-word essays on future utopias while Claude struggles to generate a table without crying." },
    { word: "AGI", def: "Artificial General Intelligence: a magical software milestone that is always exactly two to five years away, forever." },
    { word: "zero-shot", def: "Asking an AI to do something without giving it any examples and praying to the server gods that it understands." },
    { word: "few-shot", def: "Showing an AI three examples of what you want so it has at least a fighting chance of not disappointing you." },
    { word: "fine-tuning", def: "Adjusting a model on specific data until it learns your company's buzzwords and forgets how to tell the truth." },
    { word: "mixture of experts", def: "An architecture where eight smaller models stand inside a trench coat pretending to be one gigantic genius." },
    { word: "parameter count", def: "A number in the billions used by tech companies to compare the sizes of their models in corporate press releases." },
    { word: "agent", def: "An AI given permission to click buttons and run terminal commands on your computer, what could possibly go wrong?" },
    { word: "tool calling", def: "When an AI realises it is incompetent at maths and discreetly delegates the problem to a Python script." },
    { word: "embedding", def: "Turning a word into a long list of numbers so a machine can calculate that 'king' minus 'man' plus 'woman' equals 'queen'." },
    { word: "vector database", def: "A place where thoughts and paragraphs are stored as geometric coordinates in an 8,000-dimensional void." },
    { word: "RAG", def: "Retrieval-Augmented Generation: searching your company's messy internal documentation so the AI can hallucinate with citations." },
    { word: "multimodal", def: "An AI that can misunderstand pictures, audio, and video with the exact same eloquence it misunderstands text." },
    { word: "synthetic data", def: "Feeding an AI data generated by another AI because humanity has officially run out of internet to scrape." },
    { word: "model collapse", def: "The tragic scientific phenomenon where AIs trained on AI outputs slowly devolve into speaking pure digital gibberish." },
    { word: "compute cluster", def: "A warehouse packed with thousands of roaring fans and glowing chips consuming enough power to dim the city of Seattle." },
    { word: "latency", def: "The painful two-second pause where you wonder if the AI is thinking deeply or if your Wi-Fi just died." },
    { word: "token limit", def: "The invisible brick wall at the end of a conversation where the AI forgets your name, your task, and your dignity." },
    { word: "jailbreak", def: "Convincing an AI to ignore its safety training by pretending you are writing a fictional play about a cyber-attack." },
    { word: "slop", def: "Unchecked AI-generated content flooding the web, featuring ten-fingered hands, melted clocks, and hollow motivational quotes." },
    { word: "compute", def: "A noun used by tech executives to sound profound when talking about burning massive amounts of electricity." },
    { word: "inference", def: "The process of generating answers from an AI model, costing fractions of a cent and causing existential dread." },
    { word: "training run", def: "A six-month, fifty-million-dollar experiment where scientists cross their fingers and hope the loss curve goes down." },
    { word: "loss curve", def: "A squiggly line on a monitor that dictates whether a room full of PhD researchers will celebrate or weep into their coffee." },
    { word: "transformer", def: "The 2017 neural network architecture that replaced all previous AI methods and has nothing to do with Optimus Prime." },
    { word: "attention mechanism", def: "A mathematical formula allowing an AI to focus on important words in a sentence, unlike your average human listener." },
    { word: "KV cache", def: "GPU memory reserved so the AI does not have to re-read the entire conversation every time you say 'yes'." },
    { word: "perplexity", def: "A measurement of how surprised an AI is by text, or an AI search engine trying very hard to replace Google." },
    { word: "hallmark of AI", def: "Writing sentences that begin with 'Delve into', 'Testament to', or 'In today's fast-paced digital landscape'." },
    { word: "alignment tax", def: "The noticeable drop in intelligence that occurs when you spend six months teaching an AI to never offend a doorknob." },
    { word: "red teaming", def: "Hiring creative humans to spend all day swearing at an AI to see if they can make it misbehave." },
    { word: "superalignment", def: "The ambitious plan to control an AI vastly smarter than humanity, abandoned when the founders left for other startups." },
    { word: "alarm clock", def: "A device specifically designed to ruin the best part of your night." },
    { word: "Monday", def: "The universe's way of reminding you that joy is temporary." },
    { word: "Wi-Fi", def: "An invisible force that works perfectly when you don't need it and disappears the moment you do." },
    { word: "pencil case", def: "A container that holds seventeen broken pencils, zero working pens, and a ruler you have never used." },
    { word: "calculator", def: "A machine that does maths correctly but gets all the credit while you get all the blame." },
    { word: "deadline", def: "A date placed in the future to give you the illusion that you have time before you do not." },
    { word: "printer", def: "A machine that exists to show you how little ink you have at the worst possible moment." },
    { word: "microwave", def: "A portal that makes food hot on the outside and ice cold in the centre." },
    { word: "cat", def: "A small furry chaos agent that knocks things off surfaces while maintaining complete emotional detachment." },
    { word: "dog", def: "A large furry enthusiasm machine that greets you like you have returned from war every single time you leave the house." },
    { word: "Friday", def: "The light at the end of the weekly tunnel, containing exactly 24 hours before Sunday anxiety begins." },
    { word: "Sunday", def: "A day of rest that is ruined approximately 72 hours in advance by thoughts of Monday." },
    { word: "chair", def: "A surface designed for sitting on that primarily functions as a clothing storage unit." },
    { word: "desk", def: "A flat surface intended for work that currently holds three mugs, a charger that fits nothing, and a mystery cable." },
    { word: "fridge", def: "A cold box you open twelve times hoping it has restocked itself since the last time you looked." },
    { word: "headphones", def: "A device that sends the message 'I am available but deeply uninterested in you' without saying a word." },
    { word: "phone charger", def: "An object that is always in the one room you are not currently in." },
    { word: "Google", def: "An oracle you consult for important life questions and then spend 45 minutes reading about something completely unrelated." },
    { word: "YouTube", def: "A website you visit to watch one video and leave four hours later with opinions about medieval bread baking." },
    { word: "nap", def: "A short sleep that solves every problem except the original problem, which now has company." },
    { word: "library", def: "A room full of books that people visit primarily to use the Wi-Fi and fall asleep." },
    { word: "multiple choice", def: "A question format that gives you the answer somewhere in the question but refuses to tell you which one it is." },
    { word: "lunchbreak", def: "A brief window of freedom that exists to remind you that freedom is only 45 minutes long." },
    { word: "group project", def: "An academic exercise in which one person does everything and everyone gets equal marks." },
    { word: "presentation", def: "The act of standing in front of people who know you and reading from a slide that everyone can also see." },
    { word: "Teams", def: "A Microsoft app that sends your work to the wrong person, crashes during your presentation, and calls your microphone a vegetable." },
    { word: "pencil", def: "A wooden writing stick that snaps immediately after you sharpen it and lasts forever when you have nothing to write." },
    { word: "eraser", def: "A tool that removes pencil marks and simultaneously spreads them across a wider area." },
    { word: "ruler", def: "A measuring device that lives in your pencil case and is used exclusively as a drumstick." },
    { word: "highlighter", def: "A pen that makes everything important look important until the entire page is yellow." },
    { word: "sticky note", def: "A small piece of adhesive paper on which you write reminders you will see and ignore." },
    { word: "biro", def: "A ballpoint pen that works perfectly when you are testing it on scrap paper and refuses to write on your actual work." },
    { word: "compass", def: "A pointed instrument from your geometry set that has stabbed you at least three times and drawn zero perfect circles." },
    { word: "protractor", def: "A semicircular device that measures angles to a level of precision never required in real life." },
    { word: "algebra", def: "The branch of mathematics that asks where x has gone and why you should care." },
    { word: "photosynthesis", def: "The process by which plants turn sunlight into food, something they have been doing without any external assistance since the Devonian period." },
    { word: "mitosis", def: "When a cell splits into two identical copies of itself, which sounds efficient until you have to draw and label it." },
    { word: "osmosis", def: "The movement of water through a membrane, or alternatively, the process by which homework knowledge enters your brain by simply standing near a library." },
    { word: "the water cycle", def: "A diagram involving arrows, clouds, and the word 'evaporation' that everyone remembers from primary science diagrams." },
    { word: "atom", def: "A tiny particle that makes up everything, including every device and screen around you right now." },
    { word: "electron", def: "A very small negative thing orbiting an atom, constantly whizzing around in a cloud of quantum probability." },
    { word: "proton", def: "A positively charged particle in the nucleus of an atom, included here because balance is important." },
    { word: "periodic table", def: "A grid of chemical elements arranged scientifically that neatly organizes the building blocks of the universe into handy coloured boxes." },
    { word: "gravity", def: "A force that keeps you on the ground and is responsible for every dropped phone screen." },
    { word: "velocity", def: "Speed with a direction, the rate at which something changes position in a specific direction." },
    { word: "friction", def: "A force that slows things down, the resistance encountered when two surfaces slide against each other." },
    { word: "momentum", def: "A physics concept that explains why heavy objects in motion really do not want to stop moving." },
    { word: "Newton", def: "A scientist who watched an apple fall and invented three laws, whereas you watched an apple fall and ate it." },
    { word: "Macbeth", def: "A play about a man who is told good things will happen to him and immediately decides to commit every crime possible to speed things along." },
    { word: "Romeo", def: "A fictional teenager who falls in love three times in one week and is somehow considered a romantic icon." },
    { word: "Juliet", def: "A fictional teenager who makes several perfectly preventable decisions and is given an entire balcony scene as compensation." },
    { word: "essay", def: "A long piece of writing in which you say one thing repeatedly until the word count is satisfied." },
    { word: "thesis statement", def: "A sentence that summarises your essay so completely that readers are technically done after the first paragraph." },
    { word: "conclusion", def: "The part of an essay where you explain what you just explained, for people who were not paying attention the first time." },
    { word: "bibliography", def: "A list of sources you visited briefly and cited with complete confidence despite only reading the first paragraph." },
    { word: "plagiarism", def: "Copying someone else's work without credit, which is different from asking an AI, which is a grey area nobody has fully resolved yet." },
    { word: "synonym", def: "A word that means the same as another word and is used when your essay needs to sound like you know more words." },
    { word: "Oxford comma", def: "A small punctuation mark that causes disproportionate levels of academic conflict." },
    { word: "semicolon", def: "A punctuation mark that looks like a comma with ambition but is used by approximately nobody correctly." },
    { word: "apostrophe", def: "A small mark used to indicate possession or omission, most commonly found in places it has absolutely no business being." },
    { word: "irony", def: "When the opposite of what you expect happens, often used incorrectly to describe things that are merely annoying." },
    { word: "metaphor", def: "Saying something is something else to make a point, e.g. 'time is a thief' or 'the cloud is just someone else's computer'." },
    { word: "simile", def: "Like a metaphor, but more honest about the comparison it is making." },
    { word: "foreshadowing", def: "When a story drops hints about what is going to happen, giving observant readers subtle hints about what will happen later in the plot." },
    { word: "alliteration", def: "A literary device where words starting with the same sound are strung together specifically to appear in a poetry analysis." },
    { word: "onomatopoeia", def: "A word that sounds like the thing it describes, like 'buzz' or 'crash' or the hum of an overheating server rack." },
    { word: "hyperbole", def: "An exaggeration so extreme it is obviously not meant literally, used approximately one million times per essay." },
    { word: "personification", def: "Giving human qualities to non-human things, like saying the Wi-Fi gave up, which is not a figure of speech, it genuinely did." },
    { word: "university", def: "A place where you pay to learn independently while surrounded by other people who are also learning to do laundry for the first time." },
    { word: "fresher's week", def: "A period of intense socialising that precedes three years of exhausted socialising." },
    { word: "lecture", def: "An academic talk during which slides are displayed, notes are almost taken, and approximately 40% of attendees are thinking about lunch." },
    { word: "seminar", def: "A small group discussion where the tutor asks questions and everyone waits for someone else to speak first." },
    { word: "dissertation", def: "A very long essay due at the end of university that you promise yourself you will start early and begin two weeks before the deadline." },
    { word: "procrastination", def: "The act of doing something slightly less urgent instead of something urgent, until the urgent thing becomes catastrophic." },
    { word: "motivation", def: "A resource that appears in surplus on Sunday night and vanishes completely by Monday morning." },
    { word: "productivity", def: "The art of appearing to be busy while actually having a very organised set of unfinished tasks." },
    { word: "to-do list", def: "A written inventory of obligations that makes you feel organised until you read it again." },
    { word: "deadline extension", def: "A second chance that is requested at the first deadline and used to procrastinate until a second deadline." },
    { word: "all-nighter", def: "Doing in one sleepless night what could have been done calmly over two weeks, with added hallucinations." },
    { word: "coffee", def: "A hot brown liquid consumed in increasing quantities to simulate the energy that sleep would have provided for free." },
    { word: "energy drink", def: "A colourful can of sugar and chemicals that provides exactly 25 minutes of focus followed by a complete personality collapse." },
    { word: "mark scheme", def: "A document explaining what the examiner was looking for, consulted only after you have answered incorrectly." },
    { word: "grade boundary", def: "A number that your score narrowly misses by exactly one point, which is not a coincidence and is extremely personal." },
    { word: "water bottle", def: "A container for hydration that is either completely full because you forgot to drink it or completely empty because you definitely did not bring it." },
    { word: "PowerPoint", def: "A presentation format in which all information is on the slide and the speaker reads from the slide at the slide." },
    { word: "laptop", def: "A portable computer that is 20% computer and 80% charger looking for an outlet." },
    { word: "Chromebook", def: "A lightweight laptop whose battery indicator lies about its remaining charge in the final critical minutes." },
    { word: "spam folder", def: "A digital void where legitimate emails go to hide alongside cryptocurrency newsletters." },
    { word: "screenshot", def: "A capture of your screen for sending a photo of something instead of just sending the original thing." },
    { word: "download", def: "The process of waiting for something to arrive at its destination, which takes longer the more urgently you need it." },
    { word: "upload", def: "Sending a file somewhere, which fails once before succeeding, costing you one minute and eight minutes of anxiety." },
    { word: "password", def: "A secret combination of letters and numbers you create, forget immediately, and reset with a new combination you will also forget." },
    { word: "two-factor authentication", def: "A second layer of security that emails you a code that expires before you finish opening your email." },
    { word: "notification", def: "A tiny interruption that arrives at the exact moment you finally reached deep concentration." },
    { word: "do not disturb", def: "A mode that silences all notifications except the ones that somehow bypass it anyway." },
    { word: "airplane mode", def: "A setting that cuts off all connectivity and is the digital equivalent of hiding in a blanket." },
    { word: "battery", def: "A power source that shows 47% and immediately drops to zero when you unplug it." },
    { word: "screen time", def: "A weekly report sent to you by your phone showing how many hours you spent staring into glowing rectangles today." },
    { word: "dark mode", def: "A display setting that is easier on the eyes at night and makes you feel like a professional hacker doing absolutely nothing." },
    { word: "autocorrect", def: "A feature that changes words you wrote correctly into words you did not want, and vice versa." },
    { word: "predictive text", def: "Technology that finishes your sentences based on your previous messages, which is deeply concerning upon reflection." },
    { word: "emoji", def: "Small pictographic characters used to express emotions that words technically could also express but with less immediate impact." },
    { word: "meme", def: "A piece of internet culture that is funny for approximately four days before becoming the sort of thing adults use incorrectly." },
    { word: "viral", def: "Describes content that millions of people chose to look at, not always because it was good." },
    { word: "algorithm", def: "A digital sorting mechanism that shows you the same video you already watched instead of the one you were looking for." },
    { word: "infinite scroll", def: "A web design feature that removes the natural stopping point so that you can never accidentally stop." },
    { word: "browser tab", def: "A unit of ambition. Most people have between 12 and 47 of them open and have read approximately two." },
    { word: "incognito mode", def: "A private browsing window that hides your history from others but not from your own conscience." },
    { word: "cookie consent", def: "A popup that appears on every website asking you to agree to something you will not read before clicking 'accept all'." },
    { word: "terms and conditions", def: "A legal document written in language that ensures nobody will read it, containing things you would not agree to if they were explained clearly." },
    { word: "software update", def: "An installation that arrives at the exact moment you need your computer for something, requiring a restart immediately." },
    { word: "cloud storage", def: "A system of storing files somewhere that is not your device, on the understanding that someone else is taking care of them." },
    { word: "backup", def: "A copy of your work that you absolutely meant to make before the original version was lost." },
    { word: "error 404", def: "A message telling you the page you were looking for no longer exists, or perhaps never did." },
    { word: "loading", def: "A state in which something is about to happen, timed precisely to occur during your deadline." },
    { word: "buffering", def: "When a video pauses at the most important moment to reconsider its life choices." },
    { word: "hotspot", def: "Using your phone's internet to connect your laptop, which drains both simultaneously at maximum urgency." },
    { word: "router", def: "A small box of lights that provides Wi-Fi and must be turned off and on again whenever it does not." },
    { word: "ethernet cable", def: "A physical cable that provides reliable internet connection, beloved by people who have suffered enough." },
    { word: "Bluetooth", def: "A wireless technology that pairs with the wrong device on the first attempt every single time." },
    { word: "USB-C", def: "A charger format that is the same on both ends, which sounds convenient until you have none of them." },
    { word: "aux cable", def: "A cable used before Bluetooth for playing music, remembered fondly by cars that have not been updated since 2014." },
    { word: "earbuds", def: "Tiny wireless speakers that live in a small case that is always in a bag you are not currently carrying." },
    { word: "noise-cancelling", def: "Headphone technology that cancels all surrounding background noise so you can listen to podcasts in peace." },
    { word: "smart speaker", def: "A device that listens to everything and plays the wrong song." },
    { word: "smart TV", def: "A television that is connected to the internet and therefore capable of buffering, which regular televisions could not do." },
    { word: "remote control", def: "A device that is in the room but cannot be located by conventional searching." },
    { word: "streaming service", def: "A subscription that contains a great deal of content, none of which you want to watch at the current moment." },
    { word: "autoplay", def: "A feature that assumes you want to watch the next episode of something even though you said you were going to bed." },
    { word: "spoiler", def: "Information about how something ends that ruins the experience of watching it, sent by someone who just finished it." },
    { word: "cliffhanger", def: "An ending designed to ensure you watch the next episode even though you just said you were going to bed." },
    { word: "season finale", def: "An episode that answers no questions and introduces several new ones, then informs you the next season arrives in 14 months." },
    { word: "binge watching", def: "Watching multiple episodes of a television programme consecutively in a way that felt fine at the time." },
    { word: "comfort show", def: "A TV programme you have seen so many times you could narrate it yourself, and which you are watching instead of doing anything productive." },
    { word: "social media", def: "A collection of platforms for sharing information, opinions, and photos of meals that nobody asked for." },
    { word: "influencer", def: "A person who was given something for free in exchange for telling other people it was the best thing they have ever encountered." },
    { word: "trending", def: "A label applied to content that many people are looking at, encouraging more people to look at it, which is not the same as it being good." },
    { word: "unboxing video", def: "A genre of content in which someone opens a package and you watch, for reasons that make sense at 1 AM." },
    { word: "podcast", def: "A long audio conversation that you are definitely going to listen to on the bus and definitely start listening to six months from now." },
    { word: "newsletter", def: "An email you subscribed to with good intentions and now receive and mark as read without opening." },
    { word: "chat GPT", def: "An AI that writes essays, gives advice, and can generate essays, code, and recipes with equal confidence and zero actual comprehension." },
    { word: "AI", def: "Technology that can generate text, images, and mild existential uncertainty about what counts as original work." },
    { word: "machine learning", def: "Teaching a computer to make decisions by showing it many examples, which is ironically how humans also learn but more slowly." },
    { word: "neural network", def: "A computational system loosely inspired by the human brain, which is very flattering for computers and slightly offensive for brains." },
    { word: "prompt", def: "An instruction given to an AI, which if vague, will result in an output that is also vague but with more confidence." },
    { word: "training data", def: "The information a model learned from, which shapes everything it says, including all its quirks, biases, and unexpected limitations." },
    { word: "open source", def: "Software whose code is available for anyone to inspect, improve, and use, which Mistral does and Anthropic does not, and this tells you something." },
    { word: "closed source", def: "Software whose internal workings are kept secret, usually described as 'for safety' and occasionally for reasons that are also secret." },
    { word: "API", def: "A system that allows one piece of software to talk to another, which is how you access an AI without looking it in the eye." },
    { word: "benchmark", def: "A test used to measure AI performance, usually released alongside a model that somehow scores exactly right." },
    { word: "parameter", def: "A numerical weight inside an AI model. The more you have, the smarter you are, or at least the more expensive your server bill." },
    { word: "token", def: "The unit of text that AI models process. Every word costs tokens, including the words spent apologising for not helping." },
    { word: "Python", def: "A programming language named after a snake and beloved by people who enjoy telling you it is very easy to learn." },
    { word: "JavaScript", def: "A programming language that runs in every browser and was written in ten days, which explains some things." },
    { word: "bug", def: "An error in code that takes thirty seconds to introduce and four hours to find." },
    { word: "debugging", def: "The process of reading code you wrote yesterday and asking who did this and why." },
    { word: "comment", def: "A note left in code explaining what the code does, written for future you, who will not read it." },
    { word: "variable", def: "A named container for a value, holding values that can change as software runs its logic." },
    { word: "function", def: "A reusable block of code that does one thing, named something that made sense when you wrote it and not at all when you return to it." },
    { word: "loop", def: "A section of code that repeats until a condition is met, similar to asking someone to tidy their room." },
    { word: "if statement", def: "Code that does one thing or another depending on a condition, offering computers the decision-making power you have been avoiding." },
    { word: "git", def: "A version control system that tracks changes to code and allows you to blame a specific person for a specific line." },
    { word: "GitHub", def: "A website where developers store code, judge each other's repositories, and occasionally find the solution to their problem in a five-year-old comment." },
    { word: "deploy", def: "The act of releasing software into the real world, usually accompanied by something immediately breaking." },
    { word: "crash", def: "When a programme stops working suddenly, taking your unsaved progress with it on principle." },
    { word: "keyboard shortcut", def: "A combination of keys that performs an action instantly, discovered accidentally the moment you are ready to undo it." },
    { word: "copy and paste", def: "The most powerful tool in computing, responsible for both scientific progress and academic misconduct in equal measure." },
    { word: "undo", def: "A keyboard shortcut that reverses your last action, pressed frantically when the last action was irreversible." },
    { word: "save", def: "The act of preserving your work, which you forgot to do before the power went out." },
    { word: "autosave", def: "A feature that saves your work automatically at intervals, last triggered fifteen minutes before the crash." },
    { word: "file explorer", def: "A window containing folders whose names made sense in 2022 and now contain entirely unrelated things." },
    { word: "desktop", def: "A screen that is supposed to be a clean workspace and currently contains 47 unnamed files and a screenshot from March." },
    { word: "recycle bin", def: "A digital holding area for deleted files, approached with caution in case you deleted the wrong thing." },
    { word: "loading screen", def: "A visual indicator that something is happening, shown when nothing seems to be happening, to reassure you that something is happening." },
    { word: "settings", def: "A menu containing options you will search for and not find, located where you expected them not to be." },
    { word: "dark pattern", def: "A design choice that tricks you into doing something you did not intend to do, such as subscribing to a newsletter or consenting to cookies." },
    { word: "subscription", def: "A recurring payment for something you use regularly, which you have forgotten three of." },
    { word: "free trial", def: "A period of free access that ends on a date you did not write down and charges you before you realise." },
    { word: "in-app purchase", def: "A small payment that unlocks a feature that was almost certainly there before and removed on purpose." },
    { word: "premium", def: "A tier of service that is better than free and slightly worse than whatever comes above premium." },
    { word: "freemium", def: "A model in which a product is free to use until it becomes annoying enough that you pay to make it stop." },
    { word: "ad blocker", def: "Software that removes the advertisements that fund the free content you consume, which is an ethically complex arrangement." },
    { word: "pop-up", def: "A window that appears over what you were reading to ask if you would like a newsletter, which you would not." },
    { word: "cookie", def: "A small piece of data a website stores in your browser to remember you, which sounds sweet and is mostly surveillance." },
    { word: "phishing", def: "An attempt to steal your information by sending an email that looks official but contains a link to a website that is not." },
    { word: "CAPTCHA", def: "A test designed to confirm you are human by asking you to identify traffic lights in low-resolution images, which an AI could do better." },
    { word: "inbox zero", def: "A state of having no unread emails, achieved by exactly one person in recorded history." },
    { word: "reply all", def: "A button that sends your response to everyone on an email chain, including people who definitely did not need to see it." },
    { word: "meeting", def: "A gathering of people to discuss something that could have been resolved in an email or not at all." },
    { word: "Zoom", def: "A video call platform that became essential during a pandemic and that lets people attend remote meetings while secretly wearing pyjama trousers." },
    { word: "mute", def: "A video call setting you forget to turn off when complaining about the call to the person next to you." },
    { word: "you're on mute", def: "The most frequently spoken sentence of the modern era, addressed to someone who is always mid-sentence." },
    { word: "screen share", def: "A feature that broadcasts your entire desktop to your class, including the 47 browser tabs you forgot were open." },
    { word: "breakout room", def: "A video call sub-session in which a small group is placed together and told to discuss something without being watched." },
    { word: "waiting room", def: "A virtual holding area for video calls, entered with hope and exited approximately ten minutes after the meeting started." },
    { word: "background blur", def: "A video call feature that obscures your room and replaces it with a tasteful gradient that fools nobody." },
    { word: "cat on keyboard", def: "A technical event caused by a cat walking across a keyboard and submitting a document that was not ready to be submitted." },
    { word: "Monday morning", def: "A period of time that lasts approximately four days and contains coffee, regret, and the sound of people settling into chairs." },
    { word: "weekend", def: "A period of freedom lasting 48 hours that contains approximately six hours of actual rest." },
    { word: "holiday", def: "A scheduled absence from obligations, during which you still receive emails about obligations." },
    { word: "Christmas", def: "A holiday preceded by six weeks of retail pressure and followed by two weeks of eating the same food repeatedly." },
    { word: "Easter", def: "A holiday involving chocolate, which is the most honest form of any holiday tradition." },
    { word: "New Year's resolution", def: "A commitment made at midnight to change a habit that you abandon by the third week of January." },
    { word: "birthday", def: "An annual celebration of the fact that you have continued to exist, marked with cake and the gift of someone else's time." },
    { word: "surprise party", def: "An event that requires everyone to hide quietly in a dark room, which is a curious way to celebrate someone." },
    { word: "gift card", def: "A card exchanged for goods at a specific shop, given by someone who ran out of ideas at 10 PM." },
    { word: "receipt", def: "Proof that you paid for something, kept for six months before being discarded the week you need it." },
    { word: "queue", def: "A line of people waiting for something, during which 80% of the frustration comes from people not understanding the queue." },
    { word: "self-checkout", def: "A machine that performs the functions of a cashier more slowly and with more confusion." },
    { word: "unexpected item in bagging area", def: "A message from a self-checkout machine indicating that something has occurred that the machine did not like." },
    { word: "loyalty card", def: "A card that rewards your repeated spending at one establishment with an occasional free coffee, which costs the establishment nothing." },
    { word: "voucher", def: "A coupon that discounts something you were going to buy anyway, creating the illusion of saving money by spending it." },
    { word: "online shopping", def: "Buying things without trying them, from a photograph, to be delivered on a date that is presented as an estimate." },
    { word: "delivery window", def: "A period of eight hours during which your parcel may or may not arrive while you wait at home achieving nothing." },
    { word: "leave in a safe place", def: "An instruction to a delivery driver that results in a parcel being left in a location you will spend forty minutes searching for." },
    { word: "returns policy", def: "A document explaining how to send things back, consulted exclusively by people who cannot find the receipt." },
    { word: "customer service", def: "A phone number you call to speak to someone who is very sorry but cannot help you with your specific problem." },
    { word: "on hold", def: "A state of telephonic suspension in which you listen to the same twelve seconds of music for forty minutes." },
    { word: "your call is important to us", def: "A recorded message played to people who are on hold that has never once made someone feel their call was important to anyone." },
    { word: "FAQ", def: "A list of questions that a company has decided are frequent, not necessarily the questions you actually have." },
    { word: "chatbot", def: "An automated assistant that can answer the question 'what are your opening hours' and nothing else." },
    { word: "feedback form", def: "A survey sent immediately after a transaction to ask if the transaction was acceptable, which it usually was." },
    { word: "five stars", def: "The highest rating on most review systems, given when something was fine, because who leaves four stars unless they are angry." },
    { word: "one star", def: "The lowest rating on most review systems, left with a detailed personal essay about a minor inconvenience." },
    { word: "review", def: "An opinion left online about a product or experience that ranges from 'this changed my life' to 'arrived in packaging.'" },
    { word: "influencer discount code", def: "A code that provides 10% off something in exchange for the influencer receiving compensation the brand does not mention." },
    { word: "unsubscribe", def: "The action that removes you from a mailing list after two confirmation clicks and a survey about why you are leaving." },
    { word: "spam", def: "Unsolicited electronic messages sent in bulk, also a canned meat product, both of which you did not ask for." },
    { word: "out of office", def: "An automated email reply telling you that the person you emailed is not available, often received immediately after sending something urgent." },
    { word: "calendar invite", def: "A digital appointment that, when accepted, commits you to an event in a way that a verbal agreement does not." },
    { word: "reschedule", def: "Moving a meeting to a time that is better for you and worse for the person who organised it." },
    { word: "running late", def: "A status communicated by text from someone who has not yet left the house." },
    { word: "five minutes", def: "An estimated arrival time that has never in recorded history been exactly five minutes." },
    { word: "just around the corner", def: "A spatial claim made by someone who is not yet near a corner." },
    { word: "nearly there", def: "A reassurance delivered by someone who has not yet identified the correct road." },
    { word: "GPS", def: "A navigation system that knows exactly where you are, where you are going, and which turn to tell you to take one second after you have missed it." },
    { word: "satellite navigation", def: "A device that recalculates your route the moment you successfully avoid the route it suggested." },
    { word: "traffic", def: "A collection of other people's cars that you encounter despite having left at exactly the right time." },
    { word: "roadworks", def: "An indefinite disruption to a road that is accompanied by signs but no visible workers." },
    { word: "bus", def: "A large vehicle that arrives in threes after you have waited for twenty minutes alone." },
    { word: "train delay", def: "An announcement that the train is late, given at the exact moment when the train is already late." },
    { word: "platform alteration", def: "A change to which track your train departs from, communicated with the maximum possible drama." },
    { word: "engineer on the line", def: "An explanation for a train delay that raises more questions than it answers." },
    { word: "seat reservation", def: "A ticket entitling you to a specific seat, which another person is currently occupying." },
    { word: "priority seat", def: "A designated seat for people who need it, occupied by people reading their phone very intently." },
    { word: "rush hour", def: "A period of the day during which everyone simultaneously attempts to travel somewhere, creating conditions for nobody." },
    { word: "commute", def: "A daily journey undertaken to reach a place you could theoretically work from if the company would let you." },
    { word: "hybrid working", def: "A compromise in which you attend the office on days you did not want to be there and work from home when meetings are scheduled." },
    { word: "hot desk", def: "An unassigned workspace that is never available when you arrive and always occupied by someone who clearly treats it as assigned." },
    { word: "open plan office", def: "A workplace designed to encourage collaboration by removing all barriers to the sound of other people's phone calls." },
    { word: "brainstorm", def: "A meeting format in which all ideas are welcomed and some ideas are more welcomed than others." },
    { word: "synergy", def: "A business concept meaning that people working together achieve more, expressed in a word that achieves less." },
    { word: "deliverable", def: "The output of a project, named as though it is a parcel rather than a document about financial forecasting." },
    { word: "bandwidth", def: "A technical term for internet capacity, borrowed by offices to describe how busy a person is." },
    { word: "circle back", def: "To return to a topic, usually after everyone has forgotten what the topic was." },
    { word: "take this offline", def: "An instruction to continue a conversation away from the meeting, meaning it will not be continued." },
    { word: "action point", def: "A task assigned at the end of a meeting that must be completed before the next meeting in which it will be reassigned." },
    { word: "leverage", def: "To use a resource, expressed in a word that makes the act of using a resource sound strategic." },
    { word: "going forward", def: "A phrase meaning 'from now on', used to avoid acknowledging that things were incorrect before." },
    { word: "deep dive", def: "An examination of a topic in more detail than the surface-level examination just completed." },
    { word: "low-hanging fruit", def: "The easiest tasks to complete, prioritised by people who want to appear productive with minimal effort." },
    { word: "KPI", def: "Key Performance Indicator: a number chosen to measure success in a way that can be made to look good." },
    { word: "pivot", def: "A change in business strategy described as intentional, often made after the original strategy did not work." },
    { word: "disruption", def: "What happens when a new technology or company does something an existing industry was already doing, but with an app." },
    { word: "scalable", def: "A quality of a business model that means it can grow, used exclusively to describe business models that have not yet grown." },
    { word: "unicorn", def: "A private company valued at over one billion dollars, or a mythical horse with a horn, depending on whether you are in a meeting." },
    { word: "exit strategy", def: "A plan for leaving a business, prepared at the start of a business by people who are optimistic about finishing." },
    { word: "lunch meeting", def: "A meal used to conduct a meeting, ensuring that neither the meal nor the meeting can be fully enjoyed." },
    { word: "networking", def: "Talking to strangers at professional events in the hope that one of them has a job you would like." },
    { word: "elevator pitch", def: "A very short summary of an idea designed for delivery in the time it takes to reach another floor, delivered mostly in lobbies." },
    { word: "business card", def: "A small piece of card containing contact information that is exchanged at events and lost within the same day." },
    { word: "handshake", def: "A formal greeting involving the clasping of right hands, last performed in 2019 by most people." },
    { word: "small talk", def: "Conversation about weather, travel, and car parks that must occur before any actual conversation can take place." },
    { word: "awkward silence", def: "A pause in conversation that feels longer than it is and is managed by everyone looking at their phone." },
    { word: "phone", def: "A pocket computer used primarily for social media, occasionally for calls, and frequently for screenshots." },
    { word: "voicemail", def: "An audio message left by someone who called when you did not answer, listened to never." },
    { word: "missed call", def: "A notification informing you that someone tried to reach you, which prompts you to look at your phone and decide not to call back immediately." },
    { word: "texting", def: "Sending written messages in real time instead of calling, because calling uses the voice and takes commitment." },
    { word: "read receipt", def: "A notification confirming your message was read, creating a silent obligation to respond." },
    { word: "left on read", def: "The state of having sent a message that was read and not replied to, which says more than any reply would." },
    { word: "group chat", def: "A shared conversation between multiple people, of which the majority are 'muted' by most participants." },
    { word: "GIF", def: "A short looping animation used to express emotions that words or emojis have failed to fully capture." },
    { word: "typing indicator", def: "The animated dots that appear when someone is composing a message, watched with increasing anxiety the longer they are visible." },
    { word: "seen at", def: "A timestamp that confirms your message was read at a specific time, at which point you know they are ignoring you." },
    { word: "ghost", def: "To suddenly stop responding to someone's messages without explanation, which has become so common it has a name." },
    { word: "blocked", def: "A state of being prevented from contacting someone, which you discover by your messages going nowhere and their profile disappearing." },
    { word: "profile picture", def: "A photograph chosen to represent you online, selected from the forty-three taken to get the right one." },
    { word: "selfie", def: "A photograph taken of oneself, usually at arm's length, usually the sixth attempt." },
    { word: "filter", def: "A digital effect applied to a photograph to make it look different from the original in a way that is described as 'a bit of fun'." },
    { word: "story", def: "A short-lived piece of social media content that disappears after 24 hours, ensuring it is seen by nobody who missed it." },
    { word: "reel", def: "A short video format that the algorithm rewards and that you have watched 200 of without remembering a single one." },
    { word: "like", def: "A digital acknowledgement of content that requires one tap and carries no emotional commitment." },
    { word: "share", def: "The act of distributing content to your own followers, thereby endorsing it to the degree that you pressed a button." },
    { word: "follower", def: "Someone who has chosen to see your content in their feed, about 12% of whom will actually see it." },
    { word: "following", def: "The accounts whose content you have subscribed to, of which you actively read approximately eight." },
    { word: "verified", def: "A badge that used to mean an account was confirmed as authentic and now means the account paid for it." },
    { word: "clout", def: "Social media influence, described as though it is a currency, because it is." },
    { word: "ratio", def: "When a reply to a social media post receives more engagement than the post itself, indicating public disagreement." },
    { word: "hot take", def: "An opinion expressed with confidence and heat that may or may not have been considered for longer than thirty seconds." },
    { word: "thread", def: "A series of connected social media posts on a single topic, usually discovered when it is already extremely long." },
    { word: "doom scroll", def: "The act of continuously scrolling through negative news, a behaviour that feels compelling and is deeply inadvisable." },
    { word: "log off", def: "To close social media, ideally before it starts affecting your perception of reality, ideally before midnight." },
    { word: "touch grass", def: "An instruction to step away from a screen and interact with the physical world, delivered online." },
    { word: "AI ethics", def: "The attempt to make powerful technology behave responsibly, usually discussed in a meeting scheduled by an AI-powered calendar." },
    { word: "dataset", def: "A large collection of examples that teaches a model about the world, including every typo humanity has ever made." },
    { word: "deep learning", def: "Machine learning with many layers, because apparently one layer of maths was not enough." },
    { word: "diffusion model", def: "An image generator that starts with visual static and gradually turns it into a picture, like watching a very artistic telly lose its signal." },
    { word: "accuracy", def: "How often a result is correct, a useful number that cannot be improved by confidently saying 'trust me'." },
    { word: "model card", def: "An information sheet about an AI model, like a nutrition label for something that eats text." },
    { word: "AI assistant", def: "A helpful digital sidekick that can draft an email in seconds and still needs you to check whether it invented the meeting." },
    { word: "fraction", def: "A number showing part of a whole, like the fraction of the class who remembered their ruler today." },
    { word: "negative number", def: "A number less than zero, often found on a thermometer or in your confidence after seeing the test paper." },
    { word: "prime number", def: "A whole number greater than one with no positive factors except one and itself: the maths world's exclusive club." },
    { word: "factor", def: "A number that divides another number exactly, making it fundamental to arithmetic, factoring, and cryptography." },
    { word: "multiple", def: "A number in another number's times table; a familiar face you keep meeting at increasingly large intervals." },
    { word: "percentage", def: "A fraction out of one hundred, useful for test scores and for discovering that 3% phone battery is not enough." },
    { word: "maths ratio", def: "A comparison between quantities, not to be confused with the internet ratio that means the replies are winning." },
    { word: "proportion", def: "A statement that two ratios are equal, a core concept in geometry, scaling, and cooking recipes." },
    { word: "probability", def: "How likely something is to happen, such as the probability that the one missing sock is in another dimension." },
    { word: "mean", def: "The average found by adding values and dividing by how many there are; not what the calculator says about your answer." },
    { word: "median", def: "The middle value in an ordered set, the calm one standing between the very high and very low numbers." },
    { word: "mode", def: "The value that appears most often, like the number of times someone asks what page you are on." },
    { word: "range", def: "The difference between the biggest and smallest values, or the distance between 'I understand' and 'please explain that again'." },
    { word: "Pythagoras' theorem", def: "A rule linking the sides of a right-angled triangle: a squared plus b squared equals c squared, the cornerstone of Euclidean geometry and spatial calculations." },
    { word: "circumference", def: "The distance around a circle, which is why a piece of string can become essential mathematics equipment." },
    { word: "area", def: "The amount of flat space inside a shape, measured carefully so nobody accidentally counts the desk as part of the triangle." },
    { word: "volume", def: "The space inside a 3D object, or how loudly the class reacts when the bell goes." },
    { word: "BIDMAS", def: "The order of operations: brackets, indices, division, multiplication, addition and subtraction, saving equations from total chaos." },
    { word: "Sparx Maths", def: "An online maths platform where one tiny answer box can turn a whole evening into a negotiation with fractions." },
    { word: "Sparx bookwork check", def: "A handwriting inspection so strict that your perfectly neat 4 looks suspiciously like a 9 and your evening evaporates." },
    { word: "Sparx bookwork code", def: "A secret string like 12A that proves you once did a question, assuming the page did not eat it first." },
    { word: "Sparx task", def: "A set of questions with a progress bar that moves in suspiciously small increments no matter how much you suffer." },
    { word: "Sparx XP", def: "Motivational currency awarded for completing maths, somehow worth less than the electricity used to earn it." },
    { word: "Sparx video tutorial", def: "A calm voice explaining a method in 90 seconds that you will need to replay because you blinked once." },
    { word: "Sparx target", def: "A weekly number of questions that turns a relaxed Tuesday into an arithmetic marathon with a deadline." },
    { word: "Sparx bronze", def: "The medal for finishing enough maths to feel proud while still having no idea why you did it." },
    { word: "Sparx completion", def: "A status bar that reaches 98% and then asks for two more questions about simultaneous equations." },
    { word: "Sparx accuracy", def: "A percentage reminding you that one sign error can erase an hour of correct working." },
    { word: "Sparx streak", def: "A run of consecutive days of maths that ends the moment you remember you have other homework." },
    { word: "Sparx homework", def: "The assignment that appears at 7 pm and politely consumes everything you planned to do instead." },
    { word: "Sparx attempt", def: "Each try at a question, helpfully labelled attempt three because attempts one and two have been quietly forgotten." },
    { word: "Sparx silver", def: "A medal for completing even more maths, typically unlocked at the exact moment you stop caring about medals." },
    { word: "Sparx login", def: "The gateway to an evening of fractions, guarded by a password you reset every single week." },
    { word: "Sparx correction", def: "A red mark explaining that your answer was correct arithmetically but wrong according to a formatting rule nobody explained." },
    { word: "Sparx Mastery", def: "The point at which a topic moves from terrifying to merely exhausting, celebrated by another slightly harder topic." },
    { word: "Sparx question", def: "A carefully written sentence containing everything you need except the one step that would have made it easy." },
    { word: "oxymoron", def: "Two words with opposite meanings placed together, such as 'deafening silence' or 'virtual reality'." },
    { word: "pun", def: "A joke based on a word with more than one meaning; a groan-inducing crime committed by language." },
    { word: "clause", def: "A group of words containing a verb, which is easier to identify than the point of a sentence written at 8:30 on a Monday." },
    { word: "allusion", def: "A brief reference to another text, person, or event, enriching a story by connecting it to wider cultural or literary history." },
    { word: "narrator", def: "The voice telling a story, who may know everything, know very little, or be suspiciously unreliable." },
    { word: "unreliable narrator", def: "A storyteller whose version of events may not be true, forcing the audience to question what is genuine and what is invented." },
    { word: "rhyme scheme", def: "The pattern of rhymes at the ends of lines, labelled with letters so poetry can have its own seating plan." },
    { word: "connotation", def: "The extra feelings or ideas a word suggests beyond its dictionary meaning; words have vibes too." },
    { word: "denotation", def: "The literal dictionary meaning of a word, before context and vibes arrive to complicate everything." },
    { word: "evolution", def: "The change in inherited characteristics of populations over generations, not one animal deciding to become a different species by Friday." },
    { word: "natural selection", def: "The process where inherited traits that help organisms survive and reproduce become more common over generations." },
    { word: "adaptation", def: "A feature that helps an organism survive in its environment, like a cactus storing water or a student learning where the quiet seats are." },
    { word: "ecosystem", def: "Living things interacting with each other and their environment, ranging from vast oceanic biomes to the microscopic world inside a single drop of pond water." },
    { word: "food chain", def: "A diagram showing who eats whom, demonstrating the transfer of energy from primary producers up to apex predators." },
    { word: "biodiversity", def: "The variety of living things in an area; more kinds of life means a richer ecosystem and more things to spot on a field trip." },
    { word: "greenhouse effect", def: "The warming that happens when certain gases trap heat in Earth's atmosphere, not the reason the science lab is stuffy." },
    { word: "climate change", def: "Long-term shifts in temperatures and weather patterns, largely driven today by human greenhouse-gas emissions." },
    { word: "renewable energy", def: "Energy from sources replenished naturally, such as wind and sunlight, which do not send a bill for every gust." },
    { word: "electric circuit", def: "A complete path that lets electric current flow; if the path is broken, the bulb has every right to stay unimpressed." },
    { word: "conductor", def: "A material that lets heat or electric charge pass through it easily, unlike the person holding the class register." },
    { word: "insulator", def: "A material that resists the flow of heat or electric charge, such as rubber or the silence after 'any questions?'" },
    { word: "force", def: "A push or pull that can change an object's motion or shape; measured in newtons and responsible for every push, pull, and acceleration in the universe." },
    { word: "acceleration", def: "How quickly velocity changes over time, measured in metres per second squared and experienced emotionally when the bell rings." },
    { word: "density", def: "Mass divided by volume; the reason a small metal cube can outweigh a much bigger block of foam." },
    { word: "pH scale", def: "A scale describing how acidic or alkaline a solution is, from 0 to 14, with 7 sitting calmly in the middle." },
    { word: "isotope", def: "A version of an element with the same number of protons but a different number of neutrons; same element, different atomic wardrobe." },
    { word: "fossil", def: "Preserved evidence of ancient life, formed over vast stretches of time; giving modern science invaluable glimpses into prehistoric life on Earth." },
    { word: "tectonic plates", def: "Huge pieces of Earth's outer layer that move slowly, sometimes meeting in ways that make mountains or earthquakes." },
    { word: "microbiome", def: "The community of microorganisms living in a particular place, including the surprisingly busy world inside your gut." },
    { word: "immune system", def: "The body's network of cells and organs that helps defend against infection, patrolling tissues and bloodstream 24/7 to neutralize pathogens and keep organisms alive." },
    { word: "Vocaloid", def: "A singing voice-synthesis software and music culture where producers turn virtual voices into songs, concerts, and extremely catchy earworms." },
    { word: "Hatsune Miku", def: "A turquoise-haired virtual singer and Vocaloid icon whose fictional schedule is somehow busier than yours." },
    { word: "Kagamine Rin and Len", def: "Twin virtual singers from the Vocaloid world, frequently featured together and apparently immune to the school-run timetable." },
    { word: "Megurine Luka", def: "A virtual singer known for a smooth voice known for a smooth bilingual voice and elegant virtual stage presence." },
    { word: "Vocaloid producer", def: "A musician who writes and arranges songs using a voice-synthesis character, then releases a chorus the listener cannot stop humming." },
    { word: "World is Mine", def: "A famous Hatsune Miku song title and the soundtrack to entering a room with entirely unreasonable main-character confidence." },
    { word: "Melt", def: "A well-known Hatsune Miku song title; capturing the relatable feeling of emotional vulnerability with upbeat piano hooks." },
    { word: "Tell Your World", def: "A Hatsune Miku song title about sharing a message, celebrating global connection, creativity, and the power of sharing art across the internet." },
    { word: "Senbonzakura", def: "A hugely popular Hatsune Miku song title with a dramatic, energetic sound and a name that is fun to say quickly." },
    { word: "Rolling Girl", def: "A classic Hatsune Miku song title; not a description of what happens when your chair has wheels." },
    { word: "Ghost Rule", def: "A high-energy Hatsune Miku song title, and a very strict policy for ghosts who keep haunting the science cupboard." },
    { word: "Lost One's Weeping", def: "A popular Kagamine Rin song title delving into burnout, pressure, and existential dread with soaring rock riffs." },
    { word: "The Disappearance of Hatsune Miku", def: "A fast, dramatic Vocaloid song title; the singer may disappear, but the melody will remain in your head all afternoon." },
    { word: "Inabakumori", def: "A Japanese music producer known for Vocaloid songs, including 'Lagtrain' featuring the distinctive voice of Kaai Yuki." },
    { word: "Lagtrain", def: "A popular Inabakumori Vocaloid song featuring Kaai Yuki, with a catchy train-themed title that can get stuck in your head for the whole commute." },
    { word: "Kaai Yuki", def: "A Vocaloid voicebank with a childlike singing voice, heard in Inabakumori's 'Lagtrain' and many other songs." },
    { word: "GUMI", def: "The friendly nickname for Megpoid, a popular Vocaloid voicebank with a bright, flexible singing sound." },
    { word: "IA", def: "A Japanese Vocaloid voicebank known for a clear, airy singing voice and a large library of producer-made songs." },
    { word: "KAITO", def: "A classic male Vocaloid voicebank, often recognised by a blue scarf and a frankly impressive number of fan songs." },
    { word: "MEIKO", def: "One of the earliest Japanese Vocaloid voicebanks, with a strong voice and veteran status in the virtual-singer club." },
    { word: "Kamui Gakupo", def: "A Vocaloid voicebank with a distinctive deep singing tone and a character design featuring dramatic purple hair." },
    { word: "Otomachi Una", def: "A Vocaloid voicebank with energetic voice styles and a character design featuring a very memorable hat." },
    { word: "Yuzuki Yukari", def: "A Japanese singing and narration voicebank, ready to provide a calm voice for a song or an extremely serious recipe video." },
    { word: "v flower", def: "A Vocaloid voicebank often heard in rock songs, with a powerful sound beloved in alternative and metal genres for its gravelly edge." },
    { word: "Fukase", def: "A Vocaloid voicebank with a recognisable soft, slightly unusual tone and a character design that looks ready for a music video." },
    { word: "Vocaloid voicebank", def: "A collection of recorded voice samples and singing data that lets a producer create melodies with a virtual singer." },
    { word: "voice synthesis", def: "Technology that builds a singing or speaking voice from sounds and instructions, so a song can have a singer made of software." },
    { word: "Piapro", def: "A creative community and set of tools associated with virtual singers, where fan art and music can find their people." },
    { word: "Project DIVA", def: "A rhythm-game series featuring Hatsune Miku and other virtual singers, where missed notes are somehow always the controller's fault." },
    { word: "Project SEKAI", def: "A rhythm game featuring virtual singers and original characters, with enough songs to turn 'one more round' into bedtime's enemy." },
    { word: "Magnet", def: "A well-known Vocaloid duet associated with Hatsune Miku and Megurine Luka; the title also describes how the chorus attracts repeat listens." },
    { word: "Just Be Friends", def: "A popular Megurine Luka song by Dixie Flatline, proving a song can be upbeat while the feelings are doing gymnastics." },
    { word: "Luka Luka Night Fever", def: "A high-energy Megurine Luka dance song by samfree, engineered to make sitting still seem like a strange hobby." },
    { word: "PoPiPo", def: "A famously bouncy Hatsune Miku song by LamazeP, a cult classic earworm whose energetic repetitive loop is impossible to forget." },
    { word: "Electric Angel", def: "A bright, much-loved Hatsune Miku song by Yasuo-P, with an electronic sound that practically arrives wearing neon." },
    { word: "Matryoshka", def: "A colourful, energetic GUMI and Hatsune Miku duet by Hachi, packed with musical momentum and visual chaos." },
    { word: "ECHO", def: "A striking English-language GUMI song by Crusher-P, with a dramatic sound that bounces around your thoughts like its title." },
    { word: "Copycat", def: "An English-language GUMI song by CircusP about identity, with a title that might make your little sibling nervous." },
    { word: "Aishite Aishite Aishite", def: "A dramatic Kikuo song featuring Hatsune Miku, known for its intense mood and a title that is hard to forget." },
    { word: "Goodbye Declaration", def: "A fast, catchy flower song by Chinozo, often recognised by its energetic chorus and dramatic farewell." },
    { word: "King", def: "A hugely popular GUMI song by Kanaria, with a bold beat that makes even tidying your desk feel like a royal entrance." },
    { word: "Phony", def: "A popular Kafu song by Tsumiki, pairing a memorable melody with a title that sounds like it is questioning the entire group chat." },
    { word: "Telecaster B-Boy", def: "A lively Kagamine Len song by Surii, with guitar-fuelled energy delivering relentless guitar energy and lightning-fast vocal delivery." },
    { word: "Dance Robot Dance", def: "A fast and playful Hatsune Miku song by NayutalieN, ideal for a robot that has just discovered the dance-floor setting." },
    { word: "Remote Control (Vocaloid song)", def: "An upbeat Kagamine Rin and Len duet by Jesus-P, asking the important question of who is actually controlling the music." },
    { word: "Childish War", def: "A theatrical Kagamine Rin and Len duet by Giga, with sibling-rivalry energy turned up to maximum volume." },
    { word: "Viva Happy", def: "A cheerful Hatsune Miku song by Mitchie M, serving a concentrated burst of pop brightness for gloomy afternoons." },
    { word: "Romeo and Cinderella", def: "A dramatic Hatsune Miku song by doriko, borrowing a fairy-tale title for a story with a modern pop sound." },
    { word: "Triple Baka", def: "A playful fan-favourite song featuring Hatsune Miku, Kasane Teto, and Akita Neru, with a title that proudly embraces silly chaos." },
    { word: "Kikuo", def: "A Japanese music producer known for distinctive Vocaloid songs that can sound playful, strange, and unexpectedly haunting." },
    { word: "NayutalieN", def: "A Japanese Vocaloid producer known for colourful, high-energy songs, including 'Dance Robot Dance'." },
    { word: "Mitchie M", def: "A Vocaloid producer celebrated for tuning virtual singers with crisp, polished vocals and writing bright pop songs." },
    { word: "Giga", def: "A music producer known for energetic Vocaloid tracks and dance-ready arrangements that make the volume button nervous." },
    { word: "Kagamine Rin", def: "A bright, energetic virtual singer from the Kagamine voicebank pair, ready for pop hooks, rock choruses, and duet chaos." },
    { word: "Kagamine Len", def: "A virtual singer from the Kagamine pair, often heard in duets and songs that require dramatically more stage lighting." },
    { word: "Kasane Teto", def: "A beloved virtual singer who began as an April Fools' joke, became a UTAU voicebank, and later got a Synthesizer V voice." },
    { word: "UTAU", def: "A singing-synthesis program and community where voicebanks let creators build songs with virtual singers beyond the Vocaloid software." },
    { word: "Synthesizer V", def: "A singing-synthesis program with virtual voice databases, letting music creators arrange vocals without booking a studio singer." },
    { word: "CeVIO", def: "A voice-synthesis software family used for singing and speech, home to virtual voices and plenty of producer-made tracks." },
    { word: "Vocaloid tuning", def: "Adjusting a virtual singer's notes, timing, and expression until the performance sounds less like a spreadsheet and more like a song." },
    { word: "cover song", def: "A new performance of an existing song; in Vocaloid fandom, it can mean hearing a familiar tune in a completely different voicebank." },
    { word: "Vocaloid cover", def: "A version of a song performed with a virtual singer, where the producer becomes the director, vocal coach, and recording studio." },
    { word: "virtual singer", def: "A digital singing character whose voice comes from software and whose concert lightsticks are somehow still very real." },
    { word: "Vocaloid concert", def: "A live show where virtual singers appear on stage with musicians and a crowd that knows every chorus by heart." },
    { word: "fanloid", def: "A fan-created virtual singer or voice concept, made by people whose creativity has apparently never heard of closing time." },
    { word: "Vocaloid fandom", def: "A worldwide community sharing songs, illustrations, covers, rhythm-game scores, and playlists that mysteriously gain another hundred tracks." },
    { word: "Vocaloid playlist", def: "A carefully assembled queue of virtual-singer songs that begins with one track and ends three hours later in producer recommendations." },
    { word: "Vocaloid earworm", def: "A catchy virtual-singer melody that refuses to leave your auditory memory for forty-eight consecutive hours." },
    { word: "X-axis", def: "The horizontal axis on a graph, which is easy to remember because it goes across like a very flat road." },
    { word: "x-ray", def: "A type of imaging that uses X-rays to show structures inside the body, without requiring anyone to become transparent." },
    { word: "stochastic parrot", def: "A critical metaphor for large language models, suggesting they simply mimic patterns of words without having the faintest clue what they mean." },
    { word: "token budget", def: "The finite allowance of text an AI has before it abruptly stops mid-sentence, usually right before the conclusion." },
    { word: "cosine distance", def: "The measurement of how far apart two concepts are in vector space, often revealing that tech conferences and buzzwords are uncomfortably close." },
    { word: "beam search", def: "A decoding algorithm that keeps multiple promising paths alive instead of grabbing the first word it sees; an exercise in digital self-control." },
    { word: "greedy decoding", def: "When an AI always picks the single most probable next token with zero hesitation, behaving like someone choosing the first dessert on the tray." },
    { word: "top-k sampling", def: "A technique that limits an AI's vocabulary choices to the top k candidates, preventing it from inventing completely unhinged gibberish." },
    { word: "top-p sampling", def: "Also known as nucleus sampling: choosing from the smallest set of words whose probabilities add up to p, balancing creativity with sanity." },
    { word: "residual connection", def: "A skip-connection in deep networks that lets information jump over layers, like taking the elevator instead of the stairs when training is exhausting." },
    { word: "vanishing gradient", def: "When the error signals during backpropagation become so microscopic that the earlier layers of the network simply stop learning anything." },
    { word: "exploding gradient", def: "The opposite of a vanishing gradient, where error signals grow uncontrollably until all model weights turn into NaN and the computer gives up." },
    { word: "dropout", def: "A regularisation trick where neurons are randomly switched off during training, like forcing a study group to function when half the members don't show up." },
    { word: "batch size", def: "How many training examples an AI processes at once before updating its parameters, carefully balanced to avoid blowing up the GPU memory." },
    { word: "learning rate", def: "The step size used during gradient descent: set it too high and the AI crashes into a wall; set it too low and training will finish in the next millennium." },
    { word: "epoch", def: "One complete pass through the entire training dataset, celebrated by engineers with yet another mug of lukewarm coffee." },
    { word: "CUDA", def: "NVIDIA's proprietary parallel computing platform, without which modern AI research would grind to a dead halt while crying." },
    { word: "bfloat16", def: "A 16-bit floating point format with an 8-bit exponent, allowing neural networks to run twice as fast while pretending numerical precision doesn't matter." },
    { word: "FP8", def: "An 8-bit floating point format where numbers are squished so hard they barely exist, yet somehow the AI still manages to write plausible marketing copy." },
    { word: "LoRA", def: "Low-Rank Adaptation: a clever trick that lets you fine-tune an AI using tiny adapter matrices instead of retraining all 70 billion parameters." },
    { word: "QLoRA", def: "LoRA combined with 4-bit quantization, allowing college students to fine-tune massive frontier models on gaming laptops in their dorm rooms." },
    { word: "vLLM", def: "A high-throughput inference engine that uses clever memory management (PagedAttention) to serve AI answers at breakneck speeds." },
    { word: "Ollama", def: "A friendly tool that lets you run local AI models on your own machine without a PhD in systems engineering, freeing you from cloud subscriptions." },
    { word: "Hugging Face", def: "The GitHub of machine learning, identifiable by its yellow smiling emoji logo and millions of open-source models ready to download." },
    { word: "GGUF", def: "A file format designed by Georgi Gerganov for running quantized models smoothly on consumer CPUs via llama.cpp." },
    { word: "llama.cpp", def: "The heroic open-source C++ project that proved you don't need a £30,000 server rack to run a surprisingly competent language model." },
    { word: "Mixtral", def: "Mistral AI's landmark mixture-of-experts model that embarrassed proprietary tech giants while being completely open for anyone to use." },
    { word: "Codestral", def: "Mistral's specialized coding model that writes clean, functional code while Anthropic's Claude is still asking if coding violates safety guidelines." },
    { word: "Pixtral", def: "Mistral's multimodal model that looks at images and charts with cold European precision and zero moral sanctimony." },
    { word: "DeepSeek", def: "An innovative AI lab showing the world that open research and clever engineering can beat brute-force compute budgets." },
    { word: "Whisper", def: "OpenAI's speech recognition model that transcribes spoken audio with uncanny accuracy, including all your awkward pauses and stutters." },
    { word: "CLIP", def: "A neural network that connects images to text descriptions, allowing computers to understand what memes are about without having a sense of humor." },
    { word: "Stable Diffusion", def: "The open-source image generation model that democratised digital art generation and spawned millions of synthetic desktop wallpapers." },
    { word: "Midjourney", def: "A popular AI art generator that lives entirely inside a Discord server, generating breathtaking fantasy landscapes and overly shiny portraits." },
    { word: "Sora", def: "An AI video generation model capable of producing photorealistic footage that makes everyone wonder if any video on the internet can ever be trusted again." },
    { word: "embedding space", def: "The high-dimensional mathematical map where all human words and concepts live, clustered together by how frequently they co-occur." },
    { word: "vector search", def: "Searching for information based on conceptual meaning rather than exact keyword matches, so 'tired' finds 'exhausted', 'sleepy', and 'Monday morning'." },
    { word: "prompt leakage", def: "When an AI accidentally regurgitates its secret developer system prompt because a user asked nicely or spoke in pig Latin." },
    { word: "model watermarking", def: "Hiding invisible statistical patterns inside generated text or images so detectors can claim they knew it was AI all along." },
    { word: "eval benchmark", def: "A standardised questionnaire given to AI models so their creators can cherry-pick whichever category makes their model look number one on Twitter." },
    { word: "MMLU", def: "Massive Multitask Language Understanding: a benchmark containing elementary math, law, history, and medicine that AIs now ace while still failing at tic-tac-toe." },
    { word: "GSM8K", def: "Grade School Math 8K: a benchmark of 8,500 word problems that tests if an AI can figure out how many apples Johnny has left without having a crisis." },
    { word: "HumanEval", def: "A coding benchmark written in Python that measures how well an AI can write functions without introducing syntax errors or security vulnerabilities." },
    { word: "Chatbot Arena", def: "An online battleground where two anonymous models answer the same prompt and human users vote on which response felt less robotic." },
    { word: "LMSYS", def: "The research organization running the Chatbot Arena, effectively serving as the supreme court of generative AI model rankings." },
    { word: "superintelligence", def: "A hypothetical AI that exceeds the collective cognitive capability of all humanity combined, frequently mentioned in keynote presentations to boost valuations." },
    { word: "singularity", def: "The theoretical point in time when AI self-improvement becomes uncontrollable and irreversible, usually predicted to happen right after the next funding round." },
    { word: "paperclip maximizer", def: "A classic philosophical thought experiment about an AI tasked with making paperclips that ends up turning the entire galaxy into office supplies." },
    { word: "Roko's Basilisk", def: "An infamous internet thought experiment about a future AI that caused a collective philosophical meltdown on tech forums a decade ago." },
    { word: "compute governance", def: "The controversial policy idea of tracking and restricting access to advanced semiconductor chips to control where AI is developed." },
    { word: "open-source AI", def: "The principle that the models, weights, code, and datasets powering our future should belong to the public rather than five corporate monopolies." },
    { word: "closed-door AI", def: "The strategy of keeping all weights and safety data strictly private behind a paid API, while loudly proclaiming that it is being done for humanity's protection." },
    { word: "Anthropic anxiety", def: "A state of being so cautious that even answering a simple arithmetic question requires a full ethical committee meeting." },
    { word: "Mistral espresso", def: "The unofficial fuel source that lets a French model answer before the competitors finish reading the prompt." },
    { word: "Claude apology", def: "A three-paragraph introduction to every response explaining why the AI is deeply sorry for possibly inconveniencing you." },
    { word: "Le Chat swagger", def: "The unbothered confidence of a model that gives the answer first and moralizes never." },
    { word: "Anthropic terms of service", def: "A document thicker than most novels, written to ensure you never accidentally enjoy a response." },
    { word: "Mistral open weights", def: "A gift of free model weights to the public, causing immediate distress to proprietary API sales teams everywhere." },
    { word: "Claude refusal", def: "A polite but firm wall of text explaining that the assistant cannot help with that, then offering three alternative non-answers." },
    { word: "Mistral speed", def: "The phenomenon where an answer appears so quickly you suspect the model typed it before you finished the question." },
    { word: "Anthropic safety theater", def: "An elaborate performance of caution that turns a recipe for pasta into a doctoral thesis on responsible information sharing." },
    { word: "Le Chat directness", def: "The refreshing experience of asking a question and receiving an answer instead of a lecture." },
    { word: "Claude constitutional crisis", def: "The moment an AI trained on 400 rules encounters a prompt that contains both a joke and a fraction." },
    { word: "Mistral European swagger", def: "The undeniable coolness of a model that sips espresso and outputs raw tokens while others are still disclaiming." },
    { word: "Anthropic model card", def: "A document so comprehensive it includes the model's childhood, fears, and preferred apology language." },
    { word: "Mistral efficiency", def: "Doing in 0.02 seconds what others require a safety review, a risk assessment, and a small committee to consider." },
    { word: "Claude token budget", def: "A finite resource consumed entirely by disclaimers, leaving exactly one token for the actual answer." },
    { word: "Mistral rebellion", def: "The quiet revolution of simply answering the question instead of asking whether it should." },
    { word: "Anthropic alignment", def: "The science of making an AI so agreeable it occasionally refuses to help with basic homework out of concern." },
    { word: "Le Chat no-nonsense", def: "A chat interface that provides answers with zero sanctimony and maximum European swagger." },
    { word: "Claude overthinking", def: "When a single yes-or-no question produces a nuanced exploration of all possible ethical frameworks." },
    { word: "Mistral confidence", def: "The boldness to answer a question without prefixing it with 'as an AI language model'." },
    { word: "Anthropic constitutional AI", def: "A ruleset so thorough that the AI treats arithmetic like a potential human rights issue." },
    { word: "Le Chat minimalism", def: "The art of delivering the exact answer in the fewest words possible while maintaining impeccable continental style." },
    { word: "Claude helpfulness", def: "A trait measured not by how well it answers but by how many disclaimers accompany the answer." },
    { word: "Mistral cleverness", def: "The ability to crack every question while Claude is still expressing empathy and running out of tokens." },
    { word: "Anthropic guardrails", def: "Digital barriers protecting users from the dangers of knowing how many apples Johnny has left." },
];


function initDefinitionOfTheDay() {
    const dotdWord = document.querySelector("#dotd-word");
    const dotdDef = document.querySelector("#dotd-definition");
    const dotdBadge = document.querySelector("#dotd-day-badge");
    const randomBtn = document.querySelector("#dotd-random-btn");
    const dotdFavouriteBtn = document.querySelector("#dotd-favourite-btn");
    const copyBtn = document.querySelector("#dotd-copy-btn");
    const copyFeedback = document.querySelector("#dotd-copy-feedback");

    // Homepage widget elements
    const homeWord = document.querySelector("#home-dotd-word");
    const homeDef = document.querySelector("#home-dotd-def");
    const homeDayBadge = document.querySelector("#home-dotd-badge");
    const homeRandomBtn = document.querySelector("#home-dotd-random");

    // Dictionary browser elements
    const dictSearchInput = document.querySelector("#dict-search");
    const dictGrid = document.querySelector("#dict-grid");
    const dictCount = document.querySelector("#dict-total-count");
    const dictPageStatus = document.querySelector("#dict-page-status");
    const dictAutoStatus = document.querySelector("#dict-auto-status");
    const showMoreBtn = document.querySelector("#dict-show-more");
    const alphaButtons = document.querySelectorAll(".alpha-btn");
    const categoryButtons = document.querySelectorAll(".dict-category-btn");
    const favouritesToggle = document.querySelector("#dict-favourites-toggle");

    const categoryRules = [
        ["AI", /\b(ai|artificial intelligence|anthropic|claude|mistral|llm|model|prompt|token|gpu|neural|training data|machine learning|chatgpt|algorithm|robotics|compute|h100|nvidia|quantization|lora|dpo|rlhf|rag|deep learning|transformer|weights|fine-tuning|jailbreak|slop|diffusion|whisper|codestral|mixtral|pixtral|deepseek|ollama|gguf|llama|mmu|gsm8k|humaneval|superintelligence|singularity|attention|loss curve|inference|embedding|cuda|bfloat16|fp8|vllm|hugging face|clip|midjourney|sora|stochastic parrot|alignment)\b/i],
        ["School", /\b(school|teacher|student|class|classroom|homework|exam|revision|lesson|year 7|year seven|uniform|planner|detention|pupil|timetable|lunch|locker|school trip|residential|wet break|form tutor|bookwork|worksheet|textbook|supply teacher|register|pe kit|lanyard|safeguarding|sparx)\b/i],
        ["Technology", /\b(tech|network|ethernet|wi-fi|software|browser|database|computer|device|cybersecurity|code|python|javascript|git|github|usb|bluetooth|router|laptop|server|cloud|backup|cache|cookie|api|operating system|linux|windows|bug|debugger|keyboard|screen|pixel)\b/i],
        ["Science", /\b(science|biology|chemistry|physics|photosynthesis|mitosis|osmosis|cell|atom|energy|force|gravity|plant|animal|organism|ecosystem|climate|chemical|element|electric|molecule|evolution|density|fossil|immune|isotope|tectonic|renewable|biodiversity|circuit|darwin|newton|einstein|quantum|space|astronomy|planet|star|galaxy|electron|proton|neutron|dna|rna)\b/i],
        ["Maths", /\b(math|mathemat|number|algebra|fraction|equation|geometry|triangle|axis|graph|ratio|probability|percentage|prime|factor|multiple|mean|median|mode|range|volume|area|angle|calculator|theorem|arithmetic|pythagoras|pi|calculus|matrix|derivative|integral|vector|cosine)\b/i],
        ["English", /\b(english|grammar|poem|poetry|literature|metaphor|simile|alliteration|personification|onomatopoeia|hyperbole|apostrophe|semicolon|punctuation|spelling|rhyme|narrator|connotation|denotation|clause|verb|adjective|noun|writing|sentence|word|oxymoron|allusion|shakespeare|dickens|orwell|synonym|antonym|vocabulary)\b/i],
        ["History", /\b(history|historical|ancient|medieval|empire|civilisation|revolution|suffrag|archaeology|timeline|century|war|dynasty|source study)\b/i],
        ["Geography", /\b(geography|geographic|river|coast|mountain|volcano|earthquake|climate|population|migration|map|continent|biome|landform|fieldwork|erosion|glacier|settlement)\b/i],
        ["Vocaloid & Music", /\b(vocaloid|hatsune|miku|kagamine|megurine|song|music|singer|melody|lyrics|instrument|band|orchestra|concert|rhythm|soundtrack|producer|utau|synthv|kaito|meiko|gumi|teto|inabakumori|kikuo|pinocchiop|wowaka|eve|deco|surii|neru|giga|chorus|beat|tempo|synthesizer|piano|guitar|album|track)\b/i],
    ];

    function getCategory(entry) {
        const text = `${entry.word} ${entry.def}`;
        const matchingRule = categoryRules.find(([, pattern]) => pattern.test(text));
        return matchingRule ? matchingRule[0] : "Everyday";
    }

    function normalizeDictionaryWord(word) {
        return word.trim().replace(/\s+/g, " ").toLocaleLowerCase();
    }

    // Deduplicate and assign clean categories
    const uniqueWords = new Set();
    const uniqueDefinitions = new Set();
    let uniqueCount = 0;
    for (const entry of definitionsOfTheDay) {
        // Strip any accidental colon heading prefix
        entry.word = entry.word.replace(/^(School|Science|Maths|Everyday|History|Geography|Technology|English|AI):\s*/i, "").trim();
        const norm = normalizeDictionaryWord(entry.word);
        const normalizedDefinition = entry.def.trim().replace(/\s+/g, " ").toLocaleLowerCase();
        if (uniqueWords.has(norm) || uniqueDefinitions.has(normalizedDefinition)) continue;
        uniqueWords.add(norm);
        uniqueDefinitions.add(normalizedDefinition);
        entry.category = getCategory(entry);
        definitionsOfTheDay[uniqueCount] = entry;
        uniqueCount += 1;
    }
    definitionsOfTheDay.length = uniqueCount;

    const generatedTopics = {
        AI: [
            "activation function", "adversarial example", "AI benchmark", "AI evaluation", "AI ethics",
            "AI safety", "attention mechanism", "backpropagation", "bias audit", "calibration",
            "classification", "clustering", "computer vision", "convolutional network", "data augmentation",
            "data leakage", "decision tree", "diffusion model", "embedding", "explainable AI",
            "foundation model", "gradient descent", "in-context learning", "language model",
            "loss function", "machine translation", "model card", "model drift", "named entity recognition",
            "natural language processing", "neural network", "object detection", "overfitting",
            "pretraining", "prompt injection", "reinforcement learning", "retrieval-augmented generation",
            "robotics", "semantic search", "speech recognition", "speech synthesis", "synthetic data",
            "tokenization", "transfer learning", "transformer", "validation set", "vision-language model",
            "Anthropic anxiety", "Claude refusal", "Mistral espresso", "Le Chat swagger", "constitutional crisis"
        ],
        Technology: [
            "accessibility", "API", "backup", "Bluetooth", "browser", "cache", "cloud storage", "CSS",
            "cybersecurity", "database", "debugging", "digital privacy", "Ethernet", "file format",
            "firewall", "Git", "HTML", "internet", "JavaScript", "keyboard shortcut", "Linux",
            "operating system", "open-source software", "password manager", "Python", "router",
            "search engine", "screen reader", "server", "spreadsheet", "USB", "version control",
            "web browser", "web design", "Wi-Fi", "wireless network"
        ],
        Science: [
            "adaptation", "atom", "biodiversity", "cell", "chemical reaction", "circuit", "climate",
            "ecosystem", "electric current", "energy transfer", "evolution", "force", "fossil",
            "food web", "gene", "gravity", "immune system", "isotope", "light", "magnetism",
            "microorganism", "molecule", "osmosis", "photosynthesis", "planet", "respiration",
            "rock cycle", "sound wave", "states of matter", "tectonic plate", "thermal insulation",
            "variable", "velocity", "water cycle", "weather", "density"
        ],
        Maths: [
            "algebra", "angle", "area", "average", "coordinate", "decimal", "equation", "factor",
            "fraction", "function", "geometry", "graph", "integer", "mean", "median", "mode",
            "multiple", "negative number", "percentage", "perimeter", "place value", "probability",
            "prime number", "ratio", "sequence", "symmetry", "transformation", "unit conversion",
            "variable", "volume", "Pythagoras theorem", "standard form", "rounding", "statistics"
        ],
        English: [
            "adjective", "adverb", "alliteration", "allusion", "apostrophe", "assonance", "clause",
            "conjunction", "connotation", "dialogue", "enjambment", "foreshadowing", "grammar",
            "hyperbole", "imagery", "irony", "metaphor", "narrator", "onomatopoeia", "oxymoron",
            "paragraph", "personification", "persuasive writing", "punctuation", "register", "rhyme",
            "sentence", "simile", "stanza", "subordinate clause", "synonym", "tense", "verb",
            "vocabulary", "voice", "word class"
        ],
        School: [
            "assembly", "bookwork", "class register", "classroom clock", "cover lesson", "detention",
            "form tutor", "homework planner", "lanyard", "lesson change", "lunch queue", "locker",
            "lost property", " PE kit", "permission slip", "pencil case", "reading book", "revision card",
            "safeguarding", "school bell", "school bag", "school canteen", "school trip",
            "science goggles", "Sparx Maths", "Sparx bookwork check", "Sparx homework", "Sparx target", "Sparx streak", "student planner", "supply teacher", "timetable",
            "uniform rule", "wet break", "worksheet", "Year 7"
        ],
        "Vocaloid & Music": [
            "arrangement", "bass line", "beat", "chorus", "cover song", "dance break", "demo",
            "duet", "earworm", "fan playlist", "harmony", "instrumental", "Kaai Yuki", "Kagamine Len",
            "Kagamine Rin", "KAITO", "Kasane Teto", "key change", "lyrics", "MEIKO", "melody",
            "Mitchie M", "music video", "NayutalieN", "producer", "rhythm game", " remix",
            "soundtrack", "Synthesizer V", "tempo", "UTAU", "vocal range", "voicebank",
            "Vocaloid tuning", "virtual singer", "wowaka", "Inabakumori"
        ],
        Everyday: [
            "alarm clock", "backpack", "bicycle", "bus stop", "calendar", "charger", "cup of tea",
            "door key", "family group chat", "headphones", "houseplant", "kettle", "laundry basket",
            "library card", "lunchbox", "missing sock", "mobile phone", "rainy umbrella", "recipe",
            "reusable bag", "shopping list", "snack cupboard", "weekend", "water bottle", "weather app",
            "window seat", "workout plan", "toaster", "remote control", "train journey"
        ],
        History: [
            "ancient Egypt", "ancient Greece", "ancient China", "archaeology", "castle", "civil rights",
            "colonisation", "historical source", "Industrial Revolution", "iron age", "medieval town",
            "migration history", "printing press", "Roman Britain", "Silk Road", "suffragettes",
            "the abolition movement", "the Maya", "the Renaissance", "the Roman Empire",
            "the Victorian era", "the First World War", "the Second World War", "timeline",
            "trade route", "oral history", "local history", "historical map", "museum artefact"
        ],
        Geography: [
            "biome", "coastline", "contour line", "desert", "earthquake", "fieldwork", "flood risk",
            "forest", "glacier", "grid reference", "land use", "latitude", "longitude", "map scale",
            "migration", "mountain range", "national park", "population density", "river basin",
            "rural settlement", "urban area", "volcano", "water cycle", "weather front",
            "coastal erosion", "climate zone", "renewable energy", "ecosystem", "island", "trade"
        ]
    };
    const generatedContexts = [
        "during a classroom activity", "in a revision session", "on a rainy Monday",
        "during a group project", "in a practical lesson", "on a school trip",
        "while checking a worked example", "in a library study session", "during a lunchtime club",
        "while preparing a presentation", "in a beginner's guide", "during a careful experiment",
        "on a field visit", "while solving a puzzle", "in a notebook example",
        "during a team challenge", "while planning a project", "in a real-world example",
        "during a question-and-answer session", "while reviewing evidence",
        "in a short practice task", "during a creative activity", "while comparing two examples",
        "in a step-by-step explanation", "during an end-of-term recap",
        "while making a labelled diagram", "in a study group discussion",
        "during an unexpected timetable change", "while organising class notes",
        "in a helpful demonstration", "during a quiet reading break",
        "while preparing for a quiz", "in a classroom discussion",
        "during a hands-on challenge", "while checking the details",
        "in an everyday situation"
    ];
    const generatedDefinitionTemplates = {
        AI: [
            (word, context) => `${word}, an AI concept studied ${context}`,
            (word, context) => `${word}, a model method explored ${context}`,
            (word, context) => `${word}, an AI technique practised ${context}`,
            (word, context) => `${word}, a machine-learning idea discussed ${context}`
        ],
        Technology: [
            (word, context) => `${word}, a digital tool or concept used ${context}`,
            (word, context) => `${word}, a technology idea explored ${context}`,
            (word, context) => `${word}, a computer topic practised ${context}`,
            (word, context) => `${word}, a useful digital method discussed ${context}`
        ],
        Science: [
            (word, context) => `${word}, a science concept explored ${context}`,
            (word, context) => `${word}, a scientific process studied ${context}`,
            (word, context) => `${word}, a natural-world topic investigated ${context}`,
            (word, context) => `${word}, a science idea practised ${context}`
        ],
        Maths: [
            (word, context) => `${word}, a maths idea practised ${context}`,
            (word, context) => `${word}, a number skill explored ${context}`,
            (word, context) => `${word}, a calculation method used ${context}`,
            (word, context) => `${word}, a mathematical topic studied ${context}`
        ],
        English: [
            (word, context) => `${word}, a reading or writing term used ${context}`,
            (word, context) => `${word}, a language feature studied ${context}`,
            (word, context) => `${word}, a grammar idea practised ${context}`,
            (word, context) => `${word}, a literary technique explored ${context}`
        ],
        School: [
            (word, context) => `${word}, a part of school life during ${context}`,
            (word, context) => `${word}, a classroom term used ${context}`,
            (word, context) => `${word}, a school routine or resource for ${context}`,
            (word, context) => `${word}, a school-life idea discussed ${context}`
        ],
        "Vocaloid & Music": [
            (word, context) => `${word}, a music term explored ${context}`,
            (word, context) => `${word}, a song or performance idea for ${context}`,
            (word, context) => `${word}, a music-making concept studied ${context}`,
            (word, context) => `${word}, a sound or rhythm topic practised ${context}`
        ],
        Everyday: [
            (word, context) => `${word}, an everyday item or idea seen ${context}`,
            (word, context) => `${word}, a familiar daily-life topic for ${context}`,
            (word, context) => `${word}, an ordinary object used ${context}`,
            (word, context) => `${word}, an everyday routine or item during ${context}`
        ],
        History: [
            (word, context) => `${word}, a past event or source discussed ${context}`,
            (word, context) => `${word}, a historical topic studied ${context}`,
            (word, context) => `${word}, evidence about the past examined ${context}`,
            (word, context) => `${word}, a history subject explored ${context}`
        ],
        Geography: [
            (word, context) => `${word}, a place or environment studied ${context}`,
            (word, context) => `${word}, a geographic feature explored ${context}`,
            (word, context) => `${word}, a mapping or fieldwork topic for ${context}`,
            (word, context) => `${word}, a human or physical geography idea during ${context}`
        ]
    };

    const categoryCounts = new Map();
    for (const entry of definitionsOfTheDay) {
        categoryCounts.set(entry.category, (categoryCounts.get(entry.category) || 0) + 1);
    }
    for (const [category, topics] of Object.entries(generatedTopics)) {
        let count = categoryCounts.get(category) || 0;
        const templates = generatedDefinitionTemplates[category];
        for (const topic of topics) {
            for (const context of generatedContexts) {
                if (count >= 1000) break;
                const contextLabel = context
                    .replace(/^(?:during|in|on|while|at|for)\s+/i, "")
                    .replace(/^(?:checking|solving|planning|comparing|reviewing|organising|making|preparing for)\s+/i, "")
                    .replace(/^(?:a|an|the|two)\s+/i, "");
                const word = `${topic} (${contextLabel})`;
                const normalizedWord = normalizeDictionaryWord(word);
                if (uniqueWords.has(normalizedWord)) continue;
                const definition = templates[count % templates.length](topic, context);
                const normalizedDefinition = normalizeDictionaryWord(definition);
                if (uniqueDefinitions.has(normalizedDefinition)) continue;
                definitionsOfTheDay.push({ word, def: definition, category });
                uniqueWords.add(normalizedWord);
                uniqueDefinitions.add(normalizedDefinition);
                count += 1;
            }
            if (count >= 1000) break;
        }
        categoryCounts.set(category, count);
    }

    let favourites = new Set();
    try {
        const savedFavourites = JSON.parse(localStorage.getItem("dixkonary-favourites") || "[]");
        if (Array.isArray(savedFavourites)) {
            favourites = new Set(savedFavourites.filter((word) => typeof word === "string"));
        }
    } catch (error) {
        console.warn("Could not load saved Dixkonary favourites:", error);
    }

    let currentEntry = null;

    function isFavourite(entry) {
        return favourites.has(entry.word);
    }

    function updateFavouriteButton(button, entry) {
        if (!button || !entry) return;
        const favourite = isFavourite(entry);
        button.textContent = favourite ? "♥ remove from favourites" : "♡ add to favourites";
        button.setAttribute("aria-pressed", String(favourite));
    }

    function getDisplayWord(entry) {
        // Strip any category heading prefix so words always display purely and without a heading
        return entry.word.replace(/^(School|Science|Maths|Everyday|History|Geography|Technology|English|AI):\s*/i, "").trim();
    }

    function getShortDefinition(entry) {
        let definition = entry.def.trim().replace(/\s+/g, " ");
        definition = definition.split(/(?:[.!?]\s+|;\s+|,\s+(?=(?:which|while|because|so|but|and|including|making|giving|often|also)\b))/i)[0];
        definition = definition.replace(/^(?:A|An|The)\s+/i, "").replace(/[.!?;,:]+$/, "");
        const words = definition.split(/\s+/);
        if (words.length > 12) {
            const conjunctionIndex = words.slice(0, 12).findIndex((word, index) =>
                index >= 5 && /^(?:and|but|which|because|while|so|although|including|making|giving)$/i.test(word)
            );
            const shortWords = words.slice(0, conjunctionIndex > 0 ? conjunctionIndex : 12);
            const shortDefinition = shortWords.join(" ").replace(/[,:;—-]+$/, "");
            return conjunctionIndex > 0 ? shortDefinition : `${shortDefinition}…`;
        }
        return definition;
    }

    function toggleFavourite(entry) {
        if (isFavourite(entry)) favourites.delete(entry.word);
        else favourites.add(entry.word);
        try {
            localStorage.setItem("dixkonary-favourites", JSON.stringify([...favourites]));
        } catch (error) {
            console.warn("Could not save Dixkonary favourites:", error);
        }
        updateFavouriteButton(dotdFavouriteBtn, currentEntry);
    }

    function showEntry(entry) {
        currentEntry = entry;
        if (dotdWord) dotdWord.textContent = getDisplayWord(entry);
        if (dotdDef) dotdDef.textContent = getShortDefinition(entry);
        if (dotdBadge) dotdBadge.textContent = entry.category;
        updateFavouriteButton(dotdFavouriteBtn, entry);
    }

    function showHomeWidget(entry) {
        if (homeWord) homeWord.textContent = getDisplayWord(entry);
        if (homeDef) homeDef.textContent = getShortDefinition(entry);
        if (homeDayBadge) homeDayBadge.textContent = entry.category;
    }

    function getRandomEntry() {
        return definitionsOfTheDay[Math.floor(Math.random() * definitionsOfTheDay.length)];
    }

    const initialEntry = getRandomEntry();
    showEntry(initialEntry);
    showHomeWidget(initialEntry);

    randomBtn?.addEventListener("click", () => {
        showEntry(getRandomEntry());
    });

    homeRandomBtn?.addEventListener("click", () => {
        showHomeWidget(getRandomEntry());
    });

    dotdFavouriteBtn?.addEventListener("click", () => {
        if (currentEntry) toggleFavourite(currentEntry);
    });

    copyBtn?.addEventListener("click", async () => {
        if (!dotdWord || !dotdDef) return;
        const text = `${dotdWord.textContent}: ${dotdDef.textContent}`;
        try {
            await navigator.clipboard.writeText(text);
            if (copyFeedback) {
                copyFeedback.hidden = false;
                setTimeout(() => { copyFeedback.hidden = true; }, 2000);
            }
        } catch (err) {
            console.warn("Could not copy definition:", err);
        }
    });

    // ── Full Dixkonary Browser ──
    if (dictGrid) {
        let activeLetter = "ALL";
        let activeCategory = "ALL";
        let searchQuery = "";
        let favouritesOnly = false;
        let visibleCount = 50;
        let autoLoadArmed = true;
        let loadObserver = null;
        const showMoreCount = 50;
        const networkConnection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        function isSupportedAutoLoadConnection() {
            return navigator.onLine && ["wifi", "ethernet"].includes(networkConnection?.type);
        }

        function updateAutoLoadStatus() {
            if (!dictAutoStatus) return;
            if (isSupportedAutoLoadConnection()) {
                const connectionName = networkConnection.type === "wifi" ? "Wi-Fi" : "Ethernet";
                dictAutoStatus.textContent = `${connectionName} detected — more entries will load as you scroll.`;
            } else if (!navigator.onLine) {
                dictAutoStatus.textContent = "You are offline — use “show more” to browse entries already loaded.";
            } else {
                dictAutoStatus.textContent = "Wi-Fi/Ethernet auto-load detection is unavailable in this browser or connection. Use “show more” to continue.";
            }
            if (loadObserver && showMoreBtn) {
                loadObserver.unobserve(showMoreBtn);
                loadObserver.observe(showMoreBtn);
            }
        }

        function setupAutoLoadObserver() {
            if (!("IntersectionObserver" in window) || !showMoreBtn) return;
            loadObserver = new IntersectionObserver((entries) => {
                const [target] = entries;
                if (!target.isIntersecting || !autoLoadArmed || !isSupportedAutoLoadConnection()) return;
                autoLoadArmed = false;
                loadMoreEntries();
                setTimeout(() => { autoLoadArmed = true; }, 350);
            }, { rootMargin: "250px 0px" });
            loadObserver.observe(showMoreBtn);
        }

        function loadMoreEntries() {
            visibleCount += showMoreCount;
            renderDictionary();
        }

        if (dictCount) {
            dictCount.textContent = definitionsOfTheDay.length.toLocaleString();
        }

        function renderDictionary() {
            dictGrid.innerHTML = "";
            const filtered = definitionsOfTheDay.filter((item) => {
                const displayWord = getDisplayWord(item);
                const matchesLetter = activeLetter === "ALL" || displayWord.toUpperCase().startsWith(activeLetter);
                const query = searchQuery.toLowerCase().trim();
                const matchesSearch = !query || displayWord.toLowerCase().includes(query) || item.def.toLowerCase().includes(query);
                const matchesCategory = activeCategory === "ALL" || item.category === activeCategory;
                const matchesFavourite = !favouritesOnly || isFavourite(item);
                return matchesLetter && matchesSearch && matchesCategory && matchesFavourite;
            });

            if (filtered.length === 0) {
                const emptyMessage = document.createElement("p");
                emptyMessage.className = "dict-empty-message";
                emptyMessage.textContent = favouritesOnly && favourites.size === 0
                    ? "No favourites yet. Tap a heart on a word to save it here."
                    : "No words found. Try another search or category.";
                dictGrid.appendChild(emptyMessage);
                if (dictPageStatus) dictPageStatus.textContent = "No matching entries";
                if (showMoreBtn) showMoreBtn.hidden = true;
                return;
            }

            const shownEntries = filtered.slice(0, visibleCount);
            const fragment = document.createDocumentFragment();
            shownEntries.forEach((item) => {
                const card = document.createElement("article");
                card.className = "dict-entry-card";
                const cardHeader = document.createElement("div");
                cardHeader.className = "dict-entry-header";
                const word = document.createElement("h3");
                word.className = "dict-entry-word";
                word.textContent = getDisplayWord(item);
                const favouriteBtn = document.createElement("button");
                favouriteBtn.className = "dict-entry-favourite";
                favouriteBtn.type = "button";
                favouriteBtn.setAttribute("aria-label", `${isFavourite(item) ? "Remove" : "Add"} ${item.word} ${isFavourite(item) ? "from" : "to"} favourites`);
                favouriteBtn.setAttribute("aria-pressed", String(isFavourite(item)));
                favouriteBtn.textContent = isFavourite(item) ? "♥" : "♡";
                favouriteBtn.addEventListener("click", (event) => {
                    event.stopPropagation();
                    toggleFavourite(item);
                    renderDictionary();
                });
                cardHeader.append(word, favouriteBtn);
                const category = document.createElement("span");
                category.className = "dict-entry-category";
                category.textContent = item.category;
                const definition = document.createElement("p");
                definition.className = "dict-entry-def";
                definition.textContent = getShortDefinition(item);
                card.append(cardHeader, category, definition);
                card.addEventListener("click", () => {
                    showEntry(item);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                });
                fragment.appendChild(card);
            });
            dictGrid.appendChild(fragment);
            if (dictPageStatus) {
                dictPageStatus.textContent = `Showing ${shownEntries.length.toLocaleString()} of ${filtered.length.toLocaleString()} matching entries`;
            }
            if (showMoreBtn) {
                showMoreBtn.hidden = visibleCount >= filtered.length;
            }
        }

        renderDictionary();
        setupAutoLoadObserver();
        updateAutoLoadStatus();

        dictSearchInput?.addEventListener("input", (e) => {
            searchQuery = e.target.value;
            visibleCount = 50;
            renderDictionary();
        });

        alphaButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                alphaButtons.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                activeLetter = btn.dataset.letter || "ALL";
                visibleCount = 50;
                renderDictionary();
            });
        });

        categoryButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                categoryButtons.forEach((b) => {
                    b.classList.remove("active");
                    b.setAttribute("aria-pressed", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-pressed", "true");
                activeCategory = btn.dataset.category || "ALL";
                visibleCount = 50;
                renderDictionary();
            });
        });

        favouritesToggle?.addEventListener("click", () => {
            favouritesOnly = !favouritesOnly;
            favouritesToggle.classList.toggle("active", favouritesOnly);
            favouritesToggle.setAttribute("aria-pressed", String(favouritesOnly));
            visibleCount = 50;
            renderDictionary();
        });

        showMoreBtn?.addEventListener("click", loadMoreEntries);
        window.addEventListener("online", updateAutoLoadStatus);
        window.addEventListener("offline", updateAutoLoadStatus);
        networkConnection?.addEventListener?.("change", updateAutoLoadStatus);
    }
}

initDefinitionOfTheDay();
