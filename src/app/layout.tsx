import type { Metadata } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';

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

export const metadata: Metadata = {
    title: 'Bitcoin Agent | Digital Immune System',
    description: 'A decentralized infrastructure for transferring value across the internet. Open, permissionless, and always running.',
    keywords: ['Bitcoin', 'Lightning Network', 'AI', 'Digital Immune System', 'Sovereignty'],
    authors: [{ name: 'Satoshi Nakamoto' }], // Ethos reference
    icons: {
        icon: '/favicon.ico',
    },
};

/**
 * Global Root Layout
 * Philosophy: Universal container for the Bitcoin Agent decentralized architecture.
 * Ensures strict dark mode, consistent typography, and hydration resilience.
 */
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body
                className={`${jetbrainsMono.variable} ${inter.variable} bg-terminal-black text-terminal-green font-mono antialiased`}
                suppressHydrationWarning
            >
                {children}
            </body>
        </html>
    );
}
