document.addEventListener('DOMContentLoaded', () => {
    // --- STATO GLOBALE ---
    const state = {
        library: [],
        wishlist: [],
        journal: [],
        currentMonth: new Date()
    };

    // --- DOM ELEMENTS ---
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
        gameDetailModal: document.getElementById('game-detail-modal'),
        searchResultsContainer: document.getElementById('search-results'),
        modalBackdrop: document.getElementById('modal-backdrop'),
        navLinks: document.querySelectorAll('.nav-link'),
        pages: document.querySelectorAll('.page'),
        calendarContainer: document.getElementById('calendar-grid-container'),
        calendarMonthYear: document.getElementById('calendar-month-year'),
        prevMonthBtn: document.getElementById('prev-month-btn'),
        nextMonthBtn: document.getElementById('next-month-btn')
    };

    // --- FUNZIONI HELPER ---
    const getCoverUrl = (url) => url ? url.replace('media/', 'media/crop/600/400/') : 'https://placehold.co/180x240/1A1A22/8A2BE2?text=N/A';
    const showLoading = (container) => container.innerHTML = '<div class="loading-spinner"></div>';
    const showPlaceholder = (container, message) => container.innerHTML = `<p class="placeholder-text">${message}</p>`;
    const openModal = (modal) => { dom.modalBackdrop.classList.add('active'); modal.classList.add('active'); };
    const closeModal = () => { document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active')); dom.modalBackdrop.classList.remove('active'); };
    const getPlatformIcon = (slug) => {
        const icons = { pc: 'fa-windows', playstation: 'fa-playstation', xbox: 'fa-xbox', nintendo: 'fa-nintendo-switch', ios: 'fa-apple', android: 'fa-android', linux: 'fa-linux' };
        return `<i class="fab ${icons[slug] || 'fa-gamepad'}"></i>`;
    };

    // --- GESTIONE DATI LOCALI ---
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

    // --- FUNZIONI DI RENDER ---
    const renderGameDetailModal = (game) => {
        const inLibrary = state.library.some(g => g.id === game.id);
        const inWishlist = state.wishlist.some(g => g.id === game.id);
        const gameInLibrary = state.library.find(g => g.id === game.id);
        const myRating = gameInLibrary?.myRating || 0;
        const metacriticClass = game.metacritic >= 75 ? 'high' : game.metacritic >= 50 ? 'medium' : 'low';
        const shortDescription = game.description ? (game.description.split('. ').slice(0, 3).join('. ') + '.').replace('..', '.') : 'Nessuna trama disponibile.';
        
        dom.gameDetailModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal-btn">&times;</span>
                <div class="detail-modal-header">
                    <img src="${getCoverUrl(game.cover)}" class="detail-modal-backdrop-img">
                    <div class="detail-modal-backdrop-overlay"></div>
                    <h3 class="detail-modal-title">${game.name}</h3>
                </div>
                <div class="detail-modal-body">
                    <div class="detail-info-main">
                        <h4>Trama</h4>
                        <p>${shortDescription}</p>
                        <div class="detail-modal-actions">
                            <button class="btn-primary" data-action="add-library" data-game='${JSON.stringify(game)}' ${inLibrary ? 'disabled' : ''}>${inLibrary ? 'Già in Libreria' : 'Aggiungi alla Libreria'}</button>
                            <button class="btn-secondary" data-action="add-wishlist" data-game='${JSON.stringify(game)}' ${inWishlist ? 'disabled' : ''}>${inWishlist ? 'In Wishlist' : '+ Wishlist'}</button>
                        </div>
                    </div>
                    <div class="detail-info-sidebar">
                        <div class="info-block"><strong>Piattaforme</strong><div class="platform-icons">${[...new Set(game.platforms)].map(getPlatformIcon).join('')}</div></div>
                        <div class="info-block"><strong>Sviluppatore</strong><span>${game.developers}</span></div>
                        <div class="info-block"><strong>Data di Uscita</strong><span>${new Date(game.released).toLocaleDateString('it-IT')}</span></div>
                        ${game.metacritic ? `<div class="info-block"><strong>Metascore</strong><span class="metacritic-score ${metacriticClass}">${game.metacritic}</span></div>` : ''}
                        <div class="info-block"><strong>La mia valutazione</strong><div class="rating-stars" data-game-id="${game.id}">${[1,2,3,4,5].map(i => `<i class="fa-star ${i <= myRating ? 'fas filled' : 'far'}" data-value="${i}"></i>`).join('')}</div></div>
                    </div>
                </div>
            </div>`;
        openModal(dom.gameDetailModal);
    };

    const renderGameGrid = (container, games, placeholder, removeAction) => {
        if (games.length === 0) { showPlaceholder(container, placeholder); return; }
        container.innerHTML = games.map(game => `
            <div class="game-card" data-game='${JSON.stringify(game)}'>
                ${removeAction ? `<button class="remove-btn" data-id="${game.id}" data-list="${removeAction}" title="Rimuovi"><i class="fa-solid fa-xmark"></i></button>` : ''}
                <img src="${getCoverUrl(game.cover)}" alt="${game.name}">
                <div class="game-card-info"><h4>${game.name}</h4></div>
            </div>`).join('');
    };

    const renderJournal = () => { /* ... codice invariato ... */ };
    const renderCalendar = async () => { /* ... codice invariato ... */ };

    // --- FUNZIONI API-DRIVEN ---
    const handleSearch = async () => {
        const query = dom.searchInput.value.trim();
        if (!query) return;
        openModal(dom.searchModal);
        showLoading(dom.searchResultsContainer);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            if (!response.ok) throw new Error(results.message || `Errore ${response.status}`);
            dom.searchResultsContainer.innerHTML = '';
            if (results.length === 0) { showPlaceholder(dom.searchResultsContainer, "Nessun risultato trovato."); return; }
            dom.searchResultsContainer.innerHTML = results.map(game => `
                <div class="game-card" data-game-detail='${JSON.stringify(game)}'>
                    <img src="${getCoverUrl(game.cover)}" alt="${game.name}">
                    <div class="game-card-info"><h4>${game.name}</h4></div>
                </div>`).join('');
        } catch (error) {
            showPlaceholder(dom.searchResultsContainer, `<b>Errore di Ricerca:</b><br>${error.message}.`);
        }
    };

    // --- GESTIONE EVENTI ---
    const setupEventListeners = () => {
        dom.searchBtn.addEventListener('click', handleSearch);
        dom.searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });

        dom.navLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const targetId = link.dataset.section;
                dom.pages.forEach(page => page.classList.toggle('active', page.id === targetId));
                dom.navLinks.forEach(nav => nav.classList.toggle('active', nav.dataset.section === targetId));
            });
        });

        document.body.addEventListener('click', e => {
            const target = e.target;
            if (target.classList.contains('close-modal-btn') || target.id === 'modal-backdrop') {
                closeModal();
                return;
            }

            const gameCard = target.closest('.game-card[data-game-detail], #library-grid .game-card[data-game], #wishlist-grid .game-card[data-game]');
            if (gameCard) {
                const gameData = JSON.parse(gameCard.dataset.gameDetail || gameCard.dataset.game);
                closeModal(); // Chiude eventuali modal aperti
                setTimeout(() => renderGameDetailModal(gameData), 250); // Apre quello di dettaglio
                return;
            }

            const actionBtn = target.closest('.detail-modal-actions button');
            if (actionBtn) {
                const game = JSON.parse(actionBtn.dataset.game);
                const action = actionBtn.dataset.action;
                if (action === 'add-library' && !state.library.some(g => g.id === game.id)) {
                    state.library.push(game);
                    saveStateToStorage();
                    renderLibrary();
                    actionBtn.textContent = 'Già in Libreria';
                    actionBtn.disabled = true;
                } else if (action === 'add-wishlist' && !state.wishlist.some(g => g.id === game.id)) {
                    state.wishlist.push(game);
                    saveStateToStorage();
                    renderWishlist();
                    actionBtn.textContent = 'In Wishlist';
                    actionBtn.disabled = true;
                }
                return;
            }
            
            // ... resto degli event listener per stelle, diario, etc.
        });
    };

    // --- INIZIALIZZAZIONE ---
    const initialize = () => {
        loadStateFromStorage();
        setupEventListeners();
        renderGameGrid(dom.libraryGrid, state.library, "La tua libreria è vuota.", "library");
        renderGameGrid(dom.wishlistGrid, state.wishlist, "La tua wishlist è vuota.", "wishlist");
        renderJournal();
        // Le altre chiamate a renderApiSection per upcoming, news e calendar
    };

    initialize();
});