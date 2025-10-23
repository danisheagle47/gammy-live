// API Service per chiamate al backend
class APIService {
    constructor() {
        this.baseURL = window.location.origin;
    }
    
    async searchGames(query) {
        try {
            const response = await fetch(`${this.baseURL}/api/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            return await response.json();
        } catch (error) {
            console.error('Search error:', error);
            return { results: [] };
        }
    }
    
    async getGameDetails(gameId) {
        try {
            const response = await fetch(`${this.baseURL}/api/game-details?id=${gameId}`);
            if (!response.ok) throw new Error('Failed to fetch game details');
            return await response.json();
        } catch (error) {
            console.error('Game details error:', error);
            return null;
        }
    }
    
    async getUpcomingGames() {
        try {
            const response = await fetch(`${this.baseURL}/api/upcoming`);
            if (!response.ok) throw new Error('Failed to fetch upcoming games');
            return await response.json();
        } catch (error) {
            console.error('Upcoming games error:', error);
            return [];
        }
    }
    
    async getCalendar(year, month) {
        try {
            const response = await fetch(`${this.baseURL}/api/calendar?year=${year}&month=${month}`);
            if (!response.ok) throw new Error('Failed to fetch calendar');
            return await response.json();
        } catch (error) {
            console.error('Calendar error:', error);
            return [];
        }
    }
    
    async getNews() {
        try {
            const response = await fetch(`${this.baseURL}/api/news`);
            if (!response.ok) throw new Error('Failed to fetch news');
            return await response.json();
        } catch (error) {
            console.error('News error:', error);
            return [];
        }
    }
    
    async translateText(text, targetLang) {
        try {
            const response = await fetch(`${this.baseURL}/api/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, targetLang })
            });
            if (!response.ok) throw new Error('Translation failed');
            const data = await response.json();
            return data.translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Return original text if translation fails
        }
    }
}

const apiService = new APIService();