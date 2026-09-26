import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caption Archive | Design AI",
  description: "A live caption archive powered by Next.js and Supabase.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}