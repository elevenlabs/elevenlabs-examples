"use client";

import { getConversationCount } from "@/app/(main)/(santa)/actions/actions";
import { christmasFont } from "@/components/custom-fonts";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const DonationCountup = () => {
  const [conversationCount, setConversationCount] = useState<number>(0);

  const donationPerConversation = 2;
  const maxDonation = 11000;
  const totalDonation = Math.min(
    conversationCount * donationPerConversation,
    maxDonation
  );
  const isMaxDonationReached = totalDonation >= maxDonation;

  useEffect(() => {
    const fetchConversationCount = async () => {
      const data = await getConversationCount({});
      setConversationCount(data?.data?.count || 0);
    };

    fetchConversationCount();
  }, []);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: "0%" }}
      transition={{ type: "spring", bounce: 0 }}
      className="fixed top-0 right-0 z-50"
    >
      <div
        className="bg-white/5 backdrop-blur-[16px] shadow-2xl p-0 sm:p-4 border-l-[4px] border-b-[4px] sm:border-[4px] sm:border-transparent sm:border-r-0"
        style={{
          borderImage:
            "repeating-linear-gradient(45deg, #ff0000 0px, #ff0000 10px, #ffffff 10px, #ffffff 20px)",
          borderImageSlice: "1",
        }}
      >
        <div className="rounded-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={cn(
              "text-white text-center",
              christmasFont.className
            )}
          >
            <div className="flex flex-col gap-1 overflow-wrap break-word p-3">
              <div className="text-lg">
                <span className="text-red-400">{conversationCount.toLocaleString()}</span> Letters
                to Santa
              </div>
              <div className="text-sm mt-1 text-gray-300">
                <span className="text-red-400">{conversationCount.toLocaleString()}</span> × $
                {donationPerConversation} ={" "}
                <span className="text-gray-300 font-bold">${totalDonation.toLocaleString()}</span>{" "}
                {isMaxDonationReached && <span className="text-yellow-400">(Maximum reached!)</span>}{" "}
                <span className="text-gray-300">donated to</span>{" "}
                <a
                  href="https://bridgingvoice.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 underline underline-offset-2"
                >
                  Bridging Voice
                </a>
              </div>
              <div className="text-base opacity-70">
                and counting!
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
