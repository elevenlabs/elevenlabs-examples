import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Text to Voice || ElevenLabs",
  description: "Introducing our new Text to Voice API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col h-screen w-full items-center justify-center px-4">
          {children}
          <div
            className="absolute inset-0 bg-contain bg-no-repeat bg-bottom opacity-30 z-[-1]"
            style={{ backgroundImage: "url('/background.png')" }}
          />
        </div>
      </body>
    </html>
  );
}
