import type { Metadata } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';
import { Locale } from '@/types';
import { i18n } from '@/lib/i18n/config';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Bitcoin Agent - AI-Powered Bitcoin Infrastructure Guide',
  description:
    'Your AI-powered guide to understanding Bitcoin technical architecture, from protocol to Lightning Network payments.',
  keywords: [
    'Bitcoin',
    'Lightning Network',
    'Bitcoin Protocol',
    'Blockchain',
    'Cryptocurrency',
    'AI',
    'Education',
  ],
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return (
    <html lang={params.lang}>
      <body
        className={`${jetbrainsMono.variable} ${inter.variable} font-sans bg-bitcoin-black text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
