/**
 * Official cyber crime category IDs and their readable labels.
 */
export const CATEGORIES = {
  1: 'Online Fraud',
  2: 'Cyberbullying',
  3: 'Identity Theft',
  4: 'Hacking',
  5: 'Phishing',
  6: 'Ransomware',
  7: 'Child Exploitation',
  8: 'Other'
};

/**
 * Returns the text label for a given category ID.
 * @param {number|string} id - The category ID from the DB.
 * @returns {string} The text label.
 */
export const getCategoryName = (id) => {
  const numId = Number(id);
  return CATEGORIES[numId] || 'Other';
};

/**
 * Returns an array of category objects for selection dropdowns.
 */
export const getCategoriesList = () => {
  return Object.entries(CATEGORIES).map(([id, name]) => ({
    id: Number(id),
    name
  }));
};
