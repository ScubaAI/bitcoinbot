/**
 * Challenge Zone Layout
 * Bitcoin Agent Digital Immune System
 * 
 * Location: /app/challenge/pow/layout.tsx
 * 
 * SPECIAL LAYOUT: Excludes this route from immune system middleware
 * to prevent redirect loops. This is a "safe zone" where users can
 * complete challenges without triggering additional security checks.
 * 
 * Analogy: Like a "witness block" in Bitcoin — separate from main chain
 */

import { Metadata } from 'next';
import { headers } from 'next/headers';

export const metadata: Metadata = {
    title: 'Proof of Work Challenge | Bitcoin Agent',
    description: 'Verify your humanity through computational work',
    robots: { index: false, follow: false }, // No SEO for challenge pages
};

interface ChallengeLayoutProps {
    children: React.ReactNode;
}

export default function ChallengeLayout({ children }: ChallengeLayoutProps) {
    // Verify we're in the challenge zone (defense in depth)
    const headersList = headers();
    const isChallengeRoute = headersList.get('x-invoke-path')?.startsWith('/challenge');

    if (!isChallengeRoute) {
        // This shouldn't happen, but defense in depth
        console.warn('ChallengeLayout used outside challenge route');
    }

    return (
        <div className="challenge-zone" data-immune-bypass="true">
            {/* 
        No headers needed here — the middleware detects the route pattern 
        /challenge/* and automatically applies bypass
      */}
            {children}
        </div>
    );
}

// CRITICAL: This export tells Next.js to skip middleware for this logic if checked, 
// though the actual bypass is logic-based in src/middleware.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;
