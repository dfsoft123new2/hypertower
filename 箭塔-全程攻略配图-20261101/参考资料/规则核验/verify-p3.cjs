const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root='D:/hypertower-recovery-20261026/hypertower';
const out='D:/hypertower-recovery-20261026/walkthrough-work-20261101';
const helper=require(root+'/tests/gr-helper.cjs');
const {H,G}=helper.engine();
const evidence={created:'2026-11-01',scope:'P3 guide claims: isolated constructed states, actual API actions; not natural campaign or global optimality proof',files:{},checks:{}};
for(const f of ['gr-core','gr-data','gr-shadow','gr-obs','gr-deg','gr-era21','gr-era22','gr-era23','gr-era24','gr-inf','gr-inf-auto']){const p=root+'/src/'+f+'.js';evidence.files[f]={path:p,sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')};}
evidence.checks.grades=[24.999,25,399.999,400,2499.999,2500].map(I=>({I,grade:G.Obs.stage(I)}));assert.deepEqual(evidence.checks.grades.map(x=>x.grade),[0,1,1,2,2,3]);
evidence.checks.levels=Object.fromEntries([21,22,23,24].map(id=>[id,{labels:G.Data.levels[id],steps:G.Data.levels[id].length-1,excitationHours:G.Data.hours[id],constantMultiplierOnePerJumpSeconds:G.Data.hours[id]*3600*1.6/(G.Data.levels[id].length-1)}]));
const req={};for(const id of [21,22,23,24]){const s=helper.epoch(H,G,id);req[id]=G.Data.levels[id].slice(0,-1).map((label,level)=>{s.p3.ep[id].level=level;return {level,label,requirements:G['Era'+id].requirements(s).map(x=>x.label)};});}evidence.checks.requirements=req;
{
 const s=helper.epoch(H,G,22),d={kind:'nim',value:1};
 const report=G.Era22.register(s,d);assert.equal(report.value,'*');assert.equal(report.t,0);assert.equal(report.birthday,1);
 const match=G.Era22.start(s,d,'L'),result=G.Era22.move(s,match.id,0);assert(result.ended&&result.winner==='L');
 const hot={kind:'form',L:[{kind:'number',value:1}],R:[{kind:'number',value:-1}]},hr=G.Era22.register(s,hot);assert.equal(hr.t,1);assert.equal(hr.birthday,2);
 G.Era22.enterFurnace(s,hr.source);G.Era22.tick(s,30);const tau=s.p3.ep[22].furnace[0].tau,q=G.Era22.quench(s,0);assert.equal(tau,.5);assert.equal(q.fraction,1);
 evidence.checks.games={nim:report,match:{winner:result.winner,history:result.history},hot:hr,tau,quench:q};
}
{
 const objects=['A','B','C','D'],arrows=[['ab','A','B'],['bd','B','D'],['ac','A','C'],['cd','C','D']].map(([id,a,b])=>({id,a,b,phase:0}));
 const glues=[{pathA:['ab','bd'],pathB:['ac','cd']}],n={objects,arrows,glues};const c=G.Era23.category(n),sq=c.structures.find(x=>x.from==='A'&&x.to==='D');assert.equal(sq.intensity,4);
 const n3=G.clone(n);n3.arrows.push({id:'ad',a:'A',b:'D',phase:0});n3.glues.push({pathA:['ad'],pathB:['ab','bd']});const t=G.Era23.category(n3).structures.find(x=>x.from==='A'&&x.to==='D');assert.equal(t.intensity,9);
 const C=G.Era23.chain(8),D=G.Era23.chain(1);assert(G.Era23.adjoint(C,D,Array(8).fill(0),[7]));
 evidence.checks.category={square:{paths:sq.paths.length,intensity:sq.intensity},triple:{paths:t.paths.length,intensity:t.intensity},chain8SingletonAdjoint:true};
}
{
 const I=G.Era24,picture=I.picture([1,2,3]),comm=I.reduce([1,2,-1,-2]);assert.equal(I.reduce([1,-1]).length,0);assert.deepEqual(Array.from(I.reduce([1,1,-1])),[1]);
 const brun=[1,2,3].map(i=>I.reduce(picture.filter(x=>Math.abs(x)!==i)).length);assert(brun.every(n=>!n));
 const braid=I.braid([1],[1,-2],3);assert.deepEqual(Array.from(braid.word),[1,3,-1]);
 evidence.checks.loops={empty:I.reduce([1,-1]),sameClass:I.reduce([1,1,-1]),commutator:comm,picture,deletedPegLengths:brun,braid};
}
{
 const I=G.Inf;const orders=['1','2','3','7','250000','1000000'].map(n=>({n,m:String(I.imJOrder(n)),gears:I.gearsOf(I.imJOrder(n))}));
 const s=helper.infinity(H,G);assert.equal(s.p3.inf.ring.m,'2');assert.equal(G.money(s.top.gamma).toString(),'0');G.add(s,'gamma',100);const chain=I.setChain(s,{d0:1,d:1,gamma:[],phi:[]});assert.equal(chain.h,1);assert.equal(G.money(s.top.gamma).toString(),'0');
 const m1Empty=I.zhoutian([],[],1,0),m1One=I.zhoutian([],[],1,1);assert.equal(m1Empty,false);assert.equal(m1One,true);
 const report=G.drain(I.grundyJob('0.3',64)),reg=I.registerOctal(s,'0.3',report);assert.equal(reg.status,'exact');
 evidence.checks.infinity={orders,teachingChain:chain,m1Empty,m1One,octal03:reg,treeFirstRowPrices:Array.from({length:8},(_,j)=>1000*2**j),treeFullFirstRowPrice:255000,evaporationBase:[1,10,100].map(M=>({M,seconds:M**3/(3*5.8)}))};
}
evidence.sourceLines={gates:'src/gr-core.js:51-96',excitation:'src/gr-core.js:116-123',observation:'src/gr-obs.js:4-6,74-98',nuclear:'src/gr-deg.js:72-87,176-203',era21:'src/gr-era21.js:31-64',era22:'src/gr-era22.js:61-77',era23:'src/gr-era23.js:31-90,102-137',era24:'src/gr-era24.js:27-50',infinity:'src/gr-inf.js:18-24,42-70,72-97',automation:'src/gr-inf-auto.js:39-49',limitations:'BACKEND_STATUS.md:182-198'};
const doc=fs.readFileSync(out+'/p3.md','utf8');evidence.document={path:out+'/p3.md',characters:doc.length,hanCharacters:(doc.match(/[\u4e00-\u9fff]/g)||[]).length,bytes:Buffer.byteLength(doc),sha256:crypto.createHash('sha256').update(doc).digest('hex'),figures:[...doc.matchAll(/<!-- figure: (.*?) -->/g)].map(m=>m[1]),captures:[...doc.matchAll(/<!-- capture: (.*?) -->/g)].map(m=>m[1])};
fs.writeFileSync(out+'/evidence-p3.json',JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify({passed:true,document:evidence.document,report:out+'/evidence-p3.json'},null,2));