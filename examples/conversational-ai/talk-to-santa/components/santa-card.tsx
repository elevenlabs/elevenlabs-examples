"use client";

import { christmasFont } from "@/components/custom-fonts";
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
import { AnimatePresence, motion } from "framer-motion";
import { Mail } from "lucide-react";

interface SantaCardProps {
  name: string | null;
  wishlist: Array<{ key: string; name: string }>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function SantaCard({
  isOpen,
  setIsOpen,
  name,
  wishlist,
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
              <Mail /> Open Your Letter to Santa
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
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
