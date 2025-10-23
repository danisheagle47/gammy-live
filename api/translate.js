module.exports = async function (req, res) {
  try {
    const { to = 'it' } = req.query;
    const { text } = await readJson(req);
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent('en|' + to)}`;
    const r = await fetch(url);
    const j = await r.json();
    const translation = j?.responseData?.translatedText || text;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ translation });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}