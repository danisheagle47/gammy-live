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
    const { month } = req.query; // 'YYYY-MM'
    if (!month) return res.status(400).json({ error: 'Missing month' });
    const [yy, mm] = month.split('-').map(n => parseInt(n, 10));
    const from = Math.floor(new Date(yy, mm - 1, 1).getTime() / 1000);
    const to = Math.floor(new Date(yy, mm, 1).getTime() / 1000);
    const q = `
      fields date, human, game.name, game.cover.image_id, platform.name;
      where date >= ${from} & date < ${to} & game != null;
      sort date asc;
      limit 500;
    `;
    const rows = await igdb('release_dates', q);
    const days = {};
    for (const r of rows) {
      const d = new Date(r.date * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days[key] = days[key] || [];
      days[key].push({
        name: r.game?.name,
        cover: r.game?.cover?.image_id,
        platforms: r.platform?.name ? [r.platform.name] : []
      });
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ days });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};