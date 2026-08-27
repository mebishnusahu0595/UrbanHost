"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteTransitionLoader() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.getAttribute("target") === "_blank"
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          setIsNavigating(true);
        }
      } catch {
        // Ignore invalid URLs
      }
    };

    document.addEventListener("click", handleLinkClick, true);
    return () => {
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, []);

  if (!isNavigating) return null;

  const isAdminRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/property-owner") ||
    pathname?.startsWith("/property-panel");

  return (
    <div
      className={
        isAdminRoute
          ? "fixed inset-0 md:left-64 z-40 flex items-center justify-center bg-white/40 backdrop-blur-[1px] pointer-events-none transition-all duration-150"
          : "fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-[1px] pointer-events-none transition-all duration-150"
      }
    >
      {/* 3 Clean Animated Bouncing Dots perfectly centered in right pane */}
      <div className="flex items-center justify-center gap-3">
        <span className="w-3.5 h-3.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-3.5 h-3.5 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 animate-bounce"></span>
      </div>
    </div>
  );
}
