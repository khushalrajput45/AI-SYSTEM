import { Complaint } from '../models/Complaint.js';
import { Incident } from '../models/Incident.js';

/**
 * Calculates cosine similarity between two numeric vectors
 */
export function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Finds semantically similar complaints and checks for incident clustering candidates
 */
export async function findSimilarComplaints(newEmbedding, options = {}) {
  const {
    currentComplaintId = null,
    zoneId = null,
    similarityThreshold = 0.75,
    limit = 5,
  } = options;

  if (!newEmbedding || newEmbedding.length === 0) {
    return {
      similarComplaints: [],
      maxSimilarity: 0,
      suggestedIncident: null,
      duplicateDetected: false,
    };
  }

  // Find recent active complaints (last 14 days)
  const query = {
    _id: { $ne: currentComplaintId },
    'aiAnalysis.embedding': { $exists: true, $ne: [] },
    status: { $in: ['PENDING_REVIEW', 'APPROVED', 'MERGED_INTO_INCIDENT', 'IN_PROGRESS'] },
  };

  const candidates = await Complaint.find(query)
    .populate('incident')
    .sort({ createdAt: -1 })
    .limit(100);

  const scored = [];

  for (const candidate of candidates) {
    const candidateVec = candidate.aiAnalysis?.embedding;
    if (!candidateVec || candidateVec.length !== newEmbedding.length) continue;

    const score = calculateCosineSimilarity(newEmbedding, candidateVec);
    if (score >= similarityThreshold) {
      scored.push({
        complaint: candidate._id,
        complaintNumber: candidate.complaintNumber,
        description: candidate.description,
        status: candidate.status,
        incident: candidate.incident,
        similarityScore: Math.round(score * 100) / 100,
        similarityPercentage: Math.round(score * 100),
      });
    }
  }

  scored.sort((a, b) => b.similarityScore - a.similarityScore);
  const topMatches = scored.slice(0, limit);

  const maxSimilarity = topMatches.length > 0 ? topMatches[0].similarityScore : 0;
  const duplicateDetected = maxSimilarity >= 0.85;

  // Check if any matched complaint is already attached to an active incident
  let suggestedIncident = null;
  for (const match of topMatches) {
    if (match.incident && match.incident._id) {
      suggestedIncident = match.incident._id;
      break;
    }
  }

  // Or if 2+ open similar complaints exist in the same zone without an incident yet, check if there's an existing open incident
  if (!suggestedIncident && topMatches.length >= 2 && zoneId) {
    const openIncident = await Incident.findOne({
      zone: zoneId,
      status: { $in: ['REPORTED', 'ACCEPTED', 'IN_PROGRESS'] },
    }).sort({ createdAt: -1 });

    if (openIncident) {
      suggestedIncident = openIncident._id;
    }
  }

  return {
    similarComplaints: topMatches,
    maxSimilarity: Math.round(maxSimilarity * 100),
    duplicateDetected,
    suggestedIncident,
  };
}
