import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Archivo_Black, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Space_Grotesk({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Caption Archive | Design AI",
  description: "AI captions for campus life and NYC chaos. Create a contender, vote, and find the funniest.",
  openGraph: { title: "Caption Archive", description: "AI writes the punchline. You decide if it lands.", images: ["/memes/police-goose.webp"] },
};

export const viewport: Viewport = { themeColor: "#0a0a0a" };

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
