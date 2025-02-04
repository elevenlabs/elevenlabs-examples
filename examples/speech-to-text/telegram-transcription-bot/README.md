## ElevenLabs Scribe Telegram Bot

This is a Telegram bot that uses the ElevenLabs API to transcribe voice messages, as well as audio and video files.

You can find the bot here: https://t.me/ElevenLabsScribeBot

## Configure bot

`start - Start instructions`

## Test locally

`supabase functions serve --no-verify-jwt --env-file supabase/functions/.env`
ngrok

## Deploy

1. Run `supabase link` and link your local project to your Supabase account.
2. Run `supabase db push` to push the [setup migration](./supabase/migrations/20250203045928_init.sql) to your Supabase database.
3. Run `supabase functions deploy --no-verify-jwt scribe-bot`
4. Get your Telegram token from https://t.me/BotFather
5. Run `supabase secrets set TELEGRAM_BOT_TOKEN=your_token FUNCTION_SECRET=random_secret`
6. Set your bot's webhook url to `https://<PROJECT_REFERENCE>.functions.supabase.co/telegram-bot` (Replacing `<...>` with respective values). In order to do that, run this url (in your browser, for example): `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<PROJECT_REFERENCE>.supabase.co/functions/v1/scribe-bot?secret=<FUNCTION_SECRET>`
7. That's it, go ahead and chat with your bot 🤖💬
