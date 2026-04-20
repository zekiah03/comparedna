import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/top-nav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoJp = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Morpho — 万物の分類学",
  description: "存在を、プロファイリングする。あらゆる対象を12軸と環境DNAで解剖し、ジャンルを越えた類似を炙り出すAI分類学。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${notoJp.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <TopNav />
        <main className="flex-1 w-full">{children}</main>
      </body>
    </html>
  );
}
