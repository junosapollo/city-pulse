import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CityPulse — Bengaluru Parking Intelligence",
  description: "A fully working web prototype for Flipkart Gridlock 2.0 (Theme 1: Parking-Induced Congestion).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
