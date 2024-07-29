# Video to Sound Effects Demo

We built this demo to show the power of the ElevenLabs Texts to Sounds Effects API. You can upload any video and add AI-generated sound effects.

How it works:

- Extracts 4 frames from the video at 1 second intervals (all client side)
- Sends the frames and a prompt to GPT-4o to create the custom Text to sound effects prompt
- Uses the prompt to create a sound effect with the [ElevenLabs Text to Sounds Effects API](https://elevenlabs.io/docs/api-reference/how-to-use-text-to-sound-effects)
- Combines the video and audio on the client side with ffmpeg.wasm for a single file to download
- Hosted on Vercel at [videotosoundeffects.com](https://www.videotosoundeffects.com/)

![Screenshot elevenlabs-video-to-sfx vercel app (Arc) 2024-06-16 at 23 32@2x](https://github.com/elevenlabs/elevenlabs-examples/assets/22766134/eaefd266-2bc1-4d51-9fe1-5316e5ee43c0)

![Screenshot elevenlabs-video-to-sfx vercel app (Arc) 2024-06-16 at 23 33@2x](https://github.com/elevenlabs/elevenlabs-examples/assets/22766134/20fba872-e8d1-4f30-92af-fcb52bab45da)



## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
