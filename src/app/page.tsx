import { redirect } from 'next/navigation';

/**
 * Root Page redirector
 * Philosophy: Default to English entry point for global consensus.
 */
export default function RootPage() {
    redirect('/en');
}
