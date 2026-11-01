/* Pure, bounded puzzle kernels. The same code runs in Node, workers and fallback jobs.
 * Higher ordinal/cardinal names are progression labels, never an arbitrary psi oracle. */
(function(root){
'use strict';
function kernel(){
const clone=x=>JSON.parse(JSON.stringify(x));
const int=(n,a,b)=>{if(!Number.isInteger(n)||n<a||n>b)throw Error('整数超出验证范围');return n;};
function rng(seed){let n=(seed>>>0)||1;return()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}
function bounded(x,limit=65536){const s=JSON.stringify(x);if(s.length>limit)throw Error('设计超过 64 KB');let nodes=0;function walk(v,d){if(++nodes>8192||d>64)throw Error('设计结构超过预算');if(v&&typeof v==='object')for(const k of Object.keys(v)){if(['__proto__','constructor','prototype'].includes(k))throw Error('无效字段');walk(v[k],d+1);}}walk(x,0);return x;}
// Principal binary Veblen normal forms below Gamma_0. Naturals are numbers.
// phi(0,0)=1; a smaller-index phi absorbs a higher-index fixed point in slot b.
function vcmp(x,y){if(x===y)return 0;if(typeof x==='number')return typeof y==='number'?Math.sign(x-y):-1;if(typeof y==='number')return 1;
  const a=vcmp(x[0],y[0]);if(a===0)return vcmp(x[1],y[1]);return a<0?(vcmp(x[1],y)<0?-1:1):(vcmp(x,y[1])>0?1:-1);}
function vphi(a,b){if(a===0&&b===0)return 1;if(Array.isArray(b)&&vcmp(a,b[0])<0)return b;const x=[a,b];if(JSON.stringify(x).length>24000)throw Error('Veblen 记号超过结构预算');return x;}
function vfmt(x,depth=0){if(depth>8)return '…';return typeof x==='number'?String(x):'φ('+vfmt(x[0],depth+1)+', '+vfmt(x[1],depth+1)+')';}
function vcheck(x){let count=0;function walk(a,d){if(++count>4096||d>64)throw Error('Veblen 记号超过预算');if(typeof a==='number')return int(a,0,10000);if(!Array.isArray(a)||a.length!==2)throw Error('Veblen 记号无效');walk(a[0],d+1);walk(a[1],d+1);if(a[0]===0&&a[1]===0||Array.isArray(a[1])&&vcmp(a[0],a[1][0])<0)throw Error('不是 Veblen 规范形');}walk(x,0);return x;}
function wire(board,options={}){if(!Array.isArray(board)||board.length!==64||board.some(t=>!['.','0','1','2','3','w','E','p','f'].includes(t)))throw Error('布线应为 8×8');
  const values=[],absorbed=[];let nodes=0,loops=0;
  for(let i=0;i<64;i++){const t=board[i],a=i%8?values[i-1]:0,b=i>=8?values[i-8]:0;let v;
    if(t==='p'){nodes++;v=options.swap?vphi(b,a):vphi(a,b);if(v===b)absorbed.push(i);}
    else if(t==='f'){loops++;v=vcmp(a,b)>=0?a:b;for(let j=0;j<(options.feedback||2);j++)v=vphi(v,0);}
    else if(t==='w')v=vphi(0,1);else if(t==='E')v=vphi(1,0);else if(t==='.')v=options.oneway?a:vcmp(a,b)>=0?a:b;else v=Number(t);values.push(v);
  }
  return {value:values[63],values,nodes,loops,absorbed,score:Math.max(1,65-board.filter(t=>t!=='.').length-absorbed.length),summary:vfmt(values[63])};
}
const leaf=c=>({c,ch:[]});
function treeSize(t){return 1+t.ch.reduce((n,c)=>n+treeSize(c),0);}
function treeCheck(t,colors=3,max=40){let n=0;function walk(t,d){if(++n>max||d>40||!t||typeof t!=='object'||!Array.isArray(t.ch)||t.ch.length>39)throw Error('树超出节点预算');int(t.c,0,colors-1);t.ch.forEach(c=>walk(c,d+1));}walk(t,0);return t;}
function chain(n,c){let t=leaf(c);while(--n)t={c,ch:[t]};return t;}
function star(n,c){return {c,ch:Array.from({length:n-1},()=>leaf(c))};}
// Rooted homeomorphic embedding: children must enter distinct branches.
function embeds(a,b,colorBlind=false){const memo=new Map(),ids=new WeakMap();let seq=0;const id=t=>{if(!ids.has(t))ids.set(t,++seq);return ids.get(t);};
  function match(a,b){const k=id(a)+','+id(b);if(memo.has(k))return memo.get(k);let ok=false;
    if((colorBlind||a.c===b.c)&&a.ch.length<=b.ch.length){const pairs=a.ch.map(c=>b.ch.map(d=>go(c,d))),matched=Array(b.ch.length).fill(-1);function augment(i,seen){for(let j=0;j<b.ch.length;j++)if(pairs[i][j]&&!seen[j]){seen[j]=true;if(matched[j]<0||augment(matched[j],seen)){matched[j]=i;return true;}}return false;}ok=a.ch.every((_,i)=>augment(i,[]));}
    if(!ok)ok=b.ch.some(c=>go(a,c));memo.set(k,ok);return ok;
  }function go(a,b){return match(a,b);}return go(a,b);
}
function forest(sequence,options={}){if(!Array.isArray(sequence)||sequence.length>96)throw Error('森林超过 96 棵验证预算');const colors=options.colors||3,soil=options.soil||0;let total=0;
  for(let i=0;i<sequence.length;i++){const t=treeCheck(sequence[i],colors);total+=treeSize(t);if(total>4096||treeSize(t)>i+1+soil)throw Error('第 '+(i+1)+' 棵超过土壤节点上限');
    if(options.even&&treeSize(t)%2)throw Error('双生挑战要求偶数节点');if(options.nochain){const depth=t=>1+Math.max(0,...t.ch.map(depth));if(depth(t)>3)throw Error('禁链挑战要求深度不超过 3');}
    for(let j=0;j<i;j++)if(embeds(sequence[j],t,options.colorBlind))throw Error('第 '+(j+1)+' 棵可嵌入第 '+(i+1)+' 棵');
  }return {score:sequence.length,summary:sequence.length+' 棵合法树 · '+total+' 节点',nodes:total};
}
// Exact finite ordinal polynomials in a formal Omega; no claim psi is monotonic.
function polyCompare(a,b){for(let i=5;i>=0;i--)if(a[i]!==b[i])return Math.sign(a[i]-b[i]);return 0;}
function polyFmt(a){return a.map((n,i)=>n?(i?'Ω'+(i===1?'':'^'+i)+(n===1?'':'·'+n):String(n)):'').reverse().filter(Boolean).join(' + ')||'0';}
function taggedCut(tree,path,n){const t=clone(tree);treeCheck(t,10001,96);let v=t;for(const k of path)v=v.ch[int(k,0,v.ch.length-1)];if(v.ch.length)throw Error('只能斩叶子');
  if(v.c>0){v.c=v.c===10000?int(n+1,1,10000):v.c-1;return t;}if(!path.length)return null;
  let p=t;for(const k of path.slice(0,-1))p=p.ch[k];p.ch.splice(path.at(-1),1);
  if(path.length>1){let gp=t;for(const k of path.slice(0,-2))gp=gp.ch[k];for(let i=0;i<Math.min(n,8);i++)gp.ch.push(clone(p));}
  treeCheck(t,10001,256);return t;
}
const PATTERNS={
  block:[[0,0],[1,0],[0,1],[1,1]],blinker:[[0,0],[1,0],[2,0]],glider:[[1,0],[2,1],[0,2],[1,2],[2,2]],
  r:[[1,0],[2,0],[0,1],[1,1],[1,2]],acorn:[[1,0],[3,1],[0,2],[1,2],[4,2],[5,2],[6,2]],
  diehard:[[6,0],[0,1],[1,1],[1,2],[5,2],[6,2],[7,2]],beacon:[[0,0],[1,0],[0,1],[3,2],[2,3],[3,3]],
  replicator:[[2,0],[3,0],[4,0],[1,1],[4,1],[0,2],[4,2],[0,3],[3,3],[0,4],[1,4],[2,4]]
};
function cellsCheck(cells,max=256){if(!Array.isArray(cells)||cells.length>max)throw Error('种子超过细胞预算');const seen=new Set();for(const p of cells){if(!Array.isArray(p)||p.length!==2)throw Error('细胞坐标无效');int(p[0],-2048,2048);int(p[1],-2048,2048);const k=p.join(',');if(seen.has(k))throw Error('重复细胞');seen.add(k);}return cells;}
function lifeStep(cells,rule='B3/S23',torus=0){const counts=new Map(),live=new Set(cells.map(p=>p.join(',')));
  for(const[x,y]of cells)for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)if(dx||dy){const xx=torus?(x+dx+torus)%torus:x+dx,yy=torus?(y+dy+torus)%torus:y+dy,k=xx+','+yy;counts.set(k,(counts.get(k)||0)+1);}
  const result=[];for(const[k,n]of counts)if(n===3||n===2&&live.has(k)||rule==='B36/S23'&&n===6&&!live.has(k))result.push(k.split(',').map(Number));return result;
}
function normCells(cells){if(!cells.length)return {key:'',x:0,y:0};const x=Math.min(...cells.map(p=>p[0])),y=Math.min(...cells.map(p=>p[1]));return {key:cells.map(p=>(p[0]-x)+','+(p[1]-y)).sort().join(';'),x,y};}
function* lifeJob(design,options={}){const seed=cellsCheck(design.cells),steps=int(design.steps??100,1,8192),rule=design.rule||'B3/S23';if(!['B3/S23','B36/S23'].includes(rule))throw Error('未知生命规则');
  let cells=clone(seed),peak=cells.length,period=0,shift=[0,0],firstRepeat=0,extinct=0;const seen=new Map(),start=normCells(cells);seen.set(start.key,{g:0,x:start.x,y:start.y});
  for(let g=1;g<=steps;g++){cells=lifeStep(cells,rule,options.torus||0);peak=Math.max(peak,cells.length);if(cells.length>20000)throw Error('活细胞超过 20000 的模拟预算');if(!cells.length&&!extinct)extinct=g;
    if(cells.length<=1024&&!period){const n=normCells(cells),p=seen.get(n.key);if(p){period=g-p.g;shift=[n.x-p.x,n.y-p.y];firstRepeat=p.g;}else if(seen.size<2048)seen.set(n.key,{g,x:n.x,y:n.y});}
    if(g%8===0)yield {generation:g,population:cells.length};
  }
  return {cells,generation:steps,population:cells.length,peak,period,shift,firstRepeat,extinct,score:Math.max(1,peak+steps/20),summary:steps+' 代 · '+cells.length+' 细胞'+(period?' · 周期 '+period+' / 平移 '+shift.join(','):' · 尚未证明稳定')};
}
const CHAMPIONS={
  2:{states:2,symbols:2,table:['1RB','1LB','1LA','1RH']},
  3:{states:3,symbols:2,table:['1RB','1RH','1LB','0RC','1LC','1LA']},
  4:{states:4,symbols:2,table:['1RB','1LB','1LA','0LC','1RH','1LD','1RD','0RA']},
  5:{states:5,symbols:2,table:['1RB','1LC','1RC','1RB','1RD','0LE','1LA','1LD','1RH','0LA']}
};
function machineCheck(m){if(!m||!Array.isArray(m.table))throw Error('转移表无效');int(m.states,2,6);int(m.symbols,2,3);if(m.table.length!==m.states*m.symbols)throw Error('转移表尺寸无效');let halts=0;
  for(const t of m.table){if(typeof t!=='string'||!/^\d[LR][A-FH]$/.test(t)||Number(t[0])>=m.symbols||t[2]!=='H'&&t.charCodeAt(2)-65>=m.states)throw Error('转移应为 1RB、0LA 或 1RH');if(t[2]==='H')halts++;}if(halts!==1)throw Error('转移表必须恰有一个停机格');return m;
}
function machineInit(m){machineCheck(m);return {tape:new Map(),head:0,state:0,steps:0,halted:false,m};}
function machineStep(v){if(v.halted)return;const t=v.m.table[v.state*v.m.symbols+(v.tape.get(v.head)||0)],w=Number(t[0]);if(w)v.tape.set(v.head,w);else v.tape.delete(v.head);v.head+=t[1]==='R'?1:-1;v.state=t[2]==='H'?-1:t.charCodeAt(2)-65;v.steps++;v.halted=v.state<0;}
function config(v,relative=false){return v.state+'|'+(relative?'':v.head+'|')+[...v.tape].map(([p,n])=>[p-(relative?v.head:0),n]).sort((a,b)=>a[0]-b[0]).map(x=>x.join(':')).join(',');}
function* machineJob(design){const m=machineCheck(design.machine||design),budget=int(design.budget??100000,1,100000000),codes=m.table.map(t=>[Number(t[0]),t[1]==='R'?1:-1,t[2]==='H'?-1:t.charCodeAt(2)-65]);
  let size=32768,tape=new Uint8Array(size),head=size>>1,origin=-(size>>1),state=0,steps=0,ones=0,halted=false,min=0,max=0;
  while(steps<budget){if(head<0||head>=size){if(size>=4194304)throw Error('纸带超过 4 MiB 预算');const next=new Uint8Array(size*2);next.set(tape,size>>1);head+=size>>1;origin-=size>>1;tape=next;size*=2;}
    const t=codes[state*m.symbols+tape[head]],before=tape[head];if(before===1)ones--;if(t[0]===1)ones++;tape[head]=t[0];head+=t[1];state=t[2];steps++;const position=origin+head;if(position<min)min=position;if(position>max)max=position;
    if(state<0){halted=true;break;}if(steps%50000===0)yield {steps,ones};
  }
  const cells=[];for(let i=0;i<tape.length;i++)if(tape[i])cells.push([i+origin,tape[i]]);
  return {halted,steps,ones,cells:cells.slice(0,8192),head:origin+head,state,min,max,score:halted?Math.max(1,Math.log2(steps+1)*Math.max(1,ones)):0,summary:(halted?'已停机':'预算内未判定')+' · '+steps.toLocaleString('en-US')+' 步 · '+ones+' 个 1'};
}
// Bounded enumeration modulo state renaming and reflection. Unknowns remain unknown.
function* enumerateJob(options={}){const states=int(options.states||2,2,3),cells=states*2,base=4*states,block=base**(cells-1),total=cells*4*block,offset=int(options.offset||0,0,total),count=int(options.count||256,1,total),budget=int(options.budget||1000,1,100000);let tested=0,halted=0,best=null,unknown=[];
  const end=Math.min(total,offset+count);for(let cursor=offset;cursor<end;cursor++){if((cursor-offset)%64===0)yield {cursor,tested,halted};const h=Math.floor(cursor/(4*block)),hc=Math.floor(cursor/block)%4,table=[],digits=cursor%block;let code=digits;for(let i=0;i<cells;i++){if(i===h){table.push((hc%2)+(hc<2?'R':'L')+'H');continue;}const v=code%base;code=Math.floor(code/base);table.push((v%2)+(Math.floor(v/2)%2?'L':'R')+String.fromCharCode(65+Math.floor(v/4)));}
    if(table[0][1]!=='R')continue;const names=new Map([[0,0]]),queue=[0];while(queue.length){const s=queue.shift();for(let b=0;b<2;b++){const ch=table[s*2+b][2];if(ch==='H')continue;const next=ch.charCodeAt(0)-65;if(!names.has(next)){names.set(next,names.size);queue.push(next);}}}if(names.size!==states||[...names].some(([a,b])=>a!==b))continue;
    const machine={states,symbols:2,table},r=yield* machineJob({machine,budget});tested++;if(r.halted){halted++;if(!best||r.steps>best.report.steps)best={machine,report:r};}else if(unknown.length<32)unknown.push(machine);if(tested%16===0)yield {cursor:cursor+1,tested,halted};
  }return {cursor:end,total,tested,halted,best,unknown,summary:'有界枚举 '+tested+' 台规范机器 · '+halted+' 台停机 · 游标 '+end+' / '+total+(best?' · 最佳 '+best.report.steps+' 步':'')};
}
function reachesHalt(m){const seen=new Set([0]),queue=[0];while(queue.length){const a=queue.shift();for(let i=0;i<m.symbols;i++){const t=m.table[a*m.symbols+i];if(t[2]==='H')return true;const s=t.charCodeAt(2)-65;if(!seen.has(s)){seen.add(s);queue.push(s);}}}return false;}
function certify(m,start,period,translation){machineCheck(m);int(start,0,10000);int(period,1,10000);int(translation,-10000,10000);if(start+period>20000)throw Error('证书超过 20000 步预算');
  const v=machineInit(m);for(let i=0;i<start&&!v.halted;i++)machineStep(v);if(v.halted)throw Error('起点前已经停机');const before=config(v,true),head=v.head;
  for(let i=0;i<period&&!v.halted;i++)machineStep(v);if(v.halted||config(v,true)!==before||v.head-head!==translation)throw Error('证书未通过完整纸带配置重放');return {kind:translation?'translation':'cycle',start,period,translation,verified:true};
}
function* classifyJob(design){const m=machineCheck(design.machine),modules=design.modules||['reach','cycle','translation'],budget=int(design.budget||1000,1,10000);if(!Array.isArray(modules)||modules.length>5||modules.some(x=>!['reach','cycle','translation','drift','halt'].includes(x)))throw Error('判定模块无效');let cost=0;
  for(const module of modules){cost++;
    if(module==='reach'){if(!reachesHalt(m))return {status:'nonhalting',module,cost,score:20/cost,summary:'静态可达性证书：停机状态不可达'};continue;}
    const v=machineInit(m),seen=new Map();
    for(let i=0;i<=budget;i++){if(v.halted)return {status:'halted',steps:v.steps,module,cost,score:10/cost,summary:'实际停机 · '+v.steps+' 步'};
      if(module!=='halt'&&v.tape.size<=256){const rel=module!=='cycle',k=config(v,rel),p=seen.get(k);if(p&&(!(module==='drift')||v.tape.size===0)){const cert=certify(m,p.step,v.steps-p.step,v.head-p.head);return {status:'nonhalting',certificate:cert,module,cost,score:20/cost,summary:'已验'+(cert.translation?'平移':'周期')+'证书 · 周期 '+cert.period};}if(!p)seen.set(k,{step:v.steps,head:v.head});}
      machineStep(v);cost+=1/(budget+1);if(i%128===0)yield {module,steps:i};
    }
  }
  return {status:'unknown',cost,score:0,summary:'未判定：预算耗尽，不代表不停机'};
}
const PROPOSITIONS=[['CH','连续统假设'],['notCH','¬CH'],['diamond','◇'],['MA','Martin 公理'],['PFA','适当强迫公理'],['VL','V=L'],['GCH','广义连续统假设'],['measurable','存在可测基数'],['c2','连续统 = ℵ₂']];
const IMPLICATIONS=[['VL','GCH','Gödel, The Consistency of the Continuum Hypothesis (1940)'],['VL','diamond','Jensen, The fine structure of the constructible hierarchy (1972)'],['GCH','CH','GCH 在 ℵ₀ 处的实例'],['diamond','CH','Jensen diamond principle'],['PFA','MA','Proper forcing axiom 的 ccc 实例'],['PFA','c2','Baumgartner, Applications of the proper forcing axiom (1984)'],['c2','notCH','ℵ₂ > ℵ₁']];
function universe(selected){if(!Array.isArray(selected)||selected.length>9||new Set(selected).size!==selected.length||selected.some(s=>!PROPOSITIONS.some(p=>p[0]===s)))throw Error('宇宙命题无效');const set=new Set(selected);let changed=true;while(changed){changed=false;for(const[a,b]of IMPLICATIONS)if(set.has(a)&&!set.has(b)){set.add(b);changed=true;}}
  const conflicts=[];for(const[a,b,why]of [['CH','notCH','CH 与 ¬CH'],['VL','measurable','Scott 定理：可测基数推出 V≠L']])if(set.has(a)&&set.has(b))conflicts.push(why);
  return {closure:[...set],conflicts,valid:conflicts.length===0};
}
function constraints(seed,count=24){const random=rng(seed),witness=Array.from({length:64},()=>random()<.5?0:1),clauses=[];for(let i=0;i<count;i++){const ids=new Set();while(ids.size<3+i%3)ids.add(Math.floor(random()*64));clauses.push([...ids].map(i=>[i,witness[i]]));}return {witness,clauses};}
function forcing(design,seed){if(!Array.isArray(design.grid)||design.grid.length!==64||design.grid.some(n=>![-1,0,1].includes(n)))throw Error('条件网格应为 8×8 的空/0/1');const u=universe(design.selected),data=constraints(seed),met=data.clauses.map(cl=>cl.some(([i,b])=>design.grid[i]===b)),filled=design.grid.filter(n=>n>=0).length;
  if(!u.valid)throw Error('宇宙矛盾：'+u.conflicts.join('；'));return {...u,met,filled,coverage:met.filter(Boolean).length,score:met.filter(Boolean).length*2+Math.max(0,64-filled)/8,summary:'相容宇宙 · '+met.filter(Boolean).length+' / 24 条约束 · '+filled+' 格'};
}
const CARDINALS=['不可达','Mahlo','弱紧','可测','强','Woodin','超紧','可扩','巨大','I3','I1','I0','Reinhardt','Berkeley'];
function reflection(design){if(!Array.isArray(design.slots)||design.slots.length!==8)throw Error('反射之塔需要 8 层');design.slots.forEach(n=>int(n,-1,7));int(design.critical,0,7);if(typeof design.choice!=='boolean')throw Error('选择公理状态无效');let score=0;const used=new Set();for(let i=0;i<8;i++)if(design.slots[i]>=0){const source=design.slots[i];if(source>i)throw Error('只能反射本层或更低层的快照');score+=(source+1)*(i>=design.critical?1.25+.18*design.critical:1);used.add(source);}score+=used.size*2;return {score,summary:'反射 '+design.slots.filter(n=>n>=0).length+' 槽 · 临界点 '+(design.critical+11)+' · '+(design.choice?'AC 开启':'AC 关闭'),choice:design.choice};}
function legacyDesign(design){const allowed=['CH','notCH','diamond','MA','VL','measurable','natural','highlife','ternary','fixed'];if(!Array.isArray(design.carry)||design.carry.length>3||new Set(design.carry).size!==design.carry.length||design.carry.some(x=>!allowed.includes(x)))throw Error('最多选择三个不同遗产');const u=universe(design.carry.filter(x=>PROPOSITIONS.some(p=>p[0]===x)));if(!u.valid)throw Error('遗产命题相互冲突');return {score:1+design.carry.length*3,summary:'封存 '+design.carry.length+' 项相容遗产',valid:true};}
const TITLES={12:'Veblen 布线',13:'Kruskal 森林',14:'投影前排序',15:'生命种子',16:'停机程序',17:'非停机证书',18:'相容宇宙',19:'反射之塔',20:'轮回遗产'};
function puzzle(era,id){int(era,12,20);int(id,0,23);const group=id%8,variant=Math.floor(id/8),p={id,name:TITLES[era]+' '+String(id+1).padStart(2,'0'),era,seed:1907+id*73,target:0};let d;
  if(era===12){const board=Array(64).fill('.'),row=5-(group%3),col=2+(group%3);board[row*8+col-1]=String(1+variant);board[(row-1)*8+col]=group%2?'E':'w';board[row*8+col]='p';if(group>=3)board[(row+1)*8+col+1]='p';if(group>=6)board[7*8+7]='f';d={board,feedback:2};p.target=wire(board).value;p.goal='拼出 '+vfmt(p.target);}
  if(era===13){const colors=1+group%3,soil=variant,sequence=[];for(let c=0;c<colors;c++){const n=Math.min(6,sequence.length+1+soil);for(let k=n;k>=1;k--)sequence.push(group%2&&k>2?star(k,c):chain(k,c));}d={sequence,colors,soil};p.target=sequence.length;p.goal=colors+' 色 / 土壤 '+soil+'：栽种至少 '+p.target+' 棵合法树';}
  if(era===14){const cards=Array.from({length:6},(_,i)=>{const a=Array(6).fill(0);a[Math.floor(i/2)+group%2]=1+i%2;a[0]+=variant;return a;}),random=rng(p.seed);for(let i=cards.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}p.cards=cards;const order=cards.map((_,i)=>i).sort((a,b)=>polyCompare(cards[a],cards[b]));d={order};p.goal='按投影前 Ω 多项式从小到大排序（不比较任意 ψ）';}
  if(era===15){const name=Object.keys(PATTERNS)[group],cells=PATTERNS[name].map(([x,y])=>variant===1?[y,x]:variant===2?[-x,y]:[x,y]);d={cells,rule:name==='replicator'?'B36/S23':'B3/S23',steps:name==='diehard'?140:40+variant*20};const r=drain(lifeJob(d));p.target=Math.max(0,r.population);p.budget=cells.length;p.rule=d.rule;p.steps=d.steps;p.period=r.period;p.goal='≤ '+p.budget+' 初始细胞 · '+p.steps+' 代后'+(p.target?'存活 ≥ '+p.target:'全部消亡')+(p.period?' · 周期 '+p.period:'');}
  if(era===16){const n=2+group%3,m=clone(CHAMPIONS[n]);if(variant){for(let k=0;k<m.table.length;k++)m.table[k]=m.table[k].replace('L','x').replace('R','L').replace('x','R');}d={machine:m,budget:n===4?1000:100};p.target={2:6,3:21,4:107}[n];p.states=n;p.goal=n+' 状态二符号：停机步数 ≥ '+p.target+(variant===2?'，至多 '+p.target+' 步':'');p.maxSteps=variant===2?p.target:1000;}
  if(era===17){const machines=[{states:2,symbols:2,table:['0RB','1RH','0LA','1LB']},{states:2,symbols:2,table:['0RB','1RH','0RA','1LB']},{states:3,symbols:2,table:['0RB','1RH','0RC','1LA','0RA','1LB']}],machine=clone(machines[group%3]),period=machine.states,start=variant;const translation=group%3===0?0:period;d={machine,modules:['cycle','translation','reach'],budget:200,certificate:{start,period,translation}};p.machine=machine;p.goal='提交完整纸带可重放的周期/平移非停机证书';}
  if(era===18){const data=constraints(p.seed),grid=Array(64).fill(-1);let met=Array(24).fill(false);while(met.some(x=>!x)){let best=-1,count=0;for(let i=0;i<64;i++)if(grid[i]===-1){const n=data.clauses.filter((cl,k)=>!met[k]&&cl.some(([j,b])=>j===i&&b===data.witness[i])).length;if(n>count){count=n;best=i;}}if(best<0)break;grid[best]=data.witness[best];met=data.clauses.map(cl=>cl.some(([i,b])=>grid[i]===b));}d={grid,selected:group%3===0?['MA','notCH']:group%3===1?['VL']:['CH']};p.goal='构造相容宇宙，满足 24 条有限覆盖约束';}
  if(era===19){const slots=Array.from({length:8},(_,i)=>i),critical=group%4;d={slots,critical,choice:variant!==2};p.target=55-variant*2;p.goal='反射得分 ≥ '+p.target+(variant===2?'，关闭 AC':'');p.noChoice=variant===2;}
  if(era===20){const choices=[['MA','natural','fixed'],['notCH','highlife','ternary'],['CH','diamond','natural'],['VL','fixed','highlife']];d={carry:choices[group%4].slice(0,variant+1)};p.target=variant+1;p.goal='封存 '+p.target+' 个相容遗产';}
  p.solution=d;return p;
}
const cache=new Map();function puzzles(era){if(!cache.has(era))cache.set(era,Array.from({length:24},(_,id)=>puzzle(era,id)));return cache.get(era);}
function empty(era,id=0){const p=puzzles(era)[id];if(era===12)return {board:Array(64).fill('.'),feedback:2};if(era===13)return {sequence:[],colors:p.solution.colors,soil:p.solution.soil};if(era===14)return {order:[0,1,2,3,4,5]};if(era===15)return {cells:[],rule:p.rule,steps:p.steps};if(era===16)return {machine:{states:p.states,symbols:2,table:Array.from({length:p.states*2},(_,i)=>i===p.states*2-1?'1RH':'0RA')},budget:1000};if(era===17)return {machine:clone(p.machine),modules:['cycle','translation','reach'],budget:200,certificate:{start:0,period:1,translation:0}};if(era===18)return {grid:Array(64).fill(-1),selected:['MA','notCH']};if(era===19)return {slots:Array(8).fill(-1),critical:0,choice:!p.noChoice};return {carry:[]};}
function* evaluateJob(era,design,id=0,options={}){bounded(design);const p=puzzles(era)[int(id,0,23)];let r;
  if(era===12){r=wire(design.board,{feedback:design.feedback||2,...options});r.valid=vcmp(r.value,p.target)===0;if(options.noloops&&r.loops||options.maxnodes&&r.nodes>options.maxnodes)r.valid=false;}
  if(era===13){if(design.colors!==p.solution.colors||design.soil!==p.solution.soil)throw Error('颜色或土壤与题目不一致');r=forest(design.sequence,{colors:design.colors,soil:design.soil,...options});r.valid=r.score>=(options.even?1:p.target);if(options.mono&&new Set(design.sequence.flatMap(function colors(t){return [t.c,...t.ch.flatMap(colors)];})).size>1)r.valid=false;}
  if(era===14){if(!Array.isArray(design.order)||design.order.length!==6||new Set(design.order).size!==6)throw Error('排序需要六张不同的卡');design.order.forEach(n=>int(n,0,5));const inverted=[];for(let i=1;i<6;i++)if(polyCompare(p.cards[design.order[i-1]],p.cards[design.order[i]])*(options.reverse?-1:1)>0)inverted.push(i);r={valid:!inverted.length,score:6-inverted.length,inverted,summary:inverted.length?'第 '+inverted.join('、')+' 对顺序颠倒':'投影前多项式顺序正确'};}
  if(era===15){if(design.rule!==p.rule||design.steps!==p.steps||design.cells.length>p.budget)throw Error('种子规则、代数或细胞数不满足题目');if(options.symmetric){const set=new Set(design.cells.map(c=>c.join(',')));const sum=design.cells.length?Math.min(...design.cells.map(p=>p[0]))+Math.max(...design.cells.map(p=>p[0])):0;if(design.cells.some(([x,y])=>!set.has((sum-x)+','+y)))throw Error('对称挑战要求左右对称');}
    r=yield* lifeJob(design,options);r.valid=design.cells.length>0&&(p.target?r.population>=p.target:r.population===0)&&(!p.period||r.period===p.period);if(options.nogliders&&r.shift.some(Boolean))r.valid=false;if(options.deadline&&(!r.period||r.firstRepeat>100))r.valid=false;
  }
  if(era===16){if(design.machine.states!==p.states||design.machine.symbols!==2)throw Error('状态数或符号数与题目不符');if(options.writeone&&design.machine.table.some(t=>t[0]!=='1'))throw Error('只写 1 挑战');if(options.mirror&&design.machine.table[0][1]!=='L')throw Error('镜像挑战从向左移动开始');r=yield* machineJob({...design,budget:Math.min(p.maxSteps,design.budget,options.limited?50:100000000)});r.valid=r.halted&&r.steps>=p.target;}
  if(era===17){if(JSON.stringify(design.machine)!==JSON.stringify(p.machine))throw Error('证书必须对应本题机器');const c=design.certificate;if(!c)throw Error('请填写证书');r={certificate:certify(design.machine,c.start,c.period,c.translation),valid:true,score:20/(1+c.period),summary:'非停机证书已逐步重放验证'};if(options.nocycle&&c.translation===0)throw Error('当前挑战禁用零平移循环证书');}
  if(era===18){r=forcing(design,p.seed);r.valid=r.coverage===24;if(options.minimal&&design.selected.length!==1)r.valid=false;if(options.vl&&!r.closure.includes('VL'))r.valid=false;if(options.maximal){for(const [name]of PROPOSITIONS)if(!r.closure.includes(name)&&universe([...design.selected,name]).valid)r.valid=false;}}
  if(era===19){r=reflection(design);r.valid=r.score>=(options.single?10:options.small?18:p.target)&&(!p.noChoice||!design.choice);if(options.nochoice&&design.choice)r.valid=false;if(options.single&&design.slots.filter(x=>x>=0).length>1)r.valid=false;if(options.small&&design.slots.slice(3).some(x=>x>=0))r.valid=false;if(options.lock&&design.critical!==0)r.valid=false;}
  if(era===20){r=legacyDesign(design);r.valid=design.carry.length===(options.zero?0:p.target);}
  return r;
}
function drain(g){let v;do{v=g.next();}while(!v.done);return v.value;}
function* solveJob(era,id=0,options={}){const p=puzzles(era)[id];let design=clone(p.solution);if(era===12){const candidates=[];for(let i=0;i<24;i++)candidates.push(clone(puzzles(era)[i].solution));for(let i=0;i<candidates.length;i++){const r=yield* evaluateJob(era,candidates[i],id,options);yield {tested:i+1};if(r.valid)return {design:candidates[i],report:r,tested:i+1};}}
  const r=yield* evaluateJob(era,design,id,options);return {design,report:r,tested:1};}
function* soupJob(options={}){const random=rng(options.seed||1),tries=int(options.tries||16,1,128),steps=int(options.steps||100,1,1000);let best=null;for(let i=0;i<tries;i++){const cells=[];for(let y=0;y<8;y++)for(let x=0;x<8;x++)if(random()<.35)cells.push([x,y]);const design={cells,steps,rule:'B3/S23'},report=yield* lifeJob(design);if(!best||report.score>best.report.score)best={design,report};yield {tested:i+1,best:best.report.score};}return best;}
return {clone,int,rng,bounded,vcmp,vphi,vfmt,vcheck,wire,leaf,chain,star,treeCheck,treeSize,embeds,forest,polyCompare,polyFmt,taggedCut,PATTERNS,cellsCheck,lifeStep,lifeJob,CHAMPIONS,machineCheck,machineInit,machineStep,config,machineJob,enumerateJob,certify,reachesHalt,classifyJob,PROPOSITIONS,IMPLICATIONS,universe,constraints,forcing,CARDINALS,reflection,legacyDesign,puzzles,empty,evaluateJob,solveJob,soupJob,drain};
}
root.HT.LateMath=kernel();root.HT.LateMath.kernelSource=kernel.toString();
})(typeof self!=='undefined'?self:this);
