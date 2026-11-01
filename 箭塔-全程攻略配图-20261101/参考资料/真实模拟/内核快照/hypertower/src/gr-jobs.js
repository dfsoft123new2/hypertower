/* Bounded math in cancellable workers, with cooperative generators as fallback. */
(function(root){
 'use strict';const G=root.HT.GR;let source=null,sequence=0,pending=null,worker=null,mode='idle';
 function configure(options={}){G.assert(typeof options.source==='string'&&options.source.length<12000000,'Worker 源码无效');source=options.source;}
 function* make(kind,data={}){
  switch(kind){
   case'legacy-solution':return yield* G.Legacy.checkJob(data);
   case'forcing':return yield* G.Era21.reachJob(data.origin,data.options);
   case'game':yield {stage:'canonical'};return G.Era22.evaluate(data.design,data.options);
   case'category':yield {stage:'congruence'};{const c=G.Era23.category(data.net);return {paths:c.paths,classes:c.classes,isomorphism:G.Era23.canonical(c,data.budget)};}
   case'magnus':yield {stage:'expansion'};return G.Era24.magnus(data.word,data.degree,data.budget);
   case'braid':yield {stage:'artin'};return G.Era24.braidKey(data.beta,data.strands);
   case'smith':yield {stage:'smith'};return G.Era24.smith(data.matrix,data.columns);
   case'imj':yield {stage:'factor'};return {n:String(data.n),m:String(G.Inf.imJOrder(data.n)),gears:G.Inf.gearsOf(G.Inf.imJOrder(data.n))};
   case'octal':return yield* G.Inf.grundyJob(data.code,data.limit,data.options);
   case'forcing-game':{const m=G.ForcingGame.solve(data);return {winning:m.win(data.station,data.first||'L',m.plies)};}
   case'offline':{G.number(data.seconds,0,1e12,false,'离线时间');const s=G.load(data.save);let left=Math.min(data.seconds,G.offlinePolicy(s).cap),done=0;while(left>0){const t=Math.min(300,left);G.offline(s,t);done+=t;left-=t;yield {seconds:done};}return {save:G.save(s),seconds:done};}
   default:throw Error('未知群星纪计算任务');
  }
 }
 function plain(x){if(x instanceof Map)return {map:[...x].map(([k,v])=>[plain(k),plain(v)])};if(Array.isArray(x))return x.map(plain);if(typeof x==='bigint')return x.toString();if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,plain(v)]));return x;}
 function cancel(){sequence++;if(worker){worker.terminate();worker=null;}if(pending){pending.resolve({cancelled:true});pending=null;}mode='idle';}
 function run(kind,data={},progress=()=>{},options={}){
  cancel();const id=sequence,start=performance.now();return new Promise((resolve,reject)=>{pending={resolve,reject};const close=()=>{if(worker){worker.terminate();worker=null;}pending=null;};
   function finish(result){if(id!==sequence)return;const used=mode;close();mode='idle';resolve({result,mode:used,ms:performance.now()-start});}
   function fail(e){if(id!==sequence)return;close();mode='idle';reject(e);}
   function fallback(){mode='cooperative';let job;try{job=make(kind,data);}catch(e){fail(e);return;}const slice=()=>{if(id!==sequence)return;try{const until=performance.now()+1;let r;do{r=job.next();}while(!r.done&&performance.now()<until);if(r.done)finish(plain(r.value));else{progress(r.value);setTimeout(slice,0);}}catch(e){fail(e);}};setTimeout(slice,0);}
   if(options.fallback||!source||typeof root.Worker!=='function'||typeof root.Blob!=='function'){fallback();return;}
   let url;
   try{url=root.URL.createObjectURL(new root.Blob([source,'\nself.onmessage=function(e){try{const job=HT.GR.Jobs.make(e.data.kind,e.data.data);let r,n=0;do{r=job.next();if(!r.done&&++n%16===0)postMessage({progress:r.value});}while(!r.done);postMessage({result:HT.GR.Jobs.plain(r.value)});}catch(e){postMessage({error:e.message});}};'],{type:'text/javascript'}));worker=new root.Worker(url);root.URL.revokeObjectURL(url);mode='worker';worker.onmessage=e=>{if(id!==sequence)return;try{if(e.data.error)fail(Error(e.data.error));else if('result'in e.data)finish(e.data.result);else progress(e.data.progress);}catch(error){fail(error);}};worker.onerror=e=>{e.preventDefault?.();if(id!==sequence)return;if(worker){worker.terminate();worker=null;}fallback();};worker.postMessage({kind,data});}
   catch(e){if(url)root.URL.revokeObjectURL(url);if(worker){worker.terminate();worker=null;}fallback();}
  });
 }
 G.Jobs={configure,make,plain,run,cancel,get busy(){return !!pending;},get mode(){return mode;}};
})(typeof self!=='undefined'?self:this);
