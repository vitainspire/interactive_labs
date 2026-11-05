/* Lesson 2: Acids, Bases and Salts — lab.html (Digital Lab) experiment script.
   Bespoke, self-contained logic for this lesson's experiment (Activity 2.15:
   heating copper sulphate crystals). Kept verbatim as a single file per the
   task's instructions, rather than split further; it does not use
   ../shared/app.js (lab.html does not load it — only theme.css + this file,
   matching the Lesson 1 pilot's lab.html pattern). */
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
  /* ---------- build static bits ---------- */
  const BLUE="url(#gBlue)",WHITE="url(#gWhite)";
  // crystal shapes in the pile on the bench
  const PILE=[[-30,2,13],[-10,-6,16],[12,0,14],[30,4,12],[-20,-16,11],[3,-20,12],[22,-14,11]];
  (function(){
    const g=$("pileBits");
    PILE.forEach(([x,y,r],i)=>{
      const p=mk("path",{d:xtal(r),transform:`translate(${x} ${y}) rotate(${i*37%60-30})`,fill:BLUE,stroke:"#0E3F7E","stroke-width":1.5},g);
      p.dataset.bit="1";
    });
  })();
  function xtal(r){ // a little rhombic crystal
    const w=r*.72;
    return `M0,${-r} L${w},${-r*.3} L${w*.7},${r} L${-w*.7},${r} L${-w},${-r*.3} Z`;
  }
  // crystals inside the tube (hidden until added)
  const inBits=[];
  (function(){
    const g=$("cryst");
    const rows=[[318,334,10],[330,338,12],[342,334,10],[324,322,10],[336,322,10]];
    rows.forEach(([x,y,r],i)=>{
      const p=mk("path",{d:xtal(r),transform:`translate(${x} ${y}) rotate(${i*41%70-35})`,fill:BLUE,stroke:"#0E3F7E","stroke-width":1.5,opacity:0},g);
      inBits.push(p);
    });
  })();

  /* ---------- movable things ---------- */
  const M={
    cry :{el:$("cryPile"), home:{x:248,y:556}, target:{x:330,y:300}},
    drop:{el:$("dropper"), home:{x:468,y:516}, target:{x:330,y:200}}
  };
  function setPose(m){m.el.setAttribute("transform",`translate(${m.pose.x} ${m.pose.y})`);}
  for(const k in M){const m=M[k];m.pose={...m.home};setPose(m);}
  function lower(m){const L=m.el.parentNode;L.appendChild(m.el);}
  function raise(m){$("Ltop").appendChild(m.el);}

  /* ---------- state ---------- */
  const TASK={
    1:"Drag the blue copper sulphate crystals into the dry boiling tube.",
    2:"Tap the burner to heat the crystals.",
    3:"Tap the boiling tube to look closely at its cool upper walls.",
    4:"Drag the dropper and add 2 or 3 drops of water."
  };
  const SPOKEN={
    1:"Step 1. Drag the blue copper sulphate crystals into the dry boiling tube.",
    2:"Step 2. Tap the burner to heat the crystals.",
    3:"Step 3. Tap the boiling tube to look closely at its cool upper walls.",
    4:"Step 4. Drag the dropper and add two or three drops of water."
  };
  let step=1,started=false,busy=false,lit=false,drag=null,toastT=null;
  function setStep(n,pre,queue){
    step=n;
    $("pill").textContent=n<=4?`Step ${n} / 4`:"Done ✓";
    $("tn").textContent=n<=4?n:"✓";
    $("tt").textContent=n<=4?TASK[n]:"Experiment complete. Well done!";
    $("task").classList.toggle("done",n>4);
    [...$("steps").children].forEach((li,i)=>{
      li.classList.toggle("done",i+1<n);
      li.classList.toggle("now",i+1===n);
    });
    hint();
    if(n<=4&&started)Say.say((pre||"")+SPOKEN[n],queue);
  }
  function hint(){
    for(const k in M)M[k].el.classList.remove("hint");
    $("burner").classList.remove("hint");$("Ltube").classList.remove("hint");
    if(busy)return;
    if(step===1)M.cry.el.classList.add("hint");
    else if(step===2)$("burner").classList.add("hint");
    else if(step===3)$("Ltube").classList.add("hint");
    else if(step===4)M.drop.el.classList.add("hint");
  }
  function toast(t,quiet){if(!quiet)Say.say(t);const e=$("toast");e.textContent=t;e.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove("on"),2800);}
  function note(t){
    const ul=$("obs");const em=ul.querySelector(".empty");if(em)em.remove();
    const li=document.createElement("li");li.textContent=t;ul.appendChild(li);
  }

  /* ---------- water droplets on the tube wall ---------- */
  const dropEls=[];
  function makeDrops(){
    const g=$("drops");
    const spots=[[318,186],[340,178],[325,204],[344,210],[316,226],[336,236],[327,166],[345,194]];
    spots.forEach(([x,y],i)=>{
      const c=mk("ellipse",{cx:x,cy:y,rx:0,ry:0,fill:"#BFDBFE",stroke:"#93C5FD","stroke-width":1,opacity:0},g);
      dropEls.push({c,x,y,r:2.6+Math.random()*2.4,d:i*70});
    });
  }
  makeDrops();
  function showDrops(){
    return Promise.all(dropEls.map(d=>wait(d.d).then(()=>tween(420,t=>{
      d.c.setAttribute("rx",d.r*t);d.c.setAttribute("ry",d.r*1.18*t);d.c.setAttribute("opacity",.95*t);
    },easeOut))));
  }
  function steamPuff(){
    const g=$("steam");
    FXP.smoke(g,330,318,{color:"steam",n:8,size:9,rise:170,drift:6,spread:10,gap:130,life:1.8,op:1});
    setTimeout(()=>FXP.smoke($("fx"),330,126,{color:"steam",n:5,size:24,rise:120,drift:60,spread:12,gap:200,life:2.4,op:1}),900);
  }

  /* ---------- the four steps ---------- */
  async function doAddCrystals(){
    busy=true;hint();
    const m=M.cry;raise(m);
    await tween(560,t=>{m.pose.x=lerp(m.home.x,m.target.x,t);m.pose.y=lerp(m.home.y,m.target.y-70,t);setPose(m);});
    await tween(280,t=>{m.pose.y=lerp(m.target.y-70,m.target.y,t);setPose(m);});
    // tip the crystals in
    [...$("pileBits").children].forEach(p=>p.setAttribute("opacity",0));
    m.el.setAttribute("opacity",0);
    Snd.clink();
    for(let i=0;i<inBits.length;i++){
      const p=inBits[i];
      setTimeout(()=>{p.setAttribute("opacity",1);Snd.clink();},i*110);
    }
    await wait(inBits.length*110+200);
    note("The crystals are blue and look completely dry.");
    toast("Blue crystals are in the dry tube.");
    m.pose={...m.home};setPose(m);lower(m);
    busy=false;setStep(2);
  }

  async function doHeat(){
    busy=true;hint();
    lit=true;{const f=$("flame");if(!f.__fx)f.__fx=FXP.flame(f,330,408,{type:"burner",w:18,h:92});f.setAttribute("opacity",1);}
    Snd.strike();Snd.fizzStart();Snd.fizzLevel(.03);
    toast("The tube is getting hot…",true);
    Say.say("The crystals are being heated.");
    await wait(900);
    steamPuff();
    // blue -> white
    await tween(2400,t=>{
      inBits.forEach((p,i)=>{
        const s=Math.min(1,Math.max(0,(t-i*.08)/.6));
        p.setAttribute("fill",s>.5?WHITE:BLUE);
        p.setAttribute("stroke",s>.5?"#9AA3AE":"#0E3F7E");
      });
    },x=>x);
    steamPuff();
    note("On heating, the blue colour slowly turned white.");
    toast("Blue → white. The salt has lost something!");
    await wait(600);
    Snd.fizzStop();$("flame").setAttribute("opacity",0);lit=false;
    busy=false;setStep(3);
  }

  async function doLook(){
    busy=true;hint();
    Say.say("Look carefully at the cool upper part of the tube.");
    await showDrops();
    Snd.ok();
    note("Water droplets appeared on the cool upper walls of the tube.");
    note("This water came out of the crystals themselves.");
    toast("Water droplets! The dry-looking crystals had water inside.");
    busy=false;setStep(4);
  }

  async function doAddWater(){
    busy=true;hint();
    const m=M.drop;raise(m);
    await tween(600,t=>{m.pose.x=lerp(m.home.x,m.target.x,t);m.pose.y=lerp(m.home.y,m.target.y,t);setPose(m);});
    Snd.pour(1.1);
    for(let i=0;i<3;i++){
      const c=mk("circle",{cx:330,cy:215,r:5,fill:"#60A5FA"},$("fx"));
      setTimeout(()=>tween(430,t=>{c.setAttribute("cy",215+t*110);c.setAttribute("opacity",1-t*.4);},t=>t*t).then(()=>c.remove()),i*280);
    }
    await wait(900);
    // white -> blue again
    await tween(1500,t=>{
      inBits.forEach((p,i)=>{
        const s=Math.min(1,Math.max(0,(t-i*.08)/.6));
        p.setAttribute("fill",s>.5?BLUE:WHITE);
        p.setAttribute("stroke",s>.5?"#0E3F7E":"#9AA3AE");
      });
    },x=>x);
    flash(330,332);
    note("On adding water, the blue colour came back.");
    toast("The blue colour is back!");
    m.pose={...m.home};setPose(m);lower(m);
    $("concl").hidden=false;
    busy=false;setStep(5);
    await wait(RM?500:5000);
    finish();
  }

  /* ---------- finish ---------- */
  function finish(){
    confetti();Snd.fan();
    const card=$("card");
    card.className="card resc res";
    card.innerHTML=`
      <h2>🎉 Experiment complete!</h2>
      <div class="eqbig">CuSO₄·5H₂O &nbsp;→&nbsp; CuSO₄ + 5H₂O</div>
      <div class="word">Blue copper sulphate → White copper sulphate + Water</div>
      <ul>
        <li>💧 <span>The dry-looking crystals had <b>water of crystallisation</b> inside them.</span></li>
        <li>🔥 <span>On heating, the blue crystals turned <b>white</b> and water collected on the tube.</span></li>
        <li>🔁 <span>On adding water, the <b>blue colour came back</b>.</span></li>
        <li>5️⃣ <span>One formula unit of copper sulphate holds <b>5 water molecules</b>.</span></li>
      </ul>
      <div class="row">
        <button class="alt" id="again">↺ Do it again</button>
        <button class="next" id="quiz">📝 Check yourself</button>
      </div>`;
    $("ov").hidden=false;
    Say.say("Well done! The experiment is complete. Blue copper sulphate crystals contain five water molecules, called water of crystallisation. On heating, this water is driven out and the crystals turn white. When water is added again, the blue colour comes back. So crystals that look dry are not really dry.",true);
    const eb=card.querySelector(".eqbig");
    $("again").addEventListener("click",()=>{$("ov").hidden=true;resetAll("Let us do it again. ");});
    $("quiz").addEventListener("click",startQuiz);
    $("chk").hidden=false;
  }
  $("chk").addEventListener("click",()=>{$("ov").hidden=false;startQuiz();});

  /* ---------- quiz ---------- */
  const QZ=[
    {q:"What colour are copper sulphate crystals before heating?",o:[["Blue",1],["White",0],["Green",0],["Black",0]],
     r:"They are blue because of the water of crystallisation."},
    {q:"What colour do they become after heating?",o:[["White",1],["Blue",0],["Red",0],["Yellow",0]],
     r:"Heating drives out the water, so they turn white."},
    {q:"Where did the water droplets in the tube come from?",o:[["From the crystals themselves",1],["From the air",0],["From the flame",0],["From the glass",0]],
     r:"That water was the water of crystallisation inside the crystals.",
     s:"Where did the water droplets in the tube come from?"},
    {q:"How many water molecules are there in one formula unit of copper sulphate?",o:[["5",1],["2",0],["10",0],["Half",0]],
     r:"The formula is CuSO₄·5H₂O, so there are 5.",
     s:"How many water molecules are there in one formula unit of copper sulphate?"},
    {q:"What happens when water is added to the white powder?",o:[["The blue colour comes back",1],["It turns black",0],["Nothing happens",0],["It catches fire",0]],
     r:"The salt takes the water back and becomes blue again."}
  ];
  let qi=0,right=0;
  function startQuiz(){qi=0;right=0;showQ();}
  function showQ(){
    const Q=QZ[qi],card=$("card");
    card.className="card";
    card.innerHTML=`<span class="tag">📝 Check yourself ${qi+1} / ${QZ.length}</span>
      <p class="q"></p><div class="opts"></div>
      <div class="foot"><div class="msg"></div><button class="next" hidden>Next</button></div>`;
    card.querySelector(".q").textContent=Q.q;Say.say(Q.s||Q.q);
    const opts=card.querySelector(".opts"),msg=card.querySelector(".msg"),nxt=card.querySelector(".next");
    Q.o.forEach(([txt,ok])=>{
      const b=document.createElement("button");b.className="btn";b.textContent=txt;
      b.addEventListener("click",()=>{
        [...opts.children].forEach(x=>{x.disabled=true;if(x.textContent===Q.o.find(o=>o[1])[0])x.classList.add("ok");});
        if(ok){right++;Snd.ok();msg.className="msg ok";msg.textContent="✅ "+Q.r;Say.say("Correct! "+Q.r);}
        else{b.classList.add("bad");Snd.bad();msg.className="msg bad";msg.textContent="❌ "+Q.r;Say.say("Not correct. "+Q.r);}
        nxt.hidden=false;nxt.textContent=qi<QZ.length-1?"Next":"See my score";
      });
      opts.appendChild(b);
    });
    nxt.addEventListener("click",()=>{qi++;qi<QZ.length?showQ():showScore();});
    $("ov").hidden=false;
  }
  function showScore(){
    const good=right>=4,card=$("card");
    card.className="card";
    if(good){confetti();Snd.fan();}
    card.innerHTML=`<h2>${good?"🌟":"👍"} You scored ${right} / ${QZ.length}</h2>
      <p>${good?"Great work! You understand water of crystallisation.":"Good try! Do the experiment once more and read the lab record."}</p>
      <div class="row" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="alt" id="requiz" style="font:inherit;font-weight:700;border:2px solid var(--line);border-radius:14px;background:var(--bg);color:var(--ink);padding:.3em 1em;cursor:pointer">↺ Try the quiz again</button>
        <button class="next" id="close">Back to the lab</button>
      </div>`;
    Say.say(`You scored ${right} out of ${QZ.length}. `+(good?"Great work! You understand water of crystallisation.":"Good try! Do the experiment once more and read the lab record."));
    $("requiz").addEventListener("click",startQuiz);
    $("close").addEventListener("click",()=>{$("ov").hidden=true;});
  }

  /* ---------- effects ---------- */
  function flash(x,y){
    const fx=$("fx");
    const c=mk("circle",{cx:x,cy:y,r:6,fill:"url(#gFlash)"},fx);
    tween(600,t=>{c.setAttribute("r",6+t*80);c.setAttribute("opacity",1-t);},easeOut).then(()=>c.remove());
  }
  function confetti(){return;/*no confetti in labs*/
    if(RM)return;
    const box=document.createElement("div");box.className="cf";document.body.appendChild(box);
    const cols=["#1E6FD9","#60A5FA","#FDE047","#F97316","#10B981","#DB2777"];
    for(let i=0;i<90;i++){
      const s=document.createElement("i");
      s.style.left=Math.random()*100+"%";
      s.style.width=(5+Math.random()*7)+"px";
      s.style.height=(8+Math.random()*10)+"px";
      s.style.background=cols[i%cols.length];
      s.style.setProperty("--sx",(Math.random()*90-45)+"px");
      s.style.setProperty("--r",(540+Math.random()*720)+"deg");
      s.style.setProperty("--d",(2.6+Math.random()*1.8)+"s");
      s.style.setProperty("--dl",(Math.random()*.7)+"s");
      box.appendChild(s);
    }
    setTimeout(()=>box.remove(),5600);
  }

  /* ---------- input: drag or tap ---------- */
  function pt(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());}
  function near(m,p,r){return Math.hypot(p.x-m.target.x,p.y-m.target.y)<r;}
  function act(key){
    if(busy)return;
    if(key==="cry"&&step===1)doAddCrystals();
    else if(key==="burner"&&step===2)doHeat();
    else if(key==="tube"&&step===3)doLook();
    else if(key==="drop"&&step===4)doAddWater();
    else wrong(key);
  }
  function wrong(key){
    const msgs={
      cry:"The crystals are already in the tube.",
      burner:step===1?"First put the crystals in the tube.":"The heating is done. Look at the tube.",
      tube:step<3?"Put the crystals in and heat them first.":"You have already looked at the tube.",
      drop:step<4?"Not yet. Finish the heating first.":"The water is already added."
    };
    toast(msgs[key]||"Try the step shown above.");
  }
  svg.addEventListener("pointerdown",e=>{
    const g=e.target.closest("[data-m],[data-t]");if(!g||busy)return;
    Snd.init();
    if(g.dataset.t){act(g.dataset.t);return;}
    const key=g.dataset.m,m=M[key];
    const p=pt(e);
    drag={key,m,dx:p.x-m.pose.x,dy:p.y-m.pose.y,moved:false};
    raise(m);svg.setPointerCapture(e.pointerId);
  });
  svg.addEventListener("pointermove",e=>{
    if(!drag)return;
    const p=pt(e);
    drag.m.pose.x=p.x-drag.dx;drag.m.pose.y=p.y-drag.dy;setPose(drag.m);
    if(Math.abs(p.x-drag.dx-drag.m.home.x)>6||Math.abs(p.y-drag.dy-drag.m.home.y)>6)drag.moved=true;
  });
  svg.addEventListener("pointerup",e=>{
    if(!drag)return;
    const d=drag;drag=null;
    try{svg.releasePointerCapture(e.pointerId);}catch(err){}
    const p=pt(e);
    if(!d.moved){d.m.pose={...d.m.home};setPose(d.m);lower(d.m);act(d.key);return;}
    if(near(d.m,p,120)){d.m.pose={...d.m.home};setPose(d.m);lower(d.m);act(d.key);}
    else{tween(260,t=>{d.m.pose.x=lerp(d.m.pose.x,d.m.home.x,t);d.m.pose.y=lerp(d.m.pose.y,d.m.home.y,t);setPose(d.m);},easeOut).then(()=>{d.m.pose={...d.m.home};setPose(d.m);lower(d.m);});}
  });
  svg.addEventListener("keydown",e=>{
    if(e.key!=="Enter"&&e.key!==" ")return;
    const g=e.target.closest("[data-m],[data-t]");if(!g)return;
    e.preventDefault();Snd.init();act(g.dataset.t||g.dataset.m);
  });

  /* ---------- layout: wide and tall ---------- */
  const ro=new ResizeObserver(es=>{
    for(const en of es){
      const r=en.contentRect;if(!r.width||!r.height)continue;
      const tall=r.height/r.width>1.15;
      svg.classList.toggle("tall",tall);
      svg.setAttribute("viewBox",tall?"176 110 356 510":"0 0 700 620");
    }
  });
  ro.observe($("scene"));

  /* ---------- start and reset ---------- */
  function resetAll(pre){
    gen++;Snd.fizzStop();Say.stop();drag=null;lit=false;
    $("fx").innerHTML="";$("steam").innerHTML="";
    for(const k in M){const m=M[k];m.pose={...m.home};setPose(m);lower(m);m.el.setAttribute("opacity",1);}
    [...$("pileBits").children].forEach(p=>p.setAttribute("opacity",1));
    inBits.forEach(p=>{p.setAttribute("opacity",0);p.setAttribute("fill",BLUE);p.setAttribute("stroke","#0E3F7E");});
    dropEls.forEach(d=>{d.c.setAttribute("rx",0);d.c.setAttribute("ry",0);d.c.setAttribute("opacity",0);});
    $("flame").setAttribute("opacity",0);
    $("obs").innerHTML='<li class="empty">Your observations will appear here.</li>';
    $("concl").hidden=true;
    $("task").classList.remove("done");$("chk").hidden=true;
    const card=$("card");card.className="card";
    card.innerHTML=`<span class="tag">📘 Textbook Activity 2.15</span>
      <h2>Are the crystals of salts really dry?</h2>
      <p class="sub"><b>Aim:</b> To show that crystals which look dry contain water of crystallisation.</p>
      <p>You will use blue copper sulphate crystals, a dry boiling tube, a burner and a dropper of water. Drag each thing, or just tap it.</p>
      <p class="safe">🥽 In a real lab, wear goggles. Hold the tube with a holder. Do this only with your teacher.</p>
      <button class="next big" id="start2">▶ Start experiment</button>`;
    $("start2").addEventListener("click",()=>{$("ov").hidden=true;});
    started=true;setStep(1,pre||"");busy=false;
  }
  $("start").addEventListener("click",()=>{
    Snd.init();if(musOn)Snd.music(true);$("ov").hidden=true;started=true;
    setStep(1,"Welcome to the Digital Lab. Today we will see whether crystals that look dry are really dry. ");
  });
  $("rst").addEventListener("click",()=>{$("ov").hidden=true;resetAll("Let us start again. ");toast("New experiment. Start with the crystals.",true);});
  setStep(1);
})();
