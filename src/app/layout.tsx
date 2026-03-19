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
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
