import test from "node:test";
import assert from "node:assert/strict";
import { filterIncompleteTokens, isInvalidTokenError, kstDate, resolveMode } from "./push-utils.mjs";

test("formats dates in Asia/Seoul", () => assert.equal(kstDate(new Date("2026-08-14T15:30:00Z")), "2026-08-15"));
test("maps scheduled UTC instants to KST modes", () => {
  assert.equal(resolveMode(["--mode=auto"], new Date("2026-08-14T23:00:00Z")), "morning");
  assert.equal(resolveMode(["--mode=auto"], new Date("2026-08-15T13:00:00Z")), "evening");
});
test("recognizes only removable FCM token failures", () => {
  assert.equal(isInvalidTokenError({ code: "messaging/registration-token-not-registered" }), true);
  assert.equal(isInvalidTokenError({ code: "messaging/internal-error" }), false);
});
test("evening audience excludes every token owned by completed users", () => {
  const tokens = [{ uid: "complete", token: "a" }, { uid: "complete", token: "b" }, { uid: "incomplete", token: "c" }];
  assert.deepEqual(filterIncompleteTokens(tokens, ["complete"], (item) => item.uid), [{ uid: "incomplete", token: "c" }]);
});
