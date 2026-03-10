/**
 * Format a number based on the specified format type
 * @param value - The numerical value to format
 * @param format - The format type (plain, currency, date, percentage)
 * @param options - Optional formatting options
 * @returns Formatted string representation of the number
 */
export function formatNumber(
  value: number,
  format: "plain" | "currency" | "date" | "percentage",
  options?: {
    roundCurrency?: boolean; // Default true - round currency to whole dollars
  },
): string {
  const roundCurrency = options?.roundCurrency ?? true;

  switch (format) {
    case "plain":
      // Use locale string with proper formatting for large numbers
      return value.toLocaleString("en-US", {
        maximumFractionDigits: 2,
      });
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: roundCurrency ? 0 : 2,
        maximumFractionDigits: roundCurrency ? 0 : 2,
      }).format(value);
    case "date":
      // Treat the number as a year
      return value.toString();
    case "percentage":
      // Format percentage with proper decimal handling
      const formattedPercent = value.toLocaleString("en-US", {
        maximumFractionDigits: 2,
      });
      return `${formattedPercent}%`;
    default:
      return value.toString();
  }
}
