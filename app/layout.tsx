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
  title: 'HR AI Assistant',
  description:
    'HR AI Assistant is a platform that helps you find the best candidates for the job.',
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
