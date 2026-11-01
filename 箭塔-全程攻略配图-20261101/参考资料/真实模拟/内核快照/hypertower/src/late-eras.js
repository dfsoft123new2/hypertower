/* XII--XX: registered, independently validated chapters sharing event integration. */
(function(root){
'use strict';
const H=root.HT,K=H.LateMath,B=H.V5.bounded,N=H.N;
const DEFINITIONS=[
  [12,'XII','定点','⊙','定点石','枚举',3.5,['ζ₀','η₀','φ(ω,0)','φ(ε₀,0)','φ(ζ₀,0)','Γ₀'],['φ 节点','反馈延长','枚举速度','定点增益','规范修正','第三输入'],['单向流','无环','参数互换','三块 φ'],'值沿行列传播；φ 读取左、上输入。把大的下标送进第一个参数，避免吸收。'],
  [13,'XIII','森林','◍','年轮','栽种',3.5,['Γ₀','阿克曼序数','SVO','TREE(3) 对照','LVO'],['土壤','色彩','嵌入检查','回溯深度','年轮增益','行延长'],['单色林','禁链','双生','色盲'],'依次栽树：早先任何树都不能保持颜色与分叉关系地嵌入新树。节点上限是序号加土壤。'],
  [14,'XIV','投影','Ψ','ψ 碎片','投影',4,['LVO','Bachmann–Howard','ψ(Ω_ω)','SCG(13) 对照','TFBO'],['Ω 下标','投影效率','基底共振','标签抑制','碎片增益','比较器'],['无根基','单下标','ω 禁令','倒读'],'先给有限 Ω 多项式排序，再做有限标签斩首实验。下层纪元的已验蓝图构成投影基底。'],
  [15,'XV','元胞','▣','细胞','演化',3,['TFBO','ψ(Ω_Ω)','ψ(I)','ψ(M)','Loader 对照'],['种子框','细胞预算','代速','滑翔收集','稳定检测','HighLife'],['无滑翔机','环面','对称','限时'],'用少量活细胞创造长寿种子。B3/S23 是 Conway 生命游戏，B36/S23 是 HighLife。'],
  [16,'XVI','图灵','▤','纸带','停机',3.5,['Loader 对照','ω₁ᶜᴷ 之墙','BB(2) 冠军','BB(3) 冠军','BB(4) 冠军','BB(5) 冠军','BB(h)'],['状态扩展','符号扩展','步数预算','宏预算','纸带增益','冠军库'],['只写 1','镜像程序','盲停','限步'],'每格填写写入、方向、下一状态，例如 1RB。只有真正停机的程序产生已验纪录；超预算进入未判定池。'],
  [17,'XVII','谕示','◬','谕片','谕示',4,['BB(h)','第一张证书','BB¹(h)','BB^ω(h)','Rayo(10¹⁰⁰) 对照'],['判定模块','计算预算','证书模板','谕示层数','谕片增益','宏判定'],['无循环','半图','低算力','谕示失效'],'给出两次完整纸带配置的周期与平移量。重放验证同构配置，才证明这台机器不停机。'],
  [18,'XVIII','强迫','◫','泛型','强迫',3.5,['Rayo₁(h)','第一个宇宙','MA + ¬CH','Rayo₂(h)','Rayo_ω(h)'],['命题研究','蕴含视图','约束预览','泛型增益','宇宙预设','相容检查'],['极小宇宙','相容边缘','盲强迫','V=L 囚笼'],'先选相容命题，再扩展有限 0/1 条件，以尽量少的格子覆盖 24 条约束。已填的位只能撤销，不能覆盖。'],
  [19,'XIX','基数','ℵ','阿列夫','升格',4,K.CARDINALS,['反射槽','嵌入放大','临界微调','阿列夫增益','工坊扩展','确定性执行'],['无选择','单反射','临界锁定','小宇宙'],'把旧纪元成果反射到八层塔中，选择放大开始的临界点。越过 Kunen 之墙前，关闭选择公理。'],
  [20,'XX','绝对','◉','太一','归一',3,['Berkeley','遗产封存','元公理','全自动轮回','归一就绪'],['遗产槽','轮回速度','历史压缩','速通结晶','元公理','自动归一'],['不完备','零公理','单手','速通'],'从已完成纪元带走相容遗产，再从第 I 纪元开始一轮。绝对无限只是永远无法抵达的渐近线。']
];
const configs=new Map(DEFINITIONS.map(d=>[d[0],{id:d[0],roman:d[1],name:d[2],symbol:d[3],currency:d[4],action:d[5],hours:d[6],LABELS:d[7],upNames:d[8],trialNames:d[9],intro:d[10]}]));
const referenceScores=new Map();
const choiceCheckpoints=new WeakMap();
const state=s=>s.eras[String(s.era)],config=s=>configs.get(s.era),archive=(s,id=s.era)=>s.archive[String(id)];
const copy=K.clone, now=()=>typeof performance!=='undefined'?performance.now():Date.now();
function options(era,trial){const opts={};if(trial<0)return opts;
  const list={12:[{oneway:true},{noloops:true},{swap:true},{maxnodes:3}],13:[{mono:true},{nochain:true},{even:true},{colorBlind:true}],14:[{nobase:true},{singleOmega:true},{noomega:true},{reverse:true}],15:[{nogliders:true},{torus:32},{symmetric:true},{deadline:true}],16:[{writeone:true},{mirror:true},{blind:true},{limited:true}],17:[{nocycle:true},{half:true},{low:true},{nooracle:true}],18:[{minimal:true},{maximal:true},{blind:true},{vl:true}],19:[{nochoice:true},{single:true},{lock:true},{small:true}],20:[{blind:true},{zero:true},{singlehand:true},{speed:true}]};return list[era]?.[trial]||opts;
}
function newState(id){return {age:0,study:0,runAge:0,funds:0,earned:0,claimed:0,up:Array(6).fill(0),clears:Array(4).fill(0),challenge:-1,trialStudy:0,complete:false,active:'',puzzle:0,design:K.empty(id),aided:false,submitted:0,bestScore:0,auto:{harvest:true,buy:false,diagonal:false,next:false},history:[],revision:0,choice:true,choiceUndoId:'',critical:0,universe:[],coverage:0,pool:[],poolDone:[],enumCursor:0,enumStates:2,certificates:[],records:{},snapshot:[],tagged:{c:0,ch:[{c:1,ch:[]},{c:0,ch:[]}]},tagCuts:0,solverSeed:1};}
function log(s,message){const a=state(s);a.history.push({t:a.age,m:message});a.history=a.history.slice(-24);s.log.push({t:s.time,m:message});s.log=s.log.slice(-80);}
function gate(s,id){if(id<12||id>20||s.era!==id-1)return false;const prev=s.eras[String(id-1)];if(!prev?.complete)return false;
  if(id===19){const a=s.eras['18'],u=K.universe(a.universe||[]);return a.coverage>=24&&u.valid&&u.closure.includes('MA')&&u.closure.includes('notCH');}
  if(id===20)return !s.eras['19'].choice;return true;
}
function resetRuleClocks(s){for(const r of s.workshop.rules)r.last=0;}
function enter(s,id){if(!gate(s,id))return false;const c=configs.get(id);s.era=id;s.eras[String(id)]??=newState(id);s.archive[String(id)]??={stars:Array(24).fill(0),records:{},generated:0};s.ord={era:id,index:0,gear:1,coord:1,h:N(10)};
  const a=state(s);if(id===19)a.snapshot=Array.from({length:8},(_,i)=>({era:i+11,score:s.eras[String(i+11)]?.bestScore||s.eras[String(i+11)]?.manual||1}));
  if(id===17)a.pool=copy(s.eras['16']?.pool||[]);
  const preferred=id===15&&(s.legacy.carry.includes('highlife')||s.legacy.axiom===2)?7:0;a.puzzle=preferred;a.design=K.empty(id,preferred);
  if(id===16&&(s.legacy.carry.includes('ternary')||s.legacy.axiom===3)){const m=a.design.machine;m.table=Array.from({length:m.states},(_,i)=>[...m.table.slice(i*2,i*2+2),'0RA']).flat();m.symbols=3;}
  let bp=s.blueprints.find(b=>b.era===id&&b.payload.trial===-1&&b.payload.puzzle===preferred)||s.blueprints.find(b=>b.era===id&&b.payload.trial===-1);if(!bp){const p=K.puzzles(id)[preferred];bp=s.blueprints.length>=64?H.Blueprint.starter(id,preferred):H.Blueprint.add(s,{era:id,kind:'era-'+id,name:c.name+'·入门蓝图',source:'solver',payload:{puzzle:preferred,trial:-1,design:copy(p.solution)}});}a.active=bp.id;
  if(s.legacy.auto){a.auto={harvest:true,buy:true,diagonal:true,next:true};if(id===18){a.design=copy(K.puzzles(18)[0].solution);commitUniverse(s,a.design);}if(id===19){a.design=copy(K.puzzles(19)[16].solution);a.choice=false;}}
  resetRuleClocks(s);log(s,'第 '+c.roman+' 纪元开启：'+c.name+'。上一纪元的蓝图已封存生产。');return true;
}
function evaluate(era,design,puzzle=0,trial=-1){return K.drain(K.evaluateJob(era,design,puzzle,options(era,trial)));}
function validateBlueprint(b){const era=B(b.era,12,20,'蓝图纪元',true),p=b.payload;if(b.kind!=='era-'+era||!p)throw Error('纪元蓝图类型不匹配');const puzzle=B(p.puzzle,0,23,'蓝图题目',true),trial=B(p.trial??-1,-1,3,'蓝图挑战',true),design=copy(K.bounded(p.design));const r=evaluate(era,design,puzzle,trial);if(!r.valid)throw Error('蓝图未满足谜题目标');const key=era+':'+puzzle;if(!referenceScores.has(key))referenceScores.set(key,evaluate(era,K.puzzles(era)[puzzle].solution,puzzle).score);const baseline=referenceScores.get(key),source=b.source==='solver'?'solver':'manual',quality=source==='solver'?.8:Math.min(3,1.2+1.8*Math.max(0,(r.score-baseline)/Math.max(1,baseline*.25)));
  return {id:String(b.id||'bp').slice(0,64),name:String(b.name||configs.get(era).name+'蓝图').slice(0,48),era,kind:'era-'+era,source,quality,payload:{puzzle,trial,design},verified:{score:r.score,summary:r.summary}};
}
function active(s){const a=state(s),b=H.Blueprint.get(s,a.active);if(!b||b.era!==s.era)return null;if(a.challenge>=0){if(b.payload.trial!==a.challenge)return null;}return b;}
function quality(s){return state(s).auto.harvest?(active(s)?.quality||.6):.6;}
function stars(s,id=s.era){return (archive(s,id)?.stars||[]).reduce((n,v)=>n+v,0);}
function legacyMultiplier(s){const p=BigInt(s.legacy.points),digits=p===0n?0:p.toString().length;return Math.min(4000,(1+digits*.25+.5*Math.sqrt(Number(p>64000000n?64000000n:p)))*(s.legacy.axiom===1?1.1:1)*(s.legacy.carry.includes('measurable')?1.05:1));}
function rate(s){const a=state(s),c=config(s);if(a.complete&&a.challenge<0)return 0;const merit=Math.min(3,(.6+.4*quality(s))*(1+.04*Math.min(24,stars(s))));let speed=1+.012*a.up.reduce((n,v)=>n+v,0)+.02*a.clears.reduce((n,v)=>n+v,0);
  if(s.era===14&&a.challenge!==0)speed*=1+Math.min(.2,[11,12,13].reduce((n,id)=>n+(s.eras[String(id)]?.submitted||s.eras[String(id)]?.manual||0),0)*.01);
  if(s.eras['18']?.universe.includes('VL'))speed*=1.1;
  return 81*(c.LABELS.length-1)/(c.hours*3600*2.1)*merit*speed*legacyMultiplier(s)*(a.challenge<0?1:.9);
}
function yieldRate(s){const a=state(s),b=active(s);return a.auto.harvest&&b?.verified.score>0?.10*(.5+Math.min(3,b.quality))*(1+.15*a.up[4])*(s.legacy.carry.includes('CH')?1.15:1):0;}
const min=k=>k===1?1:2;
function height(o){return N(10).arrow(o.gear)(Math.max(min(o.gear),Math.min(10,o.coord))).min(H.OMEGA);}
function syncHeight(s){s.ord.h=height(s.ord);return s.ord.h;}
function value(s){const o=s.ord;return {$ordnum:true,era:s.era,index:o.index,gear:o.gear,coord:o.coord,h:height(o),round:s.legacy.round};}
function format(v,mode){const c=configs.get(v.era),alpha=c.LABELS[v.index],h='10'+(v.gear===1?'^':v.gear<5?'↑'.repeat(v.gear):'{'+v.gear+'}')+v.coord.toFixed(4);if(v.era===20)return '第 '+String(BigInt(v.round||'0')+1n)+' 轮 · 太一 ◉ · '+alpha+' · '+h;if(mode==='ordinal')return alpha+' · '+h;if(mode==='landmark')return c.roman+' '+c.name+' · '+alpha+' · '+h;if(mode==='array')return '⟦'+alpha+'; 10, '+v.coord.toFixed(4)+', '+v.gear+'⟧';return (mode==='hardy'?'H':'f')+'⟨'+alpha+'⟩('+h+')';}
function ready(s){return !state(s).complete&&s.ord.gear===10&&s.ord.coord>=10-1e-8;}
function blocked(s){if(s.era===19&&s.ord.index>=11&&state(s).choice)return 'Kunen 之墙：先关闭选择公理';if(s.era===19&&s.ord.index>=2&&s.eras['18']?.universe.includes('VL'))return 'V=L 与可测基数冲突：请在宇宙预设中移除 V=L';return '';}
function diagonal(s){if(!ready(s)||blocked(s))return false;const a=state(s),o=s.ord;o.index++;o.gear=1;o.coord=1;syncHeight(s);a.revision++;log(s,'对角化：'+config(s).LABELS[o.index]);if(o.index===config(s).LABELS.length-1){a.complete=true;log(s,'本纪元已稳定。蓝图和永久研究继续保留。');}return true;}
function cost(s,i){return 8*Math.pow(2.3,state(s).up[i]);}
function canBuy(s,i){return Number.isInteger(i)&&i>=0&&i<6&&state(s).up[i]<6&&state(s).funds+1e-7>=cost(s,i);}
function buy(s,i){if(!canBuy(s,i))return false;const a=state(s);a.funds=Math.max(0,a.funds-cost(s,i));a.up[i]++;a.revision++;return true;}
function choice(s){return s.eras['19']?.choice!==false;}
function cheapest(s){let best=null;for(let i=0;i<6;i++)if(state(s).up[i]<6&&(best===null||cost(s,i)<cost(s,best)))best=i;return best;}
function buyCheapest(s){if(!choice(s))return false;const i=cheapest(s);return i!==null&&buy(s,i);}
function fixedBuy(s){for(let i=0;i<6;i++)if(buy(s,i))return true;return false;}
function nextBuy(s,fixed=false){const i=fixed?state(s).up.findIndex(v=>v<6):cheapest(s);if(i===null||i<0)return Infinity;const y=yieldRate(s);return canBuy(s,i)?1:y>0?Math.max(1,Math.ceil((cost(s,i)-state(s).funds)/y-1e-8)):Infinity;}
function money(s,amount=state(s).funds){const h=Math.max(1,Math.log10(1+amount)),c=config(s);if(amount<=0)return '0 '+c.symbol;if(s.era<=14){const arrows=s.era===12?3:s.era===13?Math.min(10,4+Math.floor(h)):Math.min(1000000,10**Math.min(6,Math.floor(h)+1));return '10'+(arrows<5?'↑'.repeat(arrows):'{'+arrows+'}')+'('+h.toFixed(3)+') '+c.symbol;}return '⟨'+configs.get(s.era-1).LABELS[0]+', 10↑↑'+h.toFixed(3)+'⟩ '+c.symbol;}
function claim(s){const a=state(s);if(a.runAge<60)return false;const reward=Math.max(1,a.runAge*yieldRate(s)*.15)*Math.min(1,a.runAge/60);a.funds+=reward;a.earned+=reward;a.claimed++;a.runAge=0;a.revision++;return reward;}
function activate(s,id){const b=H.Blueprint.get(s,id);if(!b||b.era!==s.era)return false;state(s).active=id;state(s).revision++;return true;}
function loadPuzzle(s,id){const a=state(s);B(id,0,23,'谜题编号',true);a.puzzle=id;a.design=K.empty(s.era,id);a.aided=false;a.revision++;return a.design;}
function commitUniverse(s,design){const r=K.forcing(design,K.puzzles(18)[state(s).puzzle].seed);if(r.coverage<24)throw Error('先满足全部 24 条约束');if(design.selected.includes('PFA')&&(!s.eras['19']||s.eras['19'].up[0]<1))throw Error('PFA 预设需要先在 XIX 解锁');state(s).universe=design.selected.slice();state(s).coverage=r.coverage;return r;}
function submit(s,name){const a=state(s),r=evaluate(s.era,a.design,a.puzzle,a.challenge);if(!r.valid)throw Error('设计尚未达到题目目标：'+r.summary);if(s.era===18&&a.design.selected.includes('PFA')&&(!s.eras['19']||s.eras['19'].up[0]<1))throw Error('PFA 预设需要先在 XIX 解锁');if(s.era===19&&s.ord.index>=12&&a.design.choice)throw Error('Reinhardt 之后不可重新开启 AC');if(s.era===20&&a.challenge===3&&s.time-(s.legacy.roundStart||0)>7200)throw Error('速通挑战需要两小时内完成本轮');if(s.era===19&&a.choice&&!a.design.choice&&s.blueprints.length<64)captureChoice(s);const bp=H.Blueprint.add(s,{era:s.era,kind:'era-'+s.era,name:name||K.puzzles(s.era)[a.puzzle].name,source:a.aided?'solver':'manual',payload:{puzzle:a.puzzle,trial:a.challenge,design:a.design}});a.active=bp.id;a.submitted++;a.bestScore=Math.max(a.bestScore,r.score);const ar=archive(s),earned=a.aided?2:3;ar.stars[a.puzzle]=Math.max(ar.stars[a.puzzle],earned);ar.records[a.puzzle]={score:r.score,aided:a.aided};if(s.era===18)commitUniverse(s,a.design);if(s.era===19){a.choice=a.design.choice;a.critical=a.design.critical;}if(s.era===20)s.legacy.carry=a.design.carry.slice();a.revision++;return {blueprint:bp,report:r,stars:earned};}
function trial(s,id){const a=state(s);if(!Number.isInteger(id)||id<0||id>3||a.clears[id]>=3)return false;a.challenge=id;a.trialStudy=0;a.revision++;return true;}
function toBoundary(s){const r=rate(s);return r>0?(10-s.ord.coord)/r:Infinity;}
const ACTION_AC=new Set(['buy','solve','arrange','reflect']);
function read(s,k){const a=state(s);switch(k){case'era':return s.era;case'age':return a.age;case'gear':return s.ord.gear;case'study':return a.study;case'futureStudy':return s.legacy.carry.includes('diamond')||s.eras['18']?.universe.includes('diamond')||s.eras['18']?.universe.includes('VL')?a.study+10*rate(s):0;case'quality':return quality(s);case'ready':return ready(s)?1:0;case'score':return a.bestScore;case'pool':return a.pool.length;case'choice':return choice(s)?1:0;case'coverage':return a.coverage;case'round':return Number(BigInt(s.legacy.round)>1000000000000n?1000000000000n:BigInt(s.legacy.round));case'critical':return a.critical+11;case'heads':case'cut':return 0;}return 0;}
function ruleAvailable(s,r){if(r.era&&r.era!==s.era||!choice(s)&&ACTION_AC.has(r.action))return false;const a=state(s);switch(r.action){case'buy':{const i=cheapest(s);return i!==null&&canBuy(s,i);}case'buyFixed':return canBuy(s,r.upgrade);case'diagonal':return ready(s)&&!blocked(s);case'load':return H.Blueprint.get(s,r.blueprint)?.era===s.era&&a.active!==r.blueprint;case'auto':return !a.auto.harvest;case'next':return gate(s,s.era+1);case'normalize':return canNormalize(s);case'choiceOff':return s.era===19&&a.choice;case'claim':return a.runAge>=60;default:return false;}}
function ruleAct(s,r){const a=state(s);switch(r.action){case'buy':return buyCheapest(s);case'buyFixed':return buy(s,r.upgrade);case'diagonal':return diagonal(s);case'load':return activate(s,r.blueprint);case'auto':a.auto.harvest=true;return true;case'next':return enter(s,s.era+1);case'normalize':return normalize(s);case'choiceOff':return setChoice(s,false);case'claim':return claim(s);}return false;}
function workshopNext(s){const w=s.workshop,a=state(s);if(!w.enabled)return Infinity;let best=Infinity;for(const r of w.rules){if(!r.enabled||r.era&&r.era!==s.era||!choice(s)&&ACTION_AC.has(r.action))continue;const v=read(s,r.sensor);let wait=0;
  if(v<r.value){if(r.sensor==='age')wait=r.value-v;else if(r.sensor==='study')wait=rate(s)>0?(r.value-v)/rate(s):Infinity;else if(r.sensor==='gear'||r.sensor==='ready')wait=toBoundary(s);else continue;}
  else if(!ruleAvailable(s,r)){if(r.action==='buy'||r.action==='buyFixed'){if(r.action==='buyFixed'&&a.up[r.upgrade]>=6)continue;wait=r.action==='buyFixed'?(yieldRate(s)>0?(cost(s,r.upgrade)-a.funds)/yieldRate(s):Infinity):nextBuy(s);}else if(r.action==='claim')wait=60-a.runAge;else continue;}
  best=Math.min(best,Math.max(1,Math.ceil(Math.max(wait,r.last+r.cooldown-a.age)-1e-8)));}return best;}
function deterministic(s){return state(s).up[5]>0||s.legacy.carry.includes('fixed')||s.legacy.axiom===4;}
function automate(s){if(s.era<12)return;const a=state(s),original=s.era;if(a.auto.buy){if(choice(s))for(let i=0;i<6;i++){if(!buyCheapest(s))break;}else if(deterministic(s))for(let i=0;i<6;i++){if(!fixedBuy(s))break;}}
  if(a.auto.diagonal)diagonal(s);H.Workshop.run(s);if(s.era!==original)return;
  if(a.challenge>=0&&a.trialStudy+1e-7>=8*(a.clears[a.challenge]+1)){a.clears[a.challenge]++;log(s,'完成「'+config(s).trialNames[a.challenge]+'」第 '+a.clears[a.challenge]+' 层');a.challenge=-1;a.revision++;}
  if(a.auto.next&&gate(s,s.era+1))enter(s,s.era+1);else if(s.era===20&&s.legacy.auto&&a.auto.next&&canNormalize(s))normalize(s);
}
function integrate(s,t){const a=state(s),r=rate(s),y=yieldRate(s);a.age+=t;a.runAge+=t;a.study+=r*t;a.funds=Math.min(1e100,a.funds+y*t);a.earned=Math.min(1e100,a.earned+y*t);s.time+=t;s.runT+=t;s.ord.coord=Math.min(10,s.ord.coord+r*t);if(a.challenge>=0&&active(s)&&a.auto.harvest)a.trialStudy+=r*t;
  // Sealed chapters keep deterministic yields. No background search is invented.
  for(const id of Object.keys(s.eras)){if(+id<12||+id>=s.era)continue;const old=s.eras[id],bp=H.Blueprint.get(s,old.active);if(bp&&bp.era===+id&&old.auto.harvest){const y=.10*(.5+bp.quality)*(1+.15*old.up[4]);old.funds=Math.min(1e100,old.funds+y*t);old.earned=Math.min(1e100,old.earned+y*t);}}
  if(s.eras['11']?.active){const old=s.eras['11'];old.scales=old.scales.add(N(t).mul(1000));}
  if(s.meta.started){s.meta.age+=t;s.meta.runSec+=t;for(let i=0;i<5;i++){const amount=H.Meta.passive(s,i)*1000*t;s.meta.currency[i]=Math.min(1e100,s.meta.currency[i]+amount);s.meta.total[i]=Math.min(1e100,s.meta.total[i]+amount);}}
}
function tick(s,dt){let left=dt,guard=0;while(left>1e-8){if(++guard>12000)throw Error('纪元事件队列超过预算');if(s.era<12){H.tick(s,left);return;}const a=state(s),c=config(s);let event=workshopNext(s),boundary=toBoundary(s);if(a.auto.buy&&(choice(s)||deterministic(s)))event=Math.min(event,nextBuy(s,!choice(s)));if(a.challenge>=0&&active(s)&&rate(s)>0)event=Math.min(event,Math.max(1,(8*(a.clears[a.challenge]+1)-a.trialStudy)/rate(s)));
  let step=Math.min(left,boundary>1e-8?boundary:Infinity,event);if(!Number.isFinite(step))step=left;if(step<=1e-8)step=Math.min(1,left);integrate(s,step);left-=step;
  if(s.ord.coord>=10-1e-8){s.ord.coord=10;if(s.ord.gear<10){s.ord.gear++;s.ord.coord=2;}else if(a.auto.diagonal)diagonal(s);}
  automate(s);if(s.era<12&&left>1e-8){H.tick(s,left);return;}
}}
function captureChoice(s){
  const a=state(s);a.choiceUndoId='ac-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,14);
  const raw=H.save(s);choiceCheckpoints.set(s,raw);
  H.Late.onChoiceCheckpoint?.({id:a.choiceUndoId,raw});
}
function setChoice(s,on){if(s.era!==19)return false;const a=state(s);if(on&&s.ord.index>=12)throw Error('Reinhardt 之后不可重新开启 AC');if(!on&&a.choice)captureChoice(s);a.choice=!!on;a.design.choice=a.choice;a.revision++;return true;}
function choiceCheckpoint(s){return choiceCheckpoints.get(s)||'';}
function developerUndoChoice(s,raw=choiceCheckpoint(s)){
  if(![19,20].includes(s.era)||s.eras['19']?.choice!==false)throw Error('仅能回退本轮已经关闭的 AC');
  const exact=!!raw,restored=H.load(raw||H.save(s));
  if(exact){
    if(restored.era!==19||!restored.eras['19'].choice||restored.legacy.round!==s.legacy.round||!s.eras['19'].choiceUndoId||restored.eras['19'].choiceUndoId!==s.eras['19'].choiceUndoId)throw Error('AC 快照不属于本次关闭操作');
  }else{
    if(restored.era===20){restored.era=19;delete restored.eras['20'];restored.ord={era:19,index:11,gear:10,coord:10,h:N(10)};}
    if(restored.ord.index>=12){restored.ord.index=11;restored.ord.gear=10;restored.ord.coord=10;}
    state(restored).complete=false;state(restored).choice=true;state(restored).design.choice=true;
    syncHeight(restored);
  }
  const a=state(restored);a.choiceUndoId='';a.auto.buy=a.auto.diagonal=a.auto.next=false;a.revision++;
  restored.workshop.enabled=false;restored.legacy.auto=false;restored.last=Date.now();
  log(restored,exact?'开发者回退：恢复关闭 AC 前的存档；推进自动化已暂停。':'开发者回退：恢复 AC，越墙后的阶段退回 I0；推进自动化已暂停。');
  return {state:restored,exact};
}
function validateOrd(o,id){if(!o||o.era!==id)throw Error('序数纪元不匹配');B(o.index,0,configs.get(id).LABELS.length-1,'序数阶',true);B(o.gear,1,10,'齿位',true);B(o.coord,min(o.gear),10,'齿内坐标');o.h=height(o);return o;}
function validate(v,id){if(!v||typeof v!=='object'||Array.isArray(v))throw Error('纪元状态无效');const a={...newState(id),...v};for(const k of ['age','study','runAge','funds','earned','claimed','trialStudy','submitted','bestScore','revision','tagCuts','solverSeed'])B(a[k],0,1e100,k);B(a.puzzle,0,23,'题目编号',true);B(a.challenge,-1,3,'挑战',true);
  if(!Array.isArray(a.up)||a.up.length!==6||!Array.isArray(a.clears)||a.clears.length!==4)throw Error('研究或挑战数组无效');a.up.forEach(v=>B(v,0,6,'研究',true));a.clears.forEach(v=>B(v,0,3,'挑战层',true));K.bounded(a.design);validateDesign(id,a.design,a.puzzle);a.active=String(a.active).slice(0,64);a.auto={harvest:!!a.auto?.harvest,buy:!!a.auto?.buy,diagonal:!!a.auto?.diagonal,next:!!a.auto?.next};a.choice=!!a.choice;a.complete=!!a.complete;a.aided=!!a.aided;B(a.critical,0,7,'临界点',true);B(a.coverage,0,24,'覆盖',true);K.universe(a.universe);
  if(typeof a.choiceUndoId!=='string'||!/^([a-zA-Z0-9-]{1,80})?$/.test(a.choiceUndoId))throw Error('AC 回退标识无效');
  if(!Array.isArray(a.pool)||a.pool.length>128||!Array.isArray(a.certificates)||a.certificates.length>64)throw Error('判定池无效');a.pool.forEach(m=>K.machineCheck(m));a.certificates.forEach(c=>{K.machineCheck(c.machine);K.certify(c.machine,c.start,c.period,c.translation);});K.treeCheck(a.tagged,10001,256);
  B(a.enumStates,2,3,'枚举状态数',true);B(a.enumCursor,0,6*4*12**5,'枚举游标',true);if(!Array.isArray(a.poolDone)||a.poolDone.length>256||a.poolDone.some(k=>typeof k!=='string'||k.length>2048))throw Error('判定记录无效');
  if(!Array.isArray(a.snapshot)||a.snapshot.length>8)throw Error('快照无效');for(const p of a.snapshot){B(p.era,11,18,'快照纪元',true);B(p.score,0,1e100,'快照得分');}
  a.history=Array.isArray(a.history)?a.history.slice(-24).map(h=>({t:B(h.t,0,1e100,'记录时间'),m:String(h.m).slice(0,300)})):[];if(!a.records||typeof a.records!=='object'||Array.isArray(a.records)||Object.keys(a.records).length>5)throw Error('机器纪录无效');const records={};for(const [k,r]of Object.entries(a.records)){if(!/^bb[2-6]$/.test(k)||!r)throw Error('机器纪录编号无效');records[k]={steps:B(r.steps,1,1e8,'纪录步数',true),ones:B(r.ones,0,4194304,'纸带计数',true)};}a.records=records;return a;
}
function validateDesign(id,d,puzzle){K.bounded(d);const p=K.puzzles(id)[puzzle];if(id===12)K.wire(d.board,{feedback:B(d.feedback??2,1,6,'反馈次数',true)});else if(id===13){B(d.colors,1,3,'颜色数',true);B(d.soil,0,2,'土壤',true);K.forest(d.sequence,{colors:d.colors,soil:d.soil});}else if(id===14){if(!Array.isArray(d.order)||d.order.length!==6||new Set(d.order).size!==6)throw Error('排序无效');d.order.forEach(n=>B(n,0,5,'卡片',true));}else if(id===15){K.cellsCheck(d.cells);B(d.steps,1,8192,'代数',true);if(!['B3/S23','B36/S23'].includes(d.rule))throw Error('生命规则无效');}else if(id===16){K.machineCheck(d.machine);B(d.budget,1,1e8,'步数预算',true);}else if(id===17){K.machineCheck(d.machine);B(d.budget,1,10000,'判定预算',true);if(!Array.isArray(d.modules)||d.modules.length>5||d.modules.some(m=>!['reach','cycle','translation','drift','halt'].includes(m)))throw Error('判定模块无效');for(const [k,l,h]of [['start',0,10000],['period',1,10000],['translation',-10000,10000]])B(d.certificate?.[k],l,h,'证书参数',true);}else if(id===18){if(!Array.isArray(d.grid)||d.grid.length!==64||d.grid.some(n=>![-1,0,1].includes(n)))throw Error('条件网格无效');K.universe(d.selected);}else if(id===19)K.reflection(d);else K.legacyDesign(d);return d;}
function validateLegacy(l){if(l.auto!==undefined&&typeof l.auto!=='boolean'||l.rebuilding!==undefined&&typeof l.rebuilding!=='boolean')throw Error('轮回自动化无效');if(l.rebuild!==undefined)B(l.rebuild,0,100000,'重建时间');if(l.axiom!==undefined)B(l.axiom,0,4,'元公理',true);if(l.carry.some(x=>!['CH','notCH','diamond','MA','VL','measurable','natural','highlife','ternary','fixed'].includes(x)))throw Error('未知遗产');K.legacyDesign({carry:l.carry});if(l.bestSeconds!==undefined)B(l.bestSeconds,0,1e100,'最快轮回');if(l.roundStart!==undefined)B(l.roundStart,0,1e100,'轮回时间');}
function canNormalize(s){return s.era===20&&state(s).complete&&(s.eras['19']?.choice===false);}
function normalize(s){if(!canNormalize(s))return false;const old=s.legacy,seconds=Math.max(60,s.time-(old.roundStart||0)),earned=BigInt(Math.max(1,Math.floor(36000/seconds)+1));K.legacyDesign({carry:old.carry});const fresh=H.newState();fresh.blueprints=s.blueprints;fresh.archive=s.archive;fresh.workshop=copy(s.workshop);fresh.ach=s.ach.slice();fresh.ui=copy(s.ui);fresh.ui.seen=20;fresh.ui.wonSeen=true;fresh.ui.intro=true;fresh.time=s.time;
  fresh.legacy={round:String(BigInt(old.round)+1n),points:String(BigInt(old.points)+earned),carry:old.carry.slice(),auto:!!old.auto,rebuild:0,rebuilding:true,roundStart:s.time,bestSeconds:Math.min(old.bestSeconds||Infinity,seconds),axiom:Number((BigInt(old.round)+1n)%5n)};
  if(fresh.legacy.carry.includes('natural'))fresh.up.phi=1;if(fresh.legacy.carry.includes('ternary'))fresh.eng[0].b=1;
  Object.keys(s).forEach(k=>delete s[k]);Object.assign(s,fresh);resetRuleClocks(s);s.log.push({t:s.time,m:'第 '+s.legacy.round+' 次归一：获得 '+earned+' 太一。历史引擎开始重建 I–X。'});return true;
}
const oldTick=H.tick,oldAutomate=H.automate;
H.tick=(s,dt)=>{if(s.legacy?.rebuilding&&s.era<=10){if(!Number.isFinite(dt)||dt<=0)return;const duration=100/legacyMultiplier(s),remaining=duration-s.legacy.rebuild,t=Math.min(dt,Math.max(0,remaining));s.legacy.rebuild+=t;s.time+=t;s.runT+=t;s.era=Math.min(10,1+Math.floor(s.legacy.rebuild/duration*10));
  if(s.legacy.rebuild>=duration-1e-8){s.legacy.rebuilding=false;s.won=true;s.star=H.OMEGA;s.best=H.OMEGA;s.meta=H.Meta.newMeta();s.meta.started=true;s.meta.rank=s.meta.bestRank=15;s.meta.epsilon=s.meta.bestEpsilon='10';s.era=10;H.Eleven.enter(s);if(s.legacy.auto){const a=s.eras['11'];a.auto={harvest:true,buy:true,diagonal:true};}if(dt>t)H.tick(s,dt-t);}return;}
  if(s.era===11&&s.legacy?.auto){let left=dt;while(left>1e-8&&s.era===11){const step=Math.min(left,60);oldTick(s,step);left-=step;if(s.eras['11'].complete)enter(s,12);}if(left>1e-8)H.tick(s,left);return;}return oldTick(s,dt);};
H.automate=s=>s.legacy?.rebuilding?undefined:oldAutomate(s);
const enterXi=H.Eleven.enter;H.Eleven.enter=s=>{const ok=enterXi(s);if(ok&&(s.legacy.carry.includes('natural')||s.legacy.axiom===0)){s.eras['11'].up[4]=1;s.eras['11'].board.natural=true;}return ok;};
for(const c of configs.values())H.Era.register({...c,UP:c.upNames.map((name,id)=>({id,name,cap:6,desc:['增加设计与生产预算','扩展本纪元的搜索策略','提高永久研究效率','增加可保存的策略余量','提高已验蓝图的持续收益','提供明确顺序的自动执行'][id]})),TRIALS:c.trialNames.map((name,id)=>({name,rule:trialDescription(c.id,id)})),
  gate:s=>gate(s,c.id),newState:()=>newState(c.id),enter:s=>enter(s,c.id),tick,offline:tick,automate,validate:v=>validate(v,c.id),validateOrd:o=>validateOrd(o,c.id),validateBlueprint,validateDesign:(d,p)=>validateDesign(c.id,d,p),syncHeight,value,format,ready,diagonal,rate,quality,stars,active,cost,canBuy,buy,cheapest,buyCheapest,activate,toBoundary,yieldRate,loadPuzzle,submit,trial,state,money,claim});
function trialDescription(id,i){const descriptions={12:['仅从左向右传播。','禁止反馈节点。','φ 的左右输入互换。','φ 节点最多三块。'],13:['序列只使用一种颜色。','树深度不得超过三层。','每棵树的节点数必须为偶数；可选土壤大于零的题。','忽略颜色后也禁止嵌入。'],14:['投影研究不受下层基底加速。','多项式最高 Ω 次数为一（使用对应题）。','标签实验禁止 ω 标签。','排序方向改为从大到小。'],15:['平移周期种子不产生挑战研究。','在 32×32 环面上演化。','种子必须左右对称。','必须在 100 代内证明周期。'],16:['所有转移只允许写入 1。','镜像冠军的左右移动后重新验证。','隐藏停机格的界面提示。','模拟预算限制为 50 步。'],17:['证书必须有非零平移。','纸带预览只显示一半。','后台判定步数预算降为十分之一。','只接受可重放的有限证书。'],18:['恰好选择一条命题。','选中的命题集合必须是给定命题表中的极大相容集。','每次只揭示下一条未满足约束。','必须显式选中 V=L。'],19:['关闭选择公理。','只放一个反射槽，目标降为 10 分。','临界点固定在 XI。','最多使用三层，目标降为 18 分。'],20:['隐藏英雄数。','不带遗产，挑战目标为空设计。','关闭自动机工坊。','本轮在两小时内到达归一。']};return descriptions[id][i];}
H.Workshop.sensors.push(['era','当前纪元'],['score','本纪元最佳得分'],['pool','未判定池大小'],['coverage','已满足覆盖约束'],['choice','选择公理（1 开 / 0 关）'],['critical','嵌入临界点'],['round','归一轮数'],['futureStudy','◇：十秒后的研究坐标']);
H.Workshop.actions.push(['buyFixed','购买指定研究'],['next','开启下一纪元'],['choiceOff','关闭选择公理'],['claim','领取本纪元结晶'],['normalize','归一轮回']);
const priorSlots=H.Workshop.slots;H.Workshop.slots=s=>Math.min(32,priorSlots(s)+(s.era>=15?2:0)+(s.eras['19']?.up[4]>0?8:0));
H.Late={configs,DEFINITIONS,state,config,newState,gate,enter,evaluate,validateBlueprint,validateDesign,options,active,quality,stars,rate,yieldRate,money,value,format,syncHeight,ready,diagonal,cost,canBuy,buy,cheapest,buyCheapest,nextBuy,activate,claim,submit,trial,loadPuzzle,toBoundary,read,ruleAvailable,ruleAct,workshopNext,choice,ACTION_AC,setChoice,choiceCheckpoint,developerUndoChoice,blocked,legacyMultiplier,canNormalize,normalize,validateLegacy,commitUniverse,tick};
H.ACH.push(...[...configs.values()].flatMap(c=>[[c.roman+' · '+c.name,'开启第 '+c.roman+' 纪元',s=>!!s.eras?.[String(c.id)]],[c.LABELS.at(-1),'完成'+c.name+'纪元',s=>!!s.eras?.[String(c.id)]?.complete]]),['Kunen 之墙','关闭选择公理',s=>s.eras?.['19']?.choice===false],['第一次归一','完成一次轮回',s=>BigInt(s.legacy?.round||'0')>=1n],['十次归一','完成十次轮回',s=>BigInt(s.legacy?.round||'0')>=10n]);
})(typeof self!=='undefined'?self:this);
