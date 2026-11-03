/* Smart Science Lab — shared games.html engine
   Loaded (via <script src>) before each lesson's own games.js, on every
   lesson's games.html page. Holds only the generic quiz-tab machinery that
   was verified byte-identical across lessons: DOM shorthand, random-pick
   helpers, the background-music/sound-effect engine, the streak/confetti
   celebration, the score tracker, the multiple-choice button builder, the
   nav-tab switching, and the auto-advance-to-next-question timer.
   Nothing here knows about any lesson's subject, questions or pictures —
   that content lives in each lesson's own games.js. */
const $=id=>document.getElementById(id);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=(a,k)=>shuffle(a).slice(0,k);
const one=a=>a[Math.random()*a.length|0];
let right=0,total=0;
let lastX=innerWidth/2,lastY=innerHeight/2,streak=0;
const pt=e=>{lastX=e.clientX;lastY=e.clientY;};
document.addEventListener("pointerdown",pt,true);document.addEventListener("pointerup",pt,true);
const RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- sound: soft background music + small effects (Web Audio, no files) ----------
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

// ---------- 3 in a row: confetti rain + banner ----------
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
  const s=$("score");s.textContent=`Score ${right} / ${total}`+(streak>=3?` 🔥${streak}`:"");
  if(!ok)return;
  if(streak%3===0){celebrate(streak);Snd.fan();}else Snd.ok();
  s.classList.remove("pop");void s.offsetWidth;s.classList.add("pop");
  if(RM)return;
  for(let k=0;k<8;k++){
    const p=document.createElement("span");p.className="spark";p.textContent=["⭐","✨","🎉","🌟"][k%4];
    const a=k/8*Math.PI*2;p.style.left=lastX+"px";p.style.top=lastY+"px";
    p.style.setProperty("--dx",Math.round(Math.cos(a)*80)+"px");p.style.setProperty("--dy",Math.round(Math.sin(a)*80-30)+"px");
    document.body.appendChild(p);setTimeout(()=>p.remove(),950);
  }
};
const setMsg=(id,cls,html)=>{const m=$(id);m.className="msg"+(cls?" "+cls:"");m.innerHTML=html;};

document.querySelectorAll("nav button").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll("nav button").forEach(x=>x.setAttribute("aria-selected",x===b));
  document.querySelectorAll(".game").forEach(g=>g.classList.toggle("on",g.id===b.dataset.g));
  document.body.dataset.g=b.dataset.g;
  rearm();
}));

function quiz(box,items,isRight,label,onDone,oneLine,noMark){
  box.innerHTML="";
  items.forEach(it=>{
    const b=document.createElement("button");b.className="btn";
    b.innerHTML=`<span class="lbl${oneLine?" one":""}">${label(it)}</span>`;b._it=it;
    b.onclick=()=>{
      const ok=isRight(it);if(!noMark)mark(ok);
      box.querySelectorAll("button").forEach(x=>{x.disabled=true;if(isRight(x._it))x.classList.add("ok");});
      if(!ok)b.classList.add("bad");
      onDone(ok);
    };
    box.appendChild(b);
  });
}

// ---------- auto-next: next question comes by itself ----------
const AUTO={};
let autoT=null;
function arm(btn){
  clearTimeout(autoT);
  document.querySelectorAll(".next.auto").forEach(x=>x.classList.remove("auto"));
  if(btn.hidden||!btn.closest(".game").classList.contains("on"))return;
  const ms=AUTO[btn.id]||2000;
  btn.style.setProperty("--t",ms+"ms");void btn.offsetWidth;btn.classList.add("auto");
  autoT=setTimeout(()=>{btn.classList.remove("auto");if(!btn.hidden&&btn.closest(".game").classList.contains("on"))btn.click();},ms);
}
function rearm(){
  clearTimeout(autoT);
  document.querySelectorAll(".next.auto").forEach(x=>x.classList.remove("auto"));
  const nb=document.querySelector(".game.on button.next[id$='Next']:not([hidden])");
  if(nb)arm(nb);
}
const mo=new MutationObserver(ms=>ms.forEach(m=>arm(m.target)));
document.querySelectorAll("button.next[id$='Next']").forEach(b=>mo.observe(b,{attributes:true,attributeFilter:["hidden"]}));
