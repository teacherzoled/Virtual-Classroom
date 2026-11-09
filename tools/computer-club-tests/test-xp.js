const { createGas } = require('./gas-mock'); const assert = require('assert');
const G = createGas(require('path').join(__dirname, '../../backend/Computer-Club-Backend.gs'), { API_KEY: 'k', SESSION_SECRET: 's', TEACHER_CODE: 'T' });
G.setupSheet(); const S = G.sheets;
[['Ana R.',4,'1111'],['Ben T.',6,'2222'],['Cy M.',5,'3333'],['Di P.',4,'4444']].forEach(r=>S.Students.appendRow(['',r[0],r[0],r[1],r[2],'']));
G.prepareRoster();
const P = b => G.post(Object.assign({ key: 'k' }, b));
P({action:'set-session',teacher_code:'T',club_code:'GO1',week:1,mission:'Shortcut Ninja'});
P({action:'set-access',teacher_code:'T',mission_id:'shortcut-ninja',mission_open:true});
const tok = {}; [['cc001','1111'],['cc002','2222'],['cc003','3333']].forEach(([id,pin])=>tok[id]=P({action:'signin',club_code:'GO1',student_id:id,pin}).token);
// Ana: 6 bronze rounds of 3 stars (20 each) -> capped 60; plus gold 10 then 14 (PB +10)
for (let i=0;i<6;i++) P({action:'save-result',token:tok.cc001,attempt_id:'b'+i,mission_id:'shortcut-ninja',level:'bronze',score:10,max_score:10,stars:3});
P({action:'save-result',token:tok.cc001,attempt_id:'g1',mission_id:'shortcut-ninja',level:'gold',score:10,stars:1});
P({action:'save-result',token:tok.cc001,attempt_id:'g2',mission_id:'shortcut-ninja',level:'gold',score:14,stars:2});
// Ana typing: 7 tests -> capped 25; first 12 wpm then 18 (PB), 16, 20 (PB), 30 at 80% (no PB)
[[12,95],[18,95],[16,95],[20,92],[30,80],[10,90],[11,90]].forEach((t,i)=>P({action:'save-typing',token:tok.cc001,attempt_id:'t'+i,level:'bronze',duration_s:60,wpm:t[0],accuracy:t[1]}));
// Ben: typing 30 at 95
P({action:'save-typing',token:tok.cc002,attempt_id:'bt1',level:'gold',duration_s:120,wpm:30,accuracy:95});
let st = P({action:'standings',token:tok.cc001}); console.log(JSON.stringify(st.me));
// Ana: attend 10 + missions 60 (cap) + typing 25 (cap) + bests: gold PB 10 + typing PB 18,20 = 20 => 30 + badges: ninja + typing-15 = 50
assert.equal(st.me.parts.attend,10); assert.equal(st.me.parts.missions,60); assert.equal(st.me.parts.typing,25);
assert.equal(st.me.parts.bests,20, 'typing PB once a day + gold PB once a day'); assert.equal(st.me.parts.badges,50); assert.equal(st.me.xp,165);
assert.equal(st.me.level,2); assert.equal(st.me.level_name,'Explorer'); assert.equal(st.me.into_level,65); assert.equal(st.me.rank,1); assert.equal(st.me.ahead,null);
let sb = P({action:'standings',token:tok.cc002}); console.log('ben', JSON.stringify(sb.me));
// Ben: attend 10 + typing 5 + badges typing-15 & typing-25 = 50 -> 65
assert.equal(sb.me.xp,65); assert.equal(sb.me.rank,2); assert.equal(sb.me.ahead.name,'Ana R.'); assert.equal(sb.me.ahead.gap,100);
let sc = P({action:'standings',token:tok.cc003}); assert.equal(sc.me.xp,10); assert.equal(sc.me.rank,3);
console.log('top', JSON.stringify(st.top)); assert.ok(!('parts' in st.top[0]) && !('id' in st.top[0]));
console.log('improved', JSON.stringify(st.most_improved)); assert.equal(st.most_improved[0].value, 8);
console.log('fastest', JSON.stringify(st.fastest_by_standard));
console.log('battle', JSON.stringify(st.battle));
// Std4 avg: Ana 165 + Di 0 / 2 = 83 (82.5 -> 83); Std6 65; Std5 10
assert.deepEqual(st.battle.map(b=>b.standard),[4,6,5]); assert.equal(st.battle[0].avg,83);
// cache: new row clears cache -> immediate update
P({action:'save-typing',token:tok.cc003,attempt_id:'ct1',level:'bronze',duration_s:60,wpm:8,accuracy:90});
assert.equal(P({action:'standings',token:tok.cc003}).me.xp,15);
// ties share rank
let ts = P({action:'teacher-standings',teacher_code:'T'}); console.log('teacher', ts.ranking.map(r=>r.rank+':'+r.name+':'+r.xp).join(' '));
assert.equal(P({action:'teacher-standings',teacher_code:'x'}).ok,false);
assert.equal(P({action:'standings',token:'bad'}).ok,false);
console.log('rules', st.xp_rules);
// Sandbagging: Cy plays Gold 1,2,3…10 and types 5,6,7…12 WPM at 95% on one day -> one +10 each, not 9 and 7
for (let i=1;i<=10;i++) P({action:'save-result',token:tok.cc003,attempt_id:'sg'+i,mission_id:'shortcut-ninja',level:'gold',score:i,stars:1});
for (let w=5;w<=12;w++) P({action:'save-typing',token:tok.cc003,attempt_id:'sw'+w,level:'bronze',duration_s:60,wpm:w,accuracy:95});
let cy = P({action:'standings',token:tok.cc003}).me; console.log('sandbagger parts', JSON.stringify(cy.parts));
assert.equal(cy.parts.bests, 20, 'only one gold PB bonus and one typing PB bonus in a day');
console.log('XP TESTS PASSED');
