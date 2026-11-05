/* Lesson 1: Chemical Reactions and Equations — lab.html (Digital Lab)
   experiment-picker logic. Three experiments: zinc + dilute acid (opens its
   own page, zinc.html, since that rig predates this picker and is too
   bespoke to merge in), lead nitrate + potassium iodide, and heating lead
   nitrate — the last two share this one generic test-tube/boiling-tube
   rig and engine. Particle effects (flame, steam/smoke streams) come from
   ../shared/fx.js. */
(()=>{
  const $=id=>document.getElementById(id);
  const NS="http://www.w3.org/2000/svg";
  const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svg=$("sc");
  const mk=(tag,at,par)=>{const e=document.createElementNS(NS,tag);for(const k in at)e.setAttribute(k,at[k]);if(par)par.appendChild(e);return e;};
  const easeIO=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const easeOut=t=>1-Math.pow(1-t,3);
  const bounce=t=>{const n=7.5625,d=2.75;if(t<1/d)return n*t*t;if(t<2/d)return n*(t-=1.5/d)*t+.75;if(t<2.5/d)return n*(t-=2.25/d)*t+.9375;return n*(t-=2.625/d)*t+.984375;};
  let gen=0; // bumps on reset, so old animations stop
  function tween(ms,fn,ez=easeIO){const g=gen;return new Promise((res,rej)=>{const t0=performance.now();const f=now=>{if(g!==gen)return rej("reset");const t=Math.min(1,(now-t0)/ms);fn(ez(t),t);if(t<1)requestAnimationFrame(f);else res();};requestAnimationFrame(f);});}
  const wait=ms=>{const g=gen;return new Promise(r=>setTimeout(()=>r(),ms)).then(()=>{if(g!==gen)throw "reset";});};
  const lerp=(a,b,t)=>a+(b-a)*t;
  window.addEventListener("unhandledrejection",e=>{if(e.reason==="reset")e.preventDefault();});

  /* ---------- sound (Web Audio, no files) ---------- */
  const Snd=(()=>{
    let ctx=null,out=null,nb=null,on=true,fz=null,fzT=null,mus=null,mg=null;
    const BEAT=60/84,CH=[[261.63,329.63,392],[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66]];
    function mtone(f,t,d,type,v){
      const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=f;
      g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+d);
      o.connect(g);g.connect(mg);o.start(t);o.stop(t+d+.05);
    }
    function beat(t,i){
      const c=CH[Math.floor(i/4)%4],b=i%4;
      if(b===0){c.forEach(f=>mtone(f,t,BEAT*4,"triangle",.03));mtone(c[0]/2,t,BEAT*1.8,"sine",.09);}
      if(b===2)mtone(c[0]/2,t,BEAT*1.5,"sine",.06);
      if(b!==3||i%8===7)mtone(c[(i*7+b)%3]*2,t,BEAT*.9,"sine",.04);
    }
    try{on=localStorage.getItem("zphsLabSnd")!=="off";}catch(e){}
    function init(){
      if(ctx){if(ctx.state==="suspended")ctx.resume();return true;}
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
      try{
        ctx=new AC();out=ctx.createGain();out.gain.value=on?1:0;out.connect(ctx.destination);
        nb=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
      }catch(e){ctx=null;return false;}
      return true;
    }
    function noise(t,dur,type,f,q,v,att=.005){
      const s=ctx.createBufferSource();s.buffer=nb;s.loop=true;
      const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
      const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
      s.connect(fl);fl.connect(g);g.connect(out);s.start(t,Math.random());s.stop(t+dur+.05);return g;
    }
    function tone(f,t,d,type,v,f2){
      const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
      g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);
      o.connect(g);g.connect(out);o.start(t);o.stop(t+d+.05);
    }
    const ready=()=>ctx&&ctx.state!=="closed";
    return{
      init,
      isOn:()=>on,
      toggle(){on=!on;try{localStorage.setItem("zphsLabSnd",on?"on":"off");}catch(e){}if(init())out.gain.setTargetAtTime(on?1:0,ctx.currentTime,.05);return on;},
      pause(){if(ctx&&ctx.state==="running")ctx.suspend();},
      resume(){if(ctx&&ctx.state==="suspended")ctx.resume();},
      clink(){if(!ready())return;const t=ctx.currentTime,k=.9+Math.random()*.25;tone(2300*k,t,.16,"sine",.22);tone(3650*k,t,.1,"sine",.1);noise(t,.04,"highpass",5000,.7,.15);},
      pour(sec){if(!ready())return;const t=ctx.currentTime;
        const s=ctx.createBufferSource();s.buffer=nb;s.loop=true;const fl=ctx.createBiquadFilter();fl.type="bandpass";fl.frequency.value=650;fl.Q.value=.9;
        const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.32,t+.25);
        for(let k=.3;k<sec-.3;k+=.07){g.gain.setValueAtTime(.18+Math.random()*.2,t+k);fl.frequency.setValueAtTime(450+Math.random()*500+k*90,t+k);}
        g.gain.linearRampToValueAtTime(.0001,t+sec);s.connect(fl);fl.connect(g);g.connect(out);s.start(t);s.stop(t+sec+.1);},
      fizzStart(){if(!ready()||fz)return;
        const s=ctx.createBufferSource();s.buffer=nb;s.loop=true;const fl=ctx.createBiquadFilter();fl.type="highpass";fl.frequency.value=3200;
        const g=ctx.createGain();g.gain.value=.0001;s.connect(fl);fl.connect(g);g.connect(out);s.start();fz={s,g,base:.07};
        fzT=setInterval(()=>{if(!fz)return;const n=ctx.currentTime;fz.g.gain.setTargetAtTime(fz.base*(.45+Math.random()*1.1),n,.025);
          if(Math.random()<.35&&fz.base>.01)noise(n,.03,"highpass",6000,.5,fz.base*1.4);},55);},
      fizzLevel(v){if(fz)fz.base=v;},
      fizzStop(){if(!fz)return;clearInterval(fzT);const n=ctx.currentTime;fz.g.gain.cancelScheduledValues(n);fz.g.gain.setTargetAtTime(.0001,n,.15);const s=fz.s;setTimeout(()=>{try{s.stop();}catch(e){}},800);fz=null;},
      strike(){if(!ready())return;const t=ctx.currentTime;noise(t,.16,"highpass",2200,.8,.4);noise(t+.08,.6,"lowpass",900,.7,.18,.08);},
      pop(){if(!ready())return;const t=ctx.currentTime;tone(190,t,.28,"sine",.9,50);noise(t,.14,"bandpass",1400,.6,.9,.002);noise(t,.06,"highpass",4500,.5,.5,.001);},
      music(want){
        if(want){if(!ready()||mus)return;mg=ctx.createGain();mg.gain.value=.0001;mg.gain.setTargetAtTime(.55,ctx.currentTime,.4);mg.connect(out);
          let nt=ctx.currentTime+.1,bi=0;mus=setInterval(()=>{while(nt<ctx.currentTime+.6){beat(nt,bi);nt+=BEAT;bi++;}},150);}
        else{if(!mus)return;clearInterval(mus);mus=null;const g=mg;mg=null;g.gain.setTargetAtTime(.0001,ctx.currentTime,.3);setTimeout(()=>{try{g.disconnect();}catch(e){}},1500);}
      },
      duck(d){if(mg&&ctx)mg.gain.setTargetAtTime(d?.18:.55,ctx.currentTime,.2);},
      ok(){if(!ready())return;const t=ctx.currentTime;tone(880,t,.22,"sine",.4);tone(1318.5,t+.09,.3,"sine",.35);},
      bad(){if(!ready())return;const t=ctx.currentTime;tone(220,t,.25,"triangle",.35,160);},
      fan(){if(!ready())return;const t=ctx.currentTime;[523.25,659.25,783.99,1046.5,1318.5].forEach((f,i)=>tone(f,t+i*.09,.5,"triangle",.4));tone(1568,t+.5,.8,"sine",.3);}
    };
  })();
  const sndB=$("snd");const sndSync=()=>{sndB.setAttribute("aria-pressed",Snd.isOn());sndB.textContent=Snd.isOn()?"🔊":"🔈";};sndSync();
  sndB.addEventListener("click",()=>{Snd.toggle();sndSync();});
  document.addEventListener("pointerdown",()=>Snd.init(),{capture:true});

  /* ---------- voice-over (browser speech, English) ---------- */
  const Say=(()=>{
    const ss=window.speechSynthesis;let on=true,v=null,dT=null;
    try{on=localStorage.getItem("zphsLabVoice")!=="off";}catch(e){}
    function pick(){if(!ss)return;const vs=ss.getVoices().filter(x=>/^en/i.test(x.lang));
      const sc=x=>{let s=0;const n=x.name||"",l=x.lang||"";if(/en[-_]IN/i.test(l))s+=6;if(/natural|neural|online|premium|enhanced/i.test(n))s+=5;if(/google/i.test(n))s+=4;
        if(/neerja|heera|veena|raveena|aditi|kajal|swara|female|zira|samantha|sonia|libby|aria|jenny/i.test(n))s+=2;if(/en[-_](GB|US)/i.test(l))s+=1;if(/espeak|robot|compact/i.test(n))s-=6;if(x.localService===false)s+=1;return s;};
      v=vs.slice().sort((a,b)=>sc(b)-sc(a))[0]||null;}
    if(ss){pick();try{ss.addEventListener("voiceschanged",pick);}catch(e){ss.onvoiceschanged=pick;}}
    function stop(){if(ss)ss.cancel();Snd.duck(false);}
    function say(text,queue){
      if(!ss||!on||!text)return;if(!queue)ss.cancel();
      text.split(/(?<=[.!?])\s+/).forEach(s=>{if(!s.trim())return;
        const u=new SpeechSynthesisUtterance(s);u.lang=v?v.lang:"en-IN";if(v)u.voice=v;u.rate=.86;u.pitch=1;u.volume=.95;
        u.onstart=()=>{clearTimeout(dT);Snd.duck(true);};
        u.onend=u.onerror=()=>{clearTimeout(dT);dT=setTimeout(()=>{if(!ss.speaking)Snd.duck(false);},300);};
        ss.speak(u);});
    }
    return{say,stop,ok:!!ss,isOn:()=>on,toggle(){on=!on;try{localStorage.setItem("zphsLabVoice",on?"on":"off");}catch(e){}if(!on)stop();return on;}};
  })();
  const vB=$("voice"),mB=$("mus");
  const vSync=()=>vB.setAttribute("aria-pressed",Say.isOn());vSync();if(!Say.ok)vB.hidden=true;
  vB.addEventListener("click",()=>{Say.toggle();vSync();if(Say.isOn())Say.say("Voice is on.");});
  let musOn=false;try{musOn=localStorage.getItem("zphsLabMusic")==="on";}catch(e){}
  const mSync=()=>mB.setAttribute("aria-pressed",musOn);mSync();
  mB.addEventListener("click",()=>{musOn=!musOn;try{localStorage.setItem("zphsLabMusic",musOn?"on":"off");}catch(e){}mSync();Snd.init();Snd.music(musOn);});
  document.addEventListener("visibilitychange",()=>{if(document.hidden){Snd.pause();Say.stop();}else Snd.resume();});

  // ======================= helpers =======================
  const $$=s=>Array.from(document.querySelectorAll(s));
  const setOp=(el,v)=>{if(el)el.setAttribute("opacity",v);};
  const toast=$("toast");let toastT=null;
  function say(t,ms=2400){toast.textContent=t;toast.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>toast.classList.remove("on"),ms);}
  function obs(t){const ul=$("obs"),e=ul.querySelector(".empty");if(e)e.remove();
    const li=document.createElement("li");li.textContent=t;li.className="new";ul.appendChild(li);setTimeout(()=>li.classList.remove("new"),900);}
  function halo(el){if(el)el.classList.add("cueG");}
  function clearHalos(){$$(".cueG").forEach(e=>e.classList.remove("cueG"));}
  async function hideItem(id){const e=$(id);if(!e)return;await tween(360,t=>setOp(e,1-t));e.style.display="none";}
  function showItem(id){const e=$(id);if(e){e.style.display="";setOp(e,1);}}
  // rising bubbles / steam, drawn with CSS animation
  function startBub(gid,x,w,y,h,n,r,col){
    const g=$(gid);if(!g)return;g.innerHTML="";
    for(let i=0;i<n;i++){
      const c=mk("circle",{cx:(x-w/2+Math.random()*w).toFixed(1),cy:y,r:(r*(.6+Math.random()*.8)).toFixed(1),
        fill:col||"rgba(255,255,255,.85)",stroke:col?"none":"rgba(100,116,139,.6)","stroke-width":1,class:"bb"},g);
      c.style.setProperty("--d",(0.9+Math.random()*0.9).toFixed(2)+"s");
      c.style.setProperty("--dl",(Math.random()*1.2).toFixed(2)+"s");
      c.style.setProperty("--h",h+"px");
    }
  }
  function stopBub(gid){const g=$(gid);if(g)g.innerHTML="";}
  async function dropInto(id,y0,y1,n=3){
    const d=$(id);
    for(let i=0;i<n;i++){
      setOp(d,1);await tween(RM?60:420,t=>d.setAttribute("cy",lerp(y0,y1,t)),t=>t*t);
      setOp(d,0);d.setAttribute("cy",y0);Snd.clink&&Snd.clink();await wait(RM?20:140);
    }
  }
  function fitText(el){if(!el)return;el.style.fontSize="";let fs=parseFloat(getComputedStyle(el).fontSize);
    let k=0;while(el.scrollWidth>el.clientWidth+1&&fs>11&&k<60){fs-=1;el.style.fontSize=fs+"px";k++;}}

  // ======================= experiments =======================
  const EXPS=[
  {key:"Z",ic:"🫧",tag:"📘 Activity 1.3",name:"Zinc + dilute acid",sub:"Hydrogen gas",link:"zinc.html",
   blurb:"Watch bubbles of hydrogen form and test the gas with a burning splinter.",
   intro:"This experiment opens on its own lab page. Tap Start to go there.",
   safe:"🥽 Handle the acid with care.",
   aim:"To see what happens when zinc reacts with dilute hydrochloric acid.",
   steps:["Open the zinc lab"],stepTasks:["Open the zinc lab."],conc:{w1:"",eq:"",w2:""},quiz:[]},
  {key:"P",ic:"🟡",tag:"📘 Activity 1.2",name:"Lead nitrate + potassium iodide",sub:"A yellow precipitate",
   blurb:"Mix two clear solutions and watch a bright yellow solid appear.",
   intro:"You will take colourless lead nitrate solution in a test tube and add potassium iodide solution drop by drop. Watch the colour, then let the tube stand.",
   safe:"🥽 Lead compounds are poisonous. In a real lab, wear gloves, never taste, and wash your hands after the activity.",
   aim:"To observe the reaction between lead nitrate and potassium iodide solutions.",
   steps:["Take lead nitrate solution","Add a few drops of potassium iodide","Add more potassium iodide","Let the test tube stand"],
   stepTasks:["Tap the lead nitrate bottle. Pour its solution into the test tube.",
     "Tap the potassium iodide dropper. Add a few drops.",
     "Tap the dropper again. Add more potassium iodide.",
     "Tap the test tube. Let it stand and watch."],
   conc:{w1:"A bright yellow solid formed as soon as the two clear solutions mixed. It slowly settled at the bottom of the test tube.",
     eq:"Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃",
     w2:"The yellow solid is lead iodide. A solid that forms in a solution is a precipitate. The two compounds exchange their ions, so this is a double displacement reaction."},
   quiz:[
    {q:"What did you see when potassium iodide was added?",a:"A yellow precipitate formed",t:["A white gas came out","The solution turned blue","Nothing happened"],w:"Lead iodide is a yellow solid.",lay:"col"},
    {q:"The yellow precipitate is",a:"Lead iodide (PbI₂)",t:["Potassium nitrate","Lead nitrate","Potassium iodide"],w:"Lead ions join with iodide ions to form PbI₂."},
    {q:"What kind of reaction is this?",a:"Double displacement",t:["Combination","Decomposition","Displacement"],w:"The two compounds exchange their ions."},
    {q:"A solid that forms and settles in a solution is called a",a:"Precipitate",t:["Solvent","Residue","Crystal"],w:"Reactions that make a precipitate are precipitation reactions."},
    {q:"Which product stays dissolved in the solution?",a:"Potassium nitrate (KNO₃)",t:["Lead iodide (PbI₂)","Lead (Pb)","Iodine gas"],w:"KNO₃ is soluble, so it stays in the solution."}]},
  {key:"N",ic:"🟤",tag:"📘 Activity 1.6",name:"Heating lead nitrate",sub:"Brown fumes",
   blurb:"Heat lead nitrate powder and watch brown fumes rise.",
   intro:"You will take lead nitrate powder in a boiling tube and heat it over a flame. Watch the powder and the gas that comes out.",
   safe:"🥽 The brown gas (nitrogen dioxide) is poisonous. In a real lab, heat only a little powder, keep the tube mouth away from people, and never breathe the fumes.",
   aim:"To observe what happens when lead nitrate is heated.",
   steps:["Take lead nitrate powder","Heat the boiling tube","Look at the residue","Stop heating"],
   stepTasks:["Tap the lead nitrate powder. Put about 2 g into the boiling tube.",
     "Tap the burner. Heat the boiling tube.",
     "Tap the boiling tube. Look closely at the solid left behind.",
     "Tap the burner again. Stop heating."],
   conc:{w1:"On heating, the powder crackled and brown fumes came out of the tube. A yellow solid was left behind.",
     eq:"2Pb(NO₃)₂ → 2PbO + 4NO₂ + O₂",
     w2:"One compound broke down into three simpler substances: lead oxide (yellow solid), nitrogen dioxide (brown gas) and oxygen. Heat broke it down, so this is a thermal decomposition reaction."},
   quiz:[
    {q:"What colour were the fumes?",a:"Brown",t:["White","Green","Colourless"],w:"Nitrogen dioxide (NO₂) is a brown gas."},
    {q:"The brown gas is",a:"Nitrogen dioxide (NO₂)",t:["Oxygen (O₂)","Carbon dioxide (CO₂)","Hydrogen (H₂)"],w:"Two products are gases: NO₂ (brown) and O₂ (colourless)."},
    {q:"The yellow solid left behind is",a:"Lead oxide (PbO)",t:["Lead iodide","Lead nitrate","Lead metal"],w:"PbO is the residue left in the boiling tube."},
    {q:"What type of reaction is this?",a:"Thermal decomposition",t:["Combination","Double displacement","Neutralisation"],w:"Heat breaks one compound into simpler substances."},
    {q:"Why must we not breathe the brown fumes?",a:"Nitrogen dioxide is poisonous",t:["They smell sweet","They are too hot","They are only steam"],w:"Always heat lead nitrate in a well-ventilated place.",lay:"col"}]}
  ];

  const BYKEY={};EXPS.forEach(e=>BYKEY[e.key]=e);

  // ======================= state & record =======================
  let EXP=null,step=0,done=false,busy=false;
  function setPill(){const n=EXP?EXP.stepTasks.length:0;$("pill").textContent=done?"Done ✓":`Step ${Math.min(step+1,n)} / ${n}`;}
  function setTask(){if(done)return;$("tn").textContent=step+1;$("tt").textContent=EXP.stepTasks[step];}
  function markStep(){$$("#steps li").forEach((li,i)=>{li.className=i<step?"ok":(i===step?"now":"");});}
  function buildRecord(){
    $("aim").innerHTML="<b>Aim:</b> "+EXP.aim;
    $("steps").innerHTML=EXP.steps.map((s,i)=>`<li class="${i===0?"now":""}">${s}</li>`).join("");
    $("obs").innerHTML='<li class="empty">Your observations will appear here.</li>';
    $("concl").hidden=true;
  }
  function useScene(k){
    ["P","N"].forEach(x=>{const g=$("sc"+x);if(!g)return;
      if(x===k){g.style.display="";g.setAttribute("opacity",1);}else{g.style.display="none";g.setAttribute("opacity",0);}});
  }

  // ======================= resets =======================
  let pLevel=452,blobs=[],pAnim=0,pMode="",nFl=null,nSt=null,nSpeckT=0;
  function setLevel(y){pLevel=y;["pLiq","pTint"].forEach(id=>{$(id).setAttribute("y",y.toFixed(1));$(id).setAttribute("height",(472-y).toFixed(1));});
    $("pSurf").setAttribute("cy",y.toFixed(1));setOp($("pSurf"),y<448?.55:0);}
  function resetP(){blobs=[];$("pSwirl").innerHTML="";$("pDyn").innerHTML="";setLevel(452);setOp($("pTint"),0);$("pSet").setAttribute("y",452);$("pSet").setAttribute("height",0);
    $("pTint").setAttribute("fill","#FACC15");pMode="";setOp($("pBoard"),0);}
  function resetN(){if(nFl){nFl.stop();nFl=null;}if(nSt){nSt.stop();nSt=null;}$("nFlame").innerHTML="";setOp($("nFlame"),0);$("nDyn").innerHTML="";$("nSpecks").innerHTML="";
    setOp($("nPow"),0);$("nPow").setAttribute("fill","#F8FAFC");$("nGas").setAttribute("y",380);$("nGas").setAttribute("height",0);setOp($("nBoard"),0);}
  const RESET={P:resetP,N:resetN,Z:()=>{}};
  // ======================= drawing helpers =======================
  const AMB="#F59E0B",RED="#DC2626",PUR="#7C3AED";
  const ln=(g,x1,y1,x2,y2,o)=>mk("line",Object.assign({x1,y1,x2,y2,stroke:AMB,"stroke-width":3.2,"stroke-linecap":"round"},o||{}),g);
  const dash=(g,x1,y1,x2,y2,c)=>ln(g,x1,y1,x2,y2,{"stroke-dasharray":"7 6",stroke:c||AMB,"stroke-width":2.6,opacity:.9});
  function arrowOn(g,x1,y1,x2,y2,c){const mx=(x1+x2)/2,my=(y1+y2)/2,a=Math.atan2(y2-y1,x2-x1),cs=Math.cos(a),sn=Math.sin(a);
    mk("path",{d:`M${mx+9*cs} ${my+9*sn} L${mx-7*cs+6*sn} ${my-7*sn-6*cs} L${mx-7*cs-6*sn} ${my-7*sn+6*cs}Z`,fill:c||AMB},g);}
  function ray(g,x1,y1,x2,y2,c){ln(g,x1,y1,x2,y2,c?{stroke:c}:null);arrowOn(g,x1,y1,x2,y2,c);}
  function wbeam(g,x1,y1,x2,y2,w){ln(g,x1,y1,x2,y2,{stroke:"#94A3B8","stroke-width":(w||6)+4});ln(g,x1,y1,x2,y2,{stroke:"#FFFFFF","stroke-width":w||6});}
  function txt(g,x,y,t,o){const e=mk("text",Object.assign({x,y,class:"lblD","text-anchor":"middle"},o||{}),g);e.textContent=t;return e;}
  function board(p,t1,t2,tone){const r=$(p+"BR"),W=r?+r.getAttribute("width")-24:400;
    [[p+"B1",t1,19],[p+"B2",t2||" ",16]].forEach(([id,t,fs])=>{const e=$(id);e.textContent=t;e.style.fontSize=fs+"px";
      try{let k=0;while(e.getComputedTextLength()>W&&fs>11&&k<20){fs-=1;e.style.fontSize=fs+"px";k++;}}catch(x){}});
    if(r)r.setAttribute("stroke",tone==="ok"?"#16A34A":tone==="bad"?"#DC2626":"#CBD5E1");if(r)r.setAttribute("stroke-width",tone?5:3);setOp($(p+"Board"),1);}
  async function fadeIn(G,ms){setOp(G,0);await tween(RM?60:ms||600,t=>setOp(G,t));}
  const tell=t=>Say.say(t);
  const unit=v=>{const L=Math.hypot(v[0],v[1]);return [v[0]/L,v[1]/L];};
  const along=(p,d,k)=>[p[0]+d[0]*k,p[1]+d[1]*k];

  const ZIG=(g,x1,x2,y,c)=>{const n=6,w=(x2-x1)/n;let d=`M${x1} ${y}`;for(let k=0;k<n;k++)d+=` L${(x1+w*(k+.5)).toFixed(1)} ${y+(k%2?12:-12)}`;d+=` L${x2} ${y}`;
    return mk("path",{d,fill:"none",stroke:c||"#B45309","stroke-width":4,"stroke-linejoin":"round"},g);};
  const W=(g,d,id)=>mk("path",Object.assign({d,fill:"none",stroke:"var(--muted)","stroke-width":4,"stroke-linejoin":"round","stroke-linecap":"round"},id?{id}:{}),g);
  const T=(g,x,y,s,c,fs,anc)=>{const e=mk("text",{x,y,"text-anchor":anc||"middle",style:`font:700 ${fs||14}px 'Baloo 2',sans-serif;fill:${c||"var(--ink)"}`},g);e.textContent=s;return e;};
  async function count(id,from,to,dp,unit,ms){await tween(RM?60:ms||700,t=>$(id).textContent=(from+(to-from)*t).toFixed(dp)+" "+unit);}
  const num=id=>parseFloat($(id).textContent)||0;

  // ======================= camera zoom =======================
  async function zoomTo(box,ms){const v=svg.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    await tween(RM?60:ms||1100,t=>{const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;svg.setAttribute("viewBox",v.map((a,i)=>(a+(box[i]-a)*e).toFixed(1)).join(" "));});}
  async function zoomBack(ms){const v=svg.getAttribute("viewBox").split(/[ ,]+/).map(Number);fitView();const w=svg.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    svg.setAttribute("viewBox",v.join(" "));await zoomTo(w,ms||900);fitView();}
  // ======================= P: yellow precipitate =======================
  function addBlob(x,y,big){const c=mk("circle",{cx:x,cy:y,r:2,fill:"url(#g3Yel)"},$("pSwirl"));
    blobs.push({c,x,y,r:2,r1:(big?9:6)+Math.random()*(big?9:6),age:0,ph:Math.random()*6.28,op:0,sink:0});}
  function pLoop(t0){let last=performance.now();pMode=pMode||"swirl";
    const step=now=>{if(!$("pSwirl").isConnected||!blobs.length&&pMode!=="settle"){pAnim=0;return;}
      const dt=Math.min(.05,(now-last)/1000);last=now;const T=now/1000;let sett=+$("pSet").getAttribute("height");
      for(let i=blobs.length-1;i>=0;i--){const b=blobs[i];b.age+=dt;
        const calm=pMode==="settle"?.25:1;
        const u=Math.sin(b.y*.07+T*1.9+b.ph)*26*calm+Math.sin(T*.8+b.ph*2)*10*calm,v=Math.cos(b.x*.09+T*1.4+b.ph)*24*calm+(pMode==="settle"?34:4);
        b.x=Math.max(326,Math.min(374,b.x+u*dt));b.y=Math.max(pLevel+4,Math.min(452-sett,b.y+v*dt));
        b.r+=(b.r1-b.r)*Math.min(1,dt*1.6);b.op=Math.min(1,b.op+dt*1.5);
        if(pMode==="settle"&&b.y>=452-sett-2){b.op-=dt*1.6;if(b.op<=0){b.c.remove();blobs.splice(i,1);sett=Math.min(26,sett+.45);continue;}}
        b.c.setAttribute("cx",b.x.toFixed(1));b.c.setAttribute("cy",b.y.toFixed(1));b.c.setAttribute("r",b.r.toFixed(1));b.c.setAttribute("opacity",b.op.toFixed(2));}
      if(pMode==="settle"){$("pSet").setAttribute("height",sett.toFixed(1));$("pSet").setAttribute("y",(452-sett+2).toFixed(1));}
      pAnim=requestAnimationFrame(step);};
    if(!pAnim)pAnim=requestAnimationFrame(step);}
  function dropper(){const g=mk("g",{},$("pDyn"));
    mk("rect",{x:343,y:146,width:14,height:62,rx:3,fill:"rgba(255,255,255,.85)",stroke:"#94A3B8","stroke-width":2},g);
    mk("path",{d:"M343 206 L350 222 L357 206Z",fill:"rgba(255,255,255,.85)",stroke:"#94A3B8","stroke-width":2},g);
    mk("rect",{x:345,y:170,width:10,height:36,fill:"rgba(219,234,254,.9)"},g);mk("ellipse",{cx:350,cy:142,rx:12,ry:11,fill:"#DC2626"},g);return g;}
  async function drops(n,big){const D=dropper();await fadeIn(D,400);
    for(let k=0;k<n;k++){const d=mk("ellipse",{cx:350,cy:224,rx:3.5,ry:5,fill:"rgba(191,219,254,.95)",stroke:"#93C5FD"},$("pDyn"));
      await tween(RM?40:380,t=>d.setAttribute("cy",(224+(pLevel-224)*t*t).toFixed(1)));d.remove();try{Snd.clink();}catch(e){}
      for(let j=0;j<(big?9:6);j++)addBlob(344+Math.random()*12,pLevel+4+Math.random()*6,big);pLoop();
      await wait(RM?60:big?260:420);}
    await tween(RM?60:400,t=>setOp(D,1-t));D.remove();}
  async function P_pour(){await hideItem("pPb");const g=mk("g",{},$("pDyn"));
    const B=mk("g",{transform:"translate(420 150) rotate(-60)"},g);mk("rect",{x:-28,y:-26,width:56,height:52,rx:8,fill:"rgba(219,234,254,.85)",stroke:"#94A3B8","stroke-width":2.5},B);mk("rect",{x:-28,y:-36,width:22,height:12,rx:3,fill:"#E2E8F0",stroke:"#94A3B8"},B);
    await fadeIn(g,400);const st=mk("path",{d:"M372 182 Q356 196 352 236 L352 236",stroke:"rgba(191,219,254,.95)","stroke-width":5,fill:"none","stroke-linecap":"round"},g);
    await tween(RM?80:1600,t=>{setLevel(452-122*t);st.setAttribute("d",`M372 182 Q356 196 352 236 L352 ${(236+(pLevel-236)*Math.min(1,t*3)).toFixed(1)}`);});
    await tween(RM?60:400,t=>setOp(g,1-t));g.remove();
    board("p","Colourless lead nitrate solution","About 2 mL in the test tube");
    obs("About 2 mL of lead nitrate solution was taken in a test tube. It is colourless.");}
  async function P_drops(){zoomTo([214,176,272,300],1200);await drops(3,false);await tween(RM?60:900,t=>setOp($("pTint"),.25*t));await wait(RM?60:1200);await zoomBack(900);
    board("p","A yellow cloud appears!","Each drop makes a bright yellow solid","ok");
    obs("As soon as potassium iodide drops were added, a bright yellow cloud formed and swirled in the liquid.");}
  async function P_more(){zoomTo([214,176,272,300],1000);await drops(6,true);await tween(RM?60:900,t=>setOp($("pTint"),.25+.3*t));await wait(RM?60:1200);await zoomBack(900);
    board("p","The whole liquid turns yellow","A yellow precipitate forms","ok");
    obs("With more potassium iodide, the whole liquid became thick and yellow.");}
  async function P_stand(){pMode="settle";pLoop();await zoomTo([200,190,300,290],900);
    await tween(RM?100:5200,t=>{setOp($("pTint"),.55-.45*t);$("pTint").setAttribute("fill",t>.5?"#FEF9C3":"#FACC15");});
    blobs.slice().forEach(b=>{b.c.remove();});blobs=[];$("pSet").setAttribute("height",26);$("pSet").setAttribute("y",428);
    await zoomBack(900);board("p","Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃","The yellow lead iodide settled at the bottom","ok");
    obs("On standing, the yellow solid (lead iodide) slowly settled at the bottom. The liquid above became almost clear.");}
  // ======================= N: heating lead nitrate =======================
  async function N_powder(){await hideItem("nPb");const g=mk("g",{},$("nDyn"));
    const sp=mk("g",{},g);mk("rect",{x:300,y:186,width:110,height:7,rx:3,fill:"#94A3B8",transform:"rotate(28 350 190)"},sp);mk("path",{d:"M332 176 Q345 168 358 178 Z",fill:"#FFFFFF",stroke:"#CBD5E1"},sp);
    await fadeIn(g,400);await tween(RM?60:900,t=>setOp($("nPow"),t));await tween(RM?60:300,t=>setOp(g,1-t));g.remove();
    board("n","White lead nitrate powder","About 2 g in a boiling tube");
    obs("About 2 g of white lead nitrate powder was taken in a boiling tube.");}
  function speck(){const s=mk("circle",{cx:333+Math.random()*34,cy:372,r:1.6+Math.random()*1.6,fill:"#FFFFFF",stroke:"#CBD5E1","stroke-width":.6},$("nSpecks"));
    const vx=(Math.random()-.5)*60,vy=-90-Math.random()*90;let x=+s.getAttribute("cx"),y=372,t0=performance.now();
    const f=now=>{const t=(now-t0)/1000;if(t>.9||!s.isConnected){s.remove();return;}s.setAttribute("cx",(x+vx*t).toFixed(1));s.setAttribute("cy",Math.min(376,y+vy*t+220*t*t).toFixed(1));requestAnimationFrame(f);};requestAnimationFrame(f);}
  async function N_heat(){const f=$("nFlame");if(!nFl)nFl=FXP.flame(f,350,438,{type:"burner",w:15,h:64});await tween(RM?60:400,t=>setOp(f,t));
    zoomTo([226,150,250,300],1300);
    for(let k=0;k<(RM?3:16);k++){speck();if(k%3===0)try{Snd.strike();}catch(e){}await wait(RM?40:130);}

    await tween(RM?100:2000,t=>{const h=150*t;$("nGas").setAttribute("y",(380-h).toFixed(1));$("nGas").setAttribute("height",h.toFixed(1));});
    nSt=FXP.stream($("nDyn"),350,200,{color:"brown",size:22,rise:130,drift:30,wind:150,w:24,every:.14,life:2.6});
    await wait(RM?100:1600);await zoomBack(900);
    board("n","Brown fumes come out!","Nitrogen dioxide (NO₂) gas","ok");
    obs("On heating, the powder crackled and brown fumes came out of the boiling tube.");}
  async function N_look(){await zoomTo([250,250,200,170],1000);
    await tween(RM?80:1600,t=>{const c=[[248,250,252],[250,204,21]].reduce((a,b)=>a.map((v,i)=>v+(b[i]-v)*t));$("nPow").setAttribute("fill",`rgb(${c.map(v=>v|0).join(",")})`);});
    await wait(RM?60:900);await zoomBack(800);
    board("n","A yellow solid is left behind","This is lead oxide (PbO)","ok");
    obs("The white powder changed into a yellow solid. This residue is lead oxide.");}
  async function N_off(){if(nSt){nSt.stop();nSt=null;}await tween(RM?60:500,t=>setOp($("nFlame"),1-t));
    await tween(RM?80:2200,t=>setOp($("nGas"),1-t));$("nGas").setAttribute("height",0);setOp($("nGas"),1);
    board("n","2Pb(NO₃)₂ → 2PbO + 4NO₂ + O₂","Heat broke one compound into three substances","ok");
    obs("The burner was turned off. The brown fumes slowly stopped. Products: lead oxide, nitrogen dioxide and oxygen.");}

  const ACTS={
    Z:[],
    P:[{keys:["pb"],fn:P_pour,cue:"pPb"},{keys:["ki"],fn:P_drops,cue:"pKI"},{keys:["ki"],fn:P_more,cue:"pKI"},{keys:["tube"],fn:P_stand,cue:"pTube"}],
    N:[{keys:["powder"],fn:N_powder,cue:"nPb"},{keys:["burner"],fn:N_heat,cue:"nBurner"},{keys:["tube"],fn:N_look,cue:"nTube"},{keys:["burner"],fn:N_off,cue:"nBurner"}]
  };

  async function act(key){
    if(!EXP||done||busy)return;
    const cur=ACTS[EXP.key][step];if(!cur)return;
    if(cur.bad&&cur.bad[key]){busy=true;clearHalos();
      try{await cur.bad[key]();}catch(e){if(e!=="reset")console.error(e);}
      busy=false;if(EXP&&!done)cue();return;}
    if(!cur.keys.includes(key)){wrong();return;}
    busy=true;clearHalos();
    try{await cur.fn();step++;markStep();
      if(step>=ACTS[EXP.key].length)finish();else{setTask();setPill();cue();}
    }catch(e){if(e!=="reset")console.error(e);}
    busy=false;
  }
  function wrong(){say("Not yet — "+EXP.stepTasks[step]);Snd.bad&&Snd.bad();}
  function cue(){clearHalos();const c=ACTS[EXP.key][step];if(c)[].concat(c.cue).forEach(id=>halo($(id)));}

  // ======================= finish, result, quiz =======================
  function finish(){
    done=true;setPill();clearHalos();
    $("tt").textContent="Experiment complete. Read your lab record, then check yourself.";$("tn").textContent="✓";
    $("chk").hidden=false;
    $("cw1").textContent=EXP.conc.w1;$("ceq").textContent=EXP.conc.eq;$("cw2").textContent=EXP.conc.w2;
    $("concl").hidden=false;markStep();fitText($("ceq"));
    const g0=gen;setTimeout(()=>{if(g0===gen&&done&&$("ov").hidden)resultCard();},RM?600:5000);
  }
  function resultCard(){
    const c=$("card");c.className="card res resc";
    c.innerHTML=`<span class="tag">${EXP.tag}</span>
      <h2>🎉 Experiment complete!</h2>
      <div class="eqbig">${EXP.conc.eq}</div>
      <p>${EXP.conc.w1}</p><p class="sub">${EXP.conc.w2}</p>
      <div class="row"><button class="next big" id="toQuiz">📝 Check yourself</button>
      <button class="next ghost" id="again">↺ Do it again</button>
      <button class="next ghost" id="other">⇄ Other experiment</button></div>`;
    $("ov").hidden=false;fitText(c.querySelector(".eqbig"));
    celebrate();Snd.fan&&Snd.fan();Say.say(EXP.conc.w1);
    $("toQuiz").onclick=startQuiz;$("again").onclick=()=>begin(EXP);$("other").onclick=chooser;
  }
  let qi=0,qScore=0;
  function startQuiz(){qi=0;qScore=0;askQ();}
  function askQ(){
    if(qi>=EXP.quiz.length){quizEnd();return;}
    const it=EXP.quiz[qi],opts=shuffle([it.a,...it.t]);
    const c=$("card");c.className="card";
    c.innerHTML=`<span class="tag">Question ${qi+1} of ${EXP.quiz.length}</span><h2>${it.q}</h2><div class="opts" id="qo"></div><div class="why" id="why" hidden></div>`;
    const box=$("qo");
    opts.forEach(o=>{const b=document.createElement("button");b.className="btn";b.type="button";b.textContent=o;
      b.onclick=()=>{if(box.dataset.done)return;box.dataset.done="1";const ok=o===it.a;
        [...box.children].forEach(x=>{x.disabled=true;if(x.textContent===it.a)x.classList.add("ok");else if(x===b)x.classList.add("bad");});
        if(ok){qScore++;Snd.ok&&Snd.ok();}
        const w=$("why");w.hidden=false;
        w.innerHTML=`<b>${ok?"✔ Correct.":"✘ Not quite."}</b> ${it.w} <button class="next" id="nq">${qi+1<EXP.quiz.length?"Next ▸":"See my score"}</button>`;
        $("nq").onclick=()=>{qi++;askQ();};};
      box.appendChild(b);});
    $("ov").hidden=false;
  }
  function quizEnd(){
    const good=qScore>=4,c=$("card");c.className="card res";
    c.innerHTML=`<h2>🌟 You scored ${qScore} / ${EXP.quiz.length}</h2>
      <p>${good?"Great work! You understand this experiment.":"Good try. Read your lab record once more and try again."}</p>
      <div class="row"><button class="next big" id="rq">↺ Try the questions again</button><button class="next ghost" id="other2">⇄ Other experiment</button></div>`;
    if(good){celebrate();Snd.fan&&Snd.fan();}
    $("rq").onclick=startQuiz;$("other2").onclick=chooser;
  }

  // ======================= chooser, intro, begin =======================
  function chooser(){
    gen++;busy=false;Snd.fizzStop&&Snd.fizzStop();
    const c=$("card");c.className="card";
    c.innerHTML=`<h2>🔬 Choose an experiment</h2><p class="sub">Chapter 1 — Chemical Reactions and Equations. Tap a card to begin.</p>
      <div class="pickwrap"><div class="exps">${EXPS.map(e=>`<button class="exp" type="button" data-k="${e.key}" id="pick${e.key}"><span class="ic">${e.ic}</span><span class="tg">${e.tag}</span><b>${e.name}</b><small>${e.blurb}</small></button>`).join("")}</div></div>`;
    $("ov").hidden=false;
    c.querySelectorAll(".exp").forEach(b=>b.onclick=()=>intro(BYKEY[b.dataset.k]));
  }
  function intro(E){
    const c=$("card");c.className="card";
    c.innerHTML=`<span class="tag">${E.tag}</span><h2>${E.name}</h2><p class="sub"><b>Aim:</b> ${E.aim}</p><p>${E.intro}</p>
      <p class="safe">${E.safe}</p>
      <div class="row"><button class="next big" id="go">▶ Start experiment</button><button class="next ghost" id="back">◂ Back</button></div>`;
    $("ov").hidden=false;$("go").onclick=()=>begin(E);$("back").onclick=chooser;
  }
  function begin(E){
    gen++;busy=false;Snd.fizzStop&&Snd.fizzStop();
    if(E.link){location.href=E.link;return;}EXP=E;step=0;done=false;useScene(E.key);RESET[E.key]();fitView();
    $("hsub").textContent=E.sub;buildRecord();setTask();setPill();markStep();
    $("chk").hidden=true;$("ov").hidden=true;cue();Say.say(E.stepTasks[0]);
    if(innerHeight>innerWidth&&innerWidth<700)setTimeout(()=>say("Tip: turn your phone sideways for a bigger view.",3600),400);
  }

  // ======================= wiring =======================
  svg.addEventListener("click",e=>{const g=e.target.closest("[data-t]");if(g)act(g.dataset.t);});
  svg.addEventListener("keydown",e=>{if(e.key!=="Enter"&&e.key!==" ")return;const g=e.target.closest("[data-t]");if(g){e.preventDefault();act(g.dataset.t);}});
  $("chk").onclick=startQuiz;
  $("rst").onclick=()=>{if(EXP)begin(EXP);else chooser();};
  $("swap").onclick=chooser;

  function celebrate(){return;/*no confetti in labs*/
    const box=document.createElement("div");box.className="cf";
    const cols=["#F97316","#2563EB","#DB2777","#16A34A","#FACC15","#7C3AED","#DC2626","#0D9488"];
    for(let k=0;k<80;k++){const p=document.createElement("i"),w=14+Math.random()*12;
      p.style.left=(Math.random()*100)+"%";p.style.width=w+"px";p.style.height=(w*(Math.random()<.5?1:1.8))+"px";p.style.background=cols[k%cols.length];
      p.style.setProperty("--d",(4+Math.random()*1.5).toFixed(2)+"s");p.style.setProperty("--dl",(Math.random()*1.2).toFixed(2)+"s");
      p.style.setProperty("--sx",((Math.random()-.5)*10).toFixed(1)+"vw");p.style.setProperty("--r",((Math.random()<.5?-1:1)*(360+Math.random()*540)|0)+"deg");
      box.appendChild(p);}
    document.body.appendChild(box);setTimeout(()=>box.remove(),7000);
  }
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function fitView(){const r=$("scene").getBoundingClientRect();const tall=r.height/r.width>1.05;svg.setAttribute("viewBox",tall?"14 140 680 440":"0 86 700 534");}
  addEventListener("resize",()=>{fitView();fitText($("ceq"));});fitView();
  chooser();
})();
