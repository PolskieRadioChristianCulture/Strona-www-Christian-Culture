# EkoCC SOCIAL AUTO PUBLISHER — P0 foundation (ZERO COST)

**State:** implementation branch, non-production. No Meta/Google tokens or credentials are committed.

## Delivered
- `lib/cc-social-publisher/queue.mjs`: pure validation, channel isolation, explicit approval gate, idempotency key per (channel,target,content), state transition guard, schedule decision, dry-run.
- `tests/cc-social-publisher.test.mjs`: unit tests.
- No network calls, actual posts, token storage, scheduler or integration with Mission Control in P0.

## Next integration phases (only after operator authorizes)
1. OAuth: Meta Page access token with least privileges; Google OAuth refresh-token flow per authorized YouTube channel; secrets stored outside Git. Validate platform permissions & app review as applicable.
2. Durable store for queue, retry count, deduplication, and external post IDs (D1 or existing approved storage); transactional claim and idempotency across retries.
3. Meta Page adapter: dry-run first; publish `/{page-id}/feed` only for authorized Pages; inspect API response and validate post exists before `published`.
4. YouTube adapter: resumable upload using authorized Google account, quota budget, explicit privacy/scheduling; support distinct per-channel credentials.
5. Cron trigger + backoff + terminal failure, audit log, manual kill switch, quota cap, and JOMA/Chronos status integration after tested access.
6. Preview → staging → live canary (one test Page/video) → production after green CI and owner approval.

## Safety requirements
- No unauthorized posting, no Facebook group/profile scraping or unofficial API use.
- Never log access/refresh tokens or user data.
- Preview does not assert real delivery.
- Content stays approved only if the exact source revision is unchanged; hash content on ingestion in the full implementation.
- No paid features or paid infrastructure without explicit owner consent.
- Test command: `node --test tests/cc-social-publisher.test.mjs`.
