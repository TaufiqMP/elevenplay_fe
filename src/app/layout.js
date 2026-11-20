import React from "react";
import { Exo_2 } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { ConfirmProvider } from "@/components/ui/confirmdialog";

//Satu font untuk seluruh situs (teks biasa dan kode akun)
const exo2 = Exo_2({
  variable: "--font-exo-2",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${exo2.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800">
        <ConfirmProvider>
          <AppShell>
            {children}
          </AppShell>
        </ConfirmProvider>
      </body>
    </html>
  );
}

