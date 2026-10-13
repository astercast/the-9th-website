/* The 9th Website — wave 1.
   Everything here is enhancement. The place reads whole without it.
   No external requests. Memory lives only in the visitor's browser. */
(function(){
"use strict";
document.documentElement.classList.add("js");
/* ?still — a harness accommodation for screenshots and study: freezes the place mid-breath. */
var STILL=/[?&]still\b/.test(location.search);
if(STILL) document.documentElement.classList.add("still");

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
  var w=document.getElementById("welcome-line"), w2=document.getElementById("welcome-second");
  var lines={
    dawn:"The light is just arriving, and so are you.",
    day:"Broad daylight, and the place is still keeping its secrets.",
    dusk:"You came at the hour when everything is briefly gold.",
    night:"You came in the dark. The place respects that."
  };
  if(visits>=9){ w.textContent="Nine times now. The place has stopped pretending it doesn't know you."; }
  else if(visits>=27){ w.textContent="The ring keeps your seat the way a shore keeps the shape of the tide."; }
  else if(visits>=2){ w.textContent="You came back. Places notice that kind of thing."; if(w2){w2.hidden=false; w2.textContent="Your earlier path is kept in the Mirror, faintly, under the new one.";} }
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
}

/* ---------- The Garden (The Dayseed) ---------- */
function initGarden(){
  var cv=document.getElementById("garden-canvas"); if(!cv) return;
  var ctx=cv.getContext("2d"), W=cv.width, H=cv.height;
  var rng=mulberry32(daySeed());
  var isNinth = new Date().getDate()===9;
  var flowers=[];
  function makeFlower(x,y,golden,black,big){
    var petals=5+Math.floor(rng()*4);
    flowers.push({x:x,y:y,h:70+rng()*130+(big?70:0),lean:(rng()-.5)*36,petals:petals,
      hue: golden? 46 : black? 0 : 285+rng()*70,
      sat: golden? 85 : black? 0 : 55+rng()*25,
      light: golden? 62 : black? 7 : 62+rng()*16,
      seed:rng()*Math.PI*2, golden:golden, black:black});
  }
  /* the east bed: one golden flower, only on the 9th */
  if(isNinth) makeFlower(W*0.82, H, true,false,true);
  /* exactly one black bloom, never the largest */
  makeFlower(W*(0.15+rng()*0.2), H, false,true,false);
  /* a white flower arrives only if the visitor has been to the Constellation first */
  var whiteFlower = isVisited("stars");
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
  if(isNinth){
    var note=document.getElementById("garden-note");
    if(note) note.textContent="Today is the ninth day. Something golden is growing in the east bed. The Cartographer noticed it first, and never once wrote down why.";
  }
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
    /* The Moonkeeper's Star, only near the full moon */
    var mp=moonPhase(new Date());
    if(mp.illum>=0.92) stars.push({x:W*0.5, y:64, r:3.1, ph:1, wish:"I wish the moon keeps one wish of its own, unspoken.", moon:true});
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
  var shelf=document.getElementById("letter-draw");
  if(shelf){
    var note=document.createElement("p");
    note.className="chamber-lede";
    note.textContent="Drawn for this visit: “"+drawn.querySelector(".letter-first").textContent+"” — the rest stay sealed below, by their first lines.";
    shelf.appendChild(note);
  }
}

/* ---------- The Tide Room (The Synodic Reckoning + The Long Breath) ---------- */
function initTide(){
  var mp=moonPhase(new Date());
  var fact=document.getElementById("moon-fact");
  var names=[[1.84,"new"],[5.53,"waxing crescent"],[9.22,"first quarter"],[12.91,"waxing gibbous"],[16.61,"full"],[20.30,"waning gibbous"],[23.99,"last quarter"],[27.68,"waning crescent"],[29.53,"new"]];
  var name="full"; for(var i=0;i<names.length;i++){ if(mp.age<names[i][0]){ name=names[i][1]; break; } }
  if(fact) fact.textContent="Tonight the moon is "+name+", "+Math.round(mp.illum*100)+"% lit — computed here, from the moon itself, by the old reckoning: 29.53 days from new to new.";
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
    var lbl=document.getElementById("fractal-depth"); if(lbl) lbl.textContent="depth "+depth;
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
var mirrorTrail=[];
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
    var names={threshold:"the Threshold",scale:"the Scale Room",garden:"the Garden",stars:"the Constellation",letters:"the Letter Room",tide:"the Tide Room",cabinet:"the Cabinet",mirror:"the Mirror",ninth:"the Ninth Door"};
    label.textContent = sessionPath.length? "This visit, so far: "+sessionPath.map(function(c){return names[c];}).join(" → ") : "";
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
    if(dc) dc.textContent="The door is not locked. It is unfinished — as are you, here. "+n+" of its eight companions have been visited. It opens to a complete ring.";
  }
}

/* ---------- ambient sound: generated tones only, off unless asked ---------- */
(function sound(){
  var btn=document.getElementById("sound-toggle"); if(!btn) return;
  var actx=null, nodes=[];
  function stop(){ nodes.forEach(function(n){ try{ n.stop?n.stop():n.disconnect(); }catch(e){} }); nodes=[]; if(actx){ actx.close(); actx=null; } }
  btn.addEventListener("click",function(){
    var on=btn.getAttribute("aria-pressed")==="true";
    if(on){ stop(); btn.setAttribute("aria-pressed","false"); btn.textContent="sound · off"; return; }
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
    btn.setAttribute("aria-pressed","true"); btn.textContent="sound · on";
  });
})();
})();
