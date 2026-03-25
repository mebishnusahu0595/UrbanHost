"use client";

import { useEffect } from "react";

export default function ChunkErrorListener() {
    useEffect(() => {
        // Handler for regular runtime errors
        const errorHandler = (event: ErrorEvent) => {
            if (/Loading chunk [\d]+ failed/.test(event.message) ||
                /Failed to load chunk/.test(event.message) ||
                event.message.includes("ChunkLoadError")) {
                console.warn("Chunk load error detected, reloading...");
                window.location.reload();
            }
        };

        // Handler for unhandled promise rejections (dynamic imports)
        const rejectionHandler = (event: PromiseRejectionEvent) => {
            const message = event.reason?.message || "";
            if (/Loading chunk [\d]+ failed/.test(message) ||
                /Failed to load chunk/.test(message) ||
                message.includes("ChunkLoadError")) {
                console.warn("Chunk load rejection detected, reloading...");
                window.location.reload();
            }
        };

        window.addEventListener("error", errorHandler);
        window.addEventListener("unhandledrejection", rejectionHandler);

        return () => {
            window.removeEventListener("error", errorHandler);
            window.removeEventListener("unhandledrejection", rejectionHandler);
        };
    }, []);

    return null;
}
