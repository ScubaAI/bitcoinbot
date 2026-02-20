import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Satoshi Core | Bitcoin Agent',
    description: 'Immune System Administration & Native Beacon Management',
};

/**
 * Satoshi Administration Layout
 * Philosophy: Distinct administrative layer for system sovereignty.
 */
export default function SatoshiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-mono antialiased">
            {children}
        </div>
    );
}
