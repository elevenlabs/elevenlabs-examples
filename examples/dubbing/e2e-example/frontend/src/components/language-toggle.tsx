import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Language } from "./languages";

export const LanguageToggle = ({
  selectedTrack,
  onChange,
  tracks,
}: {
  selectedTrack: string;
  onChange: (val: string) => void;
  tracks: Language[];
}) => {
  return (
    <div
      className={`flex rounded-full p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.5)] gap-1`}
    >
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
