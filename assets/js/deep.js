/* The Deep (the Massive Rework, 2026-10-15) · one living dark beneath
   every chamber, drawn by hand in raw WebGL: no library, no request
   beyond this file, nothing between the visitor and the platform.

   What it is: a single fragment shader holding nine strata, one per
   chamber, each a field with its own physics · fog and a door of light
   (Threshold), a descended depth of stars (Scale), dark soil and rising
   spores (Garden), true deep space (Constellation), lamplight and
   ember dust (Letters), water under the real moon (Tide), velvet and a
   breathing grid (Cabinet), the field folded on itself (Mirror), and
   darkness with a horizon that answers the ring (the Ninth Door).
   Moving between chambers is a dive: the old stratum dissolves through
   the dark and the new one blooms out of it.

   What feeds it is the Reckoning, and nothing else that carries
   meaning: the Dayseed (a daily tint in the Constellation), the moon's
   illumination by the Synodic Reckoning (the Tide's glitter path), the
   phase of the day (the Threshold's fog), the count of doors opened
   (the Ninth's horizon), the visitor's own scroll (the Scale's
   descent), and (the next pass, 2026-10-15) the visit count itself:
   the strata deepen as the recorded count climbs toward the
   twenty-seventh visit · a fifth octave of grain in the fields, the
   motes standing thicker · a function of that recorded input alone,
   and nothing at all on a first visit, so a scholar holding D and V
   can re-derive any depth the field has ever shown. The noise in the
   fields is physics, not content · it would mean nothing if it
   differed, which the canon permits.

   The door of light is anchored to the doorframe as rendered, not
   to a fixed point of the screen: the driver measures the frame's
   own rectangle and stands the light on its horizon line, so the
   light stays inside the arch wherever the room's furniture puts
   the frame. (The Threshold's recomposition of 2026-10-15 moved the
   frame to the room's centre; the light followed it, as it must.
   Until a frame can be measured, the light keeps its first station.)

   The fallback chain, each stage whole (CANON §X's test):
     1. WebGL, as below.
     2. The strata as designed CSS grounds · the chamber sections
        carry them in the stylesheet; where the Deep lives they are
        simply not needed, and where it cannot live they remain.
     3. No script at all: the place as wave 1 left it.
   In calm mode (prefers-reduced-motion, or the ?still study mode) the
   Deep renders one settled frame per chamber and holds it, exactly as
   the Nebula does. On a machine that cannot keep up it first lowers
   its own resolution, then slows to a slow drift · the place calms;
   it never tears. */
(function(){
"use strict";
var STILL=/[?&]still\b/.test(location.search);
var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches || STILL;
var CHAMBERS=["threshold","scale","garden","stars","letters","tide","cabinet","mirror","ninth"];
function daySeed(){ var d=new Date(); return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate(); }
function moonIllum(date){
  var synodic=29.530588853, known=Date.UTC(2000,0,6,18,14)/86400000;
  var age=((date.getTime()/86400000-known)%synodic+synodic)%synodic;
  return (1-Math.cos(2*Math.PI*age/synodic))/2;
}

/* ---------- the monumental words: kinetic type, architecture not labels.
   Each chamber's name already exists (the ring's nameplates speak it);
   here it stands once inside its chamber, set like a lintel stone.
   The letters settle one by one when the chamber is entered · the
   chamber's own display change restarts the fall, so no state is kept.
   Pure decoration: aria-hidden, and the word is whole without script. */
document.querySelectorAll(".chamber-word").forEach(function(el){
  var word=el.textContent, out="";
  for(var i=0;i<word.length;i++){ out+='<span class="wl" style="--i:'+i+'">'+word[i]+"</span>"; }
  el.innerHTML=out;
});

/* ---------- the Deep ---------- */
var cv=document.getElementById("deep");
if(!cv) return;
var gl=null;
try{ gl=cv.getContext("webgl",{antialias:false,depth:false,stencil:false,alpha:false,powerPreference:"low-power"}); }catch(e){}
if(!gl){ cv.remove(); return; }

var VERT="attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }";
var FRAG=[
"precision highp float;",
"uniform vec2 uRes;",
"uniform float uTime;",
"uniform float uMode;",
"uniform float uModeFrom;",
"uniform float uMix;",
"uniform vec3 uPointer;",
"uniform float uMoon;",
"uniform float uPhase;",
"uniform float uProgress;",
"uniform float uOpen;",
"uniform float uScroll;",
"uniform float uSeed;",
"uniform float uDeep;",
"uniform vec2 uDoor;",
"float hash21(vec2 p){ p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }",
"float vnoise(vec2 p){",
"  vec2 i = floor(p), f = fract(p);",
"  f = f * f * (3.0 - 2.0 * f);",
"  float a = hash21(i), b = hash21(i + vec2(1.0, 0.0)), c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));",
"  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);",
"}",
"float fbm(vec2 p){",
"  float v = 0.0, a = 0.5;",
"  for(int i = 0; i < 4; i++){ v += a * vnoise(p); p = p * 2.03 + vec2(17.3, 9.1); a *= 0.45; }",
"  v += uDeep * a * 2.0 * vnoise(p * 2.03 + vec2(17.3, 9.1));",
"  return v;",
"}",
"float starLayer(vec2 p, float scale, float t, float thresh){",
"  vec2 g = p * scale;",
"  vec2 id = floor(g);",
"  vec2 f = fract(g) - 0.5;",
"  float h = hash21(id);",
"  vec2 off = (vec2(hash21(id + 7.1), hash21(id + 13.7)) - 0.5) * 0.72;",
"  float d = length(f - off);",
"  float star = smoothstep(0.10, 0.0, d) * step(thresh, h);",
"  float tw = 0.55 + 0.45 * sin(t * 1.4 + h * 40.0);",
"  return star * tw;",
"}",
"float motes(vec2 p, float t, float density, float thresh){",
"  vec2 g = p * density;",
"  vec2 id = floor(g);",
"  float h = hash21(id);",
"  vec2 f = fract(g);",
"  float rise = fract(h * 7.0 + t * (0.006 + h * 0.014));",
"  vec2 c = vec2(0.5 + 0.30 * sin(h * 40.0 + t * 0.25), rise);",
"  float d = length((f - c) * vec2(1.0, 1.35));",
"  float tw = 0.5 + 0.5 * sin(t * (0.8 + h) + h * 30.0);",
"  return smoothstep(0.075, 0.0, d) * step(thresh - uDeep * 0.10, h) * (0.35 + 0.65 * tw);",
"}",
"vec3 field(float mode, vec2 p, vec2 uv, float t){",
"  vec3 ink    = vec3(0.016, 0.023, 0.016);",
"  vec3 forest = vec3(0.055, 0.086, 0.062);",
"  vec3 moss   = vec3(0.32, 0.38, 0.27);",
"  vec3 brass  = vec3(0.788, 0.659, 0.416);",
"  vec3 parch  = vec3(0.91, 0.878, 0.808);",
"  vec3 moonl  = vec3(0.663, 0.706, 0.694);",
"  vec3 col = ink;",
"  if(mode < 0.5){",
"    float fog = fbm(p * 1.6 + vec2(t * 0.016, t * 0.006));",
"    float fog2 = fbm(p * 3.4 - vec2(t * 0.010, 0.0));",
"    vec3 tint = forest;",
"    if(uPhase < 0.5) tint = mix(forest, vec3(0.23, 0.13, 0.11), 0.55);",
"    else if(uPhase < 1.5) tint = mix(forest, vec3(0.16, 0.20, 0.16), 0.6);",
"    else if(uPhase < 2.5) tint = mix(forest, vec3(0.22, 0.11, 0.07), 0.55);",
"    col = ink + tint * (fog * 1.05 + fog2 * 0.45) + tint * 0.10;",
"    float slit = exp(-pow(abs(uv.x - uDoor.x) * 9.0, 1.6));",
"    float horizon = exp(-abs(uv.y - uDoor.y) * 7.0);",
"    float door = slit * (0.35 + 0.65 * horizon) * (0.75 + 0.25 * sin(t * 0.4));",
"    col += mix(moonl, brass, 0.35) * door * 0.85;",
"    float pl = exp(-length((uv - uPointer.xy) * vec2(1.4, 1.0)) * 5.5) * uPointer.z;",
"    col += brass * pl * 0.16;",
"    col += brass * motes(uv * vec2(1.6, 1.0), t, 7.0, 0.86) * 0.35;",
"  } else if(mode < 1.5){",
"    vec2 c = vec2(-0.38, -0.16);",
"    float d = length(p - c);",
"    float depth = log(max(d, 0.001)) + uScroll * 5.2;",
"    float rings = 0.5 + 0.5 * sin(depth * 9.0);",
"    col = ink + forest * (0.30 + 0.25 * fbm(p * 1.3 + uScroll));",
"    col += moonl * rings * (0.10 * exp(-d * 1.1) + 0.02);",
"    float zoom = 26.0 + uScroll * 60.0;",
"    col += parch * starLayer(p + c, zoom, t, 0.925) * 0.85;",
"    col += parch * starLayer(p * 1.7 - c, 15.0, t * 0.7, 0.95) * 0.35;",
"    col += brass * exp(-d * 4.5) * 0.10;",
"  } else if(mode < 2.5){",
"    float canopy = fbm(p * 2.2 + vec2(0.0, t * 0.008));",
"    col = ink + forest * (0.75 + 0.65 * canopy) * smoothstep(-0.2, 0.85, p.y) + moonl * 0.05 * smoothstep(0.2, 1.0, p.y) + vec3(0.05, 0.035, 0.015) * smoothstep(0.1, -0.6, p.y);",
"    col += vec3(0.10, 0.16, 0.07) * fbm(p * 5.0 - t * 0.01) * 0.35;",
"    float warm = exp(-length((uv - uPointer.xy) * vec2(1.3, 1.0)) * 4.2) * uPointer.z;",
"    col += brass * warm * 0.13 + moss * warm * 0.10;",
"    col += mix(moss, parch, 0.4) * motes(uv * vec2(1.5, 1.0), t, 9.0, 0.80) * 0.5;",
"    col += brass * motes(uv * vec2(1.5, 1.0), t + 40.0, 5.0, 0.90) * 0.30;",
"  } else if(mode < 3.5){",
"    vec2 drift = (uPointer.xy - 0.5) * 0.03 * uPointer.z;",
"    float n1 = fbm(p * 1.8 + drift + vec2(uSeed * 9.0, 0.0));",
"    float n2 = fbm(p * 3.9 - drift * 2.0 + 4.7);",
"    vec3 neb = mix(vec3(0.05, 0.06, 0.16), vec3(0.16, 0.10, 0.26), n1);",
"    neb = mix(neb, vec3(0.10, 0.14, 0.24), n2 * 0.55);",
"    neb = mix(neb, brass * 0.85, smoothstep(0.55, 0.92, n1 * n2 * 1.7) * 0.55);",
"    col = ink * 0.6 + neb * (0.30 + 1.05 * pow(n1, 1.4));",
"    col += parch * starLayer(p + drift * 3.0, 34.0, t, 0.90) * 0.8;",
"    col += parch * starLayer(p + drift * 6.0, 60.0, t * 1.3, 0.94) * 0.65;",
"    col += moonl * starLayer(p - drift * 4.0, 17.0, t * 0.6, 0.96) * 0.4;",
"  } else if(mode < 4.5){",
"    col = vec3(0.030, 0.024, 0.018) + vec3(0.05, 0.038, 0.02) * fbm(p * 2.0);",
"    float lamp = exp(-length((uv - vec2(0.20, 0.82)) * vec2(1.25, 1.0)) * 3.4);",
"    col += vec3(0.85, 0.62, 0.32) * lamp * 0.16;",
"    col += vec3(0.95, 0.66, 0.30) * motes(uv * vec2(1.5, 1.0), t, 8.0, 0.84) * 0.55;",
"    col += brass * motes(uv * vec2(1.5, 1.0), t + 90.0, 4.0, 0.92) * 0.3;",
"  } else if(mode < 5.5){",
"    float ca = fbm(vec2(p.x * 3.0 + t * 0.05, p.y * 6.0 - t * 0.023));",
"    float cb = fbm(vec2(p.x * 5.5 - t * 0.037, p.y * 9.0 + t * 0.017) + 3.1);",
"    float caustic = pow(1.0 - abs(ca - cb), 6.0);",
"    vec3 deep = mix(vec3(0.012, 0.045, 0.075), vec3(0.02, 0.09, 0.10), uv.y);",
"    col = deep + vec3(0.10, 0.22, 0.24) * ca * 0.5;",
"    float path = exp(-abs(uv.x - 0.635) * 6.5) * smoothstep(0.1, 0.75, uv.y);",
"    float sparkle = 0.5 + 0.5 * vnoise(vec2(uv.x * 90.0, uv.y * 140.0 - t * 0.7));",
"    col += moonl * path * (0.05 + 0.30 * uMoon) * (0.35 + 0.65 * sparkle);",
"    col += vec3(0.25, 0.45, 0.48) * caustic * (0.10 + 0.30 * uv.y) * (0.4 + 0.6 * uMoon);",
"  } else if(mode < 6.5){",
"    col = vec3(0.020, 0.017, 0.013) + vec3(0.03, 0.026, 0.016) * fbm(p * 1.7 - t * 0.004);",
"    vec2 gp = abs(fract(uv * vec2(9.0, 9.0)) - 0.5);",
"    float grid = smoothstep(0.485, 0.5, max(gp.x, gp.y));",
"    float shimmer = 0.5 + 0.5 * fbm(uv * 3.0 + t * 0.02);",
"    col += brass * grid * 0.05 * shimmer;",
"    float vig = smoothstep(1.05, 0.35, length(p));",
"    col *= 0.55 + 0.45 * vig;",
"    float pl = exp(-length((uv - uPointer.xy) * vec2(1.3, 1.0)) * 4.5) * uPointer.z;",
"    col += brass * pl * 0.10;",
"  } else if(mode < 7.5){",
"    vec2 fp = p;",
"    fp.x = abs(fp.x - (uPointer.x - 0.5) * 0.22 * uPointer.z);",
"    float m1 = fbm(fp * 2.1 + vec2(t * 0.007, 0.0));",
"    float m2 = fbm(fp * 4.3 - vec2(0.0, t * 0.005) + 2.3);",
"    col = ink + mix(forest, vec3(0.09, 0.11, 0.16), 0.6) * (m1 * 0.6 + m2 * 0.25);",
"    col += moonl * pow(m1 * m2 * 1.9, 2.0) * 0.5;",
"    col += moonl * starLayer(fp, 26.0, t * 0.5, 0.955) * 0.30;",
"    float seam = exp(-abs(p.x - (uPointer.x - 0.5) * 0.22 * uPointer.z) * 30.0);",
"    col += moonl * seam * 0.05;",
"  } else {",
"    col = ink * 0.7 + forest * 0.10 * fbm(p * 1.5);",
"    float hor = 0.10 + uProgress * 0.05;",
"    float glow = exp(-max(uv.y - hor, 0.0) * (5.0 - uProgress * 2.0));",
"    vec3 hcol = mix(moonl, brass, 0.45);",
"    col += hcol * glow * (0.05 + uProgress * 0.20) * (0.8 + 0.2 * sin(t * 0.3));",
"    vec3 rise = mix(vec3(0.30, 0.13, 0.07), vec3(0.95, 0.62, 0.30), smoothstep(0.0, 0.75, uv.y));",
"    col = mix(col, rise * (0.35 + 0.65 * (1.0 - uv.y)), uOpen * smoothstep(0.55, 0.0, uv.y));",
"    col += brass * motes(uv * vec2(1.6, 1.0), t, 6.0, 0.88) * (0.15 + uProgress * 0.25);",
"  }",
"  return col;",
"}",
"void main(){",
"  vec2 uv = gl_FragCoord.xy / uRes;",
"  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;",
"  float t = uTime;",
"  vec3 col = field(uMode, p, uv, t);",
"  if(uMix < 0.999){",
"    vec3 from = field(uModeFrom, p, uv, t);",
"    float d = fbm(uv * 5.0 + uSeed * 20.0);",
"    float m = smoothstep(0.0, 1.0, clamp((uMix - d * 0.35) / 0.65, 0.0, 1.0));",
"    col = mix(from, col, m);",
"  }",
"  float vig = smoothstep(1.25, 0.45, length(p * vec2(0.85, 1.0)));",
"  col *= 0.72 + 0.28 * vig;",
"  gl_FragColor = vec4(col, 1.0);",
"}"
].join("\n");

function compile(type, src){
  var s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s);
  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ return null; }
  return s;
}
var vs=compile(gl.VERTEX_SHADER, VERT), fs=compile(gl.FRAGMENT_SHADER, FRAG);
if(!vs || !fs){ cv.remove(); return; }
var prog=gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){ cv.remove(); return; }
gl.useProgram(prog);
var buf=gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
var loc=gl.getAttribLocation(prog, "aPos");
gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
var U={};
["uRes","uTime","uMode","uModeFrom","uMix","uPointer","uMoon","uPhase","uProgress","uOpen","uScroll","uSeed","uDeep","uDoor"].forEach(function(n){ U[n]=gl.getUniformLocation(prog, n); });

document.documentElement.classList.add("deep-on");

/* ---------- state, all of it read from the place itself ---------- */
function activeChamber(){
  var s=document.querySelector(".chamber.active");
  return s ? s.getAttribute("data-chamber") : "threshold";
}
function phaseNum(){
  var p=document.body.getAttribute("data-phase");
  return p==="dawn"?0 : p==="day"?1 : p==="dusk"?2 : 3;
}
function progress(){
  try{
    var v=JSON.parse(localStorage.getItem("ninth.visited")||"[]");
    var n=0; CHAMBERS.slice(0,8).forEach(function(c){ if(v.indexOf(c)>-1) n++; });
    return n/8;
  }catch(e){ return 0; }
}
function doorOpen(){
  var o=document.getElementById("door-open");
  return o && !o.hidden ? 1 : 0;
}
/* the door of light's station: the Rose's own rectangle, measured
   where it stands (its centre across, its seed at its heart down
   the window). The Phase 1 doorframe carried this measure until
   wave 11; the Rose carries it now (CANON §III). Until the window
   can be measured, the light keeps its first station. */
var door={x:0.685, y:0.155};
function measureDoor(){
  var f=document.querySelector(".rose-wrap .ring-map");
  if(!f) return;
  var r=f.getBoundingClientRect();
  if(!r || !r.width || !r.height) return;
  door.x=(r.left+r.width*0.5)/innerWidth;
  door.y=1-(r.top+r.height*0.5)/innerHeight;
}
/* the visit depth: the recorded visit count, read as the room keeps it.
   Nothing at the first visit; full depth at the twenty-seventh. */
function visitDepth(){
  try{
    var v=JSON.parse(localStorage.getItem("ninth.visits")||"1");
    var d=(v-1)/26;
    return d<0 ? 0 : (d>1 ? 1 : d);
  }catch(e){ return 0; }
}
var mode=CHAMBERS.indexOf(activeChamber()); if(mode<0) mode=0;
var modeFrom=mode, mix=1, mixStart=0;
var ptr={x:0.5, y:0.45, s:0};
var scrollP=0;
function readScroll(){
  var h=document.documentElement;
  var max=h.scrollHeight - innerHeight;
  scrollP = max>0 ? Math.min(1, Math.max(0, (window.scrollY||0)/max)) : 0;
}
readScroll();

var govStep=1;                 /* the governor's resolution step, 1 → 0.45 */
function resize(){
  var dpr=Math.min(window.devicePixelRatio||1, 1.25);
  var base=dpr * (innerWidth<760 ? 0.75 : 0.8) * govStep;
  var w=innerWidth*base, h=innerHeight*base;
  var px=w*h, cap=1050000;
  if(px>cap){ var k=Math.sqrt(cap/px); w*=k; h*=k; }
  cv.width=Math.max(2, Math.round(w)); cv.height=Math.max(2, Math.round(h));
  gl.viewport(0,0,cv.width,cv.height);
}
resize();

var startT=performance.now();
function draw(now){
  var t = REDUCED ? 26 : (now-startT)/1000;
  gl.uniform2f(U.uRes, cv.width, cv.height);
  gl.uniform1f(U.uTime, t);
  gl.uniform1f(U.uMode, mode);
  gl.uniform1f(U.uModeFrom, modeFrom);
  gl.uniform1f(U.uMix, mix);
  gl.uniform3f(U.uPointer, ptr.x, ptr.y, ptr.s);
  gl.uniform1f(U.uMoon, moonIllum(new Date()));
  gl.uniform1f(U.uPhase, phaseNum());
  gl.uniform1f(U.uProgress, progress());
  gl.uniform1f(U.uOpen, doorOpen());
  gl.uniform1f(U.uScroll, scrollP);
  gl.uniform1f(U.uSeed, (daySeed()%1000)/1000);
  if(mode===0 || modeFrom===0) measureDoor();
  gl.uniform2f(U.uDoor, door.x, door.y);
  gl.uniform1f(U.uDeep, visitDepth());
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function diveTo(next){
  if(next===mode) return;
  modeFrom=mode; mode=next;
  if(REDUCED){ mix=1; draw(performance.now()); }
  else { mix=0; mixStart=performance.now(); }
}

/* the chambers announce themselves by their class, as they always have */
var mo=new MutationObserver(function(){
  var m=CHAMBERS.indexOf(activeChamber());
  if(m>-1) diveTo(m);
});
document.querySelectorAll(".chamber").forEach(function(s){
  mo.observe(s, {attributes:true, attributeFilter:["class"]});
});
var bo=new MutationObserver(function(){ if(REDUCED) draw(performance.now()); });
bo.observe(document.body, {attributes:true, attributeFilter:["data-phase"]});

window.addEventListener("pointermove", function(e){
  ptr.x=e.clientX/innerWidth; ptr.y=1-e.clientY/innerHeight; ptr.s=1;
  if(REDUCED) draw(performance.now());
}, {passive:true});
window.addEventListener("scroll", function(){
  readScroll();
  if(REDUCED && mode===1) draw(performance.now());
}, {passive:true});
window.addEventListener("resize", function(){ resize(); draw(performance.now()); });

if(REDUCED){
  draw(performance.now());
  /* the door's state can change while the visitor stands in the room */
  setInterval(function(){ if(mode===8) draw(performance.now()); }, 1500);
} else {
  var lastDraw=0, frames=0, slowSince=0, fastSince=0;
  var loop=function(now){
    requestAnimationFrame(loop);
    if(document.hidden) return;
    if(mix<1){ mix=Math.min(1, (now-mixStart)/1150); mix=mix*mix*(3-2*mix); }
    if(now-lastDraw < 33 && mix>=1) return;      /* the fields breathe at ~30fps */
    var dt = lastDraw ? now-lastDraw : 33;
    lastDraw=now;
    ptr.s*=0.994;
    draw(now);
    /* the governor: a place that cannot keep up calms itself, in steps */
    frames++;
    if(dt>50){ fastSince=0; if(!slowSince) slowSince=now;
      if(now-slowSince>2500){ slowSince=now;
        if(govStep>0.46){ govStep=Math.max(0.45, govStep*0.7); resize(); }
      }
    } else if(dt<36){ slowSince=0; if(!fastSince) fastSince=now;
      if(now-fastSince>8000 && govStep<1){ fastSince=now; govStep=Math.min(1, govStep/0.7); resize(); }
    } else { slowSince=0; fastSince=0; }
  };
  requestAnimationFrame(loop);
}
})();
