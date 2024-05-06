import React from "react";
import { Button } from "./ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";

export const Layout = ({
  children,
  pageTitle,
}: {
  children: React.ReactNode;
  pageTitle: string;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <main>
      <div className="w-full h-16 px-8 bg-zinc-400 flex items-center gap-x-4">
        <div>
          <p className="text-xl font-bold">ElevenVideos</p>
        </div>
      </div>
      <div className="w-full flex flex-col flex-wrap max-w-screen-xl mx-auto px-4">
        {location.pathname !== "/" && (
          <Button
            className="my-2"
            size={"icon"}
            variant={"ghost"}
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon />
          </Button>
        )}
        <h1 className="font-bold text-lg my-2">{pageTitle}</h1>
        {children}
      </div>
    </main>
  );
};
