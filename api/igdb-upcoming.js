async function getToken() {
  const id = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  const r = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`, { method: 'POST' });
  const j = await r.json();
  return j.access_token;
}
async function igdb(endpoint, body) {
  const token = await getToken();
  const r = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`IGDB ${endpoint} failed: ${r.status} ${text}`);
  }
  return r.json();
}

module.exports = async function (req, res) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const q = `
      fields id,name,first_release_date,platforms.name,cover.image_id,hypes;
      where first_release_date >= ${now} & hypes != null;
      sort hypes desc;
      limit 24;
    `;
    const games = await igdb('games', q);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(games);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};