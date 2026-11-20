import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "4KidStudy · Tiếng Anh cho bé lớp 1–5",
  description:
    "Bài học, thẻ từ và luyện phát âm tiếng Anh cho học sinh lớp 1 đến lớp 5, có nghĩa tiếng Việt cho mọi từ.",
};

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={nunito.variable}>
      <body className="font-sans antialiased">
        <Toaster theme="light" richColors closeButton />
        {children}
      </body>
    </html>
  );
}
