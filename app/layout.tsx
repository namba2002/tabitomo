import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "tabitomo",
  description: "みんなで行きたい場所を共有しよう",
  openGraph: {
    title: "tabitomo",
    description: "みんなで行きたい場所を共有しよう",
    siteName: "tabitomo",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "tabitomo",
    description: "みんなで行きたい場所を共有しよう",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen overflow-hidden">{children}</body>
    </html>
  );
}
