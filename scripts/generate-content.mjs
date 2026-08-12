import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = join(root, "generated-content.json");
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("OPENAI_API_KEY is required");

const generated = JSON.parse(await readFile(outputPath, "utf8"));
const nextDay = Math.max(30, ...generated.days.map((day) => day.day)) + 1;
const review = nextDay % 5 === 0;
const previous = generated.days.slice(-30);
const previousSentences = previous.flatMap((day) => day.sentences.map((sentence) => sentence.text));
const previousWords = previous.flatMap((day) => day.words.map((word) => word.word));
const recentForReview = previous.slice(-4);

const prompt = `Create Day ${nextDay} for a Korean learner's global business English app.
Type: ${review ? "review (reuse and combine concepts from the preceding four days, but write fresh sentences and examples)" : "learn"}.
Return exactly 2 practical English sentences with natural Korean meanings and 2 lowercase English tags each.
Return exactly 5 useful words or short phrases, each with a concise Korean meaning and one natural English example.
Use globally applicable business situations such as collaboration, planning, leadership, negotiation, customer work, finance, strategy, projects, or communication. Avoid industry-specific jargon, medical topics, botulinum toxin, slang, and culture-specific idioms.
Choose a focused topic distinct from recent topics. Avoid duplicating or closely paraphrasing these sentences: ${JSON.stringify(previousSentences)}.
Avoid reusing these vocabulary headwords when practical: ${JSON.stringify(previousWords)}.
${review ? `Base the review on this recent material: ${JSON.stringify(recentForReview)}.` : ""}
IDs must be d${nextDay}s1, d${nextDay}s2 and d${nextDay}w1 through d${nextDay}w5. The day must be ${nextDay} and type must be ${review ? '"review"' : '"learn"'}.`;

const schema = {
  type: "object", additionalProperties: false,
  required: ["day", "type", "focus", "mission", "sentences", "words"],
  properties: {
    day: { type: "integer", const: nextDay },
    type: { type: "string", enum: [review ? "review" : "learn"] },
    focus: { type: "string" }, mission: { type: "string" },
    sentences: { type: "array", minItems: 2, maxItems: 2, items: { type: "object", additionalProperties: false, required: ["id", "text", "meaning", "tags"], properties: { id: { type: "string" }, text: { type: "string" }, meaning: { type: "string" }, tags: { type: "array", minItems: 2, maxItems: 2, items: { type: "string" } } } } },
    words: { type: "array", minItems: 5, maxItems: 5, items: { type: "object", additionalProperties: false, required: ["id", "word", "meaning", "example"], properties: { id: { type: "string" }, word: { type: "string" }, meaning: { type: "string" }, example: { type: "string" } } } }
  }
};

const response = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
  body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5.4-nano", input: prompt, text: { format: { type: "json_schema", name: "learning_day", strict: true, schema } } })
});
if (!response.ok) throw new Error(`OpenAI API failed (${response.status}): ${await response.text()}`);
const result = await response.json();
const text = result.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text;
if (!text) throw new Error("The API returned no structured output");
const next = JSON.parse(text);

if (next.sentences.length !== 2 || next.words.length !== 5) throw new Error("Invalid item counts");
if (new Set([...previousSentences, ...next.sentences.map((item) => item.text)]).size !== previousSentences.length + 2) throw new Error("Duplicate sentence detected");
if (next.type !== (review ? "review" : "learn")) throw new Error("Invalid day type");
generated.days.push(next);
generated.generatedAt = new Date().toISOString();
await writeFile(outputPath, `${JSON.stringify(generated, null, 2)}\n`, "utf8");
console.log(`Generated Day ${nextDay} (${next.type})`);
