/* Isolated XI--XX archive: standard proofs, canonical hashes and integer signatures. */
(function(root){
 'use strict';const H=root.HT,G=H.GR,K=H.LateMath,D=H.Hydra,{assert,number}=G;
 const romans=['XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'],rawHashes=new WeakMap();
 function importedHash(design){const raw=G.stable(design),cached=rawHashes.get(design);if(cached?.raw===raw)return cached.hash;const hash=G.hash64(raw);rawHashes.set(design,{raw,hash});return hash;}
 function address(era,id){number(era,11,20,true,'旧纪元');number(id,0,23,true,'谜题');return 'puz:'+era+':'+id;}
 function puzzle(era,id){address(era,id);return era===11?D.PUZZLES[id]:K.puzzles(era)[id];}
 function template(era,id){const p=puzzle(era,id);return era===11?{tree:G.clone(p.tree),path:[]}:K.empty(era,id);}
 function parse(text){assert(typeof text==='string'&&text.length<=65536,'草稿超过 64 KB');return JSON.parse(text,(key,value)=>{assert(!['__proto__','constructor','prototype'].includes(key),'设计含无效字段');return value;});}
 function prepare(era,id,input){
  const p=puzzle(era,id);assert(input&&typeof input==='object'&&!Array.isArray(input),'设计应为对象');K.bounded(input);
  assert(!input.variant&&!input.inhibit&&(input.trial===undefined||input.trial===-1),'档案仅接受标准规则解');
  const d=G.clone(input);
  if(era===11){D.validate(d.tree,96);assert(D.key(d.tree)===D.key(p.tree),'初始九头树与题目不符');assert(Array.isArray(d.path)&&d.path.length<=128,'斩法长度无效');}
  else H.Late.validateDesign(era,d,id);
  return d;
 }
 function treeForm(t){const children=t.ch.map(treeForm).sort((a,b)=>{const x=G.stable(a),y=G.stable(b);return x<y?-1:x>y?1:0;});return {c:t.c,ch:children};}
 function machineForm(m){
  // Reachable states use BFS first visits. Minimize the remaining names too,
  // so renaming an unreachable state cannot manufacture a different proof.
  const names=new Map([[0,0]]),queue=[0];
  for(let i=0;i<queue.length;i++)for(let b=0;b<m.symbols;b++){const t=m.table[queue[i]*m.symbols+b];if(t[2]==='H')continue;const next=t.charCodeAt(2)-65;if(!names.has(next)){names.set(next,names.size);queue.push(next);}}
  const rest=Array.from({length:m.states},(_,i)=>i).filter(i=>!names.has(i));let best=null;
  function visit(left){if(left.length){for(const state of left){names.set(state,names.size);visit(left.filter(x=>x!==state));names.delete(state);}return;}
   const table=Array(m.table.length);for(const[old,next]of names)for(let b=0;b<m.symbols;b++){const t=m.table[old*m.symbols+b];table[next*m.symbols+b]=t.slice(0,2)+(t[2]==='H'?'H':String.fromCharCode(65+names.get(t.charCodeAt(2)-65)));}
   const key=JSON.stringify(table);if(best===null||key<best)best=key;
  }visit(rest);return JSON.parse(best);
 }
 function canonical(era,id,input){
  const d=prepare(era,id,input);let form;
  if(era===11)form=d.path;
  else if(era===12)form=d.board.join('');
  else if(era===13)form=d.sequence.map(treeForm);
  else if(era===14)form=d.order;
  else if(era===15){const x=Math.min(...d.cells.map(p=>p[0])),y=Math.min(...d.cells.map(p=>p[1]));form=d.cells.map(p=>[p[0]-x,p[1]-y]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);}
  else if(era===16)form=machineForm(d.machine);
  else if(era===17)form=[d.certificate.start,d.certificate.period,d.certificate.translation];
  else if(era===18)form={grid:d.grid,selected:d.selected.slice().sort()};
  else if(era===19)form={slots:d.slots,critical:d.critical,choice:d.choice};
  else form=d.carry.slice().sort();
  return G.stable(form);
 }
 function signatures(era,r){let values=[];if(era===11)values=[r.cuts];else if(era===13)values=[r.score];else if(era===15)values=[r.period,r.population];else if(era===16)values=[r.steps,r.ones];else if(era===17)values=[r.certificate.period];return [...new Set(values.filter(n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000))].slice(0,2);}
 function* verifyJob(era,id,input){
  const p=puzzle(era,id),d=prepare(era,id,input);let r;
  yield {stage:'validate',era,puzzle:id};
  if(era===11){r=D.replay(d.tree,d.path);r.valid=r.dead&&r.cuts<=p.maxCuts&&(p.kind!=='exact'||r.cuts===p.target)&&(p.kind!=='reward'||r.reward>=p.target);r.summary=r.cuts+' 刀 · 收获 '+r.reward+(r.dead?' · 已斩尽':' · 尚未斩尽');}
  else r=yield* K.evaluateJob(era,d,id,{});
  assert(r.valid,'设计未达到标准题目目标：'+r.summary);
  const configuration=canonical(era,id,d);return {era,id,key:address(era,id),hash:G.hash64(configuration),configuration,signatures:signatures(era,r),summary:r.summary};
 }
 function references(s,era,id,includeDesign=true){
  const key=address(era,id),p=puzzle(era,id),refs=[];
  for(const b of s.p2.blueprints||[]){
   if(b.era!==era||era!==11&&(b.payload?.puzzle!==id||(b.payload?.trial??-1)!==-1))continue;
   const design=b.payload?.design||b.payload;if(!design)continue;
   if(era===11){try{D.validate(design.tree,96);if(D.key(design.tree)!==D.key(p.tree))continue;}catch{continue;}}
   const level='puz:'+era+':'+(b.payload?.puzzle??b.id),hash=importedHash(design);
   if(!s.deg.levels[level]?.hashes.includes(hash))continue;
   refs.push({id:b.id,label:b.name||b.id,key:level,hash,unassigned:level!==key,...(includeDesign?{design:G.clone(design)}:{})});
  }return refs;
 }
 function* checkJob(data){
  const result=yield* verifyJob(data.era,data.id,data.design);result.duplicate=null;
  assert(Array.isArray(data.references||[])&&(data.references||[]).length<=64,'旧蓝图引用超预算');
  for(const ref of data.references||[]){
   yield {stage:'legacy-reference'};
   try{if(G.hash64(canonical(data.era,data.id,ref.design))!==result.hash)continue;const proof=yield* verifyJob(data.era,data.id,ref.design);if(proof.hash===result.hash){result.duplicate={key:ref.key,hash:ref.hash,unassigned:ref.unassigned};break;}}catch{/* An old trial or unverifiable blueprint is not evidence of a standard solution. */}
  }return result;
 }
 function context(s,era,id){assert(s.p3,'尚未进入 XXI');return {key:address(era,id),references:references(s,era,id)};}
 function fingerprint(s,era,id){const x=context(s,era,id);return G.stable({level:s.deg.levels[x.key]||null,references:x.references,signatures:s.p3.legacyArchive?.signatures[x.key]||null});}
 function commit(s,result,refs){
  const l=s.deg.levels[result.key];
  if(result.duplicate||l?.hashes.includes(result.hash))return {status:'duplicate',key:result.key,g:l?.g||0,signatures:result.signatures,summary:result.duplicate?.unassigned?'旧蓝图已有相同解；它缺少题号，保留原能级，不重复登记。':'已有相同规范解，不增加简并。'};
  const known=new Set([...(refs||[]).filter(r=>r.key===result.key).map(r=>r.hash),...Object.keys(s.p3.legacyArchive?.signatures[result.key]||{})]);
  if(l?.hashes.some(hash=>!known.has(hash)))return {status:'unknown',key:result.key,g:l.g,signatures:[],summary:'历史哈希缺少原设计，无法确认是否为不同解，本次未登记。'};
  assert(!l?.univalent,'该能级已单值化');assert(!l||l.g<(result.era===14?1:G.Deg.capacity(s,l)),'该能级已达到简并容量');
  // Stage only the two affected branches. No failed budget check can leave a
  // half-written level, integer source or archive ledger in the live save.
  const trial={...s,deg:G.clone(s.deg),p3:{...s.p3,legacyArchive:G.clone(s.p3.legacyArchive||{version:1,signatures:{}})}};
  assert(G.Deg.register(trial,result.key,result.configuration,{era:result.era,color:'R',sig:result.signatures[0]}),'构型未登记');
  trial.p3.legacyArchive.signatures[result.key]||={};trial.p3.legacyArchive.signatures[result.key][result.hash]=result.signatures.slice();
  for(const n of result.signatures)G.Deg.integer(trial,n,result.era);
  G.save(trial);
  s.deg=trial.deg;s.p3.legacyArchive=trial.p3.legacyArchive;
  return {status:'registered',key:result.key,hash:result.hash,g:s.deg.levels[result.key].g,signatures:result.signatures,summary:result.summary};
 }
 function submit(s,era,id,input){const c=context(s,era,id);return commit(s,G.drain(checkJob({era,id,design:input,references:c.references})),c.references);}
 async function submitAsync(s,era,id,input,progress=()=>{},options={}){
  assert(!G.Jobs.busy,'已有计算正在运行，请稍后再提交');const c=context(s,era,id),before=fingerprint(s,era,id),design=prepare(era,id,input);
  const output=await G.Jobs.run('legacy-solution',{era,id,design,references:c.references},progress,options);
  if(output.cancelled)return {status:'cancelled'};
  assert(!options.isCurrent||options.isCurrent(),'游戏存档已切换，本次结果未写入');assert(fingerprint(s,era,id)===before,'计算期间旧谱或蓝图已变化，请重新提交');
  return {...commit(s,output.result,c.references),mode:output.mode};
 }
 function select(s,era,id){context(s,era,id);s.p3.ui.legacyEra=era;s.p3.ui.legacyPuzzle=id;s.p3.ui.legacyDraft=JSON.stringify(template(era,id),null,2);return true;}
 function draft(s,text){assert(s.p3,'尚未进入 XXI');assert(typeof text==='string'&&text.length<=65536,'草稿超过 64 KB');s.p3.ui.legacyDraft=text;return true;}
 function loadBlueprint(s,era,id,blueprint){const ref=references(s,era,id).find(r=>r.id===blueprint);assert(ref,'旧蓝图引用已变化');select(s,era,id);draft(s,JSON.stringify(ref.design,null,2));return true;}
 function view(s,{era=s.p3?.ui.legacyEra||11,id=s.p3?.ui.legacyPuzzle||0}={}){
  context(s,era,id);const rows=Array.from({length:24},(_,i)=>{const key=address(era,i),p=puzzle(era,i),l=s.deg.levels[key],known=s.p3.legacyArchive?.signatures[key]||{},sig=[...new Set(Object.values(known).flat())].sort((a,b)=>a-b);return {id:i,key,name:p.name,g:l?.g||0,capacity:era===14?1:8,signatures:sig,univalent:!!l?.univalent,hint:era===14?'此能级不简并':'不同解数量未统计'};});
  const p=puzzle(era,id),selected=rows[id],refs=references(s,era,id,false),goal=era===11?(p.kind==='exact'?'恰好 '+p.target+' 刀斩尽':p.kind==='reward'?'斩尽且收获 ≥ '+p.target:'斩尽九头蛇')+'；最多 '+p.maxCuts+' 刀':p.goal;
  return {era,id,total:240,epochs:romans.map((roman,i)=>({id:i+11,name:roman})),rows,selected:{...selected,goal,blueprints:refs},draft:s.p3.ui.legacyDraft??JSON.stringify(template(era,id),null,2)};
 }
 function validate(s){
  const a=s.p3.legacyArchive,u=s.p3.ui;
  if(u.legacyEra!==undefined)address(u.legacyEra,u.legacyPuzzle);else assert(u.legacyPuzzle===undefined,'缺少档案纪元');
  if(u.legacyDraft!==undefined)assert(typeof u.legacyDraft==='string'&&u.legacyDraft.length<=65536,'档案草稿超预算');
  if(a===undefined)return true;
  assert(a&&Object.keys(a).sort().join(',')==='signatures,version'&&a.version===1&&a.signatures&&typeof a.signatures==='object'&&!Array.isArray(a.signatures)&&Object.keys(a.signatures).length<=240&&G.bytes(JSON.stringify(a))<=131072,'旧题签名账本无效');
  for(const[key,records]of Object.entries(a.signatures)){
   assert(/^puz:(?:1[1-9]|20):(?:[0-9]|1[0-9]|2[0-3])$/.test(key),'档案能级无效');const l=s.deg.levels[key];
   assert(l&&records&&typeof records==='object'&&!Array.isArray(records)&&Object.keys(records).length<=8,'档案引用无效');
   for(const[hash,values]of Object.entries(records)){assert(/^[0-9a-z]{12}$/.test(hash)&&l.hashes.includes(hash),'档案构型引用无效');assert(Array.isArray(values)&&values.length<=2&&new Set(values).size===values.length,'档案签名无效');values.forEach(n=>number(n,0,1000000,true,'档案签名'));}
  }return true;
 }
 G.Legacy={address,puzzle,template,parse,canonical,verifyJob,checkJob,submit,submitAsync,select,draft,loadBlueprint,view,validate};
 Object.assign(G.handlers,{'legacy.select':(s,a)=>select(s,a.era,a.id),'legacy.draft':(s,a)=>draft(s,a.text),'legacy.blueprint':(s,a)=>loadBlueprint(s,a.era,a.id,a.blueprint),'legacy.submit':(s,a)=>submit(s,a.era,a.id,a.design)});
})(typeof self!=='undefined'?self:this);
