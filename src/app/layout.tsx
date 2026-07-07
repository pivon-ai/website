import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "pivon | KI strategisch denken, pragmatisch umsetzen",
  description:
    "pivon berät und begleitet Sie ganzheitlich bei der Einführung und Entwicklung von KI-Lösungen – menschenzentriert, transparent und praxisorientiert.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${inter.variable} h-full antialiased snap-y snap-mandatory scroll-pt-32`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
