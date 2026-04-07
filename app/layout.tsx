import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Etika Digital AI",
  description:
    "Platform e-learning etika digital dengan AI analisis perilaku online untuk membantu pengguna belajar, refleksi, dan membangun kebiasaan digital yang sehat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
