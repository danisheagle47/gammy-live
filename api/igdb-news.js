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
    const q = `
      fields title, url, published_at, summary;
      sort published_at desc;
      limit 30;
    `;
    const list = await igdb('pulse_articles', q);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};