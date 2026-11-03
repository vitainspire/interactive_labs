/* Lesson 12: Magnetic Effects of Electric Current -- games.html content.
   The generic quiz-tab engine ($, Snd music/sfx, mark/celebrate for an exact
   match, nav-tab wiring) that is byte-identical to ../shared/app.js has been
   removed from here; this file is loaded after shared/app.js. This lesson's
   own shuffle(), mark() and nav-tab wiring below differ slightly from the
   shared versions (no score "pop"/spark flourish, no auto-next timer), so
   per the restructuring rule they were kept here rather than forced to match
   shared/app.js -- see the lesson report for details. Everything else below
   is this lesson's own: the SVG lab-picture-drawing library (shared source
   also used by other lessons; most of it is unused here), the makeGame()
   quiz engine, and the 5 games' question data for Lesson 12. */
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

/* ===== Lesson 12: Magnetic Effects of Electric Current: lab pictures, exam questions, textbook, bonus ===== */
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
  /* ---- Lesson 12 helper: bar magnet ---- */
  function MAG(svg,x1,x2,y,a,b){const m=(x1+x2)/2;el("rect",{x:x1,y,width:m-x1,height:32,fill:"#DC2626"},svg);el("rect",{x:m,y,width:x2-m,height:32,fill:"#3B82F6"},svg);
    el("rect",{x:x1,y,width:x2-x1,height:32,fill:"none",stroke:"#1E293B","stroke-width":2.5},svg);T(svg,(x1+m)/2,y+24,a,"mid",{style:"fill:#fff;stroke:none"});T(svg,(m+x2)/2,y+24,b,"mid",{style:"fill:#fff;stroke:none"});}
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
      [260,380].forEach(x=>el("rect",{x:x-8,y:236,width:16,height:14,fill:"#334155"},svg));},
    /* ===== Lesson 12: Magnetic Effects of Electric Current ===== */
    barField(svg){for(let k=1;k<=4;k++){const h=34*k;
        el("path",{d:`M236 112 C${210-14*k} ${112-h} ${430+14*k} ${112-h} 404 112`,fill:"none",stroke:"#2563EB","stroke-width":2.5},svg);
        el("path",{d:`M236 128 C${210-14*k} ${128+h} ${430+14*k} ${128+h} 404 128`,fill:"none",stroke:"#2563EB","stroke-width":2.5},svg);
        const yt=112-0.75*h,yb=128+0.75*h;el("path",{d:`M328 ${yt} l-14 -7 v14Z M328 ${yb} l-14 -7 v14Z`,fill:"#2563EB"},svg);}
      MAG(svg,236,404,104,"N","S");},
    compassNeedle(svg){el("circle",{cx:320,cy:125,r:92,fill:"#F8FAFC",stroke:"#334155","stroke-width":5},svg);
      [["N",320,52],["S",320,210],["E",398,132],["W",242,132]].forEach(([l,x,y])=>T(svg,x,y,l,"mid",{style:"fill:#334155"}));
      el("path",{d:"M320 52 L334 125 L306 125Z",fill:"#DC2626"},svg);el("path",{d:"M320 198 L334 125 L306 125Z",fill:"#94A3B8"},svg);
      el("circle",{cx:320,cy:125,r:7,fill:"#334155"},svg);ARRTO(svg,470,40,336,66,"#7C3AED");T(svg,486,40,"?","big",{style:"fill:#7C3AED"});},
    ironFilings(svg){MAG(svg,236,404,104,"N","S");const N=[236,120],S=[404,120];
      for(let k=0;k<260;k++){const x=120+((k*97)%400),y=10+((k*53)%225);if(x>226&&x<414&&y>94&&y<146)continue;
        let bx=0,by=0;[[N,1],[S,-1]].forEach(([p,q])=>{const dx=x-p[0],dy=y-p[1],r3=Math.pow(dx*dx+dy*dy,1.5)+1;bx+=q*dx/r3;by+=q*dy/r3;});
        const L=Math.hypot(bx,by)||1,u=[bx/L*5,by/L*5];line(svg,x-u[0],y-u[1],x+u[0],y+u[1],2,"#475569");}},
    oersted(svg){WIRE(svg,"M140 80 H500 M140 80 V210 H236 M262 210 H380 M420 210 H500 V80");CELLS(svg,240,210,2,16);KEY(svg,400,210);
      el("circle",{cx:320,cy:130,r:46,fill:"#F8FAFC",stroke:"#334155","stroke-width":4},svg);
      const G=el("g",{transform:"rotate(40 320 130)"},svg);el("path",{d:"M320 90 L330 130 L310 130Z",fill:"#DC2626"},G);el("path",{d:"M320 170 L330 130 L310 130Z",fill:"#94A3B8"},G);
      el("circle",{cx:320,cy:130,r:5,fill:"#334155"},svg);el("circle",{cx:320,cy:130,r:46,fill:"none",stroke:"#334155","stroke-width":4},svg);
      line(svg,140,80,500,80,5,"#B45309");T(svg,128,74,"X","mid");T(svg,514,74,"Y","mid");el("path",{d:"M400 68 l14 12 l-14 12",fill:"none",stroke:"#B45309","stroke-width":3},svg);},
    concCircles(svg){el("path",{d:"M140 110 L500 110 L560 190 L80 190Z",fill:"#FEF3C7",stroke:"#B45309","stroke-width":3},svg);
      [[40,13],[80,24],[125,34]].forEach(([rx,ry])=>el("ellipse",{cx:320,cy:150,rx,ry,fill:"none",stroke:"#334155","stroke-width":3,"stroke-dasharray":"2 5","stroke-linecap":"round"},svg));
      el("path",{d:"M222 176 l12 -10 l2 14Z",fill:"#2563EB"},svg);
      line(svg,320,14,320,150,6,"#B45309");line(svg,320,150,320,244,6,"#B45309");el("path",{d:"M320 6 l-11 20 h22Z",fill:"#B45309"},svg);T(svg,346,40,"I","mid");},
    thumbRule(svg){line(svg,320,10,320,244,7,"#B45309");el("path",{d:"M320 2 l-12 20 h24Z",fill:"#B45309"},svg);T(svg,350,30,"Current","small");
      el("rect",{x:330,y:40,width:22,height:66,rx:11,fill:"#F5C9A0",stroke:"#9A5B2E","stroke-width":2.5},svg);
      el("rect",{x:262,y:96,width:116,height:84,rx:24,fill:"#F5C9A0",stroke:"#9A5B2E","stroke-width":2.5},svg);
      [118,138,158].forEach(y=>el("path",{d:`M266 ${y} Q320 ${y+8} 374 ${y}`,fill:"none",stroke:"#9A5B2E","stroke-width":2},svg));
      el("path",{d:"M270 214 A60 16 0 1 0 370 214",fill:"none",stroke:"#7C3AED","stroke-width":3.5},svg);el("path",{d:"M370 214 l-4 -15 l14 6Z",fill:"#7C3AED"},svg);
      T(svg,410,226,"?","big",{style:"fill:#7C3AED"});},
    solenoid(svg){for(let k=0;k<11;k++){const x=228+k*18;el("path",{d:`M${x} 80 A9 40 0 0 1 ${x} 160`,fill:"none",stroke:"#B45309","stroke-width":4},svg);}
      [104,120,136].forEach(y=>{line(svg,196,y,444,y,2.5,"#2563EB");el("path",{d:`M330 ${y} l-12 -6 v12Z`,fill:"#2563EB"},svg);});
      [[60,"M444 104 C520 104 520 30 320 30 C120 30 120 104 196 104"],[0,"M444 136 C520 136 520 210 320 210 C120 210 120 136 196 136"]].forEach(([,d])=>el("path",{d,fill:"none",stroke:"#2563EB","stroke-width":2.5},svg));
      el("path",{d:"M314 30 l12 -6 v12Z M314 210 l12 -6 v12Z",fill:"#2563EB"},svg);},
    electromagnet(svg){el("rect",{x:190,y:112,width:250,height:18,rx:3,fill:"#94A3B8",stroke:"#475569","stroke-width":2},svg);el("rect",{x:432,y:98,width:12,height:46,rx:3,fill:"#64748B"},svg);
      for(let k=0;k<10;k++){const x=240+k*16;el("ellipse",{cx:x,cy:121,rx:6,ry:20,fill:"none",stroke:"#B45309","stroke-width":3.5},svg);}
      WIRE(svg,"M240 141 V210 H296 M320 210 H384 V141");CELLS(svg,300,210,1);
      [[176,104,-30],[170,126,10],[178,146,40],[160,114,-10],[164,140,25]].forEach(([x,y,a])=>el("line",{x1:x-14,y1:y,x2:x+14,y2:y,stroke:"#475569","stroke-width":3,transform:`rotate(${a} ${x} ${y})`},svg));
      T(svg,165,190,"Pins","small");},
    loopField(svg){el("path",{d:"M100 200 L540 200 L580 60 L60 60Z",fill:"#FEF3C7",stroke:"#B45309","stroke-width":3,opacity:.9},svg);
      const A=[230,130],B=[410,130];
      [A,B].forEach(p=>[16,32].forEach(r=>el("ellipse",{cx:p[0],cy:p[1],rx:r,ry:r*0.55,fill:"none",stroke:"#334155","stroke-width":2.5,"stroke-dasharray":"2 5","stroke-linecap":"round"},svg)));
      el("path",{d:"M300 80 Q280 130 300 180 M340 80 Q360 130 340 180",fill:"none",stroke:"#334155","stroke-width":2.5,"stroke-dasharray":"2 5","stroke-linecap":"round"},svg);
      line(svg,320,74,320,186,2.5,"#2563EB");el("path",{d:"M320 120 l-6 12 h12Z",fill:"#2563EB"},svg);
      el("ellipse",{cx:320,cy:130,rx:90,ry:96,fill:"none",stroke:"#B45309","stroke-width":5,opacity:.55},svg);
      [A,B].forEach(p=>el("circle",{cx:p[0],cy:p[1],r:6,fill:"#B45309"},svg));T(svg,320,240,"Loop of wire through the cardboard","small");},
    rodMagnet(svg){el("rect",{x:200,y:20,width:16,height:150,fill:"#64748B"},svg);line(svg,200,20,440,20,6,"#64748B");
      line(svg,300,20,262,128,2.5);line(svg,400,20,362,128,2.5);
      el("rect",{x:276,y:46,width:120,height:34,rx:4,fill:"#3B82F6"},svg);T(svg,336,70,"S","mid",{style:"fill:#fff;stroke:none"});
      el("rect",{x:276,y:176,width:120,height:34,rx:4,fill:"#DC2626"},svg);T(svg,336,200,"N","mid",{style:"fill:#fff;stroke:none"});
      el("rect",{x:300,y:122,width:100,height:12,rx:6,fill:"none",stroke:GL,"stroke-width":2,"stroke-dasharray":"5 4"},svg);
      el("rect",{x:256,y:122,width:112,height:12,rx:6,fill:"#CBD5E1",stroke:"#475569","stroke-width":2},svg);
      T(svg,244,132,"A","small");T(svg,382,132,"B","small");ARRTO(svg,250,152,206,152,"#7C3AED");T(svg,226,174,"pushed","small");},
    fleming(svg){const O=[300,150];el("ellipse",{cx:O[0],cy:O[1],rx:52,ry:40,fill:"#F5C9A0",stroke:"#9A5B2E","stroke-width":2.5},svg);
      [[300,26,"#7C3AED","?",322,30],[510,150,"#2563EB","Field",540,140],[190,232,"#DC2626","Current",150,242]].forEach(([x,y,c,l,tx,ty])=>{
        line(svg,O[0],O[1],x,y,16,"#F5C9A0");ARRTO(svg,O[0],O[1],x,y,c);T(svg,tx,ty,l,l==="?"?"big":"mid",{style:`fill:${c}`});});
      T(svg,430,226,"Left hand","small");},
    mri(svg){el("rect",{x:300,y:20,width:200,height:200,rx:40,fill:"#E2E8F0",stroke:"#64748B","stroke-width":4},svg);
      el("circle",{cx:400,cy:120,r:58,fill:"#1E293B"},svg);el("rect",{x:120,y:132,width:340,height:18,rx:6,fill:"#94A3B8"},svg);
      el("rect",{x:150,y:150,width:16,height:70,fill:"#64748B"},svg);
      el("circle",{cx:340,cy:118,r:15,fill:"#F5C9A0"},svg);el("rect",{x:180,y:112,width:150,height:22,rx:10,fill:"#60A5FA"},svg);},
    wireColours(svg){[[60,"#DC2626","Live (red)"],[125,"#1F2937","Neutral (black)"],[190,"#16A34A","?"]].forEach(([y,c,l])=>{
        line(svg,150,y,500,y,16,c);line(svg,500,y,540,y,6,"#C2410C");T(svg,l==="?"?100:84,y+7,l,l==="?"?"big":"small",l==="?"?{style:"fill:#7C3AED"}:{});});},
    domCircuit(svg){line(svg,40,80,40,190,3);T(svg,40,70,"Mains","small");WIRE(svg,"M40 100 H90 M150 100 H190 M250 100 H280 M40 170 H280");
      [[90,"Meter"],[190,"Main fuse"]].forEach(([x,l])=>{el("rect",{x,y:82,width:60,height:36,rx:6,fill:"#F1F5F9",stroke:"#334155","stroke-width":2.5},svg);T(svg,x+30,140,l,"small");});
      el("rect",{x:280,y:40,width:300,height:70,rx:10,fill:"rgba(250,204,21,.25)",stroke:"#CA8A04","stroke-width":3},svg);
      el("rect",{x:280,y:130,width:300,height:70,rx:10,fill:"none",stroke:"#94A3B8","stroke-width":2},svg);
      T(svg,330,82,"15 A","mid",{style:"fill:#B45309"});T(svg,330,172,"5 A","mid");
      el("rect",{x:420,y:52,width:46,height:46,rx:8,fill:"#E2E8F0",stroke:"#334155","stroke-width":2},svg);T(svg,500,82,"?","big",{style:"fill:#7C3AED"});
      BULBS(svg,450,165,"on");T(svg,520,170,"Bulb","small");},
    shortCircuit(svg){line(svg,60,90,300,118,14,"#DC2626");line(svg,580,90,340,118,14,"#1F2937");line(svg,300,118,334,121,5,"#C2410C");line(svg,340,118,306,122,5,"#C2410C");
      el("polygon",{points:"320,70 330,104 362,96 336,118 360,144 326,132 316,166 308,132 276,144 302,118 280,96 310,104",fill:"#FDE047",stroke:"#F59E0B","stroke-width":2},svg);
      T(svg,120,140,"Live","small");T(svg,520,140,"Neutral","small");}
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

const FIELD_C=[{"q": "Field lines come out of one end of this magnet. Which pole is it?", "a": "The north pole", "t": ["The south pole", "The middle", "Both ends"], "w": "Field lines leave the N pole and enter the S pole.", "src": "🔬 Lab picture", "pic": "barField"}, {"q": "The end of a compass needle that points towards the north is called its", "a": "North pole", "t": ["South pole", "East pole", "Centre"], "w": "A compass needle is a small magnet.", "src": "🔬 Lab picture", "pic": "compassNeedle"}, {"q": "Iron filings sprinkled around this magnet line up along the", "a": "Magnetic field lines", "t": ["Straight lines away from the magnet", "Edges of the paper", "Centre only"], "w": "Each filing behaves like a tiny magnet.", "src": "🔬 Lab picture", "pic": "ironFilings"}, {"q": "In the activity to draw field lines, the points marked with the compass are joined by", "a": "A smooth curve: one field line", "t": ["Straight lines", "A circle around the compass", "Nothing"], "w": "Repeating this gives the full pattern.", "src": "📝 Exam question"}, {"q": "Near the north pole of a bar magnet, the north pole of a compass needle points", "a": "Away from the magnet", "t": ["Towards the magnet", "Straight up", "Nowhere"], "w": "Like poles repel.", "src": "📝 Exam question"}, {"q": "What do the lines drawn around a bar magnet with a compass show?", "a": "The magnetic field around the magnet", "t": ["The electric current", "The weight of the magnet", "Heat from the magnet"], "w": "They are magnetic field lines.", "src": "📝 Exam question"}, {"q": "The region around a magnet where its force can be felt is called its", "a": "Magnetic field", "t": ["Electric field", "Field line", "Pole"], "w": "It has both size and direction.", "src": "📘 Section 12.1"}, {"q": "Inside a bar magnet, the field lines go from", "a": "South pole to north pole", "t": ["North pole to south pole", "The centre to the ends", "Nowhere"], "w": "So the field lines are closed curves.", "src": "📘 Section 12.1"}, {"q": "Magnetic field lines are", "a": "Closed curves", "t": ["Open straight lines", "Broken lines", "Zig-zag lines"], "w": "They go out at N, come in at S, and continue inside.", "src": "📘 Section 12.1"}, {"q": "Why do two magnetic field lines never cross?", "a": "A compass there would point two ways at once, which is impossible", "t": ["They are too thin", "They repel each other", "They are always parallel"], "w": "The field has only one direction at a point.", "src": "📘 Section 12.1", "lay": "col"}, {"q": "Where field lines are crowded close together, the field is", "a": "Stronger", "t": ["Weaker", "Zero", "Reversed"], "w": "Closer lines mean a greater force.", "src": "📘 Section 12.1"}, {"q": "A magnetic field has", "a": "Both direction and size (magnitude)", "t": ["Only size", "Only direction", "Neither"], "w": "A compass shows its direction.", "src": "📘 Section 12.1"}, {"q": "The direction of the magnetic field at a point is the way", "a": "A north pole placed there would move", "t": ["A south pole would move", "An electron would move", "Light travels"], "w": "So we use the compass N pole to find it.", "src": "📘 Section 12.1", "lay": "col"}, {"q": "Who discovered that an electric current produces a magnetic field?", "a": "Hans Christian Oersted", "t": ["Michael Faraday", "Andre Marie Ampere", "Georg Simon Ohm"], "w": "He found it by chance in 1820.", "src": "📘 Section 12.1"}, {"q": "In which year did Oersted find that a current deflects a compass needle?", "a": "1820", "t": ["1920", "1777", "1851"], "w": "Oersted lived from 1777 to 1851.", "src": "📘 Section 12.1"}, {"q": "The unit of magnetic field strength named after Oersted is the", "a": "Oersted", "t": ["Ohm", "Ampere", "Volt"], "w": "It honours his discovery.", "src": "📘 Section 12.1"}, {"q": "A compass needle is really", "a": "A small magnet", "t": ["A piece of copper", "A glass needle", "An electric cell"], "w": "Its ends are its N and S poles.", "src": "📘 Section 12.1"}, {"q": "Two like magnetic poles", "a": "Repel each other", "t": ["Attract each other", "Have no effect", "Become one pole"], "w": "Unlike poles attract.", "src": "📘 Section 12.1"}, {"q": "Iron filings around a bar magnet gather most thickly near the", "a": "Poles", "t": ["Middle of the magnet", "Far corners of the paper", "Nowhere"], "w": "The field is strongest at the poles.", "src": "📘 Section 12.1"}];
const FIELD_B=[{"q": "Why does a freely hanging compass needle point north–south?", "a": "The Earth behaves like a huge magnet", "t": ["The Sun pulls it", "Wind pushes it", "It is heavier at one end"], "w": "The needle lines up with the Earth's magnetic field.", "lay": "col"}];
const WIRE_C=[{"q": "The key is closed and current flows in wire XY. The compass needle", "a": "Deflects", "t": ["Stays still", "Melts", "Spins forever"], "w": "The current makes a magnetic field around the wire.", "src": "🔬 Lab picture", "pic": "oersted"}, {"q": "Iron filings around this vertical current-carrying wire form", "a": "Concentric circles", "t": ["Straight lines", "A square", "Random dots"], "w": "The wire is at the common centre.", "src": "🔬 Lab picture", "pic": "concCircles"}, {"q": "The thumb points along the current. The curled fingers show the", "a": "Direction of the magnetic field", "t": ["Direction of the current", "Direction of the force", "Resistance of the wire"], "w": "This is the right-hand thumb rule.", "src": "🔬 Lab picture", "pic": "thumbRule"}, {"q": "In Oersted's experiment, the compass needle deflects when current flows. This shows that", "a": "The current produces a magnetic field around the wire", "t": ["The wire becomes hot", "The compass is broken", "The current stops"], "w": "A current-carrying wire behaves like a magnet.", "src": "📝 Exam question", "lay": "col"}, {"q": "Current flows from north to south in a wire held over a compass. The north pole of the needle moves", "a": "Towards the east", "t": ["Towards the west", "Up and down", "Nowhere"], "w": "The field under the wire points east.", "src": "📝 Exam question"}, {"q": "The current in that wire is reversed (south to north). Now the needle moves", "a": "Towards the west", "t": ["Towards the east", "Up and down", "It stops working"], "w": "The magnetic field is reversed too.", "src": "📝 Exam question"}, {"q": "Why do we tap the cardboard gently after sprinkling iron filings?", "a": "So the filings can move and line up with the field", "t": ["To heat the wire", "To make the current bigger", "To remove the filings"], "w": "Tapping frees the filings to turn.", "src": "📝 Exam question", "lay": "col"}, {"q": "The direction of the field at point P near the wire is shown by the", "a": "North pole of a compass placed at P", "t": ["South pole of a compass at P", "Ammeter", "Battery"], "w": "Draw an arrow along the N pole.", "src": "📝 Exam question"}, {"q": "In the activity, the thick copper wire is kept ___ to the plane of the cardboard.", "a": "Normal (perpendicular)", "t": ["Parallel", "At 45°", "Coiled"], "w": "The circles then form flat on the cardboard.", "src": "📝 Exam question"}, {"q": "If the current in the wire is increased, the compass deflection", "a": "Increases", "t": ["Decreases", "Stays the same", "Becomes zero"], "w": "A bigger current gives a stronger field.", "src": "📘 Section 12.2"}, {"q": "As the compass is moved away from the wire, the deflection", "a": "Decreases", "t": ["Increases", "Stays the same", "Reverses"], "w": "The field gets weaker with distance.", "src": "📘 Section 12.2"}, {"q": "In the right-hand thumb rule, the thumb points in the direction of the", "a": "Current", "t": ["Magnetic field", "Force", "Electron flow"], "w": "The fingers then show the field.", "src": "📘 Section 12.2.2"}, {"q": "The right-hand thumb rule is also called", "a": "Maxwell's corkscrew rule", "t": ["Fleming's left-hand rule", "Ohm's law", "Joule's law"], "w": "Drive a corkscrew along the current; its turning shows the field.", "src": "📘 Section 12.2.2"}, {"q": "Current in a power line flows from east to west. Directly below the wire, the field points", "a": "From north to south", "t": ["From south to north", "From east to west", "Straight up"], "w": "By the right-hand thumb rule. Above the wire, it is south to north.", "src": "📘 Section 12.2.2", "lay": "col"}, {"q": "At the centre of a current-carrying circular loop, the field lines", "a": "Look like straight lines", "t": ["Form small circles", "Are absent", "Cross each other"], "w": "The big circles look straight near the centre.", "src": "📘 Section 12.2.3"}, {"q": "A coil has n turns. The field it makes is", "a": "n times that of one turn", "t": ["Half that of one turn", "The same as one turn", "Zero"], "w": "The fields of all the turns add up.", "src": "📘 Section 12.2.3"}, {"q": "The field of a straight wire at a point depends ___ on its distance from the wire.", "a": "Inversely", "t": ["Directly", "Not at all", "Only on the wire's colour"], "w": "Farther away, weaker field.", "src": "📘 Section 12.2"}, {"q": "Two ways of producing a magnetic field are", "a": "Using a magnet, and passing current through a wire", "t": ["Heating and cooling", "Using glass and water", "Using light and sound"], "w": "A current-carrying wire acts like a magnet.", "src": "📘 Section 12.2", "lay": "col"}, {"q": "Inside a current-carrying loop, every part of the wire adds field lines", "a": "In the same direction", "t": ["In opposite directions", "That cancel out", "In random directions"], "w": "So the field at the centre is strong.", "src": "📘 Section 12.2.3"}];
const WIRE_B=[{"q": "A current-carrying wire behaves like a", "a": "Magnet", "t": ["Battery", "Bulb", "Insulator"], "w": "This is the magnetic effect of electric current."}];
const SOL_C=[{"q": "The field of this current-carrying solenoid looks like that of a", "a": "Bar magnet", "t": ["Single straight wire", "Single circular loop", "Glass prism"], "w": "One end acts as N, the other as S.", "src": "🔬 Lab picture", "pic": "solenoid"}, {"q": "This soft iron nail inside a coil picks up pins only while current flows. It is", "a": "An electromagnet", "t": ["A permanent magnet", "A compass", "A fuse"], "w": "It loses most of its magnetism when the current stops.", "src": "🔬 Lab picture", "pic": "electromagnet"}, {"q": "At the centre of this current-carrying loop, the field lines are", "a": "Nearly straight and parallel", "t": ["Tight small circles", "Absent", "Zig-zag"], "w": "The arcs of big circles look straight there.", "src": "🔬 Lab picture", "pic": "loopField"}, {"q": "A coil of many circular turns of insulated copper wire, shaped like a cylinder, is a", "a": "Solenoid", "t": ["Resistor", "Fuse", "Rheostat"], "w": "Its field is like a bar magnet's.", "src": "📘 Section 12.2.4"}, {"q": "Inside a solenoid, the magnetic field is", "a": "Uniform: the same at all points", "t": ["Zero", "Strong at one point only", "Changing direction"], "w": "The field lines inside are parallel.", "src": "📘 Section 12.2.4"}, {"q": "Inside a solenoid, the field lines are", "a": "Parallel straight lines", "t": ["Circles", "Zig-zag lines", "Crossing lines"], "w": "This shows a uniform field.", "src": "📘 Section 12.2.4"}, {"q": "The two ends of a current-carrying solenoid behave like", "a": "A north pole and a south pole", "t": ["Two north poles", "Two south poles", "No poles"], "w": "Just like a bar magnet.", "src": "📘 Section 12.2.4"}, {"q": "An electromagnet is made of", "a": "A soft iron core inside a coil of insulated copper wire", "t": ["A copper core in a glass tube", "A plastic rod with no coil", "A bar magnet in water"], "w": "The coil's field magnetises the core.", "src": "📘 Section 12.2.4", "lay": "col"}, {"q": "The strong field inside a solenoid can be used to", "a": "Magnetise a piece of soft iron", "t": ["Melt iron", "Make light", "Measure voltage"], "w": "The magnet so formed is an electromagnet.", "src": "📘 Section 12.2.4"}, {"q": "The field at the centre of a circular coil increases when", "a": "The current or the number of turns increases", "t": ["The coil is made of plastic", "The current decreases", "The coil is cut"], "w": "The field of each turn adds up.", "src": "📘 Section 12.2.3", "lay": "col"}, {"q": "If the current in a solenoid is reversed, its poles", "a": "Interchange: N becomes S", "t": ["Stay the same", "Disappear", "Become stronger"], "w": "The field direction reverses.", "src": "📘 Section 12.2.4"}, {"q": "How can you make an electromagnet stronger?", "a": "Use more turns or a bigger current", "t": ["Use fewer turns", "Remove the iron core", "Use a wooden core"], "w": "Both make the field stronger.", "src": "📘 Section 12.2.4", "lay": "col"}, {"q": "Which material makes the best core for an electromagnet?", "a": "Soft iron", "t": ["Copper", "Wood", "Plastic"], "w": "Soft iron is easily magnetised and demagnetised.", "src": "📘 Section 12.2.4"}, {"q": "True or false: the field at the centre of a long circular coil carrying current is made of parallel straight lines.", "a": "True", "t": ["False"], "w": "Near the centre, the field lines look straight and parallel.", "src": "📘 Section 12.2.3"}, {"q": "Outside a solenoid, the field lines go from its", "a": "North end to its south end", "t": ["South end to its north end", "Middle to its ends", "Ends to its middle"], "w": "Inside, they go from S to N.", "src": "📘 Section 12.2.4"}, {"q": "When the current is switched off, an electromagnet", "a": "Loses most of its magnetism", "t": ["Becomes stronger", "Starts to glow", "Becomes a permanent magnet"], "w": "That is why it is so useful.", "src": "📘 Section 12.2.4"}, {"q": "A solenoid carrying current attracts iron filings most at its", "a": "Ends", "t": ["Middle only", "Nowhere", "Insulation"], "w": "The ends act as poles.", "src": "📘 Section 12.2.4"}, {"q": "We see the field pattern of a solenoid by sprinkling", "a": "Iron filings on a cardboard around it", "t": ["Water on it", "Sand on the battery", "Salt in the wire"], "w": "Then we tap the cardboard gently.", "src": "📘 Section 12.2.4"}, {"q": "Compared with a single loop, a long solenoid gives a field that is", "a": "Stronger, and uniform inside", "t": ["Weaker", "Zero inside", "Only outside"], "w": "Many turns add up their fields.", "src": "📘 Section 12.2.4", "lay": "col"}];
const SOL_B=[{"q": "Which device at home uses an electromagnet?", "a": "An electric bell", "t": ["A candle", "A glass mirror", "A plastic bucket"], "w": "The electromagnet pulls the hammer to strike the bell."}];
const FORCE_C=[{"q": "The aluminium rod between the poles moves when current flows. Why?", "a": "A force acts on a current-carrying conductor in a magnetic field", "t": ["The rod becomes hot", "The wind pushes it", "The magnet loses its poles"], "w": "Ampere predicted this force.", "src": "🔬 Lab picture", "pic": "rodMagnet", "lay": "col"}, {"q": "In this left-hand rule, the first finger shows the field and the second finger the current. The thumb shows the", "a": "Force (motion) on the conductor", "t": ["Current", "Magnetic field", "Voltage"], "w": "This is Fleming's left-hand rule.", "src": "🔬 Lab picture", "pic": "fleming"}, {"q": "This hospital machine uses magnetic fields inside the body to make images. It is", "a": "MRI (Magnetic Resonance Imaging)", "t": ["An X-ray film", "An ECG machine", "A thermometer"], "w": "Doctors use the images to find illnesses.", "src": "🔬 Lab picture", "pic": "mri", "lay": "col"}, {"q": "In the aluminium rod activity, the rod moves to the left. When the current is reversed, the rod moves", "a": "To the right", "t": ["To the left, faster", "Upwards", "Not at all"], "w": "The force reverses with the current.", "src": "📝 Exam question"}, {"q": "Which magnet is used in the aluminium rod activity?", "a": "A strong horse-shoe magnet", "t": ["A compass needle", "A wooden magnet", "No magnet"], "w": "The rod hangs between its poles.", "src": "📝 Exam question"}, {"q": "In that activity, the N pole is below the rod and the S pole is above it. The magnetic field is", "a": "Vertically upward", "t": ["Vertically downward", "Horizontal", "Zero"], "w": "Field lines go from N to S.", "src": "📝 Exam question"}, {"q": "Who suggested that a magnet must exert a force on a current-carrying conductor?", "a": "Andre Marie Ampere", "t": ["Hans Christian Oersted", "Michael Faraday", "Georg Simon Ohm"], "w": "French scientist, 1775–1836.", "src": "📘 Section 12.3"}, {"q": "The force on a conductor is largest when the current is ___ to the magnetic field.", "a": "Perpendicular", "t": ["Parallel", "At 30°", "Opposite"], "w": "Then the force is at right angles to both.", "src": "📘 Section 12.3"}, {"q": "If the magnetic field is reversed, the force on the rod", "a": "Reverses", "t": ["Stays the same", "Becomes zero", "Doubles"], "w": "The force depends on both field and current.", "src": "📘 Section 12.3"}, {"q": "In Fleming's left-hand rule, the first finger (forefinger) points along the", "a": "Magnetic field", "t": ["Current", "Force", "Motion of electrons"], "w": "Field, Current, Thrust: first, second, thumb.", "src": "📘 Section 12.3"}, {"q": "In Fleming's left-hand rule, the second (middle) finger points along the", "a": "Current", "t": ["Magnetic field", "Force", "Earth's north"], "w": "The thumb then gives the force.", "src": "📘 Section 12.3"}, {"q": "Which devices use current-carrying conductors in magnetic fields?", "a": "Electric motors, loudspeakers and generators", "t": ["Electric irons and heaters", "Candles and torches", "Mirrors and lenses"], "w": "Also microphones and measuring instruments.", "src": "📘 Section 12.3", "lay": "col"}, {"q": "An electron enters a magnetic field at right angles to it. The force on it is", "a": "Perpendicular to both the field and its motion", "t": ["Along its motion", "Along the field", "Zero"], "w": "Use Fleming's rule, with current opposite to electron flow.", "src": "📘 Section 12.3", "lay": "col"}, {"q": "In the rod activity, if the current is increased, the rod's displacement", "a": "Increases", "t": ["Decreases", "Stays the same", "Becomes zero"], "w": "A bigger current means a bigger force.", "src": "📘 Section 12.3"}, {"q": "If a stronger horse-shoe magnet is used, the rod's displacement", "a": "Increases", "t": ["Decreases", "Stays the same", "Reverses"], "w": "A stronger field means a bigger force.", "src": "📘 Section 12.3"}, {"q": "Which property of a proton can change while it moves freely in a magnetic field?", "a": "Its velocity (and so its momentum)", "t": ["Its mass", "Its charge", "Nothing at all"], "w": "The force changes its direction of motion.", "src": "📘 Section 12.3", "lay": "col"}, {"q": "An alpha particle moving west is pushed north by a magnetic field. The field points", "a": "Upward", "t": ["Towards the south", "Towards the east", "Downward"], "w": "Use Fleming's left-hand rule.", "src": "📘 Section 12.3"}, {"q": "An electron beam moves from the back wall to the front wall and bends to your right. The field points", "a": "Vertically downward", "t": ["Vertically upward", "To the left", "Towards the front"], "w": "Current is opposite to the electrons' motion.", "src": "📘 Section 12.3", "lay": "col"}, {"q": "The two organs in our body that make noticeable magnetic fields are the", "a": "Heart and brain", "t": ["Liver and lungs", "Bones and skin", "Eyes and ears"], "w": "These fields help in MRI imaging.", "src": "📘 Section 12.3"}];
const FORCE_B=[{"q": "Magnetic fields made by our nerves are about how strong?", "a": "One-billionth of the Earth's field", "t": ["Stronger than a bar magnet", "Equal to the Earth's field", "Zero"], "w": "Even weak ion currents make magnetic fields.", "lay": "col"}];
const HOME_C=[{"q": "The live wire is red and the neutral wire is black. The green wire is the", "a": "Earth wire", "t": ["Live wire", "Neutral wire", "Fuse wire"], "w": "It is joined to a metal plate deep in the earth.", "src": "🔬 Lab picture", "pic": "wireColours"}, {"q": "This circuit has a 15 A rating. It is meant for", "a": "High-power appliances like geysers and air coolers", "t": ["Only bulbs", "Only phone chargers", "Nothing"], "w": "The 5 A circuit is for bulbs and fans.", "src": "🔬 Lab picture", "pic": "domCircuit", "lay": "col"}, {"q": "The live and neutral wires touch here and the current shoots up. This is", "a": "Short-circuiting", "t": ["Earthing", "Insulation", "Parallel connection"], "w": "The fuse melts and breaks the circuit.", "src": "🔬 Lab picture", "pic": "shortCircuit"}, {"q": "The potential difference between the live and neutral wires in India is", "a": "220 V", "t": ["110 V", "50 V", "12 V"], "w": "We get 220 V AC at home.", "src": "📘 Section 12.4"}, {"q": "The frequency of the AC supply in India is", "a": "50 Hz", "t": ["60 Hz", "220 Hz", "5 Hz"], "w": "The current changes direction 100 times a second.", "src": "📘 Section 12.4"}, {"q": "The live wire usually has insulation of colour", "a": "Red", "t": ["Black", "Green", "Blue"], "w": "It is also called the positive wire.", "src": "📘 Section 12.4"}, {"q": "The neutral wire usually has insulation of colour", "a": "Black", "t": ["Red", "Green", "Yellow"], "w": "It is also called the negative wire.", "src": "📘 Section 12.4"}, {"q": "The earth wire is connected to", "a": "A metal plate deep in the earth near the house", "t": ["The live wire", "The roof", "The electricity meter only"], "w": "It gives a low-resistance path to the earth.", "src": "📘 Section 12.4", "lay": "col"}, {"q": "Why are metal-bodied appliances earthed?", "a": "Leaked current flows to earth, so the user does not get a severe shock", "t": ["To save electricity", "To make them work faster", "To make them shine"], "w": "Irons, toasters, fans and fridges are earthed.", "src": "📘 Section 12.4", "lay": "col"}, {"q": "Appliances in a house are connected", "a": "In parallel", "t": ["In series", "In a single loop", "Only through the earth wire"], "w": "So each gets 220 V and works on its own.", "src": "📘 Section 12.4"}, {"q": "The 5 A circuit in a house is used for", "a": "Bulbs and fans", "t": ["Geysers", "Air coolers", "Electric ovens"], "w": "Low-power appliances.", "src": "📘 Section 12.4"}, {"q": "At the time of a short circuit, the current", "a": "Increases heavily", "t": ["Reduces a lot", "Does not change", "Keeps changing slowly"], "w": "So the fuse must melt quickly.", "src": "📘 Section 12.4"}, {"q": "Overloading can happen when", "a": "Too many appliances are joined to one socket", "t": ["A bulb is switched off", "An LED bulb is used", "The earth wire is green"], "w": "The current becomes too large.", "src": "📘 Section 12.4", "lay": "col"}, {"q": "The most important safety device in a domestic circuit is the", "a": "Fuse", "t": ["Switch", "Bulb", "Meter"], "w": "It protects against short circuits and overloading.", "src": "📘 Section 12.4"}, {"q": "A 2 kW oven is used on a 220 V circuit rated 5 A. What happens?", "a": "It draws about 9 A, so the circuit is overloaded and the fuse blows", "t": ["It works normally", "It draws less than 1 A", "The voltage becomes zero"], "w": "I = P/V = 2000/220 ≈ 9.1 A, more than 5 A.", "src": "📘 Section 12.4", "lay": "col"}, {"q": "Each appliance has its own switch so that", "a": "It can be turned on or off without affecting the others", "t": ["It uses less wire", "It gets a higher voltage", "It never needs a fuse"], "w": "This is possible because of parallel wiring.", "src": "📘 Section 12.4", "lay": "col"}, {"q": "Where do the mains wires go first when they enter a house?", "a": "Into the electricity meter, through a main fuse", "t": ["Straight to the fan", "Into the earth plate", "Into the TV"], "w": "Then the main switch, then the circuits.", "src": "📘 Section 12.4", "lay": "col"}, {"q": "Name two safety measures used in electric circuits.", "a": "The fuse and earthing", "t": ["A switch and a bulb", "A plug and a socket", "A meter and a wire"], "w": "Both protect people and appliances.", "src": "📘 Section 12.4"}, {"q": "Besides too many appliances, overloading can also be caused by", "a": "A sudden rise in the supply voltage", "t": ["Switching off a fan", "Using LED bulbs", "Earthing an iron"], "w": "The current rises above the safe limit.", "src": "📘 Section 12.4", "lay": "col"}];
const HOME_B=[{"q": "Why should we never touch a switch with wet hands?", "a": "Water can carry current to our body and give a shock", "t": ["Water makes the bulb brighter", "The switch will rust at once", "It wastes electricity"], "w": "Always dry your hands first.", "lay": "col"}];
const G={
  field:makeGame("field",FIELD_C,FIELD_B,drawPic),
  wire:makeGame("wire",WIRE_C,WIRE_B,drawPic),
  sol:makeGame("sol",SOL_C,SOL_B,drawPic),
  force:makeGame("force",FORCE_C,FORCE_B,drawPic),
  home:makeGame("home",HOME_C,HOME_B,drawPic)
};
window.__MN={G};
})();
