/* Lesson 3: Metals and Non-metals — lab.html (Digital Lab) logic.
   This lab is a bespoke SVG rig (rusting of iron / nail in copper sulphate),
   not shared with other lessons' labs, so its full engine (sound,
   voice-over, animation, drag/tap input, the end quiz) and content live
   together in this one file. */
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
      v=vs.find(x=>/en[-_]IN/i.test(x.lang))||vs.find(x=>/google/i.test(x.name)&&/en[-_](GB|US)/i.test(x.lang))||vs.find(x=>/en[-_](GB|US)/i.test(x.lang))||vs[0]||null;}
    if(ss){pick();try{ss.addEventListener("voiceschanged",pick);}catch(e){ss.onvoiceschanged=pick;}}
    function stop(){if(ss)ss.cancel();Snd.duck(false);}
    function say(text,queue){
      if(!ss||!on||!text)return;if(!queue)ss.cancel();
      text.split(/(?<=[.!?])\s+/).forEach(s=>{if(!s.trim())return;
        const u=new SpeechSynthesisUtterance(s);u.lang=v?v.lang:"en-IN";if(v)u.voice=v;u.rate=.9;u.pitch=1.05;
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

  // ======================= shared helpers =======================
  const $$=s=>Array.from(document.querySelectorAll(s));
  const show=(el,v)=>{el.style.display=v?"":"none";el.style.opacity=v?1:0;};
  const setOp=(el,v)=>{if(el)el.setAttribute("opacity",v);};
  const toast=$("toast");
  let toastT=null;
  function say(t,ms=2200){toast.textContent=t;toast.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>toast.classList.remove("on"),ms);}
  function obs(t){
    const ul=$("obs"),e=ul.querySelector(".empty");if(e)e.remove();
    const li=document.createElement("li");li.textContent=t;li.className="new";ul.appendChild(li);
    setTimeout(()=>li.classList.remove("new"),900);
  }
  function halo(el){if(!el)return;el.classList.add("cueG");}
  function unhalo(el){if(el)el.classList.remove("cueG");}
  function clearHalos(){$$(".cueG").forEach(e=>e.classList.remove("cueG"));}

  // ======================= experiment A : rusting =======================
  const EXP_A={
    key:"A",
    name:"Rusting of iron",
    sub:"Rusting of iron",
    tag:"📘 Activity 3.14",
    aim:"To show that both air and water are needed for iron to rust.",
    steps:["Put a nail in each tube","Tube A: ordinary water","Tube B: boiled water + oil","Tube C: dry air + CaCl₂","Wait for a few days"],
    stepTasks:[
      "Tap the iron nails. One nail goes into each of the three test tubes.",
      "Tap the water jug. Pour ordinary water into tube A and leave it open.",
      "Tap the boiled water. Pour it into tube B and cover it with a layer of oil.",
      "Tap the CaCl₂ jar. Put it in tube C to keep the air dry, then cork it.",
      "Tap any tube to let the days pass and watch what happens."
    ],
    conc:{w1:"Iron rusts only when air and water are both present.",
          eq:"Iron + Water + Oxygen → Rust",
          w2:"In B there was no air, in C there was no water. So no rust formed. Rust is hydrated iron oxide."},
    quiz:[
      {q:"In which test tube did the nail rust?",a:"Tube A",t:["Tube B","Tube C","All three"],w:"Only tube A had both air and water."},
      {q:"Why was oil poured on the boiled water in tube B?",a:"To stop air dissolving in the water",t:["To make the water hot","To make the nail shine","To kill germs"],w:"Boiling removes dissolved air, and the oil layer stops new air getting in."},
      {q:"Why was anhydrous calcium chloride kept in tube C?",a:"It absorbs moisture and keeps the air dry",t:["It gives out oxygen","It makes the nail rust faster","It cools the tube"],w:"CaCl₂ takes away the water vapour, so the air in tube C stays dry."},
      {q:"What does this experiment prove?",a:"Both air and water are needed for rusting",t:["Only air is needed","Only water is needed","Neither is needed"],w:"Rust formed only where air and water were both present."},
      {q:"Rusting of iron is an example of",a:"Corrosion",t:["Galvanisation","Reduction","Calcination"],w:"When a metal is slowly eaten away by air and moisture, it is called corrosion."}
    ]
  };

  // ======================= experiment B : displacement =======================
  const EXP_B={
    key:"B",
    name:"Nail in copper sulphate",
    sub:"Iron nail in CuSO₄",
    tag:"📘 Activity 3.12",
    aim:"To find out how metals react with solutions of other metal salts.",
    steps:["Iron nail into CuSO₄","Copper wire into FeSO₄","Wait about 20 minutes","Compare the two"],
    stepTasks:[
      "Tap the iron nail. Put it into the blue copper sulphate solution.",
      "Tap the copper wire. Put it into the pale green iron sulphate solution.",
      "Tap either beaker to let about 20 minutes pass.",
      "Tap the beakers to compare what happened in each one."
    ],
    conc:{w1:"Iron is more reactive than copper, so iron displaces copper.",
          eq:"Fe + CuSO₄ → FeSO₄ + Cu",
          w2:"Copper cannot displace iron, so nothing happened in the other beaker."},
    quiz:[
      {q:"What forms on the iron nail kept in copper sulphate solution?",a:"A brown coating of copper",t:["A white powder","A black coating","Nothing at all"],w:"Iron pushes copper out of the solution, and that copper settles on the nail."},
      {q:"What happens to the blue colour of the copper sulphate solution?",a:"It fades to pale green",t:["It turns deep blue","It turns colourless","It turns red"],w:"Blue Cu²⁺ ions are replaced by pale green Fe²⁺ ions."},
      {q:"What happened to the copper wire in iron sulphate solution?",a:"No change at all",t:["It turned black","Iron coated the wire","The solution turned blue"],w:"Copper is less reactive than iron, so it cannot displace iron."},
      {q:"Fe + CuSO₄ → FeSO₄ + Cu. What type of reaction is this?",a:"Displacement reaction",t:["Combination reaction","Decomposition reaction","Double displacement"],w:"A more reactive metal displaces a less reactive metal from its salt solution."},
      {q:"Which metal is more reactive?",a:"Iron",t:["Copper","Both are equal","Neither reacts"],w:"Iron displaced copper, so iron is placed above copper in the reactivity series."}
    ]
  };

  // ======================= state =======================
  let EXP=null, step=0, done=false, day=0, mins=0;

  function setPill(){
    const n=EXP?EXP.stepTasks.length:0;
    $("pill").textContent = done ? "Done ✓" : `Step ${Math.min(step+1,n)} / ${n}`;
  }
  function setTask(){
    if(done)return;
    $("tn").textContent=step+1;
    $("tt").textContent=EXP.stepTasks[step];
  }
  function markStep(){
    const lis=$$("#steps li");
    lis.forEach((li,i)=>{li.className = i<step ? "ok" : (i===step ? "now" : "");});
  }
  function buildRecord(){
    $("aim").innerHTML="<b>Aim:</b> "+EXP.aim;
    $("steps").innerHTML=EXP.steps.map((s,i)=>`<li class="${i===0?"now":""}">${s}</li>`).join("");
    $("obs").innerHTML='<li class="empty">Your observations will appear here.</li>';
    $("concl").hidden=true;
  }

  // ======================= scene switching =======================
  function useScene(k){
    const A=$("scA"),B=$("scB");
    if(k==="A"){A.style.display="";A.setAttribute("opacity",1);B.style.display="none";B.setAttribute("opacity",0);}
    else{B.style.display="";B.setAttribute("opacity",1);A.style.display="none";A.setAttribute("opacity",0);}
  }

  function resetA(){
    day=0;$("dayTx").textContent="Day 0";setOp($("dayBox"),0);
    ["aWater","aNail","aRust","bWater","bOil","bNail","bCork","cCaCl","cNail","cCork"].forEach(id=>setOp($(id),0));
    ["jugW","jugB","jarC","nailBox"].forEach(id=>{const e=$(id);if(e){e.style.display="";setOp(e,1);}});
    $("bub").innerHTML="";
  }
  function resetB(){
    mins=0;$("clockTx").textContent="0 minutes";setOp($("clockB"),0);
    ["LNail","LCoat","RWire"].forEach(id=>setOp($(id),0));
    $("LSol").setAttribute("fill","url(#gBlue)");
    $("LTx").textContent="Blue";$("RTx").textContent="Pale green";
    ["nailB","wireB"].forEach(id=>{const e=$(id);if(e){e.style.display="";setOp(e,1);}});
    $("bub2").innerHTML="";
  }

  // ======================= step actions : A =======================
  async function A_nails(){
    const box=$("nailBox");
    await tween(420,t=>setOp(box,1-t));
    box.style.display="none";
    for(const id of ["aNail","bNail","cNail"]){
      const el=$(id);
      await tween(260,t=>{setOp(el,t);el.setAttribute("transform",`translate(0,${lerp(-70,0,t)})`);},easeOut);
    }
    Snd.ok&&Snd.ok();
    obs("One clean iron nail was placed in each of the three test tubes.");
    say("A nail in every tube.");
  }
  async function A_water(){
    const j=$("jugW");
    await tween(380,t=>setOp(j,1-t)); j.style.display="none";
    const w=$("aWater");
    Snd.pour&&Snd.pour(.8);
    await tween(700,t=>setOp(w,t));
    obs("Tube A: ordinary water was added and the tube was left open to the air.");
    say("Tube A has air and water.");
  }
  async function A_boiled(){
    const j=$("jugB");
    await tween(380,t=>setOp(j,1-t)); j.style.display="none";
    Snd.pour&&Snd.pour(.7);
    await tween(600,t=>setOp($("bWater"),t));
    await wait(160);
    await tween(500,t=>setOp($("bOil"),t));
    await tween(300,t=>setOp($("bCork"),t));
    obs("Tube B: boiled water was used, oil was poured on top and the tube was corked. No air can reach the nail.");
    say("Boiling removes the dissolved air. The oil keeps new air out.");
  }
  async function A_dry(){
    const j=$("jarC");
    await tween(380,t=>setOp(j,1-t)); j.style.display="none";
    Snd.pour&&Snd.pour(.6);
    await tween(600,t=>setOp($("cCaCl"),t));
    await tween(300,t=>setOp($("cCork"),t));
    obs("Tube C: anhydrous calcium chloride was put in and the tube was corked. The air inside stays dry.");
    say("CaCl₂ takes away the moisture.");
  }
  async function A_days(){
    setOp($("dayBox"),1);
    for(let d=1;d<=7;d++){
      day=d;$("dayTx").textContent="Day "+d;
      const rust=$("aRust");
      await tween(RM?80:420,t=>setOp(rust,(d-1+t)/7));
      await wait(RM?40:200);
    }
    obs("After a few days the nail in tube A was covered with brown rust.");
    obs("The nails in tubes B and C stayed clean and shiny.");
    say("Rust only in tube A!");
  }

  // ======================= step actions : B =======================
  async function B_nail(){
    const n=$("nailB");
    await tween(380,t=>setOp(n,1-t)); n.style.display="none";
    const el=$("LNail");
    await tween(520,t=>{setOp(el,t);el.setAttribute("transform",`translate(0,${lerp(-90,0,t)})`);},easeOut);
    obs("A clean iron nail was dipped in the blue copper sulphate solution.");
    say("Iron nail into CuSO₄.");
  }
  async function B_wire(){
    const w=$("wireB");
    await tween(380,t=>setOp(w,1-t)); w.style.display="none";
    const el=$("RWire");
    await tween(520,t=>{setOp(el,t);el.setAttribute("transform",`translate(0,${lerp(-90,0,t)})`);},easeOut);
    obs("A clean copper wire was dipped in the pale green iron sulphate solution.");
    say("Copper wire into FeSO₄.");
  }
  async function B_wait(){
    setOp($("clockB"),1);
    for(let m=5;m<=20;m+=5){
      mins=m;$("clockTx").textContent=m+" minutes";
      await tween(RM?80:460,t=>{
        setOp($("LCoat"),(m-5+t*5)/20);
        $("LSol").setAttribute("fill", (m>=15)?"url(#gPale)":"url(#gBlue)");
      });
      await wait(RM?40:180);
    }
    $("LSol").setAttribute("fill","url(#gPale)");
    $("LTx").textContent="Pale green now";
    obs("The iron nail became coated with brown copper.");
    obs("The blue solution slowly turned pale green.");
    obs("The copper wire showed no change, and the iron sulphate stayed pale green.");
    say("Iron pushed the copper out!");
  }
  async function B_compare(){
    halo($("bkL"));halo($("bkR"));
    await wait(900);
    clearHalos();
    obs("Iron displaced copper, but copper could not displace iron.");
    say("Iron is more reactive than copper.");
  }

  // ======================= step tables =======================
  const ACTS={
    A:[{keys:["nails"],fn:A_nails,cue:"nailBox"},
       {keys:["water"],fn:A_water,cue:"jugW"},
       {keys:["boiled"],fn:A_boiled,cue:"jugB"},
       {keys:["dry"],fn:A_dry,cue:"jarC"},
       {keys:["A","B","C"],fn:A_days,cue:"tA"}],
    B:[{keys:["nail"],fn:B_nail,cue:"nailB"},
       {keys:["wire"],fn:B_wire,cue:"wireB"},
       {keys:["L","R"],fn:B_wait,cue:"bkL"},
       {keys:["L","R"],fn:B_compare,cue:"bkL"}]
  };

  let busy=false;
  async function act(key){
    if(!EXP||done||busy)return;
    const cur=ACTS[EXP.key][step];
    if(!cur)return;
    if(!cur.keys.includes(key)){wrong(key);return;}
    busy=true;clearHalos();
    try{
      await cur.fn();
      step++;markStep();
      if(step>=ACTS[EXP.key].length){finish();}
      else{setTask();setPill();cue();}
    }catch(e){if(e!=="reset")console.error(e);}
    busy=false;
  }
  function wrong(key){
    say("Not yet — "+EXP.stepTasks[step]);
    Snd.bad&&Snd.bad();
  }
  function cue(){
    clearHalos();
    const cur=ACTS[EXP.key][step];
    if(cur)halo($(cur.cue));
  }

  // ======================= finish =======================
  function finish(){
    done=true;setPill();
    $("tt").textContent="Experiment complete. Read your lab record, then check yourself.";
    $("tn").textContent="✓";
    $("chk").hidden=false;
    clearHalos();
    $("cw1").textContent=EXP.conc.w1;
    $("ceq").textContent=EXP.conc.eq;
    $("cw2").textContent=EXP.conc.w2;
    $("concl").hidden=false;
    markStep();
    const g0=gen;setTimeout(()=>{if(g0===gen&&done&&$("ov").hidden)resultCard();},RM?600:5000);
  }

  function resultCard(){
    const c=$("card");
    c.className="card res resc";
    c.innerHTML=`<span class="tag">${EXP.tag}</span>
      <h2>🎉 Experiment complete!</h2>
      <div class="eqbig">${EXP.conc.eq}</div>
      <p>${EXP.conc.w1}</p>
      <p class="sub">${EXP.conc.w2}</p>
      <div class="row">
        <button class="next big" id="toQuiz">📝 Check yourself</button>
        <button class="next ghost" id="again">↺ Do it again</button>
        <button class="next ghost" id="other">⇄ Other experiment</button>
      </div>`;
    $("ov").hidden=false;
    celebrate();
    Snd.fan&&Snd.fan();
    Say.say(EXP.conc.w1+" "+EXP.conc.w2);
    $("toQuiz").onclick=()=>startQuiz();
    $("again").onclick=()=>begin(EXP);
    $("other").onclick=()=>chooser();
  }

  // ======================= quiz =======================
  let qi=0,qScore=0;
  function startQuiz(){
    qi=0;qScore=0;askQ();
  }
  function askQ(){
    if(qi>=EXP.quiz.length){quizEnd();return;}
    const it=EXP.quiz[qi];
    const opts=shuffle([it.a,...it.t]);
    $("card").className="card";$("card").innerHTML=`<span class="tag">Question ${qi+1} of ${EXP.quiz.length}</span>
      <h2>${it.q}</h2>
      <div class="opts" id="qo"></div>
      <div class="why" id="why" hidden></div>`;
    const box=$("qo");
    opts.forEach(o=>{
      const b=document.createElement("button");
      b.className="btn";b.type="button";b.textContent=o;
      b.onclick=()=>{
        if(box.dataset.done)return;box.dataset.done="1";
        const ok=o===it.a;
        Array.from(box.children).forEach(x=>{
          x.disabled=true;
          if(x.textContent===it.a)x.classList.add("ok");
          else if(x===b)x.classList.add("bad");
        });
        if(ok){qScore++;Snd.ok&&Snd.ok();}
        const w=$("why");w.hidden=false;
        w.innerHTML=`<b>${ok?"✔ Correct.":"✘ Not quite."}</b> ${it.w}
          <button class="next" id="nq">${qi+1<EXP.quiz.length?"Next ▸":"See my score"}</button>`;
        $("nq").onclick=()=>{qi++;askQ();};
      };
      box.appendChild(b);
    });
    $("ov").hidden=false;
  }
  function quizEnd(){
    const good=qScore>=4;
    $("card").className="card res";$("card").innerHTML=`<h2>🌟 You scored ${qScore} / ${EXP.quiz.length}</h2>
      <p>${good?"Great work! You understand this experiment.":"Good try. Read your lab record once more and try again."}</p>
      <div class="row">
        <button class="next big" id="rq">↺ Try the questions again</button>
        <button class="next ghost" id="other2">⇄ Other experiment</button>
      </div>`;
    if(good){celebrate();Snd.fan&&Snd.fan();}
    $("rq").onclick=()=>startQuiz();
    $("other2").onclick=()=>chooser();
  }

  // ======================= chooser and start =======================
  function chooser(){
    gen++;busy=false;
    $("card").className="card";$("card").innerHTML=`<h2>🔬 Choose an experiment</h2>
      <p class="sub">Chapter 3 — Metals and Non-metals. Tap a card to begin.</p>
      <div class="pickwrap"><div class="exps">
        <button class="exp" id="pickA" type="button"><span class="ic">🔩</span><span class="tg">📘 Activity 3.14</span><b>Rusting of iron</b><small>Three test tubes. Find out what iron really needs before it rusts.</small></button>
        <button class="exp" id="pickB" type="button"><span class="ic">🧪</span><span class="tg">📘 Activity 3.12</span><b>Nail in copper sulphate</b><small>An iron nail and a copper wire. Which metal is more reactive?</small></button>
      </div></div>`;
    $("ov").hidden=false;
    $("pickA").onclick=()=>intro(EXP_A);
    $("pickB").onclick=()=>intro(EXP_B);
  }

  function intro(E){
    const txt = E.key==="A"
      ? `You will take three test tubes. In <b>A</b> the nail sits in ordinary water, open to the air. In <b>B</b> the water is boiled to drive out the dissolved air, and a layer of oil keeps new air away. In <b>C</b> there is only dry air, because calcium chloride takes away the moisture. Then you wait a few days.`
      : `You will dip a clean <b>iron nail</b> in blue copper sulphate solution, and a clean <b>copper wire</b> in pale green iron sulphate solution. Then you wait about twenty minutes and compare the two.`;
    $("card").className="card";$("card").innerHTML=`<span class="tag">${E.tag}</span>
      <h2>${E.name}</h2>
      <p class="sub"><b>Aim:</b> ${E.aim}</p>
      <p>${txt}</p>
      <p class="safe">🥽 In a real lab, handle glassware carefully and do this only with your teacher.</p>
      <div class="row"><button class="next big" id="go">▶ Start experiment</button>
      <button class="next ghost" id="back">◂ Back</button></div>`;
    $("ov").hidden=false;
    $("go").onclick=()=>begin(E);
    $("back").onclick=()=>chooser();
  }

  function begin(E){
    gen++;busy=false;
    EXP=E;step=0;done=false;
    useScene(E.key);
    if(E.key==="A")resetA();else resetB();
    $("hsub").textContent=E.sub;
    buildRecord();
    setTask();setPill();markStep();
    $("chk").hidden=true;
    $("ov").hidden=true;
    cue();
    Say.say(E.stepTasks[0]);
  }

  // ======================= wiring =======================
  svg.addEventListener("click",e=>{
    const g=e.target.closest("[data-t]");
    if(g)act(g.dataset.t);
  });
  svg.addEventListener("keydown",e=>{
    if(e.key!=="Enter"&&e.key!==" ")return;
    const g=e.target.closest("[data-t]");
    if(g){e.preventDefault();act(g.dataset.t);}
  });
  $("chk").onclick=()=>startQuiz();
  $("rst").onclick=()=>{if(EXP)begin(EXP);else chooser();};
  $("swap").onclick=()=>chooser();

  // confetti
  function celebrate(){
    const box=document.createElement("div");box.className="cf";
    const cols=["#F97316","#2563EB","#DB2777","#16A34A","#FACC15","#7C3AED","#DC2626","#0D9488"];
    for(let k=0;k<80;k++){
      const p=document.createElement("i"),w=14+Math.random()*12;
      p.style.left=(Math.random()*100)+"%";p.style.width=w+"px";p.style.height=(w*(Math.random()<.5?1:1.8))+"px";
      p.style.background=cols[k%cols.length];
      p.style.setProperty("--d",(4+Math.random()*1.5).toFixed(2)+"s");
      p.style.setProperty("--dl",(Math.random()*1.2).toFixed(2)+"s");
      p.style.setProperty("--sx",((Math.random()-.5)*10).toFixed(1)+"vw");
      p.style.setProperty("--r",((Math.random()<.5?-1:1)*(360+Math.random()*540)|0)+"deg");
      box.appendChild(p);
    }
    document.body.appendChild(box);setTimeout(()=>box.remove(),7000);
  }
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

  // responsive viewBox
  function fitView(){
    const r=$("scene").getBoundingClientRect();
    const tall=r.height/r.width>1.05;
    svg.setAttribute("viewBox",tall?"46 150 620 470":"0 86 700 534");
  }
  addEventListener("resize",fitView);
  fitView();

  chooser();
})();
