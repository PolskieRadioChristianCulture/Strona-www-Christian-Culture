# EkoCC Facebook Pages Publisher — P1 ZERO COST
Status: **implementation candidate / NOT DEPLOYED**.

## Verified separately in operator browser
Meta Graph API returned an ID for a post on Page Radio Christian Culture (418082804722236). This confirms manual posting with the operator's token; no token was ever made available to ChatGPT or GitHub.

## Files
- `lib/cc-social-publisher/facebook.mjs`: Meta Graph API v26 adapter with strict Page ID, read check, existing-post comparison, opt-in POST.
- `scripts/cc-facebook-publisher.mjs`: local command line, default dry-run.
- `tests/cc-facebook-publisher.test.mjs`: unit tests with mock network; no Meta requests.

## Setup (never paste tokens into chats or Git)
1. Obtain Page Access Token through official Meta flow. For production choose an appropriate durable system user or documented refresh flow based on app eligibility. Token lifetime and permissions must be verified. Store the secret outside repository.
2. Create a private approved job JSON, for example:
   `{"channel":"facebook_page","pageId":"418082804722236","approved":true,"message":"📖 Z Biblią za Pan Brat — Dzień 21\\nhttps://polskieradio.cc/akademia/kurscodzienny/dzien-21"}`
3. Dry-run: `node scripts/cc-facebook-publisher.mjs approved.json` — never sends network requests.
4. Operator-only publishing: set `META_PAGE_ACCESS_TOKEN` in secure runtime environment and `CC_FACEBOOK_CONFIRM=PUBLISH_APPROVED_FACEBOOK_POST`, then `node scripts/cc-facebook-publisher.mjs approved.json --publish`.
5. Verify the published ID and public permalink; a successful API response is not enough to establish public visibility.

## Restrictions
- No scheduled unattended production. No background automation unless durable shared queue, centralized idempotency, access token rotation, transactional claiming, kill switch and retry safety are implemented.
- Existing-post duplicate check compares only up to 100 recent posts; it is **not** a strict exactly-once guarantee. Concurrent calls and retries after uncertain network results can duplicate. On an uncertain result, stop and verify manually; never blindly retry.
- No API calls are issued unless `--publish` is specified.
- Do not use user token as long-term Page token. No credentials in repos, PR bodies or ChatGPT.
- Use only Meta official API; use Page access permitted by app role and permissions.
- Publishing the same text intentionally twice would require a separate workflow explicitly authorized by the owner.

## Acceptance
`node --test tests/cc-social-publisher.test.mjs tests/cc-facebook-publisher.test.mjs`.
Run CI, have human verify preview, and only then consider controlled canary execution.
