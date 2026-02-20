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
      hero: {
        title: 'Bitcoin Agent',
        subtitle: 'Digital Immune System',
        cta: 'Explore the Network',
        secondaryCta: 'View Market Data',
        stats: { nodes: 'Nodes', uptime: 'Uptime', countries: 'Countries' },
        infrastructure: {
          title: 'Open Monetary Network',
          layer1: { name: 'Base Layer', desc: 'Settlement' },
          layer2: { name: 'Lightning', desc: 'Payments' },
          layer3: { name: 'Apps', desc: 'Services' }
        }
      },
      chat: {
        placeholder: 'Ask anything...',
        thinking: 'Analyzing...',
        welcome: 'Welcome...',
      },
      tip: {
        title: 'Support the Network',
        description: 'Your sats help us.',
        button: 'Send Sats',
        success: 'Zap received! ⚡',
        error: 'Failed',
        impact: 'Impact',
        embeds: 'Embeds',
        satsRaised: 'Sats raised',
        nextTarget: 'Next target',
        thankYou: 'Thank you!',
        copy: 'Copy',
        scan: 'Scan',
        customAmount: 'Custom amount...',
        powered: 'Powered by Lightning',
        preset: { '1k': '1k', '5k': '5k', '21k': '21k', '100k': '100k' }
      },
      footer: {
        resources: "Reading",
        documentation: "Docs",
        system: "System",
        dashboard: "Dashboard",
        beacon: "Beacon",
        challenge: "Challenge",
        protocol: "Whitepaper",
        lightning: "Lightning Paper",
        books: "Security Guide",
        disclaimer: "Educational only.",
        copyright: "© 2024 Bitcoin Agent",
        builtBy: "Built by",
        contact: "Contact",
        mission: "Mission",
        missionText: "Education through AI.",
        privacy: "Privacy",
        terms: "Terms"
      }
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