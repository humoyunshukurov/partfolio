// sends the contact form to Telegram, token stays on the server
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, message } = req.body || {};
  const clean = (v) => (typeof v === 'string' ? v.trim() : '');
  const n = clean(name), e = clean(email), m = clean(message);
  if (n.length < 2 || n.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || e.length > 255 || m.length < 10 || m.length > 1000) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const text = `📩 Portfolio: yangi xabar\n\n👤 ${n}\n✉️ ${e}\n\n${m}`;
  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
  }).catch(() => null);

  if (!r || !r.ok) return res.status(502).json({ error: 'Telegram send failed' });
  res.status(200).json({ ok: true });
};
