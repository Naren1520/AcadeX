import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import "@/lib/env";
import { NavigationProgress } from "@/components/layout/NavigationProgress";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AcadeX",
  description:
    "Manage academic project teams, approvals, milestones, and submissions.",
  icons: {
    icon: "/images/sahyadrilogo1.png",
    shortcut: "/images/sahyadrilogo1.png",
    apple: "/images/sahyadrilogo1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-neutral-50 font-sans text-neutral-900 antialiased">
        <Suspense>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
