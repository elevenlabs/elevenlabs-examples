import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { autoDetect, languages } from "./languages";

export const LanguageToggle = ({
  selectedTrack,
  onChange,
  sourceLanguage,
  targetLanguages,
}: {
  selectedTrack: string;
  onChange: (val: string) => void;
  sourceLanguage: string;
  targetLanguages: string[];
}) => {
  const originalTrack =
    sourceLanguage === "detect"
      ? autoDetect
      : languages.find(l => l.code === sourceLanguage)!;

  const tracks = targetLanguages.map(
    target => languages.find(l => l.code === target)!
  );

  return (
    <div
      className={`flex rounded-full p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.5)] gap-1`}
    >
      <Tooltip key={originalTrack.code}>
        <TooltipTrigger asChild>
          <button
            className={`w-12 h-12 rounded-full flex justify-center items-center p-0 m-0 language-btn ${selectedTrack === "raw" && "bg-white"}`}
            onClick={e => {
              e.stopPropagation();
              onChange("raw");
            }}
          >
            {originalTrack.countryLogo}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{originalTrack.name}</p>
        </TooltipContent>
      </Tooltip>
      {tracks.map(track => (
        <Tooltip key={track.code}>
          <TooltipTrigger asChild>
            <button
              className={`w-12 h-12 rounded-full flex justify-center items-center p-0 m-0 language-btn ${track.code === selectedTrack && "bg-white"}`}
              onClick={e => {
                e.stopPropagation();
                onChange(track.code);
              }}
            >
              {track.countryLogo}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{track.name}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
