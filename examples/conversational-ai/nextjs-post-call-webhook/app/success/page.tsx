"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Success() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="space-y-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Almost Ready!
          </h1>

          <div className="bg-gray-900 rounded-lg p-6">
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <p className="text-lg text-gray-300">
                We're creating your conversational AI agent now and will send
                you a link via email once it's ready to chat!
              </p>

              <Link href="/" className="block mt-8">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6">
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          Powered by{" "}
          <a
            href="https://elevenlabs.io/conversational-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors underline"
          >
            ElevenLabs Conversational AI
          </a>
        </div>
      </div>
    </main>
  );
}
