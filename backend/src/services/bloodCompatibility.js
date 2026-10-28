/**
 * Dedicated Blood Compatibility Service for Red Blood Cell Transfusions
 * 
 * Rules:
 * - O- can donate to: O-, O+, A-, A+, B-, B+, AB-, AB+ (Universal Donor)
 * - O+ can donate to: O+, A+, B+, AB+
 * - A- can donate to: A-, A+, AB-, AB+
 * - A+ can donate to: A+, AB+
 * - B- can donate to: B-, B+, AB-, AB+
 * - B+ can donate to: B+, AB+
 * - AB- can donate to: AB-, AB+
 * - AB+ can donate to: AB+ (Universal Recipient)
 */

// Mapping of Donor Group -> List of Compatible Recipient Groups
const DONOR_TO_RECIPIENT_MAP = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+']
};

// Reverse Mapping: Recipient Group -> Allowed Donor Groups
const RECIPIENT_TO_DONOR_MAP = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function normalizeGroup(bg) {
  if (!bg) return '';
  return bg.trim().toUpperCase().replace('_POS', '+').replace('_NEG', '-');
}

/**
 * Checks whether a donor's blood is red-cell compatible with the recipient's blood group
 */
function isCompatible(donorGroup, recipientGroup) {
  const d = normalizeGroup(donorGroup);
  const r = normalizeGroup(recipientGroup);
  
  if (!DONOR_TO_RECIPIENT_MAP[d] || !RECIPIENT_TO_DONOR_MAP[r]) {
    return false;
  }
  return DONOR_TO_RECIPIENT_MAP[d].includes(r);
}

/**
 * Returns list of donor blood groups compatible with the given recipient group
 */
function getCompatibleDonorGroups(recipientGroup) {
  const r = normalizeGroup(recipientGroup);
  return RECIPIENT_TO_DONOR_MAP[r] || [];
}

/**
 * Returns list of recipient blood groups the donor can give to
 */
function getReceivableRecipientGroups(donorGroup) {
  const d = normalizeGroup(donorGroup);
  return DONOR_TO_RECIPIENT_MAP[d] || [];
}

/**
 * Returns compatibility level: 1.0 if identical blood type, 0.85 if compatible alternative, 0.0 if incompatible
 */
function getCompatibilityLevel(donorGroup, recipientGroup) {
  const d = normalizeGroup(donorGroup);
  const r = normalizeGroup(recipientGroup);
  if (!isCompatible(d, r)) return 0.0;
  return d === r ? 1.0 : 0.85;
}

module.exports = {
  VALID_BLOOD_GROUPS,
  normalizeGroup,
  isCompatible,
  getCompatibleDonorGroups,
  getReceivableRecipientGroups,
  getCompatibilityLevel
};
