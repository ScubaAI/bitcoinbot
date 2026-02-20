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
    // fallback dict (ya lo tienes bien)
    dict = { /* ... tu fallback ... */ };
  }

  return (
    <main className="min-h-screen bg-black text-white antialiased">
      {/* Hero – Gran apertura */}
      <HeroSection lang={lang} dict={dict.hero} />

      {/* Chat – El protagonista, justo después del Hero */}
      <ChatInterface lang={lang} dict={dict.chat} />

      {/* Comunidades – Prueba social viva */}
      <CircularEconomiesCarousel lang={lang} />

      {/* Mercado – Datos en vivo */}
      <MarketSection lang={lang} />

      {/* TipJar – Cierre emocional */}
      <TipJar lang={lang} dict={dict.tip} />

      {/* Footer – Cierre formal */}
      <Footer lang={lang} dict={dict.footer} />
    </main>
  );
}