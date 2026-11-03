(function () {
    const invite = 'https://discord.gg/3b7W2mQBuV';

    document.querySelectorAll('a[href*="discord.gg/"]').forEach((link) => {
        link.href = invite;
    });

    document.querySelectorAll('a[href="/api/auth/discord"]').forEach((link) => {
        link.classList.add('hielke-discord');
    });
})();
