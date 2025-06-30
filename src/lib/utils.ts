import { type ClassValue, clsx } from 'clsx'
import { format, parseISO } from 'date-fns'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatOptions(
  strings: string[],
  sortAlphabetically: boolean = true
): { label: string; value: string }[] {
  if (!Array.isArray(strings)) {
    throw new Error('Input must be an array of strings')
  }

  const options = strings.map((str) => ({
    label: str,
    value: str.toLowerCase().replace(/ /g, '-')
  }))

  if (sortAlphabetically) {
    return options.sort((a, b) => a.label.localeCompare(b.label))
  }

  return options
}

// export function formatDate(date: string) {
//   return new Date(date).toLocaleDateString('en-US', {
//     month: 'long',
//     day: 'numeric',
//     year: 'numeric'
//   })
// }

/**
 * Format a date string using date-fns
 * @param {string} dateString - ISO date string (e.g., '2025-05-14T00:00:00.000Z')
 * @param {string} formatPattern - date-fns format pattern (e.g., 'MM/dd/yyyy')
 * @returns {string} Formatted date string
 */

// Usage examples:
// formatDate('2025-05-14T00:00:00.000Z')                    // Returns: 'May 14, 2025'
// formatDate('2025-05-14T00:00:00.000Z', 'MM/dd/yyyy')      // Returns: '05/14/2025'
// formatDate('2025-05-14T00:00:00.000Z', 'EEEE, MMMM d')    // Returns: 'Wednesday, May 14'
// formatDate('2025-05-14T00:00:00.000Z', 'h:mm a')          // Returns: '12:00 AM'

export function formatDate(dateString: string, formatPattern = 'MMMM d, yyyy') {
  try {
    // Parse the ISO string into a Date object
    const date = parseISO(dateString)

    // Format the date with the provided pattern
    return format(date, formatPattern)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

export function camelCaseString(str: string) {
  return str
    .toLowerCase()
    .split(' ')
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join('')
}
