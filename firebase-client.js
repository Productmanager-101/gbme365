(function () {
  "use strict";
  const firebaseConfig = { apiKey: "AIzaSyBNuuspyit1PxaxhcqwjrQIiubxkibLEYA", authDomain: "english-master-942ca.firebaseapp.com", projectId: "english-master-942ca", storageBucket: "english-master-942ca.firebasestorage.app", messagingSenderId: "938731012885", appId: "1:938731012885:web:45023fdb49f3a86ddddf1c" };
  const vapidKey = "BOfs6ffrroEtRi-7SKM4KRq54fWTNxmOQGxPmY1g4rFex5r4zqL4qzNAY2Xpw2a8RmFPig8y1SjeuOvxxALp1Oo";
  let auth, db, messaging, user, corePromise, messagingPromise, busy = false, notice = "", tokenRegistered = false;
  const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const hasNotificationApi = () => typeof Notification !== "undefined" && typeof Notification.requestPermission === "function";
  const hasPushFoundation = () => window.isSecureContext && "serviceWorker" in navigator && "PushManager" in window && hasNotificationApi();
  const permission = () => hasNotificationApi() ? Notification.permission : "unsupported";
  const errorMessage = (error) => error instanceof Error || error?.message ? String(error.message) : String(error);
  const tokenId = async (token) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)))).map((byte) => byte.toString(16).padStart(2, "0")).join("");

  function renderControls(message) {
    if (typeof message === "string") notice = message;
    const button = document.querySelector("#notification-toggle"), help = document.querySelector("#notification-help");
    if (!button || !help) return;
    const granted = permission() === "granted";
    button.hidden = false;
    button.disabled = busy || (granted && tokenRegistered);
    button.classList.toggle("enabled", granted && tokenRegistered);
    button.textContent = busy ? "🔔 기기 등록 중" : granted && tokenRegistered ? "🔔 알림 켜짐" : granted ? "🔄 기기 등록 다시 시도" : "🔔 알림 받기";
    button.onclick = enableNotifications;
    const installHelp = isIos() && !isStandalone() ? "홈 화면에 추가한 후 설치된 English Master에서 알림을 켜주세요." : "";
    const unsupportedHelp = !isIos() && !hasPushFoundation() ? "이 브라우저에서는 Web Push 알림을 지원하지 않아요." : "";
    help.textContent = notice || installHelp || unsupportedHelp;
    help.hidden = !help.textContent;
  }

  async function ensureCore() {
    if (corePromise) return corePromise;
    corePromise = (async () => {
      if (!window.firebase) throw new Error("Firebase SDK is unavailable");
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      auth = firebase.auth(); db = firebase.firestore();
      const result = auth.currentUser ? { user: auth.currentUser } : await auth.signInAnonymously();
      user = result.user;
      return true;
    })();
    return corePromise;
  }

  async function ensureMessaging(forceIosStandalone = false) {
    if (messaging) return messaging;
    if (messagingPromise) return messagingPromise;
    messagingPromise = (async () => {
      await ensureCore();
      if (!hasPushFoundation()) throw new Error("Web Push APIs are unavailable");
      if (isIos() && !isStandalone()) throw new Error("iOS Web Push requires a Home Screen app");
      let reportedSupported = true;
      try { reportedSupported = await Promise.resolve(firebase.messaging.isSupported()); }
      catch (error) { console.warn("Firebase Messaging support check failed; trying registration directly.", error); reportedSupported = false; }
      if (!reportedSupported && !(forceIosStandalone && isIos() && isStandalone())) throw new Error("Firebase Messaging is not supported in this browser");
      messaging = firebase.messaging();
      messaging.onMessage(async (payload) => {
        const data = payload.data || {};
        if (permission() === "granted") {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(data.title || "English Master", { body: data.body, icon: "icon-192.png", badge: "favicon-32.png", data: { url: data.url || "./" } });
        }
      });
      return messaging;
    })().catch((error) => { messagingPromise = null; throw error; });
    return messagingPromise;
  }

  async function saveToken(token) {
    await ensureCore();
    await db.doc(`users/${user.uid}/tokens/${await tokenId(token)}`).set({ token, platform: isIos() ? "ios" : "web", userAgent: navigator.userAgent.slice(0, 300), updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
  }
  async function getMessagingRegistration() {
    const requested = await navigator.serviceWorker.register("service-worker.js", { scope: "./" });
    const registration = requested.active ? requested : await navigator.serviceWorker.ready;
    if (!registration.active) throw new Error("English Master service worker is not active");
    return registration;
  }
  async function registerToken(forceIosStandalone = false) {
    const fcm = await ensureMessaging(forceIosStandalone);
    const registration = await getMessagingRegistration();
    const token = await fcm.getToken({ vapidKey, serviceWorkerRegistration: registration });
    if (!token) throw new Error("FCM registration token was not issued");
    await saveToken(token);
    tokenRegistered = true;
    return token;
  }
  async function enableNotifications() {
    if (busy) return;
    notice = "";
    if (isIos() && !isStandalone()) return renderControls("홈 화면에 추가한 후 설치된 English Master에서 알림을 켜주세요.");
    if (!hasNotificationApi()) return renderControls("이 환경에서는 알림 권한을 요청할 수 없어요.");
    busy = true; renderControls();
    try {
      const result = await Notification.requestPermission();
      if (result !== "granted") return renderControls(result === "denied" ? "기기 설정에서 English Master 알림을 허용해 주세요." : "알림 권한이 허용되지 않았어요.");
      renderControls("알림 권한을 확인했어요. 기기를 등록하는 중이에요.");
      await registerToken(isIos() && isStandalone());
      renderControls("매일 학습 시간에 알림을 보내드릴게요.");
    } catch (error) {
      console.error("Notification registration failed", error);
      tokenRegistered = false;
      renderControls(`기기 등록 오류: ${errorMessage(error)}`);
    } finally { busy = false; renderControls(); }
  }
  async function initialize() {
    renderControls();
    try {
      await ensureCore();
      if (permission() === "granted" && (!isIos() || isStandalone())) {
        busy = true; renderControls("알림 권한을 확인했어요. 기기를 자동 등록하는 중이에요.");
        try { await registerToken(isIos() && isStandalone()); notice = ""; }
        catch (error) { tokenRegistered = false; renderControls(`기기 등록 오류: ${errorMessage(error)}`); throw error; }
        finally { busy = false; renderControls(); }
      }
      return true;
    } catch (error) {
      console.error("Firebase initialization failed", error);
      if (permission() === "granted" && !notice) renderControls(`기기 등록 오류: ${errorMessage(error)}`);
      return false;
    }
  }
  async function syncCompletion(date, completed) {
    try {
      await ensureCore();
      await db.doc(`users/${user.uid}/completions/${date}`).set({ completed: Boolean(completed), completedAt: completed ? firebase.firestore.FieldValue.serverTimestamp() : null, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    } catch (error) { console.error("Completion sync failed", error); }
  }
  window.EnglishMasterPush = { initialize, renderControls, syncCompletion };
})();
