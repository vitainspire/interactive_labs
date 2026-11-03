/* Lesson 10: The Human Eye and the Colourful World — lab.html (Digital Lab) script.
   This is a fully bespoke, self-contained experiment engine (its own DOM
   shorthand, Web Audio sound effects, speech-synthesis voice-over and
   confetti) with no overlap with ../shared/app.js, which this page does not
   load. Relocated verbatim from the page's former inline <script>. */
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
  {key:"P",ic:"🔺",tag:"📘 Section 10.3",name:"Refraction through a prism",sub:"Refraction through a prism",
   blurb:"Trace a ray with pins and measure the angle of deviation.",
   intro:"You will place a glass prism on paper and trace its outline ABC. You will fix pins P, Q, R and S in a line through the prism and draw the path of light. Then you will measure the angles.",
   safe:"🥽 Handle pins carefully. Hold the glass prism by its triangular ends.",
   aim:"To trace the path of a ray of light through a glass prism and find the angle of deviation.",
   steps:["Place the prism, draw outline ABC","Fix pins P and Q","Fix pins R and S","Join the pins, draw normals","Measure ∠i, ∠e and ∠D"],
   stepTasks:["Tap the glass prism. Place it on the paper and draw its outline ABC.",
     "Tap the pins. Draw a slanting line PE to face AB and fix pins P and Q on it.",
     "Tap the eye. Look through face AC and fix pins R and S in line with the images of P and Q.",
     "Tap the ruler. Join the pins, join E and F, and draw the normals.",
     "Tap the protractor. Extend the rays and measure the angles."],
   conc:{w1:"At face AB the ray bent towards the normal. At face AC it bent away from the normal. Both times it bent towards the base BC.",
     eq:"∠D = 37°: the angle of deviation",
     w2:"The faces of a prism are not parallel, so the emergent ray is not parallel to the incident ray. The angle between them is the angle of deviation."},
   quiz:[
    {q:"At face AB, light went from air into glass. How did it bend?",a:"Towards the normal",t:["Away from the normal","It did not bend","It turned back"],w:"Light slows down in glass, a denser medium."},
    {q:"At face AC, light went from glass into air. How did it bend?",a:"Away from the normal",t:["Towards the normal","It did not bend","It stayed inside"],w:"Light speeds up again in air."},
    {q:"Towards which part of the prism does the ray bend?",a:"Towards the base",t:["Towards the apex A","It does not bend","Away from the base"],w:"Both bendings turn the ray towards the base BC."},
    {q:"The angle between the incident ray and the emergent ray is called the",a:"Angle of deviation",t:["Angle of the prism","Angle of incidence","Angle of refraction"],w:"In this experiment, ∠D was 37°."},
    {q:"Why is the emergent ray not parallel to the incident ray here, as it was for a glass slab?",a:"The faces of a prism are not parallel",t:["The prism is coloured","The pins were wrong","Glass absorbs light"],w:"A prism's refracting faces meet at the angle of the prism.",lay:"col"}]},
  {key:"D",ic:"🌈",tag:"📘 Section 10.4",name:"Dispersion of white light",sub:"Dispersion of white light",
   blurb:"Split white light into VIBGYOR, then join it back with a second prism.",
   intro:"You will send a narrow beam of sunlight through a slit onto a glass prism and catch the colours on a screen. Then, like Newton, you will place a second prism upside down to join the colours back.",
   safe:"🥽 In a real lab, never look straight at the Sun. Look only at the screen.",
   aim:"To study the dispersion of white light by a glass prism and the recombination of the spectrum.",
   steps:["Make a narrow beam of white light","Put a prism in its path","Read the colours on the screen","Add a second prism upside down"],
   stepTasks:["Tap the slit card. Let sunlight pass through the narrow slit.",
     "Tap the glass prism. Put it in the path of the white beam.",
     "Tap the screen. Read the colours of the band.",
     "Tap the second prism. Put it upside down in the path of the colours."],
   conc:{w1:"The prism split white light into seven colours: violet, indigo, blue, green, yellow, orange and red. Violet bent the most and red the least.",
     eq:"White light → VIBGYOR → white light",
     w2:"The second, upside-down prism joined all the colours back into white light. So white light is made of seven colours."},
   quiz:[
    {q:"What did the prism do to the white light?",a:"Split it into seven colours",t:["Made it brighter","Turned it all red","Stopped it"],w:"This splitting is called dispersion."},
    {q:"Which colour bent the most?",a:"Violet",t:["Red","Green","Yellow"],w:"Violet is at the bottom of the band on the screen."},
    {q:"Which colour bent the least?",a:"Red",t:["Violet","Blue","Indigo"],w:"Red is at the top of the band."},
    {q:"The band of seven colours on the screen is called a",a:"Spectrum",t:["Shadow","Rainbow","Mirror image"],w:"Remember VIBGYOR."},
    {q:"What came out of the second, upside-down prism?",a:"White light",t:["Only red light","More colours","No light"],w:"The colours recombined. Newton showed this first."}]},
  {key:"E",ic:"👓",tag:"📘 Section 10.2",name:"Correcting eye defects",sub:"Myopia and hypermetropia",
   blurb:"Pick the right lens to fix myopia and hypermetropia.",
   intro:"You will look at where light rays meet inside a model eye. First a myopic eye looks at a far tree. Then a hypermetropic eye looks at a near book. Each time, choose the lens that brings the image onto the retina.",
   safe:"🥽 Never wear someone else's spectacles. Only an eye doctor can find the right lens for you.",
   aim:"To find which lens corrects myopia and which lens corrects hypermetropia.",
   steps:["Myopic eye looks at a far tree","Choose a lens for myopia","Hypermetropic eye looks at a near book","Choose a lens for hypermetropia"],
   stepTasks:["Tap the far tree. See where its rays meet in this myopic eye.",
     "Choose a lens to fix myopia. Tap the concave lens or the convex lens.",
     "Tap the book. See where its rays meet in this hypermetropic eye.",
     "Choose a lens to fix hypermetropia. Tap the concave lens or the convex lens."],
   conc:{w1:"In myopia, rays from a far object meet in front of the retina. A concave lens spreads them a little, so they meet on the retina.",
     eq:"Myopia → concave · Hypermetropia → convex",
     w2:"In hypermetropia, rays from a near object meet behind the retina. A convex lens brings them together sooner, so they meet on the retina."},
   quiz:[
    {q:"In a myopic eye, where do rays from a far object meet?",a:"In front of the retina",t:["Behind the retina","On the retina","On the cornea"],w:"So far objects look blurred."},
    {q:"Which lens corrects myopia?",a:"Concave lens",t:["Convex lens","Plane glass","Bifocal lens"],w:"It spreads the rays so they meet on the retina."},
    {q:"What happened when a convex lens was used for myopia?",a:"The rays met even farther in front of the retina",t:["The image became clear","The rays met on the retina","Nothing changed"],w:"A convex lens adds more bending, which makes myopia worse.",lay:"col"},
    {q:"In a hypermetropic eye, where do rays from a near object meet?",a:"Behind the retina",t:["In front of the retina","On the retina","At the pupil"],w:"So near objects look blurred."},
    {q:"Which lens corrects hypermetropia?",a:"Convex lens",t:["Concave lens","Plane glass","Cylindrical lens"],w:"It adds the extra bending the eye needs."}]},
  {key:"B",ic:"🌅",tag:"📘 Section 10.6",name:"Blue sky and red sunset",sub:"Blue sky and red sunset",
   blurb:"Shine a torch through cloudy water. See blue from the side, red straight through.",
   intro:"You will shine a torch beam through a tank of water and onto a screen. Then you will add a few drops of milk. The tiny milk particles make the water a colloid. Watch the beam from the side and on the screen.",
   safe:"🥽 Never look straight into a bright torch. Wipe up spilled water at once.",
   aim:"To see how tiny particles scatter blue light and let red light pass through.",
   steps:["Shine the torch through clear water","Add a few drops of milk","Look at the beam from the side","Look at the spot on the screen","Add more milk"],
   stepTasks:["Tap the torch. Shine its beam through the clear water.",
     "Tap the milk. Add a few drops to the water and stir.",
     "Tap the eye. Look at the beam from the side of the tank.",
     "Tap the screen. Look at the colour of the light that came straight through.",
     "Tap the milk again. Add more drops and watch the screen."],
   conc:{w1:"The tiny milk particles scattered blue light to the sides, so the beam looked blue from the side. The light that came straight through lost its blue and looked orange-red.",
     eq:"Tiny particles scatter blue the most",
     w2:"The sky works the same way. Air scatters blue sunlight, so the sky looks blue. At sunrise and sunset, light crosses much more air, so the Sun looks red."},
   quiz:[
    {q:"In clear water, why was the beam's path not seen from the side?",a:"There were no particles to scatter the light",t:["The torch was too weak","Water is blue","Light cannot enter water"],w:"Scattering needs particles in the path."},
    {q:"After adding milk, the beam's path became visible. This is the",a:"Tyndall effect",t:["Dispersion","Reflection","Atmospheric refraction"],w:"Colloid particles scatter light, like dust in a sunbeam."},
    {q:"Which colour did you see from the side of the tank?",a:"Blue",t:["Red","Yellow","White"],w:"Tiny particles scatter blue light the most."},
    {q:"The spot on the screen turned orange-red. Why?",a:"Blue light was scattered away on the way",t:["Milk is red","The screen is red","The torch changed colour"],w:"Mostly red light was left to go straight through.",lay:"col"},
    {q:"Adding more milk is like the Sun at sunset because",a:"Light crosses more particles, so more blue is lost",t:["The Sun gets colder","Milk is like clouds","The Sun moves closer"],w:"At sunset, sunlight travels through a thicker layer of air.",lay:"col"}]}
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
    ["P","D","E","B"].forEach(x=>{const g=$("sc"+x);if(!g)return;
      if(x===k){g.style.display="";g.setAttribute("opacity",1);}else{g.style.display="none";g.setAttribute("opacity",0);}});
  }

  // ======================= resets =======================
  function resetP(){$("pDyn").innerHTML="";setOp($("pGlass"),0);["pPrism","pPins","pEye","pRuler","pProt"].forEach(showItem);}
  function resetD(){["dDyn","dDyn2","dSpot","dNames"].forEach(i=>$(i).innerHTML="");setOp($("dNames"),0);setOp($("dBoard"),0);
    ["dCardP","dP1","dP2"].forEach(i=>setOp($(i),0));["dCard","dPrism","dPrism2"].forEach(showItem);}
  function resetE(){$("eDyn").innerHTML="";$("eMark").innerHTML="";$("eLens").setAttribute("rx",13);["eCc","eCv","eBook"].forEach(showItem);setOp($("eBookP"),0);
    board("e","A model of a myopic (short-sighted) eye","Tap the far tree to look at it.");}
  function resetB(){["bBeam","bDots","bSide"].forEach(i=>$(i).innerHTML="");setOp($("bSide"),0);setOp($("bBoard"),0);
    $("bWater").setAttribute("fill","rgba(147,197,253,.38)");setOp($("bTankL"),1);setOp($("bSpot"),0);$("bBulb").setAttribute("fill","#94A3B8");["bEye","bMilk"].forEach(showItem);}
  const RESET={P:resetP,D:resetD,E:resetE,B:resetB};

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

  // ======================= P: refraction through a prism =======================
  const PA=[350,182],PB=[222,404],PC=[478,404];
  function prayL(A,B,C,iDeg,t){const n=1.5,rad=Math.PI/180,G=[(A[0]+B[0]+C[0])/3,(A[1]+B[1]+C[1])/3];
    const nin=(P,Q,X)=>{const u=unit([Q[0]-P[0],Q[1]-P[1]]);let m=[-u[1],u[0]];if((G[0]-X[0])*m[0]+(G[1]-X[1])*m[1]<0)m=[-m[0],-m[1]];return m;};
    const E=[B[0]+(A[0]-B[0])*t,B[1]+(A[1]-B[1])*t],n1=nin(B,A,E),a1=Math.atan2(n1[1],n1[0]);
    const r1=Math.asin(Math.sin(iDeg*rad)/n),d=[Math.cos(a1-iDeg*rad),Math.sin(a1-iDeg*rad)],q=[Math.cos(a1-r1),Math.sin(a1-r1)];
    const hit=(P,v,M,N)=>{const w=[N[0]-M[0],N[1]-M[1]],den=v[0]*w[1]-v[1]*w[0],s=((M[0]-P[0])*w[1]-(M[1]-P[1])*w[0])/den;return [P[0]+v[0]*s,P[1]+v[1]*s];};
    const F=hit(E,q,A,C),n2=nin(A,C,F),no=[-n2[0],-n2[1]],ao=Math.atan2(no[1],no[0]),aq=Math.atan2(q[1],q[0]);
    let df=aq-ao;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;
    const e=Math.asin(Math.min(1,n*Math.sin(Math.abs(df)))),ae=ao+Math.sign(df)*e,ev=[Math.cos(ae),Math.sin(ae)];
    const X=hit(E,d,F,[F[0]+ev[0],F[1]+ev[1]]);
    return {E,F,d,q,e:ev,n1,no,X,i:iDeg,r:r1/rad,em:e/rad,D:iDeg+e/rad-60};}
  const PR=prayL(PA,PB,PC,48,0.42);
  const pP=along(PR.E,PR.d,-140),pQ=along(PR.E,PR.d,-76),pR=along(PR.F,PR.e,76),pS=along(PR.F,PR.e,140);
  const DEG={i:Math.round(PR.i),r:Math.round(PR.r),e:Math.round(PR.em),D:Math.round(PR.D)};
  function pin(g,p,l,dx,dy){mk("circle",{cx:p[0],cy:p[1],r:6,fill:"#DC2626",stroke:"#7F1D1D","stroke-width":1.5},g);
    txt(g,p[0]+(dx||0),p[1]+(dy||-14),l,{style:"font-size:17px;fill:#1E293B"});}
  async function P_prism(){await hideItem("pPrism");await tween(RM?60:700,t=>setOp($("pGlass"),t));
    obs("The glass prism was placed on the paper and its outline ABC was drawn.");say("Outline ABC drawn.");}
  async function P_pins(){await hideItem("pPins");const G=mk("g",{},$("pDyn"));const s=along(PR.E,PR.d,-165);
    ln(G,s[0],s[1],PR.E[0],PR.E[1],{stroke:"#94A3B8","stroke-width":2});pin(G,pP,"P");pin(G,pQ,"Q");await fadeIn(G,600);
    obs("A slanting line PE was drawn to face AB. Pins P and Q were fixed on it.");say("Pins P and Q fixed.");}
  async function P_eye(){await hideItem("pEye");const G=mk("g",{},$("pDyn"));pin(G,pR,"R");pin(G,pS,"S");
    const t=along(PR.F,PR.e,180);mk("line",{x1:pS[0],y1:pS[1],x2:t[0],y2:t[1],stroke:"#2563EB","stroke-width":2,"stroke-dasharray":"4 5"},G);
    await fadeIn(G,600);obs("Looking through face AC, pins R and S were fixed in line with the images of P and Q.");say("Pins R and S fixed.");}
  async function P_ruler(){await hideItem("pRuler");const G=mk("g",{},$("pDyn"));
    [[PR.E,PR.n1],[PR.F,PR.no]].forEach(([p,n])=>mk("line",{x1:p[0]-n[0]*52,y1:p[1]-n[1]*52,x2:p[0]+n[0]*52,y2:p[1]+n[1]*52,stroke:"#64748B","stroke-width":2,"stroke-dasharray":"7 6"},G));
    ray(G,pP[0],pP[1],PR.E[0],PR.E[1],RED);ray(G,PR.E[0],PR.E[1],PR.F[0],PR.F[1],RED);ray(G,PR.F[0],PR.F[1],pS[0],pS[1],RED);
    txt(G,PR.E[0]-22,PR.E[1]+28,"E",{style:"font-size:17px;fill:#1E293B"});txt(G,PR.F[0]+22,PR.F[1]+28,"F",{style:"font-size:17px;fill:#1E293B"});
    await fadeIn(G,800);obs("Joining the pins gave the incident ray PE, the refracted ray EF and the emergent ray FS. Normals were drawn at E and F.");say("Rays drawn.");}
  async function P_prot(){await hideItem("pProt");const G=mk("g",{},$("pDyn"));
    const lab=(p,t,c)=>txt(G,p[0],p[1],t,{style:`font-size:16px;fill:${c||PUR}`});
    lab(along(PR.E,PR.n1,-66),`∠i = ${DEG.i}°`);
    lab(along(PR.E,unit([PR.q[0]+PR.n1[0],PR.q[1]+PR.n1[1]]),50),`∠r = ${DEG.r}°`);
    lab(along(PR.F,PR.no,66),`∠e = ${DEG.e}°`);
    const X=PR.X,x2=along(X,PR.d,110);dash(G,PR.E[0],PR.E[1],x2[0],x2[1],RED);dash(G,PR.F[0],PR.F[1],X[0],X[1],RED);
    const r=40,a1=Math.atan2(PR.d[1],PR.d[0]),a2=Math.atan2(PR.e[1],PR.e[0]);
    mk("path",{d:`M${X[0]+r*Math.cos(a1)} ${X[1]+r*Math.sin(a1)} A${r} ${r} 0 0 1 ${X[0]+r*Math.cos(a2)} ${X[1]+r*Math.sin(a2)}`,fill:"none",stroke:"#16A34A","stroke-width":4},G);
    txt(G,X[0]-4,X[1]-48,`∠D = ${DEG.D}°`,{style:"font-size:19px;fill:#15803D"});
    await fadeIn(G,800);obs(`∠i = ${DEG.i}° and ∠e = ${DEG.e}°. The emergent ray bent towards the base. The angle of deviation ∠D = ${DEG.D}°.`);
    say(`∠D = ${DEG.D}°`);tell(`The angle of deviation is ${DEG.D} degrees.`);}

  // ======================= D: dispersion and recombination =======================
  const SL=[134,322],E1=[223,318],F1=[319,322],F2=[514,345],SCX=596,SLOPE=(E1[1]-SL[1])/(E1[0]-SL[0]);
  const VC=["#7C3AED","#4338CA","#2563EB","#16A34A","#EAB308","#F97316","#DC2626"],VN=["Violet","Indigo","Blue","Green","Yellow","Orange","Red"];
  const dDir=k=>{const a=(20-k*16/6)*Math.PI/180;return [Math.cos(a),Math.sin(a)];};
  const dScr=k=>{const v=dDir(k);return F1[1]+(SCX-F1[0])*v[1]/v[0];};
  const dHit2=k=>{const v=dDir(k),M=[400,300],w=[70,121],den=v[0]*w[1]-v[1]*w[0],s=((M[0]-F1[0])*w[1]-(M[1]-F1[1])*w[0])/den;return [F1[0]+v[0]*s,F1[1]+v[1]*s];};
  function spot(y,h,fill){const g=$("dSpot");g.innerHTML="";mk("rect",{x:596,y:y-h/2-4,width:22,height:h+8,rx:5,fill:"rgba(250,204,21,.35)"},g);mk("rect",{x:599,y:y-h/2,width:16,height:h,rx:3,fill,stroke:"#EAB308","stroke-width":2},g);setOp(g,1);}
  function dPrismPath(G){wbeam(G,SL[0],SL[1],E1[0],E1[1]);mk("path",{d:`M${E1[0]} ${E1[1]-3} L${F1[0]} ${F1[1]-4} L${F1[0]} ${F1[1]+4} L${E1[0]} ${E1[1]+3}Z`,fill:"rgba(255,255,255,.95)",stroke:"#CBD5E1"},G);}
  async function D_card(){await hideItem("dCard");await fadeIn($("dCardP"),500);const g=$("dDyn");g.innerHTML="";const G=mk("g",{},g);
    const y2=SL[1]+(SCX-SL[0])*SLOPE;wbeam(G,SL[0],SL[1],SCX,y2);await fadeIn(G,700);spot(y2,16,"#FFFFFF");
    obs("Sunlight passed through the narrow slit. A narrow beam of white light made a white spot on the screen.");say("A narrow white beam.");}
  async function D_prism(){await hideItem("dPrism");$("dSpot").innerHTML="";const g=$("dDyn");g.innerHTML="";await fadeIn($("dP1"),500);
    const G=mk("g",{},g);dPrismPath(G);VC.forEach((c,k)=>ln(G,F1[0],F1[1],SCX,dScr(k),{stroke:c,"stroke-width":3}));await fadeIn(G,900);
    const S=$("dSpot");S.innerHTML="";VC.forEach((c,k)=>mk("rect",{x:598,y:dScr(k)-7,width:18,height:14,fill:c},S));await fadeIn(S,500);
    board("d","The white beam split into colours!","A band of colours on the screen");
    obs("The prism split the white beam into a band of colours on the screen.");tell("The white light split into colours.");}
  async function D_screen(){const g=$("dNames");g.innerHTML="";
    VN.forEach((n,k)=>txt(g,628,dScr(k)+5,n,{"text-anchor":"start",style:`font-size:13px;fill:${VC[k]}`}));await fadeIn(g,600);
    board("d","Red at the top, violet at the bottom: VIBGYOR","Red bends the least. Violet bends the most.");
    obs("From the bottom up, the colours were violet, indigo, blue, green, yellow, orange and red (VIBGYOR). Violet bent the most and red the least.");
    tell("Violet bends the most. Red bends the least.");}
  async function D_prism2(){await hideItem("dPrism2");await tween(RM?60:400,t=>{setOp($("dNames"),1-t);setOp($("dSpot"),1-t);});
    await fadeIn($("dP2"),500);const g=$("dDyn");g.innerHTML="";const G=mk("g",{},g);dPrismPath(G);
    VC.forEach((c,k)=>{const h=dHit2(k);ln(G,F1[0],F1[1],h[0],h[1],{stroke:c,"stroke-width":3});ln(G,h[0],h[1],F2[0],F2[1],{stroke:c,"stroke-width":2.5});});
    const y2=F2[1]+(SCX-F2[0])*SLOPE;wbeam(G,F2[0],F2[1],SCX,y2);await fadeIn(G,900);spot(y2,16,"#FFFFFF");
    board("d","White light again!","The second prism joined the seven colours back.","ok");
    obs("With the second prism upside down, the colours joined back. A beam of white light came out and made a white spot on the screen.");
    tell("The colours joined back into white light.");}

  // ======================= E: correcting myopia and hypermetropia =======================
  const EL=471,ER=614,EAX=320,CX=360,FAR=110,NEAR=[266,EAX];
  const EYEF={my:104,hy:95.6},CORR={my:{concave:-270.3,convex:270.3},hy:{convex:200.4,concave:-200.4}};
  let eMode="my";
  /* paraxial trace through thin lenses: returns the points and the ray after the eye lens */
  function trace(x0,y0,m,els){const pts=[[x0,y0]];let x=x0,y=y0;for(const e of els){y+=m*(e.x-x);x=e.x;pts.push([x,y]);m-=y/e.f;}return {pts,y,m};}
  function eyeRays(cf){const els=(cf?[{x:CX,f:cf}]:[]).concat([{x:EL,f:EYEF[eMode]}]);
    const far=eMode==="my",u=far?trace(FAR,1,0,els):trace(NEAR[0],0,1,els),uc=far?1:(CX-NEAR[0]);
    const s=Math.min(36/Math.abs(u.pts[u.pts.length-1][1]),cf?44/Math.abs(uc):99);
    const G=mk("g",{}),out=[];let xm=null;
    [-1,0,1].forEach(k=>{const r=far?trace(FAR,k*s,0,els):trace(NEAR[0],0,k*s,els),P=r.pts.map(p=>[p[0],EAX+p[1]]);
      for(let i=0;i<P.length-1;i++){if(i===0)ray(G,P[0][0],P[0][1],P[1][0],P[1][1]);else ln(G,P[i][0],P[i][1],P[i+1][0],P[i+1][1]);}
      const L=P[P.length-1];if(k!==0)xm=EL-r.y/r.m;
      const yR=L[1]+r.m*(ER-L[0]);ln(G,L[0],L[1],ER,yR);out.push(yR);
      if(k!==0&&xm>ER+3)dash(G,ER,yR,Math.min(xm,692),L[1]+r.m*(Math.min(xm,692)-L[0]));});
    return {G,xm,spread:Math.abs(out[2]-out[0])};}
  function eMark(R,good){const g=$("eMark");g.innerHTML="";
    if(Math.abs(R.xm-ER)<4){mk("circle",{cx:ER,cy:EAX,r:9,fill:"#4ADE80",stroke:"#15803D","stroke-width":3},g);txt(g,ER+2,EAX-20,"✔",{style:"font-size:24px;fill:#15803D"});return;}
    mk("ellipse",{cx:ER-2,cy:EAX,rx:9,ry:R.spread/2+5,fill:"rgba(250,204,21,.45)",stroke:"#CA8A04","stroke-width":1.5,"stroke-dasharray":"3 3"},g);
    txt(g,ER+44,EAX+66,"Blurred",{style:"font-size:15px;fill:#B45309"});
    if(R.xm<=692){mk("circle",{cx:R.xm,cy:EAX,r:7,fill:"#FEF08A",stroke:"#B45309","stroke-width":2.5},g);
      txt(g,R.xm,EAX-16,"meet here",{style:`font-size:14px;fill:${good===false?"#DC2626":"#B45309"}`});}
    else txt(g,668,EAX-30,"meet beyond →",{style:"font-size:14px;fill:#DC2626"});}
  async function eShow(cf,good){const g=$("eDyn");g.innerHTML="";const R=eyeRays(cf);g.appendChild(R.G);$("eMark").innerHTML="";await fadeIn(R.G,800);eMark(R,good);return R;}
  function lensAt(kind){const G=mk("g",{id:"ePlaced"},$("eDyn"));
    if(kind==="convex")mk("ellipse",{cx:CX,cy:EAX,rx:13,ry:62,fill:"rgba(253,230,138,.85)",stroke:"#B45309","stroke-width":3},G);
    else mk("path",{d:`M${CX-14} ${EAX-62} H${CX+14} Q${CX+3} ${EAX} ${CX+14} ${EAX+62} H${CX-14} Q${CX-3} ${EAX} ${CX-14} ${EAX-62}Z`,fill:"rgba(147,197,253,.75)",stroke:"#1D4ED8","stroke-width":3},G);
    txt(G,CX,EAX+86,kind==="convex"?"Convex lens":"Concave lens",{style:"font-size:16px;fill:var(--ink)"});return G;}
  async function eTry(kind,right){const id=kind==="convex"?"eCv":"eCc";await hideItem(id);
    await eShow(CORR[eMode][kind],right);const L=lensAt(kind);await fadeIn(L,400);
    if(right){
      board("e",`✔ Correct! The ${kind} lens puts the image on the retina.`,kind==="concave"?"It spreads the rays a little, so they meet farther back.":"It bends the rays more, so they meet sooner.","ok");
      Snd.ok&&Snd.ok();
      obs(eMode==="my"?"Concave lens: the rays spread a little and met exactly on the retina. The far tree became clear. Myopia is corrected by a concave lens."
        :"Convex lens: the rays met exactly on the retina. The near book became clear. Hypermetropia is corrected by a convex lens.");
      tell(eMode==="my"?"Correct! A concave lens corrects myopia.":"Correct! A convex lens corrects hypermetropia.");return;}
    const X=mk("g",{},$("eMark"));txt(X,CX,EAX-80,"✘",{style:"font-size:46px;fill:#DC2626"});
    board("e",eMode==="my"?"✘ Wrong lens! The rays now meet even farther in front.":"✘ Wrong lens! The rays now meet even farther behind.",
      eMode==="my"?"A convex lens bends the rays even more.":"A concave lens spreads the rays even more.","bad");
    Snd.bad&&Snd.bad();
    obs(eMode==="my"?"Convex lens tried: the rays met even farther in front of the retina. Wrong lens for myopia."
      :"Concave lens tried: the rays met even farther behind the retina. Wrong lens for hypermetropia.");
    Say.say(eMode==="my"?"Wrong lens. A convex lens makes the rays meet even farther in front of the retina. Try the other lens."
      :"Wrong lens. A concave lens makes the rays meet even farther behind the retina. Try the other lens.");
    await wait(RM?600:4200);
    await tween(RM?60:400,t=>setOp($("eDyn"),1-t));$("eDyn").innerHTML="";setOp($("eDyn"),1);showItem(id);await eShow(null);
    board("e",eMode==="my"?"Myopia: rays meet in front of the retina":"Hypermetropia: rays meet behind the retina","Try the other lens.");}
  async function E_tree(){eMode="my";await eShow(null);
    board("e","Myopia: rays from the far tree meet in front of the retina","So the far tree looks blurred. Which lens will fix it?");
    obs("Myopic eye: rays from the far tree met in front of the retina, so the image on the retina was blurred.");
    tell("The rays meet in front of the retina. The far tree looks blurred.");}
  async function E_book(){await hideItem("eBook");await fadeIn($("eBookP"),500);const pl=$("ePlaced");if(pl){await tween(RM?60:400,t=>setOp(pl,1-t));}showItem("eCc");showItem("eCv");
    eMode="hy";const lens=$("eLens");await tween(RM?60:600,t=>lens.setAttribute("rx",(13-7*t).toFixed(1)));await eShow(null);
    board("e","Hypermetropia: rays from the near book meet behind the retina","So the near book looks blurred. Which lens will fix it?");
    obs("Hypermetropic eye: rays from the near book met behind the retina, so the image on the retina was blurred.");
    tell("The rays meet behind the retina. The near book looks blurred.");}
  const E_cc=()=>eTry("concave",eMode==="my"),E_cv=()=>eTry("convex",eMode==="hy");

  // ======================= B: blue sky and red sunset =======================
  const BY=330;
  function bDraw(milk,out){const g=$("bBeam");g.innerHTML="";
    mk("rect",{x:140,y:BY-10,width:44,height:20,fill:"#FFFFFF",stroke:"#CBD5E1"},g);
    mk("rect",{x:184,y:BY-10,width:282,height:20,fill:milk===0?"rgba(255,255,255,.14)":milk===1?"rgba(96,165,250,.6)":"rgba(59,130,246,.75)"},g);
    if(milk)mk("rect",{x:184,y:BY-24,width:282,height:48,fill:"rgba(147,197,253,.28)"},g);
    mk("rect",{x:466,y:BY-8,width:46,height:16,fill:out,stroke:out==="#FFFFFF"?"#CBD5E1":"none"},g);
    mk("rect",{x:526,y:BY-6,width:74,height:12,fill:out,stroke:out==="#FFFFFF"?"#CBD5E1":"none"},g);}
  function bSpot(c){const s=$("bSpot");s.setAttribute("fill",c);s.setAttribute("stroke",c==="#FFFFFF"?"#CBD5E1":"none");setOp(s,1);}
  function bDotsAdd(n){const g=$("bDots");for(let k=0;k<n;k++)mk("circle",{cx:(190+Math.random()*270).toFixed(1),cy:(274+Math.random()*184).toFixed(1),r:(1.2+Math.random()*1.4).toFixed(1),fill:"#FFFFFF",opacity:.8},g);}
  async function bDrops(n){const g=$("bSide").parentNode;for(let k=0;k<n;k++){const d=mk("circle",{cx:325+(k%2?8:-8),cy:200,r:5,fill:"#FFFFFF",stroke:"#94A3B8"},$("bBeam"));
      await tween(RM?40:380,t=>d.setAttribute("cy",lerp(200,272,t)),t=>t*t);d.remove();Snd.clink&&Snd.clink();}}
  async function B_torch(){$("bBulb").setAttribute("fill","#FEF08A");bDraw(0,"#FFFFFF");await fadeIn($("bBeam"),700);bSpot("#FFFFFF");
    board("b","Clear water: the beam's path is hard to see","The spot on the screen is white.");
    obs("In clear water, the beam's path could hardly be seen from the side. It made a white spot on the screen.");tell("In clear water, the path of the beam is hard to see.");}
  async function B_milk1(){await bDrops(3);await tween(RM?60:800,t=>$("bWater").setAttribute("fill",`rgba(${Math.round(lerp(147,214,t))},${Math.round(lerp(197,226,t))},${Math.round(lerp(253,240,t))},${lerp(.38,.6,t).toFixed(2)})`));
    bDotsAdd(70);bDraw(1,"#FEF3C7");bSpot("#FEF3C7");
    board("b","Cloudy water: now the beam's path can be seen","Tiny milk particles scatter the light (Tyndall effect).");
    obs("A few drops of milk made the water a little cloudy (a colloid). Now the path of the beam could be seen in the water. This is the Tyndall effect.");
    tell("Now the path of the beam can be seen. This is the Tyndall effect.");}
  async function B_eye(){await hideItem("bEye");const g=$("bSide");g.innerHTML="";await tween(RM?60:300,t=>setOp($("bTankL"),1-t));
    const E=mk("g",{},g);mk("path",{d:"M297 232 Q325 212 353 232 Q325 252 297 232Z",fill:"#FFFFFF",stroke:"#334155","stroke-width":3},E);
    mk("circle",{cx:325,cy:235,r:9,fill:"#2563EB"},E);mk("circle",{cx:325,cy:236,r:4.5,fill:"#0F172A"},E);
    [255,325,395].forEach(x=>{ray(g,x,BY-16,x+(325-x)*.6,254,"#2563EB");});
    [255,395].forEach(x=>ray(g,x,BY+16,x+(x<325?-30:30),BY+80,"#2563EB"));
    txt(g,325,BY+110,"Bluish light to the sides",{style:"font-size:15px;fill:#1D4ED8"});await fadeIn(g,700);
    board("b","From the side, the beam looks blue","Tiny particles scatter blue light the most.");
    obs("Seen from the side, the beam in the cloudy water looked bluish. The particles scattered mostly blue light to the sides.");
    tell("From the side, the beam looks blue.");}
  async function B_screen(){bDraw(1,"#FB923C");bSpot("#FB923C");const s=$("bSpot");await tween(RM?60:700,t=>s.setAttribute("r",(13+5*Math.sin(t*Math.PI)).toFixed(1)));
    board("b","Straight through, the light looks orange-red","The blue light was scattered away on the way.");
    obs("The light that came straight through the tank made an orange-red spot on the screen. Its blue part had been scattered away.");
    tell("The light that comes straight through looks orange red.");}
  async function B_milk2(){await bDrops(4);await tween(RM?60:800,t=>$("bWater").setAttribute("fill",`rgba(${Math.round(lerp(214,236,t))},${Math.round(lerp(226,240,t))},${Math.round(lerp(240,246,t))},${lerp(.6,.78,t).toFixed(2)})`));
    bDotsAdd(90);bDraw(2,"#B91C1C");bSpot("#B91C1C");
    board("b","More milk: the spot turns deep red","Like the Sun at sunrise and sunset!","ok");
    obs("With more milk, even more blue was scattered. The spot on the screen turned deep red, like the Sun at sunrise and sunset.");
    tell("More particles. The spot turns deep red, like the setting Sun.");}

  const ACTS={
    P:[{keys:["prism"],fn:P_prism,cue:"pPrism"},{keys:["pins"],fn:P_pins,cue:"pPins"},{keys:["eye"],fn:P_eye,cue:"pEye"},{keys:["ruler"],fn:P_ruler,cue:"pRuler"},{keys:["prot"],fn:P_prot,cue:"pProt"}],
    D:[{keys:["card"],fn:D_card,cue:"dCard"},{keys:["prism"],fn:D_prism,cue:"dPrism"},{keys:["screen"],fn:D_screen,cue:"dScreen"},{keys:["prism2"],fn:D_prism2,cue:"dPrism2"}],
    E:[{keys:["tree"],fn:E_tree,cue:"eTree"},{keys:["concave"],fn:E_cc,cue:["eCc","eCv"],bad:{convex:E_cv}},
       {keys:["book"],fn:E_book,cue:"eBook"},{keys:["convex"],fn:E_cv,cue:["eCc","eCv"],bad:{concave:E_cc}}],
    B:[{keys:["torch"],fn:B_torch,cue:"bTorch"},{keys:["milk"],fn:B_milk1,cue:"bMilk"},{keys:["eye"],fn:B_eye,cue:"bEye"},{keys:["screen"],fn:B_screen,cue:"bScreen"},{keys:["milk"],fn:B_milk2,cue:"bMilk"}]
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
    c.innerHTML=`<h2>🔬 Choose an experiment</h2><p class="sub">Chapter 10 — The Human Eye and the Colourful World. Tap a card to begin.</p>
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
    if(innerHeight>innerWidth&&innerWidth<700)setTimeout(()=>say("Tip: turn your phone sideways for a bigger view.",3600),400);
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
  function fitView(){const r=$("scene").getBoundingClientRect();const tall=r.height/r.width>1.05;svg.setAttribute("viewBox",tall?(EXP&&EXP.key==="P"?"60 140 600 440":"14 140 680 440"):"0 86 700 534");}
  addEventListener("resize",()=>{fitView();fitText($("ceq"));});fitView();
  chooser();
})();

