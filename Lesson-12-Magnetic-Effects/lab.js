/* Lesson 12: Magnetic Effects of Electric Current -- lab.html (Digital Lab)
   bespoke experiment script. This page does not use the shared games-tab
   engine (../shared/app.js) -- it has its own self-contained sound engine,
   speech helper and experiment logic, same as Lesson 1's lab.js. Relocated
   verbatim from the original inline <script>. */
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
  {key:"C",ic:"🧭",tag:"📘 Sections 12.1–12.2",name:"Oersted's experiment",sub:"Current makes a magnetic field",
   blurb:"Pass current through a wire over a compass. Watch the needle turn.",
   intro:"A straight copper wire XY lies over a compass, along its needle, from north to south. You will pass a current through it, make the current bigger, reverse it, and then stop it. Watch the compass needle every time.",
   safe:"🥽 Keep the current on only for a short time. The wire can get warm.",
   aim:"To show that an electric current produces a magnetic field, and that its direction depends on the direction of the current.",
   steps:["Close the key: current north to south","Increase the current","Reverse the current","Open the key"],
   stepTasks:["Tap the plug key. Let current flow through XY from north to south.",
     "Tap the rheostat. Make the current bigger.",
     "Tap the battery. Reverse its connections so the current flows south to north.",
     "Tap the plug key again. Stop the current."],
   conc:{w1:"When current flowed from north to south, the north pole of the needle moved east. A bigger current gave a bigger deflection.",
     eq:"Electric current → magnetic field",
     w2:"When the current was reversed, the needle moved west, so the field was reversed. When the current stopped, the needle pointed north again."},
   quiz:[
    {q:"Why did the compass needle move when the key was closed?",a:"The current made a magnetic field around the wire",t:["The wire was hot","The compass was pushed","The battery is a magnet"],w:"This is Oersted's discovery (1820).",lay:"col"},
    {q:"Current flowed from north to south. Which way did the north pole of the needle move?",a:"East",t:["West","It did not move","It spun round"],w:"The field under the wire points east."},
    {q:"When the current was made bigger, the deflection",a:"Increased",t:["Decreased","Stayed the same","Became zero"],w:"A bigger current gives a stronger field."},
    {q:"When the current was reversed, the needle moved",a:"West",t:["East","Up","Nowhere"],w:"Reversing the current reverses the field."},
    {q:"When the key was opened, the needle",a:"Pointed north again",t:["Stayed turned to the west","Pointed east","Broke"],w:"No current, no magnetic field from the wire."}]},
  {key:"F",ic:"👈",tag:"📘 Section 12.3",name:"Force on a current-carrying rod",sub:"Force in a magnetic field",
   blurb:"An aluminium rod between the poles of a magnet is pushed sideways. Use Fleming's rule.",
   intro:"A light aluminium rod AB hangs between the poles of a strong horse-shoe magnet, with the N pole below and the S pole above. You will pass a current through it, reverse the current, flip the magnet, and then use Fleming's left-hand rule.",
   safe:"🥽 Pass the current only for a moment. Keep the magnet away from phones and watches.",
   aim:"To show that a current-carrying conductor in a magnetic field experiences a force, and to find its direction.",
   steps:["Pass current from B to A","Reverse the current","Flip the magnet","Check with Fleming's left-hand rule"],
   stepTasks:["Tap the plug key. Pass a current through the rod from B to A.",
     "Tap the battery. Reverse the current so it flows from A to B.",
     "Tap the magnet. Flip it so the N pole is above and the S pole below.",
     "Tap the left hand. Check the direction of the force with Fleming's left-hand rule."],
   conc:{w1:"With current from B to A and the field upward, the rod was pushed to the left. Reversing the current reversed the force, and flipping the magnet reversed it again.",
     eq:"Force ⟂ current and ⟂ field (Fleming's left-hand rule)",
     w2:"A current-carrying conductor in a magnetic field feels a force. Its direction depends on the directions of both the current and the field."},
   quiz:[
    {q:"Why did the aluminium rod move when the key was closed?",a:"A force acts on a current-carrying conductor in a magnetic field",t:["The rod became hot","Air pushed it","The magnet attracts aluminium"],w:"Ampere predicted this force.",lay:"col"},
    {q:"When the current was reversed, the rod moved",a:"The other way",t:["The same way","Upwards","Not at all"],w:"Reversing the current reverses the force."},
    {q:"When the magnet's poles were swapped, the force",a:"Reversed",t:["Stayed the same","Became zero","Doubled"],w:"Reversing the field also reverses the force."},
    {q:"In Fleming's left-hand rule, the thumb shows the",a:"Force (motion)",t:["Magnetic field","Current","Voltage"],w:"First finger: field. Second finger: current."},
    {q:"The force on the rod is largest when the current is",a:"Perpendicular to the magnetic field",t:["Parallel to the field","Zero","Along the stand"],w:"Here the rod lies across the field, so the force is largest.",lay:"col"}]}
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
    ["C","F"].forEach(x=>{const g=$("sc"+x);if(!g)return;
      if(x===k){g.style.display="";g.setAttribute("opacity",1);}else{g.style.display="none";g.setAttribute("opacity",0);}});
  }

  // ======================= resets =======================
  function flowOn(id){const p=$(id);if(!p||$(id+"F"))return;const f=p.cloneNode();f.id=id+"F";f.setAttribute("stroke","#FBBF24");f.setAttribute("stroke-width","3");f.classList.add("flow");p.after(f);}
  function flowOff(id){const f=$(id+"F");if(f)f.remove();}
  let cAng=0,cRev=false,fI=1,fB=1,fX=0;
  function cCells(rev){const g=$("cCells");g.innerHTML="";const xs=[486,500,514];
    xs.forEach((x,k)=>{const L=rev?x+9:x,S=rev?x:x+9;mk("rect",{x:x-5,y:429,width:18,height:52,fill:"var(--wall)"},g);
      mk("line",{x1:L,y1:431,x2:L,y2:479,stroke:"var(--muted)","stroke-width":3.5},g);mk("line",{x1:S,y1:443,x2:S,y2:467,stroke:"var(--muted)","stroke-width":7},g);
      if(k<2)mk("line",{x1:x+9,y1:455,x2:x+14,y2:455,stroke:"var(--muted)","stroke-width":3.5},g);});
    const p=mk("text",{x:rev?530:480,y:425,class:"lblD",style:"font-size:16px"},g);p.textContent="+";
    const m=mk("text",{x:rev?480:530,y:425,class:"lblD",style:"font-size:16px"},g);m.textContent="−";}
  function cNeedle(a){cAng=a;$("cNeedle").setAttribute("transform",`rotate(${a.toFixed(1)} 330 340)`);}
  function resetC(){cRev=false;cCells(false);cNeedle(0);setOp($("cKeyPlug"),0);setOp($("cArrow"),0);$("cAv").textContent="–";$("cKnob").setAttribute("cx",575);flowOff("cWire");setOp($("cBoard"),0);}
  function resetF(){fI=1;fB=1;fX=0;fPlace(0);["fIarr","fForce","fField"].forEach(i=>$(i).innerHTML="");fMagnet(1);setOp($("fPlug"),0);setOp($("fHand"),0);$("fHand").innerHTML="";$("fBattL").textContent="+  −";setOp($("fBoard"),0);fFieldDraw();}
  const RESET={C:resetC,F:resetF};

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
  const num=id=>parseFloat($(id).textContent)||0;

  async function count(id,from,to,dp,unit,ms){await tween(RM?60:ms||700,t=>$(id).textContent=(from+(to-from)*t).toFixed(dp)+" "+unit);}
  async function swing(to,ms){const a=cAng;await tween(RM?60:ms||1100,t=>{const e=t<1?1-Math.pow(1-t,2)*Math.cos(t*9)*1:1;cNeedle(a+(to-a)*Math.min(1,e));});cNeedle(to);}

  // ======================= C: Oersted =======================
  function cArrow(down){$("cArrP").setAttribute("d",down?"M350 236 V268 M342 258 L350 272 L358 258":"M350 272 V240 M342 250 L350 236 L358 250");setOp($("cArrow"),1);}
  async function C_key(){if(step===3)return C_off();await tween(RM?60:400,t=>setOp($("cKeyPlug"),t));flowOn("cWire");cArrow(true);
    await count("cAv",0,1,1,"A");await swing(35);
    board("c","The needle moves! Its north pole turns east.","Current from north to south makes a magnetic field.");
    obs("Key closed: current flowed from north to south. The north pole of the needle moved towards the east.");tell("The needle moves. Its north pole turns east.");}
  async function C_rheo(){const k=$("cKnob");await tween(RM?60:500,t=>k.setAttribute("cx",(575-60*t).toFixed(1)));await count("cAv",1,2,1,"A");await swing(58,800);
    board("c","Bigger current, bigger deflection","A stronger current makes a stronger magnetic field.","ok");
    obs("The current was increased from 1 A to 2 A. The deflection of the needle increased.");tell("More current, more deflection.");}
  async function C_batt(){flowOff("cWire");setOp($("cArrow"),0);await swing(0,500);cRev=true;cCells(true);await wait(RM?50:300);
    flowOn("cWire");cArrow(false);await swing(-58);
    board("c","Current reversed: now the needle turns west!","The magnetic field is reversed too.","ok");
    obs("The battery connections were reversed, so the current flowed from south to north. The needle now moved towards the west.");tell("The current is reversed. The needle turns west.");}
  async function C_off(){await tween(RM?60:400,t=>setOp($("cKeyPlug"),1-t));flowOff("cWire");setOp($("cArrow"),0);$("cAv").textContent="0.0 A";await swing(0);
    board("c","No current: the needle points north again","The wire makes a magnetic field only while current flows.");
    obs("When the key was opened, the current stopped and the needle came back to point north.");tell("No current. The needle points north again.");}

  // ======================= F: force on a rod =======================
  function fPlace(dx){fX=dx;$("fRod").setAttribute("transform",`translate(${dx.toFixed(1)} 0)`);$("fW1").setAttribute("x2",(318+dx).toFixed(1));$("fW2").setAttribute("x2",(384+dx).toFixed(1));}
  function fMagnet(b){const up=b>0;$("fTop").setAttribute("fill",up?"#3B82F6":"#DC2626");$("fTop").setAttribute("stroke",up?"#1E3A8A":"#7F1D1D");
    $("fBot").setAttribute("fill",up?"#DC2626":"#3B82F6");$("fBot").setAttribute("stroke",up?"#7F1D1D":"#1E3A8A");$("fTopL").textContent=up?"S":"N";$("fBotL").textContent=up?"N":"S";}
  function fFieldDraw(){const g=$("fField");g.innerHTML="";[262,436].forEach(x=>{const y1=fB>0?410:306,y2=fB>0?306:410;
      mk("line",{x1:x,y1,x2:x,y2,stroke:"#2563EB","stroke-width":2.5,"stroke-dasharray":"6 5"},g);
      mk("path",{d:fB>0?`M${x-7} ${y2+12} L${x} ${y2} L${x+7} ${y2+12}`:`M${x-7} ${y2-12} L${x} ${y2} L${x+7} ${y2-12}`,fill:"none",stroke:"#2563EB","stroke-width":2.5},g);});
    T(g,436,fB>0?318:406,"",null,12);}
  function fIDraw(){const g=$("fIarr");g.innerHTML="";const towardA=fI>0;
    const d=towardA?"M380 324 L322 352 M330 340 L320 353 L336 356":"M322 352 L380 324 M368 320 L382 323 L374 336";
    mk("path",{d,fill:"none",stroke:"#DC2626","stroke-width":3.5,"stroke-linecap":"round"},g);T(g,350,318,towardA?"I: B → A":"I: A → B","#DC2626",14);}
  function fForceDraw(F){const g=$("fForce");g.innerHTML="";const x=F<0?250:450,dir=F<0?-1:1;
    mk("path",{d:`M${x} 362 h${dir*-0} l0 0`},g);mk("line",{x1:x-dir*0,y1:362,x2:x+dir*60,y2:362,stroke:"#7C3AED","stroke-width":5,"stroke-linecap":"round"},g);
    mk("path",{d:`M${x+dir*72} 362 l${-dir*16} -9 v18Z`,fill:"#7C3AED"},g);T(g,x+dir*36,350,"Force","#7C3AED",15);}
  async function fMove(){const F=-fI*fB,to=F*48;fIDraw();const a=fX;await tween(RM?60:900,t=>fPlace(a+(to-a)*(1-Math.pow(1-t,3))));fForceDraw(F);return F;}
  async function F_key(){await tween(RM?60:400,t=>setOp($("fPlug"),t));const F=await fMove();
    board("f","The rod is pushed to the left!","A force acts on the current-carrying rod in the magnetic field.");
    obs("Current flowed from B to A with the field upward. The rod was pushed to the left.");tell("The rod is pushed to the left.");}
  async function F_batt(){fI=-1;$("fBattL").textContent="−  +";$("fForce").innerHTML="";await fMove();
    board("f","Current reversed: the rod moves to the right!","Reversing the current reverses the force.","ok");
    obs("The current was reversed (A to B). The rod was now pushed to the right.");tell("The current is reversed. The rod moves to the right.");}
  async function F_mag(){fB=-1;$("fForce").innerHTML="";await tween(RM?60:500,t=>setOp($("fMag"),1-t*0.7));fMagnet(-1);fFieldDraw();await tween(RM?60:400,t=>setOp($("fMag"),0.3+t*0.7));
    await fMove();board("f","Magnet flipped: the rod moves left again!","Reversing the field also reverses the force.","ok");
    obs("The magnet was flipped (N above, S below), so the field pointed down. With current A to B, the rod was pushed to the left.");tell("The field is reversed. The rod moves to the left.");}
  async function F_hand(){await hideItem("fHandT");const g=$("fHand");g.innerHTML="";const O=[580,370];
    mk("rect",{x:494,y:262,width:198,height:196,rx:14,fill:"#FFFFFF",stroke:"#CBD5E1","stroke-width":2.5},g);
    mk("ellipse",{cx:O[0],cy:O[1],rx:26,ry:20,fill:"#F5C9A0",stroke:"#9A5B2E","stroke-width":2},g);
    const arm=(x,y,c,l,tx,ty)=>{mk("line",{x1:O[0],y1:O[1],x2:x,y2:y,stroke:"#F5C9A0","stroke-width":10,"stroke-linecap":"round"},g);
      mk("line",{x1:O[0],y1:O[1],x2:x,y2:y,stroke:c,"stroke-width":3.5},g);const a=Math.atan2(y-O[1],x-O[0]);
      mk("path",{d:`M${x+8*Math.cos(a)} ${y+8*Math.sin(a)} L${x-8*Math.cos(a)+7*Math.sin(a)} ${y-8*Math.sin(a)-7*Math.cos(a)} L${x-8*Math.cos(a)-7*Math.sin(a)} ${y-8*Math.sin(a)+7*Math.cos(a)}Z`,fill:c},g);
      T(g,tx,ty,l,c,14);};
    arm(O[0],O[1]+52*fB*-1,"#2563EB","Field (first finger)",O[0],fB>0?O[1]-62:O[1]+76);
    arm(O[0]+38*-1*fI,O[1]+30*fI,"#DC2626","Current",O[0]+40*-fI+(fI>0?10:0),O[1]+52);
    arm(O[0]-62,O[1],"#7C3AED","Force (thumb)",O[0]-30,O[1]-30);
    T(g,593,284,"Fleming's left-hand rule","#1E293B",14);
    await fadeIn(g,700);
    board("f","Fleming's left-hand rule: thumb = force","First finger: field. Second finger: current.","ok");
    obs("Fleming's left-hand rule: first finger along the field, second finger along the current; the thumb gives the force on the rod.");
    tell("First finger, field. Second finger, current. Thumb, force.");}

  const ACTS={
    C:[{keys:["key"],fn:C_key,cue:"cKey"},{keys:["rheo"],fn:C_rheo,cue:"cRheo"},{keys:["batt"],fn:C_batt,cue:"cBatt"},{keys:["key"],fn:C_off,cue:"cKey"}],
    F:[{keys:["key"],fn:F_key,cue:"fKey"},{keys:["batt"],fn:F_batt,cue:"fBatt"},{keys:["magnet"],fn:F_mag,cue:"fMag"},{keys:["hand"],fn:F_hand,cue:"fHandT"}]
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
    c.innerHTML=`<h2>🔬 Choose an experiment</h2><p class="sub">Chapter 12 — Magnetic Effects of Electric Current. Tap a card to begin.</p>
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
  function fitView(){const r=$("scene").getBoundingClientRect();const tall=r.height/r.width>1.05;svg.setAttribute("viewBox",tall?"14 140 680 440":"0 86 700 534");}
  addEventListener("resize",()=>{fitView();fitText($("ceq"));});fitView();
  chooser();
})();
