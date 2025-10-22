// api/search.js (VERSIONE FINALE E FUNZIONANTE)
import { makeIgdbRequest } from '../utils/igdbHelper.js';

export default async function handler(request, response) {
    const query = request.query.q;
    if (!query) {
        return response.status(400).json({ message: 'Query di ricerca mancante' });
    }

    // Usiamo la query standard 'search' e chiediamo a IGDB di filtrare
    // per giochi principali (category = 0) e che abbiano una copertina.
    const body = `
        search "${query}";
        fields name, cover.url;
        where category = 0 & cover != null;
        limit 20;
    `;

    try {
        const data = await makeIgdbRequest('games', body);
        response.status(200).json(data);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
}