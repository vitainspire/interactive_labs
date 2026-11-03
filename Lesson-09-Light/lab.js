/* Lesson 9: Light – Reflection and Refraction — lab.html (Digital Lab) content.
   This page does not use ../shared/app.js: the experiment interaction model
   (drag/tap steps, lab record, sound, voice-over, SVG ray-diagram animation)
   is bespoke to this lab and is not shared with games.html or other lessons.
   Relocated verbatim from the page's inline <script>. */
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
  {key:"K",ic:"🪞",tag:"📘 Table 9.1",name:"Concave mirror images",sub:"Concave mirror images",
   blurb:"Move a candle and catch its image on a screen.",
   intro:"You will find the focus of a concave mirror (f = 15 cm) using sunlight. Then you will place a candle at four positions and look for its image on a screen.",
   safe:"🥽 In a real lab, never look at the Sun or its reflection. Keep the candle flame away from paper.",
   aim:"To study the images formed by a concave mirror for different positions of the object.",
   steps:["Find F using sunlight","Candle beyond C","Candle at C","Candle between C and F","Candle between F and P"],
   stepTasks:["Tap the concave mirror. Catch the image of the Sun on a screen to find its focus.",
     "Tap the candle to place it beyond C, at 45 cm. The screen finds the sharp image.",
     "Tap the candle to move it to C, at 30 cm.",
     "Tap the candle to move it between C and F, at 22.5 cm.",
     "Tap the candle to move it between F and P, at 7.5 cm."],
   conc:{w1:"As the candle came nearer to the mirror, the real image moved away and became bigger.",
     eq:"Nearer object → farther, bigger image",
     w2:"Between F and P, no image formed on the screen. The image is virtual, erect and enlarged, like in a shaving mirror."},
   quiz:[
    {q:"Where did the image of the Sun form?",a:"At the principal focus F",t:["At C","At the pole P","Behind the mirror"],w:"Parallel rays from the Sun meet at F after reflection."},
    {q:"The candle was at C. What was the image like?",a:"At C: real, inverted, same size",t:["At F: point-sized","Beyond C: enlarged","Behind the mirror: virtual"],w:"Table 9.1: object at C gives a same-size image at C."},
    {q:"The candle moved from beyond C to between C and F. What happened to the image?",a:"It moved away and became bigger",t:["It moved closer and became smaller","It stayed the same","It disappeared"],w:"Nearer object, farther and bigger real image."},
    {q:"Why was no image seen on the screen with the candle between F and P?",a:"The image is virtual, behind the mirror",t:["The candle went out","The mirror was too small","The image was too small to see"],w:"A virtual image cannot be caught on a screen."},
    {q:"Which use of a concave mirror works like the last step?",a:"Shaving mirror",t:["Rear-view mirror","Shop security mirror","Periscope"],w:"The face is kept between P and F to see an enlarged, erect image."}]},
  {key:"V",ic:"🔍",tag:"📘 Table 9.4",name:"Convex lens images",sub:"Convex lens images",
   blurb:"Move a candle and find its image through a lens.",
   intro:"You will find the focus of a convex lens (f = 12 cm) using sunlight. Then you will place a candle at four positions and look for its image on a screen on the other side.",
   safe:"🥽 In a real lab, never look at the Sun through a lens. Keep the candle flame away from paper.",
   aim:"To study the images formed by a convex lens for different positions of the object.",
   steps:["Find F₂ using sunlight","Candle beyond 2F₁","Candle at 2F₁","Candle between F₁ and 2F₁","Candle between F₁ and O"],
   stepTasks:["Tap the convex lens. Focus the Sun's light on a screen to find its focus.",
     "Tap the candle to place it beyond 2F₁, at 30 cm. The screen finds the sharp image.",
     "Tap the candle to move it to 2F₁, at 24 cm.",
     "Tap the candle to move it between F₁ and 2F₁, at 18 cm.",
     "Tap the candle to move it between F₁ and O, at 6 cm."],
   conc:{w1:"As the candle came nearer to the lens, the real image moved away and became bigger.",
     eq:"Nearer object → farther, bigger image",
     w2:"Between F₁ and O, no image formed on the screen. The image is virtual, erect and enlarged, like in a magnifying glass."},
   quiz:[
    {q:"The Sun's light met at one point on the other side of the lens. What is that point?",a:"The principal focus F₂",t:["The optical centre O","2F₂","The centre of curvature"],w:"Parallel rays meet at F₂ after refraction."},
    {q:"The candle was at 2F₁. What was the image like?",a:"At 2F₂: real, inverted, same size",t:["At F₂: point-sized","Beyond 2F₂: enlarged","Same side: virtual"],w:"Table 9.4: object at 2F₁ gives a same-size image at 2F₂."},
    {q:"The candle was beyond 2F₁. Where did the image form?",a:"Between F₂ and 2F₂",t:["At 2F₂","Beyond 2F₂","On the same side as the candle"],w:"The image is real, inverted and diminished."},
    {q:"With the candle between F₁ and O, what did you see?",a:"No image on the screen; a virtual, erect, enlarged image",t:["A small, real image on the screen","A same-size image at 2F₂","An image at F₂"],w:"Looking through the lens, you see an enlarged, erect image on the candle's side.",lay:"col"},
    {q:"Which device uses the last case?",a:"A magnifying glass",t:["A camera","A rear-view mirror","A torch"],w:"The object is kept between F and O of a convex lens."}]},
  {key:"S",ic:"🧊",tag:"📘 Section 9.3.1",name:"Refraction through a glass slab",sub:"Refraction through a glass slab",
   blurb:"Trace a ray with pins and see it shift sideways.",
   intro:"You will place a glass slab on paper, fix four pins in a straight line through it, and draw the path of light. Then you will measure the angles.",
   safe:"🥽 Handle pins carefully. Hold the glass slab by its edges.",
   aim:"To trace the path of a ray of light through a rectangular glass slab.",
   steps:["Place the slab, draw its outline","Fix pins A and B","Fix pins C and D","Join the pins","Measure the angles"],
   stepTasks:["Tap the glass slab. Place it on the paper and draw its outline.",
     "Tap the pins. Fix pins A and B on a slanting line that meets the slab.",
     "Tap the eye. Look through the slab and fix pins C and D in line with the images of A and B.",
     "Tap the ruler. Join the pins and draw the normals.",
     "Tap the protractor. Measure the angles and compare the rays."],
   conc:{w1:"Light bent towards the normal when it entered the glass, and away from the normal when it came out.",
     eq:"∠i = ∠e, so emergent ray ∥ incident ray",
     w2:"The emergent ray is parallel to the incident ray but shifted sideways. This shift is called lateral displacement."},
   quiz:[
    {q:"How did the ray bend when it entered the glass?",a:"Towards the normal",t:["Away from the normal","It did not bend","It came back"],w:"Light slows down in glass, a denser medium."},
    {q:"How did the ray bend when it came out of the glass?",a:"Away from the normal",t:["Towards the normal","It did not bend","It stayed inside"],w:"Light speeds up again in air."},
    {q:"The angle of incidence was 40°. What was the angle of emergence?",a:"40°",t:["25°","90°","0°"],w:"∠e equals ∠i for a glass slab with parallel faces."},
    {q:"The emergent ray is ____ to the incident ray.",a:"Parallel",t:["Perpendicular","Opposite","Not related"],w:"The two faces of the slab are parallel, so the bendings cancel."},
    {q:"The sideways shift of the emergent ray is called",a:"Lateral displacement",t:["Refraction","Reflection","Dispersion"],w:"The ray comes out parallel but shifted to one side."}]}
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
    ["K","V","S"].forEach(x=>{const g=$("sc"+x);if(!g)return;
      if(x===k){g.style.display="";g.setAttribute("opacity",1);}else{g.style.display="none";g.setAttribute("opacity",0);}});
  }

  // ======================= resets =======================
  function resetK(){$("kDyn").innerHTML="";setOp($("kMarks"),1);setOp($("kBoard"),0);$("kCand").setAttribute("transform","translate(110 0)");}
  function resetV(){$("vDyn").innerHTML="";setOp($("vMarks"),1);setOp($("vBoard"),0);$("vCand").setAttribute("transform","translate(90 0)");}
  function resetS(){$("sDyn").innerHTML="";setOp($("sGlass"),0);["sSlab","sPins","sEye","sRuler","sProt"].forEach(showItem);}
  const RESET={K:resetK,V:resetV,S:resetS};
  // ======================= optics helpers =======================
  const AX=330,H=50;
  const clip=(x1,y1,x2,y2)=>{const lo=120,hi=462;if(y2>hi&&y2!==y1){const t=(hi-y1)/(y2-y1);return [x1+(x2-x1)*t,hi];}if(y2<lo&&y2!==y1){const t=(lo-y1)/(y2-y1);return [x1+(x2-x1)*t,lo];}return [x2,y2];};
  const ln=(g,x1,y1,X2,Y2,o)=>{const [x2,y2]=clip(x1,y1,X2,Y2);return mk("line",Object.assign({x1,y1,x2,y2,stroke:"#F59E0B","stroke-width":3.2,"stroke-linecap":"round"},o||{}),g);};
  const dash=(g,x1,y1,x2,y2)=>ln(g,x1,y1,x2,y2,{"stroke-dasharray":"7 6",stroke:"#F59E0B",opacity:.85});
  function arrowOn(g,x1,y1,x2,y2){const mx=(x1+x2)/2,my=(y1+y2)/2,a=Math.atan2(y2-y1,x2-x1),c=Math.cos(a),s=Math.sin(a);
    mk("path",{d:`M${mx+9*c} ${my+9*s} L${mx-7*c+6*s} ${my-7*s-6*c} L${mx-7*c-6*s} ${my-7*s+6*c}Z`,fill:"#F59E0B"},g);}
  function ray(g,x1,y1,X2,Y2){const [x2,y2]=clip(x1,y1,X2,Y2);ln(g,x1,y1,x2,y2);arrowOn(g,x1,y1,x2,y2);}
  /* a candle image: m<0 inverted, virtual = dashed and faint */
  function img(g,x,m,virtual){const k=Math.abs(m),inv=m<0,sg=inv?1:-1;
    const G=mk("g",{opacity:virtual?.75:1},g),w=9*k,top=AX+sg*H*k,b=AX+sg*30*k,mid=AX+sg*40*k;
    mk("rect",{x:x-w,y:inv?AX:AX-30*k,width:2*w,height:30*k,rx:2,fill:virtual?"rgba(253,230,138,.5)":"#FDE68A",stroke:"#D97706","stroke-width":1.5,"stroke-dasharray":virtual?"5 4":"none"},G);
    mk("path",{d:`M${x} ${top} C${x+10*k} ${mid} ${x+9*k} ${b} ${x} ${b} C${x-9*k} ${b} ${x-10*k} ${mid} ${x} ${top}Z`,fill:virtual?"rgba(251,146,60,.55)":"#FB923C","stroke-dasharray":virtual?"5 4":"none",stroke:virtual?"#EA580C":"none"},G);
    return G;}
  function screenAt(g,x,label){const G=mk("g",{},g);
    mk("rect",{x:x-18,y:AX+2,width:36,height:110,rx:3,fill:"rgba(255,255,255,.92)",stroke:"#64748B","stroke-width":2},G);
    if(label)mk("text",{x,y:AX+128,class:"lbl",style:"font-size:14px"},G).textContent=label;return G;}
  function board(p,t1,t2){$(p+"B1").textContent=t1;$(p+"B2").textContent=t2;setOp($(p+"Board"),1);}
  async function fadeIn(G,ms){setOp(G,0);await tween(RM?60:ms||600,t=>setOp(G,t));}
  async function moveCand(id,x){const c=$(id);const m=/translate\(([-\d.]+)/.exec(c.getAttribute("transform")||"");const x0=m?+m[1]:0;
    await tween(RM?80:900,t=>c.setAttribute("transform",`translate(${lerp(x0,x,t).toFixed(1)} 0)`));}
  /* concave mirror: pole at 560, f = 15 cm, 6 px per cm */
  const KP=560,KF=15,SCL=6;
  async function kSun(){const g=$("kDyn");g.innerHTML="";const G=mk("g",{},g);
    mk("circle",{cx:70,cy:250,r:24,fill:"#FACC15"},G);
    [296,312,348,364].forEach(y=>{ray(G,40,y,KP,y);ray(G,KP,y,KP-KF*SCL,AX);});
    await fadeIn(G,900);const sp=mk("g",{},g);screenAt(sp,KP-KF*SCL,"Screen");mk("circle",{cx:KP-KF*SCL,cy:AX,r:7,fill:"#FEF08A",stroke:"#F59E0B","stroke-width":2},sp);
    await fadeIn(sp,500);setOp($("kMarks"),1);
    board("k","Image of the Sun: a bright point","At F, 15 cm from the mirror. So C is at 30 cm.");
    obs("The Sun's image formed as a bright point 15 cm in front of the mirror. This is F. So C is at 30 cm.");say("F is at 15 cm.");}
  async function kPlace(u,t1,t2,o){const g=$("kDyn");g.innerHTML="";setOp($("kBoard"),0);
    const xo=KP-u*SCL;await moveCand("kCand",xo);
    const v=1/(1/KF-1/u),m=-v/u,virt=v<0,xi=KP-v*SCL,ty=AX-H*m;
    const R=mk("g",{},g);ray(R,xo,AX-H,KP,AX-H);ray(R,xo,AX-H,KP,AX);
    if(!virt){ray(R,KP,AX-H,xi,ty);ray(R,KP,AX,xi,ty);await fadeIn(R,800);const S=screenAt(g,xi,"Screen");await fadeIn(S,400);const I=img(g,xi,m,false);await fadeIn(I,600);}
    else{ray(R,KP,AX-H,KP-150,AX-H+150*H/(KF*SCL));ray(R,KP,AX,KP-140,AX+140*H/(u*SCL));
      await fadeIn(R,800);const D=mk("g",{},g);dash(D,KP,AX-H,xi,ty);dash(D,KP,AX,xi,ty);await fadeIn(D,600);
      const S=screenAt(g,KP-140,"No image here!");await fadeIn(S,400);const I=img(g,xi,m,true);await fadeIn(I,600);}
    board("k",t1,t2);obs(o);say(t1);}
  const K_sun=()=>kSun();
  const K_1=()=>kPlace(45,"Image: between F and C","Real, inverted, diminished","Candle beyond C (45 cm): a sharp image formed between F and C (22.5 cm). It is real, inverted and smaller.");
  const K_2=()=>kPlace(30,"Image: at C","Real, inverted, same size","Candle at C (30 cm): the image formed at C. It is real, inverted and the same size.");
  const K_3=()=>kPlace(22.5,"Image: beyond C","Real, inverted, enlarged","Candle between C and F (22.5 cm): the image formed beyond C (45 cm). It is real, inverted and bigger.");
  const K_4=()=>kPlace(7.5,"No image on the screen!","Virtual, erect, enlarged, behind the mirror","Candle between F and P (7.5 cm): no image on the screen. Looking into the mirror, an enlarged, erect image is seen behind it.");
  /* convex lens: O at 350, f = 12 cm */
  const VO=350,VF=12;
  async function vSun(){const g=$("vDyn");g.innerHTML="";const G=mk("g",{},g);
    mk("circle",{cx:70,cy:250,r:24,fill:"#FACC15"},G);
    [296,312,348,364].forEach(y=>{ray(G,40,y,VO,y);ray(G,VO,y,VO+VF*SCL,AX);});
    await fadeIn(G,900);const sp=mk("g",{},g);screenAt(sp,VO+VF*SCL,"Screen");mk("circle",{cx:VO+VF*SCL,cy:AX,r:7,fill:"#FEF08A",stroke:"#F59E0B","stroke-width":2},sp);
    await fadeIn(sp,500);setOp($("vMarks"),1);
    board("v","Image of the Sun: a bright point","At F₂, 12 cm from the lens. So 2F is at 24 cm.");
    obs("The Sun's light met at a bright point 12 cm behind the lens. This is F₂. So 2F₁ and 2F₂ are at 24 cm.");say("F is at 12 centimetres.");}
  async function vPlace(u,t1,t2,o){const g=$("vDyn");g.innerHTML="";setOp($("vBoard"),0);
    const xo=VO-u*SCL;await moveCand("vCand",xo);
    const v=1/(1/VF-1/u),m=-v/u,virt=v<0,xi=VO+v*SCL,ty=AX-H*m;
    const R=mk("g",{},g);ray(R,xo,AX-H,VO,AX-H);
    if(!virt){ray(R,VO,AX-H,xi,ty);ray(R,xo,AX-H,xi,ty);await fadeIn(R,800);const S=screenAt(g,xi,"Screen");await fadeIn(S,400);const I=img(g,xi,m,false);await fadeIn(I,600);}
    else{const ex=620;ray(R,VO,AX-H,ex,AX-H+(ex-VO)*H/(VF*SCL));ray(R,xo,AX-H,ex,AX-H+(ex-xo)*H/(VO-xo));
      await fadeIn(R,800);const D=mk("g",{},g);dash(D,VO,AX-H,xi,ty);dash(D,xo,AX-H,xi,ty);await fadeIn(D,600);
      const S=screenAt(g,560,"No image here!");await fadeIn(S,400);const I=img(g,xi,m,true);await fadeIn(I,600);}
    board("v",t1,t2);obs(o);say(t1);}
  const V_sun=()=>vSun();
  const V_1=()=>vPlace(30,"Image: between F₂ and 2F₂","Real, inverted, diminished","Candle beyond 2F₁ (30 cm): a sharp image formed between F₂ and 2F₂ (20 cm). It is real, inverted and smaller.");
  const V_2=()=>vPlace(24,"Image: at 2F₂","Real, inverted, same size","Candle at 2F₁ (24 cm): the image formed at 2F₂ (24 cm). It is real, inverted and the same size.");
  const V_3=()=>vPlace(18,"Image: beyond 2F₂","Real, inverted, enlarged","Candle between F₁ and 2F₁ (18 cm): the image formed beyond 2F₂ (36 cm). It is real, inverted and bigger.");
  const V_4=()=>vPlace(6,"No image on the screen!","Virtual, erect, enlarged, on the candle's side","Candle between F₁ and O (6 cm): no image on the screen. Looking through the lens, an enlarged, erect image is seen.");
  /* glass slab */
  const sI=[300,250],sE=[347.5,350],dI=[.643,.766];
  const pt=(p,d,t)=>[p[0]+d[0]*t,p[1]+d[1]*t];
  function pin(g,p,l){mk("circle",{cx:p[0],cy:p[1],r:6,fill:"#DC2626",stroke:"#7F1D1D","stroke-width":1.5},g);
    const t=mk("text",{x:p[0]-16,y:p[1]+5,class:"lblD",style:"font-size:16px;fill:#1E293B"},g);t.textContent=l;}
  const sA=pt(sI,dI,-95),sB=pt(sI,dI,-45),sC=pt(sE,dI,45),sD=pt(sE,dI,95);
  async function S_slab(){await hideItem("sSlab");await tween(RM?60:700,t=>setOp($("sGlass"),t));
    obs("The glass slab was placed on the paper and its outline was drawn.");say("Outline drawn.");}
  async function S_pins(){await hideItem("sPins");const G=mk("g",{},$("sDyn"));pin(G,sA,"A");pin(G,sB,"B");await fadeIn(G,600);
    obs("Pins A and B were fixed on a slanting line that meets the top face of the slab.");say("Pins A and B fixed.");}
  async function S_eye(){await hideItem("sEye");const G=mk("g",{},$("sDyn"));pin(G,sC,"C");pin(G,sD,"D");
    mk("line",{x1:sD[0],y1:sD[1],x2:sD[0]+40,y2:sD[1]+48,stroke:"#2563EB","stroke-width":2,"stroke-dasharray":"4 5"},G);
    await fadeIn(G,600);obs("Looking through the slab from the other side, pins C and D were fixed in line with the images of A and B.");say("Pins C and D fixed.");}
  async function S_ruler(){await hideItem("sRuler");const g=$("sDyn"),G=mk("g",{},g);
    [[sI,-48,48],[sE,-48,48]].forEach(([p,a,b])=>mk("line",{x1:p[0],y1:p[1]+a,x2:p[0],y2:p[1]+b,stroke:"#64748B","stroke-width":2,"stroke-dasharray":"7 6"},G));
    ray(G,sA[0],sA[1],sI[0],sI[1]);ray(G,sI[0],sI[1],sE[0],sE[1]);ray(G,sE[0],sE[1],sD[0],sD[1]);
    await fadeIn(G,800);obs("Joining the pins gave the incident ray, the refracted ray inside the glass and the emergent ray. Normals were drawn at both points.");say("Rays drawn.");}
  async function S_prot(){await hideItem("sProt");const g=$("sDyn"),G=mk("g",{},g);
    const lab=(x,y,t,c)=>{const e=mk("text",{x,y,class:"lblD",style:`font-size:16px;fill:${c||"#7C3AED"}`},G);e.textContent=t;};
    lab(sI[0]-44,sI[1]-24,"∠i = 40°");lab(sI[0]+30,sI[1]+44,"∠r = 25°");lab(sE[0]+46,sE[1]+40,"∠e = 40°");
    const X=pt(sI,dI,175);mk("line",{x1:sI[0],y1:sI[1],x2:X[0],y2:X[1],stroke:"#DC2626","stroke-width":2.5,"stroke-dasharray":"5 6"},G);
    const q=pt(sE,dI,70),qx=pt(sI,dI,170);
    mk("line",{x1:q[0],y1:q[1],x2:qx[0],y2:qx[1],stroke:"#16A34A","stroke-width":4},G);
    lab((q[0]+qx[0])/2+40,(q[1]+qx[1])/2+4,"sideways shift","#16A34A");
    await fadeIn(G,800);obs("∠i = 40°, ∠r = 25° and ∠e = 40°. The emergent ray is parallel to the incident ray, but shifted sideways.");say("Angle i equals angle e.");}

  const ACTS={
    K:[{keys:["mirror"],fn:K_sun,cue:"kMir"},{keys:["candle"],fn:K_1,cue:"kCand"},{keys:["candle"],fn:K_2,cue:"kCand"},{keys:["candle"],fn:K_3,cue:"kCand"},{keys:["candle"],fn:K_4,cue:"kCand"}],
    V:[{keys:["lens"],fn:V_sun,cue:"vLens"},{keys:["candle"],fn:V_1,cue:"vCand"},{keys:["candle"],fn:V_2,cue:"vCand"},{keys:["candle"],fn:V_3,cue:"vCand"},{keys:["candle"],fn:V_4,cue:"vCand"}],
    S:[{keys:["slab"],fn:S_slab,cue:"sSlab"},{keys:["pins"],fn:S_pins,cue:"sPins"},{keys:["eye"],fn:S_eye,cue:"sEye"},{keys:["ruler"],fn:S_ruler,cue:"sRuler"},{keys:["prot"],fn:S_prot,cue:"sProt"}]
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
    c.innerHTML=`<h2>🔬 Choose an experiment</h2><p class="sub">Chapter 9 — Light: Reflection and Refraction. Tap a card to begin.</p>
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
    if(E.key!=="S"&&innerHeight>innerWidth&&innerWidth<700)setTimeout(()=>say("Tip: turn your phone sideways for a bigger view.",3600),400);
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
  function fitView(){const r=$("scene").getBoundingClientRect();const tall=r.height/r.width>1.05;svg.setAttribute("viewBox",tall?(EXP&&EXP.key==="S"?"60 150 600 420":"14 150 672 390"):"0 86 700 534");}
  addEventListener("resize",()=>{fitView();fitText($("ceq"));});fitView();
  chooser();
})();

