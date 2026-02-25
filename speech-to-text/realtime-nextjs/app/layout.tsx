export const metadata = {
  title: "Real-Time Transcription",
  description: "Real-time microphone transcription with ElevenLabs Scribe v2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
