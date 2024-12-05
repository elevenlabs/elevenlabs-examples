"use client";

import { getConversationCount } from "@/app/(main)/(santa)/actions/actions";
import { christmasFont } from "@/components/custom-fonts";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const ChristmasCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const calculateTimeLeft = () => {
      const christmas = new Date(new Date().getFullYear(), 11, 25);
      const now = new Date();
      const difference = christmas.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
        setIsLoading(false);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isLoading) return null;

  return (
    <motion.div
      initial={{ y: -100, x: "-50%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", bounce: 0.3 }}
      className="fixed top-0 left-1/2 z-50"
    >
      <div
        className="rounded-b-2xl bg-white/5 backdrop-blur-[16px] shadow-2xl p-4"
        style={{
          border: "4px solid transparent",
          borderTop: "none",
          borderImage:
            "repeating-linear-gradient(45deg, #ff0000 0px, #ff0000 10px, #ffffff 10px, #ffffff 20px)",
          borderImageSlice: "1",
        }}
      >
        <div className="rounded-xl">
          <div className="flex flex-col items-center space-y-2">
            <div
              className={cn(
                "text-white font-bold flex items-center gap-2 text-lg",
                christmasFont.className
              )}
            >
              Days Until Christmas
            </div>
            <div className="flex gap-3">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className={cn(
                    "flex flex-col items-center",
                    christmasFont.className
                  )}
                >
                  <div className="bg-gradient-to-br from-red-600 to-red-800 w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg border border-white/20 transform hover:scale-110 transition-transform duration-200">
                    {value.toString().padStart(2, "0")}
                  </div>
                  <div className="text-white text-sm mt-1 font-semibold">
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className={cn(
                "text-white text-center mt-2",
                christmasFont.className
              )}
            >
              <div className="flex flex-col gap-1">
                <div className="text-lg">
                  <span className="text-red-400">{conversationCount.toLocaleString()}</span> Letters
                  to Santa
                </div>
                <div className="text-sm mt-1 text-gray-300">
                  <span className="text-red-400">{conversationCount.toLocaleString()}</span> × $
                  {donationPerConversation} ={" "}
                  <span className="text-gray-300">${totalDonation.toLocaleString()}</span>{" "}
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
      </div>
    </motion.div>
  );
};
