/* The 9th Website — wave 1; the Text Ration, wave 2; the Deepening, wave 3.
   Everything here is enhancement. The place reads whole without it.
   No external requests. Memory lives only in the visitor's browser. */
(function(){
"use strict";
document.documentElement.classList.add("js");
/* ?still — a harness accommodation for screenshots and study: freezes the place mid-breath. */
var STILL=/[?&]still\b/.test(location.search);
if(STILL) document.documentElement.classList.add("still");
/* ?veil — study mode for the first paint (VP-0005): holds the breathing ring on screen. */
var VEIL=/[?&]veil\b/.test(location.search);

var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches || STILL;
var CHAMBERS = ["threshold","scale","garden","stars","letters","tide","cabinet","mirror","ninth"];
var STORE = {
  get:function(k,d){ try{ var v = localStorage.getItem("ninth."+k); return v===null? d : JSON.parse(v); }catch(e){ return d; } },
  set:function(k,v){ try{ localStorage.setItem("ninth."+k, JSON.stringify(v)); }catch(e){} }
};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function daySeed(){ var d=new Date(); return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate(); }
var leavesPromise=null;
function leaves(){ if(!leavesPromise){ leavesPromise=fetch("data/v1/whispers.json").then(function(r){return r.json();}); } return leavesPromise; }
function moonPhase(date){
  var synodic=29.530588853;
  var known=Date.UTC(2000,0,6,18,14)/86400000;
  var days=date.getTime()/86400000-known;
  var age=((days%synodic)+synodic)%synodic;
  return { age:age, illum:(1-Math.cos(2*Math.PI*age/synodic))/2, waxing: age<synodic/2 };
}

/* ---------- memory: visits, ring, path ---------- */
var visits = STORE.get("visits",0)+1; STORE.set("visits",visits);
var visited = STORE.get("visited",[]);
var sessionPath = [];               // chambers entered this visit, in order
var ghosts = STORE.get("ghosts",[]); // previous visits' paths (Mirror)
var mirrorTrail = [];                // the visitor's hand, drawn in the Mirror.
                                     // Declared with the early state, not beside
                                     // initMirror: the Mirror can be the FIRST
                                     // chamber (a deep link), and the boot path
                                     // reaches drawMirror before any later
                                     // declaration could run. (Found wave 3:
                                     // a #mirror arrival threw on this line's
                                     // absence and the room's readout never set.)
function isVisited(c){ return visited.indexOf(c)!==-1; }
function otherEightDone(){ return CHAMBERS.slice(0,8).every(isVisited); }
function glyphsComplete(){ return otherEightDone() && STORE.get("coda",false); }

/* ---------- Threshold: phase, greeting, the midnight minute ---------- */
(function threshold(){
  var h=new Date().getHours();
  var phase = h>=5&&h<8 ? "dawn" : h>=8&&h<17 ? "day" : h>=17&&h<20 ? "dusk" : "night";
  document.body.setAttribute("data-phase",phase);
  var sky=document.getElementById("threshold-sky");
  if(sky && !REDUCED){
    document.getElementById("chamber-threshold").addEventListener("pointermove",function(e){
      var r=sky.getBoundingClientRect();
      sky.style.setProperty("--glow-x", ((e.clientX-r.left)/r.width*100)+"%");
      sky.style.setProperty("--glow-y", ((e.clientY-r.top)/r.height*100)+"%");
    });
  }
  var w=document.getElementById("welcome-line");
  var lines={
    dawn:"The light is just arriving, and so are you.",
    day:"Broad daylight, and the place is still keeping its secrets.",
    dusk:"You came at the hour when everything is briefly gold.",
    night:"You came in the dark. The place respects that."
  };
  if(visits>=9){ w.textContent="Nine times now. The place has stopped pretending it doesn't know you."; }
  else if(visits>=27){ w.textContent="The ring keeps your seat the way a shore keeps the shape of the tide."; }
  else if(visits>=2){ w.textContent="You came back. Places notice that kind of thing."; }
  else { w.textContent=lines[phase]; }
  function midnight(){
    var n=new Date(), on = n.getHours()===0 && n.getMinutes()===0;
    var m=document.getElementById("midnight-line"); if(m) m.hidden=!on;
  }
  midnight(); setInterval(midnight,20000);
  /* the ring map: nine doors, lit as visited; the tenth is not drawn by code */
  var g=document.getElementById("ring-map-doors");
  if(g){
    var s="";
    CHAMBERS.forEach(function(c,i){
      var a=-Math.PI/2 + i*(2*Math.PI/9);
      var x=100+78*Math.cos(a), y=100+78*Math.sin(a);
      s+='<rect class="ring-map-door'+(isVisited(c)?" lit":"")+'" x="'+(x-2.5).toFixed(1)+'" y="'+(y-4).toFixed(1)+'" width="5" height="8" rx="2.5"/>';
    });
    g.innerHTML=s;
  }
})();

/* ---------- the Ring Circuit ---------- */
var current="threshold";
var inited={};
function markVisited(c){
  if(!isVisited(c)){ visited.push(c); STORE.set("visited",visited); }
  document.querySelectorAll(".ring-btn").forEach(function(b){
    if(isVisited(b.getAttribute("data-go"))) b.classList.add("seen");
    b.setAttribute("aria-current", b.getAttribute("data-go")===c ? "true":"false");
  });
  drawDoor();
}
function enter(c){
  if(CHAMBERS.indexOf(c)===-1) c="threshold";
  sessionPath.push(c);
  markVisited(c);
  var show=function(){
    document.querySelectorAll(".chamber").forEach(function(s){ s.classList.toggle("active", s.getAttribute("data-chamber")===c); });
    current=c; window.scrollTo(0,0);
    if(!inited[c]){ inited[c]=true; initChamber(c); }
    if(c==="mirror") drawMirror();
    if(c==="ninth") drawDoor();
  };
  if(document.startViewTransition && !REDUCED){ document.startViewTransition(show); } else { show(); }
  try{ history.replaceState(null,"","#"+c); }catch(e){}
}
document.querySelectorAll("[data-go]").forEach(function(b){
  b.addEventListener("click",function(){ enter(b.getAttribute("data-go")); });
});
function initChamber(c){
  if(c==="garden") initGarden();
  if(c==="stars") initStars();
  if(c==="letters") initLetters();
  if(c==="tide") initTide();
  if(c==="cabinet") initCabinet();
  if(c==="mirror") initMirror();
  if(c==="scale") initScale();
}

/* start: the chamber named in the address, or the Threshold */
(function start(){
  /* The first paint has already spoken (the breathing ring, inline in the head).
     Now that the place itself is standing, lift the veil. (VP-0005) */
  var veil=document.getElementById("veil");
  if(veil){
    if(VEIL){ veil.style.animation="none"; }
    else { veil.style.animation="none"; veil.classList.add("lift"); setTimeout(function(){ veil.remove(); },800); }
  }
  var fromHash=(location.hash||"").slice(1);
  enteredBoot(fromHash);
  function enteredBoot(c){
    if(CHAMBERS.indexOf(c)===-1) c="threshold";
    sessionPath.push(c); markVisited(c);
    document.querySelectorAll(".chamber").forEach(function(s){ s.classList.toggle("active", s.getAttribute("data-chamber")===c); });
    current=c; inited[c]=true; initChamber(c);
    if(c==="ninth") drawDoor();
  }
})();

/* ---------- Scale: reveal fallback + the Coda Below ---------- */
function initScale(){
  var stops=document.querySelectorAll(".stop");
  if(!("animationTimeline" in document.documentElement.style) && "IntersectionObserver" in window){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} }); },{threshold:.15});
    stops.forEach(function(s){ io.observe(s); });
  } else { stops.forEach(function(s){ s.classList.add("in"); }); }
  var coda=document.getElementById("scale-coda");
  if(coda && "IntersectionObserver" in window){
    var co=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ STORE.set("coda",true); co.disconnect(); } }); },{threshold:.4});
    co.observe(coda);
  }
  /* The Winter Notes (Depth 27): the Cartographer's second fragment set,
     findable only from the twenty-seventh visit, kept below the Rosetta.
     One note per visit, drawn by the Reckoning (seed = D×19 + V×11,
     recorded in the canon). The notes live in the data, not the page —
     a first visit never carries them, and the ration is undisturbed. */
  if(coda && visits>=27){
    leaves().then(function(data){
      if(!data.winterNotes || !data.winterNotes.length) return;
      if(document.getElementById("winter-note")) return;
      var r=mulberry32(daySeed()*19+visits*11);
      var note=data.winterNotes[Math.floor(r()*data.winterNotes.length)];
      var p=document.createElement("p");
      p.className="winter-note"; p.id="winter-note";
      p.innerHTML='<svg class="frag-mark"><use href="#g-mark"/></svg>';
      p.appendChild(document.createTextNode("“"+note+"”"));
      coda.appendChild(p);
    }).catch(function(){});
  }
}

/* ---------- The Garden (The Dayseed) ---------- */
function initGarden(){
  var cv=document.getElementById("garden-canvas"); if(!cv) return;
  var ctx=cv.getContext("2d"), W=cv.width, H=cv.height;
  var rng=mulberry32(daySeed());
  var nowG=new Date();
  var isNinth = nowG.getDate()===9;
  var isNinthDay = nowG.getMonth()===8 && nowG.getDate()===9; /* September 9 — the Ninth Day (canon §VI) */
  var flowers=[];
  function makeFlower(x,y,golden,black,big){
    var petals=5+Math.floor(rng()*4);
    flowers.push({x:x,y:y,h:70+rng()*130+(big?70:0),lean:(rng()-.5)*36,petals:petals,
      hue: golden? 46 : black? 0 : 285+rng()*70,
      sat: golden? 85 : black? 0 : 55+rng()*25,
      light: golden? 62 : black? 7 : 62+rng()*16,
      seed:rng()*Math.PI*2, golden:golden, black:black});
  }
  /* the east bed: one golden flower on the 9th of any month;
     on the Ninth Day itself (September 9), nine of them */
  if(isNinthDay){ for(var ng=0; ng<9; ng++) makeFlower(W*(0.60+0.045*ng), H, true,false, ng===4); }
  else if(isNinth) makeFlower(W*0.82, H, true,false,true);
  /* exactly one black bloom, never the largest */
  makeFlower(W*(0.15+rng()*0.2), H, false,true,false);
  /* a white flower arrives only if the visitor has been to the Constellation first */
  var whiteFlower = isVisited("stars");
  /* The Kept Shape (Depth 27): from the twenty-seventh visit, the Garden
     keeps one plant whose form is derived from the visitor's earliest
     recorded path — the Ghost Ledger's first entry, or this visit's path
     when no earlier one survives. No new chance is introduced: the shape
     is a function of the recorded path alone, turned through the wheel
     (canon, the Master Code). Its heart carries the path as seed-dots. */
  var kept=null;
  if(visits>=27){
    var srcPath = (ghosts.length && ghosts[0].length>=2) ? ghosts[0] : sessionPath;
    if(srcPath.length>=2){
      var ks=0; srcPath.forEach(function(c,i){ ks += (CHAMBERS.indexOf(c)+1)*(i+1)*27; });
      var kr=mulberry32(ks);
      kept={ x:W*(0.3+kr()*0.4), h:195+kr()*70, petals:5+Math.floor(kr()*5),
             hue:38+kr()*30, lean:(kr()-.5)*22, seed:kr()*6.283, steps:srcPath.length };
    }
  }
  function drawKept(t){
    var ksway = REDUCED? 0 : Math.sin(t/1700+kept.seed)*3;
    var ktx=kept.x+kept.lean+ksway, kty=H-kept.h;
    ctx.strokeStyle="rgba(110,150,92,.95)"; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(kept.x,H); ctx.quadraticCurveTo(kept.x+kept.lean*.4,H-kept.h*.6,ktx,kty); ctx.stroke();
    ctx.fillStyle="rgba(110,160,92,.85)";
    ctx.beginPath(); ctx.ellipse(kept.x+kept.lean*.3,H-kept.h*.45,11,4.8,-.6,0,7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(kept.x+kept.lean*.5,H-kept.h*.35,10,4.4,.7,0,7); ctx.fill();
    ctx.fillStyle="hsla("+kept.hue+",72%,66%,.95)";
    for(var ki=0; ki<kept.petals; ki++){
      var ka=(ki/kept.petals)*Math.PI*2 + (REDUCED?0:Math.sin(t/2100+kept.seed)*.04);
      ctx.beginPath();
      ctx.ellipse(ktx+Math.cos(ka)*11, kty+Math.sin(ka)*11, 11.5, 6.8, ka, 0, 7);
      ctx.fill();
    }
    ctx.fillStyle="#f4d47c";
    ctx.beginPath(); ctx.arc(ktx,kty,4.4,0,7); ctx.fill();
    ctx.fillStyle="rgba(244,212,124,.85)";
    for(var kd=0; kd<kept.steps; kd++){
      var da=(kd/kept.steps)*Math.PI*2 - Math.PI/2;
      ctx.beginPath(); ctx.arc(ktx+Math.cos(da)*10.5, kty+Math.sin(da)*10.5, 1.6, 0, 7); ctx.fill();
    }
  }
  var startT=null;
  function drawFlower(f,t){
    var sway = REDUCED? 0 : Math.sin(t/1600+f.seed)*3;
    var topX=f.x+f.lean+sway, topY=H-f.h;
    ctx.strokeStyle="rgba(96,140,84,.9)"; ctx.lineWidth=2.4;
    ctx.beginPath(); ctx.moveTo(f.x,H); ctx.quadraticCurveTo(f.x+f.lean*.4,H-f.h*.6,topX,topY); ctx.stroke();
    ctx.fillStyle="rgba(110,160,92,.85)";
    ctx.beginPath(); ctx.ellipse(f.x+f.lean*.3,H-f.h*.45,9,4,-.6,0,7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(f.x+f.lean*.5,H-f.h*.35,8,3.6,.7,0,7); ctx.fill();
    ctx.fillStyle="hsla("+f.hue+","+f.sat+"%,"+f.light+"%,.92)";
    for(var i=0;i<f.petals;i++){
      var a=(i/f.petals)*Math.PI*2 + (REDUCED?0:Math.sin(t/2000+f.seed)*.05);
      ctx.beginPath();
      ctx.ellipse(topX+Math.cos(a)*8, topY+Math.sin(a)*8, 8.5, 5.2, a, 0, 7);
      ctx.fill();
    }
    ctx.fillStyle= f.black? "#c9a86a" : "#f4d47c";
    ctx.beginPath(); ctx.arc(topX,topY,3.6,0,7); ctx.fill();
  }
  function render(t){
    ctx.clearRect(0,0,W,H);
    var gr=ctx.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,"rgba(24,32,26,0)"); gr.addColorStop(1,"rgba(30,44,28,.55)");
    ctx.fillStyle=gr; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="rgba(70,52,30,.9)"; ctx.fillRect(0,H-14,W,14);
    flowers.forEach(function(f){ drawFlower(f,t||0); });
    if(kept) drawKept(t||0);
    if(whiteFlower){
      ctx.fillStyle="rgba(245,242,230,.95)";
      var wx=W*0.6, wy=H-58;
      for(var i=0;i<6;i++){ var a=i/6*Math.PI*2; ctx.beginPath(); ctx.ellipse(wx+Math.cos(a)*7,wy+Math.sin(a)*7,7.5,4.4,a,0,7); ctx.fill(); }
      ctx.fillStyle="#e8c96a"; ctx.beginPath(); ctx.arc(wx,wy,3.2,0,7); ctx.fill();
      ctx.strokeStyle="rgba(96,140,84,.9)"; ctx.beginPath(); ctx.moveTo(wx,H); ctx.quadraticCurveTo(wx+4,H-26,wx,wy+6); ctx.stroke();
    }
  }
  /* In still mode (screenshots, study), show the garden as a visitor's hand would leave it. */
  if(STILL){
    var sr=mulberry32(daySeed()*3);
    for(var gi=0; gi<24; gi++){ makeFlower(W*(0.06+0.88*gi/24)+(sr()-.5)*36, H, false,false,false); }
  }
  render(0);
  if(!REDUCED){
    var frame=function(t){ if(current!=="garden") { requestAnimationFrame(frame); return; } render(t); requestAnimationFrame(frame); };
    requestAnimationFrame(frame);
  }
  var grown=0;
  /* Pointer-grown flowers are content, so they too are reckoned — never unseeded (CANON: the Seed Reckoning). */
  cv.addEventListener("pointermove",function(e){
    if(grown>240) return;
    var r=cv.getBoundingClientRect();
    var x=(e.clientX-r.left)/r.width*W;
    var gr=mulberry32(daySeed()*3+grown*101);
    if(gr()<.16){ makeFlower(x+(gr()-.5)*30, H, false,false,false); grown++; if(REDUCED) render(0); }
  });
  cv.addEventListener("pointerdown",function(e){
    var r=cv.getBoundingClientRect();
    makeFlower((e.clientX-r.left)/r.width*W, H, false,false,false); if(REDUCED) render(0);
  });
  /* The Scattered Leaves: authored pieces, chance arrangement — never the same sentence twice */
  leaves().then(function(data){
    var el=document.getElementById("garden-whisper"); if(!el||!data.whispers) return;
    var r=mulberry32(daySeed()*13+visits*7);
    var pool=data.whispers.slice(), picked=[];
    for(var i=0;i<3 && pool.length;i++){ picked.push(pool.splice(Math.floor(r()*pool.length),1)[0]); }
    el.textContent=picked.join(" — ");
  }).catch(function(){});
}

/* ---------- The Constellation of Wishes (The Wishfield) ---------- */
function initStars(){
  var cv=document.getElementById("stars-canvas"); if(!cv) return;
  var readEl=document.getElementById("wish-read");
  initNebula();
  fetch("data/v1/wishes.json").then(function(r){ return r.json(); }).then(function(data){
    build(data.wishes);
  }).catch(function(){ build([]); });
  function build(wishes){
    var ctx=cv.getContext("2d"), W=cv.width, H=cv.height;
    var rng=mulberry32(daySeed()*7+3);
    var stars=wishes.map(function(w,i){
      return {x:30+rng()*(W-60), y:30+rng()*(H-90), r:2.1+rng()*1.8, ph:rng()*6.28, wish:w};
    });
    /* The Wrong Star: no wish, the wrong colour, slightly too still */
    stars.push({x:W*0.71, y:H*0.3, r:2.3, ph:0, wish:null, wrong:true});
    /* The Moonkeeper's Star, only near the full moon —
       and on the Ninth Day (September 9) regardless of phase (canon §VI) */
    var mp=moonPhase(new Date());
    var nowS=new Date();
    var ninthDay = nowS.getMonth()===8 && nowS.getDate()===9;
    if(mp.illum>=0.92 || ninthDay) stars.push({x:W*0.5, y:64, r:3.1, ph:1, wish:"I wish the moon keeps one wish of its own, unspoken.", moon:true});
    /* a far background of ordinary stars */
    var dust=[]; for(var i=0;i<160;i++) dust.push({x:rng()*W,y:rng()*H,r:rng()*1.1,ph:rng()*6.28});
    var hover=null;
    function render(t){
      ctx.clearRect(0,0,W,H);
      dust.forEach(function(d){ ctx.globalAlpha=.25+.25*Math.sin(t/2400+d.ph); ctx.fillStyle="#cfd6ff"; ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,7); ctx.fill(); });
      ctx.globalAlpha=1;
      stars.forEach(function(s){
        var tw = s.wrong? .92 : .62+.38*Math.sin(t/(s.moon?2600:1500)+s.ph);
        ctx.globalAlpha=tw;
        ctx.fillStyle= s.wrong? "#9fd8b4" : s.moon? "#ffe9a8" : "#f5efdd";
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r*(hover===s?1.7:1),0,7); ctx.fill();
        if(!s.wrong){ ctx.globalAlpha=tw*.28; ctx.beginPath(); ctx.arc(s.x,s.y,s.r*2.6,0,7); ctx.fill(); ctx.globalAlpha=tw; }
        if(s.moon||hover===s){ ctx.globalAlpha=tw*.5; ctx.beginPath(); ctx.arc(s.x,s.y,s.r*3.1,0,7); ctx.strokeStyle=ctx.fillStyle; ctx.lineWidth=.7; ctx.stroke(); }
      });
      ctx.globalAlpha=1;
    }
    render(0);
    if(!REDUCED){ var fr=function(t){ if(current!=="stars"){requestAnimationFrame(fr);return;} render(t); requestAnimationFrame(fr); }; requestAnimationFrame(fr); }
    cv.addEventListener("pointermove",function(e){
      var r=cv.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width*W, y=(e.clientY-r.top)/r.height*H;
      hover=null;
      stars.forEach(function(s){ if(Math.hypot(s.x-x,s.y-y)<16) hover=s; });
      if(hover){
        readEl.textContent = hover.wish===null ? "This one is not a wish." : hover.wish;
        readEl.classList.toggle("wishless", hover.wish===null);
        readEl.classList.add("show");
      } else { readEl.classList.remove("show"); }
      if(REDUCED) render(0);
    });
    cv.addEventListener("pointerleave",function(){ readEl.classList.remove("show"); });
  }
}

/* ---------- The Wishfield Nebula (wave 3 — the WebGPU trial) ----------
   Beneath the Wishfield's stars drifts a slow nebula: the dark between
   wishes, which is not empty. Strangers' hopes rest in one shared dark;
   the nebula is that dark, made visible — indigo and violet, with rare
   traces of gold, the colour this place keeps for what endures.
   The field's home positions are reckoned (seed = D×11 + 5, the canon);
   only the drift is physics, and physics carries no content.
   The motes are small and faint on purpose: thousands of them overlap
   everywhere, and their sum — never any one of them — is the cloud. The
   Canvas 2D stage reaches the same sum with fewer, larger breaths.

   The fallback chain — each stage degrades to the chamber's full meaning:
     1. WebGPU: a compute shader breathes 4,200 reckoned motes through a
        slow flow field; an instanced render pass draws each as a soft disc.
     2. Canvas 2D: the same reckoned homes as a hundred soft sprites —
        fewer, larger, slower. The same dark, at a lower resolution.
     3. No script at all: the frame's own sky (CSS) above the written
        collection — exactly where wave 2 left the chamber.
   A stage that cannot start hands the sky to the next, without a word. */
function initNebula(){
  var cv=document.getElementById("nebula-canvas"); if(!cv) return;
  var W=cv.width, H=cv.height;
  var rng=mulberry32(daySeed()*11+5);
  var COUNT=4200, motes=[];
  for(var i=0;i<COUNT;i++){
    motes.push({ x:rng()*W, y:Math.pow(rng(),1.35)*H, size:8+rng()*34,
      tone:rng(), phase:rng()*6.283, drift:.5+rng()*.8 });
  }
  var owner=null; /* null until a stage owns the sky: "gpu" or "2d" */
  function freshCanvas(){
    var n=document.createElement("canvas");
    n.id="nebula-canvas"; n.width=W; n.height=H;
    n.setAttribute("aria-hidden","true");
    cv.replaceWith(n); cv=n; return n;
  }
  function stage2(){
    if(owner==="2d") return;
    owner="2d";
    nebulaCanvas2D(freshCanvas(), motes, W, H);
  }
  /* The handover patience is long on purpose: the CSS sky is already
     beneath everything, so waiting costs the visitor nothing, and the
     trial's software adapter (SwiftShader, on a loaded machine) needed
     ~7 s merely to answer requestAdapter — a shorter fuse hands the sky
     to the fallback moments before the GPU stage arrives. On real
     hardware the answer takes milliseconds; this timer only guards a
     genuinely stalled stack. */
  var timer=setTimeout(function(){ if(!owner) stage2(); }, 20000);
  if(navigator.gpu && navigator.gpu.requestAdapter){
    nebulaGPU(cv, motes, W, H,
      function(){ return owner!=="2d"; },
      function(){ stage2(); }
    ).then(function(ok){
      if(ok && !owner){ owner="gpu"; clearTimeout(timer); }
      else if(!ok){ clearTimeout(timer); stage2(); }
      /* ok, but the fallback already owns the sky: the GPU frame loop
         sees its liveness check fail and stops itself. */
    }).catch(function(){ clearTimeout(timer); stage2(); });
  } else stage2();
}

function nebulaGPU(cv, motes, W, H, isLive, onLost){
  return navigator.gpu.requestAdapter().then(function(adapter){
    if(!adapter) return false;
    return adapter.requestDevice().then(function(device){
      /* Pin the device to the canvas element for the chamber's life.
         An unreferenced device is garbage-collected by the browser and
         reports itself lost ("destroyed") — in calm mode, where a single
         settled frame is drawn and no loop keeps the closure alive, that
         collection would hand the sky to the fallback for no reason but
         housekeeping. Found by trial, wave 3. */
      cv._nebulaDevice=device;
      var ctx=cv.getContext("webgpu");
      if(!ctx) return false;
      var format=navigator.gpu.getPreferredCanvasFormat();
      ctx.configure({device:device, format:format, alphaMode:"premultiplied"});
      var N=motes.length;
      var data=new Float32Array(N*4);
      motes.forEach(function(m,i){ data[i*4]=m.x; data[i*4+1]=m.y; data[i*4+2]=m.size; data[i*4+3]=m.tone; });
      var dataBuf=device.createBuffer({size:data.byteLength, usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});
      device.queue.writeBuffer(dataBuf,0,data);
      var posBuf=device.createBuffer({size:N*8, usage:GPUBufferUsage.STORAGE});
      var uniBuf=device.createBuffer({size:16, usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
      /* Two modules, not one: the compute stage writes the position
         buffer, the render stage may only read it — a vertex shader is
         never given read-write storage, so each stage declares the
         bindings with the access its place in the pipeline allows. */
      var WGSL_COMPUTE=[
        "struct Mote { home: vec2f, size: f32, tone: f32 }",
        "@group(0) @binding(0) var<storage, read> motes: array<Mote>;",
        "@group(0) @binding(1) var<storage, read_write> pos: array<vec2f>;",
        "@group(0) @binding(2) var<uniform> u: vec4f;", /* time, width, height, count */
        "fn flow(p: vec2f, t: f32) -> vec2f {",
        "  return vec2f(sin(p.y * 0.011 + t * 0.10) + cos(p.x * 0.007 - t * 0.06),",
        "               cos(p.x * 0.009 - t * 0.08) + sin(p.y * 0.013 + t * 0.05));",
        "}",
        "@compute @workgroup_size(64)",
        "fn drift(@builtin(global_invocation_id) id: vec3u) {",
        "  let i = id.x;",
        "  if (i >= u32(u.w)) { return; }",
        "  let h = motes[i].home;",
        "  pos[i] = h + flow(h, u.x) * 14.0 + flow(h * 2.17 + vec2f(131.0, 57.0), u.x * 0.6) * 5.0;",
        "}"
      ].join("\n");
      var WGSL_RENDER=[
        "struct Mote { home: vec2f, size: f32, tone: f32 }",
        "@group(0) @binding(0) var<storage, read> motes: array<Mote>;",
        "@group(0) @binding(1) var<storage, read> pos: array<vec2f>;",
        "@group(0) @binding(2) var<uniform> u: vec4f;",
        "struct VOut { @builtin(position) p: vec4f, @location(0) uv: vec2f, @location(1) tone: f32, @location(2) glow: f32 }",
        "@vertex",
        "fn draw(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VOut {",
        "  let corners = array<vec2f, 6>(vec2f(-1.0,-1.0), vec2f(1.0,-1.0), vec2f(-1.0,1.0),",
        "                                vec2f(-1.0,1.0), vec2f(1.0,-1.0), vec2f(1.0,1.0));",
        "  let c = corners[vi];",
        "  let m = motes[ii];",
        "  let px = pos[ii] + c * m.size;",
        "  var o: VOut;",
        "  o.p = vec4f(px.x / u.y * 2.0 - 1.0, 1.0 - px.y / u.z * 2.0, 0.0, 1.0);",
        "  o.uv = c;",
        "  o.tone = m.tone;",
        "  o.glow = 0.75 + 0.25 * sin(u.x * 0.35 + m.tone * 40.0);",
        "  return o;",
        "}",
        "@fragment",
        "fn paint(o: VOut) -> @location(0) vec4f {",
        "  let fall = pow(max(0.0, 1.0 - length(o.uv)), 2.2);",
        "  var col = mix(vec3f(0.13, 0.16, 0.38), vec3f(0.32, 0.20, 0.48), o.tone);",
        "  col = mix(col, vec3f(0.79, 0.66, 0.42), smoothstep(0.93, 1.0, o.tone));",
        "  let a = fall * 0.11 * o.glow;",
        "  return vec4f(col * a, a);",
        "}"
      ].join("\n");
      var computeModule=device.createShaderModule({code:WGSL_COMPUTE});
      var renderModule=device.createShaderModule({code:WGSL_RENDER});
      var computePipe=device.createComputePipeline({layout:"auto", compute:{module:computeModule, entryPoint:"drift"}});
      var renderPipe=device.createRenderPipeline({
        layout:"auto",
        vertex:{module:renderModule, entryPoint:"draw"},
        fragment:{module:renderModule, entryPoint:"paint", targets:[{format:format,
          blend:{color:{srcFactor:"one", dstFactor:"one", operation:"add"},
                 alpha:{srcFactor:"one", dstFactor:"one", operation:"add"}}}]},
        primitive:{topology:"triangle-list"}
      });
      function bindGroup(pipe){
        return device.createBindGroup({layout:pipe.getBindGroupLayout(0), entries:[
          {binding:0, resource:{buffer:dataBuf}},
          {binding:1, resource:{buffer:posBuf}},
          {binding:2, resource:{buffer:uniBuf}}
        ]});
      }
      var computeBG=bindGroup(computePipe), renderBG=bindGroup(renderPipe);
      device.lost.then(function(){ onLost(); });
      device.addEventListener("uncapturederror", function(){ onLost(); });
      function frame(tms){
        if(!isLive()) return;
        if(!REDUCED && current!=="stars"){ requestAnimationFrame(frame); return; }
        var t = REDUCED ? 26 : (tms||0)/1000;
        device.queue.writeBuffer(uniBuf,0,new Float32Array([t,W,H,N]));
        var enc=device.createCommandEncoder();
        var cp=enc.beginComputePass();
        cp.setPipeline(computePipe); cp.setBindGroup(0,computeBG);
        cp.dispatchWorkgroups(Math.ceil(N/64)); cp.end();
        var rp=enc.beginRenderPass({colorAttachments:[{
          view:ctx.getCurrentTexture().createView(),
          clearValue:{r:0,g:0,b:0,a:0}, loadOp:"clear", storeOp:"store"}]});
        rp.setPipeline(renderPipe); rp.setBindGroup(0,renderBG);
        rp.draw(6,N,0,0); rp.end();
        device.queue.submit([enc.finish()]);
        if(!REDUCED) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
      return true;
    });
  }).catch(function(){ return false; });
}

/* Stage 2 of the chain: the same reckoned homes, drawn as soft sprites. */
function nebulaCanvas2D(cv, motes, W, H){
  var ctx=cv.getContext("2d"); if(!ctx) return;
  function sprite(r,g,b){
    var s=document.createElement("canvas"); s.width=s.height=128;
    var c2=s.getContext("2d");
    var gr=c2.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,"rgba("+r+","+g+","+b+",.55)");
    gr.addColorStop(1,"rgba("+r+","+g+","+b+",0)");
    c2.fillStyle=gr; c2.fillRect(0,0,128,128);
    return s;
  }
  var sprites=[sprite(38,46,110), sprite(84,54,128), sprite(201,168,106)];
  var blobs=motes.filter(function(_,i){ return i%35===0; }); /* 120 of the reckoned homes */
  function render(t){
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation="lighter";
    blobs.forEach(function(m){
      var sp = m.tone>0.93 ? sprites[2] : (m.tone>0.5 ? sprites[1] : sprites[0]);
      var dx = REDUCED? 0 : Math.sin(t/9000*m.drift + m.phase)*26;
      var dy = REDUCED? 0 : Math.cos(t/11000*m.drift + m.phase*1.7)*16;
      var s=m.size*3.4;
      ctx.globalAlpha=.05+.03*Math.sin((REDUCED?0:t/7000)+m.phase);
      ctx.drawImage(sp, m.x+dx-s/2, m.y+dy-s/2, s, s);
    });
    ctx.globalAlpha=1; ctx.globalCompositeOperation="source-over";
  }
  render(0);
  if(!REDUCED){ var fr=function(t){ if(current!=="stars"){requestAnimationFrame(fr);return;} render(t); requestAnimationFrame(fr); }; requestAnimationFrame(fr); }
}

/* ---------- The Letter Room (The Sealed Draw) ---------- */
function initLetters(){
  var all=document.getElementById("letters-all"); if(!all) return;
  var letters=Array.prototype.slice.call(all.querySelectorAll(".letter"));
  var rng=mulberry32(daySeed()+visits*31);
  var drawn=letters[Math.floor(rng()*letters.length)];
  all.classList.add("sealed");
  drawn.classList.add("drawn");
  if(visits>=2){
    var ps=drawn.querySelector("[data-returning]") || all.querySelector("[data-returning]");
    if(ps) ps.hidden=false;
    /* the postscript belongs to whichever letter carries it; surface it under the drawn one */
    var owner=all.querySelector("[data-returning]");
    if(owner && owner!==drawn.querySelector("[data-returning]")){
      var holder=owner.closest(".letter");
      if(holder && holder!==drawn){ holder.classList.add("drawn"); }
    }
  }
}

/* ---------- The Tide Room (The Synodic Reckoning + The Long Breath) ---------- */
function initTide(){
  var mp=moonPhase(new Date());
  var fact=document.getElementById("moon-fact");
  var names=[[1.84,"new"],[5.53,"waxing crescent"],[9.22,"first quarter"],[12.91,"waxing gibbous"],[16.61,"full"],[20.30,"waning gibbous"],[23.99,"last quarter"],[27.68,"waning crescent"],[29.53,"new"]];
  var name="full"; for(var i=0;i<names.length;i++){ if(mp.age<names[i][0]){ name=names[i][1]; break; } }
  if(fact) fact.textContent=name+" · "+Math.round(mp.illum*100)+"%";
  var disc=document.getElementById("moon-disc");
  if(disc){
    /* dark overlay slides away as illumination grows: waxing reveals from the right, waning from the left */
    var shift=(mp.waxing? -1: 1)*mp.illum*100;
    disc.style.setProperty("--moon-shadow", shift+"%");
  }
  var cv=document.getElementById("tide-canvas"); if(!cv) return;
  var ctx=cv.getContext("2d"), W=cv.width, H=cv.height;
  function render(t){
    ctx.clearRect(0,0,W,H);
    var breath = REDUCED? .5 : (Math.sin(t/5200)+1)/2; /* ~10s breath */
    for(var layer=0; layer<4; layer++){
      ctx.beginPath();
      var base=H*.42 + layer*36 + breath*(10-layer*2);
      ctx.moveTo(0,H);
      for(var x=0;x<=W;x+=8){
        var y=base + Math.sin(x/190 + layer*1.4 + (REDUCED?0:t/9000))*(9+layer*2.4) + Math.sin(x/57+layer)*(2.5);
        ctx.lineTo(x,y);
      }
      ctx.lineTo(W,H); ctx.closePath();
      ctx.fillStyle="hsla(222,44%,"+(16+layer*7)+","+(.5+layer*.14)+")";
      ctx.fill();
    }
    /* moonlight path */
    var grd=ctx.createLinearGradient(W*.62,0,W*.62,H);
    grd.addColorStop(0,"rgba(240,236,214,"+(0.05+0.06*mp.illum)+")"); grd.addColorStop(1,"rgba(240,236,214,0)");
    ctx.fillStyle=grd; ctx.fillRect(W*.6,0,W*.05,H);
  }
  render(0);
  if(!REDUCED){ var fr=function(t){ if(current!=="tide"){requestAnimationFrame(fr);return;} render(t); requestAnimationFrame(fr); }; requestAnimationFrame(fr); }
}

/* ---------- The Cabinet ---------- */
function initCabinet(){
  /* The Ulam Ghosts — prime spiral */
  var sc=document.getElementById("spiral-canvas");
  if(sc){
    var ctx=sc.getContext("2d"), S=sc.width, cell=6, n=Math.floor(S/cell);
    function isPrime(k){ if(k<2) return false; for(var i=2;i*i<=k;i++) if(k%i===0) return false; return true; }
    ctx.fillStyle="#0a0c16"; ctx.fillRect(0,0,S,S);
    var x=Math.floor(n/2), y=Math.floor(n/2), dx=1, dy=0, seg=1, cnt=0, num=1, total=n*n;
    ctx.fillStyle="#c9a86a";
    while(num<=total){
      for(var s2=0;s2<seg && num<=total;s2++){
        if(isPrime(num)){ ctx.globalAlpha=.28+.72*Math.min(1,num/900); ctx.fillRect(x*cell+1.5,y*cell+1.5,cell-3,cell-3); }
        x+=dx; y+=dy; num++;
      }
      var tmp=dx; dx=-dy; dy=tmp; cnt++; if(cnt%2===0) seg++;
    }
    ctx.globalAlpha=1;
  }
  /* The Deepening — a fractal shore (Sierpinski coast) */
  var fc=document.getElementById("fractal-canvas"), depth=6;
  function drawFractal(){
    if(!fc) return;
    var ctx=fc.getContext("2d"), S=fc.width;
    ctx.fillStyle="#0a0c16"; ctx.fillRect(0,0,S,S);
    ctx.fillStyle="#8fb7d9";
    function tri(x,y,s,d){
      if(d===0 || s<2){ ctx.fillRect(x,y,Math.max(1.4,s),Math.max(1.4,s)); return; }
      var h=s/2;
      tri(x,y,h,d-1); tri(x+h,y,h,d-1); tri(x+h/2,y+h,h,d-1);
    }
    tri(30,S-40,S-60,depth);
    var lbl=document.getElementById("fractal-depth"); if(lbl) lbl.textContent=String(depth);
  }
  drawFractal();
  var deeper=document.getElementById("fractal-deeper");
  if(deeper) deeper.addEventListener("click",function(){ depth=Math.min(9,depth+1); drawFractal(); });
  if(fc) fc.addEventListener("click",function(){ depth=Math.min(9,depth+1); drawFractal(); });
  /* The Agreement — two tones, one figure */
  var hc=document.getElementById("harmonics-canvas");
  if(hc){
    var hctx=hc.getContext("2d"), HS=hc.width;
    function drawHarm(t){
      hctx.fillStyle="rgba(10,12,22,.16)"; hctx.fillRect(0,0,HS,HS);
      hctx.strokeStyle="rgba(216,205,170,.9)"; hctx.lineWidth=1.4; hctx.beginPath();
      var ph = REDUCED? .5 : t/2600;
      for(var i=0;i<=220;i++){
        var u=i/220*Math.PI*2;
        var px=HS/2 + Math.sin(3*u+ph)*(HS*.38);
        var py=HS/2 + Math.sin(2*u)*(HS*.38);
        if(i===0) hctx.moveTo(px,py); else hctx.lineTo(px,py);
      }
      hctx.stroke();
    }
    drawHarm(0);
    if(!REDUCED){ var fr=function(t){ if(current!=="cabinet"){requestAnimationFrame(fr);return;} drawHarm(t); requestAnimationFrame(fr); }; requestAnimationFrame(fr); }
  }
  /* a chamber quietly gains a detail: the pressed flower, after the Constellation */
  if(isVisited("stars")){
    var pf=document.getElementById("pressed-flower"); if(pf) pf.hidden=false;
  }
  /* The Box does not open. It has never opened. */
  var box=document.getElementById("locked-box");
  if(box){ box.addEventListener("click",function(){ /* nothing happens. that is the exhibit. */ }); }
  /* an oracle slip, drawn by seeded chance from authored pieces */
  leaves().then(function(data){
    var el=document.getElementById("oracle-slip"); if(!el||!data.slips) return;
    var r=mulberry32(daySeed()*17+visits*3);
    el.textContent=data.slips[Math.floor(r()*data.slips.length)];
  }).catch(function(){});
}

/* ---------- The Mirror (The Ghost Ledger) ---------- */
/* mirrorTrail itself is declared with the early state, above — see the note there. */
function initMirror(){
  var cv=document.getElementById("mirror-canvas"); if(!cv) return;
  cv.addEventListener("pointermove",function(e){
    var r=cv.getBoundingClientRect();
    mirrorTrail.push({x:(e.clientX-r.left)/r.width, y:(e.clientY-r.top)/r.height});
    if(mirrorTrail.length>420) mirrorTrail.shift();
    if(current==="mirror") drawMirror();
  });
  drawMirror();
}
function ringPoint(c,W,H){
  var i=CHAMBERS.indexOf(c), a=-Math.PI/2 + i*(2*Math.PI/9);
  return {x:W/2 + Math.cos(a)*W*.36, y:H/2 + Math.sin(a)*H*.33};
}
function drawMirror(){
  var cv=document.getElementById("mirror-canvas"); if(!cv || current!=="mirror") return;
  var ctx=cv.getContext("2d"), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  function strokePath(pts,alpha,width,color){
    if(pts.length<2) return;
    ctx.globalAlpha=alpha; ctx.strokeStyle=color; ctx.lineWidth=width; ctx.beginPath();
    pts.forEach(function(p,i){ if(i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y); });
    ctx.stroke(); ctx.globalAlpha=1;
  }
  /* ghost-lines of previous visits */
  ghosts.forEach(function(g2){
    strokePath(g2.map(function(c){ return ringPoint(c,W,H); }), .16, 1, "#8d99c9");
  });
  /* this visit's path, swelling through the ring */
  var pts=sessionPath.map(function(c){ return ringPoint(c,W,H); });
  strokePath(pts,.92,1.8,"#e9dfc2");
  pts.forEach(function(p,i){
    ctx.fillStyle="#c9a86a"; ctx.beginPath(); ctx.arc(p.x,p.y,3.4,0,7); ctx.fill();
    ctx.fillStyle="rgba(236,231,220,.75)"; ctx.font="12px sans-serif"; ctx.textAlign="center";
    ctx.fillText(String(i+1), p.x, p.y-10);
  });
  /* the visitor's own hand, drawn inside the Mirror — an elegant line constellation */
  if(mirrorTrail.length>3){
    ctx.globalAlpha=.55; ctx.strokeStyle="#b7c6ef"; ctx.lineWidth=1.1; ctx.beginPath();
    mirrorTrail.forEach(function(p,i){ var x=p.x*W, y=p.y*H; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.stroke(); ctx.globalAlpha=1;
    mirrorTrail.filter(function(_,i){ return i%36===0; }).forEach(function(p){
      ctx.fillStyle="#dfe6ff"; ctx.beginPath(); ctx.arc(p.x*W,p.y*H,2.2,0,7); ctx.fill();
    });
  }
  var label=document.getElementById("mirror-path");
  if(label){
    /* the path, as numbers only — the ring's own order, no sentence around it */
    label.textContent = sessionPath.length? sessionPath.map(function(c){return CHAMBERS.indexOf(c)+1;}).join("  →  ") : "";
  }
}
/* keep this visit's path for future ghosts */
window.addEventListener("pagehide",function(){
  var uniq=sessionPath.filter(function(c,i){ return sessionPath.indexOf(c)===i; });
  if(uniq.length>=2){
    var g2=ghosts.slice(-2); g2.push(uniq); STORE.set("ghosts",g2);
  }
});

/* ---------- The Ninth Door ---------- */
function drawDoor(){
  var g=document.getElementById("door-glyphs"); if(!g) return;
  var s="";
  CHAMBERS.slice(0,8).forEach(function(c,i){
    var a=-Math.PI/2 + (i+0.5)*(2*Math.PI/8); /* offset half a step: the top belongs to the ninth seat alone */
    var x=100+86*Math.cos(a), y=100+86*Math.sin(a);
    var lit=isVisited(c);
    s+='<g class="door-slot'+(lit?" lit":"")+'" transform="translate('+x.toFixed(1)+","+y.toFixed(1)+')"><use href="#g-'+c+'" width="17" height="17" x="-8.5" y="-8.5" '+(lit?'color="#c9a86a"':'color="#454055"')+'/></g>';
  });
  /* the ninth seat, at the top */
  s+='<g class="door-slot lit" transform="translate(100,14)"><use href="#g-ninth" width="17" height="17" x="-8.5" y="-8.5" color="#c9a86a"/></g>';
  g.innerHTML=s;
  var done=otherEightDone();
  var closed=document.getElementById("door-closed"), open=document.getElementById("door-open");
  if(done){
    if(closed) closed.hidden=true;
    if(open) open.hidden=false;
    var fl=document.getElementById("final-line");
    if(fl) fl.hidden=!glyphsComplete();
  } else {
    var n=CHAMBERS.slice(0,8).filter(isVisited).length;
    var dc=document.getElementById("door-count");
    if(dc) dc.textContent=n+" / 8";
  }
}

/* ---------- ambient sound: generated tones only, off unless asked ---------- */
(function sound(){
  var btn=document.getElementById("sound-toggle"); if(!btn) return;
  var actx=null, nodes=[];
  function stop(){ nodes.forEach(function(n){ try{ n.stop?n.stop():n.disconnect(); }catch(e){} }); nodes=[]; if(actx){ actx.close(); actx=null; } }
  btn.addEventListener("click",function(){
    var on=btn.getAttribute("aria-pressed")==="true";
    if(on){ stop(); btn.setAttribute("aria-pressed","false"); btn.setAttribute("aria-label","Ambient sound, off"); return; }
    var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    actx=new AC();
    var master=actx.createGain(); master.gain.value=.05; master.connect(actx.destination);
    [196.00,246.94,293.66,392.00].forEach(function(f,i){
      var o=actx.createOscillator(), gn=actx.createGain();
      o.type="sine"; o.frequency.value=f;
      gn.gain.value=0; gn.gain.linearRampToValueAtTime(.25/(i+1.4), actx.currentTime+2.5+i*.7);
      var lfo=actx.createOscillator(), lg=actx.createGain();
      lfo.frequency.value=.05+i*.017; lg.gain.value=.05; lfo.connect(lg); lg.connect(gn.gain);
      o.connect(gn); gn.connect(master); o.start(); lfo.start();
      nodes.push(o,lfo);
    });
    btn.setAttribute("aria-pressed","true"); btn.setAttribute("aria-label","Ambient sound, on");
  });
})();
})();
