"use client";

import { christmasFont } from "@/components/custom-fonts";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, VideoIcon, VideoOffIcon } from "lucide-react";

interface SantaCardProps {
  name: string | null;
  wishlist: Array<{ key: string; name: string }>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  conversation: any;
  endCall: (withVideo?: boolean) => void;
}

export function SantaCard({
  isOpen,
  setIsOpen,
  name,
  wishlist,
  conversation,
  endCall,
}: SantaCardProps) {
  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="fixed bottom-8 -translate-x-1/2 z-10"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="text-white font-bold px-10 py-5 rounded-full border-red-500 border-2 bg-red-900/90 hover:bg-white/5 backdrop-blur-[16px] shadow-2xl"
              variant="default"
              size="lg"
            >
              <Mail />
              <span className="hidden sm:inline">
                Open Your Letter to Santa
              </span>
              <span className="sm:hidden">Open Letter</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent
          className={cn("mx-auto max-w-4xl px-6", christmasFont.className)}
        >
          <div className="container mx-auto">
            <DrawerHeader>
              <DrawerTitle className="text-2xl font-bold text-red-600 text-center">
                My Letter to Santa
              </DrawerTitle>
              <hr className="border-t-2 border-red-300 my-2 opacity-20" />
            </DrawerHeader>
            <div className="max-w-2xl mx-auto bg-white px-8 py-5 rounded-lg">
              <div className="space-y-1">
                <div className="text-4xl font-medium text-gray-800 mb-6">
                  Dear Santa,
                  {name && name.length > 0 && (
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
                      <span className="text-red-600 font-semibold">{name}</span>
                    </motion.span>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-xl text-gray-700">
                    These are the presents I&apos;m wishing for:
                  </p>
                  <ol className="space-y-4 ml-8">
                    {wishlist.map(({ name: presentName, key }, index) => (
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
                    ))}
                  </ol>
                  <p className="text-xl text-gray-800 pt-4">Thank you Santa!</p>
                </div>
              </div>
            </div>
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
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button
                  variant="default"
                  className="flex-1 px-4 py-2 rounded-full border-gray-500 border-2 bg-gray-900/90 hover:bg-gray-950/90 text-white backdrop-blur-[16px] shadow-2xl"
                  onClick={async () => {
                    setIsOpen(false);
                    await conversation.endSession();
                    window.location.reload();
                  }}
                >
                  Restart
                </Button>
                <Button
                  variant="default"
                  className="flex-1 px-4 py-2 rounded-full border-blue-500 border-2 bg-blue-900/90 hover:bg-blue-950/90 text-white backdrop-blur-[16px] shadow-2xl"
                  onClick={() => {
                    setIsOpen(false);
                    endCall(false);
                  }}
                >
                  Save Card without Video
                  <VideoOffIcon className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="default"
                  className="flex-1 px-4 py-2 rounded-full border-emerald-500 border-2 bg-emerald-900/90 hover:bg-emerald-950/90 text-white backdrop-blur-[16px] shadow-2xl"
                  onClick={() => {
                    setIsOpen(false);
                    endCall();
                  }}
                >
                  Save Card with Video
                  <VideoIcon className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
