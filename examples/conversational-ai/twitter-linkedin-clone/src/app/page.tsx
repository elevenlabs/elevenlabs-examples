"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Home() {
  const [profileInput, setProfileInput] = useState("");

  const parseProfileInput = (input: string) => {
    const trimmed = input.trim();

    // Check if it's a LinkedIn URL
    if (trimmed.includes("linkedin.com/in/")) {
      const match = trimmed.match(/linkedin\.com\/in\/([^\/\?]+)/);
      if (match) {
        return {
          type: "linkedin",
          identifier: match[1],
        };
      }
    }

    // Check if it's a Twitter/X URL
    if (trimmed.includes("x.com/") || trimmed.includes("twitter.com/")) {
      const match = trimmed.match(/(?:x\.com|twitter\.com)\/([^\/\?]+)/);
      if (match) {
        return {
          type: "twitter",
          identifier: match[1],
        };
      }
    }

    // Default to Twitter username (backward compatibility)
    const cleanUsername = trimmed.replace("@", "");
    return {
      type: "twitter",
      identifier: cleanUsername,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileInput.trim()) {
      const parsed = parseProfileInput(profileInput);
      // Use query parameter for platform type
      window.location.href = `/${parsed.identifier}?platform=${parsed.type}`;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card className="bg-white/80 backdrop-blur-[16px] shadow-xl border border-gray-200/50">
        <CardHeader className="space-y-3 pb-6 px-6 pt-8 sm:space-y-1 sm:pb-4 sm:px-6 sm:pt-6">
          <CardTitle className="text-2xl sm:text-2xl font-bold leading-tight">
            Create Your AI Twin
          </CardTitle>
          <CardDescription className="text-base sm:text-base leading-relaxed">
            Use ElevenLabs&apos;{" "}
            <Link
              href="https://elevenlabs.io/conversational-ai"
              rel="noopener noreferrer"
              target="_blank"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Conversational AI
            </Link>{" "}
            to turn a social media link into an AI twin
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8 sm:pt-2 sm:px-6 sm:pb-6">
          <form onSubmit={handleSubmit} className="grid gap-5 sm:gap-4">
            <div className="grid gap-3 sm:gap-2">
              <div className="relative">
                <Input
                  id="profile-input"
                  placeholder="Enter Twitter username or LinkedIn profile URL"
                  value={profileInput}
                  onChange={e => setProfileInput(e.target.value)}
                  className="text-base h-12 px-4 sm:text-base sm:h-11 sm:px-3"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={!profileInput.trim()}
              className="w-full h-12 text-base font-medium sm:h-11 sm:text-base"
            >
              Create AI Twin
            </Button>
            <QuickLinks />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickLinks() {
  const profiles = [
    {
      handle: "ahmedkhaleel04",
      name: "Ahmed Khaleel",
      agentId: "agent_01jzsq18nze9tbpac6jgxw5ehb",
    },
    {
      handle: "thorwebdev",
      name: "Thor 雷神",
      agentId: "agent_01jzn94m0yecvbv588rf04905g",
    },
    {
      handle: "LukeHarries_",
      name: "Luke Harries",
      agentId: "agent_01jzjybmszf789eh1h1x34hn53",
    },
  ];

  return (
    <div className="mt-4 sm:mt-3">
      <p className="text-sm text-gray-600 mb-3 font-medium sm:text-sm sm:text-gray-500 sm:mb-3 sm:px-1 sm:font-normal">
        Try these examples:
      </p>
      <div className="space-y-2 sm:hidden">
        {profiles.map(profile => (
          <Link
            key={profile.handle}
            href={`/chat/${profile.agentId}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex w-full items-center justify-between p-3 h-auto hover:bg-gray-50 transition-colors"
            )}
            prefetch={true}
          >
            <div className="flex flex-col items-start gap-0">
              <span className="font-medium text-gray-900 text-sm leading-tight">
                @{profile.handle}
              </span>
              <span className="text-gray-600 text-xs">{profile.name}</span>
            </div>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ))}
      </div>
      {/* Desktop version remains unchanged */}
      <div className="hidden sm:block overflow-x-auto -mx-2 px-2 scrollbar-hide">
        <div className="flex space-x-3 pb-2">
          {profiles.map(profile => (
            <Link
              key={profile.handle}
              href={`/chat/${profile.agentId}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex-none flex flex-col items-start p-3 h-auto gap-0.5 hover:bg-gray-50 transition-colors min-w-[160px] touch-manipulation"
              )}
              prefetch={true}
            >
              <span className="font-medium text-gray-900 text-sm">
                @{profile.handle}
              </span>
              <span className="text-gray-600 text-xs">{profile.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
