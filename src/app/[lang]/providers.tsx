'use client';

import { ReactNode, useEffect, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    // Prevent hydration mismatch
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent flash of unstyled content / hydration errors
    if (!mounted) {
        return (
            <div style={{ visibility: 'hidden' }}>
                {children}
            </div>
        );
    }

    return <>{children}</>;
}
