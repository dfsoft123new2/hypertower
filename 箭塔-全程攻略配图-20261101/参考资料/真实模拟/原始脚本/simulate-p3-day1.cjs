'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),{performance}=require('node:perf_hooks');
const dir='D:/hypertower-recovery-20261026/walkthrough-work-20261101',base='D:/hypertower-recovery-20261026/hypertower';
const {engine,infinity}=require(base+'/tests/gr-helper.cjs'),{H,G}=engine();
const s=infinity(H,G);
const config={label:'P3 synthetic reproducible post-completion first-infinity baseline',notNaturalAcquisition:true,initialCircle:'1',initialDustAdded:'1e16',initialGammaAdded:'1000000',treeRows:4,research:8,opticalD:24,efficiency:11,field:16,coreTree:12,legacyMode:'exact',strategy:'Only shipped automatic observation/exploration/advance and infinity wood automation, immediate starvation; no manual post-baseline purchases or input edits',offlineMode:'Repeated genuine G.offline calls of at most 3600 seconds; silk4 yields gain=1; continuous repeat-offline simulation, not online wall-clock claim'};
G.add(s,'dust',config.initialDustAdded);G.add(s,'gamma',config.initialGammaAdded);
for(const [id,a]of Object.entries(s.p3.ep)){a.up.fill(8);a.auto={advance:true,explore:true,observe:true};a.level=G.Data.levels[id].length-1;a.complete=true;a.E=0;}
s.deg.core.phase=4;s.deg.core.tree={A:12,B:12,C:12,D:12};s.deg.core.relics={ns:10,quark:10,bh:10};s.deg.core.autoCollapse=false;
s.p3.inf.tree=Array(4).fill('255');s.p3.inf.automation={enabled:true,starve:'immediate',carry:0};
s.p3.sky.inst.D.fill(24);s.p3.sky.inst.eps.fill(11);s.p3.sky.inst.fov.fill(16);
s.p1.meta.auto={advance:true,shop:true,prestige:false};G.Shadow.mode(s,'exact');
G.Inf.setChain(s,{d0:1,d:1,gamma:[],phi:[]});G.Inf.seed(s,G.Inf.seedPlan(s.p3.inf.ring.gears).map(p=>({...p,s:'1000'})));
G.validate(s);
const initial=G.save(s);fs.writeFileSync(dir+'/simulation-p3-baseline.json',initial);
const summary=()=>({gameTime:s.time,circle:s.p3.inf.n,phase:s.p3.inf.phase,m:s.p3.inf.ring.m,dust:G.money(s.top.dust).toString(),gamma:G.money(s.top.gamma).toString(),epsilon:s.p1.meta.epsilon,p2Round:s.p2.legacy.round,chain:G.Inf.summary(s).h,stars:s.p3.inf.ring.stars.length,lit:s.p3.inf.ring.stars.filter(x=>x.star).length,zhoutian:s.p3.inf.ring.zhoutian,bh:s.deg.core.bh?.M||0,autoError:s.p3.inf.autoError||null,seedNext:s.p3.inf.seed.length});
const result={config,baselineSha256:crypto.createHash('sha256').update(initial).digest('hex'),baseline:summary(),samples:[],complete:false};fs.writeFileSync(dir+'/simulation-p3-progress.json',JSON.stringify(result,null,2));
const started=performance.now();let simulated=0;
for(const checkpoint of [60,600,3600,21600,86400]){while(simulated<checkpoint){const dt=Math.min(3600,checkpoint-simulated);G.offline(s,dt);simulated+=dt;}
 const row={simulatedSeconds:simulated,wallSeconds:(performance.now()-started)/1000,...summary()};result.samples.push(row);fs.writeFileSync(dir+'/simulation-p3-progress.json',JSON.stringify(result,null,2));console.log(JSON.stringify(row));}
G.validate(s);result.complete=true;result.runtimeSeconds=(performance.now()-started)/1000;fs.writeFileSync(dir+'/simulation-p3-day1.json',JSON.stringify(result,null,2));fs.writeFileSync(dir+'/simulation-p3-day1-save.json',G.save(s));console.log('COMPLETE P3 DAY1');