/* Era dispatch, save migration, blueprints and rule cards shared by the new chapters. */
(function(root){
'use strict';
const H=root.HT,N=H.N,O=H.O,old={};
for(const k of ['newState','tick','automate','autoPrestige','load','save','format'])old[k]=H[k];
const registry=new Map(),starterCache=new Map();
H.Era={register(p){if(!Number.isInteger(p.id)||p.id<1||p.id>20||registry.has(p.id))throw Error('纪元注册冲突');registry.set(p.id,p);return p;},
  get:id=>registry.get(id),all:()=>[...registry.values()].sort((a,b)=>a.id-b.id)};
for(const st of H.Meta.STAGES)H.Era.register({id:st.era,roman:st.roman,name:st.name,symbol:st.symbol,
  tick:H.Meta.tick,automate:H.Meta.automate,prestige:s=>H.Meta.prestige(s,st.era-6),validate:()=>true});
const defaults=()=>({ord:null,eras:{},workshop:{enabled:true,rules:[],serial:0},blueprints:[],archive:{'11':{stars:Array(24).fill(0),records:{},generated:0}},legacy:{round:'0',points:'0',carry:[]}});
function ensure(s){const d=defaults();for(const k of Object.keys(d))if(s[k]===undefined)s[k]=d[k];return s;}
H.newState=()=>{const s=old.newState();Object.assign(s,defaults());s.v=5;return s;};
H.tick=(s,dt)=>{if(!Number.isFinite(dt)||dt<=0)return;const p=registry.get(s.era);if(p?.tick)p.tick(s,dt);else old.tick(s,dt);};
H.automate=s=>{const p=registry.get(s.era);return p?.automate?p.automate(s):old.automate(s);};
H.autoPrestige=s=>s.era>=6?undefined:old.autoPrestige(s);
function json(str,limit=3000000){
  if(typeof str!=='string'||str.length>limit)throw Error('存档长度超过预算');
  const x=JSON.parse(str),stack=[[x,0]];let count=0;
  while(stack.length){const[v,d]=stack.pop();if(++count>300000||d>96)throw Error('存档结构过深');if(v&&typeof v==='object')for(const k of Object.keys(v)){if(['__proto__','prototype','constructor'].includes(k))throw Error('存档含无效字段');stack.push([v[k],d+1]);}}
  return x;
}
function revive(v){
  if(Array.isArray(v))return v.map(revive);
  if(v&&typeof v==='object'){
    if(Object.hasOwn(v,'$O')){const a=v.$O;if(!Array.isArray(a)||a.length!==2||![-1,1].includes(a[0])||!Array.isArray(a[1])||!a[1].length||a[1].length>64||a[1].some(n=>typeof n!=='number'||!Number.isFinite(n)||n<0))throw Error('大数格式无效');const n=O.fromArray(a[1]);n.sign=a[0];return n;}
    return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,revive(x)]));
  }
  return v;
}
function bounded(n,min,max,label,integer=false){if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max||integer&&!Number.isInteger(n))throw Error(label+'无效');return n;}
const encode=s=>typeof btoa==='function'?btoa(unescape(encodeURIComponent(s))):Buffer.from(s,'utf8').toString('base64');
const decode=s=>typeof atob==='function'?decodeURIComponent(escape(atob(s))):Buffer.from(s,'base64').toString('utf8');
function blueprint(b){
  if(b?.id!==undefined&&!/^[a-zA-Z0-9_.-]{1,64}$/.test(String(b.id)))throw Error('蓝图编号无效');
  if(b&&Number.isInteger(b.era)&&b.era>=12&&b.era<=20){if(JSON.stringify(b).length>65536)throw Error('蓝图超过 64 KB');const p=registry.get(b.era);if(!p?.validateBlueprint)throw Error('不支持的纪元蓝图');return p.validateBlueprint(b);}
  if(!b||b.era!==11||b.kind!=='hydra'||JSON.stringify(b).length>65536||!b.payload)throw Error('不支持的蓝图');
  const tree=H.Hydra.canonical(H.Hydra.validate(b.payload.tree,96)),path=b.payload.path;
  const r=H.Hydra.replay(tree,path);if(!r.dead||r.cuts<1)throw Error('蓝图必须包含一条可验证的完整斩法');
  const source=b.source==='solver'?'solver':'manual';
  const quality=source==='solver'?.8:Math.min(3,1.2+1.8*Math.min(1,r.reward/27));
  let board;
  if(b.payload.board){board=H.Era.get(11)?.validateBoard(b.payload.board);if(!board)throw Error('基因晶格无效');}
  return {id:String(b.id||'bp').slice(0,64),name:String(b.name||'未命名蓝图').slice(0,48),era:11,kind:'hydra',source,quality,
    payload:{tree,path:JSON.parse(JSON.stringify(path)),...(board?{board}:{})},verified:{cuts:r.cuts,reward:r.reward}};
}
function starter(era,puzzle=0){bounded(era,11,20,'入门蓝图纪元',true);bounded(puzzle,0,23,'入门蓝图题号',true);const id='starter-'+era+'-'+puzzle;if(starterCache.has(id))return starterCache.get(id);let b;if(era===11){const p=H.Hydra.PUZZLES[3];b=blueprint({id,era:11,kind:'hydra',name:'九头·内置速杀',source:'solver',payload:{tree:p.tree,path:p.solution}});}else{const p=H.LateMath.puzzles(era)[puzzle];b=blueprint({id,era,kind:'era-'+era,name:H.Era.get(era).name+'·内置参考',source:'solver',payload:{puzzle,trial:-1,design:p.solution}});}starterCache.set(id,b);return b;}
H.Blueprint={validate:blueprint,starter,
  add(s,b){ensure(s);if(s.blueprints.length>=64)throw Error('蓝图库最多保存 64 张');const v=blueprint(b);v.id='bp-'+(++s.workshop.serial);s.blueprints.push(v);return v;},
  export:b=>'HTB5:'+encode(JSON.stringify(blueprint(b))),
  import(str){if(typeof str!=='string'||!str.startsWith('HTB5:')||str.length>90000)throw Error('蓝图开头应为 HTB5:');return blueprint(json(decode(str.slice(5)),65536));},
  get:(s,id)=>{const b=s.blueprints.find(b=>b.id===id);if(b)return b;const m=/^starter-(1[1-9]|20)-(\d{1,2})$/.exec(id);return m&&+m[2]<24?starter(+m[1],+m[2]):undefined;}};
const sensors=[['age','本纪元秒数'],['gear','当前齿位'],['study','累计研究坐标'],['heads','沙盒剩余头数'],['cut','沙盒当前刀数'],['quality','蓝图质量'],['ready','可对角化']];
const actions=[['buy','购买最便宜研究'],['diagonal','对角化'],['load','加载指定蓝图'],['auto','开启解析收割'],['strategy','最右最深斩法']];
function rule(r){
  if(!r||!sensors.some(x=>x[0]===r.sensor)||!actions.some(x=>x[0]===r.action))throw Error('规则卡语法无效');
  return {id:String(r.id||'card').slice(0,64),enabled:r.enabled!==false,group:bounded(r.group??0,0,7,'规则组',true),sensor:r.sensor,
    value:bounded(r.value??1,0,1e12,'阈值'),action:r.action,blueprint:String(r.blueprint||'').slice(0,64),cooldown:bounded(r.cooldown??5,1,86400,'冷却'),last:bounded(r.last??0,0,1e100,'规则时间'),upgrade:bounded(r.upgrade??0,0,5,'指定研究',true),era:bounded(r.era??0,0,20,'规则纪元',true)};
}
function read(s,k){if(s.era>=12)return H.Late.read(s,k);const x=s.eras['11'];switch(k){case'era':return s.era;case'age':return x.age;case'gear':return s.ord.gear;case'study':return x.study;case'heads':return H.Hydra.heads(x.arena.tree).length;case'cut':return x.arena.path.length;case'quality':return H.Era.get(11).quality(s);case'ready':return H.Era.get(11).ready(s)?1:0;}return 0;}
function available(s,r){if(r.era&&r.era!==s.era)return false;if(s.era>=12)return H.Late.ruleAvailable(s,r);const p=H.Era.get(11),x=s.eras['11'];if(r.action==='buyFixed')return p.canBuy(s,r.upgrade);if(r.action==='buy'){const i=p.cheapest(s);return i!==null&&p.canBuy(s,i);}
  if(r.action==='diagonal')return p.ready(s);if(r.action==='load')return !!H.Blueprint.get(s,r.blueprint)&&x.active!==r.blueprint;
  if(r.action==='auto')return !x.auto.harvest;if(r.action==='strategy')return x.strategy!=='deepest';return false;}
function act(s,r){if(s.era>=12)return H.Late.ruleAct(s,r);const p=H.Era.get(11),x=s.eras['11'];switch(r.action){case'buyFixed':return p.buy(s,r.upgrade);case'buy':return p.buyCheapest(s);case'diagonal':return p.diagonal(s);case'load':return p.activate(s,r.blueprint);case'auto':x.auto.harvest=true;return true;case'strategy':x.strategy='deepest';case'next':return H.Late?.enter(s,12);}return false;}
function run(s){const w=s.workshop,x=s.eras[String(s.era)];if(!w.enabled||!x||s.era===20&&x.challenge===2)return;const groups=new Set();for(const r of w.rules){
  if(!r.enabled||groups.has(r.group)||x.age+1e-8<r.last+r.cooldown||read(s,r.sensor)+1e-8<r.value)continue;
  groups.add(r.group);if(available(s,r)&&act(s,r))r.last=x.age;
}}
function next(s){
  if(s.era>=12)return H.Late.workshopNext(s);
  if(!s.workshop.enabled)return Infinity;const x=s.eras['11'],p=H.Era.get(11);let best=Infinity;
  for(const r of s.workshop.rules){
    if(!r.enabled)continue;let wait=0,v=read(s,r.sensor);
    if(v<r.value){if(r.sensor==='age')wait=r.value-v;else if(r.sensor==='study')wait=(r.value-v)/p.rate(s);else if(r.sensor==='gear'||r.sensor==='ready')wait=p.toBoundary(s);else continue;}
    else if(!available(s,r)){if(r.action==='buy')wait=p.nextBuy(s);else if(r.action==='diagonal')wait=p.toBoundary(s);else continue;}
    best=Math.min(best,Math.max(1,Math.ceil(Math.max(wait,r.last+r.cooldown-x.age)-1e-8)));
  }
  return best;
}
H.Workshop={sensors,actions,validate:rule,read,run,next,slots:s=>Math.min(32,4+Math.max(0,s.era-11)*2),
  add(s,r){if(s.workshop.rules.length>=H.Workshop.slots(s))throw Error('工坊卡槽已满');const v=rule(r);v.id='rule-'+(++s.workshop.serial);s.workshop.rules.push(v);return v;}};
H.load=str=>{
  const raw=json(str);if(!raw||![3,4,5].includes(raw.v))throw Error('不支持的存档版本');
  if(raw.v<5&&raw.era>10)throw Error('旧版本不包含此纪元');
  bounded(raw.era,1,20,'纪元',true);if(raw.era>10&&!registry.has(raw.era))throw Error('此纪元尚未安装');
  const requestedEra=raw.era,legacy={...raw,v:4,era:Math.min(10,raw.era)};
  const s=old.load(JSON.stringify(legacy));ensure(s);s.era=requestedEra;s.v=5;
  if(raw.v===5){
    for(const k of Object.keys(defaults()))if(raw[k]!==undefined)s[k]=revive(raw[k]);
    if(!s.eras||typeof s.eras!=='object'||Array.isArray(s.eras))throw Error('纪元进度无效');
    for(const id of Object.keys(s.eras)){const p=registry.get(Number(id));if(!p?.validate||+id<11)throw Error('未知的纪元模块');s.eras[id]=p.validate(s.eras[id],s);}
    if(!Array.isArray(s.blueprints)||s.blueprints.length>64)throw Error('蓝图库无效');s.blueprints=s.blueprints.map(blueprint);
    if(new Set(s.blueprints.map(b=>b.id)).size!==s.blueprints.length)throw Error('蓝图编号重复');
    const w=s.workshop;if(!w||!Array.isArray(w.rules)||w.rules.length>32)throw Error('规则卡无效');w.rules=w.rules.map(rule);w.enabled=!!w.enabled;bounded(w.serial,0,1e12,'工坊编号',true);
    const a=s.archive?.['11'];if(!a||!Array.isArray(a.stars)||a.stars.length!==24||a.stars.some(v=>!Number.isInteger(v)||v<0||v>3))throw Error('谜题星级无效');
    if(!a.records||typeof a.records!=='object'||Array.isArray(a.records)||Object.keys(a.records).length>200)throw Error('谜题纪录无效');
    for(const [id,r]of Object.entries(a.records)){if(!/^\d+$/.test(id)||+id>=24||!r||typeof r!=='object')throw Error('谜题纪录无效');bounded(r.cuts,1,128,'纪录刀数',true);bounded(r.reward,0,1e9,'纪录奖励');}
    bounded(a.generated,0,1e12,'生成题编号',true);
    if(!s.legacy||!/^\d{1,10000}$/.test(s.legacy.round)||!/^\d{1,10000}$/.test(s.legacy.points)||!Array.isArray(s.legacy.carry)||s.legacy.carry.length>32)throw Error('遗产数据无效');
    if(H.Late)H.Late.validateLegacy(s.legacy);
    for(const [id,a]of Object.entries(s.archive)){if(+id===11)continue;if(!registry.has(+id)||+id<12||!a||!Array.isArray(a.stars)||a.stars.length!==24||a.stars.some(v=>!Number.isInteger(v)||v<0||v>3)||!a.records||typeof a.records!=='object'||Array.isArray(a.records)||Object.keys(a.records).length>24)throw Error('谜题档案无效');bounded(a.generated,0,1e12,'生成题编号',true);for(const [k,v]of Object.entries(a.records)){if(!/^\d+$/.test(k)||+k>23)throw Error('谜题编号无效');bounded(v.score,0,1e9,'纪录得分');}}
    if(s.era>=11){if(!s.eras['11']||!s.eras[String(s.era)])throw Error('缺少当前纪元进度');const p=registry.get(s.era);p.validateOrd(s.ord);if(s.eras[String(s.era)].complete!==(s.ord.index===p.LABELS.length-1))throw Error('通关记录与序数阶不一致');if(H.Late)H.Late.validateLegacy(s.legacy);}
    else if(s.ord!==null){if(s.ord?.alpha?.type!=='epsilon'||!/^\d{1,10000}$/.test(s.ord.alpha.index))throw Error('迁移序数无效');}
  }else if(s.meta.started&&s.meta.rank===15)s.ord={era:10,alpha:{type:'epsilon',index:s.meta.epsilon}};
  return s;
};
H.save=s=>{if(s.era>=11)H.Era.get(s.era).syncHeight(s);return old.save(s);};
H.exportStr=s=>'HT5:'+encode(H.save(s));
H.importStr=str=>{str=String(str).trim();if(!/^HT[345]:/.test(str)||str.length>4000004)throw Error('存档开头应为 HT3:、HT4: 或 HT5:');return H.load(decode(str.slice(4)));};
H.V5={ensure,defaults,bounded,json,revive};
for(const n of [['fgh','FGH 坐标'],['hardy','Hardy 坐标'],['ordinal','序数名'],['landmark','里程碑对照']])H.Meta.NOTATIONS.push(n);
H.format=(x,mode)=>{if(x?.$ordnum)return H.Era.get(x.era).format(x,mode);if(['fgh','hardy','ordinal','landmark'].includes(mode))return old.format(x,mode==='fgh'?'hierarchy':'math');return old.format(x,mode);};
})(typeof self!=='undefined'?self:this);
