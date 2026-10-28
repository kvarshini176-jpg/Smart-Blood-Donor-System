const { describe, test } = require('node:test');
const assert = require('node:assert');
const {
  isCompatible,
  getCompatibleDonorGroups,
  getReceivableRecipientGroups,
  getCompatibilityLevel
} = require('../src/services/bloodCompatibility');

describe('Red Blood Cell Transfusion Compatibility Rules', () => {
  test('O- Universal Donor can donate to all 8 blood groups', () => {
    const allGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
    for (const recipient of allGroups) {
      assert.strictEqual(isCompatible('O-', recipient), true);
    }
  });

  test('O+ can donate only to positive types (O+, A+, B+, AB+)', () => {
    assert.strictEqual(isCompatible('O+', 'O+'), true);
    assert.strictEqual(isCompatible('O+', 'A+'), true);
    assert.strictEqual(isCompatible('O+', 'B+'), true);
    assert.strictEqual(isCompatible('O+', 'AB+'), true);
    
    // Incompatible with negative types
    assert.strictEqual(isCompatible('O+', 'O-'), false);
    assert.strictEqual(isCompatible('O+', 'A-'), false);
    assert.strictEqual(isCompatible('O+', 'B-'), false);
    assert.strictEqual(isCompatible('O+', 'AB-'), false);
  });

  test('A- can donate to A-, A+, AB-, AB+', () => {
    assert.strictEqual(isCompatible('A-', 'A-'), true);
    assert.strictEqual(isCompatible('A-', 'A+'), true);
    assert.strictEqual(isCompatible('A-', 'AB-'), true);
    assert.strictEqual(isCompatible('A-', 'AB+'), true);
    assert.strictEqual(isCompatible('A-', 'B+'), false);
    assert.strictEqual(isCompatible('A-', 'O+'), false);
  });

  test('A+ can donate only to A+ and AB+', () => {
    assert.strictEqual(isCompatible('A+', 'A+'), true);
    assert.strictEqual(isCompatible('A+', 'AB+'), true);
    assert.strictEqual(isCompatible('A+', 'B+'), false);
    assert.strictEqual(isCompatible('A+', 'O+'), false);
    assert.strictEqual(isCompatible('A+', 'A-'), false);
  });

  test('B- can donate to B-, B+, AB-, AB+', () => {
    assert.strictEqual(isCompatible('B-', 'B-'), true);
    assert.strictEqual(isCompatible('B-', 'B+'), true);
    assert.strictEqual(isCompatible('B-', 'AB-'), true);
    assert.strictEqual(isCompatible('B-', 'AB+'), true);
    assert.strictEqual(isCompatible('B-', 'A+'), false);
  });

  test('B+ can donate only to B+ and AB+', () => {
    assert.strictEqual(isCompatible('B+', 'B+'), true);
    assert.strictEqual(isCompatible('B+', 'AB+'), true);
    assert.strictEqual(isCompatible('B+', 'A+'), false);
    assert.strictEqual(isCompatible('B+', 'O-'), false);
  });

  test('AB- can donate to AB- and AB+', () => {
    assert.strictEqual(isCompatible('AB-', 'AB-'), true);
    assert.strictEqual(isCompatible('AB-', 'AB+'), true);
    assert.strictEqual(isCompatible('AB-', 'A+'), false);
    assert.strictEqual(isCompatible('AB-', 'B+'), false);
  });

  test('AB+ Universal Recipient donor can only donate to AB+', () => {
    assert.strictEqual(isCompatible('AB+', 'AB+'), true);
    assert.strictEqual(isCompatible('AB+', 'A+'), false);
    assert.strictEqual(isCompatible('AB+', 'B+'), false);
    assert.strictEqual(isCompatible('AB+', 'O+'), false);
    assert.strictEqual(isCompatible('AB+', 'O-'), false);
  });

  test('getCompatibleDonorGroups returns complete list of allowed donors', () => {
    assert.deepStrictEqual(getCompatibleDonorGroups('O-'), ['O-']);
    assert.deepStrictEqual(getCompatibleDonorGroups('AB+'), ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']);
    assert.deepStrictEqual(getCompatibleDonorGroups('A+'), ['O-', 'O+', 'A-', 'A+']);
  });

  test('getCompatibilityLevel assigns 1.0 for exact and 0.85 for compatible', () => {
    assert.strictEqual(getCompatibilityLevel('A+', 'A+'), 1.0);
    assert.strictEqual(getCompatibilityLevel('O-', 'A+'), 0.85);
    assert.strictEqual(getCompatibilityLevel('B+', 'A+'), 0.0);
  });
});
