import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { autoDetect, languages } from "./languages";

export const LanguageToggle = ({
  isAlternativeTrack,
  onChange,
  sourceLang,
  targetLang,
}: {
  isAlternativeTrack: boolean;
  onChange: (val: boolean) => void;
  sourceLang: string;
  targetLang: string;
}) => {
  const source =
    sourceLang === "detect"
      ? autoDetect
      : languages.find((l) => l.code === sourceLang)!;
  const target = languages.find((l) => l.code === targetLang)!;
  return (
    <div
      className={`flex rounded-full p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.5)] gap-1 ${isAlternativeTrack && "justify-end"}`}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`w-12 h-12 rounded-full flex justify-center items-center p-0 m-0 language-btn ${!isAlternativeTrack && "bg-white"}`}
            onClick={(e) => {
              e.stopPropagation();
              onChange(false);
            }}
          >
            {source.countryLogo}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{source.name}</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`w-12 h-12 rounded-full flex justify-center items-center p-0 m-0 language-btn ${isAlternativeTrack && "bg-white"}`}
            onClick={(e) => {
              e.stopPropagation();
              onChange(true);
            }}
          >
            {target.countryLogo}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{target.name}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
