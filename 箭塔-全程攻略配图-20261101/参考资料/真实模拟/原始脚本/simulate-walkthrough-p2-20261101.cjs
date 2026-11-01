const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const BASE='D:/hypertower-recovery-20261026',OUT=BASE+'/walkthrough-work-20261101/simulation-p2';fs.mkdirSync(OUT,{recursive:true});
const {H,G}=require(BASE+'/hypertower/tests/gr-helper.cjs').engine(),L=H.Late,K=H.LateMath,E=H.Eleven;
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function seed(points='66000000',round='225000'){
 const s=require(BASE+'/hypertower/tests/engine.cjs').omegaSave(H);H.Meta.prestige(s,0);s.era=10;s.meta.rank=s.meta.bestRank=15;s.meta.epsilon=s.meta.bestEpsilon='10';assert(E.enter(s));
 E.loadPuzzle(s,0);for(const p of H.Hydra.PUZZLES[0].solution)E.chop(s,p);let rep=E.submit(s,'长期模拟·XI已验代表').blueprint;
 if(!rep)rep=s.blueprints[s.blueprints.length-1];s.blueprints=s.blueprints.filter(b=>b.era!==11||b.id===rep.id);s.archive['11'].stars.fill(3);s.eras['11'].complete=true;s.ord.index=6;
 for(let era=12;era<=20;era++){
  assert(L.enter(s,era));const a=L.state(s);a.puzzle=era===20?16:0;a.design=K.clone(K.puzzles(era)[a.puzzle].solution);a.aided=false;if(era===19){a.choice=false;a.design.choice=false;}if(era===20)a.design.carry=['MA','natural','fixed'];
  const b=L.submit(s,'长期模拟·'+era+'已验代表').blueprint;s.blueprints=s.blueprints.filter(x=>x.era!==era||x.id===b.id);s.archive[String(era)].stars.fill(3);a.complete=true;s.ord.index=L.configs.get(era).LABELS.length-1;
 }
 s.legacy.round=round;s.legacy.points=points;s.legacy.auto=true;s.legacy.carry=['MA','natural','fixed'];s.legacy.roundStart=0;s.legacy.bestSeconds=0;s.time=600;s.runT=600;s.legacy.axiom=Number(BigInt(round)%5n);s.workshop.enabled=false;s.workshop.rules=[];H.checkAch(s);return s;
}
function next(s,left=60){if(s.legacy.rebuilding)return Math.min(left,100/L.legacyMultiplier(s)-s.legacy.rebuild);const a=s.era===11?E.state(s):L.state(s),api=s.era===11?E:L;let t=Math.min(left,60,api.toBoundary(s));if(a.auto.buy&&(s.era===11||L.choice(s)||L.deterministic?.(s)||a.up[5]>0||s.legacy.carry.includes('fixed')||s.legacy.axiom===4))t=Math.min(t,api.nextBuy(s,s.era>=12&&!L.choice(s)));return Math.max(1e-7,t);}
let steps=0;function step(s,dt){H.tick(s,dt);steps++;}
function finishRound(s){const before=BigInt(s.legacy.round);let elapsed=0,guard=0;while(BigInt(s.legacy.round)===before){if(++guard>10000)throw Error('round stalled '+s.era);const dt=next(s);step(s,dt);elapsed+=dt;}assert.equal(BigInt(s.legacy.round),before+1n);assert(s.legacy.rebuilding&&s.legacy.rebuild===0);return elapsed;}
function canonical(s){const o=JSON.parse(H.save(H.load(H.save(s))));for(const k of ['time','last','log'])delete o[k];for(const k of ['round','points','roundStart','bestSeconds'])delete o.legacy[k];return JSON.stringify(o);}
if(require.main===module){const s=seed();fs.writeFileSync(OUT+'/baseline-XX.ht5',H.exportStr(s));assert(L.normalize(s));const start=performance.now(),cycles=[];let prev=canonical(s);
for(let i=0;i<15;i++){const p=s.legacy.points,r=s.legacy.round,t=finishRound(s);const row={round:s.legacy.round,axiom:s.legacy.axiom,seconds:t,earned:String(BigInt(s.legacy.points)-BigInt(p)),multiplier:L.legacyMultiplier(s),steps,canonicalHash:sha(canonical(s))};cycles.push(row);if(i>=4)row.sameAsFiveEarlier=row.canonicalHash===cycles[i-5]?.canonicalHash;}
const result={benchmarkWallSeconds:(performance.now()-start)/1000,steps,cycles,legalLoad:H.importStr(H.exportStr(s)).legacy.round===s.legacy.round};fs.writeFileSync(OUT+'/benchmark-rounds.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}
module.exports={H,G,L,K,E,seed,next,step,finishRound,canonical,OUT,sha};
