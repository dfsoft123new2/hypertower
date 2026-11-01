/* Exact Cantor normal forms below epsilon_0. No comparison of arbitrary phi/psi terms. */
(function (root) {
'use strict';
const H=root.HT, MAX_TERMS=256;
const Z=()=>[], F=n=>{const c=BigInt(n);if(c<0n)throw Error('序数不能为负');return c?[[[],String(c)]]:[];};
const one=()=>F(1), omega=()=>[[one(),'1']];
function cmp(a,b){
  for(let i=0;i<Math.min(a.length,b.length);i++){
    const c=cmp(a[i][0],b[i][0]);if(c)return c;
    const x=BigInt(a[i][1]),y=BigInt(b[i][1]);if(x!==y)return x<y?-1:1;
  }
  return Math.sign(a.length-b.length);
}
function check(a){
  let nodes=0;
  function walk(t,d){
    if(++nodes>4096||d>64||!Array.isArray(t)||t.length>MAX_TERMS)throw Error('序数超出结构预算');
    let prev=null;
    for(const p of t){
      if(!Array.isArray(p)||p.length!==2||typeof p[1]!=='string'||! /^[1-9][0-9]*$/.test(p[1])||p[1].length>10000)throw Error('序数系数无效');
      walk(p[0],d+1);if(prev!==null&&cmp(prev,p[0])<=0)throw Error('不是康托尔规范形');prev=p[0];
    }
  }
  walk(a,0);return a;
}
function out(a){return check(a);}
function add(a,b){
  if(!b.length)return a;if(!a.length)return b;
  const e=b[0][0],r=[];let i=0;
  while(i<a.length&&cmp(a[i][0],e)>0)r.push(a[i++]);
  if(i<a.length&&cmp(a[i][0],e)===0)r.push([e,String(BigInt(a[i][1])+BigInt(b[0][1]))]);else r.push(b[0]);
  return out(r.concat(b.slice(1)));
}
function natural(a,b){
  const r=[];let i=0,j=0;
  while(i<a.length||j<b.length){
    const c=i===a.length?-1:j===b.length?1:cmp(a[i][0],b[j][0]);
    if(c>0)r.push(a[i++]);else if(c<0)r.push(b[j++]);else{r.push([a[i][0],String(BigInt(a[i++][1])+BigInt(b[j++][1]))]);}
  }
  return out(r);
}
function mul(a,b){
  if(!a.length||!b.length)return [];
  let r=[];
  for(const [e,c]of b){
    const t=e.length?[[add(a[0][0],e),c]]:[[a[0][0],String(BigInt(a[0][1])*BigInt(c))],...a.slice(1)];
    r=add(r,t);
  }
  return out(r);
}
function finite(a){return !a.length?0n:a.length===1&&!a[0][0].length?BigInt(a[0][1]):null;}
function pred(a){
  if(!a.length||a.at(-1)[0].length)throw Error('只对后继序数取前驱');
  const r=a.slice(),c=BigInt(r.at(-1)[1])-1n;if(c)r[r.length-1]=[[],String(c)];else r.pop();return r;
}
function powFinite(a,n){
  if(n>32768n)throw Error('有限幂超出计算预算');
  let r=one(),b=a;
  while(n){if(n&1n)r=mul(r,b);n>>=1n;if(n)b=mul(b,b);}return out(r);
}
function pow(a,b){
  if(!b.length)return one();if(!a.length)return [];if(cmp(a,one())===0)return a;
  if(a.length===1&&a[0][1]==='1'&&a[0][0].length)return out([[mul(a[0][0],b),'1']]);
  const last=b.at(-1),n=last[0].length?0n:BigInt(last[1]),limit=n?b.slice(0,-1):b;
  if(!limit.length)return powFinite(a,n);
  let exponent;
  if(finite(a)!==null){
    // limit = omega * gamma; remove the leading 1 from finite CNF exponents.
    exponent=limit.map(([e,c])=>[finite(e)!==null?F(finite(e)-1n):e,c]);
  }else exponent=mul(a[0][0],limit);
  return out(mul([[exponent,'1']],powFinite(a,n)));
}
function fs(a,n){
  if(!Number.isInteger(n)||n<0||n>10000)throw Error('基本序列下标无效');
  if(!a.length)return [];
  if(!a.at(-1)[0].length)return pred(a);
  const r=a.slice(),[e,c]=r.pop();if(BigInt(c)>1n)r.push([e,String(BigInt(c)-1n)]);
  const t=!e.at(-1)[0].length?[[pred(e),String(n+1)]]:[[fs(e,n),'1']];
  return out(add(r,t));
}
function eps0(n){
  if(!Number.isInteger(n)||n<0||n>32)throw Error('ε₀ 基本序列预览上限为 32');
  let a=one();for(let i=0;i<=n;i++)a=[[a,'1']];return out(a);
}
function fmt(a){
  if(!a.length)return '0';
  return a.map(([e,c])=>{
    if(!e.length)return c;
    const es=cmp(e,one())===0?'': '^'+(e.length===1&&finite(e)!==null?fmt(e):'('+fmt(e)+')');
    return 'ω'+es+(c==='1'?'':'·'+c);
  }).join(' + ');
}
function parse(str){
  str=String(str).replaceAll('ω','w').replaceAll('·','*').replace(/\s/g,'');
  if(str.length>2048)throw Error('算式过长');let i=0;
  function atom(){
    let r;
    if(str[i]==='w'){i++;r=omega();}
    else if(str[i]==='('){i++;r=sum();if(str[i++]!==')')throw Error('括号不匹配');}
    else{const m=/^\d+/.exec(str.slice(i));if(!m)throw Error('需要数字、ω 或括号');i+=m[0].length;r=F(m[0]);}
    return r;
  }
  let depth=0;
  function power(){if(++depth>64)throw Error('表达式太深');let a=atom();if(str[i]==='^'){i++;a=pow(a,power());}depth--;return a;}
  function product(){let a=power();while(str[i]==='*'){i++;a=mul(a,power());}return a;}
  function sum(){let a=product();while(str[i]==='+'){i++;a=add(a,product());}return a;}
  const a=sum();if(i!==str.length)throw Error('无法识别的算式');return out(a);
}
H.Ord={zero:Z,finite:F,one,omega,compare:cmp,validate:check,add,natural,mul,pow,pred,fs,eps0,format:fmt,parse,asFinite:finite};
})(typeof self!=='undefined'?self:this);
