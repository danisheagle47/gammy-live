// api/search.js
import { makeIgdbRequest } from '../utils/igdbHelper.js';

export default async function handler(request, response) {
    const query = request.query.q;

    if (!query) {
        return response.status(400).json({ error: 'Query di ricerca mancante' });
    }

    const body = `
        search "${query}";
        fields name, cover.url, first_release_date;
        limit 12;
        where cover.url != null & category = 0;
    `;

    try {
        const data = await makeIgdbRequest('games', body);
        response.status(200).json(data);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}