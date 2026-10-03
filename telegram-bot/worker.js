// Cloudflare Worker: принимает заявку с сайта и отправляет её в Telegram через бота.
// Токен бота и chat_id хранятся в секретах Worker-а, а не на сайте.
//
// Переменные (Settings → Variables and Secrets):
//   BOT_TOKEN       — секрет, токен от @BotFather
//   CHAT_ID         — секрет, числовой id чата с @mi_lena99 (см. README)
//   ALLOWED_ORIGIN  — адрес сайта, например https://example.ru (без слэша в конце)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
    const reply = (status, body) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return reply(405, { ok: false });
    if (env.ALLOWED_ORIGIN && origin !== env.ALLOWED_ORIGIN) return reply(403, { ok: false });

    let data;
    try { data = await request.json(); } catch { return reply(400, { ok: false }); }

    // Бот-ловушка: поле «website» у людей всегда пустое. Делаем вид, что всё хорошо.
    if (data.website) return reply(200, { ok: true });

    const name = String(data.parentName || '').trim().slice(0, 100);
    const phone = String(data.parentPhone || '').trim();
    const comment = String(data.comment || '').trim().slice(0, 1000);
    if (!name || !/^\+7\d{10}$/.test(phone)) return reply(400, { ok: false });

    const text =
      '🦷 <b>Новая заявка с сайта</b>\n\n' +
      `<b>Имя:</b> ${esc(name)}\n` +
      `<b>Телефон:</b> ${esc(phone)}\n` +
      (comment ? `<b>Комментарий:</b> ${esc(comment)}` : '<i>Комментария нет</i>');

    const tg = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text, parse_mode: 'HTML' }),
    });

    return tg.ok ? reply(200, { ok: true }) : reply(502, { ok: false });
  },
};
