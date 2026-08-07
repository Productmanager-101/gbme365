
const KEY = "gbme365-state-v3";
const todayISO = () => new Date().toISOString().slice(0,10);
const $ = s => document.querySelector(s);

const baseState = {
  done:{},
  starred:{d1s1:true,d1s2:true},
  reviews:{},
  custom:[],
  recordings:{},
  settings:{rate:.88}
};

let state = load();
let page = "today";

function load(){
  try{
    return {...baseState,...JSON.parse(localStorage.getItem(KEY)||"{}")};
  }catch(e){return structuredClone(baseState)}
}
function save(){ localStorage.setItem(KEY,JSON.stringify(state)); }

function allSentences(){
  const arr=[];
  for(const d of GBME_CONTENT.days){
    for(const s of d.sentences) arr.push({...s,day:d.day,date:d.date});
  }
  return [...arr,...state.custom];
}
function sentenceById(id){ return allSentences().find(x=>x.id===id); }

function scheduleReview(id){
  const now = new Date();
  const offsets=[1,3,7,30];
  const existing=state.reviews[id]||{stage:0,next:todayISO()};
  const stage=Math.min(existing.stage+1,offsets.length-1);
  const d=new Date(now);
  d.setDate(d.getDate()+offsets[stage]);
  state.reviews[id]={stage,next:d.toISOString().slice(0,10),last:todayISO()};
}

function toggleDone(id){
  state.done[id]=!state.done[id];
  if(state.done[id]) scheduleReview(id);
  save();render();
}
function toggleStar(id){ state.starred[id]=!state.starred[id];save();render(); }

function dueReviewItems(){
  const all=allSentences();
  const due=[];
  for(const s of all){
    const r=state.reviews[s.id];
    if(r && r.next<=todayISO()) due.push({...s,review:r});
    else if(state.starred[s.id] && !state.done[s.id]) due.push({...s,review:{stage:0,next:todayISO()}});
  }
  return due;
}

function speakText(text){
  // iOS Safari can be inconsistent; user gesture + resume/cancel improves reliability.
  if(!("speechSynthesis" in window)){
    alert("이 브라우저는 음성 읽기를 지원하지 않아요.");
    return;
  }
  const synth=window.speechSynthesis;
  try{ synth.cancel(); synth.resume(); }catch(e){}
  const u=new SpeechSynthesisUtterance(text);
  const voices=synth.getVoices()||[];
  const v=voices.find(v=>/Samantha|Ava|Allison|Susan/i.test(v.name))
       || voices.find(v=>v.lang==="en-US")
       || voices.find(v=>/^en/i.test(v.lang));
  if(v) u.voice=v;
  u.lang=v?.lang||"en-US";
  u.rate=state.settings.rate||.88;
  u.pitch=1;u.volume=1;
  u.onerror=()=>alert("iPhone에서 TTS가 막힌 상태예요. 아래 '오디오 테스트'가 들리는지 먼저 확인해 주세요.");
  setTimeout(()=>synth.speak(u),80);
}

function audioTest(){
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    const ctx=new AC();
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.frequency.value=660;
    gain.gain.setValueAtTime(.2,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.35);
    osc.connect(gain);gain.connect(ctx.destination);
    osc.start();osc.stop(ctx.currentTime+.35);
  }catch(e){alert("오디오 테스트를 실행할 수 없어요.");}
}

let mediaRecorder=null, chunks=[], activeRecId=null;
async function startRecording(id){
  if(!navigator.mediaDevices?.getUserMedia){
    alert("이 브라우저에서는 녹음을 지원하지 않아요.");
    return;
  }
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    chunks=[];
    mediaRecorder=new MediaRecorder(stream);
    activeRecId=id;
    mediaRecorder.ondataavailable=e=>chunks.push(e.data);
    mediaRecorder.onstop=()=>{
      const blob=new Blob(chunks,{type:mediaRecorder.mimeType||"audio/mp4"});
      const reader=new FileReader();
      reader.onload=()=>{
        state.recordings[activeRecId]=reader.result;
        save();render();
      };
      reader.readAsDataURL(blob);
      stream.getTracks().forEach(t=>t.stop());
    };
    mediaRecorder.start();
    render();
  }catch(e){alert("마이크 권한을 허용해 주세요.");}
}
function stopRecording(){
  if(mediaRecorder && mediaRecorder.state!=="inactive") mediaRecorder.stop();
}

function sentenceCard(s, showReview=false){
  const done=!!state.done[s.id], starred=!!state.starred[s.id], rec=state.recordings[s.id];
  const review=state.reviews[s.id];
  return `<div class="card ${done?"done":""}">
    ${showReview?`<div class="reviewChip">Review ${review?["1일","3일","7일","30일"][review.stage]:"오늘"}</div>`:""}
    <div class="label">${done?"Completed":"Must Know"}</div>
    <div class="sentence">${esc(s.text)}</div>
    <div class="meaning">${esc(s.meaning||"")}</div>
    <div class="tags">${(s.tags||[]).map(t=>`<span class="tag">#${esc(t)}</span>`).join("")}</div>
    <div class="actions">
      <button class="btn ${done?"good":""}" onclick="toggleDone('${s.id}')">${done?"✓ 외움":"외웠어요"}</button>
      <button class="btn ${starred?"star":""}" onclick="toggleStar('${s.id}')">${starred?"★ 저장됨":"☆ 즐겨찾기"}</button>
      <button class="btn" onclick='speakText(${JSON.stringify(s.text)})'>🔊 듣기</button>
    </div>
    <div class="recorder">
      ${mediaRecorder && mediaRecorder.state==="recording" && activeRecId===s.id
        ? `<button class="btn danger" onclick="stopRecording()">■ 녹음 종료</button>`
        : `<button class="btn" onclick="startRecording('${s.id}')">🎙️ 내 발음 녹음</button>`}
    </div>
    ${rec?`<audio controls src="${rec}"></audio>`:""}
  </div>`;
}

function wordCard(w){
  return `<div class="card">
    <div class="wordtitle">${esc(w.word)}</div>
    <div class="wordmeaning">${esc(w.meaning)}</div>
    <div class="example">${esc(w.example)}</div>
    <div class="actions"><button class="btn" onclick='speakText(${JSON.stringify(w.word)})'>🔊 단어 듣기</button></div>
  </div>`;
}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}

function stats(){
  const all=allSentences();
  const done=all.filter(s=>state.done[s.id]).length;
  const star=all.filter(s=>state.starred[s.id]).length;
  const due=dueReviewItems().length;
  return {all:all.length,done,star,due,pct:all.length?Math.round(done/all.length*100):0};
}

function todayPage(){
  const day=GBME_CONTENT.days.find(d=>d.day===GBME_CONTENT.meta.currentDay)||GBME_CONTENT.days[0];
  const st=stats();
  return `
    <div class="hero">
      <div class="kicker">TODAY · DAY ${day.day}</div>
      <h2>${esc(day.focus)}</h2>
      <p>${esc(day.mission)}</p>
      <div class="stats">
        <div class="stat"><b>${st.done}/${st.all}</b><span>문장 완료</span></div>
        <div class="stat"><b>${st.star}</b><span>즐겨찾기</span></div>
        <div class="stat"><b>${st.due}</b><span>오늘 복습</span></div>
      </div>
    </div>
    <section class="section">
      <div class="sectionhead"><h3>오늘의 필수 문장</h3><span>말로 5번</span></div>
      <div class="grid">${day.sentences.slice(0,2).map(sentenceCard).join("")}</div>
    </section>
    <section class="section">
      <div class="sectionhead"><h3>오늘의 단어</h3><span>${day.words.length} words</span></div>
      <div class="grid two">${day.words.map(wordCard).join("")}</div>
    </section>
    <section class="section">
      <div class="card">
        <div class="label">Audio Check</div>
        <div class="sentence" style="font-size:17px">소리가 안 날 때 먼저 테스트</div>
        <div class="meaning">이 버튼은 TTS가 아니라 브라우저 자체에서 짧은 테스트음을 만들어냅니다. 이것도 안 들리면 iPhone 음량/출력 문제입니다.</div>
        <div class="actions"><button class="btn primary" onclick="audioTest()">🔈 오디오 테스트</button></div>
      </div>
    </section>`;
}

function libraryPage(){
  return `<section class="section" style="margin-top:0">
    <div class="sectionhead"><h3>Sentence Library</h3><span>${allSentences().length} sentences</span></div>
    <input class="search" id="q" placeholder="문장, 뜻, 태그 검색" oninput="renderLibrary()">
    <div id="lib"></div>
  </section>`;
}
function renderLibrary(){
  const q=($("#q")?.value||"").toLowerCase();
  const list=allSentences().filter(s=>(s.text+" "+s.meaning+" "+(s.tags||[]).join(" ")).toLowerCase().includes(q));
  $("#lib").innerHTML=list.length?`<div class="grid">${list.map(sentenceCard).join("")}</div>`:`<div class="empty">검색 결과가 없어요.</div>`;
}

function reviewPage(){
  const due=dueReviewItems();
  return `<section class="section" style="margin-top:0">
    <div class="sectionhead"><h3>Review</h3><span>1 · 3 · 7 · 30일</span></div>
    ${due.length?`<div class="grid">${due.map(s=>sentenceCard(s,true)).join("")}</div>`:`<div class="card empty">오늘 예정된 복습이 없어요 🎉</div>`}
  </section>`;
}

function progressPage(){
  const st=stats();
  const days=GBME_CONTENT.days.length;
  return `<section class="section" style="margin-top:0">
    <div class="sectionhead"><h3>Progress</h3><span>내 학습 현황</span></div>
    <div class="card">
      <div class="label">Completion</div>
      <div class="bigNum">${st.pct}%</div>
      <div class="progresswrap"><div class="progressbar" style="width:${st.pct}%"></div></div>
      <div class="notice">${st.done}개 완료 · ${st.all-st.done}개 남음 · 현재 콘텐츠 ${days}일분</div>
    </div>
    <div class="section">
      <div class="card">
        <div class="label">Pronunciation speed</div>
        <div class="sentence" style="font-size:17px">발음 속도 ${state.settings.rate||.88}×</div>
        <input type="range" min=".65" max="1.15" step=".05" value="${state.settings.rate||.88}" oninput="setRate(this.value)" style="width:100%">
        <div class="notice">iPhone TTS가 작동하는 경우 이 속도로 재생돼요.</div>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <div class="label">Backup</div>
        <div class="sentence" style="font-size:17px">학습 데이터 백업 / 복원</div>
        <div class="meaning">브라우저 데이터를 지워도 복원할 수 있게 JSON 파일로 저장할 수 있어요.</div>
        <div class="actions">
          <button class="btn primary" onclick="exportData()">백업 파일 저장</button>
          <label class="btn">복원 파일 선택<input type="file" accept=".json,application/json" onchange="importData(event)" hidden></label>
        </div>
      </div>
    </div>
  </section>`;
}

function addPage(){
  return `<section class="section" style="margin-top:0">
    <div class="sectionhead"><h3>Add</h3><span>실무에서 나온 표현 저장</span></div>
    <div class="card">
      <div class="form">
        <input id="newText" placeholder="영어 문장">
        <textarea id="newMeaning" placeholder="뜻 / 사용 맥락"></textarea>
        <input id="newTags" placeholder="태그 예: meeting, ppt, toxin">
        <button class="btn primary" onclick="addCustom()">문장 저장</button>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <div class="label">How updates work</div>
        <div class="sentence" style="font-size:17px">앞으로는 content.js만 교체</div>
        <div class="meaning">앱 본체는 그대로 두고, 새 Day 콘텐츠는 content.js 파일 하나만 업데이트하면 됩니다.</div>
      </div>
    </div>
  </section>`;
}

function addCustom(){
  const text=$("#newText").value.trim();
  if(!text)return alert("영어 문장을 입력해 주세요.");
  state.custom.unshift({
    id:"u"+Date.now(),text,
    meaning:$("#newMeaning").value.trim(),
    tags:$("#newTags").value.split(",").map(x=>x.trim()).filter(Boolean),
    day:0,date:todayISO()
  });
  save();page="library";render();
}
function setRate(v){state.settings.rate=Number(v);save();render();}
function exportData(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download="GBME365_backup_"+todayISO()+".json";a.click();URL.revokeObjectURL(a.href);
}
function importData(e){
  const f=e.target.files?.[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    try{state={...baseState,...JSON.parse(r.result)};save();render();alert("복원 완료!");}
    catch(err){alert("올바른 백업 파일이 아니에요.");}
  };
  r.readAsText(f);
}

function nav(){
  const items=[["today","Today"],["library","Library"],["review","Review"],["progress","Progress"],["add","Add"]];
  return `<nav class="tabs">${items.map(([id,label])=>`<button class="tab ${page===id?"active":""}" onclick="go('${id}')">${label}</button>`).join("")}</nav>`;
}
function go(p){page=p;render();}
function render(){
  const cur=GBME_CONTENT.meta.currentDay;
  let body=page==="today"?todayPage():page==="library"?libraryPage():page==="review"?reviewPage():page==="progress"?progressPage():addPage();
  document.querySelector("#app").innerHTML=`<div class="app">
    <header class="top"><div class="brand"><h1>GBME 365</h1><p>Global Brand Marketing English · Daily Archive</p></div><div class="daypill">Day ${cur}</div></header>
    ${body}
  </div>${nav()}`;
  if(page==="library")renderLibrary();
}

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js").catch(()=>{}));
}
if("speechSynthesis" in window){
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged=()=>speechSynthesis.getVoices();
}
render();
