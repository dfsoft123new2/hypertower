'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{performance}=require('node:perf_hooks');
const base='D:/hypertower-recovery-20261026',work=path.join(base,'walkthrough-work-20261101'),out=path.join(work,'simulation-p1');fs.mkdirSync(out,{recursive:true});
const {engine}=require(path.join(base,'hypertower/tests/gr-helper.cjs')),{omegaSave}=require(path.join(base,'hypertower/tests/engine.cjs'));
const {H,G}=engine(),M=H.Meta,sha=b=>crypto.createHash('sha256').update(b).digest('hex'),started=performance.now();
const write=(name,data)=>{const file=path.join(out,name),bytes=typeof data==='string'?data:JSON.stringify(data,null,2)+'\n';fs.writeFileSync(file,bytes);return {file,sha256:sha(fs.readFileSync(file)),bytes:fs.statSync(file).size};};
const sources=['source-v3.html','vendor/omega-num.js','src/beyond.js','src/gr-shadow.js','tests/engine.cjs','tests/gr-helper.cjs'].map(file=>({file,sha256:sha(fs.readFileSync(path.join(base,'hypertower',file)))}));
function snapshot(s){const x=s.meta;return {time:s.time,era:s.era,rank:x.rank,epsilon:x.epsilon,progress:x.progress,hero:H.format(M.value(s),'math'),lambda:H.format(M.lambda(s),'math'),rate:M.rate(s),echo:x.echo,swallows:x.swallows,devourInterval:M.interval(s),currency:Array.from(x.currency),total:Array.from(x.total),up:JSON.parse(JSON.stringify(x.up)),clears:Array.from(x.clears),proofs:Array.from(x.proofs),auto:{...x.auto},focus:x.focus,layout:M.efficiency(s).layout};}
const policy={campaign:'omegaSave is an explicit completed-V seed, not a measured fresh run. From first collapse onward only real Meta.tick(1), every 5s one balanced purchase pass drive/flux/devour/operator/auto/memory for each unlocked stage, stabilize each second and enter next stage at ceiling; growth focus, arrange=true, no challenges.',continuation:'Starting exactly at first naturally simulated epsilon=10, enable built-in shop and advance, disable prestige, retain growth focus and auto arrangement. No grants, manual upgrades, challenges, resets or layout edits after baseline. G.Shadow.p1 executes actual event integration in chunks <=259200s. No fitted forecasts and no formula extrapolation.',checkpointsDays:[1,7,30,365,3650,36500],yearDays:365};
let s=omegaSave(H);s.auto.arrange=true;const campaignSeed=write('campaign-completed-V-input.json',G.old.save(s));const campaignStart=s.time;assert(M.prestige(s,0));const entries=[{era:6,seconds:0}];let previousEra=6,previousRank=-1;const rungs=[];
const campaignRuntime=performance.now();for(let t=0;t<172800;t++){
 M.tick(s,1);
 if(t%5===0)for(let i=0;i<=M.unlocked(s);i++)for(const id of ['drive','flux','devour','operator','auto','memory'])M.buy(s,i,id);
 M.advance(s);
 if(s.meta.rank<15&&s.meta.rank===M.ceiling(s))M.prestige(s,M.unlocked(s)+1);
 if(s.era!==previousEra){entries.push({era:s.era,seconds:s.time-campaignStart});previousEra=s.era;}
 if(s.meta.rank!==previousRank){rungs.push({seconds:s.time-campaignStart,era:s.era,rank:s.meta.rank});previousRank=s.meta.rank;}
 if(s.meta.rank===15&&BigInt(s.meta.epsilon)>=10n)break;
}
assert.equal(s.era,10);assert.equal(s.meta.rank,15);assert.equal(s.meta.epsilon,'10');assert(s.meta.up.every(row=>row.auto===1),'baseline all auto researches must have been paid for');
s.meta.auto={advance:true,shop:true,prestige:false};s.meta.focus='growth';s.auto.arrange=true;M.arrange(s);H.checkAch(s);
const baseline=snapshot(s),baselineSave=write('baseline-X-epsilon10.json',G.old.save(s));const campaign={entries,rungs,totalSeconds:s.time-campaignStart,runtimeMs:performance.now()-campaignRuntime,baseline,campaignSeed,baselineSave};write('campaign.json',campaign);
console.log(JSON.stringify({phase:'campaign',seconds:campaign.totalSeconds,runtimeMs:campaign.runtimeMs,up:baseline.up,baseline:baselineSave}));
// Compare the fast event integrator against the one-second original kernel from this exact baseline.
const direct=G.old.load(G.old.save(s)),fast=G.old.load(G.old.save(s));const eqStarted=performance.now(),equivalenceSeconds=86400;
M.tick(direct,equivalenceSeconds);G.Shadow.p1(fast,equivalenceSeconds);
for(const k of ['rank','epsilon','swallows','bestRank','bestEpsilon'])assert.equal(direct.meta[k],fast.meta[k],k);
assert.deepEqual(Array.from(direct.meta.proofs),Array.from(fast.meta.proofs));assert.deepEqual(JSON.parse(JSON.stringify(direct.meta.up)),JSON.parse(JSON.stringify(fast.meta.up)));
const progressError=Math.abs(direct.meta.progress-fast.meta.progress),echoError=Math.abs(direct.meta.echo-fast.meta.echo);assert(progressError<1e-7);assert(echoError<1e-10);
const currencyErrors=direct.meta.currency.map((v,i)=>Math.abs(v-fast.meta.currency[i]));assert(currencyErrors.every(e=>e<1e-6));
const equivalence={seconds:equivalenceSeconds,rank:fast.meta.rank,epsilon:fast.meta.epsilon,swallows:fast.meta.swallows,progressError,echoError,currencyErrors,runtimeMs:performance.now()-eqStarted,passed:true};write('equivalence.json',equivalence);console.log(JSON.stringify({phase:'equivalence',...equivalence}));
const checkpoints=[],simStarted=performance.now(),initialTime=s.time,initialEpsilon=BigInt(s.meta.epsilon),initialSwallows=s.meta.swallows;let elapsed=0,chunks=0;
// Reuse the independently validated first-day fast run; every later checkpoint continues this same state.
s=fast;elapsed=equivalenceSeconds;
for(const days of policy.checkpointsDays){const target=days*86400;while(elapsed<target){const dt=Math.min(259200,target-elapsed);G.Shadow.p1(s,dt);elapsed+=dt;chunks++;if(chunks%100===0)console.log(JSON.stringify({phase:'progress',days:elapsed/86400,targetDays:days,runtimeMs:performance.now()-simStarted,epsilon:s.meta.epsilon}));}
 assert.equal(s.time-initialTime,elapsed);assert.equal(s.era,10);assert.equal(s.meta.rank,15);
 H.checkAch(s);const checkpoint=snapshot(s),save=write(`checkpoint-${days}d.json`,G.old.save(s));const record={days,seconds:target,epsilonGained:String(BigInt(s.meta.epsilon)-initialEpsilon),swallowsGained:s.meta.swallows-initialSwallows,...checkpoint,save,runtimeMs:performance.now()-simStarted};checkpoints.push(record);write('results.partial.json',{sources,policy,campaign,equivalence,checkpoints,complete:checkpoints.length===6});console.log(JSON.stringify({phase:'checkpoint',days,epsilon:record.epsilon,gained:record.epsilonGained,progress:record.progress,runtimeMs:record.runtimeMs,saveSha256:save.sha256}));
}
const result={created:'2026-11-01',sources,policy,campaign,equivalence,checkpoints,complete:true,totalRuntimeMs:performance.now()-started,simRuntimeMs:performance.now()-simStarted,scriptSha256:sha(fs.readFileSync(__filename))};write('results.json',result);console.log(JSON.stringify({phase:'complete',checkpoints:checkpoints.length,totalRuntimeMs:result.totalRuntimeMs,output:out}));
