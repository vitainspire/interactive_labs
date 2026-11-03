/* Lesson 11: Electricity — games.html content.
   This page's quiz-tab engine is fully self-contained inside one IIFE
   (its own $, shuffle, Snd background-music/sfx engine, celebrate/banner
   confetti, mark/score, nav-tab wiring and a bespoke makeGame() question
   runner) and does not use ../shared/app.js: unlike Lesson 1, this file
   does not call the shared quiz()/setMsg()/AUTO-next helpers at all, and
   loading ../shared/app.js alongside it would double-wire the #mus button
   and start two independent background-music engines. So this page only
   loads ../shared/theme.css, not ../shared/app.js. See the restructuring
   report for details. Everything below is unchanged lesson content: the
   lab-picture SVG scene library and the 5 games' 100 questions. */

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

/* ===== Lesson 11: Electricity: lab pictures, exam questions, textbook, bonus ===== */
/* ===== Lab pictures for the opening questions (draw into a 640 x 240 scene) ===== */
const LABPX=(()=>{
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
  /* ray with an arrowhead in the middle */
  const RY=(svg,x1,y1,x2,y2,c)=>{line(svg,x1,y1,x2,y2,3,c);const mx=(x1+x2)/2,my=(y1+y2)/2,a=Math.atan2(y2-y1,x2-x1);
    el("path",{d:`M${mx+9*Math.cos(a)} ${my+9*Math.sin(a)} L${mx-7*Math.cos(a)+6*Math.sin(a)} ${my-7*Math.sin(a)-6*Math.cos(a)} L${mx-7*Math.cos(a)-6*Math.sin(a)} ${my-7*Math.sin(a)+6*Math.cos(a)}Z`,fill:c},svg);};
  const ARW=(svg,x,y0,y1,c)=>{line(svg,x,y0,x,y1+8,5,c);el("path",{d:`M${x} ${y1-4} l-10 16 h20 Z`,fill:c},svg);};
  const DIM=(svg,x1,x2,y,l)=>{line(svg,x1,y,x2,y,2,INK);[x1,x2].forEach(x=>line(svg,x,y-7,x,y+7,2,INK));T(svg,(x1+x2)/2,y-8,l,"small");};
  /* concave mirror ray diagram with the object placed (no image) */
  const RMIR=(svg,ox,label)=>{const AX=140;line(svg,30,AX,560,AX,2,GL);
    el("path",{d:"M520 40 Q570 140 520 240",fill:"none",stroke:INK,"stroke-width":5},svg);
    for(let k=0;k<7;k++)line(svg,548-Math.abs(3-k)*3,52+k*28,562-Math.abs(3-k)*3,44+k*28,2,GL);
    [["P",545],["F",420],["C",295]].forEach(([l,x])=>{el("circle",{cx:x,cy:AX,r:4.5,fill:INK},svg);T(svg,x,AX+26,l,"mid");});
    ARW(svg,ox,AX,AX-62,"#DC2626");T(svg,ox,AX-74,label,"small");};
  /* ---- Lesson 10 helpers: eye, prism, sun, people ---- */
  const VIB=["#7C3AED","#4338CA","#2563EB","#16A34A","#EAB308","#F97316","#DC2626"];
  function EYE(svg,cx,cy,r,o){o=o||{};const P=(d,rr)=>[cx+rr*Math.cos(d*Math.PI/180),cy+rr*Math.sin(d*Math.PI/180)];
    const [nx,ny]=P(22,r);
    el("path",{d:`M${nx-4} ${ny-12} L${cx+r*1.38} ${cy+r*.26} L${cx+r*1.38} ${cy+r*.5} L${nx-10} ${ny+10}Z`,fill:"#FCA5A5",stroke:"#B91C1C","stroke-width":2},svg);
    el("circle",{cx,cy,r,fill:"#FFFFFF",stroke:"#334155","stroke-width":3},svg);
    const [x1,y1]=P(-50,r-6),[x2,y2]=P(50,r-6);
    el("path",{d:`M${x1} ${y1} A${r-6} ${r-6} 0 0 1 ${x2} ${y2}`,fill:"none",stroke:"#E11D48","stroke-width":6,"stroke-linecap":"round"},svg);
    el("path",{d:`M${cx-r*.87} ${cy-r*.5} Q${cx-r*1.25} ${cy} ${cx-r*.87} ${cy+r*.5}`,fill:"rgba(186,230,253,.7)",stroke:"#0284C7","stroke-width":3},svg);
    const ix=cx-r*.62;line(svg,ix,cy-r*.68,ix,cy-r*.34,7,"#92400E");line(svg,ix,cy+r*.34,ix,cy+r*.68,7,"#92400E");
    const lx=ix+r*.13;el("ellipse",{cx:lx,cy,rx:o.lt||r*.1,ry:r*.32,fill:"rgba(253,230,138,.9)",stroke:"#B45309","stroke-width":2.5},svg);
    return {cor:cx-r*1.06,lx,rx:cx+r-6,nx:cx+r*1.2,ny:cy+r*.38};}
  const POINT=(svg,x,y,lx,ly,l)=>{line(svg,x,y,lx,ly-16,2,GL);el("circle",{cx:x,cy:y,r:3.5,fill:GL},svg);T(svg,lx,ly,l,"small");};
  function ARRTO(svg,x1,y1,x2,y2,c){const a=Math.atan2(y2-y1,x2-x1),cs=Math.cos(a),sn=Math.sin(a);line(svg,x1,y1,x2-12*cs,y2-12*sn,4,c);
    el("path",{d:`M${x2} ${y2} L${x2-16*cs+8*sn} ${y2-16*sn-8*cs} L${x2-16*cs-8*sn} ${y2-16*sn+8*cs}Z`,fill:c},svg);}
  const BLUR=(svg,x,y,h)=>{el("ellipse",{cx:x,cy:y,rx:9,ry:h,fill:"rgba(250,204,21,.28)"},svg);el("ellipse",{cx:x,cy:y,rx:6,ry:h*.7,fill:"rgba(250,204,21,.4)"},svg);};
  function SUN(svg,x,y,r,c){for(let k=0;k<8;k++){const a=k*Math.PI/4;line(svg,x+(r+5)*Math.cos(a),y+(r+5)*Math.sin(a),x+(r+13)*Math.cos(a),y+(r+13)*Math.sin(a),3,c||"#F59E0B");}
    el("circle",{cx:x,cy:y,r,fill:c||"#FACC15"},svg);}
  function LENSX(svg,x,y,k){if(k==="cv")el("ellipse",{cx:x,cy:y,rx:8,ry:22,fill:"rgba(253,230,138,.8)",stroke:"#B45309","stroke-width":2.5},svg);
    else el("path",{d:`M${x-10} ${y-22} H${x+10} Q${x+2} ${y} ${x+10} ${y+22} H${x-10} Q${x-2} ${y} ${x-10} ${y-22}Z`,fill:"rgba(147,197,253,.7)",stroke:"#1D4ED8","stroke-width":2.5},svg);}
  const PRISM=(svg,A,B,C)=>el("path",{d:`M${A} L${B} L${C}Z`,fill:"rgba(186,230,253,.6)",stroke:"#0284C7","stroke-width":3,"stroke-linejoin":"round"},svg);
  const BEAM=(svg,x1,y1,x2,y2)=>{line(svg,x1,y1,x2,y2,10,"#94A3B8");line(svg,x1,y1,x2,y2,6,"#FFFFFF");};
  /* trace one ray through a prism ABC (n = 1.5): i in degrees, E at fraction t up face BA */
  function PRAY(A,B,C,iDeg,t){const n=1.5,rad=Math.PI/180,G=[(A[0]+B[0]+C[0])/3,(A[1]+B[1]+C[1])/3];
    const nin=(P,Q,X)=>{let u=[Q[0]-P[0],Q[1]-P[1]];const L=Math.hypot(...u);u=[u[0]/L,u[1]/L];let m=[-u[1],u[0]];if((G[0]-X[0])*m[0]+(G[1]-X[1])*m[1]<0)m=[-m[0],-m[1]];return m;};
    const E=[B[0]+(A[0]-B[0])*t,B[1]+(A[1]-B[1])*t],n1=nin(B,A,E),a1=Math.atan2(n1[1],n1[0]);
    const r1=Math.asin(Math.sin(iDeg*rad)/n),d=[Math.cos(a1-iDeg*rad),Math.sin(a1-iDeg*rad)],q=[Math.cos(a1-r1),Math.sin(a1-r1)];
    const hit=(P,v,M,N)=>{const w=[N[0]-M[0],N[1]-M[1]],den=v[0]*w[1]-v[1]*w[0],s=((M[0]-P[0])*w[1]-(M[1]-P[1])*w[0])/den;return [P[0]+v[0]*s,P[1]+v[1]*s];};
    const F=hit(E,q,A,C),n2=nin(A,C,F),no=[-n2[0],-n2[1]],ao=Math.atan2(no[1],no[0]),aq=Math.atan2(q[1],q[0]);
    let df=aq-ao;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;
    const r2=Math.abs(df),e=Math.asin(Math.min(1,n*Math.sin(r2))),ae=ao+Math.sign(df)*e,ev=[Math.cos(ae),Math.sin(ae)];
    const X=hit(E,d,F,[F[0]+ev[0],F[1]+ev[1]]);
    return {E,F,d,e:ev,X,P:[E[0]-d[0]*120,E[1]-d[1]*120],S:[F[0]+ev[0]*120,F[1]+ev[1]*120],i:iDeg,r1:r1/rad,r2:r2/rad,em:e/rad,D:iDeg+e/rad-60};}
  function ARC(svg,X,d,e,r,c){const a1=Math.atan2(d[1],d[0]),a2=Math.atan2(e[1],e[0]);
    el("path",{d:`M${X[0]+r*Math.cos(a1)} ${X[1]+r*Math.sin(a1)} A${r} ${r} 0 0 ${a2>a1?1:0} ${X[0]+r*Math.cos(a2)} ${X[1]+r*Math.sin(a2)}`,fill:"none",stroke:c,"stroke-width":3.5},svg);}
  function PERSON(svg,x,y,s){const h=y-66*s;el("circle",{cx:x,cy:h,r:10*s+2,fill:"#FDE68A",stroke:INK,"stroke-width":3},svg);
    line(svg,x,h+10*s+2,x,y-26*s,4);line(svg,x,y-26*s,x-12*s,y,4);line(svg,x,y-26*s,x+12*s,y,4);line(svg,x-16*s,h+28*s,x+16*s,h+28*s,4);return [x,h];}
  function STAR(svg,x,y,r,c){const p=[];for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r;p.push((x+rr*Math.cos(a)).toFixed(1)+","+(y+rr*Math.sin(a)).toFixed(1));}
    el("polygon",{points:p.join(" "),fill:c,stroke:"#B45309","stroke-width":1.5},svg);}
  function EYEF(svg,x,y){el("path",{d:`M${x-26} ${y} Q${x} ${y-22} ${x+26} ${y} Q${x} ${y+22} ${x-26} ${y}Z`,fill:"#FFFFFF",stroke:"#334155","stroke-width":3},svg);
    el("circle",{cx:x+6,cy:y,r:10,fill:"#8B5A2B"},svg);el("circle",{cx:x+6,cy:y,r:5,fill:"#0F172A"},svg);}
  /* ---- Lesson 11 helpers: circuit symbols ---- */
  const WIRE=(svg,d,w)=>el("path",{d,fill:"none",stroke:INK,"stroke-width":w||3.5,"stroke-linejoin":"round","stroke-linecap":"round"},svg);
  function CELLS(svg,x,y,n,gap){gap=gap||22;for(let k=0;k<n;k++){const cx=x+k*gap;
      el("rect",{x:cx-6,y:y-24,width:16,height:48,fill:"var(--panel,#fff)",stroke:"none"},svg);
      line(svg,cx,y-22,cx,y+22,3.5);line(svg,cx+10,y-11,cx+10,y+11,7);
      if(k<n-1)line(svg,cx+10,y,cx+gap,y,3.5);}
    T(svg,x-8,y-28,"+","small");T(svg,x+(n-1)*gap+16,y-28,"−","small");}
  function RES(svg,x1,x2,y,lab,c){const n=6,w=(x2-x1)/n;let d=`M${x1} ${y}`;for(let k=0;k<n;k++)d+=` L${x1+w*(k+.5)} ${y+(k%2?12:-12)}`;d+=` L${x2} ${y}`;
    el("path",{d,fill:"none",stroke:c||"#B45309","stroke-width":3.5,"stroke-linejoin":"round"},svg);if(lab)T(svg,(x1+x2)/2,y-20,lab,"small");}
  function METER(svg,x,y,ch,c){el("circle",{cx:x,cy:y,r:20,fill:"var(--panel,#fff)",stroke:c||INK,"stroke-width":3.5},svg);T(svg,x,y+7,ch,"mid",{style:`fill:${c||"var(--ink)"}`});}
  function KEY(svg,x,y){el("circle",{cx:x-12,cy:y,r:5,fill:"none",stroke:INK,"stroke-width":3},svg);el("circle",{cx:x+12,cy:y,r:5,fill:"none",stroke:INK,"stroke-width":3},svg);
    el("circle",{cx:x,cy:y,r:4,fill:INK},svg);el("rect",{x:x-20,y:y-12,width:40,height:24,rx:5,fill:"none",stroke:INK,"stroke-width":2},svg);T(svg,x,y-20,"K","small");}
  function BULBS(svg,x,y,st){if(st==="on")for(let k=0;k<8;k++){const a=k*Math.PI/4;line(svg,x+24*Math.cos(a),y+24*Math.sin(a),x+34*Math.cos(a),y+34*Math.sin(a),3,"#EAB308");}
    el("circle",{cx:x,cy:y,r:17,fill:st==="on"?"#FEF08A":st==="off"?"#94A3B8":"var(--panel,#fff)",stroke:INK,"stroke-width":3.5},svg);
    line(svg,x-12,y-12,x+12,y+12,3);line(svg,x-12,y+12,x+12,y-12,3);}
  function AXES(svg,ox,oy,w,h,xl,yl){line(svg,ox,oy,ox+w,oy,3);line(svg,ox,oy,ox,oy-h,3);
    el("path",{d:`M${ox+w+10} ${oy} l-14 -7 v14Z M${ox} ${oy-h-10} l-7 14 h14Z`,fill:INK},svg);
    T(svg,ox+w-10,oy+26,xl,"small");T(svg,ox-34,oy-h+6,yl,"small");T(svg,ox-14,oy+20,"O","small");}
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
    limewater(svg,it){tube(svg,170,60,140,"#BFDBFE",(it&&it.l)||"Na₂CO₃ + ethanoic acid");bubbles(svg,170,190,10,20);if(it&&it.shells)for(let k=0;k<6;k++)el("path",{d:`M${156+k*5} ${196+(k%2)*6} l8 -5 l4 7 Z`,fill:"#FFF7ED",stroke:"#C2410C","stroke-width":1.2},svg);
      el("path",{d:"M170 52 V30 H450 V170",fill:"none",stroke:GL,"stroke-width":7,"stroke-linejoin":"round"},svg);
      tube(svg,450,60,140,"#CBD2DB","Lime water");bubbles(svg,450,185,5,6);T(svg,540,150,"milky!","mid");},
    circuit(svg){
      el("path",{d:"M150 70 H300 M340 70 H470 V180 H380 M320 180 H260 M200 180 H150 V70",fill:"none",stroke:INK,"stroke-width":4},svg);
      /* battery */ el("rect",{x:200,y:162,width:60,height:36,rx:5,fill:"#F59E0B",stroke:INK,"stroke-width":3},svg);T(svg,230,186,"+ −","small");
      /* bulb */ el("circle",{cx:320,cy:58,r:26,fill:"#FDE047",stroke:"#CA8A04","stroke-width":3},svg);
      [[0,-48],[-40,-30],[40,-30],[-52,6],[52,6]].forEach(([dx,dy])=>line(svg,320+dx*0.75,58+dy*0.75,320+dx,58+dy,3,"#EAB308"));
      el("rect",{x:308,y:80,width:24,height:14,fill:"#94A3B8"},svg);
      /* clips and metal strip */ [380,320].forEach(x=>el("circle",{cx:x,cy:180,r:7,fill:"#64748B"},svg));
      el("rect",{x:316,y:172,width:68,height:16,rx:3,fill:"#B45309",stroke:INK,"stroke-width":2},svg);
      T(svg,320,214,"A","small");T(svg,382,214,"B","small");T(svg,350,236,"metal","small");},
    heatwire(svg){
      el("rect",{x:60,y:40,width:12,height:180,fill:"#64748B"},svg);el("rect",{x:30,y:214,width:80,height:12,rx:3,fill:"#475569"},svg);
      el("rect",{x:64,y:72,width:40,height:18,rx:4,fill:"#94A3B8",stroke:INK,"stroke-width":2},svg);
      line(svg,100,81,520,81,5,"#B45309");
      [180,280,380].forEach(x=>el("ellipse",{cx:x,cy:89,rx:9,ry:7,fill:"#FEF3C7",stroke:"#D97706","stroke-width":2},svg));
      el("ellipse",{cx:520,cy:92,rx:10,ry:8,fill:"#FEF3C7",stroke:"#D97706","stroke-width":2,opacity:.5},svg);
      line(svg,520,112,520,150,4,"#334155");el("circle",{cx:520,cy:110,r:6,fill:"#DC2626"},svg);line(svg,548,118,548,176,3);el("path",{d:"M548 186 l-8 -14 h16 Z",fill:INK},svg);T(svg,590,150,"pin falls","small");
      el("path",{d:"M140 160 C158 132 150 108 140 92 C130 108 122 132 140 160Z",fill:"#FB923C"},svg);
      el("rect",{x:122,y:160,width:36,height:30,rx:5,fill:"#475569"},svg);T(svg,140,214,"heat here","small");},
    hammer(svg){
      el("rect",{x:60,y:150,width:110,height:50,rx:6,fill:"#94A3B8",stroke:INK,"stroke-width":3},svg);T(svg,115,232,"Metal block","small");
      line(svg,180,40,110,120,8,"#92400E");el("rect",{x:80,y:96,width:70,height:32,rx:5,fill:"#475569",transform:"rotate(-45 115 112)"},svg);
      arrow(svg,220,350,175,"beat it");
      el("rect",{x:380,y:184,width:220,height:10,rx:3,fill:"#CBD5E1",stroke:INK,"stroke-width":2},svg);T(svg,490,232,"Thin sheet","small");},
    mgburn(svg){
      line(svg,90,60,240,120,6,"#64748B");line(svg,90,74,240,124,6,"#64748B");
      line(svg,240,122,330,140,5,"#CBD5E1");
      el("circle",{cx:350,cy:142,r:62,fill:"#FEF08A",opacity:.75},svg);el("circle",{cx:350,cy:142,r:46,fill:"#FFFFFF",opacity:.95},svg);el("circle",{cx:350,cy:142,r:26,fill:"#F8FAFC",stroke:"#FDE68A","stroke-width":6},svg);
      for(let k=0;k<10;k++){const a=k*Math.PI/5;line(svg,350+52*Math.cos(a),142+52*Math.sin(a),350+66*Math.cos(a),142+66*Math.sin(a),3,"#FACC15");}
      el("ellipse",{cx:360,cy:222,rx:56,ry:10,fill:"#E2E8F0",stroke:GL,"stroke-width":2},svg);
      for(let k=0;k<8;k++)el("circle",{cx:330+k*8,cy:216,r:4,fill:"#FFFFFF",stroke:"#CBD5E1"},svg);
      T(svg,520,226,"white ash","small");},
    litmus(svg){
      el("rect",{x:230,y:40,width:180,height:180,rx:12,fill:"rgba(250,204,21,.12)",stroke:GL,"stroke-width":4},svg);
      el("rect",{x:222,y:28,width:196,height:16,rx:4,fill:GL},svg);T(svg,320,210,"SO₂ gas","mid");
      el("rect",{x:300,y:60,width:40,height:110,rx:4,fill:"#3B82F6"},svg);el("rect",{x:300,y:118,width:40,height:52,rx:4,fill:"#EF4444"},svg);
      T(svg,500,90,"moist blue","small");T(svg,500,110,"litmus","small");line(svg,450,104,346,104,2.5);},
    kerosene(svg){
      el("rect",{x:230,y:60,width:180,height:160,rx:20,fill:"rgba(255,255,255,.35)",stroke:GL,"stroke-width":4},svg);
      el("rect",{x:270,y:34,width:100,height:30,rx:6,fill:"#475569"},svg);
      el("rect",{x:236,y:100,width:168,height:114,rx:16,fill:"#FEF9C3"},svg);
      el("rect",{x:290,y:168,width:60,height:36,rx:8,fill:"#CBD5E1",stroke:"#64748B","stroke-width":2.5},svg);T(svg,320,192,"Na","mid");
      T(svg,520,130,"Kerosene oil","small");line(svg,470,124,410,124,2.5);},
    znacid(svg){tube(svg,120,50,150,"#E0F2FE","Zinc + dil. H₂SO₄");
      for(let k=0;k<5;k++)el("circle",{cx:108+k*6,cy:212-(k%2)*6,r:6,fill:"#94A3B8",stroke:"#475569"},svg);bubbles(svg,120,190,8,18);
      el("path",{d:"M120 42 V24 H300 V150",fill:"none",stroke:GL,"stroke-width":7,"stroke-linejoin":"round"},svg);
      el("path",{d:"M250 160 h110 v40 a10 10 0 0 1 -10 10 h-90 a10 10 0 0 1 -10 -10Z",fill:"#E0F2FE",stroke:GL,"stroke-width":3},svg);
      [[290,150,12],[312,146,10],[330,152,9]].forEach(([x,y,r])=>el("circle",{cx:x,cy:y,r,fill:"rgba(255,255,255,.6)",stroke:"#38BDF8","stroke-width":2},svg));
      T(svg,305,232,"soap solution","small");
      el("rect",{x:452,y:130,width:22,height:90,rx:4,fill:"#FDE68A",stroke:"#D97706","stroke-width":2},svg);
      el("path",{d:"M463 128 C474 112 470 98 463 86 C456 98 452 112 463 128Z",fill:"#FB923C"},svg);
      T(svg,410,92,"POP!","big");T(svg,463,240,"candle","small");},
    acidbulb(svg){
      el("path",{d:"M220 100 v100 a12 12 0 0 0 12 12 h176 a12 12 0 0 0 12 -12 v-100",fill:"rgba(255,255,255,.3)",stroke:GL,"stroke-width":4},svg);
      el("rect",{x:224,y:140,width:192,height:68,rx:8,fill:"#DBEAFE"},svg);
      [280,360].forEach(x=>line(svg,x,70,x,190,6,"#64748B"));
      el("path",{d:"M280 70 V30 H300 M340 30 H360 V70",fill:"none",stroke:INK,"stroke-width":3.5},svg);
      el("rect",{x:266,y:40,width:28,height:22,rx:4,fill:"#F59E0B",stroke:INK,"stroke-width":2},svg);T(svg,280,56,"+ −","small");T(svg,236,58,"cell","small");
      el("circle",{cx:320,cy:30,r:20,fill:"#FDE047",stroke:"#CA8A04","stroke-width":3},svg);
      [[0,-30],[-28,-14],[28,-14]].forEach(([dx,dy])=>line(svg,320+dx*.8,30+dy*.8,320+dx*1.25,30+dy*1.25,3,"#EAB308"));
      T(svg,520,180,"dilute HCl","mid");line(svg,465,176,420,176,2.5);},
    phstrip(svg){const C=["#DC2626","#16A34A","#2563EB"];
      ["A","B","C"].forEach((l,i)=>{const x=160+i*160;el("rect",{x:x-24,y:28,width:48,height:110,rx:6,fill:"#FEF3C7",stroke:"#D97706","stroke-width":2},svg);
        el("ellipse",{cx:x,cy:84,rx:18,ry:22,fill:C[i]},svg);T(svg,x,164,l,"mid");});
      const g=el("linearGradient",{id:"phg"+Math.random().toString(36).slice(2,6)},el("defs",{},svg));
      [["0%","#DC2626"],["25%","#F97316"],["45%","#EAB308"],["50%","#16A34A"],["75%","#2563EB"],["100%","#7C3AED"]].forEach(([o,c])=>el("stop",{offset:o,"stop-color":c},g));
      el("rect",{x:110,y:186,width:420,height:18,rx:9,fill:`url(#${g.id})`},svg);
      [["0",110],["7",320],["14",530]].forEach(([t,x])=>T(svg,x,232,t,"small"));},
    ppt(svg,it){const col=(it&&it.col)||"#FACC15";
      tube(svg,320,60,128,"#F8FAFC",(it&&it.l2)||"");
      el("path",{d:"M304 160 V188 a16 16 0 0 0 32 0 V160 Z",fill:col,stroke:"#94A3B8","stroke-width":1},svg);
      for(let k=0;k<10;k++)el("circle",{cx:308+Math.random()*24,cy:134+Math.random()*22,r:2.5,fill:col,stroke:"#94A3B8","stroke-width":.6},svg);
      el("rect",{x:312,y:8,width:16,height:36,rx:3,fill:"rgba(255,255,255,.5)",stroke:GL,"stroke-width":2.5},svg);el("ellipse",{cx:320,cy:8,rx:13,ry:9,fill:"#64748B"},svg);
      el("circle",{cx:320,cy:52,r:4,fill:"#E0F2FE",stroke:GL},svg);
      T(svg,450,34,(it&&it.l1)||"","small");line(svg,390,30,334,24,2.5);T(svg,470,184,"solid forms","small");line(svg,420,180,340,180,2.5);},
    electrolysis(svg){
      el("path",{d:"M150 110 v90 a10 10 0 0 0 10 10 h320 a10 10 0 0 0 10 -10 v-90",fill:"rgba(255,255,255,.3)",stroke:GL,"stroke-width":4},svg);
      el("rect",{x:154,y:128,width:332,height:78,rx:6,fill:"#DBEAFE"},svg);
      [[250,"A",112],[390,"B",56]].forEach(([x,l,g])=>{
        el("path",{d:`M${x-20} 200 V36 a20 20 0 0 1 40 0 V200`,fill:"#DBEAFE",stroke:GL,"stroke-width":3.5},svg);
        el("path",{d:`M${x-17} ${36+g} V36 a17 17 0 0 1 34 0 V${36+g} Z`,fill:"#F8FAFC"},svg);
        line(svg,x,206,x,232,5,"#475569");T(svg,x+42,36,"Tube "+l,"small");});
      el("rect",{x:290,y:222,width:60,height:16,rx:3,fill:"#F59E0B"},svg);line(svg,250,230,290,230,3);line(svg,350,230,390,230,3);},
    nailcuso4(svg){[[200,"#2563EB","At the start"],[440,"#86EFAC","After 20 minutes"]].forEach(([x,c,l],i)=>{
        tube(svg,x,40,160,c,l);el("rect",{x:x-4,y:20,width:8,height:186,rx:2,fill:i?"#9A3412":"#94A3B8"},svg);el("rect",{x:x-9,y:16,width:18,height:7,rx:2,fill:i?"#9A3412":"#64748B"},svg);});
      arrow(svg,262,378,120,"wait");},
    quicklime(svg){
      el("path",{d:"M220 80 v120 a12 12 0 0 0 12 12 h176 a12 12 0 0 0 12 -12 v-120",fill:"rgba(255,255,255,.3)",stroke:GL,"stroke-width":4},svg);
      el("rect",{x:224,y:150,width:192,height:58,rx:8,fill:"#E0F2FE"},svg);
      for(let k=0;k<9;k++)el("rect",{x:240+k*19,y:180+(k%3)*8,width:16,height:12,rx:4,fill:"#F8FAFC",stroke:"#94A3B8"},svg);
      [270,320,370].forEach((x,k)=>el("path",{d:`M${x} 140 c-12 -16 12 -24 0 -40 c-12 -16 12 -24 0 -40`,fill:"none",stroke:"#94A3B8","stroke-width":3.5,"stroke-linecap":"round",opacity:.8},svg));
      T(svg,520,100,"Hiss!","big");T(svg,520,136,"Very hot","small");T(svg,320,236,"Quick lime + water","small");},
    feso4heat(svg){const g=el("g",{transform:"rotate(-24 300 120)"},svg);
      el("path",{d:"M170 100 H400 a18 18 0 0 1 0 36 H170",fill:"rgba(255,255,255,.35)",stroke:GL,"stroke-width":4},g);
      for(let k=0;k<7;k++)el("rect",{x:340+k*9,y:118,width:10,height:14,rx:2,fill:k<4?"#A16207":"#4ADE80",stroke:"#14532D","stroke-width":.6},g);
      el("rect",{x:150,y:96,width:40,height:44,rx:6,fill:"#92400E"},g);
      el("path",{d:"M404 176 C428 140 422 112 404 90 C386 112 380 140 404 176Z",fill:"#FB923C"},svg);el("rect",{x:384,y:174,width:40,height:22,rx:4,fill:"#475569"},svg);
      [[540,70],[566,52]].forEach(([x,y])=>el("path",{d:`M${x} ${y+40} c-10 -12 10 -18 0 -30 c-10 -12 10 -18 0 -30`,fill:"none",stroke:"#94A3B8","stroke-width":3},svg));
      T(svg,200,226,"Ferrous sulphate","small");T(svg,590,140,"smell!","small");},
    cuheat(svg){
      el("path",{d:"M220 100 Q320 190 420 100 Z",fill:"#F8FAFC",stroke:GL,"stroke-width":4},svg);
      el("path",{d:"M246 104 Q320 150 394 104 Z",fill:"#1F2937"},svg);
      [[268,108],[372,108]].forEach(([x,y])=>el("circle",{cx:x,cy:y,r:5,fill:"#B45309"},svg));
      line(svg,240,150,220,214,4,"#475569");line(svg,400,150,420,214,4,"#475569");line(svg,250,150,390,150,4,"#475569");
      el("path",{d:"M320 200 C336 176 332 160 320 150 C308 160 304 176 320 200Z",fill:"#FB923C"},svg);el("rect",{x:302,y:198,width:36,height:20,rx:4,fill:"#475569"},svg);
      T(svg,320,44,"China dish: copper powder heated","small");},
    rustgate(svg){
      el("rect",{x:150,y:30,width:340,height:190,rx:6,fill:"none",stroke:"#475569","stroke-width":8},svg);
      for(let k=0;k<7;k++)line(svg,190+k*44,34,190+k*44,216,6,"#64748B");line(svg,154,125,486,125,6,"#64748B");
      [[200,60,16],[280,150,20],[370,90,14],[430,180,18],[240,190,12],[330,40,10],[460,70,12]].forEach(([x,y,r])=>el("ellipse",{cx:x,cy:y,rx:r,ry:r*0.8,fill:"#9A3412",opacity:.85},svg));},
    chips(svg){
      el("path",{d:"M220 40 Q320 20 420 40 L440 200 Q320 225 200 200 Z",fill:"#FDE68A",stroke:"#D97706","stroke-width":4},svg);
      el("path",{d:"M220 40 L216 30 Q320 10 424 30 L420 40",fill:"#F59E0B"},svg);
      T(svg,320,120,"CHIPS","big");
      [[260,170],[300,182],[350,176],[390,166],[280,70],[370,64]].forEach(([x,y])=>{el("circle",{cx:x,cy:y,r:14,fill:"rgba(255,255,255,.7)",stroke:"#38BDF8","stroke-width":2},svg);T(svg,x,y+4,"N2","small");});
      T(svg,540,120,"gas inside","small");},
    mirrorF(svg){const AX=120;line(svg,40,AX,560,AX,2,GL);
      el("path",{d:"M500 30 Q560 120 500 210",fill:"none",stroke:INK,"stroke-width":5},svg);
      for(let k=0;k<6;k++)line(svg,526-k*1,40+k*30,540,32+k*30,2,GL);
      [[70,520.7],[170,520.7]].forEach(([y,x])=>{RY(svg,60,y,x,y,"#EAB308");RY(svg,x,y,300,120+(y-120)*-0.57,"#EAB308");});
      RY(svg,60,AX,530,AX,"#EAB308");
      [["P",530],["F",380],["C",260]].forEach(([l,x])=>{el("circle",{cx:x,cy:AX,r:4.5,fill:INK},svg);T(svg,x,AX+26,l,"mid");});},
    sidemirror(svg){
      el("rect",{x:60,y:110,width:150,height:60,rx:14,fill:"#2563EB"},svg);el("rect",{x:90,y:86,width:90,height:36,rx:10,fill:"#93C5FD"},svg);
      [95,180].forEach(x=>el("circle",{cx:x,cy:172,r:16,fill:"#1F2937"},svg));
      line(svg,200,108,240,90,6,"#475569");
      el("ellipse",{cx:390,cy:110,rx:150,ry:92,fill:"#475569"},svg);el("ellipse",{cx:390,cy:110,rx:138,ry:80,fill:"#BAE6FD"},svg);
      el("path",{d:"M260 150 Q390 120 520 150 L520 168 Q390 200 260 168Z",fill:"#94A3B8"},svg);
      [[310,145,"#EF4444"],[370,140,"#16A34A"],[420,142,"#F59E0B"],[470,146,"#7C3AED"]].forEach(([x,y,c])=>{el("rect",{x:x-14,y:y-9,width:28,height:12,rx:4,fill:c},svg);});
      T(svg,390,230,"Wide view of the road behind","small");},
    solarcooker(svg){
      el("circle",{cx:90,cy:50,r:28,fill:"#FACC15"},svg);
      el("path",{d:"M220 70 Q320 250 420 70",fill:"#E2E8F0",stroke:INK,"stroke-width":4},svg);
      [[250,128],[320,160],[390,128]].forEach(([x,y])=>{RY(svg,x-60,y-150,x,y,"#EAB308");RY(svg,x,y,320,92,"#EAB308");});
      el("rect",{x:298,y:70,width:44,height:30,rx:5,fill:"#1F2937"},svg);el("rect",{x:292,y:66,width:56,height:7,rx:3,fill:"#374151"},svg);
      T(svg,470,90,"pot","small");line(svg,452,86,350,86,2.5);line(svg,320,170,320,226,5,"#64748B");el("rect",{x:270,y:222,width:100,height:10,rx:3,fill:"#64748B"},svg);},
    burnpaper(svg){el("circle",{cx:60,cy:60,r:26,fill:"#FACC15"},svg);
      el("ellipse",{cx:300,cy:110,rx:18,ry:80,fill:"rgba(186,230,253,.7)",stroke:"#0284C7","stroke-width":3},svg);
      [50,110,170].forEach(y=>{RY(svg,110,y,300,y,"#EAB308");RY(svg,300,y,450,110+(y-110)*-0.15,"#EAB308");});
      el("rect",{x:440,y:40,width:16,height:160,fill:"#F8FAFC",stroke:"#94A3B8","stroke-width":2},svg);
      el("circle",{cx:448,cy:110,r:7,fill:"#1F2937"},svg);
      [[470,90],[488,70]].forEach(([x,y])=>el("path",{d:`M${x} ${y+30} c-10 -12 10 -18 0 -30 c-10 -12 10 -18 0 -30`,fill:"none",stroke:"#94A3B8","stroke-width":3},svg));
      T(svg,300,222,"Convex lens","small");T(svg,448,222,"Paper","small");},
    magnifier(svg){
      for(let k=0;k<4;k++)line(svg,60,60+k*36,580,60+k*36,7,"#CBD5E1");
      el("circle",{cx:320,cy:110,r:82,fill:"#F8FAFC",stroke:"#475569","stroke-width":10},svg);
      T(svg,320,136,"Aa","big",{style:"font-size:74px"});
      line(svg,380,170,450,230,16,"#92400E");},
    diverge(svg){const AX=120;line(svg,40,AX,600,AX,2,GL);
      el("path",{d:"M300 30 Q320 120 300 210 L340 210 Q320 120 340 30 Z",fill:"rgba(186,230,253,.7)",stroke:"#0284C7","stroke-width":3},svg);
      [70,120,170].forEach(y=>{RY(svg,60,y,320,y,"#EAB308");const s=(y-120)*0.55/1;RY(svg,320,y,560,y+s*2.4,"#EAB308");
        if(y!==120)el("line",{x1:320,y1:y,x2:220,y2:AX,stroke:"#EAB308","stroke-width":2,"stroke-dasharray":"6 6"},svg);});
      el("circle",{cx:220,cy:AX,r:4.5,fill:INK},svg);T(svg,220,AX+26,"F","mid");},
    rayMirrorC(svg,it){RMIR(svg,(it&&it.ox)||295,(it&&it.ol)||"Object at C");},
    rayMirrorPF(svg){RMIR(svg,460,"Object between P and F");},
    rayLens2F(svg){const AX=140,cx=320,f=70;line(svg,30,AX,610,AX,2,GL);
      el("ellipse",{cx,cy:AX,rx:16,ry:96,fill:"rgba(186,230,253,.7)",stroke:"#0284C7","stroke-width":3},svg);
      [["2F₁",cx-2*f],["F₁",cx-f],["O",cx],["F₂",cx+f],["2F₂",cx+2*f]].forEach(([l,x])=>{el("circle",{cx:x,cy:AX,r:4.5,fill:INK},svg);T(svg,x,AX+26,l,"mid");});
      ARW(svg,100,AX,AX-60,"#DC2626");T(svg,100,AX+26,"Object","small");},
    prescription(svg){
      el("rect",{x:150,y:20,width:340,height:200,rx:12,fill:"#FFFFFF",stroke:"#94A3B8","stroke-width":3},svg);
      el("rect",{x:150,y:20,width:340,height:44,rx:12,fill:"#2563EB"},svg);el("rect",{x:150,y:50,width:340,height:14,fill:"#2563EB"},svg);
      el("text",{x:320,y:50,"text-anchor":"middle","font-size":"22","font-weight":"800",fill:"#fff","font-family":"Baloo 2,sans-serif"},svg,"Eye Prescription");
      el("text",{x:180,y:110,"font-size":"22","font-weight":"700",fill:"#334155","font-family":"Baloo 2,sans-serif"},svg,"Lens power:");
      el("text",{x:340,y:112,"font-size":"38","font-weight":"800",fill:"#DC2626","font-family":"Baloo 2,sans-serif"},svg,"+1.5 D");
      line(svg,180,160,300,160,2,"#94A3B8");el("text",{x:180,y:190,"font-size":"16",fill:"#64748B","font-family":"Baloo 2,sans-serif"},svg,"Doctor's signature");
      el("circle",{cx:410,cy:175,r:18,fill:"none",stroke:"#334155","stroke-width":4},svg);el("circle",{cx:460,cy:175,r:18,fill:"none",stroke:"#334155","stroke-width":4},svg);line(svg,428,175,442,175,4,"#334155");},
    bench(svg){const Y=170;el("rect",{x:40,y:Y,width:560,height:14,rx:4,fill:"#CBD5E1",stroke:"#94A3B8"},svg);
      for(let k=0;k<=28;k++)line(svg,40+k*20,Y,40+k*20,Y+(k%5?6:12),1.5,"#64748B");
      el("rect",{x:112,y:Y-60,width:16,height:60,rx:3,fill:"#FDE68A",stroke:"#D97706"},svg);el("path",{d:`M120 ${Y-62} C130 ${Y-78} 126 ${Y-90} 120 ${Y-100} C114 ${Y-90} 110 ${Y-78} 120 ${Y-62}Z`,fill:"#FB923C"},svg);
      el("ellipse",{cx:250,cy:Y-60,rx:12,ry:62,fill:"rgba(186,230,253,.8)",stroke:"#0284C7","stroke-width":3},svg);
      el("rect",{x:504,y:Y-130,width:12,height:130,fill:"#F8FAFC",stroke:"#64748B","stroke-width":2},svg);
      el("path",{d:`M496 ${Y-80} C484 ${Y-50} 490 ${Y-28} 496 ${Y-10} C502 ${Y-28} 508 ${Y-50} 496 ${Y-80}Z`,fill:"#FB923C",transform:`rotate(180 496 ${Y-45})`},svg);
      DIM(svg,120,250,Y+40,"30 cm");DIM(svg,250,510,Y+40,"60 cm");
      T(svg,120,24,"Object","small");T(svg,250,24,"Lens","small");T(svg,510,24,"Screen","small");},
    pencil(svg){
      el("path",{d:"M220 40 v170 a12 12 0 0 0 12 12 h176 a12 12 0 0 0 12 -12 v-170",fill:"rgba(255,255,255,.3)",stroke:GL,"stroke-width":4},svg);
      el("rect",{x:224,y:100,width:192,height:118,rx:8,fill:"rgba(147,197,253,.55)"},svg);line(svg,224,100,416,100,2.5,"#3B82F6");
      line(svg,160,20,300,100,12,"#F59E0B");line(svg,300,100,404,152,12,"#F59E0B");
      el("circle",{cx:408,cy:154,r:6,fill:"#1F2937"},svg);T(svg,500,96,"water surface","small");line(svg,450,92,420,100,2);},
    slab(svg){
      el("rect",{x:200,y:80,width:240,height:90,fill:"rgba(186,230,253,.7)",stroke:"#0284C7","stroke-width":3},svg);
      [[260,80],[300,170]].forEach(([x,y])=>el("line",{x1:x,y1:y-50,x2:x,y2:y+50,stroke:GL,"stroke-width":2,"stroke-dasharray":"6 5"},svg));
      RY(svg,140,20,260,80,"#DC2626");RY(svg,260,80,300,170,"#DC2626");RY(svg,300,170,420,230,"#DC2626");
      el("line",{x1:260,y1:80,x2:440,y2:170,stroke:"#DC2626","stroke-width":2,"stroke-dasharray":"4 6",opacity:.6},svg);
      T(svg,540,130,"Glass slab","small");line(svg,500,126,442,126,2);},
    airwater(svg){
      el("rect",{x:120,y:120,width:400,height:110,fill:"rgba(147,197,253,.55)"},svg);line(svg,120,120,520,120,3,"#3B82F6");
      el("line",{x1:320,y1:20,x2:320,y2:230,stroke:GL,"stroke-width":2,"stroke-dasharray":"7 6"},svg);
      RY(svg,190,22,320,120,"#DC2626");RY(svg,320,120,380,230,"#DC2626");
      T(svg,160,100,"Air","mid");T(svg,170,190,"Water","mid");T(svg,360,40,"normal","small");},
    /* ===== Lesson 10: The Human Eye and the Colourful World ===== */
    eyeParts(svg){const e=EYE(svg,300,120,100,{lt:12});
      [96,120,144].forEach(y=>RY(svg,30,y,e.cor,y,"#F59E0B"));
      T(svg,90,80,"Light","small");
      POINT(svg,e.lx,120+18,e.lx-30,222,"Eye lens");
      POINT(svg,e.nx,e.ny,560,222,"Optic nerve");
      ARRTO(svg,540,40,e.rx-4,92,"#7C3AED");T(svg,556,36,"?","big",{style:"fill:#7C3AED"});},
    pupils(svg){
      [[170,"A",36,"Dim light"],[470,"B",10,"Bright light"]].forEach(([x,k,pr,l])=>{
        el("path",{d:`M${x-110} 130 Q${x} 40 ${x+110} 130 Q${x} 220 ${x-110} 130Z`,fill:"#FFFFFF",stroke:INK,"stroke-width":3.5},svg);
        el("circle",{cx:x,cy:130,r:46,fill:"#8B5A2B",stroke:"#5B3A1A","stroke-width":2},svg);
        el("circle",{cx:x,cy:130,r:pr,fill:"#0F172A"},svg);el("circle",{cx:x+14,cy:116,r:6,fill:"#FFFFFF",opacity:.85},svg);
        T(svg,x,232,k+": "+l,"mid");});
      el("path",{d:"M76 34 a20 20 0 1 0 22 26 a16 16 0 1 1 -22 -26Z",fill:"#CBD5E1",stroke:"#64748B","stroke-width":2},svg);
      SUN(svg,578,44,18);},
    accommodate(svg){
      const e1=EYE(svg,215,110,66,{lt:4}),e2=EYE(svg,520,110,66,{lt:15});
      el("rect",{x:38,y:102,width:8,height:28,fill:"#92400E"},svg);el("circle",{cx:42,cy:94,r:18,fill:"#16A34A"},svg);
      T(svg,42,152,"Far tree","small");
      el("path",{d:"M378 82 l22 -6 v64 l-22 6Z",fill:"#FFFFFF",stroke:"#2563EB","stroke-width":3},svg);
      el("path",{d:"M400 76 l22 6 v64 l-22 -6Z",fill:"#FFFFFF",stroke:"#2563EB","stroke-width":3},svg);
      T(svg,400,172,"Book","small");
      T(svg,215,214,"Looking far: thin lens","small");T(svg,520,214,"Reading: thick lens","small");},
    myopiaRay(svg){const e=EYE(svg,390,120,100,{lt:15}),M=[e.rx-58,120];
      [80,120,160].forEach(y=>{RY(svg,30,y,e.lx,y,"#F59E0B");line(svg,e.lx,y,M[0],M[1],3,"#F59E0B");
        const k=(M[1]-y)/(M[0]-e.lx);line(svg,M[0],M[1],e.rx-2,M[1]+k*(e.rx-2-M[0]),3,"#F59E0B");});
      BLUR(svg,e.rx-4,120,26);el("circle",{cx:M[0],cy:M[1],r:7,fill:"#FEF08A",stroke:"#B45309","stroke-width":2.5},svg);
      T(svg,110,60,"Rays from a far object","small");POINT(svg,M[0],M[1]+8,M[0]-60,250,"Rays meet here");
      POINT(svg,e.rx,160,e.rx+50,250,"Retina");},
    hyperRay(svg){const e=EYE(svg,390,120,100,{lt:5}),O=[150,120],H=[e.rx+70,120];
      el("rect",{x:O[0]-8,y:O[1]-30,width:16,height:30,rx:3,fill:"#FDE68A",stroke:"#D97706","stroke-width":2},svg);
      el("path",{d:`M${O[0]} ${O[1]-50} c8 10 6 16 0 20 c-6 -4 -8 -10 0 -20Z`,fill:"#FB923C"},svg);
      [-42,0,42].forEach(h=>{RY(svg,O[0],O[1],e.lx,120+h,"#F59E0B");
        const k=(e.rx-2-e.lx)/(H[0]-e.lx),yr=120+h*(1-k);line(svg,e.lx,120+h,e.rx-2,yr,3,"#F59E0B");
        el("line",{x1:e.rx-2,y1:yr,x2:H[0],y2:H[1],stroke:"#F59E0B","stroke-width":2.5,"stroke-dasharray":"6 6"},svg);});
      BLUR(svg,e.rx-4,120,26);el("circle",{cx:H[0],cy:H[1],r:7,fill:"#FEF08A",stroke:"#B45309","stroke-width":2.5},svg);
      T(svg,O[0],O[1]+30,"Near object","small");T(svg,H[0]+10,H[1]-30,"Rays meet here","small");
      POINT(svg,e.rx,165,e.rx+40,250,"Retina");},
    bifocal(svg){
      [[230,"L"],[430,"R"]].forEach(([x])=>{
        el("rect",{x:x-80,y:50,width:160,height:130,rx:40,fill:"#FFFFFF",stroke:"#334155","stroke-width":7},svg);
        el("path",{d:`M${x-77} 115 V90 a37 37 0 0 1 37 -37 h80 a37 37 0 0 1 37 37 V115Z`,fill:"rgba(147,197,253,.55)"},svg);
        el("path",{d:`M${x-77} 115 V140 a37 37 0 0 0 37 37 h80 a37 37 0 0 0 37 -37 V115Z`,fill:"rgba(253,230,138,.65)"},svg);
        line(svg,x-77,115,x+77,115,3,"#334155");});
      el("path",{d:"M310 92 Q330 76 350 92",fill:"none",stroke:"#334155","stroke-width":7},svg);
      line(svg,150,70,96,60,6,"#334155");line(svg,510,70,564,60,6,"#334155");
      T(svg,570,96,"Concave","small");T(svg,570,112,"(far)","small");line(svg,536,100,500,96,2);
      T(svg,570,150,"Convex","small");T(svg,570,166,"(near)","small");line(svg,536,152,500,148,2);
      LENSX(svg,74,92,"cc");LENSX(svg,74,150,"cv");},
    spectrum(svg){const A=[300,30],B=[220,170],C=[380,170],E=[254,110],F=[350,118];
      PRISM(svg,A,B,C);BEAM(svg,40,150,E[0],E[1]);
      el("path",{d:`M${E[0]} ${E[1]-2} L${F[0]} ${F[1]-5} L${F[0]} ${F[1]+5} L${E[0]} ${E[1]+3}Z`,fill:"rgba(255,255,255,.9)",stroke:"#CBD5E1"},svg);
      el("rect",{x:584,y:70,width:18,height:170,rx:3,fill:"#F8FAFC",stroke:"#64748B","stroke-width":2},svg);
      VIB.slice().reverse().forEach((c,i)=>{const y=134+i*14;line(svg,F[0],F[1],584,y,3,c);el("rect",{x:585,y:y-7,width:16,height:14,fill:c},svg);});
      T(svg,92,178,"White light","small");T(svg,593,62,"Screen","small");},
    deviation(svg){const A=[300,10],B=[180,218],C=[420,218];PRISM(svg,A,B,C);
      const R=PRAY(A,B,C,48,0.55);
      RY(svg,R.P[0],R.P[1],R.E[0],R.E[1],"#DC2626");line(svg,R.E[0],R.E[1],R.F[0],R.F[1],3,"#DC2626");RY(svg,R.F[0],R.F[1],R.S[0],R.S[1],"#DC2626");
      el("line",{x1:R.E[0],y1:R.E[1],x2:R.X[0]+R.d[0]*80,y2:R.X[1]+R.d[1]*80,stroke:"#DC2626","stroke-width":2.5,"stroke-dasharray":"6 6"},svg);
      el("line",{x1:R.F[0],y1:R.F[1],x2:R.X[0],y2:R.X[1],stroke:"#DC2626","stroke-width":2.5,"stroke-dasharray":"6 6"},svg);
      ARC(svg,R.X,R.d,R.e,58,"#7C3AED");T(svg,R.X[0]+84,R.X[1]+12,"?","big",{style:"fill:#7C3AED"});
      T(svg,R.P[0]-10,R.P[1]+26,"Incident ray","small");T(svg,R.S[0]-10,R.S[1]+24,"Emergent ray","small");},
    rainbow(svg){SUN(svg,60,50,26);
      for(let k=0;k<3;k++)RY(svg,92,62+k*16,170,96+k*16,"#F59E0B");
      line(svg,20,232,620,232,3,"#65A30D");
      PERSON(svg,210,232,1);
      VIB.forEach((c,i)=>el("path",{d:`M${310+i*7} 232 A${170-i*7} ${170-i*7} 0 0 1 ${650-i*7} 232`,fill:"none",stroke:c,"stroke-width":7},svg));
      for(let k=0;k<14;k++){const x=330+(k*47)%290,y=40+(k*61)%150;el("path",{d:`M${x} ${y} q-5 9 0 12 q5 -3 0 -12Z`,fill:"#60A5FA"},svg);}
      T(svg,60,104,"Sun","small");T(svg,540,40,"Rain drops","small");},
    starbend(svg){[0,1,2,3].forEach(k=>el("path",{d:`M0 240 Q320 ${130-k*36} 640 240Z`,fill:"rgba(96,165,250,.16)"},svg));
      el("path",{d:"M0 240 Q320 200 640 240Z",fill:"#86EFAC",stroke:"#16A34A","stroke-width":3},svg);const O=PERSON(svg,470,224,0.7);O[1]+=20;
      const S=[120,64],Q=[300,120];
      el("path",{d:`M${S[0]} ${S[1]} Q${Q[0]} ${Q[1]} ${O[0]} ${O[1]-20}`,fill:"none",stroke:"#F59E0B","stroke-width":3.5},svg);
      const dx=O[0]-Q[0],dy=O[1]-20-Q[1],k=1.25;
      el("line",{x1:O[0],y1:O[1]-20,x2:O[0]-dx*k,y2:O[1]-20-dy*k,stroke:"#7C3AED","stroke-width":2.5,"stroke-dasharray":"7 6"},svg);
      STAR(svg,S[0],S[1],14,"#FACC15");T(svg,S[0],S[1]+34,"Real star","small");
      T(svg,O[0]-dx*k,O[1]-20-dy*k-8,"?","big",{style:"fill:#7C3AED"});
      T(svg,560,90,"Layers of air","small");},
    sunrise(svg){
      el("path",{d:"M0 240 Q320 50 640 240Z",fill:"rgba(147,197,253,.35)"},svg);
      el("path",{d:"M20 240 Q320 120 620 240Z",fill:"#86EFAC",stroke:"#16A34A","stroke-width":3},svg);
      line(svg,30,180,610,180,2.5,GL);T(svg,570,170,"Horizon","small");
      SUN(svg,64,204,20,"#FB923C");const O=PERSON(svg,320,180,0.8);
      el("path",{d:`M86 198 Q190 168 ${O[0]-2} ${O[1]+4}`,fill:"none",stroke:"#F59E0B","stroke-width":3.5},svg);
      el("line",{x1:O[0]-2,y1:O[1]+4,x2:86,y2:140,stroke:"#7C3AED","stroke-width":2.5,"stroke-dasharray":"7 6"},svg);
      el("circle",{cx:64,cy:136,r:20,fill:"none",stroke:"#7C3AED","stroke-width":2.5,"stroke-dasharray":"6 5"},svg);
      T(svg,64,104,"Sun seen here","small");T(svg,150,250,"Real Sun (below the horizon)","small");},
    hotair(svg){
      el("path",{d:"M300 220 c-24 -20 -6 -46 6 -66 c4 18 12 20 16 6 c14 22 26 40 6 60Z",fill:"#F97316"},svg);
      el("path",{d:"M310 220 c-10 -14 -2 -28 6 -38 c4 14 12 18 10 38Z",fill:"#FACC15"},svg);
      [-3,-1,1,3].forEach(k=>el("rect",{x:290+k*10,y:220,width:40,height:8,rx:3,fill:"#78350F",transform:`rotate(${k*8} 310 224)`},svg));
      for(let k=0;k<4;k++)el("path",{d:`M${280+k*20} 150 q10 -12 0 -24 q-10 -12 0 -24 q10 -12 0 -24 q-10 -12 0 -24`,fill:"none",stroke:"#F97316","stroke-width":2.5,opacity:.6},svg);
      [[-9,.35],[9,.35],[0,.8]].forEach(([dx,op])=>{const g=el("g",{opacity:op,transform:`translate(${dx} 0)`},svg);
        el("rect",{x:480,y:120,width:120,height:80,fill:"#FDE68A",stroke:"#92400E","stroke-width":3},g);
        el("path",{d:"M470 122 L540 66 L610 122Z",fill:"#DC2626",stroke:"#7F1D1D","stroke-width":3},g);
        el("rect",{x:528,y:160,width:24,height:40,fill:"#92400E"},g);});
      EYEF(svg,70,110);el("line",{x1:96,y1:110,x2:470,y2:140,stroke:GL,"stroke-width":2,"stroke-dasharray":"6 6"},svg);
      T(svg,310,40,"Hot air","small");T(svg,310,246,"Fire","small");T(svg,70,150,"Eye","small");},
    tyndall(svg){
      el("rect",{x:90,y:14,width:520,height:220,rx:6,fill:"#1F2937",stroke:"#475569","stroke-width":3},svg);
      SUN(svg,40,40,22);el("rect",{x:86,y:46,width:8,height:18,fill:"#FEF9C3"},svg);
      el("path",{d:"M94 40 L94 70 L520 234 L360 234Z",fill:"rgba(254,240,138,.5)"},svg);
      for(let k=0;k<70;k++){const t=(k*37%100)/100,s=((k*53)%100)/100-.5,x=94+t*346+s*120*t,y=55+t*175+s*14*t;el("circle",{cx:x,cy:y,r:1.8,fill:"#FFFFFF",opacity:.85},svg);}
      for(let k=0;k<5;k++)el("circle",{cx:180+k*80,cy:200-(k%2)*30,r:22,fill:"#9CA3AF",opacity:.18},svg);
      T(svg,520,60,"Dark, smoky room","small",{style:"fill:#F1F5F9;stroke:#1F2937"});T(svg,60,90,"Small hole","small");},
    bluesky(svg){
      ["#93C5FD","#7DB4F9","#60A5FA","#4C93F2"].reverse().forEach((c,i)=>el("rect",{x:20,y:10+i*45,width:600,height:46,fill:c},svg));
      el("path",{d:"M20 190 Q320 160 620 190 V236 H20Z",fill:"#86EFAC",stroke:"#16A34A","stroke-width":3},svg);
      SUN(svg,320,44,24);PERSON(svg,470,179,0.6);
      [[140,80],[220,130],[420,96],[520,70]].forEach(([x,y])=>{el("circle",{cx:x,cy:y,r:5,fill:"#FFFFFF"},svg);
        [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b])=>line(svg,x+a*8,y+b*8,x+a*20,y+b*20,2.5,"#1D4ED8"));});
      T(svg,140,226,"Clear day","small");},
    redsun(svg){
      el("path",{d:"M0 240 Q320 40 640 240Z",fill:"rgba(147,197,253,.45)"},svg);
      el("path",{d:"M40 240 Q320 110 600 240Z",fill:"#86EFAC",stroke:"#16A34A","stroke-width":3},svg);
      const O=PERSON(svg,320,175,0.8);
      SUN(svg,46,196,22,"#EF4444");
      el("path",{d:`M70 192 Q190 150 ${O[0]-8} ${O[1]+2}`,fill:"none",stroke:"#F97316","stroke-width":4},svg);
      T(svg,170,136,"Long path through air","small");
      SUN(svg,320,10,18);ARRTO(svg,320,34,320,O[1]-16,"#EAB308");T(svg,410,80,"Noon: short path","small");},
    /* ===== Lesson 11: Electricity ===== */
    amSeries(svg){WIRE(svg,"M120 60 H220 M246 60 H380 M420 60 H520 V200 H442 M398 200 H222 M178 200 H120 V60");
      CELLS(svg,224,60,1);KEY(svg,400,60);BULBS(svg,200,200,"on");METER(svg,420,200,"M","#7C3AED");
      T(svg,200,244,"Bulb","small");T(svg,420,244,"Meter M","small");T(svg,234,104,"Cell","small");},
    vmParallel(svg){WIRE(svg,"M140 50 H290 M314 50 H500 V150 H420 M220 150 H140 V50 M220 150 V222 H298 M342 222 H420 V150");
      CELLS(svg,294,50,1);RES(svg,220,420,150,"Resistor");METER(svg,320,222,"M","#7C3AED");
      el("circle",{cx:220,cy:150,r:5,fill:INK},svg);el("circle",{cx:420,cy:150,r:5,fill:INK},svg);},
    battSym(svg){line(svg,120,120,236,120,3.5);CELLS(svg,240,120,3,60);line(svg,370,120,500,120,3.5);},
    viLine(svg){AXES(svg,140,214,380,190,"I (A)","V (V)");line(svg,140,214,480,44,4,"#DC2626");
      [0.2,0.4,0.6,0.8].forEach(t=>el("circle",{cx:140+340*t,cy:214-170*t,r:6,fill:"#DC2626"},svg));},
    viTwo(svg){AXES(svg,140,214,380,190,"I (A)","V (V)");line(svg,140,214,290,44,4,"#DC2626");line(svg,140,214,500,104,4,"#2563EB");
      T(svg,306,48,"A","big",{style:"fill:#DC2626"});T(svg,516,108,"B","big",{style:"fill:#2563EB"});},
    rheoSym(svg){line(svg,140,130,230,130,3.5);RES(svg,230,410,130,"","#B45309");line(svg,410,130,500,130,3.5);
      line(svg,250,190,382,72,4);el("path",{d:"M394 61 l-20 4 l9 10Z",fill:INK},svg);},
    wiresLen(svg){[[90,"A","l",300],[180,"B","2l",480]].forEach(([y,k,l,x2])=>{
        el("circle",{cx:120,cy:y,r:7,fill:"#64748B"},svg);el("circle",{cx:x2,cy:y,r:7,fill:"#64748B"},svg);line(svg,120,y,x2,y,6,"#B45309");
        T(svg,84,y+8,k,"big");T(svg,(120+x2)/2,y-18,l,"mid");});
      T(svg,330,236,"Same material, same thickness","small");},
    wiresThick(svg){[[80,5,"Thin"],[170,18,"Thick"]].forEach(([y,w,l])=>{line(svg,140,y,500,y,w,"#C2410C");T(svg,80,y+7,l,"mid");});
      T(svg,320,230,"Same copper, same length","small");},
    bulbFil(svg){el("path",{d:"M270 170 C200 140 220 30 320 26 C420 30 440 140 370 170Z",fill:"rgba(254,240,138,.55)",stroke:"#CA8A04","stroke-width":3},svg);
      for(let k=0;k<4;k++)el("rect",{x:280,y:172+k*12,width:80,height:10,rx:4,fill:"#94A3B8",stroke:"#64748B"},svg);
      line(svg,300,170,300,96,3,"#64748B");line(svg,340,170,340,96,3,"#64748B");
      let d="M300 96";for(let k=0;k<8;k++)d+=` q2.5 -12 5 0`;el("path",{d,fill:"none",stroke:"#EA580C","stroke-width":3},svg);
      for(let k=0;k<6;k++){const a=-Math.PI*(0.15+k*0.14);line(svg,320+60*Math.cos(a),96+60*Math.sin(a),320+76*Math.cos(a),96+76*Math.sin(a),3,"#F59E0B");}
      POINT(svg,322,90,470,80,"Coiled wire");},
    serRes(svg){WIRE(svg,"M120 70 H170 M230 70 H270 M330 70 H370 M430 70 H520 V200 H364 M330 200 H120 V70");
      RES(svg,170,230,70,"2 Ω");RES(svg,270,330,70,"3 Ω");RES(svg,370,430,70,"6 Ω");CELLS(svg,334,200,2,22);},
    parRes(svg){WIRE(svg,"M200 96 V40 H270 M370 40 H440 V152 H370 M270 152 H200 V96 M200 96 H120 V220 H306 M330 220 H520 V96 H440");
      RES(svg,270,370,40,"3 Ω");RES(svg,270,370,152,"6 Ω");CELLS(svg,310,220,1);
      el("circle",{cx:200,cy:96,r:5,fill:INK},svg);el("circle",{cx:440,cy:96,r:5,fill:INK},svg);},
    houseBulbs(svg){line(svg,80,50,560,50,4);line(svg,80,210,560,210,4);T(svg,60,136,"220 V","small");
      [180,320,460].forEach((x,i)=>{line(svg,x,50,x,110,3.5);line(svg,x,150,x,210,3.5);BULBS(svg,x,130,i===1?"off":"on");
        if(i===1){line(svg,x-26,104,x+26,156,5,"#DC2626");line(svg,x-26,156,x+26,104,5,"#DC2626");}});
      T(svg,320,240,"Fused bulb","small");},
    fuseHolder(svg){el("rect",{x:160,y:70,width:320,height:110,rx:24,fill:"#F8FAFC",stroke:"#94A3B8","stroke-width":4},svg);
      [200,440].forEach(x=>{el("rect",{x:x-22,y:104,width:44,height:42,rx:6,fill:"#D4A017",stroke:"#92400E","stroke-width":3},svg);el("circle",{cx:x,cy:125,r:8,fill:"#92400E"},svg);});
      el("path",{d:"M222 125 Q320 108 418 125",fill:"none",stroke:"#64748B","stroke-width":2},svg);
      POINT(svg,320,116,320,230,"Thin wire");},
    heaterCord(svg){el("rect",{x:120,y:40,width:260,height:170,rx:16,fill:"#475569",stroke:"#1E293B","stroke-width":4},svg);
      el("rect",{x:142,y:62,width:216,height:126,rx:10,fill:"#1F2937"},svg);
      [92,126,160].forEach(y=>{let d=`M160 ${y}`;for(let k=0;k<18;k++)d+=` q5 ${k%2?8:-8} 10 0`;el("path",{d,fill:"none",stroke:"#F97316","stroke-width":5},svg);
        el("path",{d,fill:"none",stroke:"#FDE047","stroke-width":1.5},svg);});
      el("path",{d:"M380 170 C440 170 440 220 500 214 L560 214",fill:"none",stroke:"#334155","stroke-width":8},svg);
      el("rect",{x:556,y:200,width:40,height:28,rx:5,fill:"#E2E8F0",stroke:"#334155","stroke-width":3},svg);
      T(svg,250,30,"Coil: glowing","small");T(svg,500,250,"Cord: not glowing","small");},
    energyMeter(svg){el("rect",{x:200,y:16,width:240,height:220,rx:18,fill:"#F1F5F9",stroke:"#334155","stroke-width":4},svg);
      el("rect",{x:226,y:46,width:188,height:50,rx:6,fill:"#0F172A"},svg);
      ["0","4","5","6","7"].forEach((c,i)=>T(svg,246+i*36,82,c,"big",{style:"fill:#4ADE80;stroke:none"}));
      T(svg,470,80,"?","big",{style:"fill:#7C3AED"});T(svg,320,126,"ELECTRICITY METER","small",{style:"fill:#334155"});
      el("rect",{x:250,y:146,width:140,height:22,rx:11,fill:"#CBD5E1"},svg);el("circle",{cx:320,cy:157,r:6,fill:"#DC2626"},svg);
      [260,380].forEach(x=>el("rect",{x:x-8,y:236,width:16,height:14,fill:"#334155"},svg));}
  };
  const crop=svg=>{if(svg.dataset.pic!=="1")return;try{const b=svg.getBBox();if(b.width<10)return;const p=12;
      svg.setAttribute("viewBox",`${(b.x-p).toFixed(1)} ${(b.y-p).toFixed(1)} ${(b.width+2*p).toFixed(1)} ${(b.height+2*p).toFixed(1)}`);}catch(e){}};
  const seen=new WeakSet();
  return {draw:(it,svg)=>{
    if(!it.pic||!P[it.pic]){svg.dataset.pic="0";return false;}
    svg.setAttribute("viewBox","0 0 640 240");P[it.pic](svg,it);svg.dataset.pic="1";crop(svg);
    if(!seen.has(svg)&&window.ResizeObserver){seen.add(svg);new ResizeObserver(()=>crop(svg)).observe(svg);}
    return true;}};
})();
const drawPic=(it,svg,S)=>LABPX.draw(it,svg);

const CUR_C=[{"q": "Meter M is joined in series with the bulb. What is meter M?", "a": "Ammeter", "t": ["Voltmeter", "Rheostat", "Fuse"], "w": "An ammeter measures current. It is always joined in series.", "src": "🔬 Lab picture", "pic": "amSeries"}, {"q": "Meter M is joined across the resistor, in parallel. What does it measure?", "a": "Potential difference", "t": ["Current", "Charge", "Power"], "w": "This meter is a voltmeter. It is joined in parallel.", "src": "🔬 Lab picture", "pic": "vmParallel"}, {"q": "What does this circuit symbol stand for?", "a": "A battery (a combination of cells)", "t": ["A single cell", "An open plug key", "A resistor"], "w": "Cells joined together make a battery.", "src": "🔬 Lab picture", "pic": "battSym", "lay": "col"}, {"q": "How is an ammeter connected in a circuit?", "a": "In series", "t": ["In parallel", "Across the battery only", "It is not connected"], "w": "The whole current must pass through it.", "src": "📝 Exam question"}, {"q": "How is a voltmeter connected in a circuit?", "a": "In parallel", "t": ["In series", "Inside the cell", "It is not needed"], "w": "It is joined across the two points.", "src": "📝 Exam question"}, {"q": "How much energy is given to each coulomb of charge passing through a 6 V battery?", "a": "6 J", "t": ["1 J", "0.6 J", "36 J"], "w": "1 V = 1 J per coulomb, so 6 V gives 6 J to each coulomb.", "src": "📝 Exam question"}, {"q": "Which formula gives the potential difference?", "a": "V = W/Q", "t": ["V = Q/W", "V = W × Q", "V = Q/t"], "w": "Work done per unit charge.", "src": "📝 Exam question"}, {"q": "A current of 0.5 A flows through a bulb for 10 minutes. How much charge flows?", "a": "300 C", "t": ["5 C", "50 C", "3000 C"], "w": "Q = It = 0.5 A × 600 s = 300 C.", "src": "📝 Exam question"}, {"q": "Electric current is", "a": "The charge flowing through a cross-section in unit time", "t": ["The work done on a charge", "The energy stored in a cell", "The resistance of a wire"], "w": "I = Q/t. Its unit is the ampere.", "src": "📝 Exam question", "lay": "col"}, {"q": "The SI unit of potential difference is", "a": "Volt", "t": ["Ampere", "Ohm", "Coulomb"], "w": "1 V = 1 J/C.", "src": "📝 Exam question"}, {"q": "1 ampere is", "a": "1 coulomb of charge flowing per second", "t": ["1 joule per second", "1 ohm per volt", "1 electron per second"], "w": "1 A = 1 C/1 s.", "src": "📘 Section 11.1", "lay": "col"}, {"q": "The SI unit of electric charge is", "a": "Coulomb", "t": ["Ampere", "Volt", "Watt"], "w": "1 C is the charge of nearly 6 × 10¹⁸ electrons.", "src": "📘 Section 11.1"}, {"q": "The direction of electric current is taken as", "a": "Opposite to the flow of electrons", "t": ["The same as the flow of electrons", "Always from the bulb to the cell", "Always upward"], "w": "Current was first taken as a flow of positive charges.", "src": "📘 Section 11.1", "lay": "col"}, {"q": "1 mA (milliampere) is equal to", "a": "10⁻³ A", "t": ["10⁻⁶ A", "10³ A", "10⁻² A"], "w": "And 1 µA = 10⁻⁶ A.", "src": "📘 Section 11.1"}, {"q": "A continuous, closed path for electric current is called", "a": "An electric circuit", "t": ["A fuse", "A switch", "A resistor"], "w": "If the path is broken, the current stops.", "src": "📘 Section 11.1"}, {"q": "The charge on one electron is", "a": "1.6 × 10⁻¹⁹ C", "t": ["1 C", "6 × 10¹⁸ C", "1.6 × 10¹⁹ C"], "w": "It is a negative charge.", "src": "📘 Section 11.1"}, {"q": "What makes electrons flow along a wire?", "a": "A potential difference", "t": ["Gravity", "Friction", "The colour of the wire"], "w": "A cell or a battery sets up this difference.", "src": "📘 Section 11.2"}, {"q": "How much work is done in moving 2 C of charge across a potential difference of 12 V?", "a": "24 J", "t": ["6 J", "14 J", "0.17 J"], "w": "W = VQ = 12 V × 2 C = 24 J.", "src": "📘 Section 11.2"}, {"q": "To keep current flowing, a cell uses its", "a": "Stored chemical energy", "t": ["Weight", "Heat from the room", "Light"], "w": "The chemical action inside the cell keeps the potential difference.", "src": "📘 Section 11.2"}];
const CUR_B=[{"q": "Which part of a torch closes or opens its circuit?", "a": "The switch", "t": ["The bulb", "The reflector", "The glass"], "w": "A switch makes or breaks the circuit."}];
const OHM_C=[{"q": "This V–I graph is a straight line through the origin. What does it show?", "a": "V is directly proportional to I", "t": ["V falls as I rises", "V does not depend on I", "The current is always zero"], "w": "This is Ohm's law: V/I stays the same.", "src": "🔬 Lab picture", "pic": "viLine", "lay": "col"}, {"q": "Lines A and B are V–I graphs of two wires. Which wire has more resistance?", "a": "Wire A, with the steeper line", "t": ["Wire B, with the less steep line", "Both are equal", "We cannot say"], "w": "R = V/I, so a steeper V–I line means more resistance.", "src": "🔬 Lab picture", "pic": "viTwo", "lay": "col"}, {"q": "This symbol is used to control the current in a circuit. It stands for a", "a": "Rheostat (variable resistance)", "t": ["Fixed resistor", "Plug key", "Battery"], "w": "A rheostat changes the current without changing the battery.", "src": "🔬 Lab picture", "pic": "rheoSym", "lay": "col"}, {"q": "Write the formula for Ohm's law.", "a": "V = IR", "t": ["V = I/R", "V = R/I", "V = I + R"], "w": "The potential difference equals current times resistance.", "src": "📝 Exam question"}, {"q": "Ramya sees the current rise in the same proportion as the potential difference. This is true only when", "a": "The temperature of the conductor stays the same", "t": ["The conductor is heated all the time", "The length of the conductor is changed", "The material is changed"], "w": "Ohm's law holds at constant temperature.", "src": "📝 Exam question", "lay": "col"}, {"q": "A student wants to change the current without changing the battery. What should she use?", "a": "A rheostat in series", "t": ["A voltmeter in series", "A bigger bulb", "A fuse in parallel"], "w": "Changing the rheostat's resistance changes the current.", "src": "📝 Exam question", "lay": "col"}, {"q": "Why should the plug key be opened after each reading in the Ohm's law experiment?", "a": "So the resistor does not heat up and change its resistance", "t": ["To save the battery only", "To make the ammeter read zero", "To make the readings bigger"], "w": "Nandu is right: heating changes resistance.", "src": "📝 Exam question", "lay": "col"}, {"q": "If the potential difference across a resistor is halved, the current", "a": "Is also halved", "t": ["Is doubled", "Stays the same", "Becomes zero"], "w": "I = V/R, with R fixed.", "src": "📝 Exam question"}, {"q": "Ohm's law: the potential difference across a conductor is directly proportional to", "a": "The current through it, at constant temperature", "t": ["Its length only", "The time", "Its power"], "w": "V ∝ I, so V = IR.", "src": "📝 Exam question", "lay": "col"}, {"q": "The SI unit of resistance is", "a": "Ohm (Ω)", "t": ["Volt", "Ampere", "Ohm-metre"], "w": "Ohm-metre is the unit of resistivity.", "src": "📝 Exam question"}, {"q": "1 ohm is the resistance of a conductor when", "a": "1 V across it drives a current of 1 A", "t": ["1 A flows for 1 s", "1 J of work is done", "1 C passes in 1 s"], "w": "R = V/I = 1 V/1 A = 1 Ω.", "src": "📘 Section 11.4", "lay": "col"}, {"q": "If the resistance is doubled at the same voltage, the current", "a": "Becomes half", "t": ["Doubles", "Stays the same", "Becomes four times"], "w": "I = V/R.", "src": "📘 Section 11.4"}, {"q": "How much current does a bulb of 1200 Ω draw from a 220 V supply?", "a": "0.18 A", "t": ["5.45 A", "1.8 A", "0.018 A"], "w": "I = V/R = 220/1200 = 0.18 A.", "src": "📘 Section 11.4"}, {"q": "A heater coil of 100 Ω is used on 220 V. What current does it draw?", "a": "2.2 A", "t": ["0.45 A", "22 A", "120 A"], "w": "I = 220/100 = 2.2 A.", "src": "📘 Section 11.4"}, {"q": "A heater draws 4 A at 60 V. What current will it draw at 120 V?", "a": "8 A", "t": ["2 A", "4 A", "16 A"], "w": "R = 60/4 = 15 Ω, so I = 120/15 = 8 A.", "src": "📘 Section 11.4"}, {"q": "The opposition a conductor offers to the flow of current is its", "a": "Resistance", "t": ["Potential", "Charge", "Power"], "w": "Its unit is the ohm.", "src": "📘 Section 11.4"}, {"q": "A circuit part with a fixed resistance is called a", "a": "Resistor", "t": ["Rheostat", "Ammeter", "Cell"], "w": "A rheostat has a resistance that can be changed.", "src": "📘 Section 11.4"}, {"q": "Materials with very high resistance, which hardly let current pass, are", "a": "Insulators", "t": ["Conductors", "Alloys", "Resistors"], "w": "Glass and rubber are insulators.", "src": "📘 Section 11.4"}, {"q": "In the Ohm's law activity, what does V/I give?", "a": "The resistance of the wire", "t": ["The power", "The charge", "The time"], "w": "V/I is the same for each reading.", "src": "📘 Section 11.4"}];
const OHM_B=[{"q": "Who discovered Ohm's law?", "a": "Georg Simon Ohm", "t": ["Michael Faraday", "Isaac Newton", "James Watt"], "w": "He was a German physicist (1787–1854)."}];
const RES_C=[{"q": "Both wires are nichrome and equally thick. Wire B is twice as long as A. The resistance of B is", "a": "Twice that of A", "t": ["Half that of A", "Equal to A", "Four times A"], "w": "R ∝ l: a longer wire has more resistance.", "src": "🔬 Lab picture", "pic": "wiresLen"}, {"q": "Both copper wires have the same length. Which has less resistance?", "a": "The thick wire", "t": ["The thin wire", "Both are equal", "Neither has resistance"], "w": "R ∝ 1/A: a thicker wire has a bigger area.", "src": "🔬 Lab picture", "pic": "wiresThick"}, {"q": "The coiled wire in this bulb glows white-hot. It is made of", "a": "Tungsten", "t": ["Copper", "Nichrome", "Aluminium"], "w": "Tungsten melts only at 3380 °C.", "src": "🔬 Lab picture", "pic": "bulbFil"}, {"q": "On what factors does the resistance of a conductor depend?", "a": "Its length, its area of cross-section and its material", "t": ["Only its length", "Only its colour", "The battery used"], "w": "R = ρl/A.", "src": "📝 Exam question", "lay": "col"}, {"q": "The SI unit of resistivity is", "a": "Ohm-metre (Ω m)", "t": ["Ohm", "Ohm per metre", "Ohm per square metre"], "w": "ρ = RA/l.", "src": "📝 Exam question"}, {"q": "A 4 Ω wire is made twice as thick (double the diameter), with the same length. Its new resistance is", "a": "1 Ω", "t": ["2 Ω", "8 Ω", "16 Ω"], "w": "Double the diameter gives 4 times the area, so R becomes 4/4 = 1 Ω.", "src": "📝 Exam question"}, {"q": "What happens to the resistivity of a wire if its length is doubled?", "a": "No change", "t": ["It doubles", "It halves", "It becomes four times"], "w": "Resistivity depends only on the material and temperature.", "src": "📝 Exam question"}, {"q": "A wire's length is doubled and its area of cross-section is halved. Its resistance becomes", "a": "4 times", "t": ["2 times", "Half", "The same"], "w": "R = ρl/A: 2 ÷ ½ = 4.", "src": "📝 Exam question"}, {"q": "Why are alloys used in electric heating devices?", "a": "They have high resistivity and do not oxidise easily when hot", "t": ["They are cheap and light", "They have low resistivity", "They are magnetic"], "w": "Nichrome is used in heaters and irons.", "src": "📝 Exam question", "lay": "col"}, {"q": "Why are copper and aluminium used for transmission wires?", "a": "They have low resistivity", "t": ["They have high resistivity", "They melt easily", "They are insulators"], "w": "Less energy is wasted as heat.", "src": "📝 Exam question"}, {"q": "Latha thinks only a longer wire has more resistance. What else increases resistance?", "a": "Making the wire thinner", "t": ["Making the wire thicker", "Using a bigger battery", "Using a shorter wire"], "w": "A smaller area of cross-section means more resistance.", "src": "📝 Exam question"}, {"q": "To reduce the resistance of a long nichrome wire, you can", "a": "Shorten it, or make it thicker", "t": ["Make it longer", "Make it thinner", "Paint it"], "w": "R ∝ l/A.", "src": "📝 Exam question", "lay": "col"}, {"q": "In R = ρl/A, the symbol ρ stands for the", "a": "Resistivity of the material", "t": ["Length", "Area", "Current"], "w": "ρ is a property of the material.", "src": "📘 Section 11.5"}, {"q": "The resistivity of metals and alloys is", "a": "Very low, 10⁻⁸ Ω m to 10⁻⁶ Ω m", "t": ["Very high, 10¹² Ω m to 10¹⁷ Ω m", "Zero", "The same as glass"], "w": "So they are good conductors.", "src": "📘 Section 11.5", "lay": "col"}, {"q": "Which is the best conductor in Table 11.2?", "a": "Silver", "t": ["Copper", "Iron", "Mercury"], "w": "Silver has the lowest resistivity, 1.60 × 10⁻⁸ Ω m.", "src": "📘 Section 11.5"}, {"q": "Which is a better conductor, iron or mercury?", "a": "Iron", "t": ["Mercury", "Both are equal", "Neither conducts"], "w": "Iron: 10.0 × 10⁻⁸ Ω m. Mercury: 94.0 × 10⁻⁸ Ω m.", "src": "📘 Section 11.5"}, {"q": "A wire has resistance 4 Ω. A wire of the same material with half the length and double the area has", "a": "1 Ω", "t": ["2 Ω", "4 Ω", "8 Ω"], "w": "R ∝ l/A: ½ ÷ 2 = ¼, and ¼ × 4 Ω = 1 Ω.", "src": "📘 Section 11.5"}, {"q": "Nichrome is an alloy of", "a": "Nickel, chromium, manganese and iron", "t": ["Copper and zinc", "Lead and tin", "Iron and carbon"], "w": "It has a very high resistivity.", "src": "📘 Section 11.5", "lay": "col"}, {"q": "Glass, rubber and ebonite have a resistivity of about", "a": "10¹² Ω m to 10¹⁷ Ω m", "t": ["10⁻⁸ Ω m", "1 Ω m", "Zero"], "w": "They are insulators.", "src": "📘 Section 11.5"}];
const RES_B=[{"q": "Why is the cord of an electric iron covered with rubber or plastic?", "a": "They are insulators and protect us from shock", "t": ["They conduct better", "They make the cord heavy", "They make it glow"], "w": "Insulators do not let current reach our hands.", "lay": "col"}];
const COMB_C=[{"q": "These 2 Ω, 3 Ω and 6 Ω resistors are in series. What is the total resistance?", "a": "11 Ω", "t": ["1 Ω", "6 Ω", "36 Ω"], "w": "Rs = R₁ + R₂ + R₃ = 2 + 3 + 6 = 11 Ω.", "src": "🔬 Lab picture", "pic": "serRes"}, {"q": "These 3 Ω and 6 Ω resistors are in parallel. What is the total resistance?", "a": "2 Ω", "t": ["9 Ω", "4.5 Ω", "18 Ω"], "w": "1/Rp = 1/3 + 1/6 = 1/2, so Rp = 2 Ω.", "src": "🔬 Lab picture", "pic": "parRes"}, {"q": "One bulb has fused, but the other two still glow. How are the bulbs connected?", "a": "In parallel", "t": ["In series", "With no wires", "Through the fused bulb"], "w": "In parallel, each bulb has its own path.", "src": "🔬 Lab picture", "pic": "houseBulbs"}, {"q": "2 Ω and 4 Ω resistors are connected in series. What is the resultant resistance?", "a": "6 Ω", "t": ["2 Ω", "1.33 Ω", "8 Ω"], "w": "R = R₁ + R₂ = 2 + 4 = 6 Ω.", "src": "📝 Exam question"}, {"q": "You need less than 2 Ω, but you have only two 3 Ω resistors. How should you connect them?", "a": "In parallel", "t": ["In series", "Use only one", "They cannot be used"], "w": "3 Ω and 3 Ω in parallel give 1.5 Ω.", "src": "📝 Exam question"}, {"q": "Mohan wants house appliances in series. Karuna wants them in parallel. Who is right?", "a": "Karuna: each gets the same voltage and works on its own", "t": ["Mohan: series saves wire", "Both are right", "Neither is right"], "w": "Household circuits are wired in parallel.", "src": "📝 Exam question", "lay": "col"}, {"q": "What is the lowest total resistance possible with coils of 4 Ω, 8 Ω and 12 Ω?", "a": "2.18 Ω", "t": ["24 Ω", "1.71 Ω", "4 Ω"], "w": "Join all three in parallel: 1/R = 1/4 + 1/8 + 1/12 = 11/24, so R ≈ 2.18 Ω.", "src": "📝 Exam question"}, {"q": "How can 2 Ω, 3 Ω and 6 Ω be joined to give 4 Ω?", "a": "3 Ω and 6 Ω in parallel, then 2 Ω in series", "t": ["All three in series", "All three in parallel", "2 Ω and 3 Ω in parallel, then 6 Ω in series"], "w": "3 ∥ 6 = 2 Ω, and 2 + 2 = 4 Ω.", "src": "📝 Exam question", "lay": "col"}, {"q": "How can 2 Ω, 3 Ω and 6 Ω be joined to give 1 Ω?", "a": "All three in parallel", "t": ["All three in series", "2 Ω and 3 Ω in series, then 6 Ω in parallel", "Use only the 6 Ω"], "w": "1/R = 1/2 + 1/3 + 1/6 = 1, so R = 1 Ω.", "src": "📝 Exam question", "lay": "col"}, {"q": "Two resistors in series are joined to a battery and the current falls. Why?", "a": "The total resistance increases, so I = V/R falls", "t": ["The battery gets stronger", "The voltage increases", "The wires become thicker"], "w": "In series, R = R₁ + R₂.", "src": "📝 Exam question", "lay": "col"}, {"q": "Resistors are said to be in series when", "a": "The same current flows through each one", "t": ["The same voltage is across each one", "They glow", "They are kept in a box"], "w": "There is only one path for the current.", "src": "📝 Exam question", "lay": "col"}, {"q": "Resistors are said to be in parallel when", "a": "The potential difference across each one is the same", "t": ["The current through each one is the same", "They are in a straight line", "They are hot"], "w": "Each one is joined across the same two points.", "src": "📝 Exam question", "lay": "col"}, {"q": "Why is the series arrangement not used in household circuits?", "a": "If one appliance fails, all the others stop working", "t": ["It uses too much wire", "It gives too much current", "It is too costly"], "w": "The single path for current is broken.", "src": "📝 Exam question", "lay": "col"}, {"q": "In a series circuit, the total potential difference V equals", "a": "V₁ + V₂ + V₃", "t": ["V₁ = V₂ = V₃", "V₁ × V₂ × V₃", "1/V₁ + 1/V₂ + 1/V₃"], "w": "The battery's voltage is shared among the resistors.", "src": "📘 Section 11.6"}, {"q": "In a parallel circuit, the total current I equals", "a": "I₁ + I₂ + I₃", "t": ["I₁ = I₂ = I₃", "I₁ × I₂ × I₃", "1/I₁ + 1/I₂ + 1/I₃"], "w": "The current divides among the branches.", "src": "📘 Section 11.6"}, {"q": "A 20 Ω lamp and a 4 Ω conductor are in series with a 6 V battery. What is the current?", "a": "0.25 A", "t": ["1.5 A", "0.3 A", "4 A"], "w": "R = 24 Ω, so I = 6/24 = 0.25 A.", "src": "📘 Section 11.6"}, {"q": "5 Ω, 10 Ω and 30 Ω are in parallel. What is the total resistance?", "a": "3 Ω", "t": ["45 Ω", "15 Ω", "0.33 Ω"], "w": "1/R = 1/5 + 1/10 + 1/30 = 10/30, so R = 3 Ω.", "src": "📘 Section 11.6"}, {"q": "5 Ω, 10 Ω and 30 Ω are in parallel with a 12 V battery. What is the total current?", "a": "4 A", "t": ["2.4 A", "0.4 A", "1.2 A"], "w": "I = 12/3 = 4 A (that is, 2.4 + 1.2 + 0.4).", "src": "📘 Section 11.6"}, {"q": "The total resistance of resistors in parallel is", "a": "Less than the smallest one", "t": ["More than the largest one", "Equal to their sum", "Equal to the largest one"], "w": "Each new branch gives the current another path.", "src": "📘 Section 11.6"}];
const COMB_B=[{"q": "Why do festival 'fairy lights' in series all go off when one bulb fails?", "a": "The only path for the current is broken", "t": ["The other bulbs melt", "The plug becomes hot", "The battery changes"], "w": "So electricians must check every bulb."}];
const HEAT_C=[{"q": "This thin wire melts and breaks the circuit when too much current flows. It is a", "a": "Fuse", "t": ["Rheostat", "Resistor", "Switch"], "w": "A fuse protects circuits and appliances.", "src": "🔬 Lab picture", "pic": "fuseHolder"}, {"q": "The heater coil glows, but its cord does not. Why?", "a": "The coil has high resistance; the copper cord has very low resistance", "t": ["The cord is far from the coil", "The cord carries no current", "The coil gets more voltage from the sun"], "w": "More resistance gives more heat (H = I²Rt).", "src": "🔬 Lab picture", "pic": "heaterCord", "lay": "col"}, {"q": "The electricity meter at home counts energy in", "a": "Kilowatt-hours (units)", "t": ["Volts", "Amperes", "Ohms"], "w": "1 unit = 1 kWh = 3.6 × 10⁶ J.", "src": "🔬 Lab picture", "pic": "energyMeter"}, {"q": "1 kWh is equal to how many joules?", "a": "3.6 × 10⁶ J", "t": ["3600 J", "1000 J", "3.6 × 10³ J"], "w": "1 kW × 3600 s = 3,600,000 J.", "src": "📝 Exam question"}, {"q": "Which formula gives electric power in terms of voltage and current?", "a": "P = VI", "t": ["P = V/I", "P = I/V", "P = V + I"], "w": "Power = voltage × current.", "src": "📝 Exam question"}, {"q": "Which has more resistance: a 220 V, 100 W bulb or a 220 V, 60 W bulb?", "a": "The 60 W bulb", "t": ["The 100 W bulb", "Both are equal", "It cannot be found"], "w": "R = V²/P, so less power means more resistance.", "src": "📝 Exam question"}, {"q": "Why are electric bulbs filled with nitrogen and argon?", "a": "To stop the tungsten filament from oxidising", "t": ["To make the light coloured", "To cool the glass", "To increase the current"], "w": "This makes the bulb last longer.", "src": "📝 Exam question", "lay": "col"}, {"q": "What is the job of a fuse in a circuit?", "a": "It stops very high currents to protect circuits and appliances", "t": ["It makes the current bigger", "It stores charge", "It measures voltage"], "w": "It melts and breaks the circuit.", "src": "📝 Exam question", "lay": "col"}, {"q": "To save electricity, which should a family cut first: a 250 W TV for 1 hour, or a 1200 W grinder for 10 minutes?", "a": "The TV: 250 Wh, against 200 Wh for the grinder", "t": ["The grinder: it has more power", "Both use the same energy", "Neither uses energy"], "w": "Energy = power × time. 1200 W × ⅙ h = 200 Wh.", "src": "📝 Exam question", "lay": "col"}, {"q": "Name two appliances that work on the heating effect of current.", "a": "Electric iron and electric heater", "t": ["Fan and radio", "Switch and plug", "Mobile phone and remote"], "w": "They turn electrical energy into heat.", "src": "📝 Exam question"}, {"q": "The heat produced in a resistor is given by", "a": "H = I²Rt", "t": ["H = IR²t", "H = I/Rt", "H = VR"], "w": "This is Joule's law of heating.", "src": "📝 Exam question"}, {"q": "The SI unit of electric power is", "a": "Watt", "t": ["Joule", "Volt", "Kilowatt-hour"], "w": "1 W = 1 J/s.", "src": "📝 Exam question"}, {"q": "By Joule's law, the heat produced is directly proportional to", "a": "The square of the current", "t": ["The current", "The square root of the current", "Nothing"], "w": "Double the current gives four times the heat.", "src": "📘 Section 11.7"}, {"q": "An electric heater of 20 Ω draws 5 A for 30 s. How much heat is produced?", "a": "1.5 × 10⁴ J", "t": ["3000 J", "600 J", "1.5 × 10³ J"], "w": "H = I²Rt = 25 × 20 × 30 = 15,000 J.", "src": "📘 Section 11.7"}, {"q": "100 J of heat is produced each second in a 4 Ω resistor. What is the potential difference across it?", "a": "20 V", "t": ["25 V", "5 V", "400 V"], "w": "I = √(100/4) = 5 A, so V = IR = 20 V.", "src": "📘 Section 11.7"}, {"q": "A fuse wire is made of a metal or alloy with", "a": "A low melting point", "t": ["A very high melting point", "No resistance", "Magnetic properties"], "w": "It must melt quickly when the current is too high.", "src": "📘 Section 11.7"}, {"q": "An electric iron of 1 kW works on 220 V. Which fuse does it need?", "a": "5 A", "t": ["1 A", "2 A", "50 A"], "w": "I = P/V = 1000/220 = 4.54 A, so a 5 A fuse.", "src": "📘 Section 11.7"}, {"q": "A bulb on 220 V draws 0.50 A. What is its power?", "a": "110 W", "t": ["440 W", "220 W", "0.0023 W"], "w": "P = VI = 220 × 0.50 = 110 W.", "src": "📘 Section 11.8"}, {"q": "A 400 W refrigerator runs 8 hours a day for 30 days. How much energy does it use?", "a": "96 kWh", "t": ["12 kWh", "3.2 kWh", "960 kWh"], "w": "E = 0.4 kW × 8 h × 30 = 96 kWh.", "src": "📘 Section 11.8"}];
const HEAT_B=[{"q": "Why should we switch off a geyser when we do not need it?", "a": "It has high power, so it uses many units of electricity", "t": ["It makes the water cold", "It stops the fuse", "It makes the bulbs brighter"], "w": "Saving units saves money and energy.", "lay": "col"}];
const G={
  cur:makeGame("cur",CUR_C,CUR_B,drawPic),
  ohm:makeGame("ohm",OHM_C,OHM_B,drawPic),
  res:makeGame("res",RES_C,RES_B,drawPic),
  comb:makeGame("comb",COMB_C,COMB_B,drawPic),
  heat:makeGame("heat",HEAT_C,HEAT_B,drawPic)
};
window.__MN={G};
})();
