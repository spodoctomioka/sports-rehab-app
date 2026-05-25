import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sports Rehab Planner | スポーツリハビリ計画支援",
  description: "スポーツ医師・トレーナー向けリハビリテーション計画支援ツール",
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
