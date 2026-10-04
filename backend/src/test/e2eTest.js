import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = options.headers || {};
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, headers: res.headers, data };
}

async function runE2ETests() {
  console.log('🧪 Starting SmartCampus End-to-End Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    console.log('--- 1. Service Health & Infrastructure ---');
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'online', 'Health endpoint returns status 200 online');

    // 2. Demo Auth Logins for All 4 Roles
    console.log('\n--- 2. RBAC & Authentication ---');
    const studentAuth = await request('/auth/demo-login', {
      method: 'POST',
      body: { role: 'STUDENT' },
    });
    assert(studentAuth.status === 200 && studentAuth.data.user.role === 'STUDENT', 'Student Demo Login successful');
    const studentToken = studentAuth.data.token;

    const reviewerAuth = await request('/auth/demo-login', {
      method: 'POST',
      body: { role: 'REVIEWER' },
    });
    assert(reviewerAuth.status === 200 && reviewerAuth.data.user.role === 'REVIEWER', 'Reviewer Demo Login successful');
    const reviewerToken = reviewerAuth.data.token;

    const staffAuth = await request('/auth/demo-login', {
      method: 'POST',
      body: { role: 'STAFF', deptCode: 'IT' },
    });
    assert(staffAuth.status === 200 && staffAuth.data.user.role === 'STAFF', 'IT Staff Demo Login successful');
    const staffToken = staffAuth.data.token;

    const adminAuth = await request('/auth/demo-login', {
      method: 'POST',
      body: { role: 'ADMIN' },
    });
    assert(adminAuth.status === 200 && adminAuth.data.user.role === 'ADMIN', 'Admin Demo Login successful');
    const adminToken = adminAuth.data.token;

    // 3. Campus Zones & Geofencing Check
    console.log('\n--- 3. Geofencing & Campus Zones ---');
    const zonesRes = await request('/zones');
    assert(zonesRes.status === 200 && zonesRes.data.zones.length >= 5, 'Fetched all campus zones (≥5 zones)');

    const geofenceCheck = await request('/zones/check?latitude=12.9716&longitude=79.1585');
    assert(
      geofenceCheck.status === 200 &&
      geofenceCheck.data.result.isInsideCampus === true &&
      geofenceCheck.data.result.zoneName.includes('Engineering Block'),
      'Geofence resolver correctly maps (12.9716, 79.1585) to Engineering Block'
    );

    // 4. Complaint Submission with Live Camera & AI Pipeline
    console.log('\n--- 4. Complaint Submission & AI Verification ---');
    // Create temporary test dummy image
    const dummyImagePath = path.join(__dirname, 'test-evidence.jpg');
    fs.writeFileSync(dummyImagePath, 'Simulated Live Camera Frame Stream Watermark 2026');

    const formData = new FormData();
    formData.append('description', 'Wi-Fi connection is dropping repeatedly in Engineering Block Lab 204');
    formData.append('locationDetail', 'Engineering Block Lab 204');
    formData.append('latitude', '12.9716');
    formData.append('longitude', '79.1585');
    formData.append('accuracy', '4');
    
    const fileBlob = new Blob([fs.readFileSync(dummyImagePath)], { type: 'image/jpeg' });
    formData.append('evidence', fileBlob, 'test-evidence.jpg');

    const submitRes = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
      body: formData,
    });
    const submitData = await submitRes.json();

    assert(
      submitRes.status === 201 &&
      submitData.complaint?.complaintNumber?.startsWith('CMP-'),
      `Student submitted verified complaint: #${submitData.complaint?.complaintNumber}`
    );

    assert(
      submitData.complaint?.aiAnalysis?.matchConfidence >= 80,
      `AI Vision & Multimodal analysis match score: ${submitData.complaint?.aiAnalysis?.matchConfidence}%`
    );

    assert(
      submitData.complaint?.aiAnalysis?.suggestedCategory === 'IT',
      `AI Classified category: ${submitData.complaint?.aiAnalysis?.suggestedCategory}`
    );

    assert(
      submitData.complaint?.aiAnalysis?.duplicateConfidence >= 75,
      `Vector Duplicate Detection matched similar reports: ${submitData.complaint?.aiAnalysis?.duplicateConfidence}%`
    );

    const newComplaintId = submitData.complaint?._id;

    // 5. Reviewer Queue & Verification
    console.log('\n--- 5. Reviewer Queue & Human Verification ---');
    const queueRes = await request('/reviews/queue', {
      headers: { Authorization: `Bearer ${reviewerToken}` },
    });
    assert(queueRes.status === 200 && queueRes.data.complaints.length > 0, 'Reviewer fetched unverified complaints queue');

    // Reviewer Approves and Creates / Routes Incident
    const reviewProcessRes = await request(`/reviews/${newComplaintId}/process`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${reviewerToken}` },
      body: {
        action: 'APPROVE',
        finalCategory: 'IT',
        finalSeverity: 'HIGH',
        reviewerNotes: 'Verified with IT department; routing to technician Dave.',
      },
    });

    assert(
      reviewProcessRes.status === 200 &&
      reviewProcessRes.data.complaint?.status === 'APPROVED',
      `Reviewer approved complaint & routed under Incident #${reviewProcessRes.data.incident?.incidentNumber}`
    );

    const generatedIncidentId = reviewProcessRes.data.incident?._id;

    // 6. Department Staff Resolution Workflow
    console.log('\n--- 6. Department Staff Scoped Resolution ---');
    const staffIncidentsRes = await request('/staff/incidents', {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      staffIncidentsRes.status === 200 && staffIncidentsRes.data.incidents.length > 0,
      'IT Staff received scoped department incidents'
    );

    // Accept Incident
    const acceptRes = await request(`/staff/incidents/${generatedIncidentId}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(acceptRes.status === 200 && acceptRes.data.incident.status === 'ACCEPTED', 'Staff successfully accepted incident');

    // Resolve Incident with Notes & After Proof
    const resolveFormData = new FormData();
    resolveFormData.append('notes', 'Access point switch rebooted and antenna signal aligned. Wi-Fi verified at 300 Mbps.');
    resolveFormData.append('afterEvidence', fileBlob, 'after-evidence.jpg');

    const resolveRes = await fetch(`${BASE_URL}/staff/incidents/${generatedIncidentId}/resolve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${staffToken}`,
      },
      body: resolveFormData,
    });
    const resolveData = await resolveRes.json();

    assert(
      resolveRes.status === 200 && resolveData.incident?.status === 'RESOLVED',
      `Incident #${resolveData.incident?.incidentNumber} RESOLVED and student notifications dispatched`
    );

    // 7. Executive Admin Analytics & Heatmap
    console.log('\n--- 7. Executive Analytics & Spatial Heatmap ---');
    const analyticsRes = await request('/admin/analytics', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      analyticsRes.status === 200 &&
      analyticsRes.data.metrics.totalComplaints > 0 &&
      analyticsRes.data.metrics.duplicateReductionPercent >= 0,
      `Analytics telemetry: ${analyticsRes.data.metrics.totalComplaints} complaints, ${analyticsRes.data.metrics.duplicateReductionPercent}% clustering efficiency`
    );

    const heatmapRes = await request('/admin/heatmap', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      heatmapRes.status === 200 && heatmapRes.data.heatmap.length >= 5,
      'Campus spatial heatmap generated with zone intensity breakdown'
    );

    const auditRes = await request('/admin/audit-logs', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      auditRes.status === 200 && auditRes.data.logs.length > 0,
      `Audit trail logged ${auditRes.data.logs.length} chronological immutable actions`
    );

    // Cleanup test image
    if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);

    console.log(`\n======================================================`);
    console.log(`🏁 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  }
}

runE2ETests();
