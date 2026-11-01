/* Exact, bounded stable-chain planning and infinity automation. */
(function(root){
 'use strict';
 const G=root.HT.GR,I=G.Inf,{assert,number}=G,cache=new Map();
 function settings(s){const inf=s.p3.inf;return inf.automation||={enabled:true,starve:'immediate',carry:0};}
 function configure(s,options={}){assert(s.p3?.inf,'无限循环尚未开启');const a=settings(s);if(options.on!==undefined)a.enabled=!!options.on;if(options.starve!==undefined){assert(['immediate','imaged'].includes(options.starve),'自动断供模式无效');a.starve=options.starve;}return {...a};}
 function degreePlan(s,{budget=2000000}={}){
  const inf=s.p3.inf;assert(inf,'稳定链尚未开启');number(budget,1,10000000,true);const net=s.p3.ep[23].net,old=inf.chain,cap=old.cap,m=BigInt(inf.ring.m),key=JSON.stringify({net,chain:old,m:inf.ring.m,budget});if(cache.has(key))return cache.get(key);
  let used=0;const spend=()=>{if(++used>budget)throw Error('自动改度超出计算预算，未判定');};
  try{
   const signed=(n,previous)=>Math.abs(n-previous)<=Math.abs(-n-previous)?n:-n;
   function coprimeEnd(c){for(let d=c;d>=1;d--){spend();if(I.gcd(d,m)===1n)return d;}return 0;}
   const d=signed(coprimeEnd(cap[3]),old.d),validPhi=!old.phi.some(([id])=>!net.arrows.some(e=>e.id===id))&&I.isCocycle(net,old.phi).ok;
   let best=null;
   function candidate(gamma,phi,ip){
    let value=null;
    for(const direction of [1,-1]){let t=direction===1?ip+cap[0]:ip-cap[0];const end=direction===1?ip-cap[0]:ip+cap[0];while(direction===1?t>=end:t<=end){spend();if(t&&I.gcd(t,m)===1n){const d0=t-ip;if(!value||Math.abs(t)>Math.abs(value.t)||Math.abs(t)===Math.abs(value.t)&&Math.abs(d0-old.d0)<Math.abs(value.d0-old.d0))value={t,d0};break;}t-=direction;}}
    if(!value)return;
    const chain={base:old.base||1,d0:value.d0,d,gamma:G.clone(gamma),phi:G.clone(phi),cap:cap.slice()},h=d*value.t;if(!Number.isSafeInteger(h))throw Error('自动和乐超出安全整数，未判定');
    const oldPhi=new Map(old.phi),newPhi=new Map(phi),delta=Math.abs(chain.d0-old.d0)+Math.abs(d-old.d)+Math.abs(gamma.length-old.gamma.length)+[...new Set([...oldPhi.keys(),...newPhi.keys()])].reduce((n,id)=>n+Math.abs((newPhi.get(id)||0)-(oldPhi.get(id)||0)),0);
    if(!best||Math.abs(h)>Math.abs(best.h)||Math.abs(h)===Math.abs(best.h)&&delta<best.delta)best={chain,h,delta,cost:50*delta};
   }
   const homology=G.Era24.groupoid(net);
   if(!homology.freeRank){assert(validPhi&&I.closedWalk(net,old.gamma),'稳定链已失效，请先修正后再自动改度');candidate(old.gamma,old.phi,0);}
   else{
    assert(4*cap[1]<=256,'自动改度闭合走法搜索超过 256 步预算，未判定');
    const edges=net.arrows,vertices=net.objects,out=new Map(vertices.map(v=>[v,[]]));edges.forEach((e,i)=>{out.get(e.a).push({to:e.b,i,dir:1});out.get(e.b).push({to:e.a,i,dir:-1});});
    const walks=new Map(),coeff=Array(edges.length).fill(0);
    for(const start of vertices){const walk=[];function visit(v){spend();if(v===start){const signature=coeff.join(',')+':'+walk.length;if(!walks.has(signature))walks.set(signature,{walk:G.clone(walk),coeff:coeff.slice()});}if(walk.length===4*cap[1])return;for(const step of out.get(v)){coeff[step.i]+=step.dir;walk.push([edges[step.i].id,step.dir]);visit(step.to);walk.pop();coeff[step.i]-=step.dir;}}visit(start);}
    const constraints=net.glues.map(g=>{const row=Array(edges.length).fill(0);for(const [path,sign]of [[g.pathA||g.a,1],[g.pathB||g.b,-1]])for(const id of path.edges||path)row[edges.findIndex(e=>e.id===id)]+=sign;return row;});
    const values=Array(edges.length).fill(0);
    function assign(at){spend();for(const row of constraints){let sum=0,bound=0;for(let i=0;i<edges.length;i++)if(i<at)sum+=row[i]*values[i];else bound+=Math.abs(row[i])*cap[2];if(Math.abs(sum)>bound)return;}if(at===edges.length){const phi=edges.map((e,i)=>[e.id,values[i]]);for(const w of walks.values()){spend();candidate(w.walk,phi,w.coeff.reduce((n,c,i)=>n+c*values[i],0));}return;}for(let v=-cap[2];v<=cap[2];v++){values[at]=v;assign(at+1);}}
    assign(0);
   }
   assert(best,'容量内未找到非零互素和乐');const result={status:'exact',...best,operations:used};if(cache.size>=8)cache.delete(cache.keys().next().value);cache.set(key,result);return result;
  }catch(error){const result={status:'unknown',reason:error.message,operations:used};if(cache.size>=8)cache.delete(cache.keys().next().value);cache.set(key,result);return result;}
 }
 function planDegree(s,options={}){return G.clone(degreePlan(s,options));}
 function autoDegree(s,options){assert(I.treeLevel(s.p3.inf,5)>=4,'自动改度需要第三阶「木」');const pending=degreePlan(s,options);if(pending.status!=='exact')return G.clone(pending);if(G.money(s.top.gamma).lt(pending.cost))return false;const plan=G.clone(pending),result=I.setChain(s,plan.chain);if(result!==false)s.p3.inf.meta.degreeRing=s.p3.inf.n;return result===false?false:{...plan,...result};}
 function automatic(s,dt){const inf=s.p3.inf,a=settings(s),wood=I.treeLevel(inf,5);if(!a.enabled||!wood)return;a.carry+=dt;const interval=Math.max(.001,1/1.25**Math.min(64,Math.max(0,wood-4)));if(a.carry+1e-9<interval)return;a.carry%=interval;
  if(wood>=4&&inf.meta.degreeRing!==inf.n){const r=autoDegree(s);if(r?.status==='unknown')inf.autoError=r.reason;}
  if(wood>=1&&inf.phase==='kong'&&!inf.seed.length)try{I.autoSeed(s);}catch(error){inf.autoError=error.message;}
  if(wood>=2&&inf.phase==='zhu'&&inf.ring.zhoutian)I.collapse(s);
  if(wood>=2&&inf.phase==='huai'&&(a.starve==='immediate'||s.p3.sky.obs['src:24:central-bh']?.marks.includes('image')||inf.meta.photonRings['src:24:central-bh']))I.starve(s);
  if(wood>=3&&inf.phase==='kong'&&inf.bh.M_BH===0)I.rewind(s);
 }
 const previousValidate=I.validate;I.validate=function(s){previousValidate(s);const a=s.p3.inf.automation;if(a){assert(typeof a.enabled==='boolean'&&['immediate','imaged'].includes(a.starve),'无限循环自动化配置无效');number(a.carry,0,1);}};
 Object.assign(I,{automationSettings:settings,configureAutomation:configure,planDegree,autoDegree,automatic});
 Object.assign(G.handlers,{'inf.autoDegree':(s,a)=>autoDegree(s,a.options),'inf.automation':(s,a)=>configure(s,a)});
})(typeof self!=='undefined'?self:this);
