/* Smart Science Lab — shared realistic lab effects (smoke, steam, flame,
   fireball, sparks) built on raw SVG, no image assets.
   Loaded (via <script src>) before a lesson's own lab.js on any lab page
   that needs these effects — currently used by the Chemical Reactions
   (zinc + dilute HCl, lead nitrate, heating lead nitrate), Acids/Bases/Salts
   (heating copper sulphate) and Carbon Compounds labs. */
const FXP=(function(){
  const NS="http://www.w3.org/2000/svg",RMQ=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mk=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
  let svgRoot=null;const parts=[],flames=[],streams=[];let running=false,last=0;
  function init(svg){if(!svg||svg.querySelector("#fxpDefs"))return;svgRoot=svg;
    const d=mk("defs",{id:"fxpDefs"});svg.insertBefore(d,svg.firstChild);
    d.innerHTML=`
    <radialGradient id="fxpSmoke"><stop offset="0" stop-color="#4B5563" stop-opacity=".75"/><stop offset=".55" stop-color="#6B7280" stop-opacity=".45"/><stop offset="1" stop-color="#9CA3AF" stop-opacity="0"/></radialGradient>
    <radialGradient id="fxpSteam"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset=".55" stop-color="#E2E8F0" stop-opacity=".6"/><stop offset=".85" stop-color="#CBD5E1" stop-opacity=".3"/><stop offset="1" stop-color="#94A3B8" stop-opacity="0"/></radialGradient>
    <radialGradient id="fxpBrown"><stop offset="0" stop-color="#92400E" stop-opacity=".8"/><stop offset=".55" stop-color="#B45309" stop-opacity=".5"/><stop offset="1" stop-color="#D97706" stop-opacity="0"/></radialGradient>
    <radialGradient id="fxpGlow"><stop offset="0" stop-color="#FDE68A" stop-opacity=".85"/><stop offset=".5" stop-color="#FB923C" stop-opacity=".35"/><stop offset="1" stop-color="#F97316" stop-opacity="0"/></radialGradient>
    <radialGradient id="fxpBlueGlow"><stop offset="0" stop-color="#BFDBFE" stop-opacity=".7"/><stop offset="1" stop-color="#60A5FA" stop-opacity="0"/></radialGradient>
    <linearGradient id="fxpOuter" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#F59E0B"/><stop offset=".45" stop-color="#F97316"/><stop offset=".8" stop-color="#DC2626" stop-opacity=".75"/><stop offset="1" stop-color="#DC2626" stop-opacity="0"/></linearGradient>
    <linearGradient id="fxpMid" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FEF08A"/><stop offset=".6" stop-color="#FACC15"/><stop offset="1" stop-color="#FB923C" stop-opacity=".2"/></linearGradient>
    <linearGradient id="fxpCore" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FEF9C3" stop-opacity=".6"/></linearGradient>
    <linearGradient id="fxpBlue" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1D4ED8"/><stop offset=".7" stop-color="#3B82F6" stop-opacity=".85"/><stop offset="1" stop-color="#93C5FD" stop-opacity=".2"/></linearGradient>
    <linearGradient id="fxpBurnOuter" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#60A5FA" stop-opacity=".9"/><stop offset=".35" stop-color="#A78BFA" stop-opacity=".55"/><stop offset=".7" stop-color="#FB923C" stop-opacity=".55"/><stop offset="1" stop-color="#FB923C" stop-opacity="0"/></linearGradient>
    <radialGradient id="fxpBall"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".3" stop-color="#FEF08A"/><stop offset=".65" stop-color="#FB923C" stop-opacity=".8"/><stop offset="1" stop-color="#DC2626" stop-opacity="0"/></radialGradient>
    <radialGradient id="fxpBub" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".22" stop-color="#FFFFFF" stop-opacity=".2"/><stop offset=".8" stop-color="#E0F2FE" stop-opacity=".2"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".95"/></radialGradient>
    <filter id="fxpSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="fxpBlur1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2"/></filter>`;}
  const ensure=layer=>{if(!svgRoot){const s=layer.ownerSVGElement||layer.closest("svg");init(s);}};
  function loop(t){const dt=Math.min(.05,(t-(last||t))/1000);last=t;
    for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.age+=dt;const k=p.age/p.life;
      if(k>=1||!p.el.isConnected){p.el.remove();parts.splice(i,1);continue;}p.tick(p,k,dt);}
    for(let i=flames.length-1;i>=0;i--){const f=flames[i];if(!f.g.isConnected||f.dead){flames.splice(i,1);continue;}f.tick(t/1000);}
    for(let i=streams.length-1;i>=0;i--){const s=streams[i];if(s.dead||!s.layer.isConnected){streams.splice(i,1);continue;}
      s.acc+=dt;while(s.acc>s.every){s.acc-=s.every;puff(s.layer,s.x+(Math.random()-.5)*s.w,s.y,s.o);}}
    if(parts.length||flames.length||streams.length)requestAnimationFrame(loop);else{running=false;last=0;}}
  const go=()=>{if(!running){running=true;requestAnimationFrame(loop);}};
  /* one soft cloud puff: 3 overlapping blobs that rise, drift, swell and fade */
  function puff(layer,x,y,o){const steam=o.color==="steam",brown=o.color==="brown",g=mk("g",{"pointer-events":"none",filter:"url(#fxpSoft)"},layer);
    const fill=steam?"url(#fxpSteam)":brown?"url(#fxpBrown)":"url(#fxpSmoke)",bl=[];
    for(let j=0;j<3;j++)bl.push({c:mk("circle",{fill,r:1},g),dx:(Math.random()-.5)*.9,dy:(Math.random()-.5)*.6,s:.7+Math.random()*.5});
    const s0=o.size*(.35+Math.random()*.25),s1=o.size*(1.1+Math.random()*.7),rise=o.rise*(.75+Math.random()*.5),drift=(Math.random()-.5)*o.drift,ph=Math.random()*6.28,amp=o.size*.35,op=o.op||(steam?.85:.8);
    parts.push({el:g,age:0,life:(o.life||2.2)*(.8+Math.random()*.45)*(RMQ?.5:1),tick:(p,k)=>{
      const e=1-Math.pow(1-k,2),r=s0+(s1-s0)*e,cx=x+drift*k+(o.wind||0)*k+Math.sin(ph+k*5)*amp*k,cy=y-rise*e;
      for(const b of bl){b.c.setAttribute("cx",(cx+b.dx*r).toFixed(1));b.c.setAttribute("cy",(cy+b.dy*r).toFixed(1));b.c.setAttribute("r",(r*b.s).toFixed(1));}
      g.setAttribute("opacity",(op*(k<.12?k/.12:1)*(1-k)).toFixed(3));}});go();}
  function smoke(layer,x,y,o={}){ensure(layer);o=Object.assign({n:12,size:22,rise:150,drift:60,spread:16,gap:70,color:"smoke"},o);
    const n=RMQ?Math.ceil(o.n/3):o.n;for(let i=0;i<n;i++)setTimeout(()=>puff(layer,x+(Math.random()-.5)*o.spread,y,o),i*o.gap);}
  function stream(layer,x,y,o={}){ensure(layer);o=Object.assign({size:16,rise:120,drift:40,w:20,every:.16,color:"steam"},o);
    const s={layer,x,y,w:o.w,every:RMQ?o.every*3:o.every,acc:o.every,o,dead:false};streams.push(s);go();return {stop(){s.dead=true;}};}
  /* living flame drawn into group g (base at cx,by); types: wood, burner */
  function flamePath(cx,by,w,h,sw){const t=cx+sw;
    return `M${cx-w},${by} C${cx-w*1.15},${by-h*.35} ${t-w*.55},${by-h*.7} ${t},${by-h} C${t+w*.55},${by-h*.7} ${cx+w*1.15},${by-h*.35} ${cx+w},${by} C${cx+w*.6},${by+w*.55} ${cx-w*.6},${by+w*.55} ${cx-w},${by} Z`;}
  function flame(g,cx,by,o={}){ensure(g);o=Object.assign({type:"wood",w:12,h:52},o);const F={g,dead:false};
    const old=[...g.childNodes];old.forEach(n=>{if(n.nodeType===1)n.style.display="none";});
    const root=mk("g",{},g);const burner=o.type==="burner";
    const glow=mk("ellipse",{cx,cy:by-o.h*.45,rx:o.w*3.2,ry:o.h*.9,fill:burner?"url(#fxpBlueGlow)":"url(#fxpGlow)"},root);
    const L=burner?[["url(#fxpBurnOuter)",1,1],["url(#fxpBlue)",.55,.55]]:[["url(#fxpOuter)",1,1],["url(#fxpMid)",.72,.72],["url(#fxpCore)",.38,.42]];
    const ps=L.map(([f])=>mk("path",{fill:f,filter:"url(#fxpBlur1)"},root));
    let emberT=0;
    F.tick=time=>{const vis=+(g.getAttribute("opacity")||1)>0.05&&g.style.display!=="none";if(!vis)return;
      const n1=Math.sin(time*9.1)+Math.sin(time*13.7+1.3)*.6+Math.sin(time*23.3+.4)*.3,n2=Math.sin(time*7.3+2)*.5+Math.sin(time*17.9)*.4;
      L.forEach(([,ws,hs],i)=>{const h=o.h*hs*(1+n2*.07*(1+i*.3)),sw=o.w*.28*n1*(1-i*.25);ps[i].setAttribute("d",flamePath(cx,by,o.w*ws*(1+n2*.04),h,sw));});
      glow.setAttribute("opacity",(.75+n2*.15).toFixed(2));
      if(!burner&&!RMQ&&time-emberT>.35&&Math.random()<.5){emberT=time;const c=mk("circle",{cx,cy:by-o.h*.8,r:1.6,fill:"#FDBA74"},root);const dx=(Math.random()-.5)*20;
        parts.push({el:c,age:0,life:.9,tick:(p,k)=>{c.setAttribute("cy",(by-o.h*.8-k*45).toFixed(1));c.setAttribute("cx",(cx+dx*k).toFixed(1));c.setAttribute("opacity",(1-k).toFixed(2));}});}};
    F.stop=()=>{F.dead=true;root.remove();old.forEach(n=>{if(n.nodeType===1)n.style.display="";});};
    flames.push(F);go();return F;}
  function sparks(layer,x,y,n=16,o={}){ensure(layer);const sp=o.speed||160;
    for(let i=0;i<(RMQ?6:n);i++){const a=Math.random()*Math.PI*2,v=sp*(.4+Math.random()*.8),c=mk("circle",{r:1.6+Math.random()*1.8,fill:i%3?"#FDE047":"#FB923C"},layer);
      let vx=Math.cos(a)*v,vy=Math.sin(a)*v-60,px=x,py=y;
      parts.push({el:c,age:0,life:.5+Math.random()*.5,tick:(p,k,dt)=>{vy+=320*dt;px+=vx*dt;py+=vy*dt;c.setAttribute("cx",px.toFixed(1));c.setAttribute("cy",py.toFixed(1));c.setAttribute("opacity",(1-k).toFixed(2));}});}go();}
  function fireball(layer,x,y,o={}){ensure(layer);const R=o.r||90;
    const ball=mk("circle",{cx:x,cy:y,r:4,fill:"url(#fxpBall)"},layer),ring=mk("circle",{cx:x,cy:y,r:10,fill:"none",stroke:"#FDE68A","stroke-width":5},layer),
      core=mk("circle",{cx:x,cy:y,r:3,fill:"#FFFFFF"},layer);
    parts.push({el:ball,age:0,life:RMQ?.5:.95,tick:(p,k)=>{ball.setAttribute("r",(4+R*Math.pow(k,.45)).toFixed(1));ball.setAttribute("opacity",(1-k*k).toFixed(2));}});
    parts.push({el:core,age:0,life:.25,tick:(p,k)=>{core.setAttribute("r",(3+R*.45*k).toFixed(1));core.setAttribute("opacity",(1-k).toFixed(2));}});
    parts.push({el:ring,age:0,life:RMQ?.5:.8,tick:(p,k)=>{ring.setAttribute("r",(10+R*2.1*k).toFixed(1));ring.setAttribute("stroke-width",(5*(1-k)+.5).toFixed(1));ring.setAttribute("opacity",(1-k).toFixed(2));}});
    sparks(layer,x,y,26,{speed:240});
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2,l=mk("line",{stroke:"#FDE047","stroke-width":4,"stroke-linecap":"round"},layer);
      parts.push({el:l,age:0,life:.5,tick:(p,k)=>{const r1=R*.35+k*R*.7,r2=R*.5+k*R;l.setAttribute("x1",(x+Math.cos(a)*r1).toFixed(1));l.setAttribute("y1",(y+Math.sin(a)*r1).toFixed(1));l.setAttribute("x2",(x+Math.cos(a)*r2).toFixed(1));l.setAttribute("y2",(y+Math.sin(a)*r2).toFixed(1));l.setAttribute("opacity",(1-k).toFixed(2));}});}
    go();}
  return {init,smoke,stream,flame,sparks,fireball};
})();
