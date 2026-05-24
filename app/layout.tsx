import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { ReduxProvider } from "@/components/providers/redux-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: `${brand.fullName} | ${brand.tagline}`,
  description: brand.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-background text-foreground">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
