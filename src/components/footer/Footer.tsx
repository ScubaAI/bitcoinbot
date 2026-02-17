'use client';

import { Locale } from '@/types';
import { BookOpen, Globe, Shield } from 'lucide-react';

interface FooterProps {
  lang: Locale;
  dict: {
    resources: string;
    documentation: string;
    protocol: string;
    lightning: string;
    books: string;
    disclaimer: string;
    copyright: string;
  };
}

export function Footer({ lang, dict }: FooterProps) {
  const resources = [
    {
      title: dict.protocol,
      href: 'https://bitcoin.org/bitcoin.pdf',
      icon: BookOpen,
    },
    {
      title: dict.lightning,
      href: 'https://lightning.network/lightning-network-paper.pdf',
      icon: Globe,
    },
    {
      title: dict.books,
      href: 'https://github.com/BlockchainCommons/SecuringBitcoin',
      icon: Shield,
    },
  ];

  return (
    <footer className="bg-bitcoin-black border-t border-bitcoin-orange/20 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Resources Section */}
          <div>
            <h3 className="text-bitcoin-orange font-mono font-bold mb-4">
              {dict.resources}
            </h3>
            <ul className="space-y-2">
              {resources.map((resource) => (
                <li key={resource.title}>
                  <a
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-bitcoin-orange transition-colors flex items-center gap-2 text-sm"
                  >
                    <resource.icon className="w-4 h-4" />
                    {resource.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Documentation Section */}
          <div>
            <h3 className="text-bitcoin-orange font-mono font-bold mb-4">
              {dict.documentation}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://developer.bitcoin.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-bitcoin-orange transition-colors text-sm"
                >
                  Bitcoin Developer Docs
                </a>
              </li>
              <li>
                <a
                  href="https://docs.lightning.engineering"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-bitcoin-orange transition-colors text-sm"
                >
                  Lightning Engineering
                </a>
              </li>
              <li>
                <a
                  href="https://learn.saylor.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-bitcoin-orange transition-colors text-sm"
                >
                  Saylor Academy
                </a>
              </li>
            </ul>
          </div>

          {/* About Section */}
          <div>
            <h3 className="text-bitcoin-orange font-mono font-bold mb-4">
              {lang === 'en' ? 'About' : 'Acerca de'}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {lang === 'en'
                ? 'Bitcoin Agent is an educational tool designed to help you understand Bitcoin and Lightning Network technology.'
                : 'Bitcoin Agent es una herramienta educativa diseñada para ayudarte a entender Bitcoin y la tecnología Lightning Network.'}
            </p>
            <p className="text-xs text-gray-500 italic">
              {dict.disclaimer}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-bitcoin-orange/10 text-center">
          <p className="text-gray-500 text-sm font-mono">
            {dict.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
