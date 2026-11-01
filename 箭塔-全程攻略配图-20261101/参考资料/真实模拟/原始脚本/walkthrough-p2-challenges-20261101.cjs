const fs=require('node:fs'),path=require('node:path');
const base='D:/hypertower-recovery-20261026',dir=base+'/walkthrough-work-20261101';
const {H}=require(base+'/hypertower/tests/gr-helper.cjs').engine(),K=H.LateMath;
const cases=[];
for(let era=12;era<=20;era++)for(let trial=0;trial<4;trial++){
 let match=null,tried=0;
 for(const p of K.puzzles(era)){
  const candidates=[K.clone(p.solution)];
  if(era===12&&trial===0){const board=Array(64).fill('.');board[6*8+2]='w';board[7*8+1]='1';board[7*8+2]='p';candidates.push({board,feedback:2});}
  if(era===12&&trial===2){const old=p.solution.board,board=Array.from({length:64},(_,i)=>old[(i%8)*8+Math.floor(i/8)]);candidates.push({board,feedback:2});}
  if(era===12)for(const q of K.puzzles(era))candidates.push(K.clone(q.solution));
  if(era===13&&trial===2)candidates.push({colors:p.solution.colors,soil:p.solution.soil,sequence:[K.chain(2,0)]});
  if(era===14&&trial===3)candidates.push({order:p.solution.order.slice().reverse()});
  if(era===18&&trial===0)candidates.push({...K.clone(p.solution),selected:['VL']});
  if(era===18&&trial===1)candidates.push({...K.clone(p.solution),selected:['VL','MA']});
  if(era===19&&trial===0)candidates.push({...K.clone(p.solution),choice:false});
  if(era===19&&trial===1)candidates.push({slots:[-1,-1,-1,-1,-1,-1,-1,7],critical:0,choice:false});
  if(era===20&&trial===1)candidates.push({carry:[]});
  for(const d of candidates){tried++;try{const r=H.Late.evaluate(era,d,p.id,trial);if(r.valid){match={era,trial,puzzle:p.id+1,design:d,report:r};break;}}catch{}}
  if(match)break;
 }
 cases.push(match||{era,trial,found:false,tried});
}
let max={score:-Infinity},count=0,valid=0;
for(let a=-1;a<=0;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=2;c++)for(let critical=0;critical<=7;critical++){
 const design={slots:[a,b,c,-1,-1,-1,-1,-1],critical,choice:false};
 const r=H.Late.evaluate(19,design,0,3);count++;if(r.valid)valid++;if(r.score>max.score)max={...r,design};
}
const small={checked:count,valid,max,target:18};
const result={cases,small,characterCount:fs.readFileSync(dir+'/p2-core.md','utf8').length};
fs.writeFileSync(dir+'/challenges-p2-verified.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({characterCount:result.characterCount,small,cases:cases.map(c=>({era:c.era,trial:c.trial,puzzle:c.puzzle,found:c.found,score:c.report?.score,summary:c.report?.summary,design:c.design}))},null,2));
