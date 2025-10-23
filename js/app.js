// Applicazione principale
class GammyApp {
    constructor() {
        this.library = JSON.parse(localStorage.getItem('gammy-library')) || [];
        this.wishlist = JSON.parse(localStorage.getItem('gammy-wishlist')) || [];
        this.diary = JSON.parse(localStorage.getItem('gammy-diary')) || [];
        this.ratings = JSON.parse(localStorage.getItem('gammy-ratings')) || {};
        
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupSearch();
        this.setupModals();
        this.loadPage('library');
    }
    
    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                this.loadPage(page);
            });
        });
    }
    
    setupSearch() {
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        
        const performSearch = async () => {
            const query = searchInput.value.trim();
            if (!query) return;
            
            this.openModal('search-modal');
            this.showLoading('search-results');
            
            const data = await window.api.searchGames(query);
            this.displaySearchResults(data.results || []);
        };
        
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
    
    setupModals() {
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal(btn.dataset.modal);
            });
        });
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }
    
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = '';
    }
    
    showLoading(containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;
    }
    
    async loadPage(page) {
        const contentArea = document.getElementById('content-area');
        
        switch (page) {
            case 'library':
                this.renderLibrary(contentArea);
                break;
            case 'wishlist':
                this.renderWishlist(contentArea);
                break;
            case 'diary':
                this.renderDiary(contentArea);
                break;
            case 'upcoming':
                await this.renderUpcoming(contentArea);
                break;
            case 'calendar':
                await this.renderCalendar(contentArea);
                break;
            case 'news':
                await this.renderNews(contentArea);
                break;
        }
        
        window.i18n.translate();
    }
    
    renderLibrary(container) {
        const title = window.i18n.get('library.title');
        
        if (this.library.length === 0) {
            container.innerHTML = `
                <h1 class="page-title">${title}</h1>
                <div class="empty-state">
                    <div class="empty-state-icon">🎮</div>
                    <h3 data-i18n="library.empty">${window.i18n.get('library.empty')}</h3>
                    <p data-i18n="library.emptyDesc">${window.i18n.get('library.emptyDesc')}</p>
                </div>
            `;
            return;
        }
        
        const gamesHTML = this.library.map(game => this.createGameCard(game, true)).join('');
        
        container.innerHTML = `
            <h1 class="page-title">${title}</h1>
            <div class="games-grid">
                ${gamesHTML}
            </div>
        `;
    }
    
    renderWishlist(container) {
        const title = window.i18n.get('wishlist.title');
        
        if (this.wishlist.length === 0) {
            container.innerHTML = `
                <h1 class="page-title">${title}</h1>
                <div class="empty-state">
                    <div class="empty-state-icon">⭐</div>
                    <h3 data-i18n="wishlist.empty">${window.i18n.get('wishlist.empty')}</h3>
                    <p data-i18n="wishlist.emptyDesc">${window.i18n.get('wishlist.emptyDesc')}</p>
                </div>
            `;
            return;
        }
        
        const gamesHTML = this.wishlist.map(game => this.createGameCard(game, false)).join('');
        
        container.innerHTML = `
            <h1 class="page-title">${title}</h1>
            <div class="games-grid">
                ${gamesHTML}
            </div>
        `;
    }
    
    renderDiary(container) {
        const title = window.i18n.get('diary.title');
        
        container.innerHTML = `
            <h1 class="page-title">${title}</h1>
            <button class="add-diary-btn" id="add-diary-btn" data-i18n="diary.addButton">${window.i18n.get('diary.addButton')}</button>
            <div class="diary-entries" id="diary-entries"></div>
        `;
        
        document.getElementById('add-diary-btn').addEventListener('click', () => {
            this.openDiaryModal();
        });
        
        this.renderDiaryEntries();
    }
    
    renderDiaryEntries() {
        const entriesContainer = document.getElementById('diary-entries');
        
        if (this.diary.length === 0) {
            entriesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h3 data-i18n="diary.empty">${window.i18n.get('diary.empty')}</h3>
                    <p data-i18n="diary.emptyDesc">${window.i18n.get('diary.emptyDesc')}</p>
                </div>
            `;
            return;
        }
        
        const sorted = [...this.diary].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        entriesContainer.innerHTML = sorted.map(entry => `
            <div class="diary-entry">
                <div class="diary-entry-header">
                    <div>
                        <div class="diary-entry-title">${this.escapeHtml(entry.title)}</div>
                        <div class="diary-entry-game">${this.escapeHtml(entry.gameName)}</div>
                    </div>
                    <div class="diary-entry-date">${new Date(entry.date).toLocaleDateString()}</div>
                </div>
                <div class="diary-entry-content">${this.escapeHtml(entry.content)}</div>
            </div>
        `).join('');
    }
    
    openDiaryModal() {
        const select = document.getElementById('diary-game-select');
        select.innerHTML = `<option value="" data-i18n="diary.selectGame">${window.i18n.get('diary.selectGame')}</option>`;
        
        this.library.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.name;
            select.appendChild(option);
        });
        
        document.getElementById('diary-title').value = '';
        document.getElementById('diary-content').value = '';
        
        this.openModal('diary-modal');
        
        const saveBtn = document.getElementById('save-diary-btn');
        const newHandler = () => {
            this.saveDiaryEntry();
            saveBtn.removeEventListener('click', newHandler);
        };
        saveBtn.addEventListener('click', newHandler);
    }
    
    saveDiaryEntry() {
        const gameId = document.getElementById('diary-game-select').value;
        const title = document.getElementById('diary-title').value.trim();
        const content = document.getElementById('diary-content').value.trim();
        
        if (!gameId || !title || !content) {
            alert('Compila tutti i campi!');
            return;
        }
        
        const game = this.library.find(g => g.id == gameId);
        
        const entry = {
            id: Date.now(),
            gameId,
            gameName: game.name,
            title,
            content,
            date: new Date().toISOString()
        };
        
        this.diary.push(entry);
        this.saveDiary();
        this.closeModal('diary-modal');
        this.renderDiaryEntries();
    }
    
    async renderUpcoming(container) {
        const title = window.i18n.get('upcoming.title');
        
        container.innerHTML = `
            <h1 class="page-title">${title}</h1>
            <div id="upcoming-content"></div>
        `;
        
        this.showLoading('upcoming-content');
        
        const games = await window.api.getUpcomingGames();
        const upcomingContainer = document.getElementById('upcoming-content');
        
        if (!games || games.length === 0) {
            upcomingContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎯</div>
                    <h3>${window.i18n.get('common.error')}</h3>
                </div>
            `;
            return;
        }
        
        upcomingContainer.innerHTML = `
            <div class="games-grid">
                ${games.map(game => this.createGameCard(game, false)).join('')}
            </div>
        `;
    }
    
    async renderCalendar(container) {
        const now = new Date();
        this.currentMonth = now.getMonth();
        this.currentYear = now.getFullYear();
        
        container.innerHTML = `
            <h1 class="page-title">${window.i18n.get('calendar.title')}</h1>
            <div class="calendar-container">
                <div class="calendar-header">
                    <div class="calendar-title" id="calendar-title"></div>
                    <div class="calendar-nav">
                        <button id="prev-month" data-i18n="calendar.prev">${window.i18n.get('calendar.prev')}</button>
                        <button id="next-month" data-i18n="calendar.next">${window.i18n.get('calendar.next')}</button>
                    </div>
                </div>
                <div id="calendar-grid"></div>
            </div>
        `;
        
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.updateCalendar();
        });
        
        document.getElementById('next-month').addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.updateCalendar();
        });
        
        await this.updateCalendar();
    }
    
    async updateCalendar() {
        const titleEl = document.getElementById('calendar-title');
        const monthName = window.i18n.get('calendar.months')[this.currentMonth];
        titleEl.textContent = `${monthName} ${this.currentYear}`;
        
        const gridEl = document.getElementById('calendar-grid');
        gridEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        
        const games = await window.api.getCalendar(this.currentYear, this.currentMonth + 1);
        
        this.renderCalendarGrid(games);
    }
    
    renderCalendarGrid(games) {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        const days = window.i18n.get('calendar.days');
        
        let html = '<div class="calendar-grid">';
        
        // Headers
        days.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day other-month"></div>';
        }
        
        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayGames = games.filter(g => g.releaseDate && g.releaseDate.startsWith(dateStr));
            
            html += `
                <div class="calendar-day">
                    <div class="calendar-day-number">${day}</div>
                    ${dayGames.map(game => `
                        <div class="calendar-game-item" onclick="window.app.showGameDetail(${game.id})">
                            ${this.escapeHtml(game.name)}
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        html += '</div>';
        
        document.getElementById('calendar-grid').innerHTML = html;
    }
    
    async renderNews(container) {
        const title = window.i18n.get('news.title');
        
        container.innerHTML = `
            <h1 class="page-title">${title}</h1>
            <div id="news-content"></div>
        `;
        
        this.showLoading('news-content');
        
        const news = await window.api.getNews();
        const newsContainer = document.getElementById('news-content');
        
        if (!news || news.length === 0) {
            newsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📰</div>
                    <h3>${window.i18n.get('common.error')}</h3>
                </div>
            `;
            return;
        }
        
        newsContainer.innerHTML = `
            <div class="news-feed">
                ${news.map(article => `
                    <div class="news-article" onclick="window.open('${article.url}', '_blank')">
                        ${article.image ? `<img src="${article.image}" alt="${this.escapeHtml(article.title)}" class="news-image">` : ''}
                        <div class="news-content">
                            <h3 class="news-title">${this.escapeHtml(article.title)}</h3>
                            <div class="news-meta">${new Date(article.publishedAt).toLocaleDateString()}</div>
                            <p class="news-summary">${this.escapeHtml(article.summary || '')}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    createGameCard(game, showRating = false) {
        const rating = this.ratings[game.id] || 0;
        const releaseDate = game.released || game.releaseDate || window.i18n.get('gameDetail.notAvailable');
        
        return `
            <div class="game-card" onclick="window.app.showGameDetail(${game.id})">
                <img src="${game.background_image || game.cover || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                     alt="${this.escapeHtml(game.name)}" class="game-card-image" 
                     onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="game-card-content">
                    <h3 class="game-card-title">${this.escapeHtml(game.name)}</h3>
                    <div class="game-card-meta">
                        <span class="meta-badge">${releaseDate}</span>
                        ${game.metacritic ? `<span class="meta-badge">⭐ ${game.metacritic}</span>` : ''}
                    </div>
                    ${showRating && rating > 0 ? `
                        <div class="game-card-rating">
                            ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    displaySearchResults(results) {
        const container = document.getElementById('search-results');
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3 data-i18n="search.noResults">${window.i18n.get('search.noResults')}</h3>
                </div>
            `;
            return;
        }
        
        container.innerHTML = results.map(game => `
            <div class="search-result-card" onclick="window.app.showGameDetail(${game.id})">
                <img src="${game.background_image || 'https://via.placeholder.com/200x150?text=No+Image'}" 
                     alt="${this.escapeHtml(game.name)}" class="search-result-image"
                     onerror="this.src='https://via.placeholder.com/200x150?text=No+Image'">
                <div class="search-result-title">${this.escapeHtml(game.name)}</div>
            </div>
        `).join('');
    }
    
    async showGameDetail(gameId) {
        this.closeModal('search-modal');
        this.openModal('detail-modal');
        
        const container = document.getElementById('game-detail-content');
        this.showLoading('game-detail-content');
        
        const game = await window.api.getGameDetails(gameId);
        
        if (!game) {
            container.innerHTML = `<div class="empty-state"><h3>${window.i18n.get('common.error')}</h3></div>`;
            return;
        }
        
        const isInLibrary = this.library.some(g => g.id == gameId);
        const isInWishlist = this.wishlist.some(g => g.id == gameId);
        const userRating = this.ratings[gameId] || 0;
        
        // Traduci la descrizione se necessario
        let description = game.description_raw || game.summary || window.i18n.get('gameDetail.notAvailable');
        if (description !== window.i18n.get('gameDetail.notAvailable')) {
            const targetLang = window.i18n.getLang();
            description = await window.api.translateText(description, targetLang);
        }
        
        const platforms = this.getPlatformIcons(game.platforms || game.platformsList || []);
        
        container.innerHTML = `
            <div class="game-detail-hero">
                <img src="${game.background_image || game.cover || 'https://via.placeholder.com/900x400?text=No+Image'}" 
                     alt="${this.escapeHtml(game.name)}" class="game-detail-bg"
                     onerror="this.src='https://via.placeholder.com/900x400?text=No+Image'">
                <div class="game-detail-overlay">
                    <h1 class="game-detail-title">${this.escapeHtml(game.name)}</h1>
                </div>
            </div>
            <div class="game-detail-body">
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label" data-i18n="gameDetail.developer">${window.i18n.get('gameDetail.developer')}</div>
                        <div class="detail-value">${this.escapeHtml(game.developers?.[0]?.name || game.developer || window.i18n.get('gameDetail.notAvailable'))}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label" data-i18n="gameDetail.releaseDate">${window.i18n.get('gameDetail.releaseDate')}</div>
                        <div class="detail-value">${game.released || game.releaseDate || window.i18n.get('gameDetail.notAvailable')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label" data-i18n="gameDetail.platforms">${window.i18n.get('gameDetail.platforms')}</div>
                        <div class="platforms-list">${platforms}</div>
                    </div>
                    ${game.metacritic ? `
                        <div class="detail-item">
                            <div class="detail-label" data-i18n="gameDetail.metacritic">${window.i18n.get('gameDetail.metacritic')}</div>
                            <div class="detail-value">
                                <span class="metacritic-score ${this.getMetacriticClass(game.metacritic)}">${game.metacritic}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="detail-section">
                    <h3 data-i18n="gameDetail.description">${window.i18n.get('gameDetail.description')}</h3>
                    <p class="game-description">${description}</p>
                </div>
                
                ${isInLibrary ? `
                    <div class="detail-section">
                        <h3 data-i18n="gameDetail.yourRating">${window.i18n.get('gameDetail.yourRating')}</h3>
                        <div class="star-rating" data-game-id="${gameId}">
                            ${[1,2,3,4,5].map(star => `
                                <span class="star ${star <= userRating ? 'filled' : ''}" data-rating="${star}">★</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="detail-actions">
                    <button class="btn-primary" onclick="window.app.toggleLibrary(${gameId})" data-i18n="${isInLibrary ? 'gameDetail.removeFromLibrary' : 'gameDetail.addToLibrary'}">
                        ${window.i18n.get(isInLibrary ? 'gameDetail.removeFromLibrary' : 'gameDetail.addToLibrary')}
                    </button>
                    <button class="btn-secondary" onclick="window.app.toggleWishlist(${gameId})" data-i18n="${isInWishlist ? 'gameDetail.removeFromWishlist' : 'gameDetail.addToWishlist'}">
                        ${window.i18n.get(isInWishlist ? 'gameDetail.removeFromWishlist' : 'gameDetail.addToWishlist')}
                    </button>
                </div>
            </div>
        `;
        
        // Setup star rating
        if (isInLibrary) {
            document.querySelectorAll('.star-rating .star').forEach(star => {
                star.addEventListener('click', () => {
                    const rating = parseInt(star.dataset.rating);
                    this.setRating(gameId, rating);
                    
                    document.querySelectorAll('.star-rating .star').forEach((s, index) => {
                        s.classList.toggle('filled', index < rating);
                    });
                });
            });
        }
        
        // Store game data for later use
        this.currentGame = game;
    }
    
    getPlatformIcons(platforms) {
        if (!platforms || platforms.length === 0) {
            return `<span>${window.i18n.get('gameDetail.notAvailable')}</span>`;
        }
        
        const platformMap = {
            'PlayStation': 'PS',
            'Xbox': 'XB',
            'PC': 'PC',
            'Nintendo': 'NSW',
            'iOS': 'iOS',
            'Android': 'AND',
            'Linux': 'LNX',
            'Mac': 'MAC'
        };
        
        return platforms.slice(0, 6).map(p => {
            const name = p.platform?.name || p.name || p;
            let shortName = 'N/A';
            
            for (const [key, value] of Object.entries(platformMap)) {
                if (name.includes(key)) {
                    shortName = value;
                    break;
                }
            }
            
            return `<div class="platform-icon" title="${this.escapeHtml(name)}">${shortName}</div>`;
        }).join('');
    }
    
    getMetacriticClass(score) {
        if (score >= 75) return 'high';
        if (score >= 50) return 'medium';
        return 'low';
    }
    
    toggleLibrary(gameId) {
        const index = this.library.findIndex(g => g.id == gameId);
        
        if (index > -1) {
            this.library.splice(index, 1);
            delete this.ratings[gameId];
            this.saveRatings();
        } else {
            this.library.push(this.currentGame);
        }
        
        this.saveLibrary();
        this.closeModal('detail-modal');
        
        const currentPage = document.querySelector('.nav-link.active')?.dataset.page;
        if (currentPage) {
            this.loadPage(currentPage);
        }
    }
    
    toggleWishlist(gameId) {
        const index = this.wishlist.findIndex(g => g.id == gameId);
        
        if (index > -1) {
            this.wishlist.splice(index, 1);
        } else {
            this.wishlist.push(this.currentGame);
        }
        
        this.saveWishlist();
        this.closeModal('detail-modal');
        
        const currentPage = document.querySelector('.nav-link.active')?.dataset.page;
        if (currentPage) {
            this.loadPage(currentPage);
        }
    }
    
    setRating(gameId, rating) {
        this.ratings[gameId] = rating;
        this.saveRatings();
    }
    
    saveLibrary() {
        localStorage.setItem('gammy-library', JSON.stringify(this.library));
    }
    
    saveWishlist() {
        localStorage.setItem('gammy-wishlist', JSON.stringify(this.wishlist));
    }
    
    saveDiary() {
        localStorage.setItem('gammy-diary', JSON.stringify(this.diary));
    }
    
    saveRatings() {
        localStorage.setItem('gammy-ratings', JSON.stringify(this.ratings));
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inizializza l'app quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GammyApp();
});