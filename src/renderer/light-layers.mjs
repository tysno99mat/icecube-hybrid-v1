import * as THREE from 'three';
import {geometry,visualContext} from '../adapter/index.mjs';
import {arrivalWindow,arrivalFraction,peDiameter,chargedMarker,shellRadius,sourceSelection,clamp} from './visual-mapping.mjs';
const vec=a=>new THREE.Vector3(...a);
const line=(a,b,material)=>{const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),material);l.computeLineDistances();return l;};

export function makeHitField(session,dpr){
 const window=arrivalWindow(session.result.hits),position=[],time=[],size=[],noise=[],fraction=[];
 for(const h of session.result.hits){const d=geometry.doms[h.dom];position.push(d.x,d.y,d.z);time.push(h.t);size.push(peDiameter(h.n));noise.push(h.noise?1:0);fraction.push(arrivalFraction(h.t,window));}
 const g=new THREE.BufferGeometry();
 for(const [name,data,n] of [['position',position,3],['hitTime',time,1],['pointSize',size,1],['isNoise',noise,1],['timeFraction',fraction,1]])g.setAttribute(name,new THREE.Float32BufferAttribute(data,n));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  uniforms:{uTime:{value:session.summary.tMin},uNoise:{value:1},uDPR:{value:dpr}},
  vertexShader:`attribute float hitTime;attribute float pointSize;attribute float isNoise;attribute float timeFraction;
   uniform float uTime;uniform float uNoise;uniform float uDPR;varying float vAlpha;varying float vNoise;varying float vTime;varying float vPulse;
   void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;
    float age=uTime-hitTime;vPulse=step(0.0,age)*max(0.0,1.0-age/180.0);
    gl_PointSize=clamp(pointSize*(1.0+.35*vPulse)*900.0/max(60.0,-mv.z),4.0,48.0)*uDPR;
    vAlpha=step(hitTime,uTime)*(1.0-isNoise+isNoise*uNoise);vNoise=isNoise;vTime=timeFraction;}`,
  fragmentShader:`varying float vAlpha;varying float vNoise;varying float vTime;varying float vPulse;
   void main(){float r=length(gl_PointCoord-.5)*2.0;if(r>1.0)discard;
    vec3 early=vec3(.38,.57,1.0),middle=vec3(.58,.34,1.0),late=vec3(.9,.38,.70);
    vec3 signal=vTime<.5?mix(early,middle,vTime*2.0):mix(middle,late,(vTime-.5)*2.0);
    vec3 color=mix(signal,vec3(.6,.67,.75),vNoise);
    float core=exp(-r*r*9.0),halo=exp(-r*r*2.8)*(.22+.20*vPulse);
    gl_FragColor=vec4(mix(color,vec3(.9,.94,1.0),core*.45),min(.95,core+halo)*vAlpha);}`});
 const p=new THREE.Points(g,m);p.frustumCulled=false;return p;
}

function glowTexture(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d');
 const g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(225,238,255,1)');g.addColorStop(.16,'rgba(111,157,255,.8)');g.addColorStop(.52,'rgba(54,114,255,.2)');g.addColorStop(1,'rgba(54,114,255,0)');
 c.fillStyle=g;c.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function greatCircles(){const p=[];for(let plane=0;plane<3;plane++)for(let i=0;i<64;i++){for(const a of[i/64*2*Math.PI,(i+1)/64*2*Math.PI]){const c=Math.cos(a),s=Math.sin(a);p.push(...(plane===0?[c,s,0]:plane===1?[c,0,s]:[0,c,s]));}}return new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(p,3));}

export class EventLightLayers{
 constructor(session){
  this.session=session;this.group=new THREE.Group();this.tracks=[];this.sources=[];this.activeShells=0;this.activeCones=0;
  const e=session.result.event,dir=vec(e.dir),texture=glowTexture();this.texture=texture;
  // Cascade has no displayed incoming axis, even though the simulation input records a truth direction.
  if(session.summary.type!=='cascade'){
   const end=vec(e.nuEnd),start=end.clone().addScaledVector(dir,-1100);
   this.ghost=line(start,end,new THREE.LineDashedMaterial({color:0xa995c6,dashSize:32,gapSize:27,transparent:true,opacity:.24,depthWrite:false}));this.group.add(this.ghost);
  }
  const coneGeo=new THREE.ConeGeometry(1,1,32,1,true);coneGeo.translate(0,-.5,0);
  for(const tr of e.tracks){
   const head=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,opacity:.65,blending:THREE.AdditiveBlending,depthWrite:false}));head.scale.setScalar(44);
   // Unchanged geometry; luminous falloff is schematic, not photon density.
   const cone=new THREE.Mesh(coneGeo,new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{uStrength:{value:1}},vertexShader:`varying float vAxial;varying float vEdge;varying float vDepth;
     void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vec3 n=normalize(normalMatrix*normal);
      vAxial=clamp(1.0+position.y,0.0,1.0);vEdge=pow(1.0-abs(dot(n,normalize(-mv.xyz))),3.0);vDepth=-mv.z;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float uStrength;varying float vAxial;varying float vEdge;varying float vDepth;
     void main(){float front=exp(-pow(vAxial/.065,2.0));float taper=(1.0-smoothstep(.45,1.0,vAxial));
      float alpha=(.012*taper+.11*vEdge*taper+.30*front)*exp(-max(0.0,vDepth)/5000.0)*uStrength;
      vec3 color=mix(vec3(.28,.49,1.0),vec3(.55,.72,1.0),front);gl_FragColor=vec4(color,alpha);}` }));
   cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
   const trail=line(vec(tr.p0),vec(tr.p0),new THREE.LineBasicMaterial({color:0xd5e5ff,transparent:true,opacity:.42,depthWrite:false}));
   this.group.add(head,cone,trail);this.tracks.push({tr,head,cone,trail});
  }
  const sphere=new THREE.SphereGeometry(1,24,12),circles=greatCircles();
  for(const source of sourceSelection(e.points,6)){
   const shell=new THREE.Mesh(sphere,new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.FrontSide,blending:THREE.AdditiveBlending,
    uniforms:{uOpacity:{value:0}},vertexShader:`varying float edge;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vec3 n=normalize(normalMatrix*normal);edge=pow(1.0-abs(dot(n,normalize(-mv.xyz))),3.5);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float uOpacity;varying float edge;void main(){gl_FragColor=vec4(.34,.54,1.0,uOpacity*(.015+.985*edge));}`}));
   const rings=new THREE.LineSegments(circles,new THREE.LineBasicMaterial({color:0x668bfa,transparent:true,opacity:0,depthWrite:false}));
   const flash=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
   shell.position.copy(vec(source.pos));rings.position.copy(shell.position);flash.position.copy(shell.position);
   this.group.add(shell,rings,flash);this.sources.push({source,shell,rings,flash});
  }
 }
 update(time,{light=true,ghost=true,mobile=false,stage=null,effectTier=1}={}){
  this.activeShells=0;this.activeCones=0;
  if(this.ghost)this.ghost.visible=ghost&&(stage===null||stage<=1||stage===4);
  const e=this.session.result.event;
  for(const v of this.tracks){
   const m=chargedMarker(v.tr,e.dir,time,visualContext.C),pos=vec(m.position),visible=stage!==0&&time>=0;
   v.head.position.copy(pos);v.head.visible=visible&&m.moving;
   const p=v.trail.geometry.attributes.position,start=pos.clone().addScaledVector(vec(e.dir),-Math.min(180,m.distance));p.setXYZ(0,start.x,start.y,start.z);p.setXYZ(1,pos.x,pos.y,pos.z);p.needsUpdate=true;
   v.trail.visible=visible&&light&&stage!==4;
   const back=Math.min(260,m.distance),radius=back*Math.sqrt(1-visualContext.COS_TC**2)/visualContext.COS_TC;
   v.cone.position.copy(pos);v.cone.scale.set(radius,back,radius);
   v.cone.visible=visible&&light&&m.moving&&back>4&&pos.y<0&&pos.y>-visualContext.BEDROCK;
   v.cone.material.uniforms.uStrength.value=stage===3?.65:1;if(v.cone.visible)this.activeCones++;
  }
  const limit=effectTier<1?2:mobile?3:6;
  this.sources.forEach((v,i)=>{
   const age=time-v.source.t,radius=shellRadius(time,v.source.t,visualContext.V_LIGHT);
   const isOrigin=v.source.origin!=='stochastic',strength=clamp(Math.log1p(v.source.E)/5,.2,1);
   const show=light&&stage!==0&&age>=0;
   v.shell.visible=show&&i<limit&&radius>1&&radius<900;
   v.rings.visible=v.shell.visible&&this.session.summary.type!=='cascade';
   const opacity=.32*strength*Math.exp(-radius/700);
   v.shell.scale.setScalar(radius);v.rings.scale.setScalar(radius);v.shell.material.uniforms.uOpacity.value=opacity;v.rings.material.opacity=opacity*.25;
   v.flash.visible=show&&(isOrigin||age<600);
   // An origin cue remains after the flash; it is a view aid, not sustained emission.
   v.flash.material.opacity=strength*(isOrigin?.14:.03)+Math.max(0,1-age/500)*.75;
   v.flash.scale.setScalar(32+Math.min(76,Math.log1p(v.source.E)*15));
   if(v.shell.visible)this.activeShells++;
  });
 }
 dispose(){this.texture.dispose();}
}

export class DepthContext{
 constructor(scene,host,surfaceGroup){
  this.group=new THREE.Group();scene.add(this.group);this.labels=document.createElement('div');this.labels.className='depth-context-labels';this.labels.setAttribute('aria-hidden','true');host.append(this.labels);
  const dust=new THREE.Mesh(new THREE.BoxGeometry(1370,100,1330),new THREE.MeshBasicMaterial({color:0xa8896c,transparent:true,opacity:.038,depthWrite:false,side:THREE.BackSide}));dust.position.y=-2050;this.group.add(dust);
  const outline=new THREE.LineSegments(new THREE.EdgesGeometry(dust.geometry),new THREE.LineBasicMaterial({color:0xae8966,transparent:true,opacity:.20}));outline.position.copy(dust.position);this.group.add(outline);
  const rock=new THREE.Mesh(new THREE.PlaneGeometry(1370,1330),new THREE.MeshBasicMaterial({color:0x59473e,transparent:true,opacity:.17,side:THREE.DoubleSide,depthWrite:false}));rock.rotation.x=-Math.PI/2;rock.position.y=-visualContext.BEDROCK;this.group.add(rock);
  const p=[710,-1450,610,710,-2450,610];for(const d of[1450,2000,2100,2450])p.push(685,-d,610,735,-d,610);
  this.group.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(p,3)),new THREE.LineBasicMaterial({color:0x92afc0,transparent:true,opacity:.38})));
  const entries=[['1450 m · array top',1450],['2000–2100 m · Dust',2050],['2450 m · array bottom',2450],['2820 m · bedrock context',visualContext.BEDROCK]];
  this.items=entries.map(([text,depth])=>{const el=document.createElement('span');el.textContent=text;this.labels.append(el);return {el,point:new THREE.Vector3(710,-depth,610)};});
  const scale=document.createElement('span');scale.textContent='1 km vertical extent';this.labels.append(scale);this.items.push({el:scale,point:new THREE.Vector3(710,-1780,610)});
  const deep=document.createElement('span');deep.textContent='DeepCore · dense lower region';this.labels.append(deep);this.items.push({el:deep,point:new THREE.Vector3(0,-2320,0)});
  this.surfaceCue=new THREE.InstancedMesh(new THREE.CylinderGeometry(8,8,6,8),new THREE.MeshBasicMaterial({color:0x86a7c6,transparent:true,opacity:.62}),52);
  const sites=geometry.strings.filter(s=>!s.deep).filter((_,i)=>i%3===0).slice(0,26),m=new THREE.Matrix4();let j=0;
  for(const s of sites)for(const o of[-10,10])this.surfaceCue.setMatrixAt(j++,m.makeTranslation(s.x+o,3,s.z+18));this.surfaceCue.count=j;surfaceGroup.add(this.surfaceCue);
 }
 setHost(host){host.append(this.labels);}
 update(camera,host,{visible=true,hero=false,mode='Detector',deepcore=true}={}){
  this.group.visible=visible;this.surfaceCue.visible=visible;
  const show=visible&&!hero&&['Antarctica','Detector'].includes(mode);this.labels.hidden=!show;if(!show)return;
  const w=host.clientWidth,h=host.clientHeight,used=[];
  for(const {el,point} of this.items){const p=point.clone().project(camera),x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h;
   const isDeep=el.textContent.startsWith('DeepCore');const ok=p.z>0&&p.z<1&&x>15&&x<w-160&&y>150&&y<h-150&&(!isDeep||deepcore)&&!used.some(a=>Math.abs(a-y)<25);
   el.hidden=!ok;if(ok){el.style.transform=`translate(${x}px,${y}px)`;used.push(y);}
  }
 }
 dispose(){this.labels.remove();}
}
