import React from "react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <div className="w-full flex flex-col flex-wrap max-w-screen-xl mx-auto px-4">
        <div className="mt-4 mb-4">
          <p className="text-3xl font-bold">ElevenVideos</p>
        </div>
        {children}
      </div>
    </main>
  );
};
