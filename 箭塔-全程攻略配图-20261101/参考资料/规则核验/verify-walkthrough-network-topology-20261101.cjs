const fs=require('node:fs');const {engine,epoch}=require('./hypertower/tests/gr-helper.cjs');const {H,G}=engine();const C=G.Era23,D=G.Era24;const checks={};
checks.research={23:G.Data.research[23],24:G.Data.research[24]};
function net(p=[0,0,0,0,0]){return {objects:['A','B','C','D'],arrows:[['ab','A','B'],['bd','B','D'],['ac','A','C'],['cd','C','D'],['ad','A','D']].map((r,i)=>({id:r[0],a:r[1],b:r[2],phase:p[i]})),glues:[]};}
for(const [name,phases]of [['coherent',[0,0,0,0,0]],['cancel',[0,0,0,2,0]],['orthogonal',[0,0,0,1,0]]]){const n=net(phases);n.glues=[{pathA:['ab','bd'],pathB:['ac','cd']}];let c=C.category(n),t=c.classes.find(x=>x.from==='A'&&x.to==='D'&&x.paths.length===2);checks[name]={counts:t.counts,intensity:t.intensity,coherence:t.coherence};if(name==='coherent'){n.glues.push({pathA:['ab','bd'],pathB:['ad']});c=C.category(n);checks.triple=c.structures.map(x=>({n:x.paths.length,I:x.intensity}));}}
checks.natural=C.natural(C.chain(6),C.chain(8),[0,1,2,3,4,5],[1,2,3,4,5,6]);checks.adjoint=C.adjoint(C.chain(6),C.chain(9),[0,1,2,3,4,5],[0,1,2,3,4,5,5,5,5]);checks.monads=[C.monad(C.chain(6),[0,1,2,3,4,5]),C.monad(C.chain(6),[1,1,3,3,5,5]),C.monad(C.chain(6),[1,2,3,4,5,5])];
checks.kan=C.kan(C.chain(6),C.chain(8),C.chain(9),[0,1,2,3,4,5],[0,1,2,3,4,5]);
checks.picture=[2,3,4,5,6].map(n=>{const P=Array.from({length:n},(_,i)=>i+1),w=D.picture(P);return {P,w,length:w.length,brunnian:D.brunnian(w,P),magnus:D.magnus(w)};});
checks.braids=[{b:[1,-2],n:3,w:[1]},{b:[1,2,1],n:3,w:[1]},{b:[2,1,2],n:3,w:[1]}].map(x=>({...x,key:D.braidKey(x.b,x.n),once:D.braid(x.w,x.b,x.n)}));
const s=epoch(H,G,24);G.add(s,'',1e15,24);checks.growth=G.Era24.addBraid(s,[1,-2],3,[1]);
const cover=D.covering([[1,2,0],[0,1,2]],3);checks.lifts=[[1],[1,1],[1,1,1],[1,2,-1,-2]].map(w=>({w,...D.lift(w,cover)}));
const diamonds={objects:['A','B','C','D'],arrows:net().arrows,glues:[]};checks.h1Before=D.groupoid(diamonds);diamonds.glues=[{pathA:['ab','bd'],pathB:['ac','cd']}];checks.h1OneGlue=D.groupoid(diamonds);diamonds.glues.push({pathA:['ab','bd'],pathB:['ad']});checks.h1TwoGlues=D.groupoid(diamonds);
const out='walkthrough-work-20261101/p3-network-topology-evidence.json';fs.writeFileSync(out,JSON.stringify(checks,null,2));console.log(JSON.stringify(checks,null,2));
