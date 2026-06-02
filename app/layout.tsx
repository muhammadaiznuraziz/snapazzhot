import type { Metadata } from "next";
import { Inter, Press_Start_2P, Space_Grotesk } from "next/font/google";
import "./globals.css"; // Global styles

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "snapazzhot",
  description:
    "Retro arcade meets Japanese Purikura. Capture memories with live camera filters, layout layouts, and nostalgic templates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${pressStart2P.variable} ${spaceGrotesk.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#000000] text-white selection:bg-[#EA2D2D] selection:text-white antialiased min-h-screen flex flex-col"
      >
        {children}
      </body>
    </html>
  );
}
