import type { Metadata } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';
import '../globals.css';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/config';

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

export async function generateMetadata({ 
  params: { lang } 
}: { 
  params: { lang: Locale } 
}): Promise<Metadata> {
  const dict = await getDictionary(lang);
  
  return {
    title: 'Bitcoin Agent | Infrastructure First',
    description: dict.hero.subtitle,
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
  const dict = await getDictionary(params.lang);
  
  return (
    <html lang={params.lang} className="dark">
      <body
        className={`${jetbrainsMono.variable} ${inter.variable} font-mono bg-terminal-black text-terminal-green antialiased`}
      >
        {children}
        <Footer lang={params.lang} dict={dict.footer} />
      </body>
    </html>
  );
}