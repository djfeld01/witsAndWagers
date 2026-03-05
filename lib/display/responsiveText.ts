/**
 * Responsive text sizing utility for displaying large numbers in guess boxes
 * Prevents visual overflow by scaling font size based on digit count
 */

/**
 * Calculate responsive font size for displaying numbers in guess boxes
 * @param value - The number to display
 * @param baseSize - Base font size in pixels (default: 56 for text-7xl)
 * @param maxDigits - Maximum digits before scaling (default: 6)
 * @returns Font size in pixels
 */
export function getResponsiveFontSize(
  value: number,
  baseSize: number = 56,
  maxDigits: number = 6,
): number {
  // Handle edge cases
  const absValue = Math.abs(value);
  
  // Count digits (including separators visually)
  const digitCount = absValue === 0 ? 1 : Math.floor(Math.log10(absValue)) + 1;
  
  // If within max digits, use base size
  if (digitCount <= maxDigits) {
    return baseSize;
  }
  
  // Scale down proportionally
  const scaleFactor = maxDigits / digitCount;
  const scaledSize = baseSize * scaleFactor;
  
  // Enforce minimum font size for readability
  const minSize = 24;
  return Math.max(scaledSize, minSize);
}

/**
 * Get Tailwind-compatible inline style for responsive text
 * @param value - The number to display
 * @returns Style object with fontSize property
 */
export function getResponsiveTextStyle(value: number): { fontSize: string } {
  const fontSize = getResponsiveFontSize(value);
  return { fontSize: `${fontSize}px` };
}
