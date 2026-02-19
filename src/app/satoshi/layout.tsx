import type { Metadata } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';
import '../globals.css';

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
    title: 'Satoshi Core | Bitcoin Agent',
    description: 'Immune System Administration & Native Beacon Management',
};

export default function SatoshiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body
                className={`${jetbrainsMono.variable} ${inter.variable} font-mono bg-[#0a0a0a] text-white antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
