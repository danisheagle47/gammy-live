document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. STATO GLOBALE E GESTIONE DATI
    // =========================================================================
    let state = {
        library: [],
        wishlist: [],
        journal: [],
        currentMonth: new Date()
    };

    const loadStateFromStorage = () => {
        state.library = JSON.parse(localStorage.getItem('gammyLibrary')) || [];
        state.wishlist = JSON.parse(localStorage.getItem('gammyWishlist')) || [];
        state.journal = JSON.parse(localStorage.getItem('gammyJournal')) || [];
    };

    const saveStateToStorage = () => {
        localStorage.setItem('gammyLibrary', JSON.stringify(state.library));
        localStorage.setItem('gammyWishlist', JSON.stringify(state.wishlist));
        localStorage.setItem('gammyJournal', JSON.stringify(state.journal));
    };

    // =========================================================================
    // 2. SELETTORI DOM
    // =========================================================================
    const dom = {
        libraryGrid: document.getElementById('library-grid'),
        wishlistGrid: document.getElementById('wishlist-grid'),
        upcomingGrid: document.getElementById('upcoming-grid'),
        journalList: document.getElementById('journal-list'),
        newsFeed: document.getElementById('news-feed'),
        searchInput: document.getElementById('search-input'),
        searchBtn: document.getElementById('search-btn'),
        searchModal: document.getElementById('search-modal'),
        journalModal: document.getElementById('journal-modal'),
        searchResultsContainer: document.getElementById('search-results'),
        modalBackdrop: document.getElementById('modal-backdrop'),
        themeToggle: document.getElementById('theme-toggle'),
        navLinks: document.querySelectorAll('.nav-link'),
        pages: document.querySelectorAll('.page'),
        calendarContainer: document.getElementById('calendar-grid-container'),
        calendarMonthYear: document.getElementById('calendar-month-year'),
        prevMonthBtn: document.getElementById('prev-month-btn'),
        nextMonthBtn: document.getElementById('next-month-btn')
    };

    // =========================================================================
    // 3. FUNZIONI HELPER E UTILITY
    // =========================================================================
    const getCoverUrl = (url, size = 'cover_big') => url ? `https:${url.replace('t_thumb', `t_${size}`)}` : 'https://placehold.co/180x240/1E1E1E/9933FF?text=N/A';
    const showLoading = (container) => container.innerHTML = '<div class="loading-spinner"></div>';
    const showPlaceholder = (container, message) => container.innerHTML = `<p class="placeholder-text">${message}</p>`;
    const openModal = (modal) => { dom.modalBackdrop.classList.add('active'); modal.classList.add('active'); };
    const closeModal = () => { document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active')); dom.modalBackdrop.classList.remove('active'); };

    // =========================================================================
    // 4. FUNZIONI DI RENDER (Disegnano l'interfaccia)
    // =========================================================================
    const renderLibrary = () => {
        if (state.library.length === 0) {
            showPlaceholder(dom.libraryGrid, "La tua libreria è vuota. Cerca un gioco per iniziare!");
            return;
        }
        dom.libraryGrid.innerHTML = state.library.map(game => `
            <div class="game-card">
                <button class="remove-btn" data-id="${game.id}" data-list="library" title="Rimuovi dalla libreria"><i class="fa-solid fa-xmark"></i></button>
                <img src="${getCoverUrl(game.cover?.url)}" alt="${game.name}">
                <div class="game-card-info"><h4>${game.name}</h4></div>
            </div>
        `).join('');
    };

    const renderWishlist = () => {
        if (state.wishlist.length === 0) {
            showPlaceholder(dom.wishlistGrid, "La tua wishlist è vuota.");
            return;
        }
        dom.wishlistGrid.innerHTML = state.wishlist.map(game => `
            <div class="game-card">
                <button class="remove-btn" data-id="${game.id}" data-list="wishlist" title="Rimuovi dalla wishlist"><i class="fa-solid fa-xmark"></i></button>
                <img src="${getCoverUrl(game.cover?.url)}" alt="${game.name}">
                <div class="game-card-info"><h4>${game.name}</h4></div>
            </div>
        `).join('');
    };

    const renderJournal = () => {
        if (state.journal.length === 0) {
            showPlaceholder(dom.journalList, "Nessuna voce nel diario.");
            return;
        }
        dom.journalList.innerHTML = [...state.journal].reverse().map(entry => `
            <div class="journal-entry">
                <p class="journal-date">${entry.date}</p>
                <h4>${entry.title} <span class="journal-game-title">per ${entry.gameName}</span></h4>
                <p class="journal-text">${entry.notes.replace(/\n/g, '<br>')}</p>
            </div>
        `).join('');
    };

    // =========================================================================
    // 5. FUNZIONI API-DRIVEN (Parlano con il server)
    // =========================================================================
    const handleSearch = async () => {
        const query = dom.searchInput.value.trim();
        if (!query) return;
        openModal(dom.searchModal);
        showLoading(dom.searchResultsContainer);

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Errore ${response.status}`);
            }

            dom.searchResultsContainer.innerHTML = '';
            if (data.length === 0) {
                showPlaceholder(dom.searchResultsContainer, "Nessun risultato trovato.");
                return;
            }

            dom.searchResultsContainer.innerHTML = data.map(game => {
                const inLibrary = state.library.some(libGame => libGame.id === game.id);
                return `
                    <div class="game-card">
                        <img src="${getCoverUrl(game.cover?.url)}" alt="${game.name}">
                        <div class="action-overlay">
                            <button class="action-btn" data-action="add-library" data-game='${JSON.stringify(game)}' ${inLibrary ? 'disabled' : ''}>
                                ${inLibrary ? 'In Libreria' : 'Aggiungi'}
                            </button>
                        </div>
                        <div class="game-card-info"><h4>${game.name}</h4></div>
                    </div>`;
            }).join('');
        } catch (error) {
            showPlaceholder(dom.searchResultsContainer, `<b>Errore di Ricerca:</b><br>${error.message}.<br><br>Verifica le credenziali API su Vercel e che il token non sia scaduto.`);
            console.error("Dettaglio Errore Ricerca:", error);
        }
    };
    
    const renderApiSection = async (container, apiEndpoint, cardRenderer) => {
        showLoading(container);
        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) throw new Error(`Errore caricamento dati da ${apiEndpoint}`);
            const data = await response.json();
            if (data.length === 0) {
                showPlaceholder(container, "Nessun dato da mostrare al momento.");
                return;
            }
            container.innerHTML = data.map(cardRenderer).join('');
        } catch (error) {
            showPlaceholder(container, `Impossibile caricare la sezione. ${error.message}`);
        }
    };
    
    const renderUpcoming = () => renderApiSection(dom.upcomingGrid, '/api/upcoming', game => {
        const inWishlist = state.wishlist.some(w => w.id === game.id);
        return `
            <div class="game-card">
                <img src="${getCoverUrl(game.cover?.url)}" alt="${game.name}">
                <div class="action-overlay">
                    <button class="action-btn" data-action="add-wishlist" data-game='${JSON.stringify(game)}' ${inWishlist ? 'disabled' : ''}>
                        ${inWishlist ? 'In Wishlist' : '+ Wishlist'}
                    </button>
                </div>
                <div class="game-card-info"><h4>${game.name}</h4></div>
            </div>`;
    });

    const renderNews = () => renderApiSection(dom.newsFeed, '/api/news', item => `
        <a class="news-card" href="${item.url}" target="_blank" rel="noopener noreferrer">
            <img src="${getCoverUrl(item.image, 'screenshot_med')}" alt="${item.title}">
            <div class="news-content">
                <h4>${item.title}</h4>
                <p>${item.summary || ''}</p>
                <span class="news-date">${new Date(item.published_at * 1000).toLocaleDateString('it-IT')}</span>
            </div>
        </a>`
    );

    // Cerca la funzione renderCalendar nel tuo script.js e sostituiscila con questa

const renderCalendar = async () => {
    dom.calendarMonthYear.textContent = state.currentMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    showLoading(dom.calendarContainer);

    const firstDayOfMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + 1, 0);
    const start = Math.floor(firstDayOfMonth.getTime() / 1000);
    const end = Math.floor(lastDayOfMonth.getTime() / 1000);

    try {
        const response = await fetch(`/api/releases?start=${start}&end=${end}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Errore ${response.status}`);
        }
        const releases = await response.json();
        
        const releasesByDay = releases.reduce((acc, release) => {
            const day = new Date(release.date * 1000).getDate();
            if (!acc[day]) acc[day] = [];
            acc[day].push(release);
            return acc;
        }, {});

        let html = '<div class="calendar-grid">';
        const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
        html += daysOfWeek.map(day => `<div class="calendar-day-name">${day}</div>`).join('');
        
        const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
        for (let i = 0; i < firstDayIndex; i++) {
            html += `<div class="calendar-day other-month"></div>`;
        }

        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            html += `<div class="calendar-day"><div class="day-number">${day}</div><div class="day-releases">`;
            if (releasesByDay[day]) {
                // CODICE CORRETTO E DIFENSIVO: Controlla se 'r.platform' esiste prima di usarlo.
                html += releasesByDay[day].map(r => {
                    const platformAbbr = r.platform ? `(${r.platform.abbreviation})` : '';
                    return `<div class="release-item" title="${r.game.name} ${platformAbbr}">${r.game.name}</div>`;
                }).join('');
            }
            html += `</div></div>`;
        }
        html += '</div>';
        dom.calendarContainer.innerHTML = html;
    } catch (error) {
        showPlaceholder(dom.calendarContainer, `Impossibile caricare il calendario. <br><small>${error.message}</small>`);
        console.error("Errore Calendario:", error);
    }
};
    
// =========================================================================
// 6. GESTIONE EVENTI
// =========================================================================
const setupEventListeners = () => {
    // --- Eventi principali ---
    dom.searchBtn.addEventListener('click', handleSearch);
    dom.searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSearch());
    dom.themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('gammy-theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    // --- Navigazione tra le pagine ---
    dom.navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.dataset.section;
            dom.pages.forEach(page => page.classList.toggle('active', page.id === targetId));
            dom.navLinks.forEach(nav => nav.classList.toggle('active', nav.dataset.section === targetId));
        });
    });

    // --- Navigazione Calendario ---
    dom.prevMonthBtn.addEventListener('click', () => { state.currentMonth.setMonth(state.currentMonth.getMonth() - 1); renderCalendar(); });
    dom.nextMonthBtn.addEventListener('click', () => { state.currentMonth.setMonth(state.currentMonth.getMonth() + 1); renderCalendar(); });

    // --- Gestione Aggiunta Voce al Diario ---
    document.getElementById('add-journal-entry-btn').addEventListener('click', () => {
        const select = document.getElementById('journal-game');
        if (state.library.length > 0) {
            select.innerHTML = state.library.map(game => `<option value="${game.id}" data-name="${game.name}">${game.name}</option>`).join('');
        } else {
            select.innerHTML = '<option disabled>Aggiungi prima un gioco alla libreria</option>';
        }
        openModal(dom.journalModal);
    });

    document.getElementById('journal-form').addEventListener('submit', e => {
        e.preventDefault();
        const form = e.target;
        const selectedOption = form.elements['journal-game'].options[form.elements['journal-game'].selectedIndex];
        if (!selectedOption) return;
        state.journal.push({
            gameId: parseInt(selectedOption.value),
            gameName: selectedOption.dataset.name,
            title: form.elements['journal-title'].value,
            notes: form.elements['journal-notes'].value,
            date: new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
        });
        saveStateToStorage();
        renderJournal();
        closeModal();
        form.reset();
    });

    // --- Gestione di tutti gli altri click (Modal, Bottoni Aggiungi/Rimuovi) ---
    document.body.addEventListener('click', e => {
        // Chiusura Modal cliccando sulla X o sullo sfondo
        if (e.target.classList.contains('close-modal-btn') || e.target.id === 'modal-backdrop') {
            closeModal();
            return;
        }

        // Aggiunta a libreria o wishlist
        const actionBtn = e.target.closest('.action-btn');
        if (actionBtn) {
            const game = JSON.parse(actionBtn.dataset.game);
            const action = actionBtn.dataset.action;

            if (action === 'add-library' && !state.library.some(g => g.id === game.id)) {
                state.library.push(game);
                renderLibrary();
                closeModal();
            } else if (action === 'add-wishlist' && !state.wishlist.some(g => g.id === game.id)) {
                state.wishlist.push(game);
                renderWishlist();
                actionBtn.textContent = 'In Wishlist';
                actionBtn.disabled = true;
            }
            saveStateToStorage();
            return;
        }
        
        // Rimozione da libreria o wishlist
        const removeBtn = e.target.closest('.remove-btn');
        if (removeBtn) {
            const gameId = parseInt(removeBtn.dataset.id);
            const list = removeBtn.dataset.list;

            if (list === 'library' && confirm('Rimuovere questo gioco dalla libreria?')) {
                state.library = state.library.filter(g => g.id !== gameId);
                renderLibrary();
            } else if (list === 'wishlist' && confirm('Rimuovere questo gioco dalla wishlist?')) {
                state.wishlist = state.wishlist.filter(g => g.id !== gameId);
                renderWishlist();
                renderUpcoming(); // Ricarica la sezione "In Uscita" per riattivare il pulsante
            }
            saveStateToStorage();
            return;
        }
    });
};

    // =========================================================================
    // 7. INIZIALIZZAZIONE
    // =========================================================================
    const initialize = () => {
        if (localStorage.getItem('gammy-theme') === 'light') {
            document.body.classList.remove('dark-theme');
        }
        loadStateFromStorage();
        setupEventListeners();

        renderLibrary();
        renderWishlist();
        renderJournal();
        renderUpcoming();
        renderNews();
        renderCalendar();
    };

    initialize();
});