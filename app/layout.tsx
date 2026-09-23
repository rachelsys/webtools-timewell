import type { Metadata } from "next";
import "./globals.css";
import "./timer.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://webtools-timewell-ckk9hg34e-toolwell.vercel.app"),
  title: "留時 Timewell — 為值得的事，留一段剛好的時間",
  description: "泡麵、喝茶、咖啡、專注與自訂倒數。不用登入，選一樣，立刻開始。",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "/",
    siteName: "留時 Timewell",
    title: "留時 Timewell — 為值得的事，留一段剛好的時間",
    description: "泡麵、喝茶、咖啡、專注與自訂倒數。不用登入，打開就能開始。",
    images: [{
      url: "/og-timewell.png",
      width: 1200,
      height: 630,
      alt: "留時 Timewell，為值得的事留一段剛好的時間",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "留時 Timewell — 為值得的事，留一段剛好的時間",
    description: "不用登入，選一樣，立刻開始。",
    images: ["/og-timewell.png"],
  },
  other: {
    "theme-color": "#171a30",
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
