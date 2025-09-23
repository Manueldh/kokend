import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layouts/MainLayout";
import { UserProvider } from "@/components/UserProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Kokend - AI Kook Assistent",
  description: "Je persoonlijke kook-assistent met AI. Genereer recepten op basis van je ingrediënten!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </UserProvider>
      </body>
    </html>
  );
}
