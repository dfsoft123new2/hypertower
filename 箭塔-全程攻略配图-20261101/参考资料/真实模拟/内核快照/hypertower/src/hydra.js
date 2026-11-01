/* Kirby-Paris convention: keep the parent branch and add n further copies. */
(function(root){
'use strict';
function kernel(Ord){
  const clone=t=>t.map(clone), key=t=>'('+t.map(key).sort().join('')+')';
  const canonical=t=>t.map(canonical).sort((a,b)=>{const x=key(a),y=key(b);return x<y?-1:x>y?1:0;});
  function size(t){let n=1;for(const c of t)n+=size(c);return n;}
  function validate(t,max=512){
    let n=0;function walk(a,d){if(!Array.isArray(a)||d>48||++n>max)throw Error('九头蛇超出节点预算');for(const c of a)walk(c,d+1);}
    walk(t,0);return t;
  }
  function heads(t,p=[],a=[]){for(let i=0;i<t.length;i++){const q=p.concat(i);if(!t[i].length)a.push(q);else heads(t[i],q,a);}return a;}
  function node(t,p){for(const i of p){if(!Number.isInteger(i)||i<0||i>=t.length)throw Error('头的位置已改变');t=t[i];}return t;}
  function cut(tree,path,n,options={}){
    if(!Number.isInteger(n)||n<1||n>10000||!Array.isArray(path)||!path.length||node(tree,path).length)throw Error('只能斩下一个叶子头');
    const copies=Math.max(1,n-(options.inhibit||0)),depth=path.length,t=clone(tree);
    const parent=node(t,path.slice(0,-1));parent.splice(path.at(-1),1);
    if(depth>1){
      const extra=size(parent)*copies;
      if(size(t)+extra>(options.maxNodes||512))return null;
      const gp=node(t,path.slice(0,-2));for(let j=0;j<copies;j++)gp.push(clone(parent));
    }
    return {tree:canonical(t),reward:depth*depth,depth,copies:depth>1?copies:0};
  }
  function ordinal(t){if(!Ord)throw Error('Worker 没有序数渲染器');let a=[];for(const c of t)a=Ord.natural(a,[[ordinal(c),'1']]);return a;}
  function fromOrdinal(a,max=96){
    let n=0;function walk(v){if(++n>max)throw Error('此序数的有限树超过 '+max+' 节点；请缩小算式');const t=[];for(const[e,c]of v){if(BigInt(c)>BigInt(max))throw Error('系数超过树预算');for(let j=0;j<Number(c);j++)t.push(walk(e));}return t;}
    return canonical(walk(a));
  }
  function replay(tree,path,opts={}){
    validate(tree,96);if(!Array.isArray(path)||path.length>128)throw Error('斩法长度无效');
    let t=canonical(tree),reward=0;
    for(let i=0;i<path.length;i++){if(!t.length)throw Error('蛇已死亡，不能继续斩击');const r=cut(t,path[i],i+1,{maxNodes:512,...opts});if(!r)throw Error('此斩法超出有限验证预算');reward+=r.reward;t=r.tree;}
    return {dead:!t.length,cuts:path.length,reward,tree:t};
  }
  function* search(tree,options={}){
    validate(tree,10);const maxCuts=Math.min(32,options.maxCuts||18),kind=options.kind||'kill',target=options.target||0;
    const initial=canonical(tree),queue=[{tree:initial,cuts:0,reward:0,path:[]}],seen=new Map();
    let i=0,expanded=0,best=null,min=null;const deaths={};
    while(i<queue.length){
      const s=queue[i++];expanded++;
      if(!s.tree.length){
        const r={cuts:s.cuts,reward:s.reward,path:s.path};
        if(!min)min=r;if(!deaths[s.cuts]||s.reward>deaths[s.cuts].reward)deaths[s.cuts]=r;
        if(!best||s.reward>best.reward)best=r;
        if(kind==='kill'||kind==='exact'&&s.cuts===target)return {found:true,complete:true,optimal:true,result:r,min,expanded,deaths};
        continue;
      }
      if(s.cuts>=maxCuts||s.cuts+size(s.tree)-1>maxCuts)continue;
      const unique=new Set();
      for(const p of heads(s.tree)){
        const r=cut(s.tree,p,s.cuts+1,{maxNodes:maxCuts-s.cuts});if(!r)continue;
        if(options.leftmost&&p.join('.')!==heads(s.tree)[0].join('.'))continue;
        const k=key(r.tree);if(unique.has(k))continue;unique.add(k);
        const reward=s.reward+r.reward,signature=(s.cuts+1)+'|'+k;
        if(seen.has(signature)&&seen.get(signature)>=reward)continue;seen.set(signature,reward);
        queue.push({tree:r.tree,cuts:s.cuts+1,reward,path:s.path.concat([p])});
      }
      if(expanded%64===0)yield {expanded,pending:queue.length-i};
      if(expanded>(options.maxStates||120000))return {found:!!best,complete:false,optimal:false,result:best,min,expanded,deaths};
    }
    const result=kind==='exact'?deaths[target]||null:kind==='reward'?best:min;
    return {found:!!result&&(kind!=='reward'||!target||result.reward>=target),complete:true,optimal:true,result,min,expanded,deaths};
  }
  function solve(tree,options){const g=search(tree,options);let r;do{r=g.next();}while(!r.done);return r.value;}
  return {clone,key,canonical,size,validate,heads,node,cut,ordinal,fromOrdinal,replay,search,solve};
}
const H=root.HT;H.Hydra=kernel(H.Ord);H.Hydra.kernelSource=kernel.toString();
})(typeof self!=='undefined'?self:this);
