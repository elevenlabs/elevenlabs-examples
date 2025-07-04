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
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl sm:text-2xl font-semibold">
            Create Your AI Twin
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Transform any social media profile into an AI conversation partner
            using ElevenLabs&apos;{" "}
            <Link
              href="https://elevenlabs.io/docs/api-reference/conversational-ai"
              rel="noopener noreferrer"
              target="_blank"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Conversational AI
            </Link>{" "}
            and voice cloning technology
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <div className="relative">
                <Input
                  id="profile-input"
                  placeholder="Enter Twitter username or LinkedIn profile URL"
                  value={profileInput}
                  onChange={e => setProfileInput(e.target.value)}
                  className="text-sm sm:text-base h-10 sm:h-11"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={!profileInput.trim()}
              className="w-full h-10 sm:h-11 text-sm sm:text-base"
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
    },
    {
      handle: "thorwebdev",
      name: "Thor 雷神",
    },
    {
      handle: "louisjoejordan",
      name: "Louis Jordan",
    },
    {
      handle: "LukeHarries_",
      name: "Luke Harries",
    },
  ];

  return (
    <div className="mt-3 sm:mt-4">
      <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 px-1">
        Try these examples:
      </p>
      <div className="overflow-x-auto -mx-3 sm:-mx-2 px-3 sm:px-2 scrollbar-hide">
        <div className="flex space-x-2 sm:space-x-3 pb-3 sm:pb-2">
          {profiles.map(profile => (
            <Link
              key={profile.handle}
              href={`/${profile.handle}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex-none flex flex-col items-start p-2.5 sm:p-3 h-auto gap-0.5 hover:bg-gray-50 transition-colors min-w-[140px] sm:min-w-[160px] touch-manipulation"
              )}
              prefetch={true}
            >
              <span className="font-medium text-gray-900 text-xs sm:text-sm">
                @{profile.handle}
              </span>
              <span className="text-gray-600 text-[10px] sm:text-xs">
                {profile.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-2 sm:hidden">
        <div className="flex space-x-1">
          <div className="w-16 h-0.5 bg-gray-300 rounded-full"></div>
          <div className="w-6 h-0.5 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
