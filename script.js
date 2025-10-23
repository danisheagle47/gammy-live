document.addEventListener('DOMContentLoaded', () => {
    // --- DIZIONARIO PER LE TRADUZIONI ---
    const translations = {
        it: {
            my_space: 'Il Mio Spazio', library: 'Libreria', journal: 'Diario', wishlist: 'Wishlist',
            discover: 'Scopri', upcoming: 'In Uscita', calendar: 'Calendario', news: 'Notizie',
            my_library_title: 'La Mia Libreria', search_placeholder: 'Cerca un gioco...',
            journal_title: 'Diario di Gioco', new_entry: 'Nuova Voce',
            wishlist_title: 'La Mia Wishlist', upcoming_title: 'Giochi Più Attesi',
            calendar_title: 'Calendario Uscite', news_title: 'Notizie dal Mondo Gaming',
            search_results_title: 'Risultati Ricerca', new_journal_entry_title: 'Nuova Voce del Diario',
            game_label: 'Gioco:', session_title_label: 'Titolo sessione:', notes_label: 'Note:',
            add_entry_btn: 'Aggiungi Voce',
            loading: 'Caricamento...', no_results: 'Nessun risultato trovato.',
            library_empty: 'La tua libreria è vuota. Cerca un gioco per iniziare!',
            wishlist_empty: 'La tua wishlist è vuota.',
            journal_empty: 'Nessuna voce nel diario.',
            data_unavailable: 'Nessun dato da mostrare al momento.',
            error_loading_section: 'Impossibile caricare la sezione.',
            error_search: 'Errore di Ricerca:',
            error_calendar: 'Impossibile caricare il calendario.',
            plot: 'Trama', platforms: 'Piattaforme', developer: 'Sviluppatore',
            release_date: 'Data di Uscita', metascore: 'Metascore', my_rating: 'La mia valutazione',
            add_to_library: 'Aggiungi alla Libreria', already_in_library: 'Già in Libreria',
            add_to_wishlist: '+ Wishlist', in_wishlist: 'In Wishlist',
            rate_game_alert: 'Aggiungi prima il gioco alla libreria per poterlo valutare!',
            remove_from_library_confirm: 'Rimuovere questo gioco dalla libreria?',
            remove_from_wishlist_confirm: 'Rimuovere questo gioco dalla wishlist?',
        },
        en: {
            my_space: 'My Space', library: 'Library', journal: 'Journal', wishlist: 'Wishlist',
            discover: 'Discover', upcoming: 'Upcoming', calendar: 'Calendar', news: 'News',
            my_library_title: 'My Library', search_placeholder: 'Search for a game...',
            journal_title: 'Game Journal', new_entry: 'New Entry',
            wishlist_title: 'My Wishlist', upcoming_title: 'Most Anticipated',
            calendar_title: 'Release Calendar', news_title: 'Gaming News',
            search_results_title: 'Search Results', new_journal_entry_title: 'New Journal Entry',
            game_label: 'Game:', session_title_label: 'Session title:', notes_label: 'Notes:',
            add_entry_btn: 'Add Entry',
            loading: 'Loading...', no_results: 'No results found.',
            library_empty: 'Your library is empty. Search for a game to get started!',
            wishlist_empty: 'Your wishlist is empty.',
            journal_empty: 'No journal entries yet.',
            data_unavailable: 'No data to display at the moment.',
            error_loading_section: 'Could not load this section.',
            error_search: 'Search Error:',
            error_calendar: 'Could not load the calendar.',
            plot: 'Plot', platforms: 'Platforms', developer: 'Developer',
            release_date: 'Release Date', metascore: 'Metascore', my_rating: 'My Rating',
            add_to_library: 'Add to Library', already_in_library: 'Already in Library',
            add_to_wishlist: '+ Wishlist', in_wishlist: 'In Wishlist',
            rate_game_alert: 'Add the game to your library first to rate it!',
            remove_from_library_confirm: 'Remove this game from your library?',
            remove_from_wishlist_confirm: 'Remove this game from your wishlist?',
        }
    };

    // --- STATO GLOBALE DELL'APPLICAZIONE ---
    const state = {
        library: [], wishlist: [], journal: [],
        currentMonth: new Date(), lang: 'it'
    };

    // --- SELETTORI DOM ---
    const dom = {
        libraryGrid: document.getElementById('library-grid'), wishlistGrid: document.getElementById('wishlist-grid'),
        upcomingGrid: document.getElementById('upcoming-grid'), journalList: document.getElementById('journal-list'),
        newsFeed: document.getElementById('news-feed'), searchInput: document.getElementById('search-input'),
        searchBtn: document.getElementById('search-btn'), searchModal: document.getElementById('search-modal'),
        journalModal: document.getElementById('journal-modal'), gameDetailModal: document.getElementById('game-detail-modal'),
        searchResultsContainer: document.getElementById('search-results'), modalBackdrop: document.getElementById('modal-backdrop'),
        langSwitches: document.querySelectorAll('.lang-switch'), navLinks: document.querySelectorAll('.nav-link'),
        pages: document.querySelectorAll('.page'), calendarContainer: document.getElementById('calendar-grid-container'),
        calendarMonthYear: document.getElementById('calendar-month-year'), prevMonthBtn: document.getElementById('prev-month-btn'),
        nextMonthBtn: document.getElementById('next-month-btn'), addJournalBtn: document.getElementById('add-journal-entry-btn'),
        journalForm: document.getElementById('journal-form'),
    };
    
    // --- FUNZIONI HELPER E UTILITY ---
    const t = (key) => translations[state.lang][key] || key;
    const getCoverUrl = (url) => url ? url.replace('media/', 'media/crop/600/400/') : 'https://placehold.co/180x240/1A1A22/8A2BE2?text=N/A';
    const showLoading = (container) => container.innerHTML = `<div class="loading-spinner"></div>`;
    const showPlaceholder = (container, messageKey) => container.innerHTML = `<p class="placeholder-text">${t(messageKey)}</p>`;
    const openModal = (modal) => { dom.modalBackdrop.classList.add('active'); modal.classList.add('active'); };
    const closeModal = () => { document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active')); dom.modalBackdrop.classList.remove('active'); };
    const getPlatformIcon = (slug) => `<i class="fa-brands ${{'pc':'fa-windows','playstation':'fa-playstation','xbox':'fa-xbox','nintendo':'fa-nintendo-switch','ios':'fa-apple','android':'fa-android','linux':'fa-linux'}[slug] || 'fa-solid fa-gamepad'}"></i>`;

    // --- GESTIONE DATI (LocalStorage) ---
    const loadStateFromStorage = () => {
        state.library = JSON.parse(localStorage.getItem('gammyLibrary')) || [];
        state.wishlist = JSON.parse(localStorage.getItem('gammyWishlist')) || [];
        state.journal = JSON.parse(localStorage.getItem('gammyJournal')) || [];
        state.lang = localStorage.getItem('gammyLang') || 'it';
    };
    const saveStateToStorage = () => {
        localStorage.setItem('gammyLibrary', JSON.stringify(state.library));
        localStorage.setItem('gammyWishlist', JSON.stringify(state.wishlist));
        localStorage.setItem('gammyJournal', JSON.stringify(state.journal));
        localStorage.setItem('gammyLang', state.lang);
    };

    // --- LOGICA DI TRADUZIONE UI ---
    const updateStaticStrings = () => {
        document.documentElement.lang = state.lang;
        document.querySelectorAll('[data-t]').forEach(el => {
            el.textContent = t(el.dataset.t);
        });
        document.querySelectorAll('[data-t-placeholder]').forEach(el => {
            el.placeholder = t(el.dataset.tPlaceholder);
        });
        dom.langSwitches.forEach(sw => sw.classList.toggle('active', sw.dataset.lang === state.lang));
    };
    
    // --- FUNZIONI DI RENDER ---
    const renderGameGrid = (container, games, placeholderKey) => {
        if (!container) return;
        if (games.length === 0) {
            showPlaceholder(container, placeholderKey);
            return;
        }
        container.innerHTML = games.map(game => {
            const gameData = { ...game }; // Crea una copia per evitare problemi di referenza
            return `
            <div class="game-card" data-game-detail='${JSON.stringify(gameData)}'>
                <img src="${getCoverUrl(game.cover)}" alt="${game.name}">
                <div class="game-card-info"><h4>${game.name}</h4></div>
            </div>`;
        }).join('');
    };

    const renderGameDetailModal = async (game) => {
        const inLibrary = state.library.some(g => g.id === game.id);
        const inWishlist = state.wishlist.some(g => g.id === game.id);
        const gameInLibrary = state.library.find(g => g.id === game.id);
        const myRating = gameInLibrary?.myRating || 0;
        const metacriticClass = game.metacritic >= 75 ? 'high' : game.metacritic >= 50 ? 'medium' : 'low';
        
        showLoading(dom.gameDetailModal);
        openModal(dom.gameDetailModal);

        let translatedDescription = t('no_plot');
        if (game.description && game.description !== 'Nessuna descrizione disponibile.') {
            try {
                const shortDesc = game.description.split('\n')[0];
                const response = await fetch(`/api/translate?text=${encodeURIComponent(shortDesc)}&lang=${state.lang}`);
                const data = await response.json();
                translatedDescription = data.translatedText || shortDesc;
            } catch (e) {
                translatedDescription = shortDesc;
            }
        }
        
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
                        <h4>${t('plot')}</h4><p>${translatedDescription}</p>
                        <div class="detail-modal-actions">
                            <button class="btn-primary" data-action="add-library" data-game='${JSON.stringify(game)}' ${inLibrary ? 'disabled' : ''}>${inLibrary ? t('already_in_library') : t('add_to_library')}</button>
                            <button class="btn-secondary" data-action="add-wishlist" data-game='${JSON.stringify(game)}' ${inWishlist ? 'disabled' : ''}>${inWishlist ? t('in_wishlist') : t('add_to_wishlist')}</button>
                        </div>
                    </div>
                    <div class="detail-info-sidebar">
                        <div class="info-block"><strong>${t('platforms')}</strong><div class="platform-icons">${[...new Set(game.platforms)].map(getPlatformIcon).join('')}</div></div>
                        <div class="info-block"><strong>${t('developer')}</strong><span>${game.developers || 'N/D'}</span></div>
                        ${game.released ? `<div class="info-block"><strong>${t('release_date')}</strong><span>${new Date(game.released).toLocaleDateString(state.lang)}</span></div>` : ''}
                        ${game.metacritic ? `<div class="info-block"><strong>${t('metascore')}</strong><span class="metacritic-score ${metacriticClass}">${game.metacritic}</span></div>` : ''}
                        <div class="info-block"><strong>${t('my_rating')}</strong><div class="rating-stars" data-game-id="${game.id}">${[1,2,3,4,5].map(i => `<i class="fa-star ${i <= myRating ? 'fas filled' : 'far'}" data-value="${i}"></i>`).join('')}</div></div>
                    </div>
                </div>
            </div>`;
    };
    
    const renderJournal = () => {
        if (!dom.journalList) return;
        if (state.journal.length === 0) { showPlaceholder(dom.journalList, 'journal_empty'); return; }
        dom.journalList.innerHTML = [...state.journal].reverse().map(entry => `
            <div class="journal-entry">
                <p class="journal-date">${entry.date}</p>
                <h4>${entry.title} <span class="journal-game-title">per ${entry.gameName}</span></h4>
                <p class="journal-text">${entry.notes.replace(/\n/g, '<br>')}</p>
            </div>`).join('');
    };

    const renderApiSection = async (container, apiEndpoint, cardRenderer) => {
        if (!container) return;
        showLoading(container);
        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) throw new Error(t('error_loading_section'));
            const data = await response.json();
            if (data.length === 0) { showPlaceholder(container, 'data_unavailable'); return; }
            container.innerHTML = data.map(cardRenderer).join('');
        } catch (error) {
            showPlaceholder(container, `${t('error_loading_section')}: ${error.message}`);
        }
    };
    
    const renderUpcoming = () => renderApiSection(dom.upcomingGrid, '/api/upcoming', game => renderGameGrid(null, [game], '')[0]);
    const renderNews = () => renderApiSection(dom.newsFeed, '/api/news', item => `...`); // Codice news invariato
    const renderCalendar = async () => { /* ... codice invariato ... */ };

    // --- FUNZIONE API DI RICERCA ---
    const handleSearch = async () => {
        const query = dom.searchInput.value.trim();
        if (!query) return;
        openModal(dom.searchModal);
        showLoading(dom.searchResultsContainer);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            if (!response.ok) throw new Error(results.message || `Errore ${response.status}`);
            if (results.length === 0) { showPlaceholder(dom.searchResultsContainer, "no_results"); return; }
            renderGameGrid(dom.searchResultsContainer, results, "", {});
        } catch (error) {
            showPlaceholder(dom.searchResultsContainer, `<b>${t('error_search')}</b><br>${error.message}.`);
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

        dom.addJournalBtn.addEventListener('click', () => {
            const select = document.getElementById('journal-game');
            if (state.library.length > 0) {
                select.innerHTML = state.library.map(game => `<option value="${game.id}" data-name="${game.name}">${game.name}</option>`).join('');
            } else {
                select.innerHTML = `<option disabled>${t('library_empty')}</option>`;
            }
            openModal(dom.journalModal);
        });

        document.body.addEventListener('click', (e) => {
            const target = e.target;
            // Chiudi Modal
            if (target.classList.contains('close-modal-btn') || target.id === 'modal-backdrop') { closeModal(); return; }

            // Apri Dettaglio Gioco
            const gameCard = target.closest('.game-card[data-game-detail]');
            if (gameCard) {
                const gameData = JSON.parse(gameCard.dataset.gameDetail);
                renderGameDetailModal(gameData);
                return;
            }

            // Azioni nel Modal di Dettaglio
            const actionBtn = target.closest('.detail-modal-actions button[data-action]');
            if (actionBtn) {
                const game = JSON.parse(actionBtn.dataset.game);
                const action = actionBtn.dataset.action;
                if (action === 'add-library' && !state.library.some(g => g.id === game.id)) {
                    state.library.push(game);
                    saveStateToStorage();
                    renderGameGrid(dom.libraryGrid, state.library, "library_empty", {});
                    actionBtn.textContent = t('already_in_library');
                    actionBtn.disabled = true;
                } else if (action === 'add-wishlist' && !state.wishlist.some(g => g.id === game.id)) {
                    state.wishlist.push(game);
                    saveStateToStorage();
                    renderGameGrid(dom.wishlistGrid, state.wishlist, "wishlist_empty", {});
                    actionBtn.textContent = t('in_wishlist');
                    actionBtn.disabled = true;
                }
                return;
            }
            
            // Valutazione a stelle
            const star = target.closest('.rating-stars .fa-star');
            if (star) {
                const gameId = parseInt(star.parentElement.dataset.gameId);
                const rating = parseInt(star.dataset.value);
                const gameInLibrary = state.library.find(g => g.id === gameId);
                if (gameInLibrary) {
                    gameInLibrary.myRating = gameInLibrary.myRating === rating ? 0 : rating;
                    saveStateToStorage();
                    star.parentElement.querySelectorAll('.fa-star').forEach((s, i) => {
                        s.classList.toggle('filled', i < gameInLibrary.myRating);
                        s.classList.toggle('fas', i < gameInLibrary.myRating);
                        s.classList.toggle('far', i >= gameInLibrary.myRating);
                    });
                } else {
                    alert(t('rate_game_alert'));
                }
            }
        });
        
        dom.langSwitches.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const newLang = button.dataset.lang;
                if (newLang === state.lang) return;
                state.lang = newLang;
                saveStateToStorage();
                updateAllUI();
            });
        });
    };
    
    // --- FUNZIONE DI AGGIORNAMENTO GLOBALE ---
    const updateAllUI = () => {
        updateStaticStrings();
        renderGameGrid(dom.libraryGrid, state.library, 'library_empty');
        renderGameGrid(dom.wishlistGrid, state.wishlist, 'wishlist_empty');
        renderJournal();
        renderUpcoming();
        renderNews();
        renderCalendar();
    };

    // --- INIZIALIZZAZIONE ---
    const initialize = () => {
        loadStateFromStorage();
        setupEventListeners();
        updateAllUI();
    };

    initialize();
});