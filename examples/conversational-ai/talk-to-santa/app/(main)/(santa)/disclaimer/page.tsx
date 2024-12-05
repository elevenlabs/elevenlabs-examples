"use client";

import { christmasFont } from "@/components/custom-fonts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export default function Page() {
  return (
    <div
      className={cn(
        "mx-auto max-w-4xl",
        "relative rounded-lg",
        "p-[10px]",
        "bg-[repeating-linear-gradient(45deg,#ff0000_0px,#ff0000_10px,#ffffff_10px,#ffffff_20px)]",
        christmasFont.className
      )}
    >
      <button
        onClick={() => (window.location.href = "/")}
        className="absolute top-5 right-5 text-white bg-red-600 hover:bg-red-700 z-10 rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
      <Card className="bg-white backdrop-blur-sm rounded-lg">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-red-600 text-center">
            Important Notice
          </CardTitle>
          <hr className="border-t-2 border-gray-300 my-4" />
        </CardHeader>

        <CardContent className="max-w-2xl mx-auto px-8 py-5">
          <div className="space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              By clicking &apos;Call Santa,&apos; and each time I interact with
              this AI agent, I confirm that:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>I am over 18 or the age of majority in my jurisdiction</li>
              <li>
                I consent to the recording, storage, and sharing of my
                communications with third-party service providers, as described
                in the{" "}
                <a
                  href="https://elevenlabs.io/privacy-policy"
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                I understand that all video recordings will be deleted after 30
                days
              </li>
            </ul>
            <p className="text-gray-700 italic mt-4">
              If you do not wish to have your conversations recorded, please
              refrain from using this service.
            </p>
          </div>
        </CardContent>

        <div className="flex flex-col items-center border-t pt-6 p-4">
          <span className="text-gray-500">
            Made with{" "}
            <span role="img" aria-label="heart">
              ❤️
            </span>{" "}
            in the North Pole by{" "}
            <strong>
              <a href="https://elevenlabs.io" target="_blank">
                ElevenLabs
              </a>
            </strong>
          </span>
        </div>
      </Card>
    </div>
  );
}
