"use strict";
const KEY='nutrition', ML_OZ=29.5735;
const APP={domain:'nutrition.mcbflow.com',oldDomain:'mbnutrition.online',short:'Nutrition',version:'1.8',released:'2026-10-15',firstYear:2026};
const THEME_KEY='nutrition.theme', SEEN_KEY='nutrition.seen', HANDLE_DB='nutrition.backup';
const $=s=>document.querySelector(s);
const uid=()=>{try{if(crypto.randomUUID)return crypto.randomUUID()}catch(e){}return Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-5)};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>{const n=parseFloat(v);return isFinite(n)?n:0};
const r0=n=>Math.round(n), r1=n=>Math.round(n*10)/10;
const fmt=n=>r0(n).toLocaleString();
function dk(d){const z=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())}
const todayKey=()=>dk(new Date());
function shift(key,n){const [y,m,d]=key.split('-').map(Number);return dk(new Date(y,m-1,d+n))}
function prettyDate(key){const t=todayKey();if(key===t)return'Today';if(key===shift(t,-1))return'Yesterday';if(key===shift(t,1))return'Tomorrow';const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}

/* ---------- data ---------- */
const STD_G=14; /* grams of alcohol in one US standard drink */
const stdDrinks=(ml,abv)=>Math.round(num(ml)*num(abv)/100*0.789/STD_G*100)/100;
/* hydration %: Maughan et al. 2016 Beverage Hydration Index (src 'bhi'); 'est' = my estimate, not measured */
function defaultDrinks(){const oz=n=>r0(n*ML_OZ),D=(id,name,ml,kcal,p,c,f,caf,hyd,abv,src,fav)=>({id,name,ml,kcal,p,c,f,caf,hyd,abv,src,fav:!!fav,uses:0});return[
  D('d_water','Water',oz(16),0,0,0,0,0,100,0,'bhi',1),
  D('d_sparkling','Sparkling water',oz(12),0,0,0,0,0,100,0,'bhi'),
  D('d_coffee','Coffee',oz(12),5,0.4,0,0,140,100,0,'bhi',1),
  D('d_tea','Tea',oz(12),2,0,0.5,0,70,100,0,'bhi'),
  D('d_soda','Soda (cola)',355,140,0,39,0,34,100,0,'bhi',1),
  D('d_diet','Diet soda',355,0,0,0,0,46,100,0,'bhi'),
  D('d_juice','Orange juice',oz(8),110,2,26,0,0,139,0,'bhi'),
  D('d_milk2','Milk, 2%',oz(8),122,8.1,11.7,4.8,0,150,0,'est'),
  D('d_milkwhole','Milk, whole',oz(8),149,7.7,11.7,7.9,0,150,0,'bhi'),
  D('d_milkskim','Milk, skim',oz(8),83,8.3,12.2,0.2,0,158,0,'bhi'),
  D('d_sports','Sports drink',oz(20),140,0,36,0,0,100,0,'bhi'),
  D('d_ors','Electrolyte drink (oral rehydration)',oz(12),35,0,9,0,0,154,0,'bhi'),
  D('d_coconut','Coconut water',oz(11),63,0.7,12,0.6,0,100,0,'est'),
  D('d_energy','Energy drink',oz(16),210,0,54,0,160,100,0,'est'),
  D('d_lightbeer','Light beer',oz(12),103,0.9,5.8,0,0,100,4.2,'bhi'),
  D('d_beer','Beer (lager)',oz(12),153,1.6,12.6,0,0,100,5,'bhi'),
  D('d_ipa','IPA',oz(12),200,2,15,0,0,50,6.5,'est'),
  D('d_seltzer','Hard seltzer',oz(12),100,0,2,0,0,100,5,'est'),
  D('d_redwine','Red wine',oz(5),125,0.1,3.8,0,0,0,13,'est'),
  D('d_whitewine','White wine',oz(5),121,0.1,3.8,0,0,0,12,'est'),
  D('d_shot','Shot (80 proof)',oz(1.5),97,0,0,0,0,0,40,'est'),
  D('d_mixed','Mixed drink (rum & cola)',oz(7.5),167,0,19.5,0,17,0,7.9,'est')]}
/* starter foods: values computed from the bundled USDA SR Legacy rows for the serving weight shown */
function defaultFoods(){const F=(id,name,serving,kcal,p,c,f)=>({id,type:'food',name,serving,kcal,p,c,f,fav:false,uses:0});return[
  F('f_egg','Egg','1 large (50 g)',72,6.3,0.4,4.8),
  F('f_banana','Banana','1 medium (118 g)',105,1.3,26.9,0.4),
  F('f_apple','Apple','1 medium (182 g)',95,0.5,25.1,0.4),
  F('f_chicken','Chicken breast, roasted','4 oz (113 g)',186,35,0,4.1),
  F('f_rice','White rice, cooked','1 cup (158 g)',205,4.3,44.6,0.5),
  F('f_oats','Oats, dry','1/2 cup (40 g)',152,5.3,27.1,2.6),
  F('f_greek','Greek yogurt, plain nonfat','170 g',100,17.3,6.1,0.7),
  F('f_pb','Peanut butter','2 tbsp (32 g)',191,7.1,7.1,16.4),
  F('f_bread','Whole-wheat bread','1 slice (32 g)',81,4,13.7,1.1),
  F('f_avocado','Avocado','1/2 fruit (68 g)',109,1.4,5.8,10),
  F('f_broccoli','Broccoli, raw','1 cup (91 g)',31,2.5,6,0.4),
  F('f_cheddar','Cheddar cheese','1 oz (28 g)',113,6.4,1,9.3)]}
function defaults(){return{v:2,
  settings:{kcal:2000,p:140,c:200,f:65,waterMl:r0(64*ML_OZ),unit:'oz',caffeine:true,alcohol:true,cafLimit:400,lastBackup:0,weightKg:null,sex:'m',fasting:false,fastGoal:16,winStart:'',winEnd:'',allergens:[],avoidWords:'',hideAllergens:false,diet:[],style:'',supps:true,offSearch:true},
  foods:defaultFoods(),drinks:defaultDrinks(),log:{},template:null,supps:[],suppLog:{}}}
function migrate(d){
  if((d.v||1)<2){const nd=defaultDrinks(),byId=Object.fromEntries(nd.map(x=>[x.id,x]));
    d.drinks=(d.drinks||[]).map(x=>{const n=byId[x.id];if(n)return{...n,fav:!!x.fav,uses:x.uses||0,last:x.last};
      if(x.abv==null)x.abv=x.alc>0&&x.ml?r1(x.alc*STD_G/0.789/x.ml*100):0;return x});
    nd.forEach(x=>{if(!d.drinks.some(y=>y.id===x.id))d.drinks.push(x)});
    const fids=new Set((d.foods||[]).map(x=>x.id));defaultFoods().forEach(x=>{if(!fids.has(x.id))d.foods.push(x)});d.v=2}
  return d}
/* ---------- normalize: every saved or imported record is checked before it is used ----------
   Ids must be plain tokens (they end up in data-id attributes), numbers must be numbers, enums must be known values.
   Text fields stay as typed; they are always escaped when shown. */
const ID_RE=/^[A-Za-z0-9_-]{1,64}$/;
const okId=v=>typeof v==='string'&&ID_RE.test(v)?v:uid();
const str=(v,max=300)=>typeof v==='string'?v.slice(0,max):(v==null?'':String(v).slice(0,max));
const nn=v=>{const n=num(v);return n<0?0:n};
const pick=(v,list,dflt)=>list.includes(v)?v:dflt;
const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const DAY_RE=/^\d{4}-\d{2}-\d{2}$/, HM_RE=/^\d{2}:\d{2}$/;
function normItem(x,kind){if(!isObj(x))return null;const o={...x,id:okId(x.id),name:str(x.name,200)||'Untitled',kcal:nn(x.kcal),p:nn(x.p),c:nn(x.c),f:nn(x.f),fav:!!x.fav,uses:Math.round(nn(x.uses))};
  if(x.last!=null)o.last=num(x.last);
  o.allergens=Array.isArray(x.allergens)?x.allergens.filter(k=>typeof k==='string'&&k in ALL_GROUPS):[];o.verified=!!x.verified;
  if(kind==='drink'){o.ml=nn(x.ml);o.caf=nn(x.caf);o.hyd=x.hyd==null?100:Math.min(200,nn(x.hyd));o.abv=Math.min(95,nn(x.abv));o.alc=nn(x.alc);if(x.src!=null)o.src=pick(x.src,['bhi','est'],undefined);delete o.type;delete o.recipe;delete o.serving}
  else{o.serving=str(x.serving,80)||'1 serving';o.type=pick(x.type,['food','meal'],'food');
    if(x.recipe){const r=isObj(x.recipe)?x.recipe:{};o.recipe={portions:nn(r.portions)||1,items:(Array.isArray(r.items)?r.items:[]).filter(isObj).map(it=>({custom:!!it.custom,ref:it.ref&&ID_RE.test(it.ref)?it.ref:'',name:str(it.name,200),qty:nn(it.qty),kcal:nn(it.kcal),p:nn(it.p),c:nn(it.c),f:nn(it.f)}))}}else delete o.recipe}
  return o}
function normEntry(e){if(!isObj(e))return null;const kind=pick(e.kind,['food','drink'],null);if(!kind)return null;
  const o={id:okId(e.id),kind,ref:e.ref&&ID_RE.test(e.ref)?e.ref:null,name:str(e.name,200)||'Quick add',unit:str(e.unit,80),qty:nn(e.qty)||1,kcal:nn(e.kcal),p:nn(e.p),c:nn(e.c),f:nn(e.f),caf:nn(e.caf),t:num(e.t)||Date.now()};
  if(kind==='drink'){o.ml=nn(e.ml);o.hyd=e.hyd==null?100:Math.min(200,nn(e.hyd));o.alc=nn(e.alc)}return o}
function normalize(d){const b=defaults(),s={...b.settings,...(isObj(d.settings)?d.settings:{})};
  ['kcal','p','c','f','waterMl','cafLimit','lastBackup'].forEach(k=>s[k]=nn(s[k]));
  s.fastGoal=Math.max(1,Math.min(23.75,num(s.fastGoal)||16));s.unit=pick(s.unit,['oz','ml'],'oz');s.sex=pick(s.sex,['m','f','a'],'m');
  s.weightKg=s.weightKg==null||s.weightKg===''?null:(nn(s.weightKg)||null);
  ['caffeine','alcohol','fasting','hideAllergens','supps','fastCustom','recDismissed','offSearch'].forEach(k=>{if(k in s)s[k]=!!s[k]});
  s.winStart=HM_RE.test(s.winStart)?s.winStart:'';s.winEnd=HM_RE.test(s.winEnd)?s.winEnd:'';
  s.allergens=Array.isArray(s.allergens)?s.allergens.filter(k=>k in ALLERGENS):[];s.diet=Array.isArray(s.diet)?s.diet.filter(k=>k in DIETS):[];
  s.style=s.style in STYLES?s.style:'';s.avoidWords=str(s.avoidWords,300);
  if(isObj(s.profile)){const p=s.profile;['age','heightCm','bodyFat','rateKgWk','activity'].forEach(k=>{if(p[k]!=null&&p[k]!=='')p[k]=num(p[k]);else delete p[k]});
    p.goal=typeof p.goal==='string'?p.goal:'maintain';p.formula=pick(p.formula,['mifflin','katch'],'mifflin');p.bodyType=pick(p.bodyType,['ectomorph','mesomorph','endomorph','custom'],'mesomorph');
    p.pct=isObj(p.pct)?{p:nn(p.pct.p),c:nn(p.pct.c),f:nn(p.pct.f)}:{...BODY_TYPES.mesomorph.pct}}else delete s.profile;
  const log={};if(isObj(d.log))Object.keys(d.log).forEach(k=>{if(DAY_RE.test(k)&&Array.isArray(d.log[k])){const L=d.log[k].map(normEntry).filter(Boolean);if(L.length)log[k]=L}});
  const supps=(Array.isArray(d.supps)?d.supps:[]).filter(isObj).map(x=>({id:okId(x.id),name:str(x.name,120)||'Supplement',dose:str(x.dose,120),notes:str(x.notes,300),active:x.active!==false,
    created:DAY_RE.test(x.created)?x.created:undefined,slots:(Array.isArray(x.slots)?x.slots:[]).filter(sl=>SLOTS.some(z=>z[0]===sl)),days:(Array.isArray(x.days)?x.days:[]).map(Number).filter(n=>n>=0&&n<=6)}))
    .map(x=>({...x,slots:x.slots.length?x.slots:['am'],days:x.days.length?x.days:[0,1,2,3,4,5,6]}));
  const suppLog={};if(isObj(d.suppLog))Object.keys(d.suppLog).forEach(k=>{if(DAY_RE.test(k)&&isObj(d.suppLog[k])){const o={};Object.keys(d.suppLog[k]).forEach(kk=>{if(/^[A-Za-z0-9_-]{1,64}\|(am|mid|pm|bed)$/.test(kk))o[kk]=num(d.suppLog[k][kk])});suppLog[k]=o}});
  return{v:2,settings:s,foods:(Array.isArray(d.foods)?d.foods:b.foods).map(x=>normItem(x,'food')).filter(Boolean),drinks:(Array.isArray(d.drinks)?d.drinks:b.drinks).map(x=>normItem(x,'drink')).filter(Boolean),
    log,template:Array.isArray(d.template)?d.template.map(normEntry).filter(Boolean):null,supps,suppLog}}
let loadNote='';
function load(){let raw=null;
  try{raw=localStorage.getItem(KEY)}catch(e){return defaults()}
  if(!raw)return defaults();
  try{const parsed=JSON.parse(raw);
    return normalize(migrate(parsed))}
  catch(e){try{localStorage.setItem('nutrition.unreadable-'+Date.now(),raw)}catch(x){}loadNote='Your saved data could not be read, so the app started fresh. A copy of the old data was kept in this browser; import a backup to restore your log.';return defaults()}}
let S, storageOK=true;
let SYNC=null;   // optional account sync (mb-sync.js), set up after the first render
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));storageOK=true}catch(e){storageOK=false}const b=$('#storeBanner');if(b)b.hidden=storageOK;if(SYNC)SYNC.changed()}
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}

let cur=todayKey(), view='today', libTab=uiGet('libTab','foods'), toastTimer=null, curModal=null;
function uiGet(k,d){try{const o=JSON.parse(localStorage.getItem('nutrition.ui')||'{}');return o[k]??d}catch(e){return d}}
function uiSet(k,v){try{const o=JSON.parse(localStorage.getItem('nutrition.ui')||'{}');o[k]=v;localStorage.setItem('nutrition.ui',JSON.stringify(o))}catch(e){}}
const prev={};

/* ---------- units ---------- */
const isOz=()=>S.settings.unit==='oz';
const toUnit=ml=>isOz()?ml/ML_OZ:ml;
const fromUnit=v=>isOz()?num(v)*ML_OZ:num(v);
const uName=()=>isOz()?'oz':'mL';
const fmtVol=ml=>isOz()?fmt(ml/ML_OZ)+' oz':fmt(ml)+' mL';

/* ---------- math ---------- */
function totals(key){const t={kcal:0,p:0,c:0,f:0,ml:0,hyd:0,dkcal:0,caf:0,alc:0,n:0};
  for(const e of S.log[key]||[]){const q=e.qty;t.kcal+=e.kcal*q;t.p+=e.p*q;t.c+=e.c*q;t.f+=e.f*q;t.caf+=(e.caf||0)*q;
    if(e.kind==='drink'){t.ml+=e.ml*q;t.hyd+=e.ml*(e.hyd/100)*q;t.dkcal+=e.kcal*q;t.alc+=(e.alc||0)*q}t.n++}
  return t}
const findItem=id=>S.foods.find(x=>x.id===id)||S.drinks.find(x=>x.id===id);
function mkEntry(it,kind,qty=1){const e={id:uid(),kind,ref:it.id||null,name:it.name||'Quick add',unit:kind==='food'?(it.serving||'serving'):'',qty,
  kcal:num(it.kcal),p:num(it.p),c:num(it.c),f:num(it.f),caf:num(it.caf),t:Date.now()};
  if(kind==='drink'){e.ml=num(it.ml);e.hyd=it.hyd==null?100:num(it.hyd);e.alc=it.abv!=null?stdDrinks(it.ml,it.abv):num(it.alc)}return e}
function entryMeta(e){const bits=[];
  if(e.kind==='drink')bits.push(fmtVol(e.ml*e.qty));else bits.push((e.qty===1?'':e.qty+' × ')+esc(e.unit));
  bits.push(fmt(e.kcal*e.qty)+' cal');if(e.p)bits.push(r0(e.p*e.qty)+'g P');
  if(e.kind==='drink'&&S.settings.caffeine&&e.caf)bits.push(r0(e.caf*e.qty)+' mg caf');
  return bits.join(' · ')}
function itemMeta(it,kind){return kind==='drink'?fmtVol(it.ml)+' · '+fmt(it.kcal)+' cal'+(num(it.abv)>0?' · '+it.abv+'%':''):fmt(it.kcal)+' cal · '+r0(it.p)+'g P'}
const isAlc=d=>num(d.abv)>0||num(d.alc)>0;
/* under 21 (US drinking age): every alcohol feature, drink and database entry is hidden, whatever the toggle says */
const under21=()=>{const a=S.settings.profile&&num(S.settings.profile.age);return a>0&&a<21};
const alcOn=()=>!!S.settings.alcohol&&!under21();
const isAlcDB=name=>/^alcoholic beverage/i.test(name);
const visDrinks=()=>S.drinks.filter(d=>alcOn()||!isAlc(d));
const r2=n=>Math.round(n*100)/100;

/* ---------- actions ---------- */
function addEntries(list,msg){const key=cur,day=S.log[key]||(S.log[key]=[]);
  if(key!==todayKey()){const [y,m,d]=key.split('-').map(Number),n=new Date();list.forEach(e=>{if(dk(new Date(e.t))!==key)e.t=new Date(y,m-1,d,n.getHours(),n.getMinutes()).getTime()})}
  list.forEach(e=>{day.push(e);const src=findItem(e.ref);if(src){src.uses=(src.uses||0)+1;src.last=Date.now()}});
  save();render();if(list.some(e=>e.kind==='drink'))pulseGlass();
  const ids=new Set(list.map(e=>e.id));
  toast(msg,()=>{S.log[key]=(S.log[key]||[]).filter(e=>!ids.has(e.id));save();render();toast('Undone')})}
function logItem(id){const it=findItem(id);if(!it)return;const kind=S.drinks.includes(it)?'drink':'food',w=allergenInfo(it);addEntries([mkEntry(it,kind)],'Logged '+it.name+(flagged(w)?' · ⚠ '+warnText(w):''))}
function removeEntry(id){const key=cur,list=S.log[key]||[],i=list.findIndex(e=>e.id===id);if(i<0)return;const [e]=list.splice(i,1);save();render();
  toast('Removed '+e.name,()=>{(S.log[key]||(S.log[key]=[])).splice(i,0,e);save();render()})}
function stepEntry(id,d){const e=(S.log[cur]||[]).find(x=>x.id===id);if(!e)return;const n=r2(e.qty+d);if(n<=0)return removeEntry(id);e.qty=n;save();render();if(e.kind==='drink'&&d>0)pulseGlass()}
function cloneEntries(list){const [y,m,d]=cur.split('-').map(Number),now=Date.now();
  return list.map(e=>{const o=new Date(e.t);let t=new Date(y,m-1,d,o.getHours(),o.getMinutes()).getTime();if(t>now)t=now;return{...e,id:uid(),t}})}
function pulseGlass(){const g=$('.glass');if(!g)return;g.classList.remove('pulse');void g.getBBox;requestAnimationFrame(()=>g.classList.add('pulse'))}

/* ---------- toast ---------- */
function toast(msg,undo,act){const el=$('#toast');el.innerHTML='<span>'+esc(msg)+'</span>'+(undo?'<button type="button">Undo</button>':act?'<button type="button">'+esc(act[0])+'</button>':'');el.hidden=false;
  el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
  const b=el.querySelector('button');if(b)b.onclick=()=>{el.hidden=true;(undo||act[1])()};
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,undo||act?6000:4000)}

/* ---------- animation helper: render at previous value, then move to new ---------- */
function anim(k,to){const from=k in prev?prev[k]:to;prev[k]=to;return{from,to}}
function applyAnims(){requestAnimationFrame(()=>requestAnimationFrame(()=>{document.querySelectorAll('[data-to]').forEach(el=>{const v=el.dataset.to,p=el.dataset.prop;
  if(p==='dash')el.setAttribute('stroke-dashoffset',v);else if(p==='ty')el.style.transform='translateY('+v+'px)';else if(p==='w')el.style.width=v+'%';else if(p==='h')el.style.height=v+'%'})}))}

/* ---------- BAC (Widmark) ---------- */
const WIDMARK_R={m:0.68,f:0.55,a:0.615}, BETA=0.015 /* %BAC eliminated per hour */, ABSORB_MIN=45;
function alcEvents(){const now=Date.now(),from=now-24*36e5,ev=[],oldest=shift(todayKey(),-2);
  Object.keys(S.log).forEach(k=>{if(k<oldest)return;S.log[k].forEach(e=>{if(e.kind==='drink'&&e.alc>0&&e.t>=from&&e.t<=now+6e4)ev.push({t:e.t,g:e.alc*STD_G*e.qty})})});
  return ev.sort((a,b)=>a.t-b.t)}
function bacCurve(){const s=S.settings;if(!alcOn()||!s.weightKg)return null;const ev=alcEvents();if(!ev.length)return null;
  const k=100/(s.weightKg*1000*(WIDMARK_R[s.sex]||WIDMARK_R.m)),elim=BETA/60,now=Date.now(),t0=ev[0].t,pts=[];
  let bac=0,t=t0,nowBac=0,peak={v:0,t:t0},zeroAt=null;
  for(let i=0;i<60*72;i++){let add=0,absorbing=false;
    for(const e of ev){if(t>=e.t&&t<e.t+ABSORB_MIN*6e4){add+=e.g*k/ABSORB_MIN;absorbing=true}else if(t<e.t)absorbing=true}
    bac=Math.max(0,bac+add-elim);
    if(t<=now)nowBac=bac;if(bac>peak.v)peak={v:bac,t};if(i%5===0)pts.push([t,bac]);
    if(bac<=0&&!absorbing&&t>t0){zeroAt=t;pts.push([t,0]);break}
    t+=6e4}
  return{now:nowBac,peak,zeroAt,pts,t0}}
const clock=t=>new Date(t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
function bacSection(){const s=S.settings;if(!alcOn())return'';const c=bacCurve();
  if(c&&c.now>0)return bacHTML(c);
  if(!s.weightKg){const ev=alcEvents();if(ev.length&&Date.now()-ev[ev.length-1].t<12*36e5)
    return`<section class="card span2 bac" id="baccard"><h2><span>Estimated BAC</span></h2><p class="empty" style="margin:0">Add your body weight in Settings to see a live BAC estimate.</p><div class="dayacts"><button type="button" class="btn" data-act="tab" data-v="settings">Add your weight</button></div></section>`}
  return''}
let bacLast=null,bacHoverT=null;
const BAC_W=320,BAC_H=120,BAC_T=16,BAC_B=6;   /* plot box; top room for the peak label */
const bacY=(v,mx,h=BAC_H)=>(BAC_T+(1-v/mx)*(BAC_H-BAC_T-BAC_B))/BAC_H*h;
function bacHTML(c){bacLast=c;const W=BAC_W,H=BAC_H,t1=c.zeroAt||c.pts[c.pts.length-1][0],span=Math.max(1,t1-c.t0),mx=Math.max(c.peak.v*1.05,0.01),now=Date.now();
  const X=t=>r1((t-c.t0)/span*W),Y=v=>r1(bacY(v,mx));
  const d='M'+c.pts.map(p=>X(p[0])+' '+Y(p[1])).join(' L'),nx=Math.min(W,Math.max(0,X(now))),base=H-BAC_B;
  const px=X(c.peak.t),py=Y(c.peak.v),gv=niceTicks(mx),grid=gv.map(v=>Y(v)),dp=gv.some(v=>Math.round(v*1000)%10)?3:2;
  const mid=c.t0+span/2,rising=c.peak.t>now;
  return`<section class="card span2 bac" id="baccard" aria-label="Estimated blood alcohol">
    <h2><span>Estimated BAC · live</span><span class="bacbadge ${rising?'up':'down'}">${rising?'Rising':'Coming down'}</span></h2>
    <div class="bacwrap"><div class="bachead"><div class="bignum bacnum num">${c.now.toFixed(3)}<small>%</small></div>
      <div class="hydsub num">Peak <b>${c.peak.v.toFixed(3)}%</b> at ${clock(c.peak.t)}${c.zeroAt?`<br>Back to 0.000% around <b>${clock(c.zeroAt)}</b>`:''}</div></div>
      <div class="bacplot" tabindex="0" role="img" aria-label="BAC estimate over time. Hover, drag or use the arrow keys to read the estimate at any time.">
      <svg class="bacspark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="bacg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.38"/><stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></linearGradient>
          <clipPath id="bacpast"><rect x="0" y="0" width="${nx}" height="${H}"/></clipPath><clipPath id="bacfut"><rect x="${nx}" y="0" width="${W-nx}" height="${H}"/></clipPath></defs>
        ${grid.map(y=>`<line x1="0" x2="${W}" y1="${y}" y2="${y}" class="bacgrid" vector-effect="non-scaling-stroke"/>`).join('')}
        <line x1="0" x2="${W}" y1="${base}" y2="${base}" class="bacbase" vector-effect="non-scaling-stroke"/>
        <path d="${d} L${X(t1)} ${base} L0 ${base} Z" fill="url(#bacg)" clip-path="url(#bacpast)"/>
        <path d="${d} L${X(t1)} ${base} L0 ${base} Z" fill="url(#bacg)" opacity=".45" clip-path="url(#bacfut)"/>
        <path d="${d}" class="bacline" clip-path="url(#bacpast)" vector-effect="non-scaling-stroke"/>
        <path d="${d}" class="bacline fut" clip-path="url(#bacfut)" vector-effect="non-scaling-stroke"/>
        <line x1="${nx}" x2="${nx}" y1="${BAC_T-6}" y2="${base}" class="bacnow" vector-effect="non-scaling-stroke"/></svg>
      <span class="bacpk" style="left:${r1(px/W*100)}%;top:calc(${r1(py/H*100)} * var(--bach) / 100)"></span>
      <span class="bacpkl num" style="left:${r1(Math.min(88,Math.max(12,px/W*100)))}%">Peak ${c.peak.v.toFixed(3)}%</span>
      <span class="bacme" style="left:${r1(nx/W*100)}%;top:calc(${r1(Y(c.now)/H*100)} * var(--bach) / 100)"></span>
      ${gv.map((v,i)=>`<span class="bacyl num" aria-hidden="true" style="top:calc(${r1(grid[i]/H*100)} * var(--bach) / 100)">${v.toFixed(dp)}%</span>`).join('')}
      <div class="bacx" hidden></div><div class="bacdot" hidden></div><div class="bactip num" hidden aria-live="polite"></div>
      <div class="bacaxis num"><span>${clock(c.t0)}</span><span>${clock(mid)}</span><span>${clock(t1)}</span></div></div></div>
    <p class="help">Rough Widmark estimate from your weight, body type and drink times. Food, pace, medications and your own body change real BAC a lot. Never use this to decide whether to drive. The faded part is projected. <button type="button" class="link" data-act="sources">How it's calculated</button></p></section>`}
setInterval(()=>{if(view==='today'&&cur===todayKey()){const fc=$('#fastcard');if(fc)fc.outerHTML=fastSection()}},30000);
setInterval(()=>{if(view!=='today'||cur!==todayKey())return;const el=$('#baccard'),c=bacCurve(),show=!!(c&&c.now>0);
  if(!el&&!show)return;if(!!el!==show||!el.querySelector('.bacnum')){render();return}
  const had=document.activeElement&&document.activeElement.closest('.bacplot');el.outerHTML=bacHTML(c);const p=$('#baccard .bacplot');
  if(p&&bacHoverT!=null){if(had)p.focus();bacShow(p,bacHoverT)}},30000);
/* one tooltip for every chart mark with data-tip="Value|label|extra": hover, tap or keyboard focus */
const chartTip=(()=>{let el=null,on=null,touchFirst=false;
  const mk=()=>{if(!el){el=document.createElement('div');el.className='ctip num';el.setAttribute('role','status');el.hidden=true;document.body.appendChild(el)}return el};
  const show=t=>{const tip=mk(),parts=(t.dataset.tip||'').split('|');if(!parts[0])return;on=t;tip.textContent='';
    const b=document.createElement('b');b.textContent=parts[0];tip.appendChild(b);
    parts.slice(1).filter(Boolean).forEach(x=>{const sp=document.createElement('span');sp.textContent=x;tip.appendChild(sp)});
    tip.hidden=false;const r=(t.querySelector('.wbar')||t).getBoundingClientRect(),tw=tip.offsetWidth,th=tip.offsetHeight;
    let left=r.left+r.width/2-tw/2;left=Math.max(8,Math.min(innerWidth-tw-8,left));let top=r.top-th-8;if(top<8)top=r.bottom+8;
    tip.style.left=left+'px';tip.style.top=top+'px';document.querySelectorAll('.tipon').forEach(x=>x.classList.remove('tipon'));t.classList.add('tipon')};
  const hide=()=>{on=null;if(el)el.hidden=true;document.querySelectorAll('.tipon').forEach(x=>x.classList.remove('tipon'))};
  document.addEventListener('pointerover',e=>{const t=e.target.closest&&e.target.closest('[data-tip]');if(t&&t!==on)show(t);else if(!t&&on&&e.pointerType!=='touch')hide()});
  document.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('[data-tip]');touchFirst=!!t&&e.pointerType!=='mouse'&&t!==on;if(t)show(t);else hide()});
  document.addEventListener('focusin',e=>{const t=e.target.closest&&e.target.closest('[data-tip]');if(t)show(t);else if(on)hide()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&on)hide()});
  addEventListener('scroll',()=>{if(on)hide()},{passive:true});
  /* on a touchscreen the first tap on a bar shows its numbers; a second tap opens the day */
  return{hide,firstTap:()=>{const f=touchFirst;touchFirst=false;return f}}})();

/* reading the BAC curve at any moment: mouse hover, finger drag, or arrow keys */
function bacAt(c,t){const p=c.pts;if(t<=p[0][0])return p[0][1];for(let i=1;i<p.length;i++)if(p[i][0]>=t){const a=p[i-1],b=p[i];return a[1]+(b[1]-a[1])*((t-a[0])/Math.max(1,b[0]-a[0]))}return p[p.length-1][1]}
function bacSpan(c){const t1=c.zeroAt||c.pts[c.pts.length-1][0];return{t0:c.t0,t1,span:Math.max(1,t1-c.t0),mx:Math.max(c.peak.v*1.05,0.01)}}
function bacShow(plot,t){const c=bacLast;if(!c)return;const g=bacSpan(c);t=Math.min(g.t1,Math.max(g.t0,t));bacHoverT=t;
  const svg=plot.querySelector('svg'),w=svg.clientWidth,h=svg.clientHeight,v=bacAt(c,t),x=(t-g.t0)/g.span*w,y=bacY(v,g.mx,h);
  const ln=plot.querySelector('.bacx'),dot=plot.querySelector('.bacdot'),tip=plot.querySelector('.bactip');
  ln.hidden=dot.hidden=tip.hidden=false;ln.style.left=x+'px';ln.style.height=h+'px';dot.style.left=x+'px';dot.style.top=y+'px';
  const now=Date.now(),when=Math.abs(t-now)<90e3?'Now':clock(t);
  tip.innerHTML=`<b>${v.toFixed(3)}%</b><span>${when}${t>now+90e3?' · projected':''}</span>`;ln.style.top='0';
  const tw=tip.offsetWidth,th=tip.offsetHeight;tip.style.left=Math.min(w-tw,Math.max(0,x-tw/2))+'px';tip.style.top=(y-th-14>=0?y-th-14:Math.min(h-th,y+14))+'px'}
function bacHide(plot){bacHoverT=null;plot.querySelectorAll('.bacx,.bacdot,.bactip').forEach(e=>e.hidden=true)}
function bacPointer(e){const plot=e.target.closest&&e.target.closest('.bacplot');if(!plot||!bacLast)return;const svg=plot.querySelector('svg'),r=svg.getBoundingClientRect(),g=bacSpan(bacLast);
  bacShow(plot,g.t0+Math.min(1,Math.max(0,(e.clientX-r.left)/r.width))*g.span)}
document.addEventListener('pointermove',bacPointer);document.addEventListener('pointerdown',e=>{if(!(e.target.closest&&e.target.closest('.bacplot'))){const p=$('#baccard .bacplot');if(p&&bacHoverT!=null)bacHide(p)}bacPointer(e)});
document.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch'&&e.target.classList&&e.target.classList.contains('bacplot')&&document.activeElement!==e.target)bacHide(e.target)},true);
document.addEventListener('focusin',e=>{const p=e.target.closest&&e.target.closest('.bacplot');if(p&&bacHoverT==null)bacShow(p,Date.now())});
document.addEventListener('focusout',e=>{if(e.target.classList&&e.target.classList.contains('bacplot'))bacHide(e.target)});
document.addEventListener('keydown',e=>{const p=e.target.closest&&e.target.closest('.bacplot');if(!p||!bacLast)return;const g=bacSpan(bacLast),step=(e.shiftKey?60:10)*6e4;
  const k={ArrowLeft:-step,ArrowRight:step}[e.key];let t=bacHoverT==null?Date.now():bacHoverT;
  if(k!=null)t+=k;else if(e.key==='Home')t=g.t0;else if(e.key==='End')t=g.t1;else return;e.preventDefault();bacShow(p,t)});

/* ---------- food database (USDA SR Legacy + TempoLife, per 100 g) ---------- */
let DB=null,dbLoading=null,dbErr=false;
function loadDB(){if(DB)return Promise.resolve(DB);
  if(!dbLoading)dbLoading=fetch('foods-db.json').then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(j=>{
    j.ix=j.foods.map(r=>indexName(r[0]));DB=j;dbErr=false;return j}).catch(e=>{dbLoading=null;throw e});
  return dbLoading}
const STOP=new Set(['and','or','with','of','the','a','an','in','n']);
const NOISE=new Set(['fast','foods','alcoholic','beverage','beverages','carbonated','raw','all','plain','regular','fresh','fluid','ready','to','drink','rtd','prepared','with','without','added','and','or','of','in','the','a','vitamin','type','commercial','brewed','cooked','tap','water']);
const SYN={coke:['cola','soda'],'coca cola':['cola','soda'],'coke zero':['cola low calorie','diet soda'],'diet coke':['cola low calorie','diet soda'],'diet pepsi':['cola low calorie','diet soda'],pepsi:['cola','soda'],
  'diet soda':'carbonated low calorie','diet pop':'carbonated low calorie',soda:'carbonated',pop:'carbonated','soft drink':'carbonated','fizzy drink':'carbonated',
  'dr pepper':'pepper type','mountain dew':'citrus soft drink','mtn dew':'citrus soft drink','7up':'lemon lime','7 up':'lemon lime',redbull:'red bull',
  oj:'orange juice',pb:'peanut butter','pb&j':'peanut butter jelly',pbj:'peanut butter jelly',donut:'doughnut',
  'hot dog':'frankfurter',hotdog:'frankfurter',wiener:'frankfurter',weiner:'frankfurter',frank:'frankfurter',fries:'french fries',
  mac:'macaroni',burger:'hamburger',mayo:'mayonnaise',catsup:'ketchup',icecream:'ice cream',milkshake:'milk shake',shake:'milk shake',
  whisky:'whiskey',bourbon:'whiskey',scotch:'whiskey',liquor:'distilled',shot:'distilled',tequila:'distilled','hot chocolate':'cocoa',
  'iced tea':'tea ready to drink','sweet tea':'tea ready to drink sweetened','cold brew':'coffee','iced coffee':'coffee iced',americano:'coffee',
  yoghurt:'yogurt',chickpea:'garbanzo',garbanzo:'chickpea',cilantro:'coriander',scallion:'green onion','spring onion':'green onion',
  jello:'gelatin','jell o':'gelatin','pop tart':'toaster pastries',poptart:'toaster pastries',sub:'submarine sandwich',hoagie:'submarine sandwich',grinder:'submarine sandwich',
  'tater tot':'potatoes puffs',tots:'potatoes puffs',champagne:'wine',prosecco:'wine',rose:'wine',merlot:'wine red',cabernet:'wine red',chardonnay:'wine white',
  'sports drink':'gatorade',ramen:'ramen noodle',nugget:'nuggets',pancake:'pancakes',hashbrown:'hash brown',
  smoothy:'smoothie',fizzy:'carbonated',blt:'submarine sandwich bacon lettuce',zucchini:'zucchini squash',courgette:'zucchini',aubergine:'eggplant',
  oatmeal:'oats',porridge:'oatmeal',steak:'beef steak'};
/* softer "also try" words: searched too, but the typed words still count in full */
const ALSO={pop:'soda',seltzer:'sparkling water','club soda':'sparkling water','la croix':'sparkling water',lacroix:'sparkling water',gatorade:'sports drink',powerade:'sports drink',
  'red bull':'energy drink',redbull:'energy drink',monster:'energy drink',celsius:'energy drink',bang:'energy drink',rockstar:'energy drink',
  budweiser:'beer',bud:'beer',coors:'beer',miller:'beer',corona:'beer',heineken:'beer',ipa:'beer',lager:'beer',ale:'beer',stout:'beer',pilsner:'beer',
  'hard seltzer':'light beer','white claw':'light beer',truly:'light beer',kombucha:'tea',matcha:'green tea',espresso:'coffee'};
/* typed words that should open with a sensible everyday pick (exact names in foods-db.json; "name|kcal" picks one of several same-named rows) */
const PIN={milk:['Milk, whole, 3.25% milkfat, with added vitamin D','Milk, reduced fat, fluid, 2% milkfat, with added vitamin A and vitamin D','Milk, lowfat, fluid, 1% milkfat, with added vitamin A and vitamin D'],
  egg:['Egg, whole, raw, fresh','Egg, whole, cooked, scrambled','Egg, whole, cooked, hard-boiled'],chicken:['Chicken breast'],
  rice:['Rice, white, long-grain, regular, enriched, cooked','Rice, white, long-grain, cooked','Brown rice (cooked)'],bacon:['Pork, cured, bacon, cooked, baked','Pork, cured, bacon, pre-sliced, cooked'],
  tequila:['Alcoholic beverage, distilled, all (gin, rum, vodka|231'],liquor:['Alcoholic beverage, distilled, all (gin, rum, vodka|231'],shot:['Alcoholic beverage, distilled, all (gin, rum, vodka|231'],
  whiskey:['Alcoholic beverage, distilled, whiskey, 86 proof'],whisky:['Alcoholic beverage, distilled, whiskey, 86 proof'],bourbon:['Alcoholic beverage, distilled, whiskey, 86 proof'],
  gin:['Alcoholic beverage, distilled, all (gin, rum, vodka|231'],rum:['Alcoholic beverage, distilled, rum, 80 proof'],wine:['Alcoholic beverage, wine, table, red','Alcoholic beverage, wine, table, white'],
  coffee:['Beverages, coffee, brewed, prepared with tap water'],tea:['Beverages, tea, black, brewed, prepared with tap water','Beverages, tea, green, brewed'],cheese:['Cheese, cheddar','Cheese, mozzarella, whole milk']};
const PENAL=new Set(['meatless','imitation','substitute','babyfood','infant']);
const stem=w=>{if(w.length>3){if(w.endsWith('ies'))w=w.slice(0,-2);else if(/(ch|sh|ss|x|o)es$/.test(w))w=w.slice(0,-2);else if(w.endsWith('s')&&!/(ss|us|is)$/.test(w))w=w.slice(0,-1)}
  return w.length>3?w.replace(/(ie|y)$/,'i'):w};
const words=s=>s.toLowerCase().replace(/['’]/g,'').split(/[^a-z0-9%&]+/).filter(w=>w&&w!=='&');
const toks=q=>words(q).filter(w=>!STOP.has(w)).map(stem);
function indexName(name){const segs=name.toLowerCase().replace(/['’]/g,'').split(/,|\(|\)/),w=[],seg=[];
  segs.forEach((s,i)=>words(s).forEach(x=>{w.push(stem(x));seg.push(i)}));
  let first=seg.find((s,j)=>!NOISE.has(w[j])&&!/^[0-9.%]+$/.test(w[j]));if(first==null)first=0;
  const head=w.filter((x,j)=>seg[j]===first&&!NOISE.has(x)).join(' ');return{w,seg,first,head}}
/* query variants: the typed words, plus synonym rewrites of any word or two-word phrase in it */
const synOf=w=>{const s=SYN[w]||SYN[stem(w)];return s?[].concat(s):null};
function variants(q){const raw=words(q).filter(w=>!STOP.has(w)),out=[{t:raw.map(stem),syn:0}],seen=new Set([out[0].t.join(' ')]);
  const add=t=>{const k=t.join(' ');if(t.length&&!seen.has(k)){seen.add(k);out.push({t,syn:1})}};
  for(let n=Math.min(raw.length,3);n>=1;n--)for(let i=0;i+n<=raw.length;i++){const ss=synOf(raw.slice(i,i+n).join(' '));
    if(ss){if(n===raw.length)out[0].syn=-1;ss.forEach(s=>add([...raw.slice(0,i).map(stem),...toks(s),...raw.slice(i+n).map(stem)]))}
    const al=ALSO[raw.slice(i,i+n).join(' ')];if(al){const k=out.length;add([...raw.slice(0,i).map(stem),...toks(al),...raw.slice(i+n).map(stem)]);if(out[k])out[k].syn=2}}
  const last=raw[raw.length-1];if(raw.length&&last.length>=3&&!synOf(last))Object.keys(SYN).filter(k=>!k.includes(' ')&&k.length>last.length&&k.length-last.length<=2&&k.startsWith(last)).slice(0,3)
    .forEach(k=>synOf(k).forEach(s=>add([...raw.slice(0,-1).map(stem),...toks(s)])));
  return out}
/* how well one query token matches one stemmed word: 0 exact, 1 prefix, 3 inside a longer word, 4 one typo */
function tokQ(t,x,fuzzy){if(x===t)return 0;if(x.startsWith(t))return 1;if(t.length>=4&&x.endsWith(t))return 3;
  if(fuzzy&&t.length>=4&&Math.abs(x.length-t.length)<=2&&lev(t,x)<=(t.length>=7?2:1))return 6;return -1}
function lev(a,b){let p=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const c=[i];
  for(let j=1;j<=b.length;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[b.length]}
/* lower is better; null = no match */
function scoreIx(ix,v,fuzzy){let s=v.syn===2?6:v.syn>0?-4:v.syn<0?5:0;const used=new Set();let hitFirst=false;
  for(const t of v.t){let best=-1,bj=-1;for(let j=0;j<ix.w.length;j++){const q=tokQ(t,ix.w[j],fuzzy&&fuzzy.has(t));if(q>=0&&(best<0||q<best)){best=q;bj=j;if(!q)break}}
    if(best<0)return null;s+=best;used.add(bj);if(ix.seg[bj]===ix.first)hitFirst=true}
  for(let j=0;j<ix.w.length;j++)if(!used.has(j)&&!NOISE.has(ix.w[j])&&!/^[0-9.%]+$/.test(ix.w[j])&&ix.w[j].length>1)s+=(ix.seg[j]===ix.first?1.5:1)+(PENAL.has(ix.w[j])?3:0);
  if(!hitFirst)s+=3;if(v.syn!==2&&ix.head===v.t.filter(t=>!NOISE.has(t)).join(' '))s-=5;return s}
function bestScore(ix,vs,fuzzy){let b=null;for(const v of vs){const s=scoreIx(ix,v,fuzzy);if(s!=null&&(b==null||s<b))b=s}return b}
/* typo tolerance only for words that match nothing in the database as typed */
const fuzzSet=(vs,vocab)=>{const f=new Set();vs.forEach(v=>v.t.forEach(t=>{if(t.length>=4&&!vocab.some(x=>x.startsWith(t)||x.endsWith(t)))f.add(t)}));return f.size?f:null};
function searchDB(q,limit=30){const vs=variants(q);if(!vs[0].t.length||!DB)return[];
  if(!DB.vocab)DB.vocab=[...new Set(DB.ix.flatMap(x=>x.w))];
  if(!DB.pin){DB.pin={};const byName={};DB.foods.forEach((r,i)=>{(byName[r[0]]=byName[r[0]]||[]).push(i)});
    for(const k in PIN)DB.pin[k]=PIN[k].map(n=>{const [nm,kc]=n.split('|'),c=byName[nm]||[];return kc?c.find(i=>DB.foods[i][2]==kc):c[0]}).filter(i=>i!=null)}
  const fz=fuzzSet(vs,DB.vocab),pins=DB.pin[vs[0].t.join(' ')]||[],hits=[];
  for(let i=0;i<DB.ix.length;i++){const s=bestScore(DB.ix[i],vs,fz);if(s!=null)hits.push([s+DB.ix[i].w.length*0.05,i])}
  pins.forEach((i,n)=>hits.push([-100+n,i]));
  const seen=new Set();return hits.sort((a,b)=>a[0]-b[0]).filter(h=>{const r=DB.foods[h[1]],k=r[0].toLowerCase()+'|'+r[2];if(seen.has(k))return false;seen.add(k);return true}).slice(0,limit).map(h=>h[1])}
/* the same matcher for your own foods and drinks (names are short, so typos are allowed) */
const nameScore=(name,vs)=>{const ix=indexName(name);return bestScore(ix,vs,fuzzSet(vs,ix.w))};
function dbForm(i){const [name,cat,kcal,p,c,f,usda]=DB.foods[i];let unit=isOz()?'oz':'g';
  modal(`<form id="dbf"><h3>${esc(name)}</h3>
    <p class="help">${esc(DB.cats[cat])} · ${usda?'USDA FoodData Central':'TempoLife'} · per 100 g: ${kcal} cal, ${p}g P, ${c}g C, ${f}g F</p>
    ${(()=>{const w=allergenInfo(null,name);return flagged(w)?`<div class="warnbox"><b>⚠ ${esc(warnText(w))}.</b> Database entries have no ingredient list, so this is based on the name only. Check the package or ask.</div>`:((S.settings.allergens||[]).length?'<div class="warnbox">No allergen words in the name. That does not mean it is free of your allergens: database entries have no ingredient list.</div>':'')})()}
    <div class="row"><div style="grid-column:span 2"><label class="f" for="amt">How much</label><input type="number" inputmode="decimal" id="amt" name="amt" min="0" step="any" required autofocus></div>
    <div><label class="f" for="au">Unit</label><select id="au" name="unit"><option value="g">grams</option><option value="oz">oz</option></select></div></div>
    <div class="amts" id="amts"></div><div class="sum num" id="dsum"></div>
    <label class="check"><input type="checkbox" name="keep"> Save to my foods with this amount</label>
    <div class="actions"><span class="sp"></span><button type="button" class="btn" data-x>Cancel</button><button class="btn primary">Log it</button></div></form>`,sh=>{
    const amt=sh.querySelector('#amt'),au=sh.querySelector('#au'),box=sh.querySelector('#amts'),sum=sh.querySelector('#dsum');
    const grams=()=>au.value==='oz'?num(amt.value)*28.3495:num(amt.value);
    const calc=()=>{const g=grams()/100;sum.innerHTML=`<b>${fmt(kcal*g)} cal</b> · ${r1(p*g)}g P · ${r1(c*g)}g C · ${r1(f*g)}g F <span style="color:var(--muted)">(${fmt(grams())} g)</span>`};
    const chips=()=>{const list=au.value==='oz'?[1,2,3,4,6,8]:[30,50,100,150,200,250];box.innerHTML=list.map(v=>`<button type="button" data-amt="${v}">${v} ${au.value}</button>`).join('')};
    au.value=unit;amt.value=unit==='oz'?4:100;chips();calc();
    amt.oninput=calc;au.onchange=()=>{const g=grams();amt.value=au.value==='oz'?r1(g/28.3495):r0(g);chips();calc()};
    box.onclick=e=>{const v=e.target.dataset.amt;if(v){amt.value=v;calc()}};
    sh.querySelector('#dbf').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),g=grams()/100;if(g<=0)return;
      const it={name,serving:`${r1(num(amt.value))} ${au.value}`,kcal:r1(kcal*g),p:r1(p*g),c:r1(c*g),f:r1(f*g)};
      if(fd.get('keep')){it.id=uid();it.type='food';it.fav=true;it.uses=0;S.foods.push(it)}
      closeModal();addEntries([mkEntry(it,'food')],'Logged '+name)}})}

/* ---------- brand search: Open Food Facts (ODbL, openfoodfacts.org) ----------
   Runs only when the user taps "Search brands online"; sends just the typed words.
   OFF allows about 10 searches a minute per person, so we stop at 9 and say so kindly. */
const OFF_FIELDS='code,product_name,product_name_en,generic_name,brands,quantity,serving_size,serving_quantity,serving_quantity_unit,nutriments,categories_tags';
const OFF_ALIAS={pbr:'pabst blue ribbon',bud:'budweiser','bud light':'bud light',stouffers:"stouffer's",'stouffer s':"stouffer's",'mac n cheese':'macaroni cheese',oreos:'oreo'};
const OFF_MAX=9,offCache=new Map();let offTimes=[];
const offQuery=q=>{const k=q.toLowerCase().trim().replace(/\s+/g,' ');return OFF_ALIAS[k]||k};
const offWait=()=>{const now=Date.now();offTimes=offTimes.filter(t=>now-t<6e4);return offTimes.length<OFF_MAX?0:Math.ceil((offTimes[0]+6e4-now)/1000)};
function offFetch(url,ms=12000){const ac=typeof AbortController!=='undefined'?new AbortController():null,tm=ac&&setTimeout(()=>ac.abort(),ms);
  return fetch(url,{signal:ac&&ac.signal,credentials:'omit',referrerPolicy:'no-referrer'}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).finally(()=>tm&&clearTimeout(tm))}
function offSearch(q){const k=offQuery(q),hit=offCache.get(k);if(hit&&Date.now()-hit.t<15*6e4)return Promise.resolve(hit.items);
  offTimes.push(Date.now());const e=encodeURIComponent(k);
  return offFetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${e}&search_simple=1&action=process&json=1&page_size=30&sort_by=unique_scans_n&fields=${OFF_FIELDS}`)
    .then(j=>j.products||[])
    .catch(()=>offFetch(`https://search.openfoodfacts.org/search?q=${e}&page_size=30&fields=${OFF_FIELDS}`).then(j=>j.hits||j.products||[]))
    .then(list=>{const seen=new Set(),items=list.map(offParse).filter(x=>{if(!x)return false;const key=x.name.toLowerCase()+'|'+r0(x.k100||x.kS);if(seen.has(key))return false;seen.add(key);return true}).slice(0,20);
      offCache.set(k,{t:Date.now(),items});return items})}
const txt1=v=>(Array.isArray(v)?v.join(', '):typeof v==='string'?v:isObj(v)?(v.en||Object.values(v)[0]||''):'').trim();
function offParse(p){if(!isObj(p))return null;const n=isObj(p.nutriments)?p.nutriments:{};
  let name=txt1(p.product_name_en)||txt1(p.product_name)||txt1(p.generic_name);if(!name)return null;
  const brand=txt1(p.brands).split(',')[0].trim();if(brand&&!name.toLowerCase().includes(brand.toLowerCase()))name=brand+' '+name;name=name.slice(0,120);
  const sq=num(p.serving_quantity),su=String(p.serving_quantity_unit||'').toLowerCase(),cats=Array.isArray(p.categories_tags)?p.categories_tags:[];
  const v=(k,suf)=>{const x=n[k+suf];return x==null||x===''?null:num(x)};
  let k100=v('energy-kcal','_100g');if(k100==null&&v('energy','_100g')!=null)k100=v('energy','_100g')/4.184;
  let kS=v('energy-kcal','_serving');if(kS==null&&v('energy','_serving')!=null)kS=v('energy','_serving')/4.184;
  if(k100==null&&kS!=null&&sq>0)k100=kS/sq*100;if(kS==null&&k100!=null&&sq>0)kS=k100*sq/100;
  if(k100==null&&kS==null)return null;
  const mac=(k)=>{let a=v(k,'_100g'),b=v(k,'_serving');if(a==null&&b!=null&&sq>0)a=b/sq*100;if(b==null&&a!=null&&sq>0)b=a*sq/100;return[a||0,b||0]};
  const [p100,pS]=mac('proteins'),[c100,cS]=mac('carbohydrates'),[f100,fS]=mac('fat');
  const qty=txt1(p.quantity).toLowerCase(),alcCat=cats.includes('en:alcoholic-beverages');
  const drink=cats.includes('en:beverages')||alcCat||su==='ml'||/\d\s*(ml|cl|l|fl\.?\s*oz)\b/.test(qty);
  let abv=num(n.alcohol_100g??n.alcohol??0);if(abv>95)abv=0;
  const alc=abv>0||alcCat||(/\b(beer|lager|wine|vodka|whiske?y|bourbon|tequila|liqueur|hard cider|hard seltzer|ipa|stout)\b/i.test(name)&&!/root beer|ginger beer|birch beer|non.?alcoholic|alcohol.?free|0\.0/i.test(name));
  let caf=num(n.caffeine_100g);caf=caf>0?(caf<1?caf*1000:caf):0;   /* OFF stores caffeine in g; a few entries are already in mg */
  return{code:String(p.code||''),name,serving:txt1(p.serving_size).slice(0,60),sq:sq>0?sq:0,su,k100,kS,p100,c100,f100,pS,cS,fS,drink,alc,abv:alc&&!abv?5:abv,caf}}
const offVisible=x=>(alcOn()||!x.alc)&&!(S.settings.hideAllergens&&flagged(allergenInfo(null,x.name)));
function offMeta(x){const per=x.drink?'100 ml':'100 g';return x.k100!=null?`${fmt(x.k100)} cal · ${r1(x.p100)}g P per ${per}`:`${fmt(x.kS)} cal per serving`}
function offForm(x){const unitsF=[...(x.sq||x.k100==null?[['srv','servings']]:[]),...(x.k100!=null?[['g','grams'],['oz','oz']]:[])];
  const link=x.code?`<a href="https://world.openfoodfacts.org/product/${encodeURIComponent(x.code)}" target="_blank" rel="noopener noreferrer">Open Food Facts${EXT}</a>`:'Open Food Facts';
  const w=allergenInfo(null,x.name);
  modal(`<form id="offf"><h3>${esc(x.name)}</h3>
    <p class="help">From ${link}, where volunteers add products. Check it against the label and fix anything that's off below.${x.serving?' Serving on the label: '+esc(x.serving)+'.':''}</p>
    ${flagged(w)?`<div class="warnbox"><b>⚠ ${esc(warnText(w))}.</b> Based on the name only. Check the package.</div>`:''}
    <div class="row"><div style="grid-column:span 2"><label class="f" for="amt">How much</label><input type="number" inputmode="decimal" id="amt" name="amt" min="0" step="any" required autofocus></div>
    <div><label class="f" for="au">Unit</label><select id="au" name="unit">${x.drink&&x.k100!=null?`<option value="ml">ml</option><option value="floz">fl oz</option>`:''}${x.drink&&x.k100!=null?'':unitsF.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}${x.drink&&x.sq?'<option value="srv">servings</option>':''}</select></div></div>
    <div class="amts" id="amts"></div><div class="sum num" id="dsum"></div>
    <details class="qa" id="offEd"><summary>Edit name or numbers</summary>
      <label class="f" for="on">Name</label><input type="text" id="on" name="oname" value="${esc(x.name)}" maxlength="120">
      <div class="row"><div><label class="f" for="ok2">Calories</label><input type="number" inputmode="decimal" id="ok2" data-ed="kcal" min="0" step="any"></div>
      <div><label class="f" for="op">Protein g</label><input type="number" inputmode="decimal" id="op" data-ed="p" min="0" step="any"></div>
      <div><label class="f" for="oc">Carbs g</label><input type="number" inputmode="decimal" id="oc" data-ed="c" min="0" step="any"></div>
      <div><label class="f" for="of">Fat g</label><input type="number" inputmode="decimal" id="of" data-ed="f" min="0" step="any"></div></div>
      <p class="help" id="edNote">For the amount above. Change the amount and these scale with it.</p></details>
    <label class="check"><input type="checkbox" name="keep" checked> <span id="keepLbl">Save to my ${x.drink?'drinks':'foods'} so it's instant next time</span></label>
    <div class="actions"><span class="sp"></span><button type="button" class="btn" data-x>Cancel</button><button class="btn primary">Log it</button></div></form>`,sh=>{
    const amt=sh.querySelector('#amt'),au=sh.querySelector('#au'),box=sh.querySelector('#amts'),sum=sh.querySelector('#dsum');
    /* base = grams or ml; servings use the label serving size, or the per-serving numbers when that is all we have */
    const base=()=>{const a=num(amt.value);return au.value==='oz'?a*28.3495:au.value==='floz'?a*ML_OZ:au.value==='srv'?(x.sq?a*x.sq:0):a};
    const vals=()=>{if(au.value==='srv'&&!x.sq){const a=num(amt.value);return{kcal:x.kS*a,p:x.pS*a,c:x.cS*a,f:x.fS*a}}
      const g=base()/100;return{kcal:x.k100*g,p:x.p100*g,c:x.c100*g,f:x.f100*g}};
    /* edits: user-typed values for the current amount; they scale when the amount changes */
    let ed=null,edBase=0;const edIn=[...sh.querySelectorAll('[data-ed]')],nameIn=sh.querySelector('#on'),keepLbl=sh.querySelector('#keepLbl');
    const markEdited=()=>{keepLbl.textContent=`Save as my own ${x.drink?'drink':'food'} (with your changes)`};
    const amtNow=()=>num(amt.value)||0;
    const raw=vals;const valsE=()=>{if(!ed)return raw();const k=edBase>0?amtNow()/edBase:1;return{kcal:ed.kcal*k,p:ed.p*k,c:ed.c*k,f:ed.f*k}};
    const fillEd=()=>{const o=valsE();edIn.forEach(i=>{if(document.activeElement!==i)i.value=r1(o[i.dataset.ed])})};
    edIn.forEach(i=>i.oninput=()=>{if(!ed){ed=raw();}edBase=amtNow();edIn.forEach(j=>{ed[j.dataset.ed]=num(j.value)});markEdited();calc()});
    nameIn.oninput=markEdited;
    const calc=()=>{const o=valsE();fillEd();sum.innerHTML=`<b>${fmt(o.kcal)} cal</b> · ${r1(o.p)}g P · ${r1(o.c)}g C · ${r1(o.f)}g F`+(base()?` <span style="color:var(--muted)">(${fmt(base())} ${x.drink?'ml':'g'})</span>`:'')+(x.drink&&x.abv&&alcOn()?` · ${r1(x.abv)}% alcohol`:'')};
    const chips=()=>{const u=au.value,list=u==='srv'?[0.5,1,1.5,2]:u==='oz'?[1,2,3,4,6,8]:u==='floz'?[8,12,16,20]:u==='ml'?[250,330,355,500]:[30,50,100,150,200,250];
      box.innerHTML=list.map(v=>`<button type="button" data-amt="${v}">${v} ${u==='srv'?'serv.':u==='floz'?'fl oz':u}</button>`).join('')};
    const start=()=>{const u=au.value;amt.value=u==='srv'?1:u==='ml'?(x.sq&&x.su==='ml'?r0(x.sq):355):u==='floz'?(x.sq&&x.su==='ml'?r1(x.sq/ML_OZ):12):u==='oz'?4:(x.sq&&x.su!=='ml'?r0(x.sq):100)};
    if(x.drink&&x.k100!=null)au.value=isOz()?'floz':'ml';else if(x.sq)au.value='srv';else if(x.k100!=null)au.value=isOz()?'oz':'g';
    start();chips();calc();
    amt.oninput=calc;au.onchange=()=>{if(ed){const k=edBase>0?amtNow()/edBase:1;const o={kcal:ed.kcal*k,p:ed.p*k,c:ed.c*k,f:ed.f*k},rb=raw();start();const nb=raw();
        /* keep the user's correction as a ratio to the label numbers so it survives a unit change */
        ed={kcal:rb.kcal?nb.kcal*o.kcal/rb.kcal:o.kcal,p:rb.p?nb.p*o.p/rb.p:o.p,c:rb.c?nb.c*o.c/rb.c:o.c,f:rb.f?nb.f*o.f/rb.f:o.f};edBase=amtNow()}else start();chips();calc()};
    box.onclick=e=>{const v=e.target.dataset.amt;if(v){amt.value=v;calc()}};
    sh.querySelector('#offf').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),o=valsE(),nm=(nameIn.value.trim()||x.name).slice(0,120);if(!(num(amt.value)>0))return;
      const label=au.value==='srv'?`${r1(num(amt.value))} serving${num(amt.value)===1?'':'s'}`+(x.serving?` (${x.serving})`:''):`${r1(num(amt.value))} ${au.value==='floz'?'fl oz':au.value}`;
      let it,kind;
      if(x.drink){kind='drink';const ml=r0(base()||(x.sq||355));
        it={name:nm,ml,kcal:r1(o.kcal),p:r1(o.p),c:r1(o.c),f:r1(o.f),caf:r0(x.caf*ml/100),hyd:x.abv>5?0:100,abv:alcOn()?r1(x.abv):0,src:'est'};it.alc=stdDrinks(it.ml,it.abv)}
      else{kind='food';it={name:nm,serving:label.slice(0,80),kcal:r1(o.kcal),p:r1(o.p),c:r1(o.c),f:r1(o.f)}}
      if(fd.get('keep')){it.id=uid();it.fav=true;it.uses=0;if(kind==='food'){it.type='food';S.foods.push(it)}else S.drinks.push(it)}
      closeModal();addEntries([mkEntry(it,kind)],'Logged '+nm+(fd.get('keep')?' and saved it':''))}})}

/* ---------- allergies & intolerances ----------
   Matching is by food NAME only (the database has no ingredient lists), so it flags "may contain".
   Tags the user sets on their own foods count as confirmed. No warning never means safe. */
const WHEAT='wheat|flour|bread|breads|breaded|breading|bun|buns|bagel|bagels|pasta|spaghetti|macaroni|noodle|noodles|lasagna|ravioli|couscous|semolina|bulgur|farro|spelt|durum|seitan|cracker|crackers|croissant|croissants|muffin|muffins|pancake|pancakes|waffle|waffles|pizza|cake|cakes|cookie|cookies|biscuit|biscuits|pastry|pastries|pretzel|pretzels|doughnut|doughnuts|donut|donuts|pie|pies|crust|crouton|croutons|tortilla|tortillas|batter|dumpling|dumplings|pita|naan|brioche|graham|orzo|udon|ramen|sandwich|burger|hamburger|cheeseburger|soy sauce|teriyaki';
const WHEAT_X='corn tortilla|corn tortillas|rice noodle|rice noodles|rice flour|corn flour|almond flour|coconut flour|gluten-free|gluten free|rice cake|rice cakes|rice cracker|rice crackers|wheat-free|wheat free';
const DAIRY='milk|milks|cheese|cheeses|butter|cream|creamer|yogurt|yoghurt|whey|casein|ghee|custard|kefir|latte|cappuccino|mozzarella|cheddar|parmesan|ricotta|brie|feta|gouda|provolone|alfredo|pudding|queso|paneer|gelato|cheeseburger';
const DAIRY_X='peanut butter|almond butter|cashew butter|nut butter|cocoa butter|apple butter|coconut milk|coconut cream|almond milk|soy milk|soymilk|oat milk|rice milk|cashew milk|cream of tartar|non-dairy|nondairy|dairy-free|dairy free|milk-free';
const ALLERGENS={
  milk:['Milk',DAIRY,DAIRY_X], lactose:['Lactose',DAIRY,DAIRY_X+'|lactose-free|lactose free'],
  egg:['Eggs','egg|eggs|mayonnaise|mayo|meringue|custard|omelet|omelette|quiche|frittata|eggnog|aioli|hollandaise','egg-free|eggless|egg free|eggplant'],
  fish:['Fish','fish|salmon|tuna|cod|tilapia|trout|halibut|haddock|anchovy|anchovies|sardine|sardines|mackerel|pollock|catfish|bass|herring|mahi|swordfish|flounder|sole|perch|snapper|caviar|roe|surimi','shellfish'],
  shellfish:['Shellfish','shrimp|prawn|prawns|crab|crabs|lobster|crayfish|crawfish|langostino|clam|clams|oyster|oysters|mussel|mussels|scallop|scallops|squid|calamari|octopus|shellfish|surimi','crab apple|crabapple'],
  treenut:['Tree nuts','almond|almonds|cashew|cashews|walnut|walnuts|pecan|pecans|pistachio|pistachios|hazelnut|hazelnuts|filbert|filberts|macadamia|macadamias|brazilnut|brazilnuts|pine nut|pine nuts|pinenut|pinenuts|chestnut|chestnuts|praline|marzipan|nutella|nougat|nut|nuts|pesto|gianduja','water chestnut|water chestnuts|nutmeg|coconut|peanut|peanuts|doughnut|doughnuts'],
  peanut:['Peanuts','peanut|peanuts|groundnut|groundnuts|satay',''],
  wheat:['Wheat',WHEAT,WHEAT_X],
  gluten:['Gluten',WHEAT+'|barley|rye|malt|malted|beer|ale|lager|ipa|stout|porter|triticale',WHEAT_X+'|ginger ale'],
  soy:['Soy','soy|soya|soybean|soybeans|tofu|edamame|tempeh|miso|natto|soymilk|teriyaki|tamari',''],
  sesame:['Sesame','sesame|tahini|hummus|halva|halvah|benne','']};
const DIET_GROUPS={
  meat:['Meat or gelatin','beef|pork|chicken|turkey|lamb|mutton|veal|venison|bison|duck|goose|bacon|ham|sausage|sausages|steak|pepperoni|salami|prosciutto|chorizo|jerky|meatball|meatballs|meatloaf|hot dog|hotdog|frankfurter|bratwurst|gelatin|lard|pastrami|brisket|ribs|liver|broiler|broilers|fryers|poultry|gyro|carnitas|burger|hamburger|cheeseburger|bologna|kielbasa|pate|pot roast|roast beef|wings|nuggets','hamburger bun|hamburger buns|hot dog bun|hot dog buns|veggie burger|veggie burgers|plant-based|plant based|meatless|vegan|vegetarian|beyond meat|impossible burger|soy burger|black bean burger|bean burger|mushroom burger|chicken of the woods|turkey tail|hen of the woods|eggplant'],
  honey:['Honey','honey|beeswax','']};
const DIETS={vegetarian:['Vegetarian',['meat','fish','shellfish']],vegan:['Vegan',['meat','fish','shellfish','milk','egg','honey']],pescatarian:['Pescatarian',['meat']],dairyfree:['Dairy-free',['milk']],glutenfree:['Gluten-free',['gluten']]};
const STYLES={'':['No preference',''],lowcarb:['Low-carb','Under 26% of calories from carbs (under 130 g a day).'],keto:['Keto','Under 10% of calories from carbs, about 20–50 g a day.'],highprotein:['High-protein','40% protein for training or cutting.']};
const ALL_GROUPS={...ALLERGENS,...DIET_GROUPS};
const activeKeys=()=>{const set=new Set(S.settings.allergens||[]);(S.settings.diet||[]).forEach(d=>(DIETS[d]?DIETS[d][1]:[]).forEach(k=>set.add(k)));return[...set]};
const ALG_RE={};Object.entries(ALL_GROUPS).forEach(([k,[,w,x]])=>{ALG_RE[k]=[new RegExp('\\b('+w+')\\b','i'),x?new RegExp('\\b('+x+')\\b','gi'):null]});
function nameHits(name,keys){const n=String(name||'').toLowerCase(),out=[];
  keys.forEach(k=>{const re=ALG_RE[k];if(!re)return;const t=re[1]?n.replace(re[1],' '):n;if(re[0].test(t))out.push(k)});
  (S.settings.avoidWords||'').split(',').map(w=>w.trim().toLowerCase()).filter(Boolean).forEach(w=>{if(n.includes(w))out.push('word:'+w)});
  return out}
const algLabel=k=>k.startsWith('word:')?k.slice(5):ALL_GROUPS[k][0];
function allergenInfo(it,nameOnly){const sel=activeKeys();if(!sel.length&&!(S.settings.avoidWords||'').trim())return{yes:[],maybe:[]};
  if(nameOnly)return{yes:[],maybe:nameHits(nameOnly,sel)};
  const yes=new Set((it.allergens||[]).filter(k=>sel.includes(k))),maybe=new Set();
  if(it.recipe)(it.recipe.items||[]).forEach(x=>{const src=x.ref&&findItem(x.ref);if(src){const i=allergenInfo(src);i.yes.forEach(k=>yes.add(k));i.maybe.forEach(k=>maybe.add(k))}else nameHits(x.name,sel).forEach(k=>maybe.add(k))});
  if(!it.verified)nameHits(it.name,sel).forEach(k=>maybe.add(k));
  yes.forEach(k=>maybe.delete(k));return{yes:[...yes],maybe:[...maybe]}}
const flagged=i=>i.yes.length+i.maybe.length>0;
function warnText(i){const a=[];if(i.yes.length)a.push('Contains '+i.yes.map(algLabel).join(', '));if(i.maybe.length)a.push('May contain '+i.maybe.map(algLabel).join(', ')+' (name match)');return a.join(' · ')}
const warnSpan=i=>flagged(i)?`<div class="warn" style="font-size:12px">⚠ ${esc(warnText(i))}</div>`:'';
const entryInfo=e=>{const src=e.ref&&findItem(e.ref);return src?allergenInfo(src):allergenInfo(null,e.name)};
function tagBlock(it){const t=it.allergens||[];return`<label class="f">Contains (from the label)</label><div class="tagchks">${Object.entries(ALL_GROUPS).filter(([k])=>k!=='lactose').map(([k,[l]])=>`<label><input type="checkbox" name="alg" value="${k}" ${t.includes(k)?'checked':''}> ${l}</label>`).join('')}</div>
  <label class="check"><input type="checkbox" name="verified" ${it.verified?'checked':''}> I checked the label: ignore name-based warnings for this item</label>`}
const readTags=fd=>({allergens:fd.getAll('alg'),verified:!!fd.get('verified')});

/* ---------- fasting ---------- */
function calTimes(){const out=[],from=shift(todayKey(),-35),now=Date.now();
  Object.keys(S.log).forEach(k=>{if(k<from)return;S.log[k].forEach(e=>{if(e.kcal*e.qty>10&&e.t<=now)out.push(e.t)})});return out.sort((a,b)=>a-b)}
const dur=ms=>{const m=Math.max(0,Math.floor(ms/6e4));return Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'m'};
const clockDay=t=>(dk(new Date(t))===todayKey()?'':new Date(t).toLocaleDateString(undefined,{weekday:'short'})+' ')+clock(t);
const hm=v=>{const [h,m]=String(v).split(':').map(Number);return h*60+(m||0)};
const FAST_PRESETS=[12,13,14,16,18,20],fh=h=>String(Math.round(h*100)/100);
const addHM=(v,min)=>{const t=((hm(v)+min)%1440+1440)%1440;return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0')};
const hmText=m=>{const d=new Date();d.setHours(Math.floor(m/60)%24,m%60,0,0);return clock(d.getTime())};
function windowLine(){const s=S.settings;if(!s.winStart||!s.winEnd)return'';const d=new Date(),now=d.getHours()*60+d.getMinutes(),a=hm(s.winStart),b=hm(s.winEnd);
  const open=a<b?now>=a&&now<b:now>=a||now<b,until=m=>((m-now)%1440+1440)%1440;
  return`<div class="hydsub num" style="margin-top:8px">Eating window ${hmText(a)}–${hmText(b)} · ${open?`open, closes in ${dur(until(b)*6e4)}`:`opens in ${dur(until(a)*6e4)}`}</div>`}
function fastSection(){const s=S.settings;if(!s.fasting)return'';const ts=calTimes(),last=ts[ts.length-1],goal=s.fastGoal*36e5,now=Date.now();
  const body=!last?'<p class="empty" style="margin:0">Log a meal and the timer starts from your last bite.</p>'
    :`<div class="bignum num" style="color:var(--accent)">${dur(now-last)}</div><div class="hydsub num">since you last ate (${clockDay(last)}) · ${fh(s.fastGoal)}h goal ${now-last>=goal?'reached':'at '+clockDay(last+goal)}</div>
      <div class="bar" style="height:12px"><i style="width:${r1(Math.min(100,(now-last)/goal*100))}%;background:var(--accent)" class="cu-bar"></i></div>`;
  return`<section class="card span2" id="fastcard" aria-label="Fasting"><h2><span>Fasting</span><span class="num">${fh(s.fastGoal)}:${fh(24-s.fastGoal)}</span></h2>${body}${windowLine()}
    <p class="note">Anything under 10 calories (water, black coffee, plain tea) doesn't end a fast. Edit an entry's time if you log late.</p></section>`}
function fastsBetween(from,to){const ts=calTimes(),out=[];for(let i=1;i<ts.length;i++){const g=ts[i]-ts[i-1];if(g>=12*36e5&&ts[i]>=from&&ts[i]<=to)out.push([ts[i-1],ts[i]])}return out.reverse()}

/* ---------- personalized targets ----------
   Formula, activity levels, paces, body-type splits, silhouettes and quiz adapted from mealprep.mcbflow.com (same app family). */
const LB_KG=0.45359237;
const ACTIVITY=[[1.2,'Sedentary','Desk job, little or no exercise'],[1.375,'Lightly active','Light exercise 1–3 days a week'],[1.55,'Moderately active','Exercise 3–5 days a week'],[1.725,'Very active','Hard exercise 6–7 days a week'],[1.9,'Extremely active','Physical job plus hard training']];
const PACES={
  imperial:{lose:[[-2,'Aggressive, 2 lb / week'],[-1.5,'Fast, 1.5 lb / week'],[-1,'Standard, 1 lb / week'],[-0.5,'Gentle, 0.5 lb / week']].map(([lb,l])=>[lb*LB_KG,l]),
    gain:[[0.25,'Lean gain, 0.25 lb / week'],[0.5,'Steady, 0.5 lb / week'],[1,'Aggressive, 1 lb / week']].map(([lb,l])=>[lb*LB_KG,l]),defaults:{lose:-1*LB_KG,gain:0.5*LB_KG,maintain:0}},
  metric:{lose:[[-1,'Aggressive, 1 kg / week'],[-0.75,'Fast, 0.75 kg / week'],[-0.5,'Standard, 0.5 kg / week'],[-0.25,'Gentle, 0.25 kg / week']],
    gain:[[0.1,'Lean gain, 0.1 kg / week'],[0.25,'Steady, 0.25 kg / week'],[0.5,'Aggressive, 0.5 kg / week']],defaults:{lose:-0.5,gain:0.25,maintain:0}}};
const BODY_TYPES={
  ectomorph:{label:'Ectomorph',pct:{c:55,f:20,p:25},blurb:'Lean, narrow frame; fast metabolism; gains weight slowly.'},
  mesomorph:{label:'Mesomorph',pct:{c:40,f:30,p:30},blurb:'Athletic, broad-shouldered; gains muscle and loses fat fairly easily.'},
  endomorph:{label:'Endomorph',pct:{c:25,f:40,p:35},blurb:'Rounder, softer build; gains weight easily; slower metabolism.'}};
const STYLE_SPLITS={lowcarb:{c:20,f:50,p:30},keto:{c:5,f:75,p:20},highprotein:{c:35,f:25,p:40}};
const QUIZ=[
  {q:'How would you describe your frame?',a:[['ectomorph','Slim: narrow shoulders, small wrists'],['mesomorph','Athletic: broad shoulders, medium bone structure'],['endomorph','Wide: broad hips, larger bone structure']]},
  {q:'What happens when you eat more than usual for a few weeks?',a:[['ectomorph','Almost nothing, and I struggle to gain'],['mesomorph','I gain a little, mostly muscle if I train'],['endomorph','I gain weight (and fat) quickly']]},
  {q:'How quickly do you build muscle when you train?',a:[['ectomorph','Slowly, and I have to work hard for it'],['mesomorph','Fairly quickly'],['endomorph','Steadily, but it is easy to stay softer']]},
  {q:'Which best matches your natural energy and appetite?',a:[['ectomorph','Fast metabolism, always hungry, restless'],['mesomorph','Balanced and steady'],['endomorph','Slower metabolism, energy dips after big carb meals']]}];
function bodySVG(kind){const P={ectomorph:{S:15,C:13,W:11,H:12,a:5,l:8},mesomorph:{S:25,C:21,W:14,H:15,a:9,l:12},endomorph:{S:21,C:22,W:25,H:23,a:9,l:14},custom:{S:20,C:18,W:16,H:17,a:7,l:10}}[kind]||{S:20,C:18,W:16,H:17,a:7,l:10};
  const cx=50,{S:Sh,C,W,H,a,l}=P;
  const torso=`M${cx-5},30 L${cx-Sh},42 L${cx-C},60 L${cx-W},86 L${cx-H},106 L${cx},112 L${cx+H},106 L${cx+W},86 L${cx+C},60 L${cx+Sh},42 L${cx+5},30 Z`;
  const arm=d=>`<line x1="${cx+d*(Sh-a/2+1)}" y1="44" x2="${cx+d*(Sh+5)}" y2="106" stroke-width="${a}"/>`,leg=d=>`<line x1="${cx+d*H*0.5}" y1="108" x2="${cx+d*(H*0.5+3)}" y2="186" stroke-width="${l}"/>`;
  return`<svg class="body" viewBox="0 0 100 196" aria-hidden="true"><g fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="50" cy="16" r="11" stroke="none"/><path d="${torso}" stroke-width="4"/>${arm(-1)}${arm(1)}${leg(-1)}${leg(1)}</g></svg>`}
const splitLegend=p=>`<span class="split num">${[['p','Protein','var(--mp-t)'],['c','Carbs','var(--mc-t)'],['f','Fat','var(--mf-t)']].map(([k,l,col])=>`<span><b style="color:${col}">${p[k]}%</b><em>${l}</em></span>`).join('')}</span>`;
const mbar=p=>`<div class="mbar" aria-hidden="true"><i style="width:${p.p}%;background:var(--mp)"></i><i style="width:${p.c}%;background:var(--mc)"></i><i style="width:${p.f}%;background:var(--mf)"></i></div>`;
const unitSys=()=>isOz()?'imperial':'metric';
function prof(){const s=S.settings,p=s.profile||(s.profile={});
  if(typeof p.activity==='string')p.activity={sed:1.2,light:1.375,mod:1.55,very:1.725,extra:1.9}[p.activity]||1.375;
  if(p.goal==='lose1'){p.goal='lose';p.rateKgWk=-1*LB_KG}else if(p.goal==='lose05'){p.goal='lose';p.rateKgWk=-0.5*LB_KG}else if(p.goal==='gain05'){p.goal='gain';p.rateKgWk=0.5*LB_KG}
  if(!['lose','maintain','gain'].includes(p.goal))p.goal='maintain';
  if(!(p.activity>=1&&p.activity<=2.5))p.activity=1.375;if(p.rateKgWk==null)p.rateKgWk=0;
  if(!['mifflin','katch'].includes(p.formula))p.formula='mifflin';
  if(!p.bodyType)p.bodyType='mesomorph';if(!p.pct)p.pct={...BODY_TYPES.mesomorph.pct};
  return p}
function closestPace(kg,goal){const list=PACES[unitSys()][goal]||[];if(!list.length)return 0;return list.reduce((b,x)=>Math.abs(x[0]-kg)<Math.abs(b[0]-kg)?x:b)[0]}
function calcBMR(){const s=S.settings,p=prof();if(p.formula==='katch'&&p.bodyFat>0)return 370+21.6*s.weightKg*(1-p.bodyFat/100);
  return 10*s.weightKg+6.25*p.heightCm-5*p.age+(s.sex==='m'?5:s.sex==='f'?-161:-78)}
function healthIssue(){const s=S.settings,p=prof();if(!(p.age&&p.heightCm&&s.weightKg))return'';
  if(p.age<18)return'This calculator is for adults 18 and over, so it will not give targets for a younger person. A doctor or registered dietitian can build a safe plan.';
  if(p.age>110||p.heightCm<100||p.heightCm>250||s.weightKg<30||s.weightKg>320)return'One of these numbers looks out of range (age 18 to 110, height 100 to 250 cm, weight 30 to 320 kg). Check the units and try again.';
  return''}
function splitInfo(){const p=prof(),st=S.settings.style;
  if(st&&STYLE_SPLITS[st])return{pct:{...STYLE_SPLITS[st]},label:STYLES[st][0]+' eating style'};
  if(p.bodyType==='custom')return{pct:{...p.pct},label:'Custom split'};
  const b=BODY_TYPES[p.bodyType]||BODY_TYPES.mesomorph;return{pct:{...b.pct},label:b.label+' split'}}
function recommend(){const s=S.settings,p=prof();if(!(p.age&&p.heightCm&&s.weightKg))return null;const issue=healthIssue();if(issue)return{issue};
  const bmr=calcBMR(),tdee=bmr*p.activity,delta=(p.goal==='maintain'?0:p.rateKgWk)*1100,kcal=Math.round((tdee+delta)/10)*10;
  const {pct,label}=splitInfo(),sum=pct.c+pct.f+pct.p,grams={c:r0(kcal*pct.c/100/4),f:r0(kcal*pct.f/100/9),p:r0(kcal*pct.p/100/4)};
  const floor=s.sex==='f'?1200:s.sex==='m'?1500:1350,warnings=[],gPerKg=grams.p/s.weightKg;
  if(kcal<floor)warnings.push(`Your target (${fmt(kcal)} cal) is under the ${fmt(floor)} cal/day minimum usually advised without professional supervision. Consider a slower pace.`);
  else if(kcal<bmr-1)warnings.push(`Your target is below your estimated BMR (${fmt(bmr)} cal). A slower pace is easier to sustain.`);
  if(Math.abs(sum-100)>0.5)warnings.push(`Your macro percentages add up to ${r1(sum)}%, not 100%.`);
  if(p.formula==='katch'&&!(p.bodyFat>0))warnings.push('Katch-McArdle needs a body-fat %, so Mifflin-St Jeor is being used.');
  if(gPerKg<1.2&&p.activity>=1.55)warnings.push(`Protein works out to ${r1(gPerKg)} g per kg. Active people usually aim for 1.4–2.0 g/kg; the High-protein style or a Custom split raises it.`);
  let water=(s.sex==='m'?3000:s.sex==='f'?2200:2600)+({1.55:350,1.725:500,1.9:750}[p.activity]||0);if(isOz())water=Math.round(water/ML_OZ/8)*8*ML_OZ;
  return{bmr:r0(bmr),tdee:r0(tdee),delta:r0(delta),kcal,pct,label,grams,gPerKg,warnings,waterMl:r0(water),katch:p.formula==='katch'&&p.bodyFat>0}}
function recSheet(){const r=recommend();if(!r){toast('Fill in age, height and weight first');return}
  if(r.issue){modal(`<h3>Your recommended targets</h3><div class="warnbox">${esc(r.issue)}</div><div class="actions"><span class="sp"></span><button type="button" class="btn primary" data-x>OK</button></div>`);return}
  const dTxt=r.delta===0?'maintenance':(r.delta>0?'+':'−')+fmt(Math.abs(r.delta))+' cal a day for your goal';
  modal(`<h3>Your recommended targets</h3>
    <div class="recbox num"><div class="rec" style="margin:0"><b>${fmt(r.kcal)}</b><span>calories a day: BMR ${fmt(r.bmr)} × activity ${prof().activity} = ${fmt(r.tdee)} maintenance, ${dTxt}.</span></div>
      <table class="mtable"><thead><tr><th>${esc(r.label)}</th><th>Split</th><th>Grams</th><th>Cal</th></tr></thead><tbody>
      ${[['p','Protein','var(--mp)'],['c','Carbs','var(--mc)'],['f','Fat','var(--mf)']].map(([k,l,col])=>`<tr><td><span class="dot" style="display:inline-block;background:${col};margin-right:6px"></span>${l}</td><td>${r.pct[k]}%</td><td><b>${r.grams[k]} g</b></td><td>${fmt(r.kcal*r.pct[k]/100)}</td></tr>`).join('')}</tbody></table>
      <p class="help" style="margin-top:8px">Protein: ${r1(r.gPerKg)} g per kg (${Math.round(r.gPerKg*LB_KG*100)/100} g per lb) of body weight.</p></div>
    ${r.warnings.map(w=>`<div class="warnbox">${esc(w)}</div>`).join('')}
    <div class="rec num"><b>${fmtVol(r.waterMl)}</b><span>from drinks, based on the National Academies' adequate intake${prof().activity>=1.55?' plus an allowance for your activity (estimate)':''}.</span>
      <b>400 mg</b><span>caffeine guide (FDA figure for most adults).</span></div>
    <details class="qa"><summary>How is this calculated?</summary><p class="help">BMR (calories at rest) comes from the ${r.katch?'Katch-McArdle formula: 370 + 21.6 × lean mass in kg':'Mifflin-St Jeor formula: 10 × weight (kg) + 6.25 × height (cm) − 5 × age, plus 5 for male, minus 161 for female, or minus 78 for the average'}. Maintenance (TDEE) is BMR × your activity number. Your target adds or subtracts about 1,100 calories a day for each kg per week of change. Grams follow your split: protein and carbs at 4 calories per gram, fat at 9. These are population averages; real needs vary.</p></details>
    <p class="help">Estimates only, not medical advice. Ask a doctor or registered dietitian before changing your diet, especially if you are pregnant or nursing, have a medical condition, or have a history of disordered eating.</p>
    <div class="actions"><button type="button" class="link" data-act="sources">Sources</button><span class="sp"></span><button type="button" class="btn" data-x>Not now</button><button type="button" class="btn primary" id="apply">Use these targets</button></div>`,sh=>{
    sh.querySelector('#apply').onclick=()=>{const s=S.settings,old={kcal:s.kcal,p:s.p,c:s.c,f:s.f,waterMl:s.waterMl,cafLimit:s.cafLimit};
      Object.assign(s,{kcal:r.kcal,p:r.grams.p,c:r.grams.c,f:r.grams.f,waterMl:r.waterMl,cafLimit:400});save();closeModal();render();
      toast('Targets updated',()=>{Object.assign(S.settings,old);save();render()})}})}
let quiz=null;
function renderQuiz(){if(quiz.i>=QUIZ.length){const top=Object.entries(quiz.score).sort((a,b)=>b[1]-a[1])[0][0],b=BODY_TYPES[top];
    modal(`<h3>Your closest match: ${b.label}</h3><div style="display:flex;gap:14px;align-items:center"><div class="btype on" style="pointer-events:none">${bodySVG(top)}</div><div><p class="help">${b.blurb}</p><p class="help">Suggested split: <b>${b.pct.p}% protein, ${b.pct.c}% carbs, ${b.pct.f}% fat</b>.</p></div></div>
      <p class="help">Body types are coaching shorthand, not a medical measurement. Most people are a blend, so start here and fine-tune with Custom.</p>
      <div class="actions"><span class="sp"></span><button class="btn" data-x>Not now</button><button class="btn primary" data-act="quizApply" data-k="${top}">Use ${b.label}</button></div>`);return}
  const q=QUIZ[quiz.i];modal(`<p class="help">Question ${quiz.i+1} of ${QUIZ.length}</p><h3>${esc(q.q)}</h3><div class="radios">${q.a.map(([k,t])=>`<button class="radio" data-act="quizPick" data-k="${k}" style="border:0;text-align:left;font-weight:700">${esc(t)}</button>`).join('')}</div>
    <div class="actions"><span class="sp"></span><button class="btn" data-x>Cancel</button></div>`)}

/* ---------- supplements ---------- */
const SLOTS=[['am','Morning'],['mid','Midday'],['pm','Evening'],['bed','Bedtime']],WEEK=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const COMMON_SUPPS=['Multivitamin','Vitamin D3','Vitamin C','Vitamin B12','B complex','Fish oil (omega-3)','Magnesium','Calcium','Iron','Zinc','Potassium','Creatine','Probiotic','Fiber','Collagen','Melatonin','Electrolytes','Folic acid'];
const dow=key=>{const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d).getDay()};
function dueOn(key){const w=dow(key),out=[];(S.supps||[]).filter(x=>x.active!==false&&!(x.created&&key<x.created)&&(x.days||[0,1,2,3,4,5,6]).includes(w)).forEach(x=>(x.slots||['am']).forEach(sl=>out.push([x,sl])));
  return out.sort((a,b)=>SLOTS.findIndex(z=>z[0]===a[1])-SLOTS.findIndex(z=>z[0]===b[1]))}
const taken=(key,id,sl)=>((S.suppLog||{})[key]||{})[id+'|'+sl];
function suppSection(){if(!S.settings.supps)return'';const due=dueOn(cur);if(!due.length)return(S.supps||[]).length?'':`<section class="card span2" aria-label="Supplements"><h2><span>Supplements</span></h2><p class="empty" style="margin:0">Add the vitamins and supplements you take, with the times and days you take them, and check them off here.</p><div class="dayacts"><button class="btn sm" data-act="newSupp">+ Supplement</button></div></section>`;
  const n=due.filter(([x,sl])=>taken(cur,x.id,sl)).length;
  return`<section class="card span2" aria-label="Supplements"><h2><span>Supplements</span><span class="num">${n} of ${due.length} taken</span></h2>
    ${due.map(([x,sl])=>{const t=taken(cur,x.id,sl);return`<button class="supp ${t?'done':''}" data-act="supp" data-id="${x.id}" data-slot="${sl}" aria-pressed="${!!t}"><span class="box">${t?'✓':''}</span><span class="info-b"><div class="name">${esc(x.name)}</div><div class="meta">${esc(SLOTS.find(z=>z[0]===sl)[1])}${x.dose?' · '+esc(x.dose):''}${t?' · taken '+clock(t):''}</div></span></button>`}).join('')}</section>`}
function toggleSupp(id,sl){const L=S.suppLog||(S.suppLog={}),d=L[cur]||(L[cur]={}),k=id+'|'+sl;if(d[k])delete d[k];else d[k]=cur===todayKey()?Date.now():(()=>{const [y,m,dd]=cur.split('-').map(Number);return new Date(y,m-1,dd,12).getTime()})();save();render()}
function suppForm(id){const x=id?(S.supps||[]).find(z=>z.id===id):null,v=x||{name:'',dose:'',slots:['am'],days:[0,1,2,3,4,5,6],notes:'',active:true};
  modal(`<form id="sf"><h3>${x?'Edit supplement':'New supplement'}</h3>
    <label class="f" for="sn">Name</label><input type="text" id="sn" name="name" list="supplist" value="${esc(v.name)}" required autofocus placeholder="Vitamin D3"><datalist id="supplist">${COMMON_SUPPS.map(n=>`<option value="${n}">`).join('')}</datalist>
    <label class="f" for="sd">Dose (from your label)</label><input type="text" id="sd" name="dose" value="${esc(v.dose)}" placeholder="2,000 IU · 1 capsule">
    <label class="f">When</label><div class="tagchks">${SLOTS.map(([k,l])=>`<label><input type="checkbox" name="slot" value="${k}" ${v.slots.includes(k)?'checked':''}> ${l}</label>`).join('')}</div>
    <label class="f">Days</label><div class="tagchks">${WEEK.map((d,i)=>`<label><input type="checkbox" name="day" value="${i}" ${v.days.includes(i)?'checked':''}> ${d}</label>`).join('')}</div>
    <label class="f" for="snote">Notes</label><input type="text" id="snote" name="notes" value="${esc(v.notes||'')}" placeholder="Take with food">
    <label class="check"><input type="checkbox" name="active" ${v.active!==false?'checked':''}> Currently taking</label>
    <p class="ferr" id="sferr" tabindex="-1" role="alert" hidden></p><p class="help">This keeps track of what you take and when. It doesn't check doses or interactions with medicines; a pharmacist can.</p>
    <div class="actions">${x?'<button type="button" class="btn danger" id="del">Delete</button>':''}<span class="sp"></span><button type="button" class="btn" data-x>Cancel</button><button class="btn primary">Save</button></div></form>`,sh=>{
    sh.querySelector('#sf').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),slots=fd.getAll('slot'),days=fd.getAll('day').map(Number);
      if(!slots.length||!days.length){const er=sh.querySelector('#sferr');er.hidden=false;er.textContent=!slots.length?'Pick at least one time of day.':'Pick at least one day.';er.focus();return}
      const o={name:fv(fd,'name').trim(),dose:fv(fd,'dose').trim(),slots,days,notes:fv(fd,'notes').trim(),active:!!fd.get('active')};
      if(x)Object.assign(x,o);else(S.supps||(S.supps=[])).push({id:uid(),created:todayKey(),...o});save();closeModal();render();toast(x?'Saved changes':'Added '+o.name)};
    const d=sh.querySelector('#del');if(d)d.onclick=()=>{const arr=S.supps,i=arr.indexOf(x);arr.splice(i,1);save();closeModal();render();toast('Deleted '+x.name,()=>{arr.splice(i,0,x);save();render()})}})}

/* ---------- daily suggestions ---------- */
function tips(){const s=S.settings,t=totals(cur),out=[],h=new Date().getHours()+new Date().getMinutes()/60;
  const water=sorted(visDrinks()).find(d=>!isAlc(d)&&d.hyd>=100&&d.kcal<=5)||S.drinks.find(d=>d.id==='d_water');
  const logBtn=it=>it?`<button class="btn sm" data-act="log" data-id="${it.id}">+ ${esc(it.name)}</button>`:'';
  if(!(s.profile&&s.profile.age)&&!s.recDismissed)out.push(`<div class="tip"><span>Add your age, height and weight in Settings to get calorie, protein and water targets made for you.</span><button class="btn sm" data-act="tab" data-v="settings">Set up</button></div>`);
  const expected=s.waterMl*Math.min(1,Math.max(0,(h-7)/14));
  if(t.hyd<expected-s.waterMl*0.15)out.push(`<div class="tip"><span>You're about ${fmtVol(expected-t.hyd)} behind an even pace for this time of day.</span>${logBtn(water)}</div>`);
  const pLeft=s.p-t.p,kLeft=s.kcal-t.kcal;
  if(pLeft>=20&&kLeft>120&&h>=11){const pick=S.foods.filter(f=>f.p>=8&&f.kcal>0&&f.kcal<=kLeft&&!flagged(allergenInfo(f))).sort((a,b)=>b.p/b.kcal-a.p/a.kcal)[0];
    if(pick)out.push(`<div class="tip"><span>${r0(pLeft)} g protein to go. ${esc(pick.name)} adds ${r0(pick.p)} g for ${fmt(pick.kcal)} cal.</span>${logBtn(pick)}</div>`)}
  if(t.dkcal>=200&&t.kcal>0&&t.dkcal/t.kcal>=0.2)out.push(`<div class="tip"><span>Drinks are ${r0(t.dkcal/t.kcal*100)}% of today's calories (${fmt(t.dkcal)} cal).</span></div>`);
  if(s.caffeine&&t.caf>=s.cafLimit*0.8)out.push(`<div class="tip"><span>Caffeine is at ${fmt(t.caf)} of your ${s.cafLimit} mg guide${h>=14?'. Caffeine late in the day can affect sleep':''}.</span></div>`);
  if(alcOn()&&t.alc>=2)out.push(`<div class="tip"><span>A glass of water between drinks helps keep your hydration on track.</span>${logBtn(water)}</div>`);
  return out.slice(0,3)}

/* ---------- sources ---------- */
const SOURCES=[
  ['Food database','U.S. Department of Agriculture, FoodData Central (SR Legacy). Public domain.','https://fdc.nal.usda.gov/','Calories, protein, carbs and fat per 100 g for about 7,200 foods.'],
  ['Food database','TempoLife food nutrition dataset, CC-BY-4.0.','https://tempolife.app','About 560 additional everyday foods with simpler names.'],
  ['Hydration %','Maughan RJ et al. A randomized trial to assess the potential of different beverages to affect hydration status: development of a beverage hydration index. Am J Clin Nutr, 2016.','https://doi.org/10.3945/ajcn.115.114769','Milk, orange juice and oral rehydration drinks held on to more fluid than water; coffee, tea, cola, sports drinks and lager were not different from water. Untested drinks are marked as estimates.'],
  ['Water target','National Academies. Dietary Reference Intakes for Water, Potassium, Sodium, Chloride, and Sulfate, 2005.','https://www.nationalacademies.org/read/10925/chapter/2','Adequate intake of total water is 3.7 L (men) and 2.7 L (women); about 81% comes from drinks, roughly 3.0 L and 2.2 L.'],
  ['Calorie target','Mifflin MD, St Jeor ST et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr, 1990.','https://doi.org/10.1093/ajcn/51.2.241','BMR from weight, height, age and sex (or Katch-McArdle, 370 + 21.6 × lean mass in kg, when you enter body fat %), times an activity factor of 1.2–1.9. Goals add or subtract about 1,100 calories a day per kg per week (7,700 calories per kg).'],
  ['Macro split','Body-type splits, quiz and calculator setup from mealprep.mcbflow.com, part of the same mb app family.','https://mealprep.mcbflow.com','Ectomorph 25/55/20, mesomorph 30/40/30, endomorph 35/25/40 (% protein/carbs/fat). Body types are coaching shorthand, not a medical measurement.'],
  ['Low-carb & keto','Feinman RD et al. Dietary carbohydrate restriction as the first approach in diabetes management: critical review and evidence base. Nutrition, 2015.','https://doi.org/10.1016/j.nut.2014.06.011','Low-carb is under 130 g or 26% of calories from carbs; very-low-carb (keto) is 20–50 g or under 10%. The app uses 20% and 5% carb splits.'],
  ['Protein check','Jäger R et al. International Society of Sports Nutrition position stand: protein and exercise, 2017.','https://pubmed.ncbi.nlm.nih.gov/28642676/','1.4–2.0 g protein per kg per day for people who exercise. The app shows your protein in g/kg and notes when an active profile falls under 1.2.'],
  ['Caffeine guide','U.S. FDA. Spilling the Beans: How Much Caffeine Is Too Much?','https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much','400 mg a day is not generally associated with negative effects for most adults.'],
  ['Brand foods','Open Food Facts, a free, open database of packaged foods added by volunteers. Data under the Open Database License (ODbL).','https://world.openfoodfacts.org','Used only when you tap Search brands online. Numbers come from product labels as entered by volunteers, so check them against the package.'],
  ['Standard drinks','NIAAA. What Is a Standard Drink?','https://www.niaaa.nih.gov/alcohols-effects-health/what-standard-drink','One U.S. standard drink is 14 g of pure alcohol: 12 oz beer at 5%, 5 oz wine at 12%, or 1.5 oz of 80-proof spirits.'],
  ['Allergens','U.S. FDA. Food Allergies: What You Need to Know (the 9 major allergens).','https://www.fda.gov/food/buy-store-serve-safe-food/food-allergies-what-you-need-know','Milk, eggs, fish, crustacean shellfish, tree nuts, peanuts, wheat, soybeans and sesame. Gluten and lactose are included here as common intolerances. Warnings are name matches, not ingredient checks.'],
  ['BAC estimate','Widmark formula; elimination rate from the Wisconsin Department of Justice Alcohol Monograph.','https://www.wisdoj.gov/Forensic%20Science/Alcohol%20Monograph-37306-1.pdf','BAC = alcohol ÷ (body weight × 0.68 for men or 0.55 for women), minus about 0.015% per hour (typical range 0.010–0.025). Each drink is assumed to absorb over 45 minutes.']];
const EXT='<svg class="ext" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#i-ext"/></svg><span class="vh"> (opens in a new tab)</span>';
function sourcesHTML(){return`<section class="card span2" id="sources"><h2><span>Sources & methods</span></h2><ul class="srcs">${SOURCES.filter(([k])=>alcOn()||!/drinks|BAC/.test(k)).map(([k,t,u,d])=>`<li><small>${esc(k)}</small><a href="${u}" target="_blank" rel="noopener noreferrer">${esc(t)}${EXT}</a><br>${esc(d)}</li>`).join('')}</ul>
  <p class="empty">Every number in this app is an estimate. Labels, portions, cooking and your own body all shift the real values.</p></section>`}
const FAQ=[
  ['Where is my log saved?','In this browser on this device, and nowhere else. There is no account and nothing is uploaded. Clearing your browser data deletes it, so use Data → Save backup now every so often.'],
  ['How do I move my log to another phone or computer?','On the old device, open Data and choose Export All (JSON). Copy that file to the new device, then use Data → Import Backup (JSON) there. Merge keeps what is already on the new device and skips anything already in it.'],
  ['Can I install it like an app?','In Chrome or Edge, use Install in Settings (or the install icon in the address bar). On iPhone, tap Share, then Add to Home Screen.'],
  ['Does it work offline?','Yes, after your first visit. The app and its food database are kept by the browser, so logging and searching work without a connection.'],
  ['Where do the food numbers come from?','About 7,200 foods come from the USDA FoodData Central SR Legacy database and about 560 from the TempoLife dataset. Values are per 100 g; you pick the amount. Details are under Sources & methods below.'],
  ['Is this medical or diet advice?','No. Targets, hydration, fasting and BAC figures are general estimates. Ask a doctor or registered dietitian before changing how you eat, and never use the BAC estimate to decide whether to drive.']];
function helpHTML(){return`<div class="grid">
  <section class="card span2 faq"><h2><span>Questions</span></h2>${FAQ.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(alcOn()?a:a.replace(', fasting and BAC figures',' and fasting figures').replace(', and never use the BAC estimate to decide whether to drive',''))}</p></details>`).join('')}</section>
  ${sourcesHTML()}</div>`}

/* ---------- views ---------- */
S=load();
/* order is fixed for the session so buttons don't jump under your thumb after a tap */
const useSnap={};[...S.foods,...S.drinks].forEach(x=>useSnap[x.id]=x.uses||0);
const us=x=>useSnap[x.id]??-1;
function sorted(arr){return[...arr].sort((a,b)=>(b.fav?1:0)-(a.fav?1:0)||us(b)-us(a))}

const ICON=(n,sz=18)=>`<svg class="uic" width="${sz}" height="${sz}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const ART=()=>{const t=document.getElementById('shareArt');return t?t.innerHTML:''};
function dayNav(){return`<div class="daynav" role="group" aria-label="Choose day"><button type="button" data-act="prev" aria-label="Previous day">${ICON('left')}</button><button type="button" class="lbl" data-act="today" aria-label="Go to today">${esc(prettyDate(cur))}</button><button type="button" data-act="next" aria-label="Next day">${ICON('right')}</button></div>`}
function bannerHTML(title,sub){return`<section class="cu-banner">${ART()}<div class="cu-txt"><h2 class="cu-t">${esc(title)}</h2><p class="cu-s num">${String(sub).split(' · ').map((x,i,a)=>`<span class="nw">${esc(x)}${i<a.length-1?' ·':''}</span>`).join(' ')}</p>${dayNav()}</div></section>`}
function todayHTML(){
  const s=S.settings,t=totals(cur),rem=s.kcal-t.kcal,over=rem<0,C=2*Math.PI*56;
  const ring=anim('ring',r1(C*(1-Math.min(1,t.kcal/(s.kcal||1)))));
  const macros=[['Protein','p','var(--mp)'],['Carbs','c','var(--mc)'],['Fat','f','var(--mf)']].map(([n,k,col])=>{
    const a=anim('m'+k,r1(Math.min(100,t[k]/(s[k]||1)*100)));
    const left=s[k]-t[k],pc=s[k]?r0(t[k]/s[k]*100):0;
    return `<div class="mtip" tabindex="0" data-tip="${r0(t[k])} of ${s[k]} g|${n} · ${pc}% of target|${left>=0?r0(left)+' g to go':r0(-left)+' g over'}"><div class="mrow num"><span style="--sw:${col}">${n}</span><span><b>${r0(t[k])}</b> / ${s[k]} g</span></div><div class="bar"><i style="width:${a.from}%;background:${col}" data-to="${a.to}" data-prop="w"></i></div></div>`}).join('');
  const hp=t.hyd/(s.waterMl||1),fill=Math.min(1,hp);
  const ty=anim('glass',fill<=0?164:r1(150-fill*142));
  const left=Math.max(0,s.waterMl-t.hyd);
  const qf=sorted(S.foods).slice(0,8),qd=sorted(visDrinks()).slice(0,6);
  const entries=[...(S.log[cur]||[])].sort((a,b)=>a.t-b.t);
  const y=S.log[shift(cur,-1)]||[];
  const isToday=cur===todayKey(),longDate=(()=>{const [yy,m,d]=cur.split('-').map(Number);return new Date(yy,m-1,d).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',year:'numeric'})})();
  return `${bannerHTML(prettyDate(cur),`${longDate} · ${entries.length} item${entries.length===1?'':'s'} logged · ${fmt(t.kcal)} of ${fmt(s.kcal)} cal`)}
  <div class="grid">${isToday?bacSection():''}
  <section class="card" aria-label="Calories">
    <h2><span>Calories</span><span class="num">${fmt(t.kcal)} / ${fmt(s.kcal)}</span></h2>
    <div class="calwrap">
      <svg class="ring" viewBox="0 0 140 140" role="img" tabindex="0" aria-label="${fmt(Math.abs(rem))} calories ${over?'over':'left'}" data-tip="${fmt(t.kcal)} of ${fmt(s.kcal)} cal|${s.kcal?r0(t.kcal/s.kcal*100):0}% of target|${t.dkcal?fmt(t.dkcal)+' from drinks':'None from drinks'}">
        <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--food-2)"/><stop offset="1" style="stop-color:var(--food)"/></linearGradient></defs>
        <circle cx="70" cy="70" r="56" fill="none" style="stroke:var(--surface-3)" stroke-width="13"/>
        <circle class="ringfg" cx="70" cy="70" r="56" fill="none" style="stroke:${over?'var(--warn)':'url(#rg)'}" stroke-width="13" stroke-linecap="round" stroke-dasharray="${r1(C)}" stroke-dashoffset="${ring.from}" data-to="${ring.to}" data-prop="dash" transform="rotate(-90 70 70)"/>
        <text x="70" y="70" text-anchor="middle" class="rbig num">${fmt(Math.abs(rem))}</text>
        <text x="70" y="90" text-anchor="middle" class="rsm">${over?'over target':'cal left'}</text>
      </svg>
      <div class="macros">${macros}
        <div class="calline num">${t.dkcal?fmt(t.dkcal)+' cal from drinks':'No drink calories yet'}</div></div>
    </div>
  </section>

  <section class="card" aria-label="Hydration">
    <h2><span>Hydration</span><button type="button" class="link" data-act="tab" data-v="settings">Target ${fmtVol(s.waterMl)}</button></h2>
    <div class="hydwrap">
      <svg class="glass" viewBox="0 0 120 160" role="img" tabindex="0" aria-label="${r0(hp*100)} percent of hydration target" data-tip="${fmtVol(t.hyd)} counted|${r0(hp*100)}% of ${fmtVol(s.waterMl)}|${fmtVol(t.ml)} drunk in total">
        <defs><clipPath id="gc"><path d="M14 8 H106 L96 150 Q95 155 90 155 H30 Q25 155 24 150 Z"/></clipPath>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--water-2)"/><stop offset="1" style="stop-color:var(--water)"/></linearGradient></defs>
        <g clip-path="url(#gc)"><rect width="120" height="160" style="fill:var(--surface-3)"/>
          <g class="wl" style="transform:translateY(${ty.from}px)" data-to="${ty.to}" data-prop="ty"><path class="wave" d="M-120 6 Q-105 0 -90 6 T-60 6 T-30 6 T0 6 T30 6 T60 6 T90 6 T120 6 T150 6 T180 6 V180 H-120 Z" fill="url(#wg)"/></g></g>
        <path d="M14 8 H106 L96 150 Q95 155 90 155 H30 Q25 155 24 150 Z" fill="none" style="stroke:var(--muted)" stroke-opacity=".45" stroke-width="3" stroke-linejoin="round"/>
        <path d="M24 22 L31 138" stroke="#fff" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/>
      </svg>
      <div class="hydtext">
        <div class="bignum hydpct num">${r0(hp*100)}%</div>
        <div class="hydsub num">${fmtVol(t.hyd)} counted · ${left>0?fmtVol(left)+' to go':'target reached'}</div>
        <div class="stats num">
          <div class="stat"><small>All drinks</small><b>${fmtVol(t.ml)}</b></div>
          <div class="stat"><small>Drink cal</small><b>${fmt(t.dkcal)}</b></div>
          ${s.caffeine?`<div class="stat"><small>Caffeine</small><b>${fmt(t.caf)}</b> <small style="display:inline">/ ${s.cafLimit} mg</small></div>`:''}
          ${alcOn()?`<div class="stat"><small>Alcohol</small><b>${r1(t.alc)}</b> <small style="display:inline" title="U.S. standard drinks, 14 g of alcohol each">drinks</small></div>`:''}
        </div>
      </div>
    </div>
    <div class="chips drinkchips">${qd.map(d=>`<button class="chip drink" data-act="log" data-id="${d.id}"><b>${flagged(allergenInfo(d))?'<span class="warn">⚠</span> ':''}${esc(d.name)}</b><small class="num">${itemMeta(d,'drink')}</small></button>`).join('')}
      <button type="button" class="chip add" data-act="newDrink">+ New drink</button></div>
    ${isToday&&t.hyd>=s.waterMl&&s.waterMl>0?`<div class="milestone"><span><b>Hydration target reached today.</b> Share it as an image if you like; amounts stay off unless you turn them on.</span><button type="button" class="btn sm mb-share-btn" data-act="shareHyd">${ICON('share',16)}Share</button></div>`:''}
  </section>

  ${cur===todayKey()?fastSection():""}
  ${suppSection()}
  ${(()=>{if(cur!==todayKey())return"";const t=tips();return t.length?`<section class="card span2" aria-label="Suggestions"><h2><span>Suggestions</span></h2><div class="tips">${t.join("")}</div></section>`:""})()}
  <section class="card span2" aria-label="Quick add">
    <h2><span>Quick add · one tap logs it</span><button type="button" class="link" data-act="recipe">+ Meal prep recipe</button></h2>
    <div class="chips">${qf.map(f=>`<button class="chip food" data-act="log" data-id="${f.id}"><b>${flagged(allergenInfo(f))?'<span class="warn">⚠</span> ':''}${esc(f.name)}</b><small class="num">${itemMeta(f,'food')}</small></button>`).join('')}
      <button type="button" class="chip add" data-act="add">Search all foods</button></div>
    ${S.foods.every(f=>!f.recipe)?'<p class="empty">Cook in batches? Build a recipe once, set how many portions it makes, and it becomes a one-tap button here.</p>':''}
  </section>

  <section class="card span2" aria-label="Log">
    <h2><span>${prettyDate(cur)}'s log · ${entries.length} item${entries.length===1?'':'s'}</span></h2>
    ${entries.length?entries.map(e=>`<div class="entry"><span class="dot" style="background:${e.kind==='drink'?'var(--water)':'var(--food)'}"></span>
      <button class="info-b" data-act="editEntry" data-id="${e.id}"><div class="name">${esc(e.name)}</div><div class="meta num">${entryMeta(e)}</div>${warnSpan(entryInfo(e))}</button>
      <div class="stepper"><button type="button" data-act="dec" data-id="${e.id}" aria-label="Less ${esc(e.name)}">−</button><span class="num" aria-label="${e.qty} servings">${e.qty}</span><button type="button" data-act="inc" data-id="${e.id}" aria-label="More ${esc(e.name)}">+</button></div></div>`).join('')
      :`<p class="empty">Nothing logged ${isToday?'yet today':'for this day'}. Each meal or drink you log fills in the calories, macros and hydration above. Tap a quick-add button, or search all foods.</p>`}
    ${(()=>{const b=[];
      if(S.template&&S.template.length)b.push(`<button type="button" class="btn primary" data-act="usual">${ICON('repeat',16)}Log my usual day (${S.template.length})</button>`);
      if(y.length)b.push(`<button type="button" class="btn" data-act="copyY">${ICON('copy',16)}Copy ${shift(cur,-1)===shift(todayKey(),-1)?'yesterday':'previous day'} (${y.length})</button>`);
      if(entries.length)b.push(`<button type="button" class="btn" data-act="saveUsual">${ICON('star',16)}Save as my usual day</button>`);
      if(!entries.length)b.push(`<button type="button" class="btn${b.length?'':' primary'}" data-act="add">${ICON('search',16)}Search all foods</button>`);
      return`<div class="dayacts">${b.join('')}</div>`})()}
  </section>
  </div>`}

function libraryHTML(){
  if(libTab==='supps'&&!S.settings.supps)libTab='foods';
  const tab=(v,l)=>`<button type="button" role="tab" id="lt-${v}" aria-selected="${libTab===v}" aria-controls="libpanel" tabindex="${libTab===v?0:-1}" data-act="libtab" data-v="${v}">${l}</button>`;
  const segs=`<div class="seg" role="tablist" aria-label="Library">${tab('foods','Foods')}${tab('drinks','Drinks')}${S.settings.supps?tab('supps','Supplements'):''}</div>`;
  const P=l=>`<button type="button" class="btn" data-act="${l[0]}">${ICON('plus',16)}${l[1]}</button>`;
  if(libTab==='supps'){const L=S.supps||[];return`<section class="card" id="libpanel" role="tabpanel" aria-labelledby="lt-supps"><div class="libhead">${segs}<div class="toolbar">${P(['newSupp','New supplement'])}</div></div>
    ${L.length?L.map(x=>`<div class="libitem"><button type="button" class="info-b" data-act="editSupp" data-id="${x.id}"><div class="name">${esc(x.name)}${x.active===false?'<span class="tag">paused</span>':''}</div><div class="meta">${esc(x.dose||'No dose entered')} · ${x.slots.map(sl=>(SLOTS.find(z=>z[0]===sl)||['','?'])[1]).join(', ')} · ${x.days.length===7?'every day':x.days.map(d=>WEEK[d]).join(' ')}</div></button></div>`).join('')
      :'<p class="empty">No supplements yet. Add the vitamins and supplements you take, with the times and days, and Today shows a checklist for them.</p>'}</section>`}
  const isF=libTab==='foods',arr=sorted(isF?S.foods:visDrinks());
  return `<section class="card" id="libpanel" role="tabpanel" aria-labelledby="lt-${libTab}">
    <div class="libhead">${segs}
      <div class="toolbar">${isF?P(['newFood','New food'])+P(['recipe','New recipe']):P(['newDrink','New drink'])}</div></div>
    ${arr.length?arr.map(it=>`<div class="libitem"><button type="button" class="star" data-act="fav" data-id="${it.id}" aria-pressed="${!!it.fav}" aria-label="Pin ${esc(it.name)} to quick add">${it.fav?'★':'☆'}</button>
      <button type="button" class="info-b" data-act="${isF?'editFood':'editDrink'}" data-id="${it.id}"><div class="name">${esc(it.name)}${it.recipe?'<span class="tag">recipe</span>':''}</div>
      <div class="meta num">${isF?esc(it.serving)+' · ':''}${itemMeta(it,isF?'food':'drink')}${isF?' · '+r0(it.c)+'g C · '+r0(it.f)+'g F':(it.hyd!==100?' · counts '+it.hyd+'%':'')}${it.uses?' · used '+it.uses+'×':''}</div></button>
      <button type="button" class="btn sm" data-act="log" data-id="${it.id}" aria-label="Log ${esc(it.name)}">Log</button></div>`).join('')
    :`<p class="empty">No ${isF?'foods':'drinks'} saved yet. Saved items get one-tap buttons on Today.</p>`}
    <p class="note">★ pins an item to the front of quick add. Unpinned items sort by how often you log them.</p>
  </section>`}

/* gridline values for charts: steps of 1, 2, 2.5 or 5 × 10ⁿ, about three lines, all below the top of the scale */
function niceTicks(max,n=3){if(!(max>0))return[];const raw=max/n,pw=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/pw,st=(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*pw,out=[];
  for(let v=st;v<max*0.97;v+=st)out.push(Math.round(v/st)*st);return out}
function trendsHTML(){
  const s=S.settings,days=[...Array(7)].map((_,i)=>shift(cur,i-6)),ts=days.map(d=>({d,...totals(d)})),logged=ts.filter(x=>x.n>0);
  const avg=k=>logged.length?logged.reduce((a,x)=>a+x[k],0)/logged.length:0;
  const kMax=Math.max(s.kcal*1.25,...ts.map(x=>x.kcal)),hMax=Math.max(s.waterMl*1.25,...ts.map(x=>x.hyd));
  const wd=d=>{const [y,m,dd]=d.split('-').map(Number);return new Date(y,m-1,dd).toLocaleDateString('en-US',{weekday:'short'})};
  /* week bar chart (suite chart rule): nice-number gridlines with axis labels, a labelled target line, rounded bars,
     hover/tap/focus labels on every bar, the other bars dim while one is read */
  const bars=(k,max,target,grad)=>{const hy=k==='hyd',ml=hy&&!isOz(),du=v=>hy?(ml?v/1000:v/ML_OZ):v,dmax=du(max);
    const lab=v=>hy?(ml?(Math.round(v*10)/10)+' L':fmt(v)+' oz'):v>=1000?(Math.round(v/100)/10)+'k':fmt(v);
    const pct=v=>r1(v/dmax*100),tPct=r1(target/max*100),tLab=hy?fmtVol(target):fmt(target)+' cal';
    const ticks=niceTicks(dmax).filter(v=>Math.abs(pct(v)-tPct)>10);
    const grid=`<div class="wgrid" aria-hidden="true"><i class="wg w0" style="bottom:0"><em>0</em></i>${ticks.map(v=>`<i class="wg" style="bottom:${pct(v)}%"><em>${lab(v)}</em></i>`).join('')}${target>0?`<i class="wt" style="bottom:${tPct}%"><em>${hy?lab(du(target)):lab(target)}</em></i>`:''}</div>`;
    return`<div class="wchart">${grid}<div class="week">${ts.map(x=>{const a=anim('w'+k+x.d,r1(x[k]/max*100));const val=hy?fmtVol(x[k]):fmt(x[k])+' cal',full=(()=>{const [y,m,dd]=x.d.split('-').map(Number);return new Date(y,m-1,dd).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})})();const diff=x[k]-target,amt=hy?fmtVol(Math.abs(diff)):fmt(Math.abs(diff))+' cal',cmp=!x.n?'Nothing logged':!(target>0)?'':Math.abs(diff)<1?'Right on target':amt+(diff>0?' over':' under')+' target';
    return`<button type="button" class="wcol ${x.d===cur?'cur':''}" data-act="openDay" data-d="${x.d}" data-tip="${esc(val)}|${esc(full)}|${esc(cmp)}" aria-label="${esc(full)}: ${esc(val)}. ${esc(cmp)}. Open this day."><span class="wtrack"><span class="wbar" style="height:${a.from}%;background:${grad}" data-to="${a.to}" data-prop="h"></span></span><small aria-hidden="true">${wd(x.d)}</small></button>`}).join('')}</div></div>${target>0?`<p class="wlegend"><i aria-hidden="true"></i>Target ${esc(tLab)}</p>`:''}`};
  const ins=[];const wk=ts.reduce((a,x)=>a+x.kcal,0),wd2=ts.reduce((a,x)=>a+x.dkcal,0);
  ins.push(`You logged ${logged.length} of 7 days.`);
  if(logged.length){const ak=avg('kcal'),diff=ak-s.kcal;
    ins.push(`Average ${fmt(ak)} cal on logged days, ${fmt(Math.abs(diff))} ${diff>0?'over':'under'} your ${fmt(s.kcal)} target.`);
    ins.push(`Protein target hit on ${logged.filter(x=>x.p>=s.p).length} of ${logged.length} days (avg ${r0(avg('p'))} g).`);
    ins.push(`Hydration target hit on ${logged.filter(x=>x.hyd>=s.waterMl).length} days (avg ${fmtVol(avg('hyd'))} counted).`);
    if(wk>0)ins.push(`Drinks made up ${r0(wd2/wk*100)}% of your calories.`);
    if(s.caffeine){const hi=logged.filter(x=>x.caf>s.cafLimit).length;if(hi)ins.push(`Caffeine went past ${s.cafLimit} mg on ${hi} day${hi>1?'s':''}.`)}}
  const src={};days.forEach(d=>(S.log[d]||[]).forEach(e=>{src[e.name]=(src[e.name]||0)+e.kcal*e.qty}));
  const top=Object.entries(src).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,6);
  return `<div class="viewhead"><h2><span>7 days to ${esc(prettyDate(cur))}</span></h2>${dayNav()}</div>
  ${logged.length>=3?`<div class="milestone" style="margin:0 0 12px"><span><b>${logged.length} of 7 days logged.</b> Share a summary of your week as an image; calorie numbers stay off unless you turn them on.</span><button type="button" class="btn sm mb-share-btn" data-act="shareWeek">${ICON('share',16)}Share week</button></div>`:''}
  <div class="grid">
    <section class="card"><h2><span>Calories · 7 days to ${prettyDate(cur)}</span><span class="charthint">Hover or tap a bar</span></h2>${bars('kcal',kMax,s.kcal,'linear-gradient(var(--food-2),var(--food))')}</section>
    <section class="card"><h2><span>Hydration counted</span><span class="charthint">Hover or tap a bar</span></h2>${bars('hyd',hMax,s.waterMl,'linear-gradient(var(--water-2),var(--water))')}</section>
    ${S.settings.supps&&(S.supps||[]).length?(()=>{const days=[...Array(7)].map((_,i)=>shift(cur,i-6)),rows=(S.supps||[]).map(x=>{let due=0,tk=0;days.forEach(d=>{if(x.active!==false&&!(x.created&&d<x.created)&&x.days.includes(dow(d)))x.slots.forEach(sl=>{due++;if(taken(d,x.id,sl))tk++})});return[x,due,tk]}).filter(r=>r[1]);
      return rows.length?`<section class="card"><h2><span>Supplements · 7 days</span></h2>${rows.map(([x,due,tk])=>`<div class="fastlog num"><span>${esc(x.name)}</span><b>${tk}/${due} · ${r0(tk/due*100)}%</b></div>`).join('')}</section>`:''})():''}
    <section class="card"><h2><span>What the week says</span></h2><ul class="insights">${ins.map(i=>`<li>${i}</li>`).join('')}</ul></section>
    ${s.fasting?(()=>{const [y,m,d]=cur.split('-').map(Number),to=new Date(y,m-1,d,23,59,59).getTime(),from=to-7*864e5,list=fastsBetween(from,to),goal=s.fastGoal*36e5,hit=list.filter(([a,b])=>b-a>=goal).length;
      return`<section class="card"><h2><span>Fasting log · 12h+</span><span class="num">${hit}/${list.length} hit ${fh(s.fastGoal)}h</span></h2>${list.length?list.map(([a,b])=>`<div class="fastlog num"><span>${clockDay(a)} → ${clockDay(b)}</span><b>${dur(b-a)}${b-a>=goal?' ✓':''}</b></div>`).join('')+(list.length?`<p class="empty">Average ${dur(list.reduce((t,[a,b])=>t+b-a,0)/list.length)}.</p>`:''):'<p class="empty">Fasts of 12 hours or more, measured between logged meals, show up here.</p>'}</section>`})():''}
    <section class="card"><h2><span>Biggest calorie sources</span></h2>${top.length?top.map(([n,k])=>`<div class="src num"><span>${esc(n)}</span><b>${fmt(k)} cal · ${wk?r0(k/wk*100):0}%</b></div>`).join(''):'<p class="empty">Log a few days to see this.</p>'}</section>
  </div>`}

const fmtDay=key=>{const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})};
function settingsHTML(){const s=S.settings;
  const n=(id,label,val,step='1')=>`<div><label class="f" for="${id}">${label}</label><input type="number" inputmode="decimal" id="${id}" data-set="${id}" value="${val}" step="${step}" min="0"></div>`;
  const pr=prof(),hIn=pr.heightCm?pr.heightCm/2.54:0,rc=recommend(),paces=PACES[unitSys()][pr.goal]||[];
  const btCard=(k,b)=>`<button type="button" class="btype ${pr.bodyType===k?'on':''}" data-act="btype" data-k="${k}" aria-pressed="${pr.bodyType===k}">${bodySVG(k)}<b>${b.label}</b><small>${b.blurb}</small>${mbar(b.pct)}${splitLegend(b.pct)}</button>`;
  const dark=document.documentElement.dataset.theme==='dark';
  return `<div class="grid">
  <section class="card span2" aria-labelledby="h-appear"><h2 id="h-appear"><span>Appearance</span></h2>
    <div class="radios" role="radiogroup" aria-label="Theme" style="grid-template-columns:repeat(2,minmax(0,1fr))">
      <label class="radio"><input type="radio" name="theme" value="light" data-theme-pick ${dark?'':'checked'}><span><b>Light</b><small>The default</small></span></label>
      <label class="radio"><input type="radio" name="theme" value="dark" data-theme-pick ${dark?'checked':''}><span><b>Dark</b><small>Remembered in this browser</small></span></label></div>
  </section>
  <section class="card span2" id="aboutyou"><h2><span>About you</span></h2>
    <div class="row">
      <div><label class="f" for="sex">Sex</label><select id="sex" data-set="sex"><option value="m" ${s.sex==='m'?'selected':''}>Male</option><option value="f" ${s.sex==='f'?'selected':''}>Female</option><option value="a" ${s.sex==='a'?'selected':''}>Prefer not to say (average)</option></select></div>
      ${n('age','Age',pr.age||'')}${n('weight','Weight ('+(isOz()?'lb':'kg')+')',s.weightKg?r1(isOz()?s.weightKg/LB_KG:s.weightKg):'','0.1')}
      ${isOz()?n('hft','Height ft',hIn?Math.floor(hIn/12):'')+n('hin','in',hIn?r1(hIn%12):'','0.5'):n('hcm','Height cm',pr.heightCm?r1(pr.heightCm):'')}</div>
    <div class="row">${n('bodyFat','Body fat % (optional)',pr.bodyFat||'','0.5')}
      <div style="grid-column:span 2"><label class="f" for="formula">Formula</label><select id="formula" data-set="formula"><option value="mifflin" ${pr.formula!=='katch'?'selected':''}>Mifflin-St Jeor (recommended)</option><option value="katch" ${pr.formula==='katch'?'selected':''}>Katch-McArdle (needs body fat %)</option></select></div></div>
    <p class="subhead">Activity level</p>
    <div class="radios">${ACTIVITY.map(([v,l,d])=>`<label class="radio"><input type="radio" name="act" value="${v}" data-set="activity" ${Math.abs(pr.activity-v)<.001?'checked':''}><span><b>${l}</b><small>${d}</small></span></label>`).join('')}</div>
    <p class="subhead">Goal</p>
    <div class="gcards">${[['lose','Lose fat','Eat below maintenance'],['maintain','Maintain','Hold your weight'],['gain','Build muscle','Eat above maintenance']].map(([k,t,d])=>`<button type="button" class="gcard ${pr.goal===k?'on':''}" data-act="goal" data-k="${k}" aria-pressed="${pr.goal===k}"><b>${t}</b><small>${d}</small></button>`).join('')}</div>
    ${paces.length?`<label class="f" for="pace">Pace</label><select id="pace" data-set="pace">${paces.map(([v,l])=>`<option value="${v}" ${Math.abs(v-closestPace(pr.rateKgWk,pr.goal))<1e-6?'selected':''}>${l}</option>`).join('')}</select>`:''}
    <p class="subhead">Body type</p>
    <p class="empty" style="margin:0">Sets your protein, carb and fat split. Pick the closest match, or set your own.${s.style?` Your ${STYLES[s.style][0]} eating style (below) overrides it for now.`:''}</p>
    <div class="btypes">${Object.entries(BODY_TYPES).map(([k,b])=>btCard(k,b)).join('')}
      <button type="button" class="btype ${pr.bodyType==='custom'?'on':''}" data-act="btype" data-k="custom" aria-pressed="${pr.bodyType==='custom'}">${bodySVG('custom')}<b>Custom</b><small>Set your own protein / carb / fat split.</small>${mbar(pr.pct)}${splitLegend(pr.pct)}</button></div>
    ${pr.bodyType==='custom'?`<div class="row">${n('pct:p','Protein %',pr.pct.p)}${n('pct:c','Carbs %',pr.pct.c)}${n('pct:f','Fat %',pr.pct.f)}</div><p class="empty">Adds up to ${r1(pr.pct.p+pr.pct.c+pr.pct.f)}%.</p>`:''}
    <div class="dayacts"><button class="btn sm" data-act="quiz">Not sure? Take the 4-question quiz</button></div>
    <p class="empty">Body types are coaching shorthand, not a medical measurement. Total calories and enough protein matter most, so treat these splits as starting points.</p>
    <div class="recbox num">${!rc?'Enter your age, height and weight to see your calorie and macro targets. Nothing leaves this device.':rc.issue?esc(rc.issue):`<b>${fmt(rc.kcal)} cal</b> · ${rc.grams.p} g P · ${rc.grams.c} g C · ${rc.grams.f} g F · ${fmtVol(rc.waterMl)} drinks${rc.warnings.length?` <span class="warn">· ${rc.warnings.length} note${rc.warnings.length>1?'s':''}</span>`:''}`}
      <div class="dayacts"><button class="btn primary" data-act="rec">Review &amp; use these targets</button></div></div>
  </section>
  <section class="card"><h2><span>Daily targets</span></h2>
    <div class="row">${n('kcal','Calories',s.kcal)}${n('p','Protein g',s.p)}${n('c','Carbs g',s.c)}${n('f','Fat g',s.f)}</div>
    <div class="row">${n('waterMl','Hydration ('+uName()+')',r0(toUnit(s.waterMl)))}<div><label class="f" for="unit">Drink units</label><select id="unit" data-set="unit"><option value="oz" ${isOz()?'selected':''}>US fl oz</option><option value="ml" ${!isOz()?'selected':''}>mL</option></select></div></div>
    <p class="empty">Fluid needs vary with activity, heat, diet and health. Pick a number that suits you; 64 oz is only a starting point.</p>
  </section>
  <section class="card"><h2><span>Extras</span></h2>
    <label class="toggle">Track fasting<input type="checkbox" data-set="fasting" ${s.fasting?'checked':''}></label>
    ${s.fasting?`<div class="row"><div><label class="f" for="fastGoal">Fast goal</label><select id="fastGoal" data-set="fastGoal">${(()=>{const pre=!s.fastCustom&&FAST_PRESETS.includes(+s.fastGoal);return FAST_PRESETS.map(h=>`<option value="${h}" ${pre&&+s.fastGoal===h?'selected':''}>${h} hours (${h}:${24-h})</option>`).join('')+`<option value="custom" ${pre?'':'selected'}>Custom${pre?'':` (${fh(s.fastGoal)}:${fh(24-s.fastGoal)})`}</option>`})()}</select></div>
      <div><label class="f" for="winStart">Eating window from</label><input type="time" id="winStart" data-set="winStart" value="${s.winStart}"></div><div><label class="f" for="winEnd">to</label><input type="time" id="winEnd" data-set="winEnd" value="${s.winEnd}"></div></div>
    ${s.fastCustom||!FAST_PRESETS.includes(+s.fastGoal)?`<div class="row">${n('fastHours','Custom fast (hours)',fh(s.fastGoal),'0.25')}</div>`:''}
    <p class="empty">Set the start and the end fills in from your fast goal. Change the end and the fast goal adjusts to match.</p>
    <p class="empty">The window is optional. Fasting isn't a good fit during pregnancy, with diabetes medication, or with a history of disordered eating; check with your doctor first.</p>`:''}
    <label class="toggle">Track supplements<input type="checkbox" data-set="supps" ${s.supps?'checked':''}></label>
    <label class="toggle">Track caffeine<input type="checkbox" data-set="caffeine" ${s.caffeine?'checked':''}></label>
    ${s.caffeine?`<div class="row" style="margin-bottom:6px">${n('cafLimit','Caffeine guide mg',s.cafLimit)}</div>`:''}
    <label class="toggle">Search brands online<input type="checkbox" data-set="offSearch" ${s.offSearch?'checked':''}></label>
    ${s.offSearch?`<p class="empty">Adds a "Search brands online" button when you log food. Only when you tap it, the words you typed go to Open Food Facts, a free volunteer database of packaged foods. Nothing else from your log is sent.</p>`:''}
    ${under21()?'':`<label class="toggle">Track alcohol<input type="checkbox" data-set="alcohol" ${s.alcohol?'checked':''}></label>`}
    ${alcOn()?`<p class="empty">The BAC estimate uses your weight and sex from About you and appears on Today only while it's above 0.000%. Turning alcohol off hides beer, wine and spirits everywhere.</p>`:''}
  </section>
  <section class="card span2"><h2><span>Dietary preferences</span></h2>
    <label class="f">Foods to flag</label><div class="tagchks">${Object.entries(DIETS).map(([k,[l]])=>`<label><input type="checkbox" data-set="diet:${k}" ${(s.diet||[]).includes(k)?'checked':''}> ${l}</label>`).join('')}</div>
    <label class="f" for="style">Eating style (sets your macro split)</label><select id="style" data-set="style">${Object.entries(STYLES).map(([k,[l]])=>`<option value="${k}" ${(s.style||'')===k?'selected':''}>${l}</option>`).join('')}</select>
    ${s.style?`<p class="empty">${esc(STYLES[s.style][1])} Split: ${STYLE_SPLITS[s.style].p}% protein, ${STYLE_SPLITS[s.style].c}% carbs, ${STYLE_SPLITS[s.style].f}% fat. Open About you and tap Review to update your targets.</p>`:'<p class="empty">With no eating style, your body type sets the split.</p>'}
    <p class="empty">Vegetarian, vegan and similar flags use the same name matching as allergy warnings, so check labels for hidden ingredients like gelatin, whey or fish sauce.</p>
  </section>
  <section class="card span2"><h2><span>Allergies & intolerances</span></h2>
    <div class="tagchks">${Object.entries(ALLERGENS).map(([k,[l]])=>`<label><input type="checkbox" data-set="alg:${k}" ${(s.allergens||[]).includes(k)?'checked':''}> ${l}</label>`).join('')}</div>
    <label class="f" for="avoidWords">Other words to flag (comma separated)</label><input type="text" id="avoidWords" data-set="avoidWords" value="${esc(s.avoidWords||'')}" placeholder="mushroom, cilantro">
    <label class="toggle">Hide foods that conflict with my allergies or diet<input type="checkbox" data-set="hideAllergens" ${s.hideAllergens?'checked':''}></label>
    <div class="warnbox"><b>How warnings work.</b> The food database has names and nutrition only, no ingredient lists. Warnings come from words in a food's name (shown as "may contain") and from allergens you tick on your own foods (shown as "contains"). A food with no warning is not confirmed safe. Always read the label, and ask at restaurants.</div>
  </section>
  <section class="span2 endcards" aria-label="Install and about">
    <div data-mb-install data-app-name="Nutrition" data-note="Opens in its own window with its own icon. Works offline after the first visit."></div>
    <div class="mb-about" role="group" aria-label="About this app">${ICON('info',22)}<div><b>nutrition.mcbflow.com™</b><p>Version ${APP.version} · ${fmtDay(APP.released)}</p>
      <p class="mb-about-links"><button type="button" data-act="tab" data-v="help">Help &amp; sources</button><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="https://mcbflow.com/">More free apps at mcbflow.com</a></p>
      <p class="mb-about-copy">© ${APP.firstYear===new Date().getFullYear()?APP.firstYear:APP.firstYear+'–'+new Date().getFullYear()} Matthew Broyer. All rights reserved.</p></div></div>
  </section></div>`}

const VIEWS={today:'Today',library:'Library',trends:'Week',settings:'Settings',help:'Help'};
function render(){
  if(!VIEWS[view])view='today';
  document.querySelectorAll('[data-act="tab"][data-v]').forEach(b=>{if(b.closest('.side-nav,.bnav')){if(b.dataset.v===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')}});
  $('#pageTitle').textContent=VIEWS[view];MBTitle.set(VIEWS[view]);
  const noAdd=view==='settings'||view==='help';$('#fab').hidden=noAdd;$('#addBtn').hidden=noAdd;
  $('#main').innerHTML=view==='today'?todayHTML():view==='library'?libraryHTML():view==='trends'?trendsHTML():view==='help'?helpHTML():settingsHTML();
  if(view==='settings'&&window.MBInstall)MBInstall.render();
  updateBackupStatus();applyAnims()}

/* ---------- dialogs: focus moves in, Tab stays inside, Esc/backdrop close (asking first if a form has unsaved edits), focus returns to the opener ---------- */
let modalOpener=null;
function modal(html,onMount){if(!curModal)modalOpener=document.activeElement;closeModal(true);$('#toast').hidden=true;closeDataMenu();
  const ov=document.createElement('div');ov.className='ov';
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" tabindex="-1">${html}</div>`;
  const sh=ov.querySelector('.sheet'),h=sh.querySelector('h3');if(h){h.id='dlg-t';sh.setAttribute('aria-labelledby','dlg-t')}else sh.setAttribute('aria-label','Dialog');
  ov.addEventListener('mousedown',e=>{ov._down=e.target===ov});
  ov.addEventListener('click',e=>{if(e.target===ov&&ov._down)requestClose()});
  sh.addEventListener('input',e=>{if(e.target.closest('form'))ov.dataset.dirty='1'});
  sh.addEventListener('change',e=>{if(e.target.closest('form'))ov.dataset.dirty='1'});
  document.body.appendChild(ov);curModal=ov;
  sh.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>closeModal());onMount&&onMount(sh);
  const f=sh.querySelector('[autofocus]')||sh.querySelector('[data-focus]')||sh;setTimeout(()=>{try{f.focus()}catch(e){}},40)}
function closeModal(keepFocus){if(curModal){curModal.remove();curModal=null;if(!keepFocus&&modalOpener&&modalOpener.isConnected){try{modalOpener.focus()}catch(e){}}if(!keepFocus)modalOpener=null}}
function requestClose(){if(!curModal)return;if(!curModal.dataset.dirty)return closeModal();
  if(curModal.querySelector('.discard'))return;
  const d=document.createElement('div');d.className='ov discard';d.style.zIndex=85;
  d.innerHTML=`<div class="sheet" role="alertdialog" aria-modal="true" aria-labelledby="dc-t" style="max-width:380px"><h3 id="dc-t">Discard changes?</h3><p class="help">Your edits in this form haven't been saved.</p><div class="actions"><span class="sp"></span><button type="button" class="btn" id="dcKeep">Keep editing</button><button type="button" class="btn danger" id="dcGo">Discard</button></div></div>`;
  curModal.appendChild(d);const keep=d.querySelector('#dcKeep');keep.focus();
  keep.onclick=()=>{d.remove();const f=curModal&&curModal.querySelector('.sheet input,.sheet select,.sheet button');f&&f.focus()};d.querySelector('#dcGo').onclick=()=>closeModal()}
function trapTab(e){if(e.key!=='Tab'||!curModal)return;const layer=curModal.querySelector('.discard .sheet')||curModal.querySelector('.sheet');
  const els=[...layer.querySelectorAll('a[href],button:not([disabled]),input:not([type=hidden]):not([disabled]),select,textarea,summary,[tabindex]:not([tabindex="-1"])')].filter(x=>x.offsetParent!==null);
  if(!els.length)return;const a=els[0],z=els[els.length-1];
  if(e.shiftKey&&(document.activeElement===a||!layer.contains(document.activeElement))){e.preventDefault();z.focus()}else if(!e.shiftKey&&(document.activeElement===z||!layer.contains(document.activeElement))){e.preventDefault();a.focus()}}
/* one confirm for destructive or bulk actions: names what is lost, Cancel is focused, optional "Save backup first" */
function confirmSheet(msg,label,fn,o={}){modal(`<h3>${esc(msg)}</h3>${o.detail?`<p class="help">${esc(o.detail)}</p>`:''}
  ${o.backup?`<div class="info">${ICON('info')}<span>Want a copy first? <button type="button" class="link" id="cfBk">Save backup first</button></span></div>`:''}
  <div class="actions"><span class="sp"></span><button type="button" class="btn" data-x data-focus>Cancel</button><button type="button" class="btn ${o.danger?'danger solid':'primary'}" id="ok">${esc(label)}</button></div>`,sh=>{
    sh.querySelector('#ok').onclick=()=>{closeModal();fn()};const b=sh.querySelector('#cfBk');if(b)b.onclick=()=>saveBackupNow().then(ok=>{if(ok)b.closest('.info').innerHTML=ICON('info')+'<span>Backup saved.</span>'})})}
const fv=(fd,k)=>fd.get(k);

function openAdd(){
  modal(`<h3>Log to ${esc(prettyDate(cur).toLowerCase())}</h3>
    <label class="vh" for="q">Search foods and drinks</label><input type="search" id="q" placeholder="Search about 7,800 foods, your meals and drinks" autocomplete="off" autofocus>
    <div id="res"></div>
    <details class="qa"><summary>Quick calories (no library entry)</summary>
      <form id="qaf"><div class="row"><div style="grid-column:span 2"><label class="f" for="qn">Name</label><input type="text" id="qn" name="name" placeholder="Office cake"></div>
      <div><label class="f" for="qk">Calories</label><input type="number" inputmode="decimal" id="qk" name="kcal" required min="0"></div><div><label class="f" for="qp">Protein g</label><input type="number" inputmode="decimal" id="qp" name="p" min="0"></div></div>
      <label class="check"><input type="checkbox" name="keep"> Also save to my library</label>
      <div class="actions"><span class="sp"></span><button class="btn primary">Log it</button></div></form></details>
    <div class="actions"><button type="button" class="btn sm" data-act="newFood">+ New food</button><button type="button" class="btn sm" data-act="recipe">+ Recipe</button><button type="button" class="btn sm" data-act="newDrink">+ New drink</button><span class="sp"></span><button type="button" class="btn sm" data-x>Cancel</button></div>`,sh=>{
    const q=sh.querySelector('#q'),res=sh.querySelector('#res');
    const row=(it,kind)=>`<button type="button" class="res" data-act="logClose" data-id="${it.id}"><span class="dot" style="background:${kind==='drink'?'var(--water)':'var(--food)'}"></span><span class="info-b"><div class="name">${esc(it.name)}</div><div class="meta num">${kind==='food'?esc(it.serving)+' · ':''}${itemMeta(it,kind)}</div>${warnSpan(allergenInfo(it))}</span><span class="plus">+</span></button>`;
    const hide=it=>S.settings.hideAllergens&&flagged(allergenInfo(it));
    const kindOf=it=>S.drinks.includes(it)?'drink':'food';
    let off={q:'',st:'',items:[]};   /* brand search state for this sheet */
    const offHTML=s=>{if(!S.settings.offSearch||s.length<2)return'';const mine=off.q===offQuery(s);let body='';
      if(mine&&off.st==='load')body='<p class="empty">Searching brands…</p>';
      else if(mine&&off.st==='err')body=`<p class="empty">Brand search didn't answer. Check your connection and <button type="button" class="link" data-off="go">try again</button>.</p>`;
      else if(mine&&off.st==='wait')body=`<p class="empty">You're searching fast! Brand search can handle about 10 searches a minute, so give it ${off.wait} seconds and <button type="button" class="link" data-off="go">try again</button>. Your saved foods and the food database below still work right away.</p>`;
      else if(mine&&off.st==='ok'){const v=off.items.filter(offVisible);body=v.length?v.map((x,i)=>`<button type="button" class="res" data-off="pick" data-i="${off.items.indexOf(x)}"><span class="dot" style="background:${x.drink?'var(--water)':'var(--mp)'}"></span><span class="info-b"><div class="name">${esc(x.name)}</div><div class="meta num">${offMeta(x)}<span class="dbtag">OFF</span></div>${warnSpan(allergenInfo(null,x.name))}</span><span class="plus">›</span></button>`).join(''):`<p class="empty">No brand match for “${esc(s)}”. Try the brand plus one word, like “stouffers meatballs”, or add it from the label with + New food.</p>`}
      else body=`<button type="button" class="btn sm" data-off="go" style="margin:4px 0 8px">${ICON('search',16)}Search brands online for “${esc(s.length>40?s.slice(0,40)+'…':s)}”</button>`;
      return'<div class="grp">Brands · Open Food Facts</div>'+body};
    const runOff=()=>{const s=q.value.trim();if(s.length<2)return;const k=offQuery(s);
      if(!offCache.has(k)){const w=offWait();if(w){off={q:k,st:'wait',wait:w,items:[]};draw();return}}
      off={q:k,st:'load',items:[]};draw();
      offSearch(s).then(items=>{if(off.q===k){off={q:k,st:'ok',items};if(q.isConnected)draw()}}).catch(()=>{if(off.q===k){off={q:k,st:'err',items:[]};if(q.isConnected)draw()}})};
    res.addEventListener('click',e=>{const b=e.target.closest('[data-off]');if(!b)return;e.preventDefault();
      if(b.dataset.off==='go')runOff();else if(b.dataset.off==='pick'){const x=off.items[+b.dataset.i];if(x)offForm(x)}});
    const draw=()=>{const s=q.value.trim().toLowerCase();
      if(!s){const seen=new Set(),rec=[];for(let i=0;i<30&&rec.length<10;i++){const d=S.log[shift(todayKey(),-i)]||[];
          [...d].sort((a,b)=>b.t-a.t).forEach(e=>{if(e.ref&&!seen.has(e.ref)&&rec.length<10){const it=findItem(e.ref);if(it&&(alcOn()||!isAlc(it))){seen.add(e.ref);rec.push(it)}}})}
        const fav=sorted([...S.foods,...visDrinks()]).filter(it=>!seen.has(it.id)&&!hide(it)).slice(0,12);
        res.innerHTML=(rec.length?'<div class="grp">Recent</div>'+rec.map(it=>row(it,kindOf(it))).join(''):'')+'<div class="grp">Your library</div>'+fav.map(it=>row(it,kindOf(it))).join('')}
      else{const vs=variants(s),m=sorted([...S.foods,...visDrinks()]).map(it=>[hide(it)?null:nameScore(it.name,vs),it]).filter(x=>x[0]!=null).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
        const dbh=searchDB(s,S.settings.hideAllergens||!alcOn()?200:30).filter(i=>(alcOn()||!isAlcDB(DB.foods[i][0]))&&(!S.settings.hideAllergens||!flagged(allergenInfo(null,DB.foods[i][0])))).slice(0,30);
        res.innerHTML=(m.length?'<div class="grp">Your foods & drinks</div>'+m.map(it=>row(it,kindOf(it))).join(''):'')+offHTML(q.value.trim())
          +'<div class="grp">Food database</div>'+(DB?(dbh.length?dbh.map(i=>{const r=DB.foods[i];return`<button type="button" class="res" data-act="dbPick" data-i="${i}"><span class="dot" style="background:var(--mf)"></span><span class="info-b"><div class="name">${esc(r[0])}</div><div class="meta num">${r[2]} cal · ${r[3]}g P per 100 g<span class="dbtag">${r[6]?'USDA':'TL'}</span></div>${warnSpan(allergenInfo(null,r[0]))}</span><span class="plus">›</span></button>`}).join('')
            :`<p class="empty">No database match for “${esc(q.value)}”. Try fewer words, or use quick calories below.</p>`)
            :dbErr?'<p class="empty">The food database didn\'t load. Check your connection and reopen this.</p>':'<p class="empty">Loading food database…</p>')}};
    q.oninput=draw;draw();loadDB().then(()=>{if(q.isConnected&&q.value.trim())draw()}).catch(()=>{dbErr=true;if(q.isConnected)draw()});
    q.onkeydown=e=>{if(e.key==='Enter'){const b=res.querySelector('.res');b&&b.click()}};
    sh.querySelector('#qaf').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);
      const it={name:fv(fd,'name').trim()||'Quick add',serving:'1 serving',kcal:num(fv(fd,'kcal')),p:num(fv(fd,'p')),c:0,f:0};
      if(fd.get('keep')){it.id=uid();it.type='food';it.fav=false;it.uses=0;S.foods.push(it)}
      closeModal();addEntries([mkEntry(it,'food')],'Logged '+it.name)}})}

/* label-serving version of a web product, for saving straight to the library ("Save as is") or filling a form */
function offItem(x,kind){if(kind==='drink'){const ml=x.su==='ml'&&x.sq?r0(x.sq):x.drink?355:250,a=x.k100!=null,k=ml/100;
    const it={name:x.name,ml,kcal:r1(a?x.k100*k:x.kS),p:r1(a?x.p100*k:x.pS),c:r1(a?x.c100*k:x.cS),f:r1(a?x.f100*k:x.fS),caf:r0(x.caf*k),hyd:x.abv>5?0:100,abv:alcOn()?r1(x.abv):0,src:'est'};it.alc=stdDrinks(it.ml,it.abv);return it}
  const per=x.sq||x.k100==null,k=x.sq?x.sq/100:1,useS=per&&x.kS!=null;
  return{name:x.name,serving:(per?(x.serving||(x.sq?r0(x.sq)+' g':'1 serving')):'100 g').slice(0,80),
    kcal:r1(useS?x.kS:x.k100*k),p:r1(useS?x.pS:x.p100*k),c:r1(useS?x.cS:x.c100*k),f:r1(useS?x.fS:x.f100*k)}}
/* web search panel for the New food / New drink forms */
function offPanel(sh,kind,fill){const box=sh.querySelector('#offp');if(!box||!S.settings.offSearch)return;
  const q=box.querySelector('#offq'),out=box.querySelector('#offr');let items=[];
  const go=()=>{const s=q.value.trim();if(s.length<2){out.innerHTML='<p class="empty">Type at least 2 letters.</p>';return}const k=offQuery(s);
    if(!offCache.has(k)){const w=offWait();if(w){out.innerHTML=`<p class="empty">You're searching fast! Brand search can handle about 10 searches a minute, so give it ${w} seconds and try again. You can still type the numbers in below.</p>`;return}}
    out.innerHTML='<p class="empty">Searching brands…</p>';
    offSearch(s).then(list=>{if(!q.isConnected)return;const want=kind==='drink';items=list.filter(offVisible).sort((a,b)=>(b.drink===want)-(a.drink===want));
      out.innerHTML=items.length?items.slice(0,12).map((x,i)=>`<div class="offrow"><span class="info-b"><div class="name">${esc(x.name)}</div><div class="meta num">${offMeta(x)}<span class="dbtag">OFF</span></div></span>
        <span class="offbtns"><button type="button" class="btn sm" data-ofill="${i}">Customize</button><button type="button" class="btn sm primary" data-osave="${i}">Save as is</button></span></div>`).join('')
        :`<p class="empty">No brand match for “${esc(s)}”. Try the brand plus one word, or type it in from the label below.</p>`})
      .catch(()=>{if(q.isConnected)out.innerHTML='<p class="empty">Brand search didn\'t answer. Check your connection, or type the numbers in below.</p>'})};
  box.querySelector('#offgo').onclick=go;q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go()}};
  out.onclick=e=>{const f=e.target.closest('[data-ofill]'),sv=e.target.closest('[data-osave]');
    if(f){fill(offItem(items[+f.dataset.ofill],kind));box.open=false;toast('Filled in from Open Food Facts. Check it, then Save.')}
    else if(sv){const it={id:uid(),uses:0,fav:true,...offItem(items[+sv.dataset.osave],kind)};if(kind==='food'){it.type='food';S.foods.push(it)}else S.drinks.push(it);
      save();closeModal();render();toast('Saved '+it.name+'. It works offline now.')}}}
const offPanelHTML=kind=>S.settings.offSearch?`<details class="qa offp" id="offp"><summary>Find it online (Open Food Facts)</summary>
  <div class="offsearch"><label class="vh" for="offq">Search brands</label><input type="search" id="offq" placeholder="${kind==='drink'?'Pabst Blue Ribbon, Gatorade…':'Stouffer’s Swedish meatballs…'}" autocomplete="off"><button type="button" class="btn" id="offgo">Search</button></div>
  <div id="offr"></div><p class="help">Customize fills in the form so you can change anything first. Save as is keeps a copy on this device, so it works with no internet.</p></details>`:'';

function foodForm(id){const f=id?S.foods.find(x=>x.id===id):null;if(f&&f.recipe)return recipeForm(id);
  const v=f||{name:'',serving:'1 serving',kcal:'',p:'',c:'',f:'',fav:true};
  modal(`<form id="ff"><h3>${f?'Edit food':'New food'}</h3>${f?'':offPanelHTML('food')}
    <label class="f" for="fn">Name</label><input type="text" id="fn" name="name" value="${esc(v.name)}" required autofocus>
    <label class="f" for="fs">Serving</label><input type="text" id="fs" name="serving" value="${esc(v.serving)}" placeholder="1 cup, 100 g, 1 bar">
    <div class="row"><div><label class="f" for="fk">Calories</label><input type="number" inputmode="decimal" id="fk" name="kcal" value="${v.kcal}" required min="0" step="any"></div>
    <div><label class="f" for="fp">Protein g</label><input type="number" inputmode="decimal" id="fp" name="p" value="${v.p}" min="0" step="any"></div>
    <div><label class="f" for="fc">Carbs g</label><input type="number" inputmode="decimal" id="fc" name="c" value="${v.c}" min="0" step="any"></div>
    <div><label class="f" for="ffat">Fat g</label><input type="number" inputmode="decimal" id="ffat" name="fat" value="${v.f}" min="0" step="any"></div></div>
    <p class="help">Values are per serving. Copy them from the label, or from a source like the USDA FoodData Central site.</p>
    ${tagBlock(v)}
    <label class="check"><input type="checkbox" name="fav" ${v.fav?'checked':''}> Pin to quick add</label>
    <div class="actions">${f?'<button type="button" class="btn danger" id="del">Delete</button>':''}<span class="sp"></span><button type="button" class="btn" data-x>Cancel</button><button class="btn primary">Save</button></div></form>`,sh=>{
    sh.querySelector('#ff').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);
      const o={name:fv(fd,'name').trim(),serving:fv(fd,'serving').trim()||'1 serving',kcal:num(fv(fd,'kcal')),p:num(fv(fd,'p')),c:num(fv(fd,'c')),f:num(fv(fd,'fat')),fav:!!fd.get('fav'),...readTags(fd)};
      if(f)Object.assign(f,o);else S.foods.push({id:uid(),type:'food',uses:0,...o});save();closeModal();render();toast(f?'Saved changes':'Added '+o.name)};
    const d=sh.querySelector('#del');if(d)d.onclick=()=>delItem(id,'foods');
    if(!f)offPanel(sh,'food',it=>{const set=(n,v)=>{const el=sh.querySelector(`[name="${n}"]`);if(el)el.value=v};set('name',it.name);set('serving',it.serving);set('kcal',it.kcal);set('p',it.p);set('c',it.c);set('fat',it.f)})})}

function drinkForm(id){const d=id?S.drinks.find(x=>x.id===id):null;
  const v=d||{name:'',ml:isOz()?r0(16*ML_OZ):500,kcal:0,p:0,c:0,f:0,caf:0,hyd:100,abv:0,fav:true};
  modal(`<form id="df"><h3>${d?'Edit drink':'New drink'}</h3>${d?'':offPanelHTML('drink')}
    <label class="f" for="dn">Name</label><input type="text" id="dn" name="name" value="${esc(v.name)}" required autofocus placeholder="My blue tumbler, Iced coffee">
    <div class="row"><div><label class="f" for="dml">Size (${uName()})</label><input type="number" inputmode="decimal" id="dml" name="ml" value="${r1(toUnit(v.ml))}" required min="0" step="any"></div>
    <div><label class="f" for="dk2">Calories</label><input type="number" inputmode="decimal" id="dk2" name="kcal" value="${v.kcal}" min="0" step="any"></div>
    <div><label class="f" for="dcaf">Caffeine mg</label><input type="number" inputmode="decimal" id="dcaf" name="caf" value="${v.caf}" min="0" step="any"></div></div>
    <div class="row"><div><label class="f" for="dp">Protein g</label><input type="number" inputmode="decimal" id="dp" name="p" value="${v.p||0}" min="0" step="any"></div>
    <div><label class="f" for="dc">Carbs g</label><input type="number" inputmode="decimal" id="dc" name="c" value="${v.c||0}" min="0" step="any"></div>
    <div><label class="f" for="dfat">Fat g</label><input type="number" inputmode="decimal" id="dfat" name="fat" value="${v.f||0}" min="0" step="any"></div></div>
    <div class="row"><div><label class="f" for="dh">Counts toward hydration %</label><input type="number" inputmode="decimal" id="dh" name="hyd" value="${v.hyd}" min="0" max="200" step="any"></div>
    ${alcOn()?`<div><label class="f" for="da">Alcohol % (ABV)</label><input type="number" inputmode="decimal" id="da" name="abv" value="${num(v.abv)}" min="0" max="95" step="any"></div>`:`<input type="hidden" name="abv" value="${num(v.abv)}">`}</div>
    <p class="help">Hydration % is how much of the drink counts toward your meter compared with water. ${v.src==='bhi'?'This default comes from the Beverage Hydration Index study (Maughan et al., 2016): milk, orange juice and oral rehydration drinks held on to more fluid than water; coffee, tea, soda, sports drinks and lager were about the same as water.':v.src==='est'?'This default is an estimate, not a measured value.':'Use 100 for most non-alcoholic drinks.'}${alcOn()?' Wine, spirits and cocktails default to 0% because stronger alcohol increases urine output.':''}</p>
    ${tagBlock(v)}
    <label class="check"><input type="checkbox" name="fav" ${v.fav?'checked':''}> Pin to quick add</label>
    <div class="actions">${d?'<button type="button" class="btn danger" id="del">Delete</button>':''}<span class="sp"></span><button type="button" class="btn" data-x>Cancel</button><button class="btn primary">Save</button></div></form>`,sh=>{
    sh.querySelector('#df').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);
      const o={name:fv(fd,'name').trim(),ml:r1(fromUnit(fv(fd,'ml'))),kcal:num(fv(fd,'kcal')),p:num(fv(fd,'p')),c:num(fv(fd,'c')),f:num(fv(fd,'fat')),caf:num(fv(fd,'caf')),hyd:num(fv(fd,'hyd')),abv:num(fv(fd,'abv')),fav:!!fd.get('fav'),...readTags(fd)};o.alc=stdDrinks(o.ml,o.abv);
      if(d)Object.assign(d,o);else S.drinks.push({id:uid(),uses:0,...o});save();closeModal();render();toast(d?'Saved changes':'Added '+o.name)};
    const x=sh.querySelector('#del');if(x)x.onclick=()=>delItem(id,'drinks');
    if(!d)offPanel(sh,'drink',it=>{const set=(n,v)=>{const el=sh.querySelector(`[name="${n}"]`);if(el)el.value=v};set('name',it.name);set('ml',r1(toUnit(it.ml)));set('kcal',it.kcal);set('caf',it.caf);set('p',it.p);set('c',it.c);set('fat',it.f);set('hyd',it.hyd);set('abv',it.abv)})})}

function delItem(id,col){const arr=S[col],i=arr.findIndex(x=>x.id===id);if(i<0)return;const [it]=arr.splice(i,1);save();closeModal();render();
  toast('Deleted '+it.name+'. Past log entries stay.',()=>{arr.splice(i,0,it);save();render()})}

function recipeForm(id){const ex=id?S.foods.find(x=>x.id===id):null;
  const rb=ex?{name:ex.name,portions:ex.recipe.portions,serving:ex.serving,items:ex.recipe.items.map(x=>({...x}))}:{name:'',portions:5,serving:'1 portion',items:[]};
  const lib=S.foods.filter(f=>!f.recipe&&f.id!==id);
  modal(`<form id="rf"><h3>${ex?'Edit recipe':'Meal prep recipe'}</h3>
    <p class="help">Enter the whole batch once. The app divides it into portions and adds a one-tap button to quick add.</p>
    <label class="f" for="rn">Recipe name</label><input type="text" id="rn" name="name" value="${esc(rb.name)}" required placeholder="Beef burrito bowls" autofocus>
    <div class="row"><div><label class="f" for="rp">Batch makes (portions)</label><input type="number" inputmode="decimal" id="rp" name="portions" value="${rb.portions}" min="0.5" step="any" required></div>
    <div><label class="f" for="rs">Portion label</label><input type="text" id="rs" name="serving" value="${esc(rb.serving)}"></div></div>
    <label class="f">Ingredients for the whole batch</label><div id="ings"></div>
    <div class="actions" style="margin-top:8px"><button type="button" class="btn sm" id="addIng">+ From library</button><button type="button" class="btn sm" id="addCus">+ Type in values</button></div>
    <div class="sum num" id="rsum"></div>
    ${tagBlock(ex||{})}
    <p class="help">Warnings also carry over from the ingredients you pick from your library.</p>
    <div class="actions">${ex?'<button type="button" class="btn danger" id="del">Delete</button>':''}<span class="sp"></span><button type="button" class="btn" data-x>Cancel</button><button class="btn primary">Save recipe</button></div></form>`,sh=>{
    const box=sh.querySelector('#ings'),sum=sh.querySelector('#rsum'),port=sh.querySelector('#rp');
    const opts=sel=>'<option value="">Choose food…</option>'+lib.map(f=>`<option value="${f.id}" ${f.id===sel?'selected':''}>${esc(f.name)} (${esc(f.serving)})</option>`).join('');
    const draw=()=>{box.innerHTML=rb.items.length?rb.items.map((it,i)=>it.custom?
      `<div class="ing"><input type="text" data-i="${i}" data-k="name" value="${esc(it.name)}" placeholder="Ingredient" aria-label="Ingredient name"><input type="number" inputmode="decimal" step="any" min="0" data-i="${i}" data-k="qty" value="${it.qty}" aria-label="Quantity"><button type="button" class="x" data-rm="${i}" aria-label="Remove">×</button>
        <div class="ingc">${['kcal','p','c','f'].map(k=>`<input type="number" inputmode="decimal" step="any" min="0" data-i="${i}" data-k="${k}" value="${it[k]||''}" placeholder="${{kcal:'cal',p:'prot g',c:'carb g',f:'fat g'}[k]}" aria-label="${k}">`).join('')}<span></span></div></div>`
      :`<div class="ing"><select data-i="${i}" data-k="ref" aria-label="Food">${opts(it.ref)}</select><input type="number" inputmode="decimal" step="any" min="0" data-i="${i}" data-k="qty" value="${it.qty}" aria-label="Servings"><button type="button" class="x" data-rm="${i}" aria-label="Remove">×</button></div>`).join('')
      :'<p class="empty">No ingredients yet. Add from your library (quantity = number of servings) or type in values (quantity multiplies what you type).</p>';calc()};
    const calc=()=>{const t={kcal:0,p:0,c:0,f:0};rb.items.forEach(it=>['kcal','p','c','f'].forEach(k=>t[k]+=num(it[k])*num(it.qty)));const n=num(port.value)||1;
      sum.innerHTML=`Whole batch: <b>${fmt(t.kcal)} cal</b> · ${r0(t.p)}g P · ${r0(t.c)}g C · ${r0(t.f)}g F<br>Per portion (÷${n}): <b>${fmt(t.kcal/n)} cal</b> · ${r1(t.p/n)}g P · ${r1(t.c/n)}g C · ${r1(t.f/n)}g F`;return{t,n}};
    box.addEventListener('input',e=>{const el=e.target,i=+el.dataset.i,k=el.dataset.k;if(isNaN(i))return;const it=rb.items[i];
      if(k==='ref'){const f=lib.find(x=>x.id===el.value);if(f)Object.assign(it,{ref:f.id,name:f.name,kcal:f.kcal,p:f.p,c:f.c,f:f.f});}else it[k]=k==='name'?el.value:num(el.value);calc()});
    box.addEventListener('click',e=>{const r=e.target.dataset.rm;if(r!=null){rb.items.splice(+r,1);draw()}});
    port.oninput=calc;
    sh.querySelector('#addIng').onclick=()=>{if(!lib.length){rb.items.push({custom:true,name:'',qty:1,kcal:0,p:0,c:0,f:0});toast('Library is empty, so this one takes typed values')}else rb.items.push({ref:'',qty:1,name:'',kcal:0,p:0,c:0,f:0});draw()};
    sh.querySelector('#addCus').onclick=()=>{rb.items.push({custom:true,name:'',qty:1,kcal:0,p:0,c:0,f:0});draw()};
    draw();
    sh.querySelector('#rf').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);const {t,n}=calc();
      const items=rb.items.filter(it=>it.custom?(it.name||it.kcal):it.ref);
      if(!items.length){toast('Add at least one ingredient');return}
      const o={name:fv(fd,'name').trim(),serving:fv(fd,'serving').trim()||'1 portion',kcal:r1(t.kcal/n),p:r1(t.p/n),c:r1(t.c/n),f:r1(t.f/n),recipe:{portions:n,items},...readTags(fd)};
      if(ex)Object.assign(ex,o);else S.foods.push({id:uid(),type:'meal',fav:true,uses:0,...o});save();closeModal();view='today';render();toast(ex?'Recipe updated':o.name+' is on your quick add')};
    const d=sh.querySelector('#del');if(d)d.onclick=()=>delItem(id,'foods')})}

function entryForm(id){const e=(S.log[cur]||[]).find(x=>x.id===id);if(!e)return;const dr=e.kind==='drink';
  modal(`<form id="ef"><h3>Edit entry</h3><p class="help">Edits this log entry. At the bottom, choose whether your library changes too.</p>
    <label class="f" for="en">Name</label><input type="text" id="en" name="name" value="${esc(e.name)}" required>
    <div class="row"><div><label class="f" for="eq">Servings</label><input type="number" inputmode="decimal" id="eq" name="qty" value="${e.qty}" min="0.25" step="0.25" required></div>
    ${dr?`<div><label class="f" for="eml">Size each (${uName()})</label><input type="number" inputmode="decimal" id="eml" name="ml" value="${r1(toUnit(e.ml))}" min="0" step="any"></div>`:''}
    <div><label class="f" for="ek">Cal each</label><input type="number" inputmode="decimal" id="ek" name="kcal" value="${e.kcal}" min="0" step="any"></div></div>
    <div class="row"><div><label class="f" for="et">Time</label><input type="time" id="et" name="time" value="${new Date(e.t).toTimeString().slice(0,5)}"></div></div>
    <div class="row"><div><label class="f" for="ep">Protein g</label><input type="number" inputmode="decimal" id="ep" name="p" value="${e.p}" min="0" step="any"></div>
    <div><label class="f" for="ec">Carbs g</label><input type="number" inputmode="decimal" id="ec" name="c" value="${e.c}" min="0" step="any"></div>
    <div><label class="f" for="efat">Fat g</label><input type="number" inputmode="decimal" id="efat" name="fat" value="${e.f}" min="0" step="any"></div></div>
    ${dr?`<div class="row"><div><label class="f" for="ecaf">Caffeine mg</label><input type="number" inputmode="decimal" id="ecaf" name="caf" value="${e.caf}" min="0" step="any"></div><div><label class="f" for="eh">Hydration %</label><input type="number" inputmode="decimal" id="eh" name="hyd" value="${e.hyd}" min="0" step="any"></div></div>`:''}
    ${(()=>{const lib=e.ref&&findItem(e.ref),w=dr?'drink':'food';
      return`<fieldset class="libsave"><legend>Your library</legend>
        <label class="check"><input type="radio" name="libMode" value="" checked> Change only this entry</label>
        ${lib?`<label class="check"><input type="radio" name="libMode" value="update"> Also update my saved ${w} “${esc(lib.name)}”</label>`:''}
        <label class="check"><input type="radio" name="libMode" value="new"> Save as ${lib?'a new':'my own'} ${w} in my library</label></fieldset>`})()}
    <div class="actions"><button type="button" class="btn danger" id="del">Remove</button><span class="sp"></span><button type="button" class="btn" data-x>Cancel</button><button class="btn primary">Save</button></div></form>`,sh=>{
    sh.querySelector('#ef').onsubmit=ev=>{ev.preventDefault();const fd=new FormData(ev.target);
      Object.assign(e,{name:fv(fd,'name').trim(),qty:num(fv(fd,'qty'))||1,kcal:num(fv(fd,'kcal')),p:num(fv(fd,'p')),c:num(fv(fd,'c')),f:num(fv(fd,'fat'))});
      if(dr)Object.assign(e,{ml:r1(fromUnit(fv(fd,'ml'))),caf:num(fv(fd,'caf')),hyd:num(fv(fd,'hyd'))});
      let saved='';const mode=fd.get('libMode');
      if(mode==='update'){const lib=findItem(e.ref);if(lib){Object.assign(lib,{name:e.name,kcal:e.kcal,p:e.p,c:e.c,f:e.f});if(dr)Object.assign(lib,{ml:e.ml,caf:e.caf,hyd:e.hyd});else if(e.unit)lib.serving=e.unit;saved=' and updated '+lib.name}}
      if(mode==='new'){const it={id:uid(),name:e.name,kcal:e.kcal,p:e.p,c:e.c,f:e.f,fav:true,uses:1,last:Date.now()};
        if(dr){Object.assign(it,{ml:e.ml,caf:e.caf,hyd:e.hyd,abv:e.ml>0&&e.alc>0?r1(e.alc*STD_G/0.789/e.ml*100):0,alc:e.alc||0,src:'est'});S.drinks.push(it)}
        else{Object.assign(it,{type:'food',serving:e.unit||'1 serving'});S.foods.push(it)}e.ref=it.id;saved=' and added to your '+(dr?'drinks':'foods')}
      const tm=fv(fd,'time');if(tm){const [y,m,d]=cur.split('-').map(Number),[hh,mm]=tm.split(':').map(Number);e.t=new Date(y,m-1,d,hh,mm).getTime()}save();closeModal();render();toast('Saved'+saved)};
    sh.querySelector('#del').onclick=()=>{closeModal();removeEntry(id)}})}

/* ---------- data in/out (SUITE-STANDARDS §5, addendum "Import/export" and "Save location") ----------
   Save backup now overwrites one file you picked (File System Access API, handle kept in IndexedDB).
   Where that API is missing (Firefox, Safari, phones, embedded previews) every save is a dated download. */
function download(name,text,type){try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},800);return true}catch(e){toast('The download was blocked by this browser. Try again, or try another browser.');return false}}
const fsOK=()=>{try{return 'showSaveFilePicker' in window&&window.self===window.top}catch(e){return false}};
function idb(){return new Promise((ok,no)=>{try{const r=indexedDB.open(HANDLE_DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('h');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}catch(e){no(e)}})}
async function hGet(k){try{const db=await idb();return await new Promise(ok=>{const q=db.transaction('h').objectStore('h').get(k);q.onsuccess=()=>ok(q.result||null);q.onerror=()=>ok(null)})}catch(e){return null}}
async function hSet(k,v){try{const db=await idb();await new Promise(ok=>{const t=db.transaction('h','readwrite');v==null?t.objectStore('h').delete(k):t.objectStore('h').put(v,k);t.oncomplete=ok;t.onerror=ok})}catch(e){}}
async function hClear(){try{const db=await idb();await new Promise(ok=>{const t=db.transaction('h','readwrite');t.objectStore('h').clear();t.oncomplete=ok;t.onerror=ok})}catch(e){}}
let jsonHandleName='';hGet('json').then(h=>{jsonHandleName=h&&h.name||'';updateBackupStatus()});
const backupText=()=>JSON.stringify({app:APP.domain,format:1,appVersion:APP.version,exportedAt:new Date().toISOString(),...S},null,1);
async function writeHandle(h,text){if(h.queryPermission&&(await h.queryPermission({mode:'readwrite'}))!=='granted'){if(!h.requestPermission||(await h.requestPermission({mode:'readwrite'}))!=='granted')return false}
  const w=await h.createWritable();await w.write(text);await w.close();return true}
function markBackedUp(msg){S.settings.lastBackup=Date.now();save();updateBackupStatus();if(view==='settings')render();toast(msg)}
async function pickAndSave(name,text,mime,ext,remember){
  if(!fsOK()){if(download(name.replace('.'+ext,'-'+todayKey()+'.'+ext),text,mime))return'download';return false}
  try{const h=await window.showSaveFilePicker({suggestedName:name,startIn:(await hGet('json'))||'documents',types:[{description:ext.toUpperCase()+' file',accept:{[mime]:['.'+ext]}}]});
    await writeHandle(h,text);if(remember){await hSet(remember,h);if(remember==='json')jsonHandleName=h.name}return'file'}
  catch(e){if(e&&e.name==='AbortError')return false;if(download(name.replace('.'+ext,'-'+todayKey()+'.'+ext),text,mime))return'download';return false}}
async function saveBackupNow(){closeDataMenu();
  const h=fsOK()?await hGet('json'):null;
  if(h){try{if(await writeHandle(h,backupText())){markBackedUp('Backup saved to '+h.name);return true}}catch(e){toast("Couldn't write to "+h.name+'. Pick where to save it.')}}
  const r=await pickAndSave('nutrition-backup.json',backupText(),'application/json','json','json');
  if(r){markBackedUp(r==='file'?'Backup saved to '+jsonHandleName:'Backup downloaded to your Downloads folder');return true}return false}
async function exportJson(){closeDataMenu();const r=await pickAndSave('nutrition-backup.json',backupText(),'application/json','json','json');
  if(r)markBackedUp(r==='file'?'Backup saved to '+jsonHandleName:'Backup downloaded to your Downloads folder')}
async function exportCsv(){closeDataMenu();
  const q=v=>{let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
  const rows=[['date','time','type','name','servings','unit','calories','protein_g','carbs_g','fat_g','volume_ml','hydration_ml','caffeine_mg','alcohol_drinks']];
  Object.keys(S.log).sort().forEach(d=>[...S.log[d]].sort((a,b)=>a.t-b.t).forEach(e=>{const x=e.qty,dr=e.kind==='drink';
    rows.push([d,new Date(e.t).toTimeString().slice(0,5),e.kind,e.name,x,dr?'':e.unit,r1(e.kcal*x),r1(e.p*x),r1(e.c*x),r1(e.f*x),dr?r0(e.ml*x):'',dr?r0(e.ml*e.hyd/100*x):'',r0((e.caf||0)*x),dr?r1((e.alc||0)*x):''])}));
  const r=await pickAndSave('nutrition-log.csv','﻿'+rows.map(r=>r.map(q).join(',')).join('\r\n'),'text/csv','csv',null);
  if(r)toast(r==='file'?'CSV saved':'CSV downloaded to your Downloads folder')}
async function startImport(){closeDataMenu();
  if('showOpenFilePicker' in window&&fsOK()){try{const [h]=await window.showOpenFilePicker({startIn:(await hGet('json'))||'documents',types:[{description:'Backup file',accept:{'application/json':['.json']}}]});readImport(await h.getFile());return}catch(e){if(e&&e.name==='AbortError')return}}
  $('#importFile').click()}
$('#importFile').onchange=e=>{const file=e.target.files[0];e.target.value='';if(file)readImport(file)};
function readImport(file){if(file.size>25e6){toast("That file is too large to be a Nutrition backup.");return}
  const rd=new FileReader();rd.onerror=()=>toast("Couldn't read that file. Try saving it again, then import.");
  rd.onload=()=>{let d;try{d=JSON.parse(rd.result)}catch(err){toast("That file isn't valid JSON, so nothing was imported.");return}
    if(!isObj(d)||(d.app&&d.app!==APP.domain&&d.app!==APP.oldDomain)){toast(d&&d.app?`That backup is from ${String(d.app).slice(0,40)}, not nutrition.mcbflow.com. Nothing was imported.`:"That file isn't a Nutrition backup. Nothing was imported.");return}
    if(!Array.isArray(d.foods)||!Array.isArray(d.drinks)||!isObj(d.log)){toast("That file isn't a Nutrition backup. Nothing was imported.");return}
    let inc;try{const raw={...d};['app','format','appVersion','exportedAt'].forEach(k=>delete raw[k]);inc=normalize(migrate(raw))}catch(err){toast("That backup is damaged, so nothing was imported.");return}
    importSheet(inc,d)};rd.readAsText(file)}
function mergeCounts(inc){let add=0,dup=0;const have=new Set();Object.values(S.log).forEach(L=>L.forEach(e=>have.add(e.id)));
  Object.values(inc.log).forEach(L=>L.forEach(e=>have.has(e.id)?dup++:add++));
  const ids=new Set([...S.foods,...S.drinks,...(S.supps||[])].map(x=>x.id));let items=0;[...inc.foods,...inc.drinks,...inc.supps].forEach(x=>{if(!ids.has(x.id))items++});return{add,dup,items}}
function importSheet(inc,raw){const days=Object.keys(inc.log).length,ent=Object.values(inc.log).reduce((a,L)=>a+L.length,0),c=mergeCounts(inc);
  const when=raw.exportedAt&&!isNaN(Date.parse(raw.exportedAt))?' saved '+new Date(raw.exportedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';
  modal(`<h3>Import this backup?</h3><p class="help">Backup${esc(when)}: ${days} day${days===1?'':'s'}, ${ent} log entr${ent===1?'y':'ies'}, ${inc.foods.length} foods, ${inc.drinks.length} drinks, ${inc.supps.length} supplements.</p>
    <div class="radios" style="margin-top:12px">
      <label class="radio"><input type="radio" name="imode" value="merge" checked><span><b>Merge (recommended)</b><small>Adds ${c.add} new entr${c.add===1?'y':'ies'} and ${c.items} new item${c.items===1?'':'s'}. Skips ${c.dup} already here. Keeps your settings.</small></span></label>
      <label class="radio"><input type="radio" name="imode" value="replace"><span><b>Replace everything</b><small>Deletes what's in this browser now and uses the backup instead, settings included.</small></span></label></div>
    <div class="info" id="repInfo" hidden>${ICON('info')}<span>Replace can't be undone. <button type="button" class="link" id="impBk">Save backup first</button></span></div>
    <div class="actions"><span class="sp"></span><button type="button" class="btn" data-x>Cancel</button><button type="button" class="btn primary" id="impGo">Merge</button></div>`,sh=>{
    const go=sh.querySelector('#impGo'),info=sh.querySelector('#repInfo');
    sh.querySelectorAll('[name=imode]').forEach(r=>r.onchange=()=>{const rep=sh.querySelector('[name=imode]:checked').value==='replace';info.hidden=!rep;go.textContent=rep?'Replace everything':'Merge';go.className='btn '+(rep?'danger solid':'primary')});
    sh.querySelector('#impBk').onclick=()=>saveBackupNow().then(ok=>{if(ok)info.innerHTML=ICON('info')+'<span>Backup saved. Replace is safe to run now.</span>'});
    go.onclick=()=>{const rep=sh.querySelector('[name=imode]:checked').value==='replace';closeModal();
      if(rep){S=inc;save();cur=todayKey();render();toast('Backup restored')}
      else{const before=JSON.stringify(S);try{doMerge(inc)}catch(e){S=JSON.parse(before);toast("The merge stopped part-way, so nothing was changed.");return}save();render();toast(`Merged: ${c.add} new entr${c.add===1?'y':'ies'}, ${c.dup} skipped`)}}})}
function doMerge(inc){const ids=new Set([...S.foods,...S.drinks].map(x=>x.id));
  inc.foods.forEach(x=>{if(!ids.has(x.id))S.foods.push(x)});inc.drinks.forEach(x=>{if(!ids.has(x.id))S.drinks.push(x)});
  const sids=new Set((S.supps||[]).map(x=>x.id));inc.supps.forEach(x=>{if(!sids.has(x.id))(S.supps||(S.supps=[])).push(x)});
  const have=new Set();Object.values(S.log).forEach(L=>L.forEach(e=>have.add(e.id)));
  Object.entries(inc.log).forEach(([k,L])=>L.forEach(e=>{if(!have.has(e.id))(S.log[k]||(S.log[k]=[])).push(e)}));
  Object.entries(inc.suppLog).forEach(([k,o])=>{const d=(S.suppLog||(S.suppLog={}))[k]||(S.suppLog[k]={});Object.entries(o).forEach(([kk,v])=>{if(!(kk in d))d[kk]=v})});
  if(!(S.template&&S.template.length)&&inc.template)S.template=inc.template}
function clearAll(){closeDataMenu();const days=Object.keys(S.log).length;
  confirmSheet('Clear all data in this browser?','Clear all data',async()=>{
    [KEY,'nutrition.ui'].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});
    await hClear();jsonHandleName='';S=defaults();save();cur=todayKey();view='today';render();toast('All data cleared')},
    {danger:true,backup:true,detail:`This deletes your log (${days} day${days===1?'':'s'}), saved foods, drinks, recipes, supplements, targets and settings, and forgets the saved backup location. Backup files you saved stay where they are.${SYNC&&SYNC.status().signedIn?' You’re signed in to sync, so this also clears your synced data on your account and other devices. To clear only this browser, sign out first (Data → Sync).':''}`})}
/* backup status: the chip (desktop), the dot on Data (smaller screens) and the Data menu footer */
function backupAge(){const t=S.settings.lastBackup;if(!t)return null;return Math.floor((new Date().setHours(0,0,0,0)-new Date(t).setHours(0,0,0,0))/864e5)}
function updateBackupStatus(){if(!S)return;const a=backupAge(),hasData=Object.keys(S.log).length>0,due=hasData&&(a===null||a>=7);
  const txt=a===null?'Never backed up':a===0?'Backed up today':a===1?'Backed up yesterday':`Backed up ${a} days ago`;
  const chip=$('#bkChip');chip.textContent=txt;chip.classList.toggle('warn',due);chip.classList.toggle('ok',!due&&a!==null);chip.setAttribute('aria-label',txt+'. Save backup now');
  $('#bkDot').hidden=!due;$('#dataBtn').setAttribute('aria-label','Data: backup, import and export'+(due?' (backup due)':''));
  $('#dataFoot').innerHTML=`<b>${esc(txt)}</b>${jsonHandleName&&fsOK()?` · to <b>${esc(jsonHandleName)}</b> in the folder you chose. <button type="button" class="link" data-act="changeLoc">Change location…</button>`:fsOK()?'':' · Saves go to your Downloads folder in this browser.'}<br>Your log is stored in this browser on this device. Clearing your browser data deletes it, so keep a backup.`}
/* Data menu */
function openDataMenu(){const m=$('#dataMenu'),b=$('#dataBtn'),r=b.getBoundingClientRect();updateBackupStatus();m.hidden=false;
  const w=m.offsetWidth;m.style.top=(r.bottom+6)+'px';m.style.left=Math.max(8,Math.min(window.innerWidth-w-8,r.right-w))+'px';b.setAttribute('aria-expanded','true');m.querySelector('button').focus()}
function closeDataMenu(focusBtn){const m=$('#dataMenu');if(!m||m.hidden)return;m.hidden=true;$('#dataBtn').setAttribute('aria-expanded','false');if(focusBtn)$('#dataBtn').focus()}

/* ---------- first-run screen: once per browser, skippable (addendum "Onboarding") ---------- */
function firstRun(){let seen=null;try{seen=localStorage.getItem(SEEN_KEY)}catch(e){return}
  const mark=()=>{try{localStorage.setItem(SEEN_KEY,'1')}catch(e){}};
  if(seen)return;if(Object.keys(S.log).length){mark();return}
  const dark=document.documentElement.dataset.theme==='dark';
  modal(`<div class="welcome"><div class="wart">${ART()}</div><h3>Track what you eat and drink, in a tap</h3>
    <p class="help">Log meals and drinks from a database of about 7,800 foods, watch calories, protein, carbs, fat and hydration fill in, and add fasting or supplements if you want them. No account. Your log stays in this browser.</p>
    <label class="f">Appearance</label><div class="themepick radios" role="radiogroup" aria-label="Theme">
      <label class="radio"><input type="radio" name="wtheme" value="light" data-theme-pick ${dark?'':'checked'}><span><b>Light</b></span></label>
      <label class="radio"><input type="radio" name="wtheme" value="dark" data-theme-pick ${dark?'checked':''}><span><b>Dark</b></span></label></div>
    <div class="actions"><button type="button" class="btn" id="wImp">${ICON('upload',16)}Import a backup</button>${SYNC?'<button type="button" class="btn" id="wSync">Sign in to sync</button>':''}<span class="sp"></span><button type="button" class="btn" id="wSet">Set my targets</button><button type="button" class="btn primary" id="wGo" data-focus>Start logging</button></div></div>`,sh=>{
    sh.querySelector('#wGo').onclick=()=>{mark();closeModal()};
    sh.querySelector('#wSet').onclick=()=>{mark();closeModal();go('settings')};
    sh.querySelector('#wImp').onclick=()=>{mark();closeModal();startImport()};
    const ws=sh.querySelector('#wSync');if(ws)ws.onclick=()=>{mark();closeModal();SYNC.open()}});
  const ov=curModal;if(ov){const obs=new MutationObserver(()=>{if(!ov.isConnected){mark();obs.disconnect()}});obs.observe(document.body,{childList:true})}}

/* ---------- share cards (kit v3 §6, MBShare): real data only, numbers hidden by default ---------- */
function artEl(){const t=document.getElementById('shareArt');return t?t.content.firstElementChild:null}
const monthYear=()=>new Date().toLocaleDateString('en-US',{month:'short',year:'numeric'});
function shareHydration(){const s=S.settings,t=totals(todayKey());if(t.hyd<s.waterMl)return;
  const drinks=(S.log[todayKey()]||[]).filter(e=>e.kind==='drink').reduce((a,e)=>a+e.qty,0);
  MBShare.open({title:'Share your hydration',kicker:'Hydration',headline:'Hydration target reached today',sub:new Date().toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'}),
    art:artEl(),fileName:'nutrition-hydration.png',date:monthYear(),
    options:[{id:'amounts',label:'Show amounts',value:false}],
    build:o=>({stats:o.amounts?[{label:'Counted',value:fmtVol(t.hyd)},{label:'Target',value:fmtVol(s.waterMl)},{label:'Drinks',value:String(r1(drinks))}]:[{label:'Target',value:r0(t.hyd/s.waterMl*100)+'%'},{label:'Drinks logged',value:String(r1(drinks))}]})})}
function shareWeek(){const s=S.settings,days=[...Array(7)].map((_,i)=>shift(cur,i-6)),ts=days.map(d=>totals(d)),logged=ts.filter(x=>x.n>0);if(logged.length<1)return;
  const pHit=logged.filter(x=>x.p>=s.p).length,hHit=logged.filter(x=>x.hyd>=s.waterMl).length,avgK=logged.reduce((a,x)=>a+x.kcal,0)/logged.length;
  const span=(()=>{const f=k=>{const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric'})};return f(days[0])+' – '+f(days[6])})();
  MBShare.open({title:'Share your week',kicker:'My week',headline:`Logged ${logged.length} of 7 days`,sub:span,art:artEl(),fileName:'nutrition-week.png',date:monthYear(),
    options:[{id:'cal',label:'Show average calories',value:false}],
    build:o=>({stats:[{label:'Protein target hit',value:`${pHit} day${pHit===1?'':'s'}`},{label:'Hydration target hit',value:`${hHit} day${hHit===1?'':'s'}`}].concat(o.cal?[{label:'Avg calories',value:fmt(avgK)}]:[])})})}

/* ---------- events ---------- */
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.id;
  switch(a){
    case 'openDay':if(chartTip.firstTap())break;if(DAY_RE.test(b.dataset.d||'')){chartTip.hide();cur=b.dataset.d;view='today';render();scrollTo(0,0)}break;
    case 'prev':cur=shift(cur,-1);render();break;
    case 'next':cur=shift(cur,1);render();break;
    case 'today':cur=todayKey();render();break;
    case 'tab':go(b.dataset.v);break;
    case 'add':openAdd();break;
    case 'log':logItem(id);break;
    case 'logClose':closeModal();logItem(id);break;
    case 'rec':recSheet();break;
    case 'goal':{const p=prof();p.goal=b.dataset.k;p.rateKgWk=PACES[unitSys()].defaults[p.goal];save();render();break}
    case 'btype':{const p=prof(),k=b.dataset.k;p.bodyType=k;if(k!=='custom')p.pct={...BODY_TYPES[k].pct};save();render();break}
    case 'quiz':quiz={i:0,score:{ectomorph:0,mesomorph:0,endomorph:0}};renderQuiz();break;
    case 'quizPick':quiz.score[b.dataset.k]++;quiz.i++;renderQuiz();break;
    case 'quizApply':{const p=prof(),k=b.dataset.k;p.bodyType=k;p.pct={...BODY_TYPES[k].pct};save();closeModal();render();toast(BODY_TYPES[k].label+' split selected');break}
    case 'supp':toggleSupp(id,b.dataset.slot);break;
    case 'newSupp':suppForm();break;
    case 'editSupp':suppForm(id);break;
    case 'sources':go('help');setTimeout(()=>{const el=$('#sources');el&&el.scrollIntoView()},50);break;
    case 'dbPick':if(DB)dbForm(+b.dataset.i);break;
    case 'inc':{const en=(S.log[cur]||[]).find(x=>x.id===id);if(!en)break;
      if(en.kind==='drink'&&en.alc>0&&cur===todayKey()){addEntries([{...en,id:uid(),qty:1,t:Date.now()}],'Logged another '+en.name);break}
      stepEntry(id,en.kind==='drink'?1:0.25);break}
    case 'dec':stepEntry(id,(S.log[cur]||[]).find(x=>x.id===id)?.kind==='drink'?-1:-0.25);break;
    case 'editEntry':entryForm(id);break;
    case 'copyY':{const y=S.log[shift(cur,-1)]||[];addEntries(cloneEntries(y),'Copied '+y.length+' items');break}
    case 'usual':addEntries(cloneEntries(S.template),'Logged your usual day');break;
    case 'saveUsual':{const old=S.template;S.template=(S.log[cur]||[]).map(e=>({...e}));save();render();toast('Saved as your usual day',()=>{S.template=old;save();render()});break}
    case 'newFood':foodForm();break;
    case 'newDrink':drinkForm();break;
    case 'recipe':recipeForm();break;
    case 'editFood':foodForm(id);break;
    case 'editDrink':drinkForm(id);break;
    case 'fav':{const it=findItem(id);if(it){it.fav=!it.fav;save();render()}break}
    case 'libtab':libTab=b.dataset.v;uiSet('libTab',libTab);render();{const t=$('#lt-'+libTab);t&&t.focus()}break;
    case 'saveBackup':saveBackupNow();break;
    case 'exportJson':exportJson();break;
    case 'exportCsv':exportCsv();break;
    case 'import':startImport();break;
    case 'wipe':clearAll();break;
    case 'sync':closeDataMenu();if(SYNC)SYNC.open();break;
    case 'changeLoc':closeDataMenu();pickAndSave('nutrition-backup.json',backupText(),'application/json','json','json').then(r=>{if(r)markBackedUp(r==='file'?'Backup saved to '+jsonHandleName:'Backup downloaded')});break;
    case 'shareHyd':shareHydration();break;
    case 'shareWeek':shareWeek();break;
  }});
/* ---------- optional account sync (mb-sync.js) ----------
   One record per log entry, food, drink and supplement; settings, the usual-day template and each day's supplement checks are one record each.
   The last-backup time stays on this device; the theme and Library tab are kept outside the data already. */
function syncRecords(){const r={},st={...S.settings};delete st.lastBackup;r.settings=st;r.template=S.template;
  for(const x of S.foods)r['food:'+x.id]=x;for(const x of S.drinks)r['drink:'+x.id]=x;for(const x of S.supps||[])r['supp:'+x.id]=x;
  for(const d of Object.keys(S.log))for(const e of S.log[d])r['entry:'+d+':'+e.id]=e;
  for(const d of Object.keys(S.suppLog||{}))r['supplog:'+d]=S.suppLog[d];
  return r}
function syncApply(m){const list=pre=>Object.keys(m).filter(k=>k.startsWith(pre)).map(k=>m[k]).filter(isObj),log={},suppLog={};
  for(const k of Object.keys(m)){if(k.startsWith('entry:')){const d=k.slice(6,16);if(DAY_RE.test(d)&&isObj(m[k]))(log[d]||(log[d]=[])).push(m[k])}else if(k.startsWith('supplog:')&&isObj(m[k]))suppLog[k.slice(8)]=m[k]}
  Object.values(log).forEach(L=>L.sort((a,b)=>(a.t||0)-(b.t||0)));
  S=normalize({v:2,settings:{...(isObj(m.settings)?m.settings:S.settings),lastBackup:S.settings.lastBackup},foods:list('food:'),drinks:list('drink:'),supps:list('supp:'),log,suppLog,template:'template' in m?m.template:S.template});
  save();if(!curModal)render()}   // don't close a form someone is filling in
function updateSyncUI(st){const t=$('#dmSyncTitle'),sub=$('#dmSyncSub');if(!t)return;
  t.textContent=st.signedIn?'Sync: '+st.label:'Sync across devices…';sub.textContent=st.signedIn?st.email:'Optional free account. Your data stays on this device too'}
const isDefaultItem=x=>/^[fd]_/.test(x.id);
if(window.MBSync)SYNC=MBSync.create({app:'nutrition',label:'Nutrition',toRecords:syncRecords,fromRecords:syncApply,
  hasData:()=>Object.keys(S.log).length>0||(S.supps||[]).length>0||S.foods.some(x=>!isDefaultItem(x))||S.drinks.some(x=>!isDefaultItem(x)),onStatus:updateSyncUI});
else{const b=$('#dmSync');if(b)b.hidden=true}

function go(v){view=VIEWS[v]?v:'today';closeModal();closeDataMenu();render();window.scrollTo({top:0})}
/* brand = home link (kit v3 §3) */
document.querySelectorAll('a.brand[data-home]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();if(curModal)return;cur=todayKey();go('today')}));
/* Data menu */
$('#dataBtn').addEventListener('click',e=>{e.stopPropagation();$('#dataMenu').hidden?openDataMenu():closeDataMenu(true)});
document.addEventListener('click',e=>{const m=$('#dataMenu');if(!m.hidden&&!m.contains(e.target)&&!e.target.closest('#dataBtn'))closeDataMenu()});
$('#dataMenu').addEventListener('keydown',e=>{const items=[...$('#dataMenu').querySelectorAll('[role=menuitem]')],i=items.indexOf(document.activeElement);
  if(e.key==='ArrowDown'){e.preventDefault();items[(i+1)%items.length].focus()}else if(e.key==='ArrowUp'){e.preventDefault();items[(i-1+items.length)%items.length].focus()}
  else if(e.key==='Home'){e.preventDefault();items[0].focus()}else if(e.key==='End'){e.preventDefault();items[items.length-1].focus()}else if(e.key==='Tab')closeDataMenu()});
window.addEventListener('resize',()=>closeDataMenu());
/* theme: light unless the user picked dark (addendum "Always load light") */
function setTheme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem(THEME_KEY,t)}catch(e){}$('#themeSw').setAttribute('aria-checked',String(t==='dark'));
  document.querySelectorAll('[data-theme-pick]').forEach(r=>r.checked=r.value===t)}
$('#themeSw').setAttribute('aria-checked',String(document.documentElement.dataset.theme==='dark'));
$('#themeSw').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
document.addEventListener('change',e=>{if(e.target.matches('[data-theme-pick]'))setTheme(e.target.value)});
document.addEventListener('change',e=>{const k=e.target.dataset.set;if(!k)return;const el=e.target,s=S.settings;
  if(el.type==='checkbox'&&!k.startsWith('alg:')&&!k.startsWith('diet:'))s[k]=el.checked;else if(k==='unit')s.unit=el.value;else if(k==='waterMl')s.waterMl=r0(fromUnit(el.value));else if(k==='weight')s.weightKg=el.value===''?null:(isOz()?num(el.value)*LB_KG:num(el.value));else if(k==='sex')s.sex=el.value;
  else if(k.startsWith('alg:')){const a=k.slice(4),l=new Set(s.allergens||[]);el.checked?l.add(a):l.delete(a);s.allergens=[...l]}
  else if(k==='winStart'){s.winStart=el.value.trim();if(s.winStart)s.winEnd=addHM(s.winStart,r0((24-s.fastGoal)*60))}
  else if(k==='winEnd'){s.winEnd=el.value.trim();if(s.winStart&&s.winEnd){const w=((hm(s.winEnd)-hm(s.winStart))%1440+1440)%1440;
    if(w===0)toast('Start and end are the same time. Pick a later end.');else{s.fastGoal=Math.round((1440-w)/60*100)/100;s.fastCustom=!FAST_PRESETS.includes(s.fastGoal)}}}
  else if(k==='avoidWords')s[k]=el.value.trim();
  else if(['age','hft','hin','hcm','activity','bodyFat','formula','pace'].includes(k)){const pr=prof();
    if(k==='age')pr.age=el.value===''?null:Math.max(0,Math.min(110,Math.round(num(el.value))));else if(k==='activity')pr.activity=num(el.value);else if(k==='formula')pr.formula=el.value;
    else if(k==='pace')pr.rateKgWk=num(el.value);else if(k==='bodyFat')pr.bodyFat=num(el.value)>0?Math.max(3,Math.min(70,num(el.value))):null;
    else if(k==='hcm')pr.heightCm=num(el.value)||null;
    else{const ft=num($('#hft').value),inch=num($('#hin').value);pr.heightCm=ft||inch?(ft*12+inch)*2.54:null}}
  else if(k.startsWith('pct:')){const pr=prof();pr.bodyType='custom';pr.pct[k.slice(4)]=Math.max(0,Math.min(100,num(el.value)))}
  else if(k.startsWith('diet:')){const a=k.slice(5),l=new Set(s.diet||[]);el.checked?l.add(a):l.delete(a);s.diet=[...l]}
  else if(k==='style')s.style=el.value;
  else if(k==='fastGoal'){if(el.value==='custom')s.fastCustom=true;else{s.fastGoal=num(el.value);s.fastCustom=false}if(s.winStart)s.winEnd=addHM(s.winStart,r0((24-s.fastGoal)*60))}
  else if(k==='fastHours'){s.fastGoal=Math.max(1,Math.min(23.75,Math.round(num(el.value)*4)/4));s.fastCustom=!FAST_PRESETS.includes(s.fastGoal);if(s.winStart)s.winEnd=addHM(s.winStart,r0((24-s.fastGoal)*60))}else s[k]=num(el.value);
  const fid=el.id;save();render();toast('Saved');if(fid){const n=document.getElementById(fid);n&&n.focus()}});
/* keyboard: Esc closes the top layer, / opens search, Ctrl/Cmd+S saves a backup, Tab stays inside dialogs */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(curModal){e.preventDefault();const d=curModal.querySelector('.discard');if(d){d.remove();return}requestClose();return}if(!$('#dataMenu').hidden){closeDataMenu(true);return}}
  if(e.key==='Tab')trapTab(e);
  if((e.ctrlKey||e.metaKey)&&!e.altKey&&e.key.toLowerCase()==='s'){e.preventDefault();saveBackupNow();return}
  const typing=e.target.closest&&e.target.closest('input,textarea,select,[contenteditable="true"]');
  if(e.key==='/'&&!typing&&!curModal&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();openAdd()}
  if(e.target.matches&&e.target.matches('[role=tab]')&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){const tabs=[...document.querySelectorAll('[role=tab]')],i=tabs.indexOf(e.target),n=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];n.click()}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){const t=todayKey();if(cur===shift(t,-1)&&!curModal){cur=t;render()}}});
/* storage check once on load: if writes fail, the banner stays up (SUITE-STANDARDS §5) */
try{localStorage.setItem('nutrition.probe','1');localStorage.removeItem('nutrition.probe')}catch(e){storageOK=false}
$('#storeBanner').hidden=storageOK;
render();
if(loadNote)toast(loadNote,null,['Import Backup',startImport]);
firstRun();
MBInstall.registerSW('sw.js');
