// api/search.js
import { makeIgdbRequest } from '../utils/igdbHelper.js';

export default async function handler(request, response) {
    const query = request.query.q;
    if (!query) {
        return response.status(400).json({ message: 'Query di ricerca mancante' });
    }

    // LA QUERY PIÙ STANDARD E AFFIDABILE
    // Usa solo il campo 'search' che è fatto apposta per questo.
    // I filtri li applichiamo dopo, per non interferire con la ricerca.
    const body = `
        search "${query}";
        fields name, cover.url, category;
        limit 50;
    `;

    try {
        const data = await makeIgdbRequest('games', body);

        // Filtriamo i risultati QUI, non nella query.
        // Questo è molto più stabile.
        // Vogliamo solo giochi principali (category = 0) che abbiano una copertina.
        const filteredData = data.filter(game => game.category === 0 && game.cover);
        
        // Limitiamo a 12 risultati solo alla fine
        const limitedData = filteredData.slice(0, 12);

        response.status(200).json(limitedData);
        
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
}