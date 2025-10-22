document.addEventListener('DOMContentLoaded', () => {
    // --- STATO E STORAGE ---
    let state = { library: [], wishlist: [], journal: [], currentMonth: new Date() };
    const loadStateFromStorage = () => { /* ... codice invariato ... */ };
    const saveStateToStorage = () => { /* ... codice invariato ... */ };

    // --- DOM ELEMENTS ---
    const dom = { /* ... codice invariato ... */ };

    // --- FUNZIONI HELPER ---
    const getCoverUrl = (url) => url ? url.replace('media/', 'media/crop/600/400/') : 'https://placehold.co/180x240/1E1E1E/9933FF?text=N/A';
    const showLoading = (container) => container.innerHTML = '<div class="loading-spinner"></div>';
    const showPlaceholder = (container, message) => container.innerHTML = `<p class="placeholder-text">${message}</p>`;
    const openModal = (modal) => { dom.modalBackdrop.classList.add('active'); modal.classList.add('active'); };
    const closeModal = () => { document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active')); dom.modalBackdrop.classList.remove('active'); };

    const getPlatformIcon = (slug) => {
        const icons = { pc: 'fa-windows', playstation: 'fa-playstation', xbox: 'fa-xbox', nintendo: 'fa-nintendo-switch', ios: 'fa-apple', android: 'fa-android', linux: 'fa-linux' };
        return `<i class="fab ${icons[slug] || 'fa-gamepad'}"></i>`;
    };

    // --- FUNZIONI DI RENDER ---

    const renderGameDetailModal = (game) => {
        const inLibrary = state.library.some(g => g.id === game.id);
        const inWishlist = state.wishlist.some(g => g.id === game.id);
        const gameInLibrary = state.library.find(g => g.id === game.id);
        const myRating = gameInLibrary?.myRating || 0;

        const metacriticClass = game.metacritic >= 75 ? 'high' : game.metacritic >= 50 ? 'medium' : 'low';
        
        // Prende solo le prime 3-4 frasi per una trama breve.
        const shortDescription = (game.description.split('. ').slice(0, 4).join('. ') + '.').replace('..', '.');

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

    const renderLibrary = () => {
        if (state.library.length === 0) { showPlaceholder(dom.libraryGrid, "La tua libreria è vuota. Cerca un gioco per iniziare!"); return; }
        dom.libraryGrid.innerHTML = state.library.map(game => `
            <div class="game-card" data-game='${JSON.stringify(game)}'>
                <img src="${getCoverUrl(game.cover)}" alt="${game.name}">
                <div class="game-card-info"><h4>${game.name}</h4></div>
            </div>`).join('');
    };
    
    // Le altre funzioni di render (Wishlist, Journal, Upcoming, News, Calendar) rimangono invariate

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
            
            // NUOVO STILE CARD NEI RISULTATI DI RICERCA: più semplice e cliccabile
            dom.searchResultsContainer.innerHTML = results.map(game => `
                <div class="game-card" data-game-detail='${JSON.stringify(game)}'>
                    <img src="${getCoverUrl(game.cover)}" alt="${game.name}">
                    <div class="game-card-info">
                        <h4>${game.name}</h4>
                    </div>
                </div>`).join('');
        } catch (error) {
            showPlaceholder(dom.searchResultsContainer, `<b>Errore di Ricerca:</b><br>${error.message}.`);
        }
    };
    
    // --- GESTIONE EVENTI (Riscritto per il nuovo flusso) ---
    const setupEventListeners = () => {
        dom.searchBtn.addEventListener('click', handleSearch);
        dom.searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
        // ... altri listener base invariati ...

        document.body.addEventListener('click', e => {
            const target = e.target;
            if (target.classList.contains('close-modal-btn') || target.id === 'modal-backdrop') { closeModal(); return; }
            
            // CLICK SU UNA GAME CARD (NEI RISULTATI DI RICERCA O IN LIBRERIA)
            const gameCard = target.closest('.game-card');
            if (gameCard && gameCard.dataset.gameDetail) {
                const game = JSON.parse(gameCard.dataset.gameDetail);
                closeModal(); // Chiude il modal di ricerca
                setTimeout(() => renderGameDetailModal(game), 300); // Apre quello di dettaglio con un breve ritardo
                return;
            }
            if (gameCard && gameCard.dataset.game) {
                const game = JSON.parse(gameCard.dataset.game);
                renderGameDetailModal(game);
                return;
            }

            // CLICK SUI PULSANTI DI AZIONE NEL MODAL DI DETTAGLIO
            const actionBtn = target.closest('.detail-modal-actions .btn-primary, .detail-modal-actions .btn-secondary');
            if (actionBtn && actionBtn.dataset.game) {
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

            // CLICK SULLE STELLE DI VALUTAZIONE
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
                    alert("Aggiungi prima il gioco alla libreria per poterlo valutare!");
                }
            }
        });
        // ... altri listener per diario, ecc. ...
    };

    const initialize = () => { /* ... codice invariato ... */ };
    initialize();
});