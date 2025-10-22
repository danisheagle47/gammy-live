// api/releases.js
import { makeIgdbRequest } from '../utils/igdbHelper.js';

export default async function handler(request, response) {
    const { start, end } = request.query;

    if (!start || !end) {
        return response.status(400).json({ error: 'Date di inizio e fine richieste' });
    }

    const body = `
        fields game.name, game.cover.url, platform.abbreviation, date;
        where date >= ${start} & date < ${end} & game.category = 0 & game.cover.url != null;
        sort date asc;
        limit 100;
    `;
    
    try {
        const data = await makeIgdbRequest('release_dates', body);
        response.status(200).json(data);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}