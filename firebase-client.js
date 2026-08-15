(function () {
  "use strict";
  const firebaseConfig = { apiKey: "AIzaSyBNuuspyit1PxaxhcqwjrQIiubxkibLEYA", authDomain: "english-master-942ca.firebaseapp.com", projectId: "english-master-942ca", storageBucket: "english-master-942ca.firebasestorage.app", messagingSenderId: "938731012885", appId: "1:938731012885:web:45023fdb49f3a86ddddf1c" };
  const vapidKey = "BOfs6ffrroEtRi-7SKM4KRq54fWTNxmOQGxPmY1g4rFex5r4qzL4qzNAY2Xpw2a8RmFPig8y1SjeuOvxxALp1Oo";
  let auth, db, messaging, user, readyPromise, busy = false;
  const supported = () => Boolean(window.firebase && window.isSecureContext && "serviceWorker" in navigator && "Notification" in window && firebase.messaging.isSupported());
  const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const tokenId = async (token) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)))).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  function renderControls(message) {
    const button = document.querySelector("#notification-toggle"), help = document.querySelector("#notification-help");
    if (!button || !help) return;
    if (!supported()) { button.hidden = true; help.hidden = true; return; }
    button.hidden = false; button.disabled = busy || Notification.permission === "granted";
    button.classList.toggle("enabled", Notification.permission === "granted");
    button.textContent = Notification.permission === "granted" ? "🔔 알림 켜짐" : "🔔 알림 받기";
    button.onclick = enableNotifications;
    const iosHelp = isIos() && !isStandalone() && Notification.permission !== "granted" ? "iPhone에서는 Safari 공유 버튼 → ‘홈 화면에 추가’ 후 설치된 앱에서 알림을 켜 주세요." : "";
    help.textContent = message || iosHelp; help.hidden = !help.textContent;
  }
  async function ensureUser() { if (user) return user; const result = auth.currentUser ? { user: auth.currentUser } : await auth.signInAnonymously(); user = result.user; return user; }
  async function saveToken(token) { const currentUser = await ensureUser(); await db.doc(`users/${currentUser.uid}/tokens/${await tokenId(token)}`).set({ token, platform: isIos() ? "ios" : "web", userAgent: navigator.userAgent.slice(0, 300), updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true }); }
  async function registerToken() { const registration = await navigator.serviceWorker.ready; const token = await messaging.getToken({ vapidKey, serviceWorkerRegistration: registration }); if (!token) throw new Error("FCM registration token was not issued"); await saveToken(token); }
  async function enableNotifications() {
    if (busy) return;
    if (isIos() && !isStandalone()) return renderControls("iPhone에서는 먼저 Safari 공유 버튼 → ‘홈 화면에 추가’를 선택해 주세요.");
    busy = true; renderControls();
    try { const permission = await Notification.requestPermission(); if (permission !== "granted") return renderControls(permission === "denied" ? "브라우저 설정에서 English Master 알림을 허용해 주세요." : "알림 권한이 허용되지 않았어요."); await registerToken(); renderControls("매일 학습 시간에 알림을 보내드릴게요."); }
    catch (error) { console.error("Notification registration failed", error); renderControls("알림 등록에 실패했어요. 잠시 후 다시 시도해 주세요."); }
    finally { busy = false; renderControls(); }
  }
  async function initialize() {
    if (readyPromise) return readyPromise;
    readyPromise = (async () => { renderControls(); if (!supported()) return false; if (!firebase.apps.length) firebase.initializeApp(firebaseConfig); auth = firebase.auth(); db = firebase.firestore(); messaging = firebase.messaging(); await ensureUser(); messaging.onMessage(async (payload) => { const data = payload.data || {}; if (Notification.permission === "granted") { const registration = await navigator.serviceWorker.ready; await registration.showNotification(data.title || "English Master", { body: data.body, icon: "icon-192.png", badge: "favicon-32.png", data: { url: data.url || "./" } }); } }); if (Notification.permission === "granted") await registerToken(); renderControls(); return true; })().catch((error) => { console.error("Firebase initialization failed", error); renderControls("알림 서비스에 연결하지 못했어요. 학습 기능은 그대로 사용할 수 있어요."); return false; });
    return readyPromise;
  }
  async function syncCompletion(date, completed) { await initialize(); if (!db) return; const currentUser = await ensureUser(); await db.doc(`users/${currentUser.uid}/completions/${date}`).set({ completed: Boolean(completed), completedAt: completed ? firebase.firestore.FieldValue.serverTimestamp() : null, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true }).catch((error) => console.error("Completion sync failed", error)); }
  window.EnglishMasterPush = { initialize, renderControls, syncCompletion };
})();
