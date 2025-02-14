# Add a sticky Audio Native Player to a Next.js Blog

This is example adds a sticky wrapper container to the Audio Native Player, allowing it to persist in the window as the user scrolls.

## Quickstart

1. Navigate to `/examples/audio-native/nextjs-sticky-player` and run `npm install`
2. Create a `.env` file at the root of this directory and add `NEXT_PUBLIC_PUBLIC_USER_ID`
3. In the [ElevenLabs dashboard](https://elevenlabs.io/app/audionative/settings), navigate to the Audio Native Embed Code and extract the `publicUserId`
4. Add this as a value to the environment variable you just created: `NEXT_PUBLIC_PUBLIC_USER_ID=[publicUserId]`
5. Use `npm run dev` to start the application
6. Start ngrok `ngrok http 3000`
7. Add the ngrok url to the "URL allowlist" in your ElevenLabs Audio Native settings.
8. Navigate to the ngrok url and click on one of the posts and you will see the audio player that sticks to the top of the page as you scroll.
