/* Lesson 11: Electricity — lab.html (Digital Lab) experiment script.
   This page is fully self-contained (its own $, sound engine, voice-over,
   SVG scene drawing and experiment logic) and does not use ../shared/app.js;
   that file's quiz-tab engine is for games.html pages only. */
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
  {key:"O",ic:"📈",tag:"📘 Section 11.4",name:"Ohm's law",sub:"Verifying Ohm's law",
   blurb:"Move the rheostat, read V and I, and draw the V–I graph.",
   intro:"You will close the circuit and read the voltmeter and the ammeter. Then you will move the rheostat three times to change the current. Finally, you will plot V against I on graph paper.",
   safe:"🥽 Open the plug key after each reading so the wire does not heat up.",
   aim:"To find the relation between the potential difference across a nichrome wire and the current through it.",
   steps:["Close the plug key: reading 1","Move the rheostat: reading 2","Move the rheostat: reading 3","Move the rheostat: reading 4","Plot the V–I graph"],
   stepTasks:["Tap the plug key. Close the circuit and read the voltmeter and the ammeter.",
     "Tap the rheostat. Slide it to get a bigger current, then read both meters.",
     "Tap the rheostat again. Take the third reading.",
     "Tap the rheostat once more. Take the fourth reading.",
     "Tap the graph paper. Plot V against I."],
   conc:{w1:"As the potential difference increased, the current increased in the same ratio. V/I was 5 Ω every time.",
     eq:"V/I = R = 5 Ω  →  V = IR",
     w2:"The V–I graph is a straight line through the origin. This is Ohm's law. It holds when the temperature of the wire stays the same."},
   quiz:[
    {q:"When V was doubled from 1.5 V to 3.0 V, the current",a:"Also doubled",t:["Became half","Stayed the same","Became zero"],w:"I rose from 0.3 A to 0.6 A."},
    {q:"What was V/I for every reading?",a:"5 Ω",t:["1 Ω","0.2 Ω","It kept changing"],w:"V/I is the resistance of the nichrome wire."},
    {q:"What shape is the V–I graph?",a:"A straight line through the origin",t:["A curve","A circle","A line that does not touch the origin"],w:"So V is directly proportional to I.",lay:"col"},
    {q:"What was the rheostat used for?",a:"To change the current in the circuit",t:["To measure the voltage","To store charge","To stop the current forever"],w:"A rheostat is a variable resistance."},
    {q:"Ohm's law holds only when",a:"The temperature of the conductor stays the same",t:["The wire is very long","The battery is new","The ammeter is in parallel"],w:"That is why we open the key after each reading.",lay:"col"}]},
  {key:"R",ic:"🧵",tag:"📘 Section 11.5",name:"What resistance depends on",sub:"Factors affecting resistance",
   blurb:"Swap wires of different length, thickness and material. Watch the current.",
   intro:"You will put four different wires, one at a time, between the points X and Y in the same circuit. The cell stays the same, so a smaller current means a bigger resistance.",
   safe:"🥽 Hold wires by their ends. A thin wire can get hot.",
   aim:"To study how the resistance of a wire depends on its length, its area of cross-section and its material.",
   steps:["Nichrome wire, length l","Nichrome wire, length 2l","Thick nichrome wire, length l","Copper wire, length l"],
   stepTasks:["Tap the nichrome wire of length l. Put it between X and Y and read the ammeter.",
     "Tap the nichrome wire of length 2l. Put it in place of the first wire.",
     "Tap the thick nichrome wire. It has the same length l but double the area.",
     "Tap the copper wire. It has the same length and thickness as the first wire."],
   conc:{w1:"Doubling the length halved the current, so the resistance doubled. Doubling the area doubled the current, so the resistance halved. Copper let a much bigger current flow.",
     eq:"R = ρ l / A",
     w2:"Resistance increases with length, decreases with area of cross-section, and depends on the material (its resistivity ρ)."},
   quiz:[
    {q:"When the length of the nichrome wire was doubled, the current",a:"Became half",t:["Doubled","Stayed the same","Became zero"],w:"So the resistance doubled: R ∝ l."},
    {q:"The thick wire gave double the current. So its resistance was",a:"Half",t:["Double","The same","Four times"],w:"R ∝ 1/A."},
    {q:"Copper gave a much bigger current than nichrome of the same size. Why?",a:"Copper has a much lower resistivity",t:["Copper is heavier","Copper is longer","Copper is a poor conductor"],w:"Resistance depends on the material.",lay:"col"},
    {q:"Which wire had the largest resistance?",a:"Nichrome, length 2l",t:["Nichrome, length l","Thick nichrome","Copper"],w:"It gave the smallest current, 0.3 A."},
    {q:"Which formula shows all three factors?",a:"R = ρ l / A",t:["R = V × I","R = A / l","R = ρ A / l"],w:"ρ is the resistivity of the material."}]},
  {key:"S",ic:"🔗",tag:"📘 Section 11.6",name:"Series vs parallel",sub:"Resistors in series and parallel",
   blurb:"Join 1 Ω, 2 Ω and 3 Ω in series, then in parallel. Compare the meters.",
   intro:"You will join three resistors of 1 Ω, 2 Ω and 3 Ω to a 6 V battery, first in series and then in parallel. Each time you will measure the currents and the voltages.",
   safe:"🥽 Keep the plug key open while you change the connections.",
   aim:"To compare resistors joined in series and in parallel, and find their total resistance.",
   steps:["Join the resistors in series","Series: current at each place","Series: voltage across each","Rewire them in parallel","Parallel: voltage across each","Parallel: current in each branch"],
   stepTasks:["Tap the resistors. Join 1 Ω, 2 Ω and 3 Ω end to end, in series.",
     "Tap the ammeter. Measure the current at different places in the series circuit.",
     "Tap the voltmeter. Measure the voltage across each resistor.",
     "Tap the wires. Rewire the same three resistors in parallel.",
     "Tap the voltmeter. Measure the voltage across each resistor.",
     "Tap the ammeter. Measure the current in each branch."],
   conc:{w1:"In series, the same current (1 A) flowed through every resistor, and the voltages 1 V + 2 V + 3 V added up to 6 V. Total R = 6 Ω.",
     eq:"Rs = R₁ + R₂ + R₃  ·  1/Rp = 1/R₁ + 1/R₂ + 1/R₃",
     w2:"In parallel, every resistor got the same 6 V, and the currents 6 A + 3 A + 2 A added up to 11 A. Total R = 6/11 ≈ 0.55 Ω, less than the smallest resistor."},
   quiz:[
    {q:"In series, the current through each resistor was",a:"The same",t:["Different","Zero","Largest in the 3 Ω resistor"],w:"There is only one path, so 1 A flowed everywhere."},
    {q:"In series, the voltages across 1 Ω, 2 Ω and 3 Ω were",a:"1 V, 2 V and 3 V: they add up to 6 V",t:["6 V each","2 V each","3 V, 2 V and 1 V"],w:"V = V₁ + V₂ + V₃.",lay:"col"},
    {q:"In parallel, the voltage across each resistor was",a:"6 V, the same for all",t:["1 V, 2 V and 3 V","2 V each","Zero"],w:"Each one is joined across the battery."},
    {q:"In parallel, the branch currents were 6 A, 3 A and 2 A. The main current was",a:"11 A",t:["6 A","1 A","2 A"],w:"I = I₁ + I₂ + I₃."},
    {q:"The total resistance in parallel (0.55 Ω) was",a:"Less than the smallest resistor",t:["More than the largest resistor","Equal to 6 Ω","Equal to 1 Ω"],w:"Each branch gives the current another path.",lay:"col"}]}
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
    ["O","R","S"].forEach(x=>{const g=$("sc"+x);if(!g)return;
      if(x===k){g.style.display="";g.setAttribute("opacity",1);}else{g.style.display="none";g.setAttribute("opacity",0);}});
  }

  // ======================= resets =======================
  function flowOn(id){const p=$(id);if(!p||$(id+"F"))return;const f=p.cloneNode();f.id=id+"F";f.setAttribute("stroke","#FBBF24");f.setAttribute("stroke-width","3");f.classList.add("flow");p.after(f);}
  function flowOff(id){const f=$(id+"F");if(f)f.remove();}
  function resetO(){["oAv","oVv"].forEach(i=>$(i).textContent="–");for(let r=0;r<4;r++)["v","i","r"].forEach(c=>$("oT"+r+c).textContent="");
    $("oPts").innerHTML="";setOp($("oGraphC"),0);setOp($("oKeyPlug"),0);$("oKnob").setAttribute("cx",370);flowOff("oWire");showItem("oGraph");setOp($("oBoard"),0);}
  function resetR(){$("rAv").textContent="–";$("rIn").innerHTML="";for(let r=0;r<4;r++)$("rT"+r).textContent="";flowOff("rWire");["rN1","rN2","rN3","rCu"].forEach(showItem);setOp($("rBoard"),0);}
  function resetS(){$("sAv").textContent="–";["sDyn","sMarks"].forEach(i=>$(i).innerHTML="");for(let r=0;r<4;r++){$("sS"+r).textContent="";$("sP"+r).textContent="";}setOp($("sBoard"),0);}
  const RESET={O:resetO,R:resetR,S:resetS};

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

  // ======================= O: Ohm's law =======================
  const OV=[[1.5,0.3,370],[3.0,0.6,296.7],[4.5,0.9,272],[6.0,1.2,260]];
  async function oRead(k){const [v,i,kx]=OV[k],pv=num("oVv"),pi=num("oAv"),px=+$("oKnob").getAttribute("cx");
    await tween(RM?60:800,t=>{$("oVv").textContent=(pv+(v-pv)*t).toFixed(1)+" V";$("oAv").textContent=(pi+(i-pi)*t).toFixed(2)+" A";$("oKnob").setAttribute("cx",(px+(kx-px)*t).toFixed(1));});
    $("oT"+k+"v").textContent=v.toFixed(1);$("oT"+k+"i").textContent=i.toFixed(2);$("oT"+k+"r").textContent=(v/i).toFixed(1);
    board("o",`Reading ${k+1}: V = ${v.toFixed(1)} V, I = ${i.toFixed(2)} A`,`V/I = ${(v/i).toFixed(1)} Ω`);
    obs(`Reading ${k+1}: V = ${v.toFixed(1)} V and I = ${i.toFixed(2)} A, so V/I = ${(v/i).toFixed(1)} Ω.`);
    tell(`${v} volts and ${i} amperes. V by I is 5 ohms.`);}
  async function O_key(){await tween(RM?60:400,t=>setOp($("oKeyPlug"),t));flowOn("oWire");await oRead(0);}
  const O_rheo=k=>()=>oRead(k);
  async function O_graph(){await hideItem("oGraph");await fadeIn($("oGraphC"),500);const g=$("oPts");g.innerHTML="";
    const X=i=>470+i*160,Y=v=>446-v*13;
    for(const [v,i] of OV){const c=mk("circle",{cx:X(i),cy:Y(v),r:5,fill:"#DC2626"},g);await fadeIn(c,RM?60:250);}
    const L=mk("line",{x1:470,y1:446,x2:470,y2:446,stroke:"#DC2626","stroke-width":3},g);
    await tween(RM?60:700,t=>{L.setAttribute("x2",470+t*1.25*160);L.setAttribute("y2",446-t*6.25*13);});
    board("o","A straight line through the origin!","So V is directly proportional to I: Ohm's law.","ok");
    obs("The V–I graph was a straight line through the origin, so V is directly proportional to I.");
    tell("The graph is a straight line through the origin. This is Ohm's law.");}

  // ======================= R: factors of resistance =======================
  const RW={n1:{id:"rN1",k:0,i:0.60,col:"#94A3B8",w:4,n:3,b1:"Nichrome, length l: current 0.60 A",b2:"This is our starting reading.",o:"Nichrome wire of length l: the current was 0.60 A."},
    n2:{id:"rN2",k:1,i:0.30,col:"#94A3B8",w:4,n:6,b1:"Double the length: the current halves to 0.30 A",b2:"So the resistance doubled: R ∝ l",o:"Nichrome wire of length 2l: the current fell to 0.30 A, so the resistance doubled."},
    n3:{id:"rN3",k:2,i:1.20,col:"#94A3B8",w:9,n:3,b1:"Double the area: the current doubles to 1.20 A",b2:"So the resistance halved: R ∝ 1/A",o:"Thick nichrome wire (double area): the current rose to 1.20 A, so the resistance halved."},
    cu:{id:"rCu",k:3,i:2.90,col:"#EA580C",w:4,n:3,b1:"Copper: the current jumps to 2.90 A",b2:"Copper has a much lower resistivity than nichrome.",o:"Copper wire of the same size: the current was 2.90 A, much more than nichrome. Copper has a lower resistivity."}};
  async function R_put(key){const w=RW[key],g=$("rIn");await hideItem(w.id);
    if(g.firstChild){await tween(RM?60:300,t=>setOp(g,1-t));g.innerHTML="";setOp(g,1);}
    const L=204/w.n;let d="M118 440";for(let k=0;k<w.n;k++){const x0=118+k*L;d+=` C${(x0+L*.25).toFixed(1)} 414 ${(x0+L*.75).toFixed(1)} 466 ${(x0+L).toFixed(1)} 440`;}
    const G=mk("g",{},g);mk("path",{d,fill:"none",stroke:w.col,"stroke-width":w.w,"stroke-linecap":"round"},G);await fadeIn(G,500);
    flowOn("rWire");await count("rAv",num("rAv"),w.i,2,"A");$("rT"+w.k).textContent=w.i.toFixed(2)+" A";
    board("r",w.b1,w.b2,key==="n1"?null:"ok");obs(w.o);tell(w.b1.replace(/:/g,","));}

  // ======================= S: series vs parallel =======================
  const SL=["R₁ = 1 Ω","R₂ = 2 Ω","R₃ = 3 Ω"];
  function sSeries(){const g=$("sDyn");g.innerHTML="";const G=mk("g",{},g);
    W(G,"M40 300 V440 H80 M150 440 H190 M260 440 H300 M370 440 H420 V300","sWS");
    [[80,150],[190,260],[300,370]].forEach(([a,b],k)=>{ZIG(G,a,b,440);T(G,(a+b)/2,420,SL[k]);});return G;}
  function sParallel(){const g=$("sDyn");g.innerHTML="";const G=mk("g",{},g);
    W(G,"M40 300 V385 H100 M100 330 V440 M360 330 V440 M360 385 H420 V300","sWP");
    [330,385,440].forEach((y,k)=>{W(G,`M100 ${y} H180 M260 ${y} H360`);ZIG(G,180,260,y);T(G,140,y-10,SL[k],null,13);});
    [[100,385],[360,385]].forEach(([x,y])=>mk("circle",{cx:x,cy:y,r:5,fill:"var(--muted)"},G));return G;}
  function miniA(g,x,y,val,tx,ty,anc){mk("circle",{cx:x,cy:y,r:12,fill:"#FFFFFF",stroke:"#2563EB","stroke-width":3},g);T(g,x,y+5,"A","#2563EB",13);T(g,tx,ty,val,"#1D4ED8",15,anc);}
  async function S_res(){const G=sSeries();await fadeIn(G,600);flowOn("sWS");await count("sAv",0,1,2,"A");$("sS0").textContent="1 A";
    board("s","Series: one path for the current","Main current = 1 A");obs("Series: 1 Ω, 2 Ω and 3 Ω were joined end to end. The main current was 1 A.");tell("In series, the main current is 1 ampere.");}
  async function S_am1(){const g=$("sMarks");g.innerHTML="";const G=mk("g",{},g);
    miniA(G,40,370,"1 A",58,375,"start");miniA(G,170,440,"1 A",170,420);miniA(G,280,440,"1 A",280,420);await fadeIn(G,600);$("sS1").textContent="1, 1, 1 A";
    board("s","The same current everywhere: 1 A","In series, there is only one path.");obs("Series: the ammeter read 1 A at every place. The same current flows through each resistor.");tell("The same current, 1 ampere, flows everywhere.");}
  async function S_vm1(){const G=mk("g",{},$("sMarks"));[[115,"V₁ = 1 V"],[225,"V₂ = 2 V"],[335,"V₃ = 3 V"]].forEach(([x,s])=>T(G,x,398,s,"#7C3AED",15));
    await fadeIn(G,600);$("sS2").textContent="1, 2, 3 V";$("sS3").textContent="6 Ω";
    board("s","1 V + 2 V + 3 V = 6 V","Total R = 6 V ÷ 1 A = 6 Ω = 1 + 2 + 3","ok");
    obs("Series: the voltages were 1 V, 2 V and 3 V. They add up to the battery's 6 V. Total R = 6 Ω = 1 Ω + 2 Ω + 3 Ω.");tell("1 volt plus 2 volts plus 3 volts make 6 volts.");}
  async function S_wire(){await tween(RM?60:400,t=>{setOp($("sDyn"),1-t);setOp($("sMarks"),1-t);});$("sMarks").innerHTML="";setOp($("sMarks"),1);
    const G=sParallel();setOp($("sDyn"),1);await fadeIn(G,600);flowOn("sWP");await count("sAv",1,11,1,"A");$("sP0").textContent="11 A";
    board("s","Parallel: each resistor has its own path","The main current jumps to 11 A!");obs("Parallel: the same three resistors were rewired side by side. The main current rose to 11 A.");tell("In parallel, the main current is 11 amperes.");}
  async function S_vm2(){const g=$("sMarks");g.innerHTML="";const G=mk("g",{},g);[330,385,440].forEach(y=>T(G,220,y-17,"6 V","#7C3AED",15));
    await fadeIn(G,600);$("sP2").textContent="6, 6, 6 V";
    board("s","The same voltage on each resistor: 6 V","Each one is joined across the battery.");obs("Parallel: the voltmeter read 6 V across each resistor.");tell("Each resistor gets the same 6 volts.");}
  async function S_am2(){const G=mk("g",{},$("sMarks"));[[330,"6 A"],[385,"3 A"],[440,"2 A"]].forEach(([y,s])=>miniA(G,310,y,s,334,y-16,"start"));
    await fadeIn(G,600);$("sP1").textContent="6, 3, 2 A";$("sP3").textContent="0.55 Ω";
    board("s","6 A + 3 A + 2 A = 11 A","Total R = 6 ÷ 11 ≈ 0.55 Ω, less than 1 Ω","ok");
    obs("Parallel: the branch currents were 6 A, 3 A and 2 A. They add up to the main current, 11 A. Total R = 6 V ÷ 11 A ≈ 0.55 Ω.");tell("6 plus 3 plus 2 make 11 amperes.");}

  const ACTS={
    O:[{keys:["key"],fn:O_key,cue:"oKey"},{keys:["rheo"],fn:O_rheo(1),cue:"oRheo"},{keys:["rheo"],fn:O_rheo(2),cue:"oRheo"},{keys:["rheo"],fn:O_rheo(3),cue:"oRheo"},{keys:["graph"],fn:O_graph,cue:"oGraph"}],
    R:[{keys:["n1"],fn:()=>R_put("n1"),cue:"rN1"},{keys:["n2"],fn:()=>R_put("n2"),cue:"rN2"},{keys:["n3"],fn:()=>R_put("n3"),cue:"rN3"},{keys:["cu"],fn:()=>R_put("cu"),cue:"rCu"}],
    S:[{keys:["resistors"],fn:S_res,cue:"sRes"},{keys:["ammeter"],fn:S_am1,cue:"sAm"},{keys:["voltmeter"],fn:S_vm1,cue:"sVm"},{keys:["wires"],fn:S_wire,cue:"sWire"},{keys:["voltmeter"],fn:S_vm2,cue:"sVm"},{keys:["ammeter"],fn:S_am2,cue:"sAm"}]
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
    c.innerHTML=`<h2>🔬 Choose an experiment</h2><p class="sub">Chapter 11 — Electricity. Tap a card to begin.</p>
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

