import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Serenade",
  description: "Music Discovery at your fingertips",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="https://raw.githubusercontent.com/hridaya423/serenade/refs/heads/master/public/logo.png" sizes="any" />
      <body>
        {children}
      </body>
    </html>
  );
}
