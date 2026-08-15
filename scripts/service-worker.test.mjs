import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../service-worker.js", import.meta.url), "utf8");

test("one service worker registers Firebase Messaging and existing PWA handlers", () => {
  const listeners = new Map();
  let backgroundHandler;
  const messaging = { onBackgroundMessage(handler) { backgroundHandler = handler; } };
  const context = {
    importScripts() {},
    firebase: { initializeApp() {}, messaging: () => messaging },
    self: { registration: { showNotification: async () => {} }, location: { origin: "https://example.test" }, skipWaiting: async () => {}, clients: { claim: async () => {} }, addEventListener: (name, handler) => listeners.set(name, handler) },
    caches: { open: async () => ({ addAll: async () => {}, put: async () => {} }), keys: async () => [], delete: async () => {}, match: async () => undefined },
    clients: { matchAll: async () => [], openWindow: async () => {} },
    fetch: async () => ({ clone() { return this; } }),
    URL,
    console
  };
  vm.runInNewContext(source, context);
  assert.equal(typeof backgroundHandler, "function");
  assert.deepEqual([...listeners.keys()].sort(), ["activate", "fetch", "install", "notificationclick"]);
});
