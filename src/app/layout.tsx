import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOP Compliance & Quality Overview - KIMS Hospital",
  description: "Executive Overview dashboard for Quality Assurance and SOP Compliance tailored for KIMS Hospital.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`} style={{ display: 'flex', minHeight: '100vh', margin: 0 }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, backgroundColor: 'var(--color-background)' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
