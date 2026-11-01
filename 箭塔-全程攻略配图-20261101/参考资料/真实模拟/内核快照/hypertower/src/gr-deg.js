/* Degeneracy, stellar generations and the four compact-object phases. */
(function(root){
 'use strict'; const G=root.HT.GR,{assert,number}=G;
 function newState(){return {levels:{},ints:{},S:Math.log(12),voids:[],dark:[],magnetic:[],baryons:[],cooldowns:{},core:{phase:1,M:0,gen:'0',Z:0,relics:{ns:0,quark:0,bh:0},tree:{A:0,B:0,C:0,D:0},bh:null,peakS:Math.log(12),evaporations:'0',lastDust:'0',autoCollapse:false,constantSeconds:0},p2History:[]};}
 function capacity(s,l){return l.kind==='value'?(l.infinitesimal&&G.Obs.mansion(s,9).clear?12:8)+(G.Obs.mansion(s,10).clear?2:0):8;}
 function register(s,key,configuration,options={}){assert(typeof key==='string'&&key.length<=256,'能级编号无效');const d=s.deg,raw=typeof configuration==='string'?configuration:G.stable(configuration);assert(raw.length<=65536,'构型超出预算');const signature=G.hash64(raw);let l=d.levels[key];if(!l){assert(Object.keys(d.levels).length<4096,'能级谱达到预算');l=d.levels[key]={g:0,hashes:[],sig:options.sig??(parseInt(G.hash(raw),36)>>>0),kind:options.kind||'spectrum',era:options.era||0,color:options.color||null,sources:[],univalent:false};}if(options.infinitesimal!==undefined)l.infinitesimal=!!options.infinitesimal;if(l.univalent||l.hashes.includes(signature)||l.g>=capacity(s,l))return false;number(options.sig??l.sig,-1000000,4294967295,true,'构型签名');l.hashes.push(signature);l.g=l.hashes.length;if(options.source&&!l.sources.includes(options.source))l.sources.push(options.source);entropy(s);return true;}
 function integer(s,n,era){number(n,0,1000000,true);number(era,1,24,true);const d=s.deg;d.ints||={};if(!d.ints[n]&&Object.keys(d.ints).length>=512){const first=Object.keys(d.ints).find(k=>d.ints[k].length===1);if(first===undefined)return false;delete d.ints[first];}d.ints[n]||=[];if(d.ints[n].includes(era))return false;d.ints[n].push(era);entropy(s);return true;}
 function entropy(s,commit=true){const d=s.deg,c=d.core;let S=Math.log(12)+.5*Math.min(10,d.voids.length)+.3*Math.min(10,d.dark.length);
   for(const [key,l]of Object.entries(d.levels)){if(l.univalent||d.magnetic.includes(key))continue;if(l.kind==='numeric'){if(l.sources.length>=2)S+=1.5*Math.log(Math.min(24,l.sources.length));continue;}let w=l.kind==='station'?.2:l.kind==='holonomy'||l.kind==='return'||l.kind==='cyclic'?.5:1;S+=w*Math.log(l.g);if(c.tree.D>=8&&l.g>=4)S+=.5*Math.log(l.g);}
   for(const eras of Object.values(d.ints||{}))if(eras.length>=2)S+=1.5*Math.log(eras.length);
   for(const b of d.baryons)S+=(c.tree.B>=12?.75:.5)*b.keys.reduce((n,k)=>n+Math.log(d.levels[k].g),0);
   S+=Math.min(s.p3.ep[24]?.stats.braidEntropy||0,G.Obs.mansion(s,26).clear?8:6);
   if(c.tree.C>=9)S=Math.max(S,c.peakS*.6);if(commit){d.S=S;c.peakS=Math.max(c.peakS,S);}return S;
 }
 function importLegacy(s){for(const b of s.p2.blueprints||[])register(s,'puz:'+b.era+':'+(b.payload?.puzzle??b.id),b.payload?.design||b.payload,{era:b.era,color:'R'});}
 function spectrumFamily(key,l){
  const old=/^puz:(1[1-9]|20):/.exec(key),legacy={11:'尝试同一九头题的另一条合法斩法序列。',12:'保持目标 Veblen 值，尝试不同布线。',13:'保持颜色、土壤和题目目标，尝试不同树序列。',14:'当前题库排序解唯一，此能级不简并。',15:'尝试不同种子；仅平移不会产生新态。',16:'尝试 BFS 重命名后仍不同的合法转移表。',17:'验证不同起点、周期或平移量的证书。',18:'尝试不同的合法条件网格或命题集合。',19:'尝试不同的合法反射槽、临界点或 AC 配置。',20:'尝试不同的合法遗产集合；只改排列不算新态。'};
  if(old)return {id:'legacy',label:'旧谜题 · 纪元 '+old[1],guide:legacy[+old[1]],unique:+old[1]===14};
  const rules=[['st:','station','XXI · 宇宙航线','用不同 Foata 范式的卡序到达同一站；独立卡仅交换顺序不算新态。'],['mt:','mantle','XXI · 地幔','精测其他站并登记相同地幔；重复登记同站不增加简并。'],['val:','value','XXII · 局面值','构造规范值相同、构型不同的新局面。'],['bin:','binary','多重星测量','对另一颗同重数天体完成干涉、周期或视向速度测量。'],['fun:','functor','XXIII · 函子','在相同端点间验证不同的生成元映射表，仍受弦槽限制。'],['iso:','isomorphism','XXIII · 同构类','构造同构但构型不同的分支，活动分支的米田谱精测后才登记。'],['hom:','homotopy','XXIV · 同伦','在闭路构造器中验证另一份属于相同能级的合法画法。'],['tor:','torus','XXIV · 环面闭路','在同一环面规则下验证另一份属于相同能级的合法闭路。'],['cyc:','cyclic','XXIV · 循环字','尝试同一共轭类的不同循环代表字；重复字不增加简并。'],['brd:','braid','XXIV · 辫字','验证作用相同而辫字不同的构型，仍受辫织机容量限制。'],['route-ring:','route-ring','XXI / XXIV · 航线环','用已登记的同站不同 Foata 航线构造同一航线环的新代表。'],['ret:','return','∞ · 回归航线','验证同站、同长度的另一条闭合航线；循环旋转不算新态。'],['og:','octal','∞ · 八进制同谱','验证另一条同谱八进制规则，需要完整序列和周期证书。'],['hol:','holonomy','∞ · 稳定环和乐','同一圈以不同稳定链实现同一 J(h)，维持一拍并命中后才登记。']];
  const rule=rules.find(r=>key.startsWith(r[0]));return rule?{id:rule[1],label:rule[2],guide:rule[3]}:{id:'unknown',label:l.era?'纪元 '+l.era+' · 能级记录':'来源未标注',guide:'没有可核对的构造规则，尚不能判断下一个不同解。'};
 }
 function nextSpectrumHint(s,key,l){
  if(l.univalent)return {status:'univalent',text:'已单值化，不能继续增加简并。',candidate:null};
  if(l.g>=capacity(s,l))return {status:'full',text:'已达到当前简并容量。',candidate:null};
  const f=spectrumFamily(key,l),guide={status:f.unique?'unique':f.id==='unknown'?'unknown':'guide',text:f.guide,candidate:null};
  if(f.id!=='value'||l.kind!=='value'||!s.p3.ep[22])return guide;
  const a=s.p3.ep[22],source=Object.values(a.objects).find(o=>'val:'+o.report.value===key&&o.report.numeric!==null&&l.hashes.includes(G.hash64(o.signature)));if(!source)return guide;
  if(Object.keys(a.objects).length>=512)return {status:'storage-full',text:'局面星已达 512 个容量，当前不能登记新构型。',candidate:null};
  const value=source.report.numeric;
  try{for(let zeros=0;zeros<=11;zeros++){
   const base={kind:'number',value},raw=zeros?{kind:'sum',parts:[base,...Array.from({length:zeros},()=>({kind:'number',value:0}))]}:base,design=G.hasPert(s,22,3)?G.Era22.withMirror(raw):raw,canonical=G.Era22.canonicalDesign(design,2048);
   if(canonical.status!=='exact')return {status:'unknown',text:'候选规范化在当前预算内未判定。',candidate:null};
   const signature=canonical.key;if(l.hashes.includes(G.hash64(signature))||a.objects['src:22:'+G.hash64(signature)])continue;
   const report=G.Era22.evaluate(design,{budget:4096});if(report.status!=='exact')return {status:'unknown',text:'同值候选在当前计算预算内未判定。',candidate:null};
   if('val:'+report.value!==key)continue;
   const description=zeros?'数值 '+value+' ＋ '+zeros+' 个零':'规范数值 '+value;
   return {status:'candidate',text:'已验证同值新构型：'+description,candidate:{design,signature,value:report.value,description}};
  }}catch(e){return {status:'unknown',text:'当前数值候选超出构造预算，未判定。',candidate:null};}
  return {status:'guide',text:'已检查的数值加零候选均已登记；其他构型尚未穷举。',candidate:null};
 }
 function spectrumHint(s,key){assert(s.deg.core.tree.D>=7,'光谱学需要核树 D7');assert(typeof key==='string'&&Object.prototype.hasOwnProperty.call(s.deg.levels,key),'未知能级');return nextSpectrumHint(s,key,s.deg.levels[key]);}
 function spectrumEvidence(s,rows){
  const wanted=new Map(rows.map(([key,l])=>[key,{hashes:new Set(l.hashes),refs:new Map()}]));
  const add=(key,config,ref)=>{const row=wanted.get(key);if(!row)return;const raw=typeof config==='string'?config:G.stable(config);if(row.hashes.has(G.hash64(raw)))row.refs.set(ref.kind+':'+ref.id,{...ref,evidence:'hash'});};
  for(const b of s.p2.blueprints||[])add('puz:'+b.era+':'+(b.payload?.puzzle??b.id),b.payload?.design||b.payload,{kind:'blueprint',id:b.id,label:b.name||b.id,era:b.era});
  for(const[key,records]of Object.entries(s.p3.legacyArchive?.signatures||{})){const row=wanted.get(key);if(!row)continue;for(const hash of Object.keys(records))if(row.hashes.has(hash))row.refs.set('legacy:'+hash,{kind:'legacy-solution',id:key+':'+hash,label:'旧谜题档案 · '+key,era:s.deg.levels[key].era,evidence:'hash'});}
  for(const[id,o]of Object.entries(s.p3.ep[22]?.objects||{}))add('val:'+o.report.value,o.signature,{kind:'game',id,label:'已登记局面 '+id,era:22});
  for(const f of s.p3.ep[23]?.functors||[])add('fun:'+f.from+':'+f.to,f.map,{kind:'functor',id:f.id,label:f.from+' → '+f.to+' · '+f.id,era:23});
  for(const[id,o]of Object.entries(s.p3.ep[24]?.objects||{})){
   const ref={kind:'loop',id,label:'已保存闭路 '+id,era:24};add(o.key,{raw:o.raw,options:o.options},ref);
   if([...wanted.keys()].some(k=>k.startsWith('cyc:')))add('cyc:'+G.hash64(G.Era24.conjugacyKey(o.word)),JSON.stringify(o.word),ref);
  }
  if([...wanted.keys()].some(k=>k.startsWith('brd:')))for(const[b,o]of (s.p3.ep[24]?.braids||[]).entries()){const key=G.Era24.braidKey(o.beta,o.n);if(key.status==='exact')add('brd:'+G.hash64(key.key),o.beta,{kind:'braid',id:String(b),label:'辫织机 '+(b+1),era:24});}
  for(const[id,o]of Object.entries(s.p3.ep[24]?.routeRings||{}))add(o.key,{root:o.root,p:o.p,q:o.q},{kind:'route-ring',id,label:'已登记航线环 '+id,era:21});
  for(const[id,o]of Object.entries(s.p3.ep[21].returns||{}))add('ret:'+o.station+':'+o.route.length,JSON.stringify(o.route),{kind:'return',id,label:'闭合航线 '+id,era:21});
  for(const[code,o]of Object.entries(s.p3.inf?.oct||{}))add(o.key,code,{kind:'octal',id:code,label:'八进制 '+code,era:22});
  const measured=rows.filter(([k])=>k.startsWith('bin:')||k.startsWith('mt:'));
  for(const d of Object.values(s.p3.sky.sources)){
   for(const[key]of measured)if(key.startsWith('bin:'))add(key,d.id,{kind:'observation',id:d.id,label:d.name||d.id,era:d.era});else if(d.kind==='station')add(key,String(d.state),{kind:'mantle',id:d.id,label:'地幔采样站 '+d.state,era:21});
   const key='st:'+d.state;if(d.kind==='station'&&wanted.has(key))wanted.get(key).refs.set('station:'+d.id,{kind:'station',id:d.id,label:'宇宙站 '+d.state,era:21,evidence:'linked'});
  }
  return wanted;
 }
 function spectrumView(s,{offset=0,limit=12}={}){
  number(offset,0,Number.MAX_SAFE_INTEGER,true);number(limit,1,60,true);const unlocked=s.deg.core.tree.D>=7,result={unlocked,total:0,levelCount:0,integerCount:0,offset:0,limit,items:[]};if(!unlocked)return result;
  const levels=Object.entries(s.deg.levels).sort(([a],[b])=>a<b?-1:a>b?1:0),integers=Object.entries(s.deg.ints||{}).sort(([a],[b])=>+a-+b);result.levelCount=levels.length;result.integerCount=integers.length;result.total=levels.length+integers.length;result.offset=Math.min(offset,Math.max(0,Math.ceil(result.total/limit)-1)*limit);
  const page=levels.slice(result.offset,result.offset+limit),evidence=spectrumEvidence(s,page);
  result.items=page.map(([key,l])=>{const f=spectrumFamily(key,l),refs=evidence.get(key).refs;for(const id of l.sources)if(typeof id==='string'&&![...refs.values()].some(r=>r.id===id))refs.set('record:'+id,{kind:'record',id,label:id,era:l.era||null,evidence:'record'});const sources=[...refs.values()];return {key,type:'level',family:f.id,origin:f.label,era:l.era||null,kind:l.kind,color:l.color,g:l.g,capacity:capacity(s,l),sig:l.sig,univalent:l.univalent,sourceCount:sources.length,sources:sources.slice(0,8),hint:nextSpectrumHint(s,key,l)};});
  const start=Math.max(0,result.offset-levels.length),space=limit-result.items.length;for(const[n,eras]of integers.slice(start,start+space))result.items.push({key:'int:'+n,type:'integer',family:'integer',origin:'跨纪元数值',era:null,g:eras.length,capacity:24,sig:+n,sourceCount:eras.length,sources:eras.map(era=>({kind:'integer',id:String(era),label:'纪元 '+era,era,evidence:'record'})),hint:{status:eras.length===24?'full':'guide',text:eras.length===24?'全部 24 个纪元来源已记录。':'从其他纪元产生同一个整数；同一纪元重复不增加来源。',candidate:null}});
  return result;
 }
 function limits(s){const c=s.deg.core,b=Math.pow(1+s.deg.S/12,1.5);return {Ch:1.44*b,TOV:2.17*b*Math.sqrt(1+.04*c.relics.ns),Q:3*b*Math.sqrt(1+s.deg.baryons.length/100)*(c.tree.B>=6?.9:1)};}
 function bound(s,key){return s.deg.baryons.some(b=>b.keys.includes(key));}
 function quarkTriality(l){return l.forestTriality===undefined?((l.sig%3)+3)%3:l.forestTriality;}
 function forestTriality(s,key,value){const l=s.deg.levels[key];assert(s.deg.core.tree.B>=8&&l?.era===13&&l.color==='R','森林三元性需要核树 B8 与 XIII 来源');number(value,0,2,true);assert(!l.univalent&&!bound(s,key)&&!s.deg.magnetic.includes(key),'该森林能级正在占用');l.forestTriality=value;return value;}
 function forestView(s,{offset=0,limit=12}={}){
  number(offset,0,Number.MAX_SAFE_INTEGER,true);number(limit,1,60,true);
  const d=s.deg,unlocked=d.core.tree.B>=8,result={unlocked,total:0,available:0,offset:0,limit,items:[]};if(!unlocked)return result;
  const occupied=new Set(d.baryons.flatMap(b=>b.keys)),magnetic=new Set(d.magnetic),rows=[];
  for(const [key,l]of Object.entries(d.levels))if(l.era===13&&l.color==='R'){
   const reason=l.univalent?'已单值化':occupied.has(key)?'已禁闭':magnetic.has(key)?'磁场中':null;
   rows.push({key,g:l.g,sig:l.sig,triality:quarkTriality(l),naturalTriality:((l.sig%3)+3)%3,chosen:l.forestTriality!==undefined,cooldown:Math.max(0,(d.cooldowns[key]||0)-s.time),can:!reason,reason});
  }
  result.total=rows.length;result.available=rows.filter(x=>x.can).length;result.offset=Math.min(offset,Math.max(0,Math.ceil(rows.length/limit)-1)*limit);result.items=rows.slice(result.offset,result.offset+limit);return result;
 }
 function magnetic(s,key,on=true){const d=s.deg,l=d.levels[key];assert(typeof on==='boolean','磁场开关无效');assert(l&&l.g>=2&&!l.univalent,'该能级不能分裂');assert(!bound(s,key),'禁闭中的能级不能分裂');if(on){assert((d.cooldowns[key]||0)<=s.time,'磁场冷却中');if(d.magnetic.includes(key))return false;assert(d.magnetic.length<3+(d.core.tree.D>=3?1:0),'磁场槽已满');d.magnetic.push(key);}else{if(!d.magnetic.includes(key))return false;d.magnetic=d.magnetic.filter(k=>k!==key);d.cooldowns[key]=s.time+(d.core.tree.D>=9?120:600);}entropy(s);return true;}
 function supernova(s){const c=s.deg.core,lim=limits(s);if(c.M+1e-12<lim.Ch)return false;const M=c.M,Z=c.Z;let type='ns';if(s.p3.ep[23]?.complete&&M>=lim.Q)type='bh';else if(s.p3.ep[22]?.complete&&M>=lim.TOV)type='quark';c.relics[type]++;c.gen=(BigInt(c.gen)+1n).toString();c.Z+=.02*Math.log1p(M)*(c.tree.A>=3?1.5:1);c.M=0;G.add(s,'neutrons',Math.floor(10*M*M*(1+Z))*(c.tree.A>=2?1.5:1));if(type==='bh')merge(s,M);if(type==='ns'&&c.tree.A>=9&&c.relics.ns%2===0)G.add(s,'gamma',1000*M);G.Obs.transient(s,'supernova',(s.p3.era==='inf'?24:s.p3.era)-21>0?7:3,2,14400,{compact:true});G.emit(s,'supernova',{mass:M,relic:type});return {mass:M,relic:type};}
 function mergerView(s){const id='ds:3:6',o=s.p3.sky.obs[id],observed=!!s.p3.ep[24]&&o?.star>=1,used=!!o?.merger,ready=observed&&!used;return {source:id,unlocked:!!s.p3.sky.sources[id],observed,used,ready,factor:ready?2:1,at:o?.merger?.at??null};}
 function merge(s,M){
  number(M,0,1e100);const c=s.deg.core;if(!M)return c.bh;
  if(c.bh&&c.bh.M>0){
   const primary=c.bh.M,total=number(primary+M,0,1e100),bonus=mergerView(s);
   G.add(s,'gamma',1000*Math.min(primary,M)*(c.tree.C>=6?2:1)*bonus.factor);
   if(bonus.ready)s.p3.sky.obs[bonus.source].merger={at:s.time,primary,secondary:M};c.bh.M=total;
  }else{M=number(M*(c.tree.C>=7?1+.1*Number(BigInt(c.evaporations)):1),0,1e100);c.bh={M,initial:M,starving:false,elapsed:0,dischargeUntil:0,qScale:1,evaporated:false,released:'0'};}
  return c.bh;
 }
 function univalent(s,key){const d=s.deg,l=d.levels[key];assert(d.core.bh,'中心黑洞尚未形成');assert(l&&l.g>=2&&!l.univalent&&!bound(s,key)&&!d.magnetic.includes(key),'能级不可单值化');const before=hair(s);l.univalent=true;G.Hearts?.univalence(s,key,before);d.core.bh.M+=.5*l.g*Math.log(l.g);G.add(s,'horizonS',l.g*Math.log(l.g)*(d.core.tree.C>=5?1.5:1));entropy(s);G.emit(s,'univalence',{key});return true;}
 function baryon(s,keys){assert(Array.isArray(keys)&&keys.length===3&&new Set(keys).size===3,'重子需要三个不同夸克');const d=s.deg;assert(d.core.phase>=3,'色禁闭尚未开启');assert(d.baryons.length<32+2*d.core.relics.quark,'重子容量已满');const ls=keys.map(k=>d.levels[k]);assert(ls.every((l,i)=>l&&l.g>=2&&!l.univalent&&!bound(s,keys[i])&&!d.magnetic.includes(keys[i])&&(d.cooldowns[keys[i]]||0)<=s.time),'夸克不可用');assert(['R','G','B'].every(c=>ls.some(l=>l.color===c)),'重子必须红绿蓝各一');const triality=ls.reduce((a,l)=>a+quarkTriality(l),0)%3;assert(triality===0||d.core.tree.B>=2,'三元性不守恒');d.baryons.push({keys:keys.slice(),factor:triality===0?1:.5});entropy(s);return true;}
 function baryonView(s,{offset=0,limit=12,quarkOffset=0,quarkLimit=12}={}){
  number(offset,0,Number.MAX_SAFE_INTEGER,true);number(limit,1,60,true);number(quarkOffset,0,Number.MAX_SAFE_INTEGER,true);number(quarkLimit,1,60,true);
  const d=s.deg,c=d.core,capacity=32+2*c.relics.quark,unlocked=c.phase>=3&&c.tree.B>=7;
  const result={unlocked,capacity,used:d.baryons.length,room:d.baryons.length<capacity,relaxed:c.tree.B>=2,columns:{},combinations:{total:0,offset:0,limit,items:[]},quarkOffset:0,quarkLimit,quarkPages:1,baryons:[]};
  if(!unlocked)return result;
  const occupied=new Set(d.baryons.flatMap(b=>b.keys)),magnetic=new Set(d.magnetic),columns={R:[],G:[],B:[]},buckets={R:[[],[],[]],G:[[],[],[]],B:[[],[],[]]};
  for(const [key,l]of Object.entries(d.levels))if(l.g>=2&&['R','G','B'].includes(l.color)){
   const cooldown=Math.max(0,(d.cooldowns[key]||0)-s.time),reason=l.univalent?'已单值化':occupied.has(key)?'已禁闭':magnetic.has(key)?'磁场中':cooldown?'拆散或磁场冷却中':null;
   const row={key,g:l.g,sig:l.sig,triality:quarkTriality(l),cooldown,can:!reason,reason};columns[l.color].push(row);if(row.can)buckets[l.color][row.triality].push(row);
  }
  const longest=Math.max(...Object.values(columns).map(rows=>rows.length));result.quarkPages=Math.max(1,Math.ceil(longest/quarkLimit));result.quarkOffset=Math.min(quarkOffset,(result.quarkPages-1)*quarkLimit);
  for(const color of ['R','G','B'])result.columns[color]={total:columns[color].length,available:columns[color].filter(x=>x.can).length,items:columns[color].slice(result.quarkOffset,result.quarkOffset+quarkLimit)};
  const groups=[];let total=0;
  for(let r=0;r<3;r++)for(let g=0;g<3;g++)for(let b=0;b<3;b++){
   const triality=(r+g+b)%3;if(triality&&c.tree.B<2)continue;const R=buckets.R[r],G=buckets.G[g],B=buckets.B[b],count=R.length*G.length*B.length;
   if(count){groups.push({R,G,B,count,triality});total+=count;}
  }
  // Skip whole Cartesian products, then decode only the requested page.
  const start=Math.min(offset,Math.max(0,Math.ceil(total/limit)-1)*limit),items=[];let skip=start;
  for(const group of groups){if(skip>=group.count){skip-=group.count;continue;}
   for(let index=skip;index<group.count&&items.length<limit;index++){
    const {R,G:green,B,triality}=group,r=Math.floor(index/(green.length*B.length)),g=Math.floor(index/B.length)%green.length,b=index%B.length,quarks=[R[r],green[g],B[b]];
    const factor=triality?0.5:1,logs=quarks.reduce((n,q)=>n+Math.log(q.g),0),free=c.tree.B>=5?Math.sqrt(quarks.reduce((n,q)=>n*q.g,1)):1;
    const gluons=.01*logs*free*factor*(c.tree.B>=3?1.5:1)*(1+.02*c.relics.quark)*(G.Obs.mansion(s,18).clear?1.5:1);
    items.push({keys:quarks.map(q=>q.key),triality,factor,entropy:(c.tree.B>=12?.75:.5)*logs,gluons,can:result.room});
   }
   skip=0;if(items.length===limit)break;
  }
  result.combinations={total,offset:start,limit,items};
  result.baryons=d.baryons.map((b,index)=>({index,keys:b.keys.slice(),factor:b.factor,triality:b.keys.reduce((n,k)=>n+quarkTriality(d.levels[k]),0)%3}));return result;
 }
 function dismantle(s,index,keys){number(index,0,s.deg.baryons.length-1,true);if(keys!==undefined)assert(Array.isArray(keys)&&G.stable(keys)===G.stable(s.deg.baryons[index].keys),'重子已变化，请刷新后重试');const [b]=s.deg.baryons.splice(index,1);for(const k of b.keys)s.deg.cooldowns[k]=s.time+1800;entropy(s);return true;}
 function mesonSources(s){const sources=new Map();for(const o of Object.values(s.p3.ep[22]?.objects||{}))if(o.report.numeric!==null){const key='val:'+o.report.value;if(!sources.has(key))sources.set(key,o.report);}return sources;}
 function mesonPair(s,key,sources=mesonSources(s),occupied=new Set(s.deg.baryons.flatMap(b=>b.keys)),magnetic=new Set(s.deg.magnetic)){
  const r=sources.get(key);if(!r||r.numeric==='0')return null;
  const opposite='val:'+G.Era22.q(r.numeric).neg().toString(),keys=[key,opposite],ls=keys.map(k=>s.deg.levels[k]);
  const missing=keys.find((k,i)=>!sources.has(k)||!ls[i]),reason=missing?'缺少已登记的能级 '+missing:ls.some(l=>l.univalent)?'已单值化':keys.some(k=>occupied.has(k))?'已禁闭':keys.some(k=>magnetic.has(k))?'磁场中':null;
  return {keys,values:[r.numeric,G.Era22.q(r.numeric).neg().toString()],g:ls.map(l=>l?.g||0),hashes:ls.map(l=>l?.hashes.slice()||[]),cooldowns:keys.map(k=>Math.max(0,(s.deg.cooldowns[k]||0)-s.time)),birthday:r.birthday,can:!reason,reason};
 }
 function mesonYield(s,pair){
  const c=s.deg.core,dual=s.p3.ep[22].up[5],r=pair;
  const base=50*(r.birthday+1)**2*(c.tree.B>=4?2:1)*1.5**dual,mansionFactor=1.25**[21,22,23,24].filter(id=>s.p3.ep[id]&&G.Obs.summary(s,id).bright===7).length,laser=c.tree.D>=10&&s.p3.clock.laserStreak===3;
  let photons=G.income(s,base);if(mansionFactor!==1)photons=photons.mul(mansionFactor);if(laser)photons=photons.mul(8);
  return {...pair,base,photons:photons.toNumber(),dualLevel:dual,mansionFactor,laser};
 }
 function mesonView(s,{offset=0,limit=12}={}){
  number(offset,0,Number.MAX_SAFE_INTEGER,true);number(limit,1,60,true);
  const unlocked=s.deg.core.phase>=3&&!!s.p3.ep[22],result={unlocked,total:0,available:0,offset:0,limit,items:[]};if(!unlocked)return result;
  const sources=mesonSources(s),positive=new Map(),occupied=new Set(s.deg.baryons.flatMap(b=>b.keys)),magnetic=new Set(s.deg.magnetic);
  for(const [key,r]of sources)if(s.deg.levels[key]&&r.numeric!=='0'){const v=G.Era22.q(r.numeric),abs=v.cmp(0)>0?v:v.neg();positive.set(abs.toString(),abs);}
  const rows=[...positive.values()].sort((a,b)=>a.cmp(b)).map(v=>mesonPair(s,sources.has('val:'+v)?'val:'+v:'val:'+v.neg(),sources,occupied,magnetic)).map(row=>{
   if(G.Era22.q(row.values[0]).cmp(0)>0)return row;
   return {...row,keys:row.keys.slice().reverse(),values:row.values.slice().reverse(),g:row.g.slice().reverse(),hashes:row.hashes.slice().reverse(),cooldowns:row.cooldowns.slice().reverse()};
  });
  result.total=rows.length;result.available=rows.filter(x=>x.can).length;result.offset=Math.min(offset,Math.max(0,Math.ceil(rows.length/limit)-1)*limit);result.items=rows.slice(result.offset,result.offset+limit).map(row=>mesonYield(s,row));return result;
 }
 function meson(s,key,hashes){
  assert(s.deg.core.phase>=3,'介子湮灭需要相 III');const pair=mesonPair(s,key);assert(pair,'介子需要非零数值能级');
  if(hashes!==undefined)assert(Array.isArray(hashes)&&G.stable(hashes)===G.stable(pair.hashes),'能级已变化，请刷新后重试');
  assert(pair.can,pair.reason);G.add(s,'gamma',mesonYield(s,pair).base);pair.keys.forEach(k=>delete s.deg.levels[k]);entropy(s);return true;
 }
 function pulse(s,j){const c=s.deg.core,k=s.p3.clock;assert(c.phase>=2,'主脉冲星尚未开启');if(j!==undefined){number(j,0,10,true);k.pulse=j;return true;}assert(c.tree.A>=6,'手动脉冲需要磁星');if(k.p2Beat<0||k.magnetarBeat===k.p2Beat)return false;k.magnetarBeat=k.p2Beat;k.p3Beat=s.time;return true;}
 function beatLengths(s){return [1,2,4,8,16,32,64,128,...(s.deg.core.tree.A>=5?[3,6,12,24]:[])];}
 function setBeatLength(s,n){assert(s.deg.core.phase>=2,'相 II 起开放拍长');assert(beatLengths(s).includes(n),'拍长无效');s.p3.clock.beatLength=n;return true;}
 function period1(s){const k=s.p3.clock;return k.epsRate===undefined?(k.period1||Infinity):k.epsRate>0?k.beatLength/k.epsRate:Infinity;}
 function injectionPlan(s){
  const era=s.p3.era==='inf'?24:s.p3.era,a=s.p3.ep[era],enabled=s.deg.core.tree.D>=6;
  const count=enabled&&!a.complete&&a.E<10?Math.min(Math.ceil(10-a.E),G.money(s.top.gamma).div(1000).min(10).floor().toNumber()):0;
  return {era,enabled,cost:1000,count,total:a.stats.autoInjected||0};
 }
 function autoInject(s){const p=injectionPlan(s);if(!p.count)return 0;const a=s.p3.ep[p.era];G.spend(s,'gamma',1000*p.count);a.E=Math.min(10,a.E+p.count);a.stats.autoInjected=(a.stats.autoInjected||0)+p.count;return p.count;}
 function nextEvent(s){const c=s.deg.core,a=s.p3.ep[s.p3.era==='inf'?24:s.p3.era];return c.tree.D>=6&&!a.complete&&a.E<10||c.tree.D>=10&&s.p3.clock.laserStreak===3?1:Infinity;}
 function controlView(s){
  const c=s.deg.core,k=s.p3.clock,T1=period1(s),tuneCooldown=c.tree.A>=11?0:Math.max(0,600+(k.lastTune??-1e15)-s.time);
  return {magnetic:{used:s.deg.magnetic.length,slots:3+(c.tree.D>=3?1:0)},pulse:{enabled:c.phase>=2,index:k.pulse,period1:Number.isFinite(T1)?T1:null,period2:k.period2||3600,period3:60*2**k.pulse,beatLength:k.beatLength,beatLengths:beatLengths(s),manualReady:c.phase>=2&&c.tree.A>=6&&k.p2Beat>=0&&k.magnetarBeat!==k.p2Beat,tuneCooldown,tuneCost:c.tree.A>=11?0:25,canTune:c.phase>=2&&(k.epsRate||0)>0&&!tuneCooldown&&(c.tree.A>=11||G.money(s.top.gamma).gte(25))},injection:injectionPlan(s),laser:{enabled:c.tree.D>=10,streak:k.laserStreak||0,ready:c.tree.D>=10&&k.laserStreak===3},merger:mergerView(s)};
 }
 function buyTree(s,branch){assert(['A','B','C','D'].includes(branch),'核树分支无效');const c=s.deg.core,n=c.tree[branch];if(n>=12)return false;if(branch==='A'&&!c.relics.ns||branch==='B'&&!c.relics.quark||branch==='C'&&!c.bh)return false;const cur={A:'neutrons',B:'gluons',C:'horizonS',D:'gamma'}[branch];if(!G.spend(s,cur,G.N(10).mul(G.N(3).pow(n))))return false;c.tree[branch]++;entropy(s);return true;}
 const resonanceCache=new WeakMap();
 function resonance(s){const c=s.deg.core,k=s.p3.clock,key=[c.phase,c.tree.A,period1(s),k.period2,k.pulse,k.p1Beat,k.p2Beat,k.p3Beat,k.seed,G.hasPert(s,24,3)].join(':');let memo=resonanceCache.get(s);if(memo?.key!==key){memo={key,value:calculateResonance(s)};resonanceCache.set(s,memo);}return {...memo.value};}
 function calculateResonance(s){const d=s.deg,c=d.core,k=s.p3.clock;if(c.phase<2)return {state:'unlocked',mult:1,seeing:1.5};if(G.hasPert(s,24,3))return {state:'chaotic',mult:.7+.6*k.seed};const T2=k.period2||3600,T1=period1(s),T3=60*2**k.pulse,W=Math.max(10,.02*T2),delta=.05+(c.tree.A>=7?.05:0)+(c.tree.A>=11?.05:0);
   const locked=(T,t)=>{if(!Number.isFinite(T))return false;let ratio=c.tree.A>=12&&Math.abs(T/T2-1/30)<=delta/30;for(let p=1;p<=4;p++)for(let q=1;q<=4;q++)if(Math.abs(T/T2-p/q)<=delta*p/q)ratio=true;const phase=Math.abs((t-k.p2Beat)%T2);return ratio&&Math.min(phase,T2-phase)<=W;};
   const x=locked(T1,k.p1Beat),y=locked(T3,k.p3Beat);if(x&&y)return {state:'constant',mult:1.5+(c.tree.A>=8?.25:0)};
   if(x||y)return {state:'partial',mult:1.15};return {state:'chaotic',mult:.7+.6*k.seed};
 }
 function paused(s){return G.hasPert(s,24,0);}
 function window(s){const k=s.p3.clock,w=30+(s.deg.core.tree.D>=1?30:0);return s.time-k.p2Beat<=w?(s.time-k.p1Beat<=w?4:2):1;}
 function observationFactor(s,mode){let factor=1;for(const a of Object.values(s.p3.ep))factor*=.85**G.active(s,a.id).length;if(!['vlbi','horizon'].includes(mode)&&G.hasPert(s,24,3))factor*=.5;const tower=s.p3.inf?.tower;if(tower?.active){const depth=(BigInt(tower.floor)/64n)-2n;if(depth>0n)factor*=.9**Number(depth);}return factor;}
 function hair(s){const b=s.deg.core.bh;if(!b||!b.M)return {M:0,Q:0,J:0,ratio:0,valid:false};const Q=.6*G.N(s.p1.meta.epsilon).add(1).log10().toNumber()*(s.time<b.dischargeUntil?.8:1),he=G.money(s.p3.ep[24]?.holonomy||0),J=.8*(he.add(1).log10().toNumber()),a=J/b.M,ratio=(a*a+Q*Q)/(b.M*b.M);return {M:b.M,Q,J,a,ratio,valid:b.starving||ratio<= (s.deg.core.tree.C>=3?1.05:1)};}
 function hairView(s){
  const c=s.deg.core,b=c.bh,unlocked=c.tree.C>=8,present=!!b&&b.M>0;
  if(!unlocked)return {unlocked,present};
  const actions={discharge:false,spinDown:false,starve:false,feed:false},result={unlocked,present,status:b?.evaporated?'evaporated':'absent',hair:null,sources:null,supervision:null,rates:null,discharge:{cost:10,duration:3600,remaining:0},spinDown:{cost:10},actions};
  if(!present)return result;
  const h=hair(s),starving=b.starving,limit=c.tree.C>=3?1.05:1,satisfied=h.ratio<=limit,active=!starving&&h.valid,remaining=Math.max(0,b.dischargeUntil-s.time),factor=remaining>0?.8:1;
  const accretion=Object.values(s.p3.ep).map(a=>{const nominal=a.stats.rate||0,tax=.05*nominal;return {era:a.id,nominal,tax,potentialRate:.001*Math.log10(1+tax)};}),potentialRate=.001*accretion.reduce((sum,a)=>sum+Math.log10(1+a.tax),0),penrose=active?.05*b.M*h.ratio*(c.tree.C>=2?1.5:1):0;
  result.status=starving?'starving':satisfied?'active':'naked';result.hair={...h};
  result.sources={mass:{stellarMass:c.M,accretion,potentialRate,rate:active?potentialRate:0},charge:{epsilon:String(s.p1.meta.epsilon),baseCoefficient:.6,dischargeFactor:factor,coefficient:.6*factor},angular:{holonomy:G.money(s.p3.ep[24]?.holonomy||0).toString(),coefficient:.8}};
  result.supervision={limit,satisfied,bypassed:starving,active,left:h.a*h.a+h.Q*h.Q,right:b.M*b.M};result.rates={penrose:G.income(s,penrose).toNumber(),penroseBase:penrose,accretion:active?potentialRate:0};result.discharge.remaining=remaining;
  actions.discharge=!starving&&!remaining&&G.money(s.top.horizonS).gte(10);actions.spinDown=!!s.p3.ep[24]&&G.money(s.p3.ep[24].holonomy).gte(10);
  const canSupply=!s.p3.inf||['huai','kong'].includes(s.p3.inf.phase);actions.starve=canSupply&&!starving;actions.feed=canSupply&&starving;
  return result;
 }
 function starve(s,on=true){const b=s.deg.core.bh;assert(b&&b.M>0,'没有可蒸发的黑洞');if(on&&!b.starving){b.initial=b.M;b.elapsed=0;}b.starving=!!on;return true;}
 function evaporate(M,dt,k=5.8){number(M,0,1e100);number(dt,0,1e12);const after=Math.cbrt(Math.max(0,M**3-3*k*dt));return {M:after,dust:100*(M**1.5-after**1.5),seconds:Math.min(dt,M**3/(3*k))};}
 function discharge(s){const b=s.deg.core.bh;assert(b,'没有黑洞');if(!G.spend(s,'horizonS',10))return false;b.dischargeUntil=s.time+3600;return true;}
 function p2Beat(s,count=1n){const k=s.p3.clock,last=k.lastBeat2;if(last!==undefined)k.period2=(s.time-last)/Number(count);k.lastBeat2=s.time;k.seed=3.9*k.seed*(1-k.seed);for(let j=0n;j<count;j++){if(k.holdSeason){k.holdSeason=false;}else{k.season=(k.season+1)%24;if(!k.season){k.year=(BigInt(k.year)+1n).toString();k.leap=false;}}}
   const a=s.p3.ep[21];if(a.recipe)s.p2.legacy.carry=a.recipe.slice();a.fuel=Math.min(20,a.fuel+Number(count)*(G.Obs.summary(s,21).bright===7?4:1));if(s.p3.ep[22])s.p3.ep[22].tickets+=Number(count);G.Era21.legacyRoot(s);G.Obs.nova(s);s.deg.p2History.push({round:s.p2.legacy.round,t:s.time});s.deg.p2History=s.deg.p2History.slice(-16);
 }
 function accrete(M,dt,rate,top){const B=M+M**3/(3*top*top)+rate*dt;return 2*top*Math.sinh(Math.asinh(1.5*B/top)/3);}
 function sourceFactor(s,key){const d=s.deg,l=d.levels[key];return !l?1:l.univalent?1.25:d.magnetic.includes(key)?1+.5*(l.g-1):1;}
 function tick(s,dt){const d=s.deg,c=d.core,k=s.p3.clock;const res=resonance(s);if(res.state==='constant'){c.constantSeconds+=dt;c.wasConstant=true;}const pulse=60*2**k.pulse;if(s.time-k.p3Beat>=pulse)k.p3Beat+=Math.floor((s.time-k.p3Beat)/pulse)*pulse;
   const rates=Object.values(s.p3.ep).map(a=>a.stats.rate||0),lim=limits(s),top=s.p3.ep[23]?.complete?lim.Q:s.p3.ep[22]?.complete?lim.TOV:lim.Ch;const A=[...rates,k.epsRate||0,3600/(k.period2||3600)].reduce((n,r)=>n+Math.log10(1+r),0);c.M=accrete(c.M,dt,A/54000*Math.sqrt(1+c.Z)*(c.tree.A>=1?1.25:1),top);
   const zeeman=d.magnetic.length?G.Obs.zeemanFactor(s):1;
   for(const key of d.magnetic){const g=d.levels[key].g;G.add(s,'gamma',.02*g*(g-1)*(c.tree.D>=4?1.5:1)*zeeman*dt);}
   for(const b of d.baryons){const logs=b.keys.reduce((n,key)=>n+Math.log(d.levels[key].g),0),free=c.tree.B>=5?Math.sqrt(b.keys.reduce((n,key)=>n*d.levels[key].g,1)):1;G.add(s,'gluons',.01*logs*free*b.factor*(c.tree.B>=3?1.5:1)*(1+.02*c.relics.quark)*(G.Obs.mansion(s,18).clear?1.5:1)*dt);}
   if(c.tree.D>=6)autoInject(s);
   if(c.autoCollapse&&c.tree.A>=4)supernova(s);
   const b=c.bh;if(!b)return;
   if(b.starving){const before=b.M,stone=s.p3.inf?G.Inf.treeLevel(s.p3.inf,1):0,evapK=5.8*(c.tree.C>=4?1.5:1)*1.3**stone,ev=evaporate(before,dt,evapK);b.M=ev.M;b.elapsed+=ev.seconds;const threshold=b.initial*Math.cbrt(.01),tail=ev.M<threshold?100*(Math.min(before,threshold)**1.5-ev.M**1.5):0;
     if(tail&&!b.flash){const life=.01*b.initial**3/(3*evapK),start=s.time-dt+Math.max(0,(before**3-threshold**3)/(3*evapK));b.flash=s.p3.inf?'tr:inf:'+s.p3.inf.n+':flash':'tr:evap:'+c.gen+':flash';G.Obs.source(s,{id:b.flash,name:'最后一闪',mag:-2,mansion:18,era:24,kind:'flash',born:start,expires:start+life});for(let i=0;i<G.Obs.lenses(s);i++)if(!s.p3.sky.queue[i].length){try{G.Obs.enqueue(s,i,{mode:'point',target:b.flash,grade:3});break;}catch{}}}
     const flash=s.p3.sky.obs[b.flash],boost=2*(c.tree.C>=10?2:1)*(flash?.star>=1?1.5:1),dust=ev.dust+tail*(boost-1),reward=G.N(dust).mul(s.p3.inf?G.Inf.multiplier(s):1).mul(s.p3.inf?.meta.noHair?1.2:1);const actual=G.add(s,'dust',reward);b.released=G.money(b.released||0).add(actual).toString();if(s.p3.inf)s.p3.inf.released=G.money(s.p3.inf.released||0).add(actual).toString();
     if(ev.M===0&&!b.evaporated){b.evaporated=true;c.evaporations=(BigInt(c.evaporations)+1n).toString();c.lastDust=b.released;G.emit(s,'evaporated',{mass:b.initial});if(!s.p3.inf)c.bh=null;}
   }else{const h=hair(s);if(h.valid){G.add(s,'horizonS',.05*b.M*h.ratio*(c.tree.C>=2?1.5:1)*dt);b.M+=.001*rates.reduce((n,r)=>n+Math.log10(1+.05*r),0)*dt;}}
 }
 function multiplier(s){const c=s.deg.core;return (1+Math.min(c.tree.A>=10?1:.5,.01*c.relics.ns))*(c.bh&&!c.bh.starving&&hair(s).valid?.95*(1+.1*Math.log10(1+c.bh.M)*(c.tree.C>=1?1.5:1)):1)*(1+c.Z)**.25*(c.tree.B>=10?1+.02*Math.floor(s.deg.baryons.length/10):1);}
 function summary(s){return {S:s.deg.S,M:s.deg.core.M,limits:limits(s),phase:s.deg.core.phase,generation:s.deg.core.gen,Z:s.deg.core.Z,zeemanFactor:G.Obs.zeemanFactor(s),relics:{...s.deg.core.relics},resonance:resonance(s),hair:hair(s),levels:Object.keys(s.deg.levels).length};}
 function validate(s){const d=s.deg,c=d?.core;assert(d&&c&&d.levels&&Object.keys(d.levels).length<=4096&&G.bytes(JSON.stringify(d.levels))<=262144,'简并谱无效或超预算');for(const [key,l]of Object.entries(d.levels)){assert(key.length<=256,'能级编号超预算');number(l.g,1,capacity(s,l),true);assert(l.g===l.hashes.length&&new Set(l.hashes).size===l.g&&l.hashes.every(h=>typeof h==='string'&&/^[0-9a-z]{12}$/.test(h)),'简并度与构型不符');number(l.sig,-1000000,4294967295,true);if(l.forestTriality!==undefined){number(l.forestTriality,0,2,true);assert(c.tree.B>=8&&l.era===13&&l.color==='R','森林三元性无效');}assert(Array.isArray(l.sources)&&l.sources.length<=24&&new Set(l.sources).size===l.sources.length,'能级来源无效');assert(typeof l.univalent==='boolean','单值化标记无效');}
  assert(Array.isArray(d.magnetic)&&new Set(d.magnetic).size===d.magnetic.length&&d.magnetic.length<=3+(c.tree.D>=3?1:0),'磁场槽无效');assert(Array.isArray(d.baryons)&&d.baryons.length<=32+2*c.relics.quark,'重子容量无效');const used=new Set();for(const b of d.baryons){assert(b.keys.length===3&&new Set(b.keys).size===3,'重子组成无效');const ls=b.keys.map(k=>d.levels[k]);assert(ls.every((l,i)=>l&&l.g>=2&&!l.univalent&&!d.magnetic.includes(b.keys[i])&&!used.has(b.keys[i]))&&['R','G','B'].every(color=>ls.some(l=>l.color===color)),'重子引用无效');b.keys.forEach(k=>used.add(k));const triality=ls.reduce((n,l)=>n+quarkTriality(l),0)%3;assert(b.factor===(triality===0?1:.5)&&(triality===0||c.tree.B>=2),'重子三元性无效');}for(const key of d.magnetic)assert(d.levels[key]?.g>=2&&!d.levels[key].univalent&&!used.has(key),'磁场引用无效');for(const t of Object.values(d.cooldowns))number(t,0,1e15);
  for(const k of ['voids','dark'])assert(Array.isArray(d[k])&&d[k].length<=10&&new Set(d[k]).size===d[k].length,'样本记录无效');assert(Object.keys(d.ints||{}).length<=512,'数值谱超预算');for(const[n,eras]of Object.entries(d.ints||{})){number(+n,0,1000000,true);assert(Array.isArray(eras)&&eras.length<=24&&new Set(eras).size===eras.length,'数值谱来源重复');eras.forEach(e=>number(e,1,24,true));}
  if(c.observedZ!==undefined)number(c.observedZ,0,Math.min(.15,c.Z));
  const clock=s.p3.clock;if(clock.laserStreak!==undefined)number(clock.laserStreak,0,3,true);if(clock.lastTune!==undefined)number(clock.lastTune,0,s.time);if(clock.magnetarBeat!==undefined)number(clock.magnetarBeat,-1e9,clock.p2Beat);if(clock.epsRate!==undefined)number(clock.epsRate,0,1e100);
  for(const a of Object.values(s.p3.ep))if(a.stats.autoInjected!==undefined)number(a.stats.autoInjected,0,10*G.Data.levels[a.id].length,true);
  number(d.S,0,1e6);number(c.peakS,d.S,1e6);assert(Math.abs(d.S-entropy(s,false))<1e-6,'熵与简并谱不一致');number(c.M,0,1e100);number(c.Z,0,1e100);number(c.phase,1,4,true);assert(c.phase===(s.p3.era==='inf'?4:s.p3.era-20),'简并核相与纪元不符');G.decimal(c.gen);G.decimal(c.evaporations);G.money(c.lastDust);assert(Object.keys(c.tree).sort().join('')==='ABCD','核树无效');for(const v of Object.values(c.tree))number(v,0,12,true);for(const k of ['ns','quark','bh'])number(c.relics[k],0,Number.MAX_SAFE_INTEGER,true);if(c.bh){const b=c.bh;number(b.M,0,1e100);number(b.initial,0,1e100);number(b.elapsed,0,1e15);number(b.dischargeUntil,0,1e15);assert(typeof b.starving==='boolean'&&typeof b.evaporated==='boolean','黑洞状态无效');if(b.starving)assert(b.M<=b.initial+1e-10,'蒸发质量无效');G.money(b.released||0);if(b.flash)assert(s.p3.sky.sources[b.flash]?.kind==='flash','最后一闪引用无效');}
 }
 G.Deg={capacity,triality:quarkTriality,forestTriality,forestView,newState,register,integer,entropy,importLegacy,spectrumView,spectrumHint,limits,bound,magnetic,supernova,merge,mergerView,univalent,baryon,baryonView,dismantle,meson,mesonView,pulse,beatLengths,setBeatLength,controlView,autoInject,nextEvent,buyTree,resonance,paused,window,observationFactor,hair,hairView,starve,evaporate,discharge,p2Beat,tick,multiplier,sourceFactor,accrete,summary,validate};
 Object.assign(G.handlers,{'deg.forestTriality':(s,a)=>forestTriality(s,a.key,a.value),'deg.magnetic':(s,a)=>magnetic(s,a.key,a.on),'deg.supernova':s=>supernova(s),'deg.univalent':(s,a)=>univalent(s,a.key),'deg.baryon':(s,a)=>baryon(s,a.keys),'deg.dismantle':(s,a)=>dismantle(s,a.index,a.keys),'deg.tree':(s,a)=>buyTree(s,a.branch),'deg.starve':(s,a)=>starve(s,a.on),'deg.discharge':s=>discharge(s)});
 Object.assign(G.handlers,{'deg.meson':(s,a)=>meson(s,a.key,a.hashes),'deg.pulse':(s,a)=>pulse(s,a.index),'deg.beatLength':(s,a)=>setBeatLength(s,a.n)});
 G.handlers['deg.autoCollapse']=(s,a)=>{assert(s.deg.core.tree.A>=4,'自动超新星尚未解锁');assert(typeof a.on==='boolean','开关无效');s.deg.core.autoCollapse=a.on;return true;};
})(typeof self!=='undefined'?self:this);
