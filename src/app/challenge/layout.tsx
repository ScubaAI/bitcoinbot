import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Protocol Challenge | Bitcoin Agent',
    description: 'Proof-of-Work verification required',
};

/**
 * Protocol Challenge Layout
 * Philosophy: Secure gateway for Byzantine fault tolerance.
 */
export default function ChallengeLayout({
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
