// api/upcoming.js
import { makeIgdbRequest } from '../utils/igdbHelper.js';

export default async function handler(request, response) {
    const now = Math.floor(Date.now() / 1000);
    const body = `
        fields name, cover.url, first_release_date, hypes, slug, platforms.slug, metacritic;
        where first_release_date > ${now} & hypes > 50 & category = 0 & cover.url != null;
        sort hypes desc;
        limit: 12;
    `;
    try {
        const data = await makeIgdbRequest('games', body);
        const formattedData = data.map(game => ({
            id: game.id,
            name: game.name,
            slug: game.slug,
            cover: game.cover ? `https:${game.cover.url}` : null,
            platforms: game.platforms?.map(p => p.slug.split('-')[0]) || [],
            metacritic: game.metacritic,
            released: new Date(game.first_release_date * 1000).toISOString().split('T')[0],
        }));
        response.status(200).json(formattedData);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
}