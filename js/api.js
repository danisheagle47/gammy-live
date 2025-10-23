// Gestione chiamate API
class API {
    constructor() {
        this.baseURL = '/api';
    }
    
    async searchGames(query) {
        try {
            const response = await fetch(`${this.baseURL}/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            return await response.json();
        } catch (error) {
            console.error('Search error:', error);
            return { results: [] };
        }
    }
    
    async getGameDetails(id) {
        try {
            const response = await fetch(`${this.baseURL}/game-details?id=${id}`);
            if (!response.ok) throw new Error('Failed to fetch game details');
            return await response.json();
        } catch (error) {
            console.error('Game details error:', error);
            return null;
        }
    }
    
    async getUpcomingGames() {
        try {
            const response = await fetch(`${this.baseURL}/upcoming`);
            if (!response.ok) throw new Error('Failed to fetch upcoming games');
            return await response.json();
        } catch (error) {
            console.error('Upcoming games error:', error);
            return [];
        }
    }
    
    async getCalendar(year, month) {
        try {
            const response = await fetch(`${this.baseURL}/calendar?year=${year}&month=${month}`);
            if (!response.ok) throw new Error('Failed to fetch calendar');
            return await response.json();
        } catch (error) {
            console.error('Calendar error:', error);
            return [];
        }
    }
    
    async getNews() {
        try {
            const response = await fetch(`${this.baseURL}/news`);
            if (!response.ok) throw new Error('Failed to fetch news');
            return await response.json();
        } catch (error) {
            console.error('News error:', error);
            return [];
        }
    }
    
    async translateText(text, targetLang) {
        try {
            const response = await fetch(`${this.baseURL}/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, targetLang })
            });
            if (!response.ok) throw new Error('Translation failed');
            const data = await response.json();
            return data.translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    }
}

window.api = new API();