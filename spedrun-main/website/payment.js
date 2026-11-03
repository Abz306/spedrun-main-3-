const paymentMessage = document.querySelector("#payment-message");

for (const button of document.querySelectorAll(".payment-button")) {
    button.addEventListener("click", () => {
        const amount = Number(button.dataset.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            paymentMessage.textContent = "That payment amount is invalid.";
            paymentMessage.hidden = false;
            return;
        }

        paymentMessage.textContent = `Checkout for £${amount.toFixed(2)} is not available yet. No payment was taken.`;
        paymentMessage.hidden = false;
    });
}
