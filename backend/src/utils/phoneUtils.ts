export function normalizePhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Phone number is required');
  }

  // Strip spaces, dashes, hyphens, parentheses, and dots
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '').trim();

  // Preserve whatsapp: prefix if passed
  let isWhatsApp = false;
  if (cleaned.toLowerCase().startsWith('whatsapp:')) {
    isWhatsApp = true;
    cleaned = cleaned.substring(9);
  }

  // If phone starts with '00', replace with '+'
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // If no leading '+':
  // If 10 digits (e.g. 9441005233), default to India (+91)
  if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      cleaned = '+91' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }

  // Standard E.164 validation regex: + followed by 7-15 digits
  const e164Regex = /^\+[1-9]\d{6,14}$/;
  if (!e164Regex.test(cleaned)) {
    throw new Error(
      `Invalid phone number format: "${phone}". Please enter a valid number (e.g. +919441005233 or 9441005233).`
    );
  }

  return isWhatsApp ? `whatsapp:${cleaned}` : cleaned;
}
