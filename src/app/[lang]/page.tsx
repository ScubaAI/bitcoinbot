import { HeroSection } from '@/components/hero/HeroSection';
import { CircularEconomiesCarousel } from '@/components/economies/CircularEconomiesCarousel';
import { MarketSection } from '@/components/markets/MarketSection';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { TipJar } from '@/components/tip-jar/TipJar';
import { Footer } from '@/components/footer/Footer';
import { getDictionary } from '@/lib/i18n/config';

export default async function Home({ params: { lang } }: { params: { lang: 'en' | 'es' } }) {
  const dict = await getDictionary(lang);

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
