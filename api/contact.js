// sends the contact form to Telegram, token stays on the server
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, message } = req.body || {};
  const clean = (v) => (typeof v === 'string' ? v.trim() : '');
  const n = clean(name), e = clean(email), m = clean(message);
  if (n.length < 2 || n.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || e.length > 255 || m.length < 10 || m.length > 1000) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const time = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const text = [
    '📬 <b>Portfoliodan yangi xabar</b>',
    '',
    `👤 <b>Ism:</b> ${esc(n)}`,
    `✉️ <b>Email:</b> ${esc(e)}`,
    `🕒 <b>Vaqt:</b> ${time}`,
    '',
    '💬 <b>Xabar:</b>',
    `<blockquote>${esc(m)}</blockquote>`,
  ].join('\n');

  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[{ text: '↩️ Emailga javob yozish', url: `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(e)}&su=${encodeURIComponent('Re: Portfolio')}` }]],
      },
    }),
  }).catch(() => null);

  if (!r || !r.ok) return res.status(502).json({ error: 'Telegram send failed' });
  res.status(200).json({ ok: true });
};
