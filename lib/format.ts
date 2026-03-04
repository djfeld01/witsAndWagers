/**
 * Format a number based on the specified format type
 * @param value - The numerical value to format
 * @param format - The format type (plain, currency, date, percentage)
 * @returns Formatted string representation of the number
 */
export function formatNumber(
  value: number,
  format: "plain" | "currency" | "date" | "percentage",
): string {
  switch (format) {
    case "plain":
      return value.toLocaleString();
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    case "date":
      // Treat the number as a year
      return value.toString();
    case "percentage":
      return `${value}%`;
    default:
      return value.toString();
  }
}
