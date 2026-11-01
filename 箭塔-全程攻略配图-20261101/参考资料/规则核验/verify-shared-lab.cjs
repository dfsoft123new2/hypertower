const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {engine,split,epoch}=require('D:/hypertower-recovery-20261026/hypertower/tests/gr-helper.cjs');const {H,G}=engine();const checks=[];
const near=(a,b)=>assert(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),a+' != '+b);
{
 const s=split(H,G);G.add(s,'gamma',10000);G.add(s,'',10000,21);const gamma=G.money(s.top.gamma).toNumber(),funds=G.funds(s,21).toNumber();assert(G.Obs.upgrade(s,0,'D'));near(gamma-G.money(s.top.gamma).toNumber(),30);near(funds-G.funds(s,21).toNumber(),100);near(G.Obs.instrument(s,0).A,2.25);assert(G.Obs.upgrade(s,0,'eps'));near(G.Obs.instrument(s,0).eff,.45);assert(G.Obs.upgrade(s,0,'queue'));assert.equal(s.p3.sky.inst.queue[0],10);checks.push({case:'firstInstrumentPurchases',apertureGamma:30,apertureFunds:100,area:2.25,efficiency:.45,queue:10});
}
{
 for(const d of [0,2]){const s=split(H,G);s.deg.core.tree.D=d;G.add(s,'gamma',10000);const before=G.money(s.top.gamma).toNumber();for(let i=0;i<5;i++)assert(G.inject(s,21));assert(!G.inject(s,21));near(s.p3.ep[21].E,5);const spent=before-G.money(s.top.gamma).toNumber();near(spent,d===2?316.192:395.24);checks.push({case:'fiveManualInjections',D:d,spent,E:s.p3.ep[21].E,sixthAllowed:false});}
}
{
 const s=epoch(H,G,23);s.deg.core.tree.D=0;for(const [key,color]of [['r','R'],['g','G'],['b','B']]){G.Deg.register(s,'guide-test:'+key,'a-'+key,{kind:'value',era:22,color,sig:0});G.Deg.register(s,'guide-test:'+key,'b-'+key,{kind:'value',era:22,color,sig:0});}assert(G.Deg.magnetic(s,'guide-test:r'));const before=G.money(s.top.gamma).toNumber();s.time+=10;G.Deg.tick(s,10);near(G.money(s.top.gamma).toNumber()-before,.4);assert(G.Deg.magnetic(s,'guide-test:r',false));near(s.deg.cooldowns['guide-test:r']-s.time,600);checks.push({case:'magneticG2',tenSecondPhotons:.4,removalCooldown:600});
 s.time+=600;assert(G.Deg.baryon(s,['guide-test:r','guide-test:g','guide-test:b']));assert.equal(s.deg.baryons[0].factor,1);assert(G.Deg.dismantle(s,0));near(s.deg.cooldowns['guide-test:r']-s.time,1800);checks.push({case:'rgbConfinement',distinctMaterials:3,factor:1,dismantleCooldown:1800});
}
{
 const s=epoch(H,G,24);s.deg.core.tree.C=0;s.deg.core.bh={M:10,initial:10,starving:false,dischargeUntil:0};const key='guide-test:univalence';G.Deg.register(s,key,'u1',{era:24});G.Deg.register(s,key,'u2',{era:24});const beforeM=s.deg.core.bh.M,beforeS=G.money(s.top.horizonS).toNumber();assert(G.Deg.univalent(s,key));near(s.deg.core.bh.M-beforeM,Math.log(2));near(G.money(s.top.horizonS).toNumber()-beforeS,2*Math.log(2));assert.equal(s.deg.levels[key].univalent,true);checks.push({case:'g2Univalence',addedMass:Math.log(2),addedHorizonS:2*Math.log(2)});
}
const evaporation=[1,2,5,10,20,50,100,1000].map(M=>{const seconds=M**3/(3*5.8),r=G.Deg.evaporate(M,seconds+1);assert.equal(r.M,0);near(r.seconds,seconds);return {M,seconds};});
const file='D:/hypertower-recovery-20261026/walkthrough-work-20261101/evidence-shared-lab.json';fs.writeFileSync(file,JSON.stringify({passed:true,method:'Independent isolated fixtures exercise actual purchase, injection, magnetic, confinement, univalence and evaporation actions; not player save progress.',checks,evaporation,sourceSHA256:crypto.createHash('sha256').update(fs.readFileSync('D:/hypertower-recovery-20261026/hypertower/src/gr-deg.js')).digest('hex')},null,2));console.log(JSON.stringify({passed:true,checks:checks.length,evaporationExamples:evaporation.length}));
