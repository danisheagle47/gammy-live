// Main Application
class GammyApp {
    constructor() {
        this.currentPage = 'library';
        this.library = JSON.parse(localStorage.getItem('gammy_library') || '[]');
        this.wishlist = JSON.parse(localStorage.getItem('gammy_wishlist') || '[]');
        this.diary = JSON.parse(localStorage.getItem('gammy_diary') || '[]');
        this.ratings = JSON.parse(localStorage.getItem('gammy_ratings') || '{}');
        
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupSearch();
        this.setupModals();
        this.setupMobileMenu();
        this.loadPage('library');
        
        // Listen for language changes
        window.addEventListener('languageChanged', () => {
            this.loadPage(this.currentPage);
        });
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
            
            this.showModal('search-modal');
            this.showLoading('search-results');
            
            const data = await apiService.searchGames(query);
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
    
    setupMobileMenu() {
        // Create mobile menu button if not exists
        if (!document.querySelector('.mobile-menu-btn')) {
            const btn = document.createElement('button');
            btn.className = 'mobile-menu-btn';
            btn.innerHTML = '☰';
            btn.style.display = 'none';
            document.body.appendChild(btn);
            
            btn.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('mobile-open');
            });
            
            // Show on mobile
            if (window.innerWidth <= 768) {
                btn.style.display = 'block';
            }
            
            window.addEventListener('resize', () => {
                btn.style.display = window.innerWidth <= 768 ? 'block' : 'none';
            });
        }
    }
    
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
    
    showLoading(containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    }
    
    async loadPage(page) {
        this.currentPage = page;
        const contentArea = document.getElementById('content-area');
        
        // Close mobile menu
        document.querySelector('.sidebar').classList.remove('mobile-open');
        
        switch(page) {
            case 'library':
                this.renderLibrary();
                break;
            case 'wishlist':
                this.renderWishlist();
                break;
            case 'diary':
                this.renderDiary();
                break;
            case 'upcoming':
                await this.renderUpcoming();
                break;
            case 'calendar':
                await this.renderCalendar();
                break;
            case 'news':
                await this.renderNews();
                break;
        }
    }
    
    renderLibrary() {
        const contentArea = document.getElementById('content-area');
        const title = i18n.get('library.title');
        
        if (this.library.length === 0) {
            contentArea.innerHTML = `
                <h2 class="page-title">${title}</h2>
                <div class="empty-state">
                    <div class="empty-state-icon">🎮</div>
                    <h3>${i18n.get('library.empty')}</h3>
                    <p>${i18n.get('library.emptyDesc')}</p>
                </div>
            `;
            return;
        }
        
        const gamesHTML = this.library.map(game => this.createGameCard(game, true)).join('');
        
        contentArea.innerHTML = `
            <h2 class="page-title">${title}</h2>
            <div class="games-grid">${gamesHTML}</div>
        `;
        
        this.attachGameCardListeners();
    }
    
    renderWishlist() {
        const contentArea = document.getElementById('content-area');
        const title = i18n.get('wishlist.title');
        
        if (this.wishlist.length === 0) {
            contentArea.innerHTML = `
                <h2 class="page-title">${title}</h2>
                <div class="empty-state">
                    <div class="empty-state-icon">⭐</div>
                    <h3>${i18n.get('wishlist.empty')}</h3>
                    <p>${i18n.get('wishlist.emptyDesc')}</p>
                </div>
            `;
            return;
        }
        
        const gamesHTML = this.wishlist.map(game => this.createGameCard(game, false)).join('');
        
        contentArea.innerHTML = `
            <h2 class="page-title">${title}</h2>
            <div class="games-grid">${gamesHTML}</div>
        `;
        
        this.attachGameCardListeners();
    }
    
    renderDiary() {
        const contentArea = document.getElementById('content-area');
        const title = i18n.get('diary.title');
        
        let addButton = document.querySelector('.add-diary-btn');
        if (!addButton) {
            addButton = document.createElement('button');
            addButton.className = 'add-diary-btn';
            addButton.innerHTML = '+';
            addButton.addEventListener('click', () => this.showDiaryModal());
            document.body.appendChild(addButton);
        }
        
        if (this.diary.length === 0) {
            contentArea.innerHTML = `
                <h2 class="page-title">${title}</h2>
                <div class="empty-state">
                    <div class="empty-state-icon">📔</div>
                    <h3>${i18n.get('diary.empty')}</h3>
                    <p>${i18n.get('diary.emptyDesc')}</p>
                </div>
            `;
            return;
        }
        
        const entriesHTML = this.diary.map(entry => `
            <div class="diary-entry">
                <div class="diary-entry-header">
                    <div>
                        <div class="diary-game-title">${entry.gameName}</div>
                        <h3 class="diary-title">${entry.title}</h3>
                    </div>
                    <div class="diary-date">${new Date(entry.date).toLocaleDateString(i18n.getLang())}</div>
                </div>
                <p class="diary-content">${entry.content}</p>
                <button class="diary-delete" data-entry-id="${entry.id}">🗑️</button>
            </div>
        `).join('');
        
        contentArea.innerHTML = `
            <h2 class="page-title">${title}</h2>
            <div class="diary-entries">${entriesHTML}</div>
        `;
        
        document.querySelectorAll('.diary-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const entryId = e.target.dataset.entryId;
                this.deleteDiaryEntry(entryId);
            });
        });
    }
    
    async renderUpcoming() {
        const contentArea = document.getElementById('content-area');
        const title = i18n.get('upcoming.title');
        
        contentArea.innerHTML = `
            <h2 class="page-title">${title}</h2>
            <div class="loading"><div class="spinner"></div></div>
        `;
        
        const games = await apiService.getUpcomingGames();
        
        if (games.length === 0) {
            contentArea.innerHTML = `
                <h2 class="page-title">${title}</h2>
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <h3>${i18n.get('search.noResults')}</h3>
                </div>
            `;
            return;
        }
        
        const gamesHTML = games.map(game => this.createGameCard(game, false)).join('');
        
        contentArea.innerHTML = `
            <h2 class="page-title">${title}</h2>
            <div class="games-grid">${gamesHTML}</div>
        `;
        
        this.attachGameCardListeners();
    }
    
    async renderCalendar() {
        const contentArea = document.getElementById('content-area');
        const title = i18n.get('calendar.title');
        const now = new Date();
        let currentYear = now.getFullYear();
        let currentMonth = now.getMonth();
        
        const renderMonth = async (year, month) => {
            const games = await apiService.getCalendar(year, month);
            const monthName = i18n.get('calendar.months')[month];
            const days = i18n.get('calendar.days');
            
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();
            
            let calendarHTML = days.map(day => 
                `<div class="calendar-day-header">${day}</div>`
            ).join('');
            
            // Previous month days
            for (let i = firstDay - 1; i >= 0; i--) {
                calendarHTML += `
                    <div class="calendar-day other-month">
                        <div class="calendar-day-number">${daysInPrevMonth - i}</div>
                    </div>
                `;
            }
            
            // Current month days
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayGames = games.filter(g => g.releaseDate && g.releaseDate.startsWith(dateStr));
                
                const gamesHTML = dayGames.slice(0, 3).map(g => 
                    `<div class="calendar-game" data-game-id="${g.id}">${g.name}</div>`
                ).join('');
                
                calendarHTML += `
                    <div class="calendar-day">
                        <div class="calendar-day-number">${day}</div>
                        ${gamesHTML}
                    </div>
                `;
            }
            
            contentArea.innerHTML = `
                <h2 class="page-title">${title}</h2>
                <div class="calendar-container">
                    <div class="calendar-header">
                        <h3>${monthName} ${year}</h3>
                        <div class="calendar-nav">
                            <button id="prev-month">←</button>
                            <button id="next-month">→</button>
                        </div>
                    </div>
                    <div class="calendar-grid">${calendarHTML}</div>
                </div>
            `;
            
            document.getElementById('prev-month').addEventListener('click', () => {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                renderMonth(currentYear, currentMonth);
            });
            
            document.getElementById('next-month').addEventListener('click', () => {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                renderMonth(currentYear, currentMonth);
            });
            
                        document.querySelectorAll('.calendar-game').forEach(el => {
                el.addEventListener('click', async () => {
                    const gameId = el.dataset.gameId;
                    await this.showGameDetails(gameId);
                });
            });
        };
        
        await renderMonth(currentYear, currentMonth);
    }
    
    async renderNews() {
        const contentArea = document.getElementById('content-area');
        const title = i18n.get('news.title');
        
        contentArea.innerHTML = `
            <h2 class="page-title">${title}</h2>
            <div class="loading"><div class="spinner"></div></div>
        `;
        
        const news = await apiService.getNews();
        
        if (news.length === 0) {
            contentArea.innerHTML = `
                <h2 class="page-title">${title}</h2>
                <div class="empty-state">
                    <div class="empty-state-icon">📰</div>
                    <h3>${i18n.get('search.noResults')}</h3>
                </div>
            `;
            return;
        }
        
        const newsHTML = news.map(item => `
            <div class="news-card" onclick="window.open('${item.url}', '_blank')">
                ${item.image ? `<img src="${item.image}" alt="${item.title}" class="news-image">` : ''}
                <div class="news-content">
                    <h3 class="news-title">${item.title}</h3>
                    <p class="news-summary">${item.summary || ''}</p>
                    <div class="news-meta">
                        <span>${new Date(item.date).toLocaleDateString(i18n.getLang())}</span>
                        <span>${item.source || ''}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        contentArea.innerHTML = `
            <h2 class="page-title">${title}</h2>
            <div class="news-grid">${newsHTML}</div>
        `;
    }
    
    displaySearchResults(results) {
        const container = document.getElementById('search-results');
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>${i18n.get('search.noResults')}</h3>
                </div>
            `;
            return;
        }
        
        const resultsHTML = results.map(game => `
            <div class="search-result-card" data-game-id="${game.id}">
                <img src="${game.background_image || game.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                     alt="${game.name}" 
                     class="search-result-image">
                <div class="search-result-title">${game.name}</div>
            </div>
        `).join('');
        
        container.innerHTML = resultsHTML;
        
        document.querySelectorAll('.search-result-card').forEach(card => {
            card.addEventListener('click', async () => {
                const gameId = card.dataset.gameId;
                this.closeModal('search-modal');
                await this.showGameDetails(gameId);
            });
        });
    }
    
    async showGameDetails(gameId) {
        this.showModal('detail-modal');
        const container = document.getElementById('game-detail-content');
        this.showLoading('game-detail-content');
        
        const game = await apiService.getGameDetails(gameId);
        
        if (!game) {
            container.innerHTML = '<div class="empty-state"><h3>Error loading game details</h3></div>';
            return;
        }
        
        // Translate description if needed
        let description = game.description || game.description_raw || '';
        if (description) {
            const descDiv = document.createElement('div');
            descDiv.innerHTML = description;
            description = descDiv.textContent || descDiv.innerText || '';
            
            // Translate to current language
            if (i18n.getLang() === 'it') {
                description = await apiService.translateText(description, 'it');
            }
        }
        
        const isInLibrary = this.library.some(g => g.id == gameId);
        const isInWishlist = this.wishlist.some(g => g.id == gameId);
        const userRating = this.ratings[gameId] || 0;
        
        const platforms = this.getPlatformIcons(game.platforms || game.parent_platforms);
        const releaseDate = game.released || game.first_release_date 
            ? new Date(game.released || game.first_release_date * 1000).toLocaleDateString(i18n.getLang())
            : 'TBA';
        
        const metacriticScore = game.metacritic || null;
        const metacriticHTML = metacriticScore ? `
            <div class="meta-item">
                <div class="meta-label">${i18n.get('game.metacritic')}</div>
                <div class="meta-value">
                    <span class="metacritic-score ${this.getMetacriticClass(metacriticScore)}">
                        ${metacriticScore}
                    </span>
                </div>
            </div>
        ` : '';
        
        container.innerHTML = `
            <div class="game-detail-header">
                <img src="${game.background_image || game.cover?.url || 'https://via.placeholder.com/800x400?text=No+Image'}" 
                     alt="${game.name}" 
                     class="game-detail-bg">
                <div class="game-detail-overlay">
                    <h2 class="game-detail-title">${game.name}</h2>
                </div>
            </div>
            <div class="game-detail-body">
                <div class="detail-meta">
                    <div class="meta-item">
                        <div class="meta-label">${i18n.get('game.releaseDate')}</div>
                        <div class="meta-value">${releaseDate}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">${i18n.get('game.developer')}</div>
                        <div class="meta-value">${game.developers?.[0]?.name || game.involved_companies?.[0]?.company?.name || 'N/A'}</div>
                    </div>
                    ${metacriticHTML}
                    <div class="meta-item">
                        <div class="meta-label">${i18n.get('game.platforms')}</div>
                        <div class="platforms-list">${platforms}</div>
                    </div>
                </div>
                
                ${isInLibrary ? `
                    <div class="detail-section">
                        <h3>${i18n.get('game.yourRating')}</h3>
                        <div class="rating-stars" data-game-id="${gameId}">
                            ${this.createStarRating(userRating, gameId)}
                        </div>
                    </div>
                ` : ''}
                
                ${description ? `
                    <div class="detail-section">
                        <h3>${i18n.get('game.description')}</h3>
                        <p>${description}</p>
                    </div>
                ` : ''}
                
                <div class="detail-actions">
                    <button class="btn-primary ${isInLibrary ? 'in-library' : ''}" 
                            id="toggle-library" 
                            data-game='${JSON.stringify(this.simplifyGameData(game))}'>
                        ${isInLibrary ? i18n.get('game.removeFromLibrary') : i18n.get('game.addToLibrary')}
                    </button>
                    <button class="btn-secondary ${isInWishlist ? 'in-wishlist' : ''}" 
                            id="toggle-wishlist"
                            data-game='${JSON.stringify(this.simplifyGameData(game))}'>
                        ${isInWishlist ? i18n.get('game.removeFromWishlist') : i18n.get('game.addToWishlist')}
                    </button>
                </div>
            </div>
        `;
        
        // Attach event listeners
        document.getElementById('toggle-library').addEventListener('click', (e) => {
            const gameData = JSON.parse(e.target.dataset.game);
            this.toggleLibrary(gameData);
            this.closeModal('detail-modal');
        });
        
        document.getElementById('toggle-wishlist').addEventListener('click', (e) => {
            const gameData = JSON.parse(e.target.dataset.game);
            this.toggleWishlist(gameData);
            this.closeModal('detail-modal');
        });
        
        if (isInLibrary) {
            this.attachRatingListeners(gameId);
        }
    }
    
    createGameCard(game, showRating = false) {
        const releaseDate = game.released || game.releaseDate 
            ? new Date(game.released || game.releaseDate).getFullYear()
            : 'TBA';
        
        const rating = showRating && this.ratings[game.id] 
            ? `<div class="meta-badge">⭐ ${this.ratings[game.id]}/5</div>` 
            : '';
        
        return `
            <div class="game-card" data-game-id="${game.id}">
                <img src="${game.background_image || game.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                     alt="${game.name}" 
                     class="game-card-image">
                <div class="game-card-content">
                    <h3 class="game-card-title">${game.name}</h3>
                    <div class="game-card-meta">
                        <span class="meta-badge">${releaseDate}</span>
                        ${rating}
                    </div>
                </div>
            </div>
        `;
    }
    
    attachGameCardListeners() {
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', async () => {
                const gameId = card.dataset.gameId;
                await this.showGameDetails(gameId);
            });
        });
    }
    
    createStarRating(rating, gameId) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<span class="star ${i <= rating ? 'active' : ''}" data-rating="${i}">★</span>`;
        }
        return stars;
    }
    
    attachRatingListeners(gameId) {
        document.querySelectorAll('.rating-stars .star').forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                this.setRating(gameId, rating);
                
                // Update visual
                document.querySelectorAll('.rating-stars .star').forEach(s => {
                    s.classList.toggle('active', parseInt(s.dataset.rating) <= rating);
                });
            });
        });
    }
    
    setRating(gameId, rating) {
        this.ratings[gameId] = rating;
        localStorage.setItem('gammy_ratings', JSON.stringify(this.ratings));
    }
    
    getPlatformIcons(platforms) {
        if (!platforms) return '';
        
        const iconMap = {
            'playstation': '🎮',
            'xbox': '🎮',
            'pc': '💻',
            'nintendo': '🎮',
            'mac': '🖥️',
            'linux': '🐧',
            'ios': '📱',
            'android': '📱'
        };
        
        const platformNames = platforms.map(p => {
            const name = (p.platform?.name || p.name || '').toLowerCase();
            for (const key in iconMap) {
                if (name.includes(key)) {
                    return `<div class="platform-icon" title="${p.platform?.name || p.name}">${iconMap[key]}</div>`;
                }
            }
            return '';
        }).filter(p => p);
        
        return [...new Set(platformNames)].join('');
    }
    
    getMetacriticClass(score) {
        if (score >= 75) return 'score-high';
        if (score >= 50) return 'score-medium';
        return 'score-low';
    }
    
    simplifyGameData(game) {
        return {
            id: game.id,
            name: game.name,
            background_image: game.background_image || game.cover?.url,
            released: game.released || game.first_release_date,
            platforms: game.platforms || game.parent_platforms
        };
    }
    
    toggleLibrary(game) {
        const index = this.library.findIndex(g => g.id == game.id);
        
        if (index > -1) {
            this.library.splice(index, 1);
            delete this.ratings[game.id];
            localStorage.setItem('gammy_ratings', JSON.stringify(this.ratings));
        } else {
            this.library.push(game);
        }
        
        localStorage.setItem('gammy_library', JSON.stringify(this.library));
        
        if (this.currentPage === 'library') {
            this.renderLibrary();
        }
    }
    
    toggleWishlist(game) {
        const index = this.wishlist.findIndex(g => g.id == game.id);
        
        if (index > -1) {
            this.wishlist.splice(index, 1);
        } else {
            this.wishlist.push(game);
        }
        
        localStorage.setItem('gammy_wishlist', JSON.stringify(this.wishlist));
        
        if (this.currentPage === 'wishlist') {
            this.renderWishlist();
        }
    }
    
    showDiaryModal() {
        const select = document.getElementById('diary-game-select');
        
        // Populate game select
        select.innerHTML = `<option value="">${i18n.get('diary.selectGame')}</option>`;
        this.library.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.name;
            option.dataset.gameName = game.name;
            select.appendChild(option);
        });
        
        // Clear form
        document.getElementById('diary-title').value = '';
        document.getElementById('diary-content').value = '';
        
        this.showModal('diary-modal');
        
        // Setup save button
        const saveBtn = document.getElementById('save-diary-btn');
        const newHandler = () => {
            const gameId = select.value;
            const gameName = select.selectedOptions[0]?.dataset.gameName || '';
            const title = document.getElementById('diary-title').value;
            const content = document.getElementById('diary-content').value;
            
            if (!gameId || !title || !content) {
                alert('Please fill all fields');
                return;
            }
            
            this.addDiaryEntry(gameId, gameName, title, content);
            this.closeModal('diary-modal');
        };
        
        saveBtn.replaceWith(saveBtn.cloneNode(true));
        document.getElementById('save-diary-btn').addEventListener('click', newHandler);
    }
    
    addDiaryEntry(gameId, gameName, title, content) {
        const entry = {
            id: Date.now().toString(),
            gameId,
            gameName,
            title,
            content,
            date: new Date().toISOString()
        };
        
                this.diary.unshift(entry);
        localStorage.setItem('gammy_diary', JSON.stringify(this.diary));
        
        if (this.currentPage === 'diary') {
            this.renderDiary();
        }
    }
    
    deleteDiaryEntry(entryId) {
        if (!confirm('Are you sure you want to delete this entry?')) return;
        
        this.diary = this.diary.filter(e => e.id !== entryId);
        localStorage.setItem('gammy_diary', JSON.stringify(this.diary));
        this.renderDiary();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new GammyApp();
});