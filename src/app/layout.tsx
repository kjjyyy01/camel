import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alpaca",
  description: "사무실/상가 임대전문 서비스 알파카",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
