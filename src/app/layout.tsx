import type { Metadata } from "next";
import { geistSans, sfpro, satoshi } from '@/lib/fonts';
import { Providers } from '@/components/providers';
import { cn } from '@/lib/utils';
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: `%s | veatunes`,
    default: "veatunes",
  },
  icons: {
    icon: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/favicon/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/favicon/favicon-16x16.png",
      },
    ],
    apple: {
      rel: "apple-touch-icon",
      url: "/favicon/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  },
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
