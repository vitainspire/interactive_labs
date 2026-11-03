/* Lesson 1: Chemical Reactions and Equations — lab.html (Digital Lab) logic.
   This lab is a bespoke SVG rig (zinc + dilute HCl), not shared with other
   lessons' labs, so its full engine (sound, voice-over, animation, drag/tap
   input, the end quiz) and content live together in this one file. */
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

  /* ---------- build static bits ---------- */
  const tk=$("ticks");
  for(let T=0;T<=100;T+=10){const y=-20-T*2,w=T%50===0?6:3.5;mk("line",{x1:6.5-w,y1:y,x2:6.5,y2:y},tk);}
  function rnd(seed){let s=seed;return()=>{s=(s*9301+49297)%233280;return s/233280;};}
  function granule(cx,cy,r,seed,par){
    const R=rnd(seed),n=7,pts=[];
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2+R()*.5,rr=r*(.72+R()*.42);pts.push((cx+Math.cos(a)*rr).toFixed(1)+","+(cy+Math.sin(a)*rr*.85).toFixed(1));}
    const g=mk("g",{},par);
    mk("polygon",{points:pts.join(" "),fill:"url(#gZn)",stroke:"#5F676E","stroke-width":1.1,"stroke-linejoin":"round"},g);
    mk("circle",{cx:cx-r*.3,cy:cy-r*.3,r:r*.22,fill:"#fff",opacity:.7},g);
    return g;
  }
  const zinc=$("zinc");
  [[-34,0,10],[-14,5,9.5],[6,-1,10.5],[26,4,9],[-4,-12,8.5],[16,-13,8]].forEach((p,i)=>granule(p[0],p[1],p[2],11+i*7,zinc));
  const TG=[[324,395],[337,395],[319,384],[341,384],[330,375]];
  const tg=$("tgran");const tgEls=TG.map((p,i)=>{const g=granule(0,0,6.2,31+i*5,tg);g.setAttribute("opacity",0);return g;});

  /* ---------- movable things ---------- */
  const M={
    zinc:{g:zinc,layer:$("Lzinc"),home:{x:120,y:542,r:0},hot:[0,0],target:[330,140],rad:85,step:1},
    bottle:{g:$("bottle"),layer:$("Lbottle"),home:{x:560,y:430,r:0},hot:[0,-146],target:[330,140],rad:95,step:2},
    thermo:{g:$("thermo"),layer:$("Lthermo"),home:{x:445,y:414,r:6},hot:[0,0],target:[330,330],rad:110,step:3},
    spl:{g:$("spl"),layer:$("Lspl"),home:{x:430,y:566,r:-5},hot:[0,0],target:[330,136],rad:75,step:5}
  };
  for(const k in M){M[k].name=k;M[k].pose={...M[k].home};setPose(M[k]);}
  /* phone portrait: rearrange the bench so things look bigger */
  const LAY={
    wide:{vb:"0 0 700 620",dish:[0,0],match:[0,0],zinc:{x:120,y:542,r:0},spl:{x:430,y:566,r:-5},sl:[500,592]},
    tall:{vb:"140 96 480 584",dish:[110,-30],match:[-82,-34],zinc:{x:230,y:512,r:0},spl:{x:300,y:622,r:-5},sl:[375,660]}
  };
  let mode="";
  function applyLayout(){
    const r=$("scene").getBoundingClientRect();if(!r.width)return;
    const nm=r.width/r.height<0.95?"tall":"wide";if(nm===mode)return;mode=nm;const L=LAY[nm];
    svg.setAttribute("viewBox",L.vb);svg.classList.toggle("tall",nm==="tall");
    $("fDish").setAttribute("transform",`translate(${L.dish})`);$("fMatch").setAttribute("transform",`translate(${L.match})`);
    $("splLbl").setAttribute("x",L.sl[0]);$("splLbl").setAttribute("y",L.sl[1]);
    M.zinc.home={...L.zinc};M.spl.home={...L.spl};
    if(!busy&&!drag){[M.zinc,M.spl].forEach(m=>{m.pose={...m.home};setPose(m);});}
  }
  new ResizeObserver(applyLayout).observe($("scene"));
  function setPose(m){
    const p=m.pose;m.g.setAttribute("transform",`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.r.toFixed(1)})`);
    if(m.name==="bottle"){const d=Math.hypot(p.x-m.home.x,p.y-m.home.y);$("botSh").setAttribute("opacity",Math.max(0,1-d/60));$("bliq").parentNode.setAttribute("opacity",Math.max(0,1-Math.abs(p.r)/35));}
  }
  function hotW(m){const p=m.pose,a=p.r*Math.PI/180,[hx,hy]=m.hot;return[p.x+hx*Math.cos(a)-hy*Math.sin(a),p.y+hx*Math.sin(a)+hy*Math.cos(a)];}
  function moveTo(m,to,ms,ez){const from={...m.pose};return tween(ms,t=>{m.pose={x:lerp(from.x,to.x,t),y:lerp(from.y,to.y,t),r:lerp(from.r,to.r,t)};setPose(m);},ez);}
  const raise=m=>$("Ltop").appendChild(m.g);
  const lower=m=>m.layer.appendChild(m.g);

  /* ---------- state ---------- */
  let drag=null,step=0,busy=true,level=405,temp=30,reacting=false,rate=0,lit=false,started=false;
  const TASK=["","Drag the zinc granules into the test tube.","Drag the dilute HCl bottle to the test tube.","Drag the thermometer into the test tube.","Tap the matchbox to light the splinter.","Bring the burning splinter to the mouth of the test tube."];
  const HINT=["","First, put the zinc granules in the test tube.","Next, pour the dilute HCl into the test tube.","Next, put the thermometer in the test tube.","Next, tap the matchbox to light the splinter.","Now bring the burning splinter to the test tube."];

  function setStep(n,pre,queue){
    step=n;
    if(n<=5&&started)Say.say((pre||"")+"Step "+n+". "+TASK[n],queue);
    for(const k in M)M[k].g.classList.toggle("hint",M[k].step===n);
    $("match").classList.toggle("hint",n===4);
    [...$("steps").children].forEach((li,i)=>{li.className=i+1<n?"done":i+1===n?"now":"";});
    if(n<=5){$("tn").textContent=n;$("tt").textContent=TASK[n];$("pill").textContent=`Step ${n} / 5`;}
  }
  function addObs(t){
    const ul=$("obs");const e=ul.querySelector(".empty");if(e)e.remove();
    const li=document.createElement("li");li.textContent=t;ul.appendChild(li);
  }
  let toastT=null;
  function toast(t,quiet){if(!quiet)Say.say(t);const e=$("toast");e.textContent=t;e.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove("on"),2600);}

  function setLevel(y){
    level=y;const L=$("liq"),S=$("surf");
    L.setAttribute("y",y);L.setAttribute("height",Math.max(0,425-y));L.setAttribute("opacity",y<403?1:0);
    S.setAttribute("cy",y);S.setAttribute("opacity",y<403?.4:0);
  }
  function setTemp(T){temp=T;const y=-20-T*2;const c=$("tcol");c.setAttribute("y",y);c.setAttribute("height",-y);$("tread").textContent=Math.round(T)+" °C";}

  /* ---------- bubbles and gas ---------- */
  const bubs=[];const bubG=$("bubs");let lastT=performance.now(),spawnAcc=0,h2Acc=0,reactT0=0,shrink=1;
  function loop(now){
    const dt=Math.min(.05,(now-lastT)/1000);lastT=now;
    if(reacting&&level<392){
      const age=(now-reactT0)/1000;
      rate=(RM?8:26)*Math.max(.45,1-age/90);
      Snd.fizzLevel(.07*Math.max(.4,1-age/90));
      shrink=Math.max(.8,1-age/240);
      tgEls.forEach((g,i)=>g.setAttribute("transform",`translate(${TG[i][0]} ${TG[i][1]}) scale(${shrink.toFixed(3)})`));
      spawnAcc+=rate*dt;
      while(spawnAcc>=1){
        spawnAcc--;const p=TG[(Math.random()*TG.length)|0];
        const r=1.2+Math.random()*2.6;
        const c=mk("circle",{r:r,fill:"rgba(255,255,255,.35)",stroke:"rgba(255,255,255,.9)","stroke-width":.8},bubG);
        bubs.push({c,x0:p[0]+(Math.random()-.5)*10,y:p[1]-4,v:55+Math.random()*70+r*12,ph:Math.random()*6,f:5+Math.random()*5,r});
      }
      h2Acc+=dt;if(h2Acc>3.2&&step<6){h2Acc=0;floatH2();}
    }
    for(let i=bubs.length-1;i>=0;i--){
      const b=bubs[i];b.y-=b.v*dt;b.v+=30*dt;
      const x=b.x0+Math.sin(now/1000*b.f+b.ph)*1.6;
      if(b.y<level+b.r){b.c.remove();bubs.splice(i,1);continue;}
      b.c.setAttribute("cx",x.toFixed(1));b.c.setAttribute("cy",b.y.toFixed(1));
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  function floatH2(){
    const t=mk("text",{x:330,y:126,"text-anchor":"middle","font-family":"Baloo 2,sans-serif","font-weight":800,"font-size":18,fill:"#7DD3FC",opacity:0},$("fx"));
    t.textContent="H₂";const dx=(Math.random()-.5)*50;
    tween(2600,(e,t0)=>{t.setAttribute("y",126-e*70);t.setAttribute("x",330+dx*e);t.setAttribute("opacity",t0<.2?t0*4:Math.max(0,.8*(1-(t0-.2)/.8)));},x=>x).then(()=>t.remove());
  }

  /* ---------- the five steps ---------- */
  async function doZinc(){
    const m=M.zinc;busy=true;m.g.classList.remove("hint");raise(m);
    await moveTo(m,{x:330,y:112,r:0},650,easeOut);
    await tween(350,t=>{m.pose.r=t*25;setPose(m);m.g.setAttribute("opacity",1-t);});
    for(let i=0;i<TG.length;i++){
      const g=tgEls[i],[x,y]=TG[i];g.setAttribute("opacity",1);
      tween(520,t=>g.setAttribute("transform",`translate(${x} ${lerp(118,y,t).toFixed(1)}) rotate(${(1-t)*90*(i%2?1:-1)})`),bounce);
      setTimeout(()=>Snd.clink(),300+Math.random()*80);
      await wait(160);
    }
    await wait(500);
    m.pose={...m.home};setPose(m);lower(m);
    addObs("I put 5 grey zinc granules in the test tube.");Snd.ok();
    setStep(2,"Good! The zinc granules are in the test tube. ");busy=false;
  }
  async function doBottle(){
    const m=M.bottle;busy=true;m.g.classList.remove("hint");raise(m);
    const st=$("stopper");
    await tween(250,t=>st.setAttribute("transform",`translate(${t*30} ${-t*40})`));st.setAttribute("opacity",0);
    await moveTo(m,{x:520,y:230,r:-10},600,easeOut);
    await moveTo(m,{x:477,y:62,r:-115},750);
    const sp=$("stream");sp.setAttribute("opacity",1);
    const D=RM?1600:2600;Snd.pour(D/1000);
    await tween(D,t=>{
      const y=lerp(404,300,t);setLevel(y);
      sp.setAttribute("d",`M344,128 Q341,${((128+y)/2).toFixed(1)} 337,${y.toFixed(1)}`);
      $("bliq").setAttribute("y",lerp(-80,-60,t));
      if(!reacting&&y<388){reacting=true;reactT0=performance.now();Snd.fizzStart();}
    },x=>x);
    sp.setAttribute("opacity",0);
    await moveTo(m,{x:520,y:230,r:-10},650);
    await moveTo(m,{...m.home},600,easeOut);
    st.setAttribute("opacity",1);await tween(250,t=>st.setAttribute("transform",`translate(${(1-t)*30} ${-(1-t)*40})`));
    lower(m);
    await wait(700);
    addObs("Bubbles of gas form around the zinc granules.");Snd.ok();
    setStep(3,"Look! Bubbles of gas form around the zinc granules. ");busy=false;
  }
  async function doThermo(){
    const m=M.thermo;busy=true;m.g.classList.remove("hint");lower(m);
    await moveTo(m,{x:330,y:236,r:0},700,easeOut);
    await moveTo(m,{x:330,y:390,r:0},800);
    await wait(300);
    await tween(RM?1500:2800,t=>setTemp(lerp(30,38,t)),easeOut);
    addObs("The temperature rose from 30 °C to 38 °C. The test tube became warm.");Snd.ok();
    Say.say("The temperature rose from 30 to 38 degrees Celsius. The test tube became warm. So heat is given out.");
    await wait(1100);
    await moveTo(m,{x:330,y:236,r:0},700);
    await moveTo(m,{...m.home},700,easeOut);
    tween(2500,t=>setTemp(lerp(38,30,t)));
    setStep(4,"",true);busy=false;
  }
  async function doLight(){
    busy=true;$("match").classList.remove("hint");Snd.strike();
    spark(660+(mode==="tall"?-82:0),548+(mode==="tall"?-34:0));await wait(220);
    lit=true;const f=$("flame");tween(300,t=>f.setAttribute("opacity",t));
    $("char").setAttribute("opacity",.6);
    await wait(400);setStep(5,"The splinter is burning. ");busy=false;
  }
  async function doSplinter(){
    const m=M.spl;busy=true;m.g.classList.remove("hint");raise(m);
    await moveTo(m,{x:334,y:122,r:-5},800,easeOut);
    await wait(150);
    Snd.pop();flash(332,118);Say.say("Pop! The gas burns with a pop sound. So the gas is hydrogen.");
    lit=false;$("flame").setAttribute("opacity",0);$("char").setAttribute("opacity",1);smoke(334,116);
    addObs("The gas burns with a pop sound. So the gas is hydrogen.");
    await wait(1200);
    await moveTo(m,{...m.home},800,easeOut);lower(m);
    finish();
  }
  function finish(){
    setStep(6);busy=false;
    const tk=$("task");tk.classList.add("done");$("tn").textContent="✓";$("tt").textContent="Well done! The experiment is complete.";$("chk").hidden=false;
    $("pill").textContent="Step 5 / 5";
    $("concl").hidden=false;
    Snd.fizzLevel(.03);setTimeout(()=>{if(step===6)Snd.fizzStop();},6000);
    const g0=gen;setTimeout(()=>{if(g0===gen&&step===6&&ov.hidden){Snd.fan();showResult();}},RM?600:5000);
  }
  function showResult(){
    card.innerHTML=`<div class="res" style="display:flex;flex-direction:column;gap:inherit">
      <span class="tag">🔬 What we found</span>
      <div class="eqbig">Zn + 2HCl → ZnCl₂ + H₂↑</div>
      <div class="word">Zinc + Hydrochloric acid → Zinc chloride + Hydrogen</div>
      <ul>
        <li><span>💨</span><span><b>Hydrogen gas</b> is formed.</span></li>
        <li><span>💥</span><span>It burns with a <b>pop sound</b>. So we can identify it.</span></li>
        <li><span>🔥</span><span>Heat is given out. So it is an <b>exothermic</b> reaction.</span></li>
        <li><span>🔄</span><span>Zinc pushes out hydrogen. So it is a <b>displacement</b> reaction.</span></li>
      </ul>
      <div class="row"><button class="next big" id="rq">📝 Check yourself</button><button class="alt" id="rl">👀 See the lab</button></div>
    </div>`;
    ov.hidden=false;card.classList.add("resc");
    Say.say("Well done! The experiment is complete. Zinc plus hydrochloric acid gives zinc chloride and hydrogen. Hydrogen gas is formed. It burns with a pop sound. So we can identify it. Heat is given out. So it is an exothermic reaction. Zinc pushes out hydrogen. So it is a displacement reaction.",true);const eb=card.querySelector(".eqbig");let fs=parseFloat(getComputedStyle(eb).fontSize);
    while(eb.scrollWidth>eb.clientWidth+1&&fs>12){fs-=1;eb.style.fontSize=fs+"px";}
    $("rq").addEventListener("click",()=>$("chk").click());
    $("rl").addEventListener("click",()=>{ov.hidden=true;Say.stop();});
  }

  /* ---------- effects ---------- */
  function spark(x,y){
    const fx=$("fx");
    for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2,d=14+Math.random()*22;
      const c=mk("circle",{cx:x,cy:y,r:2,fill:i%2?"#FDE047":"#FB923C"},fx);
      tween(380,t=>{c.setAttribute("cx",x+Math.cos(a)*d*t);c.setAttribute("cy",y+Math.sin(a)*d*t);c.setAttribute("opacity",1-t);},easeOut).then(()=>c.remove());}
  }
  function flash(x,y){
    const fx=$("fx");
    const c=mk("circle",{cx:x,cy:y,r:6,fill:"url(#gFlash)"},fx);
    tween(500,t=>{c.setAttribute("r",6+t*90);c.setAttribute("opacity",1-t);},easeOut).then(()=>c.remove());
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2,l=mk("line",{stroke:"#FDE047","stroke-width":4,"stroke-linecap":"round"},fx);
      tween(420,t=>{const r1=20+t*50,r2=30+t*70;l.setAttribute("x1",x+Math.cos(a)*r1);l.setAttribute("y1",y+Math.sin(a)*r1);l.setAttribute("x2",x+Math.cos(a)*r2);l.setAttribute("y2",y+Math.sin(a)*r2);l.setAttribute("opacity",1-t);},easeOut).then(()=>l.remove());}
    const tx=mk("text",{x:x+78,y:y+14,"text-anchor":"middle","font-family":"Baloo 2,sans-serif","font-weight":800,"font-size":44,fill:"#F97316",stroke:"#fff","stroke-width":2,"paint-order":"stroke"},fx);
    tx.textContent="POP!";
    tween(1300,(t,raw)=>{const s=raw<.25?lerp(.4,1.25,raw/.25):1.25-(raw-.25)*.2;tx.setAttribute("transform",`translate(${x+78} ${y+14}) scale(${s}) translate(${-(x+78)} ${-(y+14)})`);tx.setAttribute("opacity",raw<.7?1:1-(raw-.7)/.3);},x=>x).then(()=>tx.remove());
  }
  function smoke(x,y){
    const fx=$("fx");
    for(let i=0;i<7;i++){const c=mk("circle",{cx:x,cy:y,r:4,fill:"#94A3B8",opacity:0},fx);const dx=(Math.random()-.5)*30;
      setTimeout(()=>tween(1600,t=>{c.setAttribute("cy",y-t*80);c.setAttribute("cx",x+dx*t);c.setAttribute("r",4+t*12);c.setAttribute("opacity",.55*(1-t));},x=>x).then(()=>c.remove()),i*110);}
  }

  /* ---------- input: drag or tap ---------- */
  function pt(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());}
  svg.addEventListener("pointerdown",e=>{
    if(!started||busy)return;
    const t=e.target.closest("[data-m],[data-t]");if(!t)return;
    e.preventDefault();
    if(t.dataset.t==="match"){tapThing("match");return;}
    const m=M[t.dataset.m];
    const p=pt(e);drag={m,sx:p.x,sy:p.y,p0:{...m.pose},moved:false,id:e.pointerId};
    try{svg.setPointerCapture(e.pointerId);}catch(_){}
  });
  svg.addEventListener("pointermove",e=>{
    if(!drag||e.pointerId!==drag.id)return;
    const p=pt(e),dx=p.x-drag.sx,dy=p.y-drag.sy;
    if(!drag.moved&&Math.hypot(dx,dy)>8){drag.moved=true;raise(drag.m);}
    if(drag.moved){drag.m.pose={x:drag.p0.x+dx,y:drag.p0.y+dy,r:drag.p0.r};setPose(drag.m);}
  });
  const endDrag=e=>{
    if(!drag||e.pointerId!==drag.id)return;
    const d=drag;drag=null;
    if(!d.moved){tapThing(d.m.name);return;}
    const m=d.m,[hx,hy]=hotW(m),near=Math.hypot(hx-m.target[0],hy-m.target[1])<m.rad;
    if(m.name==="spl"&&step===4){toast("First tap the matchbox to light the splinter.");back(m);return;}
    if(m.step===step&&near){run(m.name);return;}
    if(m.step===step)toast("Bring it closer to the test tube.");else{toast(HINT[step]||"The experiment is complete.");Snd.bad();}
    back(m);
  };
  svg.addEventListener("pointerup",endDrag);svg.addEventListener("pointercancel",endDrag);
  async function back(m){busy=true;await moveTo(m,{...m.home},420,easeOut);lower(m);busy=false;}
  function tapThing(name){
    if(busy)return;
    if(step===6){toast("The experiment is complete. Tap “Check yourself”.");return;}
    if(name==="match"||(name==="spl"&&step===4)){if(step===4)run("light");else{toast(HINT[step]);Snd.bad();}return;}
    const m=M[name];
    if(m.step===step)run(name);else{toast(HINT[step]);Snd.bad();}
  }
  function run(name){
    const f={zinc:doZinc,bottle:doBottle,thermo:doThermo,light:doLight,spl:doSplinter}[name];
    f().catch(()=>{});
  }
  svg.addEventListener("keydown",e=>{
    if(e.key!=="Enter"&&e.key!==" ")return;const t=e.target.closest("[data-m],[data-t]");if(!t||!started)return;
    e.preventDefault();tapThing(t.dataset.t||t.dataset.m);
  });

  /* ---------- quiz ---------- */
  const QZ=[
    {q:"Which gas is formed when zinc reacts with dilute HCl?",o:["Hydrogen","Oxygen","Carbon dioxide","Chlorine"],r:"Zinc pushes hydrogen out of the acid. So hydrogen gas is formed."},
    {q:"How did we test the gas?",o:["It burns with a pop sound","It turns lime water milky","It makes a glowing splinter burn brightly","It smells like rotten eggs"],r:"Hydrogen gas burns with a pop sound near a flame."},
    {q:"The temperature rose from 30 °C to 38 °C. So this reaction is:",s:"The temperature rose from 30 to 38 degrees Celsius. Is this reaction exothermic or endothermic?",o:["Exothermic","Endothermic"],r:"Heat is given out, so the reaction is exothermic."},
    {q:"Zn + 2HCl → ZnCl₂ + H₂ is which type of reaction?",s:"Zinc plus hydrochloric acid gives zinc chloride and hydrogen. Which type of reaction is this?",o:["Displacement reaction","Decomposition reaction","Combination reaction","Double displacement reaction"],r:"Zinc displaces hydrogen from hydrochloric acid."}
  ];
  let qi=0,right=0;
  const card=$("card"),ov=$("ov");
  const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
  function showQ(){
    const Q=QZ[qi];card.classList.remove("resc");const opts=shuf(Q.o.map((t,i)=>({t,ok:i===0})));
    card.innerHTML=`<span class="tag">📝 Check yourself: ${qi+1} of ${QZ.length}</span><div class="q"></div><div class="opts"></div><div class="foot"><div class="msg"></div></div>`;
    card.querySelector(".q").textContent=Q.q;Say.say(Q.s||Q.q);
    const box=card.querySelector(".opts"),msg=card.querySelector(".msg"),foot=card.querySelector(".foot");
    opts.forEach(o=>{const b=document.createElement("button");b.className="btn";b.textContent=o.t;box.appendChild(b);
      b.addEventListener("click",()=>{
        [...box.children].forEach((x,i)=>{x.disabled=true;if(opts[i].ok)x.classList.add("ok");});
        if(o.ok){right++;Snd.ok();msg.className="msg ok";msg.textContent="✅ "+Q.r;Say.say("Correct! "+Q.r);}
        else{b.classList.add("bad");Snd.bad();msg.className="msg bad";msg.textContent="❌ "+Q.r;Say.say("Not correct. "+Q.r);}
        $("pill").textContent=`Score ${right} / ${QZ.length}`;
        const n=document.createElement("button");n.className="next";n.textContent=qi<QZ.length-1?"Next ▶":"See result";foot.appendChild(n);n.focus();
        n.addEventListener("click",()=>{qi++;qi<QZ.length?showQ():endQuiz();});
      });});
  }
  function endQuiz(){
    const good=right>=3;
    card.innerHTML=`<h2>🎉 Experiment complete!</h2><p class="q">You scored ${right} out of ${QZ.length}.</p>
      <p>${good?"Great work! You know how zinc reacts with dilute acid.":"Good try! Do the experiment once more and read the lab record."}</p>
      <p class="sub" style="white-space:nowrap">Zn + 2HCl → ZnCl₂ + H₂↑</p>
      <button class="next big" id="again">↺ Do the experiment again</button>`;
    $("again").addEventListener("click",()=>{ov.hidden=true;resetAll("Let us do the experiment again. ");});
    Snd.fan();celebrate();
    Say.say(`You scored ${right} out of ${QZ.length}. `+(good?"Great work! You know how zinc reacts with dilute acid.":"Good try! Do the experiment once more and read the lab record."));
  }
  $("chk").addEventListener("click",()=>{qi=0;right=0;$("pill").textContent=`Score 0 / ${QZ.length}`;ov.hidden=false;showQ();Snd.fizzStop();});
  function celebrate(){
    const box=document.createElement("div");box.className="cf";
    const cols=["#F97316","#2563EB","#DB2777","#16A34A","#FACC15","#7C3AED","#DC2626","#0D9488"];
    for(let k=0;k<90;k++){const p=document.createElement("i"),w=16+Math.random()*12;
      p.style.left=(Math.random()*100)+"%";p.style.width=w+"px";p.style.height=(w*(Math.random()<.5?1:1.8))+"px";p.style.background=cols[k%cols.length];
      p.style.setProperty("--d",(4+Math.random()*1.5).toFixed(2)+"s");p.style.setProperty("--dl",(Math.random()*1.2).toFixed(2)+"s");
      p.style.setProperty("--sx",((Math.random()-.5)*10).toFixed(1)+"vw");p.style.setProperty("--r",((Math.random()<.5?-1:1)*(360+Math.random()*540)|0)+"deg");box.appendChild(p);}
    document.body.appendChild(box);setTimeout(()=>box.remove(),7000);
  }

  /* ---------- start and reset ---------- */
  function resetAll(pre){
    gen++;Snd.fizzStop();Say.stop();reacting=false;lit=false;drag=null;
    bubs.forEach(b=>b.c.remove());bubs.length=0;$("fx").innerHTML="";
    for(const k in M){const m=M[k];m.pose={...m.home};setPose(m);lower(m);}
    zinc.setAttribute("opacity",1);tgEls.forEach(g=>{g.setAttribute("opacity",0);g.removeAttribute("transform");});
    setLevel(405);setTemp(30);$("bliq").setAttribute("y",-80);
    $("stream").setAttribute("opacity",0);$("stopper").setAttribute("opacity",1);$("stopper").removeAttribute("transform");
    $("flame").setAttribute("opacity",0);$("char").setAttribute("opacity",0);
    $("obs").innerHTML='<li class="empty">Your observations will appear here.</li>';$("concl").hidden=true;
    $("task").classList.remove("done");$("chk").hidden=true;
    started=true;setStep(1,pre||"");busy=false;
  }
  $("start").addEventListener("click",()=>{Snd.init();if(musOn)Snd.music(true);ov.hidden=true;resetAll("Welcome to the Digital Lab. Today we will see how zinc reacts with dilute hydrochloric acid. ");});
  $("rst").addEventListener("click",()=>{ov.hidden=true;resetAll("Let us start again. ");toast("New experiment. Start with the zinc granules.",true);});
  setStep(1);setTemp(30);
})();
