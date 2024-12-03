'use client';

import { cn } from '@/lib/utils';
import localFont from 'next/font/local';
import { useEffect, useState } from 'react';

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

export const ChristmasCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

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
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20">
        <div className="flex flex-col items-center space-y-2">
          <div className="text-white/90 font-medium flex items-center gap-2">
            <span role="img" aria-label="santa">🎅</span>
            Days Until Christmas
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds }
            ].map(({ label, value }) => (
              <div key={label} className={cn("flex flex-col items-center", santaFont.className)}>
                <div className="bg-red-600/80 backdrop-blur-sm w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-inner">
                  {value.toString().padStart(2, '0')}
                </div>
                <div className="text-white/80 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
