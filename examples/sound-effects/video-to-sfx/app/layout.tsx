"use client";
import "@/app/globals.css";
import { Inter as FontSans } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import posthog from "posthog-js";

const queryClient = new QueryClient();

posthog.init("phc_Sr8tySR1UL8RrsY83xDl9AmA1fXyG2gusWsZbTPC16V", {
  api_host: "https://eu.i.posthog.com",
  person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
});

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
    <html lang="en" suppressHydrationWarning>
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
