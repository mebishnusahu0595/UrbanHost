import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generatePassword(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Generate StayNTour email from owner name
 * Format: firstname.lastname@stayntour.com
 * Example: "John Doe" -> "john.doe@stayntour.com"
 */
export function generateStayNTourEmail(ownerName: string): string {
  const cleanName = ownerName.trim().toLowerCase();
  const nameParts = cleanName.split(/\s+/);

  if (nameParts.length === 1) {
    return `${nameParts[0].replace(/[^a-z0-9]/g, "")}@stayntour.com`;
  }

  const firstName = nameParts[0].replace(/[^a-z0-9]/g, "");
  const lastName = nameParts[nameParts.length - 1].replace(/[^a-z0-9]/g, "");

  return `${firstName}.${lastName}@stayntour.com`;
}

// Alias for backwards compatibility


/**
 * Generate password from hotel name
 * Format: hotelname@123
 * Example: "Grand Hotel" -> "grandhotel@123"
 */
export function generateHotelPassword(hotelName: string): string {
  const cleanHotelName = hotelName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return `${cleanHotelName}@123`;
}

/**
 * Resolves a URL to the main stayntour.com domain when accessed from a subdomain
 */
export function getMainSiteUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (
      host.includes("stayntour.com") &&
      (host.startsWith("admin.") ||
        host.startsWith("superadmin.") ||
        host.startsWith("partner.") ||
        host.startsWith("listproperty."))
    ) {
      return `https://stayntour.com${cleanPath}`;
    }
  }
  return cleanPath;
}

