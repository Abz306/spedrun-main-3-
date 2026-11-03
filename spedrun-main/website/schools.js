const schoolDirectoryData = window.schoolDirectoryData;
const schoolSearchInput = document.querySelector("#school-directory-search");
const schoolRows = document.querySelector("#school-directory-rows");
const schoolCount = document.querySelector("#school-directory-count");
const schoolStatus = document.querySelector("#school-directory-status");
const schoolShowMoreButton = document.querySelector("#school-directory-show-more");
const schoolPageSize = 50;
let visibleSchoolCount = schoolPageSize;

if (!Array.isArray(schoolDirectoryData)) {
    schoolCount.textContent = "School directory unavailable";
    schoolStatus.textContent = "The directory data could not be loaded. Please refresh the page or try again later.";
    schoolShowMoreButton.hidden = true;
    console.error("School directory data is missing or invalid.");
} else {
    const searchSchools = () => {
        const query = schoolSearchInput.value.trim().toLocaleLowerCase();
        if (!query) return schoolDirectoryData;
        return schoolDirectoryData.filter((school) =>
            `${school.name} ${school.town} ${school.products}`.toLocaleLowerCase().includes(query)
        );
    };

    const updateSchoolDirectory = () => {
        const matches = searchSchools();
        const visibleSchools = matches.slice(0, visibleSchoolCount);
        const fragment = document.createDocumentFragment();

        for (const school of visibleSchools) {
            const row = document.createElement("tr");
            for (const value of [school.name, school.town, school.products]) {
                const cell = document.createElement("td");
                cell.textContent = value || "—";
                row.append(cell);
            }
            fragment.append(row);
        }

        schoolRows.replaceChildren(fragment);
        schoolCount.textContent = `${schoolDirectoryData.length.toLocaleString()} schools`;
        schoolStatus.textContent = `Showing ${visibleSchools.length.toLocaleString()} of ${matches.length.toLocaleString()} matching schools.`;
        schoolShowMoreButton.hidden = visibleSchools.length >= matches.length;
    };

    schoolSearchInput.addEventListener("input", () => {
        visibleSchoolCount = schoolPageSize;
        updateSchoolDirectory();
    });

    schoolShowMoreButton.addEventListener("click", () => {
        visibleSchoolCount += schoolPageSize;
        updateSchoolDirectory();
    });

    updateSchoolDirectory();
}
