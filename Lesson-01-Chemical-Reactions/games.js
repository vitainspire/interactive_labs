/* Lesson 1: Chemical Reactions and Equations — games.html content.
   Shared quiz-tab engine ($, Snd, mark, quiz, nav wiring, auto-next) lives
   in ../shared/app.js, loaded before this file. Everything below is this
   lesson's own: chemistry formula display, the 42 textbook equations,
   the 5 games' question data, and the SVG lab-picture scenes. */
(function(){
  const fx=f=>f.replace(/([A-Za-z)])(\d+)/g,"$1<sub>$2</sub>");
  const tokH=tok=>tok==="+"?'<span class="op">+</span>':tok==="→"?'<span class="op">→</span>':`<span class="t">${tok.replace(/^(\d*)(.+)$/,(m,c,f)=>c+fx(f))}</span>`;
  const eqH=s=>s.split(" ").map(tokH).join(" ");
  // ---------- chemistry helpers ----------
  function atoms(f){
    let i=0;
    const num=()=>{let s="";while(i<f.length&&/\d/.test(f[i]))s+=f[i++];return s?+s:1;};
    const group=()=>{
      const m={};
      while(i<f.length&&f[i]!==")"){
        if(f[i]==="("){i++;const g=group();i++;const n=num();for(const k in g)m[k]=(m[k]||0)+g[k]*n;}
        else{let el=f[i++];while(i<f.length&&/[a-z]/.test(f[i]))el+=f[i++];const n=num();m[el]=(m[el]||0)+n;}
      }
      return m;
    };
    return group();
  }
  function tally(eq,c){
    const L={},R={},order=[];
    eq.r.forEach((f,i)=>{const a=atoms(f);for(const k in a){if(!order.includes(k))order.push(k);L[k]=(L[k]||0)+a[k]*c[i];}});
    eq.p.forEach((f,j)=>{const a=atoms(f);for(const k in a){if(!order.includes(k))order.push(k);R[k]=(R[k]||0)+a[k]*c[eq.r.length+j];}});
    return order.map(k=>({el:k,l:L[k]||0,r:R[k]||0}));
  }
  const gcd=(a,b)=>b?gcd(b,a%b):a;
  function solve(eq){
    const n=eq.r.length+eq.p.length;let best=null,bs=1e9;const c=new Array(n).fill(1);
    const rec=k=>{
      if(k===n){const s=c.reduce((a,b)=>a+b,0);if(s<bs&&tally(eq,c).every(x=>x.l===x.r)){bs=s;best=c.slice();}return;}
      for(let v=1;v<=9;v++){c[k]=v;if(c.reduce((a,b)=>a+b,0)>=bs)break;rec(k+1);}
      c[k]=1;
    };
    rec(0);return best;
  }
  const balStr=eq=>{const c=eq.c,nr=eq.r.length;const t=(f,i)=>(c[i]>1?c[i]:"")+f;
    return eq.r.map((f,i)=>t(f,i)).join(" + ")+" → "+eq.p.map((f,j)=>t(f,nr+j)).join(" + ");};

  // ---------- formula choices for word equations ----------
  const NAME={
    "Hydrogen":["H2","H","H3"],"Oxygen":["O2","O","O3"],"Nitrogen":["N2","N","N3"],"Chlorine":["Cl2","Cl","CL2"],
    "Carbon":["C","Ca","Co"],"Water":["H2O","H2O2","HO2"],"Hydrogen chloride":["HCl","HCl2","H2Cl"],
    "Hydrochloric acid":["HCl","HCl2","H2Cl"],"Ammonia":["NH3","NH4","N3H"],"Hydrogen sulphide":["H2S","HS","H2SO4"],
    "Sulphur dioxide":["SO2","SO3","S2O"],"Carbon dioxide":["CO2","CO","C2O"],"Sodium":["Na","NA","So"],
    "Potassium":["K","P","Po"],"Magnesium":["Mg","MG","Mn"],"Zinc":["Zn","ZN","Z"],"Silver":["Ag","Si","AG"],
    "Aluminium":["Al","AL","A"],"Copper":["Cu","Co","CU"],"Iron":["Fe","Ir","I"],"Lead":["Pb","Le","PB"],
    "Sodium hydroxide":["NaOH","Na(OH)2","NaO"],"Potassium hydroxide":["KOH","K(OH)2","PoOH"],
    "Calcium hydroxide":["Ca(OH)2","CaOH","Ca2OH"],"Calcium oxide":["CaO","CaO2","Ca2O"],
    "Calcium carbonate":["CaCO3","Ca2CO3","CaCO2"],"Barium chloride":["BaCl2","BaCl","Ba2Cl"],
    "Aluminium sulphate":["Al2(SO4)3","Al3(SO4)2","AlSO4"],"Barium sulphate":["BaSO4","Ba2SO4","Ba(SO4)2"],
    "Aluminium chloride":["AlCl3","AlCl","Al3Cl"],"Silver nitrate":["AgNO3","Ag(NO3)2","Ag2NO3"],
    "Silver chloride":["AgCl","AgCl2","SiCl"],"Zinc nitrate":["Zn(NO3)2","ZnNO3","Zn2NO3"],
    "Copper chloride":["CuCl2","CuCl","Cu2Cl"],"Copper oxide":["CuO","CuO2","Cu2O"],
    "Potassium sulphate":["K2SO4","KSO4","K(SO4)2"],"Potassium chloride":["KCl","KCl2","K2Cl"],
    "Potassium bromide":["KBr","KBr2","PBr"],"Barium iodide":["BaI2","BaI","Ba2I"],"Potassium iodide":["KI","KI2","K2I"],
    "Barium bromide":["BaBr2","BaBr","Ba2Br"],"Zinc carbonate":["ZnCO3","Zn2CO3","Zn(CO3)2"],"Zinc oxide":["ZnO","ZnO2","Zn2O"],
    "Magnesium chloride":["MgCl2","MgCl","Mg2Cl"],"Magnesium oxide":["MgO","MgO2","Mg2O"],
    "Sodium sulphate":["Na2SO4","NaSO4","Na(SO4)2"],"Sodium chloride":["NaCl","NaCl2","Na2Cl"],
    "Sodium nitrate":["NaNO3","Na(NO3)2","NaNO2"],"Sulphuric acid":["H2SO4","HSO4","H2SO3"],
    "Zinc sulphate":["ZnSO4","Zn2SO4","Zn(SO4)2"],"Copper nitrate":["Cu(NO3)2","CuNO3","Cu2NO3"],
    "Copper sulphate":["CuSO4","Cu2SO4","CuSO3"],"Iron sulphate":["FeSO4","Fe2SO4","FeSO3"],
    "Lead nitrate":["Pb(NO3)2","PbNO3","Pb2NO3"],"Lead iodide":["PbI2","PbI","LeI2"],
    "Potassium nitrate":["KNO3","K(NO3)2","KNO2"],"Lead chloride":["PbCl2","PbCl","LeCl2"]
  };

  // ---------- textbook equations ----------
  // [reactants, products, type, reactant names, product names]
  const RAW=[
    [["Mg","O2"],["MgO"],"comb",["Magnesium","Oxygen"],["Magnesium oxide"]],
    [["Zn","H2SO4"],["ZnSO4","H2"],"disp",["Zinc","Sulphuric acid"],["Zinc sulphate","Hydrogen"]],
    [["Fe","H2O"],["Fe3O4","H2"],null],
    [["H2","O2"],["H2O"],"comb",["Hydrogen","Oxygen"],["Water"]],
    [["CH4","O2"],["CO2","H2O"],null],
    [["C6H12O6","O2"],["CO2","H2O"],null],
    [["FeSO4"],["Fe2O3","SO2","SO3"],"decomp"],
    [["Pb(NO3)2"],["PbO","NO2","O2"],"decomp"],
    [["H2O"],["H2","O2"],"decomp",["Water"],["Hydrogen","Oxygen"]],
    [["AgCl"],["Ag","Cl2"],"decomp",["Silver chloride"],["Silver","Chlorine"]],
    [["AgBr"],["Ag","Br2"],"decomp"],
    [["Na2SO4","BaCl2"],["BaSO4","NaCl"],"dd",["Sodium sulphate","Barium chloride"],["Barium sulphate","Sodium chloride"]],
    [["Cu","O2"],["CuO"],"comb",["Copper","Oxygen"],["Copper oxide"]],
    [["MnO2","HCl"],["MnCl2","H2O","Cl2"],null],
    [["Na","O2"],["Na2O"],"comb"],
    [["PbO","C"],["Pb","CO2"],null],
    [["Fe2O3","Al"],["Al2O3","Fe"],"disp"],
    [["HNO3","Ca(OH)2"],["Ca(NO3)2","H2O"],"dd"],
    [["NaOH","H2SO4"],["Na2SO4","H2O"],"dd",["Sodium hydroxide","Sulphuric acid"],["Sodium sulphate","Water"]],
    [["NaCl","AgNO3"],["AgCl","NaNO3"],"dd",["Sodium chloride","Silver nitrate"],["Silver chloride","Sodium nitrate"]],
    [["BaCl2","H2SO4"],["BaSO4","HCl"],"dd",["Barium chloride","Sulphuric acid"],["Barium sulphate","Hydrochloric acid"]],
    [["Pb(NO3)2","KI"],["PbI2","KNO3"],"dd",["Lead nitrate","Potassium iodide"],["Lead iodide","Potassium nitrate"]],
    [["CaO","H2O"],["Ca(OH)2"],"comb",["Calcium oxide","Water"],["Calcium hydroxide"]],
    [["Ca(OH)2","CO2"],["CaCO3","H2O"],null,["Calcium hydroxide","Carbon dioxide"],["Calcium carbonate","Water"]],
    [["CaCO3"],["CaO","CO2"],"decomp",["Calcium carbonate"],["Calcium oxide","Carbon dioxide"]],
    [["H2","Cl2"],["HCl"],"comb",["Hydrogen","Chlorine"],["Hydrogen chloride"]],
    [["BaCl2","Al2(SO4)3"],["BaSO4","AlCl3"],"dd",["Barium chloride","Aluminium sulphate"],["Barium sulphate","Aluminium chloride"]],
    [["Na","H2O"],["NaOH","H2"],"disp",["Sodium","Water"],["Sodium hydroxide","Hydrogen"]],
    [["H2","N2"],["NH3"],"comb",["Hydrogen","Nitrogen"],["Ammonia"]],
    [["H2S","O2"],["H2O","SO2"],null,["Hydrogen sulphide","Oxygen"],["Water","Sulphur dioxide"]],
    [["K","H2O"],["KOH","H2"],"disp",["Potassium","Water"],["Potassium hydroxide","Hydrogen"]],
    [["Zn","AgNO3"],["Zn(NO3)2","Ag"],"disp",["Zinc","Silver nitrate"],["Zinc nitrate","Silver"]],
    [["Al","CuCl2"],["AlCl3","Cu"],"disp",["Aluminium","Copper chloride"],["Aluminium chloride","Copper"]],
    [["BaCl2","K2SO4"],["BaSO4","KCl"],"dd",["Barium chloride","Potassium sulphate"],["Barium sulphate","Potassium chloride"]],
    [["KBr","BaI2"],["KI","BaBr2"],"dd",["Potassium bromide","Barium iodide"],["Potassium iodide","Barium bromide"]],
    [["ZnCO3"],["ZnO","CO2"],"decomp",["Zinc carbonate"],["Zinc oxide","Carbon dioxide"]],
    [["Mg","HCl"],["MgCl2","H2"],"disp",["Magnesium","Hydrochloric acid"],["Magnesium chloride","Hydrogen"]],
    [["NaOH","HCl"],["NaCl","H2O"],"dd",["Sodium hydroxide","Hydrochloric acid"],["Sodium chloride","Water"]],
    [["Cu","AgNO3"],["Cu(NO3)2","Ag"],"disp",["Copper","Silver nitrate"],["Copper nitrate","Silver"]],
    [["Fe","CuSO4"],["FeSO4","Cu"],"disp",["Iron","Copper sulphate"],["Iron sulphate","Copper"]],
    [["Zn","CuSO4"],["ZnSO4","Cu"],"disp",["Zinc","Copper sulphate"],["Zinc sulphate","Copper"]],
    [["Pb","CuCl2"],["PbCl2","Cu"],"disp",["Lead","Copper chloride"],["Lead chloride","Copper"]],
    [["C","O2"],["CO2"],"comb",["Carbon","Oxygen"],["Carbon dioxide"]]
  ];
  const EQ=RAW.map(x=>{const e={r:x[0],p:x[1],t:x[2],rn:x[3],pn:x[4]};e.c=solve(e);e.s=balStr(e);return e;});
  const TYPE={comb:"Combination",decomp:"Decomposition",disp:"Displacement",dd:"Double displacement"};
  const WHY={
    comb:"Two or more reactants join to form a single product.",
    decomp:"A single reactant breaks down into two or more products.",
    disp:"A more reactive element pushes out another element from its compound.",
    dd:"Two compounds exchange their ions."
  };

  // ---------- textbook-first engine (shared) ----------
  const fxT=s=>String(s).replace(/([A-Za-z)])(\d+)/g,"$1<sub>$2</sub>");
  const tag=(id,src)=>{const t=$(id);t.textContent=src;t.classList.toggle("think",!src.startsWith("📘"));};
  const sel=(arr,nums)=>nums.map(n=>arr[n-1]);
  function makeSeq(o){
    // o: {pre, CORE, BONUS}: textbook core questions first, then a bonus round, then all again
    const P=o.pre;let list=[],i=0,round=0;
    const fill=()=>{round++;
      const mix=a=>round===1?a:shuffle(a);
      const c=mix(o.CORE).map((x,k)=>Object.assign({},x,{_b:0,_n:k+1})),b=mix(o.BONUS).map((x,k)=>Object.assign({},x,{_b:1,_n:k+1}));
      list=[...c,...b];i=0;};
    const showItem=it=>{
      const T=$(P+"Tag");
      if(it._b){T.textContent=`⭐ Bonus ${it._n} of ${o.BONUS.length}`;T.classList.add("think");}
      else{T.textContent=`${it.src||"📘 Textbook"} · ${it._n} of ${o.CORE.length}`;T.classList.remove("think");}
      $(P+"Q").innerHTML=fxT(it.q);
      const E=$(P+"Eq");
      if(it.eq){E.hidden=false;E.className="eqshow";E.innerHTML=eqH(it.eq);}
      else if(it.card){E.hidden=false;E.className="eqshow cardline";E.innerHTML=`<span class="ic">${it.card[0]}</span> ${fxT(it.card[1])}`;}
      else E.hidden=true;
      const PB=$(P+"Pic");
      if(PB){const sv=PB.querySelector("svg");sv.innerHTML="";sv.setAttribute("viewBox","0 0 640 240");
        PB.hidden=!it.pic;PB.closest(".game").classList.toggle("haspic",!!it.pic);if(it.pic)drawPic(it,sv);}
      const box=$(P+"Opts");box.className="opts txt"+(it.lay==="col"?" col":it.lay==="three"?" three":"");
      quiz(box,shuffle([it.a,...it.t]),x=>x===it.a,x=>fxT(x),ok=>{
        setMsg(P+"Msg",ok?"ok":"bad",(ok?"Correct! ":`Answer: <b>${fxT(it.a)}</b>. `)+fxT(it.w));$(P+"Next").hidden=false;});
      setMsg(P+"Msg","",it.hint||"Choose the right answer.");$(P+"Next").hidden=true;
    };
    const next=()=>{
      if(i>=list.length){fill();banner(`🔁 Round ${round}: all ${list.length} again`);}
      const it=list[i++];
      if(it._b&&it._n===1){banner("⭐ Bonus round!");Snd.fan();}
      showItem(it);
    };
    fill();
    $(P+"Next").onclick=next;
    return next;
  }

  // ---------- 2. Reaction Type: textbook first ----------
  const TY_FIRST=[
    {q:"Which observations tell us that a chemical reaction has taken place?",a:"A change in state, colour or temperature, or a gas is given off",t:["Only a change in size","Only a change in place","Only a change in weight of the container"],w:"Activities 1.1 to 1.3 show these signs.",lay:"col",src:"📘 Introduction"},
    {q:"In Magnesium + Oxygen → Magnesium oxide, the reactants are",a:"Magnesium and oxygen",t:["Magnesium oxide only","Oxygen and magnesium oxide","Air and fire"],w:"Reactants are written on the left side; products on the right.",card:["🔥","Magnesium + Oxygen → Magnesium oxide"],src:"📘 Eq. 1.1"},
    {q:"An equation with an unequal number of atoms on the two sides is called",a:"A skeletal chemical equation",t:["A balanced equation","A word-equation","A redox equation"],w:"Mg + O2 → MgO is a skeletal equation.",eq:"Mg + O2 → MgO",src:"📘 Section 1.1.1"},
    {q:"Why should chemical equations be balanced?",a:"Mass can neither be created nor destroyed in a reaction",t:["To make them look neat","Because products are always heavier","To change the formulae"],w:"Law of conservation of mass: atoms of each element stay the same in number.",lay:"col",src:"📘 Exercise 4"},
    {q:"While balancing an equation, what can we change?",a:"Only the numbers in front of the formulae (coefficients)",t:["The formulae themselves, e.g. H2O to H2O2","The subscripts inside formulae","The arrow direction"],w:"Write 4H2O, not H2O4 or (H2O)4.",lay:"col",src:"📘 Section 1.1.2"},
    {q:"Balancing by trying the smallest whole numbers is called the",a:"Hit-and-trial method",t:["Ion-exchange method","Electrolysis method","Word method"],w:"We make trials using small whole-number coefficients.",src:"📘 Section 1.1.2"},
    {q:"In 3Fe(s) + 4H2O(g) → Fe3O4(s) + 4H2(g), the (g) with water shows that water is used as",a:"Steam",t:["Ice","A solution","A solid"],w:"(s) solid, (l) liquid, (g) gas, (aq) aqueous solution.",eq:"3Fe + 4H2O → Fe3O4 + 4H2",src:"📘 Eq. 1.10"},
    {q:"The symbol (aq) means the substance is",a:"Dissolved in water",t:["A gas","A solid","Heated"],w:"Aqueous means present as a solution in water.",src:"📘 Section 1.1.2"},
    {q:"Why should a magnesium ribbon be cleaned before burning?",a:"To remove the layer of magnesium oxide on its surface",t:["To make it heavier","To add oxygen to it","To make it wet"],w:"The oxide layer stops it from burning properly.",lay:"col",src:"📘 In-text Q1 (1.1)"},
    {q:"What type of reaction is this?",eq:"CaO + H2O → Ca(OH)2",a:"Combination",t:["Decomposition","Displacement","Double displacement"],w:"Two reactants form a single product. It also gives out a lot of heat.",src:"📘 Activity 1.4"},
    {q:"A solution of substance X is used for whitewashing. What is X?",a:"Calcium oxide (quick lime), CaO",t:["Calcium carbonate, CaCO3","Sodium chloride, NaCl","Copper sulphate, CuSO4"],w:"CaO + H2O → Ca(OH)2 (slaked lime) is used for whitewashing.",lay:"col",src:"📘 In-text Q1 (1.2)"},
    {q:"Whitewashed walls become shiny after 2–3 days. Why?",a:"Calcium hydroxide reacts with CO2 in air to form calcium carbonate",t:["The water evaporates and leaves salt","The lime turns into quick lime again","Sunlight bleaches the walls"],w:"Ca(OH)2 + CO2 → CaCO3 + H2O. Marble is also CaCO3.",lay:"col",eq:"Ca(OH)2 + CO2 → CaCO3 + H2O",src:"📘 Eq. 1.14"},
    {q:"Burning of magnesium (Activity 1.1) gives heat and a single product. What type is it?",a:"Combination",t:["Decomposition","Displacement","Double displacement"],w:"It is a combination reaction that is also exothermic.",eq:"2Mg + O2 → 2MgO",src:"📘 Section 1.2.1"},
    {q:"Ferrous sulphate crystals are heated. What type of reaction is this?",eq:"2FeSO4 → Fe2O3 + SO2 + SO3",a:"Decomposition",t:["Combination","Displacement","Double displacement"],w:"A single reactant breaks into simpler products.",src:"📘 Activity 1.5"},
    {q:"A decomposition reaction carried out by heating is called",a:"Thermal decomposition",t:["Electrolysis","Photolysis","Combination"],w:"Example: CaCO3 → CaO + CO2.",eq:"CaCO3 → CaO + CO2",src:"📘 Section 1.2.2"},
    {q:"Calcium oxide (lime) from decomposing limestone is used to make",a:"Cement",t:["Glass bangles","Soap","Paper"],w:"Decomposition of CaCO3 is an important industrial reaction.",src:"📘 Section 1.2.2"},
    {q:"Decomposition reactions need energy in the form of",a:"Heat, light or electricity",t:["Only cold","Only sound","Only pressure"],w:"Heat: CaCO3; light: AgCl; electricity: water.",lay:"col",src:"📘 Exercise 12"},
    {q:"The decomposition of silver chloride and silver bromide in light is used in",a:"Black and white photography",t:["Making cement","Whitewashing","Making soap"],w:"2AgCl → 2Ag + Cl2 in sunlight.",eq:"2AgCl → 2Ag + Cl2",src:"📘 Section 1.2.2"},
    {q:"Why are decomposition reactions called the opposite of combination reactions?",a:"One substance breaks into many, instead of many joining into one",t:["Both form one product","Decomposition always gives out heat","They use the same reactants and products"],w:"Combination: A + B → AB. Decomposition: AB → A + B.",lay:"col",src:"📘 Exercise 11"},
    {q:"An iron nail is dipped in copper sulphate solution. What type of reaction is this?",eq:"Fe + CuSO4 → FeSO4 + Cu",a:"Displacement",t:["Combination","Decomposition","Double displacement"],w:"Iron displaces copper from copper sulphate.",src:"📘 Activity 1.9"},
    {q:"Zinc and lead can displace copper from its compounds because they are",a:"More reactive than copper",t:["Less reactive than copper","Heavier than copper","Non-metals"],w:"A more reactive element displaces a less reactive one.",src:"📘 Section 1.2.3"},
    {q:"What type of reaction is this?",eq:"Na2SO4 + BaCl2 → BaSO4 + 2NaCl",a:"Double displacement",t:["Displacement","Combination","Decomposition"],w:"The reactants exchange ions. BaSO4 is a white precipitate.",src:"📘 Activity 1.10"},
    {q:"A reaction that gives an insoluble solid is called",a:"A precipitation reaction",t:["A decomposition reaction","A combination reaction","A redox reaction"],w:"The insoluble substance formed is a precipitate.",src:"📘 Exercise 15"},
    {q:"Lead nitrate + potassium iodide (Activity 1.2). Is this a double displacement reaction?",eq:"Pb(NO3)2 + 2KI → PbI2 + 2KNO3",a:"Yes — ions are exchanged and yellow PbI2 forms",t:["No — it is decomposition","No — it is combination","No — nothing reacts"],w:"Lead iodide is the yellow precipitate.",lay:"col",src:"📘 In-text (1.2.4)"},
    {q:"The reaction below is an example of a",eq:"Fe2O3 + 2Al → Al2O3 + 2Fe",a:"Displacement reaction",t:["Combination reaction","Double displacement reaction","Decomposition reaction"],w:"Aluminium displaces iron from its oxide.",src:"📘 Exercise 2"},
    {q:"What happens when dilute hydrochloric acid is added to iron filings?",a:"Hydrogen gas and iron chloride are produced",t:["Chlorine gas and iron hydroxide are produced","No reaction takes place","Iron salt and water are produced"],w:"Fe + 2HCl → FeCl2 + H2.",lay:"col",src:"📘 Exercise 3"},
    {q:"What is the difference between displacement and double displacement?",a:"Displacement: one element pushes out another. Double: two compounds exchange ions",t:["Both are the same","Displacement needs light; double needs heat","Double displacement always gives a gas"],w:"Fe + CuSO4 (displacement); Na2SO4 + BaCl2 (double displacement).",lay:"col",src:"📘 Exercise 13"},
    {q:"Silver is recovered from silver nitrate using copper. The reaction is",eq:"Cu + 2AgNO3 → Cu(NO3)2 + 2Ag",a:"Displacement",t:["Decomposition","Combination","Double displacement"],w:"Copper is more reactive than silver, so it displaces silver.",src:"📘 Exercise 14"}
  ];

  // ---------- 3. Redox: textbook first ----------
  const RD_FIRST=[
    {q:"Copper powder is heated in a china dish. What do you see?",a:"The surface becomes coated with a black substance",t:["It turns green","It melts into a liquid","Nothing happens"],w:"Oxygen is added to copper and black copper(II) oxide forms.",lay:"col",eq:"2Cu + O2 → 2CuO",src:"📘 Activity 1.11"},
    {q:"Hydrogen gas is passed over the hot black copper oxide. What happens?",a:"The black coating turns brown — copper is obtained",t:["It turns white","It catches fire","It turns blue"],w:"The reverse reaction takes place: CuO + H2 → Cu + H2O.",lay:"col",eq:"CuO + H2 → Cu + H2O",src:"📘 Eq. 1.29"},
    {q:"If a substance gains oxygen during a reaction, it is said to be",a:"Oxidised",t:["Reduced","Neutralised","Decomposed"],w:"Gain of oxygen = oxidation.",src:"📘 Section 1.2.5"},
    {q:"If a substance loses oxygen during a reaction, it is said to be",a:"Reduced",t:["Oxidised","Displaced","Precipitated"],w:"Loss of oxygen = reduction.",src:"📘 Section 1.2.5"},
    {q:"In CuO + H2 → Cu + H2O, which substance is reduced?",eq:"CuO + H2 → Cu + H2O",a:"CuO",t:["H2","Cu","H2O"],w:"Copper(II) oxide loses oxygen, so it is reduced. Hydrogen gains oxygen, so it is oxidised.",src:"📘 Eq. 1.29"},
    {q:"A reaction in which one reactant is oxidised and another is reduced is called",a:"A redox reaction",t:["A precipitation reaction","A decomposition reaction","A neutralisation reaction"],w:"Oxidation and reduction happen together.",src:"📘 Section 1.2.5"},
    {q:"In ZnO + C → Zn + CO, which substance is oxidised?",eq:"ZnO + C → Zn + CO",a:"C",t:["ZnO","Zn","CO"],w:"Carbon gains oxygen to form CO. ZnO is reduced to Zn.",src:"📘 Eq. 1.30"},
    {q:"In MnO2 + 4HCl → MnCl2 + 2H2O + Cl2, which substance is oxidised?",eq:"MnO2 + 4HCl → MnCl2 + 2H2O + Cl2",a:"HCl",t:["MnO2","MnCl2","H2O"],w:"HCl loses hydrogen and becomes Cl2. MnO2 is reduced to MnCl2.",src:"📘 Eq. 1.31"},
    {q:"Loss of hydrogen is",a:"Oxidation",t:["Reduction","Neutralisation","Corrosion"],w:"Gain of oxygen or loss of hydrogen = oxidation.",src:"📘 Section 1.2.5"},
    {q:"Gain of hydrogen is",a:"Reduction",t:["Oxidation","Combination","Rancidity"],w:"Loss of oxygen or gain of hydrogen = reduction.",src:"📘 Section 1.2.5"},
    {q:"Magnesium burns in air to form magnesium oxide. Magnesium is",a:"Oxidised",t:["Reduced","Neither"],w:"Magnesium gains oxygen.",lay:"three",eq:"2Mg + O2 → 2MgO",src:"📘 In-text (1.2.5)"},
    {q:"In 4Na + O2 → 2Na2O, which substance is oxidised?",eq:"4Na + O2 → 2Na2O",a:"Na",t:["O2","Na2O"],w:"Sodium gains oxygen.",lay:"three",src:"📘 In-text Q3 (i)"},
    {q:"Which statements about 2PbO + C → 2Pb + CO2 are <b>incorrect</b>? (a) Lead is reduced (b) CO2 is oxidised (c) Carbon is oxidised (d) Lead oxide is reduced",eq:"2PbO + C → 2Pb + CO2",a:"(a) and (b)",t:["(a) and (c)","(a), (b) and (c)","All"],w:"Lead oxide (not lead) is reduced, and CO2 is a product, not oxidised.",src:"📘 Exercise 1"},
    {q:"A shiny brown element X becomes black when heated in air. What are X and the black compound?",a:"X = copper; black compound = copper(II) oxide",t:["X = iron; black compound = rust","X = magnesium; black compound = MgO","X = silver; black compound = silver chloride"],w:"2Cu + O2 → 2CuO.",lay:"col",src:"📘 Exercise 17"},
    {q:"New iron articles get a reddish-brown coating after some time. This is called",a:"Rusting",t:["Rancidity","Precipitation","Electrolysis"],w:"Rusting is the corrosion of iron.",card:["🔩","Reddish-brown coating on iron"],src:"📘 Section 1.3.1"},
    {q:"When a metal is attacked by moisture, acids, etc. around it, the process is called",a:"Corrosion",t:["Rancidity","Neutralisation","Decomposition"],w:"Rust on iron, black coating on silver and green coating on copper are corrosion.",src:"📘 Section 1.3.1"},
    {q:"What colour is the coating formed on silver by corrosion?",a:"Black",t:["Green","Reddish-brown","White"],w:"Silver gets a black coating; copper gets a green coating.",card:["🥄","Old silver spoon"],src:"📘 Section 1.3.1"},
    {q:"What colour is the coating formed on copper by corrosion?",a:"Green",t:["Black","Reddish-brown","Blue"],w:"Copper vessels get a green coating.",card:["🫖","Old copper vessel"],src:"📘 Section 1.3.1"},
    {q:"Corrosion causes damage to",a:"Car bodies, bridges, iron railings and ships",t:["Only plastic toys","Only glass windows","Only wooden tables"],w:"Corrosion of iron is a serious problem. Money is spent to replace damaged iron.",lay:"col",src:"📘 Section 1.3.1"},
    {q:"When fats and oils are oxidised, their smell and taste change. This is called",a:"Rancidity",t:["Corrosion","Rusting","Fermentation"],w:"Rancid food smells and tastes bad.",card:["🧈","Old oily food"],src:"📘 Section 1.3.2"},
    {q:"How can rancidity be slowed down?",a:"Add antioxidants and keep food in airtight containers",t:["Keep food in open air","Add more oil","Heat the food every day"],w:"These prevent or slow down oxidation.",lay:"col",src:"📘 Section 1.3.2"},
    {q:"Why do we apply paint on iron articles?",a:"To keep away air and moisture and prevent rusting",t:["To make them heavier","To make them conduct electricity","To make them magnetic"],w:"Paint stops corrosion of iron.",lay:"col",card:["🖌️","Painting iron gates"],src:"📘 Exercise 18"},
    {q:"Bags of chips and oily foods are flushed with nitrogen. Why?",a:"To prevent the food from getting oxidised (rancid)",t:["To make chips crispy by heating","To add flavour","To make the bag heavier"],w:"Nitrogen is unreactive and keeps oxygen away.",lay:"col",card:["🥔","Chips packet"],src:"📘 Exercise 19"}
  ];
  const RD_MORE=[
    {q:"Which of these is an example of corrosion?",a:"Iron gate becoming rusty",t:["Butter smelling bad","Milk turning into curd","Ice melting"],w:"Corrosion happens to metals."},
    {q:"Which of these is an example of rancidity?",a:"Old cooking oil smelling bad",t:["Iron nail rusting","Silver turning black","Copper turning green"],w:"Rancidity happens to fats and oils."},
    {q:"Which gas is used in chips packets to stop rancidity?",a:"Nitrogen",t:["Oxygen","Hydrogen","Chlorine"],w:"Nitrogen does not let the oil get oxidised."},
    {q:"Substances added to food to prevent oxidation are called",a:"Antioxidants",t:["Indicators","Catalysts","Precipitates"],w:"They slow down rancidity."},
    {q:"Rusting of iron is an example of",a:"Oxidation",t:["Reduction","Decomposition","Neutralisation"],w:"Iron reacts with oxygen and moisture."}
  ];

  // ---------- 5. Observations ----------
  const OB_FIRST=[
    {q:"A clean magnesium ribbon is burnt in air. How does it burn?",a:"With a dazzling white flame",t:["With a blue flame","With a green flame","It does not burn"],w:"Keep it away from your eyes while burning.",card:["🔥","Activity 1.1: Burning magnesium"],src:"📘 Activity 1.1"},
    {q:"What is left after the magnesium ribbon burns?",a:"A white powder (magnesium oxide)",t:["A black powder","A blue liquid","A yellow precipitate"],w:"Magnesium reacts with oxygen to form magnesium oxide.",card:["🥣","Ash in the watch-glass"],src:"📘 Activity 1.1"},
    {q:"Potassium iodide solution is added to lead nitrate solution. What do you see?",a:"A yellow precipitate forms",t:["A white precipitate forms","Brown fumes come out","Nothing happens"],w:"Yellow lead iodide (PbI2) forms.",card:["🧪","Activity 1.2: Lead nitrate + KI"],src:"📘 Activity 1.2"},
    {q:"Dilute acid is added to zinc granules. What do you observe?",a:"Bubbles of gas form and the flask becomes warm",t:["The flask becomes very cold","A yellow precipitate forms","The zinc turns black"],w:"Hydrogen gas is given off and heat is released.",lay:"col",card:["🫧","Activity 1.3: Zinc + dilute acid"],src:"📘 Activity 1.3"},
    {q:"Water is slowly added to quick lime (CaO) in a beaker. Touch the beaker. You feel",a:"It is hot",t:["It is cold","No change","It is wet outside"],w:"A large amount of heat is released. Slaked lime forms.",card:["🔥","Activity 1.4: Quick lime + water"],src:"📘 Activity 1.4"},
    {q:"What is the colour of ferrous sulphate crystals before heating?",a:"Green",t:["White","Blue","Yellow"],w:"FeSO4·7H2O crystals are green.",card:["💚","Activity 1.5: Ferrous sulphate"],src:"📘 Activity 1.5"},
    {q:"Ferrous sulphate crystals are heated. What do you notice?",a:"The green colour changes and there is a smell of burning sulphur",t:["They turn blue and smell sweet","They melt into a clear liquid","Nothing happens"],w:"2FeSO4 → Fe2O3 + SO2 + SO3.",lay:"col",card:["🔥","Heating ferrous sulphate"],src:"📘 Activity 1.5"},
    {q:"Lead nitrate powder is heated in a boiling tube. What do you see?",a:"Brown fumes are given off",t:["White fumes","Green fumes","A yellow precipitate"],w:"The brown fumes are nitrogen dioxide (NO2).",card:["🟤","Activity 1.6: Heating lead nitrate"],src:"📘 Activity 1.6"},
    {q:"Electric current is passed through water. What do you see at the electrodes?",a:"Bubbles of gas at both electrodes",t:["A solid at both electrodes","Nothing at all","Brown fumes"],w:"The bubbles push water out of the inverted test tubes.",card:["⚡","Activity 1.7: Electrolysis of water"],src:"📘 Activity 1.7"},
    {q:"Why is the gas in one test tube double the amount in the other? Name that gas.",a:"Water gives hydrogen and oxygen in a 2 : 1 ratio — it is hydrogen",t:["Oxygen is formed twice as much","The test tubes are of different size","Chlorine is formed"],w:"2H2O → 2H2 + O2.",lay:"col",card:["⚡","Electrolysis: 2 : 1"],src:"📘 In-text Q2 (1.2)"},
    {q:"White silver chloride is kept in sunlight. What happens?",a:"It turns grey",t:["It turns green","It turns blue","It stays white"],w:"2AgCl → 2Ag + Cl2. Silver makes it grey.",card:["☀️","Activity 1.8: Silver chloride in sunlight"],src:"📘 Activity 1.8"},
    {q:"Barium hydroxide is mixed with ammonium chloride. Touch the test tube. You feel",a:"It is cold",t:["It is hot","No change","It glows"],w:"Energy is absorbed — it is endothermic.",card:["🧊","Barium hydroxide + ammonium chloride"],src:"📘 In-text (1.2.2)"},
    {q:"Iron nails are kept in copper sulphate solution for 20 minutes. What do you see?",a:"The nails become brownish and the blue colour fades",t:["The nails turn silver and the solution turns red","Nothing changes","The nails dissolve completely"],w:"Fe + CuSO4 → FeSO4 + Cu. Copper deposits on the nails.",lay:"col",card:["🔩","Activity 1.9: Iron nails in CuSO4"],src:"📘 Activity 1.9"},
    {q:"Why does the colour of copper sulphate solution change when an iron nail is dipped in it?",a:"Iron displaces copper, forming iron sulphate",t:["Iron adds blue colour","The nail rusts in water","Copper sulphate evaporates"],w:"Blue CuSO4 changes into pale green FeSO4.",lay:"col",src:"📘 In-text Q1 (1.3)"},
    {q:"Sodium sulphate solution is mixed with barium chloride solution. What do you see?",a:"A white precipitate forms",t:["A yellow precipitate forms","Brown fumes come out","The mixture becomes hot and glows"],w:"Barium sulphate (BaSO4) is the white precipitate.",card:["⚪","Activity 1.10: Na2SO4 + BaCl2"],src:"📘 Activity 1.10"},
    {q:"Ammonium nitrate is dissolved in water. The temperature",a:"Falls (it becomes cold)",t:["Rises (it becomes hot)","Stays the same"],w:"Energy is absorbed.",lay:"three",card:["🧊","Group activity: beaker B"],src:"📘 Group Activity"},
    {q:"Anhydrous copper sulphate is dissolved in water. The temperature",a:"Rises (it becomes warm)",t:["Falls (it becomes cold)","Stays the same"],w:"Heat is given out.",lay:"three",card:["🔥","Group activity: beaker C"],src:"📘 Group Activity"}
  ];
  const OB_MORE=[
    {q:"Brown fumes are given off on heating. What was heated?",a:"Lead nitrate",t:["Ferrous sulphate","Calcium carbonate","Silver chloride"],w:"Lead nitrate gives brown NO2 fumes.",card:["🟤","Brown fumes"]},
    {q:"Name the brown gas given off when lead nitrate is heated.",a:"Nitrogen dioxide (NO2)",t:["Oxygen (O2)","Sulphur dioxide (SO2)","Chlorine (Cl2)"],w:"2Pb(NO3)2 → 2PbO + 4NO2 + O2."},
    {q:"A yellow precipitate forms. Which solutions were mixed?",a:"Lead nitrate and potassium iodide",t:["Sodium sulphate and barium chloride","Copper sulphate and iron","Water and quick lime"],w:"Yellow PbI2 forms.",lay:"col",card:["🟡","Yellow precipitate"]},
    {q:"Name the yellow precipitate.",a:"Lead iodide (PbI2)",t:["Barium sulphate (BaSO4)","Silver chloride (AgCl)","Potassium nitrate (KNO3)"],w:"Pb(NO3)2 + 2KI → PbI2 + 2KNO3."},
    {q:"Name the white precipitate formed in Activity 1.10.",a:"Barium sulphate (BaSO4)",t:["Sodium chloride (NaCl)","Lead iodide (PbI2)","Calcium oxide (CaO)"],w:"BaSO4 is insoluble in water."},
    {q:"A white solid turns grey in sunlight. What is it?",a:"Silver chloride",t:["Magnesium oxide","Calcium oxide","Barium sulphate"],w:"It breaks down into silver and chlorine.",card:["☀️","White → grey"]},
    {q:"There is a smell of burning sulphur on heating. What was heated?",a:"Ferrous sulphate crystals",t:["Lead nitrate","Copper powder","Magnesium ribbon"],w:"SO2 and SO3 are given off.",card:["👃","Burning sulphur smell"]},
    {q:"A gas from electrolysis burns with a pop sound. It is",a:"Hydrogen",t:["Oxygen","Nitrogen","Chlorine"],w:"Hydrogen burns with a pop sound."},
    {q:"Which observation shows a change in temperature?",a:"The beaker gets hot when water is added to quick lime",t:["Yellow precipitate in lead nitrate","Brown fumes from lead nitrate","Grey colour on silver chloride"],w:"Temperature change is one sign of a chemical reaction.",lay:"col"},
    {q:"Which observation shows a change in colour?",a:"Silver chloride turning grey in sunlight",t:["Bubbles from zinc and acid","The beaker getting hot","Water level falling in electrolysis"],w:"Change in colour is a sign of a chemical reaction.",lay:"col"},
    {q:"Which observation shows the evolution of a gas?",a:"Bubbles around zinc in dilute acid",t:["Iron nail turning brown","Silver chloride turning grey","White powder after burning magnesium"],w:"Evolution of a gas is a sign of a chemical reaction.",lay:"col"},
    {q:"Why does the iron nail become brownish in Activity 1.9?",a:"Copper is deposited on it",t:["It rusts in water","It melts","It turns into iron oxide"],w:"Iron displaces copper from the solution."}
  ];

  // ---------- 1. Balance It ----------
  let B=null;
  // [equation number in RAW, w = start from word-equation / f = formulae given, textbook place]
  const BAL_CORE=[[1,"f","📝 Exam question"],[3,"f","📝 Exam question"],[5,"f","📝 Exam question"],[26,"w","In-text Q2 (i)"],[27,"w","In-text Q2 (ii)"],[28,"w","In-text Q2 (iii)"],[12,"w","In-text Q3 (i)"],[38,"w","In-text Q3 (ii)"],
    [16,"f","Exercise 1"],[17,"f","Exercise 2"],[29,"w","Exercise 5 (a)"],[30,"w","Exercise 5 (b)"],[31,"w","Exercise 5 (d)"],
    [18,"f","Exercise 6 (a)"],[19,"f","Exercise 6 (b)"],[20,"f","Exercise 6 (c)"],[21,"f","Exercise 6 (d)"],
    [24,"w","Exercise 7 (a)"],[32,"w","Exercise 7 (b)"],[33,"w","Exercise 7 (c)"],[34,"w","Exercise 7 (d)"],
    [35,"w","Exercise 8 (a)"],[36,"w","Exercise 8 (b)"],[37,"w","Exercise 8 (d)"],[39,"w","Exercise 14"]];
  const BAL_BONUS=[[7,"f"],[8,"f"],[9,"w"]];
  let balList=[],bi=0,balRound=0;
  function balFill(){balRound++;
    const mix=a=>balRound===1?a:shuffle(a);
    const c=mix(BAL_CORE).map((x,k)=>({eq:EQ[x[0]-1],w:x[1]==="w",src:x[2],b:0,n:k+1})),b=mix(BAL_BONUS).map((x,k)=>({eq:EQ[x[0]-1],w:x[1]==="w",b:1,n:k+1}));
    balList=[...c,...b];bi=0;}
  function balQ(){
    if(bi>=balList.length){balFill();if(balRound>1)banner(`🔁 Round ${balRound}: all ${balList.length} again`);}
    const it=balList[bi++],eq=it.eq,word=it.w&&!!eq.rn;
    if(it.b){if(it.n===1){banner("⭐ Bonus round!");Snd.fan();}tag("balTag",`⭐ Bonus ${it.n} of ${BAL_BONUS.length}`);}
    else tag("balTag",`${it.src.startsWith("📝")?it.src:"📘 "+it.src} · ${it.n} of ${BAL_CORE.length}`);
    const n=eq.r.length+eq.p.length;
    B={eq,n,mode:word?"word":"bal",wi:0,coef:new Array(n).fill(0),sel:0,done:false,scored:false,bad:false};
    $("balNext").hidden=true;$("balShow").hidden=true;
    if(word){
      $("balQ").textContent="Write the equation from words, then balance it";
      $("balH").textContent="Step 1: pick the correct formula for each name.";
      setMsg("balMsg","","");$("balCheck").hidden=true;
    }else startBalance(false);
    render();
  }
  const termF=i=>i<B.eq.r.length?B.eq.r[i]:B.eq.p[i-B.eq.r.length];
  const termN=i=>i<B.eq.r.length?B.eq.rn[i]:B.eq.pn[i-B.eq.r.length];
  function startBalance(fromWord){
    B.mode="bal";B.sel=0;
    $("balQ").textContent=fromWord?"Skeletal equation ready. Now balance it":"Balance this equation";
    $("balH").textContent="Tap a box, then tap a number. An empty box means 1.";
    if(!fromWord)setMsg("balMsg","","");
    $("balCheck").hidden=false;
  }
  function render(){
    const nr=B.eq.r.length;let h="";
    for(let i=0;i<B.n;i++){
      if(i===nr)h+='<span class="op">→</span>';else if(i>0)h+='<span class="op">+</span>';
      if(B.mode==="word"){
        h+= i<B.wi?`<span class="term filled">${fx(termF(i))}</span>`
          :`<span class="term"><span class="name${i===B.wi?" cur":""}">${termN(i)}</span></span>`;
      }else{
        const v=B.coef[i]||"";
        h+=`<span class="term"><button class="cbox${!B.done&&B.sel===i?" sel":""}" data-i="${i}" aria-label="Number for ${termF(i)}"${B.done?" disabled":""}>${v}</button><span>${fx(termF(i))}</span></span>`;
      }
    }
    $("eqRow").innerHTML=h;
    $("eqRow").querySelectorAll(".cbox").forEach(b=>b.onclick=()=>{B.sel=+b.dataset.i;render();});
    renderPanel();renderAtoms();
  }
  function renderPanel(){
    const P=$("balPanel");
    if(B.mode==="word"){
      const name=termN(B.wi),opts=shuffle(NAME[name]);
      P.innerHTML=`<p>Formula of ${name.toLowerCase()}?</p><div class="row3"></div>`;
      const row=P.querySelector(".row3");
      opts.forEach(f=>{
        const b=document.createElement("button");b.className="btn";b.innerHTML=`<span class="lbl one">${fx(f)}</span>`;
        b.onclick=()=>{
          const ok=f===NAME[name][0];
          if(ok){Snd.ok();
            setMsg("balMsg","ok",`Correct! ${name} = <b>${fx(f)}</b>`);
            B.wi++;if(B.wi>=B.n)startBalance(true);render();
          }else{
            B.bad=true;b.classList.add("bad");b.disabled=true;
            setMsg("balMsg","bad",`Not ${fx(f)}. Check the symbols, capital letters and numbers. Try again.`);
          }
        };
        row.appendChild(b);
      });
    }else if(!B.done){
      P.innerHTML=`<div class="strip">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="num" data-n="${n}">${n}</button>`).join("")}</div>`;
      P.querySelectorAll(".num").forEach(b=>b.onclick=()=>{
        B.coef[B.sel]=+b.dataset.n;
        if(B.sel<B.n-1)B.sel++;
        render();
      });
    }
  }
  const cvals=()=>B.coef.map(v=>v||1);
  function renderAtoms(){
    const A=$("atoms");
    if(B.mode!=="bal"){A.innerHTML="";return;}
    A.innerHTML='<span class="cap">Atoms (left | right):</span> '+tally(B.eq,cvals()).map(x=>`<span class="ac ${x.l===x.r?"ok":"no"}"><b>${x.el}</b> ${x.l} | ${x.r}</span>`).join("");
  }
  $("balCheck").onclick=()=>{
    const t=tally(B.eq,cvals()),bad=t.filter(x=>x.l!==x.r);
    if(bad.length){
      B.bad=true;
      setMsg("balMsg","bad",`Not balanced yet. Check ${bad.map(x=>x.el).join(", ")} in the red boxes.`);
      $("balShow").hidden=false;return;
    }
    const g=cvals().reduce(gcd);
    if(g>1){setMsg("balMsg","bad",`Balanced, but use the smallest numbers. Divide every number by ${g}.`);return;}
    finish("ok","Balanced! "+eqH(B.eq.s));
  };
  $("balShow").onclick=()=>{B.bad=true;B.coef=B.eq.c.map(v=>v>1?v:0);finish("","The balanced equation is "+eqH(B.eq.s));};
  function finish(cls,html){
    B.done=true;render();setMsg("balMsg",cls,html);
    $("balCheck").hidden=true;$("balShow").hidden=true;
    const P=$("balPanel");
    if(B.eq.t){
      P.innerHTML=`<p>Bonus: what type of reaction is this?</p><div class="row4"></div>`;
      quiz(P.querySelector(".row4"),Object.keys(TYPE),k=>k===B.eq.t,k=>TYPE[k],ok=>{
        setMsg("balMsg",ok?"ok":"bad",`${ok?"Correct!":"Not quite."} It is <b>${TYPE[B.eq.t].toLowerCase()}</b>. ${WHY[B.eq.t]}`);
        balScore(ok);$("balNext").hidden=false;},false,true);
    }else{P.innerHTML="";balScore(true);$("balNext").hidden=false;}
  }
  function balScore(lastOk){
    if(B.scored)return;B.scored=true;const ok=!B.bad&&lastOk;mark(ok);
    if(!ok){const m=$("balMsg");m.className="msg bad";m.innerHTML+=" <b>No mark this time.</b>";}
  }
  $("balNext").onclick=balQ;

  // ---------- 2. Reaction Type ----------
  const TYPED=EQ.filter(e=>e.t);
  function typQ(){
    if(Math.random()<.55){
      const e=one(TYPED);
      $("typQ").textContent="What type of reaction is this?";
      $("typEq").innerHTML=eqH(e.s);$("typEq").hidden=false;
      $("typOpts").className="opts";
      quiz($("typOpts"),Object.keys(TYPE),k=>k===e.t,k=>TYPE[k],ok=>{
        setMsg("typMsg",ok?"ok":"bad",`${ok?"Correct!":"Not quite."} It is <b>${TYPE[e.t].toLowerCase()}</b>. ${WHY[e.t]}`);$("typNext").hidden=false;});
    }else{
      const k=one(Object.keys(TYPE));
      const e=one(TYPED.filter(x=>x.t===k));
      const others=shuffle(Object.keys(TYPE).filter(x=>x!==k)).map(t=>one(TYPED.filter(x=>x.t===t)));
      $("typQ").innerHTML=`Which one is a <b>${TYPE[k].toLowerCase()}</b> reaction?`;
      $("typEq").hidden=true;
      $("typOpts").className="opts eqs";
      quiz($("typOpts"),shuffle([e,...others]),x=>x.t===k,x=>eqH(x.s),ok=>{
        setMsg("typMsg",ok?"ok":"bad",`${ok?"Correct!":"Not quite."} ${WHY[k]}`);$("typNext").hidden=false;});
    }
    setMsg("typMsg","","Look at the reactants and the products.");$("typNext").hidden=true;
  }

  // ---------- 3. Redox ----------
  const RX=[
    {e:"CuO + H2 → Cu + H2O",ox:["H2","gO"],red:["CuO","lO"],all:["CuO","H2","Cu","H2O"]},
    {e:"ZnO + C → Zn + CO",ox:["C","gO"],red:["ZnO","lO"],all:["ZnO","C","Zn","CO"]},
    {e:"MnO2 + 4HCl → MnCl2 + 2H2O + Cl2",ox:["HCl","lH"],red:["MnO2","lO"],all:["MnO2","HCl","MnCl2","H2O","Cl2"]},
    {e:"2PbO + C → 2Pb + CO2",ox:["C","gO"],red:["PbO","lO"],all:["PbO","C","Pb","CO2"]},
    {e:"Fe2O3 + 2Al → Al2O3 + 2Fe",ox:["Al","gO"],red:["Fe2O3","lO"],all:["Fe2O3","Al","Al2O3","Fe"]}
  ];
  const OXI=[
    {e:"2Cu + O2 → 2CuO",f:"Cu",all:["Cu","O2","CuO"]},
    {e:"2Mg + O2 → 2MgO",f:"Mg",all:["Mg","O2","MgO"]},
    {e:"4Na + O2 → 2Na2O",f:"Na",all:["Na","O2","Na2O"]},
    {e:"C + O2 → CO2",f:"C",all:["C","O2","CO2"]}
  ];
  const SAFE=["CaCO3 → CaO + CO2","ZnCO3 → ZnO + CO2","CaO + H2O → Ca(OH)2","NaOH + HCl → NaCl + H2O",
    "NaCl + AgNO3 → AgCl + NaNO3","Na2SO4 + BaCl2 → BaSO4 + 2NaCl","Pb(NO3)2 + 2KI → PbI2 + 2KNO3",
    "2HNO3 + Ca(OH)2 → Ca(NO3)2 + 2H2O","BaCl2 + H2SO4 → BaSO4 + 2HCl","Ca(OH)2 + CO2 → CaCO3 + H2O"];
  const HOW={gO:"gains oxygen",lO:"loses oxygen",gH:"gains hydrogen",lH:"loses hydrogen"};
  const RULE="Gain of oxygen or loss of hydrogen = oxidation. Loss of oxygen or gain of hydrogen = reduction.";
  function rdxQ(){
    const kind=one(["what","what","ox","red","redox","oxr","redr"]);
    const box=$("rdxOpts");box.className="opts";$("rdxEq").hidden=false;
    const done=(ok,txt)=>{setMsg("rdxMsg",ok?"ok":"bad",(ok?"Correct! ":"Not quite. ")+txt);$("rdxNext").hidden=false;};
    if(kind==="what"){
      // what happens to one substance, and why
      let f,res,how,e;
      if(Math.random()<.7){const r=one(RX);e=r.e;const s=Math.random()<.5?["ox",...r.ox]:["red",...r.red];[res,f,how]=s;}
      else{const o=one(OXI);e=o.e;f=o.f;res="ox";how="gO";}
      const set=(how==="lH"||how==="gH")?[["ox","lH"],["ox","gH"],["red","gH"],["red","lH"]]:[["ox","gO"],["ox","lO"],["red","lO"],["red","gO"]];
      $("rdxQ").innerHTML=`What happens to <b>${fx(f)}</b> in this reaction?`;
      $("rdxEq").innerHTML=eqH(e);
      quiz(box,shuffle(set),x=>x[0]===res&&x[1]===how,x=>`${x[0]==="ox"?"Oxidised":"Reduced"}: it ${HOW[x[1]]}`,ok=>
        done(ok,`${fx(f)} ${HOW[how]}, so it is <b>${res==="ox"?"oxidised":"reduced"}</b>.`));
    }else if(kind==="ox"||kind==="red"){
      let e,f,how,all;
      if(kind==="ox"&&Math.random()<.3){const o=one(OXI);e=o.e;f=o.f;how="gO";all=o.all;}
      else{const r=one(RX);e=r.e;[f,how]=kind==="ox"?r.ox:r.red;all=r.all;}
      const opts=shuffle([f,...pick(all.filter(x=>x!==f),3)]);
      $("rdxQ").innerHTML=`Which substance is <b>${kind==="ox"?"oxidised":"reduced"}</b>?`;
      $("rdxEq").innerHTML=eqH(e);
      quiz(box,opts,x=>x===f,x=>fx(x),ok=>done(ok,`${fx(f)} ${HOW[how]}, so it is ${kind==="ox"?"oxidised":"reduced"}.`),true);
    }else{
      // pick the reaction
      let right,q,why;
      if(kind==="redox"){const r=one(RX);right=r.e;q="Which one is a <b>redox</b> reaction?";why=`In ${eqH(r.e)}, ${fx(r.ox[0])} is oxidised and ${fx(r.red[0])} is reduced. Both happen together.`;}
      else if(kind==="oxr"){const o=one(OXI);right=o.e;q="Which reaction shows <b>oxidation</b>?";why=`${fx(o.f)} gains oxygen, so it is oxidised.`;}
      else{const r=one(RX);right=r.e;q="In which reaction is a substance <b>reduced</b>?";why=`${fx(r.red[0])} ${HOW[r.red[1]]}, so it is reduced.`;}
      $("rdxQ").innerHTML=q;$("rdxEq").hidden=true;box.className="opts eqs";
      quiz(box,shuffle([right,...pick(SAFE,3)]),x=>x===right,x=>eqH(x),ok=>done(ok,why));
    }
    setMsg("rdxMsg","",RULE);$("rdxNext").hidden=true;
  }

  // ---------- 4. Exo / Endo ----------
  const HEAT=[
    ["Quick lime + water","x","It gives out a lot of heat. The beaker becomes hot."],
    ["Burning of coal","x","Burning always gives out heat."],
    ["Burning of natural gas","x","Burning always gives out heat."],
    ["Respiration","x","Glucose combines with oxygen and gives out energy."],
    ["Vegetable waste into compost","x","Decomposition into compost gives out heat."],
    ["Burning magnesium ribbon","x","It burns with a dazzling flame and gives out heat."],
    ["Anhydrous copper sulphate in water","x","The water becomes warm."],
    ["Zinc + dilute sulphuric acid","x","The test tube becomes warm."],
    ["Heating limestone (CaCO₃)","n","It needs heat to break down."],
    ["Heating lead nitrate","n","It needs heat to break down."],
    ["Heating ferrous sulphate","n","It needs heat to break down."],
    ["Electrolysis of water","n","It needs electricity to break down."],
    ["Silver chloride in sunlight","n","It needs light to break down."],
    ["Silver bromide in sunlight","n","It needs light to break down."],
    ["Barium hydroxide + ammonium chloride","n","It takes in heat. The test tube becomes cold."],
    ["Ammonium nitrate in water","n","It takes in heat. The water becomes cold."]
  ];
  const HEAT_CORE=sel(HEAT,[1,3,4,5,7,9,12,13,15,16]),HEAT_BONUS=sel(HEAT,[2,6,8,10,11,14]);
  let selChip=null,heatBad=false,hSets=[],hi=0,hRound=0,hSize=0;
  function heatFill(){hRound++;
    const x=shuffle(HEAT_CORE.filter(h=>h[1]==="x")),n=shuffle(HEAT_CORE.filter(h=>h[1]==="n"));
    hSets=[{l:"📘 Textbook set 1 of 2",c:[...x.slice(0,3),...n.slice(0,2)]},{l:"📘 Textbook set 2 of 2",c:[...x.slice(3),...n.slice(2)]},{l:"⭐ Bonus set",c:HEAT_BONUS,b:1}];hi=0;}
  function heatSet(){
    const tray=$("tray");tray.innerHTML="";
    document.querySelectorAll(".bin .in").forEach(x=>x.innerHTML="");
    if(hi>=hSets.length){heatFill();if(hRound>1)banner(`🔁 Round ${hRound}: all ${HEAT_CORE.length+HEAT_BONUS.length} again`);}
    const S=hSets[hi++];if(S.b){banner("⭐ Bonus round!");Snd.fan();}
    const T=$("heatTag");T.textContent=S.l;T.classList.toggle("think",!!S.b);
    const set=shuffle(S.c);hSize=set.length;
    set.forEach(h=>{const d=document.createElement("div");d.className="chip";d._h=h;d.textContent=h[0];attachDrag(d);tray.appendChild(d);});
    selChip=null;heatBad=false;setMsg("heatMsg","","Drag a card, or tap it and then tap a box.");$("heatNext").hidden=true;
  }
  function drop(chip,bin){
    const h=chip._h,ok=bin===h[1];
    if(ok){
      const s=document.createElement("span");s.textContent=h[0];
      document.querySelector(`.bin[data-bin="${bin}"] .in`).appendChild(s);chip.remove();
      setMsg("heatMsg","ok",`Correct! ${h[2]}`);
      if(!$("tray").children.length){
        mark(!heatBad);
        setMsg("heatMsg",heatBad?"bad":"ok",heatBad?"All sorted, but with a mistake, so no mark this time. Try the next set.":`All ${hSize} correct on the first try! +1 mark.`);
        $("heatNext").hidden=false;
      }else Snd.ok();
    }else{
      heatBad=true;chip.classList.remove("shake");void chip.offsetWidth;chip.classList.add("shake");
      setMsg("heatMsg","bad",`Try again. ${h[2]}`);
    }
    chip.classList.remove("sel");selChip=null;
  }
  const binAt=(x,y)=>[...document.querySelectorAll(".bin")].find(b=>{const r=b.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;})||null;
  function attachDrag(chip){
    let sx,sy,ghost=null,id=null;
    chip.addEventListener("pointerdown",e=>{sx=e.clientX;sy=e.clientY;id=e.pointerId;chip.setPointerCapture(id);});
    chip.addEventListener("pointermove",e=>{
      if(id!==e.pointerId)return;
      if(!ghost&&Math.hypot(e.clientX-sx,e.clientY-sy)>8){ghost=chip.cloneNode(true);ghost.classList.add("ghost");ghost.style.width=chip.offsetWidth+"px";document.body.appendChild(ghost);chip.style.opacity=.3;}
      if(ghost){ghost.style.left=e.clientX+"px";ghost.style.top=e.clientY+"px";const h=binAt(e.clientX,e.clientY);document.querySelectorAll(".bin").forEach(b=>b.classList.toggle("hover",b===h));}
    });
    const end=e=>{
      if(id!==e.pointerId)return;id=null;
      if(ghost){const b=binAt(e.clientX,e.clientY);ghost.remove();ghost=null;chip.style.opacity="";document.querySelectorAll(".bin").forEach(x=>x.classList.remove("hover"));if(b&&e.type==="pointerup")drop(chip,b.dataset.bin);}
      else if(e.type==="pointerup"){if(selChip)selChip.classList.remove("sel");selChip=selChip===chip?null:chip;if(selChip)chip.classList.add("sel");}
    };
    chip.addEventListener("pointerup",end);chip.addEventListener("pointercancel",end);
  }
  document.querySelectorAll(".bin").forEach(b=>b.addEventListener("click",()=>{if(selChip)drop(selChip,b.dataset.bin);}));
  $("heatNext").onclick=heatSet;

  const TY_CORE0=sel(TY_FIRST,[1,4,9,10,11,12,14,18,19,20,22,23,25,26,27,28]),TY_BONUS0=sel(TY_FIRST,[2,3,5,13,16,17,21,24]);
  const RD_CORE0=sel(RD_FIRST,[1,3,4,5,6,12,13,14,16,20,22,23]),RD_BONUS0=sel(RD_FIRST,[2,7,8,15]);
  const OB_CORE0=sel(OB_FIRST,[1,3,4,5,7,8,9,10,11,13,14,15]),OB_BONUS0=sel(OB_MORE,[2,4,5,8]);
  const el=(tag,attrs,parent,text)=>{const e=document.createElementNS("http://www.w3.org/2000/svg",tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(text!=null)e.textContent=text;if(parent)parent.appendChild(e);return e;};
/* ===== Lab pictures for the opening questions (draw into a 640 x 240 scene) ===== */
const LABPX=(()=>{
  const INK="var(--ink)",GL="#7C93A6";
  const T=(svg,x,y,s,cls,extra)=>{const t=el("text",Object.assign({x,y,class:"pt "+(cls||"")},extra||{}),svg);
    String(s).split(/(?<=[A-Za-z\)])(\d+)/).forEach((p,i)=>{if(!p)return;
      if(i%2===1)el("tspan",{"baseline-shift":"sub","font-size":"70%"},t,p);else el("tspan",{},t,p);});return t;};
  const line=(svg,x1,y1,x2,y2,w,c)=>el("line",{x1,y1,x2,y2,stroke:c||INK,"stroke-width":w||4,"stroke-linecap":"round"},svg);
  /* molecule: atoms [{x,y,s,hl}], bonds [[i,j,n]] */
  function mol(svg,atoms,bonds){
    bonds.forEach(([i,j,n])=>{const a=atoms[i],b=atoms[j],dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,px=-uy,py=ux,r=20;
      const offs=n===1?[0]:n===2?[-5,5]:[-8,0,8];
      offs.forEach(o=>line(svg,a.x+ux*r+px*o,a.y+uy*r+py*o,b.x-ux*r+px*o,b.y-uy*r+py*o,3.5));});
    atoms.forEach(a=>{if(a.hl)el("rect",{x:a.x-24,y:a.y-24,width:48,height:48,rx:12,fill:"#FDE68A",stroke:"#D97706","stroke-width":3},svg);
      T(svg,a.x,a.y+10,a.s,"big");});
  }
  function tube(svg,x,y,h,fill,label){
    el("path",{d:`M${x-20} ${y} v${h} a20 20 0 0 0 40 0 V${y}`,fill:"rgba(255,255,255,.35)",stroke:GL,"stroke-width":4},svg);
    if(fill)el("path",{d:`M${x-16} ${y+h*0.45} V${y+h} a16 16 0 0 0 32 0 V${y+h*0.45} Z`,fill},svg);
    if(label)T(svg,x,Math.min(y+h+46,232),label,"small");
  }
  function arrow(svg,x1,x2,y,label){line(svg,x1,y,x2-10,y,4);el("path",{d:`M${x2} ${y} l-14 -9 v18 Z`,fill:INK},svg);if(label)T(svg,(x1+x2)/2,y-14,label,"small");}
  function bubbles(svg,x,y,n,spread,col){for(let i=0;i<n;i++)el("circle",{cx:x+(Math.random()-.5)*spread,cy:y-Math.random()*40,r:3+Math.random()*3,fill:col||"#fff",stroke:GL,"stroke-width":1.2},svg);}
  const P={
    ethyne(svg){mol(svg,[{x:130,y:120,s:"H"},{x:255,y:120,s:"C"},{x:385,y:120,s:"C"},{x:510,y:120,s:"H"}],[[0,1,1],[1,2,3],[2,3,1]]);},
    ethene(svg){mol(svg,[{x:260,y:120,s:"C"},{x:380,y:120,s:"C"},{x:185,y:62,s:"H"},{x:185,y:178,s:"H"},{x:455,y:62,s:"H"},{x:455,y:178,s:"H"}],[[0,1,2],[0,2,1],[0,3,1],[1,4,1],[1,5,1]]);},
    ethanolOH(svg){mol(svg,[{x:170,y:120,s:"C"},{x:300,y:120,s:"C"},{x:430,y:120,s:"O",hl:1},{x:540,y:120,s:"H",hl:1},
      {x:170,y:40,s:"H"},{x:170,y:200,s:"H"},{x:70,y:120,s:"H"},{x:300,y:40,s:"H"},{x:300,y:200,s:"H"}],
      [[0,1,1],[1,2,1],[2,3,1],[0,4,1],[0,5,1],[0,6,1],[1,7,1],[1,8,1]]);},
    isomers(svg){
      T(svg,160,30,"A","mid");T(svg,480,30,"B","mid");
      mol(svg,[{x:55,y:130,s:"C"},{x:125,y:130,s:"C"},{x:195,y:130,s:"C"},{x:265,y:130,s:"C"}],[[0,1,1],[1,2,1],[2,3,1]]);
      mol(svg,[{x:400,y:150,s:"C"},{x:480,y:150,s:"C"},{x:560,y:150,s:"C"},{x:480,y:75,s:"C"}],[[0,1,1],[1,2,1],[1,3,1]]);
      T(svg,160,210,"C4H10","small");T(svg,480,210,"C4H10","small");},
    benzene(svg){const cx=320,cy=120,R=82,pts=[];for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;pts.push([cx+R*Math.cos(a),cy+R*Math.sin(a)]);}
      for(let k=0;k<6;k++){const [x1,y1]=pts[k],[x2,y2]=pts[(k+1)%6];line(svg,x1,y1,x2,y2,4);
        if(k%2===0){const ix=cx+(x1-cx)*.78,iy=cy+(y1-cy)*.78,jx=cx+(x2-cx)*.78,jy=cy+(y2-cy)*.78;line(svg,ix,iy,jx,jy,4);}}
      pts.forEach(([x,y])=>{el("circle",{cx:x,cy:y,r:15,fill:"var(--panel)",stroke:INK,"stroke-width":2.5},svg);T(svg,x,y+6,"C","small");});
      T(svg,520,125,"6 carbons in a ring","small");},
    ladder(svg){const xs=[110,320,530],f=["CH4","C2H6","C3H8"];
      xs.forEach((x,i)=>{el("rect",{x:x-70,y:90,width:140,height:64,rx:14,fill:"var(--panel)",stroke:INK,"stroke-width":3},svg);T(svg,x,132,f[i],"big");});
      arrow(svg,182,248,122,"+ ?");arrow(svg,392,458,122,"+ ?");T(svg,320,210,"Methane → Ethane → Propane","small");},
    graphite(svg){for(let L=0;L<3;L++){const y0=55+L*62,off=(L%2)*26;
        for(let k=0;k<6;k++){const cx=110+off+k*78,cy=y0;const pts=[];for(let j=0;j<6;j++){const a=j*Math.PI/3;pts.push((cx+24*Math.cos(a)).toFixed(1)+","+(cy+12*Math.sin(a)).toFixed(1));}
          el("polygon",{points:pts.join(" "),fill:"none",stroke:INK,"stroke-width":2.5},svg);
          if(k<5)line(svg,cx+24,cy,cx+54,cy,2.5);}
        if(L<2)for(let k=0;k<6;k+=2)line(svg,110+off+k*78,y0+14,110+off+k*78,y0+48,1.5,GL);}
      T(svg,320,232,"Flat layers of carbon atoms","small");},
    methaneDot(svg){const cx=320,cy=120;
      [[0,-72],[0,72],[-92,0],[92,0]].forEach(([dx,dy])=>el("circle",{cx:cx+dx,cy:cy+dy,r:34,fill:"#DBEAFE",stroke:"#2563EB","stroke-width":2.5},svg));
      el("circle",{cx,cy,r:50,fill:"#FCE7F3",stroke:"#DB2777","stroke-width":2.5,opacity:.95},svg);T(svg,cx,cy+10,"C","big");
      [[0,-72],[0,72],[-92,0],[92,0]].forEach(([dx,dy])=>{T(svg,cx+dx*1.12,cy+dy*1.12+8,"H","mid");
        const mx=cx+dx*.58,my=cy+dy*.58,px=dy?7:0,py=dx?7:0;
        el("circle",{cx:mx-px,cy:my-py,r:4.5,fill:INK},svg);T(svg,mx+px,my+py+5,"×","small");});},
    c60(svg){const cx=320,cy=118,R=92;el("circle",{cx,cy,r:R,fill:"#F1F5F9",stroke:INK,"stroke-width":3},svg);
      const poly=(x,y,r,n,rot)=>{const p=[];for(let j=0;j<n;j++){const a=rot+j*2*Math.PI/n;p.push((x+r*Math.cos(a)).toFixed(1)+","+(y+r*Math.sin(a)).toFixed(1));}el("polygon",{points:p.join(" "),fill:n===5?"#CBD5E1":"none",stroke:INK,"stroke-width":2.2},svg);};
      poly(cx,cy,26,5,-Math.PI/2);for(let k=0;k<5;k++){const a=-Math.PI/2+k*2*Math.PI/5;poly(cx+52*Math.cos(a),cy+52*Math.sin(a),20,6,a);}
      for(let k=0;k<5;k++){const a=-Math.PI/2+Math.PI/5+k*2*Math.PI/5;poly(cx+78*Math.cos(a),cy+78*Math.sin(a),12,5,a);}
      T(svg,520,125,"60 carbon atoms","small");},
    flames(svg){[[180,"A"],[460,"B"]].forEach(([x,l],i)=>{el("rect",{x:x-22,y:180,width:44,height:40,rx:6,fill:"#475569"},svg);
        if(i===0){el("path",{d:`M${x} 92 C${x+26} 132 ${x+20} 176 ${x} 178 C${x-20} 176 ${x-26} 132 ${x} 92Z`,fill:"#60A5FA"},svg);
          el("path",{d:`M${x} 122 C${x+12} 145 ${x+9} 172 ${x} 174 C${x-9} 172 ${x-12} 145 ${x} 122Z`,fill:"#DBEAFE"},svg);}
        else{el("path",{d:`M${x} 70 C${x+34} 120 ${x+28} 176 ${x} 178 C${x-28} 176 ${x-34} 120 ${x} 70Z`,fill:"#FB923C"},svg);
          el("path",{d:`M${x} 104 C${x+18} 140 ${x+14} 172 ${x} 174 C${x-14} 172 ${x-18} 140 ${x} 104Z`,fill:"#FDE047"},svg);
          [[-14,52,13],[10,38,16],[-4,20,18]].forEach(([dx,y,r])=>el("circle",{cx:x+dx,cy:y,r,fill:"#334155",opacity:.75},svg));
          el("rect",{x:x-70,y:6,width:140,height:10,rx:3,fill:"#94A3B8"},svg);el("rect",{x:x-40,y:14,width:80,height:5,fill:"#111827"},svg);}
        T(svg,x,238,"Flame "+l,"mid");});},
    kmno4(svg){tube(svg,190,40,150,"#7E22CE","Ethanol + KMnO₄ drop");el("circle",{cx:190,cy:22,r:8,fill:"#7E22CE"},svg);
      arrow(svg,260,380,115,"warm, shake");tube(svg,450,40,150,"#F1F5F9","A few seconds later");},
    hydrogenation(svg){el("rect",{x:70,y:70,width:110,height:130,rx:16,fill:"#FDE68A",stroke:GL,"stroke-width":4},svg);el("rect",{x:105,y:48,width:40,height:26,rx:5,fill:GL},svg);T(svg,125,145,"Oil","mid");
      arrow(svg,210,420,130,"+ H₂, nickel");el("rect",{x:450,y:100,width:130,height:100,rx:10,fill:"#FEF3C7",stroke:"#D97706","stroke-width":4},svg);T(svg,515,158,"Ghee","mid");},
    bromine(svg){tube(svg,170,40,150,"#C2410C","Bromine water");arrow(svg,240,390,115,"bubble a gas");tube(svg,460,40,150,"#F8FAFC","Colourless!");bubbles(svg,460,175,6,16);},
    micelle(svg){const cx=320,cy=120;el("circle",{cx,cy,r:48,fill:"#FCD34D"},svg);T(svg,cx,cy+6,"Oil","small");
      for(let k=0;k<12;k++){const a=k*Math.PI/6,hx=cx+96*Math.cos(a),hy=cy+96*Math.sin(a);
        const pts=[];for(let j=0;j<=6;j++){const r=88-j*9,o=(j%2?6:-6);pts.push((cx+r*Math.cos(a)-o*Math.sin(a)).toFixed(1)+","+(cy+r*Math.sin(a)+o*Math.cos(a)).toFixed(1));}
        el("polyline",{points:pts.join(" "),fill:"none",stroke:"#475569","stroke-width":3.5,"stroke-linejoin":"round"},svg);
        el("circle",{cx:hx,cy:hy,r:10,fill:"#2563EB",stroke:"#fff","stroke-width":2},svg);}},
    hardwater(svg){[[200,"A"],[440,"B"]].forEach(([x,l],i)=>{tube(svg,x,30,160,i?"#E2E8F0":"#BAE6FD","Tube "+l);
        if(i===0)for(let k=0;k<26;k++)el("circle",{cx:x-14+Math.random()*28,cy:40+Math.random()*58,r:4+Math.random()*4,fill:"#fff",stroke:GL,"stroke-width":1.2},svg);
        else{for(let k=0;k<14;k++)el("ellipse",{cx:x-12+Math.random()*24,cy:112+Math.random()*16,rx:6,ry:3.5,fill:"#F8FAFC",stroke:"#94A3B8"},svg);
          for(let k=0;k<3;k++)el("circle",{cx:x-8+k*8,cy:104,r:3.5,fill:"#fff",stroke:GL},svg);}});},
    limewater(svg,it){tube(svg,170,60,140,"#BFDBFE",(it&&it.l)||"Na₂CO₃ + ethanoic acid");bubbles(svg,170,190,10,20);if(it&&it.shells)for(let k=0;k<6;k++)el("path",{d:`M${156+k*5} ${196+(k%2)*6} l8 -5 l4 7 Z`,fill:"#FFF7ED",stroke:"#C2410C","stroke-width":1.2},svg);
      el("path",{d:"M170 52 V30 H450 V170",fill:"none",stroke:GL,"stroke-width":7,"stroke-linejoin":"round"},svg);
      tube(svg,450,60,140,"#CBD2DB","Lime water");bubbles(svg,450,185,5,6);T(svg,540,150,"milky!","mid");},
    circuit(svg){
      el("path",{d:"M150 70 H300 M340 70 H470 V180 H380 M320 180 H260 M200 180 H150 V70",fill:"none",stroke:INK,"stroke-width":4},svg);
      /* battery */ el("rect",{x:200,y:162,width:60,height:36,rx:5,fill:"#F59E0B",stroke:INK,"stroke-width":3},svg);T(svg,230,186,"+ −","small");
      /* bulb */ el("circle",{cx:320,cy:58,r:26,fill:"#FDE047",stroke:"#CA8A04","stroke-width":3},svg);
      [[0,-48],[-40,-30],[40,-30],[-52,6],[52,6]].forEach(([dx,dy])=>line(svg,320+dx*0.75,58+dy*0.75,320+dx,58+dy,3,"#EAB308"));
      el("rect",{x:308,y:80,width:24,height:14,fill:"#94A3B8"},svg);
      /* clips and metal strip */ [380,320].forEach(x=>el("circle",{cx:x,cy:180,r:7,fill:"#64748B"},svg));
      el("rect",{x:316,y:172,width:68,height:16,rx:3,fill:"#B45309",stroke:INK,"stroke-width":2},svg);
      T(svg,320,214,"A","small");T(svg,382,214,"B","small");T(svg,350,236,"metal","small");},
    heatwire(svg){
      el("rect",{x:60,y:40,width:12,height:180,fill:"#64748B"},svg);el("rect",{x:30,y:214,width:80,height:12,rx:3,fill:"#475569"},svg);
      el("rect",{x:64,y:72,width:40,height:18,rx:4,fill:"#94A3B8",stroke:INK,"stroke-width":2},svg);
      line(svg,100,81,520,81,5,"#B45309");
      [180,280,380].forEach(x=>el("ellipse",{cx:x,cy:89,rx:9,ry:7,fill:"#FEF3C7",stroke:"#D97706","stroke-width":2},svg));
      el("ellipse",{cx:520,cy:92,rx:10,ry:8,fill:"#FEF3C7",stroke:"#D97706","stroke-width":2,opacity:.5},svg);
      line(svg,520,112,520,150,4,"#334155");el("circle",{cx:520,cy:110,r:6,fill:"#DC2626"},svg);line(svg,548,118,548,176,3);el("path",{d:"M548 186 l-8 -14 h16 Z",fill:INK},svg);T(svg,590,150,"pin falls","small");
      el("path",{d:"M140 160 C158 132 150 108 140 92 C130 108 122 132 140 160Z",fill:"#FB923C"},svg);
      el("rect",{x:122,y:160,width:36,height:30,rx:5,fill:"#475569"},svg);T(svg,140,214,"heat here","small");},
    hammer(svg){
      el("rect",{x:60,y:150,width:110,height:50,rx:6,fill:"#94A3B8",stroke:INK,"stroke-width":3},svg);T(svg,115,232,"Metal block","small");
      line(svg,180,40,110,120,8,"#92400E");el("rect",{x:80,y:96,width:70,height:32,rx:5,fill:"#475569",transform:"rotate(-45 115 112)"},svg);
      arrow(svg,220,350,175,"beat it");
      el("rect",{x:380,y:184,width:220,height:10,rx:3,fill:"#CBD5E1",stroke:INK,"stroke-width":2},svg);T(svg,490,232,"Thin sheet","small");},
    mgburn(svg){
      line(svg,90,60,240,120,6,"#64748B");line(svg,90,74,240,124,6,"#64748B");
      line(svg,240,122,330,140,5,"#CBD5E1");
      el("circle",{cx:350,cy:142,r:62,fill:"#FEF08A",opacity:.75},svg);el("circle",{cx:350,cy:142,r:46,fill:"#FFFFFF",opacity:.95},svg);el("circle",{cx:350,cy:142,r:26,fill:"#F8FAFC",stroke:"#FDE68A","stroke-width":6},svg);
      for(let k=0;k<10;k++){const a=k*Math.PI/5;line(svg,350+52*Math.cos(a),142+52*Math.sin(a),350+66*Math.cos(a),142+66*Math.sin(a),3,"#FACC15");}
      el("ellipse",{cx:360,cy:222,rx:56,ry:10,fill:"#E2E8F0",stroke:GL,"stroke-width":2},svg);
      for(let k=0;k<8;k++)el("circle",{cx:330+k*8,cy:216,r:4,fill:"#FFFFFF",stroke:"#CBD5E1"},svg);
      T(svg,520,226,"white ash","small");},
    litmus(svg){
      el("rect",{x:230,y:40,width:180,height:180,rx:12,fill:"rgba(250,204,21,.12)",stroke:GL,"stroke-width":4},svg);
      el("rect",{x:222,y:28,width:196,height:16,rx:4,fill:GL},svg);T(svg,320,210,"SO₂ gas","mid");
      el("rect",{x:300,y:60,width:40,height:110,rx:4,fill:"#3B82F6"},svg);el("rect",{x:300,y:118,width:40,height:52,rx:4,fill:"#EF4444"},svg);
      T(svg,500,90,"moist blue","small");T(svg,500,110,"litmus","small");line(svg,450,104,346,104,2.5);},
    kerosene(svg){
      el("rect",{x:230,y:60,width:180,height:160,rx:20,fill:"rgba(255,255,255,.35)",stroke:GL,"stroke-width":4},svg);
      el("rect",{x:270,y:34,width:100,height:30,rx:6,fill:"#475569"},svg);
      el("rect",{x:236,y:100,width:168,height:114,rx:16,fill:"#FEF9C3"},svg);
      el("rect",{x:290,y:168,width:60,height:36,rx:8,fill:"#CBD5E1",stroke:"#64748B","stroke-width":2.5},svg);T(svg,320,192,"Na","mid");
      T(svg,520,130,"Kerosene oil","small");line(svg,470,124,410,124,2.5);},
    znacid(svg){tube(svg,120,50,150,"#E0F2FE","Zinc + dil. H₂SO₄");
      for(let k=0;k<5;k++)el("circle",{cx:108+k*6,cy:212-(k%2)*6,r:6,fill:"#94A3B8",stroke:"#475569"},svg);bubbles(svg,120,190,8,18);
      el("path",{d:"M120 42 V24 H300 V150",fill:"none",stroke:GL,"stroke-width":7,"stroke-linejoin":"round"},svg);
      el("path",{d:"M250 160 h110 v40 a10 10 0 0 1 -10 10 h-90 a10 10 0 0 1 -10 -10Z",fill:"#E0F2FE",stroke:GL,"stroke-width":3},svg);
      [[290,150,12],[312,146,10],[330,152,9]].forEach(([x,y,r])=>el("circle",{cx:x,cy:y,r,fill:"rgba(255,255,255,.6)",stroke:"#38BDF8","stroke-width":2},svg));
      T(svg,305,232,"soap solution","small");
      el("rect",{x:452,y:130,width:22,height:90,rx:4,fill:"#FDE68A",stroke:"#D97706","stroke-width":2},svg);
      el("path",{d:"M463 128 C474 112 470 98 463 86 C456 98 452 112 463 128Z",fill:"#FB923C"},svg);
      T(svg,410,92,"POP!","big");T(svg,463,240,"candle","small");},
    acidbulb(svg){
      el("path",{d:"M220 100 v100 a12 12 0 0 0 12 12 h176 a12 12 0 0 0 12 -12 v-100",fill:"rgba(255,255,255,.3)",stroke:GL,"stroke-width":4},svg);
      el("rect",{x:224,y:140,width:192,height:68,rx:8,fill:"#DBEAFE"},svg);
      [280,360].forEach(x=>line(svg,x,70,x,190,6,"#64748B"));
      el("path",{d:"M280 70 V30 H300 M340 30 H360 V70",fill:"none",stroke:INK,"stroke-width":3.5},svg);
      el("rect",{x:266,y:40,width:28,height:22,rx:4,fill:"#F59E0B",stroke:INK,"stroke-width":2},svg);T(svg,280,56,"+ −","small");T(svg,236,58,"cell","small");
      el("circle",{cx:320,cy:30,r:20,fill:"#FDE047",stroke:"#CA8A04","stroke-width":3},svg);
      [[0,-30],[-28,-14],[28,-14]].forEach(([dx,dy])=>line(svg,320+dx*.8,30+dy*.8,320+dx*1.25,30+dy*1.25,3,"#EAB308"));
      T(svg,520,180,"dilute HCl","mid");line(svg,465,176,420,176,2.5);},
    phstrip(svg){const C=["#DC2626","#16A34A","#2563EB"];
      ["A","B","C"].forEach((l,i)=>{const x=160+i*160;el("rect",{x:x-24,y:28,width:48,height:110,rx:6,fill:"#FEF3C7",stroke:"#D97706","stroke-width":2},svg);
        el("ellipse",{cx:x,cy:84,rx:18,ry:22,fill:C[i]},svg);T(svg,x,164,l,"mid");});
      const g=el("linearGradient",{id:"phg"+Math.random().toString(36).slice(2,6)},el("defs",{},svg));
      [["0%","#DC2626"],["25%","#F97316"],["45%","#EAB308"],["50%","#16A34A"],["75%","#2563EB"],["100%","#7C3AED"]].forEach(([o,c])=>el("stop",{offset:o,"stop-color":c},g));
      el("rect",{x:110,y:186,width:420,height:18,rx:9,fill:`url(#${g.id})`},svg);
      [["0",110],["7",320],["14",530]].forEach(([t,x])=>T(svg,x,232,t,"small"));},
    ppt(svg,it){const col=(it&&it.col)||"#FACC15";
      tube(svg,320,60,128,"#F8FAFC",(it&&it.l2)||"");
      el("path",{d:"M304 160 V188 a16 16 0 0 0 32 0 V160 Z",fill:col,stroke:"#94A3B8","stroke-width":1},svg);
      for(let k=0;k<10;k++)el("circle",{cx:308+Math.random()*24,cy:134+Math.random()*22,r:2.5,fill:col,stroke:"#94A3B8","stroke-width":.6},svg);
      el("rect",{x:312,y:8,width:16,height:36,rx:3,fill:"rgba(255,255,255,.5)",stroke:GL,"stroke-width":2.5},svg);el("ellipse",{cx:320,cy:8,rx:13,ry:9,fill:"#64748B"},svg);
      el("circle",{cx:320,cy:52,r:4,fill:"#E0F2FE",stroke:GL},svg);
      T(svg,450,34,(it&&it.l1)||"","small");line(svg,390,30,334,24,2.5);T(svg,470,184,"solid forms","small");line(svg,420,180,340,180,2.5);},
    electrolysis(svg){
      el("path",{d:"M150 110 v90 a10 10 0 0 0 10 10 h320 a10 10 0 0 0 10 -10 v-90",fill:"rgba(255,255,255,.3)",stroke:GL,"stroke-width":4},svg);
      el("rect",{x:154,y:128,width:332,height:78,rx:6,fill:"#DBEAFE"},svg);
      [[250,"A",112],[390,"B",56]].forEach(([x,l,g])=>{
        el("path",{d:`M${x-20} 200 V36 a20 20 0 0 1 40 0 V200`,fill:"#DBEAFE",stroke:GL,"stroke-width":3.5},svg);
        el("path",{d:`M${x-17} ${36+g} V36 a17 17 0 0 1 34 0 V${36+g} Z`,fill:"#F8FAFC"},svg);
        line(svg,x,206,x,232,5,"#475569");T(svg,x+42,36,"Tube "+l,"small");});
      el("rect",{x:290,y:222,width:60,height:16,rx:3,fill:"#F59E0B"},svg);line(svg,250,230,290,230,3);line(svg,350,230,390,230,3);},
    nailcuso4(svg){[[200,"#2563EB","At the start"],[440,"#86EFAC","After 20 minutes"]].forEach(([x,c,l],i)=>{
        tube(svg,x,40,160,c,l);el("rect",{x:x-4,y:20,width:8,height:186,rx:2,fill:i?"#9A3412":"#94A3B8"},svg);el("rect",{x:x-9,y:16,width:18,height:7,rx:2,fill:i?"#9A3412":"#64748B"},svg);});
      arrow(svg,262,378,120,"wait");},
    quicklime(svg){
      el("path",{d:"M220 80 v120 a12 12 0 0 0 12 12 h176 a12 12 0 0 0 12 -12 v-120",fill:"rgba(255,255,255,.3)",stroke:GL,"stroke-width":4},svg);
      el("rect",{x:224,y:150,width:192,height:58,rx:8,fill:"#E0F2FE"},svg);
      for(let k=0;k<9;k++)el("rect",{x:240+k*19,y:180+(k%3)*8,width:16,height:12,rx:4,fill:"#F8FAFC",stroke:"#94A3B8"},svg);
      [270,320,370].forEach((x,k)=>el("path",{d:`M${x} 140 c-12 -16 12 -24 0 -40 c-12 -16 12 -24 0 -40`,fill:"none",stroke:"#94A3B8","stroke-width":3.5,"stroke-linecap":"round",opacity:.8},svg));
      T(svg,520,100,"Hiss!","big");T(svg,520,136,"Very hot","small");T(svg,320,236,"Quick lime + water","small");},
    feso4heat(svg){const g=el("g",{transform:"rotate(-24 300 120)"},svg);
      el("path",{d:"M170 100 H400 a18 18 0 0 1 0 36 H170",fill:"rgba(255,255,255,.35)",stroke:GL,"stroke-width":4},g);
      for(let k=0;k<7;k++)el("rect",{x:340+k*9,y:118,width:10,height:14,rx:2,fill:k<4?"#A16207":"#4ADE80",stroke:"#14532D","stroke-width":.6},g);
      el("rect",{x:150,y:96,width:40,height:44,rx:6,fill:"#92400E"},g);
      el("path",{d:"M404 176 C428 140 422 112 404 90 C386 112 380 140 404 176Z",fill:"#FB923C"},svg);el("rect",{x:384,y:174,width:40,height:22,rx:4,fill:"#475569"},svg);
      [[540,70],[566,52]].forEach(([x,y])=>el("path",{d:`M${x} ${y+40} c-10 -12 10 -18 0 -30 c-10 -12 10 -18 0 -30`,fill:"none",stroke:"#94A3B8","stroke-width":3},svg));
      T(svg,200,226,"Ferrous sulphate","small");T(svg,590,140,"smell!","small");},
    cuheat(svg){
      el("path",{d:"M220 100 Q320 190 420 100 Z",fill:"#F8FAFC",stroke:GL,"stroke-width":4},svg);
      el("path",{d:"M246 104 Q320 150 394 104 Z",fill:"#1F2937"},svg);
      [[268,108],[372,108]].forEach(([x,y])=>el("circle",{cx:x,cy:y,r:5,fill:"#B45309"},svg));
      line(svg,240,150,220,214,4,"#475569");line(svg,400,150,420,214,4,"#475569");line(svg,250,150,390,150,4,"#475569");
      el("path",{d:"M320 200 C336 176 332 160 320 150 C308 160 304 176 320 200Z",fill:"#FB923C"},svg);el("rect",{x:302,y:198,width:36,height:20,rx:4,fill:"#475569"},svg);
      T(svg,320,44,"China dish: copper powder heated","small");},
    rustgate(svg){
      el("rect",{x:150,y:30,width:340,height:190,rx:6,fill:"none",stroke:"#475569","stroke-width":8},svg);
      for(let k=0;k<7;k++)line(svg,190+k*44,34,190+k*44,216,6,"#64748B");line(svg,154,125,486,125,6,"#64748B");
      [[200,60,16],[280,150,20],[370,90,14],[430,180,18],[240,190,12],[330,40,10],[460,70,12]].forEach(([x,y,r])=>el("ellipse",{cx:x,cy:y,rx:r,ry:r*0.8,fill:"#9A3412",opacity:.85},svg));},
    chips(svg){
      el("path",{d:"M220 40 Q320 20 420 40 L440 200 Q320 225 200 200 Z",fill:"#FDE68A",stroke:"#D97706","stroke-width":4},svg);
      el("path",{d:"M220 40 L216 30 Q320 10 424 30 L420 40",fill:"#F59E0B"},svg);
      T(svg,320,120,"CHIPS","big");
      [[260,170],[300,182],[350,176],[390,166],[280,70],[370,64]].forEach(([x,y])=>{el("circle",{cx:x,cy:y,r:14,fill:"rgba(255,255,255,.7)",stroke:"#38BDF8","stroke-width":2},svg);T(svg,x,y+4,"N2","small");});
      T(svg,540,120,"gas inside","small");}
  };
  const crop=svg=>{if(svg.dataset.pic!=="1")return;try{const b=svg.getBBox();if(b.width<10)return;const p=12;
      svg.setAttribute("viewBox",`${(b.x-p).toFixed(1)} ${(b.y-p).toFixed(1)} ${(b.width+2*p).toFixed(1)} ${(b.height+2*p).toFixed(1)}`);}catch(e){}};
  const seen=new WeakSet();
  return {draw:(it,svg)=>{
    if(!it.pic||!P[it.pic]){svg.dataset.pic="0";return false;}
    svg.setAttribute("viewBox","0 0 640 240");P[it.pic](svg,it);svg.dataset.pic="1";crop(svg);
    if(!seen.has(svg)&&window.ResizeObserver){seen.add(svg);new ResizeObserver(()=>crop(svg)).observe(svg);}
    return true;}};
})();
const drawPic=(it,svg,S)=>LABPX.draw(it,svg);

  /* ===== Lesson 1 final set: lab pictures, then handbook exam questions, then textbook, then bonus ===== */
  const EXQ="📝 Exam question",LP="🔬 Lab picture";
  const pk=(arr,idx,src)=>idx.map(i=>src?Object.assign({},arr[i],{src}):arr[i]);
  const asPic=(x,pic,extra)=>Object.assign({},x,{pic,eq:null,card:null,src:LP},extra||{});
  const TYPES=["Combination","Decomposition","Displacement","Double displacement"];
  const ty=(a)=>TYPES.filter(x=>x!==a);
  const TY_NEW={
    pic:[{pic:"quicklime",q:"Water is added to quick lime. It hisses and becomes very hot. What type of reaction is this?",a:"Combination",t:ty("Combination"),w:"CaO + H2O → Ca(OH)2. Two reactants form one product and give out heat.",src:LP},
         {pic:"feso4heat",q:"Green ferrous sulphate crystals are heated. They turn brown and smell of burning sulphur. What type of reaction?",a:"Decomposition",t:ty("Decomposition"),w:"2FeSO4 → Fe2O3 + SO2 + SO3. One substance breaks into simpler ones.",src:LP},
         {pic:"ppt",col:"#E5E7EB",l1:"Barium chloride",l2:"Sodium sulphate",q:"Barium chloride is added to sodium sulphate solution. A white solid forms. What type of reaction?",a:"Double displacement",t:ty("Double displacement"),w:"Ions are exchanged and white barium sulphate settles down.",src:LP}],
    ex:[{q:"What type of reaction happens when food is digested in our body?",a:"Decomposition",t:["Combination","Displacement","Double displacement"],w:"Rice and potatoes break down into glucose.",src:EXQ},
        {q:"Why is photosynthesis an endothermic reaction?",a:"It takes in energy from sunlight",t:["It gives out heat","It gives out light","It needs no energy"],w:"Plants absorb light energy to make glucose.",src:EXQ},
        {q:"What type of reaction is respiration?",a:"Exothermic",t:["Endothermic","Decomposition only","Displacement"],w:"Glucose combines with oxygen and gives out energy.",src:EXQ},
        {q:"What is the common name of calcium oxide (CaO)?",a:"Quick lime",t:["Slaked lime","Limestone","Lime water"],w:"CaO is quick lime; Ca(OH)2 is slaked lime.",src:EXQ},
        {q:"Why is hydrogen peroxide kept in coloured bottles?",a:"Light decomposes it into water and oxygen",t:["Light makes it stronger","It looks attractive","It stops it freezing"],lay:"col",w:"Coloured glass keeps light away.",src:EXQ},
        {q:"Which equation has two reactants and one product?",a:"2H2 + O2 → 2H2O",t:["2H2O → 2H2 + O2","Zn + CuSO4 → ZnSO4 + Cu","NaOH + HCl → NaCl + H2O"],lay:"col",w:"Hydrogen and oxygen combine to form only water.",src:EXQ}]
  };
  const RD_NEW={
    pic:[{pic:"cuheat",q:"Brown copper powder turns black when heated in air. What is the black substance?",a:"Copper oxide",t:["Copper sulphate","Carbon","Copper carbonate"],w:"2Cu + O2 → 2CuO. Copper gains oxygen and is oxidised.",src:LP},
         {pic:"rustgate",q:"Lakshmi sees a reddish-brown coating on an old iron gate. What is mainly responsible?",a:"Moist air",t:["Heat only","Dry nitrogen","Sunlight"],w:"Iron rusts when both air and moisture are present.",src:LP},
         {pic:"chips",q:"Chips packets are filled with a non-reactive gas to stop rancidity. Which gas?",a:"Nitrogen",t:["Oxygen","Hydrogen","Chlorine"],w:"Nitrogen keeps oxygen away, so the oil is not oxidised.",src:LP}],
    ex:[{q:"How should fried snacks be stored to prevent rancidity?",a:"In airtight packets",t:["Under sunlight","In an open container","Sprinkled with water"],w:"Less air means less oxidation.",src:EXQ},
        {q:"Cooking oil is kept in an airtight bottle after use. Why?",a:"To prevent rancidity",t:["To increase its colour","To make it thicker","To remove moisture"],w:"Air oxidises oils and fats.",src:EXQ}]
  };
  const OB_NEW={
    mg:{pic:"mgburn",q:"A magnesium ribbon burns like this. What is the white powder formed?",a:"Magnesium oxide",t:["Magnesium hydroxide","Magnesium chloride","Magnesium carbonate"],w:"2Mg + O2 → 2MgO.",src:LP},
    ex:[{q:"An iron nail is left in moist air for some days. What happens?",a:"It rusts",t:["It becomes shiny","It melts","Nothing happens"],w:"Iron reacts with oxygen and moisture to form rust.",src:EXQ},
        {q:"Why do silver, gold and platinum not corrode in moist air?",a:"They are very low in the reactivity series",t:["They are very reactive","They are coated with zinc","They are non-metals"],lay:"col",w:"Less reactive metals do not react easily with air and water.",src:EXQ}]
  };
  const TY_CORE=[...TY_NEW.pic,...pk(TY_CORE0,[12,13,9,5,2,1],EXQ),...TY_NEW.ex,...pk(TY_CORE0,[0,4,7,8,10,11,14,15])],TY_BONUS=pk(TY_BONUS0,[6]);
  const RD_CORE=[...RD_NEW.pic,...pk(RD_CORE0,[3,10],EXQ),...RD_NEW.ex,...pk(RD_CORE0,[1,2,4,5,6,7,8,9])],RD_BONUS=pk(RD_BONUS0,[0]);
  const OB_CORE=[OB_NEW.mg,asPic(OB_BONUS0[1],"ppt",{l1:"Potassium iodide",l2:"Lead nitrate",q:"Potassium iodide is added to lead nitrate. What is the yellow solid?"}),
                 asPic(OB_CORE0[7],"electrolysis",{q:"Water is electrolysed. Why does tube A collect double the gas of tube B?"}),
                 asPic(OB_CORE0[10],"nailcuso4",{q:"The nail turns brown and the blue solution turns pale green. Why?",a:"Iron displaces copper",t:["Iron adds colour","The nail rusts","The solution evaporates"],lay:null}),
                 ...OB_NEW.ex,...pk(OB_CORE0,[2,3,4,5,6,8,11])],OB_BONUS=[OB_BONUS0[0],OB_BONUS0[2],OB_BONUS0[3]];

  window.__test={EQ,NAME,atoms,BAL_CORE,BAL_BONUS,TY_CORE,TY_BONUS,RD_CORE,RD_BONUS,OB_CORE,OB_BONUS,HEAT_CORE,HEAT_BONUS};
  const typStart=makeSeq({pre:"typ",CORE:TY_CORE,BONUS:TY_BONUS});
  const rdxStart=makeSeq({pre:"rdx",CORE:RD_CORE,BONUS:RD_BONUS});
  const obsStart=makeSeq({pre:"obs",CORE:OB_CORE,BONUS:OB_BONUS});
  balQ();typStart();rdxStart();heatSet();obsStart();
})();
