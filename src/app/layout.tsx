import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "대한민국 여행 스크래치 맵",
  description: "방문한 지역을 긁어 기록하는 인터랙티브 여행 지도",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
