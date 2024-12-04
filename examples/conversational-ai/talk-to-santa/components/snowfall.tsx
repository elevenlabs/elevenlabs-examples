"use client";

import dynamic from "next/dynamic";

const SnowfallLibrary = dynamic(() => import("react-snowfall"), { ssr: false });

export function Snowfall() {
  return (
    <SnowfallLibrary
      snowflakeCount={200}
      speed={[0.1, 0.5]}
      opacity={[0.3, 0.8]}
      radius={[0.5, 2.5]}
      wind={[-0.5, 1]}
    />
  );
}
