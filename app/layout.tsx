import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "anything — make something useful",
  description: "Give anything. Get something useful back.",
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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
