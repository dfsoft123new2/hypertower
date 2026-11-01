const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base='D:/hypertower-recovery-20261026',out=path.join(base,'walkthrough-work-20261101');fs.mkdirSync(out,{recursive:true});
const {H,G}=require(path.join(base,'hypertower/tests/gr-helper.cjs')).engine(),K=H.LateMath;
const records=[];
for(let era=11;era<=20;era++)for(const p of era===11?H.Hydra.PUZZLES:K.puzzles(era)){
 const report=era===11?H.Hydra.replay(p.tree,p.solution):H.Late.evaluate(era,p.solution,p.id,-1);
 assert(era===11?report.dead:report.valid,'reference invalid '+era+':'+p.id);
 const record={era,number:p.id+1,name:p.name,goal:p.goal||({kill:'在预算内屠蛇，三星以最少刀数为准',exact:'恰好指定刀数屠蛇',reward:'达到蛇鳞目标并屠蛇'}[p.kind]),puzzle:p,report};
 if(era===11)record.recipe='从本题初始树重新开始；每刀按当前树的从左向右子节点编号选择路径（本清单为1起）：'+p.solution.map(a=>a.map(i=>i+1).join('.')).join(' → ')+'。共'+report.cuts+'刀，蛇鳞'+report.reward+'；必须确认蛇已死亡后提交。';
 if(era===12)record.recipe='先清空8×8布线，再放置'+p.solution.board.flatMap((v,i)=>v==='.'?[]:['第'+(Math.floor(i/8)+1)+'行第'+(i%8+1)+'列='+({'p':'φ','w':'ω','E':'ε₀','f':'反馈'}[v]||v)]).join('；')+'。其余格保持导线，反馈迭代选择'+p.solution.feedback+'。输出应为'+report.summary+'。';
 if(era===13){const f=t=>'色'+(t.c+1)+(t.ch.length?'['+t.ch.map(f).join('、')+']':'叶');record.recipe='颜色数'+p.solution.colors+'、土壤'+p.solution.soil+'；从空森林依次栽种：'+p.solution.sequence.map(f).join(' → ')+'。检查每一步的下一棵节点预算和既有树嵌入，最终'+report.summary+'。';}
 if(era===14)record.recipe='把题目初始的六张牌分别记为原位1–6，目标顺序为 '+p.solution.order.map(i=>i+1).join(' → ')+'；对应多项式 '+p.solution.order.map(i=>K.polyFmt(p.cards[i])).join(' < ')+'。用↑/↓调整，牌的原始编号不是排序后位置；完整顺序正确后验证并提交。';
 if(era===15){const minX=Math.min(...p.solution.cells.map(c=>c[0])),minY=Math.min(...p.solution.cells.map(c=>c[1]));const cells=p.solution.cells.map(([x,y])=>[x-minX,y-minY]);const translated={...p.solution,cells};const check=H.Late.evaluate(era,translated,p.id,-1);assert(check.valid);record.manualSolution=translated;record.recipe='清空种子后按1起行列点亮 '+cells.map(([x,y])=>'r'+(y+1)+'c'+(x+1)).join('、')+'；规则 '+p.solution.rule+'，提交验证代数必须为 '+p.solution.steps+'。完成后应显示存活'+report.population+'、周期'+report.period+'、平移('+report.shift.join(',')+')'+(report.extinct?'、首次消亡第'+report.extinct+'代':'')+'。整体平移不影响本题结果。';}
 if(era===16)record.recipe='先点击 BB('+p.solution.machine.states+') 冠军预设载入整张合法表；若本题为镜像变体，再逐格交换L/R而不移动H格。核对'+p.solution.machine.states+'状态、二符号表，按 A读0/A读1/B读0/B读1…应为 '+p.solution.machine.table.join(' / ')+'；运行预算至少'+p.target+'（参考'+p.solution.budget+'）。从空白纸带A态重跑，结果应为停机'+report.steps+'步、'+report.ones+'个1。先验证本题，再提交，单独运行机器不会自动给谜题星。';
 if(era===17)record.recipe='机器必须保持本题表 '+p.solution.machine.table.join(' / ')+'；填起点 '+p.solution.certificate.start+'、周期 '+p.solution.certificate.period+'、平移 '+p.solution.certificate.translation+'；判定流水线可依次用完整配置循环、平移循环、静态可达性，预算200。点击验证设计，证书重放通过后提交；不要把预算内未停机当成证书。';
 if(era===18)record.recipe='选中 '+p.solution.selected.join(' + ')+'；清空8×8条件网后逐格填写 '+p.solution.grid.flatMap((v,i)=>v<0?[]:['r'+(Math.floor(i/8)+1)+'c'+(i%8+1)+'='+v]).join('、')+'，其余格不填。每格先选“填0/填1”模式再点；闭包必须相容且覆盖24/24，验证并提交后宇宙才生效。';
 if(era===19)record.recipe='八个反射层依次选择本层来源（第1层→第1层，直至第8层→第8层），临界点κ输入 '+p.solution.critical+'（界面原始0起值），AC '+(p.solution.choice?'保持开启':'关闭')+'。验证反射得分'+report.score+'，需≥'+p.target+'；若当前已经越过Kunen墙，不可重新开启AC；前16题并不硬要求AC开启，可保留关闭状态手工提交，后8题则明确要求关闭。';
 if(era===20)record.recipe='先取消全部遗产勾选，再只选 '+p.solution.carry.join(' + ')+'；共'+p.target+'项。点验证设计确认相容，再提交封存。此题只保存遗产蓝图，点击“归一”才真正开始下一轮，两者不要混淆。';
 records.push(record);
}
fs.writeFileSync(path.join(out,'puzzles-p2.json'),JSON.stringify({count:records.length,allReferenceSolutionsValidated:true,coordinateConvention:'描述中的行列与树子节点为1起；XIX输入κ保留界面0起；machine table按状态再按读入排列',records},null,2));
const imgs=JSON.parse(fs.readFileSync(path.join(base,'箭塔-完整介绍配图-20261101/配图清单.json'),'utf8'));console.log(JSON.stringify({validated:records.length,examples:records.filter(r=>r.number===1).map(r=>({era:r.era,recipe:r.recipe})),figures:imgs.filter(i=>['XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'].includes(i.era)).map(i=>({number:i.number,title:i.title}))},null,2));


