import { getDictionary } from '@/lib/i18n/config';
import { Locale } from '@/types';
import { HeroSection } from '@/components/hero/HeroSection';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { TipJar } from '@/components/tip-jar/TipJar';
import { Footer } from '@/components/footer/Footer';

export default async function Page({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);

  return (
    <main>
      <HeroSection lang={params.lang} dict={dict.hero} />
      <ChatInterface lang={params.lang} dict={dict.chat} />
      <TipJar lang={params.lang} dict={dict.tip} />
      <Footer lang={params.lang} dict={dict.footer} />
    </main>
  );
}
