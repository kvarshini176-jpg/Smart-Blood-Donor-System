const bcrypt = require('bcryptjs');
const db = require('../src/db');

async function seed() {
  console.log('--- Seeding Smart Blood Donor System Relational Database ---');

  const defaultPassword = 'Password123!';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  const adminHashedPassword = await bcrypt.hash('AdminPassword123!', 10);

  // 1. Create Administrator
  let admin = await db.user.findUnique({ where: { email: 'admin@demo.com' } });
  if (!admin) {
    admin = await db.user.create({
      data: {
        email: 'admin@demo.com',
        passwordHash: adminHashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('✓ Admin account created: admin@demo.com / AdminPassword123!');
  }

  // 2. Create Hospitals
  const hospitalData = [
    {
      email: 'cityhospital@demo.com',
      name: 'City General Hospital',
      regNumber: 'HOSP-METRO-001',
      contactPerson: 'Dr. Aris Thorne (Chief Medical Officer)',
      phone: '+1 555-0199',
      address: '742 Evergreen Medical Parkway, Healthcare District',
      city: 'Metro City',
      state: 'Central State',
      locality: 'Downtown Health Zone',
      lat: 12.9716,
      lon: 77.5946,
      status: 'APPROVED'
    },
    {
      email: 'stjude@demo.com',
      name: 'St. Jude Healthcare & Research Hospital',
      regNumber: 'HOSP-METRO-002',
      contactPerson: 'Dr. Evelyn Vance (Blood Bank Director)',
      phone: '+1 555-0244',
      address: '108 Beacon Hill Boulevard',
      city: 'Metro City',
      state: 'Central State',
      locality: 'North Medical Sector',
      lat: 12.9850,
      lon: 77.6050,
      status: 'APPROVED'
    },
    {
      email: 'valleyclinic@demo.com',
      name: 'Valley Care Trauma & Surgical Center',
      regNumber: 'HOSP-METRO-003',
      contactPerson: 'Dr. Marcus Sterling',
      phone: '+1 555-0377',
      address: '45 Riverbank Crescent',
      city: 'Metro City',
      state: 'Central State',
      locality: 'South Valley',
      lat: 12.9400,
      lon: 77.5800,
      status: 'PENDING' // Pending admin verification
    }
  ];

  const hospitals = {};
  for (const h of hospitalData) {
    let u = await db.user.findUnique({ where: { email: h.email } });
    if (!u) {
      u = await db.user.create({
        data: {
          email: h.email,
          passwordHash: hashedPassword,
          role: 'HOSPITAL',
          isActive: true
        }
      });
      const hp = await db.hospitalProfile.create({
        data: {
          userId: u.id,
          hospitalName: h.name,
          regNumber: h.regNumber,
          contactPerson: h.contactPerson,
          contactPhone: h.phone,
          email: h.email,
          address: h.address,
          city: h.city,
          state: h.state,
          locality: h.locality,
          latitude: h.lat,
          longitude: h.lon,
          verificationStatus: h.status
        }
      });
      await db.hospitalVerification.create({
        data: {
          hospitalId: hp.id,
          status: h.status,
          reviewNotes: h.status === 'APPROVED' ? 'Verified by System Admin' : 'Awaiting review'
        }
      });
      hospitals[h.email] = hp;
      console.log(`✓ Hospital created: ${h.email} (${h.name}) - Status: ${h.status}`);
    } else {
      hospitals[h.email] = await db.hospitalProfile.findUnique({ where: { userId: u.id } });
    }
  }

  // 3. Create Donors
  const donorData = [
    {
      email: 'donor@demo.com',
      fullName: 'Rahul Sharma',
      bloodGroup: 'A+',
      phone: '+1 555-0101',
      age: 27,
      gender: 'Male',
      address: '14 Lotus Garden Apartments',
      city: 'Metro City',
      state: 'Central State',
      locality: 'Koramangala',
      lat: 12.9352,
      lon: 77.6245,
      lastDonationDate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), // 95 days ago -> fully eligible!
      isAvailable: true
    },
    {
      email: 'sarah@demo.com',
      fullName: 'Sarah Jenkins',
      bloodGroup: 'O-', // Universal Donor!
      phone: '+1 555-0102',
      age: 31,
      gender: 'Female',
      address: '88 Oakridge Heights',
      city: 'Metro City',
      state: 'Central State',
      locality: 'Indiranagar',
      lat: 12.9784,
      lon: 77.6408,
      lastDonationDate: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000),
      isAvailable: true
    },
    {
      email: 'david@demo.com',
      fullName: 'David Kim',
      bloodGroup: 'B+',
      phone: '+1 555-0103',
      age: 24,
      gender: 'Male',
      address: '52 Victoria Lane',
      city: 'Metro City',
      state: 'Central State',
      locality: 'MG Road Sector',
      lat: 12.9756,
      lon: 77.6066,
      lastDonationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Recent: 30 days
      isAvailable: true
    },
    {
      email: 'priya@demo.com',
      fullName: 'Priya Patel',
      bloodGroup: 'AB+', // Universal Recipient
      phone: '+1 555-0104',
      age: 29,
      gender: 'Female',
      address: '127 Sunrise Residency',
      city: 'Metro City',
      state: 'Central State',
      locality: 'Whitefield',
      lat: 12.9698,
      lon: 77.7500,
      lastDonationDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      isAvailable: true
    },
    {
      email: 'michael@demo.com',
      fullName: 'Michael Brown',
      bloodGroup: 'O+',
      phone: '+1 555-0105',
      age: 38,
      gender: 'Male',
      address: '304 Silver Springs',
      city: 'Metro City',
      state: 'Central State',
      locality: 'Jayanagar',
      lat: 12.9299,
      lon: 77.5824,
      lastDonationDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
      isAvailable: true
    },
    {
      email: 'elena@demo.com',
      fullName: 'Elena Rostova',
      bloodGroup: 'A-',
      phone: '+1 555-0106',
      age: 26,
      gender: 'Female',
      address: '19 Magnolia Avenue',
      city: 'Metro City',
      state: 'Central State',
      locality: 'HSR Layout',
      lat: 12.9121,
      lon: 77.6446,
      lastDonationDate: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000),
      isAvailable: true
    }
  ];

  const donors = {};
  for (const d of donorData) {
    let u = await db.user.findUnique({ where: { email: d.email } });
    if (!u) {
      u = await db.user.create({
        data: {
          email: d.email,
          passwordHash: hashedPassword,
          role: 'DONOR',
          isActive: true
        }
      });
      const dp = await db.donorProfile.create({
        data: {
          userId: u.id,
          fullName: d.fullName,
          bloodGroup: d.bloodGroup,
          phone: d.phone,
          age: d.age,
          gender: d.gender,
          address: d.address,
          city: d.city,
          state: d.state,
          locality: d.locality,
          latitude: d.lat,
          longitude: d.lon,
          lastDonationDate: d.lastDonationDate,
          isAvailable: d.isAvailable
        }
      });
      donors[d.email] = dp;
      console.log(`✓ Donor created: ${d.email} (${d.fullName}, ${d.bloodGroup})`);
    } else {
      donors[d.email] = await db.donorProfile.findUnique({ where: { userId: u.id } });
    }
  }

  // 4. Create Blood Requests
  const cityHosp = hospitals['cityhospital@demo.com'];
  const stJudeHosp = hospitals['stjude@demo.com'];

  const existingRequests = await db.bloodRequest.findMany();
  if (existingRequests.length === 0) {
    // Request 1: Critical A+ Need
    const req1 = await db.bloodRequest.create({
      data: {
        hospitalId: cityHosp.id,
        patientNameOrId: 'Ananya Sen (Case #CGH-9021)',
        patientAge: 29,
        bloodGroup: 'A+',
        unitsRequired: 2,
        unitsFulfilled: 0,
        urgency: 'CRITICAL',
        requiredDate: new Date(Date.now() + 18 * 60 * 60 * 1000), // in 18 hours
        notes: 'Emergency cesarean section with blood loss complication. Urgent transfusion required.',
        status: 'RESPONSES_RECEIVED'
      }
    });

    // Request 2: High Urgency O- Need
    const req2 = await db.bloodRequest.create({
      data: {
        hospitalId: cityHosp.id,
        patientNameOrId: 'Vikram Malhotra (Case #CGH-8840)',
        patientAge: 46,
        bloodGroup: 'O-',
        unitsRequired: 3,
        unitsFulfilled: 0,
        urgency: 'HIGH',
        requiredDate: new Date(Date.now() + 36 * 60 * 60 * 1000),
        notes: 'Cardiac bypass surgery scheduled tomorrow morning.',
        status: 'OPEN'
      }
    });

    // Request 3: Normal B+ Need
    const req3 = await db.bloodRequest.create({
      data: {
        hospitalId: stJudeHosp.id,
        patientNameOrId: 'Baby Aarav (Case #STJ-7712)',
        patientAge: 5,
        bloodGroup: 'B+',
        unitsRequired: 1,
        unitsFulfilled: 0,
        urgency: 'NORMAL',
        requiredDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        notes: 'Thalassemia maintenance transfusion.',
        status: 'OPEN'
      }
    });

    // Request 4: Fulfilled Past Request
    const req4 = await db.bloodRequest.create({
      data: {
        hospitalId: cityHosp.id,
        patientNameOrId: 'Joseph D\'Souza (Case #CGH-6500)',
        patientAge: 71,
        bloodGroup: 'A+',
        unitsRequired: 1,
        unitsFulfilled: 1,
        urgency: 'HIGH',
        requiredDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: 'Orthopedic hip replacement transfusion.',
        status: 'FULFILLED'
      }
    });

    console.log('✓ 4 Blood Requests seeded across urgency tiers.');

    // 5. Create Donor Responses and Completed Donation
    const rahul = donors['donor@demo.com'];

    // Rahul expressed interest in Request 1 (Current Active)
    await db.donorResponse.create({
      data: {
        requestId: req1.id,
        donorId: rahul.id,
        status: 'INTERESTED',
        notes: 'I work nearby and can be at the hospital within 30 minutes.'
      }
    });

    // Rahul's past completed donation for Request 4
    const pastResponse = await db.donorResponse.create({
      data: {
        requestId: req4.id,
        donorId: rahul.id,
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: 'Completed successfully.'
      }
    });

    await db.donation.create({
      data: {
        requestId: req4.id,
        donorId: rahul.id,
        hospitalId: cityHosp.id,
        donorResponseId: pastResponse.id,
        unitsDonated: 1,
        donationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'CONFIRMED',
        remarks: 'Screened and whole blood collected safely.'
      }
    });

    // 6. Notifications
    await db.notification.create({
      data: {
        userId: rahul.userId,
        title: 'New Matching Blood Request Alert',
        message: 'City General Hospital urgently needs A+ blood for a critical patient (Case #CGH-9021).',
        type: 'DONOR_MATCH',
        relatedEntityId: req1.id
      }
    });

    await db.notification.create({
      data: {
        userId: cityHosp.userId,
        title: 'Donor Expressed Interest!',
        message: 'Rahul Sharma (A+) expressed interest in blood request #CGH-9021.',
        type: 'INTEREST_EXPRESSED',
        relatedEntityId: req1.id
      }
    });

    console.log('✓ Responses, donations, and notifications seeded.');
  }

  console.log('\n======================================================');
  console.log('DEMO ACCOUNTS READY FOR EVALUATION & DEMONSTRATION:');
  console.log('------------------------------------------------------');
  console.log('1. ADMIN Portal:');
  console.log('   Email:    admin@demo.com');
  console.log('   Password: AdminPassword123!');
  console.log('------------------------------------------------------');
  console.log('2. HOSPITAL Portal:');
  console.log('   Email:    cityhospital@demo.com (Approved)');
  console.log('   Password: Password123!');
  console.log('   Email:    valleyclinic@demo.com (Pending Admin Review)');
  console.log('   Password: Password123!');
  console.log('------------------------------------------------------');
  console.log('3. DONOR Portal:');
  console.log('   Email:    donor@demo.com (Rahul Sharma, A+)');
  console.log('   Email:    sarah@demo.com (Sarah Jenkins, O- Universal)');
  console.log('   Password: Password123!');
  console.log('======================================================\n');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
