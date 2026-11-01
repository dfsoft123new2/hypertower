'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const dir='D:/hypertower-recovery-20261026/walkthrough-work-20261101',base='D:/hypertower-recovery-20261026/hypertower';
const {engine,split,epoch}=require(base+'/tests/gr-helper.cjs'),{H,G}=engine(),extra={};
{
 const s=epoch(H,G,22),rows=[];
 for(let n=-50;n<50;n++)for(const design of [{kind:'number',value:n},{kind:'sum',parts:[{kind:'number',value:n},{kind:'number',value:0}]}]){
  const r=G.Era22.register(s,design);assert.equal(r.status,'exact');assert.equal(r.value,String(n));rows.push(r.source);
 }
 assert.equal(new Set(rows).size,200);assert.equal(Object.keys(s.p3.ep[22].objects).length,200);
 const levels=Object.entries(s.deg.levels).filter(([id])=>id.startsWith('val:'));assert.equal(levels.length,100);assert.ok(levels.every(([,l])=>l.g===2));G.validate(s);
 extra.twoHundred={range:'n=-50..49 inclusive',designs:'number(n), sum(number(n),number(0))',sources:200,values:100,allG2:true,validated:true};
}
{
 const s=split(H,G);G.add(s,'',1e8,21);s.p3.ep[21].up[2]=1;
 const cards=[5,3,10,10,10,10];for(const card of cards)assert.equal(G.Era21.travel(s,card),true);
 const before=s.p3.ep[21].current;assert.equal(before,1266);assert.equal(G.Era21.reach(G.Era21.decode(9)).depth.get(before),6);
 assert.equal(G.Era21.drill(s,9),true);assert.equal(s.p3.ep[21].stats.deepestDrill,6);G.validate(s);
 extra.drill={root:9,cards,before,target:9,graphDepth:6,hammerResearch:1,deepestDrill:s.p3.ep[21].stats.deepestDrill,validated:true};
}
{
 const s=epoch(H,G,22),design={kind:'sum',parts:[{kind:'nim',value:1},{kind:'nim',value:2}]};
 const {id}=G.Era22.start(s,design,'L');G.Era22.move(s,id,{part:1,move:1});G.Era22.move(s,id,{part:1,move:0});
 const m=s.p3.ep[22].matches[id];assert.equal(m.winner,'L');G.validate(s);extra.nimMatch={design,first:'L',history:m.history,winner:m.winner,validated:true};
}
extra.domineering=[];
for(const[rows,cols,value,t]of[[1,1,'0',0],[2,1,'1',0],[1,2,'-1',0],[2,2,'{1|-1}',1],[2,3,'{2|-1/2}',1.25]]){
 const report=G.Era22.evaluate({kind:'domineering',rows,cols});assert.equal(report.status,'exact');assert.equal(report.value,value);assert.equal(report.t,t);extra.domineering.push({rows,cols,report});
}
{
 const s=epoch(H,G,22),games=[];
 for(let n=0;n<2;n++){
  G.ForcingGame.start(s,{first:'R',plies:8});while(!s.p3.ep[22].forcing.ended)G.ForcingGame.move(s,1);
  const m=s.p3.ep[22].forcing;assert.equal(m.won,true);assert.deepEqual(Array.from(m.history,h=>h.side+':'+h.card),['R:8','L:1','R:8','L:1','R:8','L:1','R:8','L:1']);games.push(G.clone(m));
 }
 assert.equal(s.p3.ep[22].stats.forcingWins,2);G.validate(s);extra.forcing={wins:2,games,validated:true};
}
extra.octal=[];
for(const[code,expected]of[['0.3',n=>n%2],['0.33',n=>n%3],['0.1',n=>n===1?1:0]]){
 const report=G.Inf.octalReport(code,64);assert.equal(report.status,'exact');report.values.forEach((v,n)=>assert.equal(v,expected(n)));extra.octal.push({code,computed:64,firstValues:report.values.slice(0,20),period:G.Inf.findPeriod(report.values,code.length-2)});
}
const primaryPath=dir+'/evidence-p3-deep.json',primary=JSON.parse(fs.readFileSync(primaryPath,'utf8'));primary.extraTests=extra;
fs.writeFileSync(primaryPath,JSON.stringify(primary,null,2));fs.writeFileSync(dir+'/evidence-p3-deep-extra.json',JSON.stringify(extra,null,2));
console.log(JSON.stringify({tests:Object.keys(extra),twoHundred:extra.twoHundred,drill:extra.drill,forcingWins:extra.forcing.wins,octal:extra.octal},null,2));
