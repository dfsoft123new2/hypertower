/* P1 event integration and P2 fitting from three measured, complete rounds. */
(function(root){
 'use strict';const H=root.HT,G=H.GR,M=H.Meta;
 function init(s){return s.p3.shadow||=( {mode:'fit',phase:'calibrating',samples:[],partial:true,elapsed:0,segments:[],segment:s.p2.era,segmentAge:0,fitAge:0,rounds:0,calibrationAge:0,carry:JSON.stringify(s.p2.legacy.carry),out:null} );}
 function bootstrap(s){let changed=false;if(s.meta.auto.shop)for(let i=0;i<5;i++)if(!M.up(s,i,'auto')&&M.buy(s,i,'auto'))changed=true;return changed;}
 const prices=Object.fromEntries(M.UPG.map(u=>[u.id,Array.from({length:u.cap},(_,level)=>Math.ceil(u.base*Math.pow(u.growth,level)-1e-9))]));
 function automate(s,plan){const x=s.meta;let changed=false;if(!x.started)return changed;if(x.auto.shop)for(const row of plan.shopping)if(x.up[row.stage].auto&&x.currency[row.stage]+1e-9>=row.cost&&M.buy(s,row.stage,row.upgrade))changed=true;if(x.auto.advance&&x.up[4].auto&&x.progress>=100&&M.advance(s))changed=true;return changed;}
 const swallowing=new WeakMap();
 function sameValues(a,b){if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;}
 function sameLattice(l,c){return c&&c.n===l.n&&c.lam===l.lam&&sameValues(c.d,l.d)&&sameValues(c.h,l.h)&&sameValues(c.v,l.v);}
 function latticeInputs(l){return {n:l.n,lam:l.lam,d:l.d.slice(),h:l.h.slice(),v:l.v.slice()};}
 function lambdaFloor(s,target,plan){const x=s.meta,floor=x.lambdaFloor;
  if(floor&&Number.isFinite(floor.height)&&floor.height>=1&&floor.height<=1e100){let rank=plan.floorRank;if(rank===undefined||plan.floorRankInput!==floor.rank){rank=BigInt(floor.rank);plan.floorRank=rank;plan.floorRankInput=floor.rank;plan.floorRankText=String(rank);}
   // The natural lambda height is at most 100; a floor dominating both terms is already the maximum.
   if((rank>plan.lambdaRank||rank===plan.lambdaRank&&floor.height>=100)&&(rank>target.rank||rank===target.rank&&floor.height>=target.height)){x.lambdaFloor={rank:plan.floorRankText,height:floor.height};plan.floorRankInput=x.lambdaFloor.rank;return;}
  }
  const v=M.lambda(s).max(target);x.lambdaFloor={rank:String(v.rank),height:v.height};plan.floorRank=v.rank;plan.floorRankInput=plan.floorRankText=x.lambdaFloor.rank;
 }
 function swallow(s,plan){const x=s.meta,l=s.lat;let memo=swallowing.get(s);if(!sameLattice(l,memo)||memo.bonus!==s.para[5]||memo.mode!==s.inPara){let target=G.N(0),row=-1;const c=H.latCtx(s);for(const ln of H.linesFor(l.n)){if(!ln.row||ln.sl.includes(l.lam))continue;const v=H.lineVal(l,ln,c),better=row<0||(v instanceof M.Magnitude?!(target instanceof M.Magnitude)||v.gt(target):!(target instanceof M.Magnitude)&&v.gt(target));if(better){target=v;row=ln.i;}}memo={...latticeInputs(l),bonus:s.para[5],mode:s.inPara,target,row};swallowing.set(s,memo);}if(memo.target instanceof M.Magnitude)lambdaFloor(s,memo.target,plan);x.echo=Math.min(60,x.echo+plan.echoStep/(1+x.echo/12));x.swallows++;x.lastRow=memo.row;}
 const productionPlans=new WeakMap();
 function sameProduction(s,c){const x=s.meta;if(!c||c.era!==s.era||c.started!==x.started||c.focus!==x.focus||c.shop!==x.auto.shop||c.clear!==x.clears[1])return false;for(let i=0;i<5;i++)for(let j=0;j<M.UPG.length;j++)if(c.up[i][j]!==x.up[i][M.UPG[j].id])return false;return true;}
 function refreshRate(s,plan,changed=false){const x=s.meta,l=s.lat,c=plan.rateInputs,full=x.progress>=100;
  const fixed=!changed&&c&&c.rank===x.rank&&c.challenge===x.challenge&&sameValues(c.clears,x.clears)&&sameValues(c.proofs,x.proofs)&&sameLattice(l,c);
  if(fixed&&c.echo===x.echo&&c.epsilon===x.epsilon&&c.full===full)return;
  if(!fixed){plan.efficiency=undefined;plan.proofStages=[];for(let i=0;i<5;i++)if(!x.proofs[3*i]||!x.proofs[3*i+1]||!x.proofs[3*i+2])plan.proofStages.push(i);}if(!full&&!plan.efficiency)plan.efficiency=M.efficiency(s);
  plan.rate=M.rate(s,plan.efficiency);if(!fixed)plan.rateInputs={rank:x.rank,challenge:x.challenge,clears:x.clears.slice(),proofs:x.proofs.slice(),...latticeInputs(l)};plan.rateInputs.echo=x.echo;plan.rateInputs.epsilon=x.epsilon;plan.rateInputs.full=full;
 }
 function production(s,plan){plan||=productionPlans.get(s)||{};const x=s.meta,changed=!sameProduction(s,plan.config);
  if(changed){plan.config={era:s.era,started:x.started,focus:x.focus,shop:x.auto.shop,clear:x.clears[1],up:x.up.map(row=>M.UPG.map(u=>row[u.id]))};plan.passive=Array.from({length:5},(_,i)=>M.passive(s,i));plan.interval=M.interval(s);plan.echoStep=(1+.12*M.allUp(s,'devour'))*(x.focus==='lambda'?1.4:1);plan.lambdaRank=BigInt(x.rank-1);plan.shopping=[];plan.minCost=Array(5).fill(Infinity);plan.needsBootstrap=x.auto.shop&&x.up.some(row=>!row.auto);if(x.auto.shop)for(let i=0;i<5;i++)for(const u of M.UPG){const row=x.up[i];if((row.auto||u.id==='auto')&&row[u.id]<u.cap){const cost=prices[u.id][row[u.id]];plan.shopping.push({stage:i,upgrade:u.id,cost});plan.minCost[i]=Math.min(plan.minCost[i],cost);}}}
  // Recompute deadlines on each call so fractional frames and outside deposits keep their original schedule.
  plan.shopAt=undefined;refreshRate(s,plan,changed);productionPlans.set(s,plan);return plan;
 }
 function shoppingAt(s,plan){if(plan.shopAt!==undefined)return plan.shopAt;const x=s.meta;let wait=Infinity;for(let i=0;i<5;i++){const need=plan.minCost[i]-x.currency[i];if(need<=0){wait=1;break;}if(plan.passive[i])wait=Math.min(wait,Math.max(1,Math.ceil(need/plan.passive[i]-1e-9)));}return plan.shopAt=x.age+wait;}
 function updateBest(x){if(x.rank>x.bestRank||x.rank===x.bestRank&&(x.epsilon===x.bestEpsilon?x.progress>x.bestProgress:BigInt(x.epsilon)>BigInt(x.bestEpsilon))){x.bestRank=x.rank;x.bestEpsilon=x.epsilon;x.bestProgress=x.progress;}}
 function unit(s,t,plan){
  const x=s.meta;let rateChanged=false,upgraded=false;s.time+=t;s.runT+=t;x.age+=t;x.runSec+=t;
  for(let i=0;i<5;i++){x.stageSec[i]+=t;const add=plan.passive[i]*t;x.currency[i]=Math.min(1e100,x.currency[i]+add);x.total[i]=Math.min(1e100,x.total[i]+add);}
  x.progress=Math.min(100,x.progress+plan.rate*t);x.devourClock+=t;
  while(x.devourClock>=plan.interval){x.devourClock-=plan.interval;swallow(s,plan);rateChanged=true;}
  updateBest(x);
  for(const i of plan.proofStages)for(const p of M.proofRows(s,i))if(p.done&&!x.proofs[p.id]){x.proofs[p.id]=true;x.currency[i]+=2;x.total[i]+=2;plan.shopAt=undefined;rateChanged=true;const msg=M.STAGES[i].name+' · '+p.name+'成立：研究速度 +8%，获得 2 '+M.STAGES[i].symbol+'。';x.history.push({t:s.time,m:msg});if(x.history.length>60)x.history.shift();s.log.push({t:s.time,m:msg});if(s.log.length>30)s.log.shift();}
  if(x.age-(s._metaAutoAt||0)>=1-1e-9){s._metaAutoAt=x.age;upgraded=automate(s,plan);}
  if(upgraded)production(s,plan);else if(rateChanged||x.progress>=100)refreshRate(s,plan);
 }
 function p1(s,dt){G.number(dt,0,259200,false,'P1 推进时间');if(!dt)return;const x=s.meta;if(!x.started||s.era!==10||x.rank!==15||x.challenge!==-1||x.auto.prestige){M.tick(s,dt);return;}let left=dt;const plan=production(s);unit(s,Math.min(1,left),plan);if(plan.needsBootstrap&&bootstrap(s))production(s,plan);left=Math.max(0,left-1);
  while(left>1e-9){let next=Math.min(Math.floor(left),Math.max(1,Math.ceil(plan.interval-x.devourClock-1e-9)));const r=plan.rate;if(x.auto.advance&&x.up[4].auto&&r>0)next=Math.min(next,Math.max(1,Math.ceil((100-x.progress)/r-1e-9)));
   next=Math.min(next,Math.max(1,Math.ceil(shoppingAt(s,plan)-x.age-1e-9)));
   const skip=Math.max(0,next-1);if(skip){s.time+=skip;s.runT+=skip;x.age+=skip;x.runSec+=skip;for(let i=0;i<5;i++){x.stageSec[i]+=skip;const add=plan.passive[i]*skip;x.currency[i]=Math.min(1e100,x.currency[i]+add);x.total[i]=Math.min(1e100,x.total[i]+add);}x.progress=Math.min(100,x.progress+r*skip);updateBest(x);x.devourClock+=skip;s._metaAutoAt=x.age;left-=skip;}
   const t=Math.min(1,left);unit(s,t,plan);if(plan.needsBootstrap&&bootstrap(s))production(s,plan);left-=t;
  }
 }
 const fittedModels=new WeakMap();
 function sameSamples(samples,start,previous){if(!previous||samples.length-start!==previous.length)return false;for(let i=start;i<samples.length;i++){const x=samples[i],p=previous[i-start];if(x.seconds!==p.seconds||x.multiplier!==p.multiplier||x.segments.length!==p.segments.length)return false;for(let j=0;j<x.segments.length;j++)if(x.segments[j].era!==p.segments[j].era||x.segments[j].seconds!==p.segments[j].seconds)return false;}return true;}
 function fittedModel(s){const a=init(s),start=Math.max(0,a.samples.length-3);let memo=fittedModels.get(a);
  if(!sameSamples(a.samples,start,memo?.samples)){const samples=a.samples.slice(-3),xs=samples.map(x=>1/x.multiplier),ys=samples.map(x=>x.seconds),mx=xs.reduce((x,y)=>x+y,0)/xs.length,my=ys.reduce((x,y)=>x+y,0)/ys.length,den=xs.reduce((n,x)=>n+(x-mx)**2,0);let A=den>1e-12?xs.reduce((n,x,i)=>n+(x-mx)*(ys[i]-my),0)/den:my/mx,B=my-A*mx;if(!Number.isFinite(A)||A<0||B<0){A=my/mx;B=0;}const weights=new Map();for(const sample of samples)for(const part of sample.segments)weights.set(part.era,(weights.get(part.era)||0)+part.seconds/sample.seconds);memo={samples:samples.map(x=>({seconds:x.seconds,multiplier:x.multiplier,segments:x.segments.map(p=>({era:p.era,seconds:p.seconds}))})),A,B,weights:[...weights].sort((x,y)=>x[0]-y[0])};fittedModels.set(a,memo);}
  const multiplier=H.Late.legacyMultiplier(s.p2);if(!memo.model||memo.multiplier!==multiplier){const seconds=Math.max(60,memo.A/multiplier+memo.B);memo.model={seconds,A:memo.A,B:memo.B,segments:memo.weights.map(([era,w])=>({era,seconds:seconds*w/memo.samples.length}))};memo.multiplier=multiplier;}return memo.model;
 }
 // Internal readers share the fitted model; public forecasts always own their segment records.
 function forecast(s){const model=fittedModel(s);return {...model,segments:model.segments.map(p=>({...p}))};}
 function resetRound(s){const previous=s.p2,fresh=G.old.load(G.old.save(G.old.newState()));for(const k of ['blueprints','archive','workshop','ach','ui'])fresh[k]=G.clone(previous[k]);fresh.time=previous.time;fresh.ui.shadow=true;fresh.legacy={...G.clone(previous.legacy),rebuild:0,rebuilding:true,roundStart:fresh.time};fresh.era=1;if(fresh.legacy.carry.includes('natural'))fresh.up.phi=1;if(fresh.legacy.carry.includes('ternary'))fresh.eng[0].b=1;s.p2=fresh;}
 function record(s,dt,beforeRound,beforeEra){const a=init(s);a.elapsed+=dt;a.segmentAge+=dt;a.calibrationAge+=dt;if(s.p2.era!==beforeEra||s.p2.legacy.round!==beforeRound){a.segments.push({era:beforeEra,seconds:a.segmentAge});a.segmentAge=0;a.segment=s.p2.era;}if(s.p2.legacy.round===beforeRound)return;
  if(!a.partial&&a.elapsed>0){a.samples.push({seconds:a.elapsed,multiplier:a.startMultiplier,segments:a.segments});a.samples=a.samples.slice(-3);}a.partial=false;a.elapsed=0;a.segments=[];a.startMultiplier=H.Late.legacyMultiplier(s.p2);a.rounds=0;a.calibrationAge=0;
  if(a.mode==='fit'&&a.samples.length===3){a.phase='fitted';a.fitAge=0;a.out=null;}
 }
 function p2(s,dt,firstEvent){const a=init(s);if(a.carry!==JSON.stringify(s.p2.legacy.carry)){a.samples=[];a.phase='calibrating';a.partial=true;a.carry=JSON.stringify(s.p2.legacy.carry);a.elapsed=0;a.segments=[];a.segmentAge=0;firstEvent=undefined;}
  if(a.mode==='exact'||a.phase!=='fitted'){let left=dt;while(left>1e-9){const t=Math.min(firstEvent===undefined?exactNext(s.p2):firstEvent,left),round=s.p2.legacy.round,era=s.p2.era;firstEvent=undefined;G.old.tick(s.p2,t);record(s,t,round,era);left-=t;if(a.mode==='fit'&&a.phase==='fitted'&&left>1e-9){p2(s,left);break;}}return;}
  let left=dt;while(left>1e-9){const model=fittedModel(s),t=Math.min(left,Math.max(1e-8,model.seconds-a.fitAge));a.fitAge+=t;a.calibrationAge+=t;s.p2.time+=t;s.p2.runT+=t;left-=t;let cursor=0,era=20;for(const seg of model.segments){cursor+=seg.seconds;if(a.fitAge<cursor){era=seg.era;break;}}a.out={era,round:s.p2.legacy.round,elapsed:a.fitAge,seconds:model.seconds,approximate:true};
   if(a.fitAge>=model.seconds-1e-8){const l=s.p2.legacy;l.round=String(BigInt(l.round)+1n);l.points=String(BigInt(l.points)+BigInt(Math.floor(36000/model.seconds)+1));l.bestSeconds=Math.min(l.bestSeconds||Infinity,model.seconds);l.roundStart=s.p2.time;a.fitAge=0;a.rounds++;if(a.rounds>=10||a.calibrationAge>=21600){resetRound(s);a.phase='calibrating';a.partial=false;a.elapsed=0;a.segments=[];a.segmentAge=0;a.startMultiplier=H.Late.legacyMultiplier(s.p2);a.out=null;if(left>0)p2(s,left);break;}}
  }
 }
 function mode(s,value){G.assert(['fit','exact'].includes(value),'影子引擎模式无效');const a=init(s);if(a.mode===value)return false;if(a.phase==='fitted')resetRound(s);a.mode=value;a.phase='calibrating';a.partial=true;a.elapsed=0;a.segments=[];a.segmentAge=0;a.fitAge=0;a.out=null;return true;}
 function exactNext(p){if(p.legacy?.rebuilding)return Math.max(1,Math.ceil(100/H.Late.legacyMultiplier(p)-p.legacy.rebuild));if(p.era<11)return 1;const api=p.era===11?H.Eleven:H.Late,a=api.state(p);let t=Math.min(60,api.toBoundary(p));if(a.auto.buy&&(p.era===11||H.Late.choice(p)||a.up[5]>0||p.legacy.carry.includes('fixed')||p.legacy.axiom===4))t=Math.min(t,api.nextBuy(p,p.era>=12&&!H.Late.choice(p)));if(p.workshop.enabled)t=Math.min(t,p.era===11?H.Workshop.next(p):H.Late.workshopNext(p));return Math.max(1,Math.ceil(t-1e-8));}
 function next(s){const a=init(s);return a.mode==='fit'&&a.phase==='fitted'?Math.max(1,Math.ceil(fittedModel(s).seconds-a.fitAge)):exactNext(s.p2);}
 function validate(s){const a=s.p3.shadow;if(!a)return true;G.assert(['fit','exact'].includes(a.mode)&&['calibrating','fitted'].includes(a.phase)&&Array.isArray(a.samples)&&a.samples.length<=3,'影子引擎状态无效');for(const sample of a.samples){G.number(sample.seconds,Number.MIN_VALUE,1e15);G.number(sample.multiplier,Number.MIN_VALUE,1e100);G.assert(sample.segments.length<=24,'影子分段超预算');sample.segments.forEach(x=>{G.number(x.era,1,20,true);G.number(x.seconds,0,sample.seconds);});}for(const k of ['elapsed','segmentAge','fitAge','calibrationAge'])G.number(a[k],0,1e15);G.number(a.rounds,0,10,true);if(a.phase==='fitted')G.assert(a.samples.length===3&&a.mode==='fit','拟合需要三轮实测');G.assert(G.bytes(JSON.stringify(a))<=65536,'影子引擎记录超预算');return true;}
 G.Shadow={init,p1,p2,forecast,mode,next,validate};G.handlers['shadow.mode']=(s,a)=>mode(s,a.mode);
 G.handlers['p1.auto']=(s,a)=>{G.assert(['advance','shop','arrange'].includes(a.key)&&typeof a.on==='boolean','P1 自动化选项无效');if(a.key==='arrange')s.p1.auto.arrange=a.on;else s.p1.meta.auto[a.key]=a.on;return true;};
 G.handlers['p1.arrange']=s=>M.arrange(s.p1);
 G.handlers['p1.buy']=(s,a)=>M.buy(s.p1,a.stage,a.upgrade);
})(typeof self!=='undefined'?self:this);
