import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "E-commerce Demo",
    template: "%s | E-commerce Demo",
  },
  description: "A modern e-commerce demo application built with Next.js",
  keywords: ["ecommerce", "shop", "demo", "nextjs"],
  authors: [{ name: "Your Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "E-commerce Demo",
    title: "E-commerce Demo",
    description: "A modern e-commerce demo application built with Next.js",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
