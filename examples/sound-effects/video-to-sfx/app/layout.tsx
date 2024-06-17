"use client";
import "@/app/globals.css";
import { Inter as FontSans } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import posthog from "posthog-js";

const queryClient = new QueryClient();

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "",
    person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
  });
}

import { cn } from "@/lib/utils";
import { ReactNode, useEffect } from "react";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    posthog.capture("$pageview");
  }, []);
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(GeistMono.variable)}
      style={{
        // @ts-ignore
        "--font-mono": "var(--font-geist-mono)",
      }}
    >
      <head />
      <QueryClientProvider client={queryClient}>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          {children}
        </body>
      </QueryClientProvider>
    </html>
  );
}
