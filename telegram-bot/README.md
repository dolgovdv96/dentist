# Заявки с сайта → Telegram

Сайт статический, поэтому токен бота нельзя класть в `index.html` (его увидит любой посетитель). Заявка идёт на маленький сервер-посредник (`worker.js`, бесплатный Cloudflare Worker), а он отправляет сообщение в Telegram.

## Настройка (≈10 минут)

1. **Создать бота.** В Telegram откройте `@BotFather` → `/newbot` → задайте имя → получите **токен**.
2. **Запустить бота.** Войдите в Telegram как `@mi_lena99`, найдите нового бота и нажмите **Start** (без этого бот не может писать первым).
3. **Узнать chat_id.** С того же аккаунта напишите боту `@userinfobot` — он пришлёт число `Id`. Это `CHAT_ID`.
4. **Создать Worker.** На dash.cloudflare.com → Workers & Pages → Create → Hello World → Deploy → Edit code → вставьте содержимое `worker.js`.
5. **Задать переменные** (Settings → Variables and Secrets):
   - `BOT_TOKEN` (Secret) — токен из шага 1
   - `CHAT_ID` (Secret) — id из шага 3
   - `ALLOWED_ORIGIN` — адрес сайта, например `https://example.ru`
6. **Подключить к сайту.** Скопируйте адрес Worker-а (`https://….workers.dev`) и впишите в `index.html`: `const FORM_ENDPOINT = '…'`.
7. **Проверить:** отправьте тестовую заявку с сайта — сообщение придёт в чат с ботом.

Если токен случайно попал в чужие руки — перевыпустите его в `@BotFather` (`/revoke`) и обновите секрет.
