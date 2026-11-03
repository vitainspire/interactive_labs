/* Lesson 4: Carbon and its Compounds — games.html content.
   This page has its own fully self-contained quiz-tab engine ($, Snd, mark,
   celebrate, banner, shuffle, nav wiring, the per-game makeGame/makeMatch
   builders) — it does not use ../shared/app.js, because its mark()/nav
   wiring differ from the shared versions (no score "pop" animation or
   spark burst, no auto-next timer, no body[data-g] theming hook). Shared
   app.js is therefore not loaded on this page. Everything below is this
   lesson's own: 7 games' question data (100 questions), the functional
   group matching board, and the SVG lab-picture scenes. */

(function(){
const $=id=>document.getElementById(id);
let right=0,total=0,streak=0;
  const Snd=(()=>{
    let ctx=null,mg=null,sg=null,on=true,tm=null,nt=0,st=0;
    try{on=localStorage.getItem("zphsRLmusic")!=="off";}catch(e){}
    const CH=[[261.63,329.63,392.0],[220.0,261.63,329.63],[174.61,220.0,261.63],[196.0,246.94,293.66]];
    const PEN=[523.25,587.33,659.25,783.99,880.0];
    const EIGHTH=60/84/2;
    function tone(f,t,d,type,v,dest){
      const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=f;
      g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+0.03);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
      o.connect(g);g.connect(dest);o.start(t);o.stop(t+d+0.05);
    }
    function sched(){
      if(!ctx||!on)return;
      while(nt<ctx.currentTime+0.35){
        const bar=((st/8)|0)%4,k=st%8,ch=CH[bar];
        tone(ch[[0,1,2,1,0,1,2,1][k]],nt,0.55,"triangle",0.5,mg);
        if(k===0)tone(ch[0]/2,nt,1.5,"sine",0.55,mg);
        if((k===2||k===6)&&Math.random()<0.55)tone(PEN[(Math.random()*PEN.length)|0],nt+0.02,0.7,"sine",0.28,mg);
        nt+=EIGHTH;st=(st+1)%32;
      }
    }
    function startLoop(){
      if(tm||!ctx)return;
      nt=ctx.currentTime+0.1;st=0;
      mg.gain.cancelScheduledValues(ctx.currentTime);mg.gain.setTargetAtTime(0.085,ctx.currentTime,0.4);
      tm=setInterval(sched,120);sched();
    }
    function stopLoop(){
      clearInterval(tm);tm=null;
      if(ctx&&mg){mg.gain.cancelScheduledValues(ctx.currentTime);mg.gain.setTargetAtTime(0.0001,ctx.currentTime,0.12);}
    }
    function init(){
      if(ctx)return true;
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
      try{
        ctx=new AC();mg=ctx.createGain();mg.gain.value=0.0001;sg=ctx.createGain();sg.gain.value=0.5;
        const lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=1800;
        mg.connect(lp);lp.connect(ctx.destination);sg.connect(ctx.destination);
      }catch(e){ctx=null;return false;}
      return true;
    }
    const api={
      start(){if(!init())return;if(ctx.state==="suspended")ctx.resume();if(on)startLoop();},
      toggle(){
        on=!on;try{localStorage.setItem("zphsRLmusic",on?"on":"off");}catch(e){}
        if(on){if(init()){if(ctx.state==="suspended")ctx.resume();startLoop();}}else stopLoop();
        return on;
      },
      isOn:()=>on,
      pause(){if(ctx&&ctx.state==="running")ctx.suspend();},
      resume(){if(ctx&&on&&ctx.state==="suspended")ctx.resume();},
      ok(){if(!ctx||!on)return;const t=ctx.currentTime;tone(880,t,0.22,"sine",0.5,sg);tone(1318.5,t+0.09,0.3,"sine",0.45,sg);},
      fan(){if(!ctx||!on)return;const t=ctx.currentTime;[523.25,659.25,783.99,1046.5,1318.5].forEach((f,i)=>tone(f,t+i*0.09,0.5,"triangle",0.5,sg));tone(1568,t+0.5,0.8,"sine",0.35,sg);}
    };
    return api;
  })();
  const musB=$("mus");
  const musSync=()=>{musB.setAttribute("aria-pressed",Snd.isOn());};musSync();
  musB.addEventListener("click",e=>{e.stopPropagation();Snd.toggle();musSync();});
  const firstTouch=()=>{Snd.start();};
  document.addEventListener("pointerdown",firstTouch,{capture:true,once:true});
  document.addEventListener("keydown",firstTouch,{capture:true,once:true});
  document.addEventListener("visibilitychange",()=>{document.hidden?Snd.pause():Snd.resume();});

  function celebrate(n){
    const old=document.querySelector(".big3");if(old)old.remove();
    const b=document.createElement("div");b.className="big3";b.textContent=`🔥 ${n} in a row!`;document.body.appendChild(b);setTimeout(()=>b.remove(),2300);
    const box=document.createElement("div");box.className="cf";
    const cols=["#F97316","#2563EB","#DB2777","#16A34A","#FACC15","#7C3AED","#DC2626","#0D9488"];
    for(let k=0;k<90;k++){
      const p=document.createElement("i"),w=16+Math.random()*12;
      p.style.left=(Math.random()*100)+"%";p.style.width=w+"px";p.style.height=(w*(Math.random()<.5?1:1.8))+"px";
      p.style.background=cols[k%cols.length];
      p.style.setProperty("--d",(4+Math.random()*1.5).toFixed(2)+"s");p.style.setProperty("--dl",(Math.random()*1.2).toFixed(2)+"s");
      p.style.setProperty("--sx",((Math.random()-.5)*10).toFixed(1)+"vw");p.style.setProperty("--r",((Math.random()<.5?-1:1)*(360+Math.random()*540)|0)+"deg");
      box.appendChild(p);
    }
    document.body.appendChild(box);setTimeout(()=>box.remove(),7000);
  }
  function banner(t){
    const old=document.querySelector(".big3");if(old)old.remove();
    const b=document.createElement("div");b.className="big3";b.textContent=t;document.body.appendChild(b);setTimeout(()=>b.remove(),2300);
  }
const mark=ok=>{
  total++;if(ok){right++;streak++;}else streak=0;
  $("score").textContent=`Score ${right} / ${total}`+(streak>=3?` 🔥${streak}`:"");
  if(!ok)return;
  if(streak%3===0){celebrate(streak);Snd.fan();}else Snd.ok();
};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function bag(items){let b=[],last=null;return()=>{if(!b.length){b=shuffle(items);if(b.length>1&&b[0]===last)b.push(b.shift());}last=b.shift();return last;};}
document.querySelectorAll("nav button").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll("nav button").forEach(x=>x.setAttribute("aria-selected",x===b));
  document.querySelectorAll(".game").forEach(g=>g.classList.toggle("on",g.id===b.dataset.g));
}));

/* formula formatter: H2SO4 -> H<sub>2</sub>SO<sub>4</sub>, H^+ -> H<sup>+</sup> */
const F=s=>String(s).replace(/\^([0-9]*[+−-])/g,"<sup>$1</sup>").replace(/([A-Za-z\)])(\d+)/g,"$1<sub>$2</sub>").replace(/·½/g,"·½");
const NS="http://www.w3.org/2000/svg";
function el(tag,attrs,parent,text){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(text!=null)e.textContent=text;if(parent)parent.appendChild(e);return e;}
function txt(svg,x,y,s,cls){return el("text",{x,y,class:cls||"pt"},svg,s);}
/* svg text with real subscripts */
function ftxt(svg,x,y,s,cls){
  const t=el("text",{x,y,class:cls||"pt"},svg);
  const parts=String(s).split(/(\^[0-9]*[+−-]|(?<=[A-Za-z\)])\d+)/).filter(Boolean);
  for(const p of parts){
    if(p[0]==="^"){el("tspan",{"baseline-shift":"super","font-size":"68%"},t,p.slice(1));}
    else if(/^\d+$/.test(p)&&t.lastChild&&/[A-Za-z\)]$/.test(t.lastChild.textContent)){el("tspan",{"baseline-shift":"sub","font-size":"68%"},t,p);}
    else el("tspan",{},t,p);
  }
  return t;
}
const COL={"Red":"#E53935","Blue":"#1E88E5","Pink":"#EC4899","Yellow":"#F6C915","Purple":"#8E44AD","Colourless":"transparent","Reddish-brown":"#A0522D","Orange":"#FB8C00","Green":"#43A047","White":"#F4F4F4","Milky white":"#EDEDED","Blue-green":"#1FA39A"};
const CLEAR="var(--clear)";

/* ---------- engine ---------- */
const optHTML=s=>{
  const sw=COL[s.split("|")[0]]!==undefined?`<span class="sw" style="background:${COL[s.split("|")[0]]}"></span>`:"";
  return sw+(s.includes("|")?`<span class="lbl"><b>${F(s.split("|")[0])}</b><small>${F(s.split("|")[1])}</small></span>`:`<span class="lbl">${F(s)}</span>`);
};
function makeGame(id,FIRST,MORE,draw){
  const sec=$(id);
  sec.innerHTML=`<div class="tag"></div><p class="q"></p><div class="card" hidden></div><div class="scene"><svg viewBox="0 0 640 240" preserveAspectRatio="xMidYMid meet" role="img"></svg></div><div class="opts"></div><div class="foot"><div class="msg"></div><button class="next" hidden>Next</button></div>`;
  const q=s=>sec.querySelector(s);
  const UI={tag:q(".tag"),q:q(".q"),card:q(".card"),scene:q(".scene"),svg:q("svg"),opts:q(".opts"),msg:q(".msg"),next:q(".next")};
  const CORE=FIRST.map((x,i)=>Object.assign({},x,{src:(x.src||"📘 Textbook")+" · "+(i+1)+" of "+FIRST.length}));
  const BONUS=MORE.map((x,i)=>Object.assign({},x,{src:"⭐ Bonus "+(i+1)+" of "+MORE.length}));
  const ALL=[...CORE,...BONUS];
  let order=ALL.map((_,i)=>i),seq=0,cur=null,autoT=null;
  function show(){
    const it=cur;UI.svg.innerHTML="";UI.svg.setAttribute("viewBox","0 0 640 240");
    const card=typeof it.card==="function"?it.card(cur.state):it.card;
    UI.card.hidden=!card;if(card)UI.card.innerHTML=`<span class="ic">${card[0]}</span><span class="cx">${F(card[1])}</span>`;
    const hasScene=draw(it,UI.svg,cur.state);
    UI.scene.hidden=!hasScene;
    UI.opts.classList.toggle("grow",!hasScene);
  }
  function next(){
    clearTimeout(autoT);UI.next.classList.remove("cd");
    if(seq>=order.length){seq=0;order=shuffle(ALL.map((_,i)=>i));}
    cur=Object.assign({},ALL[order[seq++]]);
    cur.state={answered:false,done:new Set(),pos:0,wrong:false};
    UI.tag.textContent=cur.src;UI.tag.classList.toggle("think",cur.src.startsWith("💡")||cur.src.startsWith("⭐"));
    UI.q.innerHTML=F(cur.q);
    UI.opts.className="opts "+(cur.lay||(cur.steps&&cur.steps.length>4?"three":"two"));
    UI.opts.innerHTML="";
    const items=cur.steps?shuffle(cur.steps.map(s=>s.k)):shuffle([cur.a,...cur.t]);
    for(const k of items){
      const b=document.createElement("button");b.className="btn";b.dataset.k=k;
      if(cur.steps){const s=cur.steps.find(x=>x.k===k);b.innerHTML=(s.c?`<span class="sw" style="background:${s.c}"></span>`:"")+`<span class="lbl">${F(s.l)}</span>`;}
      else b.innerHTML=optHTML(k);
      b.onclick=()=>cur.steps?stepPick(b):pick(b);UI.opts.appendChild(b);
    }
    UI.msg.className="msg";UI.msg.textContent=cur.hint||(cur.steps?"Tap them in the right order.":"Choose the right answer.");
    UI.next.hidden=true;show();
  }
  function finish(ok,head){
    cur.state.answered=true;show();
    UI.msg.className="msg "+(ok?"ok":"bad");
    UI.msg.innerHTML=head+` <span class="w">${F(cur.w)}</span>`;
    UI.next.hidden=false;
    const ms=ok?2500:6000;
    UI.next.style.setProperty("--t",ms+"ms");UI.next.classList.remove("cd");void UI.next.offsetWidth;UI.next.classList.add("cd");
    clearTimeout(autoT);
    const mine=cur;
    const tick=()=>{
      if(cur!==mine)return;
      if(!document.hidden&&sec.offsetParent!==null)next();else autoT=setTimeout(tick,800);
    };
    autoT=setTimeout(tick,ms);
  }
  function pick(b){
    if(cur.state.answered)return;
    const ok=b.dataset.k===cur.a;mark(ok);
    [...UI.opts.children].forEach(x=>{x.disabled=true;if(x.dataset.k===cur.a)x.classList.add("ok");});
    if(!ok)b.classList.add("bad");
    finish(ok,ok?"Correct!":`Answer: ${F(cur.a.replace("|",", "))}.`);
  }
  function stepPick(b){
    const S=cur.state;if(S.answered||b.disabled)return;
    const want=cur.steps[S.pos].k;
    if(b.dataset.k!==want){S.wrong=true;b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake","bad");setTimeout(()=>b.classList.remove("bad"),500);
      UI.msg.className="msg bad";UI.msg.textContent="Not this one yet. Think again.";return;}
    S.pos++;S.done.add(want);b.disabled=true;b.classList.add("ok");
    b.insertAdjacentHTML("afterbegin",`<span class="num">${S.pos}</span>`);
    UI.msg.className="msg";UI.msg.textContent=`Good. Step ${S.pos} done.`;
    if(S.pos===cur.steps.length){mark(!S.wrong);finish(!S.wrong,S.wrong?"Done, but with a mistake.":"Correct order!");}
    else show();
  }
  UI.next.onclick=next;next();
  return{ALL,next};
}

/* ---------- scenes ---------- */
/* test tube centred at x. o: liq colour, lab, ind (dropper label), drop (bool), strip {c0,c1,dip}, bubbles, solids, milky */
function tube(svg,x,o){
  const top=46,bot=178,w=30,lv=o.level||104;
  const shape=`M${x-w},${top} V${bot} A${w},${w} 0 0 0 ${x+w},${bot} V${top}`;
  el("path",{d:shape+" Z",class:"glassfill"},svg);
  const liq=el("path",{d:`M${x-w},${lv} V${bot} A${w},${w} 0 0 0 ${x+w},${bot} V${lv} Z`,class:"liq"},svg);
  liq.style.fill=o.liq||CLEAR;
  if(o.solids)for(const [dx,dy] of [[-12,200],[2,204],[14,198],[-4,193],[9,190]])el("rect",{x:x+dx-5,y:dy-5,width:10,height:8,rx:2,class:"solid"},svg);
  if(o.bubbles)for(let i=0;i<9;i++){const c=el("circle",{cx:x-20+((i*13)%40),cy:200,r:2.5+(i%3),class:"bub"},svg);c.style.animationDelay=(i*.22)+"s";}
  if(o.strip){
    const s=o.strip;
    el("rect",{x:x-7,y:10,width:14,height:150,rx:2,class:"strip",style:`fill:${s.c0}`},svg);
    const low=el("rect",{x:x-7,y:lv,width:14,height:160-lv,rx:2,class:"strip lowstrip",style:`fill:${s.dip?s.c1:s.c0}`},svg);
  }
  el("path",{d:shape,class:"glass"},svg);
  el("line",{x1:x-w-6,y1:top,x2:x+w+6,y2:top,class:"glass"},svg);
  if(o.ind){
    el("rect",{x:x-6,y:14,width:12,height:24,rx:3,class:"dropper"},svg);
    el("ellipse",{cx:x,cy:12,rx:10,ry:9,class:"bulb"},svg);
    const lab=ftxt(svg,x+(o.indSide||1)*30,22,o.ind,"note");lab.style.setProperty("text-anchor",(o.indSide||1)>0?"start":"end");
    if(o.drop){const d=el("circle",{cx:x,cy:42,r:5,class:"drp"},svg);d.style.fill=o.dropC||"var(--dev)";}
  }
  if(o.lab)ftxt(svg,x,234,o.lab,"pt");
  return liq;
}

/* ---------- scenes for Metals and Non-metals ---------- */
const V=(svg,v)=>svg.setAttribute("viewBox",v);
const anchor=(t,a)=>{t.style.setProperty("text-anchor",a);return t;};
/* oxide between an acid tube and a base tube */
function twoTube(svg,o,answered,showR){
  const pw=o.pc||"#E9E4DA";
  const T=[[190,"Dilute HCl",o.acid],[450,"NaOH solution",o.base]];
  ftxt(svg,320,40,o.ox,"pt big ox");
  el("path",{d:"M290,46 L222,66",class:"arrow"},svg);el("path",{d:"M350,46 L418,66",class:"arrow"},svg);
  for(const [x,lab,r] of T){
    tube(svg,x,{liq:"var(--clear2)",lab,level:100,bubbles:o.gas});
    if(!o.gas&&!((answered||showR)&&r))for(const [dx,dy] of [[-12,200],[2,204],[14,198],[-4,193],[9,190],[-14,190],[16,191]])el("rect",{x:x+dx-6,y:dy-6,width:12,height:9,rx:3,class:"powder"},svg).style.fill=pw;
    if(answered||showR){const t=anchor(txt(svg,x<320?x-40:x+40,150,r?"✓ Reacts":"✗ No reaction","pt "+(r?"okc":"badc")),x<320?"end":"start");}
  }
  if(answered&&o.kind){
    const C={Basic:"#1E88E5",Acidic:"#E53935",Amphoteric:"#8E24AA"}[o.kind];
    const g=el("g",{class:"fade"},svg);el("rect",{x:226,y:128,width:188,height:34,rx:17,fill:C},g);txt(g,320,151,o.kind+" oxide","pt pill");
  }else if(!answered)txt(svg,320,151,"?","pt q big");
}
/* metal with cold water, hot water and steam */
const WSTAT=["Cold water","Hot water","Steam"];
function waterScene(svg,m,ans,answered){
  ftxt(svg,320,26,m,"pt big");
  WSTAT.forEach((lab,i)=>{
    const x=140+i*180,hit=answered&&ans===lab;
    el("path",{d:`M${x-52},62 V196 Q${x-52},208 ${x-40},208 H${x+40} Q${x+52},208 ${x+52},196 V62`,class:"glass"+(hit?" hitglass":"")},svg);
    const w=el("rect",{x:x-50,y:i===2?150:104,width:100,height:i===2?56:102,class:"liq"},svg);w.style.fill=i===0?"rgba(100,170,240,.30)":i===1?"rgba(240,130,90,.28)":"rgba(160,160,170,.25)";
    if(i===2)for(let k=0;k<3;k++)el("path",{d:`M${x-24+k*24},140 q-8,-14 0,-28 q8,-14 0,-28`,class:"steam"},svg);
    txt(svg,x,234,lab,"pt");
    if(hit){
      for(let k=0;k<8;k++){const c=el("circle",{cx:x-30+(k*9)%60,cy:200,r:3+(k%3),class:"bub"},svg);c.style.animationDelay=(k*.2)+"s";}
      txt(svg,x,58,"✓","pt okc big");
      if(m==="Na"||m==="K")txt(svg,x+30,96,"🔥","emo");
    }
  });
  if(answered&&ans==="No reaction")txt(svg,320,128,"No reaction at all","pt badc big");
}
/* the activity series as a row of cells */
const SERIES=["K","Na","Ca","Mg","Al","Zn","Fe","Pb","H","Cu","Hg","Ag","Au"];
const SC=["#C62828","#D84315","#EF6C00","#F9A825","#9E9D24","#558B2F","#2E7D32","#00838F","#78909C","#1565C0","#4527A0","#6A1B9A","#B8860B"];
function seriesScene(svg,o){
  o=o||{};const W=46,X0=21;
  anchor(txt(svg,X0+2,58,"Most reactive","note"),"start");anchor(txt(svg,X0+13*W-2,58,"Least reactive","note"),"end");
  el("path",{d:`M${X0+125},52 H${X0+13*W-130}`,class:"arrow"},svg);
  SERIES.forEach((m,i)=>{
    const x=X0+i*W,hide=o.hide&&o.hide.has(m),h=o.hl&&o.hl.includes(m);
    const r=el("rect",{x:x+2,y:80,width:W-4,height:60,rx:8,class:"cell"+(h?" hlcell":"")},svg);r.style.fill=hide?"var(--chip)":SC[i];
    const t=txt(svg,x+W/2,118,hide?"?":(m==="H"?"[H]":m),"pt cellt"+(hide?" q":""));
  });
  if(o.arrow){
    const [a,b,ok]=o.arrow,xa=X0+SERIES.indexOf(a)*W+W/2,xb=X0+SERIES.indexOf(b)*W+W/2;
    el("path",{d:`M${xa},146 Q${(xa+xb)/2},${200} ${xb},146`,class:"darrow "+(ok?"okline":"badline")},svg);
    txt(svg,(xa+xb)/2,214,ok?`${a} can displace ${b} ✓`:`${a} cannot displace ${b} ✗`,"pt "+(ok?"okc":"badc"));
  }
}
/* metal piece in a salt solution */
function dispScene(svg,o,answered){
  V(svg,"150 0 340 240");
  const r=answered&&o.reacts;
  tube(svg,320,{liq:r?o.c1:o.c0,lab:o.sol,level:92});
  const p=el("rect",{x:312,y:20,width:16,height:178,rx:o.wire?8:3,class:"nail"},svg);p.style.fill=o.metalC||"#8A97A8";
  if(o.wire)p.setAttribute("width","9"),p.setAttribute("x","316");
  if(r){const c=el("rect",{x:o.wire?316:312,y:92,width:o.wire?9:16,height:106,rx:3,class:"coat fade"},svg);c.style.fill=o.coat;}
  anchor(txt(svg,350,30,o.metal,"note"),"start");
  if(answered)anchor(txt(svg,372,140,r?"Reaction ✓":"No change ✗","pt "+(r?"okc":"badc")),"start");
}
/* Bohr atoms */
const RAD=[19,34,49,64];
function atom(svg,cx,cy,shells,sym,o){
  o=o||{};
  shells.forEach((n,k)=>{
    el("circle",{cx,cy,r:RAD[k],class:"shell"},svg);
    for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n+(k%2?.2:0);
      const outer=k===shells.length-1;
      const e=el("circle",{cx:cx+RAD[k]*Math.cos(a),cy:cy+RAD[k]*Math.sin(a),r:4.2,class:"eln"+(outer&&o.hl?" eout":"")},svg);
    }
  });
  el("circle",{cx,cy,r:11,class:"nuc"},svg);
  txt(svg,cx,cy+5,sym,"pt nucl");
  if(o.charge){const t=ftxt(svg,cx+RAD[shells.length-1]+8,cy-RAD[shells.length-1]+8,o.charge,"pt chg");anchor(t,"start");}
  if(o.lab)ftxt(svg,cx,cy+RAD[shells.length-1]+20,o.lab,"note");
  if(o.ring){el("circle",{cx,cy,r:RAD[shells.length-1]+10,class:"ionring"},svg);}
}
const CFG={He:[2],Ne:[2,8],Ar:[2,8,8],Na:[2,8,1],Mg:[2,8,2],Al:[2,8,3],K:[2,8,8,1],Ca:[2,8,8,2],N:[2,5],O:[2,6],F:[2,7],P:[2,8,5],S:[2,8,6],Cl:[2,8,7]};
const ION={Na:[[2,8],"Na^+"],Mg:[[2,8],"Mg^2+"],Al:[[2,8],"Al^3+"],K:[[2,8,8],"K^+"],Ca:[[2,8,8],"Ca^2+"],Cl:[[2,8,8],"Cl^−"],O:[[2,8],"O^2−"],F:[[2,8],"F^−"],S:[[2,8,8],"S^2−"]};
function formScene(svg,f,answered){
  /* f: {m:"Na",nm:"Cl",nM:1,nN:1} */
  const parts=[];for(let i=0;i<f.nM;i++)parts.push(f.m);for(let i=0;i<f.nN;i++)parts.push(f.nm);
  const order=f.nN===2?[f.nm,f.m,f.nm]:f.nM===2?[f.m,f.nm,f.m]:[f.m,f.nm];
  const xs=order.length===3?[120,320,520]:[200,440];
  order.forEach((s,i)=>{
    const ion=answered?ION[s]:null;
    atom(svg,xs[i],112,ion?ion[0]:CFG[s],s,{hl:!answered,charge:ion?ion[1]:null,ring:!!ion,lab:ion?null:CFG[s].join(", ")});
  });
  if(!answered){
    for(let i=0;i<order.length-1;i++){
      const a=xs[i],b=xs[i+1],fromM=order[i]===f.m;
      el("path",{d:`M${fromM?a+40:b-40},40 Q${(a+b)/2},10 ${fromM?b-40:a+40},40`,class:"earrow"},svg);
    }
    txt(svg,320,226,"Electrons move from the metal to the non-metal","note");
  }else{ftxt(svg,320,226,f.res,"pt big");}
}
/* electrolytic refining */
function refineScene(svg,o){
  V(svg,"60 0 520 240");const A=o.answered;
  el("path",{d:"M150,60 V214 Q150,224 160,224 H480 Q490,224 490,214 V60",class:"glass"},svg);
  el("rect",{x:152,y:92,width:336,height:130,class:"liq",style:"fill:rgba(30,136,229,.30)"},svg);
  el("rect",{x:214,y:40,width:30,height:160,rx:3,class:"anode"},svg);
  el("rect",{x:404,y:40,width:8,height:160,class:"cathode"},svg);
  if(A)el("rect",{x:408,y:92,width:10,height:108,class:"cathode fade"},svg);
  for(const [x,y] of [[210,214],[226,216],[240,213],[252,217]])el("circle",{cx:x,cy:y,r:4,class:"mud"},svg);
  el("line",{x1:229,y1:40,x2:229,y2:16,class:"wire"},svg);el("line",{x1:408,y1:40,x2:408,y2:16,class:"wire"},svg);
  txt(svg,229,12,"+","pt");txt(svg,408,12,"−","pt");
  const L=(k,x,y,s,a)=>{const show=A||o.show===k;if(show)anchor(ftxt(svg,x,y,s,"pt"+(o.ask===k?" q":"")),a);else if(o.ask===k)anchor(txt(svg,x,y,"?","pt q big"),a);};
  L("an",204,80,"Impure metal (anode)","end");
  L("ca",422,80,"Pure metal (cathode)","start");
  L("el",320,150,"Salt solution","middle");
  L("mud",262,212,"Anode mud","start");
}
/* rusting test tubes A B C */
function rustScene(svg,answered){
  const T=[[150,"A","Air + water","rgba(100,170,240,.32)"],[320,"B","No air","rgba(100,170,240,.32)"],[490,"C","Dry air",null]];
  for(const [x,k,lab,liq] of T){
    tube(svg,x,{liq:liq||"transparent",level:liq?110:200,lab});
    if(k==="B")el("rect",{x:x-30,y:100,width:60,height:10,class:"oil"},svg);
    if(k==="C")for(const [dx,dy] of [[-12,200],[2,204],[14,198],[-4,193],[9,190]])el("rect",{x:x+dx-6,y:dy-6,width:12,height:9,rx:3,class:"powder"},svg).style.fill="#F4F4F4";
    const n=el("rect",{x:x-5,y:60,width:10,height:120,rx:2,class:"nail"},svg);n.style.fill=answered&&k==="A"?"#A0522D":"#8A97A8";
    el("rect",{x:x-12,y:56,width:24,height:7,rx:2,class:"nail"},svg).style.fill=answered&&k==="A"?"#A0522D":"#8A97A8";
    anchor(txt(svg,x-40,70,k,"pt big"),"end");
    if(answered)txt(svg,x,30,k==="A"?"Rust":"No rust","pt "+(k==="A"?"badc":"okc"));
  }
}
/* extraction flow */
function flowScene(svg,steps,done){
  const n=steps.length,W=118,G=8,X0=(640-(n*W+(n-1)*G))/2;
  steps.forEach((s,i)=>{
    const x=X0+i*(W+G),show=done.has(s.k);
    el("rect",{x,y:70,width:W,height:96,rx:12,class:"fbox"+(show?" fon":"")},svg);
    const lines=show?(s.b||s.l).split("\n"):["?"];
    lines.forEach((ln,j)=>txt(svg,x+W/2,112+j*22-(lines.length-1)*11,ln,"pt "+(show?"fl":"q big")));
    if(i<n-1)txt(svg,x+W+G/2,124,"›","pt big");
  });
}

/* ===== Lesson 4: Carbon and its Compounds — 72 textbook questions + 28 bonus ===== */
const B1_C=[{"q": "What is a covalent bond?", "a": "Sharing of electrons between two atoms", "t": ["Transfer of electrons from one atom to another", "Attraction between ions", "Loss of protons"], "w": "In a covalent bond, two atoms share pairs of electrons.", "src": "📘 Section 4.1", "lay": "col"}, {"q": "How many valence electrons does a carbon atom have?", "a": "4", "t": ["2", "6", "8"], "w": "Carbon is 2, 4: there are four electrons in its outer shell.", "src": "📘 Section 4.1"}, {"q": "Carbon cannot easily gain or lose four electrons. So how does it get a full outer shell?", "a": "By sharing electrons", "t": ["By gaining 4 electrons", "By losing 4 electrons", "By losing protons"], "w": "Gaining or losing four electrons is too hard, so carbon shares them.", "src": "📘 Section 4.1"}, {"q": "Different forms of the same element are called", "a": "Allotropes", "t": ["Isotopes", "Isomers", "Isobars"], "w": "Diamond, graphite and fullerene are allotropes of carbon.", "src": "📘 Section 4.1"}, {"q": "Name the three main allotropes of carbon.", "a": "Diamond, graphite and fullerene", "t": ["Diamond, coal and charcoal", "Graphite, coke and soot", "Diamond, sulphur and phosphorus"], "w": "These are the three forms of carbon given in the textbook.", "src": "📘 Section 4.1", "lay": "col"}, {"q": "Which is the hardest natural substance?", "a": "Diamond", "t": ["Graphite", "Iron", "Glass"], "w": "Diamond is the hardest natural substance known.", "src": "📘 Section 4.1"}, {"q": "Which allotrope of carbon conducts electricity?", "a": "Graphite", "t": ["Diamond", "Fullerene", "Charcoal"], "w": "Graphite is a very good conductor of electricity.", "src": "📘 Section 4.1"}, {"q": "In diamond, each carbon atom is joined to how many other carbon atoms?", "a": "Four", "t": ["Two", "Three", "Six"], "w": "Each carbon bonds to four others, making a rigid 3D structure.", "src": "📘 Section 4.1"}, {"q": "In graphite, each carbon atom is joined to how many other carbon atoms?", "a": "Three", "t": ["Two", "Four", "Six"], "w": "Each carbon bonds to three others, forming flat hexagonal layers.", "src": "📘 Section 4.1"}, {"q": "Buckminsterfullerene (C-60) has the shape of a", "a": "Football", "t": ["Cube", "Rod", "Flat sheet"], "w": "C-60 has sixty carbon atoms arranged like a football.", "src": "📘 Section 4.1"}, {"q": "How many covalent bonds does methane (CH4) have?", "a": "Four", "t": ["One", "Two", "Six"], "w": "Carbon shares one electron pair with each of the four hydrogen atoms.", "src": "📘 Section 4.1"}, {"q": "How many covalent bonds join the two atoms in a nitrogen molecule (N2)?", "a": "Three (triple bond)", "t": ["One (single bond)", "Two (double bond)", "Four"], "w": "Each nitrogen atom shares three electrons, making a triple bond.", "src": "📘 Figure 4.4"}, {"q": "Why do covalent compounds have low melting and boiling points?", "a": "Weak forces between molecules", "t": ["Strong ionic bonds", "They contain metals", "They have many ions"], "w": "Weak forces between molecules break easily on heating.", "src": "📘 Table 4.1"}, {"q": "Why are most carbon compounds poor conductors of electricity?", "a": "They do not form ions", "t": ["They are metals", "They are always liquids", "They contain water"], "w": "Electricity needs ions or free electrons, and covalent compounds have neither.", "src": "📘 Table 4.1"}];
const B1_B=[{"q": "How many electrons do two hydrogen atoms share in an H2 molecule?", "a": "Two (a single bond)", "t": ["One", "Four", "Six"], "w": "Each hydrogen atom gives one electron to the shared pair.", "src": ""}, {"q": "How many pairs of electrons do two oxygen atoms share in O2?", "a": "Two pairs (double bond)", "t": ["One pair", "Three pairs", "Four pairs"], "w": "Each oxygen needs two more electrons, so the atoms share two pairs.", "src": ""}, {"q": "Which compound in Table 4.1 has the lowest boiling point?", "a": "Methane (111 K)", "t": ["Ethanol", "Chloroform", "Acetic acid"], "w": "Methane boils at 111 K, the lowest in Table 4.1.", "src": ""}, {"q": "How much carbon is there in the earth's crust, as minerals?", "a": "Only 0.02%", "t": ["2%", "20%", "0.2%"], "w": "Carbon is only 0.02% of the earth's crust, yet it is very important.", "src": ""}, {"q": "What percentage of the atmosphere is carbon dioxide?", "a": "0.03%", "t": ["3%", "21%", "78%"], "w": "Only 0.03% of the air is carbon dioxide.", "src": ""}, {"q": "How are synthetic diamonds made?", "a": "High pressure and temperature on pure carbon", "t": ["By cooling graphite quickly", "By burning coal in air", "By mixing carbon with water"], "w": "Very high pressure and temperature turn pure carbon into small diamonds.", "src": "", "lay": "col"}];
const B2_C=[{"q": "Which two properties of carbon give us so many carbon compounds?", "a": "Tetravalency and catenation", "t": ["Malleability and ductility", "Lustre and sonority", "Isomerism and ionisation"], "w": "Four bonds per atom, and chains of carbon atoms, give countless compounds.", "src": "📘 Section 4.2"}, {"q": "What is catenation?", "a": "Carbon atoms joining into chains and rings", "t": ["Carbon losing four electrons", "Carbon reacting with oxygen", "Carbon dissolving in water"], "w": "Catenation means carbon atoms link with each other.", "src": "📘 Section 4.2", "lay": "col"}, {"q": "What is the valency of carbon?", "a": "4", "t": ["2", "1", "3"], "w": "Carbon is tetravalent: it forms four bonds.", "src": "📘 Section 4.2"}, {"q": "Compounds that have only single bonds between carbon atoms are called", "a": "Saturated compounds", "t": ["Unsaturated compounds", "Ionic compounds", "Allotropes"], "w": "Only single bonds means the compound is saturated.", "src": "📘 Section 4.2.1"}, {"q": "Compounds that have double or triple bonds between carbon atoms are called", "a": "Unsaturated compounds", "t": ["Saturated compounds", "Ionic compounds", "Allotropes"], "w": "Double or triple bonds make a compound unsaturated.", "src": "📘 Section 4.2.1"}, {"q": "Compounds made of only carbon and hydrogen are called", "a": "Hydrocarbons", "t": ["Carbohydrates", "Alcohols", "Esters"], "w": "Hydro (hydrogen) + carbon = hydrocarbon.", "src": "📘 Section 4.2.1"}, {"q": "What is the molecular formula of ethane?", "a": "C2H6", "t": ["C2H4", "C2H2", "CH4"], "w": "Ethane has only single bonds.", "src": "📘 Section 4.2.1"}, {"q": "What is the molecular formula of ethene?", "a": "C2H4", "t": ["C2H6", "C2H2", "C3H8"], "w": "Ethene has a double bond between its carbons.", "src": "📘 Section 4.2.1"}, {"q": "What is the molecular formula of ethyne?", "a": "C2H2", "t": ["C2H4", "C2H6", "CH4"], "w": "Ethyne has a triple bond between its carbons.", "src": "📘 Section 4.2.1"}, {"q": "How many covalent bonds are there in ethane, C2H6?", "a": "7", "t": ["6", "8", "9"], "w": "Six C–H bonds plus one C–C bond make 7.", "src": "📘 Section 4.2.1"}, {"q": "Which bond joins the two carbon atoms in ethene?", "a": "A double bond", "t": ["A single bond", "A triple bond", "An ionic bond"], "w": "Ethene is CH2=CH2.", "src": "📘 Section 4.2.1"}, {"q": "Which bond joins the two carbon atoms in ethyne?", "a": "A triple bond", "t": ["A single bond", "A double bond", "An ionic bond"], "w": "Ethyne has a triple bond between its two carbon atoms.", "src": "📘 Section 4.2.1"}, {"q": "Compounds with the same molecular formula but different structures are called", "a": "Structural isomers", "t": ["Allotropes", "Isotopes", "Homologues"], "w": "Same formula, but the atoms are arranged differently.", "src": "📘 Section 4.2.2"}, {"q": "How many structural isomers can pentane (C5H12) have?", "a": "Three", "t": ["Two", "Four", "Five"], "w": "The five carbons of pentane can be arranged in three ways.", "src": "📘 Section 4.2.2"}];
const B2_B=[{"q": "How many structural isomers does butane (C4H10) have?", "a": "Two", "t": ["One", "Three", "Four"], "w": "Butane can be a straight chain or a branched chain.", "src": ""}, {"q": "What is the molecular formula of benzene?", "a": "C6H6", "t": ["C6H12", "C6H14", "C5H10"], "w": "Benzene is a ring of six carbons with alternate double bonds.", "src": ""}, {"q": "What is the molecular formula of cyclohexane?", "a": "C6H12", "t": ["C6H6", "C6H14", "C5H12"], "w": "Cyclohexane is a ring of six carbons joined by single bonds.", "src": ""}, {"q": "Why does carbon form very strong bonds with other atoms?", "a": "Its small atoms hold shared electrons tightly", "t": ["It has many protons", "It is a metal", "It loses electrons easily"], "w": "Small size lets the nucleus hold the shared electrons strongly.", "src": "", "lay": "col"}, {"q": "Which of these is an unsaturated compound: C2H6, C3H8 or C2H4?", "a": "C2H4", "t": ["C2H6", "C3H8"], "w": "Ethene has a double bond, so it is unsaturated.", "src": ""}, {"q": "Carbon forms strong covalent bonds with which other elements?", "a": "Hydrogen, oxygen, nitrogen, sulphur, chlorine", "t": ["Sodium, potassium and calcium", "Only metals", "Only noble gases"], "w": "Carbon forms strong bonds with H, O, N, S and Cl.", "src": "", "lay": "col"}];
const B3_C=[{"q": "What is a homologous series?", "a": "Same functional group, each differs by CH2", "t": ["Same formula, different structures", "Different forms of one element", "Compounds with only single bonds"], "w": "Members of a homologous series differ by a –CH2– unit.", "src": "📘 Section 4.2.4", "lay": "col"}, {"q": "Neighbouring members of a homologous series differ in molecular mass by", "a": "14 u", "t": ["12 u", "16 u", "2 u"], "w": "CH2 = 12 + 2 = 14 u.", "src": "📘 Section 4.2.4"}, {"q": "What is a functional group?", "a": "Atom or group that gives a compound its properties", "t": ["The longest carbon chain", "A double bond only", "The number of hydrogen atoms"], "w": "Groups such as –OH decide how a compound behaves.", "src": "📘 Section 4.2.3", "lay": "col"}, {"q": "What is the functional group of alcohols?", "a": "–OH", "t": ["–CHO", "–COOH", "C=O"], "w": "Alcohols contain the –OH group.", "src": "📘 Table 4.3"}, {"q": "What is the functional group of aldehydes?", "a": "–CHO", "t": ["–OH", "–COOH", "C=O"], "w": "Aldehydes contain the –CHO group.", "src": "📘 Table 4.3"}, {"q": "What is the functional group of ketones?", "a": "C=O", "t": ["–OH", "–COOH", "–CHO"], "w": "In ketones, C=O sits between two carbon atoms.", "src": "📘 Table 4.3"}, {"q": "What is the functional group of carboxylic acids?", "a": "–COOH", "t": ["–OH", "–CHO", "C=O"], "w": "Carboxylic acids contain the –COOH group.", "src": "📘 Table 4.3"}, {"q": "Butanone is a four-carbon compound. Its functional group is", "a": "Ketone", "t": ["Carboxylic acid", "Aldehyde", "Alcohol"], "w": "The ending ‘-one’ means a ketone.", "src": "📘 Table 4.3"}, {"q": "What is the formula of propane?", "a": "C3H8", "t": ["C3H6", "C2H6", "C4H10"], "w": "Propane has three carbons and eight hydrogens.", "src": "📘 Table 4.2"}, {"q": "What is the formula of butane?", "a": "C4H10", "t": ["C4H8", "C3H8", "C5H12"], "w": "Butane has four carbons and ten hydrogens.", "src": "📘 Table 4.2"}, {"q": "What is the name of CH3OH?", "a": "Methanol", "t": ["Ethanol", "Methanal", "Methane"], "w": "One carbon + ‘-ol’ = methanol.", "src": "📘 Section 4.2.5"}, {"q": "What is the name of CH3CH2OH?", "a": "Ethanol", "t": ["Methanol", "Ethanal", "Ethane"], "w": "Two carbons + ‘-ol’ = ethanol.", "src": "📘 Section 4.2.5"}, {"q": "What is the name of CH3COOH?", "a": "Ethanoic acid", "t": ["Ethanol", "Methanoic acid", "Ethanal"], "w": "Two carbons + ‘-oic acid’ = ethanoic acid.", "src": "📘 Section 4.2.5"}, {"q": "How is the ketone with three carbon atoms named?", "a": "Propanone", "t": ["Propanal", "Propanol", "Propene"], "w": "Propane – ‘e’ + ‘one’ = propanone.", "src": "📘 Table 4.4"}];
const B3_B=[{"q": "What is the general formula of the alkanes?", "a": "C<sub>n</sub>H<sub>2n+2</sub>", "t": ["C<sub>n</sub>H<sub>2n</sub>", "C<sub>n</sub>H<sub>2n−2</sub>", "C<sub>n</sub>H<sub>n</sub>"], "w": "For example CH4, C2H6 and C3H8.", "src": ""}, {"q": "What is the name of CH3CHO?", "a": "Ethanal", "t": ["Ethanol", "Methanal", "Ethanoic acid"], "w": "Two carbons + ‘-al’ = ethanal.", "src": ""}, {"q": "What is the functional group in bromoethane?", "a": "Halo group (–Br)", "t": ["Hydroxyl group (–OH)", "Aldehyde group (–CHO)", "Carboxyl group (–COOH)"], "w": "‘Bromo’ tells us a bromine atom is attached.", "src": ""}, {"q": "In a homologous series, what happens as the carbon chain gets longer?", "a": "Boiling points rise; chemistry stays similar", "t": ["Chemical properties change completely", "Boiling points fall", "Nothing changes at all"], "w": "Physical properties change slowly; the functional group keeps the chemistry similar.", "src": "", "lay": "col"}];
const B4_C=[{"q": "What is formed when carbon compounds burn in air?", "a": "Carbon dioxide, water, heat and light", "t": ["Hydrogen and oxygen", "Carbon monoxide only", "Sulphur dioxide and ash"], "w": "Carbon gives CO2 and hydrogen gives H2O, with heat and light.", "src": "📘 Section 4.3.1", "lay": "col"}, {"q": "Which gas formed on burning turns lime water milky?", "a": "Carbon dioxide", "t": ["Oxygen", "Hydrogen", "Nitrogen"], "w": "Carbon dioxide turns lime water milky.", "src": "📘 Section 4.3.1"}, {"q": "Saturated hydrocarbons burn with", "a": "A clean flame", "t": ["A yellow sooty flame", "A green flame", "No flame at all"], "w": "Saturated hydrocarbons burn completely with a clean flame.", "src": "📘 Section 4.3.1"}, {"q": "Unsaturated hydrocarbons burn with", "a": "A yellow flame with black smoke", "t": ["A clean blue flame", "A green flame", "No flame at all"], "w": "Unsaturated compounds burn incompletely and give soot.", "src": "📘 Section 4.3.1"}, {"q": "The bottom of a cooking vessel gets blackened. This means", "a": "The fuel is not burning completely", "t": ["The food is not cooked", "The fuel is wet", "The fuel is burning completely"], "w": "Unburnt carbon (soot) collects on the vessel.", "src": "📘 Section 4.3.1", "lay": "col"}, {"q": "What is soot?", "a": "Unburnt carbon", "t": ["Ash of metals", "Water vapour", "Carbon dioxide"], "w": "Soot is fine carbon left when fuel does not burn fully.", "src": "📘 Section 4.3.1"}, {"q": "Substances that give oxygen to other substances are called", "a": "Oxidising agents", "t": ["Reducing agents", "Catalysts", "Indicators"], "w": "Substances that add oxygen are oxidising agents.", "src": "📘 Section 4.3.2"}, {"q": "What is formed when ethanol is oxidised?", "a": "Ethanoic acid", "t": ["Ethene", "Methanol", "Ethane"], "w": "Oxidation turns ethanol into ethanoic acid.", "src": "📘 Section 4.3.2"}, {"q": "Name two oxidising agents used for this.", "a": "Alkaline KMnO4 and acidified K2Cr2O7", "t": ["Sodium chloride and water", "Nickel and hydrogen", "Lime water and soap"], "w": "Alkaline potassium permanganate and acidified potassium dichromate add oxygen.", "src": "📘 Section 4.3.2", "lay": "col"}, {"q": "Adding hydrogen to unsaturated compounds with a nickel catalyst is called", "a": "Hydrogenation", "t": ["Oxidation", "Substitution", "Combustion"], "w": "Hydrogen adds across the double bond, with nickel as the catalyst.", "src": "📘 Section 4.3.3"}, {"q": "Hydrogenation is used to change vegetable oils into", "a": "Vegetable ghee", "t": ["Soap", "Petrol", "Vinegar"], "w": "Hydrogenated vegetable oil becomes solid vegetable ghee.", "src": "📘 Section 4.3.3"}, {"q": "Which compounds give addition reactions?", "a": "Unsaturated compounds", "t": ["Saturated compounds", "Ionic compounds", "Noble gases"], "w": "Double and triple bonds let new atoms add on.", "src": "📘 Section 4.3.3"}, {"q": "Methane reacts with chlorine in sunlight. This kind of reaction is called", "a": "A substitution reaction", "t": ["An addition reaction", "A combustion reaction", "A neutralisation reaction"], "w": "Chlorine atoms replace hydrogen atoms one by one.", "src": "📘 Section 4.3.4"}, {"q": "Which compounds give substitution reactions easily?", "a": "Saturated compounds", "t": ["Unsaturated compounds", "Metals", "Salts"], "w": "Saturated hydrocarbons give substitution reactions in sunlight.", "src": "📘 Section 4.3.4"}];
const B4_B=[{"q": "Complete: CH4 + 2O2 →", "a": "CO2 + 2H2O + heat and light", "t": ["CO + H2O", "C + 2H2O", "CO2 + H2"], "w": "Methane burns completely to carbon dioxide and water.", "src": ""}, {"q": "Complete: C2H4 + H2 (with nickel) →", "a": "C2H6", "t": ["C2H2", "CH4", "C2H5OH"], "w": "Ethene + hydrogen gives ethane.", "src": ""}, {"q": "Methane reacts with chlorine in sunlight. What forms first?", "a": "CH3Cl and HCl", "t": ["CCl4 and H2", "CH4 and Cl2", "C and HCl"], "w": "CH4 + Cl2 → CH3Cl + HCl in sunlight.", "src": ""}, {"q": "In a substitution reaction, the hydrogen atoms are replaced one by one by", "a": "Chlorine atoms", "t": ["Oxygen atoms", "Carbon atoms", "Sodium atoms"], "w": "In sunlight, chlorine takes the place of hydrogen.", "src": ""}, {"q": "Which of these is an addition reaction?", "a": "Ethene + hydrogen → ethane", "t": ["Methane + chlorine → chloromethane", "Ethanol + oxygen → ethanoic acid", "Methane + oxygen → carbon dioxide"], "w": "Two molecules join to make one: that is addition.", "src": "", "lay": "col"}, {"q": "The burning of carbon compounds is called", "a": "Combustion", "t": ["Hydrogenation", "Saponification", "Esterification"], "w": "Burning in oxygen is called combustion.", "src": ""}];
const B5_C=[{"q": "Ethanoic acid reacts with ethanol and a little concentrated sulphuric acid. This reaction is called", "a": "Esterification", "t": ["Saponification", "Hydrogenation", "Oxidation"], "w": "Acid + alcohol → ester + water.", "src": "📘 Section 4.4.2"}, {"q": "Heating an ester with sodium hydroxide gives soap. This reaction is called", "a": "Saponification", "t": ["Esterification", "Hydrogenation", "Combustion"], "w": "Ester + NaOH → alcohol + sodium salt of the acid (soap).", "src": "📘 Section 4.5"}, {"q": "What is a micelle?", "a": "Soap molecules round oil: tails in, heads out", "t": ["A single soap molecule", "A layer of oil on water", "A soap bubble full of air"], "w": "Micelles trap oily dirt in their centre.", "src": "📘 Section 4.5", "lay": "col"}, {"q": "Soaps are the sodium or potassium salts of", "a": "Long-chain carboxylic acids", "t": ["Mineral acids", "Short-chain alcohols", "Hydrocarbons"], "w": "Soaps are sodium or potassium salts of long-chain carboxylic acids.", "src": "📘 Section 4.5"}, {"q": "Which gas is given off when sodium reacts with ethanol?", "a": "Hydrogen", "t": ["Oxygen", "Carbon dioxide", "Chlorine"], "w": "Sodium + ethanol → sodium ethoxide + hydrogen.", "src": "📘 Section 4.4.1"}, {"q": "Ethanol is heated with concentrated H2SO4 at 443 K. What forms?", "a": "Ethene", "t": ["Ethane", "Ethanoic acid", "Methane"], "w": "Concentrated H2SO4 removes water from ethanol, giving ethene.", "src": "📘 Section 4.4.1"}, {"q": "Which gas is given off when ethanoic acid reacts with sodium hydrogencarbonate?", "a": "Carbon dioxide", "t": ["Hydrogen", "Oxygen", "Nitrogen"], "w": "Ethanoic acid + NaHCO3 → salt + water + CO2.", "src": "📘 Section 4.4.2"}, {"q": "Why does soap not work well in hard water?", "a": "It forms scum with calcium and magnesium salts", "t": ["It dissolves too fast", "It turns the water blue", "It makes the water boil"], "w": "Calcium and magnesium salts make soap form an insoluble scum.", "src": "📘 Section 4.5", "lay": "col"}, {"q": "Why do detergents work in hard water?", "a": "They form no insoluble solid with Ca and Mg ions", "t": ["They are more acidic", "They contain calcium", "They only kill germs"], "w": "Their charged ends do not form a precipitate with Ca and Mg ions.", "src": "📘 Section 4.5", "lay": "col"}, {"q": "Which end of a soap molecule dissolves in water?", "a": "The ionic end (head)", "t": ["The carbon chain (tail)", "Both ends", "Neither end"], "w": "The ionic end is hydrophilic: it likes water.", "src": "📘 Section 4.5"}, {"q": "Which end of a soap molecule sticks into oil?", "a": "The carbon chain (tail)", "t": ["The ionic end (head)", "Both ends", "Neither end"], "w": "The hydrocarbon tail is hydrophobic: it likes oil.", "src": "📘 Section 4.5"}, {"q": "What kind of smell do esters have?", "a": "Sweet and fruity", "t": ["Like rotten eggs", "Sharp, like vinegar", "No smell at all"], "w": "Esters are used in perfumes and flavours.", "src": "📘 Section 4.4.2"}, {"q": "A 5 to 8 percent solution of ethanoic acid in water is called", "a": "Vinegar", "t": ["Brine", "Lime water", "Glacial acetic acid"], "w": "Vinegar is 5–8% ethanoic acid in water.", "src": "📘 Section 4.4.2"}, {"q": "Pure ethanoic acid freezes in cold weather. It is then called", "a": "Glacial acetic acid", "t": ["Absolute alcohol", "Vinegar", "Denatured alcohol"], "w": "Pure ethanoic acid melts at 290 K, so it freezes in cold weather.", "src": "📘 Section 4.4.2"}, {"q": "Industrial alcohol is made unfit for drinking by adding", "a": "Methanol (and a dye)", "t": ["Sugar", "Water", "Ethanoic acid"], "w": "This is called denatured alcohol.", "src": "📘 Section 4.4.1"}, {"q": "What is the formula of ethanol?", "a": "C2H5OH", "t": ["CH3OH", "CH3COOH", "C2H6"], "w": "Ethanol is CH3CH2OH, also written C2H5OH.", "src": "📘 Section 4.4.1"}];
const B5_B=[{"q": "If a small amount of methanol is drunk, it can", "a": "Cause death", "t": ["Make you stronger", "Cure a cold", "Do nothing at all"], "w": "Methanol is very poisonous; even a little can kill.", "src": ""}, {"q": "Ethanol is a good solvent. Name some medicines made with it.", "a": "Tincture of iodine, cough syrups, tonics", "t": ["Antacids and baking soda", "Vaccines and insulin", "Lime water and vinegar"], "w": "Ethanol dissolves many medicines.", "src": "", "lay": "col"}, {"q": "Why does a soap solution look cloudy?", "a": "Micelles scatter light", "t": ["Soap is coloured", "Oil floats on top", "Soap is a gas"], "w": "Big micelles scatter light, so the solution looks cloudy.", "src": ""}, {"q": "Is ethanoic acid a strong acid or a weak acid?", "a": "A weak acid", "t": ["A strong acid", "Not an acid", "A base"], "w": "Ethanoic acid ionises only a little in water.", "src": ""}, {"q": "What do you see when soap is added to hard water?", "a": "Little foam and a white curdy solid", "t": ["Lots of foam", "The water turns blue", "Nothing at all"], "w": "Hard water salts react with soap to form scum.", "src": ""}, {"q": "Why do we agitate clothes when washing them with soap?", "a": "It helps micelles pull the dirt out", "t": ["It dries the clothes", "It kills germs", "It makes the soap smell nice"], "w": "Beating or scrubbing helps the micelles lift the dirt out.", "src": ""}];
const noScene=()=>false;

/* ===== Game 1: Hydrocarbon Hunt (alkane / alkene / alkyne, saturated / unsaturated, names and formulas) ===== */
const HCq=(f)=>["🔎",f];
const HC_C=[
 {q:"What is the name of this hydrocarbon?",card:HCq("C4H10"),a:"Butane",t:["Butene","Butyne","Propane"],w:"Four carbons and only single bonds: butane.",src:"📘 Table 4.2"},
 {q:"What is the formula of butene?",a:"C4H8",t:["C4H10","C4H6","C3H6"],w:"Butene is an alkene with four carbons: C4H8.",src:"📘 Section 4.2.1"},
 {q:"Is this an alkane, an alkene or an alkyne?",card:HCq("C2H4"),a:"Alkene",t:["Alkane","Alkyne"],lay:"three",w:"C2H4 has a double bond, so it is an alkene.",src:"📘 Section 4.2.1"},
 {q:"Is this compound saturated or unsaturated?",card:HCq("C2H4"),a:"Unsaturated",t:["Saturated"],lay:"two",w:"A double bond makes it unsaturated.",src:"📘 Section 4.2.1"},
 {q:"Is this an alkane, an alkene or an alkyne?",card:HCq("C3H8"),a:"Alkane",t:["Alkene","Alkyne"],lay:"three",w:"C3H8 has only single bonds, so it is an alkane.",src:"📘 Section 4.2.1"},
 {q:"Is this compound saturated or unsaturated?",card:HCq("C3H8"),a:"Saturated",t:["Unsaturated"],lay:"two",w:"Only single bonds, so it is saturated.",src:"📘 Section 4.2.1"},
 {q:"Is this an alkane, an alkene or an alkyne?",card:HCq("C2H2"),a:"Alkyne",t:["Alkane","Alkene"],lay:"three",w:"C2H2 has a triple bond, so it is an alkyne.",src:"📘 Section 4.2.1"},
 {q:"What is the name of this hydrocarbon?",card:HCq("C3H6"),a:"Propene",t:["Propane","Propyne","Ethene"],w:"Three carbons and one double bond: propene.",src:"📘 Section 4.2.1"},
 {q:"What is the name of this hydrocarbon?",card:HCq("C2H6"),a:"Ethane",t:["Ethene","Ethyne","Methane"],w:"Two carbons and only single bonds: ethane.",src:"📘 Table 4.2"},
 {q:"What is the formula of propane?",a:"C3H8",t:["C3H6","C3H4","C2H6"],w:"Propane is an alkane with three carbons: C3H8.",src:"📘 Table 4.2"},
 {q:"What is the formula of ethyne?",a:"C2H2",t:["C2H4","C2H6","CH4"],w:"Ethyne has a triple bond: C2H2.",src:"📘 Section 4.2.1"},
 {q:"Which of these is saturated?",a:"C2H6",t:["C2H4","C2H2","C3H6"],w:"Ethane has only single bonds.",src:"📘 Section 4.2.1"},
 {q:"Which of these is unsaturated?",a:"C3H6",t:["CH4","C2H6","C3H8"],w:"Propene has a double bond.",src:"📘 Section 4.2.1"},
 {q:"Is this an alkane, an alkene or an alkyne?",card:HCq("C4H6"),a:"Alkyne",t:["Alkane","Alkene"],lay:"three",w:"C4H6 is butyne, which has a triple bond.",src:"📘 Section 4.2.1"},
 {q:"What is the name of this hydrocarbon?",card:HCq("C5H12"),a:"Pentane",t:["Pentene","Butane","Hexane"],w:"Five carbons and only single bonds: pentane.",src:"📘 Table 4.2"},
 {q:"What is the formula of methane?",a:"CH4",t:["C2H6","C2H4","CO2"],w:"Methane has one carbon and four hydrogens.",src:"📘 Table 4.2"}
];
const HC_B=[
 {q:"What is the general formula of the alkanes?",a:"C<sub>n</sub>H<sub>2n+2</sub>",t:["C<sub>n</sub>H<sub>2n</sub>","C<sub>n</sub>H<sub>2n−2</sub>"],lay:"three",w:"Example: propane C3H8 (n = 3)."},
 {q:"What is the general formula of the alkenes?",a:"C<sub>n</sub>H<sub>2n</sub>",t:["C<sub>n</sub>H<sub>2n+2</sub>","C<sub>n</sub>H<sub>2n−2</sub>"],lay:"three",w:"Example: ethene C2H4 (n = 2)."},
 {q:"What is the general formula of the alkynes?",a:"C<sub>n</sub>H<sub>2n−2</sub>",t:["C<sub>n</sub>H<sub>2n+2</sub>","C<sub>n</sub>H<sub>2n</sub>"],lay:"three",w:"Example: ethyne C2H2 (n = 2)."},
 {q:"Be careful! What is this compound called?",card:HCq("C4H8"),a:"Butene",t:["Butane","Butyne","Propene"],w:"Butane is C4H10. C4H8 has a double bond, so it is butene."}
];

/* ===== Game 2: Functional Groups — drag each chip into its box (tap-tap also works) ===== */
const FG_BOARDS=[
 {src:"📘 Table 4.3 · Board 1 of 2",q:"Drag each functional group into the box next to its name.",
  pairs:[["Alcohol","–OH"],["Aldehyde","–CHO"],["Ketone",">C=O"],["Carboxylic acid","–COOH"],["Ester","–COO–"],["Amine","–NH2"],["Halo group","–Cl, –Br"]]},
 {src:"⭐ Bonus board",q:"Drag each class name to the compound it belongs to.",
  pairs:[["CH3CH2OH","Alcohol"],["CH3CHO","Aldehyde"],["CH3COCH3","Ketone"],["CH3COOH","Carboxylic acid"],["CH3COOCH2CH3","Ester"],["CH3NH2","Amine"],["CH3CH2Cl","Halo group"]]}
];
const HX=s=>F(String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"));
function makeMatch(id,BOARDS){
  const sec=$(id);
  sec.innerHTML=`<div class="tag"></div><p class="q"></p><div class="mboard"><div class="mrows"></div><div class="tray"></div></div><div class="foot"><div class="msg"></div><button class="next" hidden>Next board ▸</button></div>`;
  const qs=s=>sec.querySelector(s);
  const UI={tag:qs(".tag"),q:qs(".q"),rows:qs(".mrows"),tray:qs(".tray"),msg:qs(".msg"),next:qs(".next")};
  let bi=0,placed=0,sel=null,autoT=null,B=null;
  const say=(t,cls)=>{UI.msg.className="msg"+(cls?" "+cls:"");UI.msg.innerHTML=t;};
  function load(){
    clearTimeout(autoT);UI.next.hidden=true;UI.next.classList.remove("cd");
    B=BOARDS[bi%BOARDS.length];placed=0;sel=null;
    UI.tag.textContent=B.src;UI.tag.classList.toggle("think",B.src.startsWith("⭐"));
    UI.q.textContent=B.q;
    UI.rows.innerHTML=B.pairs.map((p,i)=>`<div class="mrow"><span class="nm">${HX(p[0])}</span><button class="drop" type="button" data-i="${i}" aria-label="Box for ${p[0].replace(/"/g,"")}">?</button></div>`).join("");
    UI.tray.innerHTML=shuffle(B.pairs.map((p,i)=>i)).map(i=>`<button class="chip" type="button" data-i="${i}">${HX(B.pairs[i][1])}</button>`).join("");
    say("Drag a chip into its box. You can also tap a chip, then tap a box.");
    wire();
  }
  function boxAt(x,y){
    return [...UI.rows.querySelectorAll(".drop:not(.ok)")].find(d=>{const r=d.getBoundingClientRect();return x>=r.left-6&&x<=r.right+6&&y>=r.top-6&&y<=r.bottom+6;});
  }
  function hot(box){UI.rows.querySelectorAll(".drop.hot").forEach(d=>{if(d!==box)d.classList.remove("hot");});if(box)box.classList.add("hot");}
  function back(chip){chip.classList.add("back");chip.style.transform="";setTimeout(()=>chip.classList.remove("back","drag"),320);}
  function choose(chip){
    if(sel===chip){chip.classList.remove("sel");sel=null;return;}
    if(sel)sel.classList.remove("sel");sel=chip;chip.classList.add("sel");
    say("Now tap the box where it belongs.");
  }
  function place(chip,box){
    hot(null);
    if(chip.dataset.i===box.dataset.i){
      chip.classList.remove("sel","drag","back");chip.style.transform="";chip.disabled=true;
      box.textContent="";box.appendChild(chip);box.classList.add("ok");box.disabled=true;
      if(sel===chip)sel=null;placed++;mark(true);
      const p=B.pairs[+chip.dataset.i];
      say(`✔ Correct. <b>${HX(p[0])}</b> → <b>${HX(p[1])}</b>`,"ok");
      if(placed===B.pairs.length)finish();
    }else{
      back(chip);chip.classList.remove("sel");if(sel===chip)sel=null;
      box.classList.add("bad");setTimeout(()=>box.classList.remove("bad"),450);
      mark(false);say("✘ Not that box. Try again.","bad");
    }
  }
  function finish(){
    say(`🎉 All ${B.pairs.length} matched! Well done.`,"ok");
    UI.next.hidden=false;const ms=3000;
    UI.next.style.setProperty("--t",ms+"ms");UI.next.classList.remove("cd");void UI.next.offsetWidth;UI.next.classList.add("cd");
    const mine=bi;
    const tick=()=>{if(bi!==mine)return;if(!document.hidden&&sec.offsetParent!==null){bi++;load();}else autoT=setTimeout(tick,800);};
    clearTimeout(autoT);autoT=setTimeout(tick,ms);
  }
  function wire(){
    UI.tray.querySelectorAll(".chip").forEach(chip=>{
      let st=null,moved=false;
      chip.addEventListener("pointerdown",e=>{if(chip.disabled)return;st={x:e.clientX,y:e.clientY};moved=false;try{chip.setPointerCapture(e.pointerId);}catch(_){}});
      chip.addEventListener("pointermove",e=>{if(!st)return;const dx=e.clientX-st.x,dy=e.clientY-st.y;
        if(!moved&&Math.hypot(dx,dy)>6){moved=true;chip.classList.add("drag");if(sel&&sel!==chip){sel.classList.remove("sel");sel=null;}}
        if(moved){chip.style.transform=`translate(${dx}px,${dy}px)`;hot(boxAt(e.clientX,e.clientY));}});
      const up=e=>{if(!st)return;const wasMoved=moved;st=null;moved=false;
        if(wasMoved){const box=boxAt(e.clientX,e.clientY);if(box)place(chip,box);else{hot(null);back(chip);}}
        else choose(chip);};
      chip.addEventListener("pointerup",up);
      chip.addEventListener("pointercancel",()=>{st=null;moved=false;hot(null);back(chip);});
      chip.addEventListener("click",e=>{if(e.detail===0&&!chip.disabled)choose(chip);});
    });
    UI.rows.querySelectorAll(".drop").forEach(box=>box.addEventListener("click",()=>{if(sel&&!box.disabled)place(sel,box);else if(!box.disabled)say("Pick a chip first, then tap this box.");}));
  }
  UI.next.onclick=()=>{bi++;load();};
  load();
  return {load,get placed(){return placed;},get board(){return bi;}};
}

/* ===== Lakshyam Handbook exam questions (added after the textbook questions in each game) ===== */
const EXQ="📝 Exam question";
HC_C.push(
 {q:"What is the formula of pentene?",a:"C5H10",t:["C5H12","C5H8","C4H8"],w:"Pentene is an alkene (CnH2n) with five carbons.",src:EXQ},
 {q:"What is the name of this hydrocarbon?",card:HCq("C3H4"),a:"Propyne",t:["Propene","Propane","Ethyne"],w:"Three carbons and a triple bond: propyne.",src:EXQ},
 {q:"What is the name of this hydrocarbon?",card:HCq("C6H14"),a:"Hexane",t:["Hexene","Hexyne","Pentane"],w:"Six carbons, only single bonds (CnH2n+2): hexane.",src:EXQ},
 {q:"What is the formula of hexene?",a:"C6H12",t:["C6H14","C6H10","C5H10"],w:"Hexene is an alkene (CnH2n) with six carbons.",src:EXQ},
 {q:"What is the name of this hydrocarbon?",card:HCq("C5H8"),a:"Pentyne",t:["Pentene","Pentane","Butyne"],w:"Five carbons and a triple bond (CnH2n−2): pentyne.",src:EXQ},
 {q:"What is the name of this hydrocarbon?",card:HCq("C6H10"),a:"Hexyne",t:["Hexene","Hexane","Pentyne"],w:"Six carbons and a triple bond: hexyne.",src:EXQ},
 {q:"A hydrocarbon has four carbon atoms and six hydrogen atoms. What is its name?",a:"Butyne",t:["Butene","Butane","Propyne"],w:"C4H6 fits CnH2n−2, so it is butyne.",src:EXQ},
 {q:"Which of these hydrocarbons undergoes an addition reaction?",a:"C3H6",t:["C2H6","C3H8","CH4"],w:"C3H6 (propene) has a double bond, so atoms can add on.",src:EXQ},
 {q:"Which of these undergoes a substitution reaction?",a:"CH4",t:["C3H6","C2H2","C2H4"],w:"Methane is saturated, so it gives substitution reactions.",src:EXQ},
 {q:"C5H10 belongs to a series. What is the formula of its first member?",a:"C2H4",t:["CH4","C2H2","C3H6"],w:"C5H10 is an alkene; the first alkene is ethene, C2H4.",src:EXQ},
 {q:"Which pair belongs to the same homologous series?",a:"C2H6 and C3H8",t:["CH4 and C2H4","C2H2 and C3H8","CH3OH and HCHO"],w:"Both are alkanes and differ by CH2.",lay:"col",src:EXQ},
 {q:"How many hydrogen atoms are there in butane?",a:"10",t:["8","6","4"],w:"Butane is C4H10.",src:EXQ}
);
HC_B.push(
 {q:"How can we test whether a carbon compound is unsaturated?",a:"It decolourises bromine water",t:["It turns lime water milky","It turns blue litmus red","It gives hydrogen with sodium"],w:"Bromine adds across double or triple bonds, so its colour disappears.",lay:"col"},
 {q:"What is the general formula of the alkyl group?",a:"C<sub>n</sub>H<sub>2n+1</sub>",t:["C<sub>n</sub>H<sub>2n+2</sub>","C<sub>n</sub>H<sub>2n</sub>","C<sub>n</sub>H<sub>2n−2</sub>"],w:"An alkyl group is an alkane with one hydrogen removed, like CH3–.",lay:"two"},
 {q:"What is the alkane with eight carbon atoms?",a:"Octane, C8H18",t:["Octene, C8H16","Heptane, C7H16","Octyne, C8H14"],w:"CnH2n+2 with n = 8 gives C8H18.",lay:"two"}
);
FG_BOARDS[0].src="📘 Table 4.3 · Board 1 of 3";
FG_BOARDS[1].src="⭐ Bonus board · 3 of 3";
FG_BOARDS.splice(1,0,{src:"📝 Exam table · Board 2 of 3",q:"Drag each name ending (suffix) into the box next to its family.",
  pairs:[["Alcohol","-ol"],["Aldehyde","-al"],["Ketone","-one"],["Carboxylic acid","-oic acid"],["Alkane","-ane"],["Alkene","-ene"],["Alkyne","-yne"]]});
B1_C.push(
 {q:"How many covalent bonds are there in CH3Cl?",a:"Four",t:["Three","Five","Two"],w:"Three C–H bonds and one C–Cl bond.",src:EXQ},
 {q:"Which of these is not an allotrope of carbon?",a:"Methane",t:["Diamond","Graphite","Fullerene"],w:"Methane is a compound of carbon and hydrogen, not a form of carbon.",src:EXQ}
);
B2_C.push(
 {q:"Name the two structural isomers of C4H10.",a:"n-Butane and isobutane",t:["Butane and butene","Propane and butane","Ethane and ethene"],w:"Straight chain: n-butane; branched: isobutane (2-methylpropane).",lay:"col",src:EXQ}
);
B3_C.push(
 {q:"What is the formula of methanoic acid?",a:"HCOOH",t:["CH3COOH","HCHO","CH3OH"],w:"One carbon with the –COOH group: HCOOH.",src:EXQ},
 {q:"Which suffix is used for a carboxylic acid?",a:"-oic acid",t:["-ol","-al","-one"],w:"Example: ethanoic acid, CH3COOH.",src:EXQ}
);
B3_B.push(
 {q:"What is the IUPAC name of CH3–O–CH3?",a:"Methoxymethane",t:["Methanol","Ethanol","Methanal"],w:"An oxygen between two methyl groups: methoxymethane."}
);
B4_C.push(
 {q:"How can ethene be converted into ethane?",a:"By hydrogenation",t:["By oxidation","By combustion","By substitution"],w:"Adding hydrogen with a nickel catalyst turns ethene into ethane.",src:EXQ},
 {q:"Why is changing ethanol to ethanoic acid called oxidation?",a:"Ethanol gains oxygen",t:["Ethanol loses oxygen","Ethanol gains hydrogen","Ethanol burns"],w:"Gaining oxygen is oxidation.",src:EXQ}
);
B5_C.push(
 {q:"100% pure ethanol is called",a:"Absolute alcohol",t:["Rectified spirit","Denatured alcohol","Power alcohol"],w:"Pure ethanol with no water is absolute alcohol.",src:EXQ},
 {q:"What is the common name of ethanoic acid?",a:"Acetic acid",t:["Citric acid","Lactic acid","Formic acid"],w:"Ethanoic acid is commonly called acetic acid.",src:EXQ},
 {q:"Which one gives brisk effervescence with sodium hydrogencarbonate?",a:"Ethanoic acid",t:["Ethanol","Methane","Ethene"],w:"Ethanoic acid is acidic, so it gives CO2 with NaHCO3; ethanol does not.",src:EXQ}
);

/* ===== Lab pictures for the opening questions (draw into a 640 x 240 scene) ===== */
const PX=(()=>{
  const INK="var(--ink)",GL="#7C93A6";
  const T=(svg,x,y,s,cls,extra)=>{const t=el("text",Object.assign({x,y,class:"pt "+(cls||"")},extra||{}),svg);
    String(s).split(/(?<=[A-Za-z\)])(\d+)/).forEach((p,i)=>{if(!p)return;
      if(i%2===1)el("tspan",{"baseline-shift":"sub","font-size":"70%"},t,p);else el("tspan",{},t,p);});return t;};
  const line=(svg,x1,y1,x2,y2,w,c)=>el("line",{x1,y1,x2,y2,stroke:c||INK,"stroke-width":w||4,"stroke-linecap":"round"},svg);
  /* molecule: atoms [{x,y,s,hl}], bonds [[i,j,n]] */
  function mol(svg,atoms,bonds){
    bonds.forEach(([i,j,n])=>{const a=atoms[i],b=atoms[j],dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,px=-uy,py=ux,r=20;
      const offs=n===1?[0]:n===2?[-5,5]:[-8,0,8];
      offs.forEach(o=>line(svg,a.x+ux*r+px*o,a.y+uy*r+py*o,b.x-ux*r+px*o,b.y-uy*r+py*o,3.5));});
    atoms.forEach(a=>{if(a.hl)el("rect",{x:a.x-24,y:a.y-24,width:48,height:48,rx:12,fill:"#FDE68A",stroke:"#D97706","stroke-width":3},svg);
      T(svg,a.x,a.y+10,a.s,"big");});
  }
  function tube(svg,x,y,h,fill,label){
    el("path",{d:`M${x-20} ${y} v${h} a20 20 0 0 0 40 0 V${y}`,fill:"rgba(255,255,255,.35)",stroke:GL,"stroke-width":4},svg);
    if(fill)el("path",{d:`M${x-16} ${y+h*0.45} V${y+h} a16 16 0 0 0 32 0 V${y+h*0.45} Z`,fill},svg);
    if(label)T(svg,x,Math.min(y+h+46,232),label,"small");
  }
  function arrow(svg,x1,x2,y,label){line(svg,x1,y,x2-10,y,4);el("path",{d:`M${x2} ${y} l-14 -9 v18 Z`,fill:INK},svg);if(label)T(svg,(x1+x2)/2,y-14,label,"small");}
  function bubbles(svg,x,y,n,spread,col){for(let i=0;i<n;i++)el("circle",{cx:x+(Math.random()-.5)*spread,cy:y-Math.random()*40,r:3+Math.random()*3,fill:col||"#fff",stroke:GL,"stroke-width":1.2},svg);}
  const P={
    ethyne(svg){mol(svg,[{x:130,y:120,s:"H"},{x:255,y:120,s:"C"},{x:385,y:120,s:"C"},{x:510,y:120,s:"H"}],[[0,1,1],[1,2,3],[2,3,1]]);},
    ethene(svg){mol(svg,[{x:260,y:120,s:"C"},{x:380,y:120,s:"C"},{x:185,y:62,s:"H"},{x:185,y:178,s:"H"},{x:455,y:62,s:"H"},{x:455,y:178,s:"H"}],[[0,1,2],[0,2,1],[0,3,1],[1,4,1],[1,5,1]]);},
    ethanolOH(svg){mol(svg,[{x:170,y:120,s:"C"},{x:300,y:120,s:"C"},{x:430,y:120,s:"O",hl:1},{x:540,y:120,s:"H",hl:1},
      {x:170,y:40,s:"H"},{x:170,y:200,s:"H"},{x:70,y:120,s:"H"},{x:300,y:40,s:"H"},{x:300,y:200,s:"H"}],
      [[0,1,1],[1,2,1],[2,3,1],[0,4,1],[0,5,1],[0,6,1],[1,7,1],[1,8,1]]);},
    isomers(svg){
      T(svg,160,30,"A","mid");T(svg,480,30,"B","mid");
      mol(svg,[{x:55,y:130,s:"C"},{x:125,y:130,s:"C"},{x:195,y:130,s:"C"},{x:265,y:130,s:"C"}],[[0,1,1],[1,2,1],[2,3,1]]);
      mol(svg,[{x:400,y:150,s:"C"},{x:480,y:150,s:"C"},{x:560,y:150,s:"C"},{x:480,y:75,s:"C"}],[[0,1,1],[1,2,1],[1,3,1]]);
      T(svg,160,210,"C4H10","small");T(svg,480,210,"C4H10","small");},
    benzene(svg){const cx=320,cy=120,R=82,pts=[];for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;pts.push([cx+R*Math.cos(a),cy+R*Math.sin(a)]);}
      for(let k=0;k<6;k++){const [x1,y1]=pts[k],[x2,y2]=pts[(k+1)%6];line(svg,x1,y1,x2,y2,4);
        if(k%2===0){const ix=cx+(x1-cx)*.78,iy=cy+(y1-cy)*.78,jx=cx+(x2-cx)*.78,jy=cy+(y2-cy)*.78;line(svg,ix,iy,jx,jy,4);}}
      pts.forEach(([x,y])=>{el("circle",{cx:x,cy:y,r:15,fill:"var(--panel)",stroke:INK,"stroke-width":2.5},svg);T(svg,x,y+6,"C","small");});
      T(svg,520,125,"6 carbons in a ring","small");},
    ladder(svg){const xs=[110,320,530],f=["CH4","C2H6","C3H8"];
      xs.forEach((x,i)=>{el("rect",{x:x-70,y:90,width:140,height:64,rx:14,fill:"var(--panel)",stroke:INK,"stroke-width":3},svg);T(svg,x,132,f[i],"big");});
      arrow(svg,182,248,122,"+ ?");arrow(svg,392,458,122,"+ ?");T(svg,320,210,"Methane → Ethane → Propane","small");},
    graphite(svg){for(let L=0;L<3;L++){const y0=55+L*62,off=(L%2)*26;
        for(let k=0;k<6;k++){const cx=110+off+k*78,cy=y0;const pts=[];for(let j=0;j<6;j++){const a=j*Math.PI/3;pts.push((cx+24*Math.cos(a)).toFixed(1)+","+(cy+12*Math.sin(a)).toFixed(1));}
          el("polygon",{points:pts.join(" "),fill:"none",stroke:INK,"stroke-width":2.5},svg);
          if(k<5)line(svg,cx+24,cy,cx+54,cy,2.5);}
        if(L<2)for(let k=0;k<6;k+=2)line(svg,110+off+k*78,y0+14,110+off+k*78,y0+48,1.5,GL);}
      T(svg,320,232,"Flat layers of carbon atoms","small");},
    methaneDot(svg){const cx=320,cy=120;
      [[0,-72],[0,72],[-92,0],[92,0]].forEach(([dx,dy])=>el("circle",{cx:cx+dx,cy:cy+dy,r:34,fill:"#DBEAFE",stroke:"#2563EB","stroke-width":2.5},svg));
      el("circle",{cx,cy,r:50,fill:"#FCE7F3",stroke:"#DB2777","stroke-width":2.5,opacity:.95},svg);T(svg,cx,cy+10,"C","big");
      [[0,-72],[0,72],[-92,0],[92,0]].forEach(([dx,dy])=>{T(svg,cx+dx*1.12,cy+dy*1.12+8,"H","mid");
        const mx=cx+dx*.58,my=cy+dy*.58,px=dy?7:0,py=dx?7:0;
        el("circle",{cx:mx-px,cy:my-py,r:4.5,fill:INK},svg);T(svg,mx+px,my+py+5,"×","small");});},
    c60(svg){const cx=320,cy=118,R=92;el("circle",{cx,cy,r:R,fill:"#F1F5F9",stroke:INK,"stroke-width":3},svg);
      const poly=(x,y,r,n,rot)=>{const p=[];for(let j=0;j<n;j++){const a=rot+j*2*Math.PI/n;p.push((x+r*Math.cos(a)).toFixed(1)+","+(y+r*Math.sin(a)).toFixed(1));}el("polygon",{points:p.join(" "),fill:n===5?"#CBD5E1":"none",stroke:INK,"stroke-width":2.2},svg);};
      poly(cx,cy,26,5,-Math.PI/2);for(let k=0;k<5;k++){const a=-Math.PI/2+k*2*Math.PI/5;poly(cx+52*Math.cos(a),cy+52*Math.sin(a),20,6,a);}
      for(let k=0;k<5;k++){const a=-Math.PI/2+Math.PI/5+k*2*Math.PI/5;poly(cx+78*Math.cos(a),cy+78*Math.sin(a),12,5,a);}
      T(svg,520,125,"60 carbon atoms","small");},
    flames(svg){[[180,"A"],[460,"B"]].forEach(([x,l],i)=>{el("rect",{x:x-22,y:180,width:44,height:40,rx:6,fill:"#475569"},svg);
        if(i===0){el("path",{d:`M${x} 92 C${x+26} 132 ${x+20} 176 ${x} 178 C${x-20} 176 ${x-26} 132 ${x} 92Z`,fill:"#60A5FA"},svg);
          el("path",{d:`M${x} 122 C${x+12} 145 ${x+9} 172 ${x} 174 C${x-9} 172 ${x-12} 145 ${x} 122Z`,fill:"#DBEAFE"},svg);}
        else{el("path",{d:`M${x} 70 C${x+34} 120 ${x+28} 176 ${x} 178 C${x-28} 176 ${x-34} 120 ${x} 70Z`,fill:"#FB923C"},svg);
          el("path",{d:`M${x} 104 C${x+18} 140 ${x+14} 172 ${x} 174 C${x-14} 172 ${x-18} 140 ${x} 104Z`,fill:"#FDE047"},svg);
          [[-14,52,13],[10,38,16],[-4,20,18]].forEach(([dx,y,r])=>el("circle",{cx:x+dx,cy:y,r,fill:"#334155",opacity:.75},svg));
          el("rect",{x:x-70,y:6,width:140,height:10,rx:3,fill:"#94A3B8"},svg);el("rect",{x:x-40,y:14,width:80,height:5,fill:"#111827"},svg);}
        T(svg,x,238,"Flame "+l,"mid");});},
    kmno4(svg){tube(svg,190,40,150,"#7E22CE","Ethanol + KMnO₄ drop");el("circle",{cx:190,cy:22,r:8,fill:"#7E22CE"},svg);
      arrow(svg,260,380,115,"warm, shake");tube(svg,450,40,150,"#F1F5F9","A few seconds later");},
    hydrogenation(svg){el("rect",{x:70,y:70,width:110,height:130,rx:16,fill:"#FDE68A",stroke:GL,"stroke-width":4},svg);el("rect",{x:105,y:48,width:40,height:26,rx:5,fill:GL},svg);T(svg,125,145,"Oil","mid");
      arrow(svg,210,420,130,"+ H₂, nickel");el("rect",{x:450,y:100,width:130,height:100,rx:10,fill:"#FEF3C7",stroke:"#D97706","stroke-width":4},svg);T(svg,515,158,"Ghee","mid");},
    bromine(svg){tube(svg,170,40,150,"#C2410C","Bromine water");arrow(svg,240,390,115,"bubble a gas");tube(svg,460,40,150,"#F8FAFC","Colourless!");bubbles(svg,460,175,6,16);},
    micelle(svg){const cx=320,cy=120;el("circle",{cx,cy,r:48,fill:"#FCD34D"},svg);T(svg,cx,cy+6,"Oil","small");
      for(let k=0;k<12;k++){const a=k*Math.PI/6,hx=cx+96*Math.cos(a),hy=cy+96*Math.sin(a);
        const pts=[];for(let j=0;j<=6;j++){const r=88-j*9,o=(j%2?6:-6);pts.push((cx+r*Math.cos(a)-o*Math.sin(a)).toFixed(1)+","+(cy+r*Math.sin(a)+o*Math.cos(a)).toFixed(1));}
        el("polyline",{points:pts.join(" "),fill:"none",stroke:"#475569","stroke-width":3.5,"stroke-linejoin":"round"},svg);
        el("circle",{cx:hx,cy:hy,r:10,fill:"#2563EB",stroke:"#fff","stroke-width":2},svg);}},
    hardwater(svg){[[200,"A"],[440,"B"]].forEach(([x,l],i)=>{tube(svg,x,30,160,i?"#E2E8F0":"#BAE6FD","Tube "+l);
        if(i===0)for(let k=0;k<26;k++)el("circle",{cx:x-14+Math.random()*28,cy:40+Math.random()*58,r:4+Math.random()*4,fill:"#fff",stroke:GL,"stroke-width":1.2},svg);
        else{for(let k=0;k<14;k++)el("ellipse",{cx:x-12+Math.random()*24,cy:112+Math.random()*16,rx:6,ry:3.5,fill:"#F8FAFC",stroke:"#94A3B8"},svg);
          for(let k=0;k<3;k++)el("circle",{cx:x-8+k*8,cy:104,r:3.5,fill:"#fff",stroke:GL},svg);}});},
    limewater(svg){tube(svg,170,60,140,"#BFDBFE","Na₂CO₃ + ethanoic acid");bubbles(svg,170,190,10,20);
      el("path",{d:"M170 52 V30 H450 V170",fill:"none",stroke:GL,"stroke-width":7,"stroke-linejoin":"round"},svg);
      tube(svg,450,60,140,"#CBD2DB","Lime water");bubbles(svg,450,185,5,6);T(svg,540,150,"milky!","mid");}
  };
  const crop=svg=>{if(svg.dataset.pic!=="1")return;try{const b=svg.getBBox();if(b.width<10)return;const p=12;
      svg.setAttribute("viewBox",`${(b.x-p).toFixed(1)} ${(b.y-p).toFixed(1)} ${(b.width+2*p).toFixed(1)} ${(b.height+2*p).toFixed(1)}`);}catch(e){}};
  const seen=new WeakSet();
  return {draw:(it,svg)=>{
    if(!it.pic||!P[it.pic]){svg.dataset.pic="0";return false;}
    svg.setAttribute("viewBox","0 0 640 240");P[it.pic](svg);svg.dataset.pic="1";crop(svg);
    if(!seen.has(svg)&&window.ResizeObserver){seen.add(svg);new ResizeObserver(()=>crop(svg)).observe(svg);}
    return true;}};
})();
const drawPic=(it,svg,S)=>PX.draw(it,svg);

/* ===== Lesson 4 final set: 100 questions = lab pictures first, then exam questions, then textbook, then bonus ===== */
const LP="🔬 Lab picture";
const pk=(arr,idx,src)=>idx.map(i=>src?Object.assign({},arr[i],{src}):arr[i]);
const PIC={
 hc:[{pic:"ethyne",q:"Look at this structure. What is the compound?",a:"Ethyne",t:["Ethene","Ethane","Methane"],w:"A triple bond between two carbons: ethyne, C2H2.",src:LP},
     {pic:"ethene",q:"Is this compound an alkane, an alkene or an alkyne?",a:"Alkene",t:["Alkane","Alkyne"],lay:"three",w:"It has a C=C double bond, so it is an alkene (ethene).",src:LP},
     {pic:"bromine",q:"A gas turns orange bromine water colourless. The gas is",a:"Unsaturated (like ethene)",t:["Saturated (like methane)"],lay:"two",w:"Bromine adds across a double or triple bond, so its colour disappears.",src:LP}],
 pr:[{pic:"graphite",q:"Flat layers of carbon atoms. Which allotrope is this?",a:"Graphite",t:["Diamond","Fullerene","Coal"],w:"Graphite has layers of hexagons, and it conducts electricity.",src:LP},
     {pic:"methaneDot",q:"This is methane. How many electron pairs does carbon share?",a:"Four",t:["Two","One","Three"],w:"Carbon shares one pair with each of the four hydrogens.",src:LP},
     {pic:"c60",q:"This football-shaped ball has 60 carbon atoms. It is",a:"Fullerene",t:["Graphite","Diamond","Methane"],w:"C-60 is Buckminsterfullerene.",src:LP}],
 ox:[{pic:"benzene",q:"A ring of 6 carbons with alternate double bonds. This is",a:"Benzene",t:["Cyclohexane","Hexane","Hexene"],w:"Benzene, C6H6, has alternate single and double bonds in its ring.",src:LP},
     {pic:"isomers",q:"A and B are both C4H10. They are called",a:"Structural isomers",t:["Allotropes","Homologues","Isotopes"],w:"Same formula, different arrangement: n-butane and isobutane.",src:LP}],
 rv:[{pic:"ethanolOH",q:"Which functional group is highlighted in this molecule?",a:"Alcohol (–OH)",t:["Aldehyde (–CHO)","Ketone (C=O)","Carboxylic acid (–COOH)"],w:"The –OH group makes this an alcohol: ethanol.",src:LP},
     {pic:"ladder",q:"What is added each time to get the next member?",a:"CH2",t:["CH3","CH4","C2H2"],w:"Members of a homologous series differ by CH2.",src:LP}],
 ib:[{pic:"flames",q:"Which flame comes from an unsaturated fuel?",a:"Flame B (yellow and sooty)",t:["Flame A (clean and blue)"],lay:"two",w:"Unsaturated compounds burn with a yellow, sooty flame.",src:LP},
     {pic:"kmno4",q:"Purple KMnO₄ is added to warm ethanol. What happens to the colour?",a:"It disappears",t:["It turns green","It gets darker","It turns red"],w:"KMnO4 gives oxygen to ethanol and is used up.",src:LP},
     {pic:"hydrogenation",q:"Oil turns into solid ghee with hydrogen and nickel. This is called",a:"Hydrogenation",t:["Oxidation","Substitution","Combustion"],w:"Hydrogen adds to the unsaturated oil.",src:LP}],
 ex:[{pic:"micelle",q:"What is this cluster of soap molecules around oil called?",a:"A micelle",t:["An ester","An isomer","A polymer"],w:"Tails go into the oil and the ionic heads face the water.",src:LP},
     {pic:"hardwater",q:"Soap is shaken in two tubes. Which tube has hard water?",a:"Tube B",t:["Tube A"],lay:"two",w:"Hard water gives very little foam and a white curdy scum.",src:LP},
     {pic:"limewater",q:"Ethanoic acid is added to sodium carbonate. The gas turns lime water milky. It is",a:"Carbon dioxide",t:["Hydrogen","Oxygen","Chlorine"],w:"Carbonates give carbon dioxide with acids.",src:LP}]
};
const NI={q:"Name the catalyst used in the hydrogenation of vegetable oils.",a:"Nickel",t:["Iron","Copper","Zinc"],w:"Nickel (or palladium) helps hydrogen add to the oil.",src:EXQ};
const F4={
 hc:{C:[...PIC.hc,...pk(HC_C,[16,17,18,19,20,21,22,23,24,25,26,27]),...pk(HC_B,[1,5,6],EXQ),...pk(HC_C,[0,1,3])],B:pk(HC_B,[3])},
 pr:{C:[...PIC.pr,...pk(B1_C,[14,15]),...pk(B1_C,[0,1,2,3,4,5,6,7,12,13])],B:[]},
 ox:{C:[...PIC.ox,...pk(B2_C,[14]),...pk(B2_C,[0,1,3,4,5,6,7,9,10,13])],B:pk(B2_B,[4])},
 rv:{C:[...PIC.rv,...pk(B3_C,[14,15]),...pk(B3_B,[4],EXQ),...pk(B3_C,[0,2,3,4,5,6,7,11,12])],B:[]},
 ib:{C:[...PIC.ib,...pk(B4_C,[14,15]),NI,...pk(B4_C,[0,1,3,4,6,7,9,10,11,12])],B:[]},
 ex:{C:[...PIC.ex,...pk(B5_C,[16,17,18]),...pk(B5_C,[0,1,2,3,4,5,7,8,9,11,12,15])],B:pk(B5_B,[0])}
};

const G={
  hc:makeGame("hc",F4.hc.C,F4.hc.B,drawPic),
  fg:makeMatch("fg",FG_BOARDS),
  pr:makeGame("pr",F4.pr.C,F4.pr.B,drawPic),
  ox:makeGame("ox",F4.ox.C,F4.ox.B,drawPic),
  rv:makeGame("rv",F4.rv.C,F4.rv.B,drawPic),
  ib:makeGame("ib",F4.ib.C,F4.ib.B,drawPic),
  ex:makeGame("ex",F4.ex.C,F4.ex.B,drawPic)
};
window.__MN={G};
})();

