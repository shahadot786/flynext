import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/shared/components/layout/Navbar";
import { Footer } from "@/shared/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlyNext — Find & Book Flights",
  description:
    "Search and book flights at the best prices. Compare airlines, filter by stops, price, and departure time. Fast, simple, and secure booking.",
  keywords: ["flights", "booking", "airline tickets", "travel", "FlyNext"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
