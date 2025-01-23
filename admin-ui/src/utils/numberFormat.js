// Currency configurations
export const CURRENCIES = {
  USD: {
    symbol: "$",
    code: "USD",
    position: "before",
    decimals: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  BDT: {
    symbol: "$",
    code: "BDT",
    position: "before",
    decimals: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  EUR: {
    symbol: "€",
    code: "EUR",
    position: "after", // Euro often goes after in many countries
    decimals: 2,
    thousandsSeparator: ".",
    decimalSeparator: ",",
  },
  // Add more as needed
};

/**
 * Formats any number (integer, float, decimal) with thousand separators
 * @param {number} value - The number to format
 * @param {Object} options - Formatting options
 * @param {number} [options.decimals] - Number of decimal places (defaults to actual decimal places in number)
 * @param {string} [options.separator=','] - Thousand separator character
 * @param {string} [options.decimalPoint='.'] - Decimal point character
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, options = {}) => {
  const { decimals, separator = ",", decimalPoint = "." } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }

  try {
    const num = Number(value);

    // If decimals is not specified, use the actual number of decimal places
    const decimalPlaces =
      decimals ?? (num.toString().split(".")[1]?.length || 0);

    // Format the number with locale string
    const parts = num.toFixed(decimalPlaces).split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    const decimalPart = parts[1] || "";

    return decimalPart
      ? `${integerPart}${decimalPoint}${decimalPart}`
      : integerPart;
  } catch (error) {
    console.error("Error formatting number:", error);
    return "-";
  }
};

/**
 * Formats a number with currency
 * @param {number} value - The number to format
 * @param {Object} options - Formatting options
 * @param {string} [options.currencyCode='BDT'] - Currency code (BDT, USD, EUR, etc.)
 * @param {boolean} [options.useSymbol=true] - Use currency symbol instead of code
 * @param {number} [options.decimals] - Override default currency decimals
 * @returns {string} Formatted number string
 */
export const formatCurrency = (value, options = {}) => {
  const { currencyCode = "BDT", useSymbol = true, decimals } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }

  try {
    const currency = CURRENCIES[currencyCode] || CURRENCIES.BDT;
    const num = Number(value);

    // Use provided decimals or currency default
    const decimalPlaces = decimals ?? currency.decimals;

    // Format the number
    const parts = num.toFixed(decimalPlaces).split(".");
    const integerPart = parts[0].replace(
      /\B(?=(\d{3})+(?!\d))/g,
      currency.thousandsSeparator
    );
    const decimalPart = parts[1] || "";

    const formattedNumber = decimalPart
      ? `${integerPart}${currency.decimalSeparator}${decimalPart}`
      : integerPart;

    const currencyIdentifier = useSymbol ? currency.symbol : currency.code;

    return currency.position === "before"
      ? `${currencyIdentifier} ${formattedNumber}`
      : `${formattedNumber} ${currencyIdentifier}`;
  } catch (error) {
    console.error("Error formatting currency:", error);
    return "-";
  }
};

// Helper for formatting integers
export const formatInteger = (value, separator = ",") => {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }

  try {
    return Number(value).toLocaleString("en-US", {
      maximumFractionDigits: 2,
      useGrouping: true,
    });
  } catch (error) {
    console.error("Error formatting integer:", error);
    return "-";
  }
};
