/* Text value constructor and the estimate / construct / sum sandbox workflows. */
(function(root){
 'use strict';const G=root.HT.GR,E=G.Era22,{assert,number}=G;
 function negative(d){if(d.kind==='number')return {kind:'number',value:E.q(d.value).neg().toString()};if(d.kind==='nim')return G.clone(d);if(d.kind==='sum')return {kind:'sum',parts:d.parts.map(negative)};assert(d.kind==='form','值构造器不接受此规则');return {kind:'form',L:d.R.map(negative),R:d.L.map(negative)};}
 function parse(text){assert(typeof text==='string'&&text.length<=4096,'目标值长度超出预算');const source=text.replace(/\s+/g,'').replace(/∗/g,'*').replace(/−/g,'-');let at=0,used=0;
  const zero=()=>({kind:'number',value:0}),star=()=>({kind:'nim',value:1}),up=()=>({kind:'form',L:[zero()],R:[star()]});
  function expression(depth){assert(depth<=32&&++used<=2048,'目标值嵌套超出预算');const parts=[atom(depth)];while(source[at]==='+'){at++;parts.push(atom(depth));assert(parts.length<=12,'目标值分量超预算');}return parts.length===1?parts[0]:{kind:'sum',parts};}
  function atom(depth){assert(depth<=32&&++used<=2048,'目标值嵌套超出预算');const c=source[at];
   if(c==='{'){at++;const L=[],R=[];function list(out,end){if(source[at]===end)return;while(true){out.push(expression(depth+1));assert(L.length+R.length<=32,'目标值选项超预算');if(source[at]!==',')break;at++;}}list(L,'|');assert(source[at++]==='|','一般形式需要 |');list(R,'}');assert(source[at++]==='}','一般形式缺少 }');return {kind:'form',L,R};}
   if(c==='±'){at++;const d=atom(depth+1);return {kind:'form',L:[d],R:[negative(d)]};}
   if(c==='↑'||c==='↓'||c==='⇑'||c==='⇓'){at++;const n=c==='⇑'||c==='⇓'?2:1,part=c==='↓'||c==='⇓'?negative(up()):up(),parts=Array.from({length:n},()=>G.clone(part));if(source[at]==='*'){at++;const digits=/^\d+/.exec(source.slice(at));const value=digits?number(+digits[0],0,64,true):1;if(digits)at+=digits[0].length;parts.push({kind:'nim',value});}return parts.length===1?parts[0]:{kind:'sum',parts};}
   if(c==='*'){at++;const digits=/^\d+/.exec(source.slice(at));if(digits)at+=digits[0].length;return {kind:'nim',value:digits?number(+digits[0],0,64,true):1};}
   if(c==='+'||c==='-'&&!/\d/.test(source[at+1]||'')){at++;const d=atom(depth+1);return c==='-'?negative(d):d;}
   const token=/^-?\d+(?:\/(?:2\^\d+|\d+))?/.exec(source.slice(at));assert(token,'目标值含未知符号');at+=token[0].length;let value=token[0];if(value.includes('^')){const [numerator,power]=value.split('/2^');number(+power,0,40,true,'二进精度');value=numerator+'/'+(1n<<BigInt(power));}const q=E.q(value);assert((q.d&(q.d-1n))===0n,'目标值必须是二进有理数');return {kind:'number',value:q.toString()};
  }
  const design=expression(0);assert(at===source.length,'目标值尾部含未知符号');E.validateDesign(design);return design;
 }
 function assess(design,target){const goal=typeof target==='string'?parse(target):target,r=E.compareDesigns(design,goal);if(r.status!=='exact')return {...r,correct:null};return {...r,correct:r.equal,actual:E.evaluate(design),target:E.evaluate(goal)};}
 function construct(s,design,target){const result=assess(design,target);if(result.status!=='exact'||!result.correct)return result;const registered=E.register(s,design);return {...result,registered};}
 function selectSum(s,{sources,designs,target,register=false}){assert(!(sources&&designs),'分量来源不能重复指定');const parts=sources?sources.map(id=>{const o=s.p3.ep[22].objects[id];assert(o,'求和引用未知局面');return G.clone(o.design);}):designs;assert(Array.isArray(parts)&&parts.length<=12,'求和分量超预算');const design={kind:'sum',parts};E.validateDesign(design);if(target!==undefined)return register?construct(s,design,target):assess(design,target);return E.evaluate(design);}
 Object.assign(E,{negativeDesign:negative,parseValue:parse,assessValue:assess,constructValue:construct,selectSum});
 Object.assign(G.handlers,{'22.estimate':(s,a)=>assess(a.design,a.target),'22.construct':(s,a)=>construct(s,a.design,a.target),'22.sum':(s,a)=>selectSum(s,a),'22.value':(s,a)=>{const design=parse(a.text);s.p3.ep[22].editor=design;return E.evaluate(design);}});
})(typeof self!=='undefined'?self:this);
