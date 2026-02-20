import { HeroSection } from '@/components/hero/HeroSection';
import { CircularEconomiesCarousel } from '@/components/economies/CircularEconomiesCarousel';
import { MarketSection } from '@/components/markets/MarketSection';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { TipJar } from '@/components/tip-jar/TipJar';
import { Footer } from '@/components/footer/Footer';
import { getDictionary } from '@/lib/i18n/config';

export const dynamic = 'force-dynamic';

export default async function Home({ params }: { params: { lang: 'en' | 'es' } }) {
  const lang = params?.lang || 'en';

  let dict;
  try {
    dict = await getDictionary(lang);
  } catch (e) {
    console.error('Dictionary load failed:', e);
    dict = {
      hero: { title: 'Bitcoin Agent', subtitle: 'Digital Immune System' },
      chat: { placeholder: 'Ask anything...' },
      tip: { title: 'Support the Network' },
      footer: { rights: 'All rights reserved' }
    };
  }

  return (
    <main>
      <HeroSection lang={lang} dict={dict.hero} />
      <CircularEconomiesCarousel lang={lang} />
      <MarketSection lang={lang} />
      <ChatInterface lang={lang} dict={dict.chat} />
      <TipJar lang={lang} dict={dict.tip} />
      <Footer lang={lang} dict={dict.footer} />
    </main>
  );
}