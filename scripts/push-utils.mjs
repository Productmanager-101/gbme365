export const KST_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" });
export function kstDate(date = new Date()) { return KST_DATE_FORMATTER.format(date); }
export function resolveMode(args = process.argv.slice(2)) {
  const requested = args.find((value) => value.startsWith("--mode="))?.split("=")[1];
  if (["morning", "evening"].includes(requested)) return requested;
  throw new Error(`Mode must be explicitly set to morning or evening (received: ${requested || "none"})`);
}
export function isInvalidTokenError(error) { return ["messaging/invalid-registration-token", "messaging/registration-token-not-registered"].includes(error?.code); }
export function filterIncompleteTokens(tokenDocs, completedUserIds, getUserId = (doc) => doc.ref.parent.parent?.id) {
  const complete = new Set(completedUserIds);
  return tokenDocs.filter((doc) => !complete.has(getUserId(doc)));
}
