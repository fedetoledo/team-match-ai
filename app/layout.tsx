import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const poppins = Poppins({
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'TeamMatch AI',
  description:
    'AI-powered platform that matches your internal developers to incoming projects based on skills, experience, and availability.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
