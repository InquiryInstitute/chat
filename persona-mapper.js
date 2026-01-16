/**
 * Persona Mapper for LibreChat
 * Maps short persona names (e.g., "plato") to full slugs (e.g., "a.plato")
 * 
 * This is used as a custom endpoint middleware or plugin to handle persona selection
 */

// Common persona mappings
const PERSONA_MAP = {
  // Philosophy
  'plato': 'a.plato',
  'aristotle': 'a.aristotle',
  'kant': 'a.kant',
  'nietzsche': 'a.nietzsche',
  'hegel': 'a.hegel',
  'socrates': 'a.socrates',
  'confucius': 'a.confucius',
  'laozi': 'a.laozi',
  'spinoza': 'a.spinoza',
  'descartes': 'a.descartes',
  'hume': 'a.hume',
  'schopenhauer': 'a.schopenhauer',
  'wittgenstein': 'a.wittgenstein',
  'rawls': 'a.rawls',
  
  // Science
  'einstein': 'a.einstein',
  'darwin': 'a.darwin',
  'curie': 'a.curie',
  'turing': 'a.turing',
  'lovelace': 'a.lovelace',
  'newton': 'a.newton',
  'galileo': 'a.galileo',
  
  // Literature
  'shelley': 'a.shelley',
  'byron': 'a.byron',
  'shakespeare': 'a.shakespeare',
  'dickens': 'a.dickens',
  
  // Add more mappings as needed
};

/**
 * Normalize persona input to full slug format
 * @param {string} input - User input (e.g., "plato", "Plato", "a.plato")
 * @returns {string} - Normalized persona slug (e.g., "a.plato")
 */
function normalizePersona(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  const trimmed = input.trim().toLowerCase();
  
  // If already in correct format (a.xxx), return as-is
  if (trimmed.startsWith('a.')) {
    return trimmed;
  }
  
  // Check if it's in our mapping
  if (PERSONA_MAP[trimmed]) {
    return PERSONA_MAP[trimmed];
  }
  
  // Try to construct: if input is "plato", try "a.plato"
  const candidate = `a.${trimmed}`;
  
  // If the candidate exists in our map values, return it
  if (Object.values(PERSONA_MAP).includes(candidate)) {
    return candidate;
  }
  
  // Default: return the constructed form
  return candidate;
}

/**
 * Get persona display name from slug
 * @param {string} slug - Persona slug (e.g., "a.plato")
 * @returns {string} - Display name (e.g., "Plato")
 */
function getPersonaDisplayName(slug) {
  if (!slug) return '';
  
  // Remove "a." prefix and capitalize
  const name = slug.replace(/^a\./, '').replace(/^a-/, '');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Get all available personas
 * @returns {Array} - Array of {slug, displayName} objects
 */
function getAllPersonas() {
  return Object.values(PERSONA_MAP).map(slug => ({
    slug,
    displayName: getPersonaDisplayName(slug),
  }));
}

module.exports = {
  normalizePersona,
  getPersonaDisplayName,
  getAllPersonas,
  PERSONA_MAP,
};
