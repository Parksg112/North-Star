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
  themeColor: "#080d1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SideNav />
        {/* Main content: offset for sidebar on md+, bottom nav on mobile */}
        <main
          style={{
            minHeight: '100dvh',
            paddingLeft: 0,
            paddingBottom: '72px',
          }}
          className="md:pl-[220px] md:pb-0"
        >
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
