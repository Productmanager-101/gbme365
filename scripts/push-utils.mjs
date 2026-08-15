export const KST_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" });
export function kstDate(date = new Date()) { return KST_DATE_FORMATTER.format(date); }
export function resolveMode(args = process.argv.slice(2), date = new Date()) {
  const requested = args.find((value) => value.startsWith("--mode="))?.split("=")[1] || "auto";
  if (["morning", "evening"].includes(requested)) return requested;
  if (requested !== "auto") throw new Error(`Unknown mode: ${requested}`);
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", hour: "2-digit", hourCycle: "h23" }).format(date));
  if (hour === 8) return "morning";
  if (hour === 22) return "evening";
  throw new Error(`Auto mode only runs at 08:00 or 22:00 KST (current hour: ${hour})`);
}
export function isInvalidTokenError(error) { return ["messaging/invalid-registration-token", "messaging/registration-token-not-registered"].includes(error?.code); }
export function filterIncompleteTokens(tokenDocs, completedUserIds, getUserId = (doc) => doc.ref.parent.parent?.id) {
  const complete = new Set(completedUserIds);
  return tokenDocs.filter((doc) => !complete.has(getUserId(doc)));
}
