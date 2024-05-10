import React from "react";
import { Logo } from "./logo";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <main>
      <div className="w-full flex flex-col flex-wrap max-w-screen-xl mx-auto px-4">
        <div className="py-4 mb-4 flex items-center justify-between border-b-2 border-gray-200">
          <div className="flex gap-x-2 items-baseline">
            <Link to="/">
              <Logo />
            </Link>
            <p className="text-lg font-sans">| Dubbing Example</p>
          </div>
          <div>
            {location.pathname !== "/" && (
              <Button size={"sm"}>
                <Link to="/">Upload Project</Link>
              </Button>
            )}
          </div>
        </div>
        {children}
      </div>
    </main>
  );
};
