"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        // Disable Lenis on Admin and Portal dashboard routes where sidebar is fixed and pages scroll natively
        if (
            pathname?.startsWith("/admin") ||
            pathname?.startsWith("/property-owner") ||
            pathname?.startsWith("/property-panel") ||
            pathname?.startsWith("/receptionist")
        ) {
            return;
        }

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        const animationFrameId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(animationFrameId);
            lenis.destroy();
        };
    }, [pathname]);

    return <>{children}</>;
}
