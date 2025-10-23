// Applicazione principale - Gammy 2.0 con Statistiche
class GammyApp {
    constructor() {
        this.library = JSON.parse(localStorage.getItem('gammy-library')) || [];
        this.wishlist = JSON.parse(localStorage.getItem('gammy-wishlist')) || [];
        this.diary = JSON.parse(localStorage.getItem('gammy-diary')) || [];
        this.ratings = JSON.parse(localStorage.getItem('gammy-ratings')) || {};
        this.currentDiaryImages = [];
        this.currentDiaryRating = 0;
        
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
            case 'reminders':
                this.renderReminders(contentArea);
                break;
        }
        
        window.i18n.translate();
    }
    
    // ==================== LIBRARY CON STATISTICHE ====================
    
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
        
        // Statistics Section
        const totalTime = window.stats.getTotalPlayTime();
        const completedCount = window.stats.getCompletedGamesCount();
        const avgSession = window.stats.getAverageSessionTime();
        const streak = window.stats.getCurrentStreak();
        
        const statsHTML = `
            <div class="statistics-section">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-label" data-i18n="stats.totalTime">${window.i18n.get('stats.totalTime')}</div>
                        <div class="stat-value">${window.stats.formatTime(totalTime)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-label" data-i18n="stats.gamesCompleted">${window.i18n.get('stats.gamesCompleted')}</div>
                        <div class="stat-value">${completedCount}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-label" data-i18n="stats.averageSession">${window.i18n.get('stats.averageSession')}</div>
                        <div class="stat-value">${window.stats.formatTime(avgSession)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-label" data-i18n="stats.currentStreak">${window.i18n.get('stats.currentStreak')}</div>
                        <div class="stat-value">${streak} ${window.i18n.get('stats.days')}</div>
                    </div>
                </div>
                
                <!-- Chart -->
                <div class="chart-container">
                    <div class="chart-header">
                        <h3 class="chart-title" data-i18n="stats.chart">${window.i18n.get('stats.chart')}</h3>
                        <div class="chart-filters">
                            <button class="chart-filter-btn" data-period="day" data-i18n="stats.day">${window.i18n.get('stats.day')}</button>
                            <button class="chart-filter-btn active" data-period="week" data-i18n="stats.week">${window.i18n.get('stats.week')}</button>
                            <button class="chart-filter-btn" data-period="month" data-i18n="stats.month">${window.i18n.get('stats.month')}</button>
                            <button class="chart-filter-btn" data-period="year" data-i18n="stats.year">${window.i18n.get('stats.year')}</button>
                        </div>
                    </div>
                    <div class="chart-canvas" id="stats-chart"></div>
                </div>
                
                <!-- Session Tracker -->
                <div class="session-tracker">
                    <div class="tracker-header">
                        <h3 class="tracker-title" data-i18n="stats.activeSession">${window.i18n.get('stats.activeSession')}</h3>
                        <button class="start-session-btn" id="toggle-session-btn">
                            ${window.stats.getActiveSession() ? window.i18n.get('stats.stopSession') : window.i18n.get('stats.startSession')}
                        </button>
                    </div>
                    <div id="active-session-display"></div>
                </div>
            </div>
        `;
        
        const gamesHTML = this.library.map(game => this.createGameCard(game, true)).join('');
        
        container.innerHTML = `
            <h1 class="page-title">${title}</h1>
            ${statsHTML}
            <div class="games-grid">
                ${gamesHTML}
            </div>
        `;
        
        // Setup chart filters
        document.querySelectorAll('.chart-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.chart-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderChart(btn.dataset.period);
            });
        });
        
        // Setup session toggle
        document.getElementById('toggle-session-btn').addEventListener('click', () => {
            this.toggleSession();
        });
        
        // Render initial chart
        this.renderChart('week');
        this.updateActiveSessionDisplay();
    }
    
    renderChart(period = 'week') {
        const chartData = window.stats.getChartData(period);
        const container = document.getElementById('stats-chart');
        
        const maxValue = Math.max(...chartData.data, 1);
        
        const barsHTML = chartData.labels.map((label, index) => {
            const value = chartData.data[index];
            const height = (value / maxValue) * 100;
            const displayValue = value.toFixed(1);
            
            return `
                <div class="bar-item">
                    <div class="bar" style="height: ${height}%">
                        <div class="bar-value">${displayValue}h</div>
                    </div>
                    <div class="bar-label">${label}</div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = `<div class="bar-chart">${barsHTML}</div>`;
    }
    
    toggleSession() {
        const activeSession = window.stats.getActiveSession();
        
        if (activeSession) {
            // Stop session
            window.stats.stopSession();
            this.updateActiveSessionDisplay();
            document.getElementById('toggle-session-btn').textContent = window.i18n.get('stats.startSession');
            document.getElementById('toggle-session-btn').classList.remove('active');
            
            // Refresh library to update stats
            this.loadPage('library');
        } else {
            // Open session modal
            this.openSessionModal();
        }
    }
    
    openSessionModal() {
        const select = document.getElementById('session-game-select');
        select.innerHTML = `<option value="" data-i18n="stats.selectGame">${window.i18n.get('stats.selectGame')}</option>`;
        
        this.library.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.name;
            select.appendChild(option);
        });
        
        this.openModal('session-modal');
        
        const confirmBtn = document.getElementById('confirm-session-btn');
        const newHandler = () => {
            const gameId = select.value;
            const game = this.library.find(g => g.id == gameId);
            
            if (game) {
                window.stats.startSession(game.id, game.name);
                this.closeModal('session-modal');
                this.updateActiveSessionDisplay();
                document.getElementById('toggle-session-btn').textContent = window.i18n.get('stats.stopSession');
                document.getElementById('toggle-session-btn').classList.add('active');
            }
            
            confirmBtn.removeEventListener('click', newHandler);
        };
        
        confirmBtn.addEventListener('click', newHandler);
    }
    
    updateActiveSessionDisplay() {
        const container = document.getElementById('active-session-display');
        if (!container) return;
        
        const activeSession = window.stats.getActiveSession();
        
        if (!activeSession) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = `
            <div class="active-session">
                <div class="session-game">
                    <div class="session-game-name">${this.escapeHtml(activeSession.gameName)}</div>
                </div>
                <div class="session-timer">${window.stats.formatDuration(activeSession.duration)}</div>
            </div>
        `;
    }
    
    // ==================== WISHLIST ====================
    
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
    
    // ==================== DIARY ====================
    
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
                        ${entry.rating ? `<div class="diary-entry-rating">${'★'.repeat(entry.rating)}${'☆'.repeat(5 - entry.rating)}</div>` : ''}
                    </div>
                    <div>
                        <div class="diary-entry-date">${new Date(entry.date).toLocaleDateString()}</div>
                        <div class="diary-entry-actions">
                            <button class="btn-edit" onclick="window.app.editDiaryEntry(${entry.id})" data-i18n="diary.edit">${window.i18n.get('diary.edit')}</button>
                            <button class="btn-delete" onclick="window.app.deleteDiaryEntry(${entry.id})" data-i18n="diary.delete">${window.i18n.get('diary.delete')}</button>
                        </div>
                    </div>
                </div>
                <div class="diary-entry-content">${this.escapeHtml(entry.content)}</div>
                ${entry.images && entry.images.length > 0 ? `
                    <div class="diary-entry-images">
                        ${entry.images.map(img => `
                            <img src="${img}" class="diary-entry-image" onclick="window.imageUpload.openLightbox('${img}')" alt="Diary image">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
    
    openDiaryModal(editEntry = null) {
        const select = document.getElementById('diary-game-select');
        const titleInput = document.getElementById('diary-title');
        const contentInput = document.getElementById('diary-content');
        const entryIdInput = document.getElementById('diary-entry-id');
        const modalTitle = document.getElementById('diary-modal-title');
        const previewContainer = document.getElementById('diary-images-preview');
        
        // Reset
        select.innerHTML = `<option value="" data-i18n="diary.selectGame">${window.i18n.get('diary.selectGame')}</option>`;
        this.currentDiaryImages = [];
        this.currentDiaryRating = 0;
        previewContainer.innerHTML = '';
        
        // Popola giochi
        this.library.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.name;
            select.appendChild(option);
        });
        
        if (editEntry) {
            // Modalità modifica
            modalTitle.textContent = window.i18n.get('diary.editEntry');
            entryIdInput.value = editEntry.id;
            select.value = editEntry.gameId;
            titleInput.value = editEntry.title;
            contentInput.value = editEntry.content;
            this.currentDiaryRating = editEntry.rating || 0;
            this.currentDiaryImages = editEntry.images || [];
            
            // Mostra preview immagini esistenti
            if (this.currentDiaryImages.length > 0) {
                window.imageUpload.renderPreview(this.currentDiaryImages, previewContainer);
            }
        } else {
            // Modalità nuova nota
            modalTitle.textContent = window.i18n.get('diary.addEntry');
            entryIdInput.value = '';
            titleInput.value = '';
            contentInput.value = '';
        }
        
        // Setup rating stars
        this.setupDiaryRating();
        
        // Setup file input
        const fileInput = document.getElementById('diary-images');
        fileInput.value = '';
        fileInput.onchange = async () => {
            this.currentDiaryImages = await window.imageUpload.handleFileInput(
                fileInput, 
                previewContainer, 
                this.currentDiaryImages
            );
        };
        
        this.openModal('diary-modal');
        
        const saveBtn = document.getElementById('save-diary-btn');
        const newHandler = () => {
            this.saveDiaryEntry();
            saveBtn.removeEventListener('click', newHandler);
        };
        saveBtn.addEventListener('click', newHandler);
    }
    
    setupDiaryRating() {
        const stars = document.querySelectorAll('#diary-star-rating .star');
        
        // Mostra rating corrente
        stars.forEach((star, index) => {
            star.classList.toggle('filled', index < this.currentDiaryRating);
        });
        
        // Setup click handlers
        stars.forEach(star => {
            star.onclick = () => {
                this.currentDiaryRating = parseInt(star.dataset.rating);
                stars.forEach((s, index) => {
                    s.classList.toggle('filled', index < this.currentDiaryRating);
                });
            };
        });
    }
    
    saveDiaryEntry() {
        const entryId = document.getElementById('diary-entry-id').value;
        const gameId = document.getElementById('diary-game-select').value;
        const title = document.getElementById('diary-title').value.trim();
        const content = document.getElementById('diary-content').value.trim();
        
        if (!gameId || !title || !content) {
            alert('Compila tutti i campi obbligatori!');
            return;
        }
        
        const game = this.library.find(g => g.id == gameId);
        
        if (entryId) {
            // Modifica esistente
            const index = this.diary.findIndex(e => e.id == entryId);
            if (index > -1) {
                this.diary[index] = {
                    ...this.diary[index],
                    gameId,
                    gameName: game.name,
                    title,
                    content,
                    rating: this.currentDiaryRating,
                    images: this.currentDiaryImages,
                    updated: new Date().toISOString()
                };
            }
        } else {
            // Nuova nota
            const entry = {
                id: Date.now(),
                gameId,
                gameName: game.name,
                title,
                content,
                rating: this.currentDiaryRating,
                images: this.currentDiaryImages,
                date: new Date().toISOString()
            };
            this.diary.push(entry);
        }
        
        this.saveDiary();
        this.closeModal('diary-modal');
        this.renderDiaryEntries();
    }
    
    editDiaryEntry(entryId) {
        const entry = this.diary.find(e => e.id === entryId);
        if (entry) {
            this.openDiaryModal(entry);
        }
    }
    
    deleteDiaryEntry(entryId) {
        if (confirm(window.i18n.get('diary.confirmDelete'))) {
            this.diary = this.diary.filter(e => e.id !== entryId);
            this.saveDiary();
            this.renderDiaryEntries();
        }
    }
    
    // ==================== UPCOMING ====================
    
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
                ${games.map(game => this.createGameCard(game, false, true)).join('')}
            </div>
        `;
    }
    
    // ==================== CALENDAR ====================
    
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
            
            // Get sessions for this day
            const daySessions = window.stats.getSessionsForDate(dateStr);
            
            // Ordina per hype
            dayGames.sort((a, b) => (b.hypes || 0) - (a.hypes || 0));
            
            const hasGames = dayGames.length > 0;
            const hasSessions = daySessions.length > 0;
            const topGame = dayGames[0];
            
            html += `
                <div class="calendar-day ${hasGames || hasSessions ? 'has-games' : ''}" 
                     ${hasGames ? `onclick="window.app.showDayGames('${dateStr}', ${JSON.stringify(dayGames).replace(/"/g, '&quot;')})"` : ''}>
                    <div class="calendar-day-number">${day}</div>
                    
                    ${hasSessions ? `
                        <div class="calendar-session">
                            <span class="session-time">⏱️ ${window.stats.formatTime(daySessions.reduce((sum, s) => sum + s.duration, 0))}</span>
                        </div>
                        ${daySessions.length > 0 ? `
                            <div class="calendar-session">
                                🎮 ${daySessions.length} ${window.i18n.get('calendar.sessionsOnDay')}
                            </div>
                        ` : ''}
                    ` : ''}
                    
                    ${hasGames ? `
                        <div class="calendar-top-game">${this.escapeHtml(topGame.name)}</div>
                        ${dayGames.length > 1 ? `<div class="calendar-games-count">+${dayGames.length - 1} ${window.i18n.get('calendar.gamesOnDay')}</div>` : ''}
                    ` : ''}
                </div>
            `;
        }
        
        html += '</div>';
        
        document.getElementById('calendar-grid').innerHTML = html;
    }
    
    showDayGames(date, gamesJson) {
        const games = JSON.parse(gamesJson);
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString();
        
        document.getElementById('day-games-title').textContent = `${window.i18n.get('calendar.title')} - ${formattedDate}`;
        
        const content = document.getElementById('day-games-content');
        content.innerHTML = games.map(game => `
            <div class="search-result-card" onclick="window.app.showGameDetail(${game.id})">
                <img src="${game.cover || game.background_image || 'https://via.placeholder.com/200x150?text=No+Image'}" 
                     alt="${this.escapeHtml(game.name)}" class="search-result-image"
                     onerror="this.src='https://via.placeholder.com/200x150?text=No+Image'">
                <div class="search-result-title">${this.escapeHtml(game.name)}</div>
            </div>
        `).join('');
        
        this.openModal('day-games-modal');
    }
    
    // ==================== NEWS ====================
    
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
                ${news.map((article, index) => `
                    <div class="news-article ${index === 0 ? 'featured' : ''}" onclick="window.open('${article.url}', '_blank')">
                        ${article.image ? `<img src="${article.image}" alt="${this.escapeHtml(article.title)}" class="news-image">` : ''}
                        <div class="news-content">
                            <h3 class="news-title">${this.escapeHtml(article.title)}</h3>
                            <div class="news-meta">
                                <span class="news-source">${article.category || 'Gaming'}</span>
                                ${new Date(article.publishedAt).toLocaleDateString()}
                            </div>
                            <p class="news-summary">${this.escapeHtml(article.summary || '')}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // ==================== REMINDERS ====================
    
    renderReminders(container) {
        const title = window.i18n.get('reminders.title');
        const reminders = window.notifications.getReminders();
        
        if (reminders.length === 0) {
            container.innerHTML = `
                <h1 class="page-title">${title}</h1>
                <div class="empty-state">
                    <div class="empty-state-icon">🔔</div>
                    <h3 data-i18n="reminders.empty">${window.i18n.get('reminders.empty')}</h3>
                    <p data-i18n="reminders.emptyDesc">${window.i18n.get('reminders.emptyDesc')}</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <h1 class="page-title">${title}</h1>
            <div class="reminders-grid">
                ${reminders.map(reminder => {
                    const daysLeft = window.notifications.getDaysUntilRelease(reminder.releaseDate);
                    let daysText = '';
                    let isUrgent = false;
                    
                    if (daysLeft === 0) {
                        daysText = window.i18n.get('reminders.today');
                        isUrgent = true;
                    } else if (daysLeft === 1) {
                        daysText = window.i18n.get('reminders.tomorrow');
                        isUrgent = true;
                    } else if (daysLeft > 0) {
                        daysText = `${daysLeft} ${window.i18n.get('reminders.daysLeft')}`;
                    } else {
                        daysText = window.i18n.get('gameDetail.notAvailable');
                    }
                    
                    return `
                        <div class="reminder-card">
                            <button class="remove-reminder-btn" onclick="window.app.removeReminder(${reminder.gameId})" title="${window.i18n.get('reminders.remove')}">&times;</button>
                            <div class="reminder-card-header">
                                <img src="${reminder.gameImage || 'https://via.placeholder.com/80x80?text=No+Image'}" 
                                     alt="${this.escapeHtml(reminder.gameName)}" 
                                     class="reminder-game-image"
                                     onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
                                <div class="reminder-game-info">
                                    <div class="reminder-game-title">${this.escapeHtml(reminder.gameName)}</div>
                                    <div class="reminder-date">${new Date(reminder.releaseDate).toLocaleDateString()}</div>
                                    <span class="reminder-days-left ${isUrgent ? 'urgent' : ''}">${daysText}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    removeReminder(gameId) {
        window.notifications.removeReminder(gameId);
        this.renderReminders(document.getElementById('content-area'));
    }
    
    // ==================== GAME CARDS ====================
    
    createGameCard(game, showRating = false, showHype = false) {
        const rating = this.ratings[game.id] || 0;
        const releaseDate = game.released || game.releaseDate || window.i18n.get('gameDetail.notAvailable');
        const gameStats = window.stats.getGameStats(game.id);
        
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
                        ${showHype && game.hypes ? `<span class="hype-badge"><span class="hype-icon">🔥</span> ${game.hypes}</span>` : ''}
                    </div>
                    ${showRating && rating > 0 ? `
                        <div class="game-card-rating">
                            ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}
                        </div>
                    ` : ''}
                    ${showRating && gameStats.totalTime > 0 ? `
                        <div class="game-card-stats">
                            <div class="game-stat">
                                <span class="game-stat-icon">⏱️</span>
                                ${window.stats.formatTime(gameStats.totalTime)}
                            </div>
                            <div class="game-stat">
                                <span class="game-stat-icon">🎮</span>
                                ${gameStats.sessions} ${window.i18n.get('stats.sessions')}
                            </div>
                            ${gameStats.completed ? `<div class="game-stat"><span class="game-stat-icon">✅</span></div>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    // ==================== SEARCH ====================
    
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
    
    // ==================== GAME DETAIL ====================
    
    async showGameDetail(gameId) {
        this.closeModal('search-modal');
        this.closeModal('day-games-modal');
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
        const hasReminder = window.notifications.hasReminder(gameId);
        const userRating = this.ratings[gameId] || 0;
        const gameStats = window.stats.getGameStats(gameId);
        const isCompleted = gameStats.completed;
        
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
                    <button class="btn-secondary" onclick="window.app.toggleReminder(${gameId})" data-i18n="${hasReminder ? 'reminders.removeReminder' : 'reminders.addReminder'}">
                        ${hasReminder ? '🔕' : '🔔'} ${window.i18n.get(hasReminder ? 'reminders.removeReminder' : 'reminders.addReminder')}
                    </button>
                    ${isInLibrary ? `
                        <button class="btn-secondary ${isCompleted ? 'active' : ''}" onclick="window.app.toggleCompleted(${gameId})" style="${isCompleted ? 'background: #22c55e; border-color: #22c55e; color: white;' : ''}">
                            ${isCompleted ? '✅ Completato' : '⬜ Segna Completato'}
                        </button>
                    ` : ''}
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
    
    // ==================== ACTIONS ====================
    
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
    
    toggleReminder(gameId) {
        if (window.notifications.hasReminder(gameId)) {
            window.notifications.removeReminder(gameId);
        } else {
            const added = window.notifications.addReminder(this.currentGame);
            if (added) {
                alert('✅ Promemoria aggiunto!');
            }
        }
        
        // Ricarica il modal
        this.showGameDetail(gameId);
    }
    
    toggleCompleted(gameId) {
        const gameStats = window.stats.getGameStats(gameId);
        window.stats.markGameCompleted(gameId, !gameStats.completed);
        
        // Ricarica il modal
        this.showGameDetail(gameId);
        
        // Se siamo nella pagina library, aggiorna anche quella
        const currentPage = document.querySelector('.nav-link.active')?.dataset.page;
        if (currentPage === 'library') {
            setTimeout(() => {
                this.closeModal('detail-modal');
                this.loadPage('library');
            }, 300);
        }
    }
    
    setRating(gameId, rating) {
        this.ratings[gameId] = rating;
        this.saveRatings();
    }
    
    // ==================== STORAGE ====================
    
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
    
    // ==================== HELPERS ====================
    
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