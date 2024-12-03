"use client";

import animationData from "@/components/logo/logo-animation.json";
import type { LottieRefCurrentProps } from "lottie-react";
import Lottie from "lottie-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";


export const Logo = ({
  className,
}: {
  className?: string;
}) => {
  const ref = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    ref.current?.goToAndStop(0);
    ref.current?.setSpeed(0.4);
    ref.current?.play();
  }, []);

  return (
    <div
      className={cn( 
        "flex h-[32px] w-[160px] items-center lg:h-8 [&_svg]:!h-[32px] lg:[&_svg]:!h-[32px] text-white opacity-65",
        className
      )}
    >
      <Lottie
        lottieRef={ref}
        animationData={animationData}
        loop={false}
        autoplay={false}
      />
    </div>
  );
};

/** @knipignore */
export const LogoIcon = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "border-shadow flex h-60 w-60 items-center justify-center rounded-[15px] bg-default text-white",
        className
      )}
    >
      <svg
        fill="none"
        height="20"
        viewBox="0 0 12 20"
        width="12"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M4 0H0V20H4V0Z" fill="currentColor" />
        <path d="M12 0H8V20H12V0Z" fill="currentColor" />
      </svg>

      <span className="sr-only">ElevenLabs</span>
    </div>
  );
};
