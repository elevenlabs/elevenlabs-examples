import React from "react";
import { Logo } from "./logo";
import { Link } from "react-router-dom";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <div className="w-full flex flex-col flex-wrap max-w-screen-xl mx-auto px-4">
        <div className="py-4 mb-4 flex gap-x-2 items-baseline border-b-2 border-gray-200">
          <Link to="/">
            <Logo />
          </Link>
          <p className="text-lg font-sans">| Dubbing Example</p>
        </div>
        {children}
      </div>
    </main>
  );
};
