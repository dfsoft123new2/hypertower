/* Analytic observation, instrument queues and the permanent sky. */
(function(root){
  'use strict'; const G=root.HT.GR, {assert,number,clamp}=G;
  const LIMITS=[25,400,2500], T=365250000;
  const RESOLUTIONS=[100,300,1000,3000,10000,30000],DEEP=new Map(G.Data.deep.map(d=>[d.id,d]));
  const SPECTRAL=[['spectrum','光谱',100,100],['redshift','红移',300,225],['velocity','视向速度',1000,400],['metallicity','金属丰度',3000,2500],['yoneda','米田谱',3000,900],['zeeman','塞曼分裂',10000,2500]];
  const summaries=new WeakMap(),unlocks=new WeakMap(),sourceIndexes=new WeakMap(),instrumentLimits=new WeakMap();
  function invalidate(s,sources=false){summaries.delete(s.p3.sky);if(sources)sourceIndexes.delete(s.p3.sky);}
  function sourceIndex(s){const sky=s.p3.sky;let memo=sourceIndexes.get(sky);if(!memo||memo.owner!==sky.sources){memo={owner:sky.sources,expiring:[],seasons:[]};for(const d of Object.values(sky.sources)){if(d.expires!==undefined)memo.expiring.push(d);if(d.kind==='season')memo.seasons.push(d);}sourceIndexes.set(sky,memo);}return memo;}
  function expireSeasons(s){const c=s.p3.clock;for(const d of sourceIndex(s).seasons)if(d.season!==c.season||d.year!==c.year)d.active=false;}
  function newState(){return {obs:{},sources:{},queue:[[],[],[],[]],inst:{D:[0,0,0,0],eps:[0,0,0,0],fov:[0,0,0,0],queue:[8,8,8,8],ao:0,spec:100,vlbi:[],baseline:0},ephem:{},limMag:9.2,elapsed:0};}
  function stage(I){return I>=2500?3:I>=400?2:I>=25?1:0;}
  function requiresVLBI(d){return !!d?.compact&&d.kind!=='flash';}
  function quality(I){return I<25?0:clamp(.8+1.373*Math.log10(Math.sqrt(I)/5),.8,3);}
  function weight(o){return [0.25,1,1.25,1.6][o?.star||0]*(1+.1*(o?.marks?.filter(m=>m!=='collapse').length||0));}
  function magnitude(s,d){return G.Hearts?G.Hearts.magnitude(s,d):d.mag;}
  function informationRate(mag,{A=1,eff=.4,seeing=1.5,mode=1,pert=1,window=1}={}){
    number(mag,-100,1e6); number(A,0,1e300); number(eff,0,1); number(seeing,0,1e6);
    const C=100*10**(-.4*mag)*A*eff,B=100*10**(-4.8)*A*eff*seeing**2;
    return C===0?0:C/(1+B/C)*mode*pert*window;
  }
  function limitMag({A=1,eff=.4,seeing=1.5,time=3600}={}){const B=100*10**(-4.8)*A*eff*seeing**2,C=(25+Math.sqrt(625+100*B*time))/(2*time);return -2.5*Math.log10(C/(100*A*eff));}
  function instrument(s,i){number(i,0,3,true); const k=s.p3.sky.inst;return {A:2.25**k.D[i],eff:.4+.05*k.eps[i],seeing:seeing(s)*(1-.06*k.ao),fov:.5*1.35**k.fov[i]};}
  function seeing(s){if(s.deg.core.phase<2)return 1.5;const r=G.Deg.resonance(s); return r.state==='constant'?.6:r.state==='partial'?1:2.4;}
  function lenses(s){return 1+(s.p3.ep[21].level>=3?1:0)+(s.p3.ep[22]?1:0)+(s.p3.ep[23]?1:0);}
  function limitingMagnitude(s){const sky=s.p3.sky,k=sky.inst,n=lenses(s),blur=seeing(s),memo=instrumentLimits.get(sky);
    if(memo&&memo.n===n&&memo.blur===blur&&memo.ao===k.ao){let same=true;for(let i=0;i<n;i++)if(memo.D[i]!==k.D[i]||memo.eps[i]!==k.eps[i]){same=false;break;}if(same)return memo.value;}
    let value=-Infinity;for(let i=0;i<n;i++)value=Math.max(value,limitMag({A:2.25**k.D[i],eff:.4+.05*k.eps[i],seeing:blur*(1-.06*k.ao)}));
    instrumentLimits.set(sky,{n,blur,ao:k.ao,D:k.D.slice(0,n),eps:k.eps.slice(0,n),value});return value;
  }
  function source(s,def){const sky=s.p3.sky; assert(def&&typeof def.id==='string'&&/^(xs|src|ds|tr|jq|old|inf|oct):[\w:.-]+$/.test(def.id), '天体编号无效');number(def.mag,-100,1e6);number(def.mansion,0,27,true);if(def.multiplicity!==undefined)number(def.multiplicity,1,1e6,true);if(def.period!==undefined&&def.period!==null)number(def.period,Number.MIN_VALUE,1e15);assert(sky.sources[def.id]||Object.keys(sky.sources).length<4096,'天体数量达到预算');sky.sources[def.id]={...def,active:def.active!==false};sky.obs[def.id]||={I:0,Is:0,Iv:0,It:0,Ii:0,star:0,marks:[],epoch:[],specEpoch:[]};invalidate(s,true);G.Hearts?.dirty(s);return sky.obs[def.id];}
  function unlock(s){
    const sky=s.p3.sky;let memo=unlocks.get(sky);
    if(!memo){memo={mansions:new Set(),deep:new Set()};unlocks.set(sky,memo);}
    for(let era=21;era<=24;era++){
      if(!s.p3.ep[era])continue;
      if(!memo.mansions.has(era)){
        for(const m of G.Data.mansions.filter(m=>m.era===era))for(let i=0;i<m.count;i++){
          const id='xs:'+m.index+':'+i;
          if(!sky.sources[id])source(s,{id,mag:m.brightest+.2*i,mansion:m.index,name:m.name+'宿'+(i+1),kind:'mansion',era,t:Math.round(m.start+(i+.5)*m.degrees*1e6/m.count),catalogue:i?'game-interpolation':'authored-brightest'});
        }
        memo.mansions.add(era);
      }
      if(!memo.deep.has(era)&&summary(s,era).bright>=3){
        // Radio-only entries without an authored flux/sky position cannot use the optical equation.
        for(const d of G.Data.deep.filter(x=>+x.id.split(':')[1]===era-21&&Number.isFinite(x.mag)&&Number.isInteger(x.mansion)))if(!sky.sources[d.id])source(s,{...d,era,kind:'deep',astroKind:d.kind,compact:/M87|人马|3C 273/.test(d.name)});
        memo.deep.add(era);
      }
    }
  }
  function mansion(s,index){const m=G.Data.mansions[index],obs=s.p3.sky.obs;let stars=0,bright=true,clear=true;for(let i=0;i<m.count;i++){const a=obs['xs:'+index+':'+i];stars+=a?.star||0;bright&&=!!a?.star;clear&&=a?.star===3;}return {index,name:m.name,stars,bright,clear,total:m.count};}
  function summary(s,era){const sky=s.p3.sky,key=era||0;let cache=summaries.get(sky);if(!cache){cache=new Map();summaries.set(sky,cache);}if(cache.has(key))return cache.get(key);const ids=G.Data.mansions.filter(m=>!era||m.era===era).map(m=>m.index),ms=ids.map(i=>mansion(s,i)),obs=sky.obs;const qs=Object.keys(obs).filter(id=>sky.sources[id]?.era===era||!era).map(id=>quality(Math.max(obs[id].I,obs[id].Iv||0))).sort((a,b)=>b-a).slice(0,8);const total=ms.reduce((n,m)=>n+3*m.total,0),r={bright:ms.filter(m=>m.bright).length,clear:ms.filter(m=>m.clear).length,fraction:total?ms.reduce((n,m)=>n+m.stars,0)/total:0,quality:qs.length?qs.reduce((a,b)=>a+b,0)/qs.length:0,catalogued:Object.values(obs).filter(o=>o.star).length,limMag:sky.limMag,mansions:ms};cache.set(key,r);return r;}
  function mark(s,id,key){const o=s.p3.sky.obs[id];assert(o,'未知天体');if(!o.marks.includes(key)){assert(o.marks.length<16,'徽记数量超预算');o.marks.push(key);invalidate(s);G.Hearts?.dirty(s);G.emit(s,'observed',{id,mark:key});const d=s.p3.sky.sources[id];G.Inf?.onMark(s,d,key);G.Era23?.onMark?.(s,d,key);}}
  function checkMode(s,task){const min={point:21,survey:21,track:21,time:22,interference:22,spectrum:23,vlbi:24,horizon:'inf'}[task.mode];assert(min==='inf'?!!s.p3.inf:!!s.p3.ep[min],'仪器尚未开放');if(task.mode==='horizon')number(task.order??0,0,1000,true,'光子子环阶数');}
  function enqueue(s,lens,task){number(lens,0,lenses(s)-1,true);assert(task&&['point','survey','track','time','interference','spectrum','vlbi','horizon'].includes(task.mode),'观测模式无效');const sky=s.p3.sky;assert(sky.queue[lens].length<sky.inst.queue[lens],'观测队列已满');
    checkMode(s,task);
    if(task.mode==='survey')number(task.target,0,27,true);else if(task.mode!=='track')assert(sky.sources[task.target]?.active,'未知观测目标');
    if(task.property!==undefined){assert(task.mode==='spectrum','属性测量需要分光模式');const rule=SPECTRAL.find(x=>x[0]===task.property);assert(rule&&spectralRules(sky.sources[task.target])[task.property],'此天体不适用该光谱属性');assert(sky.inst.spec>=rule[2],'摄谱仪分辨率不足');}
    assert(!sky.queue.some(q=>q.some(x=>x.mode==='interference'&&x.partner===lens)),'此镜已预约为干涉搭档');
    number(task.grade??1,1,3,true);if(task.mode==='interference'){number(task.partner,0,lenses(s)-1,true);assert(task.partner!==lens,'干涉需要两台镜');assert(!sky.queue[task.partner].length&&!sky.queue.some(q=>q.some(x=>x.mode==='interference'&&x.partner===task.partner)),'搭档镜已被占用');}
    sky.queue[lens].push({...task,grade:task.grade||1});return true;
  }
  function clearQueue(s,lens){number(lens,0,3,true);s.p3.sky.queue[lens]=[];}
  function upgrade(s,lens,kind){number(lens,0,lenses(s)-1,true);const k=s.p3.sky.inst;if(kind==='ao'){assert(s.p3.ep[22],'自适应光学尚未开启');if(k.ao>=8||!G.spend(s,'gamma',G.N(300).mul(G.N(2.5).pow(k.ao))))return false;k.ao++;return true;}
    assert(['D','eps','fov','queue','baseline','spec','vlbi'].includes(kind),'未知仪器升级');
    if(kind==='baseline')return G.Inf.upgradeBaseline(s);
    if(kind==='vlbi'){assert(s.p3.ep[24],'尚未进入同伦纪元');const j=k.vlbi.length;if(j>=5||!G.spend(s,'',G.N(10).pow(3+1.5*j).mul(mansion(s,27).clear?.6:1),24))return false;k.vlbi.push(0);return true;}
    if(kind==='spec'){assert(s.p3.ep[23],'摄谱仪未开放');const choices=[100,300,1000,...(s.p3.ep[23].up[5]>=2?[3000]:[]),...(s.p3.ep[23].up[5]>=4?[10000]:[]),...(s.p3.ep[23].up[5]>=6?[30000]:[])],n=choices.indexOf(k.spec);if(n<0||n===choices.length-1||!G.spend(s,'gamma',G.N(150).mul(G.N(2).pow(n))))return false;k.spec=choices[n+1];return true;}
    const lv=kind==='queue'?(k.queue[lens]-8)/2:k[kind][lens],cap={D:s.p3.inf?1e6:24,eps:11,fov:16,queue:4}[kind];if(lv>=cap)return false;
    if(kind==='D'&&lv>=850)throw Error('口径超出数值预算，未判定');if(kind==='D'&&lv>=24)return G.Inf.upgradeAperture(s,lens);
    const base={D:30,eps:50,fov:40,queue:200}[kind],growth={D:2.4,eps:2,fov:2.2,queue:4}[kind],cost=G.N(base).mul(G.N(growth).pow(lv)),id=s.p3.era==='inf'?24:s.p3.era,extra=kind==='D'?G.N(10).pow(2+.9*lv):G.N(0);
    if(G.money(s.top.gamma).lt(cost)||G.funds(s,id).lt(extra))return false;G.spend(s,'gamma',cost);G.spend(s,'',extra,id);if(kind==='queue')k.queue[lens]+=2;else k[kind][lens]++;return true;
  }
  function vlbi(s){const inst=s.p3.sky.inst,areas=[2.25**Math.min(12,Math.floor(G.logBig(s.p1.meta.epsilon))),Math.max(...inst.D.map(x=>2.25**x))];if(!G.Deg.paused(s))areas.push(2.25**Math.min(12,Number(BigInt(s.p2.legacy.round)/2n)));areas.push(...inst.vlbi.map(x=>2.25**x));const n=areas.length;let A=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)A+=Math.sqrt(areas[i]*areas[j]);return {N:n,A,eff:Math.min(.95,.5+.025*(s.p3.ep[24]?.up[5]||0)),seeing:.01,mode:(n-2)/n,phases:(n-1)*(n-2)/2};}
  function targets(s,task){const sky=s.p3.sky;let t=task.target;if(task.mode==='track')t='src:21:'+s.p3.ep[21].current;return task.mode==='survey'?Object.values(sky.sources).filter(d=>d.mansion===t&&d.active):sky.sources[t]?.active?[sky.sources[t]]:[];}
  function canSee(s,d,selected,dt=0){if(d.expires!==undefined&&s.time-dt>=d.expires)return false;if([13,18].includes(d.mansion)&&!(mansion(s,13).clear&&mansion(s,18).clear)){const opposite=d.mansion===13?18:13;if(selected.has(opposite))return false;}return true;}
  function taskRate(s,lens,task,d){
    const sky=s.p3.sky,window=G.Deg.window(s)>1?1.5:1,pert=G.Deg.observationFactor(s,task.mode),mag=magnitude(s,d);let conf=instrument(s,lens);
    if(task.mode==='interference'){
      number(task.partner,0,lenses(s)-1,true);assert(task.partner!==lens,'干涉需要两台镜');
      return [conf,instrument(s,task.partner)].reduce((sum,k)=>sum+informationRate(mag,{...k,mode:.7,window,pert}),0);
    }
    if(task.mode==='survey')conf.mode=.8*Math.min(1,conf.fov/G.Data.mansions[d.mansion].degrees);
    if(task.mode==='spectrum')conf.mode=Math.sqrt(1000/sky.inst.spec)*1.1**s.p3.ep[23].up[5];
    if(task.mode==='vlbi'||task.mode==='horizon'){
      conf=vlbi(s);if(!d.compact||conf.N<3)return 0;
      if(task.mode==='horizon'){if(!G.Inf.resolvable(s,d,task.order||0))return 0;conf.mode*=.5*(d.id==='ds:2:7'&&G.Deg.resonance(s).state!=='constant'?.25:1);}
    }
    return informationRate(mag,{...conf,window,pert});
  }
  function catalogueEta(s,id,lens=0){
    const sky=s.p3?.sky,d=sky?.sources[id],o=sky?.obs[id];
    if(!d?.active||!o||o.star>=3||d.born>s.time||d.expires<=s.time)return null;
    number(lens,0,lenses(s)-1,true);if(reservedPartners(s,true).has(lens))return null;
    const head=sky.queue[lens][0],task=head&&targets(s,head).some(x=>x.id===id)?head:{mode:requiresVLBI(d)&&o.star===2?'vlbi':'point',target:id},radio=['vlbi','horizon'].includes(task.mode);
    if(task.mode==='spectrum'||radio&&!s.p3.ep[24]||!radio&&requiresVLBI(d)&&o.star===2)return null;
    const rate=taskRate(s,lens,task,d),remaining=LIMITS[o.star]-(radio?o.Iv||0:o.I),seconds=remaining/rate;
    return rate>0&&Number.isFinite(rate)&&Number.isFinite(seconds)&&seconds>=0&&(d.expires===undefined||seconds<=d.expires-s.time)?seconds:null;
  }
  function registerMeasuredBin(s,d){if(d.multiplicity!==undefined)G.Deg.register(s,'bin:'+d.multiplicity,d.id,{kind:'spectrum'});}
  function timeMeasurement(s,d,o,lens,from,until){
    const timing=o.timing||={epochs:[]},beat=s.p3.clock.p2Beat,last=timing.epochs.at(-1);
    // Only a beat inside a positive exposure is a new epoch; stale beats are not samples.
    if(beat>from&&beat<=until&&(last===undefined||beat-last>=d.period/3)){
      timing.epochs.push(beat);timing.epochs=timing.epochs.slice(-16);o.epoch||=[];
      if(o.epoch.at(-1)===undefined||beat>o.epoch.at(-1)){o.epoch.push(beat);o.epoch=o.epoch.slice(-16);}
    }
    for(const [key,threshold,count]of [['period',100,3],['amplitude',900,5]])if(!timing[key]&&o.It>=threshold&&timing.epochs.length>=count){
      timing[key]={period:d.period,I:o.It,epochs:timing.epochs.slice(-count),at:s.time,lens};mark(s,d.id,key);registerMeasuredBin(s,d);
    }
  }
  function amplitudeFactor(s,id){return s.p3.ep[22]?.objects[id]?.report.t>0&&s.p3.sky.obs[id]?.timing?.amplitude?1.05:1;}
  function timeView(s,id){const d=s.p3.sky.sources[id],o=s.p3.sky.obs[id];assert(d&&o,'未知天体');return {id,period:d.period??null,information:o.It||0,epochs:o.timing?.epochs.length||0,periodMeasured:!!o.timing?.period,amplitudeMeasured:!!o.timing?.amplitude,amplitudeFactor:amplitudeFactor(s,id)};}
  function spectralRules(d){
    // Old v7 deep sources lost their astronomical type; recover it from the authored table.
    const kind=DEEP.get(d.id)?.kind||d.kind,cluster=/球状星团|疏散星团/.test(kind),white=kind==='白矮星'||['ds:0:5','ds:1:7','ds:3:5'].includes(d.id),stellar=d.kind==='mansion';
    return {spectrum:stellar||cluster||white,redshift:!!DEEP.has(d.id)&&/星系|类星体/.test(kind)||d.kind==='echo',velocity:stellar,metallicity:stellar||cluster||d.id==='ds:1:1',yoneda:d.kind==='structure'&&d.era===23,zeeman:white||['magnetar','磁星','化学特殊星'].includes(kind)};
  }
  function spectralMultiplicity(d){return d.kind==='mansion'?(d.id==='xs:14:0'?2:d.multiplicity>1?d.multiplicity:null):null;}
  function metalIncrement(d){return .002*({'ds:0:2':1.5,'ds:2:2':2,'ds:3:3':2}[d.id]||1);}
  function zeemanValue(d){return d.id==='ds:0:5'?.1:.05;}
  function zeemanFactor(s){return 1+Math.min(1,Object.entries(s.p3.sky.obs).reduce((sum,[id,o])=>sum+(o.spectroscopy?.zeeman?zeemanValue(s.p3.sky.sources[id]):0),0));}
  function spectrumView(s,id){
    const d=s.p3.sky.sources[id],o=s.p3.sky.obs[id];assert(d&&o,'未知天体');const p=o.spectroscopy,rules=spectralRules(d);
    return {id,name:d.name||id,information:o.Is||0,snr:Math.sqrt(o.Is||0),R:p?.last.R??null,at:p?.last.at??null,epochs:p?.epochs.length||0,velocityEpochsRequired:mansion(s,14).clear?2:3,properties:SPECTRAL.map(([key,name,R,I])=>({key,name,R,I,applicable:rules[key],measured:!!p?.[key],measuredR:p?.[key]?.R??null}))};
  }
  function spectrumMeasurement(s,d,o,lens,from,until){
    const R=s.p3.sky.inst.spec,p=o.spectroscopy||={epochs:[]},rules=spectralRules(d),beat=s.p3.clock.p2Beat;
    p.last={R,I:o.Is,at:s.time,lens};
    if(rules.velocity&&R>=1000&&beat>from&&beat<=until&&(p.epochs.at(-1)===undefined||beat>p.epochs.at(-1))){
      p.epochs.push(beat);p.epochs=p.epochs.slice(-16);o.specEpoch||=[];
      if(o.specEpoch.at(-1)===undefined||beat>o.specEpoch.at(-1)){o.specEpoch.push(beat);o.specEpoch=o.specEpoch.slice(-16);}
    }
    for(const [key,,minR,minI]of SPECTRAL){
      if(p[key]||!rules[key]||R<minR||o.Is<minI)continue;
      const proof={...p.last};
      if(key==='velocity'){
        const count=mansion(s,14).clear?2:3;if(p.epochs.length<count)continue;
        proof.epochs=p.epochs.slice(-count);const n=spectralMultiplicity(d);
        if(n){proof.multiplicity=n;G.Deg.register(s,'bin:'+n,d.id,{kind:'spectrum',source:d.id});}
      }
      if(key==='metallicity'){
        const c=s.deg.core;proof.priorZ=c.observedZ||0;proof.legacy=o.marks.includes(key);proof.delta=proof.legacy?0:Math.max(0,Math.min(.15-proof.priorZ,metalIncrement(d)));
        c.observedZ=proof.priorZ+proof.delta;c.Z+=proof.delta;
      }
      p[key]=proof;mark(s,d.id,key);
    }
  }
  function expose(s,d,rate,dt,mode,order=0,lens=0,partner){const sky=s.p3.sky,o=sky.obs[d.id];assert(o,'未知天体');number(rate,0,Number.MAX_VALUE);number(dt,0,1e12);const before=o.star,from=Math.max(s.time-dt,d.born||0),until=Math.min(s.time,d.expires??s.time),duration=Math.max(0,until-from),gained=rate*duration;if(!(gained>0))return;
    if(mode==='time'||mode==='spectrum')number(lens,0,lenses(s)-1,true);
    if(mode==='spectrum'){assert(s.p3.ep[23],'摄谱仪未开放');assert(RESOLUTIONS.includes(sky.inst.spec),'光栅分辨率无效');}
    if(mode==='interference'){number(lens,0,lenses(s)-1,true);number(partner,0,lenses(s)-1,true);assert(lens!==partner,'干涉需要两台镜');}
    const field=mode==='spectrum'?'Is':['vlbi','horizon'].includes(mode)?'Iv':'I',cap=field==='I'&&requiresVLBI(d)?2499.999999:1e300;o[field]=Math.min(cap,(o[field]||0)+gained);if(mode==='time'||mode==='interference'){const evidence=mode==='time'?'It':'Ii';o[evidence]=Math.min(cap,(o[evidence]||0)+gained);}o.star=stage(Math.max(o.I,o.Iv||0));invalidate(s);
    G.Era21.measureModal(s,d.id,lens);
    if(o.star>before){G.Hearts?.dirty(s);if(o.star>=3&&s.p3.inf)s.p3.inf.meta.threeThisRing=true;G.emit(s,'catalogue',{id:d.id,star:o.star});if(d.id.startsWith('inf:'))G.Inf.onObserved(s,d,before,o.star);if(d.kind==='flash'&&o.star>=3){mark(s,d.id,'white-hole');if(s.p3.inf)s.p3.inf.meta.flash=true;}}
    if(d.id.startsWith('jq:')&&o.I>=100){sky.ephem.seen ||= [];const index=+d.id.slice(3);if(!sky.ephem.seen.includes(index)){sky.ephem.seen.push(index);G.add(s,'gamma',100);}}
    if(mode==='time'&&d.period)timeMeasurement(s,d,o,lens,from,until);
    if(mode==='interference'&&o.Ii>=400&&d.multiplicity!==undefined&&!o.multiplicity){o.multiplicity={value:d.multiplicity,I:o.Ii,lens,partner,at:s.time};mark(s,d.id,'multiplicity');registerMeasuredBin(s,d);}
    if(mode==='spectrum')spectrumMeasurement(s,d,o,lens,from,until);
    if(['vlbi','horizon'].includes(mode)){if(o.Iv>=100)mark(s,d.id,'closure');if(o.Iv>=900&&vlbi(s).N>=4)mark(s,d.id,'image');if(mode==='horizon')G.Inf.onHorizon(s,d,o,order);}
  }
  function reservedPartners(s,headsOnly=false){const partners=new Set();for(const q of s.p3.sky.queue){const count=headsOnly?Math.min(1,q.length):q.length;for(let i=0;i<count;i++)if(q[i].mode==='interference')partners.add(q[i].partner);}return partners;}
  function nextEvent(s){
    const sky=s.p3.sky;if(!sky.queue.some(q=>q.length))return Infinity;
    const occupied=reservedPartners(s,true),selected=new Set();let next=Infinity;
    for(let i=0;i<lenses(s);i++){
      if(occupied.has(i))continue;const task=sky.queue[i][0];if(!task)continue;
      for(const d of targets(s,task)){
        if(d.expires>s.time)next=Math.min(next,d.expires-s.time);if(!canSee(s,d,selected))continue;selected.add(d.mansion);
        if(d.born>s.time){next=Math.min(next,d.born-s.time);continue;}
        const rate=taskRate(s,i,task,d);if(!(rate>0))continue;const o=sky.obs[d.id],field=task.mode==='spectrum'?'Is':['vlbi','horizon'].includes(task.mode)?'Iv':'I',goals=[[field,task.mode==='spectrum'?[100,225,400,900,2500]:LIMITS]];
        const windowEnd=s.p3.clock.p2Beat+30+(s.deg.core.tree.D>=1?30:0);if(s.time<=windowEnd)next=Math.min(next,Math.max(1,Math.floor(windowEnd-s.time)));
        if(task.mode==='interference')goals.push(['Ii',LIMITS]);
        if(task.mode==='time')goals.push(['It',[100,900]]);
        for(const [field,thresholds]of goals)for(const threshold of thresholds)if((o[field]||0)<threshold)next=Math.min(next,(threshold-(o[field]||0))/rate);
      }
    }
    return next;
  }
  function tick(s,dt){unlock(s);const sky=s.p3.sky;
    if(sky.queue.some(q=>q.length)){const occupied=reservedPartners(s,true),selected=new Set();
    for(let i=0;i<lenses(s);i++){if(occupied.has(i))continue;const task=sky.queue[i][0];if(!task)continue;const list=targets(s,task);let done=!!list.length;
      for(const d of list){if(!canSee(s,d,selected,dt)){done=false;continue;}selected.add(d.mansion);const rate=taskRate(s,i,task,d);expose(s,d,rate,dt,task.mode,task.order||0,i,task.partner);const o=sky.obs[d.id];if(!rate)done=false;else if(task.mode==='spectrum'){if(task.property?!o.spectroscopy?.[task.property]:(o.Is||0)<[100,900,2500][task.grade-1])done=false;}else if(task.mode==='time'){if(o.star<task.grade||!o.timing?.[task.grade===3?'amplitude':'period'])done=false;}else if(task.mode==='interference'){if((o.Ii||0)<LIMITS[task.grade-1])done=false;}else if(o.star<task.grade)done=false;
      }
      if(done&&task.mode!=='survey'&&task.mode!=='track')sky.queue[i].shift();
      if(!list.length&&task.mode!=='survey'&&task.mode!=='track')sky.queue[i].shift();
    }
    }
    const limMag=limitingMagnitude(s);if(limMag!==sky.limMag){sky.limMag=limMag;invalidate(s);}
    for(const d of sourceIndex(s).expiring)if(s.time>=d.expires)d.active=false;
    if(Object.values(s.p3.ep).some(a=>a.up[7]&&a.auto.observe)){const reserved=reservedPartners(s);for(let i=0;i<lenses(s);i++)if(!sky.queue[i].length&&!reserved.has(i))autoSchedule(s,i);}
  }
  function autoSchedule(s,lens){
    const sky=s.p3.sky,candidates=[];let array;
    for(const d of Object.values(sky.sources)){
      const o=sky.obs[d.id];if(!d.active||o.star>=3||d.born>s.time)continue;
      const mode=requiresVLBI(d)&&o.star===2?'vlbi':'point';if(mode==='vlbi'&&(!s.p3.ep[24]||(array||=vlbi(s)).N<3))continue;
      const task={mode,target:d.id,grade:o.star+1},rate=taskRate(s,lens,task,d),need=LIMITS[o.star]-(mode==='vlbi'?o.Iv||0:o.I);
      if(rate>0&&need>0)candidates.push({task,score:rate/need*(d.expires?10:1)});
    }
    candidates.sort((a,b)=>b.score-a.score||a.task.target.localeCompare(b.task.target));if(candidates[0])enqueue(s,lens,candidates[0].task);
  }
  function hasCompliant(s,era,active){return Object.values(s.p3.sky.sources).some(d=>d.era===era&&s.p3.sky.obs[d.id]?.star&&(active||[]).every(i=>(d.pert||[]).includes(i)));}
  function transient(s,kind,mansionIndex,mag,life,data={}){const sky=s.p3.sky,id='tr:'+kind+':'+(sky.ephem.serial=(sky.ephem.serial||0)+1);source(s,{id,kind,era:21+Math.floor(mansionIndex/7),mansion:mansionIndex,mag,born:s.time,expires:s.time+life,...data});return id;}
  function nova(s){
    const sky=s.p3.sky,era=s.p3.era==='inf'?24:s.p3.era,host=DEEP.get('ds:2:4');
    // Mulberry32 uses its own saved stream; the resonance seed must stay independent.
    let roll=sky.ephem.novaRng=((sky.ephem.novaRng??0x4d3830)+0x6d2b79f5)>>>0;
    roll=Math.imul(roll^(roll>>>15),roll|1);roll^=roll+Math.imul(roll^(roll>>>7),roll|61);roll=(roll^(roll>>>14))>>>0;
    const m80=!!s.p3.ep[23]&&!!sky.sources[host.id]?.active&&roll<0x40000000;
    return transient(s,'nova',m80?host.mansion:(era-21)*7,10+2*(era-21),7200,m80?{name:'M80 新星',novaHost:host.id}:{});
  }
  function validateTimeProof(s,id,key,p){
    const d=s.p3.sky.sources[id],o=s.p3.sky.obs[id],count=key==='period'?3:5,threshold=key==='period'?100:900;
    assert(p&&typeof p==='object'&&!Array.isArray(p)&&d?.period>0&&p.period===d.period,'时域证据周期不符');number(p.I,threshold,o.It??0);number(p.at,0,s.time);number(p.lens,0,lenses(s)-1,true);
    assert(Array.isArray(p.epochs)&&p.epochs.length===count,'时域证据历元数量不符');p.epochs.forEach((t,i)=>{number(t,0,p.at);assert(!i||t-p.epochs[i-1]+1e-9>=d.period/3,'时域证据历元间隔不足');});assert(o.marks.includes(key),'时域证据缺少徽记');
    if(d.multiplicity!==undefined){const level=s.deg.levels['bin:'+d.multiplicity];assert(level&&(level.hashes.includes(G.hash64(id))||level.univalent||level.g===G.Deg.capacity(s,level)),'时域证据未登记多重星能级');}
    return true;
  }
  function validateSpectroscopy(s,id,d,o){
    const p=o.spectroscopy;if(p===undefined)return;
    assert(s.p3.ep[23]&&p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).every(k=>k==='last'||k==='epochs'||SPECTRAL.some(r=>r[0]===k)),'光谱证据无效');
    const snapshot=(v,minR=100,minI=Number.MIN_VALUE)=>{
      assert(v&&typeof v==='object'&&!Array.isArray(v)&&RESOLUTIONS.includes(v.R)&&v.R>=minR&&v.R<=s.p3.sky.inst.spec,'光谱证据分辨率不足或无效');
      number(v.I,minI,o.Is??0);number(v.at,0,s.time);number(v.lens,0,lenses(s)-1,true);
    };
    snapshot(p.last);assert(p.last.I===o.Is,'光谱记录与信息量不符');
    assert(Array.isArray(p.epochs)&&p.epochs.length<=16,'光谱历元超预算');p.epochs.forEach((at,i)=>{number(at,0,Math.min(s.p3.clock.p2Beat,p.last.at));assert(!i||at>p.epochs[i-1],'光谱历元必须为不同拍点');});
    const rules=spectralRules(d);assert(!p.epochs.length||rules.velocity,'该天体不适用速度历元');
    for(const [key,,R,I]of SPECTRAL)if(p[key]!==undefined){
      const v=p[key];assert(rules[key]&&o.marks.includes(key),'光谱属性不适用或缺少徽记');snapshot(v,R,I);assert(v.at<=p.last.at&&v.I<=p.last.I,'光谱证据超出观测记录');
      if(key==='velocity'){
        assert(Array.isArray(v.epochs)&&(v.epochs.length===3||v.epochs.length===2&&mansion(s,14).clear),'速度证据历元数量不足');
        v.epochs.forEach((at,i)=>{number(at,0,Math.min(v.at,s.p3.clock.p2Beat));assert(!i||at>v.epochs[i-1],'速度证据历元必须为不同拍点');});
        assert(p.epochs.length>=v.epochs.length&&v.epochs.at(-1)<=p.epochs.at(-1),'速度证据超出采样历史');
        const n=spectralMultiplicity(d);assert((v.multiplicity??null)===n,'速度证据重数无来源');
        if(n){const l=s.deg.levels['bin:'+n];assert(l&&(l.hashes.includes(G.hash64(id))||l.univalent||l.g===G.Deg.capacity(s,l)),'速度证据未登记多重星能级');}
      }
      if(key==='metallicity'){
        number(v.priorZ,0,.15);number(v.delta,0,metalIncrement(d));assert(typeof v.legacy==='boolean','金属丰度历史标记无效');
        const expected=v.legacy?0:Math.max(0,Math.min(.15-v.priorZ,metalIncrement(d)));
        assert(Math.abs(v.delta-expected)<=1e-12&&v.priorZ+v.delta<=(s.deg.core.observedZ||0)+1e-12,'金属丰度奖励与独立观测项不符');
      }
    }
  }
  function validateEvidence(s,id,d,o){
    if(d.astroKind!==undefined)assert(DEEP.get(id)?.kind===d.astroKind,'深空天体类别与星表不符');
    if(d.novaHost!==undefined)assert(d.kind==='nova'&&d.novaHost==='ds:2:4'&&s.p3.ep[23]&&s.p3.sky.sources[d.novaHost]&&d.mansion===DEEP.get(d.novaHost).mansion,'新星位置与 M80 宿主不符');
    if(o.merger!==undefined){
      const m=o.merger;assert(id==='ds:3:6'&&s.p3.ep[24]&&o.star>=1&&m&&typeof m==='object'&&!Array.isArray(m)&&Object.keys(m).sort().join(',')==='at,primary,secondary','触须星系并合记录无效');
      number(m.at,0,s.time);number(m.primary,Number.MIN_VALUE,1e100);number(m.secondary,Number.MIN_VALUE,1e100);number(m.primary+m.secondary,0,1e100);
    }
    validateSpectroscopy(s,id,d,o);
    if(d.period!==undefined&&d.period!==null)number(d.period,Number.MIN_VALUE,1e15);
    const game=s.p3.ep[22]?.objects[id];if(game){const r=game.report,period=r.t||r.numeric===null?(1+r.birthday)*(1+Math.ceil(r.t))*60:null;assert(d.period===period,'局面周期与估值不符');assert(d.multiplicity===1+Math.floor(Math.log2(1+r.left+r.right)),'局面重数与选项不符');}
    if(d.multiplicity!==undefined){number(d.multiplicity,1,1e6,true);if(game)assert(d.multiplicity===1+Math.floor(Math.log2(1+game.report.left+game.report.right)),'局面重数与选项不符');}
    for(const k of ['It','Ii'])if(o[k]!==undefined){number(o[k],0,1e300);assert(o[k]<=o.I+Math.max(1e-9,o.I*1e-12),'模式信息量超过总曝光');}
    if(o.timing!==undefined){
      const t=o.timing;assert(s.p3.ep[22]&&d.period>0&&t&&typeof t==='object'&&!Array.isArray(t)&&Array.isArray(t.epochs)&&t.epochs.length<=16,'时域历元无效');t.epochs.forEach((at,i)=>{number(at,0,s.p3.clock.p2Beat);assert(!i||at-t.epochs[i-1]+1e-9>=d.period/3,'时域历元间隔不足');});
      for(const key of ['period','amplitude'])if(t[key]!==undefined){validateTimeProof(s,id,key,t[key]);assert(t.epochs.length>=t[key].epochs.length&&t[key].epochs.at(-1)<=t.epochs.at(-1),'时域证据超出采样历史');}
      if(t.amplitude)assert(t.period&&t.period.at<=t.amplitude.at&&t.period.I<=t.amplitude.I,'振幅证据缺少先行周期测量');
    }
    if(o.multiplicity!==undefined){
      const m=o.multiplicity;assert(s.p3.ep[22]&&m&&typeof m==='object'&&m.value===d.multiplicity,'重数证据缺少来源');number(m.value,1,1e6,true);number(m.I,400,o.Ii??0);number(m.lens,0,lenses(s)-1,true);number(m.partner,0,lenses(s)-1,true);assert(m.lens!==m.partner,'重数证据需要两台镜');number(m.at,0,s.time);assert(o.marks.includes('multiplicity'),'重数证据缺少徽记');
      const level=s.deg.levels['bin:'+m.value];assert(level&&(level.hashes.includes(G.hash64(id))||level.univalent||level.g===G.Deg.capacity(s,level)),'重数证据未登记能级');
    }
  }
  function validate(s){const sky=s.p3.sky;assert(sky&&Object.keys(sky.obs).length<=4096&&G.bytes(JSON.stringify(sky.obs))<=524288,'星表超过预算');assert(Object.keys(sky.sources).length===Object.keys(sky.obs).length,'天体与星表不配套');for(const [id,o]of Object.entries(sky.obs)){const d=sky.sources[id];assert(d&&d.id===id&&/^(xs|src|ds|tr|jq|old|inf|oct):[\w:.-]+$/.test(id),'星表缺少天体');number(d.mag,-100,1e6);number(d.mansion,0,27,true);assert(typeof d.active==='boolean','天体可见性无效');if(d.t!==undefined)number(d.t,0,T-1,true);if(d.expires!==undefined){number(d.expires,0,1e15);number(d.born,0,d.expires);}number(o.I,0,1e300);for(const k of ['Is','Iv'])if(o[k]!==undefined)number(o[k],0,1e300);assert(o.star===stage(Math.max(o.I,o.Iv||0)),'测量级与信息量不一致');if(o.modal){assert(d.kind==='station'&&o.star>=2,'模态读数需要实测站点');number(o.modal.depth,1,G.Era21.modalDepth(s),true);number(o.modal.lens,0,lenses(s)-1,true);number(o.modal.at,0,s.time);}assert(Array.isArray(o.marks)&&o.marks.length<=16&&new Set(o.marks).size===o.marks.length&&o.marks.every(m=>typeof m==='string'&&m.length<=64),'徽记无效');for(const k of ['epoch','specEpoch'])if(o[k]!==undefined){assert(Array.isArray(o[k])&&o[k].length<=16,'历元数量超预算');o[k].forEach((t,i)=>{number(t,-1e9,s.time);assert(!i||t>o[k][i-1],'历元必须递增');});}}
    if(sky.ephem.novaRng!==undefined)number(sky.ephem.novaRng,0,4294967295,true);
    let metal=0;for(const [id,o]of Object.entries(sky.obs)){validateEvidence(s,id,sky.sources[id],o);metal+=o.spectroscopy?.metallicity?.delta||0;}assert(metal<=(s.deg.core.observedZ||0)+1e-12,'光谱金属丰度奖励超出观测项');
    assert(sky.queue.length===4&&sky.queue.every((q,i)=>Array.isArray(q)&&q.length<=sky.inst.queue[i]),'观测队列无效');for(const k of ['D','eps','fov']){assert(sky.inst[k].length===4,'仪器状态无效');sky.inst[k].forEach(x=>number(x,0,{D:s.p3.inf?850:24,eps:11,fov:16}[k],true));}number(sky.inst.ao,0,8,true);assert(RESOLUTIONS.includes(sky.inst.spec),'光栅分辨率无效');assert(Array.isArray(sky.inst.vlbi)&&sky.inst.vlbi.length<=5,'VLBI 台站超预算');sky.inst.vlbi.forEach(x=>number(x,0,850,true));assert(sky.inst.queue.length===4,'队列容量无效');sky.inst.queue.forEach(x=>{number(x,8,16,true);assert(x%2===0,'队列容量无效');});const partners=new Set();for(let i=0;i<4;i++)for(const t of sky.queue[i]){assert(i<lenses(s)&&['point','survey','track','time','interference','spectrum','vlbi','horizon'].includes(t.mode),'观测任务无效');checkMode(s,t);number(t.grade,1,3,true);if(t.mode==='survey')number(t.target,0,27,true);else if(t.mode!=='track')assert(sky.sources[t.target],'任务引用未知天体');if(t.property!==undefined){const rule=SPECTRAL.find(r=>r[0]===t.property);assert(t.mode==='spectrum'&&rule&&spectralRules(sky.sources[t.target])[t.property]&&sky.inst.spec>=rule[2],'光谱属性任务无效');}if(t.mode==='interference'){number(t.partner,0,lenses(s)-1,true);assert(t.partner!==i&&!sky.queue[t.partner].length&&!partners.has(t.partner),'干涉预约冲突');partners.add(t.partner);}}
  }
  G.Obs={newState,stage,requiresVLBI,expireSeasons,quality,weight,informationRate,limitMag,instrument,seeing,lenses,magnitude,source,unlock,mansion,summary,mark,enqueue,clearQueue,upgrade,vlbi,targets,taskRate,catalogueEta,nextEvent,expose,tick,timeView,amplitudeFactor,validateTimeProof,spectrumView,zeemanFactor,hasCompliant,transient,nova,validate,invalidate,T};
  Object.assign(G.handlers,{'obs.enqueue':(s,a)=>enqueue(s,a.lens,a.task),'obs.clear':(s,a)=>clearQueue(s,a.lens),'obs.upgrade':(s,a)=>upgrade(s,a.lens,a.kind)});
})(typeof self!=='undefined'?self:this);
