/* Smart Science Lab — shared page-fit and old-browser compatibility layer.
   Loaded (via <script src>) last, on every lesson's lab.html and games.html.
   Two independent pieces:
   1. Auto-fit (v1): shrinks/grows page zoom (via CSS zoom, where supported)
      so every control stays inside the screen on any phone, tablet or
      smart panel, instead of overflowing or scrolling.
   2. Old-browser helpers: synthesizes Pointer Events from touch/mouse
      events where PointerEvent isn't supported, and polyfills flex "gap"
      with margins where the browser doesn't support it natively. */
/* ===== Auto-fit (v1): keeps every page inside the screen on any phone, tablet or smart panel ===== */
(function(){
  const D=document.documentElement;let Z=1,busy=false,tm=0;
  const canZoom=("zoom" in D.style);
  const setZ=z=>{Z=z;D.style.zoom=z===1?"":String(z);};
  function clipOf(e){for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){const s=getComputedStyle(p);
      if(s.position==="fixed"&&p.classList.contains("cf"))return null;
      const o=s.overflowX+s.overflowY;if(/auto|scroll/.test(o))return null;if(/hidden|clip/.test(o))return p;}return document.body;}
  let WHY=[];
  function need(){const W=innerWidth,H=innerHeight;let worst=0;WHY=[];
    const els=document.body.querySelectorAll("button,p,h1,h2,h3,li,label,.tag,.chip,.btn,.msg,.next,.pill,a,span.lbl,[data-fit]");
    for(const e of els){if(e.closest("svg,.cf,[hidden],.sr,aside,#obs,.note,.toast,#toast"))continue;const r=e.getBoundingClientRect();
      if(r.width<2||r.height<2)continue;if(e.offsetParent===null&&getComputedStyle(e).position!=="fixed")continue;
      const c=clipOf(e);if(c===null)continue;const R=c===document.body?{top:0,left:0,right:W/Z,bottom:H/Z}:c.getBoundingClientRect();
      const over=Math.max(r.bottom-R.bottom,r.right-R.right,R.top-r.top,R.left-r.left);
      if(over>3){worst=Math.max(worst,over/Math.max(40,R.bottom-R.top));WHY.push([e.tagName+"."+(e.className||"")+"#"+(e.id||""),(e.textContent||"").slice(0,30),Math.round(over),c===document.body?"BODY":(c.tagName+"."+c.className+"#"+c.id)]);}}
    return worst;}
  function picShare(){document.querySelectorAll(".game.on, section.on").forEach(g=>{const q=g.querySelector("p.q");if(!q)return;
      if(q.dataset.af!==q.textContent){q.dataset.af=q.textContent;q.style.fontSize="";}
      const sc=g.querySelector(".scene,.pic");const sv=sc&&sc.querySelector('svg[data-pic="1"]');if(!sv||!sc.offsetHeight)return;
      let fs=parseFloat(getComputedStyle(q).fontSize),base=fs;
      for(let k=0;k<6&&sc.getBoundingClientRect().height<0.3*g.getBoundingClientRect().height&&fs>base*0.72;k++){fs*=0.92;q.style.fontSize=fs.toFixed(1)+"px";}});}
  let pend=0;
  function shrink(){for(let k=0;k<8;k++){const n=need();if(n<=0.004)break;const z=Math.max(0.55,Z*Math.min(0.96,1/(1+n)));if(z>=Z-0.005)break;setZ(+z.toFixed(3));}}
  function grow(){for(let k=0;k<8&&Z<1;k++){const old=Z;setZ(Math.min(1,+(Z/0.96).toFixed(3)));if(need()>0.004){setZ(old);break;}}}
  function fit(reset){if(busy)return;busy=true;
    try{if(reset&&Z!==1)setZ(1);picShare();
      if(canZoom){
        if(reset)shrink();
        else if(need()>0.004){if(!pend){pend=setTimeout(()=>{pend=0;busy=true;try{shrink();}catch(e){}busy=false;},450);}}
        else if(Z<1)grow();}
    }catch(e){}busy=false;}
  window.__autofit={fit:()=>fit(true),zoom:()=>Z,need,why:()=>{need();return WHY;}};
  const later=(r)=>{clearTimeout(tm);tm=setTimeout(()=>fit(r),r?250:180);};
  addEventListener("load",()=>{fit(true);setTimeout(()=>fit(false),900);});
  addEventListener("resize",()=>later(true));addEventListener("orientationchange",()=>later(true));
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>later(true));
  if(window.MutationObserver)new MutationObserver(()=>later(false)).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["hidden","class"]});
})();
/* ===== Old-browser helpers: touch/mouse drag without Pointer Events, and flex "gap" fallback ===== */
(function(){
  if(!window.PointerEvent){
    if(!Element.prototype.setPointerCapture){Element.prototype.setPointerCapture=function(){};Element.prototype.releasePointerCapture=function(){};}
    let tgt=null;
    const fire=(type,src,x,y)=>{if(!tgt)return;let e;try{e=new MouseEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y});}catch(_){e=document.createEvent("MouseEvents");e.initMouseEvent(type,true,true,window,0,0,0,x,y,false,false,false,false,0,null);}
      try{Object.defineProperty(e,"pointerId",{value:1});Object.defineProperty(e,"pointerType",{value:src});}catch(_){}tgt.dispatchEvent(e);};
    document.addEventListener("touchstart",e=>{const t=e.changedTouches[0];tgt=e.target;fire("pointerdown","touch",t.clientX,t.clientY);},{passive:true,capture:true});
    document.addEventListener("touchmove",e=>{if(!tgt)return;const t=e.changedTouches[0];fire("pointermove","touch",t.clientX,t.clientY);if(tgt.closest&&tgt.closest(".chip"))e.preventDefault();},{passive:false,capture:true});
    document.addEventListener("touchend",e=>{if(!tgt)return;const t=e.changedTouches[0];fire("pointerup","touch",t.clientX,t.clientY);tgt=null;},{capture:true});
    document.addEventListener("touchcancel",()=>{if(!tgt)return;fire("pointercancel","touch",0,0);tgt=null;},{capture:true});
    document.addEventListener("mousedown",e=>{if(tgt)return;tgt=e.target;fire("pointerdown","mouse",e.clientX,e.clientY);},true);
    document.addEventListener("mousemove",e=>{if(tgt)fire("pointermove","mouse",e.clientX,e.clientY);},true);
    document.addEventListener("mouseup",e=>{if(!tgt)return;fire("pointerup","mouse",e.clientX,e.clientY);tgt=null;},true);
  }
  function gapOK(){const d=document.createElement("div");d.style.cssText="display:flex;flex-direction:column;row-gap:1px;position:absolute;visibility:hidden";
    d.appendChild(document.createElement("div"));d.appendChild(document.createElement("div"));document.body.appendChild(d);const ok=d.scrollHeight===1;d.remove();return ok;}
  function fixGaps(){document.querySelectorAll("body *").forEach(el=>{const s=getComputedStyle(el);if(!/flex/.test(s.display))return;
      const rg=parseFloat(s.rowGap)||0,cg=parseFloat(s.columnGap)||0;if(!rg&&!cg)return;const col=/column/.test(s.flexDirection),wrap=s.flexWrap!=="nowrap";
      let first=true;for(const c of el.children){if(getComputedStyle(c).position==="absolute")continue;
        if(wrap){c.style.margin=(rg/2)+"px "+(cg/2)+"px";}else if(!first){if(col)c.style.marginTop=rg+"px";else c.style.marginLeft=cg+"px";}first=false;}});}
  addEventListener("load",()=>{try{if(!gapOK()){document.documentElement.classList.add("nogap");fixGaps();
      if(window.MutationObserver){let t=0;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(fixGaps,120);}).observe(document.body,{childList:true,subtree:true});}}}catch(e){}});
})();
