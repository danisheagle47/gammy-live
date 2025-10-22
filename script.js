document.addEventListener('DOMContentLoaded', () => {
    const myGameIds = [509658, 102102, 32204, 111538, 516575, 512953];

    const localGameData = {
        102102: { status: 'in-progress' },
        509658: { status: 'completed' },
        32204: { status: 'on-hold' },
        111538: { status: 'to-play' },
        516575: { status: 'completed' },
        512953: { status: 'in-progress' }
    };

    const statusClasses = {
        'in-progress': 'In Corso',
        'completed': 'Completato',
        'on-hold': 'In Pausa',
        'to-play': 'Da Iniziare'
    };

    const gameGrid = document.getElementById('game-grid');
    const themeToggle = document.getElementById('theme-toggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    async function fetchGamesByIds(gameIds) {
        const queryString = gameIds.map(id => `id=${id}`).join('&');
        const url = `/api/games?${queryString}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 401) {
                    displayApiError("Errore di autenticazione dal server. Controlla le credenziali su Vercel.");
                } else {
                    displayApiError(`Errore dal server: ${response.status}`);
                }
                return [];
            }
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error("Errore durante la chiamata alla nostra API:", error);
            displayApiError("Impossibile contattare il server.");
            return [];
        }
    }

    function displayApiError(message) {
        gameGrid.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">${message}</p>`;
    }

    async function renderLibrary() {
        gameGrid.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">Caricamento libreria in corso...</p>`;
        const gamesFromApi = await fetchGamesByIds(myGameIds);
        if (gamesFromApi.length === 0) {
            return;
        }
        gameGrid.innerHTML = '';
        gamesFromApi.forEach(game => {
            const coverUrl = game.box_art_url.replace('{width}', '300').replace('{height}', '400');
            const localData = localGameData[game.id] || { status: 'to-play' };
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.dataset.gameId = game.id;
            gameCard.innerHTML = `
                <img src="${coverUrl}" alt="${game.name}">
                <div class="game-card-info">
                    <h4>${game.name}</h4>
                    <span class="status ${localData.status}">${statusClasses[localData.status]}</span>
                </div>
            `;
            gameGrid.appendChild(gameCard);
        });
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('gammy-theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    if (localStorage.getItem('gammy-theme') === 'light') {
        document.body.classList.remove('dark-theme');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = link.getAttribute('data-section');
            navLinks.forEach(nav => nav.classList.remove('active'));
            pages.forEach(page => page.classList.remove('active'));
            link.classList.add('active');
            document.getElementById(targetSectionId).classList.add('active');
        });
    });

    renderLibrary();
});