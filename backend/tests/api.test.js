const { describe, test, before, after } = require('node:test');
const assert = require('node:assert');
const createApp = require('../src/app');

const app = createApp();
let server;
let baseUrl = '';

let donorToken = '';
let hospitalToken = '';
let adminToken = '';
let createdRequestId = '';

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe('Smart Blood Donor System End-to-End API Suite', () => {
  test('GET /api/health returns healthy system status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'healthy');
  });

  test('POST /api/auth/login allows Admin login with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@demo.com', password: 'AdminPassword123!' })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.user.role, 'ADMIN');
    assert.ok(body.token);
    adminToken = body.token;
  });

  test('POST /api/auth/login allows Hospital login', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'cityhospital@demo.com', password: 'Password123!' })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.user.role, 'HOSPITAL');
    assert.ok(body.token);
    hospitalToken = body.token;
  });

  test('POST /api/auth/login allows Donor login', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'donor@demo.com', password: 'Password123!' })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.user.role, 'DONOR');
    assert.ok(body.token);
    donorToken = body.token;
  });

  test('GET /api/auth/me returns current user identity with token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${donorToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.user.email, 'donor@demo.com');
    assert.ok(body.user.donorProfile);
  });

  test('RBAC: Non-admin user cannot access Admin stats (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${donorToken}` }
    });
    assert.strictEqual(res.status, 403);
  });

  test('Admin user can view platform stats and overview', async () => {
    const res = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.stats.totalDonors > 0);
    assert.ok(body.stats.totalHospitals > 0);
  });

  test('Hospital can create new blood request', async () => {
    const res = await fetch(`${baseUrl}/api/hospitals/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hospitalToken}`
      },
      body: JSON.stringify({
        patientNameOrId: 'Automated Test Patient (#AUT-101)',
        patientAge: 32,
        bloodGroup: 'A+',
        unitsRequired: 2,
        urgency: 'HIGH',
        requiredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Pre-operative test request'
      })
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.request.bloodGroup, 'A+');
    createdRequestId = body.request.id;
  });

  test('Hospital can retrieve compatible donors with prioritized scores', async () => {
    const res = await fetch(`${baseUrl}/api/hospitals/requests/${createdRequestId}/compatible-donors`, {
      headers: { 'Authorization': `Bearer ${hospitalToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.donors.length > 0);

    const first = body.donors[0];
    assert.ok(first.suitabilityScore >= 0 && first.suitabilityScore <= 100);
    assert.ok(first.priorityTier);
    assert.ok(Array.isArray(first.contributingFactors));
  });

  test('Donor can view matching requests', async () => {
    const res = await fetch(`${baseUrl}/api/donors/matching-requests`, {
      headers: { 'Authorization': `Bearer ${donorToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.requests));
  });

  test('Donor can express interest in the new blood request', async () => {
    const res = await fetch(`${baseUrl}/api/donors/responses/${createdRequestId}/interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${donorToken}`
      },
      body: JSON.stringify({ notes: 'Available immediately' })
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.response.status, 'INTERESTED');
  });

  test('Duplicate interest prevention rejects second submission (409 Conflict)', async () => {
    const res = await fetch(`${baseUrl}/api/donors/responses/${createdRequestId}/interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${donorToken}`
      },
      body: JSON.stringify({ notes: 'Duplicate attempt' })
    });
    assert.strictEqual(res.status, 409);
  });
});
