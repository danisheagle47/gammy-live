document.addEventListener('DOMContentLoaded', () => {
    let myLibrary = [];
    let currentMonth = new Date();

    const gameGrid = document.getElementById('game-grid');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('search-modal');
    const searchResultsContainer = document.getElementById('search-results');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const themeToggle = document.getElementById('theme-toggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const newsFeed = document.getElementById('news-feed');
    const calendarContainer = document.getElementById('calendar-grid-container');
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    const getCoverUrl = (url, size = 'cover_big') => url ? `https:${url.replace('t_thumb', `t_${size}`)}` : 'https://placehold.co/180x240?text=N/A';
    const showLoading = (container) => container.innerHTML = '<div class="loading-spinner"></div>';
    
    const loadLibraryFromStorage = () => {
        const storedLibrary = localStorage.getItem('gammyLibrary');
        myLibrary = storedLibrary ? JSON.parse(storedLibrary) : [];
    };

    const saveLibraryToStorage = () => {
        localStorage.setItem('gammyLibrary', JSON.stringify(myLibrary));
    };

    const renderLibrary = () => {
        gameGrid.innerHTML = '';
        if (myLibrary.length === 0) {
            gameGrid.innerHTML = `<p style="color: var(--text-secondary); text-align: center; grid-column: 1 / -1;">La tua libreria è vuota. Cerca un gioco per iniziare!</p>`;
            return;
        }
        myLibrary.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.innerHTML = `
                <button class="remove-btn" data-id="${game.id}"><i class="fa-solid fa-xmark"></i></button>
                <img src="${getCoverUrl(game.cover?.url)}" alt="${game.name}">
                <div class="game-card-info">
                    <h4>${game.name}</h4>
                </div>
            `;
            gameGrid.appendChild(gameCard);
        });
    };

    const handleSearch = async () => {
        const query = searchInput.value.trim();
        if (!query) return;

        openModal(searchModal);
        showLoading(searchResultsContainer);

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            searchResultsContainer.innerHTML = '';

            if (results.length === 0) {
                searchResultsContainer.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">Nessun risultato trovato.</p>`;
                return;
            }

            results.forEach(game => {
                const isAdded = myLibrary.some(libGame => libGame.id === game.id);
                const gameCard = document.createElement('div');
                gameCard.className = 'game-card';
                gameCard.innerHTML = `
                    <img src="${getCoverUrl(game.cover?.url)}" alt="${game.name}">
                    <div class="action-overlay">
                        <button class="action-btn" data-game='${JSON.stringify(game)}' ${isAdded ? 'disabled' : ''}>
                            ${isAdded ? 'Già in libreria' : 'Aggiungi'}
                        </button>
                    </div>
                    <div class="game-card-info">
                        <h4>${game.name}</h4>
                    </div>
                `;
                searchResultsContainer.appendChild(gameCard);
            });
        } catch (error) {
            searchResultsContainer.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">Errore durante la ricerca.</p>`;
        }
    };
    
    const renderNews = async () => {
        showLoading(newsFeed);
        try {
            const response = await fetch('/api/news');
            const newsItems = await response.json();
            newsFeed.innerHTML = '';
            newsItems.forEach(item => {
                const newsCard = document.createElement('a');
                newsCard.className = 'news-card';
                newsCard.href = item.url;
                newsCard.target = '_blank';
                newsCard.innerHTML = `
                    <img src="${getCoverUrl(item.image, 'screenshot_med')}" alt="${item.title}">
                    <div class="news-content">
                        <h4>${item.title}</h4>
                        <p>${item.summary || ''}</p>
                        <span class="news-date">${new Date(item.published_at * 1000).toLocaleDateString('it-IT')}</span>
                    </div>
                `;
                newsFeed.appendChild(newsCard);
            });
        } catch {
            newsFeed.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">Impossibile caricare le notizie.</p>`;
        }
    };
    
    const renderCalendar = async () => {
        calendarMonthYear.textContent = currentMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
        showLoading(calendarContainer);

        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const startTimestamp = Math.floor(firstDayOfMonth.getTime() / 1000);
        const endTimestamp = Math.floor(lastDayOfMonth.getTime() / 1000);

        try {
            const response = await fetch(`/api/releases?start=${startTimestamp}&end=${endTimestamp}`);
            const releases = await response.json();

            const releasesByDay = {};
            releases.forEach(release => {
                const day = new Date(release.date * 1000).getDate();
                if (!releasesByDay[day]) releasesByDay[day] = [];
                releasesByDay[day].push(release);
            });
            
            calendarContainer.innerHTML = '';
            const calendarGrid = document.createElement('div');
            calendarGrid.className = 'calendar-grid';

            const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
            daysOfWeek.forEach(day => calendarGrid.innerHTML += `<div class="calendar-day-name">${day}</div>`);
            
            const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; 
            for (let i = 0; i < firstDayOfWeek; i++) {
                calendarGrid.innerHTML += `<div class="calendar-day other-month"></div>`;
            }

            for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
                let dayHtml = `<div class="calendar-day"><div class="day-number">${day}</div><div class="day-releases">`;
                if (releasesByDay[day]) {
                    releasesByDay[day].forEach(release => {
                        dayHtml += `<div class="release-item">${release.game.name} (${release.platform.abbreviation})</div>`;
                    });
                }
                dayHtml += `</div></div>`;
                calendarGrid.innerHTML += dayHtml;
            }
            calendarContainer.appendChild(calendarGrid);

        } catch (error) {
             calendarContainer.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">Impossibile caricare il calendario.</p>`;
        }
    };

    const openModal = (modal) => {
        modalBackdrop.classList.add('active');
        modal.classList.add('active');
    };

    const closeModal = () => {
        document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
        modalBackdrop.classList.remove('active');
    };

    // Event Listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSearch());
    
    modalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('click', e => {
        if (e.target.classList.contains('close-modal-btn')) closeModal();

        if (e.target.classList.contains('action-btn')) {
            const gameData = JSON.parse(e.target.dataset.game);
            myLibrary.push(gameData);
            saveLibraryToStorage();
            renderLibrary();
            closeModal();
        }
        
        if (e.target.closest('.remove-btn')) {
            const gameId = parseInt(e.target.closest('.remove-btn').dataset.id);
            if (confirm('Sei sicuro di voler rimuovere questo gioco dalla libreria?')) {
                myLibrary = myLibrary.filter(game => game.id !== gameId);
                saveLibraryToStorage();
                renderLibrary();
            }
        }
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('gammy-theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

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
    
    prevMonthBtn.addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        renderCalendar();
    });
    nextMonthBtn.addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        renderCalendar();
    });

    // Inizializzazione
    if (localStorage.getItem('gammy-theme') === 'light') {
        document.body.classList.remove('dark-theme');
    }
    loadLibraryFromStorage();
    renderLibrary();
    renderNews();
    renderCalendar();
});