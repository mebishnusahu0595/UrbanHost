import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generatePassword(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Generate UrbanHost email from owner name
 * Format: firstname.lastname@urbanhost.com
 * Example: "John Doe" -> "john.doe@urbanhost.com"
 */
export function generateUrbanHostEmail(ownerName: string): string {
  // Clean and split the name
  const cleanName = ownerName.trim().toLowerCase();
  const nameParts = cleanName.split(/\s+/);

  if (nameParts.length === 1) {
    // Single name: name@urbanhost.com
    return `${nameParts[0].replace(/[^a-z0-9]/g, '')}@urbanhost.com`;
  }

  // Multiple names: firstname.lastname@urbanhost.com
  const firstName = nameParts[0].replace(/[^a-z0-9]/g, '');
  const lastName = nameParts[nameParts.length - 1].replace(/[^a-z0-9]/g, '');

  return `${firstName}.${lastName}@urbanhost.com`;
}

/**
 * Generate password from hotel name
 * Format: hotelname@123
 * Example: "Grand Hotel" -> "grandhotel@123"
 */
export function generateHotelPassword(hotelName: string): string {
  // Clean hotel name: remove special chars, spaces, convert to lowercase
  const cleanHotelName = hotelName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric

  return `${cleanHotelName}@123`;
}
