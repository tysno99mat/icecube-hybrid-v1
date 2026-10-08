// Deterministic display transforms. These never predict, replace or change a modeled hit.
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const peDiameter=n=>10+Math.min(24,6*Math.log1p(Math.max(0,n)));
export const arrivalWindow=(hits)=>{
 const signal=hits.filter(h=>!h.noise).map(h=>h.t);
 return {first:signal.length?Math.min(...signal):0,last:signal.length?Math.max(...signal):0};
};
export const arrivalFraction=(t,window)=>clamp((t-window.first)/Math.max(1,window.last-window.first),0,1);
export const arrivalPulse=(time,hitTime)=>time<hitTime?0:Math.max(0,1-(time-hitTime)/180);
export function chargedMarker(track,direction,time,c){
 const s=clamp(track.s0+Math.max(0,time)*c,track.s0,track.s1);
 return {position:track.p0.map((x,i)=>x+direction[i]*s),distance:s-track.s0,
  moving:time>=0&&track.s0+time*c<=track.s1};
}
export const shellRadius=(time,sourceTime,lightSpeed)=>Math.max(0,time-sourceTime)*lightSpeed;
export function sourceSelection(points,limit=6){
 // Main interaction stays visible; remaining slots use strongest returned deposits.
 return [...points].sort((a,b)=>(a.origin==='stochastic')-(b.origin==='stochastic')||b.E-a.E||a.t-b.t).slice(0,limit);
}
