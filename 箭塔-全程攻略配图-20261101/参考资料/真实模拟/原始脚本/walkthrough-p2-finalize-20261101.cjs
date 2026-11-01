const fs=require('node:fs');
const dir='D:/hypertower-recovery-20261026/walkthrough-work-20261101';
let core=fs.readFileSync(dir+'/p2-core.md','utf8').replace(/^\uFEFF/,'');
core=core.replace('无选择要求 AC 关闭；单反射只许一个非空槽，目标降为 10，可尝试第 8 层反射本层并 κ=0，得分 12，足够基准；临界锁定要求 κ=0；小宇宙只许前三层，目标 18，可用前三层各反射本层、κ=2 得分约 13.83并不足，需要根据验证报告改进，不能把任意三槽填满就称已通过。实际选择适配题与合法来源后再核验，不在攻略中冒报未通过方案。','无选择要求 AC 关闭；单反射只许一个非空槽，目标降为 10，第 8 层反射本层并 κ=0 得分 12，可以作为基准；临界锁定要求 κ=0。小宇宙只许前三层而目标为 18，当前规则下确实不可达：穷举全部 192 种合法来源与 κ 组合，最高仅 14.15（前三层各反射本层、κ=1）。这是当前可选挑战的版本缺口，继续等待、换 AC 或堆研究不会改变这份评分上界；不影响普通 24 题、720 星和 XXI 入口。后面的挑战实操给出核验说明。');
core=core.replace('单下标和标签限制主要针对适用的实验/题目，不要在与限制无关的排序卡上凭空添加不存在的参数。','当前排序提交未把单下标、ω 禁令的文案完整接入额外核验；正确普通排序仍可通过这两项。不要在固定六牌编辑器里寻找不存在的删牌功能；后面的挑战实操会区分规则描述与已执行检查。');
core=core.replace('盲停隐藏提示而不改真正 H 规则','盲停的面板描述为隐藏停机提示，当前机器表仍可见 H；真正的合法表规则不变');
core=core.replace('半图隐藏部分纸带显示，不降低完整证据要求','半图的规则文案指向部分纸带预览，当前实际显示以页面为准，完整证据要求不降低');
core=core.replace('<!-- capture: XIX关闭AC前固定规则、关闭确认、I0越墙、开发者回退说明 -->','<!-- capture: ac-before -->\n<!-- capture: ac-after -->');
core=core.replace('<!-- figure: intro-96 -->','<!-- figure: intro-96 -->\n<!-- capture: normalize-before -->\n<!-- capture: normalize-after -->');
core=core.replace('<!-- figure: intro-99 -->','<!-- figure: intro-99 -->\n<!-- capture: split-entry -->');
for(let era=12;era<=20;era++){
 const roman=['XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'][era-12],begin=core.indexOf('## '+roman+' · '),end=core.indexOf('\n## ',begin+5);
 let section=core.slice(begin,end<0?undefined:end);
 const pos=section.indexOf('### 实例 A');
 if(pos>=0)section=section.slice(0,pos)+'<!-- capture: puzzle-'+era+'-draft -->\n\n'+section.slice(pos);
 const before=section.indexOf('### 实例 B');
 if(before>=0)section=section.slice(0,before)+'<!-- capture: puzzle-'+era+'-submitted -->\n\n'+section.slice(before);
 core=core.slice(0,begin)+section+(end<0?'':core.slice(end));
}
let practice=fs.readFileSync(dir+'/p2-practice.md','utf8').replace(/^\uFEFF/,'').replace(/\n<!-- capture: puzzle-\d+-(draft|submitted) -->/g,'');
fs.writeFileSync(dir+'/p2-core.md',core);
fs.writeFileSync(dir+'/p2.md',core.trim()+'\n\n'+practice.trim()+'\n');
const db=JSON.parse(fs.readFileSync(dir+'/puzzles-p2.json','utf8'));
db.referenceProvenance={description:'从当前游戏有限内核公开的固定题目与参考结构提取，逐题重新执行验证；recipe为玩家可读的操作说明，非修改存档。',files:['src/hydra.js','src/late-math.js','src/late-eras.js']};
for(const record of db.records){
 record.source=record.era===11?'src/hydra.js:PUZZLES':'src/late-math.js:puzzle';
 if(record.era===12&&record.number>=17)record.uiNote='当前调色板缺数字3，见XII正文的正式共享蓝图导入说明；不可宣称能仅靠现有调色板从空盘画完。';
 if(record.era===19)record.recipe=record.recipe.replace('AC 保持开启。','AC 开启或关闭均可；若已经越墙必须保持关闭。');
}
fs.writeFileSync(dir+'/puzzles-p2.json',JSON.stringify(db,null,2));
let appendix='## P2 附录：XI–XX全部240题逐题操作清单\n\n本附录与网页版可搜索答案库为同一批核验数据。每条给出当前题目目标、可手动复现的配方和验证结果；不是游戏存档，不会直接发资源、轮数或成就。正文先解释操作与限制，首次游玩建议先读对应纪元，再查题号。\n\n';
for(let era=11;era<=20;era++){
 const roman=['XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'][era-11];
 appendix+='### '+roman+' · 24题施工表\n\n';
 for(const r of db.records.filter(r=>r.era===era)){
  appendix+='#### '+roman+'-'+String(r.number).padStart(2,'0')+' '+r.name+'\n\n目标：'+r.goal+'。\n\n操作：'+r.recipe+'\n\n';
  if(r.uiNote)appendix+='界面限制：'+r.uiNote+'\n\n';
  appendix+='核验：'+(r.report.summary||'蛇已死亡；'+r.report.cuts+'刀、基础蛇鳞'+r.report.reward)+'。\n\n';
 }
}
fs.writeFileSync(dir+'/p2-puzzle-recipes.md',appendix);
const sources=[
 ['XI入口、研究与挑战','src/era11.js',27,'X gate当前X、meta.started、bestRank=15、bestEpsilon≥10；XI研究cap8/8/6/3/1/8'],
 ['XI斩头与奖励','src/hydra.js',1,'标准有限树重放；深度平方奖励；按当前刀数再生'],
 ['XII–XX跨纪元门槛','src/late-eras.js',25,'XVIII→XIX需24覆盖且相容闭包MA/notCH，XIX→XX要求AC=false'],
 ['研究速度与星级','src/late-eras.js',47,'遗产倍率上限4000；星级研究加成只取前24；质量加星项上限3'],
 ['结晶与费用','src/late-eras.js',53,'yieldRate；费用8*2.3^up，每项cap6；领取需runAge≥60'],
 ['手动/辅助星级','src/late-eras.js',75,'XII–XX aided?2:3，保存时重验；PFA和速通另有状态条件'],
 ['挑战研究与层数','src/late-eras.js',87,'当前trial对应活动蓝图+harvest累计；阈值8/16/24，达标退出当前挑战'],
 ['AC与开发者回退','src/late-eras.js',105,'Reinhardt后不能普通开启AC；本机精确快照与旧档回I0区分'],
 ['归一与重建','src/late-eras.js',137,'XX complete且AC关闭；收益floor(36000/max(60,轮秒))+1；保留蓝图档案成就规则'],
 ['XII调色板缺3','src/late-ui.js',41,'内核允许0/1/2/3/w/E/p/f，调色板只含1/2常数；17–24共享方案说明'],
 ['正式导入与载入','src/late-ui.js',109,'载入沙盒依据蓝图source决定辅助标记；使用公开导入验证，未改玩家标记'],
 ['有限题目与评价','src/late-math.js',131,'每纪元24题，8组×3变体；1起玩家操作由提取器转换'],
 ['XIX反射评分','src/late-math.js',128,'每层来源≤本层，倍率与κ相关，不同来源每种+2'],
 ['XIX小宇宙硬限制','src/late-math.js',155,'前三槽非空，目标18，192种合法组合最高14.15，当前不可达'],
 ['XIV部分挑战限制未接入','src/late-math.js',148,'当前排序评价只以reverse改变排序；singleOmega/noomega未接额外排序检查'],
 ['XV周期时间字段','src/late-math.js',62,'完整归一配置重复；firstRepeat记录重复片段旧起点p.g，当前deadline检查此字段≤100'],
 ['XVII提交证书','src/late-math.js',152,'完整纸带重放，不把预算耗尽判为非停机；nocycle要求非零translation'],
 ['工坊分组与单手','src/systems.js',65,'同组第一命中规则；XX challenge2暂停工坊'],
 ['XXI入口硬条件','src/gr-core.js',60,'当前XX完成、round≥10、XI–XX每题3星、无p3；240题×3=720']
].map(([topic,file,line,verified])=>({topic,file,line,verified}));
const ch=JSON.parse(fs.readFileSync(dir+'/challenges-p2-verified.json','utf8'));
const evidence={scope:'XI–XX、归一、720星、XX→XXI；只读内核核验与独立攻略文件，无游戏源码或玩家存档改动',bodyCharacters:fs.readFileSync(dir+'/p2.md','utf8').length,appendixCharacters:appendix.length,sources,validation:{fixedPuzzles:240,allReferenceSolutionsPassed:true,lifeManualTranslatedSolutionsPassed:24,xiiExternalSharedDesigns:8,xiiSharedImportThenUISubmitStars:3,challengeDesignsAccepted:ch.cases.filter(c=>c.report?.valid).length,challengeNote:'设计级核验，不冒称已在真实存档等待完每个挑战的三层；XX速通需额外本轮≤7200秒，PFA与AC另受状态约束',smallUniverse:ch.small},limitations:[{era:12,type:'UI missing palette item',text:'17–24题参考构型含数字3，当前调色板缺3；提供8份另行写出的可核验外部共享HTB5，正式导入后提交，不伪改辅助标记。'},{era:14,type:'Challenge partial implementation',text:'singleOmega/noomega文案未在排序评价中接入额外限制；普通正确排序当前能过。'},{era:19,type:'Unreachable optional challenge',text:'小宇宙最高14.15低于18，192组合全检，无合法通过设计；不影响主线/全星/XXI。'}],captureSuggestions:[{id:'puzzle-12-draft至puzzle-20-submitted',purpose:'各纪元第1题空白与手工提交后主线+沙盒对照',api:'H.Late.loadPuzzle / validate / submit；使用隔离演示存档'},{id:'ac-before/ac-after',purpose:'固定策略、关闭AC前后状态、不可重开边界',api:'H.Late.setChoice'},{id:'normalize-before/normalize-after',purpose:'归一前carry核对与历史重建后的XI',api:'H.Late.normalize / H.tick'},{id:'split-entry',purpose:'XX当前完成、十次归一、720星与正式XXI按钮',api:'H.GR.gate21'}]};
fs.writeFileSync(dir+'/evidence-p2.json',JSON.stringify(evidence,null,2));
console.log(JSON.stringify({p2Characters:evidence.bodyCharacters,appendixCharacters:evidence.appendixCharacters,all240Validated:db.allReferenceSolutionsValidated,challengeAccepted:evidence.validation.challengeDesignsAccepted,smallMax:ch.small.max.score,files:['p2.md','p2-puzzle-recipes.md','puzzles-p2.json','evidence-p2.json','challenges-p2-verified.json']},null,2));
