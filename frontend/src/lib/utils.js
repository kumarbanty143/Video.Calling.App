import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a random ID with the specified length
 * @param {number} length - The length of the ID to generate
 * @returns {string} - The generated random ID
 */
export const generateRandomId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Format seconds into minutes:seconds format
 * @param {number} seconds - The seconds to format
 * @returns {string} - Formatted time string (mm:ss)
 */
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Truncates a string to a specified length and adds ellipsis if needed
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length of the string
 * @returns {string} - Truncated string
 */
export const truncateString = (str, maxLength = 20) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  
  return str.substring(0, maxLength) + '...';
};