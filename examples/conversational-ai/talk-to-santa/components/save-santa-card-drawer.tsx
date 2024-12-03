"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { Mail, Share } from "lucide-react";
import localFont from "next/font/local";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SaveSantaCardDrawerProps {
  name: string | null;
  wishlist: Array<{ key: string; name: string }>;
  conversationId: string | null;
  isOpen: boolean;
  recordedVideo: string | null;
}

const santaFont = localFont({
  src: [
    {
      path: "../app/fonts/SantasSleighFull.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../app/fonts/SantasSleighFullBold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-santa",
});

async function getConversation(conversationId: string): Promise<string> {
  const response = await fetch(`/api/get-conversation/${conversationId}`);
  if (!response.ok) {
    throw Error("Failed to get signed url");
  }
  const data = await response.json();
  return data.signedUrl;
}

export function SaveSantaCardDrawer({
  isOpen,
  name,
  wishlist,
  conversationId,
  recordedVideo,
}: SaveSantaCardDrawerProps) {
  const [isRecordedVideoLoading, setIsRecordedVideoLoading] = useState(false);
  useEffect(() => {
    if (conversationId) {
      getConversation(conversationId)
        .then(conversation => {
          console.log(conversation);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, [conversationId]);
  return (
    <>
      <Drawer open={isOpen} dismissible={false}>
        <DrawerContent
          className={cn("mx-auto max-w-4xl px-6", santaFont.className)}
        >
          <div className="container mx-auto relative">
            <DrawerHeader>
              <DrawerTitle className="text-4xl font-bold text-red-600 text-center">
                My Letter to Santa
              </DrawerTitle>
              <DrawerDescription className="text-xl text-gray-600 text-center mb-2">
                From my heart to the North Pole
              </DrawerDescription>
              <hr className="border-t-2 border-gray-300 my-4" />
            </DrawerHeader>
            <div className="max-w-2xl mx-auto bg-white px-8 py-5 rounded-lg">
              <div className="space-y-1">
                <div className="text-4xl font-medium text-gray-800 mb-6">
                  Dear Santa,
                  {name && name.length > 0 && (
                    <>
                      my name is{" "}
                      <span className="text-red-600 font-semibold">{name}</span>
                      .
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-xl text-gray-700">
                    These are the presents I&apos;m wishing for:
                  </p>
                  <ol className="space-y-4 ml-8">
                    {wishlist.map(({ name: presentName, key }) => (
                      <li
                        key={key}
                        className="flex items-center gap-4 text-xl text-gray-800"
                      >
                        <span className="text-1xl">🎄</span>
                        <span className="text-red-600 font-bold">
                          {presentName}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="text-xl text-gray-800 pt-4">Thank you Santa!</p>
                </div>
              </div>
            </div>
            {recordedVideo && (
              <motion.div
                className="mt-4 rounded-lg overflow-hidden shadow-lg max-w-md mx-auto relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {isRecordedVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                  </div>
                )}
                <video
                  src={recordedVideo}
                  controls
                  className="w-full rounded-lg"
                  style={{ maxHeight: "400px" }}
                  onLoadedData={() => setIsRecordedVideoLoading(false)}
                  onError={() => setIsRecordedVideoLoading(false)}
                />
              </motion.div>
            )}
            <DrawerFooter className="flex justify-between border-t pt-6">
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
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share /> Share
              </Button>
            </DrawerFooter>
            <div className="flex justify-center pb-4">
              <div className="flex items-center gap-2 p-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm italic">
                  North Pole Mail #{conversationId?.slice(-6)}
                </span>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
