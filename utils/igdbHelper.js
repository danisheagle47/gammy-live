// utils/igdbHelper.js
export async function makeIgdbRequest(endpoint, body) {
    const TWITCH_CLIENT_ID = process.env.VITE_TWITCH_CLIENT_ID;
    const TWITCH_ACCESS_TOKEN = process.env.VITE_TWITCH_ACCESS_TOKEN;

    const url = `https://api.igdb.com/v4/${endpoint}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${TWITCH_ACCESS_TOKEN}`,
            'Accept': 'application/json',
        },
        body: body,
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Errore IGDB: ${response.status} - ${errorData}`);
    }

    return await response.json();
}