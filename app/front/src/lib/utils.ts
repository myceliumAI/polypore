/**
 * Reusable utility functions.
 */

/**
 * Format an ISO date to a readable French format.
 *
 * :param str isoDate: Date in ISO format
 * :return str: Formatted date (e.g., "01/10/2025 14:30")
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format an ISO date to a short format.
 *
 * :param str isoDate: Date in ISO format
 * :return str: Formatted date (e.g., "01/10/2025")
 */
export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("fr-FR");
}

/**
 * Conditionally combine CSS classes.
 *
 * :param any args: CSS classes to combine
 * :return str: Combined CSS classes string
 */
export function cn(...args: (string | undefined | null | false)[]): string {
  return args.filter(Boolean).join(" ");
}
