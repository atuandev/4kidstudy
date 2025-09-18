import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates if a string is a valid URL
 * @param urlString - The URL string to validate
 * @returns true if valid URL, false otherwise
 */
export function isValidUrl(urlString: string | undefined | null): boolean {
  if (!urlString || typeof urlString !== 'string') {
    return false;
  }
  
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}
