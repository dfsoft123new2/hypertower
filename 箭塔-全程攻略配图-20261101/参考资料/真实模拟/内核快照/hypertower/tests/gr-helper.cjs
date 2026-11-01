const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const base = path.join(__dirname, '..');
const legacy = ['beyond','ord','hydra','puzzles','systems','era11','solver','late-math','late-eras','late-jobs'];
const modules = ['gr-core','gr-data','gr-shadow','gr-obs','gr-deg','gr-era21','gr-era22','gr-values','gr-era23','gr-era24','gr-loopy','gr-inf','gr-inf-auto','gr-links','gr-systems','gr-hearts','gr-legacy','gr-jobs','gr-api'];
function engine({bridge = false} = {}) {
  const c = {console, Date, Math, btoa, atob, setTimeout, clearTimeout, performance, TextEncoder};
  c.window = c; c.self = c;
  vm.createContext(c);
  const read = p => fs.readFileSync(path.join(base,p), 'utf8');
  vm.runInContext(read('vendor/omega-num.js'), c);
  const core = [...read('source-v3.html').matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('core engine'));
  vm.runInContext(core.replace('v: 3, time: 0, era: 1','v: 4, meta: null, time: 0, era: 1').replace("phi: { cur: 'crease', name: '晶格功率 φ', cap: 8", "phi: { cur: 'crease', name: '晶格功率 φ', cap: 12"),c);
  for (const name of [...legacy,...modules]) {
    if (name==='gr-api'&&!bridge) continue;
    if (fs.existsSync(path.join(base,'src',name+'.js'))) vm.runInContext(read('src/'+name+'.js'),c,{filename:name+'.js'});
  }
  return {H:c.HT, G:c.HT.GR, c};
}
function readyFromLegacy(H,G) {
  const s=require('./engine.cjs').omegaSave(H);
  H.Meta.prestige(s,0);s.era=10;s.meta.rank=s.meta.bestRank=15;
  s.meta.epsilon=s.meta.bestEpsilon='10';
  if(!H.Eleven.enter(s))throw Error('fixture XI gate');
  s.eras[11].complete=true;s.ord.index=6;
  for(let id=12;id<=20;id++) {
    if(!H.Late.enter(s,id))throw Error('fixture '+id+' gate');
    if(id===18){s.eras[18].design=H.LateMath.clone(H.LateMath.puzzles(18)[0].solution);H.Late.submit(s);}
    if(id===19)H.Late.setChoice(s,false);
    H.Late.state(s).complete=true;s.ord.index=H.Late.config(s).LABELS.length-1;
  }
  s.legacy.round='10';
  for(let id=11;id<=20;id++) { s.archive[id] ||= {}; s.archive[id].stars=Array(24).fill(3); }
  return G.migrate(s);
}
function split(H,G){const s=readyFromLegacy(H,G);if(!G.enter21(s))throw Error('fixture XXI gate');return s;}
function epoch(H,G,id=24){const s=split(H,G);for(let era=22;era<=id;era++){const prev=s.p3.ep[era-1];prev.level=G.Data.levels[era-1].length-1;prev.complete=true;s.deg.core.relics.ns=1;s.deg.core.relics.quark=1;if(era===24)G.Deg.merge(s,10);if(!G.unlock(s,era))throw Error('fixture unlock '+era);}return s;}
function infinity(H,G){const s=epoch(H,G);s.p3.ep[24].level=12;s.p3.ep[24].complete=true;s.deg.core.evaporations='1';s.deg.core.lastDust='100000';s.deg.core.bh=null;G.add(s,'dust',100000);if(!G.Inf.enter(s))throw Error('fixture infinity gate');return s;}
module.exports={engine,modules,legacy,base,readyFromLegacy,split,epoch,infinity};
