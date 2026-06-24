import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "体重管理 | アメフト部",
  description: "高校アメフト部 体重管理システム",
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
