// Node's built-in test runner. Presigns image reads the way Keystone's S3 adapter
// does (S3 client + GetObjectCommand + getSignedUrl), fully offline, and checks the
// next.config image host matches. No network, bucket or real env.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { S3, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const root = path.resolve(__dirname, '..');

function load(relative, env = {}) {
  const filename = path.resolve(root, relative);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, {
    module, exports: module.exports, URL, process: { env },
    require: (specifier) => load(`${path.resolve(path.dirname(filename), specifier)}.ts`, env),
  }, { filename });
  return module.exports;
}

const { s3ForcePathStyle } = load('features/keystone/lib/s3-storage.ts');

async function presignImage({ endpoint, bucketName, region }) {
  const s3 = new S3({
    credentials: { accessKeyId: 'test-key', secretAccessKey: 'test-secret' },
    region, endpoint, forcePathStyle: s3ForcePathStyle(endpoint),
  });
  const command = new GetObjectCommand({ Bucket: bucketName, Key: 'cku1abc.jpg' });
  return new URL(await getSignedUrl(s3, command, { expiresIn: 5000 }));
}

function imageHostname(env) {
  return load('next.config.ts', env).default.images.remotePatterns[0].hostname;
}

test('Railway bucket endpoint presigns virtual-hosted URLs that next/image allows', async () => {
  const env = { S3_ENDPOINT: 'https://t3.storageapi.dev', S3_BUCKET_NAME: 'shop-images-a1b2c3', S3_REGION: 'auto' };
  assert.equal(s3ForcePathStyle(env.S3_ENDPOINT), false);
  const url = await presignImage({ endpoint: env.S3_ENDPOINT, bucketName: env.S3_BUCKET_NAME, region: env.S3_REGION });
  assert.equal(url.hostname, 'shop-images-a1b2c3.t3.storageapi.dev');
  assert.equal(url.pathname, '/cku1abc.jpg');
  assert.equal(url.searchParams.get('X-Amz-Expires'), '5000');
  assert.ok(url.searchParams.get('X-Amz-Signature'));
  assert.equal(imageHostname(env), url.hostname);
});

test('MinIO and other S3 endpoints keep path-style URLs and the same image host', async () => {
  const env = { S3_ENDPOINT: 'https://bucket-production-1234.up.railway.app', S3_BUCKET_NAME: 'openfront', S3_REGION: 'us-east-1' };
  assert.equal(s3ForcePathStyle(env.S3_ENDPOINT), true);
  const url = await presignImage({ endpoint: env.S3_ENDPOINT, bucketName: env.S3_BUCKET_NAME, region: env.S3_REGION });
  assert.equal(url.hostname, 'bucket-production-1234.up.railway.app');
  assert.equal(url.pathname, '/openfront/cku1abc.jpg');
  assert.equal(imageHostname(env), url.hostname);
  assert.equal(imageHostname({ ...env, S3_ENDPOINT: 'https://minio.example.com:9000' }), 'minio.example.com');
});

test('missing or unparseable endpoints fall back to path-style as before', () => {
  assert.equal(s3ForcePathStyle(undefined), true);
  assert.equal(s3ForcePathStyle('not a url'), true);
  assert.equal(s3ForcePathStyle('https://sfo3.digitaloceanspaces.com'), true);
  assert.equal(s3ForcePathStyle('https://evilstorageapi.dev'), true);
  assert.equal(imageHostname({}), '/');
});
