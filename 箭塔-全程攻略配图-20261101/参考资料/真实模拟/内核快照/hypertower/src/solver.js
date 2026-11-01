/* Bounded worker jobs; fallback advances the same search iterator in short slices. */
(function(root){
'use strict';
const H=root.HT;let worker=null,pending=null,serial=0,mode='未启动';
const now=()=>typeof performance!=='undefined'?performance.now():Date.now();
function cancel(){if(worker){worker.terminate();worker=null;}if(pending){pending.resolve({cancelled:true});pending=null;}serial++;}
function solve(tree,options={},progress=()=>{}){
  cancel();const id=serial,t=H.Hydra.clone(tree),started=now();
  return new Promise((resolve,reject)=>{
    pending={resolve,reject};
    function finish(r){if(id!==serial)return;pending=null;if(worker){worker.terminate();worker=null;}resolve({...r,mode,ms:now()-started});}
    function fail(e){if(id!==serial)return;pending=null;if(worker){worker.terminate();worker=null;}reject(e);}
    function fallback(){
      mode='分片回退';const g=H.Hydra.search(t,{...options,maxStates:30000});
      const slice=()=>{
        if(id!==serial)return;const deadline=now()+1;let r;
        try{do{r=g.next();}while(!r.done&&now()<deadline);if(r.done)finish(r.value);else{progress(r.value);setTimeout(slice,8);}}
        catch(e){fail(e);}
      };setTimeout(slice,0);
    }
    if(options.fallback||typeof Worker==='undefined'||typeof Blob==='undefined'){fallback();return;}
    let url;
    try{
      const source='const hydra=('+H.Hydra.kernelSource+')(null);onmessage=function(e){try{const g=hydra.search(e.data.tree,e.data.options);let r;do{r=g.next();}while(!r.done);postMessage({result:r.value});}catch(e){postMessage({error:String(e.message)})}}';
      url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));worker=new Worker(url);URL.revokeObjectURL(url);mode='Web Worker';
      worker.onmessage=e=>e.data.error?fail(Error(e.data.error)):finish(e.data.result);
      worker.onerror=e=>{e.preventDefault();worker.terminate();worker=null;fallback();};
      worker.postMessage({tree:t,options});
    }catch(e){if(url)URL.revokeObjectURL(url);if(worker)worker.terminate();worker=null;fallback();}
  });
}
H.Solver={solve,cancel,get mode(){return mode;},get busy(){return !!pending;}};
})(typeof self!=='undefined'?self:this);
