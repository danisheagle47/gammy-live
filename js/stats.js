// Sistema di Statistiche e Tracking
class StatsSystem {
    constructor() {
        this.sessions = JSON.parse(localStorage.getItem('gammy-sessions')) || [];
        this.activeSession = null;
        this.sessionInterval = null;
        this.gameStats = JSON.parse(localStorage.getItem('gammy-game-stats')) || {};
    }
    
    // ==================== SESSION MANAGEMENT ====================
    
    startSession(gameId, gameName) {
        if (this.activeSession) {
            this.stopSession();
        }
        
        this.activeSession = {
            gameId,
            gameName,
            startTime: Date.now(),
            duration: 0
        };
        
        this.sessionInterval = setInterval(() => {
            this.activeSession.duration = Math.floor((Date.now() - this.activeSession.startTime) / 1000);
            this.updateSessionDisplay();
        }, 1000);
        
        return this.activeSession;
    }
    
    stopSession() {
        if (!this.activeSession) return null;
        
        clearInterval(this.sessionInterval);
        
        const session = {
            ...this.activeSession,
            endTime: Date.now(),
            date: new Date().toISOString()
        };
        
        this.sessions.push(session);
        this.updateGameStats(session);
        this.saveSessions();
        
        const completedSession = this.activeSession;
        this.activeSession = null;
        
        return completedSession;
    }
    
    updateSessionDisplay() {
        const display = document.querySelector('.session-timer');
        if (display && this.activeSession) {
            display.textContent = this.formatDuration(this.activeSession.duration);
        }
    }
    
    getActiveSession() {
        return this.activeSession;
    }
    
    // ==================== STATISTICS ====================
    
    updateGameStats(session) {
        if (!this.gameStats[session.gameId]) {
            this.gameStats[session.gameId] = {
                totalTime: 0,
                sessions: 0,
                lastPlayed: null,
                completed: false
            };
        }
        
        this.gameStats[session.gameId].totalTime += session.duration;
        this.gameStats[session.gameId].sessions += 1;
        this.gameStats[session.gameId].lastPlayed = session.date;
        
        this.saveGameStats();
    }
    
    getGameStats(gameId) {
        return this.gameStats[gameId] || {
            totalTime: 0,
            sessions: 0,
            lastPlayed: null,
            completed: false
        };
    }
    
    markGameCompleted(gameId, completed = true) {
        if (!this.gameStats[gameId]) {
            this.gameStats[gameId] = {
                totalTime: 0,
                sessions: 0,
                lastPlayed: null,
                completed: false
            };
        }
        
        this.gameStats[gameId].completed = completed;
        this.saveGameStats();
    }
    
    // ==================== GLOBAL STATISTICS ====================
    
    getTotalPlayTime() {
        return this.sessions.reduce((total, session) => total + session.duration, 0);
    }
    
    getCompletedGamesCount() {
        return Object.values(this.gameStats).filter(stat => stat.completed).length;
    }
    
    getAverageSessionTime() {
        if (this.sessions.length === 0) return 0;
        return this.getTotalPlayTime() / this.sessions.length;
    }
    
    getCurrentStreak() {
        if (this.sessions.length === 0) return 0;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streak = 0;
        let checkDate = new Date(today);
        
        while (true) {
            const dayStart = new Date(checkDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(checkDate);
            dayEnd.setHours(23, 59, 59, 999);
            
            const hasSession = this.sessions.some(session => {
                const sessionDate = new Date(session.date);
                return sessionDate >= dayStart && sessionDate <= dayEnd;
            });
            
            if (!hasSession) break;
            
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }
        
        return streak;
    }
    
    // ==================== CHART DATA ====================
    
    getChartData(period = 'week') {
        const now = new Date();
        let labels = [];
        let data = [];
        
        switch (period) {
            case 'day':
                // Ultime 24 ore per ora
                for (let i = 23; i >= 0; i--) {
                    const hour = new Date(now);
                    hour.setHours(hour.getHours() - i, 0, 0, 0);
                    labels.push(hour.getHours() + ':00');
                    
                    const hourEnd = new Date(hour);
                    hourEnd.setHours(hourEnd.getHours() + 1);
                    
                    const time = this.sessions
                        .filter(s => {
                            const sessionDate = new Date(s.date);
                            return sessionDate >= hour && sessionDate < hourEnd;
                        })
                        .reduce((sum, s) => sum + s.duration, 0);
                    
                    data.push(time / 3600); // In ore
                }
                break;
                
            case 'week':
                // Ultimi 7 giorni
                for (let i = 6; i >= 0; i--) {
                    const day = new Date(now);
                    day.setDate(day.getDate() - i);
                    day.setHours(0, 0, 0, 0);
                    
                    const dayNames = window.i18n.get('calendar.days');
                    labels.push(dayNames[day.getDay()]);
                    
                    const dayEnd = new Date(day);
                    dayEnd.setHours(23, 59, 59, 999);
                    
                    const time = this.sessions
                        .filter(s => {
                            const sessionDate = new Date(s.date);
                            return sessionDate >= day && sessionDate <= dayEnd;
                        })
                        .reduce((sum, s) => sum + s.duration, 0);
                    
                    data.push(time / 3600); // In ore
                }
                break;
                
            case 'month':
                // Ultime 4 settimane
                for (let i = 3; i >= 0; i--) {
                    const weekStart = new Date(now);
                    weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
                    weekStart.setHours(0, 0, 0, 0);
                    
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    weekEnd.setHours(23, 59, 59, 999);
                    
                    labels.push(`W${4 - i}`);
                    
                    const time = this.sessions
                        .filter(s => {
                            const sessionDate = new Date(s.date);
                            return sessionDate >= weekStart && sessionDate <= weekEnd;
                        })
                        .reduce((sum, s) => sum + s.duration, 0);
                    
                    data.push(time / 3600); // In ore
                }
                break;
                
            case 'year':
                // Ultimi 12 mesi
                for (let i = 11; i >= 0; i--) {
                    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
                    
                    const monthNames = window.i18n.get('calendar.months');
                    labels.push(monthNames[month.getMonth()].substring(0, 3));
                    
                    const time = this.sessions
                        .filter(s => {
                            const sessionDate = new Date(s.date);
                            return sessionDate >= month && sessionDate <= monthEnd;
                        })
                        .reduce((sum, s) => sum + s.duration, 0);
                    
                    data.push(time / 3600); // In ore
                }
                break;
        }
        
        return { labels, data };
    }
    
    // ==================== CALENDAR SESSIONS ====================
    
    getSessionsForDate(dateStr) {
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);
        
        return this.sessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= date && sessionDate <= dateEnd;
        });
    }
    
    // ==================== HELPERS ====================
    
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        const hoursLabel = window.i18n.get('stats.hours');
        const minutesLabel = window.i18n.get('stats.minutes');
        
        if (hours > 0) {
            return `${hours}${hoursLabel} ${minutes}${minutesLabel}`;
        }
        return `${minutes}${minutesLabel}`;
    }
    
    // ==================== STORAGE ====================
    
    saveSessions() {
        localStorage.setItem('gammy-sessions', JSON.stringify(this.sessions));
    }
    
    saveGameStats() {
        localStorage.setItem('gammy-game-stats', JSON.stringify(this.gameStats));
    }
}

window.stats = new StatsSystem();