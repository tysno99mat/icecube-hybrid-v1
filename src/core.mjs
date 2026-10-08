// Claude IceCube physics core — RC0.6 candidate
// Pure JavaScript, no dependencies. Single source of truth for the app and for the regression tests.
//
// RC0.6 scope (B01–B06 only):
//   B01 energy ledger            B02 energy→light source accounting
//   B03 multi-source timing      B04 piecewise ice transport
//   B05 EventInput contract      B06 reconstruction validity tiers
// Unchanged on purpose: DOM geometry, Cherenkov emission geometry and direct-time formula (validated in RC0.5),
// refractive indices, LC cleaning, noise rate, scattering mean law (0.8·d/n^0.7), light-yield constants.
//
// THIS IS AN UNCALIBRATED TEACHING MODEL. "model PE" is a relative light-yield unit, not an IceCube prediction.

// RC0.7 scope (computational / semantic safety only): scale-safe input normalisation and strict array checks (R01),
// LineFit output contract without reliability semantics (R02/R04), cascade direction non-identifiability (R03),
// exact large-μ Poisson sampler (R05), Weibull disclosure (R06), parametric ice-boundary integration (R07),
// explicit energy-conservation tolerance (R08). Physics constants, geometry, ledger structure and scattering unchanged.
// RC0.7.1 (release-gate patch, no physics change): exception-safe validation (B-INPUT-01) and FIT_RENDERABLE rename.
export const VERSION = 'claude-icecube-core RC0.7.1-candidate';

/* ---------------- constants ---------------- */
export const C = 0.299792458;                 // m/ns
export const DEFAULT_N_PHASE = 1.32, DEFAULT_N_GROUP = 1.35;   // unchanged from RC0.5 (B09 out of scope)
export const BEDROCK = 2820;                  // m
export const A_CASC = 220;                    // model PE per TeV deposited (point-source normalisation; UNCALIBRATED)
export const B_TRACK = 17;                    // bare-muon Cherenkov amplitude (UNCALIBRATED)
export const A_ION = 2.6e-4;                  // TeV/m continuous (ionisation-like) loss — textbook order of magnitude, UNVERIFIED
export const STOCH_RATE = 0.004;              // resolved stochastic losses per metre (= 4 per km, unchanged from RC0.5)
export const STOCH_FRAC_MEAN = 0.06, STOCH_FRAC_MAX = 0.5;   // fraction of REMAINING energy (RC0.5 used initial energy)
export const DELAY_COEF = 0.8;                // ns per metre, mean first-photon delay for n=1 (unchanged)
export const DELAY_EXP = 0.7;                 // first-of-n mean ∝ n^-0.7 (unchanged)
export const WEIBULL_K = 1 / DELAY_EXP;       // R06: WEIBULL FIRST-PHOTON TEACHING MODEL — UNCALIBRATED. Same mean law as RC0.5's exponential,
                                              // but ~half the variance and a much lighter high tail: the scattering physics was NOT preserved.
const GAMMA_1P7 = 0.9086387328532904;         // Γ(1 + 0.7) — checked numerically in tests
export const DARK_RATE_PER_NS = 5e-7;         // 500 Hz (unchanged)
export const JITTER_NS = 2;                   // electronics timestamp jitter (measurement, not physics)
export const MU_MIN = 1e-9;                   // sources with expected PE below this are skipped (documented bias ≤ 1e-9 per source)

/* ---------------- RNG ---------------- */
export function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
// test-only instrumentation: how many RNG streams / physics runs were started (never affects results)
export const _counters = { rngStreams:0, physicsRuns:0 };
function makeRandom(rng){
  _counters.rngStreams++;
  const gauss = () => { let u=0; while(!u) u=rng(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*rng()); };
  const expo = m => -m*Math.log(1-rng());
  // R05: exact Poisson sampling at every μ. μ < 10: multiplication (Knuth) method. μ ≥ 10: PTRS transformed rejection
  // (Hörmann 1993, as used by NumPy). Both are exact samplers of the Poisson law given a uniform RNG.
  // Iteration caps only guard against a broken RNG; they throw instead of returning a silent wrong value.
  const poisson = mu => {
    if(!(mu>0)) return 0;
    if(!Number.isFinite(mu)) throw new Error('POISSON_NONFINITE_MEAN');
    if(mu<10){ const L=Math.exp(-mu); let k=0,p=1; do{ k++; p*=rng(); if(k>10000) throw new Error('RNG_FAILURE'); }while(p>L); return k-1; }
    const slam=Math.sqrt(mu), loglam=Math.log(mu), b=0.931+2.53*slam, a=-0.059+0.02483*b, invalpha=1.1239+1.1328/(b-3.4), vr=0.9277-3.6224/(b-2);
    for(let it=0; it<100000; it++){
      const U=rng()-0.5, V=rng(), us=0.5-Math.abs(U);
      const k=Math.floor((2*a/us+b)*U+mu+0.43);
      if(us>=0.07 && V<=vr) return k;
      if(k<0 || (us<0.013 && V>us)) continue;
      if(Math.log(V)+Math.log(invalpha)-Math.log(a/(us*us)+b) <= -mu+k*loglam-loggam(k+1)) return k;
    }
    throw new Error('RNG_FAILURE');
  };
  return { rng, gauss, expo, poisson };
}
// log Γ(x) for x > 0 (Stirling series with downward recursion; same algorithm as NumPy's random_loggam)
export function loggam(x){
  const A=[8.333333333333333e-02,-2.777777777777778e-03,7.936507936507937e-04,-5.952380952380952e-04,8.417508417508418e-04,-1.917526917526918e-03,6.410256410256410e-03,-2.955065359477124e-02,1.796443723688307e-01,-1.39243221690590e+00];
  if(x===1||x===2) return 0;
  let x0=x, n=0; if(x<=7){ n=Math.floor(7-x); x0=x+n; }
  const x2=1/(x0*x0); let gl0=A[9]; for(let k=8;k>=0;k--){ gl0*=x2; gl0+=A[k]; }
  let gl=gl0/x0+0.5*Math.log(2*Math.PI)+(x0-0.5)*Math.log(x0)-x0;
  if(x<=7){ for(let k=1;k<=n;k++){ gl-=Math.log(x0-1); x0-=1; } }
  return gl;
}

/* ---------------- detector geometry (verbatim from RC0.5) ---------------- */
function linspace(a,b,n){const o=[];for(let i=0;i<n;i++)o.push(a+(b-a)*i/(n-1));return o;}
export const strings = [];
{
  const S = 125, pts = [];
  for(let q=-6;q<=6;q++) for(let r=-6;r<=6;r++){
    const hd=(Math.abs(q)+Math.abs(r)+Math.abs(q+r))/2; if(hd>5) continue;
    const x=S*(q+r/2), z=S*(r*Math.sqrt(3)/2);
    pts.push({x,z,d:Math.hypot(x*0.9,z*1.12)});
  }
  pts.sort((a,b)=>a.d-b.d);
  const std = pts.slice(0,78).sort((a,b)=>(a.z-b.z)||(a.x-b.x));
  std.forEach((p,i)=>strings.push({id:i+1,x:p.x,z:p.z,deep:false}));
  const dc=[];
  for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3; dc.push([72*Math.cos(a),72*Math.sin(a)]);}
  dc.push([144*Math.cos(Math.PI/6),144*Math.sin(Math.PI/6)]);
  dc.push([144*Math.cos(7*Math.PI/6),144*Math.sin(7*Math.PI/6)]);
  dc.forEach((p,i)=>strings.push({id:79+i,x:p[0],z:p[1],deep:true}));
}
const STD_DEPTHS = linspace(1450,2450,60);
const DC_DEPTHS = [...linspace(1750,1850,10), ...linspace(2100,2450,50)];
export const doms = [];
export const domsByString = new Map();
for(const s of strings){
  const arr=[]; (s.deep?DC_DEPTHS:STD_DEPTHS).forEach((d,i)=>{ const idx=doms.length; doms.push({idx,str:s.id,om:i+1,x:s.x,y:-d,z:s.z,depth:d}); arr.push(idx); });
  domsByString.set(s.id,arr);
}
export const inIce = y => y<0 && y>-BEDROCK;

/* ---------------- B04: ice transport (piecewise-exact optical depth) ---------------- */
// Same piecewise inverse attenuation length as RC0.5 (values UNCALIBRATED); only the integration changes.
const LAYERS = [ [0,1400,1/10], [1400,2000,1/42], [2000,2100,1/16], [2100,2450,1/70], [2450,BEDROCK,1/60] ];
export function invLambda(depth){
  if(depth<0) return 1;
  for(const [a,b,v] of LAYERS) if(depth<b) return v;
  return 1;
}
// F(d) = ∫_0^d invLambda(z) dz, exact for the piecewise-constant profile (outside ice: 1/m).
function cumInv(d){
  if(d<=0) return d*1;                 // negative depth (above surface): opaque convention, inv = 1/m
  let s=0;
  for(const [a,b,v] of LAYERS){ if(d<=a) return s; const hi=Math.min(d,b); s+=(hi-a)*v; if(d<=b) return s; }
  return s + (d-BEDROCK)*1;
}
// R07: optical depth by parametric segment/layer intersection.
// The depth interval [min(dA,dB), max(dA,dB)] is cut at every layer boundary strictly inside it; each piece lies in exactly
// one layer, identified from its lower boundary depth (never from a rounded midpoint). The piece's
// share of the path is (piece depth extent)/(total depth extent): both are differences of doubles that are exact or
// correctly rounded, so sub-nanometre crossings are resolved. Only an exactly horizontal segment (dA === dB) uses the
// single-layer formula, with the convention that a depth equal to a boundary belongs to the deeper layer (as invLambda).
const BOUNDS = [0, 1400, 2000, 2100, 2450, BEDROCK];
export const ICE_NUMERIC_DOMAIN = { y_m:[-3000, 100], L_m:[0, 1e4], note:'relative error ≤ 1e-12 vs exact rational reference on all tested paths' };
export function opticalDepth(yA, yB, L){
  if(!(L>0)) return 0;
  const dA=-yA, dB=-yB;
  if(dA===dB) return L*invLambda(dA);
  const lo=Math.min(dA,dB), hi=Math.max(dA,dB), span=hi-lo;
  const cuts=[lo]; for(const b of BOUNDS) if(b>lo && b<hi) cuts.push(b); cuts.push(hi);
  let tau=0;
  // each piece [a,c) lies inside one half-open layer, so its lower end identifies the layer (a midpoint of a sub-ulp piece
  // could round onto the upper boundary and pick the wrong layer — found by the RC0.7 exact-reference test)
  for(let i=0;i<cuts.length-1;i++){ const a=cuts[i], c=cuts[i+1]; tau += ((c-a)/span)*invLambda(a); }
  return L*tau;
}
// RC0.6 version (with the |dz| < 1e-9 midpoint fallback), kept ONLY for regression fixtures
export function opticalDepthRC06Legacy(yA, yB, L){
  const dA=-yA, dB=-yB, dz=Math.abs(dB-dA);
  if(!(L>0)) return 0;
  if(dz < 1e-9) return L*invLambda((dA+dB)/2);
  return L*Math.abs(cumInv(dB)-cumInv(dA))/dz;
}
// RC0.5 three-point estimate, kept ONLY for regression comparison
export function opticalDepthThreePointLegacy(yA,yB,L){ const d1=-yA,d2=-yB; return L*(invLambda(d1)+invLambda((d1+d2)/2)+invLambda(d2))/3; }

/* ---------------- B05: EventInput contract ---------------- */
export const CONTRACT = {
  types: ['through','starting','cascade'],
  energyTeV: [0.1, 1e5],          // UI exposes 1–10,000 TeV
  maxHorizontal_m: 800,           // |x| and |z| of the vertex / track anchor
  depth_m: [1200, 2700],          // vertex / anchor depth range (inside ice, above bedrock)
  direction: 'three finite numbers, not all zero (any magnitude; normalised scale-safely)',
  seed: [0, 4294967295],
};
// R01: read every field exactly once into primitives (no repeated getter calls), require dense arrays of primitive numbers.
function readTriple(v, name, errors){
  let isArr; try{ isArr=Array.isArray(v); }catch(e){ errors.push(`${name} is not inspectable (e.g. revoked Proxy)`); return null; }
  if(!isArr){ errors.push(`${name} must be an array`); return null; }
  let len; try{ len=v.length; }catch(e){ errors.push(`${name} length unreadable`); return null; }
  if(len!==3){ errors.push(`${name} must have length 3`); return null; }
  const out=[];
  for(let i=0;i<3;i++){
    let has, x;
    try{ has=Object.prototype.hasOwnProperty.call(v,i); x=v[i]; }catch(e){ errors.push(`${name}[${i}] unreadable`); return null; }
    if(!has){ errors.push(`${name}[${i}] is a hole (sparse array)`); return null; }
    if(typeof x!=='number' || !Number.isFinite(x)){ errors.push(`${name}[${i}] must be a finite primitive number`); return null; }
    out.push(x);
  }
  return out;
}
// scale-safe normalisation: divide by the largest |component| first, so neither overflow nor underflow can occur
export function safeNormalize(v){
  const m=Math.max(Math.abs(v[0]),Math.abs(v[1]),Math.abs(v[2]));
  if(!(m>0) || !Number.isFinite(m)) return null;
  const s=[v[0]/m, v[1]/m, v[2]/m]; const n=Math.hypot(s[0],s[1],s[2]);
  return [s[0]/n, s[1]/n, s[2]/n];
}
// B-INPUT-01: every operation on untrusted input (Array.isArray on a revoked Proxy, getters, length, element reads)
// runs inside this guard. Any exception → INVALID_INPUT; nothing is thrown to the caller and no physics runs.
export function validateEventInput(input){
  try{ return validateEventInputUnguarded(input); }
  catch(e){ return {ok:false, code:'INVALID_INPUT', errors:[`input validation raised ${e && e.name ? e.name : 'an exception'}`]}; }
}
function validateEventInputUnguarded(input){
  const errors=[];
  if(input===null || typeof input!=='object' || Array.isArray(input)) return {ok:false, code:'INVALID_INPUT', errors:['input must be a plain object']};
  let seed,type,vertexRaw,directionRaw,energy;
  try{ seed=input.seed; type=input.type; vertexRaw=input.vertex; directionRaw=input.direction; energy=input.energy; }
  catch(e){ return {ok:false, code:'INVALID_INPUT', errors:['input fields unreadable']}; }
  if(typeof seed!=='number' || !Number.isInteger(seed) || seed<CONTRACT.seed[0] || seed>CONTRACT.seed[1]) errors.push('seed must be an integer primitive in [0, 2^32-1]');
  if(typeof type!=='string' || !CONTRACT.types.includes(type)) errors.push(`unsupported type: ${typeof type==='string'?type:typeof type}`);
  const vertex=readTriple(vertexRaw,'vertex',errors);
  if(vertex){
    const depth=-vertex[1];
    if(Math.abs(vertex[0])>CONTRACT.maxHorizontal_m || Math.abs(vertex[2])>CONTRACT.maxHorizontal_m) errors.push(`vertex outside contract volume (|x|,|z| ≤ ${CONTRACT.maxHorizontal_m} m)`);
    if(!(depth>=CONTRACT.depth_m[0] && depth<=CONTRACT.depth_m[1])) errors.push(`vertex depth ${depth} m outside contract [${CONTRACT.depth_m[0]}, ${CONTRACT.depth_m[1]}] m`);
  }
  const dir=readTriple(directionRaw,'direction',errors);
  let unit=null;
  if(dir){ unit=safeNormalize(dir); if(!unit) errors.push('direction must not be the zero vector'); }
  if(typeof energy!=='number' || !Number.isFinite(energy)) errors.push('energy must be a finite primitive number');
  else if(!(energy>=CONTRACT.energyTeV[0] && energy<=CONTRACT.energyTeV[1])) errors.push(`energy ${energy} TeV outside contract [${CONTRACT.energyTeV[0]}, ${CONTRACT.energyTeV[1]}] TeV`);
  if(errors.length) return {ok:false, code:'INVALID_INPUT', errors};
  return {ok:true, input:{seed, type, vertex, direction:unit, energy}};
}

/* ---------------- R08: energy-conservation tolerance ---------------- */
// Material conservation: |residual| ≤ max(absTol, relTol·E0) and every deposit ≥ −tol. relTol = 1e-12 is ~10⁹ times
// smaller than any precision this teaching model claims. Strict IEEE `deposited <= initial` is reported separately.
export const ENERGY_TOLERANCE = { relTol:1e-12, absTol_TeV:1e-15 };
export function checkConservation(L){
  const tol=Math.max(ENERGY_TOLERANCE.absTol_TeV, ENERGY_TOLERANCE.relTol*L.initialEnergy);
  const parts=['remainingEnergy','continuousDepositedEnergy','stochasticDepositedEnergy','cascadeDepositedEnergy','escapedEnergy','totalDepositedEnergy'];
  const nonneg = parts.every(k => !(k in L) || L[k] >= -tol);
  return { strictIEEE: L.totalDepositedEnergy<=L.initialEnergy && L.remainingEnergy>=0,
           material: nonneg && Math.abs(L.residual)<=tol && L.totalDepositedEnergy<=L.initialEnergy+tol, tolerance_TeV:tol };
}

/* UI path: draw a legal EventInput from (type, E, dirMode, seed). Same sampling formulas as RC0.5. */
export function sampleEventInput(type, E, dirMode, seed){
  const rng = mulberry32(seed);
  let cz;
  if(dirMode==='up') cz = -0.08 - rng()*0.92;
  else if(dirMode==='down') cz = 0.08 + rng()*0.92;
  else cz = rng()*2-1;
  const sz=Math.sqrt(1-cz*cz), ph=rng()*Math.PI*2;
  const direction=[-sz*Math.cos(ph), -cz, -sz*Math.sin(ph)];      // travel = −source
  const [rMax,dTop,dBot] = type==='through' ? [420,1600,2300] : (type==='starting' ? [380,1600,2300] : [400,1600,2300]);
  const r=rMax*Math.sqrt(rng()), a=rng()*Math.PI*2;
  const vertex=[r*Math.cos(a), -(dTop+rng()*(dBot-dTop)), r*Math.sin(a)];
  return {seed, type, vertex, direction, energy:E};
}

/* ---------------- B01: muon propagation with an energy ledger ---------------- */
// Continuous loss A_ION·ds plus a homogeneous Poisson process of resolved stochastic losses (rate STOCH_RATE),
// each removing a fraction v = min(0.5, Exp(0.06)) of the REMAINING energy. The muon stops when its energy is spent.
// Every subtraction is from remainingEnergy, so nothing can deposit energy that does not exist.
export function propagateMuon(p0, dir, s0, sMax, E0, R){
  let E=E0, s=s0, cont=0, stoch=0; const losses=[]; let stopped=false;
  while(true){
    const sNext = s + R.expo(1/STOCH_RATE);
    const sEnd = Math.min(sNext, sMax);
    const need = A_ION*(sEnd-s);
    if(need >= E){ s = s + E/A_ION; cont += E; E = 0; stopped = true; break; }
    E -= need; cont += need; s = sEnd;
    if(sNext >= sMax) break;
    const v = Math.min(STOCH_FRAC_MAX, R.expo(STOCH_FRAC_MEAN));
    const dE = v*E; E -= dE; stoch += dE;
    const pos=[p0[0]+dir[0]*s, p0[1]+dir[1]*s, p0[2]+dir[2]*s];
    losses.push({s, E:dE, pos, inIce:inIce(pos[1])});
  }
  const escaped = stopped ? 0 : E;
  return { sEnd:s, stopped, losses,
    ledger:{ initialEnergy:E0, remainingEnergy:E, continuousDepositedEnergy:cont, stochasticDepositedEnergy:stoch,
             escapedEnergy:escaped, totalDepositedEnergy:cont+stoch, residual:E0-(cont+stoch+escaped) } };
}

/* ---------------- geometry: direct Cherenkov arrival (verbatim RC0.5 formula) ---------------- */
export function trackDirect(D, p0, dir, s0, s1, idx){
  const tx=D.x-p0[0], ty=D.y-p0[1], tz=D.z-p0[2];
  const along = tx*dir[0] + ty*dir[1] + tz*dir[2];
  const perp2 = Math.max((tx*tx+ty*ty+tz*tz)-along*along,0);
  const d = Math.max(Math.sqrt(perp2),3);
  let se = along - d/idx.TAN_TC, path = d/idx.SIN_TC, scale = 1;
  if(se<s0 || se>s1){
    se = se<s0 ? s0 : s1;
    const ex=p0[0]+dir[0]*se, ey_=p0[1]+dir[1]*se, ez=p0[2]+dir[2]*se;
    const dx=ex-D.x, dy=ey_-D.y, dz=ez-D.z;
    path = Math.max(Math.sqrt(dx*dx+dy*dy+dz*dz),3); scale=0.3;
  }
  const ey = p0[1] + dir[1]*se;
  const t = (se-s0)/C + path/idx.V_LIGHT;
  return { along, dRaw:Math.sqrt(perp2), d, se, path, scale, ey, t };
}
export function indices(nPhase=DEFAULT_N_PHASE, nGroup=DEFAULT_N_GROUP){
  const COS_TC=1/nPhase, SIN_TC=Math.sqrt(1-COS_TC*COS_TC); return {N_PHASE:nPhase, N_GROUP:nGroup, COS_TC, SIN_TC, TAN_TC:SIN_TC/COS_TC, V_LIGHT:C/nGroup};
}

/* ---------------- B02: energy → light sources ---------------- */
// Three light components; every TeV of deposited energy is represented exactly once.
//   bare        : the muon's own Cherenkov light, B_TRACK per √m-geometry, emitted while the muon is alive and in ice.
//                 Not an energy deposit (photon energy is negligible); it does not scale with E.
//   continuous  : energy A_ION per metre deposited along the track → line source.
//                 Amplitude A_CASC·ε·√(2π·λ_eff): the asymptotic integral of the point-source law along a line
//                 (∫ A e^{-r/λ}/r ds ≈ A√(2πλ/d) e^{-d/λ}), so continuous and point deposits share one yield constant.
//   stochastic  : each resolved loss (and the hadronic/EM cascade of starting/cascade events) → isotropic point source,
//                 μ = A_CASC·E·e^{-τ}/r.
//   unresolved/subthreshold component: NOT MODELLED in RC0.6 (documented; contributes 0).
export function buildEvent(input, R){
  const {type, energy:E, vertex:q, direction:dir} = input;
  const ev = { input, type, dir, tracks:[], points:[], vertex:null, ledger:null };
  let had = 0;
  if(type==='through'){
    const p0=[q[0]-1700*dir[0], q[1]-1700*dir[1], q[2]-1700*dir[2]];
    const prop = propagateMuon(p0, dir, 0, 3400, E, R);
    ev.tracks.push({p0, s0:0, s1:prop.sEnd, sMax:3400, E0:E, stopped:prop.stopped});
    for(const l of prop.losses) if(l.inIce) ev.points.push({pos:l.pos, t:l.s/C, E:l.E, origin:'stochastic'});
    ev.muonLedger = prop.ledger; ev.center=q; ev.nuEnd=p0; ev.Emu=E;
    ev.ledger = eventLedger(E, 0, prop);
  } else if(type==='starting'){
    const y = 0.25 + R.rng()*0.35;
    had = E*y; const Emu = E*(1-y);
    ev.vertex=q; ev.points.push({pos:q.slice(), t:0, E:had, origin:'hadronic'});
    const prop = propagateMuon(q.slice(), dir, 0, 2600, Emu, R);
    ev.tracks.push({p0:q.slice(), s0:0, s1:prop.sEnd, sMax:2600, E0:Emu, stopped:prop.stopped});
    for(const l of prop.losses) if(l.inIce) ev.points.push({pos:l.pos, t:l.s/C, E:l.E, origin:'stochastic'});
    ev.muonLedger = prop.ledger; ev.center=q; ev.nuEnd=q.slice(); ev.Emu=Emu; ev.Ehad=had;
    ev.ledger = eventLedger(E, had, prop);
  } else {
    ev.vertex=q; ev.points.push({pos:q.slice(), t:0, E, origin:'cascade'});
    ev.center=q; ev.nuEnd=q.slice();
    ev.ledger = { initialEnergy:E, remainingEnergy:0, continuousDepositedEnergy:0, stochasticDepositedEnergy:0, cascadeDepositedEnergy:E, escapedEnergy:0, totalDepositedEnergy:E, residual:0 };
  }
  return ev;
}
function eventLedger(E, had, prop){
  const L=prop.ledger; const tot = had + L.continuousDepositedEnergy + L.stochasticDepositedEnergy;
  return { initialEnergy:E, remainingEnergy:L.remainingEnergy, continuousDepositedEnergy:L.continuousDepositedEnergy,
    stochasticDepositedEnergy:L.stochasticDepositedEnergy, cascadeDepositedEnergy:had, escapedEnergy:L.escapedEnergy,
    totalDepositedEnergy:tot, residual:E-(tot+L.escapedEnergy) };
}

/* expected light and direct time of every source at one DOM */
export function sourceTerms(D, ev, idx){
  const out=[];
  for(const tr of ev.tracks){
    const g = trackDirect(D, tr.p0, ev.dir, tr.s0, tr.s1, idx);
    if(!inIce(g.ey)) continue;
    const tau = opticalDepth(g.ey, D.y, g.path);
    const lamEff = tau>0 ? g.path/tau : 1e9;
    const amp = B_TRACK + A_CASC*A_ION*Math.sqrt(2*Math.PI*lamEff);
    const mu = g.scale*amp*Math.exp(-tau)/Math.sqrt(g.scale<1?g.path:g.d);
    out.push({kind:'track', mu, t:g.t, path:g.path});
  }
  for(const P of ev.points){
    const dx=D.x-P.pos[0], dy=D.y-P.pos[1], dz=D.z-P.pos[2];
    const r = Math.max(Math.sqrt(dx*dx+dy*dy+dz*dz),3);
    const mu = A_CASC*P.E*Math.exp(-opticalDepth(P.pos[1], D.y, r))/r;
    out.push({kind:P.origin, mu, t:P.t + r/idx.V_LIGHT, path:r});
  }
  return out;
}

/* ---------------- B03: per-source photon counting and first-photon composition ---------------- */
// Each source i contributes n_i ~ Poisson(μ_i) photoelectrons (independent Poisson processes ⇒ the total is
// Poisson(Σμ) whatever the partition). Each photon from source i arrives at t_i + δ, δ ~ Weibull(k=1/0.7, λ_i),
// λ_i = 0.8·path_i/Γ(1.7). The first of n_i photons is Weibull(k, λ_i·n_i^{-0.7}), whose mean 0.8·path_i/n_i^{0.7}
// reproduces the RC0.5 delay law. The DOM's physical first-photon time is the minimum over sources; its
// measured time adds electronics jitter. The result is invariant (in distribution) under splitting or merging
// co-located, co-timed sources.
export function domResponse(terms, R, opts){
  let n=0, tPhys=Infinity, tDirect=Infinity, muTot=0;
  for(const s of terms){
    muTot += s.mu; if(s.t<tDirect && s.mu>MU_MIN) tDirect=s.t;
    if(!(s.mu>MU_MIN)) continue;
    const k = R.poisson(s.mu); if(k<1) continue;
    n += k;
    let delay = 0;
    if(opts.scatter){ const scale = DELAY_COEF*s.path/GAMMA_1P7*Math.pow(k,-DELAY_EXP); delay = scale*Math.pow(-Math.log(1-R.rng()), DELAY_EXP); }
    const tf = s.t + delay; if(tf<tPhys) tPhys=tf;
  }
  if(n<1) return null;
  const q = Math.max(0.3, n*(1+0.25*R.gauss()/Math.sqrt(n)));
  const tMeas = tPhys + (opts.jitter ? JITTER_NS*R.gauss() : 0);
  return { n, q, tPhys, t:tMeas, mu:muTot, tDirect };
}

/* ---------------- event simulation (validated entry point) ---------------- */
export function simulateEvent(rawInput, options={}){
  const v = validateEventInput(rawInput);
  if(!v.ok) return { status:'INVALID_INPUT', errors:v.errors };
  _counters.physicsRuns++;
  const opts = { nPhase:DEFAULT_N_PHASE, nGroup:DEFAULT_N_GROUP, noise:true, scatter:true, jitter:true, record:false, ...options };
  const idx = indices(opts.nPhase, opts.nGroup);
  const R = makeRandom(mulberry32((v.input.seed ^ 0x5bd1e995)>>>0));
  const ev = buildEvent(v.input, R);
  const hits=[]; const records = opts.record ? [] : null;
  for(const D of doms){
    const terms = sourceTerms(D, ev, idx);
    if(records) records.push({dom:D.idx, terms});
    const h = domResponse(terms, R, opts);
    if(h) hits.push({dom:D.idx, ...h, noise:false});
  }
  let tmin=Infinity,tmax=-Infinity; for(const h of hits){tmin=Math.min(tmin,h.t);tmax=Math.max(tmax,h.t);}
  if(!hits.length){tmin=0;tmax=3000;}
  const w0=tmin-800, w1=tmax+500;
  if(opts.noise){
    const nNoise = R.poisson(doms.length*DARK_RATE_PER_NS*(w1-w0));
    const used = new Set(hits.map(h=>h.dom));
    for(let i=0;i<nNoise;i++){ const di=Math.floor(R.rng()*doms.length); if(used.has(di)) continue; used.add(di); hits.push({dom:di,t:w0+R.rng()*(w1-w0),tPhys:null,q:0.4+R.rng()*0.9,n:0,noise:true}); }
  }
  // HLC-like cleaning (unchanged): neighbour within 2 DOMs on the same string, |dt| < 1 µs
  const byDom = new Map(hits.map(h=>[h.dom,h]));
  for(const h of hits){
    const D=doms[h.dom], arr=domsByString.get(D.str); h.clean=false;
    for(let k=-2;k<=2;k++){ if(!k) continue; const j=D.om-1+k; if(j<0||j>=arr.length) continue; const o=byDom.get(arr[j]); if(o && Math.abs(o.t-h.t)<1000){h.clean=true;break;} }
  }
  const clean = hits.filter(h=>h.clean);
  const reco = reconstructEvent(clean.map(h=>({...doms[h.dom], t:h.t, q:h.q})), v.input.type);
  const qa = simulationQA(reco, v.input);
  return { status:'OK', version:VERSION, input:v.input, event:ev, ledger:ev.ledger, hits, clean, byDom, reco, qa, records, options:opts };
}

/* ---------------- R02–R04: LineFit output contract (no reliability semantics) ---------------- */
// Tiers describe only whether the fit is numerically / geometrically well posed. None of them means
// "the direction is correct". Quality metrics are reported as descriptive numbers and gate nothing.
export const FIT_TIERS = ['FIT_NOT_COMPUTED','FIT_COMPUTED','GEOMETRY_NONDEGENERATE','FIT_RENDERABLE'];
export const FIT_GATES = { minHitsComputed:4, minTimeVar_ns2:1, nondegenerate:{minStrings:3, minTimeSpan_ns:30, minThirdAxis_m:5}, renderable:{minHits:8} };
export const DISCLAIMERS = {
  linefit: 'LineFit is an illustrative first-pass reconstruction.',
  noValidation: 'Passing internal quality checks does not establish directional accuracy.',
  speed: 'fitSpeed is a regression slope, not a particle or photon speed; it may exceed c.',
  cascade: 'NOT IDENTIFIABLE IN THIS PEDAGOGICAL CASCADE MODEL: the cascade light is isotropic, so the hits carry no information about the neutrino direction.',
};
function symEig3(m){ // Jacobi eigenvalues of a symmetric 3×3 matrix, descending
  const a=[[m[0][0],m[0][1],m[0][2]],[m[1][0],m[1][1],m[1][2]],[m[2][0],m[2][1],m[2][2]]];
  for(let it=0; it<50; it++){
    let p=0,q=1,max=Math.abs(a[0][1]);
    if(Math.abs(a[0][2])>max){p=0;q=2;max=Math.abs(a[0][2]);} if(Math.abs(a[1][2])>max){p=1;q=2;max=Math.abs(a[1][2]);}
    if(max<1e-12) break;
    const th=0.5*Math.atan2(2*a[p][q], a[q][q]-a[p][p]); const c=Math.cos(th), s=Math.sin(th);
    for(let k=0;k<3;k++){ const akp=a[k][p], akq=a[k][q]; a[k][p]=c*akp-s*akq; a[k][q]=s*akp+c*akq; }
    for(let k=0;k<3;k++){ const apk=a[p][k], aqk=a[q][k]; a[p][k]=c*apk-s*aqk; a[q][k]=s*apk+c*aqk; }
  }
  return [a[0][0],a[1][1],a[2][2]].sort((x,y)=>y-x);
}
// Data-only LineFit. hits: [{x,y,z,t,q,str}]. Never sees the true direction.
export function lineFit(hits){
  const G=FIT_GATES; const res={ fitStatus:'FIT_NOT_COMPUTED', reasons:[], fitDirection:null, fitSpeed:null, fitPosition:null, fitQualityMetrics:{N:hits.length}, centroid:null, centroidValid:false };
  const N=hits.length;
  if(N>=1 && hits.every(h=>[h.x,h.y,h.z,h.q].every(Number.isFinite))){
    let qs=0; const c=[0,0,0]; for(const h of hits){c[0]+=h.x*h.q;c[1]+=h.y*h.q;c[2]+=h.z*h.q;qs+=h.q;}
    if(qs>0){ res.centroid=c.map(v=>v/qs); res.centroidValid = N>=4 && new Set(hits.map(h=>h.str)).size>=2; }
  }
  if(N<G.minHitsComputed){ res.reasons.push(`N=${N} < ${G.minHitsComputed}`); return res; }
  if(!hits.every(h=>[h.x,h.y,h.z,h.t].every(Number.isFinite))){ res.reasons.push('non-finite hit values'); return res; }
  let tb=0; const rb=[0,0,0]; for(const h of hits){rb[0]+=h.x;rb[1]+=h.y;rb[2]+=h.z;tb+=h.t;} rb.forEach((v,i)=>rb[i]=v/N); tb/=N;
  let tt=0; const rt=[0,0,0]; for(const h of hits){rt[0]+=h.x*h.t;rt[1]+=h.y*h.t;rt[2]+=h.z*h.t;tt+=h.t*h.t;} rt.forEach((v,i)=>rt[i]=v/N); tt/=N;
  const varT=tt-tb*tb;
  if(!(varT>G.minTimeVar_ns2)){ res.reasons.push(`time variance ${varT.toExponential(2)} ns² ≤ ${G.minTimeVar_ns2}`); return res; }
  const v=rt.map((x,i)=>(x-rb[i]*tb)/varT); const unit=safeNormalize(v);
  if(!unit){ res.reasons.push('degenerate velocity'); return res; }
  const sp=Math.hypot(v[0],v[1],v[2]);
  res.fitStatus='FIT_COMPUTED'; res.fitDirection=unit; res.fitSpeed=sp; res.fitPosition=rb;
  const cov=[[0,0,0],[0,0,0],[0,0,0]]; const P=hits.map(h=>[h.x-rb[0],h.y-rb[1],h.z-rb[2]]);
  for(const p of P) for(let i=0;i<3;i++) for(let j=0;j<3;j++) cov[i][j]+=p[i]*p[j]/N;
  const ax=symEig3(cov).map(x=>Math.sqrt(Math.max(x,0)));
  const ts=hits.map(h=>h.t); const span=Math.max(...ts)-Math.min(...ts); const nStr=new Set(hits.map(h=>h.str)).size;
  let cs=0,vs=0,vt=0; for(let i=0;i<N;i++){ const s_=P[i][0]*unit[0]+P[i][1]*unit[1]+P[i][2]*unit[2]; const dt=hits[i].t-tb; cs+=s_*dt; vs+=s_*s_; vt+=dt*dt; }
  Object.assign(res.fitQualityMetrics,{nStrings:nStr, timeSpan_ns:span, axes_m:ax, elongation: ax[1]>0?ax[0]/ax[1]:Infinity, stCorrelation:(vs>0&&vt>0)?cs/Math.sqrt(vs*vt):0, fitSpeed_m_per_ns:sp,
    note:'descriptive only; these metrics do not certify directional accuracy'});
  const D=G.nondegenerate;
  if(nStr<D.minStrings) res.reasons.push(`strings=${nStr} < ${D.minStrings}`);
  if(span<D.minTimeSpan_ns) res.reasons.push(`time span ${span.toFixed(1)} ns < ${D.minTimeSpan_ns}`);
  if(ax[2]<D.minThirdAxis_m) res.reasons.push(`hit cloud is not 3-D (third axis ${ax[2].toFixed(1)} m < ${D.minThirdAxis_m})`);
  if(!(nStr>=D.minStrings && span>=D.minTimeSpan_ns && ax[2]>=D.minThirdAxis_m)) return res;
  res.fitStatus='GEOMETRY_NONDEGENERATE';
  if(N<G.renderable.minHits){ res.reasons.push(`N=${N} < ${G.renderable.minHits}`); return res; }
  res.fitStatus='FIT_RENDERABLE';
  return res;
}
// Event-level output contract. modelType is the simulated event hypothesis (known in this teaching model).
export function reconstructEvent(hits, modelType){
  const vertex = (()=>{ const f=lineFitCentroidOnly(hits); return { vertexEstimate:f.centroid, vertexStatus: f.centroidValid ? 'CHARGE_CENTROID_ILLUSTRATIVE' : 'NOT_AVAILABLE' }; })();
  if(modelType==='cascade'){
    return { modelType, directionStatus:'NOT_IDENTIFIABLE_IN_PEDAGOGICAL_CASCADE_MODEL', fitStatus:'NOT_APPLICABLE', fitDirection:null, fitSpeed:null, fitPosition:null,
             fitQualityMetrics:null, reasons:[DISCLAIMERS.cascade], ...vertex, disclaimers:[DISCLAIMERS.cascade] };
  }
  const f=lineFit(hits);
  return { modelType, directionStatus: f.fitStatus==='FIT_NOT_COMPUTED' ? 'NOT_AVAILABLE' : 'ILLUSTRATIVE_LINEFIT', fitStatus:f.fitStatus,
           fitDirection:f.fitDirection, fitSpeed:f.fitSpeed, fitPosition:f.fitPosition, fitQualityMetrics:f.fitQualityMetrics, reasons:f.reasons, ...vertex,
           disclaimers:[DISCLAIMERS.linefit, DISCLAIMERS.noValidation, DISCLAIMERS.speed] };
}
function lineFitCentroidOnly(hits){
  const out={centroid:null, centroidValid:false}; const N=hits.length;
  if(N>=1 && hits.every(h=>[h.x,h.y,h.z,h.q].every(Number.isFinite))){
    let qs=0; const c=[0,0,0]; for(const h of hits){c[0]+=h.x*h.q;c[1]+=h.y*h.q;c[2]+=h.z*h.q;qs+=h.q;}
    if(qs>0){ out.centroid=c.map(v=>v/qs); out.centroidValid = N>=4 && new Set(hits.map(h=>h.str)).size>=2; }
  }
  return out;
}
// SIMULATION QA ONLY — uses the truth; never feeds back into reconstruction or labels.
export function qaAngularError(dir, truth){
  if(!dir) return null; const d=dir[0]*truth[0]+dir[1]*truth[1]+dir[2]*truth[2];
  return Math.acos(Math.max(-1,Math.min(1,d)))*180/Math.PI;
}
export function simulationQA(reco, input){
  const ang = reco.fitDirection ? qaAngularError(reco.fitDirection, input.direction) : null;
  const vErr = (reco.vertexEstimate && input.type!=='through') ? Math.hypot(reco.vertexEstimate[0]-input.vertex[0], reco.vertexEstimate[1]-input.vertex[1], reco.vertexEstimate[2]-input.vertex[2]) : null;
  return { label:'SIMULATION QA ONLY', trueDirection:input.direction.slice(), angularError_deg:ang, hemisphereFlip: ang===null ? null : ang>90, vertexError_m:vErr };
}
export const _internal = { makeRandom, GAMMA_1P7, cumInv, LAYERS, BOUNDS };
