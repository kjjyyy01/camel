import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/contexts/auth-context";
import { EnvProvider } from "@/components/providers/env-provider";
import { QueryProvider } from "@/components/providers/query-client-provider";

export const metadata: Metadata = {
  title: "Camel - 상업용 부동산 전문 플랫폼",
  description: "사무실, 상가, 건물 임대의 모든 것. 카카오 지도 기반 매물 검색과 전문 상담 서비스를 제공합니다.",
  keywords: "상업용부동산, 사무실임대, 상가임대, 건물임대, 부동산중개",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen flex flex-col">
        <EnvProvider>
          <QueryProvider>
            <AuthProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </AuthProvider>
          </QueryProvider>
        </EnvProvider>
      </body>
    </html>
  );
}
