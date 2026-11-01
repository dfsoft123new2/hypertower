/* XI: finite hydra certificates power an analytically integrated ordinal game scale. */
(function(root){
'use strict';
const H=root.HT,N=H.N,O=H.O,D=H.Hydra,A=H.Ord,B=H.V5.bounded;
const LABELS=['ε_ω','ε_(ω+1)','ε_(ω²)','ε_(ω^ω)','ε_(ε₀)','ε_(ε_(ε₀))','ζ₀'];
const NAMES=['ε 的极限','再一次后继','平方下标','幂塔下标','不动点作下标','不动点的嵌套','第二不动点'];
const UP=[
  {id:0,name:'利刃',cap:8,desc:'提高解析斩击预算；P = 10↑↑(1 + 0.5·级)。标准残局保持原速、原规则。'},
  {id:1,name:'毒腺',cap:8,desc:'蓝图收获增加；沙盒每刀的基础蛇鳞仍为深度²，便于公平验题。'},
  {id:2,name:'再生抑制',cap:6,desc:'实验沙盒的复制数变为 max(1, n−级)；生产获得节省的计算预算。'},
  {id:3,name:'ε 标记',cap:3,desc:'解锁 ε₀[n] 有限基本序列砖。它是小于 ε₀ 的真序数，不等于 ε₀。'},
  {id:4,name:'自然和',cap:1,desc:'基因的行合计可改用可交换的 Hessenberg 和，避免整行被吸收。'},
  {id:5,name:'蛇蜕',cap:8,desc:'蓝图收获与永久研究效率提高；蓝图在离线时继续收获。'}
];
const TRIALS=[
  {name:'盲斩',rule:'隐藏树形图，只显示当前树的康托尔范式。'},
  {name:'九刀',rule:'生产蓝图必须在 9 刀内死亡；沙盒第 9 刀还活着就停止。'},
  {name:'左撇子',rule:'沙盒和生产蓝图都只能依次斩下最左边的头。'},
  {name:'无加法',rule:'基因晶格的非空行不得使用 +。可用「无加法种子」。'}
];
function defaultBoard(){const v=Array(49).fill('0'),h=Array(42).fill('+'),vertical=Array(42).fill('+');v[0]='w';v[1]='1';return {n:7,v,h,vertical,natural:false};}
function noPlusBoard(){const b=defaultBoard();for(let i=0;i<7;i++)b.v[i]=i===0?'w':'1';b.h.fill('*');return b;}
function arena(tree=[[[]]],puzzle=-1){const t=D.canonical(tree);return {initial:D.clone(t),tree:D.clone(t),path:[],reward:0,puzzle,aided:false,variant:false,inhibit:0};}
function newState(){return {age:0,study:0,forge:0,scales:N(0),kills:N(0),manual:0,up:[1,0,0,0,0,0],
  board:defaultBoard(),arena:arena(),active:'',auto:{harvest:true,buy:false,diagonal:false},strategy:'deepest',
  challenge:-1,clears:[0,0,0,0],challengeStart:0,trialStudy:0,complete:false,history:[],lastAuto:0};}
const x=s=>s.eras['11'];
function log(s,msg){const a=x(s);a.history.push({t:a.age,m:msg});a.history=a.history.slice(-40);s.log.push({t:s.time,m:msg});if(s.log.length>80)s.log=s.log.slice(-80);}
function gate(s){return s.era===10&&s.meta.started&&s.meta.bestRank===15&&BigInt(s.meta.bestEpsilon)>=10n;}
function enter(s){
  if(!gate(s))return false;H.V5.ensure(s);s.era=11;s.eras['11']=newState();s.ord={era:11,index:0,gear:1,coord:1,h:N(10)};
  s.won=true;s.star=s.star.max(H.OMEGA);s.best=s.best.max(H.OMEGA);s.spire=21;s.para.fill(3);s.inPara=-1;
  s.stars=H.STARS.map(a=>a.id);s.up.phi=Math.max(12,s.up.phi||0);s.meta.challenge=-1;
  const p=D.PUZZLES[3],b=s.blueprints.find(b=>b.era===11)||(s.blueprints.length>=64?H.Blueprint.starter(11):H.Blueprint.add(s,{era:11,kind:'hydra',name:'小蛇·速杀',source:'solver',payload:{tree:p.tree,path:p.solution}}));x(s).active=b.id;
  log(s,'第 XI 纪元开启：九头。I–X 已接入历史引擎。');return true;
}
function validateBoard(b){
  if(!b||b.n!==7||!Array.isArray(b.v)||b.v.length!==49||!Array.isArray(b.h)||b.h.length!==42||!Array.isArray(b.vertical)||b.vertical.length!==42)throw Error('基因晶格尺寸无效');
  if(b.v.some(v=>!['0','1','2','3','w','E0','E1','E2'].includes(v))||b.h.concat(b.vertical).some(v=>!['+','*','^'].includes(v)))throw Error('基因砖无效');
  return {n:7,v:b.v.slice(),h:b.h.slice(),vertical:b.vertical.slice(),natural:!!b.natural};
}
function token(t){return t==='w'?A.omega():t[0]==='E'?A.eps0(Number(t[1])):A.finite(t);}
function line(values,ops){
  const expression=values.map((v,i)=>(i?ops[i-1]:'')+'('+A.format(token(v)).replaceAll('ω','w').replaceAll('·','*')+')').join('');
  return A.parse(expression);
}
function evaluateBoard(s,b=x(s).board){
  const rows=[],cols=[],colErrors=[];let total=[];const absorbed=[];
  for(let r=0;r<7;r++){
    const a=line(b.v.slice(r*7,r*7+7),b.h.slice(r*6,r*6+6));rows.push(a);
    const sum=b.natural&&x(s).up[4]?A.natural(total,a):A.add(total,a);
    if(!b.natural&&total.length&&a.length&&A.compare(sum,a)===0)absorbed.push(r);total=sum;
  }
  for(let c=0;c<7;c++){try{cols.push(line(Array.from({length:7},(_,r)=>b.v[r*7+c]),Array.from({length:6},(_,r)=>b.vertical[r*7+c])));}catch(e){cols.push(null);colErrors[c]=e.message;}}
  return {rows,cols,colErrors,total,absorbed};
}
function boardPlus(b){for(let r=0;r<7;r++)if(b.v.slice(r*7,r*7+7).some(v=>v!=='0')&&b.h.slice(r*6,r*6+6).includes('+'))return true;return false;}
const leftmostProof=new WeakMap();
function permitted(s,b){
  const a=x(s);if(!b||b.era!==11)return false;
  if(a.challenge===1&&b.verified.cuts>9)return false;
  if(a.challenge===3&&boardPlus(a.board))return false;
  if(a.challenge===2){if(leftmostProof.has(b))return leftmostProof.get(b);let t=b.payload.tree;for(let i=0;i<b.payload.path.length;i++){const p=b.payload.path[i];if(p.join('.')!==D.heads(t)[0].join('.')){leftmostProof.set(b,false);return false;}t=D.cut(t,p,i+1).tree;}leftmostProof.set(b,true);}
  return true;
}
function active(s){const a=x(s),b=H.Blueprint.get(s,a.active);return permitted(s,b)?b:null;}
function quality(s){return x(s).auto.harvest?(active(s)?.quality||.6):.6;}
function stars(s){return s.archive['11'].stars.reduce((a,b)=>a+b,0);}
function rate(s){const a=x(s);if(a.complete&&s.ord.gear===10&&s.ord.coord>=10&&a.challenge<0)return 0;
  const q=Math.min(3,(1+.04*Math.min(24,stars(s)))*(.6+.4*quality(s))),research=1+.012*a.up.reduce((n,k)=>n+k,0),trial=1+.02*a.clears.reduce((n,k)=>n+k,0);
  return .020*q*research*trial*(a.challenge<0?1:.88)*1.05*(H.Late?H.Late.legacyMultiplier(s):1);
}
const minCoord=k=>k===1?1:2;
function ready(s){const o=s.ord;return o.gear===10&&o.coord>=10-1e-8&&o.index<6;}
function height(o){return N(10).arrow(o.gear)(Math.max(minCoord(o.gear),Math.min(10,o.coord))).min(H.OMEGA);}
function syncHeight(s){s.ord.h=height(s.ord);return s.ord.h;}
function value(s){const o=s.ord;return {$ordnum:true,era:11,index:o.index,gear:o.gear,coord:o.coord,h:height(o)};}
function format(v,mode){
  const alpha=LABELS[v.index],coord=v.coord.toFixed(5),hh='10'+(v.gear===1?'^':v.gear<=4?'↑'.repeat(v.gear):'{'+v.gear+'}')+coord;
  if(mode==='ordinal')return alpha+' · 第 '+v.gear+' 档 · '+coord;
  if(mode==='landmark')return NAMES[v.index]+' · '+alpha+' · '+hh;
  if(mode==='hardy')return 'H⟨'+alpha+'⟩('+hh+')';
  if(mode==='array')return '⟦'+alpha+'; 10, '+coord+', '+v.gear+'⟧';
  return (mode==='scientific'?'F⟨':'f⟨')+alpha+'⟩('+hh+')';
}
function diagonal(s){
  if(!ready(s))return false;const o=s.ord;o.index++;o.gear=1;o.coord=1;syncHeight(s);log(s,'对角化：抵达 '+LABELS[o.index]);
  if(o.index===6){x(s).complete=true;log(s,'ζ₀ 已稳定。v5.0 的九头纪已完成，蓝图与谜题可继续优化。');}return true;
}
const COSTS=Array.from({length:9},(_,level)=>O.tetrate(10,2+1.5*level));
const SPEEDS=Array.from({length:9},(_,level)=>O.tetrate(10,1+.5*level));
function cost(s,i){return COSTS[x(s).up[i]];}
function canBuy(s,i){return Number.isInteger(i)&&i>=0&&i<6&&x(s).up[i]<UP[i].cap&&x(s).scales.gte(cost(s,i));}
function buy(s,i){if(!canBuy(s,i))return false;const a=x(s);a.scales=a.scales.sub(cost(s,i)).max(0);a.up[i]++;return true;}
function cheapest(s){let best=null;for(let i=0;i<6;i++)if(x(s).up[i]<UP[i].cap&&(best===null||cost(s,i).lt(cost(s,best))))best=i;return best;}
function buyCheapest(s){const i=cheapest(s);return i!==null&&buy(s,i);}
function yieldRate(s){const a=x(s),b=a.auto.harvest?active(s):null;if(!b)return 0;
  return b.verified.reward/Math.max(1,b.verified.cuts)*(1+.14*a.up[0])*(1+.10*a.up[1])*(1+.035*a.up[2])*(1+.05*a.up[5]);
}
function nextBuy(s){const a=x(s),i=cheapest(s);if(i===null)return Infinity;if(canBuy(s,i))return 1;const y=yieldRate(s);if(!y)return Infinity;
  return Math.max(1,Math.ceil((2+1.5*a.up[i]+.00001-(3+a.forge*.002))/(y*.002)-1e-8));
}
function activate(s,id){if(H.Blueprint.get(s,id)?.era!==11)return false;const a=x(s);if(a.active===id)return false;a.active=id;return true;}
function toBoundary(s){const r=rate(s);return r>0?Math.max(0,(10-s.ord.coord)/r):Infinity;}
function challengeCheck(s){const a=x(s),id=a.challenge;if(id<0)return;if(a.trialStudy>=8*(a.clears[id]+1)-1e-7){a.clears[id]++;a.challenge=-1;log(s,'证明「'+TRIALS[id].name+'」第 '+a.clears[id]+' 层。');}}
function automate(s){const a=x(s);if(!a)return;
  if(a.auto.buy)for(let j=0;j<6;j++)if(!buyCheapest(s))break;
  if(a.auto.diagonal)diagonal(s);H.Workshop.run(s);challengeCheck(s);
}
function integrate(s,t){
  const a=x(s),r=rate(s),y=yieldRate(s),b=active(s),oldForge=a.forge;
  s.time+=t;s.runT+=t;a.age+=t;a.study+=r*t;s.ord.coord=Math.min(10,s.ord.coord+r*t);
  if(a.challenge>=0&&a.auto.harvest&&b)a.trialStudy+=r*t;
  a.forge=Math.min(499998500,a.forge+y*t);const newForge=3+a.forge*.002;
  if(y>0){const previous=a._potentialKey===oldForge?a._potential:O.tetrate(10,3+oldForge*.002),potential=O.tetrate(10,newForge);a._potentialKey=a.forge;a._potential=potential;
    a.scales=a.scales.add(potential.sub(previous).max(0));a.kills=a.kills.add(SPEEDS[a.up[0]].mul(t).div(b.verified.cuts));}
  const m=s.meta;m.age+=t;m.runSec+=t;for(let i=0;i<5;i++){m.stageSec[i]+=t;const amount=H.Meta.passive(s,i)*1000*t;m.currency[i]=Math.min(1e100,m.currency[i]+amount);m.total[i]=Math.min(1e100,m.total[i]+amount);}
}
function tick(s,dt){
  const current=x(s),boundary=toBoundary(s);
  // A display frame cannot reach a future one-second rule event. Avoid inspecting
  // the entire rule deck and shop twenty times a second.
  if(dt<=.25&&dt<current.lastAuto+1-current.age-1e-8&&dt<(boundary>1e-8?boundary:Infinity)-1e-8){integrate(s,dt);return;}
  let left=dt,guard=0;
  while(left>1e-8){
    if(++guard>10000)throw Error('自动机事件过密');const a=x(s),o=s.ord;
    // All scheduled events occur on whole seconds; gear boundaries are exact.
    const boundary=toBoundary(s);let event=Infinity;
    if(a.auto.buy)event=nextBuy(s);
    event=Math.min(event,H.Workshop.next(s));
    if(a.challenge>=0&&a.auto.harvest&&active(s)){const rem=8*(a.clears[a.challenge]+1)-a.trialStudy;event=Math.min(event,Math.max(1,rem/Math.max(1e-12,rate(s))));}
    let step=Math.min(left,boundary>1e-8?boundary:Infinity,event);if(!Number.isFinite(step))step=left;
    if(step<=1e-8)step=Math.min(left,1);
    integrate(s,step);left-=step;
    if(o.coord>=10-1e-8){o.coord=10;if(o.gear<10){o.gear++;o.coord=2;}else if(a.auto.diagonal)diagonal(s);}
    if(a.age-a.lastAuto>=1-1e-8||step>=event-1e-8){a.lastAuto=a.age;automate(s);}
  }
}
function hatch(s){const a=x(s);if(a.challenge===3&&boardPlus(a.board))throw Error('无加法挑战：非空行里不能出现 +');const v=evaluateBoard(s),tree=D.fromOrdinal(v.total,96);if(!tree.length)throw Error('基因总和是 0；至少需要一个头');a.arena=arena(tree);return v;}
function loadPuzzle(s,id){const p=D.PUZZLES[id];if(!p)throw Error('谜题不存在');x(s).arena=arena(p.tree,id);return p;}
function chop(s,path){const a=x(s),v=a.arena;
  if(v.path.length>=128)throw Error('已到 128 刀的有限验证预算。可撤销或换一条小蛇；进度与资源保留。');
  if(a.challenge===2&&path.join('.')!==D.heads(v.tree)[0]?.join('.'))throw Error('左撇子挑战：只能选择最左边的头');
  if(a.challenge===1&&v.path.length>=9)throw Error('已到 9 刀；可撤销或重新孵化');
  const r=D.cut(v.tree,path,v.path.length+1,{maxNodes:512,inhibit:v.variant?v.inhibit:0});if(!r)throw Error('再生后超过 512 节点。请撤销或选一条更小的蛇；不扣资源。');
  v.tree=r.tree;v.path.push(path);v.reward+=r.reward;return r;
}
function undo(s){const a=x(s).arena;if(!a.path.length)return false;a.path.pop();const r=D.replay(a.initial,a.path,{inhibit:a.variant?a.inhibit:0});a.tree=r.tree;a.reward=r.reward;return true;}
function resetArena(s){const a=x(s).arena;const v=arena(a.initial,a.puzzle);v.aided=a.aided;v.variant=a.variant;v.inhibit=a.inhibit;x(s).arena=v;}
function autoHead(s){const a=x(s),hs=D.heads(a.arena.tree);if(!hs.length)return null;if(a.challenge===2||a.strategy==='leftmost')return hs[0];return hs.reduce((best,p)=>p.length>=best.length?p:best,hs[0]);}
function submit(s,name){
  const a=x(s),v=a.arena;if(v.variant)throw Error('抑制实验使用修改规则，不能作为标准残局或生产证明');
  const r=D.replay(v.initial,v.path);if(!r.dead)throw Error('蛇还活着；请先完成斩法再提交');
  const p=D.PUZZLES[v.puzzle];let earned=0;
  if(p){
    if(D.key(v.initial)!==D.key(p.tree))throw Error('初始树与这道残局不一致');
    if(r.cuts>p.maxCuts||p.kind==='exact'&&r.cuts!==p.target||p.kind==='reward'&&r.reward<p.target)throw Error('已屠蛇，但还没满足本题目标。可以撤销继续尝试。');
    earned=p.kind==='kill'?(r.cuts<=p.optimal?3:r.cuts<=p.optimal+1?2:1):p.kind==='exact'?3:r.reward>=p.reward?3:r.reward>=p.target?2:1;
    const ar=s.archive['11'];ar.stars[p.id]=Math.max(ar.stars[p.id],earned);const prev=ar.records[p.id];
    if(!prev||(p.kind==='reward'?r.reward>prev.reward:r.cuts<prev.cuts))ar.records[p.id]={cuts:r.cuts,reward:r.reward,aided:v.aided};
  }
  const bp=H.Blueprint.add(s,{era:11,kind:'hydra',name:name||p?.name||'基因·'+A.format(D.ordinal(v.initial)),source:v.aided?'solver':'manual',payload:{tree:v.initial,path:v.path}});
  a.active=bp.id;a.manual++;return {blueprint:bp,stars:earned,cuts:r.cuts,reward:r.reward};
}
function trial(s,id){const a=x(s);if(!Number.isInteger(id)||id<0||id>3||a.clears[id]>=3)return false;a.challenge=id;a.challengeStart=a.study;a.trialStudy=0;return true;}
function generated(seed){let v=(seed>>>0)||1;const rng=()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return v;};const t=[];
  for(let i=0,k=1+rng()%3;i<k;i++)t.push(rng()%2?[[]]:[]);if(D.size(t)>10)throw Error('生成预算异常');return D.canonical(t);}
function validateOrd(o){if(!o||o.era!==11)throw Error('序数坐标无效');B(o.index,0,6,'序数阶',true);B(o.gear,1,10,'齿位',true);B(o.coord,minCoord(o.gear),10,'齿内坐标');if(o.h!==undefined&&(!(o.h instanceof O)||o.h.sign<0||o.h.array.some(v=>!Number.isFinite(v))))throw Error('英雄数高度无效');o.h=height(o);return o;}
function validate(v){
  if(!v||typeof v!=='object'||Array.isArray(v))throw Error('九头纪进度无效');const d={...newState(),...v};
  for(const k of ['age','study','forge','manual','challengeStart','trialStudy','lastAuto'])B(d[k],0,1e100,k);
  for(const k of ['scales','kills'])if(!(d[k] instanceof O)||d[k].sign<0||d[k].array.some(v=>!Number.isFinite(v)))throw Error('蛇鳞数值无效');
  if(!Array.isArray(d.up)||d.up.length!==6)throw Error('研究数据无效');d.up.forEach((v,i)=>B(v,0,UP[i].cap,'研究等级',true));
  if(!Array.isArray(d.clears)||d.clears.length!==4)throw Error('挑战数据无效');d.clears.forEach(v=>B(v,0,3,'挑战层',true));B(d.challenge,-1,3,'当前挑战',true);
  d.board=validateBoard(d.board);d.active=String(d.active).slice(0,64);if(!['deepest','leftmost'].includes(d.strategy))throw Error('斩法策略无效');
  d.auto={harvest:!!d.auto?.harvest,buy:!!d.auto?.buy,diagonal:!!d.auto?.diagonal};d.complete=!!d.complete;
  const a=d.arena;if(!a||!Array.isArray(a.path))throw Error('沙盒无效');D.validate(a.initial,96);B(a.puzzle,-1,23,'谜题编号',true);a.aided=!!a.aided;a.variant=!!a.variant;
  a.inhibit=a.inhibit===undefined?d.up[2]:B(a.inhibit,0,6,'实验复制抑制',true);
  if(a.puzzle>=0&&D.key(a.initial)!==D.key(D.PUZZLES[a.puzzle].tree))throw Error('残局初始树不一致');
  const r=D.replay(a.initial,a.path,{inhibit:a.variant?a.inhibit:0});a.tree=r.tree;a.reward=r.reward;
  d.history=Array.isArray(d.history)?d.history.slice(-40).map(h=>({t:B(h.t,0,1e100,'记录时间'),m:String(h.m).slice(0,300)})):[];return d;
}
const plugin=H.Era.register({id:11,roman:'XI',name:'九头',symbol:'⟡',gate,newState,enter,tick,automate,offline:tick,validate,validateOrd,validateBoard,
  LABELS,NAMES,UP,TRIALS,defaultBoard,noPlusBoard,state:x,arena,rate,stars,quality,active,permitted,value,format,syncHeight,ready,diagonal,cost,canBuy,buy,cheapest,buyCheapest,nextBuy,toBoundary,yieldRate,activate,
  evaluateBoard,hatch,loadPuzzle,chop,undo,resetArena,autoHead,submit,trial,generated});
const achievements=[
  ['九头纪','开启第 XI 纪元',s=>s.era>=11],['第一刀','完成一次九头蛇沙盒斩击',s=>!!s.eras?.['11']?.arena.path.length],
  ['一张证明','提交一张经过验证的生产蓝图',s=>s.eras?.['11']?.manual>=1],['十二颗星','残局累计获得 12 星',s=>s.era>=11&&stars(s)>=12],
  ['残局学徒','24 道残局全部完成',s=>s.archive?.['11']?.stars.every(n=>n>0)],['无可挑剔','24 道残局全部三星',s=>s.archive?.['11']?.stars.every(n=>n===3)],
  ['对角化','进入 ε_(ω+1)',s=>s.era>=11&&s.ord.index>=1],['ε 的嵌套','进入 ε_(ε₀)',s=>s.era>=11&&s.ord.index>=4],
  ['ζ₀','完成九头纪六次对角化',s=>!!s.eras?.['11']?.complete],['十二层斩法','完成九头纪全部 12 层挑战',s=>s.eras?.['11']?.clears.every(n=>n===3)],
  ['自动机匠','工坊拥有四张规则卡',s=>s.workshop?.rules.length>=4]
];H.ACH.push(...achievements);
H.Eleven=plugin;
})(typeof self!=='undefined'?self:this);
