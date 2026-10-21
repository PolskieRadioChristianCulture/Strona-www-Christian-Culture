// EkoCC Social Publisher P0 — pure, offline-safe queue validation. No network calls.
import { createHash } from 'node:crypto';

export const CHANNELS = Object.freeze(['facebook_page', 'youtube']);
export const STATES = Object.freeze(['draft', 'approved', 'queued', 'publishing', 'published', 'failed', 'cancelled']);
export const ALLOWED_TRANSITIONS = Object.freeze({
  draft: ['approved', 'cancelled'],
  approved: ['queued', 'cancelled'],
  queued: ['publishing', 'cancelled'],
  publishing: ['published', 'failed'],
  failed: ['queued', 'cancelled'],
  published: [], cancelled: [],
});

export function validateJob(job) {
  if (!job || typeof job !== 'object' || Array.isArray(job)) throw new Error('Job must be an object');
  if (!CHANNELS.includes(job.channel)) throw new Error('Unsupported channel');
  if (!/^[a-zA-Z0-9._:-]{1,100}$/.test(job.targetId || '')) throw new Error('Invalid target ID');
  if (!/^[a-zA-Z0-9._:-]{1,120}$/.test(job.contentId || '')) throw new Error('Invalid content ID');
  if (typeof job.text !== 'string' || !job.text.trim() || job.text.length > 10000) throw new Error('Invalid content text');
  if (job.url && (!/^https:\/\//.test(job.url) || !URL.canParse(job.url))) throw new Error('HTTPS URL required');
  if (job.channel === 'youtube' && (!job.mediaUrl || !/^https:\/\//.test(job.mediaUrl) || !URL.canParse(job.mediaUrl))) throw new Error('YouTube media URL required');
  if (!job.approvedBy || !/^[a-zA-Z0-9._:-]{1,100}$/.test(job.approvedBy)) throw new Error('Explicit approval required');
  if (!job.approvedAt || Number.isNaN(Date.parse(job.approvedAt))) throw new Error('Approval timestamp required');
  if (job.scheduledAt && Number.isNaN(Date.parse(job.scheduledAt))) throw new Error('Invalid schedule');
  return Object.freeze({ ...job, state: 'approved' });
}

export function dedupeKey(job) {
  return createHash('sha256').update([job.channel,job.targetId,job.contentId].join('|')).digest('hex');
}

export function transition(job, nextState) {
  if (!ALLOWED_TRANSITIONS[job.state]?.includes(nextState)) throw new Error('Illegal state transition');
  return { ...job, state: nextState };
}

export function dryRun(job, existingKeys = new Set(), now = new Date()) {
  const validated = validateJob(job);
  const key = dedupeKey(validated);
  if (existingKeys.has(key)) return { action: 'skip_duplicate', key };
  if (validated.scheduledAt && Date.parse(validated.scheduledAt) > now.getTime()) return { action: 'wait', key };
  return { action: 'ready_for_queue', key, job: validated };
}
