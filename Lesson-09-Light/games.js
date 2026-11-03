/* Lesson 9: Light – Reflection and Refraction — games.html content.
   Shared quiz-tab primitives ($, the Snd music/sfx engine, celebrate, banner)
   live in ../shared/app.js, loaded before this file, and are used as-is here.
   This lesson keeps its own local right/total/streak, mark(), shuffle() and
   nav-tab wiring because they differ slightly from the shared versions (no
   score-pop/spark animation, no auto-next AUTO/rearm system — this page uses
   its own countdown-bar auto-advance inside makeGame() instead).
   Everything else below is this lesson's own: the generic formula/SVG
   "lab picture" question engine (F, el, txt, ftxt, optHTML, makeGame), the
   shared-across-lessons LABPX scene-drawing library (note: most of its
   scenes — ethyne/ethene/benzene/metals/acids etc. — are leftover from a
   shared template and are NOT used by this Light lesson; only the optics
   scenes such as mirrorF, sidemirror, solarcooker, burnpaper, magnifier,
   diverge, rayMirrorC, rayMirrorPF, rayLens2F, prescription, bench, pencil,
   slab and airwater are referenced by this lesson's question data), and the
   5 games' 100 questions (mirrors, lenses, image tables, formulas, refraction).
   Relocated verbatim except for the four exact-duplicate blocks above. */

(function(){
let right=0,total=0,streak=0;
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

/* ===== Lesson 9: Light – Reflection and Refraction: lab pictures, exam questions, textbook, bonus ===== */
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
      T(svg,160,100,"Air","mid");T(svg,170,190,"Water","mid");T(svg,360,40,"normal","small");}
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

const MIR_C=[{"q": "Parallel rays meet at one point after reflecting from a concave mirror. What is this point called?", "a": "Principal focus", "t": ["Pole", "Centre of curvature", "Aperture"], "w": "Rays parallel to the axis meet at the principal focus F.", "src": "🔬 Lab picture", "pic": "mirrorF"}, {"q": "Vehicles use this mirror to see a wide area behind. Which mirror is it?", "a": "Convex mirror", "t": ["Concave mirror", "Plane mirror", "Cylindrical mirror"], "w": "A convex mirror gives an erect, diminished image and a wide view.", "src": "🔬 Lab picture", "pic": "sidemirror"}, {"q": "This solar cooker collects sunlight at one point. Which mirror does it use?", "a": "Concave mirror", "t": ["Convex mirror", "Plane mirror", "Cylindrical mirror"], "w": "A concave mirror brings sunlight together at its focus.", "src": "🔬 Lab picture", "pic": "solarcooker"}, {"q": "Pavan: a concave mirror is used as a rear-view mirror. Kiran: a convex mirror is used. Who is correct?", "a": "Kiran", "t": ["Pavan", "Both", "Neither"], "w": "Rear-view mirrors are convex mirrors.", "src": "📝 Exam question"}, {"q": "Find the radius of curvature of a convex mirror of focal length 16 cm.", "a": "32 cm", "t": ["8 cm", "16 cm", "64 cm"], "w": "R = 2f = 2 × 16 = 32 cm.", "src": "📝 Exam question"}, {"q": "The radius of curvature of a spherical mirror is 20 cm. What is its focal length?", "a": "10 cm", "t": ["20 cm", "40 cm", "5 cm"], "w": "f = R/2 = 20/2 = 10 cm.", "src": "📝 Exam question"}, {"q": "Why is a convex mirror used as a rear-view mirror?", "a": "It always gives an erect, diminished image and a wider view", "t": ["It gives an enlarged image", "It gives a real image", "It is cheaper than other mirrors"], "w": "The driver can see a large area of traffic behind.", "src": "📝 Exam question", "lay": "col"}, {"q": "Which are uses of concave mirrors?", "a": "Torches and shaving mirrors", "t": ["Rear-view mirrors and shop security mirrors", "Spectacles for short sight", "Periscopes"], "w": "Concave mirrors are used in torches, headlights, shaving and dentist's mirrors.", "src": "📝 Exam question", "lay": "col"}, {"q": "You want to see an enlarged image of your face. What do you do?", "a": "Use a concave mirror; keep the face between the pole and the focus", "t": ["Use a convex mirror at any distance", "Use a concave mirror; keep the face beyond C", "Use a plane mirror very close"], "w": "Between P and F, a concave mirror gives a virtual, erect, enlarged image.", "src": "📝 Exam question", "lay": "col"}, {"q": "A ray through the centre of curvature of a concave mirror reflects back along the same path. Why?", "a": "It falls along the normal to the mirror", "t": ["It passes through the focus", "It is parallel to the axis", "It hits the pole"], "w": "Along the normal, the angle of incidence is zero.", "src": "📝 Exam question"}, {"q": "A ray passes through the principal focus of a concave mirror. After reflection it", "a": "Goes parallel to the principal axis", "t": ["Passes through the focus again", "Comes back along the same path", "Passes through the pole"], "w": "Rays through F become parallel to the axis.", "src": "📝 Exam question"}, {"q": "The centre of the reflecting surface of a spherical mirror is called the", "a": "Pole", "t": ["Principal focus", "Centre of curvature", "Aperture"], "w": "The pole is shown by the letter P.", "src": "📘 Section 9.2"}, {"q": "How are the radius of curvature (R) and focal length (f) related?", "a": "R = 2f", "t": ["f = 2R", "R = f", "R = f/2"], "w": "For small mirrors, the focal length is half the radius of curvature.", "src": "📘 Section 9.2"}, {"q": "A spherical mirror whose reflecting surface curves inwards is a", "a": "Concave mirror", "t": ["Convex mirror", "Plane mirror", "Lens"], "w": "Concave means curved inwards, like a cave.", "src": "📘 Section 9.2"}, {"q": "By the laws of reflection, the angle of incidence is", "a": "Equal to the angle of reflection", "t": ["Greater than the angle of reflection", "Less than the angle of reflection", "Always 90°"], "w": "The incident ray, the normal and the reflected ray lie in the same plane.", "src": "📘 Section 9.1", "lay": "col"}, {"q": "The image formed by a plane mirror is", "a": "Virtual, erect and of the same size", "t": ["Real, inverted and diminished", "Real, erect and enlarged", "Virtual, inverted and diminished"], "w": "It is as far behind the mirror as the object is in front.", "src": "📘 Section 9.1", "lay": "col"}, {"q": "A convex mirror always forms an image that is", "a": "Virtual, erect and diminished", "t": ["Real, inverted and enlarged", "Real, erect and same size", "Virtual, inverted and enlarged"], "w": "For any object position, a convex mirror gives a small, erect image.", "src": "📘 Table 9.2", "lay": "col"}, {"q": "Which mirror is used as a shaving mirror?", "a": "Concave mirror", "t": ["Convex mirror", "Plane mirror", "Cylindrical mirror"], "w": "It gives a larger image of the face.", "src": "📘 Section 9.2.2"}, {"q": "Which mirror is used in torches and headlights for a strong parallel beam?", "a": "Concave mirror", "t": ["Convex mirror", "Plane mirror", "Cylindrical mirror"], "w": "A bulb at the focus gives a parallel beam.", "src": "📘 Section 9.2.2"}];
const MIR_B=[{"q": "The diameter of the reflecting surface of a spherical mirror is called its", "a": "Aperture", "t": ["Pole", "Radius", "Focus"], "w": "The aperture is the size of the mirror's surface."}];
const LEN_C=[{"q": "Sunlight through a convex lens burns paper at this spot. This point is the", "a": "Principal focus", "t": ["Optical centre", "Centre of curvature", "Pole"], "w": "Parallel sunlight meets at the principal focus and the paper gets hot (Activity 9.11).", "src": "🔬 Lab picture", "pic": "burnpaper"}, {"q": "A magnifying glass makes letters look bigger. Which lens is it?", "a": "Convex lens", "t": ["Concave lens", "Plane glass", "Prism"], "w": "With the object between F and O, a convex lens gives an enlarged image.", "src": "🔬 Lab picture", "pic": "magnifier"}, {"q": "This lens spreads parallel rays apart. Which lens is it?", "a": "Concave lens", "t": ["Convex lens", "Plane glass", "Prism"], "w": "A concave lens is a diverging lens.", "src": "🔬 Lab picture", "pic": "diverge"}, {"q": "I am a point on a lens. A ray passing through me does not bend. Who am I?", "a": "Optical centre", "t": ["Principal focus", "Centre of curvature", "Pole"], "w": "Rays through the optical centre go straight.", "src": "📝 Exam question"}, {"q": "The power of a lens is −4.0 D. What kind of lens is it?", "a": "Concave (diverging) lens", "t": ["Convex (converging) lens", "Plane glass", "Prism"], "w": "Negative power means a concave lens.", "src": "📝 Exam question"}, {"q": "A lens has a power of +2.0 D. What type of lens is it?", "a": "Convex lens", "t": ["Concave lens", "Plane glass", "Prism"], "w": "Positive power means a convex lens.", "src": "📝 Exam question"}, {"q": "Meenu says a convex lens always forms real images. When does it form a virtual image?", "a": "When the object is between F and O", "t": ["When the object is at 2F", "When the object is beyond 2F", "When the object is at infinity"], "w": "Then the image is virtual, erect and enlarged.", "src": "📝 Exam question", "lay": "col"}, {"q": "Why should we never look at the Sun through a magnifying glass?", "a": "It focuses sunlight and can damage the eye", "t": ["It makes the Sun look small", "It reflects all the light", "It turns the light blue"], "w": "The lens concentrates sunlight on the retina.", "src": "📝 Exam question", "lay": "col"}, {"q": "Half of a convex lens is covered with black paper. What happens to the image?", "a": "The full image forms, but it is dimmer", "t": ["Only half the image forms", "No image forms", "The image becomes larger"], "w": "Every part of the lens forms the image; less light reaches it.", "src": "📝 Exam question", "lay": "col"}, {"q": "An object is moved towards a convex lens. The image on the screen grows and then disappears. Where is the object now?", "a": "At the principal focus F", "t": ["At 2F", "Beyond 2F", "At the optical centre"], "w": "At F, the image forms at infinity, so it leaves the screen.", "src": "📝 Exam question"}, {"q": "A lens that is thick at the middle and thin at the edges is a", "a": "Convex lens", "t": ["Concave lens", "Plane glass", "Prism"], "w": "Convex lenses bulge outwards.", "src": "📘 Section 9.3.3"}, {"q": "A convex lens is also called a", "a": "Converging lens", "t": ["Diverging lens", "Plane lens", "Reflecting lens"], "w": "It brings light rays together.", "src": "📘 Section 9.3.3"}, {"q": "A concave lens always forms an image that is", "a": "Virtual, erect and diminished", "t": ["Real, inverted and enlarged", "Real, erect and same size", "Virtual, inverted and enlarged"], "w": "For any object position, the image is small and erect.", "src": "📘 Table 9.5", "lay": "col"}, {"q": "After passing through a concave lens, parallel rays appear to come from", "a": "The principal focus", "t": ["The optical centre", "The centre of curvature", "Infinity"], "w": "The rays spread out as if from F on the same side.", "src": "📘 Section 9.3.3"}, {"q": "A ray passing through the optical centre of a lens", "a": "Goes straight without bending", "t": ["Bends towards the axis", "Goes parallel to the axis", "Comes back"], "w": "It passes undeviated.", "src": "📘 Section 9.3.5"}, {"q": "A ray parallel to the principal axis, after passing through a convex lens,", "a": "Passes through the principal focus", "t": ["Goes straight on", "Comes back", "Bends away from the axis"], "w": "Convex lenses bring parallel rays to F.", "src": "📘 Section 9.3.5"}, {"q": "The centres of the two spherical surfaces of a lens are called its", "a": "Centres of curvature", "t": ["Principal foci", "Optical centres", "Poles"], "w": "They are marked C₁ and C₂.", "src": "📘 Section 9.3.3"}, {"q": "The distance between the optical centre and the principal focus is the", "a": "Focal length", "t": ["Radius of curvature", "Aperture", "Power"], "w": "It is shown by the letter f.", "src": "📘 Section 9.3.3"}, {"q": "Which image can be obtained on a screen?", "a": "A real image", "t": ["A virtual image", "Both", "Neither"], "w": "Real images are formed where the rays actually meet.", "src": "📘 Section 9.2.1"}];
const LEN_B=[{"q": "A lens with both surfaces bulging outwards is called a", "a": "Double convex lens", "t": ["Double concave lens", "Plano-concave lens", "Prism"], "w": "It is also called a bi-convex lens."}];
const IMG_C=[{"q": "The object is at C of a concave mirror. What is the image like?", "a": "At C: real, inverted, same size", "t": ["Between C and F: diminished", "Beyond C: enlarged", "Behind the mirror: virtual"], "w": "Table 9.1: object at C gives a same-size image at C.", "src": "🔬 Lab picture", "pic": "rayMirrorC"}, {"q": "The object is beyond 2F₁ of a convex lens. What is the image like?", "a": "Between F₂ and 2F₂: real, inverted, diminished", "t": ["At 2F₂: same size", "Beyond 2F₂: enlarged", "Same side: virtual, erect"], "w": "Table 9.4: beyond 2F₁ gives a small, real image.", "src": "🔬 Lab picture", "pic": "rayLens2F"}, {"q": "The object is between P and F of a concave mirror. What is the image like?", "a": "Behind the mirror: virtual, erect, enlarged", "t": ["At F: point-sized", "Beyond C: real, inverted", "At C: same size"], "w": "Table 9.1: this is how a shaving mirror works.", "src": "🔬 Lab picture", "pic": "rayMirrorPF"}, {"q": "Convex lens: where should the object be for a real and enlarged image?", "a": "Between F₁ and 2F₁", "t": ["At 2F₁", "Beyond 2F₁", "Between F₁ and O"], "w": "The image forms beyond 2F₂.", "src": "📝 Exam question"}, {"q": "Convex lens: where should the object be for a real image of the same size?", "a": "At 2F₁", "t": ["At F₁", "Beyond 2F₁", "At infinity"], "w": "The image forms at 2F₂.", "src": "📝 Exam question"}, {"q": "Convex lens: where should the object be for a virtual and enlarged image?", "a": "Between F₁ and O", "t": ["At 2F₁", "Beyond 2F₁", "At F₁"], "w": "This is how a magnifying glass is used.", "src": "📝 Exam question"}, {"q": "Convex lens: where should the object be for a highly diminished, point-sized image?", "a": "At infinity", "t": ["At 2F₁", "At F₁", "Between F₁ and O"], "w": "The image forms at F₂.", "src": "📝 Exam question"}, {"q": "Concave mirror: the object is at F. Where is the image?", "a": "At infinity: real, inverted, highly enlarged", "t": ["At F: point-sized", "At C: same size", "Behind the mirror: virtual"], "w": "Reflected rays go parallel and never meet.", "src": "📝 Exam question", "lay": "col"}, {"q": "The magnification of a lens is −1. What is the image like?", "a": "Real, inverted and same size", "t": ["Virtual, erect and same size", "Real, inverted and enlarged", "Virtual, erect and diminished"], "w": "Minus means real and inverted; 1 means same size.", "src": "📝 Exam question", "lay": "col"}, {"q": "A plane mirror has a magnification of +1. What does this mean?", "a": "The image is virtual, erect and of the same size", "t": ["The image is real and inverted", "The image is double the size", "The image is diminished"], "w": "Plus means virtual and erect; 1 means same size.", "src": "📝 Exam question", "lay": "col"}, {"q": "Vivek wants a virtual, erect image for any object position. Which should he use?", "a": "A convex mirror", "t": ["A concave mirror", "A convex lens", "A plane glass sheet"], "w": "A convex mirror always gives a virtual, erect, diminished image.", "src": "📝 Exam question"}, {"q": "Concave mirror: the object is at infinity. The image is", "a": "At F: highly diminished, point-sized", "t": ["At C: same size", "Beyond C: enlarged", "Behind the mirror"], "w": "Parallel rays meet at F.", "src": "📘 Table 9.1", "lay": "col"}, {"q": "Concave mirror: the object is beyond C. The image is", "a": "Between F and C: real, inverted, diminished", "t": ["Beyond C: enlarged", "At F: point-sized", "Behind the mirror: virtual"], "w": "The image is smaller than the object.", "src": "📘 Table 9.1", "lay": "col"}, {"q": "Concave mirror: the object is between C and F. The image is", "a": "Beyond C: real, inverted, enlarged", "t": ["Between C and F: diminished", "At F: point-sized", "Behind the mirror: virtual"], "w": "The image is larger than the object.", "src": "📘 Table 9.1", "lay": "col"}, {"q": "Convex mirror: the object is anywhere in front. The image is", "a": "Behind the mirror, between P and F: virtual, erect, diminished", "t": ["In front: real, inverted", "At C: same size", "At infinity: enlarged"], "w": "A convex mirror always gives a small, erect image.", "src": "📘 Table 9.2", "lay": "col"}, {"q": "Convex lens: the object is at 2F₁. The image is", "a": "At 2F₂: real, inverted, same size", "t": ["Beyond 2F₂: enlarged", "At F₂: point-sized", "Same side: virtual"], "w": "Object at 2F gives a same-size image at 2F.", "src": "📘 Table 9.4", "lay": "col"}, {"q": "Convex lens: the object is between F₁ and 2F₁. The image is", "a": "Beyond 2F₂: real, inverted, enlarged", "t": ["At 2F₂: same size", "Between F₂ and 2F₂: diminished", "Same side: virtual"], "w": "The image is larger than the object.", "src": "📘 Table 9.4", "lay": "col"}, {"q": "Convex lens: the object is at F₁. The image is", "a": "At infinity: real, inverted, highly enlarged", "t": ["At F₂: point-sized", "At 2F₂: same size", "Same side: virtual"], "w": "The refracted rays go parallel.", "src": "📘 Table 9.4", "lay": "col"}, {"q": "Concave lens: the object is anywhere. The image is", "a": "Between F₁ and O: virtual, erect, diminished", "t": ["Beyond 2F₂: real, enlarged", "At 2F₂: same size", "At infinity"], "w": "A concave lens always gives a small, erect image on the same side.", "src": "📘 Table 9.5", "lay": "col"}];
const IMG_B=[{"q": "Concave lens: the object is at infinity. The image is", "a": "At F₁: virtual, erect, highly diminished", "t": ["At 2F₁: same size", "At O: real", "At infinity: enlarged"], "w": "Parallel rays appear to come from F₁.", "lay": "col"}];
const FRM_C=[{"q": "A doctor prescribes this lens. What is its focal length?", "a": "+0.67 m (about 67 cm)", "t": ["+1.5 m", "−0.67 m", "+15 cm"], "w": "f = 1/P = 1/1.5 = 0.67 m.", "src": "🔬 Lab picture", "pic": "prescription"}, {"q": "u = −30 cm and v = +60 cm. What is the magnification?", "a": "−2", "t": ["+2", "−0.5", "+0.5"], "w": "m = v/u = 60/(−30) = −2. The image is real, inverted and twice as big.", "src": "🔬 Lab picture", "pic": "bench"}, {"q": "Find the power of a convex lens of focal length 50 cm.", "a": "+2 D", "t": ["+0.5 D", "+50 D", "−2 D"], "w": "P = 1/f = 1/0.5 m = +2 D.", "src": "📝 Exam question"}, {"q": "Find the focal length of a lens of power −2.0 D.", "a": "−0.5 m (−50 cm)", "t": ["−2 m", "+0.5 m", "−20 cm"], "w": "f = 1/P = 1/(−2) = −0.5 m.", "src": "📝 Exam question"}, {"q": "Ramu says, “The power of my spectacles is 80 cm.” What is wrong?", "a": "Power is measured in dioptres, not centimetres", "t": ["Nothing is wrong", "Power is measured in metres", "Power has no unit"], "w": "Power is in dioptres (D); focal length is in cm or m.", "src": "📝 Exam question", "lay": "col"}, {"q": "Which is the lens formula?", "a": "1/f = 1/v − 1/u", "t": ["1/f = 1/v + 1/u", "f = v − u", "1/f = 1/u − 1/v"], "w": "Lens formula: 1/v − 1/u = 1/f.", "src": "📝 Exam question"}, {"q": "What is the magnification produced by a lens?", "a": "m = hᵢ/hₒ = v/u", "t": ["m = u/v", "m = hₒ/hᵢ", "m = v + u"], "w": "Image height ÷ object height = v ÷ u.", "src": "📝 Exam question"}, {"q": "Two lenses of +2.0 D and +0.25 D are in contact. What is the net power?", "a": "+2.25 D", "t": ["+1.75 D", "+0.5 D", "+8 D"], "w": "Powers add: 2.0 + 0.25 = 2.25 D.", "src": "📝 Exam question"}, {"q": "A student says, “The power of a convex lens is negative.” Is this right?", "a": "No. A convex lens has positive f, so positive power", "t": ["Yes, always negative", "Only for thick lenses", "Only in water"], "w": "P = 1/f and f is positive for a convex lens.", "src": "📝 Exam question", "lay": "col"}, {"q": "Which is the mirror formula?", "a": "1/v + 1/u = 1/f", "t": ["1/v − 1/u = 1/f", "v + u = f", "1/u − 1/v = 1/f"], "w": "Mirror formula: 1/v + 1/u = 1/f.", "src": "📘 Section 9.2.4"}, {"q": "What is the SI unit of the power of a lens?", "a": "Dioptre (D)", "t": ["Metre (m)", "Watt (W)", "Newton (N)"], "w": "1 D = 1 m⁻¹.", "src": "📘 Section 9.3.8"}, {"q": "1 dioptre is the power of a lens whose focal length is", "a": "1 metre", "t": ["1 centimetre", "10 centimetres", "100 metres"], "w": "P = 1/f with f in metres.", "src": "📘 Section 9.3.8"}, {"q": "In the New Cartesian sign convention, distances measured against the incident light are", "a": "Negative", "t": ["Positive", "Always zero", "Always equal"], "w": "Distances along the direction of incident light are positive.", "src": "📘 Section 9.2.3"}, {"q": "The focal length of a concave mirror is", "a": "Negative", "t": ["Positive", "Zero", "Infinite"], "w": "F is in front of the mirror, against the incident light.", "src": "📘 Section 9.2.3"}, {"q": "A convex mirror (R = 3 m) on a bus. A bus is 5 m behind. Where is its image?", "a": "1.15 m behind the mirror", "t": ["5 m in front", "3 m behind", "0.6 m in front"], "w": "f = +1.5 m, u = −5 m: 1/v = 1/1.5 + 1/5, so v = +1.15 m.", "src": "📘 Example 9.1"}, {"q": "A concave mirror f = 15 cm; object at 25 cm. Where is the image?", "a": "37.5 cm in front of the mirror", "t": ["37.5 cm behind", "10 cm in front", "15 cm in front"], "w": "1/v = −1/15 + 1/25 gives v = −37.5 cm.", "src": "📘 Example 9.2"}, {"q": "A convex lens f = 10 cm; object at 15 cm. Where is the image?", "a": "30 cm on the other side", "t": ["30 cm on the same side", "6 cm on the other side", "15 cm on the other side"], "w": "1/v = 1/10 − 1/15 gives v = +30 cm.", "src": "📘 Example 9.4"}, {"q": "A concave lens f = 15 cm forms an image 10 cm from it. Where is the object?", "a": "30 cm from the lens", "t": ["10 cm from the lens", "15 cm from the lens", "6 cm from the lens"], "w": "1/u = 1/v − 1/f = −1/10 + 1/15 gives u = −30 cm.", "src": "📘 Example 9.3"}, {"q": "Find the power of a concave lens of focal length 2 m.", "a": "−0.5 D", "t": ["+0.5 D", "−2 D", "+2 D"], "w": "P = 1/f = 1/(−2) = −0.5 D.", "src": "📘 Section 9.3.8"}];
const FRM_B=[{"q": "A positive magnification means the image is", "a": "Virtual and erect", "t": ["Real and inverted", "Always enlarged", "Always diminished"], "w": "A negative m means real and inverted."}];
const BEND_C=[{"q": "A pencil looks bent in a glass of water. Why?", "a": "Refraction of light", "t": ["Reflection of light", "Dispersion of light", "Scattering of light"], "w": "Light bends as it passes from water into air.", "src": "🔬 Lab picture", "pic": "pencil"}, {"q": "How is the ray coming out of the glass slab related to the ray going in?", "a": "Parallel to it, but shifted sideways", "t": ["Perpendicular to it", "Along the same line", "It does not come out"], "w": "Section 9.3.1: the emergent ray is parallel to the incident ray.", "src": "🔬 Lab picture", "pic": "slab", "lay": "col"}, {"q": "A ray goes slantwise from air into water. Which way does it bend?", "a": "Towards the normal", "t": ["Away from the normal", "It does not bend", "It turns back"], "w": "Light slows down in water, a denser medium.", "src": "🔬 Lab picture", "pic": "airwater"}, {"q": "Vani: light is faster in diamond than in air. Rani: light is faster in air than in diamond. Who is correct?", "a": "Rani", "t": ["Vani", "Both", "Neither"], "w": "Diamond is optically denser, so light is slower in it.", "src": "📝 Exam question"}, {"q": "Raju: light is faster in benzene than in air. Rani: light is faster in air than in benzene. Who is correct?", "a": "Rani", "t": ["Raju", "Both", "Neither"], "w": "Benzene (1.50) is denser than air, so light is slower in it.", "src": "📝 Exam question"}, {"q": "Ravi's legs look shorter when he stands in a swimming pool. This is due to", "a": "Refraction of light", "t": ["Reflection of light", "Dispersion of light", "Scattering of light"], "w": "Light from his legs bends at the water surface.", "src": "📝 Exam question"}, {"q": "The refractive index of diamond is 2.42. What does this mean?", "a": "Light in air is 2.42 times faster than in diamond", "t": ["Diamond is 2.42 times heavier", "Light is faster in diamond", "Diamond reflects 2.42 times"], "w": "n = speed in air ÷ speed in the medium.", "src": "📝 Exam question", "lay": "col"}, {"q": "A ray goes slantwise from a denser medium into a rarer medium. It bends", "a": "Away from the normal", "t": ["Towards the normal", "Does not bend", "Back into the denser medium"], "w": "Light speeds up in the rarer medium.", "src": "📝 Exam question"}, {"q": "Light goes from medium A to medium B with the same refractive index. What happens?", "a": "It goes straight, no bending", "t": ["It bends towards the normal", "It bends away from the normal", "It is reflected back"], "w": "No change in speed, so no refraction.", "src": "📝 Exam question"}, {"q": "A ray strikes the surface between two media at right angles. What happens?", "a": "It goes straight without bending", "t": ["It bends towards the normal", "It bends away from the normal", "It is totally reflected"], "w": "Angle of incidence = angle of refraction = 0°.", "src": "📝 Exam question"}, {"q": "Varun says, “Light travels at the same speed in every medium.” Is he right?", "a": "No. Light slows down in denser media", "t": ["Yes, always the same", "Only in glass", "Only in water"], "w": "That change of speed is why light bends.", "src": "📝 Exam question", "lay": "col"}, {"q": "The bending of light when it goes from one medium into another is called", "a": "Refraction", "t": ["Reflection", "Dispersion", "Absorption"], "w": "It happens because light changes speed.", "src": "📘 Section 9.3"}, {"q": "A coin at the bottom of a tank of water appears", "a": "Raised (nearer the surface)", "t": ["Deeper than it is", "At the same depth", "Invisible"], "w": "Refraction makes the coin look higher.", "src": "📘 Section 9.3"}, {"q": "What is the speed of light in vacuum?", "a": "3 × 10⁸ m/s", "t": ["3 × 10⁶ m/s", "3 × 10⁸ km/s", "340 m/s"], "w": "Light is fastest in vacuum.", "src": "📘 Section 9.3.2"}, {"q": "The refractive index of a medium is", "a": "Speed of light in air ÷ speed of light in the medium", "t": ["Speed in the medium ÷ speed in air", "Angle of incidence × angle of refraction", "Density of the medium"], "w": "n = c / v.", "src": "📘 Section 9.3.2", "lay": "col"}, {"q": "Which of these has the highest refractive index?", "a": "Diamond", "t": ["Water", "Kerosene", "Crown glass"], "w": "Diamond: 2.42.", "src": "📘 Table 9.3"}, {"q": "An optically denser medium is one with a", "a": "Larger refractive index", "t": ["Smaller refractive index", "Larger mass density", "Lighter colour"], "w": "Light travels slower in it.", "src": "📘 Section 9.3.2"}, {"q": "Water has n = 1.33 and glass has n = 1.5. In which does light travel faster?", "a": "In water", "t": ["In glass", "Same speed in both", "Cannot say"], "w": "Lower refractive index means faster light.", "src": "📘 Section 9.3.2"}, {"q": "Why does light bend when it enters a new medium?", "a": "Its speed changes", "t": ["Its colour changes", "Its mass changes", "It gets reflected"], "w": "Different media slow light by different amounts.", "src": "📘 Section 9.3"}];
const BEND_B=[{"q": "Kerosene (1.44) or water (1.33): which is optically denser?", "a": "Kerosene", "t": ["Water", "Both are the same", "Neither"], "w": "A higher refractive index means optically denser."}];
const G={
  mir:makeGame("mir",MIR_C,MIR_B,drawPic),
  len:makeGame("len",LEN_C,LEN_B,drawPic),
  img:makeGame("img",IMG_C,IMG_B,drawPic),
  frm:makeGame("frm",FRM_C,FRM_B,drawPic),
  bend:makeGame("bend",BEND_C,BEND_B,drawPic)
};
window.__MN={G};
})();

