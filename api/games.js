export default async function handler(request, response) {
    const TWITCH_CLIENT_ID = process.env.VITE_TWITCH_CLIENT_ID;
    const TWITCH_ACCESS_TOKEN = process.env.VITE_TWITCH_ACCESS_TOKEN;

    const gameIds = request.query.id;

    if (!gameIds) {
        return response.status(400).json({ error: 'Nessun ID di gioco fornito' });
    }

    const queryString = Array.isArray(gameIds) 
        ? gameIds.map(id => `id=${id}`).join('&')
        : `id=${gameIds}`;

    const url = `https://api.twitch.tv/helix/games?${queryString}`;

    try {
        const twitchResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'Client-ID': TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${TWITCH_ACCESS_TOKEN}`,
            },
        });

        if (!twitchResponse.ok) {
            const errorData = await twitchResponse.json();
            return response.status(twitchResponse.status).json(errorData);
        }

        const data = await twitchResponse.json();
        response.status(200).json(data);

    } catch (error) {
        response.status(500).json({ error: 'Errore interno del server proxy' });
    }
}