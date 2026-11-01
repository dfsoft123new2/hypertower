/* HYPERTOWER IV: symbolic magnitudes and the post-Omega campaign.
 * OmegaNum remains responsible for the original finite-arrow arithmetic.
 * Magnitude is a lexicographic game scale, NOT an exact transfinite FGH evaluator.
 * Each research rung is a separate scale; bounded lattice efficiency prevents
 * symbolic promotion from becoming an unbounded production multiplier.
 */
(function (root) {
'use strict';
const H = root.HT, O = H.O, N = H.N;
const base = {};
for (const k of ['newState','load','save','tick','automate','autoPrestige','arrange','latticeValue','latCtx','lineVal','slotVal','latMult','phi','digitCap','buyDigit','buyDigitsCheapest','digitCost','checkAch','starRate']) base[k] = H[k];
const finite = (v, fallback = 0) => Number.isFinite(v) ? v : fallback;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, finite(v, lo)));
const sum = a => a.reduce((n, x) => n + x, 0);
const dec = (n, p = 2) => Number(n.toFixed(p)).toLocaleString('en-US', {maximumFractionDigits:p});
const compactIndex = n => {
  const s = String(n); return s.length <= 12 ? s : s.slice(0, 1) + '.' + s.slice(1, 4) + 'e' + (s.length - 1);
};
const integerLog = s => s.length<15?Math.log10(1+Number(s)):Math.log10(Number(s.slice(0,15)))+s.length-15;
const LADDER = [
  ['Ω 之外','10{10^h}10','箭头数成为指数','嵌套'],
  ['塔作箭数','10{10↑↑h}10','箭头数本身是一座幂塔','嵌套'],
  ['箭数再嵌套','10{10{10↑↑h}10}10','用嵌套箭头决定箭头数','嵌套'],
  ['对角线','H_{ω+h}(h)','跨过每一个固定有限箭头层','扩张'],
  ['第二条对角线','H_{ω·2+h}(h)','重复一整条有限层阶梯','扩张'],
  ['对角线之塔','H_{ω·h}(h)','让对角线的数量也增长','扩张'],
  ['平方序列','H_{ω²}(h)','将扩张序列作为新的单位','阵列'],
  ['立方序列','H_{ω³}(h)','把阵列再次组成阵列','阵列'],
  ['幂次阵列','H_{ω^h}(h)','让阵列的维数持续增长','阵列'],
  ['无尽维度','H_{ω^ω}(h)','穿过所有有限维数','维度'],
  ['维度复合','H_{ω^(ω²)}(h)','维度的指数也成为阵列','维度'],
  ['维度之塔','H_{ω^(ω^ω)}(h)','把无尽维度叠成幂塔','维度'],
  ['序数幂塔','H_{ω↑↑h}(h)','ω 的幂塔不断加高','超限'],
  ['不动点前夜','H_{ω↑↑(ω+h)}(h)','沿不动点的基本序列继续研究','超限'],
  ['第一不动点','H_{ε₀[h]}(h)','稳定 ε₀ 之前的最后一层','超限'],
  ['ε₀','H_{ε₀}(h)','进入没有预设终点的 ε 序列','无尽'],
];
const ORD = ['10^h','10↑↑h','10{10↑↑h}10','ω+h','ω·2+h','ω·h','ω²','ω³','ω^h','ω^ω','ω^(ω²)','ω^(ω^ω)','ω↑↑h','ω↑↑(ω+h)','ε₀[h]'];
class Magnitude {
  constructor(rank = 0n, height = 10) {
    this.rank = BigInt(rank); if (this.rank < 0n) throw new RangeError('Negative hierarchy');
    this.height = clamp(height, 1, 1e100);
    Object.freeze(this);
  }
  cmp(other) {
    if (!(other instanceof Magnitude)) return 1;
    return this.rank < other.rank ? -1 : this.rank > other.rank ? 1 : Math.sign(this.height - other.height);
  }
  gt(x) { return this.cmp(x) > 0; } gte(x) { return this.cmp(x) >= 0; }
  lt(x) { return this.cmp(x) < 0; } lte(x) { return this.cmp(x) <= 0; } eq(x) { return this.cmp(x) === 0; }
  max(x) { return this.gte(x) ? this : x; }
  add(x) { return x instanceof Magnitude && x.gt(this) ? x : this; }
  pow() { return this; }
  toString() { return formatMagnitude(this, 'math'); }
  toJSON() { return {$M:[String(this.rank),this.height]}; }
}
function ordinal(rank) { return rank < 15n ? ORD[Number(rank)] : 'ε_' + compactIndex(rank - 15n); }
function formatMagnitude(x, mode) {
  const h = dec(x.height), r = x.rank, a = ordinal(r).replaceAll('h', h);
  if (mode === 'scientific' || mode === 'engineering' || mode === 'letters' || mode === 'chinese') return 'F⟨' + a + '⟩' + h;
  if (mode === 'hierarchy') return 'H⟨' + a + '⟩(' + h + ')';
  if (mode === 'array') {
    if (r === 0n) return '{10, 10, {10, ' + h + ', 1}}';
    if (r === 1n) return '{10, 10, {10, ' + h + ', 2}}';
    if (r === 2n) return '{10, 10, {10, 10, {10, ' + h + ', 2}}}';
    return '⟦' + a + '; ' + h + '⟧';
  }
  if (r === 0n) return '10{10^' + h + '}10';
  if (r === 1n) return '10{10↑↑' + h + '}10';
  if (r === 2n) return '10{10{10↑↑' + h + '}10}10';
  return 'H⟨' + a + '⟩(' + h + ')';
}
const NOTATIONS = [
  ['math','数学排版'],['scientific','科学计数 · e → F → G'],['arrow','高德纳箭头'],['array','阵列'],
  ['hierarchy','层级坐标'],['engineering','工程计数'],['letters','K / M / B 短级'],['chinese','中文万进'],
];
function format(x, mode = 'math') {
  if (x instanceof Magnitude) return formatMagnitude(x, mode);
  x = N(x);
  if (mode === 'math') return H.fmt(x);
  if (x.sign < 0) return '−' + format(x.abs(), mode);
  if (x.eq(0)) return '0';
  const k = H.topLevel(x) + 1;
  if (mode === 'hierarchy') return 'H_' + k + '(' + H.fmtH(H.H(x, k)) + ')';
  if (mode === 'arrow' || mode === 'array') {
    if (x.lt(1e6)) return H.fmt(x);
    const h = H.fmtH(H.H(x, k));
    return mode === 'array' ? '{10, ' + h + ', ' + k + '}' : '10' + (k === 1 ? '^' : k <= 4 ? '↑'.repeat(k) : '{' + k + '}') + h;
  }
  const exponent = H.lg(x);
  if (Number.isFinite(exponent) && exponent < 300 && x.gte(1e3)) {
    const short = ['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc'];
    const cn = ['','万','亿','兆','京','垓','秭','穰','沟','涧','正','载','极','恒河沙','阿僧祇','那由他','不可思议','无量大数'];
    const step = mode === 'chinese' ? 4 : 3;
    const units = mode === 'chinese' ? cn : short;
    const u = Math.floor(exponent / step);
    if ((mode === 'letters' || mode === 'chinese') && u > 0 && u < units.length) return dec(x.div(O.pow(10, u * step)).toNumber()) + units[u];
    if (mode === 'engineering') {
      const e = Math.floor(exponent / 3) * 3; let m = x.div(O.pow(10,e)).toNumber(), ee = e;
      if (m >= 999.995) { m = 1; ee += 3; }
      return dec(m) + 'e' + ee;
    }
  }
  const m = H.topLevel(x), a = x.array;
  if (m <= 1 && (m === 0 || a[1] <= 4)) {
    if (m === 0) {
      if (x.lt(1e6)) return H.fmt(x);
      let e = Math.floor(exponent), mant = x.div(O.pow(10,e)).toNumber();
      if (mant >= 9.995) {mant = 1;e++;} return mant.toFixed(2) + 'e' + e;
    }
    return H.fmt(x);
  }
  const letters = ['','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z'];
  return (letters[k] || 'F[' + k + ']') + H.fmtH(H.H(x,k));
}
const STAGES = [
  {era:6,roman:'VI',name:'嵌套',action:'坍缩',symbol:'◎',currency:'坍缩核',op:'⇑',opname:'箭数符',threshold:0,grid:5,blurb:'让右侧的数字成为箭头的数量；让箭头数本身成为幂塔。'},
  {era:7,roman:'VII',name:'扩张',action:'延展',symbol:'✶',currency:'延展尘',op:'ω+',opname:'对角线算符',threshold:3,grid:6,blurb:'沿有限箭头层的对角线扩张，晶格扩展到 6×6。'},
  {era:8,roman:'VIII',name:'阵列',action:'铺阵',symbol:'▦',currency:'阵列元',op:'ω²',opname:'阵列算符',threshold:6,grid:7,blurb:'把一条超限阶梯组成阵列，再组成阵列的阵列。晶格扩展到 7×7。'},
  {era:9,roman:'IX',name:'维度',action:'升维',symbol:'◈',currency:'维度弦',op:'ω^ω',opname:'维度算符',threshold:9,grid:7,blurb:'把阵列的维数也变成不断增长的层级，直到维度之塔。'},
  {era:10,roman:'X',name:'超限',action:'超限',symbol:'✺',currency:'超限光',op:'ε',opname:'不动点算符',threshold:12,grid:7,blurb:'向 ε₀ 的不动点推进，再开启 ε₁、ε₂……的无尽研究。'},
];
const UPG = [
  {id:'drive',name:'层深引流',base:1,growth:1.7,cap:20,desc:'本纪元研究速度每级 +20%。'},
  {id:'flux',name:'货币回响',base:3,growth:2,cap:12,desc:'本纪元货币的被动产量每级 +35%，转生收益每级 +8%。'},
  {id:'devour',name:'吞噬共鸣',base:4,growth:2.2,cap:12,desc:'缩短吞噬间隔并增加回响。间隔最低 6 秒，回响增益最高 40%。'},
  {id:'operator',name:'复制超限算符',base:7,growth:3,cap:5,desc:'再获得一块本纪元的超限算符，可以在同一行中再次嵌套。'},
  {id:'auto',name:'研究自动化',base:5,growth:1,cap:1,desc:'解锁本纪元的自动稳定、自动购买和跨纪元转生。请在下方勾选启用。'},
  {id:'memory',name:'谱系记忆',base:10,growth:2.2,cap:10,desc:'φ +0.1，并加快已完成纪元的重建。永久保留。'},
];
const TRIALS = [
  {name:'孤塔公理',era:6,rule:'只有 λ 所在的一行提供晶格效率，研究速度 ×0.75。',reward:'每层永久增加 12% 研究速度。',goal:2},
  {name:'冷核公理',era:7,rule:'λ 吞噬停止，回响归零。',reward:'每层永久增加 20% 货币收益。',goal:5},
  {name:'无序公理',era:8,rule:'晶格的算符数量不增加效率，只保留种类加成。',reward:'每层永久增加 φ 0.2 和 6% 研究速度。',goal:8},
  {name:'失忆公理',era:9,rule:'重建已完成纪元的速度倍率最多 ×5。',reward:'每层永久增加 8% 研究速度及重建倍率。',goal:11},
];
for (const st of STAGES) { H.OPS.push(st.op); H.OPNAME.push(st.opname); }
function newMeta() {
  return {started:false,rank:0,progress:0,epsilon:'0',age:0,runSec:0,stageSec:[0,0,0,0,0],currency:[0,0,0,0,0],total:[0,0,0,0,0],count:[0,0,0,0,0],
    up:Array.from({length:5},()=>Object.fromEntries(UPG.map(u=>[u.id,0]))),focus:'growth',auto:{advance:false,shop:false,prestige:false},
    echo:0,swallows:0,devourClock:0,lastRow:-1,lambdaFloor:null,bestRank:0,bestEpsilon:'0',bestProgress:0,
    challenge:-1,clears:[0,0,0,0],proofs:Array(15).fill(false),history:[],endlessAt:0};
}
function ensure(s) { return s.meta || (s.meta = newMeta()); }
const unlocked = s => Math.max(0, s.era - 6);
const up = (s,i,id) => ensure(s).up[i]?.[id] || 0;
const allUp = (s,id) => sum(ensure(s).up.map(u=>u[id] || 0));
const enabled = s => !!s.meta?.started;
const ceiling = s => (unlocked(s) + 1) * 3;
const canEnter = s => s.won || s.best.gte(H.OMEGA);
const cost = (s,i,id) => {const u=UPG.find(u=>u.id===id);return Math.ceil(u.base*Math.pow(u.growth,up(s,i,id)) - 1e-9);};
function log(s,msg) {
  const x=ensure(s); x.history.push({t:s.time,m:msg}); if(x.history.length>60)x.history.shift();
  s.log.push({t:s.time,m:msg}); if(s.log.length>30)s.log.shift();
}
function value(s) {
  const x=ensure(s); return new Magnitude(BigInt(x.rank) + (x.rank===15 ? BigInt(x.epsilon) : 0n),10+x.progress*.9);
}
function lambda(s) {
  const x=ensure(s); let v=new Magnitude(BigInt(Math.max(0,x.rank-1)),10+Math.min(90,x.progress*.35+x.echo));
  if(x.lambdaFloor) v=v.max(new Magnitude(x.lambdaFloor.rank,x.lambdaFloor.height)); return v;
}
function finiteHeight(x) { return Math.min(100,Math.max(1,H.lg(N(x).add(10)))); }
function maxMag(a,b) { return a instanceof Magnitude ? a.max(b) : b instanceof Magnitude ? b : a.max(b); }
function apply(id,a,b) {
  if(id>=12) {
    if(!(a instanceof Magnitude) && a.lte(1))return a;
    const min=BigInt([0,3,6,9,12][id-12]||0);
    let r=min;
    if(b instanceof Magnitude)r=r>b.rank+1n?r:b.rank+1n;
    if(a instanceof Magnitude)r=r>a.rank?r:a.rank;
    return new Magnitude(r,b instanceof Magnitude?b.height+1:finiteHeight(b)*8+10);
  }
  if(a instanceof Magnitude || b instanceof Magnitude) {
    const v=maxMag(a,b);
    return new Magnitude(v.rank,v.height + (id>=2?.02*Math.min(id,10):0));
  }
  if(id===0)return a.add(b); if(id===1)return a.mul(b); if(id===2)return a.pow(b); if(id===3)return a.tetrate(b);
  return a.arrow(id-1)(b);
}
function evalSeq(vals,ops,lo,hi) {
  if(lo===hi)return vals[lo]; let p=Infinity,k=lo;
  for(let i=lo;i<hi;i++)if(ops[i]<p){p=ops[i];k=i;}
  return apply(ops[k],evalSeq(vals,ops,lo,k),evalSeq(vals,ops,k+1,hi));
}
function ctx(s) { return {...base.latCtx(s),lamOn:true,lam:lambda(s),meta:true}; }
function lineVal(lat,ln,c) {
  if(!c.meta)return base.lineVal(lat,ln,c);
  const vals=ln.sl.map(i=>i===lat.lam?c.lam:N(Math.max(1,lat.d[i]+c.dBonus)));
  return evalSeq(vals,ln.op.map(([t,i])=>lat[t][i]),0,vals.length-1);
}
function lattice(s) {
  let best=N(0); const c=ctx(s);
  for(const ln of H.linesFor(s.lat.n))best=maxMag(best,lineVal(s.lat,ln,c)); return best;
}
function layout(s) {
  const lat=s.lat,x=ensure(s),single=x.challenge===0;
  const ops=single?lat.h.slice(Math.floor(lat.lam/lat.n)*(lat.n-1),(Math.floor(lat.lam/lat.n)+1)*(lat.n-1)):lat.h.concat(lat.v);
  const special=ops.filter(id=>id>=12).length, kinds=new Set(ops.filter(Boolean)).size;
  const digits=sum(lat.d)/lat.d.length;
  const lamCol=lat.lam%lat.n;
  const linked=lamCol>0&&lat.h[Math.floor(lat.lam/lat.n)*(lat.n-1)+lamCol-1]>=12;
  const b=1+Math.min(.45,special*.045)*(x.challenge===2?0:1)+Math.min(.18,kinds*.025)+Math.min(.18,digits*.012)+(linked?.12:0);
  return {bonus:b,special,kinds,linked};
}
function interval(s) { return Math.max(6,30/(1+.12*allUp(s,'devour'))); }
function echoFactor(x) { return x.challenge===1?1:1+Math.min(.4,Math.log1p(x.echo)*.075); }
function efficiency(s) {
  const x=ensure(s),stage=Math.min(4,Math.floor(x.rank/3)),current=unlocked(s);
  let replay=stage<current?Math.min(4000,Math.pow(18+allUp(s,'memory')*1.5+sum(x.clears)*.5,current-stage)):1;
  if(x.challenge===3)replay=Math.min(replay,5);
  const research=1+.08*x.proofs.filter(Boolean).length;
  const trial=1+x.clears[0]*.12+x.clears[2]*.06+x.clears[3]*.08;
  const echo=echoFactor(x);
  const own=1+.2*up(s,stage,'drive'), legacy=1+.018*(allUp(s,'drive')-up(s,stage,'drive'));
  return {stage,replay,research,trial,echo,own,legacy,layout:layout(s).bonus};
}
function rate(s, fixedEfficiency) {
  const x=ensure(s); if(!x.started||x.progress>=100||x.rank<15&&x.rank>=ceiling(s))return 0;
  const e=fixedEfficiency||efficiency(s),echo=fixedEfficiency?echoFactor(x):e.echo,difficulty=1+e.stage*.38;
  const focus=x.focus==='growth'?1.15:x.focus==='harvest'?.9:1;
  const challenge=x.challenge===0?.75:1;
  const endless=x.rank===15?1+integerLog(x.epsilon)*.15:1;
  return .020/difficulty*e.replay*e.research*e.trial*echo*e.own*e.legacy*e.layout*focus*challenge/endless;
}
function passive(s,i) {
  const x=ensure(s); if(!x.started||i>unlocked(s))return 0;
  return .006*(1+.35*up(s,i,'flux'))*(1+.2*x.clears[1])*(x.focus==='harvest'?1.5:1)*(i===unlocked(s)?1:.35);
}
function canAdvance(s) {
  const x=ensure(s); return x.started&&x.progress>=100&&(x.rank===15||x.rank<ceiling(s));
}
function advance(s) {
  const x=ensure(s); if(!canAdvance(s))return false;
  x.progress=0; x.echo*=.5;
  if(x.rank===15) {x.epsilon=String(BigInt(x.epsilon)+1n);log(s,'稳定 ε_'+compactIndex(x.epsilon)+'，无尽研究继续。');}
  else {
    x.rank++;
    if(x.rank===15){x.endlessAt=s.time;log(s,'ε₀ 已稳定。欢迎来到无尽 ε 序列。');}
    else log(s,'层级已稳定：'+LADDER[x.rank][0]);
  }
  updateBest(s); checkProofs(s); checkTrial(s); return true;
}
function updateBest(s) {
  const x=ensure(s);
  if(x.rank>x.bestRank || x.rank===x.bestRank && (BigInt(x.epsilon)>BigInt(x.bestEpsilon) || x.epsilon===x.bestEpsilon && x.progress>x.bestProgress)) {
    x.bestRank=x.rank;x.bestEpsilon=x.epsilon;x.bestProgress=x.progress;
  }
}
function pending(s,i) {
  const x=ensure(s);
  if(!x.started)return i===0&&canEnter(s)?1:0;
  if(i>unlocked(s)+1||i>4)return 0;
  const req=i===0?1:STAGES[i].threshold;
  if(x.rank<req||x.runSec<60||x.stageSec[i]<60)return 0;
  let g=Math.pow(1+(x.rank-req)*.6+x.progress/200,1.55)*(1+.08*up(s,i,'flux'))*(1+.2*x.clears[1]);
  if(x.focus==='harvest')g*=1.25;
  // Logarithmic softcap: no rapidly compounding 1e50 currency bursts.
  if(g>1000)g=1000*(1+Math.log10(g/1000));
  return Math.max(1,Math.floor(g));
}
function resetRun(s) {
  const x=ensure(s);x.rank=0;x.progress=0;x.epsilon='0';x.runSec=0;x.echo=0;x.devourClock=0;x.lastRow=-1;x.lambdaFloor=null;s._lc=null;
}
function prestige(s,i) {
  if(!Number.isInteger(i)||i<0||i>4)return false;
  const g=pending(s,i);if(!g)return false;
  const x=ensure(s); const first=!x.started, entering=s.era<STAGES[i].era;
  x.started=true;x.currency[i]+=g;x.total[i]+=g;x.count[i]++;x.stageSec[i]=0;
  for(let j=0;j<i;j++)x.currency[j]=0;
  if(entering){
    s.era=STAGES[i].era;
    if(s.lat.n<STAGES[i].grid)s.lat=H.resizeLattice(s.lat,STAGES[i].grid);
    while(s.own.length<17)s.own.push(0);
    s.own[12+i]++;
  }
  if(first){s.foldN=Math.max(1,s.foldN);if(!s.stars.includes('l1'))s.stars.push('l1');s.inPara=-1;}
  x.challenge=-1;resetRun(s);log(s,STAGES[i].action+'：获得 '+g+' '+STAGES[i].symbol+(entering?'，开启第 '+STAGES[i].roman+' 纪元。':'。'));
  if(s.auto.arrange)arrange(s);
  return true;
}
function buy(s,i,id) {
  if(!Number.isInteger(i)||i<0||i>unlocked(s))return false;
  const u=UPG.find(u=>u.id===id),x=ensure(s); if(!u||!x.started||up(s,i,id)>=u.cap)return false;
  const c=cost(s,i,id); if(x.currency[i]+1e-9<c)return false;
  x.currency[i]=Math.max(0,x.currency[i]-c);x.up[i][id]++;
  if(id==='operator'){s.own[12+i]++;if(s.auto.arrange)arrange(s);}
  checkProofs(s);return true;
}
function arrange(s) {
  const old=s.lat,n=old.n,lat={n,d:old.d.slice().sort((a,b)=>b-a),h:Array(n*(n-1)).fill(0),v:Array(n*(n-1)).fill(0),lam:n-1};
  const pool=[];
  for(let id=s.own.length-1;id>=1;id--)for(let i=0;i<s.own[id];i++)pool.push(id);
  const main=pool.splice(0,n-1).sort((a,b)=>a-b);
  main.forEach((id,i)=>lat.h[n-1-main.length+i]=id);
  let i=n-1;for(const id of pool){if(i<lat.h.length)lat.h[i++]=id;else{const j=i++-lat.h.length;if(j<lat.v.length)lat.v[j]=id;}}
  s.lat=lat;s._lc=null;return true;
}
function swallow(s) {
  const x=ensure(s);if(x.challenge===1)return;
  let target=N(0),row=-1,c=ctx(s);
  for(const ln of H.linesFor(s.lat.n)) {
    if(!ln.row||ln.sl.includes(s.lat.lam))continue;
    const v=lineVal(s.lat,ln,c);
    const better=row<0||(v instanceof Magnitude ? !(target instanceof Magnitude)||v.gt(target) : !(target instanceof Magnitude)&&v.gt(target));
    if(better){target=v;row=ln.i;}
  }
  if(target instanceof Magnitude){const v=lambda(s).max(target);x.lambdaFloor={rank:String(v.rank),height:v.height};}
  const focus=x.focus==='lambda'?1.4:1;
  x.echo=Math.min(60,x.echo+(1+.12*allUp(s,'devour'))*focus/(1+x.echo/12));
  x.swallows++;x.lastRow=row;
}
function proofRows(s,i) {
  const x=ensure(s),off=i*3;
  return [
    {id:off,name:'引流定理',desc:'本纪元层深引流达到 3 级',done:up(s,i,'drive')>=3},
    {id:off+1,name:'吞噬定理',desc:'累计吞噬 '+(i+1)*25+' 次',done:x.swallows>=(i+1)*25},
    {id:off+2,name:'稳定定理',desc:'最高稳定层级达到 '+(i*3+2)+' 阶',done:x.bestRank>=i*3+2},
  ];
}
function checkProofs(s) {
  const x=ensure(s);
  for(let i=0;i<=unlocked(s);i++)for(const p of proofRows(s,i))if(p.done&&!x.proofs[p.id]){
    x.proofs[p.id]=true;x.currency[i]+=2;x.total[i]+=2;
    log(s,STAGES[i].name+' · '+p.name+'成立：研究速度 +8%，获得 2 '+STAGES[i].symbol+'。');
  }
}
function trialGoal(s,id) { return Math.min(15,TRIALS[id].goal+ensure(s).clears[id]); }
function enterTrial(s,id) {
  const x=ensure(s);if(!TRIALS[id]||s.era<TRIALS[id].era||x.clears[id]>=3||!x.started||trialGoal(s,id)>ceiling(s))return false;
  resetRun(s);x.challenge=id;log(s,'进入公理挑战：'+TRIALS[id].name);return true;
}
function exitTrial(s) {const x=ensure(s);if(x.challenge<0)return false;resetRun(s);x.challenge=-1;return true;}
function checkTrial(s) {
  const x=ensure(s),id=x.challenge;if(id<0)return;
  if(x.rank>=trialGoal(s,id)) {x.clears[id]++;x.challenge=-1;log(s,'公理「'+TRIALS[id].name+'」证明完成，第 '+x.clears[id]+' 层。');}
}
function automate(s) {
  const x=ensure(s);if(!x.started||!allUp(s,'auto'))return;
  if(x.auto.shop)for(let i=0;i<=unlocked(s);i++){
    if(!up(s,i,'auto'))continue;
    // Round-robin purchases preserve choices and avoid starving the cheaper upgrades.
    for(const id of ['drive','flux','devour','operator','auto','memory'])buy(s,i,id);
  }
  if(x.auto.advance&&up(s,Math.min(4,Math.floor(x.rank/3)),'auto'))advance(s);
  if(x.auto.prestige&&up(s,unlocked(s),'auto')&&x.challenge<0&&x.rank===ceiling(s)&&x.rank<15) {
    const next=unlocked(s)+1;if(next<5)prestige(s,next);
  }
}
function tick(s,dt) {
  if(!Number.isFinite(dt)||dt<=0)return;
  const x=ensure(s);
  let left=dt;
  while(left>1e-9) {
    const t=Math.min(1,left);left-=t;s.time+=t;s.runT+=t;x.age+=t;x.runSec+=t;
    for(let i=0;i<5;i++)x.stageSec[i]+=t;
    for(let i=0;i<=unlocked(s);i++){const a=passive(s,i)*t;x.currency[i]=Math.min(1e100,x.currency[i]+a);x.total[i]=Math.min(1e100,x.total[i]+a);}
    x.progress=Math.min(100,x.progress+rate(s)*t);
    if(x.challenge!==1) {x.devourClock+=t;const it=interval(s);while(x.devourClock>=it){x.devourClock-=it;swallow(s);}}
    updateBest(s);checkProofs(s);checkTrial(s);
    if(x.age-(s._metaAutoAt||0)>=1-1e-9){s._metaAutoAt=x.age;automate(s);}
  }
}
const EXTRA_ACH = [
  ['Ω 之后','第一次坍缩',s=>enabled(s)],
  ['箭头也是塔','稳定嵌套阶梯第 1 阶',s=>ensure(s).bestRank>=1],
  ['无底箭阵','稳定第 2 阶',s=>ensure(s).bestRank>=2],
  ['再嵌套一次','拥有 2 块 ⇑',s=>s.own[12]>=2],
  ['贪吃的 λ','吞噬其他行 25 次',s=>ensure(s).swallows>=25],
  ['鲸吞','吞噬其他行 100 次',s=>ensure(s).swallows>=100],
  ['超限排布','把超限算符放到 λ 左边',s=>enabled(s)&&layout(s).linked],
  ['延展','开启第 VII 纪元',s=>s.era>=7],
  ['六方','晶格扩展至 6×6',s=>s.lat.n>=6],
  ['ω 的门','稳定第 3 阶',s=>ensure(s).bestRank>=3],
  ['第二对角线','稳定第 4 阶',s=>ensure(s).bestRank>=4],
  ['铺阵','开启第 VIII 纪元',s=>s.era>=8],
  ['七方','晶格扩展至 7×7',s=>s.lat.n>=7],
  ['平方无穷','稳定第 6 阶',s=>ensure(s).bestRank>=6],
  ['立方无穷','稳定第 7 阶',s=>ensure(s).bestRank>=7],
  ['维数不止','稳定第 8 阶',s=>ensure(s).bestRank>=8],
  ['升维','开启第 IX 纪元',s=>s.era>=9],
  ['ω^ω','稳定第 9 阶',s=>ensure(s).bestRank>=9],
  ['指数之维','稳定第 10 阶',s=>ensure(s).bestRank>=10],
  ['维度之塔','稳定第 11 阶',s=>ensure(s).bestRank>=11],
  ['超限','开启第 X 纪元',s=>s.era>=10],
  ['序数幂塔','稳定第 12 阶',s=>ensure(s).bestRank>=12],
  ['不动点前夜','稳定第 13 阶',s=>ensure(s).bestRank>=13],
  ['ε₀','抵达第一不动点',s=>ensure(s).bestRank>=15],
  ['ε₁','在无尽模式中稳定 ε₁',s=>BigInt(ensure(s).bestEpsilon)>=1n],
  ['ε₁₀','在无尽模式中稳定 ε₁₀',s=>BigInt(ensure(s).bestEpsilon)>=10n],
  ['第一公理','完成任意公理挑战',s=>ensure(s).clears.some(n=>n>0)],
  ['公理学家','四种公理均完成一层',s=>ensure(s).clears.every(n=>n>0)],
  ['十二条证明','完成全部 12 层公理',s=>sum(ensure(s).clears)===12],
  ['自动研究所','解锁研究自动化',s=>allUp(s,'auto')>0],
  ['十五条定理','完成全部纪元定理',s=>ensure(s).proofs.every(Boolean)],
  ['谱系','φ 达到 5',s=>H.phi(s)>=5],
  ['千次吞噬','吞噬 1000 次',s=>ensure(s).swallows>=1000],
];
H.ACH.push(...EXTRA_ACH);
H.newState=()=>{const s=base.newState();s.meta=newMeta();s.ui.notation='math';return s;};
H.tick=(s,dt)=>enabled(s)?tick(s,dt):base.tick(s,dt);
H.automate=s=>enabled(s)?automate(s):base.automate(s);
H.autoPrestige=s=>enabled(s)?undefined:base.autoPrestige(s);
H.arrange=(s,n)=>enabled(s)?arrange(s):base.arrange(s,n);
H.latCtx=s=>enabled(s)?ctx(s):base.latCtx(s);
H.lineVal=lineVal;
H.latticeValue=s=>enabled(s)?lattice(s):base.latticeValue(s);
H.latMult=s=>enabled(s)?N(layout(s).bonus):base.latMult(s);
H.phi=s=>Math.max(base.phi(s),enabled(s)?4:1)+.1*allUp(s,'memory')+.2*ensure(s).clears[2];
H.ACH[10][2]=s=>H.phi(s)>=4;
H.digitCap=s=>enabled(s)?12+unlocked(s):base.digitCap(s);
function digitPrice(s,d) {return Math.max(1,Math.ceil((d-8)*.65));}
H.buyDigit=(s,i)=>{
  if(!enabled(s))return base.buyDigit(s,i);
  if(!Number.isInteger(i)||i<0||i>=s.lat.d.length)return false;
  const d=s.lat.d[i],x=ensure(s),c=digitPrice(s,d),j=unlocked(s);
  if(d>=H.digitCap(s)||x.currency[j]<c)return false;
  x.currency[j]-=c;s.lat.d[i]++;s._lc=null;return true;
};
H.buyDigitsCheapest=(s,limit=200)=>{
  if(!enabled(s))return base.buyDigitsCheapest(s,limit);
  let bought=0;
  for(let k=0;k<limit;k++){let i=0;for(let j=1;j<s.lat.d.length;j++)if(s.lat.d[j]<s.lat.d[i])i=j;if(!H.buyDigit(s,i))break;bought++;}
  return bought;
};
function validateMeta(x,s) {
  const d=newMeta(); if(!x)return d;
  if(typeof x!=='object'||Array.isArray(x))throw Error('超限进度格式不正确');
  for(const k of Object.keys(d))if(k in x)d[k]=x[k];
  for(const k of ['age','runSec','echo','swallows','devourClock','bestProgress','progress'])if(typeof d[k]!=='number'||!Number.isFinite(d[k])||d[k]<0)throw Error('超限数值无效：'+k);
  if(!Number.isInteger(d.rank)||d.rank<0||d.rank>15||!Number.isInteger(d.bestRank)||d.bestRank<d.rank||d.bestRank>15||d.progress>100||d.bestProgress>100)throw Error('阶梯进度无效');
  for(const k of ['epsilon','bestEpsilon'])if(typeof d[k]!=='string'||!/^\d+$/.test(d[k])||d[k].length>10000)throw Error('ε 序号无效');
  for(const k of ['stageSec','currency','total','count'])if(!Array.isArray(d[k])||d[k].length!==5||d[k].some(n=>typeof n!=='number'||!Number.isFinite(n)||n<0||n>1e100))throw Error('货币数据无效');
  if(!Array.isArray(d.up)||d.up.length!==5)throw Error('升级数据无效');
  d.up=d.up.map((row)=>Object.fromEntries(UPG.map(u=>{const v=row?.[u.id]||0;if(!Number.isInteger(v)||v<0||v>u.cap)throw Error('升级等级无效');return[u.id,v];})));
  if(!['growth','harvest','lambda'].includes(d.focus))d.focus='growth';
  d.auto={advance:!!d.auto?.advance,shop:!!d.auto?.shop,prestige:!!d.auto?.prestige};
  if(!Array.isArray(d.clears)||d.clears.length!==4||d.clears.some(n=>!Number.isInteger(n)||n<0||n>3))throw Error('公理数据无效');
  if(!Number.isInteger(d.challenge)||d.challenge < -1||d.challenge>3)throw Error('公理状态无效');
  if(!Array.isArray(d.proofs)||d.proofs.length!==15)throw Error('定理数据无效');d.proofs=d.proofs.map(Boolean);
  if(d.lambdaFloor){if(!/^\d+$/.test(d.lambdaFloor.rank)||!Number.isFinite(d.lambdaFloor.height)||d.lambdaFloor.height<1)throw Error('λ 数据无效');}
  d.history=Array.isArray(d.history)?d.history.slice(-60).map(h=>({t:Math.max(0,finite(h.t)),m:String(h.m).slice(0,300)})):[];
  d.started=!!d.started;
  if(d.started&&(s.era<6||d.rank<15&&d.rank>ceiling(s)))throw Error('纪元与阶梯不匹配');
  if(!d.started&&s.era>5)throw Error('超限纪元缺少进度');
  return d;
}
H.load=str=>{
  if(typeof str!=='string'||str.length>3000000)throw Error('存档长度无效');
  const d=JSON.parse(str,(k,v)=>{if(['__proto__','prototype','constructor'].includes(k))throw Error('存档含无效字段');return v;});
  if(!d||![3,4].includes(d.v))throw Error('不支持的存档版本');
  const s=base.load(JSON.stringify(d));
  if(!Number.isInteger(s.era)||s.era<1||s.era>10)throw Error('纪元数据无效');
  const n=s.lat?.n;
  if(!Number.isInteger(n)||n<2||n>9||s.lat.d?.length!==n*n||s.lat.h?.length!==n*(n-1)||s.lat.v?.length!==n*(n-1))throw Error('晶格尺寸无效');
  if(s.lat.d.some(v=>!Number.isInteger(v)||v<1||v>100)||s.lat.h.concat(s.lat.v).some(v=>!Number.isInteger(v)||v<0||v>=H.OPS.length))throw Error('晶格数据无效');
  if(!Number.isInteger(s.lat.lam)||s.lat.lam< -1||s.lat.lam>=n*n)throw Error('λ 位置无效');
  if(!Array.isArray(s.own)||s.own.length>128||s.own.some(v=>!Number.isInteger(v)||v<0||v>1000))throw Error('算符库存无效');
  while(s.own.length<H.OPS.length)s.own.push(0);
  for(let id=1;id<H.OPS.length;id++)if(H.placedCount(s.lat,id)>s.own[id])throw Error('放置的算符超过库存');
  s.v=4;s.meta=validateMeta(s.meta,s);
  if(!NOTATIONS.some(n=>n[0]===s.ui.notation))s.ui.notation='math';
  if(!['auto','light','dark'].includes(s.ui.theme))s.ui.theme='auto';
  for(const k of ['star','best','lam','crease','power','brick','arrowE'])if(!(s[k] instanceof O)||s[k].array.some(n=>!Number.isFinite(n))||s[k].sign<0)throw Error('旧纪元数值无效：'+k);
  return s;
};
H.exportStr=s=>'HT4:'+(typeof btoa==='function'?btoa(unescape(encodeURIComponent(H.save(s)))):Buffer.from(H.save(s),'utf8').toString('base64'));
H.importStr=str=>{
  str=String(str).trim();if(!/^HT[34]:/.test(str))throw Error('存档开头应为 HT3: 或 HT4:');
  const b=str.slice(4);if(b.length>4000000)throw Error('存档过长');
  const j=typeof atob==='function'?decodeURIComponent(escape(atob(b))):Buffer.from(b,'base64').toString('utf8');return H.load(j);
};
H.simulate=(s,seconds,cb)=>{const steps=Math.max(1,Math.ceil(seconds)),dt=seconds/steps;for(let i=0;i<steps;i++){H.tick(s,dt);H.automate(s);H.autoPrestige(s);if(cb)cb(i,steps);}};
H.format=format;
H.Meta={Magnitude,LADDER,STAGES,UPG,TRIALS,NOTATIONS,newMeta,ensure,enabled,unlocked,ceiling,canEnter,up,allUp,cost,value,lambda,ordinal,
  lattice,layout,efficiency,rate,passive,interval,pending,prestige,buy,advance,canAdvance,arrange,swallow,proofRows,enterTrial,exitTrial,trialGoal,digitPrice,tick,automate};
})(typeof self!=='undefined'?self:this);
