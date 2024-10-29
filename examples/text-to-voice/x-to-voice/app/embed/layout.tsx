import "../globals.css";

export const metadata = {
  title: "Embed",
  robots: {
    index: false,
  },
};

export default function RootLayout({ children }: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={"h-full w-full"}>
    <body className={"h-full w-full"}>{children}</body>
    </html>
  );
}
