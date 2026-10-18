import React from "react";
import { Plus_Jakarta_Sans, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Elevenplay - eFootball Hub Indonesia",
    template: "%s | Elevenplay",
  },
  description: "Platform e-katalog terstruktur dan komunitas digital eFootball Indonesia. Media kurasi akun transparan, rujukan taktik, dan penghubung WhatsApp seller terpercaya.",
  icons: {
    icon: "/logo-elevenplay.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-800">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

