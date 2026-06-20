import type { Metadata } from "next";
import RehabApp from "@/components/RehabApp";

export const metadata: Metadata = {
  title: "Sports Rehab Planner",
  description: "スポーツ傷害リハビリ計画支援ツール",
};

export default function RehabPage() {
  return <RehabApp />;
}
