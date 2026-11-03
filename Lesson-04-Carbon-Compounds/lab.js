/* Lesson 4: Carbon and its Compounds — lab.html (Digital Lab) logic.
   This lab is a bespoke SVG rig with 4 selectable experiments (micelle
   formation, oxidation of ethanol, esterification, acid + carbonate), not
   shared with other lessons' labs, so its full engine (sound, voice-over,
   animation, drag/tap input, the end quiz for each experiment) and content
   live together in this one file. */
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
  {key:"M",ic:"🧼",tag:"📘 Section 4.5",name:"Micelle formation",sub:"Micelle formation",
   blurb:"Oil, water and soap. See how soap holds the oil.",
   intro:"You will take water in two test tubes, A and B, and add a drop of cooking oil to both. Only B gets soap. Then you shake both, leave them still, and look closely inside B.",
   safe:"🥽 In a real lab, close the test tube with your thumb or a cork before shaking.",
   aim:"To study the cleaning action of soap and the formation of micelles.",
   steps:["10 mL water in A and B","A drop of oil in both","Soap solution in B only","Shake both for the same time","Leave them undisturbed","Look inside B"],
   stepTasks:["Tap the water jug. Pour about 10 mL of water into each test tube.",
     "Tap the cooking oil. Add a drop of oil to both test tubes.",
     "Tap the soap solution. Add a few drops to test tube B only.",
     "Tap a test tube to shake both tubes for the same time.",
     "Tap a test tube to leave them undisturbed, and watch.",
     "Tap the magnifier to look inside test tube B."],
   conc:{w1:"In A the oil separated quickly. In B the soap kept the oil spread in the water.",
     eq:"Tail in oil + Head in water = Micelle",
     w2:"Soap micelles trap oily dirt in their centre, so water can wash it away."},
   quiz:[
    {q:"In which test tube did the oil layer separate first?",a:"Test tube A",t:["Test tube B","Both at the same time","Neither"],w:"Tube A had no soap, so the oil quickly floated back up as a layer."},
    {q:"Why did the oil stay mixed in water in test tube B?",a:"Soap formed micelles around the oil drops",t:["The oil dissolved in water","The water became hot","Soap made the oil heavy"],w:"Soap molecules surround each oil drop and keep it spread in the water."},
    {q:"Which end of a soap molecule faces the water?",a:"The ionic end (head)",t:["The carbon chain (tail)","Both ends","Neither end"],w:"The ionic end likes water, so it stays on the outside of the micelle."},
    {q:"Which part of a soap molecule goes into the oil?",a:"The carbon chain (tail)",t:["The ionic end (head)","The sodium ion","The water"],w:"The long carbon chain likes oil, so it points into the oil drop."},
    {q:"Oil drops spread out in water by soap form",a:"An emulsion",t:["A solution","A precipitate","A gas"],w:"The textbook says the micelles form an emulsion in water."}]},
  {key:"O",ic:"💜",tag:"📘 Section 4.3.2",name:"Oxidation of ethanol",sub:"Oxidation of ethanol",
   blurb:"Purple KMnO₄ disappears in warm ethanol.",
   intro:"You will warm about 3 mL of ethanol in a water bath, then add a 5% solution of alkaline potassium permanganate drop by drop. Watch what happens to the purple colour.",
   safe:"🥽 Ethanol catches fire easily. In a real lab, keep it away from flames and warm it only in a water bath.",
   aim:"To study the oxidation of ethanol by alkaline potassium permanganate.",
   steps:["3 mL ethanol in a test tube","Warm it in a water bath","Add alkaline KMnO₄ drop by drop","Add excess KMnO₄"],
   stepTasks:["Tap the ethanol. Take about 3 mL in the test tube.",
     "Tap the hot plate to warm the water bath gently.",
     "Tap the KMnO₄ dropper. Add alkaline potassium permanganate drop by drop.",
     "Tap the dropper again. Add more, until it is in excess."],
   conc:{w1:"At first the purple colour disappears, because KMnO₄ gives oxygen to ethanol.",
     eq:"CH₃CH₂OH → CH₃COOH",
     w2:"Once all the ethanol has become ethanoic acid, the extra purple colour stays. Alkaline KMnO₄ is an oxidising agent."},
   quiz:[
    {q:"What happens to the purple colour when KMnO₄ is first added to warm ethanol?",a:"It disappears",t:["It gets darker","It turns green","It turns red"],w:"The KMnO₄ is used up as it gives oxygen to the ethanol."},
    {q:"Why does the purple colour stay when excess KMnO₄ is added?",a:"All the ethanol has been oxidised",t:["The water bath is too hot","Ethanol turns purple","KMnO₄ stops working"],w:"There is no ethanol left to use up the extra KMnO₄."},
    {q:"Ethanol is oxidised to",a:"Ethanoic acid",t:["Ethene","Methanol","Ethyne"],w:"Oxidation turns ethanol into ethanoic acid."},
    {q:"Alkaline potassium permanganate acts as",a:"An oxidising agent",t:["A reducing agent","A catalyst","A dehydrating agent"],w:"It gives oxygen to ethanol, so it is an oxidising agent."},
    {q:"Why is ethanol warmed in a water bath and not on a flame?",a:"Ethanol catches fire easily",t:["Water makes it purple","A flame is too slow","Ethanol freezes"],w:"A water bath warms it gently and safely."}]},
  {key:"E",ic:"🍎",tag:"📘 Figure 4.11",name:"Esterification",sub:"Esterification",
   blurb:"Acid + alcohol give a sweet-smelling ester.",
   intro:"You will take 1 mL of absolute ethanol and 1 mL of glacial acetic acid with a few drops of concentrated sulphuric acid. Warm it in a water bath for at least five minutes, pour it into a beaker of water and smell it.",
   safe:"🥽 Concentrated sulphuric acid burns the skin. In a real lab, only your teacher handles it.",
   aim:"To prepare an ester from ethanol and ethanoic acid.",
   steps:["1 mL absolute ethanol","1 mL glacial acetic acid","A few drops of conc. H₂SO₄","Warm 5 minutes in a water bath","Pour into water","Smell the mixture"],
   stepTasks:["Tap the ethanol. Take 1 mL in the test tube.",
     "Tap the glacial acetic acid. Add 1 mL.",
     "Tap the sulphuric acid. Add a few drops of concentrated H₂SO₄.",
     "Tap the hot plate. Warm the tube in the water bath for at least five minutes.",
     "Tap the beaker. Pour the mixture into the water.",
     "Tap the beaker again and smell the mixture."],
   conc:{w1:"Ethanoic acid reacts with ethanol, with an acid catalyst, to give a sweet-smelling ester.",
     eq:"Acid + Alcohol → Ester + Water",
     w2:"CH₃COOH + CH₃CH₂OH → CH₃COOCH₂CH₃ + H₂O. This reaction is called esterification."},
   quiz:[
    {q:"Which two substances react to form the ester?",a:"Ethanoic acid and ethanol",t:["Ethanol and water","Sulphuric acid and water","Ethanoic acid and water"],w:"An acid and an alcohol together give an ester."},
    {q:"What is the job of the concentrated sulphuric acid?",a:"It acts as an acid catalyst",t:["It gives the smell","It is the ester","It cools the tube"],w:"The textbook says the reaction happens in the presence of an acid catalyst."},
    {q:"How does the ester smell?",a:"Sweet and fruity",t:["Like rotten eggs","Like vinegar","It has no smell"],w:"Esters are sweet-smelling substances."},
    {q:"Esters are used in making",a:"Perfumes and flavouring agents",t:["Fuels","Fertilisers","Medicines for fever"],w:"Their sweet smell makes them useful in perfumes and flavours."},
    {q:"The reaction of an acid with an alcohol to give an ester is called",a:"Esterification",t:["Saponification","Hydrogenation","Oxidation"],w:"Acid + alcohol → ester + water is esterification."}]},
  {key:"C",ic:"🫧",tag:"📘 Section 4.4.2",name:"Acid + carbonate",sub:"Ethanoic acid + carbonate",
   blurb:"The fizzing gas turns lime water milky.",
   intro:"Set up the apparatus as in Activity 2.5. You will add 2 mL of dilute ethanoic acid to a spatula full of sodium carbonate, pass the gas through fresh lime water, and then repeat with sodium hydrogencarbonate.",
   safe:"🥽 In a real lab, keep the delivery tube end inside the lime water.",
   aim:"To study the reaction of ethanoic acid with carbonates and hydrogencarbonates.",
   steps:["Na₂CO₃ in the test tube","Add 2 mL dilute ethanoic acid","Pass the gas through lime water","Repeat with NaHCO₃"],
   stepTasks:["Tap the sodium carbonate. Put a spatula full into the test tube.",
     "Tap the ethanoic acid. Add 2 mL of dilute ethanoic acid.",
     "Tap the lime water to pass the gas through it.",
     "Tap the sodium hydrogencarbonate to repeat the activity."],
   conc:{w1:"Ethanoic acid reacts with carbonates and hydrogencarbonates to give a salt, water and carbon dioxide.",
     eq:"2CH₃COOH + Na₂CO₃ → 2CH₃COONa + H₂O + CO₂",
     w2:"The gas turns lime water milky, so it is carbon dioxide. Sodium hydrogencarbonate gives the same result."},
   quiz:[
    {q:"What did you see when ethanoic acid was added to sodium carbonate?",a:"Brisk fizzing",t:["No change","A purple colour","A sweet smell"],w:"A gas is given off quickly, so the mixture fizzes."},
    {q:"Which gas is given off?",a:"Carbon dioxide",t:["Hydrogen","Oxygen","Chlorine"],w:"Acids react with carbonates to give carbon dioxide."},
    {q:"How was the gas identified?",a:"It turned lime water milky",t:["It burned with a pop","It turned litmus blue","It smelled sweet"],w:"Carbon dioxide turns lime water milky."},
    {q:"Which salt is formed with sodium carbonate?",a:"Sodium ethanoate",t:["Sodium chloride","Sodium hydroxide","Sodium sulphate"],w:"2CH₃COOH + Na₂CO₃ → 2CH₃COONa + H₂O + CO₂."},
    {q:"What happened with sodium hydrogencarbonate?",a:"The same fizzing, and lime water turned milky",t:["No reaction at all","A purple colour","An ester formed"],w:"Hydrogencarbonates also give carbon dioxide with ethanoic acid."}]}
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
    ["M","O","E","C"].forEach(x=>{const g=$("sc"+x);if(!g)return;
      if(x===k){g.style.display="";g.setAttribute("opacity",1);}else{g.style.display="none";g.setAttribute("opacity",0);}});
  }

  // ======================= resets =======================
  function resetM(){
    ["mAw","mBw","mAo","mBo","mAc","mBc","mClk","mLbls","mLblsT"].forEach(id=>setOp($(id),0));
    ["mJug","mOil","mSoap","mMag"].forEach(showItem);
    $("mAcap").textContent="Water";$("mBcap").textContent="Water";
    ["mA","mB"].forEach(id=>$(id).removeAttribute("transform"));
    const z=$("mZoom");z.style.display="none";setOp(z,0);$("mMols").innerHTML="";
    stopBub("bubM");
  }
  function resetO(){
    ["oLiq","oPur","oDrop","oHotGlow"].forEach(id=>setOp($(id),0));
    ["oEth","oKmn"].forEach(showItem);stopBub("steamO");stopBub("bubO");
  }
  function resetE(){
    ["eLiq1","eLiq2","eDrop","eHotGlow","eEst","eClk","smellE"].forEach(id=>setOp($(id),0));
    ["eEth","eAce","eH2"].forEach(showItem);stopBub("steamE");$("eClkTx").textContent="0 minutes";
  }
  function resetC(){
    ["cPow","cAcid","cMilk"].forEach(id=>setOp($(id),0));setOp($("cLime"),1);
    ["cNa2","cAce","cNaH"].forEach(showItem);stopBub("bubC1");stopBub("bubC2");
    $("cT1cap").textContent="Reaction tube";Snd.fizzStop&&Snd.fizzStop();
  }
  const RESET={M:resetM,O:resetO,E:resetE,C:resetC};

  // ======================= actions : micelle =======================
  async function M_water(){await hideItem("mJug");Snd.pour&&Snd.pour(.8);
    await tween(700,t=>{setOp($("mAw"),t);setOp($("mBw"),t);});
    obs("About 10 mL of water was taken in each of the two test tubes.");say("Water in A and B.");}
  async function M_oil(){await hideItem("mOil");
    await tween(600,t=>{setOp($("mAo"),t);setOp($("mBo"),t);});
    $("mAcap").textContent="Water + oil";$("mBcap").textContent="Water + oil";
    obs("A drop of cooking oil was added to both. The oil floats as a separate layer on the water.");say("Oil floats on water.");}
  async function M_soap(){await hideItem("mSoap");
    startBub("bubM",450,30,296,-24,6,4);await wait(RM?100:900);stopBub("bubM");
    $("mBcap").textContent="Water + oil + soap";
    obs("A few drops of soap solution were added to test tube B only.");say("Soap only in B.");}
  async function M_shake(){
    const A=$("mA"),B=$("mB");Snd.clink&&Snd.clink();
    await tween(RM?200:1400,(e,t)=>{const a=Math.sin(t*Math.PI*10)*9*(1-t);
      A.setAttribute("transform",`rotate(${a} 250 300)`);B.setAttribute("transform",`rotate(${-a} 450 300)`);
      setOp($("mAc"),t*.92);setOp($("mBc"),t*.92);setOp($("mAo"),1-t);setOp($("mBo"),1-t);},t=>t);
    A.removeAttribute("transform");B.removeAttribute("transform");
    obs("Straight after shaking, both tubes look cloudy. The oil and water layers cannot be seen separately.");
    say("Both tubes look cloudy.");}
  async function M_wait(){
    setOp($("mClk"),1);
    for(let m=1;m<=5;m++){$("mClkTx").textContent=m+(m===1?" minute":" minutes");
      await tween(RM?80:520,t=>{const p=(m-1+t)/5;setOp($("mAc"),.92*(1-p));setOp($("mAo"),p);setOp($("mBc"),.92-.08*p);});}
    obs("Test tube A: the oil separated quickly and formed a layer on top again.");
    obs("Test tube B: the oil stayed spread in the water. The mixture stayed cloudy for a long time.");
    say("The oil separates first in A!");}
  async function M_zoom(){
    await hideItem("mMag");setOp($("mClk"),0);
    const z=$("mZoom");z.style.display="";fitView();await tween(400,t=>setOp(z,t));
    const g=$("mMols");g.innerHTML="";const cx=350,cy=316,R=100,mols=[];
    for(let k=0;k<12;k++){
      const m=mk("g",{},g);
      mk("polyline",{points:"-12,0 -21,-6 -30,6 -39,-6 -48,6 -57,-6 -66,0",fill:"none",stroke:"#475569","stroke-width":4,"stroke-linejoin":"round","stroke-linecap":"round"},m);
      mk("circle",{cx:0,cy:0,r:11,fill:"#2563EB",stroke:"#fff","stroke-width":2},m);
      const th=k*30,rad=th*Math.PI/180;
      mols.push({m,x0:110+Math.random()*480,y0:200+Math.random()*220,r0:Math.random()*360,
        x1:cx+R*Math.cos(rad),y1:cy+R*Math.sin(rad),r1:th});
    }
    const place=t=>mols.forEach(o=>o.m.setAttribute("transform",`translate(${lerp(o.x0,o.x1,t).toFixed(1)} ${lerp(o.y0,o.y1,t).toFixed(1)}) rotate(${lerp(o.r0,o.r1,t).toFixed(1)})`));
    place(0);await wait(RM?50:500);
    await tween(RM?200:1800,place,easeOut);
    await tween(500,t=>{setOp($("mLbls"),t);setOp($("mLblsT"),t);});
    obs("Inside B, soap molecules gather round the oil drop: the carbon chain (tail) goes into the oil and the ionic end (head) faces the water.");
    obs("This cluster is called a micelle. It forms an emulsion in water.");
    say("This is a micelle!");}

  // ======================= actions : oxidation =======================
  async function O_eth(){await hideItem("oEth");Snd.pour&&Snd.pour(.6);
    await tween(600,t=>setOp($("oLiq"),t));
    obs("About 3 mL of ethanol was taken in a test tube.");say("Ethanol in the tube.");}
  async function O_heat(){
    await tween(500,t=>setOp($("oHotGlow"),t));
    startBub("steamO",330,150,300,-70,10,6,"rgba(203,213,225,.75)");
    await wait(RM?100:1000);
    obs("The test tube was warmed gently in a water bath.");say("Warming gently.");}
  async function O_drop(){
    for(let i=0;i<3;i++){
      await dropInto("oDrop",200,352,1);
      await tween(RM?60:260,t=>setOp($("oPur"),t*.75));
      await tween(RM?60:700,t=>setOp($("oPur"),.75*(1-t)));
    }
    obs("Each drop of purple potassium permanganate lost its colour as it was added.");
    say("The purple colour disappears!");}
  async function O_excess(){
    for(let i=0;i<3;i++){await dropInto("oDrop",200,352,1);await tween(RM?60:300,t=>setOp($("oPur"),(i+t)/3*.8));}
    obs("When excess was added, the purple colour did not disappear. All the ethanol had been oxidised.");
    say("Now the purple colour stays.");}

  // ======================= actions : esterification =======================
  async function E_eth(){await hideItem("eEth");Snd.pour&&Snd.pour(.5);
    await tween(500,t=>setOp($("eLiq1"),t));
    obs("1 mL of absolute ethanol was taken in a test tube.");say("Ethanol in the tube.");}
  async function E_acid(){await hideItem("eAce");Snd.pour&&Snd.pour(.5);
    await tween(500,t=>setOp($("eLiq2"),t));
    obs("1 mL of glacial acetic acid was added.");say("Acetic acid added.");}
  async function E_h2(){await hideItem("eH2");
    await dropInto("eDrop",200,344,3);
    obs("A few drops of concentrated sulphuric acid were added.");say("A few drops of H₂SO₄.");}
  async function E_heat(){
    await tween(500,t=>setOp($("eHotGlow"),t));
    startBub("steamE",250,150,300,-70,10,6,"rgba(203,213,225,.75)");
    setOp($("eClk"),1);
    for(let m=1;m<=5;m++){$("eClkTx").textContent=m+(m===1?" minute":" minutes");await wait(RM?60:480);}
    obs("The tube was warmed in the water bath for five minutes.");say("Five minutes in the water bath.");}
  async function E_pour(){
    Snd.pour&&Snd.pour(.9);
    await tween(900,t=>{setOp($("eLiq1"),1-t);setOp($("eLiq2"),1-t);setOp($("eEst"),t*.9);});
    stopBub("steamE");setOp($("eHotGlow"),0);setOp($("eClk"),0);
    obs("The mixture was poured into a beaker of water.");say("Poured into water.");}
  async function E_smell(){
    await tween(700,t=>setOp($("smellE"),t));
    obs("The mixture has a sweet, fruity smell. An ester has formed.");say("A sweet, fruity smell!");}

  // ======================= actions : carbonate =======================
  async function C_na2(){await hideItem("cNa2");
    await tween(500,t=>setOp($("cPow"),t));
    obs("A spatula full of sodium carbonate was put in the test tube.");say("Sodium carbonate in the tube.");}
  async function C_acid(){await hideItem("cAce");Snd.pour&&Snd.pour(.6);
    await tween(500,t=>setOp($("cAcid"),t));
    startBub("bubC1",220,30,392,-52,14,4);Snd.fizzStart&&Snd.fizzStart();
    await wait(RM?100:1000);
    obs("2 mL of dilute ethanoic acid was added. The mixture fizzes: a gas is given off.");say("Fizzing!");}
  async function C_lime(){
    startBub("bubC2",470,8,382,-80,8,4);
    await tween(RM?200:2200,t=>{setOp($("cMilk"),t);setOp($("cLime"),1-t*.5);});
    obs("The gas was passed through lime water. The lime water turned milky, so the gas is carbon dioxide.");
    say("Lime water turns milky!");}
  async function C_nah(){
    Snd.fizzStop&&Snd.fizzStop();stopBub("bubC1");stopBub("bubC2");
    await tween(500,t=>{setOp($("cAcid"),1-t);setOp($("cPow"),1-t);setOp($("cMilk"),1-t);setOp($("cLime"),.5+.5*t);});
    await hideItem("cNaH");$("cT1cap").textContent="With NaHCO₃";
    await tween(400,t=>setOp($("cPow"),t));
    await tween(500,t=>setOp($("cAcid"),t));
    startBub("bubC1",220,30,392,-52,14,4);Snd.fizzStart&&Snd.fizzStart();
    await wait(RM?100:700);
    startBub("bubC2",470,8,382,-80,8,4);
    await tween(RM?200:2000,t=>{setOp($("cMilk"),t);setOp($("cLime"),1-t*.5);});
    Snd.fizzStop&&Snd.fizzStop();
    obs("Repeated with sodium hydrogencarbonate: the same fizzing, and the lime water turned milky again.");
    say("Same result with NaHCO₃.");}

  const ACTS={
    M:[{keys:["water"],fn:M_water,cue:"mJug"},{keys:["oil"],fn:M_oil,cue:"mOil"},{keys:["soap"],fn:M_soap,cue:"mSoap"},
       {keys:["tube"],fn:M_shake,cue:"mB"},{keys:["tube"],fn:M_wait,cue:"mA"},{keys:["zoom"],fn:M_zoom,cue:"mMag"}],
    O:[{keys:["ethanol"],fn:O_eth,cue:"oEth"},{keys:["heat"],fn:O_heat,cue:"oHot"},{keys:["kmno4"],fn:O_drop,cue:"oKmn"},{keys:["kmno4"],fn:O_excess,cue:"oKmn"}],
    E:[{keys:["ethanol"],fn:E_eth,cue:"eEth"},{keys:["acid"],fn:E_acid,cue:"eAce"},{keys:["h2so4"],fn:E_h2,cue:"eH2"},
       {keys:["heat"],fn:E_heat,cue:"eHot"},{keys:["beaker"],fn:E_pour,cue:"eBk"},{keys:["beaker"],fn:E_smell,cue:"eBk"}],
    C:[{keys:["na2co3"],fn:C_na2,cue:"cNa2"},{keys:["acid"],fn:C_acid,cue:"cAce"},{keys:["lime"],fn:C_lime,cue:"cT2"},{keys:["nahco3"],fn:C_nah,cue:"cNaH"}]
  };

  async function act(key){
    if(!EXP||done||busy)return;
    const cur=ACTS[EXP.key][step];if(!cur)return;
    if(!cur.keys.includes(key)){wrong();return;}
    busy=true;clearHalos();
    try{await cur.fn();step++;markStep();
      if(step>=ACTS[EXP.key].length)finish();else{setTask();setPill();cue();}
    }catch(e){if(e!=="reset")console.error(e);}
    busy=false;
  }
  function wrong(){say("Not yet — "+EXP.stepTasks[step]);Snd.bad&&Snd.bad();}
  function cue(){clearHalos();const c=ACTS[EXP.key][step];if(c)halo($(c.cue));}

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
    c.innerHTML=`<h2>🔬 Choose an experiment</h2><p class="sub">Chapter 4 — Carbon and its Compounds. Tap a card to begin.</p>
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
    EXP=E;step=0;done=false;useScene(E.key);RESET[E.key]();fitView();
    $("hsub").textContent=E.sub;buildRecord();setTask();setPill();markStep();
    $("chk").hidden=true;$("ov").hidden=true;cue();Say.say(E.stepTasks[0]);
  }

  // ======================= wiring =======================
  svg.addEventListener("click",e=>{const g=e.target.closest("[data-t]");if(g)act(g.dataset.t);});
  svg.addEventListener("keydown",e=>{if(e.key!=="Enter"&&e.key!==" ")return;const g=e.target.closest("[data-t]");if(g){e.preventDefault();act(g.dataset.t);}});
  $("chk").onclick=startQuiz;
  $("rst").onclick=()=>{if(EXP)begin(EXP);else chooser();};
  $("swap").onclick=chooser;

  function celebrate(){
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
  function fitView(){const r=$("scene").getBoundingClientRect();const tall=r.height/r.width>1.05;
    const zoomed=EXP&&EXP.key==="M"&&$("mZoom").style.display!=="none";
    svg.setAttribute("viewBox",tall?(zoomed?"222 150 256 312":"46 150 620 470"):"0 86 700 534");
    const w=$("mLbls"),tl=$("mLblsT"),ti=$("mTitle");
    if(w&&tl&&ti){w.style.display=tall?"none":"";ti.style.display=tall?"none":"";tl.style.display=tall?"":"none";}}
  addEventListener("resize",()=>{fitView();fitText($("ceq"));});fitView();
  chooser();
})();

