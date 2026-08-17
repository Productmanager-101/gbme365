import test from "node:test";
import assert from "node:assert/strict";
import { filterIncompleteTokens, isInvalidTokenError, kstDate, resolveMode } from "./push-utils.mjs";

test("formats dates in Asia/Seoul", () => assert.equal(kstDate(new Date("2026-08-14T15:30:00Z")), "2026-08-15"));
test("uses explicit modes regardless of the job execution time", () => {
  assert.equal(resolveMode(["--mode=morning"]), "morning");
  assert.equal(resolveMode(["--mode=evening"]), "evening");
  assert.throws(() => resolveMode(["--mode=auto"]), /explicitly set/);
  assert.throws(() => resolveMode([]), /explicitly set/);
});
test("recognizes only removable FCM token failures", () => {
  assert.equal(isInvalidTokenError({ code: "messaging/registration-token-not-registered" }), true);
  assert.equal(isInvalidTokenError({ code: "messaging/internal-error" }), false);
});
test("evening audience excludes every token owned by completed users", () => {
  const tokens = [{ uid: "complete", token: "a" }, { uid: "complete", token: "b" }, { uid: "incomplete", token: "c" }];
  assert.deepEqual(filterIncompleteTokens(tokens, ["complete"], (item) => item.uid), [{ uid: "incomplete", token: "c" }]);
});
