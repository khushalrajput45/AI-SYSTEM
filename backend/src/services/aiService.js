import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env.js';
import { Department } from '../models/Department.js';
import fs from 'fs';
import jpeg from 'jpeg-js';

let genAI = null;
if (ENV.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
}

/**
 * Decodes raw JPEG pixels and checks for human face / skin portrait vs campus asset
 */
function analyzeImageFeatures(imagePath) {
  if (!imagePath || !fs.existsSync(imagePath)) {
    return { isLikelyFaceOrSelfie: false };
  }

  try {
    const buffer = fs.readFileSync(imagePath);
    if (buffer.length < 500) return { isLikelyFaceOrSelfie: false };

    // Decode actual uncompressed RGBA pixel bytes
    const rawData = jpeg.decode(buffer, { useTArray: true });
    const { width, height, data } = rawData;

    let skinPixels = 0;
    let centerSkinPixels = 0;
    let centerTotalPixels = 0;
    let totalPixels = width * height;

    const minX = Math.floor(width * 0.2);
    const maxX = Math.floor(width * 0.8);
    const minY = Math.floor(height * 0.15);
    const maxY = Math.floor(height * 0.85);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Chromatic skin color profile
        const isSkin = r > 60 && g > 35 && b > 20 && r > g && r > b && (r - g) > 8;

        if (isSkin) skinPixels++;

        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
          centerTotalPixels++;
          if (isSkin) centerSkinPixels++;
        }
      }
    }

    const totalRatio = (skinPixels / totalPixels) * 100;
    const centerRatio = (centerSkinPixels / Math.max(1, centerTotalPixels)) * 100;

    // A person's face/selfie in the frame
    const isLikelyFaceOrSelfie = totalRatio >= 4.0 || centerRatio >= 6.0;

    return {
      isLikelyFaceOrSelfie,
      totalRatio,
      centerRatio,
    };
  } catch (err) {
    return { isLikelyFaceOrSelfie: false };
  }
}

/**
 * Intelligent Fallback NLP & Vision Simulator when offline or no API key
 */
function runFallbackAnalysis(description, zoneName = '', imagePath = '') {
  const text = (description || '').toLowerCase();
  const imgAnalysis = analyzeImageFeatures(imagePath);
  
  let category = 'General';
  let departmentCode = 'MAINTENANCE';
  let severity = 'MEDIUM';
  let matchConfidence = 88;
  let detectedObjects = ['Campus Infrastructure'];
  let environment = 'Classroom / Lab';
  let condition = 'Needs Inspection';
  let reason = 'Standard campus facility report requiring attention.';
  let isEvidenceMismatch = false;

  // Determine category & severity from text
  if (text.includes('electric') || text.includes('spark') || text.includes('wire') || text.includes('shock') || text.includes('power') || text.includes('switchboard') || text.includes('fan') || text.includes('light') || text.includes('tube light')) {
    category = 'Electrical';
    departmentCode = 'ELECTRICAL';
    severity = text.includes('spark') || text.includes('shock') || text.includes('fire') ? 'CRITICAL' : 'HIGH';
    detectedObjects = ['Switchboard', 'Electrical Conduit', 'Circuitry'];
    environment = 'Hallway / Classroom';
    condition = 'Exposed / Damaged Electrical Unit';
    matchConfidence = 89;
    reason = 'Electrical malfunction poses fire hazard and student safety risk.';
  } else if (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet') || text.includes('network') || text.includes('router') || text.includes('lan') || text.includes('ethernet')) {
    category = 'IT';
    departmentCode = 'IT';
    severity = 'HIGH';
    detectedObjects = ['Access Point', 'Network Switch', 'Ethernet Cable'];
    environment = 'Computer Laboratory / Campus Wing';
    condition = 'No Connectivity / Signal Loss';
    matchConfidence = 92;
    reason = 'Network disruption affects multiple students and academic operations.';
  } else if (text.includes('projector') || text.includes('screen') || text.includes('hdmi') || text.includes('display') || text.includes('monitor') || text.includes('computer') || text.includes('pc')) {
    category = 'Equipment';
    departmentCode = 'IT';
    severity = 'HIGH';
    detectedObjects = ['Digital Projector', 'Ceiling Mount', 'Display Cable'];
    environment = 'Classroom / Lecture Hall';
    condition = 'Optical / Power Malfunction';
    matchConfidence = 94;
    reason = 'Disrupts classroom teaching and lab presentations.';
  } else if (text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('tap') || text.includes('flush') || text.includes('drain') || text.includes('plumbing')) {
    category = 'Plumbing';
    departmentCode = 'MAINTENANCE';
    severity = text.includes('electric') || text.includes('wire') || text.includes('flood') ? 'CRITICAL' : 'HIGH';
    detectedObjects = ['Water Pipe', 'Ceiling Tile', 'Leakage Droplets'];
    environment = 'Restroom / Laboratory';
    condition = 'Active Water Leakage';
    matchConfidence = 91;
    reason = severity === 'CRITICAL' 
      ? 'Water hazard near electrical systems presents immediate safety and structural danger.' 
      : 'Water damage can cause ceiling deterioration and slippery floors.';
  } else if (text.includes('dirty') || text.includes('trash') || text.includes('garbage') || text.includes('clean') || text.includes('smell') || text.includes('dust')) {
    category = 'Cleanliness';
    departmentCode = 'HOUSEKEEPING';
    severity = 'LOW';
    detectedObjects = ['Waste Bin', 'Dust Accumulation', 'Floor Debris'];
    environment = 'Common Area';
    condition = 'Requires Sanitization';
    matchConfidence = 86;
    reason = 'Hygiene issue requiring housekeeping dispatch.';
  } else if (text.includes('door') || text.includes('lock') || text.includes('theft') || text.includes('camera') || text.includes('cctv') || text.includes('security') || text.includes('guard')) {
    category = 'Security';
    departmentCode = 'SECURITY';
    severity = 'HIGH';
    detectedObjects = ['Door Lock Mechanism', 'Security Perimeter'];
    environment = 'Entry Gate / Corridor';
    condition = 'Security Vulnerability';
    matchConfidence = 90;
    reason = 'Potential unauthorized access or perimeter issue.';
  }

  // Check 1: Real Image pixel analysis detected a face/selfie instead of equipment
  if (imgAnalysis.isLikelyFaceOrSelfie) {
    matchConfidence = 4;
    isEvidenceMismatch = true;
    detectedObjects = ['Human Face / Person (Selfie)', 'Non-Infrastructure Image'];
    environment = 'User Portrait / Photo';
    condition = 'No Campus Equipment or Damage Detected';
    severity = 'LOW';
    reason = '⚠️ Evidence Mismatch: The captured photo shows a human face/selfie instead of the reported campus damage. Visual evidence match is 4%.';
  }

  // Check 2: Text mismatch checks (animals, food, etc.)
  if (text.includes('bicycle') || text.includes('food') || text.includes('pizza') || text.includes('cat') || text.includes('dog') || text.includes('face') || text.includes('selfie') || text.includes('myself')) {
    matchConfidence = 4;
    isEvidenceMismatch = true;
    severity = 'LOW';
    reason = '⚠️ Evidence Mismatch: Content does not correspond to campus infrastructure.';
  }

  // Generate deterministic 32-dim normalized embedding for semantic search
  const embedding = generateDeterministicEmbedding(description + ' ' + category + ' ' + zoneName);

  return {
    detectedObjects,
    environment,
    condition,
    matchConfidence,
    isEvidenceMismatch,
    suggestedCategory: category,
    departmentCode,
    suggestedSeverity: severity,
    reason,
    embedding,
  };
}

/**
 * Generates deterministic 32-dimensional normalized float vector for local embedding fallback
 */
export function generateDeterministicEmbedding(text) {
  const vector = new Array(32).fill(0);
  const normalized = (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalized.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    vector[0] = 1.0;
    return vector;
  }

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }
    const idx = Math.abs(hash) % 32;
    vector[idx] += 1.0;
    vector[(idx + 1) % 32] += 0.5;
  }

  // L2 Normalize
  let norm = 0;
  for (let i = 0; i < 32; i++) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < 32; i++) vector[i] /= norm;
  }

  return vector;
}

/**
 * Main AI Analysis Pipeline: Multimodal Vision + LLM Classification + Embedding
 */
export async function analyzeComplaint({ description, imagePath, zoneName = '' }) {
  // If Gemini API is configured and live, execute Multimodal Prompt
  if (genAI && ENV.GEMINI_API_KEY) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      let imagePart = null;
      if (imagePath && fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        imagePart = {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: 'image/jpeg',
          },
        };
      }

      const prompt = `
You are the SmartCampus AI Incident Verifier.
Analyze the captured photo and verify if it actually depicts the problem reported in the student's description.

Zone: "${zoneName}"
Student Description: "${description}"

CRITICAL RULES:
- If the photo shows a human face, selfie, person, animal, food, or irrelevant object, you MUST mark "isEvidenceMismatch": true, "matchConfidence": 4, and "detectedObjects": ["Human Face/Selfie", "Person"].
- Only give high matchConfidence (> 80) if the image actually shows relevant campus infrastructure (e.g. electrical panel, wiring, projector, pipe leak, dirty room).
- If there is an evidence mismatch, set "suggestedSeverity" to "LOW".

Respond in STRICT JSON format with these exact keys:
{
  "detectedObjects": ["string", "string"],
  "environment": "string",
  "condition": "string",
  "matchConfidence": number (integer between 0 and 100 representing how well the image supports the complaint),
  "isEvidenceMismatch": boolean,
  "suggestedCategory": "IT" | "Electrical" | "Plumbing" | "Maintenance" | "Housekeeping" | "Security" | "Equipment" | "Infrastructure",
  "departmentCode": "IT" | "ELECTRICAL" | "MAINTENANCE" | "HOUSEKEEPING" | "SECURITY",
  "suggestedSeverity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "reason": "Clear 1-2 sentence justification for the severity and evidence confidence"
}
`;

      const contents = imagePart ? [prompt, imagePart] : [prompt];
      const result = await model.generateContent(contents);
      const responseText = result.response.text();
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Generate embedding
        const embedding = generateDeterministicEmbedding(description + ' ' + (parsed.suggestedCategory || ''));

        // Match department ObjectId
        const department = await Department.findOne({
          code: (parsed.departmentCode || 'MAINTENANCE').toUpperCase(),
        });

        return {
          detectedObjects: parsed.detectedObjects || ['Campus Asset'],
          environment: parsed.environment || 'Campus Zone',
          condition: parsed.condition || 'Reported Issue',
          matchConfidence: parsed.matchConfidence || (parsed.isEvidenceMismatch ? 4 : 85),
          isEvidenceMismatch: !!parsed.isEvidenceMismatch,
          suggestedCategory: parsed.suggestedCategory || 'General',
          suggestedDepartment: department ? department._id : null,
          suggestedSeverity: parsed.suggestedSeverity || 'MEDIUM',
          reason: parsed.reason || 'AI verified campus report.',
          embedding,
        };
      }
    } catch (err) {
      console.warn(`⚠️ [Gemini API call failed, falling back to local NLP]: ${err.message}`);
    }
  }

  // Local fallback execution with real pixel decoding
  const fallback = runFallbackAnalysis(description, zoneName, imagePath);
  const department = await Department.findOne({
    code: fallback.departmentCode,
  });

  return {
    ...fallback,
    suggestedDepartment: department ? department._id : null,
  };
}
