import type { Metadata } from 'next';
import { Locale, getDictionary } from '@/lib/i18n/config';
import { Providers } from './providers';
import { HiddenMenu } from '@/components/navigation/HiddenMenu';

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

/**
 * Language-specific Layout
 * Philosophy: Handles i18n context and client-side hydration boundaries.
 */
export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return (
    <div className="min-h-screen bg-terminal-black text-terminal-green font-mono">
      <HiddenMenu lang={params.lang} />
      <Providers>
        {children}
      </Providers>
    </div>
  );
}