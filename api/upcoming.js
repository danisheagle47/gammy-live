import { makeIgdbRequest } from '../utils/igdbHelper.js';
export default async function handler(request, response) {
    const now = Math.floor(Date.now() / 1000);
    const body = `
        fields name, cover.url, first_release_date, hypes;
        where first_release_date > ${now} & hypes > 50 & category = 0 & cover.url != null;
        sort hypes desc;
        limit: 12;
    `;
    try {
        const data = await makeIgdbRequest('games', body);
        // Standardizzazione dell'oggetto 'game'
        const formattedData = data.map(game => ({
            ...game,
            cover: { url: game.cover.url ? `https:${game.cover.url}` : null }
        }));
        response.status(200).json(formattedData);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
}