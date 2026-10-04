import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { CampusZone } from '../models/CampusZone.js';
import { Complaint } from '../models/Complaint.js';
import { Incident } from '../models/Incident.js';
import { Evidence } from '../models/Evidence.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';
import { generateDeterministicEmbedding } from '../services/aiService.js';

export async function seedDatabase() {
  await connectDB();

  console.log('🧹 Clearing existing database collections...');
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    CampusZone.deleteMany({}),
    Complaint.deleteMany({}),
    Incident.deleteMany({}),
    Evidence.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('🏢 Seeding Departments...');
  const departments = await Department.insertMany([
    {
      name: 'Information Technology',
      code: 'IT',
      description: 'Campus Wi-Fi, Ethernet, Projectors, Smart Classrooms, Lab Computers',
      contactEmail: 'it.helpdesk@smartcampus.edu',
      icon: 'Wifi',
      color: '#3b82f6',
      headName: 'Dr. Alan Turing',
      categories: ['IT', 'Equipment', 'Network', 'Wi-Fi', 'Computer', 'Projector'],
    },
    {
      name: 'Electrical Maintenance',
      code: 'ELECTRICAL',
      description: 'Power distribution, switchboards, lighting, backup generators, wiring',
      contactEmail: 'electrical@smartcampus.edu',
      icon: 'Zap',
      color: '#eab308',
      headName: 'Nikola Tesla',
      categories: ['Electrical', 'Power', 'Lighting', 'Wiring', 'Fans', 'Switchboard'],
    },
    {
      name: 'Civil Works & Plumbing',
      code: 'MAINTENANCE',
      description: 'Water pipelines, structural repairs, restroom fixtures, ceiling tiles, furniture',
      contactEmail: 'maintenance@smartcampus.edu',
      icon: 'Wrench',
      color: '#f97316',
      headName: 'Marcus Vitruvius',
      categories: ['Plumbing', 'Maintenance', 'Infrastructure', 'Water Leak', 'Furniture'],
    },
    {
      name: 'Housekeeping & Sanitation',
      code: 'HOUSEKEEPING',
      description: 'Campus cleanliness, waste management, sanitization, classroom hygiene',
      contactEmail: 'housekeeping@smartcampus.edu',
      icon: 'Sparkles',
      color: '#10b981',
      headName: 'Florence Nightingale',
      categories: ['Cleanliness', 'Sanitation', 'Waste', 'Housekeeping'],
    },
    {
      name: 'Campus Security',
      code: 'SECURITY',
      description: 'Gate control, CCTV, emergency access, lost & found, physical safety',
      contactEmail: 'security@smartcampus.edu',
      icon: 'Shield',
      color: '#ef4444',
      headName: 'Captain James Vance',
      categories: ['Security', 'Safety', 'Locks', 'CCTV', 'Perimeter'],
    },
  ]);

  const itDept = departments.find((d) => d.code === 'IT');
  const elecDept = departments.find((d) => d.code === 'ELECTRICAL');
  const maintDept = departments.find((d) => d.code === 'MAINTENANCE');

  console.log('📍 Seeding Saveetha Engineering College Campus Zones & Geofencing Polygons...');
  // Reference campus coordinates for Saveetha Engineering College, Chennai (13.02685, 80.01686)
  const zones = await CampusZone.insertMany([
    {
      name: 'Saveetha Main Academic Block (Block 1)',
      code: 'SEC_MAIN_BLOCK',
      buildingCode: 'SEC-BLK-1',
      description: 'Main academic classrooms, AI & DS labs, Dean office, auditorium',
      center: { latitude: 13.02685, longitude: 80.01686 },
      radiusMeters: 180,
      color: '#3b82f6',
      polygon: [
        { latitude: 13.0260, longitude: 80.0160 },
        { latitude: 13.0275, longitude: 80.0160 },
        { latitude: 13.0275, longitude: 80.0175 },
        { latitude: 13.0260, longitude: 80.0175 },
      ],
      floors: [
        { floorNumber: 1, name: 'Ground Floor', rooms: ['Lab 101', 'Lab 102', 'Main Auditorium'] },
        { floorNumber: 2, name: 'First Floor', rooms: ['Lab 201', 'Lab 204 (IT Lab)', 'Smart Classroom 205'] },
        { floorNumber: 3, name: 'Second Floor', rooms: ['AI Robotics Lab', 'Server Room', 'Seminar Hall'] },
      ],
    },
    {
      name: 'Saveetha IT & Tech Wing (Block 2)',
      code: 'SEC_TECH_WING',
      buildingCode: 'SEC-BLK-2',
      description: 'CSE, IT, Cyber Security labs, cloud computing center and incubation hall',
      center: { latitude: 13.02750, longitude: 80.01730 },
      radiusMeters: 160,
      color: '#10b981',
      polygon: [
        { latitude: 13.0270, longitude: 80.0168 },
        { latitude: 13.0280, longitude: 80.0168 },
        { latitude: 13.0280, longitude: 80.0178 },
        { latitude: 13.0270, longitude: 80.0178 },
      ],
      floors: [
        { floorNumber: 1, name: 'Ground Floor', rooms: ['Data Center', 'IoT Innovation Lab'] },
        { floorNumber: 2, name: 'First Floor', rooms: ['Cyber Defense Hub', 'Software Lab 3'] },
      ],
    },
    {
      name: 'Saveetha Central Library & Research',
      code: 'SEC_LIBRARY',
      buildingCode: 'SEC-LIB',
      description: 'Digital knowledge center, research journals archive, e-learning suites',
      center: { latitude: 13.02620, longitude: 80.01630 },
      radiusMeters: 140,
      color: '#8b5cf6',
      polygon: [
        { latitude: 13.0258, longitude: 80.0158 },
        { latitude: 13.0266, longitude: 80.0158 },
        { latitude: 13.0266, longitude: 80.0168 },
        { latitude: 13.0258, longitude: 80.0168 },
      ],
    },
    {
      name: 'Saveetha Hostels & Food Court',
      code: 'SEC_HOSTEL',
      buildingCode: 'SEC-HOSTEL',
      description: 'Student residential hostels, dining messes, student activity lounge',
      center: { latitude: 13.02820, longitude: 80.01790 },
      radiusMeters: 200,
      color: '#f59e0b',
      polygon: [
        { latitude: 13.0276, longitude: 80.0172 },
        { latitude: 13.0288, longitude: 80.0172 },
        { latitude: 13.0288, longitude: 80.0185 },
        { latitude: 13.0276, longitude: 80.0185 },
      ],
    },
    {
      name: 'Saveetha Mechanical & Civil Labs',
      code: 'SEC_MECH_CIVIL',
      buildingCode: 'SEC-WORKSHOP',
      description: 'Robotics workshop, CNC center, structural testing labs, power substation',
      center: { latitude: 13.02560, longitude: 80.01570 },
      radiusMeters: 150,
      color: '#ec4899',
      polygon: [
        { latitude: 13.0250, longitude: 80.0150 },
        { latitude: 13.0260, longitude: 80.0150 },
        { latitude: 13.0260, longitude: 80.0162 },
        { latitude: 13.0250, longitude: 80.0162 },
      ],
    },
  ]);

  const engZone = zones.find((z) => z.code === 'SEC_MAIN_BLOCK');
  const sciZone = zones.find((z) => z.code === 'SEC_TECH_WING');

  console.log('👥 Seeding Users for all 4 Roles...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const users = await User.insertMany([
    {
      name: 'Alex Student',
      email: 'student@smartcampus.edu',
      passwordHash,
      role: 'STUDENT',
      studentId: 'STU-2024-001',
      phone: '+1 (555) 234-5678',
    },
    {
      name: 'Priya Sharma (Student)',
      email: 'student2@smartcampus.edu',
      passwordHash,
      role: 'STUDENT',
      studentId: 'STU-2024-042',
      phone: '+1 (555) 234-9988',
    },
    {
      name: 'Dr. Robert Reviewer',
      email: 'reviewer@smartcampus.edu',
      passwordHash,
      role: 'REVIEWER',
      phone: '+1 (555) 888-1234',
    },
    {
      name: 'Dave Miller (IT Staff)',
      email: 'staff.it@smartcampus.edu',
      passwordHash,
      role: 'STAFF',
      department: itDept._id,
      phone: '+1 (555) 777-4321',
    },
    {
      name: 'Carlos Mendez (Electrical)',
      email: 'staff.elec@smartcampus.edu',
      passwordHash,
      role: 'STAFF',
      department: elecDept._id,
      phone: '+1 (555) 777-8899',
    },
    {
      name: 'Suresh Kumar (Maintenance)',
      email: 'staff.maint@smartcampus.edu',
      passwordHash,
      role: 'STAFF',
      department: maintDept._id,
      phone: '+1 (555) 777-5566',
    },
    {
      name: 'Dean Eleanor Vance (Admin)',
      email: 'admin@smartcampus.edu',
      passwordHash,
      role: 'ADMIN',
      phone: '+1 (555) 999-0000',
    },
  ]);

  const studentUser = users.find((u) => u.email === 'student@smartcampus.edu');
  const student2User = users.find((u) => u.email === 'student2@smartcampus.edu');
  const reviewerUser = users.find((u) => u.email === 'reviewer@smartcampus.edu');
  const itStaffUser = users.find((u) => u.email === 'staff.it@smartcampus.edu');

  console.log('📸 Seeding Evidence & Clustered Incidents...');

  // Sample Evidence photos
  const ev1 = await Evidence.create({
    captureType: 'LIVE_CAMERA',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60',
    storageType: 'LOCAL',
    latitude: 13.02685,
    longitude: 80.01686,
    accuracy: 4,
  });

  const ev2 = await Evidence.create({
    captureType: 'LIVE_CAMERA',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60',
    storageType: 'LOCAL',
    latitude: 12.9717,
    longitude: 79.1586,
    accuracy: 3,
  });

  const ev3 = await Evidence.create({
    captureType: 'LIVE_CAMERA',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=60',
    storageType: 'LOCAL',
    latitude: 12.9715,
    longitude: 79.1584,
    accuracy: 5,
  });

  const ev4_water = await Evidence.create({
    captureType: 'LIVE_CAMERA',
    imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop&q=60',
    storageType: 'LOCAL',
    latitude: 12.9730,
    longitude: 79.1600,
    accuracy: 6,
  });

  // 1. Clustered Wi-Fi Outage Incident in Block A (with 3 clustered student reports)
  const wifiIncident = await Incident.create({
    incidentNumber: 'INC-284',
    title: 'Block A Network & Wi-Fi Outage',
    description: 'Multiple reports of access point signal loss and gateway timeouts in Engineering Block 2nd Floor.',
    category: 'IT',
    department: itDept._id,
    zone: engZone._id,
    zoneName: engZone.name,
    locationDetail: '2nd Floor Lab Area & Corridor',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    reportCount: 3,
    primaryEvidence: ev1._id,
    assignedStaff: itStaffUser._id,
    acceptedAt: new Date(Date.now() - 3600 * 1000 * 2),
    inProgressAt: new Date(Date.now() - 3600 * 1000),
    timeline: [
      {
        status: 'REPORTED',
        note: 'Incident created from 3 semantically clustered student reports.',
        performedByName: 'Dr. Robert Reviewer',
        performedByRole: 'REVIEWER',
      },
      {
        status: 'ACCEPTED',
        note: 'IT Staff accepted ticket. Replacement access point prepared.',
        performedByName: 'Dave Miller (IT Staff)',
        performedByRole: 'STAFF',
      },
      {
        status: 'IN_PROGRESS',
        note: 'Switch rebooted, testing VLAN routing.',
        performedByName: 'Dave Miller (IT Staff)',
        performedByRole: 'STAFF',
      },
    ],
  });

  // Complaint 1 (Student 1)
  const cmp1 = await Complaint.create({
    complaintNumber: 'CMP-1028',
    student: studentUser._id,
    description: 'WiFi is completely down in Block A second floor labs.',
    locationDetail: 'Lab 204',
    evidence: ev1._id,
    location: {
      latitude: 12.9716,
      longitude: 79.1585,
      accuracy: 4,
      zone: engZone._id,
      zoneName: engZone.name,
      isInsideCampus: true,
    },
    aiAnalysis: {
      detectedObjects: ['Access Point', 'Network Router'],
      environment: 'Computer Laboratory',
      condition: 'Signal Loss',
      matchConfidence: 94,
      isEvidenceMismatch: false,
      suggestedCategory: 'IT',
      suggestedDepartment: itDept._id,
      suggestedSeverity: 'HIGH',
      reason: 'Network disruption impacts student laboratory work.',
      embedding: generateDeterministicEmbedding('WiFi is down in Block A second floor labs IT ENG_BLOCK'),
      duplicateConfidence: 91,
      suggestedIncident: wifiIncident._id,
    },
    status: 'IN_PROGRESS',
    incident: wifiIncident._id,
    finalCategory: 'IT',
    finalSeverity: 'HIGH',
    assignedDepartment: itDept._id,
    reviewedBy: reviewerUser._id,
    reviewedAt: new Date(Date.now() - 3600 * 1000 * 2),
  });

  // Complaint 2 (Student 2)
  const cmp2 = await Complaint.create({
    complaintNumber: 'CMP-1033',
    student: student2User._id,
    description: 'No internet connection in Block A, cannot submit lab assignments.',
    locationDetail: 'Lab 201',
    evidence: ev2._id,
    location: {
      latitude: 12.9717,
      longitude: 79.1586,
      accuracy: 3,
      zone: engZone._id,
      zoneName: engZone.name,
      isInsideCampus: true,
    },
    aiAnalysis: {
      detectedObjects: ['Laptop Screen', 'Ethernet Port'],
      environment: 'Classroom',
      condition: 'No Internet',
      matchConfidence: 90,
      isEvidenceMismatch: false,
      suggestedCategory: 'IT',
      suggestedDepartment: itDept._id,
      suggestedSeverity: 'HIGH',
      reason: 'Internet connectivity failure.',
      embedding: generateDeterministicEmbedding('No internet connection in Block A cannot submit lab assignments IT ENG_BLOCK'),
      duplicateConfidence: 94,
      suggestedIncident: wifiIncident._id,
    },
    status: 'IN_PROGRESS',
    incident: wifiIncident._id,
    finalCategory: 'IT',
    finalSeverity: 'HIGH',
    assignedDepartment: itDept._id,
    reviewedBy: reviewerUser._id,
    reviewedAt: new Date(Date.now() - 3600 * 1000 * 2),
  });

  // Complaint 3 (Student 1)
  const cmp3 = await Complaint.create({
    complaintNumber: 'CMP-1042',
    student: studentUser._id,
    description: 'Campus network is down in Block A hallway and labs.',
    locationDetail: '2nd floor hallway',
    evidence: ev3._id,
    location: {
      latitude: 12.9715,
      longitude: 79.1584,
      accuracy: 5,
      zone: engZone._id,
      zoneName: engZone.name,
      isInsideCampus: true,
    },
    aiAnalysis: {
      detectedObjects: ['Network Switch'],
      environment: 'Corridor',
      condition: 'Offline Switch',
      matchConfidence: 89,
      isEvidenceMismatch: false,
      suggestedCategory: 'IT',
      suggestedDepartment: itDept._id,
      suggestedSeverity: 'HIGH',
      reason: 'Network switch power cycle required.',
      embedding: generateDeterministicEmbedding('Campus network is down in Block A hallway IT ENG_BLOCK'),
      duplicateConfidence: 89,
      suggestedIncident: wifiIncident._id,
    },
    status: 'IN_PROGRESS',
    incident: wifiIncident._id,
    finalCategory: 'IT',
    finalSeverity: 'HIGH',
    assignedDepartment: itDept._id,
    reviewedBy: reviewerUser._id,
    reviewedAt: new Date(Date.now() - 3600 * 1000 * 2),
  });

  wifiIncident.linkedComplaints = [cmp1._id, cmp2._id, cmp3._id];
  await wifiIncident.save();

  // 2. Pending Review Complaint (Broken Projector in Lab 204)
  const pendingCmp = await Complaint.create({
    complaintNumber: 'CMP-1055',
    student: studentUser._id,
    description: 'The projector in Lab 204 has a burnt lamp and will not turn on.',
    locationDetail: 'Lab 204, Ceiling Mount',
    evidence: ev1._id,
    location: {
      latitude: 12.9716,
      longitude: 79.1585,
      accuracy: 4,
      zone: engZone._id,
      zoneName: engZone.name,
      isInsideCampus: true,
    },
    aiAnalysis: {
      detectedObjects: ['Digital Projector', 'Ceiling Mount'],
      environment: 'Classroom / Laboratory',
      condition: 'Power LED Blinking Red (Lamp Failure)',
      matchConfidence: 91,
      isEvidenceMismatch: false,
      suggestedCategory: 'Equipment',
      suggestedDepartment: itDept._id,
      suggestedSeverity: 'HIGH',
      reason: 'Projector failure prevents lab demonstration classes.',
      embedding: generateDeterministicEmbedding('The projector in Lab 204 has a burnt lamp Equipment ENG_BLOCK'),
      duplicateConfidence: 0,
      similarComplaints: [],
    },
    status: 'PENDING_REVIEW',
  });

  // 3. Critical Plumbing & Electrical Water Leak in Science Block
  const waterLeakCmp = await Complaint.create({
    complaintNumber: 'CMP-1056',
    student: student2User._id,
    description: 'Water leaking from ceiling in laboratory and electrical equipment is getting wet!',
    locationDetail: 'Science Block Physics Lab 102',
    evidence: ev4_water._id,
    location: {
      latitude: 12.9730,
      longitude: 79.1600,
      accuracy: 5,
      zone: sciZone._id,
      zoneName: sciZone.name,
      isInsideCampus: true,
    },
    aiAnalysis: {
      detectedObjects: ['Ceiling Water Leak', 'Power Conduit', 'Exposed Cables'],
      environment: 'Laboratory',
      condition: 'Active Water Dripping Near Electricals',
      matchConfidence: 96,
      isEvidenceMismatch: false,
      suggestedCategory: 'Plumbing',
      suggestedDepartment: maintDept._id,
      suggestedSeverity: 'CRITICAL',
      reason: 'CRITICAL: Water hazard near electrical switchboards poses an immediate fire and electrocution danger.',
      embedding: generateDeterministicEmbedding('Water leaking from ceiling in laboratory electrical wet CRITICAL SCI_BLOCK'),
      duplicateConfidence: 0,
      similarComplaints: [],
    },
    status: 'PENDING_REVIEW',
  });

  // Seed Notifications
  await Notification.insertMany([
    {
      recipient: studentUser._id,
      title: 'Incident In Progress: INC-284',
      message: 'Your report #CMP-1028 was merged into Incident #INC-284 and IT Staff is actively resolving it.',
      type: 'INCIDENT_IN_PROGRESS',
      relatedIncident: wifiIncident._id,
      relatedComplaint: cmp1._id,
    },
    {
      recipient: reviewerUser._id,
      title: 'CRITICAL Severity Alert: #CMP-1056',
      message: 'A CRITICAL severity water leak near electrical equipment was reported in Science Block.',
      type: 'SYSTEM_ALERT',
      relatedComplaint: waterLeakCmp._id,
    },
  ]);

  // Seed Audit Logs
  await AuditLog.insertMany([
    {
      action: 'COMPLAINT_SUBMITTED',
      entityType: 'COMPLAINT',
      entityId: cmp1._id,
      entityIdentifier: 'CMP-1028',
      performedBy: studentUser._id,
      performedByName: studentUser.name,
      performedByRole: 'STUDENT',
      details: { zoneName: engZone.name, confidence: 94 },
    },
    {
      action: 'REVIEWER_CLUSTERED_INCIDENT',
      entityType: 'INCIDENT',
      entityId: wifiIncident._id,
      entityIdentifier: 'INC-284',
      performedBy: reviewerUser._id,
      performedByName: reviewerUser.name,
      performedByRole: 'REVIEWER',
      details: { clusteredReports: ['CMP-1028', 'CMP-1033', 'CMP-1042'] },
    },
    {
      action: 'STAFF_ACCEPTED_INCIDENT',
      entityType: 'INCIDENT',
      entityId: wifiIncident._id,
      entityIdentifier: 'INC-284',
      performedBy: itStaffUser._id,
      performedByName: itStaffUser.name,
      performedByRole: 'STAFF',
      details: { department: 'Information Technology' },
    },
  ]);

  console.log('✅ [Database Seeding Complete]:');
  console.log(`- 5 Departments, 5 Campus Zones`);
  console.log(`- 7 Demo Users (Student, Reviewer, IT/Elec/Maint Staff, Admin)`);
  console.log(`- 1 Master Incident (INC-284 with 3 clustered complaints)`);
  console.log(`- 2 Pending Review Complaints (including CRITICAL water leak)`);
  console.log(`- Demo Credentials: Password for all accounts is 'password123'`);
}

// Run directly if called via node
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase().then(() => {
    console.log('Seeder finished.');
    process.exit(0);
  }).catch((err) => {
    console.error('Seeder failed:', err);
    process.exit(1);
  });
}
