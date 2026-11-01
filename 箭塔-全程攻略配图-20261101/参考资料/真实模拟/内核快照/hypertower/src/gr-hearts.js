/* Persistent, replayable evidence for the four constellation hearts. */
(function(root){
 'use strict';
 const G=root.HT.GR,{assert,number}=G,dirtyStates=new WeakSet();
 const titles={21:'玄武之心',22:'白虎之心',23:'青龙之心',24:'朱雀之心'};
 function init(s){
  if(!s.p3.hearts){s.p3.hearts={awards:{},stations:{},quenches:[],nearUnivalence:null};dirtyStates.add(s);}
  return s.p3.hearts;
 }
 function dirty(s){if(s.p3)dirtyStates.add(s);}
 function factor(s,era){return s.p3?.hearts?.awards[era]?1.25:1;}
 function magnitude(s,d){
  const intrinsic=d.id.startsWith('src:')&&[21,22].includes(d.era);
  return d.mag-(intrinsic&&s.p3.hearts?.awards[d.era]?0.3:0);
 }
 function stationRecord(s,id){return init(s).stations[id]||={routes:[],drills:[],mantles:[]};}
 function station(s,id,origin,cards){
  if(!G.Era21.fullStation(G.Era21.decode(id)))return;
  const record=stationRecord(s,id),signature=G.hash64(G.stable({root:origin,trace:G.Era21.foata(cards)}));
  if(s.deg.levels['st:'+id]?.hashes.includes(signature)&&!record.routes.some(r=>r.signature===signature)&&record.routes.length<8){record.routes.push({root:origin,cards:cards.slice(),signature});dirty(s);}
 }
 function drilling(s,id,origin,target,depth,cards){
  if(!G.Era21.fullStation(G.Era21.decode(id))||depth<5)return;
  station(s,id,origin,cards);const records=stationRecord(s,id).drills;
  if(!records.some(r=>r.root===origin&&r.target===target)&&records.length<8){records.push({root:origin,target,depth,cards:cards.slice()});dirty(s);}
 }
 function mantle(s,id,origin,key){
  if(!G.Era21.fullStation(G.Era21.decode(id)))return;
  const records=stationRecord(s,id).mantles;
  if(!records.some(r=>r.root===origin)&&records.length<8){records.push({root:origin,key});dirty(s);}
 }
 function quench(s,f,A,Y,best,frozen){
  if(frozen||Y<.9*best||best<=0)return;
  const h=init(s),k=s.p3.clock,entry={source:f.id,at:s.time,t:f.t,tau:f.tau,A,Y,best,ad:s.p3.ep[22].ad,window:G.Deg.window(s),p1Beat:k.p1Beat,p2Beat:k.p2Beat,windowSeconds:30+(s.deg.core.tree.D>=1?30:0)};
  const amplitude=s.p3.sky.obs[f.id]?.timing?.amplitude;if(amplitude)entry.amplitude=G.clone(amplitude);
  if(h.quenches.length<3)h.quenches.push(entry);else if(entry.window===4&&!h.quenches.some(q=>q.window===4))h.quenches[2]=entry;
  dirty(s);
 }
 function univalence(s,key,hair){
  const h=init(s),limit=s.deg.core.tree.C>=3?1.05:1;
  if(h.nearUnivalence||!s.p3.ep[24]||!Number.isFinite(hair.ratio)||hair.ratio<.9||hair.ratio>limit)return;
  const b=s.deg.core.bh,l=s.deg.levels[key];
  // Called after freezing the level and before increasing the black-hole mass.
  h.nearUnivalence={key,g:l.g,hashes:l.hashes.slice(),at:s.time,M:hair.M,Q:hair.Q,J:hair.J,ratio:hair.ratio,limit,epsilon:s.p1.meta.epsilon,holonomy:G.money(s.p3.ep[24].holonomy).toString(),qScale:s.time<b.dischargeUntil?.8:1};
  dirty(s);
 }
 function replay(s,id,r){
  assert(s.p3.ep[21].roots.includes(r.root),'心证据引用未知根');
  assert(Array.isArray(r.cards)&&r.cards.length<=128,'心航线超预算');
  let u=G.Era21.decode(r.root);
  for(const card of r.cards){number(card,0,10,true);u=G.Era21.apply(card,u);assert(u,'心航线不能重放');}
  assert(G.Era21.enc(u)===+id,'心航线未到达同一站');
  return G.hash64(G.stable({root:r.root,trace:G.Era21.foata(r.cards)}));
 }
 function validateStation(s,id,r){
  assert(G.Era21.fullStation(G.Era21.decode(+id))&&s.p3.ep[21].discovered[id],'心证据需要已发现的满按钮站');
  assert(r&&['routes','drills','mantles'].every(k=>Array.isArray(r[k])&&r[k].length<=8),'心站证据超预算');
  const hashes=new Set();
  for(const route of r.routes){const signature=replay(s,id,route);assert(signature===route.signature&&s.deg.levels['st:'+id].hashes.includes(signature)&&!hashes.has(signature),'心航线构型不一致');hashes.add(signature);}
  const drills=new Set(),mantles=new Set();
  for(const drill of r.drills){
   replay(s,id,drill);const rr=G.Era21.reach(G.Era21.decode(drill.root)),target=G.Era21.decode(drill.target),key=drill.root+':'+drill.target;
   assert(!drills.has(key)&&rr.depth.has(drill.target)&&G.Era21.reach(target).depth.has(+id),'下钻证据不是本根的基础');drills.add(key);
   assert(drill.depth===Math.max(1,rr.depth.get(+id)-rr.depth.get(drill.target))&&drill.depth>=5,'下钻证据深度不一致');
  }
  for(const m of r.mantles){
   assert(!mantles.has(m.root)&&s.p3.ep[21].roots.includes(m.root)&&G.Era21.reach(G.Era21.decode(m.root)).depth.has(+id),'地幔证据根无效');mantles.add(m.root);
   const key='mt:'+G.hash(G.Era21.mantle(G.Era21.decode(+id),G.Era21.decode(m.root)));
   const level=s.deg.levels[key];
   // A full or frozen level still accepts a measured sample without creating
   // another entropy-producing configuration beyond its existing capacity.
   assert(key===m.key&&s.p3.sky.obs['src:21:'+id]?.star===3&&level&&(level.hashes.includes(G.hash64(String(id)))||level.g===G.Deg.capacity(s,level)||level.univalent),'地幔证据未登记同一站');
  }
 }
 function xuanwu(s){
  const obs=s.p3.sky.obs,clear=[0,5,6].every(i=>G.Obs.mansion(s,i).clear);let best=null,bestCount=-1;
  for(const[id,r]of Object.entries(s.p3.hearts?.stations||{})){
   const rows=[clear,obs['src:21:'+id]?.star===3&&G.Era21.modalView(s,'src:21:'+id)?.complete,r.routes.length>=3&&s.deg.levels['st:'+id]?.g>=3&&r.routes.some(route=>route.cards.length>=6),r.drills.some(d=>r.mantles.some(m=>m.root===d.root))],count=rows.filter(Boolean).length;
   if(count>bestCount){best={station:+id,record:r,rows};bestCount=count;}
  }
  return best||{station:null,record:null,rows:[clear,false,false,false]};
 }
 function picture(s,only){
  for(const[id,o]of Object.entries(s.p3.ep[24]?.objects||{})){
   if(only&&id!==only)continue;
   const obs=s.p3.sky.obs[id];if(!obs?.marks.includes('image')||obs.Iv<900)continue;
   const w=G.Era24.normalizeLoop(o.raw,o.options||{}),pegs=[...new Set(w.map(Math.abs))],orders=o.options?.orders||{};
   if(w.length&&pegs.length>=6&&pegs.every(p=>G.Era24.reduce(w.filter(x=>Math.abs(x)!==p),orders).length===0))return id;
  }
  return null;
 }
 function boundedYoneda(s){
  const a=s.p3.ep[23];if(!a||s.p3.sky.inst.spec<3000)return false;
  const measured=Object.entries(a.objects).filter(([id,o])=>o.active&&o.part&&s.p3.sky.obs[id]?.marks.includes('yoneda')&&s.p3.sky.obs[id].Is>=900);
  if(!measured.length)return false;
  const c=G.Era23.category(a.net),parts=G.Era23.components(a.net),hom=(x,y)=>c.classes.filter(m=>m.from===x&&m.to===y).length;
  return measured.some(([,o])=>{const part=parts.find(p=>p.includes(o.from));return part&&part.some(x=>part.every(y=>hom(x,y)===1))&&part.some(x=>part.every(y=>hom(y,x)===1));});
 }
 function validateUnivalence(s,u){
  assert(u&&typeof u.key==='string','单值化心证据无效');const l=s.deg.levels[u.key];
  assert(l?.univalent&&l.g===u.g&&G.stable(l.hashes)===G.stable(u.hashes),'单值化心证据能级不符');
  number(u.at,0,s.time);number(u.M,Number.MIN_VALUE,1e100);
  assert([1,1.05].includes(u.limit)&&(u.limit===1||s.deg.core.tree.C>=3),'监督上限证据无效');
  assert([.8,1].includes(u.qScale),'电荷衰减证据无效');G.decimal(u.epsilon);G.money(u.holonomy);
  const Q=.6*G.N(u.epsilon).add(1).log10().toNumber()*u.qScale,J=.8*G.money(u.holonomy).add(1).log10().toNumber(),ratio=((J/u.M)**2+Q**2)/u.M**2;
  assert(Math.abs(Q-u.Q)<1e-9&&Math.abs(J-u.J)<1e-9&&Math.abs(ratio-u.ratio)<1e-9&&ratio>=.9-1e-12&&ratio<=u.limit+1e-12,'监督比必须使用单值化前的质量并满足上限');
 }
 function award(s,era,witness){
  const h=init(s);if(h.awards[era])return false;
  h.awards[era]={at:s.time,...G.clone(witness)};G.Obs.invalidate(s);G.emit(s,'heart',{era,name:titles[era]});return true;
 }
 function check(s){
  if(!s.p3)return;const h=init(s);if(!dirtyStates.has(s))return;dirtyStates.delete(s);
  if(!h.awards[21]){const x=xuanwu(s);if(x.rows.every(Boolean)){validateStation(s,x.station,x.record);award(s,21,{station:x.station,record:x.record});}}
  if(s.p3.ep[24]&&!h.awards[24]&&h.nearUnivalence&&s.p3.sky.obs['xs:24:0']?.star===3){const id=picture(s);if(id){validateUnivalence(s,h.nearUnivalence);award(s,24,{picture:id,univalence:h.nearUnivalence});}}
 }
 function progress(s,era){
  const awarded=!!s.p3.hearts?.awards[era],row=(label,ok)=>({label,ok:!!ok});
  if(era===21){const x=xuanwu(s);return {era,name:titles[era],awarded,station:x.station,blocked:null,requirements:['斗、室、壁全明','同一满按钮站三星且模态全测','同一站三条航线且一条深度至少六','从同一站下钻五层并登记其地幔'].map((label,i)=>row(label,x.rows[i]))};}
  if(era===24)return {era,name:titles[era],awarded,blocked:null,requirements:[row('星宿一三星',s.p3.sky.obs['xs:24:0']?.star===3),row('六钉布鲁尼安画完成 VLBI 成像',picture(s)),row('监督比 ≥ 0.9 且未越界时完成单值化',s.p3.hearts?.nearUnivalence)]};
  if(era===22){const q=s.p3.hearts?.quenches||[],obs=s.p3.sky.obs;return {era,name:titles[era],awarded:false,blocked:'超限茎对局及多重星分量规则待补全',requirements:[row('昴、觜、参全明',[10,12,13].every(i=>G.Obs.mansion(s,i).clear)),row('含森林、多米诺和超限茎的六分量三星源先手胜完美 AI',false),row('三次淬火 ≥ 90% 最优且一次共振 ×4',q.length>=3&&q.some(r=>r.window===4)),row('参宿四、七视直径及三组多重星',false)]};}
  return {era:23,name:titles[23],awarded:false,blocked:'心宿二 A/B 的独立测量及 bin 构型、着色规则待补全',requirements:[row('心宿二 A/B、心宿三光谱型全测',false),row('有源、有汇结构的米田谱精测',boundedYoneda(s)),row('以心宿三色 bin 夸克组装守恒重子',false)]};
 }
 function validate(s){
  const h=s.p3.hearts;if(!h)return true;
  assert(h.awards&&h.stations&&Object.keys(h.stations).length<=32&&G.bytes(JSON.stringify(h))<=65536,'四象之心证据超预算');
  for(const[id,r]of Object.entries(h.stations))validateStation(s,id,r);
  assert(Array.isArray(h.quenches)&&h.quenches.length<=3,'淬火心证据超预算');const seen=new Set();
  for(const q of h.quenches){
   const report=s.p3.ep[22]?.objects[q.source]?.report;assert(report&&report.t>0&&report.t===q.t,'淬火证据源无效');
   number(q.at,0,s.time);number(q.tau,0,q.t);number(q.p1Beat,-1e9,q.at);number(q.p2Beat,-1e9,q.at);
   assert(typeof q.ad==='boolean'&&[1,2,4].includes(q.window)&&[30,60].includes(q.windowSeconds)&&(q.windowSeconds===30||s.deg.core.tree.D>=1),'淬火窗口证据无效');
   const key=q.source+':'+q.at;assert(!seen.has(key),'淬火证据重复');seen.add(key);
   if(q.amplitude!==undefined){G.Obs.validateTimeProof(s,q.source,'amplitude',q.amplitude);assert(q.amplitude.at<=q.at&&G.stable(q.amplitude)===G.stable(s.p3.sky.obs[q.source].timing?.amplitude),'淬火振幅证据不符');}
   const A=40*(1+report.birthday)*(q.ad?1.5:1)*(q.amplitude?1.05:1),best=A*q.t*q.t/4,Y=A*q.tau*(q.t-q.tau),w=q.at-q.p2Beat<=q.windowSeconds?(q.at-q.p1Beat<=q.windowSeconds?4:2):1;
   assert(Math.abs(A-q.A)<1e-8&&Math.abs(best-q.best)<1e-8&&Math.abs(Y-q.Y)<1e-8&&Y>=.9*best&&w===q.window,'淬火收益或共振证据不符');
  }
  if(h.nearUnivalence)validateUnivalence(s,h.nearUnivalence);
  for(const[era,a]of Object.entries(h.awards)){
   assert(['21','24'].includes(era)&&a&&typeof a==='object','未定义的心奖励');number(a.at,0,s.time);
   if(era==='21'){
    validateStation(s,a.station,a.record);const probe={...s,p3:{...s.p3,hearts:{stations:{[a.station]:a.record}}}};
    assert(xuanwu(probe).rows.every(Boolean),'玄武心奖励缺少同站证据');
   }else{
    validateUnivalence(s,a.univalence);
    assert(picture(s,a.picture)===a.picture&&s.p3.sky.obs['xs:24:0']?.star===3,'朱雀心奖励缺少挂画或宿星证据');
   }
  }
  return true;
 }
 G.Hearts={init,dirty,check,factor,magnitude,station,drilling,mantle,quench,univalence,progress,validate};
})(typeof self!=='undefined'?self:this);
