import type { Metadata } from "next";
import { geistSans, sfpro, satoshi } from '@/lib/fonts';
import { Providers } from '@/components/providers';
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
          sfpro.className,
          'font-normal antialiased',
          'bg-background',
        )}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
