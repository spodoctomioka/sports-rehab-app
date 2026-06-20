import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sports Rehab Planner",
  description: "スポーツ傷害リハビリ計画支援ツール",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
