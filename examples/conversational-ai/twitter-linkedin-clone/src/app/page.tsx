"use client";

import { useState } from "react";

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
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-8 text-black">AI Twin Creator</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={profileInput}
            onChange={(e) => setProfileInput(e.target.value)}
            placeholder="Enter Twitter username or LinkedIn profile URL"
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black placeholder-gray-500 text-lg"
          />
          <button
            type="submit"
            disabled={!profileInput.trim()}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-lg font-medium"
          >
            Create AI Twin
          </button>
        </form>

        <div className="text-black text-center mt-8 space-y-2">
          <p>Create an AI voice clone from social profiles</p>
        </div>
      </div>
    </div>
  );
}
