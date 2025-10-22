import { makeIgdbRequest } from '../utils/igdbHelper.js';
export default async function handler(request, response) {
    const body = `
        fields title, summary, image, url, published_at;
        order published_at desc;
        where image != null & summary != null;
        limit: 21;
    `;
    try {
        const data = await makeIgdbRequest('pulse_articles', body);
        // Standardizzazione dell'oggetto 'news'
        const formattedData = data.map(item => ({
            ...item,
            cover: { url: item.image ? `https:${item.image.replace('t_thumb', 't_screenshot_med')}` : null }
        }));
        response.status(200).json(formattedData);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
}