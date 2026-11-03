(function(){
/* Lesson 2: Acids, Bases and Salts — games.html (Play and Learn) logic.
   Loaded after ../shared/app.js and ../shared/theme.css. This lesson's own
   mark(), shuffle() and nav-tab click handler differ slightly from the shared
   versions in app.js (verified by diff — e.g. this mark() has no spark/streak-
   pop effect, this shuffle() uses Math.floor instead of |0, and this nav
   handler does not set body.dataset.g or call rearm()), so per the task's
   correctness-over-deduplication rule they are kept here, scoped inside this
   file's own IIFE, rather than forced to match shared/app.js. Everything else
   that was byte-identical to shared/app.js ($ shorthand, the Snd music/sfx
   engine, its mus-button wiring, and celebrate()/banner()) was removed from
   here and is provided by shared/app.js instead. */
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
  const NC=FIRST.length,NB=MORE.length;
  const ALL=[...FIRST.map((x,i)=>Object.assign({},x,{src:(x.src||"📘 Textbook")+" · "+(i+1)+" of "+NC})),...MORE.map((x,i)=>Object.assign({},x,{src:"⭐ Bonus "+(i+1)+" of "+NB}))];
  const nx=bag(ALL.map((_,i)=>i));let seq=0,cur=null,autoT=null;
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
    cur=Object.assign({},seq<ALL.length?ALL[seq++]:ALL[nx()]);
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
/* pH bar */
const PHC=["#C62828","#E53935","#F4511E","#FB8C00","#FFB300","#FDD835","#C0CA33","#7CB342","#43A047","#00897B","#1E88E5","#3949AB","#5E35B1","#6A1B9A","#4A148C"];
const PX=v=>40+18.67+v*37.33;
function phBar(svg,marks,o){
  o=o||{};
  for(let i=0;i<15;i++){el("rect",{x:40+i*37.33,y:128,width:37.6,height:34,fill:PHC[i]},svg);txt(svg,40+i*37.33+18.67,184,String(i),"pt small");}
  el("rect",{x:40,y:128,width:560,height:34,rx:4,class:"phframe"},svg);
  txt(svg,150,218,"← More acidic","note");txt(svg,PX(7),218,"Neutral","note");txt(svg,490,218,"More basic →","note");
  const ms=(marks||[]).map((m,i)=>({v:m[0],lab:m[1],hl:m[2],i})).sort((p,q)=>p.v-q.v);
  ms.forEach((m,j)=>{
    const x=PX(m.v),y=o.rows?[100,70,40][j%3]:100;
    el("line",{x1:x,y1:y+6,x2:x,y2:118,class:"stem"},svg);
    el("path",{d:`M${x},127 L${x-8},115 L${x+8},115 Z`,class:"mk"+(m.hl?" hlm":"")},svg);
    ftxt(svg,x,y,m.lab,"pt"+(m.hl?" q":""));
  });
}
/* acid + base -> salt boxes */
function saltScene(svg,s,ask,answered){
  const hid=answered?[]:ask==="both"?["Acid","Base"]:[ask];
  const B=[["Acid",s.acid,40,"acidbox",s.sa],["Base",s.base,236,"basebox",s.sb],["Salt",s.salt,452,"saltbox",null]];
  B.forEach(([h,f,x,cls,strong])=>{
    el("rect",{x,y:62,width:150,height:96,rx:16,class:"box "+cls},svg);
    txt(svg,x+75,50,h,"note");
    const hide=hid.includes(h);
    if(hide)txt(svg,x+75,126,"?","pt q big");else ftxt(svg,x+75,122,f,"pt "+(f.length>7?"mid":"big"));
    if(strong!=null&&!hide&&s.showStrength)txt(svg,x+75,182,strong?"strong":"weak","note");
  });
  txt(svg,213,120,"+","pt big");txt(svg,421,120,"→","pt big");
  if(s.ph!=null){
    if(ask==="pH"&&!answered){txt(svg,527,190,"pH = ?","pt q");return;}
    const lab=s.ph<7?"Acidic · pH < 7":s.ph>7?"Basic · pH > 7":"Neutral · pH = 7";
    const g=el("g",{class:answered?"fade":""},svg);
    el("rect",{x:442,y:170,width:170,height:30,rx:15,fill:PHC[Math.round(s.ph)]},g);
    txt(g,527,191,lab,"pt pill");
  }
}
/* electrolysis of brine */
function cellScene(svg,o){
  o=o||{};const A=o.answered;
  el("path",{d:"M150,70 V214 Q150,224 160,224 H480 Q490,224 490,214 V70",class:"glass"},svg);
  el("rect",{x:152,y:100,width:336,height:122,class:"liq",style:"fill:var(--brine)"},svg);
  txt(svg,320,212,"Brine (NaCl solution)","note");
  el("rect",{x:226,y:46,width:16,height:150,class:"elec"},svg);el("rect",{x:398,y:46,width:16,height:150,class:"elec"},svg);
  txt(svg,234,36,"Anode (+)","pt small");txt(svg,406,36,"Cathode (−)","pt small");
  el("line",{x1:234,y1:46,x2:234,y2:18,class:"wire"},svg);el("line",{x1:406,y1:46,x2:406,y2:18,class:"wire"},svg);
  for(let i=0;i<6;i++){for(const [x,cls] of [[234,"bubC"],[406,"bubH"]]){const c=el("circle",{cx:x+(i%2?14:-14),cy:200,r:3+(i%3),class:"bub "+cls},svg);c.style.animationDelay=(i*.35)+"s";}}
  const show=k=>A||o.show===k;
  if(show("cl"))ftxt(svg,150-6,140,"Cl2 gas","pt"+(o.hl==="cl"?" q":"")).style.setProperty("text-anchor","end");
  if(show("h"))ftxt(svg,500,140,"H2 gas","pt"+(o.hl==="h"?" q":"")).style.setProperty("text-anchor","start");
  if(show("na")){const t=ftxt(svg,500,178,"NaOH","pt"+(o.hl==="na"?" q":""));t.style.setProperty("text-anchor","start");}
  if(!A&&o.ask){const p={cl:[100,140],h:[540,140],na:[540,178]}[o.ask];txt(svg,p[0],p[1],"?","pt q big");}
}
/* crystals heated in a boiling tube */
function crystalScene(svg,c0,c1,changed,o){
  o=o||{};
  el("path",{d:"M200,60 L470,130 L465,150 L195,80 Z",class:"glassfill"},svg);
  el("path",{d:"M200,60 L470,130 M195,80 L465,150 M470,130 Q482,142 465,150",class:"glass"},svg);
  const col=changed?c1:c0;
  for(let i=0;i<9;i++){const r=el("rect",{x:392+(i%3)*16,y:110+Math.floor(i/3)*8+(i%3)*4,width:14,height:9,rx:2,class:"cryst"},svg);r.style.fill=col;}
  if(o.heat){txt(svg,430,206,"🔥","emo");}
  if(changed&&o.drops)for(const [x,y] of [[240,78],[262,84],[285,90]]){const d=el("circle",{cx:x,cy:y,r:4,class:"water fade"},svg);}
  if(o.lab)ftxt(svg,320,232,o.lab,"pt");
  if(o.dropper){el("rect",{x:414,y:40,width:12,height:40,rx:3,class:"dropper"},svg);el("ellipse",{cx:420,cy:38,rx:10,ry:9,class:"bulb"},svg);txt(svg,446,46,"Water","note").style.setProperty("text-anchor","start");}
}

/* ================= GAME 1: Indicators ================= */
const CC=["Red","Blue","Pink","Colourless","Yellow","Reddish-brown","Purple"];
const colQ=(q,a,t,w,sc,src)=>({q,a,t,w,sc,src});
const IND_FIRST=[
  {q:"Litmus solution is a purple dye. It is extracted from",a:"Lichen",t:["Turmeric","Red cabbage","Rose petals"],w:"Litmus comes from lichen, a plant of the division Thallophyta.",sc:{lab:"Litmus solution",c0:"#8E44AD"},src:"📘 Introduction"},
  {q:"What is the colour of litmus solution when it is neither acidic nor basic?",a:"Purple",t:["Red","Blue","Colourless"],w:"Neutral litmus solution is purple.",sc:{lab:"Litmus solution",c0:"#8E44AD"},src:"📘 Introduction"},
  colQ("Blue litmus paper is dipped in dilute HCl (an acid). What colour does it turn?","Red",["Blue","Pink","Yellow"],"Acids turn blue litmus red.",{lab:"Dilute HCl",strip:["#1E88E5","#E53935"]},"📘 Introduction"),
  colQ("Red litmus paper is dipped in NaOH solution (a base). What colour does it turn?","Blue",["Red","Pink","Yellow"],"Bases turn red litmus blue.",{lab:"NaOH solution",strip:["#E53935","#1E88E5"]},"📘 Introduction"),
  colQ("A curry (turmeric) stain on a white cloth is scrubbed with soap. What colour does it become?","Reddish-brown",["Yellow","Blue","Pink"],"Soap is basic. Turmeric turns reddish-brown in a base.",{lab:"Turmeric + soap",c0:"#F6C915",c1:"#A0522D"},"📘 Introduction"),
  colQ("The same cloth is washed with plenty of water. The stain becomes","Yellow",["Reddish-brown","Blue","Colourless"],"Without the soap (base), turmeric becomes yellow again.",{lab:"After washing",c0:"#A0522D",c1:"#F6C915"},"📘 Introduction"),
  {q:"Which of these is a natural indicator?",a:"Red cabbage leaves",t:["Phenolphthalein","Methyl orange","Vinegar"],w:"Red cabbage, turmeric and petals of Hydrangea, Petunia and Geranium are natural indicators.",src:"📘 Introduction"},
  {q:"Methyl orange and phenolphthalein are",a:"Synthetic indicators",t:["Natural indicators","Olfactory indicators","Salts"],w:"They are made in factories, so they are synthetic indicators.",src:"📘 Introduction"},
  {q:"You have three test tubes: water, an acid and a base. You have only red litmus paper. How will you find each one?",a:"Find the base first (red turns blue). Then dip this blue paper in the other two — the acid turns it red.",t:["Red litmus turns red in the acid, so it is easy","Smell each test tube to find them","It cannot be done with red litmus only"],w:"Red litmus finds the base. The blue paper from the base then finds the acid. The last one is water.",lay:"col",src:"📘 In-text Q1"},
  {q:"Substances whose smell changes in an acid or a base are called",a:"Olfactory indicators",t:["Natural indicators","Synthetic indicators","Universal indicators"],w:"Olfactory means related to smell.",src:"📘 Section 2.1.1"},
  {q:"Which of these can be used as olfactory indicators?",a:"Onion, vanilla and clove",t:["Turmeric and litmus","Sugar and salt","Methyl orange and phenolphthalein"],w:"The smell of onion, vanilla essence and clove oil changes in a base.",src:"📘 Activity 2.2"},
  {q:"A cloth strip with onion smell is put in dilute NaOH (a base). What happens to the onion smell?",a:"It goes away",t:["It becomes stronger","It turns sweet","No change"],w:"The smell of onion cannot be detected in a base.",card:["🧅","Onion + NaOH"],src:"📘 Activity 2.2"},
  {q:"Vanilla essence is added to dilute HCl (an acid). What happens to its smell?",a:"No change",t:["It goes away","It becomes sour","It smells like onion"],w:"Vanilla keeps its smell in an acid, but loses it in a base.",card:["🍦","Vanilla + HCl"],src:"📘 Activity 2.2"},
  colQ("Two drops of phenolphthalein are added to dilute NaOH solution. What colour do you see?","Pink",["Colourless","Red","Yellow"],"Phenolphthalein is pink in a base.",{lab:"Dilute NaOH",ind:"Phenolphthalein",c0:CLEAR,c1:"#EC4899"},"📘 Activity 2.6"),
  colQ("Now dilute HCl is added drop by drop. What happens to the pink colour?","Colourless",["Pink","Blue","Yellow"],"The acid neutralises the base. Phenolphthalein becomes colourless.",{lab:"Pink solution",ind:"Dilute HCl",c0:"#EC4899",c1:CLEAR},"📘 Activity 2.6"),
  colQ("A few drops of NaOH are added again. What colour comes back?","Pink",["Colourless","Red","Blue"],"There is base again, so the pink colour reappears.",{lab:"Colourless solution",ind:"Dilute NaOH",c0:CLEAR,c1:"#EC4899"},"📘 Activity 2.6"),
  {q:"A universal indicator is",a:"A mixture of several indicators",t:["A single natural dye","A type of litmus paper","A strong acid"],w:"It shows different colours for different hydrogen ion concentrations.",src:"📘 Section 2.3"},
  {q:"A solution turns red litmus blue. Its pH is likely to be",a:"10",t:["1","4","5"],w:"Red to blue means a base. A base has pH more than 7.",sc:{lab:"Unknown solution",strip:["#E53935","#1E88E5"]},src:"📘 Exercise 1"}
];
const IND_MORE=[
  colQ("Phenolphthalein is added to dilute HCl. What colour do you see?","Colourless",["Pink","Red","Yellow"],"Phenolphthalein is colourless in an acid.",{lab:"Dilute HCl",ind:"Phenolphthalein",c0:CLEAR,c1:CLEAR}),
  colQ("Methyl orange is added to dilute HCl. What colour do you see?","Red",["Yellow","Pink","Blue"],"Methyl orange is red in an acid.",{lab:"Dilute HCl",ind:"Methyl orange",c0:CLEAR,c1:"#E53935"}),
  colQ("Methyl orange is added to NaOH solution. What colour do you see?","Yellow",["Red","Pink","Blue"],"Methyl orange is yellow in a base.",{lab:"NaOH solution",ind:"Methyl orange",c0:CLEAR,c1:"#F6C915"}),
  colQ("Phenolphthalein is added to lime water, Ca(OH)2. What colour do you see?","Pink",["Colourless","Red","Yellow"],"Lime water is a base, so phenolphthalein turns pink.",{lab:"Lime water",ind:"Phenolphthalein",c0:CLEAR,c1:"#EC4899"}),
  colQ("Methyl orange is added to vinegar. What colour do you see?","Red",["Yellow","Pink","Blue"],"Vinegar has acetic acid. Methyl orange is red in an acid.",{lab:"Vinegar",ind:"Methyl orange",c0:CLEAR,c1:"#E53935"}),
  colQ("Phenolphthalein is added to lemon juice. What colour do you see?","Colourless",["Pink","Red","Blue"],"Lemon juice is acidic, so phenolphthalein stays colourless.",{lab:"Lemon juice",ind:"Phenolphthalein",c0:CLEAR,c1:CLEAR}),
  colQ("Turmeric solution is added to baking soda solution. What colour do you see?","Reddish-brown",["Yellow","Pink","Blue"],"Baking soda is basic, so turmeric turns reddish-brown.",{lab:"Baking soda solution",ind:"Turmeric",c0:CLEAR,c1:"#A0522D"}),
  colQ("Blue litmus is dipped in vinegar. What colour does it turn?","Red",["Blue","Purple","Yellow"],"Vinegar is acidic.",{lab:"Vinegar",strip:["#1E88E5","#E53935"]}),
  colQ("Red litmus is dipped in soap solution. What colour does it turn?","Blue",["Red","Purple","Yellow"],"Soap solution is basic.",{lab:"Soap solution",strip:["#E53935","#1E88E5"]}),
  {q:"Methyl orange turned <b>yellow</b>. The solution is",a:"Basic",t:["Acidic","Neutral"],w:"Methyl orange is yellow only in a base.",lay:"three",sc:{lab:"Unknown solution",ind:"Methyl orange",c0:"#F6C915",c1:"#F6C915"}},
  {q:"Phenolphthalein <b>stays colourless</b>. The solution could be",a:"Acidic or neutral",t:["Only basic","Basic or neutral","Only very basic"],w:"Phenolphthalein turns pink only in a base. So the solution is acidic or neutral.",sc:{lab:"Unknown solution",ind:"Phenolphthalein",c0:CLEAR,c1:CLEAR}},
  {q:"Blue litmus stays blue and red litmus stays red. The solution is",a:"Neutral",t:["Acidic","Basic"],w:"No change in either litmus means the solution is neutral, like distilled water.",lay:"three"},
  {q:"Clove oil is added to dilute NaOH. What happens to its smell?",a:"It goes away",t:["No change","It becomes stronger","It smells like vinegar"],w:"Clove oil loses its smell in a base.",card:["🌿","Clove oil + NaOH"]},
  {q:"Vanilla essence is added to dilute NaOH. What happens to its smell?",a:"It goes away",t:["No change","It becomes sweeter","It smells like onion"],w:"Vanilla loses its smell in a base.",card:["🍦","Vanilla + NaOH"]},
  {q:"Beetroot extract changes colour in lemon juice and in baking soda solution. So beetroot extract is",a:"An indicator",t:["A salt","A strong acid","A strong base"],w:"Any substance that changes colour with acids and bases is an indicator.",card:["🫜","Beetroot extract"]},
  {q:"Which flower petals can be used as indicators?",a:"Hydrangea, Petunia and Geranium",t:["Only rose","Only jasmine","No petals can be used"],w:"The textbook names Hydrangea, Petunia and Geranium."},
  {q:"An acid tastes",a:"Sour",t:["Bitter","Sweet","Salty"],w:"Acids are sour. Bases are bitter. Never taste chemicals in the lab!",lay:"two"},
  {q:"A base tastes",a:"Bitter",t:["Sour","Sweet","Salty"],w:"Bases are bitter and soapy to touch. Never taste chemicals in the lab!",lay:"two"}
];
function drawInd(it,svg,S){
  const sc=it.sc;if(!sc)return false;
  svg.setAttribute("viewBox","180 0 300 240");
  if(sc.strip){tube(svg,320,{liq:"var(--clear2)",lab:sc.lab,strip:{c0:sc.strip[0],c1:sc.strip[1],dip:S.answered}});
    txt(svg,360,22,"Litmus paper","note").style.setProperty("text-anchor","start");return true;}
  const done=S.answered;
  tube(svg,320,{liq:done&&sc.c1?sc.c1:(sc.c0||CLEAR),lab:sc.lab,ind:sc.ind,drop:sc.ind&&!done});
  return true;
}

/* ================= GAME 2: Reactions ================= */
const eq=(q,lhs,a,t,w,gas,src)=>({q:q||"Complete the reaction.",card:S=>["⚗️",`${lhs} → ${S.answered?a:"<span class=\"slot\">?</span>"}`],a,t,w,gas,src});
const RX_FIRST=[
  eq("Zinc granules react with dilute sulphuric acid.","Zn + H2SO4","ZnSO4 + H2",["ZnSO4 + H2O","ZnO + SO2","ZnS + H2O"],"Zinc displaces hydrogen from the acid. Zinc sulphate and hydrogen gas form.","H2","📘 Activity 2.3"),
  {q:"How do we test for hydrogen gas?",a:"Bring a burning candle near it. It burns with a pop sound.",t:["Pass it through lime water. It turns milky.","It relights a glowing splinter.","It smells like rotten eggs."],w:"Hydrogen burns with a pop sound.",lay:"col",gas:"H2",src:"📘 Activity 2.3"},
  {q:"Acid + Metal →",a:"Salt + Hydrogen gas",t:["Salt + Water","Salt + Carbon dioxide","Base + Water"],w:"The metal displaces hydrogen from the acid and forms a salt.",card:["🧪","Acid + Metal → ?"],src:"📘 Section 2.1.2"},
  eq("Zinc is warmed with sodium hydroxide solution.","2NaOH + Zn","Na2ZnO2 + H2",["Na2ZnO2 + H2O","ZnO + 2NaH","Zn(OH)2 + 2Na"],"Sodium zincate and hydrogen form. Such reactions are not possible with all metals.","H2","📘 Activity 2.4"),
  eq("Sodium carbonate reacts with dilute HCl.","Na2CO3 + 2HCl","2NaCl + H2O + CO2",["2NaCl + H2","Na2O + 2HCl + CO2","2NaCl + H2O + O2"],"A carbonate with an acid gives salt, water and carbon dioxide.","CO2","📘 Activity 2.5"),
  eq("Sodium hydrogencarbonate reacts with dilute HCl.","NaHCO3 + HCl","NaCl + H2O + CO2",["NaCl + H2","NaOH + CO2 + Cl2","NaCl + H2O + O2"],"A hydrogencarbonate with an acid gives salt, water and carbon dioxide.","CO2","📘 Activity 2.5"),
  {q:"The gas from this reaction is passed through lime water. What happens?",a:"Lime water turns milky",t:["Lime water turns pink","The gas burns with a pop","Nothing happens"],w:"CO2 makes a white precipitate of calcium carbonate.",gas:"CO2",src:"📘 Activity 2.5"},
  eq(null,"Ca(OH)2 + CO2","CaCO3 + H2O",["CaO + H2CO3","Ca(HCO3)2","CaCO3 + H2"],"Lime water + carbon dioxide gives a white precipitate of calcium carbonate.","CO2","📘 Activity 2.5"),
  {q:"Excess carbon dioxide is passed through the milky lime water. What happens?",a:"The milkiness disappears",t:["It becomes more milky","It turns pink","It catches fire"],w:"CaCO3 + H2O + CO2 → Ca(HCO3)2, which is soluble in water.",card:["🫧","Excess CO2"],src:"📘 Section 2.1.3"},
  {q:"Limestone, chalk and marble are different forms of",a:"Calcium carbonate",t:["Calcium oxide","Sodium carbonate","Calcium chloride"],w:"All three are CaCO3.",card:["🪨","Limestone · Chalk · Marble"],src:"📘 Section 2.1.3"},
  {q:"Metal carbonate + Acid →",a:"Salt + Carbon dioxide + Water",t:["Salt + Hydrogen","Salt + Water only","Base + Carbon dioxide"],w:"All metal carbonates and hydrogencarbonates react with acids this way.",card:["🧪","Metal carbonate + Acid → ?"],src:"📘 Section 2.1.3"},
  eq("Sodium hydroxide reacts with hydrochloric acid.","NaOH + HCl","NaCl + H2O",["NaCl + H2","Na + HCl + O2","NaClO + H2"],"An acid and a base give a salt and water.",null,"📘 Section 2.1.4"),
  {q:"The reaction between an acid and a base to give salt and water is called",a:"Neutralisation",t:["Decomposition","Displacement","Combustion"],w:"Base + Acid → Salt + Water is a neutralisation reaction.",card:["⚖️","Acid + Base → Salt + Water"],src:"📘 Section 2.1.4"},
  eq("Copper oxide is added to dilute HCl.","CuO + 2HCl","CuCl2 + H2O",["CuCl2 + H2","Cu + Cl2 + H2O","CuH2 + Cl2O"],"The solution turns blue-green because copper(II) chloride forms.",null,"📘 Activity 2.7"),
  {q:"Metallic oxides react with acids to give salt and water. So metallic oxides are",a:"Basic",t:["Acidic","Neutral"],w:"They behave like bases, so they are called basic oxides.",lay:"three",card:["🔶","Metal oxide + Acid → Salt + Water"],src:"📘 Section 2.1.5"},
  {q:"Lime water (a base) reacts with CO2 to give salt and water. So non-metallic oxides are",a:"Acidic",t:["Basic","Neutral"],w:"They behave like acids, so non-metallic oxides are acidic.",lay:"three",card:["🔷","Non-metal oxide + Base → Salt + Water"],src:"📘 Section 2.1.6"},
  {q:"Why should curd and sour foods not be kept in brass and copper vessels?",a:"The acid in them reacts with the metal and forms harmful compounds",t:["They become too sweet","The vessel becomes cold","Curd turns into milk again"],w:"Acids react with metals. The food can become poisonous.",lay:"col",src:"📘 In-text Q1"},
  {q:"Which gas is usually given off when an acid reacts with a metal?",a:"Hydrogen",t:["Oxygen","Carbon dioxide","Chlorine"],w:"For example, Zn + H2SO4 → ZnSO4 + H2. Hydrogen burns with a pop.",gas:"H2",src:"📘 In-text Q2"},
  {q:"Compound A reacts with dilute HCl and fizzes. The gas puts out a burning candle. Calcium chloride forms. What is A?",card:S=>["⚗️",`${S.answered?"CaCO3":"<span class=\"slot\">A</span>"} + 2HCl → CaCl2 + H2O + CO2`],a:"CaCO3",t:["CaO","Ca","CaCl2"],w:"CO2 puts out fire. So A is a carbonate: calcium carbonate.",gas:"CO2",src:"📘 In-text Q3"},
  {q:"A solution reacts with crushed egg-shells to give a gas that turns lime water milky. The solution contains",a:"HCl",t:["NaCl","LiCl","KCl"],w:"Egg-shells are calcium carbonate. An acid like HCl gives CO2 with it.",gas:"CO2",src:"📘 Exercise 2"},
  {q:"10 mL of NaOH is neutralised by 8 mL of HCl. How much HCl will neutralise 20 mL of the same NaOH?",a:"16 mL",t:["4 mL","8 mL","12 mL"],w:"Double the base needs double the acid: 8 × 2 = 16 mL.",card:["🧮","10 mL NaOH ↔ 8 mL HCl"],src:"📘 Exercise 3"},
  eq("Dilute sulphuric acid reacts with zinc granules.","Zn + H2SO4","ZnSO4 + H2",["ZnSO4 + H2O","ZnO + SO2","Zn(OH)2 + SO2"],"Zinc + sulphuric acid → zinc sulphate + hydrogen.","H2","📘 Exercise 5(a)"),
  eq("Dilute hydrochloric acid reacts with magnesium ribbon.","Mg + 2HCl","MgCl2 + H2",["MgCl2 + H2O","MgO + Cl2","MgH2 + Cl2"],"Magnesium + hydrochloric acid → magnesium chloride + hydrogen.","H2","📘 Exercise 5(b)"),
  eq("Dilute sulphuric acid reacts with aluminium powder.","2Al + 3H2SO4","Al2(SO4)3 + 3H2",["Al2(SO4)3 + 3H2O","2AlSO4 + 3H2","Al2O3 + 3SO2"],"Aluminium + sulphuric acid → aluminium sulphate + hydrogen.","H2","📘 Exercise 5(c)"),
  eq("Dilute hydrochloric acid reacts with iron filings.","Fe + 2HCl","FeCl2 + H2",["FeCl2 + H2O","FeO + Cl2","Fe(OH)2 + Cl2"],"Iron + hydrochloric acid → iron(II) chloride + hydrogen.","H2","📘 Exercise 5(d)"),
  {q:"Which one is a neutralisation reaction?",a:"NaOH + HCl → NaCl + H2O",t:["Zn + H2SO4 → ZnSO4 + H2","2NaHCO3 → Na2CO3 + H2O + CO2","CaO + H2O → Ca(OH)2"],w:"An acid and a base give a salt and water. Another example: KOH + HNO3 → KNO3 + H2O.",lay:"col",src:"📘 Exercise 14"}
];
const RX_MORE=[
  eq(null,"Mg + H2SO4","MgSO4 + H2",["MgSO4 + H2O","MgO + SO2","MgS + H2O"],"Metal + acid → salt + hydrogen.","H2"),
  eq(null,"Zn + 2HCl","ZnCl2 + H2",["ZnCl2 + H2O","ZnO + Cl2","ZnH2 + Cl2"],"Metal + acid → salt + hydrogen.","H2"),
  eq(null,"CaCO3 + 2HCl","CaCl2 + H2O + CO2",["CaCl2 + H2","CaO + 2HCl","CaCl2 + H2O + O2"],"Carbonate + acid → salt + water + carbon dioxide.","CO2"),
  eq(null,"KOH + HCl","KCl + H2O",["KCl + H2","KH + HClO","K + Cl2 + H2O"],"Base + acid → salt + water (neutralisation)."),
  eq(null,"NaOH + HNO3","NaNO3 + H2O",["NaNO3 + H2","NaNO2 + H2O2","Na + HNO3 + O2"],"Base + acid → salt + water (neutralisation)."),
  eq(null,"CuO + H2SO4","CuSO4 + H2O",["CuSO4 + H2","Cu + SO2 + H2O","CuS + H2O2"],"Metal oxide + acid → salt + water. The solution turns blue."),
  eq(null,"Ca(OH)2 + 2HCl","CaCl2 + 2H2O",["CaCl2 + H2","CaO + 2HCl","CaCl2 + O2"],"Base + acid → salt + water (neutralisation)."),
  {q:"These products formed. What reacted?",card:S=>["⚗️",`${S.answered?"Mg + 2HCl":"<span class=\"slot\">?</span>"} → MgCl2 + H2`],a:"Mg + 2HCl",t:["MgO + Cl2","Mg + 2NaCl","MgCO3 + H2"],w:"Metal + acid gives salt + hydrogen.",gas:"H2"},
  {q:"A gas puts out a burning candle and turns lime water milky. The gas is",a:"Carbon dioxide",t:["Hydrogen","Oxygen","Chlorine"],w:"CO2 does not support burning. It turns lime water milky.",gas:"CO2"},
  {q:"A gas burns with a pop sound. The gas is",a:"Hydrogen",t:["Carbon dioxide","Oxygen","Nitrogen"],w:"Hydrogen burns with a pop sound.",gas:"H2"},
  {q:"A soda-acid fire extinguisher mixes sodium hydrogencarbonate with sulphuric acid. Which gas puts out the fire?",a:"Carbon dioxide",t:["Hydrogen","Oxygen","Chlorine"],w:"Hydrogencarbonate + acid gives CO2, which puts out the fire.",gas:"CO2",src:"📘 Project (II)"},
  {q:"Marble chips are added to dilute HCl. What do you see?",a:"Fizzing — a gas that turns lime water milky",t:["A gas that burns with a pop","No change at all","The solution turns pink"],w:"Marble is calcium carbonate. It gives CO2 with an acid.",lay:"col",gas:"CO2"},
  {q:"Which reaction gives hydrogen gas?",a:"Zn + H2SO4",t:["NaOH + HCl","CuO + 2HCl","Na2CO3 + 2HCl"],w:"Only the metal + acid reaction gives hydrogen.",gas:"H2"},
  {q:"Which reaction gives carbon dioxide?",a:"NaHCO3 + HCl",t:["Mg + 2HCl","KOH + HCl","CuO + 2HCl"],w:"A hydrogencarbonate + acid gives carbon dioxide.",gas:"CO2"},
  {q:"Copper oxide dissolves in HCl. What colour does the solution become?",a:"Blue-green",t:["Pink","Colourless","Yellow"],w:"Copper(II) chloride makes the solution blue-green.",sc:{c0:"#3a2a22",c1:"#1FA39A"}},
  {q:"Sodium hydroxide + zinc gives hydrogen and",a:"Sodium zincate",t:["Zinc chloride","Sodium chloride","Zinc sulphate"],w:"2NaOH + Zn → Na2ZnO2 (sodium zincate) + H2.",gas:"H2"}
];
function drawRx(it,svg,S){
  if(it.sc){svg.setAttribute("viewBox","180 0 300 240");tube(svg,320,{liq:S.answered?it.sc.c1:CLEAR,solids:true,lab:"CuO + dilute HCl"});
    if(!S.answered)svg.querySelectorAll(".solid").forEach(r=>r.style.fill=it.sc.c0);return true;}
  if(!it.gas)return false;
  const A=S.answered;
  svg.setAttribute("viewBox","100 0 520 240");
  tube(svg,200,{liq:"var(--clear2)",solids:true,bubbles:true,lab:it.gas==="H2"?"Metal + acid":"Carbonate + acid",level:110});
  if(it.gas==="H2"){
    if(A){txt(svg,200,6,"🕯️","emo");txt(svg,268,22,"Pop!","pt q big").style.setProperty("text-anchor","start");ftxt(svg,300,120,"H2 burns with a pop","pt").style.setProperty("text-anchor","start");}
    else{txt(svg,300,120,"Gas = ?","pt q").style.setProperty("text-anchor","start");}
  }else{
    el("path",{d:"M200,34 V10 H440 V150",class:"pipe"},svg);
    tube(svg,440,{liq:A?"#EDEDED":"var(--clear2)",lab:"Lime water",level:96});
    if(A)ftxt(svg,496,120,"Milky!","pt q big").style.setProperty("text-anchor","start");
    else txt(svg,510,120,"?","pt q big");
    if(A)ftxt(svg,320,60,"CO2","pt");
  }
  return true;
}

/* ================= GAME 3: Ions & pH ================= */
const PH_FIRST=[
  {q:"With dilute HCl the bulb glows. With glucose or alcohol solution it does not. Why?",a:"HCl gives ions in water; glucose and alcohol do not",t:["Glucose has no hydrogen in it","The bulb is weak for glucose","Alcohol is a strong acid"],w:"Glucose and alcohol contain hydrogen, but they do not give H^+ ions. So they are not acids.",lay:"col",card:["💡","Bulb test: HCl ✔ · Glucose ✘"],src:"📘 Activity 2.8"},
  {q:"Acids produce which ion in water?",a:"H^+",t:["OH^−","Na^+","Cl^−"],w:"H^+(aq) ions give acids their acidic properties.",card:["🧪","Acid + water"],src:"📘 Section 2.2"},
  {q:"Dry HCl gas does not change the colour of dry blue litmus. Why?",a:"H^+ ions form only when water is present",t:["Dry HCl is a base","Litmus does not work with gases","Dry HCl gas has no hydrogen"],w:"HCl + H2O → H3O^+ + Cl^−. Without water, no H^+ ions form.",lay:"col",card:["🌫️","Dry HCl gas + dry litmus"],src:"📘 Activity 2.9"},
  {q:"H^+ ions cannot exist alone. In water they exist as",a:"H3O^+ (hydronium ions)",t:["OH^− (hydroxide ions)","H2 gas","H2O2"],w:"H^+ + H2O → H3O^+.",card:["💧","H^+ + H2O → ?"],src:"📘 Section 2.2.1"},
  {q:"Bases produce which ion in water?",a:"OH^−",t:["H^+","H3O^+","Cl^−"],w:"NaOH → Na^+ + OH^−. Bases give hydroxide ions.",card:["🧴","Base + water"],src:"📘 Section 2.2.1"},
  {q:"A base that dissolves in water is called",a:"An alkali",t:["A salt","An indicator","An oxide"],w:"Alkalis are soapy to touch, bitter and corrosive. Never taste or touch them.",card:["⚠️","NaOH · KOH · Ca(OH)2"],src:"📘 Section 2.2.1"},
  {q:"Dissolving concentrated acid or base in water is",a:"Highly exothermic",t:["Endothermic","Neither — no heat change"],w:"A lot of heat is given out. The beaker becomes hot.",lay:"three",card:["🔥","Conc. H2SO4 + water"],src:"📘 Activity 2.10"},
  {q:"While diluting a concentrated acid, what must you do?",a:"Add the acid slowly to water, stirring all the time",t:["Add water quickly to the acid","Add water slowly to the acid","Pour both together at once"],w:"Always add acid to water. Never add water to acid.",lay:"col",card:["⚠️","Diluting an acid"],src:"📘 Section 2.2.1"},
  {q:"Why should water never be added to concentrated acid?",a:"The heat may splash the mixture out and cause burns",t:["The acid will turn into a base","The water will freeze","Nothing happens, it is safe"],w:"The glass may also break due to too much local heat.",lay:"col",card:["⚠️","Water → Conc. acid ✘"],src:"📘 In-text Q4"},
  {q:"An acid solution is diluted with water. The concentration of H3O^+ ions",a:"Decreases",t:["Increases","Stays the same"],w:"Dilution means fewer ions per unit volume.",lay:"three",card:["💧","Dilution"],src:"📘 In-text Q5"},
  {q:"Excess base is dissolved in NaOH solution. The concentration of OH^− ions",a:"Increases",t:["Decreases","Stays the same"],w:"More base gives more OH^− ions.",lay:"three",card:["🧴","More NaOH added"],src:"📘 In-text Q6"},
  {q:"The ‘p’ in pH stands for ‘potenz’ in German. It means",a:"Power",t:["Pure","Point","Paper"],w:"pH is a number that shows how acidic or basic a solution is.",sc:{marks:[]},src:"📘 Section 2.3"},
  {q:"What is the pH of a neutral solution?",a:"7",t:["0","1","14"],w:"pH 7 is neutral. Below 7 is acidic. Above 7 is basic.",sc:{marks:[[7,"Neutral"]],reveal:true},src:"📘 Section 2.3"},
  {q:"A solution has pH <b>less than 7</b>. It is",a:"Acidic",t:["Basic","Neutral"],w:"pH less than 7 means acidic.",lay:"three",sc:{marks:[[3,"pH 3"]]},src:"📘 Section 2.3"},
  {q:"Higher the hydronium ion concentration,",a:"Lower the pH",t:["Higher the pH","pH stays 7"],w:"More H3O^+ means more acidic, so the pH number is smaller.",lay:"three",sc:{marks:[[1,"More H3O^+"],[13,"Less H3O^+"]]},src:"📘 Section 2.3"},
  {q:"As pH increases from 7 to 14, the solution becomes",a:"More strongly basic",t:["More strongly acidic","More neutral"],w:"OH^− concentration increases, so the alkali becomes stronger.",lay:"three",sc:{marks:[[8,"8"],[14,"14"]]},src:"📘 Section 2.3"},
  {q:"Tap these in order of <b>increasing pH</b> (most acidic first).",steps:[{k:"g",l:"Gastric juice"},{k:"l",l:"Lemon juice"},{k:"w",l:"Pure water"},{k:"b",l:"Blood"},{k:"m",l:"Milk of magnesia"},{k:"n",l:"NaOH solution"}],w:"Gastric juice (1.2) < lemon juice (2.2) < pure water (7) < blood (7.4) < milk of magnesia (10) < NaOH (14).",sc:{order:[[1.2,"Gastric juice","g"],[2.2,"Lemon","l"],[7,"Water","w"],[7.4,"Blood","b"],[10,"Milk of magnesia","m"],[14,"NaOH","n"]]},src:"📘 Figure 2.7"},
  {q:"Acids that give <b>more</b> H^+ ions are called",a:"Strong acids",t:["Weak acids","Bases","Salts"],w:"HCl gives more H^+ than acetic acid of the same concentration. HCl is a strong acid.",card:["💪","HCl vs CH3COOH"],src:"📘 Section 2.3"},
  {q:"Solution A has pH 6. Solution B has pH 8. Which has more hydrogen ions?",a:"A — it is acidic",t:["B — it is acidic","B — it is basic","Both are the same"],w:"Lower pH means more H^+. A (pH 6) is acidic; B (pH 8) is basic.",sc:{marks:[[6,"A"],[8,"B"]]},src:"📘 In-text Q1 (2.3)"},
  {q:"Do basic solutions also have H^+ ions?",a:"Yes, but they have more OH^− ions than H^+ ions",t:["No, never","Yes, and more H^+ than OH^−","Only when heated"],w:"In a basic solution OH^− ions are more than H^+ ions.",lay:"col",card:["🤔","Basic solution"],src:"📘 In-text Q3 (2.3)"},
  {q:"Our body works within which pH range?",a:"7.0 to 7.8",t:["1 to 2","4 to 5","10 to 12"],w:"Living things can survive only in a narrow range of pH.",sc:{marks:[[7.4,"Body"]],reveal:true},src:"📘 Section 2.3.1"},
  {q:"Rain water is called acid rain when its pH is",a:"Less than 5.6",t:["More than 7","Exactly 7","More than 10"],w:"Acid rain lowers the pH of rivers and harms aquatic life.",sc:{marks:[[5.6,"5.6"]]},src:"📘 Section 2.3.1"},
  {q:"Which acid does our stomach produce to help digestion?",a:"Hydrochloric acid",t:["Acetic acid","Citric acid","Sulphuric acid"],w:"The stomach makes HCl. It helps digest food without harming the stomach.",card:["🍽️","Digestion"],src:"📘 Section 2.3.1"},
  {q:"Which medicine is used for treating indigestion?",a:"Antacid",t:["Antibiotic","Analgesic","Antiseptic"],w:"Antacids are mild bases. They neutralise extra stomach acid.",card:["💊","Indigestion"],src:"📘 Exercise 4"},
  {q:"Which mild base is used as an antacid?",a:"Milk of magnesia — Mg(OH)2",t:["Sodium hydroxide — NaOH","Vinegar","Lemon juice"],w:"Magnesium hydroxide (milk of magnesia) is a mild base.",card:["💊","Antacid"],src:"📘 Section 2.3.1"},
  {q:"Tooth decay starts when the pH in the mouth falls below",a:"5.5",t:["7.5","9","12"],w:"Bacteria make acids from sugar left in the mouth. Enamel corrodes below pH 5.5.",sc:{marks:[[5.5,"5.5"]],reveal:true},src:"📘 Section 2.3.1"},
  {q:"Why do we clean our teeth with toothpaste?",a:"Toothpaste is basic and neutralises the acid",t:["Toothpaste is acidic and kills bacteria","Toothpaste adds sugar to teeth","Toothpaste makes enamel soft"],w:"Basic toothpaste neutralises excess acid and prevents tooth decay.",lay:"col",card:["🪥","Toothpaste"],src:"📘 Section 2.3.1"},
  {q:"A honey-bee sting leaves an acid. What gives relief?",a:"Baking soda",t:["Vinegar","Lemon juice","Common salt"],w:"Baking soda is a mild base. It neutralises the acid.",card:["🐝","Bee sting"],src:"📘 Section 2.3.1"},
  {q:"Nettle leaves inject which acid?",a:"Methanoic acid",t:["Citric acid","Lactic acid","Oxalic acid"],w:"A dock leaf (basic) rubbed on the area gives relief.",card:["🌿","Nettle sting"],src:"📘 Section 2.3.1"},
  {q:"Which acid is in vinegar?",a:"Acetic acid",t:["Citric acid","Tartaric acid","Lactic acid"],w:"Table 2.3: vinegar — acetic acid.",card:["🍶","Vinegar"],src:"📘 Table 2.3"},
  {q:"Which acid is in tamarind?",a:"Tartaric acid",t:["Citric acid","Oxalic acid","Acetic acid"],w:"Table 2.3: tamarind — tartaric acid.",card:["🟤","Tamarind"],src:"📘 Table 2.3"},
  {q:"Which acid is in tomato?",a:"Oxalic acid",t:["Citric acid","Lactic acid","Methanoic acid"],w:"Table 2.3: tomato — oxalic acid.",card:["🍅","Tomato"],src:"📘 Table 2.3"},
  {q:"Which acid is in curd (sour milk)?",a:"Lactic acid",t:["Acetic acid","Citric acid","Tartaric acid"],w:"Table 2.3: sour milk (curd) — lactic acid.",card:["🥛","Curd"],src:"📘 Table 2.3"},
  {q:"A farmer’s soil is too acidic. What should he add?",a:"Quick lime, slaked lime or chalk",t:["Vinegar","Lemon juice","More acid fertiliser"],w:"These are basic. They neutralise the acid in the soil.",lay:"col",card:["🌾","Acidic soil"],src:"📘 In-text Q4 (2.3)"},
  {q:"Why does distilled water not conduct electricity, but rain water does?",a:"Rain water has dissolved acids that give ions; distilled water has no ions",t:["Rain water is colder","Distilled water is an acid","Rain water has no ions"],w:"Ions carry current. Rain water dissolves gases like CO2, which form acids.",lay:"col",card:["🌧️","Distilled water vs rain water"],src:"📘 Exercise 7"},
  {q:"Solutions A, B, C, D, E have pH 4, 1, 11, 7, 9. Tap them in order of <b>increasing hydrogen ion concentration</b>.",steps:[{k:"C",l:"C (pH 11)"},{k:"E",l:"E (pH 9)"},{k:"D",l:"D (pH 7)"},{k:"A",l:"A (pH 4)"},{k:"B",l:"B (pH 1)"}],w:"Higher pH means fewer H^+ ions. So C < E < D < A < B.",sc:{order:[[11,"C","C"],[9,"E","E"],[7,"D","D"],[4,"A","A"],[1,"B","B"]],always:true},src:"📘 Exercise 9"},
  {q:"Same magnesium ribbons. Tube A has HCl, tube B has acetic acid (same amount and concentration). Where is fizzing faster?",a:"Tube A — HCl is a strong acid",t:["Tube B — acetic acid is stronger","Both the same","No fizzing in either"],w:"HCl gives more H^+ ions, so it reacts more vigorously.",lay:"col",card:["🫧","Mg + HCl vs Mg + CH3COOH"],src:"📘 Exercise 10"},
  {q:"Fresh milk has pH 6. What happens to the pH when it turns into curd?",a:"It decreases",t:["It increases","It stays 6","It becomes 14"],w:"Curd has lactic acid, so it is more acidic.",lay:"two",sc:{marks:[[6,"Milk"]]},src:"📘 Exercise 11"},
  {q:"A milkman adds a little baking soda to fresh milk. Why does this milk take longer to set as curd?",a:"The acid formed must first neutralise the baking soda",t:["Baking soda kills all bacteria","Baking soda makes milk sweet","Baking soda removes the water"],w:"He makes milk slightly alkaline so it does not turn sour quickly.",lay:"col",card:["🥛","Milk + a little baking soda"],src:"📘 Exercise 12"}
];
const PH_MORE=[
  {q:"Which of these is the most acidic?",a:"pH 1",t:["pH 4","pH 7","pH 10"],w:"Smaller pH number means more acidic.",sc:{marks:[[1,"?"],[4,"?"],[7,"?"],[10,"?"]],nolabel:true}},
  {q:"Which of these is the most basic?",a:"pH 13",t:["pH 9","pH 7","pH 2"],w:"Larger pH number means more basic.",sc:{marks:[[2,"?"],[7,"?"],[9,"?"],[13,"?"]],nolabel:true}},
  {q:"Lemon juice has pH about",a:"2.2",t:["7","10","14"],w:"Lemon juice is acidic (citric acid).",sc:{marks:[[2.2,"Lemon"]],reveal:true}},
  {q:"Pure water has pH",a:"7",t:["1.2","10","14"],w:"Pure water is neutral.",sc:{marks:[[7,"Water"]],reveal:true}},
  {q:"Milk of magnesia has pH about",a:"10",t:["2.2","7","1.2"],w:"It is a mild base.",sc:{marks:[[10,"Milk of magnesia"]],reveal:true}},
  {q:"Gastric juice has pH about",a:"1.2",t:["7.4","10","14"],w:"Gastric juice contains HCl, so it is very acidic.",sc:{marks:[[1.2,"Gastric juice"]],reveal:true}},
  {q:"From Exercise 9: which solution is <b>neutral</b>? (A 4, B 1, C 11, D 7, E 9)",a:"D",t:["A","C","E"],w:"pH 7 is neutral.",lay:"four",sc:{marks:[[4,"A"],[1,"B"],[11,"C"],[7,"D"],[9,"E"]],rows:true}},
  {q:"Which solution is <b>strongly alkaline</b>? (A 4, B 1, C 11, D 7, E 9)",a:"C",t:["E","A","D"],w:"pH 11 is the highest, so C is strongly alkaline.",lay:"four",sc:{marks:[[4,"A"],[1,"B"],[11,"C"],[7,"D"],[9,"E"]],rows:true}},
  {q:"Which solution is <b>weakly acidic</b>? (A 4, B 1, C 11, D 7, E 9)",a:"A",t:["B","D","E"],w:"pH 4 is acidic but not as strong as pH 1.",lay:"four",sc:{marks:[[4,"A"],[1,"B"],[11,"C"],[7,"D"],[9,"E"]],rows:true}},
  {q:"Which acid is in oranges and lemons?",a:"Citric acid",t:["Acetic acid","Oxalic acid","Lactic acid"],w:"Table 2.3: orange and lemon — citric acid.",card:["🍊","Orange · Lemon"]},
  {q:"An ant bites you. Which acid is in the sting?",a:"Methanoic acid",t:["Citric acid","Tartaric acid","Acetic acid"],w:"Ant sting and nettle sting both have methanoic acid.",card:["🐜","Ant sting"]},
  {q:"After eating sweets, Ravi does not wash his mouth. What can happen?",a:"Mouth pH falls below 5.5 and teeth decay",t:["Mouth becomes basic","Teeth become harder","Nothing happens"],w:"Bacteria make acid from sugar. Clean your mouth after eating.",lay:"col",card:["🍬","Sweets"]},
  {q:"The clouds of Venus are made of sulphuric acid. Can life like ours exist there?",a:"No — living things need a narrow pH range",t:["Yes, easily","Only plants can live","Only fish can live"],w:"Living organisms survive only in a narrow range of pH.",lay:"col",card:["🪐","Venus"],src:"📘 Box: Acids in other planets"},
  {q:"A dock leaf gives relief from a nettle sting. The dock leaf is",a:"Basic",t:["Acidic","Neutral"],w:"It neutralises the methanoic acid.",lay:"three",card:["🍃","Dock leaf"]},
  {q:"A solution has pH 9. Which statement is true?",a:"It is weakly basic",t:["It is strongly acidic","It is neutral","It is weakly acidic"],w:"pH a little above 7 means weakly basic.",sc:{marks:[[9,"pH 9"]]}},
  {q:"Which has more H^+ ions: pH 2 or pH 5?",a:"pH 2",t:["pH 5","Both the same"],w:"Lower pH means more H^+ ions.",lay:"three",sc:{marks:[[2,"pH 2"],[5,"pH 5"]]}}
];
function drawPh(it,svg,S){
  const sc=it.sc;if(!sc)return false;
  if(sc.order){
    const shown=sc.always?sc.order:sc.order.filter(o=>S.answered||S.done.has(o[2]));
    phBar(svg,shown.map(o=>[o[0],o[1]]),{rows:true});return true;
  }
  if(sc.reveal&&!S.answered){phBar(svg,[]);txt(svg,320,90,"Where on the scale?","pt q");return true;}
  phBar(svg,sc.marks.map(m=>[m[0],sc.nolabel?(S.answered?"pH "+m[0]:"?"):m[1]]),{rows:sc.rows||sc.marks.length>3});
  return true;
}

/* ================= GAME 4: Salt Family ================= */
const SALT={
  K2SO4:{n:"Potassium sulphate",acid:"H2SO4",base:"KOH",sa:1,sb:1,ph:7,tr:["KSO4","K(SO4)2","K2SO3"]},
  Na2SO4:{n:"Sodium sulphate",acid:"H2SO4",base:"NaOH",sa:1,sb:1,ph:7,tr:["NaSO4","Na(SO4)2","Na2SO3"]},
  CaSO4:{n:"Calcium sulphate",acid:"H2SO4",base:"Ca(OH)2",tr:["Ca2SO4","Ca(SO4)2","CaSO3"]},
  MgSO4:{n:"Magnesium sulphate",acid:"H2SO4",base:"Mg(OH)2",tr:["Mg2SO4","Mg(SO4)2","MgSO3"]},
  CuSO4:{n:"Copper sulphate",acid:"H2SO4",base:"Cu(OH)2",sa:1,sb:0,ph:4,tr:["Cu2SO4","Cu(SO4)2","CuSO3"]},
  NaCl:{n:"Sodium chloride",acid:"HCl",base:"NaOH",sa:1,sb:1,ph:7,tr:["NaCl2","Na2Cl","NaClO"]},
  NaNO3:{n:"Sodium nitrate",acid:"HNO3",base:"NaOH",sa:1,sb:1,ph:7,tr:["Na(NO3)2","NaNO2","Na2NO3"]},
  Na2CO3:{n:"Sodium carbonate",acid:"H2CO3",base:"NaOH",sa:0,sb:1,ph:10,tr:["NaCO3","Na(CO3)2","Na2CO2"]},
  NH4Cl:{n:"Ammonium chloride",acid:"HCl",base:"NH4OH",sa:1,sb:0,ph:5,tr:["NH3Cl","(NH4)2Cl","NH4Cl2"]},
  KNO3:{n:"Potassium nitrate",acid:"HNO3",base:"KOH",sa:1,sb:1,ph:7},
  AlCl3:{n:"Aluminium chloride",acid:"HCl",base:"Al(OH)3",sa:1,sb:0,ph:4},
  ZnSO4:{n:"Zinc sulphate",acid:"H2SO4",base:"Zn(OH)2",sa:1,sb:0,ph:5},
  CH3COONa:{n:"Sodium acetate",acid:"CH3COOH",base:"NaOH",sa:0,sb:1,ph:9},
  NaHCO3:{n:"Sodium hydrogencarbonate",acid:"H2CO3",base:"NaOH",sa:0,sb:1,ph:8.3},
  KCl:{n:"Potassium chloride",acid:"HCl",base:"KOH",sa:1,sb:1,ph:7}
};
const sObj=k=>Object.assign({salt:k},SALT[k]);
const fq=(k,src)=>({q:`Write the formula of <b>${SALT[k].n.toLowerCase()}</b>.`,a:k,t:SALT[k].tr,w:`${SALT[k].n} is ${k}.`,sc:{s:k,ask:"Salt"},src});
const ACIDS=["HCl","H2SO4","HNO3","H2CO3","CH3COOH"],BASES=["NaOH","KOH","Ca(OH)2","Mg(OH)2","Cu(OH)2","NH4OH","Al(OH)3","Zn(OH)2"];
function parentQ(k,src){
  const s=SALT[k],a=`${s.acid} + ${s.base}`;
  const oa=shuffle(ACIDS.filter(x=>x!==s.acid)),ob=shuffle(BASES.filter(x=>x!==s.base));
  const t=[`${oa[0]} + ${s.base}`,`${s.acid} + ${ob[0]}`,`${oa[1]} + ${ob[1]}`];
  return{q:`<b>${k}</b> can be made from which acid and base?`,a,t,w:`${s.acid} + ${s.base} → ${k} + water. The metal (or NH4) comes from the base; the rest comes from the acid.`,sc:{s:k,ask:"both"},src,lay:"two"};
}
function phQ(k,src){
  const s=SALT[k],a=s.ph<7?"Acidic":s.ph>7?"Basic":"Neutral";
  const why=s.sa&&s.sb?"strong acid + strong base":s.sa?"strong acid + weak base":"weak acid + strong base";
  return{q:`Is a solution of <b>${k}</b> (${s.n.toLowerCase()}) acidic, basic or neutral?`,a,t:["Acidic","Basic","Neutral"].filter(x=>x!==a),w:`${k} comes from ${s.acid} + ${s.base} (${why}). So it is ${a.toLowerCase()}.`,sc:{s:k,ask:"pH",str:true},lay:"three",src};
}
const SF_FIRST=[
  fq("K2SO4","📘 Activity 2.13"),fq("Na2SO4","📘 Activity 2.13"),fq("CaSO4","📘 Activity 2.13"),fq("MgSO4","📘 Activity 2.13"),fq("CuSO4","📘 Activity 2.13"),
  fq("NaCl","📘 Activity 2.13"),fq("NaNO3","📘 Activity 2.13"),fq("Na2CO3","📘 Activity 2.13"),fq("NH4Cl","📘 Activity 2.13"),
  parentQ("K2SO4","📘 Activity 2.13"),parentQ("NaCl","📘 Activity 2.13"),parentQ("NaNO3","📘 Activity 2.13"),parentQ("Na2CO3","📘 Activity 2.13"),parentQ("NH4Cl","📘 Activity 2.13"),
  {q:"NaCl and Na2SO4 belong to the family of",a:"Sodium salts",t:["Chloride salts","Sulphate salts","Potassium salts"],w:"Salts with the same positive radical (Na^+) belong to one family.",card:["👨‍👩‍👧","NaCl · Na2SO4"],src:"📘 Section 2.4.1"},
  {q:"NaCl and KCl belong to the family of",a:"Chloride salts",t:["Sodium salts","Potassium salts","Sulphate salts"],w:"Salts with the same negative radical (Cl^−) belong to one family.",card:["👨‍👩‍👧","NaCl · KCl"],src:"📘 Section 2.4.1"},
  {q:"A salt of a <b>strong acid and a strong base</b> is",a:"Neutral — pH 7",t:["Acidic — pH less than 7","Basic — pH more than 7"],w:"Example: NaCl from HCl + NaOH.",lay:"col",sc:{s:"NaCl",ask:"pH",str:true},src:"📘 Section 2.4.2"},
  {q:"A salt of a <b>strong acid and a weak base</b> is",a:"Acidic — pH less than 7",t:["Neutral — pH 7","Basic — pH more than 7"],w:"Example: NH4Cl from HCl + NH4OH.",lay:"col",sc:{s:"NH4Cl",ask:"pH",str:true},src:"📘 Section 2.4.2"},
  {q:"A salt of a <b>strong base and a weak acid</b> is",a:"Basic — pH more than 7",t:["Neutral — pH 7","Acidic — pH less than 7"],w:"Example: Na2CO3 from H2CO3 + NaOH.",lay:"col",sc:{s:"Na2CO3",ask:"pH",str:true},src:"📘 Section 2.4.2"},
  phQ("NaCl","📘 Activity 2.14"),phQ("KNO3","📘 Activity 2.14"),phQ("AlCl3","📘 Activity 2.14"),phQ("ZnSO4","📘 Activity 2.14"),phQ("CuSO4","📘 Activity 2.14"),phQ("CH3COONa","📘 Activity 2.14"),phQ("Na2CO3","📘 Activity 2.14"),phQ("NaHCO3","📘 Activity 2.14"),
  {q:"The salt formed from hydrochloric acid and sodium hydroxide is",a:"Sodium chloride — the salt we eat",t:["Sodium carbonate","Sodium sulphate","Sodium hydroxide"],w:"HCl + NaOH → NaCl + H2O. It is a neutral salt.",lay:"col",sc:{s:"NaCl",ask:"Salt"},src:"📘 Section 2.4.3"}
];
const SF_MORE=[
  parentQ("Na2SO4"),parentQ("CaSO4"),parentQ("MgSO4"),parentQ("CuSO4"),parentQ("KNO3"),parentQ("AlCl3"),parentQ("ZnSO4"),parentQ("CH3COONa"),parentQ("KCl"),
  phQ("K2SO4"),phQ("NH4Cl"),phQ("KCl"),phQ("NaNO3"),
  {q:"Which salt is <b>not</b> in the sodium family?",a:"KCl",t:["NaCl","Na2SO4","NaNO3"],w:"KCl has potassium, not sodium.",card:["🔍","Odd one out"]},
  {q:"Which salt is <b>not</b> in the sulphate family?",a:"NaNO3",t:["K2SO4","CuSO4","ZnSO4"],w:"NaNO3 is a nitrate, not a sulphate.",card:["🔍","Odd one out"]},
  {q:"Which salt is <b>not</b> in the chloride family?",a:"Na2CO3",t:["NaCl","NH4Cl","AlCl3"],w:"Na2CO3 is a carbonate.",card:["🔍","Odd one out"]},
  {q:"Which salt solution will turn blue litmus red?",a:"NH4Cl",t:["NaCl","Na2CO3","KNO3"],w:"NH4Cl is acidic (strong acid + weak base).",lay:"four"},
  {q:"Which salt solution will turn red litmus blue?",a:"Na2CO3",t:["NaCl","CuSO4","NH4Cl"],w:"Na2CO3 is basic (weak acid + strong base).",lay:"four"},
  {q:"Which salt has pH exactly 7?",a:"KNO3",t:["AlCl3","CH3COONa","NaHCO3"],w:"KNO3 comes from a strong acid and a strong base.",lay:"four"},
  {q:"HNO3 + KOH → ? + H2O",a:"KNO3",t:["KNO2","K2NO3","HKNO3"],w:"Potassium nitrate forms. It is neutral.",sc:{s:"KNO3",ask:"Salt"}},
  {q:"H2SO4 + 2NaOH → ? + 2H2O",a:"Na2SO4",t:["NaSO4","Na2SO3","NaHSO3"],w:"Sodium sulphate forms. It is neutral.",sc:{s:"Na2SO4",ask:"Salt"}},
  {q:"Which of these is a <b>strong acid</b>?",a:"HCl",t:["CH3COOH","H2CO3"],w:"HCl, H2SO4 and HNO3 are strong acids.",lay:"three"},
  {q:"Which of these is a <b>weak base</b>?",a:"NH4OH",t:["NaOH","KOH"],w:"NH4OH gives few OH^− ions. NaOH and KOH are strong bases.",lay:"three"}
];
function drawSf(it,svg,S){
  const sc=it.sc;if(!sc)return false;
  const s=sObj(sc.s);s.showStrength=!!sc.str;
  if(!(sc.ask==="pH"||S.answered))s.ph=null;
  if(s.ph===undefined)s.ph=null;
  saltScene(svg,s,sc.ask,S.answered);return true;
}

/* ================= GAME 5: Salts We Use ================= */
const SU_FIRST=[
  {q:"Sodium chloride is mainly separated from",a:"Sea water",t:["River water","Rain water","Lime water"],w:"Seawater has many salts. Sodium chloride is separated from them.",card:["🌊","Common salt"],src:"📘 Section 2.4.3"},
  {q:"Large brown crystals of salt mined from the ground are called",a:"Rock salt",t:["Table salt","Baking soda","Gypsum"],w:"Rock salt beds formed when old seas dried up. It is mined like coal.",card:["🪨","Brown salt crystals"],src:"📘 Section 2.4.3"},
  {q:"Rock salt is brown because of",a:"Impurities",t:["Iron rust only","Water of crystallisation","Sunlight"],w:"The brown colour comes from impurities.",card:["🪨","Rock salt"],src:"📘 Section 2.4.3"},
  {q:"Sodium chloride was an important symbol in our freedom struggle. Which event?",a:"Dandi March",t:["Quit India","Non-cooperation","Swadeshi"],w:"Mahatma Gandhi’s Dandi March (1930) was the salt march.",card:["🇮🇳","Salt and freedom"],src:"📘 Section 2.4.3"},
  {q:"Electricity is passed through brine. Which three products form?",a:"NaOH, Cl2 and H2",t:["Na, Cl2 and O2","NaHCO3, Cl2 and H2O","Na2CO3, H2 and O2"],w:"2NaCl + 2H2O → 2NaOH + Cl2 + H2.",sc:{cell:true},src:"📘 Section 2.4.3"},
  {q:"Why is it called the chlor-alkali process?",a:"chlor = chlorine, alkali = sodium hydroxide",t:["chlor = chloride, alkali = acid","chlor = colour, alkali = salt","It is named after a scientist"],w:"The process is named after its products: chlorine and the alkali NaOH.",lay:"col",sc:{cell:true},src:"📘 Section 2.4.3"},
  {q:"At which electrode is chlorine gas given off?",a:"Anode",t:["Cathode","Both electrodes","Neither"],w:"Chlorine at the anode; hydrogen at the cathode.",sc:{cell:true,ask:"cl"},src:"📘 Section 2.4.3"},
  {q:"At which electrode is hydrogen gas given off?",a:"Cathode",t:["Anode","Both electrodes","Neither"],w:"Hydrogen at the cathode.",sc:{cell:true,ask:"h",show:"cl"},src:"📘 Section 2.4.3"},
  {q:"Sodium hydroxide solution forms near the",a:"Cathode",t:["Anode","Top of the beaker","Battery"],w:"NaOH forms near the cathode.",sc:{cell:true,ask:"na",show:"h"},src:"📘 Section 2.4.3"},
  {q:"Hydrogen from the chlor-alkali process is used for",a:"Fuels, margarine and ammonia for fertilisers",t:["Soaps and detergents","Bleaching cloth","PVC and pesticides"],w:"Figure 2.8: hydrogen → fuels, margarine, ammonia.",lay:"col",card:["⛽","Uses of H2"],src:"📘 Figure 2.8"},
  {q:"Chlorine from the chlor-alkali process is used for",a:"Water treatment, PVC, disinfectants and pesticides",t:["Margarine and fuels","Soaps and paper","Fertilisers only"],w:"Figure 2.8: chlorine → water treatment, PVC, disinfectants, CFCs, pesticides.",lay:"col",card:["🚰","Uses of Cl2"],src:"📘 Figure 2.8"},
  {q:"Sodium hydroxide is used for",a:"Soaps and detergents, paper making and artificial fibres",t:["Margarine and fuels","Water treatment only","Making toys"],w:"Figure 2.8: NaOH → de-greasing metals, soaps, paper, artificial fibres.",lay:"col",card:["🧼","Uses of NaOH"],src:"📘 Figure 2.8"},
  {q:"Bleaching powder is made by the action of chlorine on",a:"Dry slaked lime, Ca(OH)2",t:["Wet common salt","Baking soda","Gypsum"],w:"Ca(OH)2 + Cl2 → CaOCl2 + H2O.",card:["⚗️","Cl2 + ? → Bleaching powder"],src:"📘 In-text Q2 (2.4)"},
  {q:"What is the common name of CaOCl2?",a:"Bleaching powder",t:["Baking soda","Washing soda","Plaster of Paris"],w:"CaOCl2 is bleaching powder.",card:["🧴","CaOCl2"],src:"📘 In-text Q1 (2.4)"},
  {q:"Which is a use of bleaching powder?",a:"To make drinking water free from germs",t:["To make cakes soft","To set broken bones","To soften hard water"],w:"It also bleaches cotton, linen and wood pulp, and is an oxidising agent.",lay:"col",card:["🧴","Bleaching powder"],src:"📘 Section 2.4.3"},
  {q:"The chemical name of baking soda is",a:"Sodium hydrogencarbonate — NaHCO3",t:["Sodium carbonate — Na2CO3","Sodium chloride — NaCl","Calcium carbonate — CaCO3"],w:"Baking soda is NaHCO3.",lay:"col",card:["🍞","Baking soda"],src:"📘 Section 2.4.3"},
  {q:"Baking soda is made from",a:"NaCl + H2O + CO2 + NH3",t:["NaOH + HCl","Ca(OH)2 + Cl2","CaSO4 + H2O"],w:"NaCl + H2O + CO2 + NH3 → NH4Cl + NaHCO3.",card:["🏭","Making baking soda"],src:"📘 Section 2.4.3"},
  {q:"What happens when sodium hydrogencarbonate is heated?",a:"2NaHCO3 → Na2CO3 + H2O + CO2",t:["NaHCO3 → NaOH + CO2","2NaHCO3 → 2NaCl + H2O","NaHCO3 → Na + H2CO3"],w:"Sodium carbonate, water and carbon dioxide form.",lay:"col",card:["🔥","Heating baking soda"],src:"📘 In-text Q4 (2.4)"},
  {q:"Baking powder is a mixture of baking soda and",a:"A mild edible acid like tartaric acid",t:["Common salt","Washing soda","Bleaching powder"],w:"With heat or water they react and give CO2.",lay:"col",card:["🎂","Baking powder"],src:"📘 Section 2.4.3"},
  {q:"Why does a cake become soft and spongy?",a:"Carbon dioxide from baking powder makes it rise",t:["Hydrogen gas makes it rise","Water of crystallisation","Chlorine bleaches it"],w:"NaHCO3 + H^+ → CO2 + H2O + sodium salt.",lay:"col",card:["🎂","Soft, spongy cake"],src:"📘 Section 2.4.3"},
  {q:"Baking soda is used in antacids because it is",a:"Alkaline (basic)",t:["Strongly acidic","Neutral","A strong oxidiser"],w:"It neutralises extra acid in the stomach.",card:["💊","Antacid"],src:"📘 Section 2.4.3"},
  {q:"The formula of washing soda is",a:"Na2CO3·10H2O",t:["Na2CO3","NaHCO3","Na2CO3·5H2O"],w:"Recrystallising sodium carbonate gives washing soda.",card:["🧺","Washing soda"],src:"📘 Section 2.4.3"},
  {q:"Which sodium compound is used for softening hard water?",a:"Washing soda",t:["Baking soda","Common salt","Bleaching powder"],w:"Washing soda removes permanent hardness of water.",card:["🚿","Hard water"],src:"📘 In-text Q3 (2.4)"},
  {q:"Washing soda is used in",a:"Glass, soap and paper industries",t:["Making cakes rise","Setting broken bones","Making drinking water germ-free"],w:"It is also used to make borax and as a cleaning agent.",lay:"col",card:["🏭","Washing soda"],src:"📘 Section 2.4.3"},
  {q:"Blue copper sulphate crystals are heated. What colour do they become?",a:"White",t:["Blue","Green","Red"],w:"Heating removes the water of crystallisation.",sc:{cry:["#1E88E5","#F4F4F4"],heat:true,lab:"CuSO4·5H2O"},src:"📘 Activity 2.15"},
  {q:"Water droplets appear in the boiling tube. Where do they come from?",a:"Water of crystallisation in the crystals",t:["The air outside","The flame","The glass"],w:"The crystals looked dry but had water in them.",lay:"col",sc:{cry:["#1E88E5","#F4F4F4"],heat:true,drops:true,lab:"CuSO4·5H2O",pre:true},src:"📘 Activity 2.15"},
  {q:"A few drops of water are added to the white copper sulphate. What happens?",a:"The blue colour comes back",t:["It turns red","It stays white","It catches fire"],w:"The salt takes up water again and becomes blue.",sc:{cry:["#F4F4F4","#1E88E5"],dropper:true,lab:"CuSO4 (white)"},src:"📘 Activity 2.15"},
  {q:"Water of crystallisation is",a:"The fixed number of water molecules in one formula unit of a salt",t:["Water spilled on the salt","Water made when salt burns","Water used to wash the salt"],w:"These crystals look dry, but they contain water.",lay:"col",src:"📘 Section 2.4.4"},
  {q:"How many water molecules are there in one formula unit of copper sulphate crystal?",a:"5",t:["2","10","½"],w:"CuSO4·5H2O.",lay:"four",card:["💎","CuSO4·?H2O"],src:"📘 Section 2.4.4"},
  {q:"The formula of gypsum is",a:"CaSO4·2H2O",t:["CaSO4·½H2O","CaSO4·5H2O","CaCO3·2H2O"],w:"Gypsum has two water molecules.",card:["🪨","Gypsum"],src:"📘 Section 2.4.4"},
  {q:"Gypsum is heated at 373 K. What forms?",a:"Plaster of Paris — CaSO4·½H2O",t:["Bleaching powder — CaOCl2","Washing soda — Na2CO3·10H2O","Lime — CaO"],w:"It loses water and becomes calcium sulphate hemihydrate.",lay:"col",sc:{cry:["#EDE7DD","#FFFFFF"],heat:true,lab:"Gypsum → ?"},src:"📘 Section 2.4.4"},
  {q:"Plaster of Paris is mixed with water. What forms?",a:"Gypsum — a hard solid mass",t:["Bleaching powder","Lime water","Baking soda"],w:"CaSO4·½H2O + 1½H2O → CaSO4·2H2O.",lay:"col",card:["🧱","POP + water → ?"],src:"📘 In-text Q5 (2.4)"},
  {q:"Doctors use Plaster of Paris to",a:"Support fractured bones in the right position",t:["Clean wounds","Make medicines","Test blood"],w:"POP is also used for toys, decoration and making surfaces smooth.",lay:"col",card:["🦴","Broken bone"],src:"📘 Section 2.4.4"},
  {q:"Why is only half a water molecule shown in Plaster of Paris?",a:"Two formula units of CaSO4 share one water molecule",t:["Half the water evaporated","It is a printing mistake","Water molecules break into halves"],w:"So the formula is written as CaSO4·½H2O.",lay:"col",card:["½","CaSO4·½H2O"],src:"📘 Section 2.4.4"},
  {q:"Plaster of Paris should be stored in a moisture-proof container. Why?",a:"It absorbs moisture and sets into hard gypsum",t:["It catches fire in air","It turns into bleaching powder","It becomes acidic"],w:"Moisture turns POP into a hard solid, so it becomes useless.",lay:"col",card:["🫙","Storing POP"],src:"📘 Exercise 13"}
];
const USE=[["Making drinking water free from germs","Bleaching powder","🚰"],["Making cakes soft and spongy","Baking soda","🎂"],["Soda-acid fire extinguisher","Baking soda","🧯"],["Removing permanent hardness of water","Washing soda","🚿"],["Glass, soap and paper industries","Washing soda","🏭"],["Supporting fractured bones","Plaster of Paris","🦴"],["Making toys and decorations","Plaster of Paris","🧸"],["Bleaching cotton and linen","Bleaching powder","👕"],["Antacid for acidity","Baking soda","💊"],["Making soaps and detergents","Sodium hydroxide","🧼"]];
const CHEM=["Bleaching powder","Baking soda","Washing soda","Plaster of Paris","Sodium hydroxide"];
const SU_MORE=[
  ...USE.map(([u,c,ic])=>({q:"Which chemical is used for this?",card:[ic,u],a:c,t:shuffle(CHEM.filter(x=>x!==c)).slice(0,3),w:`${c} is used for ${u.toLowerCase()}.`})),
  ...[["NaHCO3","Baking soda"],["Na2CO3·10H2O","Washing soda"],["CaOCl2","Bleaching powder"],["CaSO4·½H2O","Plaster of Paris"],["CaSO4·2H2O","Gypsum"]].map(([f,n])=>({q:"What is the common name?",card:["🏷️",f],a:n,t:shuffle(["Baking soda","Washing soda","Bleaching powder","Plaster of Paris","Gypsum"].filter(x=>x!==n)).slice(0,3),w:`${f} is ${n.toLowerCase()}.`})),
  {q:"How many water molecules are in washing soda crystals?",a:"10",t:["5","2","½"],w:"Na2CO3·10H2O.",lay:"four",card:["🧺","Na2CO3·?H2O"]},
  {q:"Which of these is <b>not</b> made from common salt?",a:"Plaster of Paris",t:["Sodium hydroxide","Baking soda","Washing soda"],w:"POP comes from gypsum. The others are made using NaCl."},
  {q:"Heating baking soda gives sodium carbonate. Recrystallising sodium carbonate gives",a:"Washing soda",t:["Bleaching powder","Gypsum","Common salt"],w:"Na2CO3 + 10H2O → Na2CO3·10H2O."},
  {q:"Which gas is used to make bleaching powder?",a:"Chlorine",t:["Hydrogen","Carbon dioxide","Oxygen"],w:"Cl2 from the chlor-alkali process acts on dry slaked lime.",sc:{cell:true,show:"cl"}},
  {q:"Baking soda solution is",a:"Mildly basic and non-corrosive",t:["Strongly acidic","Strongly basic and corrosive","Neutral"],w:"That is why it is safe to use in food and antacids.",lay:"col"},
  {q:"Is Na2CO3·10H2O wet?",a:"No — the water is part of the crystal",t:["Yes — it is a solution","Yes — it has dew on it","It is always melted"],w:"Water of crystallisation does not make crystals wet.",lay:"col",card:["💎","Na2CO3·10H2O"]}
];
function drawSu(it,svg,S){
  const sc=it.sc;if(!sc)return false;
  if(sc.cell){svg.setAttribute("viewBox","50 0 560 240");cellScene(svg,{answered:S.answered,ask:sc.ask,show:sc.show});return true;}
  if(sc.cry){svg.setAttribute("viewBox","170 0 330 240");const ch=S.answered||sc.pre;crystalScene(svg,sc.cry[0],sc.cry[1],ch,{heat:sc.heat,drops:sc.drops||(ch&&sc.heat),lab:sc.lab,dropper:sc.dropper});return true;}
  return false;
}


// ---- Lesson 2 selection: 72 textbook core (book order) + 28 bonus = 100 ----
const pick=(a,ix)=>ix.map(i=>a[i]);
const T21="📘 Table 2.1";
const rt=(x,s)=>Object.assign({},x,{src:s});
const EPSOM={q:"How many water molecules are there in Epsom salt, MgSO4·?H2O?",a:"7",t:["2","5","10"],w:"Epsom salt is MgSO4·7H2O.",lay:"four",card:["💎","MgSO4·?H2O"],src:"📘 Section 2.4.4"};
const HEMI={q:"What is the chemical name of Plaster of Paris?",a:"Calcium sulphate hemihydrate",t:["Calcium sulphate dihydrate","Calcium carbonate","Calcium hydroxide"],w:"Its formula is CaSO4·½H2O. Hemi means half.",lay:"col",card:["🧱","CaSO4·½H2O"],src:"📘 Section 2.4.4"};

const IND_C=[rt(IND_MORE[1],T21),rt(IND_MORE[2],T21),rt(IND_MORE[0],T21),rt(IND_FIRST[13],T21),
             IND_FIRST[2],IND_FIRST[3],IND_FIRST[4],IND_FIRST[5],IND_FIRST[7],IND_FIRST[9]];
const IND_B=pick(IND_FIRST,[0,1,6,10]);

const RX_C=RX_FIRST.slice(0,18), RX_B=RX_MORE.slice(0,6);
const PH_C=PH_FIRST.slice(0,16), PH_B=PH_MORE.slice(0,8);
const SF_C=SF_FIRST.slice(0,12), SF_B=SF_MORE.slice(0,4);

const SU_C=[SU_FIRST[28],SU_FIRST[24],SU_FIRST[26],SU_FIRST[27],SU_FIRST[21],EPSOM,
            SU_FIRST[29],SU_FIRST[30],HEMI,SU_FIRST[31],SU_FIRST[32],
            SU_FIRST[13],SU_FIRST[15],SU_FIRST[17],SU_FIRST[4],SU_FIRST[33]];
const SU_B=pick(SU_FIRST,[25,34,14,22,19,5]);

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
      [["0",110],["7",320],["14",530]].forEach(([t,x])=>T(svg,x,232,t,"small"));}
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

/* ===== Lesson 2 final set: 100 = lab pictures, then handbook exam questions, then textbook, then bonus ===== */
const EXQ="📝 Exam question",LP="🔬 Lab picture";
const pk=(arr,idx,src)=>idx.map(i=>src?Object.assign({},arr[i],{src}):arr[i]);
const N2={
 indX:[{q:"Which simple test shows that a solution is acidic?",a:"Blue litmus turns red",t:["Red litmus turns blue","Phenolphthalein turns pink","Methyl orange turns yellow"],lay:"col",w:"Acids turn blue litmus red.",src:EXQ},
       {q:"A solution has pH 10. What colour is methyl orange in it?",a:"Yellow",t:["Red","Pink","Colourless"],w:"Methyl orange is yellow in a basic solution.",src:EXQ},
       {q:"Which of these is not an olfactory indicator?",a:"Groundnut oil",t:["Clove oil","Onion","Vanilla essence"],w:"Groundnut oil does not change its smell with acids or bases.",src:EXQ}],
 rx:[{pic:"znacid",q:"Zinc reacts with dilute H₂SO₄. The gas makes a pop sound near a flame. It is",a:"Hydrogen",t:["Oxygen","Carbon dioxide","Chlorine"],w:"Hydrogen burns with a pop sound.",src:LP},
     {pic:"limewater",l:"Na₂CO₃ + dil. HCl",q:"Sodium carbonate reacts with dilute HCl. The gas turns lime water milky. It is",a:"Carbon dioxide",t:["Hydrogen","Oxygen","Chlorine"],w:"Carbonates give carbon dioxide with acids.",src:LP},
     {pic:"limewater",l:"Egg shells + solution",shells:1,q:"Crushed egg shells give a gas that turns lime water milky. The solution contains",a:"HCl",t:["NaCl","KCl","LiCl"],w:"Egg shells are calcium carbonate. Only an acid like HCl gives CO2 with them.",src:LP}],
 rxX:[{q:"Complete: Acid + Base → Salt + ______",a:"Water",t:["Hydrogen","Carbon dioxide","Oxygen"],w:"This is a neutralisation reaction.",src:EXQ},
      {q:"An antacid tablet is taken for acidity. What reaction happens in the stomach?",a:"Neutralisation",t:["Decomposition","Displacement","Combustion"],w:"The base in the antacid neutralises the extra acid.",src:EXQ}],
 ph:[{pic:"acidbulb",q:"The bulb glows when the wires are dipped in dilute HCl. Why?",a:"HCl gives ions in water",t:["HCl is a metal","The beaker is hot","Water is a good conductor"],lay:"col",w:"H⁺ ions in the solution carry the current.",src:LP},
     {pic:"phstrip",q:"Drops of three solutions on pH paper. Which one is acidic?",a:"A (red)",t:["B (green)","C (blue)"],lay:"three",w:"Red on pH paper means a low pH, so it is acidic.",src:LP}],
 phX:[{q:"A solution has pH 3. How can we neutralise it?",a:"Add a base",t:["Add an acid","Add more water","Heat it"],w:"A base cancels the acid.",src:EXQ},
      {q:"A solution turns red litmus blue. Its pH is likely to be",a:"10",t:["1","4","5"],w:"It is basic, so its pH is more than 7.",src:EXQ},
      {q:"Which medicine is used for treating indigestion?",a:"Antacid",t:["Antibiotic","Analgesic","Antiseptic"],w:"An antacid is a mild base that neutralises extra stomach acid.",src:EXQ},
      {q:"Mixing an acid or a base with water is called",a:"Dilution",t:["Neutralisation","Distillation","Evaporation"],w:"Dilution lowers the concentration of ions.",src:EXQ},
      {q:"What is the nature of magnesium hydroxide?",a:"Basic",t:["Acidic","Neutral","Amphoteric"],w:"Mg(OH)2 (milk of magnesia) is a base.",src:EXQ},
      {q:"What is the range of the pH scale?",a:"0 to 14",t:["0 to 7","1 to 10","7 to 14"],w:"0 is very acidic, 7 is neutral and 14 is very basic.",src:EXQ},
      {q:"Why are toothpastes generally basic?",a:"To neutralise acid and prevent tooth decay",t:["To make teeth white","To kill all germs","To add taste"],lay:"col",w:"Tooth decay starts when the mouth pH falls below 5.5.",src:EXQ},
      {q:"Lemon juice pH 2, milk pH 6.5, soap solution pH 10. Increasing order of acidity?",a:"Soap < Milk < Lemon",t:["Lemon < Milk < Soap","Milk < Soap < Lemon","Soap < Lemon < Milk"],lay:"col",w:"Lower pH means more acidic.",src:EXQ}],
 suX:[{q:"What is the formula of bleaching powder?",a:"CaOCl2",t:["CaCl2","Ca(OH)2","CaCO3"],w:"Bleaching powder is calcium oxychloride.",src:EXQ},
      {q:"What is the formula of Plaster of Paris?",a:"CaSO4·½H2O",t:["CaSO4·2H2O","CaSO4","CaCO3"],w:"Gypsum loses water on heating and becomes CaSO4·½H2O.",src:EXQ},
      {q:"Chlorine reacts with which substance to give bleaching powder?",a:"Dry slaked lime, Ca(OH)2",t:["Quick lime, CaO","Limestone, CaCO3","Gypsum"],lay:"col",w:"Ca(OH)2 + Cl2 → CaOCl2 + H2O.",src:EXQ},
      {q:"At a Swachh Seva camp, how can students make drinking water safe?",a:"Add bleaching powder to disinfect it",t:["Add washing soda","Store bleaching powder near the tank","Decorate the tank"],lay:"col",w:"Bleaching powder kills germs in water.",src:EXQ},
      {q:"Rohan: washing soda for cakes, baking soda for hard water. Sowmya disagrees. Who is correct?",a:"Sowmya",t:["Rohan","Both","Neither"],w:"Baking soda is used for cakes; washing soda softens hard water.",src:EXQ},
      {q:"What is the formula of baking soda?",a:"NaHCO3",t:["Na2CO3","NaOH","NaCl"],w:"Baking soda is sodium hydrogencarbonate.",src:EXQ},
      {q:"How many molecules of water of crystallisation are there in washing soda?",a:"10",t:["5","2","7"],w:"Washing soda is Na2CO3·10H2O.",src:EXQ}]
};
const F2={
 ind:{C:[...pk(IND_C,[0,1,2,3,4,5,6,7]),...N2.indX,...pk(IND_C,[8,9])],B:pk(IND_B,[0])},
 rx:{C:[...N2.rx,...N2.rxX,...pk(RX_C,[0,2,3,4,5,7,8,9,10,11,12,13,14,15])],B:pk(RX_B,[0,1,3])},
 ph:{C:[...N2.ph,...pk(PH_C,[12,13,14,15]),...N2.phX,...pk(PH_C,[7],EXQ),...pk(PH_C,[1,2,3,4,5,6,9])],B:[]},
 sf:{C:[...SF_C],B:[...SF_B]},
 su:{C:[...pk(SU_C,[1,2,7,14]),...N2.suX,...pk(SU_B,[3],EXQ),...pk(SU_C,[0,3,4,5,6,8,9,10,11,12,13,15])],B:pk(SU_B,[0,4])}
};
const dPic=f=>(it,svg,S)=>drawPic(it,svg,S)||f(it,svg,S);

const G={
  ind:makeGame("ind",F2.ind.C,F2.ind.B,dPic(drawInd)),
  rx:makeGame("rx",F2.rx.C,F2.rx.B,dPic(drawRx)),
  ph:makeGame("ph",F2.ph.C,F2.ph.B,dPic(drawPh)),
  sf:makeGame("sf",F2.sf.C,F2.sf.B,dPic(drawSf)),
  su:makeGame("su",F2.su.C,F2.su.B,dPic(drawSu))
};
window.__AB={G,F};
})();

