import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldPath, getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { pathToFileURL } from "node:url";
import { filterIncompleteTokens, isInvalidTokenError, kstDate, resolveMode } from "./push-utils.mjs";

async function main() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is required");
  const serviceAccount = JSON.parse(raw);
  const app = getApps()[0] || initializeApp({ credential: cert(serviceAccount), projectId: "english-master-942ca" });
  const db = getFirestore(app), messaging = getMessaging(app), mode = resolveMode(), today = kstDate();
  const tokenSnapshot = await db.collectionGroup("tokens").get();
  let tokenDocs = tokenSnapshot.docs;
  if (mode === "evening") {
    const userIds = [...new Set(tokenDocs.map((doc) => doc.ref.parent.parent?.id).filter(Boolean))];
    const completionRefs = userIds.map((uid) => db.doc(`users/${uid}/completions/${today}`));
    const completionChunks = Array.from({ length: Math.ceil(completionRefs.length / 500) }, (_, index) => completionRefs.slice(index * 500, index * 500 + 500));
    const completionDocs = (await Promise.all(completionChunks.map((refs) => db.getAll(...refs)))).flat();
    const completeUsers = new Set(completionDocs.filter((doc) => doc.exists && doc.get("completed") === true).map((doc) => doc.ref.parent.parent?.id));
    tokenDocs = filterIncompleteTokens(tokenDocs, completeUsers);
  }
  const copy = mode === "morning"
    ? { title: "English Master 🐱", body: "오늘의 영어 공부를 시작해볼까요? 📚" }
    : { title: "English Master 🐾", body: "오늘 공부가 아직 남아 있어요. 5분만 하고 마무리해요!" };
  const chunks = Array.from({ length: Math.ceil(tokenDocs.length / 500) }, (_, index) => tokenDocs.slice(index * 500, index * 500 + 500));
  let sent = 0, removed = 0, failed = 0;
  for (const docs of chunks) {
    const response = await messaging.sendEachForMulticast({ tokens: docs.map((doc) => doc.get("token")), data: { ...copy, url: "/gbme365/" }, webpush: { fcmOptions: { link: "/gbme365/" } } });
    sent += response.successCount; failed += response.failureCount;
    const invalidRefs = response.responses.flatMap((item, index) => !item.success && isInvalidTokenError(item.error) ? [docs[index].ref] : []);
    await Promise.all(invalidRefs.map((ref) => ref.delete())); removed += invalidRefs.length;
  }
  console.log(JSON.stringify({ mode, kstDate: today, eligibleTokens: tokenDocs.length, sent, failed, invalidTokensRemoved: removed }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((error) => { console.error(error); process.exitCode = 1; });
