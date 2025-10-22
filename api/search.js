// api/search.js
import { makeIgdbRequest } from '../utils/igdbHelper.js';

export default async function handler(request, response) {
    const query = request.query.q;
    if (!query) {
        return response.status(400).json({ message: 'Query di ricerca mancante' });
    }

    // QUERY DEFINITIVA E PIÙ EFFICACE:
    // Invece di usare il campo 'search', usiamo un filtro 'where' sul nome.
    // L'operatore '~' esegue una ricerca "fuzzy" (approssimativa), che trova risultati
    // anche se la digitazione non è perfetta. È molto più affidabile.
    const body = `
        fields name, cover.url;
        where name ~ *"${query}"* & cover.url != null & category = 0;
        limit 15;
    `;

    try {
        const data = await makeIgdbRequest('games', body);
        response.status(200).json(data);
    } catch (error) {
        // Se la query fallisce, questo blocco catturerà l'errore.
        response.status(500).json({ message: error.message });
    }
}