import localFont from "next/font/local";

export const christmasFont = localFont({
  src: [
    {
      path: "../app/fonts/SantasSleighFull.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../app/fonts/SantasSleighFullBold.woff2",
      weight: "700",
      style: "bold",
    },
  ],
  variable: "--font-santa",
});
