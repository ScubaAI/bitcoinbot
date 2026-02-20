import type { Metadata } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';
import '../globals.css';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/config';
import { Providers } from './providers';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: { lang: Locale }
}): Promise<Metadata> {
  const lang = params?.lang || 'en';
  const dict = await getDictionary(lang);

  return {
    title: 'Bitcoin Agent | Infrastructure First',
    description: dict?.hero?.subtitle || 'Digital Immune System',
    keywords: [
      'Bitcoin',
      'Lightning Network',
      'Bitcoin Protocol',
      'Blockchain',
      'BTCPay Server',
      'AI',
      'Infrastructure',
    ],
    alternates: {
      canonical: `/${lang}`,
      languages: {
        'en': '/en',
        'es': '/es',
      },
    },
  };
}

export async function generateStaticParams() {
  return ['en', 'es'].map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const lang = params?.lang || 'en';

  return (
    <html lang={lang} className="dark" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} ${inter.variable} font-mono bg-terminal-black text-terminal-green antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}