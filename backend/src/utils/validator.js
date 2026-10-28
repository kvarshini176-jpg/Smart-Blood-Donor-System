const { VALID_BLOOD_GROUPS, normalizeGroup } = require('../services/bloodCompatibility');

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function isValidBloodGroup(bg) {
  const normalized = normalizeGroup(bg);
  return VALID_BLOOD_GROUPS.includes(normalized);
}

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidBloodGroup
};
