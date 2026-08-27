"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export function LocationTracker() {
  const { data: session } = useSession();
  const hasTrackedRef = useRef(false);

  const trackUserLocation = (coords?: { lat: number; lng: number; accuracy?: number }) => {
    fetch("/api/analytics/track-location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coords || {}),
    })
      .then((res) => res.json())
      .catch((err) => console.debug("Location track background ping completed", err));
  };

  useEffect(() => {
    // 1. Request Browser Geolocation immediately upon opening the website
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          trackUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (_error) => {
          // If user denies or ignores prompt, fallback to IP tracking
          trackUserLocation();
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 1000 * 60 * 10, // 10 minutes cache
        }
      );
    } else {
      // If browser doesn't support geolocation, track via IP
      trackUserLocation();
    }
  }, []);

  // When user logs in, link their session with their IP & location
  useEffect(() => {
    if (session?.user && !hasTrackedRef.current) {
      hasTrackedRef.current = true;
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            trackUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
          },
          () => trackUserLocation(),
          { timeout: 5000 }
        );
      } else {
        trackUserLocation();
      }
    }
  }, [session]);

  return null;
}
