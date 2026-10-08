import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createEvent,controlledInput,visualContext,getSimulationCount,CORE_SHA} from '../src/adapter/index.mjs';
import {peDiameter,arrivalWindow,arrivalFraction,arrivalPulse,chargedMarker,shellRadius,sourceSelection} from '../src/renderer/visual-mapping.mjs';
const digest=x=>crypto.createHash('sha256').update(JSON.stringify(x,(k,v)=>v instanceof Map?[...v]:v)).digest('hex');
const checks=[];const check=(name,f)=>{f();checks.push({name,status:'PASS'});};
check('PE display scaling stays finite, bounded and monotonic across six orders of magnitude',()=>{
 let last=0;for(const n of[0,1,2,10,100,1000,1e6]){const s=peDiameter(n);assert(Number.isFinite(s)&&s>=10&&s<=34&&s>=last);last=s;}
});
check('Continuous arrival encoding uses returned times and preserves early-to-late ordering',()=>{
 const hits=[{t:25,noise:false},{t:50,noise:false},{t:90,noise:false},{t:-100,noise:true}],w=arrivalWindow(hits);
 assert.deepEqual(w,{first:25,last:90});assert(arrivalFraction(25,w)<arrivalFraction(50,w));assert(arrivalFraction(50,w)<arrivalFraction(90,w));
 assert.equal(arrivalPulse(24,25),0);assert.equal(arrivalPulse(25,25),1);assert.equal(arrivalPulse(205,25),0);
});
check('Scrubbing visual aids backward/forward does not run physics or mutate returned events',()=>{
 for(const type of['through','starting','cascade']){
  const s=createEvent(controlledInput({type,energy:100,seed:1492,directionMode:'any'})),before=digest(s.result),calls=getSimulationCount();
  const sources=sourceSelection(s.result.event.points);assert(sources.length<=6);for(const p of sources)assert(s.result.event.points.includes(p));
  for(const time of[-900,0,250,5000,12000,5000,250,0,-900]){
   for(const tr of s.result.event.tracks){const m=chargedMarker(tr,s.result.event.dir,time,visualContext.C),delta=m.position.map((x,i)=>x-tr.p0[i]),projection=delta.reduce((a,x,i)=>a+x*s.result.event.dir[i],0);
    assert(projection>=tr.s0-1e-9&&projection<=tr.s1+1e-9);assert(Math.hypot(...delta.map((x,i)=>x-projection*s.result.event.dir[i]))<1e-8);
   }
   for(const p of sources){const radius=shellRadius(time,p.t,visualContext.V_LIGHT);assert(Number.isFinite(radius)&&radius>=0);if(time<=p.t)assert.equal(radius,0);}
  }
  assert.equal(getSimulationCount(),calls);assert.equal(digest(s.result),before);
 }
});
check('Frozen core remains identical in source and built payload',()=>{
 for(const f of['src/core.mjs','dist/src/core.mjs'])assert.equal(crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),CORE_SHA);
});
fs.mkdirSync('qa/results',{recursive:true});fs.writeFileSync('qa/results/enrichment-mapping.json',JSON.stringify({checks,status:'PASS',coreSHA:CORE_SHA},null,2));
console.log(JSON.stringify({checks:checks.length,status:'PASS',coreSHA:CORE_SHA}));
