import { motion } from "framer-motion";
import { getLanguageMap } from "../languageMap";

export default function LanguageToggle({
  value,
  onChange,
  languages,
}: {
  value: number;
  onChange: (value: number) => void;
  languages: string[];
}) {
  function handleSelection(index: number, e: React.SyntheticEvent) {
    e.stopPropagation();
    onChange(index);
  }

  return (
    <div
      className={`flex rounded-3xl p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.5)] gap-1 ${
        value === 1 && "justify-end"
      }`}
      data-index={value}
    >
      <motion.div
        className="absolute h-10 w-10 bg-white rounded-full -z-10"
        layout
        transition={{
          type: "spring",
          stiffness: 130,
          damping: 20,
        }}
        data-toggle={value === 1}
      />
      {languages.map((language, index) => {
        return (
          <button
            className="w-10 h-10 rounded-full flex justify-center items-center p-0 m-0"
            onClick={e => handleSelection(index, e)}
          >
            {getLanguageMap(language).flag}
          </button>
        );
      })}
    </div>
  );
}
