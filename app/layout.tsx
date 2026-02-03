import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EmeSoft 2026 | Giải Cầu Lông",
  description: "Giải cầu lông Emesoft 2026 - Bứt Phá Giới Hạn - Chinh Phục Đỉnh Cao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
