// api/news.js
import { makeIgdbRequest } from '../utils/igdbHelper.js';

export default async function handler(request, response) {
    const body = `
        fields title, summary, image, url, published_at;
        order published_at desc;
        limit 20;
    `;

    try {
        const data = await makeIgdbRequest('pulse_articles', body);
        response.status(200).json(data);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}