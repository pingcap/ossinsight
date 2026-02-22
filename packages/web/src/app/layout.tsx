import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "OSSInsight — Open Source Software Insight",
    template: "%s | OSSInsight",
  },
  description:
    "Explore 6+ billion GitHub events. Discover trends, compare repositories, and gain deep insights into the open-source ecosystem.",
  keywords: ["open source", "github", "analytics", "insights", "trends"],
  openGraph: {
    siteName: "OSSInsight",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
