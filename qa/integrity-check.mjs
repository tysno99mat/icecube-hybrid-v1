import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),before=JSON.parse(fs.readFileSync('qa/results/integrity-before.json')),core='b130dcf5ed8db225420bb92070206d96b5c782e9baf35fc9b300589f372882f9';
for(const p of ['src/core.mjs','dist/src/core.mjs','provenance/renderer-enrichment-before/src/core.mjs'])assert.equal(sha(p),core,'STOP: core drift');
const allowed=['src/renderer/light-layers.mjs','src/renderer/scene.mjs','src/story/index.mjs','src/ui/app.mjs','src/ui/styles.css'];
const changes=Object.entries(before.sourceSHA256).filter(([p,h])=>sha(p)!==h).map(([p])=>p);assert.deepEqual(changes.sort(),allowed.sort());
const protectedFiles=['src/core.mjs','src/adapter/index.mjs','src/adapter/types.d.ts','src/diagnostics/panel.mjs','src/renderer/visual-mapping.mjs'];
for(const p of protectedFiles)assert.equal(sha(p),before.sourceSHA256[p]);
assert.equal(sha('qa/exact-fixtures.json'),before.exactFixturesSHA256);assert.equal(sha('config/social-share.json'),before.metadataConfigSHA256);assert.equal(sha('public/og/icecube-og-1200x630.jpg'),before.socialImageSHA256);
const a=fs.readFileSync('provenance/renderer-enrichment-before/src/renderer/light-layers.mjs','utf8'),b=fs.readFileSync('src/renderer/light-layers.mjs','utf8');
const segment=(s,start,end)=>s.slice(s.indexOf(start),end?s.indexOf(end):undefined);
assert.equal(segment(a,'export function makeHitField','function glowTexture'),segment(b,'export function makeHitField','function glowTexture'));assert.equal(segment(a,'export class DepthContext'),segment(b,'export class DepthContext'));
const cone='const coneGeo=new THREE.ConeGeometry(1,1,32,1,true);coneGeo.translate(0,-.5,0);';assert(a.includes(cone)&&b.includes(cone));
assert.equal(segment(fs.readFileSync('provenance/renderer-enrichment-before/index.html','utf8'),'<head>','</head>'),segment(fs.readFileSync('dist/index.html','utf8'),'<head>','</head>'));
const storyOld=fs.readFileSync('provenance/renderer-enrichment-before/src/story/index.mjs','utf8'),storyNew=fs.readFileSync('src/story/index.mjs','utf8');assert.equal(segment(storyOld,'export const LINEFIT_WARNING','export function stages'),segment(storyNew,'export const LINEFIT_WARNING','export function stages'));
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);for(const p of walk('public')){const old='../IceCube_Hybrid_V1_Renderer_Enrichment/'+p;if(fs.existsSync(old))assert.equal(sha(p),sha(old),p+' changed');}
const r={status:'PASS',coreSHA:core,coreSourceDistBeforeEqual:true,protectedFiles:protectedFiles.map(p=>({path:p,sha256:sha(p),unchanged:true})),sourceChanges:changes,hitFieldByteIdentical:true,depthContextByteIdentical:true,coneGeometryByteIdentical:true,mandatoryWarningsByteIdentical:true,servedMetadataHeadByteIdentical:true,socialImageByteIdentical:true,exactFixturesByteIdentical:true,adapterChanged:false};fs.writeFileSync('qa/results/frozen-core-integrity.json',JSON.stringify(r,null,2));console.log(JSON.stringify(r));
