import type { Metadata } from "next";
import { geistSans, sfpro, satoshi } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: `%s | veatunes`,
    default: "veatunes",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          geistSans.variable,
          satoshi.variable,
          sfpro.variable,
          satoshi.className,
          'font-normal antialiased',
        )}
      >
        {children}
      </body>
    </html>
  );
}
