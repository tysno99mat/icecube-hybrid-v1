import fs from 'node:fs'; import crypto from 'node:crypto'; import path from 'node:path';
const SHA='b130dcf5ed8db225420bb92070206d96b5c782e9baf35fc9b300589f372882f9';
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
if(hash('src/core.mjs')!==SHA) throw new Error('STOP RELEASE: frozen core hash mismatch');
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist');
fs.cpSync('src','dist/src',{recursive:true});fs.cpSync('public','dist',{recursive:true});
// The master stays in the candidate archive, never in the deployed payload.
fs.rmSync('dist/og/icecube-og-master.png');
fs.copyFileSync('index.html','dist/index.html');
fs.copyFileSync('qa/exact-fixtures.json','dist/exact-fixtures.json');
const env=process.env.ICECUBE_SHARE_ENV||'preview';
if(!['preview','production'].includes(env))throw new Error('Invalid share environment');
const config=JSON.parse(fs.readFileSync('config/social-share.json'));
const supplied=process.env.ICECUBE_PRODUCTION_URL||config.productionUrl;
let base=null;
if(supplied){
  base=new URL(supplied);
  if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash||['localhost','127.0.0.1','[::1]'].includes(base.hostname)||base.hostname.endsWith('.localhost'))throw new Error('A public HTTPS production URL is required');
  if(!base.pathname.endsWith('/'))base.pathname+='/';
}
if(env==='production'&&!base)throw new Error('Production URL undefined: refusing production metadata');
const title='IceCube — Seeing the Universe Through a Kilometer of Ice';
const desc='Explore an interactive, physics-informed simulation of the IceCube Neutrino Observatory beneath the Antarctic ice.';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const img=base?new URL('og/icecube-og-1200x630.jpg',base).href:null;
const tags=[`<title>${title}</title>`,`<meta name="description" content="${desc}">`,`<meta property="og:type" content="website">`,`<meta property="og:title" content="${title}">`,`<meta property="og:description" content="${desc}">`,`<meta property="og:site_name" content="IceCube Interactive Simulation">`,`<meta property="og:locale" content="zh_TW">`,`<meta name="twitter:card" content="summary_large_image">`,`<meta name="twitter:title" content="${title}">`,`<meta name="twitter:description" content="${desc}">`,
  `<meta property="og:image:width" content="1200">`,`<meta property="og:image:height" content="630">`,`<meta property="og:image:alt" content="IceCube neutrino observatory beneath Antarctic ice with a simulated Cherenkov-light event">`,
  ...(img?[`<meta property="og:image" content="${esc(img)}">`,`<meta property="og:image:secure_url" content="${esc(img)}">`,`<meta property="og:image:type" content="image/jpeg">`,`<meta name="twitter:image" content="${esc(img)}">`,`<meta name="twitter:image:alt" content="IceCube neutrino observatory beneath Antarctic ice with a simulated Cherenkov-light event">`]:[]),
  ...(env==='production'?[`<link rel="canonical" href="${esc(base.href)}">`,`<meta property="og:url" content="${esc(base.href)}">`]:[`<meta name="robots" content="noindex, nofollow">`])];
let html=fs.readFileSync('dist/index.html','utf8').replace('<!-- SOCIAL_HEAD -->',tags.join('\n'));
fs.writeFileSync('dist/index.html',html);
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const sourceFiles=[...walk('src'),...walk('public'),'index.html','config/social-share.json','build/build.mjs','build/serve.mjs'].filter(f=>!f.endsWith('icecube-og-master.png')).sort();
const buildSHA=crypto.createHash('sha256').update(sourceFiles.map(f=>f+' '+hash(f)).join('\n')).digest('hex');
const provenance={buildSHA,buildDate:'2026-10-08',version:'1.0.0-visual-polish-rc.1',coreSHA:SHA,candidateArchiveSHA:'6a4f7bff25014d7cbf1dea4d16848dbaa3d2b72ddaa3365a712ea92e99188cf3',environment:env,productionUrl:base?.href||null,imageUrl:img,canonicalInjected:env==='production',status:'LOCAL_VISUAL_QA_REQUIRED'};
fs.writeFileSync('dist/release.json',JSON.stringify(provenance,null,2));
console.log(JSON.stringify(provenance,null,2));
