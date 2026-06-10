/**
 * Strips HTML tags from an input string to prevent XSS attacks.
 * @param {string|any} input - The input string to sanitize.
 * @returns {string} The sanitized plain text.
 */
export const sanitize = (input) => {
  if (input === null || input === undefined) return '';
  const str = String(input);
  // RegEx to strip any HTML elements
  return str.replace(/<\/?[^>]+(>|$)/g, '');
};
