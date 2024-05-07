import { ReactNode } from "react";
import ReactCountryFlag from "react-country-flag";

export interface Language {
  name: string;
  code: string;
  countryLogo: ReactNode;
}

export const languages: Language[] = [
  {
    name: "English",
    code: "en",
    countryLogo: <ReactCountryFlag countryCode="US" svg />,
  },
  {
    name: "Chinese",
    code: "zh",
    countryLogo: <ReactCountryFlag countryCode="CN" svg />,
  },
  {
    name: "Spanish",
    code: "es",
    countryLogo: <ReactCountryFlag countryCode="ES" svg />,
  },
  {
    name: "Hindi",
    code: "hi",
    countryLogo: <ReactCountryFlag countryCode="IN" svg />,
  },
  {
    name: "French",
    code: "fr",
    countryLogo: <ReactCountryFlag countryCode="FR" svg />,
  },
  {
    name: "German",
    code: "de",
    countryLogo: <ReactCountryFlag countryCode="DE" svg />,
  },
  {
    name: "Japanese",
    code: "ja",
    countryLogo: <ReactCountryFlag countryCode="JP" svg />,
  },
  {
    name: "Arabic",
    code: "ar",
    countryLogo: <ReactCountryFlag countryCode="SA" svg />,
  },
  {
    name: "Russian",
    code: "ru",
    countryLogo: <ReactCountryFlag countryCode="RU" svg />,
  },
  {
    name: "Korean",
    code: "ko",
    countryLogo: <ReactCountryFlag countryCode="KR" svg />,
  },
  {
    name: "Indonesian",
    code: "id",
    countryLogo: <ReactCountryFlag countryCode="ID" svg />,
  },
  {
    name: "Italian",
    code: "it",
    countryLogo: <ReactCountryFlag countryCode="IT" svg />,
  },
  {
    name: "Dutch",
    code: "nl",
    countryLogo: <ReactCountryFlag countryCode="NL" svg />,
  },
];
