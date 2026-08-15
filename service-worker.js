try {
  importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");
  firebase.initializeApp({ apiKey: "AIzaSyBNuuspyit1PxaxhcqwjrQIiubxkibLEYA", authDomain: "english-master-942ca.firebaseapp.com", projectId: "english-master-942ca", storageBucket: "english-master-942ca.firebasestorage.app", messagingSenderId: "938731012885", appId: "1:938731012885:web:45023fdb49f3a86ddddf1c" });
  firebase.messaging().onBackgroundMessage((payload) => self.registration.showNotification(payload.data?.title || "English Master", { body: payload.data?.body || "오늘의 영어 공부를 시작해볼까요?", icon: "icon-192.png", badge: "favicon-32.png", data: { url: payload.data?.url || "./" } }));
} catch (error) {
  console.warn("Firebase Messaging is unavailable; offline caching remains active.", error);
}

const CACHE = "english-master-v6-ios-push";
const ASSETS = ["./", "./index.html", "./style.css", "./app.js", "./firebase-client.js", "./content.js", "./generated-content.json", "./manifest.json", "./assets/cat-sitting.png", "./assets/cat-studying.png", "./assets/cat-review.png", "./assets/cat-complete.png", "./icon-180.png", "./icon-192.png", "./icon-512.png", "./favicon-32.png"];
self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener("activate", (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request)));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "./", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => client.url.startsWith(self.location.origin));
    return existing ? existing.focus().then(() => existing.navigate(target)) : clients.openWindow(target);
  }));
});
