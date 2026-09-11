import type { Metadata } from "next";
import "./globals.css";
import "./timer.css";

export const metadata: Metadata = {
  title: "倒數一下 — 好用的日常倒數計時器",
  description: "泡麵、茶、咖啡、專注與自訂倒數。選一樣，立刻開始。",
  other: {
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="antialiased">{children}</body>
    </html>
  );
}
