"use client";

import {
  getAgentConversation,
  getAgentConversationAudio,
} from "@/app/(main)/(santa)/actions/actions";
import { christmasFont } from "@/components/custom-fonts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShareOnXButton, CopyShareLink } from "@/components/share-buttons";
import Link from "next/link";

export function UserCard({
  video,
  conversationData,
  id,
}: {
  video: string | null;
  conversationData: any;
  id: string;
}) {
  const [audio, setAudio] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  useEffect(() => {
    // skip if video exists
    if (video) return;
    setLoadingAudio(true);
    let timeoutId: NodeJS.Timeout;
    const fetchAudio = async () => {
      try {
        const result = await getAgentConversation({ conversationId: id });
        if (result?.data?.conversation) {
          const isProcessing = result.data.conversation.status === "processing";
          if (!isProcessing) {
            const audio = await getAgentConversationAudio({
              conversationId: id,
            });
            if (audio?.data?.audio) {
              setAudio(audio.data.audio);
              setLoadingAudio(false);
            }
            return true;
          }
          return false;
        }
        return false;
      } catch (err) {
        setLoadingAudio(false);
        console.log(err);
        toast.error("Unable to fetch conversation. Please refresh the page.");
        return false;
      }
    };

    const pollConversation = async () => {
      const shouldStop = await fetchAudio();
      if (!shouldStop) {
        timeoutId = setTimeout(pollConversation, 5000);
      }
    };

    pollConversation();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [id, video]);

  return (
    <div
      className={cn(
        "mx-auto max-w-4xl",
        "relative rounded-lg",
        "p-[10px]",
        "mt-32 sm:mt-40",
        "bg-[repeating-linear-gradient(45deg,#ff0000_0px,#ff0000_10px,#ffffff_10px,#ffffff_20px)]",
        christmasFont.className
      )}
    >
      <Card className="bg-white backdrop-blur-sm rounded-lg">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-red-600 text-center">
            My Letter to Santa
          </CardTitle>
          <CardDescription className="text-xl text-gray-600 mb-2 text-center">
            From my heart to the North Pole
          </CardDescription>
          <hr className="border-t-2 border-red-300 opacity-20" />
        </CardHeader>

        <CardContent className="max-w-2xl mx-auto px-8 pt-2">
          <div className="space-y-1">
            <div className="text-4xl font-medium text-gray-800 mb-6">
              Dear Santa,
              {conversationData?.name && conversationData?.name.length > 0 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 1,
                    ease: "easeOut",
                    delay: 0.3,
                  }}
                >
                  {" "}
                  my name is{" "}
                  <span className="text-red-600 font-semibold">
                    {conversationData?.name}
                  </span>
                </motion.span>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xl text-gray-700">
                These are the presents I&apos;m wishing for:
              </p>
              <ol className="space-y-4 ml-8">
                {conversationData?.wishlist.map(
                  ({
                    name: presentName,
                    key,
                    index,
                  }: {
                    name: string;
                    key: string;
                    index: number;
                  }) => (
                    <motion.li
                      key={key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 1,
                        ease: "easeOut",
                        delay: 0.3 + index * 0.2,
                      }}
                      className="flex items-center gap-4 text-xl text-gray-800"
                    >
                      <span className="text-1xl">🎄</span>
                      <span className="text-red-600 font-bold">
                        {presentName}
                      </span>
                    </motion.li>
                  )
                )}
              </ol>
              <p className="text-xl text-gray-800 pt-4">Thank you Santa!</p>
            </div>
          </div>
        </CardContent>

        <div className="flex flex-col items-center border-t pt-6 p-4">
          {video && (
            <div className="aspect-video w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm bg-black flex items-center justify-center">
              <video
                className="h-full w-full object-contain"
                controls
                autoPlay
                muted
                playsInline
                loop
              >
                <source src={video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {loadingAudio && (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="p-1 rounded-full text-black h-10 w-10 animate-spin" />
              <span className="mt-0 text-black font-bold">
                Loading audio...
              </span>
            </div>
          )}

          {audio && (
            <div className="w-full max-w-md mb-4">
              <audio
                controls
                className="w-full"
                src={`data:audio/mpeg;base64,${audio}`}
              />
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <ShareOnXButton />
            <CopyShareLink />
          </div>

          <span className="text-gray-500 pt-4">
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
          <Link
            href="/"
            className="mt-6 px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-red-600 to-red-500 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2"
          >
            Create Your Own Letter to Santa ✨
          </Link>
        </div>
      </Card>
    </div>
  );
}
