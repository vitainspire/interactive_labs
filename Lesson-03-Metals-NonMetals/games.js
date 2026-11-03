/* Lesson 3: Metals and Non-metals — games.html content and engine.
   This lesson's quiz-tab engine (DOM shorthand, music/sound effects, score
   tracker, nav wiring, auto-next) was written bespoke for this lesson and
   verified to differ from ../shared/app.js (its mark(), shuffle() and pick()
   are not byte-identical to the shared versions, and it uses its own
   auto-next countdown system instead of the shared one), so it is kept
   self-contained here rather than split against shared/app.js. */
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

/* ================= GAME 1: Properties ================= */
const MN=["Metal","Non-metal"];
const mq=(ic,el_,a,w)=>({q:"Metal or non-metal?",card:[ic,el_],a,t:MN.filter(x=>x!==a),w,lay:"two"});
const PR_FIRST=[
  {q:"Iron, copper and aluminium shine after rubbing with sand paper. This shine is called",a:"Metallic lustre",t:["Malleability","Ductility","Sonority"],w:"Metals in their pure state have a shining surface.",card:["✨","Shining metal surface"],src:"📘 Activity 3.1"},
  {q:"Which metal can be cut easily with a knife?",a:"Sodium",t:["Iron","Copper","Aluminium"],w:"Sodium is very soft. Metals are generally hard, but hardness varies.",card:["🔪","Cutting metals"],src:"📘 Activity 3.2"},
  {q:"Some metals can be beaten into thin sheets. This property is called",a:"Malleability",t:["Ductility","Lustre","Sonority"],w:"Malleable metals can be hammered into sheets.",card:["🔨","Hammering a metal"],src:"📘 Activity 3.3"},
  {q:"Which are the most malleable metals?",a:"Gold and silver",t:["Iron and lead","Sodium and potassium","Mercury and zinc"],w:"Gold and silver are the most malleable metals.",src:"📘 Activity 3.3"},
  {q:"The ability of metals to be drawn into thin wires is called",a:"Ductility",t:["Malleability","Lustre","Conductivity"],w:"Copper and aluminium wires show ductility.",card:["〰️","Metal wires"],src:"📘 Activity 3.4"},
  {q:"Which is the most ductile metal?",a:"Gold",t:["Iron","Lead","Sodium"],w:"A wire about 2 km long can be drawn from one gram of gold.",card:["🥇","2 km wire from 1 g"],src:"📘 Activity 3.4"},
  {q:"Why are metals like aluminium and copper used to make cooking vessels?",a:"They are good conductors of heat and have high melting points",t:["They are poor conductors of heat","They melt easily","They are non-metals"],w:"In Activity 3.5 the wire gets hot but does not melt.",lay:"col",card:["🍳","Cooking vessels"],src:"📘 Activity 3.5"},
  {q:"Which are the best conductors of heat?",a:"Silver and copper",t:["Lead and mercury","Iron and zinc","Sodium and potassium"],w:"Lead and mercury are comparatively poor conductors of heat.",src:"📘 Activity 3.5"},
  {q:"A metal is placed between A and B in a circuit and the bulb glows. What does this show?",a:"Metals conduct electricity",t:["Metals are insulators","The bulb is broken","Metals are non-metals"],w:"Metals are good conductors of electricity.",card:["💡","Circuit test"],src:"📘 Activity 3.6"},
  {q:"Why are electric wires coated with PVC or rubber?",a:"PVC and rubber do not conduct electricity, so they protect us from shock",t:["To make wires shine","To make wires conduct better","To make wires heavy"],w:"The coating is an insulator.",lay:"col",card:["🔌","Coated wires"],src:"📘 Activity 3.6"},
  {q:"Metals that produce a sound when struck are called",a:"Sonorous",t:["Ductile","Malleable","Lustrous"],w:"That is why school bells are made of metals.",card:["🔔","School bell"],src:"📘 Section 3.1.1"},
  {q:"Non-metals are solids or gases. Which non-metal is a liquid?",a:"Bromine",t:["Iodine","Sulphur","Carbon"],w:"Bromine is the only liquid non-metal.",card:["🧪","Liquid non-metal"],src:"📘 Section 3.1.2"},
  {q:"Which metal is a liquid at room temperature?",a:"Mercury",t:["Sodium","Gallium","Lead"],w:"All metals except mercury are solids at room temperature.",card:["🌡️","Liquid metal"],src:"📘 Section 3.1.2"},
  {q:"Which two metals melt if kept on your palm?",a:"Gallium and caesium",t:["Iron and copper","Gold and silver","Zinc and lead"],w:"They have very low melting points.",card:["✋","Melts on the palm"],src:"📘 Section 3.1.2"},
  {q:"Iodine is a non-metal, but it is",a:"Lustrous (shiny)",t:["A liquid","A good conductor","Malleable"],w:"Iodine is an exception: a shiny non-metal.",card:["🟣","Iodine"],src:"📘 Section 3.1.2"},
  {q:"Diamond is an allotrope of carbon. It is",a:"The hardest natural substance",t:["A good conductor of electricity","A liquid","A soft metal"],w:"Diamond also has very high melting and boiling points.",card:["💎","Diamond"],src:"📘 Section 3.1.2"},
  {q:"Which non-metal is a conductor of electricity?",a:"Graphite",t:["Diamond","Sulphur","Iodine"],w:"Graphite, an allotrope of carbon, conducts electricity.",card:["✏️","Graphite"],src:"📘 Section 3.1.2"},
  {q:"Lithium, sodium and potassium are alkali metals. They are",a:"Soft, with low density and low melting points",t:["Very hard and heavy","Liquids","Non-metals"],w:"They are so soft that they can be cut with a knife.",lay:"col",src:"📘 Section 3.1.2"},
  {q:"Which metal is the best conductor of heat?",a:"Silver",t:["Lead","Mercury","Iron"],w:"Silver, then copper, are the best conductors of heat.",src:"📘 In-text Q1 (iii)"},
  {q:"Which metal is a poor conductor of heat?",a:"Lead",t:["Silver","Copper","Aluminium"],w:"Lead and mercury are poor conductors of heat.",src:"📘 In-text Q1 (iv)"},
  {q:"With a hammer, battery, bulb, wires and switch, how can you tell a metal from a non-metal?",a:"A metal flattens when hammered and makes the bulb glow; a non-metal breaks and the bulb does not glow",t:["Both flatten and both make the bulb glow","Only the colour can tell us","Metals break when hammered"],w:"Remember graphite is an exception: it conducts electricity.",lay:"col",src:"📘 Exercise 5"},
  {q:"Why are platinum, gold and silver used to make jewellery?",a:"They are lustrous and do not react with air or water",t:["They are cheap","They are soft liquids","They rust quickly"],w:"They keep their shine for a long time.",lay:"col",card:["💍","Jewellery"],src:"📘 Exercise 12 (a)"},
  {q:"Why is copper used to make hot water tanks, and not steel?",a:"Copper does not react with water; iron in steel would rust",t:["Copper is cheaper than steel","Copper is a non-metal","Steel does not conduct heat"],w:"Copper does not react with cold water, hot water or steam.",lay:"col",card:["🛁","Hot water tank"],src:"📘 Exercise 16"}
];
const PR_MORE=[
  mq("⚫","Carbon","Non-metal","Carbon is a non-metal (coal, graphite, diamond)."),
  mq("🟡","Sulphur","Non-metal","Sulphur is a brittle yellow non-metal."),
  mq("🟣","Iodine","Non-metal","Iodine is a non-metal, though it is lustrous."),
  mq("🔩","Iron","Metal","Iron is a metal."),
  mq("🥫","Aluminium","Metal","Aluminium is a metal."),
  mq("💧","Mercury","Metal","Mercury is a metal, though it is a liquid."),
  mq("🧂","Sodium","Metal","Sodium is a soft metal."),
  mq("🎈","Hydrogen","Non-metal","Hydrogen is a non-metal gas."),
  {q:"Which of these is <b>not</b> malleable?",a:"Sulphur",t:["Gold","Aluminium","Copper"],w:"Non-metals are brittle. They break when hammered."},
  {q:"Dull, brittle and a poor conductor. This element is most likely a",a:"Non-metal",t:["Metal"],w:"These are properties of non-metals.",lay:"two"},
  {q:"Aluminium foil is used to wrap food. Which property is used?",a:"Malleability",t:["Ductility","Sonority","Low melting point"],w:"Aluminium can be beaten into thin sheets.",card:["🌯","Aluminium foil"]},
  {q:"Copper is used for electric wires. Which two properties are used?",a:"Ductility and good conduction of electricity",t:["Lustre and sonority","Malleability and low melting point","Brittleness and hardness"],w:"Copper can be drawn into wires and conducts electricity well.",lay:"col",card:["🔌","Copper wire"]},
  {q:"Temple bells and school bells are made of metals because metals are",a:"Sonorous",t:["Ductile","Lustrous","Soft"],w:"Metals ring when struck."},
  {q:"Which pair are both exceptions among metals?",a:"Mercury (liquid) and sodium (soft)",t:["Iron and copper","Gold and silver","Zinc and lead"],w:"Mercury is liquid; sodium can be cut with a knife."},
  {q:"Which pair are both exceptions among non-metals?",a:"Iodine (lustrous) and graphite (conducts)",t:["Sulphur and oxygen","Hydrogen and nitrogen","Carbon dioxide and water"],w:"These do not follow the usual non-metal properties."},
  {q:"Why can we not group elements by physical properties alone?",a:"There are many exceptions",t:["All metals look the same","Non-metals have no properties","Metals and non-metals are identical"],w:"Chemical properties help to classify elements more clearly."}
];
function drawPr(){return false;}

/* ================= GAME 2: Oxide Lab ================= */
const OXD={
  MgO:{acid:1,base:0,kind:"Basic",pc:"#F4F4F4"},CuO:{acid:1,base:0,kind:"Basic",pc:"#2B2B2B"},CaO:{acid:1,base:0,kind:"Basic",pc:"#F4F4F4"},
  Al2O3:{acid:1,base:1,kind:"Amphoteric",pc:"#F4F4F4"},ZnO:{acid:1,base:1,kind:"Amphoteric",pc:"#FFFDF4"},
  SO2:{acid:0,base:1,kind:"Acidic",gas:true},CO2:{acid:0,base:1,kind:"Acidic",gas:true}
};
const REACT=["With HCl only","With NaOH only","With both","With neither"];
const ansOf=o=>o.acid&&o.base?"With both":o.acid?"With HCl only":o.base?"With NaOH only":"With neither";
const tt=(ox,src,q)=>({q:q||`${ox} is added to dilute HCl and to NaOH solution. Where does it react?`,a:ansOf(OXD[ox]),t:REACT.filter(x=>x!==ansOf(OXD[ox])),w:{Basic:`${ox} is a basic oxide. It reacts only with the acid.`,Acidic:`${ox} is an acidic oxide. It reacts only with the base.`,Amphoteric:`${ox} is amphoteric. It reacts with both the acid and the base to give salt and water.`}[OXD[ox].kind],sc:{tt:ox},src});
const kq=(ox,src)=>({q:`What type of oxide is ${ox}?`,a:OXD[ox].kind,t:["Basic","Acidic","Amphoteric"].filter(x=>x!==OXD[ox].kind),w:`${ox}: ${OXD[ox].kind.toLowerCase()} oxide.`,lay:"three",sc:{tt:ox,showAns:true},src});
const OX_FIRST=[
  {q:"How does a magnesium ribbon burn in air?",a:"With a dazzling white flame",t:["With a blue flame","It does not burn","With a green flame"],w:"Magnesium burns brightly and forms magnesium oxide (white ash).",card:["🔥","Burning magnesium"],src:"📘 Activity 3.8"},
  {q:"The ash of magnesium is dissolved in water. It turns red litmus blue. So magnesium oxide is",a:"Basic",t:["Acidic","Amphoteric"],w:"MgO + H2O → Mg(OH)2, a base.",lay:"three",card:["🔴→🔵","MgO solution + red litmus"],src:"📘 Activity 3.8"},
  {q:"Sulphur is burnt. The fumes dissolved in water turn blue litmus red. So sulphur dioxide is",a:"Acidic",t:["Basic","Amphoteric"],w:"SO2 + H2O → H2SO3, an acid.",lay:"three",card:["🔵→🔴","SO2 solution + blue litmus"],src:"📘 Activity 3.8"},
  {q:"In general, what kind of oxides do metals and non-metals form?",a:"Metals: basic|Non-metals: acidic",t:["Metals: acidic|Non-metals: basic","Both: basic|—","Both: acidic|—"],w:"Most metals give basic oxides; most non-metals give acidic oxides.",src:"📘 Section 3.1.2"},
  {q:"Copper is heated in air. What forms?",a:"Black copper(II) oxide",t:["Green copper carbonate","White copper oxide","No change"],w:"2Cu + O2 → 2CuO, a black oxide.",card:["⚗️","2Cu + O2 → 2CuO"],src:"📘 Section 3.2.1"},
  {q:"Complete: 4Al + 3O2 →",a:"2Al2O3",t:["4AlO","Al2O3","2AlO3"],w:"Aluminium forms aluminium oxide, Al2O3.",card:["⚗️","4Al + 3O2 → ?"],src:"📘 Section 3.2.1"},
  {q:"Metal oxides that react with <b>both acids and bases</b> to give salt and water are called",a:"Amphoteric oxides",t:["Basic oxides","Acidic oxides","Neutral oxides"],w:"Amphoteric means ‘both’: they act like a base with acids and like an acid with bases.",sc:{tt:"Al2O3",showAns:true},src:"📘 Section 3.2.1"},
  {q:"Which two oxides are amphoteric?",a:"Al2O3 and ZnO",t:["MgO and CaO","SO2 and CO2","CuO and Na2O"],w:"Aluminium oxide and zinc oxide are amphoteric.",card:["⚖️","Amphoteric oxides"],src:"📘 Section 3.2.1"},
  tt("Al2O3","📘 Section 3.2.1"),
  {q:"Aluminium oxide reacts with hydrochloric acid. Complete it.",card:S=>["⚗️",`Al2O3 + 6HCl → ${S.answered?"2AlCl3 + 3H2O":"<span class=\"slot\">?</span>"}`],a:"2AlCl3 + 3H2O",t:["2AlCl3 + 3H2","Al2Cl3 + 3H2O","2NaAlO2 + H2O"],w:"Here Al2O3 behaves like a base: acid + base → salt + water.",src:"📘 Section 3.2.1"},
  {q:"Aluminium oxide reacts with sodium hydroxide. Complete it.",card:S=>["⚗️",`Al2O3 + 2NaOH → ${S.answered?"2NaAlO2 + H2O":"<span class=\"slot\">?</span>"}`],a:"2NaAlO2 + H2O",t:["2AlCl3 + 3H2O","Na2O + Al2(OH)3","2NaAl + H2O2"],w:"Here Al2O3 behaves like an acid: it gives a salt and water with a base.",src:"📘 Section 3.2.1"},
  {q:"NaAlO2 is called",a:"Sodium aluminate",t:["Aluminium chloride","Sodium zincate","Aluminium oxide"],w:"Al2O3 + 2NaOH → 2NaAlO2 (sodium aluminate) + H2O.",card:["🏷️","NaAlO2"],src:"📘 Section 3.2.1"},
  {q:"In Al2O3 + 6HCl → 2AlCl3 + 3H2O, aluminium oxide behaves like",a:"A base",t:["An acid","A metal","A salt"],w:"It neutralises the acid, so it acts as a base.",card:["⚗️","Al2O3 + 6HCl"],src:"📘 Section 3.2.1"},
  {q:"In Al2O3 + 2NaOH → 2NaAlO2 + H2O, aluminium oxide behaves like",a:"An acid",t:["A base","A metal","A salt"],w:"It neutralises the base, so it acts as an acid.",card:["⚗️","Al2O3 + 2NaOH"],src:"📘 Section 3.2.1"},
  {q:"Most metal oxides do not dissolve in water. Which ones dissolve to form alkalis?",a:"Sodium oxide and potassium oxide",t:["Copper oxide and iron oxide","Aluminium oxide and zinc oxide","Magnesium oxide and copper oxide"],w:"Na2O + H2O → 2NaOH; K2O + H2O → 2KOH.",lay:"col",src:"📘 Section 3.2.1"},
  {q:"Complete: Na2O + H2O →",a:"2NaOH",t:["NaOH","Na2O2 + H2","2Na + H2O2"],w:"Sodium oxide dissolves in water to give the alkali NaOH.",card:["⚗️","Na2O + H2O → ?"],src:"📘 Section 3.2.1"},
  {q:"Why are sodium and potassium kept in kerosene oil?",a:"They react so vigorously with air that they catch fire",t:["To make them shine","To keep them cold","Kerosene makes them hard"],w:"Kerosene keeps air and water away, so accidental fires are prevented.",lay:"col",card:["🛢️","Sodium in kerosene"],src:"📘 Section 3.2.1"},
  {q:"Magnesium, aluminium, zinc and lead are covered with a thin oxide layer. What does it do?",a:"It prevents further oxidation",t:["It makes the metal burn faster","It turns the metal into a non-metal","It makes the metal liquid"],w:"The protective oxide layer stops more oxygen from reaching the metal.",lay:"col",src:"📘 Section 3.2.1"},
  {q:"Iron does not burn on heating. What happens to iron filings sprinkled in a flame?",a:"They burn vigorously",t:["Nothing","They melt into a liquid","They turn green"],w:"Fine filings have much more surface, so they burn.",card:["✨","Iron filings in a flame"],src:"📘 Section 3.2.1"},
  {q:"How do silver and gold react with oxygen?",a:"They do not react, even at high temperatures",t:["They burn with a white flame","They form black oxides","They catch fire in air"],w:"Silver and gold are very unreactive.",lay:"col",src:"📘 Section 3.2.1"},
  {q:"In anodising, a thick oxide layer is formed on",a:"Aluminium",t:["Iron","Copper","Sodium"],w:"The aluminium article is made the anode and electrolysed with dilute sulphuric acid.",card:["🛡️","Anodising"],src:"📘 Box: Anodising"},
  {q:"An element burns in oxygen to give a compound with a high melting point. The compound dissolves in water. The element is likely",a:"Calcium",t:["Carbon","Silicon","Iron"],w:"Calcium oxide is a solid with a high melting point, and it dissolves in water.",src:"📘 Exercise 3"},
  {q:"What are amphoteric oxides? Give two examples.",a:"Metal oxides that react with both acids and bases — e.g. Al2O3 and ZnO",t:["Oxides that react only with acids — e.g. MgO and CaO","Oxides that react only with bases — e.g. SO2 and CO2","Oxides that do not react — e.g. gold oxide"],w:"Al2O3 + 6HCl → 2AlCl3 + 3H2O and Al2O3 + 2NaOH → 2NaAlO2 + H2O.",lay:"col",src:"📘 Exercise 6"},
  {q:"Pratyush heats sulphur and collects the gas. What happens to <b>dry</b> blue litmus?",a:"No change",t:["It turns red","It turns green","It turns white"],w:"Without water, SO2 cannot form an acid.",lay:"two",card:["🟦","Dry litmus + SO2"],src:"📘 Exercise 9"},
  {q:"What happens to <b>moist</b> blue litmus in the same gas?",a:"It turns red",t:["No change","It turns pink","It turns yellow"],w:"SO2 dissolves in water to form an acid.",lay:"two",card:["💧","Moist litmus + SO2"],src:"📘 Exercise 9"},
  {q:"The balanced equation for burning sulphur is",a:"S + O2 → SO2",t:["S + O → SO","2S + O2 → 2SO","S + 2O2 → SO4"],w:"Sulphur + oxygen → sulphur dioxide.",src:"📘 Exercise 9"},
  {q:"What type of oxides do non-metals form with oxygen?",a:"Acidic or neutral oxides",t:["Basic oxides","Amphoteric oxides","Only neutral oxides"],w:"Non-metal oxides are acidic or neutral.",src:"📘 Exercise 11"},
  {q:"Aluminium is a highly reactive metal, yet it is used for cooking utensils. Why?",a:"A protective oxide layer stops further reaction, and it conducts heat well",t:["Aluminium does not conduct heat","Aluminium is not reactive at all","Aluminium is a non-metal"],w:"The oxide layer protects it.",lay:"col",card:["🍲","Aluminium vessel"],src:"📘 Exercise 12 (c)"}
];
const OX_MORE=[
  tt("ZnO"),tt("MgO"),tt("CuO"),tt("CaO"),tt("SO2"),tt("CO2"),
  kq("Al2O3"),kq("ZnO"),kq("MgO"),kq("SO2"),kq("CO2"),kq("CuO"),
  {q:"Oxide X reacts with dilute HCl and also with NaOH solution. X is",a:"Amphoteric",t:["Basic","Acidic"],w:"Reacting with both acid and base means amphoteric, like Al2O3 or ZnO.",lay:"three",sc:{tt:"ZnO",showAns:true,hideName:true}},
  {q:"Which oxide reacts with NaOH but <b>not</b> with HCl?",a:"CO2",t:["MgO","Al2O3","ZnO"],w:"CO2 is acidic. Al2O3 and ZnO react with both."},
  {q:"Which oxide reacts with HCl but <b>not</b> with NaOH?",a:"MgO",t:["ZnO","Al2O3","SO2"],w:"MgO is basic. ZnO and Al2O3 react with both."},
  {q:"Which oxide reacts with <b>both</b> HCl and NaOH?",a:"ZnO",t:["MgO","CuO","CO2"],w:"ZnO is amphoteric."},
  {q:"Odd one out:",a:"Al2O3",t:["MgO","CuO","CaO"],w:"Al2O3 is amphoteric. The others are basic.",card:["🔍","MgO · CuO · CaO · Al2O3"]},
  {q:"Odd one out:",a:"MgO",t:["Al2O3","ZnO"],w:"MgO is basic. Al2O3 and ZnO are amphoteric.",lay:"three",card:["🔍","Al2O3 · ZnO · MgO"]},
  {q:"Zinc oxide reacts with HCl. Complete it.",card:S=>["⚗️",`ZnO + 2HCl → ${S.answered?"ZnCl2 + H2O":"<span class=\"slot\">?</span>"}`],a:"ZnCl2 + H2O",t:["ZnCl2 + H2","Zn + Cl2O","Na2ZnO2 + H2O"],w:"ZnO acts like a base here."},
  {q:"Zinc oxide reacts with NaOH. Complete it.",card:S=>["⚗️",`ZnO + 2NaOH → ${S.answered?"Na2ZnO2 + H2O":"<span class=\"slot\">?</span>"}`],a:"Na2ZnO2 + H2O",t:["ZnCl2 + H2O","Zn(OH)2 + Na2O","NaZnO + H2"],w:"ZnO acts like an acid here. Na2ZnO2 is sodium zincate."},
  {q:"The word ‘amphoteric’ means",a:"Behaving both as an acid and as a base",t:["Very reactive","Not reacting at all","Dissolving in water"],w:"Amphoteric oxides show both acidic and basic behaviour."},
  {q:"Aluminium oxide + NaOH gives a salt called",a:"Sodium aluminate",t:["Aluminium chloride","Sodium chloride","Sodium zincate"],w:"NaAlO2 is sodium aluminate."},
  {q:"Zinc oxide + NaOH gives a salt called",a:"Sodium zincate",t:["Sodium aluminate","Zinc chloride","Zinc sulphate"],w:"Na2ZnO2 is sodium zincate."},
  {q:"Most metal oxides are basic. Which statement is correct?",a:"Al2O3 and ZnO are metal oxides that are amphoteric",t:["All metal oxides are amphoteric","Al2O3 is an acidic non-metal oxide","ZnO reacts only with acids"],w:"They are the exceptions to ‘metal oxides are basic’.",lay:"col"},
  {q:"Complete: K2O + H2O →",a:"2KOH",t:["KOH","K2O2 + H2","2K + H2O2"],w:"Potassium oxide dissolves in water to give an alkali.",card:["⚗️","K2O + H2O → ?"]}
];
function drawOx(it,svg,S){
  if(!it.sc||!it.sc.tt)return false;
  const o=Object.assign({ox:it.sc.hideName?"Oxide X":it.sc.tt},OXD[it.sc.tt]);
  twoTube(svg,o,S.answered,!!it.sc.showAns);
  return true;
}

/* ================= GAME 3: Reactivity ================= */
const WANS=WSTAT.concat(["No reaction"]);
const wq=(m,ans,w,src,q)=>({q:q||`With what does ${m} react to give hydrogen?`,a:ans,t:WANS.filter(x=>x!==ans),w,sc:{w:m,ans},src});
const dq=(a,b,salt,src)=>{const ok=SERIES.indexOf(a)<SERIES.indexOf(b);return{q:`Can <b>${a}</b> displace <b>${b}</b> from ${salt} solution?`,a:ok?"Yes":"No",t:[ok?"No":"Yes"],w:ok?`${a} is above ${b} in the activity series, so it is more reactive.`:`${a} is below ${b} in the activity series, so it is less reactive.`,lay:"two",sc:{ser:[a,b],arrow:[a,b,ok]},src};};
const RV_FIRST=[
  wq("Na","Cold water","Sodium and potassium react violently with cold water.","📘 Activity 3.10"),
  {q:"In the reaction of sodium with water, the hydrogen catches fire. Why?",a:"The reaction is very violent and exothermic",t:["Water is a fuel","Sodium is a non-metal","Hydrogen is very cold"],w:"2Na + 2H2O → 2NaOH + H2 + heat energy.",lay:"col",card:["🔥","2Na + 2H2O → 2NaOH + H2"],src:"📘 Section 3.2.2"},
  wq("Ca","Cold water","Calcium reacts with cold water less violently. The hydrogen does not catch fire.","📘 Section 3.2.2"),
  {q:"Why does calcium start floating in water?",a:"Bubbles of hydrogen stick to its surface",t:["Calcium is lighter than air","Calcium melts","Calcium dissolves completely"],w:"Ca + 2H2O → Ca(OH)2 + H2.",lay:"col",card:["🫧","Floating calcium"],src:"📘 Section 3.2.2"},
  wq("Mg","Hot water","Magnesium does not react with cold water. It reacts with hot water and floats too.","📘 Section 3.2.2"),
  wq("Fe","Steam","Aluminium, iron and zinc react only with steam.","📘 Section 3.2.2"),
  {q:"Iron reacts with steam. Complete it.",card:S=>["⚗️",`3Fe + 4H2O → ${S.answered?"Fe3O4 + 4H2":"<span class=\"slot\">?</span>"}`],a:"Fe3O4 + 4H2",t:["Fe2O3 + 4H2","3FeO + 4H2O","Fe(OH)3 + H2"],w:"Iron + steam → iron(II, III) oxide + hydrogen.",src:"📘 In-text Q2 (i)"},
  wq("Cu","No reaction","Lead, copper, silver and gold do not react with water at all.","📘 Section 3.2.2"),
  {q:"Metal + Water →",a:"Metal oxide + Hydrogen",t:["Metal + Oxygen","Salt + Water","Metal oxide + Oxygen"],w:"Soluble metal oxides then form metal hydroxides with water.",card:["💧","Metal + Water → ?"],src:"📘 Section 3.2.2"},
  {q:"Complete: Ca + 2H2O →",a:"Ca(OH)2 + H2",t:["CaO + H2O","Ca(OH)2 + O2","CaH2 + O2"],w:"Calcium hydroxide and hydrogen form.",card:["⚗️","Ca + 2H2O → ?"],src:"📘 In-text Q2 (ii)"},
  {q:"Complete: 2K + 2H2O →",a:"2KOH + H2",t:["K2O + H2","2KOH + O2","2KH + O2"],w:"Potassium reacts violently; the hydrogen catches fire.",card:["⚗️","2K + 2H2O → ?"],src:"📘 In-text Q2 (ii)"},
  {q:"Tap the metals in order of <b>decreasing</b> reactivity with dilute HCl.",steps:[{k:"Mg",l:"Mg"},{k:"Al",l:"Al"},{k:"Zn",l:"Zn"},{k:"Fe",l:"Fe"}],lay:"four",w:"Mg > Al > Zn > Fe. Magnesium bubbles fastest and gets the hottest.",sc:{serOrder:["Mg","Al","Zn","Fe"]},src:"📘 Activity 3.11"},
  {q:"Copper is put in dilute HCl. What happens?",a:"No bubbles — no reaction",t:["Fast bubbling of hydrogen","It catches fire","It turns into a gas"],w:"Copper is below hydrogen in the activity series.",lay:"col",sc:{ser:["Cu","H"]},src:"📘 Section 3.2.3"},
  {q:"Why is hydrogen not given off when most metals react with nitric acid?",a:"HNO3 is a strong oxidising agent; it oxidises H2 to water",t:["Nitric acid has no hydrogen","Metals do not react with acids","Hydrogen dissolves in the metal"],w:"Nitric acid itself is reduced to nitrogen oxides.",lay:"col",card:["⚠️","Metal + HNO3"],src:"📘 Section 3.2.3"},
  {q:"Which metals give hydrogen with very dilute nitric acid?",a:"Magnesium and manganese",t:["Copper and silver","Gold and platinum","Sodium and potassium"],w:"Mg and Mn react with very dilute HNO3 to give H2.",src:"📘 Section 3.2.3"},
  {q:"Aqua regia is a mixture of concentrated HCl and concentrated HNO3 in the ratio",a:"3 : 1",t:["1 : 3","1 : 1","2 : 1"],w:"Aqua regia (royal water) can dissolve gold and platinum.",lay:"four",card:["👑","Aqua regia"],src:"📘 Box: Aqua regia"},
  {q:"An iron nail is kept in blue copper sulphate solution for 20 minutes. What happens?",a:"A brown coat forms on the nail and the blue colour fades",t:["Nothing happens","The nail turns silver","The solution turns red"],w:"Iron displaces copper: Fe + CuSO4 → FeSO4 + Cu.",lay:"col",sc:{d:{metal:"Iron nail",sol:"CuSO4 solution",c0:"rgba(30,136,229,.55)",c1:"rgba(130,190,120,.45)",coat:"#B5651D",reacts:true}},src:"📘 Activity 3.12"},
  {q:"A copper wire is kept in iron sulphate solution. What happens?",a:"No change",t:["A grey iron coat forms","The wire dissolves","Bubbles of hydrogen form"],w:"Copper is less reactive than iron, so it cannot displace iron.",lay:"two",sc:{d:{metal:"Copper wire",sol:"FeSO4 solution",c0:"rgba(140,200,140,.45)",c1:"rgba(140,200,140,.45)",metalC:"#C77B30",wire:true,reacts:false}},src:"📘 Activity 3.12"},
  {q:"Complete the reaction in Activity 3.12.",card:S=>["⚗️",`Fe + CuSO4 → ${S.answered?"FeSO4 + Cu":"<span class=\"slot\">?</span>"}`],a:"FeSO4 + Cu",t:["FeCu + SO4","No reaction","Fe2SO4 + Cu"],w:"This is a displacement reaction.",src:"📘 Activity 3.12"},
  {q:"Which is more reactive, iron or copper?",a:"Iron",t:["Copper","Both are equal"],w:"Iron displaces copper, so iron is more reactive.",lay:"three",sc:{ser:["Fe","Cu"]},src:"📘 Activity 3.12"},
  {q:"Tap the 7 most reactive metals in order (most reactive first).",steps:["K","Na","Ca","Mg","Al","Zn","Fe"].map(m=>({k:m,l:m})),w:"K > Na > Ca > Mg > Al > Zn > Fe.",sc:{serOrder:["K","Na","Ca","Mg","Al","Zn","Fe"]},src:"📘 Table 3.2"},
  {q:"Now tap the rest in order of decreasing reactivity.",steps:["Pb","H","Cu","Hg","Ag","Au"].map(m=>({k:m,l:m==="H"?"[H]":m})),w:"Pb > [H] > Cu > Hg > Ag > Au. Gold is the least reactive.",sc:{serOrder:["Pb","H","Cu","Hg","Ag","Au"]},src:"📘 Table 3.2"},
  {q:"Metals A–D are added to solutions. Only B displaces from FeSO4; A from CuSO4; C from AgNO3; D from none. Which is the most reactive?",a:"B",t:["A","C","D"],w:"B can displace iron, so it is the most reactive.",lay:"four",src:"📘 In-text Q3 (i)"},
  {q:"What will you see if B is added to copper(II) sulphate solution?",a:"Copper is displaced — a brown deposit forms and the blue colour fades",t:["No change","The solution turns red","Hydrogen bubbles only"],w:"B is more reactive than iron, so it is more reactive than copper too.",lay:"col",src:"📘 In-text Q3 (ii)"},
  {q:"Arrange A, B, C, D in decreasing reactivity.",steps:["B","A","C","D"].map(m=>({k:m,l:m})),lay:"four",w:"B > A > C > D.",src:"📘 In-text Q3 (iii)"},
  {q:"Iron reacts with dilute sulphuric acid. Complete it.",card:S=>["⚗️",`Fe + H2SO4 → ${S.answered?"FeSO4 + H2":"<span class=\"slot\">?</span>"}`],a:"FeSO4 + H2",t:["FeSO4 + H2O","FeO + SO2","Fe2(SO4)3 + O2"],w:"A reactive metal + dilute acid gives hydrogen gas.",src:"📘 In-text Q4"},
  {q:"Zinc is added to iron(II) sulphate solution. What happens?",card:S=>["⚗️",`Zn + FeSO4 → ${S.answered?"ZnSO4 + Fe":"<span class=\"slot\">?</span>"}`],a:"ZnSO4 + Fe",t:["No reaction","ZnFe + SO4","Zn + Fe + SO4"],w:"Zinc is more reactive than iron, so it displaces iron. The green colour fades.",src:"📘 In-text Q5"},
  {q:"Zinc oxide, magnesium oxide and copper oxide are heated with metals. Which pair gives a displacement?",a:"Copper oxide + zinc",t:["Magnesium oxide + zinc","Magnesium oxide + copper","Zinc oxide + copper"],w:"Only a more reactive metal can take oxygen from a less reactive metal’s oxide.",lay:"col",src:"📘 In-text Q1 (3.5)"},
  {q:"Which pair will give a displacement reaction?",a:"AgNO3 solution and copper metal",t:["NaCl solution and copper metal","MgCl2 solution and aluminium metal","FeSO4 solution and silver metal"],w:"Copper is more reactive than silver.",lay:"col",sc:{ser:["Cu","Ag"],arrow:["Cu","Ag",true],late:true},src:"📘 Exercise 1"},
  {q:"Food cans are coated with tin and not with zinc because",a:"Zinc is more reactive than tin",t:["Zinc is costlier than tin","Zinc has a higher melting point","Zinc is less reactive than tin"],w:"Zinc could react with the food.",lay:"col",src:"📘 Exercise 4"},
  {q:"Which two metals displace hydrogen from dilute acids?",a:"Zinc and magnesium",t:["Copper and silver","Gold and silver","Copper and mercury"],w:"Metals above hydrogen displace it. Copper and silver do not.",sc:{ser:["Zn","Mg","H"]},src:"📘 Exercise 7"},
  {q:"Tarnished copper vessels are cleaned with lemon or tamarind juice. Why?",a:"The acid dissolves the green basic copper carbonate coating",t:["The juice is a base","The juice adds new copper","The juice makes copper rust"],w:"The sour (acidic) juice neutralises the basic coating.",lay:"col",card:["🍋","Cleaning copper"],src:"📘 Exercise 13"},
  {q:"A fake goldsmith dipped gold bangles in a solution. They sparkled but lost weight. What solution?",a:"Aqua regia",t:["Lime water","Salt water","Dilute HCl"],w:"Aqua regia dissolves gold, so the outer layer was lost.",card:["🕵️","The fake goldsmith"],src:"📘 Exercise 15"},
  {q:"Which is a chemical difference between metals and non-metals?",a:"Metals form basic oxides; non-metals form acidic or neutral oxides",t:["Metals form acidic oxides","Non-metals displace hydrogen from acids","Metals gain electrons"],w:"Also: metals displace hydrogen from dilute acids; non-metals do not.",lay:"col",src:"📘 Exercise 14"}
];
const RV_MORE=[
  wq("K","Cold water","Potassium reacts violently with cold water and the hydrogen catches fire."),
  wq("Al","Steam","Aluminium reacts only with steam: 2Al + 3H2O → Al2O3 + 3H2."),
  wq("Zn","Steam","Zinc reacts only with steam."),
  wq("Ag","No reaction","Silver does not react with water."),
  wq("Au","No reaction","Gold does not react with water."),
  wq("Pb","No reaction","Lead does not react with water."),
  dq("Zn","Cu","copper sulphate"),dq("Cu","Zn","zinc sulphate"),dq("Mg","Fe","iron sulphate"),dq("Ag","Cu","copper nitrate"),dq("Pb","Cu","copper chloride"),dq("Fe","Zn","zinc sulphate"),dq("Al","Fe","iron chloride"),dq("Cu","Ag","silver nitrate"),
  {q:"Which metal will <b>not</b> give hydrogen with dilute HCl?",a:"Cu",t:["Zn","Mg","Fe"],w:"Copper is below hydrogen in the series.",lay:"four",sc:{ser:["H"]}},
  {q:"Metals above hydrogen in the activity series can",a:"Displace hydrogen from dilute acids",t:["Not react with acids","Only react with steam","Displace gold from water"],w:"That is why Zn, Mg, Fe give H2 with dilute acids."},
  {q:"Which metal is the least reactive?",a:"Gold",t:["Silver","Copper","Mercury"],w:"Gold is at the bottom of the activity series.",sc:{ser:["Au"]}},
  {q:"Which metal is the most reactive?",a:"Potassium",t:["Sodium","Calcium","Magnesium"],w:"Potassium is at the top of the activity series.",sc:{ser:["K"]}},
  {q:"A metal reacts with hot water but not with cold water. It is",a:"Magnesium",t:["Sodium","Copper","Iron"],w:"Magnesium reacts with hot water.",lay:"two"}
];
function drawRv(it,svg,S){
  const sc=it.sc;if(!sc)return false;
  if(sc.w){waterScene(svg,sc.w,sc.ans,S.answered);return true;}
  if(sc.d){dispScene(svg,sc.d,S.answered);return true;}
  if(sc.serOrder){seriesScene(svg,{hide:new Set(sc.serOrder.filter(m=>!S.done.has(m)&&!S.answered)),hl:[...S.done]});return true;}
  if(sc.ser){seriesScene(svg,{hl:sc.ser,arrow:S.answered?sc.arrow:null});return true;}
  return false;
}

/* ================= GAME 4: Ionic Bonds ================= */
const cfgOpts=s=>{const c=CFG[s],a=c.join(", ");const t=new Set();
  const alt=[[...c.slice(0,-1),c[c.length-1]+1],c.length>1?[c[0]+1,...c.slice(1)]:[3],[...c].reverse(),[2,8,...c.slice(1)].slice(0,4)];
  for(const x of alt){const k=x.join(", ");if(k!==a)t.add(k);}return{a,t:[...t].slice(0,3)};};
const NAMES={He:"helium",Ne:"neon",Ar:"argon",Na:"sodium",Mg:"magnesium",Al:"aluminium",K:"potassium",Ca:"calcium",N:"nitrogen",O:"oxygen",F:"fluorine",P:"phosphorus",S:"sulphur",Cl:"chlorine"};
const ZZ={He:2,Ne:10,Ar:18,Na:11,Mg:12,Al:13,K:19,Ca:20,N:7,O:8,F:9,P:15,S:16,Cl:17};
const cq=(s,src)=>{const o=cfgOpts(s);return{q:`What is the electronic configuration of ${NAMES[s]} (atomic number ${ZZ[s]})?`,a:o.a,t:o.t,w:`${NAMES[s][0].toUpperCase()+NAMES[s].slice(1)}: ${o.a}.`,sc:{atom:s},lay:"four",src};};
const IB_FIRST=[
  {q:"Noble gases show little chemical activity. Why?",a:"Their valence shell is completely filled",t:["They have no electrons","They are metals","Their nucleus is empty"],w:"Other elements react to get a completely filled valence shell.",lay:"col",sc:{atoms:["He","Ne","Ar"]},src:"📘 Section 3.3"},
  cq("Ne","📘 Table 3.3"),cq("Na","📘 Table 3.3"),cq("Mg","📘 Table 3.3"),cq("O","📘 Table 3.3"),cq("Cl","📘 Table 3.3"),cq("K","📘 Table 3.3"),
  {q:"A sodium atom loses its one outer electron. What does it become?",a:"Na^+ ion (2, 8)",t:["Na^− ion (2, 8, 2)","Na^+ ion (2, 8, 1)","Ne atom"],w:"11 protons, 10 electrons → net +1 charge.",sc:{ion:"Na"},src:"📘 Section 3.3"},
  {q:"A chlorine atom gains one electron. What does it become?",a:"Cl^− ion (2, 8, 8)",t:["Cl^+ ion (2, 8, 6)","Cl^− ion (2, 8, 7)","Ar atom"],w:"17 protons, 18 electrons → net −1 charge.",sc:{ion:"Cl"},src:"📘 Section 3.3"},
  {q:"Sodium gives one electron to chlorine. What is formed?",a:"Na^+ and Cl^− ions → NaCl",t:["Na^− and Cl^+ ions","A NaCl molecule sharing electrons","No reaction"],w:"Oppositely charged ions attract each other (Figure 3.5).",sc:{form:{m:"Na",nm:"Cl",nM:1,nN:1,res:"Na^+ Cl^− (NaCl)"}},src:"📘 Figure 3.5"},
  {q:"Na^+ and Cl^− ions are held together by",a:"Strong electrostatic forces of attraction",t:["Sharing of electrons","Magnetic force","Gravity"],w:"Opposite charges attract strongly.",lay:"col",sc:{form:{m:"Na",nm:"Cl",nM:1,nN:1,res:"Na^+ Cl^− (NaCl)"},done:true},src:"📘 Section 3.3"},
  {q:"Sodium chloride exists as",a:"Aggregates of oppositely charged ions",t:["Separate NaCl molecules","Free sodium and chlorine atoms","A liquid at room temperature"],w:"Sodium chloride does not exist as molecules.",lay:"col",src:"📘 Section 3.3"},
  {q:"Magnesium forms MgCl2 with chlorine. How many electrons does magnesium give away?",a:"2 (one to each chlorine)",t:["1","3","None — it shares them"],w:"Mg (2, 8, 2) → Mg^2+ (2, 8). Each Cl gains one electron (Figure 3.6).",sc:{form:{m:"Mg",nm:"Cl",nM:1,nN:2,res:"Mg^2+ 2Cl^− (MgCl2)"}},src:"📘 Figure 3.6"},
  {q:"Name the cation and anion in MgCl2.",a:"Mg^2+ and Cl^−",t:["Mg^+ and Cl^2−","Cl^+ and Mg^−","Mg^2− and Cl^+"],w:"The metal forms the positive ion (cation).",sc:{form:{m:"Mg",nm:"Cl",nM:1,nN:2,res:"Mg^2+ 2Cl^− (MgCl2)"},done:true},src:"📘 Section 3.3"},
  {q:"Compounds formed by the transfer of electrons from a metal to a non-metal are called",a:"Ionic (electrovalent) compounds",t:["Covalent compounds","Alloys","Amphoteric compounds"],w:"NaCl and MgCl2 are ionic compounds.",lay:"col",src:"📘 Section 3.3"},
  {q:"What is the physical state of NaCl, KI and BaCl2 at room temperature?",a:"Solid",t:["Liquid","Gas"],w:"Ionic compounds are solids.",lay:"three",card:["🧂","Salt samples"],src:"📘 Activity 3.13"},
  {q:"Ionic compounds are hard but",a:"Brittle — they break into pieces under pressure",t:["Malleable like metals","Soft like sodium","Liquid when pressed"],w:"Strong attraction makes them hard; they still break when pressure is applied.",lay:"col",src:"📘 Section 3.3.1"},
  {q:"Which has the highest melting point? (Table 3.4)",a:"CaO — 2850 K",t:["NaCl — 1074 K","LiCl — 887 K","MgCl2 — 981 K"],w:"Ionic compounds have high melting points; CaO is the highest here.",lay:"col",src:"📘 Table 3.4"},
  {q:"Why do ionic compounds have high melting points?",a:"Much energy is needed to break the strong inter-ionic attraction",t:["They have no ions","They are made of molecules","They are liquids"],w:"The ions attract each other very strongly.",lay:"col",src:"📘 In-text Q2 (3.3)"},
  {q:"Ionic compounds are generally soluble in",a:"Water",t:["Kerosene","Petrol"],w:"They do not dissolve in kerosene or petrol.",lay:"three",card:["💧","Solubility"],src:"📘 Section 3.3.1"},
  {q:"Does solid NaCl conduct electricity?",a:"No — its ions cannot move in the rigid solid",t:["Yes — always","Yes — but only in light","No — it has no ions"],w:"The ions are fixed in place in the solid.",lay:"col",src:"📘 Section 3.3.1"},
  {q:"When do ionic compounds conduct electricity?",a:"When dissolved in water or when molten",t:["Only as solids","Never","Only when frozen"],w:"Then the ions are free to move.",lay:"col",card:["💡","Salt solution in a circuit"],src:"📘 Activity 3.13"},
  {q:"How many electrons are in the outer shell of oxygen?",a:"6",t:["2","8","4"],w:"Oxygen: 2, 6. It needs 2 more.",lay:"four",sc:{atom:"O",show:true},src:"📘 In-text Q1 (3.3)"},
  {q:"Na2O forms by electron transfer. What happens?",a:"Two Na atoms each give one electron to one O atom",t:["One Na gives two electrons to O","O gives electrons to Na","They share electrons"],w:"2Na^+ and O^2− form.",lay:"col",sc:{form:{m:"Na",nm:"O",nM:2,nN:1,res:"2Na^+ O^2− (Na2O)"}},src:"📘 In-text Q1 (3.3)"},
  {q:"MgO forms by electron transfer. Which ions are present?",a:"Mg^2+ and O^2−",t:["Mg^+ and O^−","Mg^2− and O^2+","Mg and O atoms"],w:"Mg gives 2 electrons to O.",sc:{form:{m:"Mg",nm:"O",nM:1,nN:1,res:"Mg^2+ O^2− (MgO)"}},src:"📘 In-text Q1 (3.3)"}
];
const IB_MORE=[
  cq("Al"),cq("Ca"),cq("N"),cq("F"),cq("P"),cq("S"),cq("Ar"),
  {q:"Aluminium (2, 8, 3) forms an ion. Which one?",a:"Al^3+",t:["Al^3−","Al^+","Al^5−"],w:"It loses 3 electrons to get 2, 8.",lay:"four",sc:{ion:"Al"}},
  {q:"Oxygen (2, 6) forms an ion. Which one?",a:"O^2−",t:["O^2+","O^6+","O^−"],w:"It gains 2 electrons to get 2, 8.",lay:"four",sc:{ion:"O"}},
  {q:"Metals form",a:"Positive ions by losing electrons",t:["Negative ions by gaining electrons","No ions","Positive ions by gaining electrons"],w:"Na → Na^+ + e^−."},
  {q:"Non-metals form",a:"Negative ions by gaining electrons",t:["Positive ions by losing electrons","No ions","Negative ions by losing electrons"],w:"Cl + e^− → Cl^−."},
  {q:"Potassium gives one electron to chlorine. Which ions form?",a:"K^+ and Cl^−",t:["K^− and Cl^+","K^2+ and Cl^2−","K and Cl atoms"],w:"K (2, 8, 8, 1) → K^+ (2, 8, 8).",sc:{form:{m:"K",nm:"Cl",nM:1,nN:1,res:"K^+ Cl^− (KCl)"}}},
  {q:"Calcium (2, 8, 8, 2) reacts with chlorine. What forms?",a:"CaCl2 — Ca^2+ and 2Cl^−",t:["CaCl — Ca^+ and Cl^−","Ca2Cl — 2Ca^+ and Cl^2−","CaCl3"],w:"Calcium gives one electron to each of two chlorine atoms.",lay:"col",sc:{form:{m:"Ca",nm:"Cl",nM:1,nN:2,res:"Ca^2+ 2Cl^− (CaCl2)"}}},
  {q:"Which shows the correct charge on the ions in NaCl?",a:"Na^+ and Cl^−",t:["Na^− and Cl^+","Na^2+ and Cl^2−","No charges"],w:"Sodium loses; chlorine gains."},
  {q:"Which of these is an ionic compound?",a:"MgCl2",t:["H2O","CH4","O2"],w:"MgCl2 is formed from a metal and a non-metal by electron transfer.",lay:"four"},
  {q:"How many electrons does sulphur (2, 8, 6) need to complete its octet?",a:"2",t:["1","6","8"],w:"6 + 2 = 8.",lay:"four",sc:{atom:"S",show:true}}
];
function drawIb(it,svg,S){
  const sc=it.sc;if(!sc)return false;
  if(sc.atoms){sc.atoms.forEach((s,i)=>atom(svg,140+i*180,108,CFG[s],s,{lab:`${NAMES[s]} — ${CFG[s].join(", ")}`}));return true;}
  if(sc.atom){V(svg,"170 0 300 240");const show=S.answered||sc.show;atom(svg,320,108,show?CFG[sc.atom]:CFG[sc.atom].map(()=>0),sc.atom,{lab:show?CFG[sc.atom].join(", "):"?",hl:show});return true;}
  if(sc.ion){V(svg,"90 0 460 240");const ans=S.answered;
    atom(svg,190,108,CFG[sc.ion],sc.ion,{lab:"Atom: "+CFG[sc.ion].join(", "),hl:true});
    txt(svg,320,116,"→","pt big");
    if(ans)atom(svg,450,108,ION[sc.ion][0],sc.ion,{charge:ION[sc.ion][1],ring:true,lab:"Ion: "+ION[sc.ion][0].join(", ")});
    else txt(svg,450,118,"?","pt q big");
    return true;}
  if(sc.form){if(sc.form.nN+sc.form.nM===2)V(svg,"100 0 440 240");formScene(svg,sc.form,S.answered||sc.done);return true;}
  return false;
}

/* ================= GAME 5: Extraction & Corrosion ================= */
const FLOW=[{k:"o",l:"Ore",b:"Ore"},{k:"c",l:"Concentration (remove gangue)",b:"Concen-\ntration"},{k:"r",l:"Roasting or calcination",b:"Roasting /\ncalcination"},{k:"d",l:"Reduction to metal",b:"Reduction"},{k:"p",l:"Refining",b:"Refining"}];
const EX_FIRST=[
  {q:"Elements or compounds that occur naturally in the earth’s crust are called",a:"Minerals",t:["Ores","Gangue","Alloys"],w:"Minerals with a high percentage of a metal are ores.",card:["⛰️","Earth’s crust"],src:"📘 Section 3.4"},
  {q:"Minerals from which a metal can be profitably extracted are called",a:"Ores",t:["Minerals","Gangue","Amalgams"],w:"Ores contain a very high percentage of a particular metal.",card:["⛏️","Ore"],src:"📘 Section 3.4"},
  {q:"Impurities like soil and sand in an ore are called",a:"Gangue",t:["Slag","Anode mud","Flux"],w:"The gangue must be removed before extracting the metal.",card:["🪨","Soil and sand"],src:"📘 Section 3.4.2"},
  {q:"Name two metals found in nature in the free state.",a:"Gold and silver",t:["Sodium and potassium","Calcium and magnesium","Aluminium and zinc"],w:"Gold, silver, platinum and copper are found free. They are low in the activity series.",src:"📘 In-text Q2 (3.4)"},
  {q:"K, Na, Ca, Mg and Al are never found free in nature. Why?",a:"They are very reactive",t:["They are very rare","They are liquids","They are non-metals"],w:"Highly reactive metals are always found in compounds.",lay:"two",sc:{ser:["K","Na","Ca","Mg","Al"]},src:"📘 Section 3.4.1"},
  {q:"Tap the steps of extracting a metal of medium reactivity, in order.",steps:FLOW,w:"Ore → concentration → roasting/calcination → reduction → refining (Figure 3.10).",lay:"col",sc:{flow:true},src:"📘 Figure 3.10"},
  {q:"Cinnabar (HgS) is an ore of mercury. How is mercury obtained from it?",a:"By heating alone",t:["By electrolysis","By heating with carbon","By adding water"],w:"2HgS + 3O2 → 2HgO + 2SO2, then 2HgO → 2Hg + O2.",lay:"two",sc:{ser:["Hg"]},src:"📘 Section 3.4.3"},
  {q:"Copper is found as Cu2S. How is copper obtained from it?",a:"By just heating in air",t:["By electrolysis of molten ore","By adding water","By heating with sodium"],w:"Copper is low in the activity series.",lay:"col",src:"📘 Section 3.4.3"},
  {q:"Sulphide ores are heated strongly in <b>excess air</b>. This is called",a:"Roasting",t:["Calcination","Refining","Galvanising"],w:"2ZnS + 3O2 → 2ZnO + 2SO2.",card:["🔥","Sulphide ore + excess air"],src:"📘 Section 3.4.4"},
  {q:"Carbonate ores are heated strongly in <b>limited air</b>. This is called",a:"Calcination",t:["Roasting","Refining","Anodising"],w:"ZnCO3 → ZnO + CO2.",card:["🔥","Carbonate ore + limited air"],src:"📘 Section 3.4.4"},
  {q:"Complete the roasting of zinc blende.",card:S=>["🔥",`2ZnS + 3O2 → ${S.answered?"2ZnO + 2SO2":"<span class=\"slot\">?</span>"}`],a:"2ZnO + 2SO2",t:["ZnO + CO2","2Zn + 2SO3","2ZnSO4"],w:"Sulphide → oxide + sulphur dioxide.",src:"📘 Section 3.4.4"},
  {q:"Complete the calcination of zinc carbonate.",card:S=>["🔥",`ZnCO3 → ${S.answered?"ZnO + CO2":"<span class=\"slot\">?</span>"}`],a:"ZnO + CO2",t:["Zn + CO3","ZnO + SO2","ZnC + O3"],w:"Carbonate → oxide + carbon dioxide.",src:"📘 Section 3.4.4"},
  {q:"Zinc oxide is heated with carbon: ZnO + C → Zn + CO. What process gives the metal?",a:"Reduction",t:["Oxidation","Calcination","Corrosion"],w:"Obtaining a metal from its oxide is reduction. Carbon is the reducing agent.",card:["⚗️","ZnO + C → Zn + CO"],src:"📘 In-text Q3 (3.4)"},
  {q:"3MnO2 + 4Al → 3Mn + 2Al2O3 + Heat. What is aluminium used as?",a:"A reducing agent",t:["An oxidising agent","A catalyst","An ore"],w:"Reactive aluminium takes oxygen from MnO2.",card:["⚗️","3MnO2 + 4Al → 3Mn + 2Al2O3"],src:"📘 Section 3.4.4"},
  {q:"Fe2O3 + 2Al → 2Fe + Al2O3 + Heat is used to",a:"Join railway tracks and cracked machine parts",t:["Make baking soda","Purify water","Make glass"],w:"This is the thermit reaction. So much heat forms that iron melts.",lay:"col",card:["🛤️","Thermit reaction"],src:"📘 Figure 3.11"},
  {q:"Why can carbon not reduce oxides of Na, Mg, Ca and Al?",a:"These metals have more affinity for oxygen than carbon",t:["Carbon is too reactive","These oxides are gases","Carbon is a metal"],w:"So they are obtained by electrolytic reduction.",lay:"col",sc:{ser:["Na","Mg","Ca","Al"]},src:"📘 Section 3.4.5"},
  {q:"Sodium is obtained by electrolysis of molten NaCl. Where is sodium deposited?",a:"At the cathode",t:["At the anode","At the bottom as mud","It escapes as gas"],w:"Na^+ + e^− → Na at the cathode; 2Cl^− → Cl2 + 2e^− at the anode.",lay:"two",src:"📘 Section 3.4.5"},
  {q:"Aluminium is obtained by",a:"Electrolytic reduction of aluminium oxide",t:["Heating its oxide with carbon","Heating its ore alone","Thermit reaction"],w:"Aluminium is too reactive to be reduced by carbon.",lay:"col",src:"📘 Section 3.4.5"},
  {q:"In electrolytic refining, the impure metal is made the",a:"Anode",t:["Cathode","Electrolyte","Anode mud"],w:"A thin strip of pure metal is the cathode.",lay:"two",sc:{ref:{ask:"an"}},src:"📘 Exercise 8"},
  {q:"In electrolytic refining, the pure metal deposits on the",a:"Cathode",t:["Anode","Bottom of the tank","Electrolyte"],w:"An equal amount of pure metal deposits on the cathode.",lay:"two",sc:{ref:{ask:"ca",show:"an"}},src:"📘 Figure 3.12"},
  {q:"The electrolyte used in refining copper is",a:"Acidified copper sulphate solution",t:["Sea water","Molten sodium chloride","Lime water"],w:"A solution of a salt of the same metal is used.",lay:"col",sc:{ref:{ask:"el",show:"ca"}},src:"📘 Figure 3.12"},
  {q:"Insoluble impurities that settle below the anode are called",a:"Anode mud",t:["Gangue","Slag","Rust"],w:"Soluble impurities go into the solution.",lay:"two",sc:{ref:{ask:"mud",show:"el"}},src:"📘 Section 3.4.6"},
  {q:"Why are carbonate and sulphide ores converted into oxides?",a:"It is easier to get a metal from its oxide",t:["Oxides are more costly","Carbonates are metals already","Oxides are liquids"],w:"Oxides can then be reduced, e.g. with carbon.",lay:"col",src:"📘 Exercise 12 (d)"},
  {q:"Silver articles become black in air. Why?",a:"Silver reacts with sulphur in air to form silver sulphide",t:["Silver rusts like iron","Silver turns into carbon","Silver reacts with water"],w:"This is corrosion of silver.",lay:"col",card:["🥄","Black silver"],src:"📘 Section 3.5"},
  {q:"Copper slowly gets a green coat. What is it?",a:"Basic copper carbonate",t:["Copper oxide","Rust","Copper sulphate"],w:"Copper reacts with moist carbon dioxide in air.",card:["🟩","Green copper"],src:"📘 Section 3.5"},
  {q:"In which test tube do the iron nails rust?",a:"A — air and water",t:["B — boiled water and oil","C — dry air"],w:"Iron rusts only when both air and water are present.",lay:"three",sc:{rust:true},src:"📘 Activity 3.15"},
  {q:"Why is oil added on the boiled water in tube B?",a:"To stop air from dissolving in the water",t:["To make the nail shine","To heat the water","To add moisture"],w:"So tube B has water but no air.",lay:"col",sc:{rust:true,pre:true},src:"📘 Activity 3.15"},
  {q:"Why is anhydrous calcium chloride put in tube C?",a:"It absorbs moisture, so the air is dry",t:["It adds water","It makes the nail rust faster","It removes oxygen"],w:"So tube C has air but no water.",lay:"col",sc:{rust:true,pre:true},src:"📘 Activity 3.15"},
  {q:"Galvanisation means coating iron or steel with",a:"Zinc",t:["Tin","Paint","Chromium"],w:"The iron is protected even if the zinc coat is broken.",card:["🛡️","Galvanising"],src:"📘 Section 3.5.1"},
  {q:"Which method prevents an iron frying pan from rusting?",a:"All of these: grease, paint or zinc coating",t:["Only applying grease","Only applying paint","Only a zinc coating"],w:"Painting, oiling, greasing, galvanising, chrome plating, anodising and alloying all help.",lay:"col",src:"📘 Exercise 2"},
  {q:"An alloy is",a:"A homogeneous mixture of two or more metals, or a metal and a non-metal",t:["A pure metal","A compound of a metal and oxygen","An ore with gangue"],w:"Alloying changes the properties of a metal.",lay:"col",src:"📘 Section 3.5.1"},
  {q:"Pure iron is soft. What makes it hard and strong?",a:"Adding a small amount of carbon (about 0.05%)",t:["Adding water","Heating it in air","Coating it with oil"],w:"This is steel.",lay:"col",src:"📘 Section 3.5.1"},
  {q:"Stainless steel is iron mixed with",a:"Nickel and chromium",t:["Copper and zinc","Lead and tin","Mercury"],w:"It is hard and does not rust.",card:["🍴","Stainless steel"],src:"📘 Section 3.5.1"},
  {q:"22 carat gold means",a:"22 parts gold + 2 parts copper or silver",t:["22 parts gold + 2 parts iron","Pure gold","2 parts gold + 22 parts silver"],w:"24 carat gold is pure but too soft for jewellery.",lay:"col",card:["💍","22 carat"],src:"📘 Box: Gold"},
  {q:"An alloy in which one metal is mercury is called",a:"An amalgam",t:["Brass","Bronze","Solder"],w:"Mercury alloys are amalgams.",src:"📘 Section 3.5.1"},
  {q:"Brass is an alloy of",a:"Copper and zinc",t:["Copper and tin","Lead and tin","Iron and carbon"],w:"Brass: Cu + Zn.",src:"📘 Section 3.5.1"},
  {q:"Bronze is an alloy of",a:"Copper and tin",t:["Copper and zinc","Lead and tin","Iron and nickel"],w:"Bronze: Cu + Sn.",src:"📘 Section 3.5.1"},
  {q:"Solder (lead + tin) is used to weld electrical wires because it has",a:"A low melting point",t:["A high melting point","Very high conductivity","A shiny surface"],w:"Alloys melt at lower temperatures than pure metals.",src:"📘 Section 3.5.1"},
  {q:"Compared with pure metals, alloys have",a:"Lower conductivity and lower melting point",t:["Higher conductivity","Higher melting point","No conductivity at all"],w:"That is why pure copper, not brass, is used for circuits.",lay:"col",src:"📘 Section 3.5.1"},
  {q:"The iron pillar near the Qutub Minar is famous because",a:"It has not rusted for more than 1600 years",t:["It is made of gold","It is 100 m high","It was made last year"],w:"Ancient Indian iron workers developed a rust-resistant process. It is 8 m high and weighs 6 tonnes.",lay:"col",card:["🗼","Delhi iron pillar"],src:"📘 Box: Iron pillar"},
  {q:"Which metals do not corrode easily?",a:"Gold and platinum",t:["Iron and sodium","Copper and iron","Sodium and potassium"],w:"They are least reactive.",src:"📘 In-text Q2 (3.5)"}
];
const ALLOY=[["Brass","Copper + zinc"],["Bronze","Copper + tin"],["Solder","Lead + tin"],["Stainless steel","Iron + nickel + chromium"],["Amalgam","Mercury + another metal"]];
const EX_MORE=[
  ...ALLOY.map(([n,c])=>({q:`What is ${n.toLowerCase()} made of?`,a:c,t:shuffle(ALLOY.filter(x=>x[0]!==n).map(x=>x[1])).slice(0,3),w:`${n}: ${c.toLowerCase()}.`,card:["🔗",n]})),
  {q:"Which method is used to get sodium from its compound?",a:"Electrolysis of the molten chloride",t:["Heating with carbon","Heating alone","Roasting"],w:"Sodium is at the top of the activity series.",lay:"col",sc:{ser:["Na"]}},
  {q:"Which method is used to get zinc from zinc blende (ZnS)?",a:"Roasting, then reduction with carbon",t:["Electrolysis of molten ZnS","Heating alone","Galvanising"],w:"Zinc is in the middle of the series.",lay:"col",sc:{ser:["Zn"]}},
  {q:"Heating ZnCO3 in limited air is",a:"Calcination",t:["Roasting","Reduction","Refining"],w:"Carbonate + limited air = calcination.",lay:"two"},
  {q:"Heating ZnS in excess air is",a:"Roasting",t:["Calcination","Reduction","Refining"],w:"Sulphide + excess air = roasting.",lay:"two"},
  {q:"Iron rusts only when",a:"Both air and water are present",t:["Only water is present","Only dry air is present","It is kept in oil"],w:"Tube A rusted; tubes B and C did not.",lay:"col",sc:{rust:true,pre:true}},
  {q:"Rust is",a:"A brown flaky substance on iron",t:["A green coat on copper","A black coat on silver","A white powder on zinc"],w:"Iron exposed to moist air forms rust."},
  {q:"Which is NOT a method to prevent rusting?",a:"Keeping iron in moist air",t:["Painting","Galvanising","Oiling"],w:"Moist air causes rusting."},
  {q:"Which reducing agent is used in the thermit reaction?",a:"Aluminium",t:["Carbon","Hydrogen","Iron"],w:"Fe2O3 + 2Al → 2Fe + Al2O3."},
  {q:"Which metal is at the anode in electrolytic refining of copper?",a:"Impure copper",t:["Pure copper","Zinc","Silver"],w:"Impure metal is the anode.",sc:{ref:{ask:"an"}}},
  {q:"Why is pure gold (24 carat) not used for jewellery?",a:"It is very soft",t:["It is very hard","It rusts","It is a liquid"],w:"It is alloyed with copper or silver to make it hard."}
];
function drawEx(it,svg,S){
  const sc=it.sc;if(!sc)return false;
  if(sc.flow){flowScene(svg,FLOW,S.answered?new Set(FLOW.map(f=>f.k)):S.done);return true;}
  if(sc.ser){seriesScene(svg,{hl:sc.ser});return true;}
  if(sc.ref){refineScene(svg,Object.assign({answered:S.answered},sc.ref));return true;}
  if(sc.rust){rustScene(svg,S.answered||sc.pre);return true;}
  return false;
}


/* ===== Lesson 3 selection: 72 textbook questions + 28 bonus ===== */
const pick=(bank,idx)=>idx.map(i=>bank[i]);
const Q_MPBP={q:"Do metals generally have high or low melting and boiling points?",a:"High",t:["Low","Metals do not melt","All metals melt in the hand"],w:"Metals have high melting and boiling points, but mercury, gallium and caesium are exceptions.",src:"📘 Section 3.2"};
const Q_W={q:"Which metal has the highest melting point?",a:"Tungsten",t:["Iron","Copper","Gold"],w:"Tungsten melts at about 3422 °C, so it is used in bulb filaments."};
const PR_C=[Q_MPBP,...pick(PR_FIRST,[0,2,3,4,5,6,7,10,1,12,13,11,14,15,16])];
const PR_B=[Q_W,...pick(PR_MORE,[10,11,15])];
const OX_C=pick(OX_FIRST,[0,1,2,3,4,6,7,9,10,11,14,16,17,27]);
const OX_B=[...pick(OX_FIRST,[5,18,19,20]),...pick(OX_MORE,[0,20])];
const RV_C=pick(RV_FIRST,[0,2,3,4,5,6,7,8,12,13,15,16,18,19,20,30]);
const RV_B=pick(RV_FIRST,[9,14,22,29,31,32]);
const IB_C=pick(IB_FIRST,[0,2,5,7,8,9,10,14,18,20,21]);
const IB_B=pick(IB_FIRST,[12,16,17,19]);
const EX_C=pick(EX_FIRST,[0,1,2,3,4,8,9,12,13,17,18,19,25,28,30]);
const EX_B=pick(EX_FIRST,[5,6,14,21,23,24,35,39]);

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
      T(svg,520,130,"Kerosene oil","small");line(svg,470,124,410,124,2.5);}
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

/* ===== Lesson 3 final set: 100 = lab pictures, then handbook exam questions, then textbook, then bonus ===== */
const EXQ="📝 Exam question",LP="🔬 Lab picture";
const pk=(arr,idx,src)=>idx.map(i=>src?Object.assign({},arr[i],{src}):arr[i]);
const NEW3={
 pr:[{pic:"circuit",q:"The bulb glows when a metal is placed between A and B. So metals",a:"Conduct electricity",t:["Conduct heat only","Are sonorous","Are ductile"],w:"Electric current flows through the metal and lights the bulb.",src:LP},
     {pic:"heatwire",q:"The wire is heated at one end. The wax melts and the pin falls. Why?",a:"Metals are good conductors of heat",t:["Metals are sonorous","Wax is a metal","The pin is magnetic"],lay:"col",w:"Heat travels along the metal wire to the far end.",src:LP},
     {pic:"hammer",q:"A metal block is beaten into a thin sheet. This property is",a:"Malleability",t:["Ductility","Sonority","Lustre"],w:"Metals can be beaten into thin sheets.",src:LP}],
 prX:[{q:"Which metal is the best conductor of electricity?",a:"Silver",t:["Iron","Lead","Aluminium"],w:"Silver conducts best; copper comes next.",src:EXQ},
      {q:"A blacksmith heats iron and beats it into tools. Which property is used?",a:"Malleability",t:["Ductility","Sonority","Lustre"],w:"Hot iron can be beaten into shapes.",src:EXQ},
      {q:"Why are copper and aluminium used for wiring instead of silver?",a:"They are cheaper and good conductors",t:["They conduct better than silver","Silver is a poor conductor","They are harder than silver"],lay:"col",w:"Silver is the best conductor but it is very costly.",src:EXQ},
      {q:"Which one of these is a non-metal?",a:"Sulphur",t:["Magnesium","Gold","Silver"],w:"Sulphur is a yellow non-metal.",src:EXQ}],
 ox:[{pic:"mgburn",q:"Magnesium ribbon burns with a dazzling white flame. What is the white ash?",a:"Magnesium oxide",t:["Magnesium hydroxide","Magnesium chloride","Magnesium carbonate"],w:"2Mg + O2 → 2MgO.",src:LP},
     {pic:"litmus",q:"Moist blue litmus turns red in sulphur dioxide. So this oxide is",a:"Acidic",t:["Basic","Neutral","Amphoteric"],w:"Non-metal oxides like SO2 are acidic.",src:LP},
     {pic:"kerosene",q:"Why is sodium kept under kerosene oil?",a:"It reacts vigorously with air and water",t:["It is a liquid metal","It is very costly","It melts in air"],lay:"col",w:"Sodium can catch fire in air, so it is kept away from air and water.",src:LP}],
 oxX:[{q:"Aluminium oxide reacts with both acids and bases. What can we conclude?",a:"Some metal oxides are amphoteric",t:["All metal oxides are basic","All metal oxides are acidic","Metal oxides do not react"],lay:"col",w:"Al2O3 and ZnO behave as both acid and base.",src:EXQ},
      {q:"Which statement is incorrect?",a:"Sodium is stored in water",t:["Graphite conducts electricity","Mercury is a liquid metal","Gold is a noble metal"],lay:"col",w:"Sodium reacts violently with water, so it is kept in kerosene.",src:EXQ}],
 rvX:[{q:"Radha: iron displaces copper from CuSO4. Sudha: copper displaces iron from FeSO4. Who is correct?",a:"Radha only",t:["Sudha only","Both","Neither"],w:"Iron is more reactive than copper, not the other way round.",src:EXQ},
      {q:"Sudha thinks all metals react with water. Which metal proves her wrong?",a:"Gold",t:["Sodium","Potassium","Calcium"],w:"Gold does not react with water at all.",src:EXQ}],
 exX:[{q:"Bauxite is an ore of",a:"Aluminium",t:["Iron","Copper","Zinc"],w:"Aluminium is extracted from bauxite, Al2O3.",src:EXQ},
      {q:"An iron nail left in water gets a reddish-brown layer. Name the process.",a:"Rusting",t:["Roasting","Galvanisation","Calcination"],w:"Iron reacts with air and water to form rust.",src:EXQ},
      {q:"Which pair is correctly matched?",a:"Galvanisation – prevents rusting",t:["Roasting – prevents corrosion","Alloying – extracts aluminium","Calcination – purifies gold"],lay:"col",w:"A zinc coat keeps air and water away from iron.",src:EXQ},
      {q:"What is the formula of cinnabar, the ore of mercury?",a:"HgS",t:["HgSO4","HgO","HgCl2"],w:"Cinnabar is mercury sulphide.",src:EXQ},
      {q:"How can an iron frying pan be protected from rusting?",a:"All of these",t:["Applying grease only","Applying paint only","A coating of zinc only"],w:"Grease, paint and zinc all keep air and water away.",src:EXQ},
      {q:"Why is solder used for joining electrical wires?",a:"It has a low melting point",t:["It has a high melting point","It is a non-metal","It does not conduct"],w:"Solder (lead + tin) melts easily.",src:EXQ},
      {q:"Which method is used to extract a highly reactive metal from its ore?",a:"Electrolysis",t:["Heating alone","Reduction with carbon","Roasting"],w:"Metals like Na, Mg and Al are got by electrolysis.",src:EXQ},
      {q:"Why are oxides of highly reactive metals not reduced by carbon?",a:"These metals hold oxygen more strongly than carbon",t:["Carbon is too costly","The oxides melt easily","Carbon is a metal"],lay:"col",w:"They have more affinity for oxygen than carbon has.",src:EXQ}]
};
const F3={
 pr:{C:[...NEW3.pr,...NEW3.prX,...pk(PR_C,[0,1,3,4,5,6,7,8,9,10,12,14,15])],B:[]},
 ox:{C:[...NEW3.ox,...NEW3.oxX,...pk(OX_FIRST,[21],EXQ),...pk(OX_C,[1,3,4,5,6,7,8,9,10,12,13])],B:pk(OX_B,[1,2,3])},
 rv:{C:[...pk(RV_C,[0,1,3,4]),...NEW3.rvX,...pk(RV_FIRST,[28],EXQ),...pk(RV_B,[3],EXQ),...pk(RV_C,[2,5,6,7,8,9,10,11,12,13,14,15])],B:pk(RV_B,[4,5])},
 ib:{C:[...IB_C],B:[...IB_B]},
 ex:{C:[...pk(EX_C,[12,10,4]),...NEW3.exX,...pk(EX_B,[6,4],EXQ),...pk(EX_C,[0,1,2,3,5,6,7,9,13,14])],B:[]}
};
const dPic=f=>(it,svg,S)=>drawPic(it,svg,S)||f(it,svg,S);

const G={
  pr:makeGame("pr",F3.pr.C,F3.pr.B,dPic(drawPr)),
  ox:makeGame("ox",F3.ox.C,F3.ox.B,dPic(drawOx)),
  rv:makeGame("rv",F3.rv.C,F3.rv.B,dPic(drawRv)),
  ib:makeGame("ib",F3.ib.C,F3.ib.B,dPic(drawIb)),
  ex:makeGame("ex",F3.ex.C,F3.ex.B,dPic(drawEx))
};
window.__MN={G,cfgOpts};
})();
