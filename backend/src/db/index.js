const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
const rawDb = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for high performance and strict relational integrity
rawDb.exec('PRAGMA foreign_keys = ON;');
rawDb.exec('PRAGMA journal_mode = WAL;');

// Initialize Schema
rawDb.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS donor_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    phone TEXT NOT NULL,
    gender TEXT,
    date_of_birth TEXT,
    age INTEGER NOT NULL DEFAULT 25,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    locality TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    last_donation_date TEXT,
    is_available INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS hospital_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_name TEXT NOT NULL,
    reg_number TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    locality TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    verification_status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS blood_requests (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL REFERENCES hospital_profiles(id) ON DELETE CASCADE,
    patient_name_or_id TEXT NOT NULL,
    patient_age INTEGER NOT NULL DEFAULT 30,
    blood_group TEXT NOT NULL,
    units_required INTEGER NOT NULL,
    units_fulfilled INTEGER NOT NULL DEFAULT 0,
    urgency TEXT NOT NULL DEFAULT 'NORMAL',
    required_date TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'OPEN',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS donor_responses (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
    donor_id TEXT NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'INTERESTED',
    notes TEXT,
    scheduled_at TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(request_id, donor_id)
  );

  CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
    donor_id TEXT NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
    hospital_id TEXT NOT NULL REFERENCES hospital_profiles(id) ON DELETE CASCADE,
    donor_response_id TEXT UNIQUE NOT NULL REFERENCES donor_responses(id) ON DELETE CASCADE,
    units_donated INTEGER NOT NULL DEFAULT 1,
    donation_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONFIRMED',
    remarks TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    related_entity_id TEXT,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS hospital_verifications (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL REFERENCES hospital_profiles(id) ON DELETE CASCADE,
    reviewed_by_admin_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    review_notes TEXT,
    reviewed_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_donor_bg ON donor_profiles(blood_group);
  CREATE INDEX IF NOT EXISTS idx_req_status ON blood_requests(status);
  CREATE INDEX IF NOT EXISTS idx_req_bg ON blood_requests(blood_group);
  CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read);
  CREATE INDEX IF NOT EXISTS idx_resp_req ON donor_responses(request_id);
  CREATE INDEX IF NOT EXISTS idx_resp_donor ON donor_responses(donor_id);
`);

function uuid() {
  return crypto.randomUUID();
}

function nowIso() {
  return new Date().toISOString();
}

// Helpers to format rows to camelCase
function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapDonorProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    bloodGroup: row.blood_group,
    phone: row.phone,
    gender: row.gender,
    dateOfBirth: row.date_of_birth,
    age: row.age,
    state: row.state,
    city: row.city,
    locality: row.locality,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    lastDonationDate: row.last_donation_date,
    isAvailable: Boolean(row.is_available),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapHospitalProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    hospitalName: row.hospital_name,
    regNumber: row.reg_number,
    contactPerson: row.contact_person,
    contactPhone: row.contact_phone,
    email: row.email,
    address: row.address,
    state: row.state,
    city: row.city,
    locality: row.locality,
    latitude: row.latitude,
    longitude: row.longitude,
    verificationStatus: row.verification_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapBloodRequest(row) {
  if (!row) return null;
  return {
    id: row.id,
    hospitalId: row.hospital_id,
    patientNameOrId: row.patient_name_or_id,
    patientAge: row.patient_age,
    bloodGroup: row.blood_group,
    unitsRequired: row.units_required,
    unitsFulfilled: row.units_fulfilled,
    urgency: row.urgency,
    requiredDate: row.required_date,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapDonorResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    requestId: row.request_id,
    donorId: row.donor_id,
    status: row.status,
    notes: row.notes,
    scheduledAt: row.scheduled_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapDonation(row) {
  if (!row) return null;
  return {
    id: row.id,
    requestId: row.request_id,
    donorId: row.donor_id,
    hospitalId: row.hospital_id,
    donorResponseId: row.donor_response_id,
    unitsDonated: row.units_donated,
    donationDate: row.donation_date,
    status: row.status,
    remarks: row.remarks,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    relatedEntityId: row.related_entity_id,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at
  };
}

function mapHospitalVerification(row) {
  if (!row) return null;
  return {
    id: row.id,
    hospitalId: row.hospital_id,
    reviewedByAdminId: row.reviewed_by_admin_id,
    status: row.status,
    reviewNotes: row.review_notes,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at
  };
}

function mapAuditLog(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    details: row.details,
    ipAddress: row.ip_address,
    createdAt: row.created_at
  };
}

// Relational DB client matching Prisma ergonomics
const db = {
  raw: rawDb,

  $transaction: async (fn) => {
    rawDb.exec('BEGIN TRANSACTION;');
    try {
      const result = await fn(db);
      rawDb.exec('COMMIT;');
      return result;
    } catch (err) {
      rawDb.exec('ROLLBACK;');
      throw err;
    }
  },

  user: {
    findUnique: async ({ where }) => {
      let row = null;
      if (where.id) {
        row = rawDb.prepare('SELECT * FROM users WHERE id = ?').get(where.id);
      } else if (where.email) {
        row = rawDb.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(where.email);
      }
      if (!row) return null;
      const user = mapUser(row);
      user.donorProfile = await db.donorProfile.findUnique({ where: { userId: user.id } });
      user.hospitalProfile = await db.hospitalProfile.findUnique({ where: { userId: user.id } });
      return user;
    },

    findMany: async ({ where = {}, orderBy = {} } = {}) => {
      let sql = 'SELECT * FROM users';
      const params = [];
      const clauses = [];
      if (where.role) {
        clauses.push('role = ?');
        params.push(where.role);
      }
      if (where.isActive !== undefined) {
        clauses.push('is_active = ?');
        params.push(where.isActive ? 1 : 0);
      }
      if (clauses.length > 0) sql += ' WHERE ' + clauses.join(' AND ');
      sql += ' ORDER BY created_at DESC';

      const rows = rawDb.prepare(sql).all(...params);
      const results = [];
      for (const r of rows) {
        const u = mapUser(r);
        u.donorProfile = await db.donorProfile.findUnique({ where: { userId: u.id } });
        u.hospitalProfile = await db.hospitalProfile.findUnique({ where: { userId: u.id } });
        results.push(u);
      }
      return results;
    },

    count: async ({ where = {} } = {}) => {
      let sql = 'SELECT COUNT(*) as count FROM users';
      const params = [];
      if (where.role) {
        sql += ' WHERE role = ?';
        params.push(where.role);
      }
      return rawDb.prepare(sql).get(...params).count;
    },

    create: async ({ data }) => {
      const id = data.id || uuid();
      const now = nowIso();
      rawDb.prepare(`
        INSERT INTO users (id, email, password_hash, role, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, data.email.toLowerCase(), data.passwordHash, data.role, data.isActive !== false ? 1 : 0, now, now);
      return db.user.findUnique({ where: { id } });
    },

    update: async ({ where, data }) => {
      const now = nowIso();
      const updates = [];
      const params = [];
      if (data.isActive !== undefined) {
        updates.push('is_active = ?');
        params.push(data.isActive ? 1 : 0);
      }
      if (data.passwordHash) {
        updates.push('password_hash = ?');
        params.push(data.passwordHash);
      }
      updates.push('updated_at = ?');
      params.push(now);
      params.push(where.id);

      rawDb.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      return db.user.findUnique({ where: { id: where.id } });
    }
  },

  donorProfile: {
    findUnique: async ({ where }) => {
      let row = null;
      if (where.id) {
        row = rawDb.prepare('SELECT * FROM donor_profiles WHERE id = ?').get(where.id);
      } else if (where.userId) {
        row = rawDb.prepare('SELECT * FROM donor_profiles WHERE user_id = ?').get(where.userId);
      }
      if (!row) return null;
      const profile = mapDonorProfile(row);
      const counts = rawDb.prepare(`
        SELECT 
          (SELECT COUNT(*) FROM donations WHERE donor_id = ?) as donations,
          (SELECT COUNT(*) FROM donor_responses WHERE donor_id = ?) as responses
      `).get(profile.id, profile.id);
      profile._count = { donations: counts.donations, responses: counts.responses };
      return profile;
    },

    findMany: async ({ where = {} } = {}) => {
      let sql = `
        SELECT dp.*, u.is_active as user_active, u.email as user_email
        FROM donor_profiles dp
        JOIN users u ON dp.user_id = u.id
      `;
      const clauses = [];
      const params = [];
      if (where.isAvailable !== undefined) {
        clauses.push('dp.is_available = ?');
        params.push(where.isAvailable ? 1 : 0);
      }
      if (where.bloodGroup) {
        clauses.push('dp.blood_group = ?');
        params.push(where.bloodGroup);
      }
      if (where.user?.isActive !== undefined) {
        clauses.push('u.is_active = ?');
        params.push(where.user.isActive ? 1 : 0);
      }
      if (clauses.length > 0) sql += ' WHERE ' + clauses.join(' AND ');
      sql += ' ORDER BY dp.created_at DESC';

      const rows = rawDb.prepare(sql).all(...params);
      const list = [];
      for (const r of rows) {
        const d = mapDonorProfile(r);
        d.user = { id: d.userId, email: r.user_email, isActive: Boolean(r.user_active) };
        const counts = rawDb.prepare(`
          SELECT 
            (SELECT COUNT(*) FROM donations WHERE donor_id = ?) as donations,
            (SELECT COUNT(*) FROM donor_responses WHERE donor_id = ?) as responses
        `).get(d.id, d.id);
        d._count = { donations: counts.donations, responses: counts.responses };
        d.responses = rawDb.prepare('SELECT id, request_id as requestId, status FROM donor_responses WHERE donor_id = ?').all(d.id);
        list.push(d);
      }
      return list;
    },

    count: async () => {
      return rawDb.prepare('SELECT COUNT(*) as count FROM donor_profiles').get().count;
    },

    create: async ({ data }) => {
      const id = data.id || uuid();
      const now = nowIso();
      rawDb.prepare(`
        INSERT INTO donor_profiles (
          id, user_id, full_name, blood_group, phone, gender, date_of_birth, age,
          state, city, locality, address, latitude, longitude, last_donation_date,
          is_available, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, data.userId, data.fullName, data.bloodGroup, data.phone, data.gender || null,
        data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null, data.age || 25,
        data.state || 'State', data.city || 'City', data.locality || 'Locality', data.address || 'Address',
        data.latitude != null ? data.latitude : null, data.longitude != null ? data.longitude : null,
        data.lastDonationDate ? new Date(data.lastDonationDate).toISOString() : null,
        data.isAvailable !== false ? 1 : 0, now, now
      );
      return db.donorProfile.findUnique({ where: { id } });
    },

    update: async ({ where, data }) => {
      const now = nowIso();
      const updates = [];
      const params = [];
      if (data.phone) { updates.push('phone = ?'); params.push(data.phone); }
      if (data.state) { updates.push('state = ?'); params.push(data.state); }
      if (data.city) { updates.push('city = ?'); params.push(data.city); }
      if (data.locality) { updates.push('locality = ?'); params.push(data.locality); }
      if (data.address) { updates.push('address = ?'); params.push(data.address); }
      if (data.isAvailable !== undefined) { updates.push('is_available = ?'); params.push(data.isAvailable ? 1 : 0); }
      if (data.lastDonationDate !== undefined) {
        updates.push('last_donation_date = ?');
        params.push(data.lastDonationDate ? new Date(data.lastDonationDate).toISOString() : null);
      }
      if (data.latitude !== undefined) { updates.push('latitude = ?'); params.push(data.latitude); }
      if (data.longitude !== undefined) { updates.push('longitude = ?'); params.push(data.longitude); }
      updates.push('updated_at = ?');
      params.push(now);

      const targetId = where.id || (await db.donorProfile.findUnique({ where }))?.id;
      params.push(targetId);

      rawDb.prepare(`UPDATE donor_profiles SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      return db.donorProfile.findUnique({ where: { id: targetId } });
    }
  },

  hospitalProfile: {
    findUnique: async ({ where }) => {
      let row = null;
      if (where.id) {
        row = rawDb.prepare('SELECT * FROM hospital_profiles WHERE id = ?').get(where.id);
      } else if (where.userId) {
        row = rawDb.prepare('SELECT * FROM hospital_profiles WHERE user_id = ?').get(where.userId);
      }
      if (!row) return null;
      const profile = mapHospitalProfile(row);
      const counts = rawDb.prepare(`
        SELECT 
          (SELECT COUNT(*) FROM blood_requests WHERE hospital_id = ?) as requests,
          (SELECT COUNT(*) FROM donations WHERE hospital_id = ?) as donations
      `).get(profile.id, profile.id);
      profile._count = { bloodRequests: counts.requests, donations: counts.donations };
      profile.user = mapUser(rawDb.prepare('SELECT * FROM users WHERE id = ?').get(profile.userId));
      return profile;
    },

    findMany: async ({ where = {} } = {}) => {
      let sql = 'SELECT * FROM hospital_profiles';
      const clauses = [];
      const params = [];
      if (where.verificationStatus) {
        clauses.push('verification_status = ?');
        params.push(where.verificationStatus);
      }
      if (clauses.length > 0) sql += ' WHERE ' + clauses.join(' AND ');
      sql += ' ORDER BY created_at DESC';

      const rows = rawDb.prepare(sql).all(...params);
      const list = [];
      for (const r of rows) {
        const h = mapHospitalProfile(r);
        h.user = mapUser(rawDb.prepare('SELECT * FROM users WHERE id = ?').get(h.userId));
        const counts = rawDb.prepare(`
          SELECT 
            (SELECT COUNT(*) FROM blood_requests WHERE hospital_id = ?) as requests,
            (SELECT COUNT(*) FROM donations WHERE hospital_id = ?) as donations
        `).get(h.id, h.id);
        h._count = { bloodRequests: counts.requests, donations: counts.donations };
        list.push(h);
      }
      return list;
    },

    count: async ({ where = {} } = {}) => {
      let sql = 'SELECT COUNT(*) as count FROM hospital_profiles';
      const params = [];
      if (where.verificationStatus) {
        sql += ' WHERE verification_status = ?';
        params.push(where.verificationStatus);
      }
      return rawDb.prepare(sql).get(...params).count;
    },

    create: async ({ data }) => {
      const id = data.id || uuid();
      const now = nowIso();
      rawDb.prepare(`
        INSERT INTO hospital_profiles (
          id, user_id, hospital_name, reg_number, contact_person, contact_phone,
          email, address, state, city, locality, latitude, longitude,
          verification_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, data.userId, data.hospitalName, data.regNumber, data.contactPerson, data.contactPhone,
        data.email, data.address || 'Address', data.state || 'State', data.city || 'City', data.locality || 'Locality',
        data.latitude != null ? data.latitude : null, data.longitude != null ? data.longitude : null,
        data.verificationStatus || 'PENDING', now, now
      );
      return db.hospitalProfile.findUnique({ where: { id } });
    },

    update: async ({ where, data }) => {
      const now = nowIso();
      const updates = [];
      const params = [];
      if (data.hospitalName) { updates.push('hospital_name = ?'); params.push(data.hospitalName); }
      if (data.contactPerson) { updates.push('contact_person = ?'); params.push(data.contactPerson); }
      if (data.contactPhone) { updates.push('contact_phone = ?'); params.push(data.contactPhone); }
      if (data.address) { updates.push('address = ?'); params.push(data.address); }
      if (data.state) { updates.push('state = ?'); params.push(data.state); }
      if (data.city) { updates.push('city = ?'); params.push(data.city); }
      if (data.locality) { updates.push('locality = ?'); params.push(data.locality); }
      if (data.verificationStatus) { updates.push('verification_status = ?'); params.push(data.verificationStatus); }
      if (data.latitude !== undefined) { updates.push('latitude = ?'); params.push(data.latitude); }
      if (data.longitude !== undefined) { updates.push('longitude = ?'); params.push(data.longitude); }
      updates.push('updated_at = ?');
      params.push(now);

      const targetId = where.id || (await db.hospitalProfile.findUnique({ where }))?.id;
      params.push(targetId);

      rawDb.prepare(`UPDATE hospital_profiles SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      return db.hospitalProfile.findUnique({ where: { id: targetId } });
    }
  },

  bloodRequest: {
    findUnique: async ({ where }) => {
      const row = rawDb.prepare('SELECT * FROM blood_requests WHERE id = ?').get(where.id);
      if (!row) return null;
      const r = mapBloodRequest(row);
      r.hospital = mapHospitalProfile(rawDb.prepare('SELECT * FROM hospital_profiles WHERE id = ?').get(r.hospitalId));
      if (r.hospital) {
        r.hospital.user = mapUser(rawDb.prepare('SELECT * FROM users WHERE id = ?').get(r.hospital.userId));
      }
      const respRows = rawDb.prepare('SELECT * FROM donor_responses WHERE request_id = ? ORDER BY created_at DESC').all(r.id);
      r.responses = [];
      for (const respRow of respRows) {
        const resp = mapDonorResponse(respRow);
        resp.donor = mapDonorProfile(rawDb.prepare('SELECT * FROM donor_profiles WHERE id = ?').get(resp.donorId));
        if (resp.donor) {
          resp.donor.user = mapUser(rawDb.prepare('SELECT * FROM users WHERE id = ?').get(resp.donor.userId));
        }
        r.responses.push(resp);
      }
      r.donations = rawDb.prepare('SELECT * FROM donations WHERE request_id = ?').all(r.id).map(mapDonation);
      return r;
    },

    findMany: async ({ where = {}, orderBy = {} } = {}) => {
      let sql = 'SELECT * FROM blood_requests';
      const clauses = [];
      const params = [];
      if (where.hospitalId) {
        clauses.push('hospital_id = ?');
        params.push(where.hospitalId);
      }
      if (where.status) {
        if (typeof where.status === 'string') {
          clauses.push('status = ?');
          params.push(where.status);
        } else if (where.status.in) {
          const placeholders = where.status.in.map(() => '?').join(',');
          clauses.push(`status IN (${placeholders})`);
          params.push(...where.status.in);
        }
      }
      if (clauses.length > 0) sql += ' WHERE ' + clauses.join(' AND ');
      sql += ' ORDER BY created_at DESC';

      const rows = rawDb.prepare(sql).all(...params);
      const list = [];
      for (const row of rows) {
        const r = mapBloodRequest(row);
        r.hospital = mapHospitalProfile(rawDb.prepare('SELECT * FROM hospital_profiles WHERE id = ?').get(r.hospitalId));
        const counts = rawDb.prepare(`
          SELECT 
            (SELECT COUNT(*) FROM donor_responses WHERE request_id = ?) as responses,
            (SELECT COUNT(*) FROM donations WHERE request_id = ?) as donations
        `).get(r.id, r.id);
        r._count = { responses: counts.responses, donations: counts.donations };
        r.responses = rawDb.prepare('SELECT id, status, donor_id as donorId, created_at as createdAt FROM donor_responses WHERE request_id = ?').all(r.id);
        list.push(r);
      }
      return list;
    },

    count: async ({ where = {} } = {}) => {
      let sql = 'SELECT COUNT(*) as count FROM blood_requests';
      const params = [];
      if (where.status) {
        sql += ' WHERE status = ?';
        params.push(where.status);
      }
      return rawDb.prepare(sql).get(...params).count;
    },

    create: async ({ data }) => {
      const id = data.id || uuid();
      const now = nowIso();
      rawDb.prepare(`
        INSERT INTO blood_requests (
          id, hospital_id, patient_name_or_id, patient_age, blood_group,
          units_required, units_fulfilled, urgency, required_date, notes,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, data.hospitalId, data.patientNameOrId, data.patientAge || 30, data.bloodGroup,
        data.unitsRequired, data.unitsFulfilled || 0, data.urgency || 'NORMAL',
        new Date(data.requiredDate).toISOString(), data.notes || null,
        data.status || 'OPEN', now, now
      );
      return db.bloodRequest.findUnique({ where: { id } });
    },

    update: async ({ where, data }) => {
      const now = nowIso();
      const updates = [];
      const params = [];
      if (data.unitsRequired !== undefined) { updates.push('units_required = ?'); params.push(data.unitsRequired); }
      if (data.unitsFulfilled !== undefined) { updates.push('units_fulfilled = ?'); params.push(data.unitsFulfilled); }
      if (data.urgency) { updates.push('urgency = ?'); params.push(data.urgency); }
      if (data.notes !== undefined) { updates.push('notes = ?'); params.push(data.notes); }
      if (data.requiredDate) { updates.push('required_date = ?'); params.push(new Date(data.requiredDate).toISOString()); }
      if (data.status) { updates.push('status = ?'); params.push(data.status); }
      updates.push('updated_at = ?');
      params.push(now);

      params.push(where.id);
      rawDb.prepare(`UPDATE blood_requests SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      return db.bloodRequest.findUnique({ where: { id: where.id } });
    }
  },

  donorResponse: {
    findUnique: async ({ where }) => {
      let row = null;
      if (where.id) {
        row = rawDb.prepare('SELECT * FROM donor_responses WHERE id = ?').get(where.id);
      } else if (where.requestId_donorId) {
        row = rawDb.prepare('SELECT * FROM donor_responses WHERE request_id = ? AND donor_id = ?').get(
          where.requestId_donorId.requestId,
          where.requestId_donorId.donorId
        );
      }
      if (!row) return null;
      const resp = mapDonorResponse(row);
      resp.request = await db.bloodRequest.findUnique({ where: { id: resp.requestId } });
      resp.donor = await db.donorProfile.findUnique({ where: { id: resp.donorId } });
      if (resp.donor) {
        resp.donor.user = mapUser(rawDb.prepare('SELECT * FROM users WHERE id = ?').get(resp.donor.userId));
      }
      return resp;
    },

    findMany: async ({ where = {} } = {}) => {
      let sql = 'SELECT * FROM donor_responses';
      const clauses = [];
      const params = [];
      if (where.requestId) {
        clauses.push('request_id = ?');
        params.push(where.requestId);
      }
      if (where.donorId) {
        clauses.push('donor_id = ?');
        params.push(where.donorId);
      }
      if (where.status) {
        clauses.push('status = ?');
        params.push(where.status);
      }
      if (clauses.length > 0) sql += ' WHERE ' + clauses.join(' AND ');
      sql += ' ORDER BY created_at DESC';

      const rows = rawDb.prepare(sql).all(...params);
      const list = [];
      for (const row of rows) {
        const resp = mapDonorResponse(row);
        resp.request = await db.bloodRequest.findUnique({ where: { id: resp.requestId } });
        resp.donor = await db.donorProfile.findUnique({ where: { id: resp.donorId } });
        resp.donation = rawDb.prepare('SELECT * FROM donations WHERE donor_response_id = ?').get(resp.id);
        if (resp.donation) resp.donation = mapDonation(resp.donation);
        list.push(resp);
      }
      return list;
    },

    create: async ({ data }) => {
      const id = data.id || uuid();
      const now = nowIso();
      rawDb.prepare(`
        INSERT INTO donor_responses (
          id, request_id, donor_id, status, notes, scheduled_at, completed_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, data.requestId, data.donorId, data.status || 'INTERESTED', data.notes || null,
        data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
        data.completedAt ? new Date(data.completedAt).toISOString() : null,
        now, now
      );
      return db.donorResponse.findUnique({ where: { id } });
    },

    update: async ({ where, data }) => {
      const now = nowIso();
      const updates = [];
      const params = [];
      if (data.status) { updates.push('status = ?'); params.push(data.status); }
      if (data.notes !== undefined) { updates.push('notes = ?'); params.push(data.notes); }
      if (data.scheduledAt !== undefined) {
        updates.push('scheduled_at = ?');
        params.push(data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null);
      }
      if (data.completedAt !== undefined) {
        updates.push('completed_at = ?');
        params.push(data.completedAt ? new Date(data.completedAt).toISOString() : null);
      }
      updates.push('updated_at = ?');
      params.push(now);

      params.push(where.id);
      rawDb.prepare(`UPDATE donor_responses SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      return db.donorResponse.findUnique({ where: { id: where.id } });
    }
  },

  donation: {
    findMany: async ({ where = {} } = {}) => {
      let sql = 'SELECT * FROM donations';
      const clauses = [];
      const params = [];
      if (where.donorId) {
        clauses.push('donor_id = ?');
        params.push(where.donorId);
      }
      if (where.hospitalId) {
        clauses.push('hospital_id = ?');
        params.push(where.hospitalId);
      }
      if (where.status) {
        clauses.push('status = ?');
        params.push(where.status);
      }
      if (clauses.length > 0) sql += ' WHERE ' + clauses.join(' AND ');
      sql += ' ORDER BY donation_date DESC';

      const rows = rawDb.prepare(sql).all(...params);
      const list = [];
      for (const row of rows) {
        const d = mapDonation(row);
        d.hospital = await db.hospitalProfile.findUnique({ where: { id: d.hospitalId } });
        d.donor = await db.donorProfile.findUnique({ where: { id: d.donorId } });
        d.request = mapBloodRequest(rawDb.prepare('SELECT * FROM blood_requests WHERE id = ?').get(d.requestId));
        list.push(d);
      }
      return list;
    },

    count: async () => {
      return rawDb.prepare('SELECT COUNT(*) as count FROM donations').get().count;
    },

    create: async ({ data }) => {
      const id = data.id || uuid();
      const now = nowIso();
      rawDb.prepare(`
        INSERT INTO donations (
          id, request_id, donor_id, hospital_id, donor_response_id,
          units_donated, donation_date, status, remarks, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, data.requestId, data.donorId, data.hospitalId, data.donorResponseId,
        data.unitsDonated || 1, data.donationDate ? new Date(data.donationDate).toISOString() : now,
        data.status || 'CONFIRMED', data.remarks || null, now, now
      );
      const row = rawDb.prepare('SELECT * FROM donations WHERE id = ?').get(id);
      return mapDonation(row);
    }
  },

  notification: {
    findMany: async ({ where = {}, orderBy = {}, take = 50 } = {}) => {
      let sql = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?';
      const rows = rawDb.prepare(sql).all(where.userId, take);
      return rows.map(mapNotification);
    },

    count: async ({ where = {} } = {}) => {
      let sql = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?';
      const params = [where.userId];
      if (where.isRead !== undefined) {
        sql += ' AND is_read = ?';
        params.push(where.isRead ? 1 : 0);
      }
      return rawDb.prepare(sql).get(...params).count;
    },

    create: async ({ data }) => {
      const id = data.id || uuid();
      const now = nowIso();
      rawDb.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, related_entity_id, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, data.userId, data.title, data.message, data.type, data.relatedEntityId || null, data.isRead ? 1 : 0, now);
      return mapNotification(rawDb.prepare('SELECT * FROM notifications WHERE id = ?').get(id));
    },

    createMany: async ({ data }) => {
      const stmt = rawDb.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, related_entity_id, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const now = nowIso();
      for (const item of data) {
        stmt.run(uuid(), item.userId, item.title, item.message, item.type, item.relatedEntityId || null, item.isRead ? 1 : 0, now);
      }
      return { count: data.length };
    },

    updateMany: async ({ where = {}, data = {} }) => {
      let sql = 'UPDATE notifications SET is_read = ? WHERE user_id = ?';
      const params = [data.isRead ? 1 : 0, where.userId];
      if (where.id) {
        sql += ' AND id = ?';
        params.push(where.id);
      }
      if (where.isRead !== undefined) {
        sql += ' AND is_read = ?';
        params.push(where.isRead ? 1 : 0);
      }
      const result = rawDb.prepare(sql).run(...params);
      return { count: result.changes };
    }
  },

  hospitalVerification: {
    findMany: async ({ orderBy = {} } = {}) => {
      const rows = rawDb.prepare('SELECT * FROM hospital_verifications ORDER BY created_at DESC').all();
      const list = [];
      for (const r of rows) {
        const v = mapHospitalVerification(r);
        v.hospital = await db.hospitalProfile.findUnique({ where: { id: v.hospitalId } });
        if (v.reviewedByAdminId) {
          v.reviewedBy = mapUser(rawDb.prepare('SELECT * FROM users WHERE id = ?').get(v.reviewedByAdminId));
        }
        list.push(v);
      }
      return list;
    },

    create: async ({ data }) => {
      const id = data.id || uuid();
      const now = nowIso();
      rawDb.prepare(`
        INSERT INTO hospital_verifications (id, hospital_id, reviewed_by_admin_id, status, review_notes, reviewed_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, data.hospitalId, data.reviewedByAdminId || null, data.status || 'PENDING', data.reviewNotes || null, null, now);
      return mapHospitalVerification(rawDb.prepare('SELECT * FROM hospital_verifications WHERE id = ?').get(id));
    },

    update: async ({ where, data }) => {
      const updates = [];
      const params = [];
      if (data.status) { updates.push('status = ?'); params.push(data.status); }
      if (data.reviewNotes !== undefined) { updates.push('review_notes = ?'); params.push(data.reviewNotes); }
      if (data.reviewedByAdminId) { updates.push('reviewed_by_admin_id = ?'); params.push(data.reviewedByAdminId); }
      if (data.reviewedAt) { updates.push('reviewed_at = ?'); params.push(new Date(data.reviewedAt).toISOString()); }
      params.push(where.id);

      rawDb.prepare(`UPDATE hospital_verifications SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      return mapHospitalVerification(rawDb.prepare('SELECT * FROM hospital_verifications WHERE id = ?').get(where.id));
    }
  },

  auditLog: {
    findMany: async ({ take = 100 } = {}) => {
      const rows = rawDb.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?').all(take);
      const list = [];
      for (const r of rows) {
        const item = mapAuditLog(r);
        if (item.userId) {
          item.user = mapUser(rawDb.prepare('SELECT id, email, role FROM users WHERE id = ?').get(item.userId));
        }
        list.push(item);
      }
      return list;
    },

    create: async ({ data }) => {
      const id = data.id || uuid();
      const now = nowIso();
      rawDb.prepare(`
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, data.userId || null, data.action, data.entityType, data.entityId, data.details || null, data.ipAddress || null, now);
      return mapAuditLog(rawDb.prepare('SELECT * FROM audit_logs WHERE id = ?').get(id));
    }
  }
};

module.exports = db;
