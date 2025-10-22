// api/search.js (VERSIONE DA DEBUG)
import { makeIgdbRequest } from '../utils/igdbHelper.js';

export default async function handler(request, response) {
    const query = request.query.q;
    if (!query) {
        return response.status(400).json({ message: 'Query di ricerca mancante' });
    }

    const body = `
        search "${query}";
        fields name, cover.url, category;
        limit 50;
    `;

    try {
        // Chiamiamo IGDB come prima
        const data = await makeIgdbRequest('games', body);

        // MODIFICA CRUCIALE:
        // Invece di filtrare, restituiamo TUTTO quello che IGDB ci ha dato,
        // aggiungendo un contatore per sapere quanti risultati grezzi sono arrivati.
        response.status(200).json({
            message: "Questa è la risposta grezza da IGDB.",
            raw_result_count: data.length,
            raw_data: data
        });
        
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
}