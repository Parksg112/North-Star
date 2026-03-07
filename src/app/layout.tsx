import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SideNav, BottomNav } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "North Star",
  description: "Your personal accountability and goal tracking app",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <style>{`@media(min-width:768px){#main-content{padding-left:220px!important;padding-bottom:0!important}}`}</style>
      </head>
      <body>
        <SideNav />
        <main
          id="main-content"
          style={{ minHeight: '100dvh', paddingBottom: '72px' }}
        >
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
