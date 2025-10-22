document.addEventListener('DOMContentLoaded', () => {
    // --- STATO DELL'APPLICAZIONE ---
    let myLibrary = [];
    let myWishlist = [];
    let journalEntries = [];
    let currentMonth = new Date();

    // --- SELETTORI DOM ---
    const libraryGrid = document.getElementById('library-grid');
    const wishlistGrid = document.getElementById('wishlist-grid');
    const upcomingGrid = document.getElementById('upcoming-grid');
    const journalList = document.getElementById('journal-list');
    const newsFeed = document.getElementById('news-feed');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('search-modal');
    const journalModal = document.getElementById('journal-modal');
    const searchResultsContainer = document.getElementById('search-results');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const themeToggle = document.getElementById('theme-toggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const calendarContainer = document.getElementById('calendar-grid-container');
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    // --- FUNZIONI HELPER ---
    const getCoverUrl = (url, size = 'cover_big') => url ? `https:${url.replace('t_thumb', `t_${size}`)}` : 'https://placehold.co/180x240/1E1E1E/9933FF?text=N/A';
    const showLoading = (container) => container.innerHTML = '<div class="loading-spinner"></div>';
    
    // --- GESTIONE LOCAL STORAGE ---
    const loadState = () => {
        myLibrary = JSON.parse(localStorage.getItem('gammyLibrary')) || [];
        myWishlist = JSON.parse(localStorage.getItem('gammyWishlist')) || [];
        journalEntries = JSON.parse(localStorage.getItem('gammyJournal')) || [];
    };
    const saveState = () => {
        localStorage.setItem('gammyLibrary', JSON.stringify(myLibrary));
        localStorage.setItem('gammyWishlist', JSON.stringify(myWishlist));
        localStorage.setItem('gammyJournal', JSON.stringify(journalEntries));
    };

    // --- FUNZIONI DI RENDER ---
    const renderLibrary = () => {
        libraryGrid.innerHTML = '';
        if (myLibrary.length === 0) {
            libraryGrid.innerHTML = `<p style="color: var(--text-secondary); text-align: center; grid-column: 1 / -1;">La tua libreria è vuota. Cerca un gioco per iniziare!</p>`;
            return;
        }
        myLibrary.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.innerHTML = `
                <button class="remove-btn" data-id="${game.id}" title="Rimuovi dalla libreria"><i class="fa-solid fa-xmark"></i></button>
                <img src="${getCoverUrl(game.cover?.url)}" alt="${game.name}">
                <div class="game-card-info"><h4>${game.name}</h4></div>
            `;
            libraryGrid.appendChild(gameCard);
        });
    };
    
    const renderWishlist = () => {
        wishlistGrid.innerHTML = '';
        if (myWishlist.length === 0) {
            wishlistGrid.innerHTML = `<p style="color: var(--text-secondary); text-align: center; grid-column: 1 / -1;">La tua wishlist è vuota.</p>`;
            return;
        }
        myWishlist.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.innerHTML = `
                <button class="remove-btn" data-id="${game.id}" data-list="wishlist" title="Rimuovi dalla wishlist"><i class="fa-solid fa-xmark"></i></button>
                <img src="${getCoverUrl(game.cover?.url)}" alt="${game.name}">
                <div class="game-card-info"><h4>${game.name}</h4></div>
            `;
            wishlistGrid.appendChild(gameCard);
        });
    };

    const renderJournal = () => {
        journalList.innerHTML = '';
        if (journalEntries.length === 0) {
            journalList.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">Nessuna voce nel diario.</p>`;
            return;
        }
        [...journalEntries].reverse().forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'journal-entry';
            entryDiv.innerHTML = `
                <p class="journal-date">${entry.date}</p>
                <h4>${entry.title} <span class="journal-game-title">per ${entry.gameName}</span></h4>
                <p class="journal-text">${entry.notes}</p>
            `;
            journalList.appendChild(entryDiv);
        });
    };
    
    // --- FUNZIONI API-DRIVEN ---
    const handleSearch = async () => {
        const query = searchInput.value.trim();
        if (!query) return;
        openModal(searchModal);
        showLoading(searchResultsContainer);

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('La ricerca ha restituito un errore.');
            const results = await response.json();
            searchResultsContainer.innerHTML = '';
            if (results.length === 0) {
                searchResultsContainer.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">Nessun risultato trovato.</p>`;
                return;
            }
            results.forEach(game => {
                const inLibrary = myLibrary.some(libGame => libGame.id === game.id);
                const inWishlist = myWishlist.some(wishGame => wishGame.id === game.id);
                const gameCard = document.createElement('div');
                gameCard.className = 'game-card';
                gameCard.innerHTML = `
                    <img src="${getCoverUrl(game.cover?.url)}" alt="${game.name}">
                    <div class="action-overlay">
                        <button class="action-btn" data-action="add-library" data-game='${JSON.stringify(game)}' ${inLibrary ? 'disabled' : ''}>${inLibrary ? 'In Libreria' : 'Aggiungi Libreria'}</button>
                    </div>
                    <div class="game-card-info"><h4>${game.name}</h4></div>`;
                searchResultsContainer.appendChild(gameCard);
            });
        } catch (error) {
            searchResultsContainer.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">${error.message}<br>Controlla che il token API non sia scaduto.</p>`;
        }
    };

    const renderUpcoming = async () => {
        showLoading(upcomingGrid);
        try {
            const response = await fetch('/api/upcoming');
            const games = await response.json();
            upcomingGrid.innerHTML = '';
            games.forEach(game => {
                const inWishlist = myWishlist.some(wishGame => wishGame.id === game.id);
                const gameCard = document.createElement('div');
                gameCard.className = 'game-card';
                gameCard.innerHTML = `
                    <img src="${getCoverUrl(game.cover?.url)}" alt="${game.name}">
                     <div class="action-overlay">
                        <button class="action-btn" data-action="add-wishlist" data-game='${JSON.stringify(game)}' ${inWishlist ? 'disabled' : ''}>${inWishlist ? 'In Wishlist' : 'Aggiungi Wishlist'}</button>
                    </div>
                    <div class="game-card-info"><h4>${game.name}</h4></div>`;
                upcomingGrid.appendChild(gameCard);
            });
        } catch { upcomingGrid.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">Impossibile caricare i giochi in uscita.</p>`; }
    };
    
    const renderNews = async () => { /* ... identica alla versione precedente ... */ };
    const renderCalendar = async () => { /* ... identica alla versione precedente ... */ };
    
    // --- GESTIONE MODAL ---
    const openModal = (modal) => { modalBackdrop.classList.add('active'); modal.classList.add('active'); };
    const closeModal = () => { document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active')); modalBackdrop.classList.remove('active'); };

    // --- EVENT LISTENERS ---
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSearch());
    
    modalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('click', e => {
        if (e.target.classList.contains('close-modal-btn')) closeModal();
        
        const actionBtn = e.target.closest('.action-btn');
        if (actionBtn) {
            const gameData = JSON.parse(actionBtn.dataset.game);
            const action = actionBtn.dataset.action;
            if (action === 'add-library') {
                myLibrary.push(gameData);
                renderLibrary();
                closeModal();
            } else if (action === 'add-wishlist') {
                myWishlist.push(gameData);
                renderWishlist();
                actionBtn.textContent = 'In Wishlist';
                actionBtn.disabled = true;
            }
            saveState();
        }
        
        const removeBtn = e.target.closest('.remove-btn');
        if (removeBtn) {
            const gameId = parseInt(removeBtn.dataset.id);
            const listType = removeBtn.dataset.list;
            if (listType === 'wishlist') {
                if (confirm('Rimuovere dalla wishlist?')) {
                    myWishlist = myWishlist.filter(game => game.id !== gameId);
                    renderWishlist();
                }
            } else {
                if (confirm('Rimuovere dalla libreria?')) {
                    myLibrary = myLibrary.filter(game => game.id !== gameId);
                    renderLibrary();
                }
            }
            saveState();
        }
    });

    document.getElementById('add-journal-entry-btn').addEventListener('click', () => {
        const select = document.getElementById('journal-game');
        select.innerHTML = myLibrary.length > 0 ? '' : '<option disabled>Nessun gioco in libreria</option>';
        myLibrary.forEach(game => {
            select.innerHTML += `<option value="${game.id}" data-name="${game.name}">${game.name}</option>`;
        });
        openModal(journalModal);
    });

    document.getElementById('journal-form').addEventListener('submit', e => {
        e.preventDefault();
        const selectedOption = document.getElementById('journal-game').options[document.getElementById('journal-game').selectedIndex];
        const newEntry = {
            gameId: parseInt(selectedOption.value),
            gameName: selectedOption.dataset.name,
            title: document.getElementById('journal-title').value,
            notes: document.getElementById('journal-notes').value,
            date: new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
        };
        journalEntries.push(newEntry);
        saveState();
        renderJournal();
        closeModal();
        e.target.reset();
    });

    themeToggle.addEventListener('click', () => { /* ... identico ... */ });
    navLinks.forEach(link => { /* ... identico ... */ });
    prevMonthBtn.addEventListener('click', () => { /* ... identico ... */ });
    nextMonthBtn.addEventListener('click', () => { /* ... identico ... */ });

    // --- INIZIALIZZAZIONE ---
    const initialize = () => {
        if (localStorage.getItem('gammy-theme') === 'light') document.body.classList.remove('dark-theme');
        loadState();
        renderLibrary();
        renderWishlist();
        renderJournal();
        renderUpcoming();
        renderNews(); // Ho reinserito le funzioni per completezza
        renderCalendar(); // Ho reinserito le funzioni per completezza
    };

    initialize();
});