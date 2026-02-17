import { HeroSection } from '@/components/hero/HeroSection';
import { MarketSection } from '@/components/markets/MarketSection';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { TipJar } from '@/components/tip-jar/TipJar';
import { Footer } from '@/components/footer/Footer';
import { getDictionary } from '@/lib/i18n/config';
import { Locale } from '@/lib/i18n/types';

interface PageProps {
  params: { lang: Locale };
}

export default async function Page({ params }: PageProps) {
  const dict = await getDictionary(params.lang);

  return (
    <main className="min-h-screen">
      <HeroSection lang={params.lang} dict={dict.hero} />
      <MarketSection lang={params.lang} />
      <ChatInterface lang={params.lang} dict={dict.chat} />
      <TipJar lang={params.lang} dict={dict.tip} />
      <Footer lang={params.lang} dict={dict.footer} />
    </main>
  );
}
