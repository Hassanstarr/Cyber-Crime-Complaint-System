/**
 * Formats an ISO date string to a human-readable format.
 * @param {string|Date} dateString - The ISO date string or Date object.
 * @returns {string} The formatted date string (e.g. "Jun 10, 2026, 11:30 AM").
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
