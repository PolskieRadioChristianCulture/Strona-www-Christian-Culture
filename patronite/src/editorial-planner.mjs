import crypto from 'node:crypto';
import { EVIDENCE_STATUS } from './evidence-validator.mjs';

export function tokenizeForSimilarity(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4);
}

export function jaccardSimilarity(textA, textB) {
  const a = new Set(tokenizeForSimilarity(textA));
  const b = new Set(tokenizeForSimilarity(textB));
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const w of a) {
    if (b.has(w)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function computeContentHash(title, body) {
  return crypto
    .createHash('sha256')
    .update(`${String(title || '').trim()}\n${String(body || '').trim()}`)
    .digest('hex');
}

export function scoreCandidate(item, seriesType) {
  const pref = Array.isArray(item.seriesPreference) ? item.seriesPreference : [];
  const seriesMatch = pref.includes(seriesType) ? 30 : 0;
  const verifiability = item.hasLiveArtifact ? 20 : (item.evidenceStatus === EVIDENCE_STATUS.ZREALIZOWANE ? 20 : 12);
  const audienceValue = item.priority === 1 ? 18 : 14;
  const missionAlignment = item.scripture || /biblia|pomoc|akademia|vod/i.test(item.id) ? 18 : 14;
  const freshness = item.verifiedDate ? 10 : 5;
  const visualAppeal = item.photoRelPath ? 10 : 4;
  return {
    total: seriesMatch + verifiability + audienceValue + missionAlignment + freshness + visualAppeal,
    breakdown: { seriesMatch, audienceValue, missionAlignment, freshness, verifiability, visualAppeal },
  };
}

export function checkDuplicateAgainstArchive({ topicKey, title, teaser, body, archive = [], threshold = 0.65 }) {
  const combinedCandidate = `${title} ${teaser} ${body}`;
  const candidateHash = computeContentHash(title, body);
  for (const entry of archive) {
    if (entry.topic_key && entry.topic_key === topicKey) {
      return { isDuplicate: true, reason: `DUPLICATE_TOPIC_KEY:${topicKey}`, matchedJobId: entry.job_id };
    }
    if (entry.content_hash && entry.content_hash === candidateHash) {
      return { isDuplicate: true, reason: 'DUPLICATE_CONTENT_HASH', matchedJobId: entry.job_id };
    }
    const existingText = `${entry.title || ''} ${entry.teaser || ''}`;
    const sim = jaccardSimilarity(`${title} ${teaser}`, existingText);
    if (sim >= threshold) {
      return { isDuplicate: true, reason: `DUPLICATE_SIMILARITY:${sim.toFixed(2)}`, matchedJobId: entry.job_id };
    }
    if (combinedCandidate.length > 0 && entry.title && jaccardSimilarity(title, entry.title) >= 0.72) {
      return { isDuplicate: true, reason: 'DUPLICATE_TITLE_SIMILARITY', matchedJobId: entry.job_id };
    }
  }
  return { isDuplicate: false, reason: 'UNIQUE' };
}

export function selectTopicForCycle({ cycle, validatedSnapshot, recentArchive = [], threshold = 0.65 }) {
  const seriesType = cycle.seriesType;
  const eligible = (validatedSnapshot.items || []).filter(item => {
    if (item.evidenceStatus === EVIDENCE_STATUS.NIEPOTWIERDZONE) return false;
    if (item.isPlanOnly || item.isCommitOnly) return false;
    if (seriesType === 'mission-report') {
      return item.evidenceStatus === EVIDENCE_STATUS.ZREALIZOWANE && (!item.seriesPreference.length || item.seriesPreference.includes('mission-report'));
    }
    if (seriesType === 'behind-the-scenes') {
      return (item.evidenceStatus === EVIDENCE_STATUS.ZREALIZOWANE || item.evidenceStatus === EVIDENCE_STATUS.W_TRAKCIE)
        && item.seriesPreference.includes('behind-the-scenes');
    }
    if (seriesType === 'thank-you') {
      return item.evidenceStatus === EVIDENCE_STATUS.ZREALIZOWANE && item.seriesPreference.includes('thank-you');
    }
    return false;
  });

  const scored = eligible
    .map(item => ({ item, score: scoreCandidate(item, seriesType) }))
    .sort((a, b) => b.score.total - a.score.total);

  for (const cand of scored) {
    const dup = checkDuplicateAgainstArchive({
      topicKey: cand.item.id,
      title: cand.item.headlineFact,
      teaser: cand.item.summaryFact,
      body: cand.item.summaryFact,
      archive: recentArchive,
      threshold,
    });
    if (!dup.isDuplicate) {
      return { selected: cand.item, score: cand.score, skippedDuplicates: scored.length };
    }
  }

  return { selected: null, reason: 'NO_UNIQUE_VERIFIED_TOPIC', candidatesChecked: scored.length };
}
