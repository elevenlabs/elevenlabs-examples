# Video to Sound Effects Demo

This is a demo we built with the ElevenLabs Texts to Sounds Effects API. It allows you to upload a video and get a download link for the sound effects.

How it works:

- Extracts 4 frames from the video at 1 second intervals
- Creates an SFX prompt by sending the frames and a prompt to GPT-4o
- Uses the prompt to create a sound effect with the ElevenLabs Text to Sounds Effects API
- When you download it, loads ffmpeg.wasm to merge the video and sound effect into a single file for you to download
- Hosted on Vercel at [https://video-to-sfx.vercel.app/](https://video-to-sfx.vercel.app/)

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
