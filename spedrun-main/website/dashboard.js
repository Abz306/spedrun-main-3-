const loginForm = document.querySelector("#login-form");
const loginPanel = document.querySelector("#login-panel");
const dashboardPanel = document.querySelector("#dashboard-panel");
const loginMessage = document.querySelector("#login-message");

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!loginForm.reportValidity()) {
        loginMessage.textContent = "Enter a username and password to preview the demo.";
        loginMessage.hidden = false;
        return;
    }

    loginMessage.hidden = true;
    loginPanel.hidden = true;
    dashboardPanel.hidden = false;
});

document.querySelector("#logout-button").addEventListener("click", () => {
    dashboardPanel.hidden = true;
    loginPanel.hidden = false;
    loginForm.reset();
});
