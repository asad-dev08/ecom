import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

/**
 * Format a date string or timestamp
 * @param {string|Date} date - The date to format
 * @param {string} format - Optional format string (defaults to 'lll')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = "lll") => {
  if (!date) return "-";
  return dayjs(date).format(format);
};

/**
 * Get relative time from now
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return "-";
  return dayjs(date).fromNow();
};

/**
 * Format date with custom options
 * @param {string|Date} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDateCustom = (date, options = {}) => {
  if (!date) return "-";
  const { format = "lll", relative = false, withTime = true } = options;

  if (relative) {
    return getRelativeTime(date);
  }

  if (!withTime) {
    return dayjs(date).format("ll");
  }

  return dayjs(date).format(format);
};

/**
 * Common date formats
 */
export const DATE_FORMATS = {
  SHORT: "MM/DD/YYYY",
  LONG: "MMMM D, YYYY",
  WITH_TIME: "MM/DD/YYYY HH:mm",
  FULL: "MMMM D, YYYY HH:mm:ss",
  ISO: "YYYY-MM-DD",
  TIME: "HH:mm:ss",
};
