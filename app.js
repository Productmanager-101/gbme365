const KEY = "gbme365-auto-v4";
const START_DATE = "2026-08-14";
const DAY_RESET_VERSION = 1;
const $ = (selector) => document.querySelector(selector);
const stored = JSON.parse(localStorage.getItem(KEY) || "{}");
const state = {
  ...stored,
  done: stored.done || {},
  starred: stored.starred || {},
  wordStarred: stored.wordStarred || {},
  startedOn: START_DATE,
  dayResetVersion: DAY_RESET_VERSION
};
let page = "today";
let manualDay = null;
let celebratedDay = null;

function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
function dateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function kstDateISO(date = new Date()) { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(date); }
function maxDay() { return Math.max(...GBME_CONTENT.days.map((d) => d.day)); }
function dayFromDate() {
  const start = new Date(`${START_DATE}T00:00:00`);
  const now = new Date(`${dateISO()}T00:00:00`);
  return Math.max(1, Math.min(maxDay(), Math.floor((now - start) / 86400000) + 1));
}
function dayFromKstDate() {
  const start = new Date(`${START_DATE}T00:00:00Z`);
  const today = new Date(`${kstDateISO()}T00:00:00Z`);
  return Math.max(1, Math.min(maxDay(), Math.floor((today - start) / 86400000) + 1));
}
function currentDay() { return manualDay || dayFromDate(); }
function getDay(number) { return GBME_CONTENT.days.find((item) => item.day === number); }
function clamp(number) { return Math.max(1, Math.min(maxDay(), number)); }
function allSentences() { return GBME_CONTENT.days.flatMap((d) => d.sentences.map((s) => ({ ...s, day: d.day }))); }
function allWords() { return GBME_CONTENT.days.flatMap((d) => d.words.map((w) => ({ ...w, day: d.day }))); }
function esc(value) { return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]); }
function isDayComplete(d) { return d.sentences.every((s) => state.done[s.id]); }

function toggleDone(id, dayNumber) {
  state.done[id] = !state.done[id];
  const d = getDay(dayNumber);
  if (state.done[id] && isDayComplete(d)) celebratedDay = dayNumber;
  save();
  if (dayNumber === dayFromKstDate()) window.EnglishMasterPush?.syncCompletion(kstDateISO(), isDayComplete(d));
  render();
}
function toggleStar(id) { state.starred[id] = !state.starred[id]; save(); render(); }
function toggleWordStar(id) { state.wordStarred[id] = !state.wordStarred[id]; save(); render(); }
function speak(text) {
  if (!("speechSynthesis" in window)) return alert("이 기기에서는 음성 재생을 지원하지 않아요.");
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  utterance.voice = voices.find((voice) => voice.lang === "en-US") || voices.find((voice) => /^en/.test(voice.lang)) || null;
  utterance.lang = "en-US";
  utterance.rate = 0.88;
  speechSynthesis.speak(utterance);
}

function catIllustration(review = false, mood = "ready", variant = "") {
  const asset = variant === "sitting" ? "cat-sitting.png" : mood === "happy" ? "cat-complete.png" : review ? "cat-review.png" : "cat-studying.png";
  const label = variant === "sitting" ? "앉아서 인사하는 샴고양이" : mood === "happy" ? "두 팔을 들고 기뻐하는 샴고양이" : review ? "책상 아래에서 얼굴을 내민 복습 샴고양이" : "책상에서 공부하는 샴고양이";
  return `<div class="cat ${review ? "scholar" : ""} ${mood}" role="img" aria-label="${label}"><img src="assets/${asset}" alt="" draggable="false"></div>`;
}
function catMessage(done, review) {
  if (done === 2) return review ? "복습 완료! 기억력이 반짝반짝해요 ✨" : "오늘 공부 끝! 정말 멋진 집중력이에요 ✨";
  if (done === 1) return "절반 왔어요. 한 문장만 더 하면 오늘도 성공!";
  return review ? "안경 장착! 오늘은 배운 표현을 단단히 묶는 날이에요." : "가볍게 두 문장부터 시작해 볼까요?";
}
function icon(name) {
  const icons = { today: "⌂", library: "▦", favorites: "♥", info: "●" };
  return `<span class="tab-icon">${icons[name]}</span>`;
}
function sentenceCard(s) {
  const done = Boolean(state.done[s.id]);
  const starred = Boolean(state.starred[s.id]);
  return `<article class="card sentence-card ${done ? "done" : ""}">
    <div class="card-top"><span class="eyebrow">DAY ${s.day}</span><button class="icon-btn ${starred ? "active" : ""}" onclick="toggleStar('${s.id}')" aria-label="문장 즐겨찾기">${starred ? "♥" : "♡"}</button></div>
    <div class="sentence">${esc(s.text)}</div><div class="meaning">${esc(s.meaning)}</div>
    <div class="tags">${s.tags.map((tag) => `<span>#${esc(tag)}</span>`).join("")}</div>
    <div class="actions"><button class="btn check ${done ? "active" : ""}" onclick="toggleDone('${s.id}', ${s.day})">${done ? "✓ 완료했어요" : "○ 완료 체크"}</button><button class="btn sound" onclick='speak(${JSON.stringify(s.text)})'>◖ 발음 듣기</button></div>
  </article>`;
}
function wordCard(w) {
  const starred = Boolean(state.wordStarred[w.id]);
  return `<article class="card word-card"><div class="card-top"><span class="word">${esc(w.word)}</span><button class="icon-btn ${starred ? "active" : ""}" onclick="toggleWordStar('${w.id}')" aria-label="단어 즐겨찾기">${starred ? "♥" : "♡"}</button></div>
    <div class="word-meaning">${esc(w.meaning)}</div><div class="example">${esc(w.example)}</div>
    <button class="text-btn" onclick='speak(${JSON.stringify(`${w.word}. ${w.example}`)})'>◖ 단어와 예문 듣기</button></article>`;
}
function dialogueSection(d) {
  const text = d.dialogue.map((line) => `${line.speaker}: ${line.text}`).join(". ");
  return `<section class="section"><div class="section-head"><div><span class="section-kicker">MINI DIALOGUE</span><h3>업무 대화로 익히기</h3></div><button class="btn sound compact" onclick='speak(${JSON.stringify(text)})'>◖ 전체 듣기</button></div><div class="card dialogue-card">${d.dialogue.map((line) => `<div class="dialogue-line"><b>${esc(line.speaker)}</b><p>${esc(line.text)}</p></div>`).join("")}</div></section>`;
}
function speakingSection(d) {
  return `<section class="section"><div class="section-head"><div><span class="section-kicker">${d.type === "review" ? "SPEAKING CHALLENGE" : "SPEAKING MISSION"}</span><h3>Your Turn</h3></div></div><div class="card speaking-card"><span class="situation-label">상황</span><p class="speaking-prompt">${esc(d.speaking.prompt)}</p><button class="btn reveal" onclick="this.closest('.speaking-card').classList.add('revealed')">정답 보기</button><div class="model-answer" aria-live="polite"><span>MODEL ANSWER</span><p>${esc(d.speaking.answer)}</p><button class="btn sound" onclick='speak(${JSON.stringify(d.speaking.answer)})'>◖ 모범 답변 듣기</button></div></div></section>`;
}
function dayNavigation() {
  return `<div class="day-nav"><button onclick="moveDay(-1)" ${currentDay() === 1 ? "disabled" : ""}>‹ 이전 Day</button><button class="today-button" onclick="goToday()">Today · Day ${dayFromDate()}</button><button onclick="moveDay(1)" ${currentDay() === maxDay() ? "disabled" : ""}>다음 Day ›</button></div>`;
}
function moveDay(amount) { manualDay = clamp(currentDay() + amount); page = "today"; render(); scrollTo({ top: 0, behavior: "smooth" }); }
function goToday() { manualDay = null; page = "today"; render(); }
function jumpDay(number) { manualDay = number; page = "today"; render(); scrollTo({ top: 0, behavior: "smooth" }); }

function todayPage() {
  const d = getDay(currentDay());
  const done = d.sentences.filter((s) => state.done[s.id]).length;
  const review = d.type === "review";
  const celebrate = celebratedDay === d.day && done === 2;
  return `${dayNavigation()}<section class="hero ${review ? "review" : ""} ${celebrate ? "celebrate" : ""}">
    <div class="hero-copy"><div class="eyebrow">${review ? "REVIEW DAY" : "TODAY'S LESSON"} · DAY ${d.day}</div><h2>${esc(d.focus)}</h2><p>${esc(d.mission)}</p><div class="progress-wrap"><div class="progress-label"><span>오늘의 문장</span><b>${done} / 2 완료</b></div><div class="progress"><i style="width:${done * 50}%"></i></div></div></div>
    <div class="cat-zone">${catIllustration(review, done === 2 ? "happy" : "ready")}<div class="speech">${catMessage(done, review)}</div></div>
    ${celebrate ? '<div class="confetti" aria-hidden="true"><i>✦</i><i>●</i><i>★</i><i>✦</i><i>●</i></div>' : ""}
  </section>
  <section class="section"><div class="section-head"><div><span class="section-kicker">KEY SENTENCES</span><h3>핵심 문장 2개</h3></div><span class="count">${done}/2</span></div><div class="grid">${d.sentences.map((s) => sentenceCard({ ...s, day: d.day })).join("")}</div></section>
  <section class="section"><div class="section-head"><div><span class="section-kicker">VOCABULARY</span><h3>${review ? "복습 단어 5개" : "오늘의 단어 5개"}</h3></div><span class="count">5 words</span></div><div class="word-grid">${d.words.map((w) => wordCard({ ...w, day: d.day })).join("")}</div></section>${dialogueSection(d)}${speakingSection(d)}`;
}
function libraryPage() {
  return `<div class="page-title"><span class="section-kicker">CONTINUOUS JOURNEY</span><h2>전체 학습</h2><p>자동 생성된 최신 Day까지 언제든 다시 학습해 보세요.</p></div><div class="day-grid">${GBME_CONTENT.days.map((d) => `<button class="${d.type === "review" ? "review" : ""}" onclick="jumpDay(${d.day})"><span>${d.type === "review" ? "REVIEW" : "DAY"}</span><b>${d.day}</b>${isDayComplete(d) ? "<i>✓</i>" : ""}</button>`).join("")}</div>`;
}
function favoritesPage() {
  const sentences = allSentences().filter((s) => state.starred[s.id]);
  const words = allWords().filter((w) => state.wordStarred[w.id]);
  return `<div class="page-title"><span class="section-kicker">MY COLLECTION</span><h2>즐겨찾기</h2><p>마음에 든 문장과 단어를 한곳에서 복습해요.</p></div>
    <section class="section"><div class="section-head"><h3>문장</h3><span class="count">${sentences.length}</span></div>${sentences.length ? `<div class="grid">${sentences.map(sentenceCard).join("")}</div>` : empty("아직 저장한 문장이 없어요.")}</section>
    <section class="section"><div class="section-head"><h3>단어</h3><span class="count">${words.length}</span></div>${words.length ? `<div class="word-grid">${words.map(wordCard).join("")}</div>` : empty("단어 카드의 하트를 눌러 모아 보세요.")}</section>`;
}
function empty(message) { return `<div class="empty"><span>♡</span><p>${message}</p></div>`; }
function infoPage() {
  const completed = GBME_CONTENT.days.filter(isDayComplete).length;
  return `<div class="page-title"><span class="section-kicker">YOUR PROGRESS</span><h2>학습 안내</h2><p>매일 이해하고, 문맥에서 익히고, 직접 말하는 Global Business English.</p></div><div class="summary card"><div>${catIllustration(false, "ready", "sitting")}<span><b>${completed}</b><small>완료한 Day</small></span></div><div><b>${Object.values(state.starred).filter(Boolean).length + Object.values(state.wordStarred).filter(Boolean).length}</b><small>즐겨찾기</small></div></div><div class="card info-card"><h3>학습 리듬</h3><p>매일 핵심 문장 2개와 단어 5개를 익힌 뒤 짧은 대화와 Speaking Mission으로 직접 사용합니다. 매 5일째는 직전 4일의 표현을 복습하는 날이에요.</p><h3>Day 기준</h3><p>2026년 8월 14일이 새로운 Day 1입니다. 날짜가 바뀌면 Today의 Day도 자동으로 하루씩 올라갑니다.</p><h3>기록 저장</h3><p>완료와 즐겨찾기는 이 기기의 브라우저에 안전하게 저장됩니다. 앱을 홈 화면에 추가하면 PWA로도 편하게 사용할 수 있어요.</p></div>`;
}
function go(next) { page = next; render(); scrollTo({ top: 0, behavior: "smooth" }); }
function tabs() {
  return `<nav class="tabs" aria-label="주요 메뉴">${[["today", "Today"], ["library", "30 Days"], ["favorites", "즐겨찾기"], ["info", "내 기록"]].map(([key, label]) => `<button class="${page === key ? "active" : ""}" onclick="go('${key}')">${icon(key)}<span>${label}</span></button>`).join("")}</nav>`;
}
function render() {
  const views = { today: todayPage, library: libraryPage, favorites: favoritesPage, info: infoPage };
  $("#app").innerHTML = `<main class="app"><header class="top"><button class="brand" onclick="go('today')"><img class="brand-mark" src="favicon-32.png" alt=""><span><b>ENGLISH MASTER</b><small>Global Business English, one paw at a time</small></span></button><div class="header-actions"><button id="notification-toggle" class="notification-toggle" type="button" hidden></button><span class="day-pill">DAY ${currentDay()} <i>/ ${maxDay()}</i></span></div></header><div id="notification-help" class="notification-help" role="status" hidden></div>${views[page]()}</main>${tabs()}`;
  save();
  window.EnglishMasterPush?.renderControls();
}

async function loadGeneratedContent() {
  const cached = JSON.parse(localStorage.getItem("gbme365-generated-content") || '{"days":[]}');
  try {
    const response = await fetch(`generated-content.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Generated content is unavailable");
    const fresh = await response.json();
    if (!Array.isArray(fresh.days)) throw new Error("Invalid generated content");
    localStorage.setItem("gbme365-generated-content", JSON.stringify(fresh));
    mergeGeneratedDays(fresh.days);
  } catch (error) { mergeGeneratedDays(cached.days || []); }
}
function mergeGeneratedDays(days) {
  const known = new Set(GBME_CONTENT.days.map((d) => d.day));
  days.filter((d) => d.day > 30 && !known.has(d.day) && d.sentences?.length === 2 && d.words?.length === 5).forEach((d) => GBME_CONTENT.days.push(enrichDay(d)));
  GBME_CONTENT.days.sort((a, b) => a.day - b.day);
}
if ("speechSynthesis" in window) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); }
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(() => {}));
loadGeneratedContent().finally(() => {
  render();
  window.EnglishMasterPush?.initialize().then(() => {
    const today = getDay(dayFromKstDate());
    window.EnglishMasterPush?.syncCompletion(kstDateISO(), isDayComplete(today));
  });
});
