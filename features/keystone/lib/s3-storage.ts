/**
 * S3 addressing shared by the Keystone storage config and next.config images.
 * Railway buckets reject path-style requests, so their endpoint uses
 * virtual-hosted URLs (bucket as subdomain). MinIO and other S3-compatible
 * endpoints keep path-style, as before.
 */
export function s3ForcePathStyle(endpoint?: string): boolean {
  let hostname = '';
  try {
    hostname = endpoint ? new URL(endpoint).hostname : '';
  } catch {}
  return !(hostname === 'storageapi.dev' || hostname.endsWith('.storageapi.dev'));
}
