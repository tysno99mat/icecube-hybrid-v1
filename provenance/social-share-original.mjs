// Static social metadata. This module never imports or modifies the simulation core.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROOT = fileURLToPath(new URL('..', import.meta.url));
const TITLE = 'IceCube — Seeing the Universe Through a Kilometer of Ice';
const DESCRIPTION = 'Explore an interactive, physics-informed simulation of the IceCube Neutrino Observatory beneath the Antarctic ice.';
const IMAGE_ALT = 'IceCube neutrino observatory beneath Antarctic ice with a simulated Cherenkov-light event';
const START = '<!-- ICECUBE SOCIAL METADATA START -->';
const END = '<!-- ICECUBE SOCIAL METADATA END -->';
const IMAGE_NAME = 'icecube-og-1200x630.jpg';

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function productionBase(value) {
  if (!value) return null;
  let url;
  try { url = new URL(value); } catch { throw new Error('ICECUBE_PRODUCTION_URL must be an absolute HTTPS site URL.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('Use a public HTTPS production site URL without credentials, query or fragment.');
  }
  if (url.hostname === 'localhost' || url.hostname.endsWith('.localhost') || url.hostname === '127.0.0.1' || url.hostname === '[::1]') {
    throw new Error('A local URL cannot be used as the production sharing URL.');
  }
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url;
}

export function integrateSocialShare(root = DEFAULT_ROOT, env = process.env) {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'config/social-share.json'), 'utf8'));
  const shareEnv = env.ICECUBE_SHARE_ENV || 'preview';
  if (!['preview', 'production'].includes(shareEnv)) throw new Error('ICECUBE_SHARE_ENV must be preview or production.');
  const base = productionBase(env.ICECUBE_PRODUCTION_URL || config.productionUrl);
  if (shareEnv === 'production' && !base) {
    throw new Error('Production social metadata requires ICECUBE_PRODUCTION_URL or config/social-share.json productionUrl. No placeholder or preview URL will be published.');
  }
  const imageUrl = base ? new URL('og/' + IMAGE_NAME, base).href : null;
  const tags = [
    `<title>${TITLE}</title>`,
    `<meta name="description" content="${escapeAttribute(DESCRIPTION)}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:title" content="${escapeAttribute(TITLE)}">`,
    `<meta property="og:description" content="${escapeAttribute(DESCRIPTION)}">`,
    '<meta property="og:site_name" content="IceCube Interactive Simulation">',
    '<meta property="og:locale" content="zh_TW">',
    ...(imageUrl ? [
      `<meta property="og:image" content="${escapeAttribute(imageUrl)}">`,
      `<meta property="og:image:secure_url" content="${escapeAttribute(imageUrl)}">`,
      '<meta property="og:image:type" content="image/jpeg">',
    ] : []),
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${escapeAttribute(IMAGE_ALT)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeAttribute(TITLE)}">`,
    `<meta name="twitter:description" content="${escapeAttribute(DESCRIPTION)}">`,
    ...(imageUrl ? [
      `<meta name="twitter:image" content="${escapeAttribute(imageUrl)}">`,
      `<meta name="twitter:image:alt" content="${escapeAttribute(IMAGE_ALT)}">`,
    ] : []),
    ...(shareEnv === 'production' ? [
      `<link rel="canonical" href="${escapeAttribute(base.href)}">`,
      `<meta property="og:url" content="${escapeAttribute(base.href)}">`,
    ] : []),
  ];
  const metadata = START + '\n' + tags.join('\n') + '\n' + END;
  const patchDocument = relative => {
    const destination = path.join(root, relative);
    let html = fs.readFileSync(destination, 'utf8');
    if (!html.includes('</head>')) throw new Error(`Missing head in ${relative}`);
    html = html.replace(/<!-- ICECUBE SOCIAL METADATA START -->[\s\S]*?<!-- ICECUBE SOCIAL METADATA END -->\n?/g, '');
    html = html.replace(/<title>[\s\S]*?<\/title>\n?/g, '');
    html = html.replace('</head>', metadata + '\n</head>');
    fs.writeFileSync(destination, html);
  };
  // These are standalone documents that can be fetched by social crawlers.
  patchDocument('dist/icecube_rc071.html');
  patchDocument('dist/offline/index.html');

  // A body-only artifact cannot own a hosting page's head. Export its head explicitly.
  const fragment = path.join(root, 'dist/icecube_rc071_artifact_body.html');
  const fragmentHtml = fs.readFileSync(fragment, 'utf8').replace(/<title>[\s\S]*?<\/title>/, `<title>${TITLE}</title>`);
  fs.writeFileSync(fragment, fragmentHtml);
  fs.writeFileSync(path.join(root, 'dist/share-head.html'), metadata + '\n');

  for (const directory of ['dist/og', 'dist/offline/og']) {
    fs.mkdirSync(path.join(root, directory), { recursive: true });
    // The optimized image is served; the original master is retained in public/og.
    fs.copyFileSync(path.join(root, 'public/og', IMAGE_NAME), path.join(root, directory, IMAGE_NAME));
  }
  // Root index is the existing offline bundle with only head metadata changes.
  fs.copyFileSync(path.join(root, 'dist/offline/index.html'), path.join(root, 'dist/index.html'));
  const status = {
    environment: shareEnv,
    productionUrl: base?.href || null,
    imageUrl,
    canonicalInjected: shareEnv === 'production',
    status: base ? 'READY_FOR_DEPLOYMENT_VERIFICATION' : 'PRODUCTION_URL_PENDING',
    publishDirectory: 'dist',
    imagePath: 'og/' + IMAGE_NAME,
    metadataDelivery: 'static head in HTTP document; no client-side metadata injection',
  };
  fs.writeFileSync(path.join(root, 'dist/share-metadata-status.json'), JSON.stringify(status, null, 2) + '\n');
  // Keep the release manifest current after build-time environment injection.
  const files = [];
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (['node_modules', '.git', '.DS_Store'].includes(entry.name)) continue;
      const location = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(location);
      else if (entry.isFile() && location !== path.join(root, 'SHA256SUMS.txt')) files.push(location);
    }
  };
  visit(root);
  const manifest = files.sort().map(file => {
    const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    return hash + '  ./' + path.relative(root, file).split(path.sep).join('/');
  }).join('\n') + '\n';
  fs.writeFileSync(path.join(root, 'SHA256SUMS.txt'), manifest);
  console.log(JSON.stringify(status, null, 2));
  return status;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  integrateSocialShare();
}
