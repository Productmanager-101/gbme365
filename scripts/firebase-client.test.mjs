import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { webcrypto } from "node:crypto";

const source = await readFile(new URL("../firebase-client.js", import.meta.url), "utf8");

function createIosContext({ standalone, supported = false, tokenError } = {}) {
  const button = { hidden: true, disabled: false, textContent: "", onclick: null, classList: { toggle() {} } };
  const help = { hidden: true, textContent: "" };
  const writes = [];
  const activeRegistration = { active: { state: "activated" }, showNotification: async () => {} };
  const messaging = { getToken: async () => { if (tokenError) throw tokenError; return "test-fcm-token"; }, onMessage() {} };
  const firebase = {
    apps: [],
    initializeApp() { this.apps.push({}); },
    auth: Object.assign(() => ({ currentUser: null, signInAnonymously: async () => ({ user: { uid: "ios-user" } }) })),
    firestore: Object.assign(() => ({ doc: (path) => ({ set: async (data) => writes.push({ path, data }) }) }), { FieldValue: { serverTimestamp: () => "server-time" } }),
    messaging: Object.assign(() => messaging, { isSupported: async () => supported })
  };
  const context = {
    window: { firebase, isSecureContext: true, PushManager: function PushManager() {} },
    firebase,
    navigator: { userAgent: "Mozilla/5.0 (iPhone)", platform: "iPhone", maxTouchPoints: 5, standalone, serviceWorker: { register: async () => activeRegistration, ready: Promise.resolve(activeRegistration) } },
    Notification: { permission: "default", requestPermission: async () => { context.Notification.permission = "granted"; return "granted"; } },
    document: { querySelector: (selector) => selector === "#notification-toggle" ? button : help },
    matchMedia: () => ({ matches: standalone }),
    crypto: webcrypto,
    TextEncoder,
    Uint8Array,
    console
  };
  context.window.Notification = context.Notification;
  return { context, button, help, writes };
}

test("iOS Home Screen PWA always shows the notification button", () => {
  const { context, button } = createIosContext({ standalone: true });
  vm.runInNewContext(source, context);
  context.window.EnglishMasterPush.renderControls();
  assert.equal(button.hidden, false);
  assert.equal(button.textContent, "🔔 알림 받기");
});

test("iOS Home Screen registration proceeds when isSupported reports false", async () => {
  const { context, button, writes } = createIosContext({ standalone: true, supported: false });
  vm.runInNewContext(source, context);
  context.window.EnglishMasterPush.renderControls();
  await button.onclick();
  assert.equal(context.Notification.permission, "granted");
  assert.equal(button.textContent, "🔔 알림 켜짐");
  assert.equal(writes.some(({ path, data }) => path.startsWith("users/ios-user/tokens/") && data.token === "test-fcm-token"), true);
});

test("regular iPhone Safari keeps the button visible and shows install guidance", () => {
  const { context, button, help } = createIosContext({ standalone: false });
  vm.runInNewContext(source, context);
  context.window.EnglishMasterPush.renderControls();
  assert.equal(button.hidden, false);
  assert.match(help.textContent, /홈 화면에 추가/);
});

test("granted permission with token failure shows the exact error and allows retry", async () => {
  const failure = new Error("messaging/token-subscribe-failed");
  const { context, button, help } = createIosContext({ standalone: true, tokenError: failure });
  vm.runInNewContext(source, context);
  context.Notification.permission = "granted";
  context.window.EnglishMasterPush.renderControls();
  await button.onclick();
  assert.equal(button.disabled, false);
  assert.equal(button.textContent, "🔄 기기 등록 다시 시도");
  assert.match(help.textContent, /messaging\/token-subscribe-failed/);
});
