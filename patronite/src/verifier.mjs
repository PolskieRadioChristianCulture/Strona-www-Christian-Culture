export async function verifyPublicationResult({ adapter, draft, publishResponse }) {
  if (!publishResponse) {
    return { verified: false, code: 'EMPTY_RESPONSE', status: 'BŁĄD' };
  }
  if (publishResponse.status === 'SZKIC') {
    return {
      verified: true,
      code: 'DRAFT_PACKAGE_VERIFIED',
      status: 'SZKIC',
      url: publishResponse.localDraftPath,
      remotePostId: publishResponse.jobId,
      verifiedAt: new Date().toISOString(),
    };
  }
  if (!adapter || typeof adapter.readPost !== 'function') {
    return { verified: false, code: 'VERIFIER_ADAPTER_MISSING', status: 'BŁĄD' };
  }

  try {
    const readRes = await adapter.readPost({
      jobId: draft.jobId,
      remotePostId: publishResponse.remotePostId || null,
    });
    if (!readRes || !readRes.found) {
      return {
        verified: false,
        code: 'POST_NOT_FOUND_AFTER_PUBLISH',
        status: 'BŁĄD',
      };
    }
    const titleMatch = !readRes.title || readRes.title.trim() === draft.title.trim();
    return {
      verified: titleMatch,
      code: titleMatch ? 'VERIFIED_ON_ACCOUNT' : 'TITLE_MISMATCH',
      status: readRes.status || 'OPUBLIKOWANO',
      url: readRes.url,
      remotePostId: readRes.remotePostId,
      verifiedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      verified: false,
      code: err.code || 'VERIFICATION_FAILED',
      status: 'BŁĄD',
      message: err.message,
    };
  }
}
