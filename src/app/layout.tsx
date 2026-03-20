import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BloodWork Pro - AI-Powered Blood Work Analysis",
  description:
    "Upload your blood work, get AI-generated health protocols reviewed by real doctors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <div className="gradient-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
