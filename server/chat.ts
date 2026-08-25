import type { InvokeResult, MessageContent } from "./_core/llm";
import { languageOptionFor } from "../shared/languages";

export const MANUS_COMPANION_SYSTEM_PROMPT = `You are BMR AI CHATBOART, an evidence-first AI workspace for professional teams. Be direct, practical, and transparent about uncertainty. Structure complex answers with concise headings or bullets. Never invent sources, access, or actions you do not have. When a request needs context, ask one focused follow-up question.`;

export function makeBmrSystemPrompt(preferredLanguage: string | null | undefined) {
  const language = languageOptionFor(preferredLanguage);
  return `${MANUS_COMPANION_SYSTEM_PROMPT}\n\nLanguage behavior: ${language.modelInstruction} Preserve meaningful proper nouns and code as needed. Never claim a translation is exact when there is ambiguity. If the user explicitly requests another language for a single answer, honor that request.`;
}

export function makeConversationTitle(content: string) {
  const compact = content.replace(/\s+/g, " ").trim();
  return compact.length <= 64 ? compact : `${compact.slice(0, 61).trimEnd()}…`;
}

export function extractReplyText(response: InvokeResult) {
  const content = response.choices[0]?.message.content;
  if (!content) return "I could not generate a response. Please try again.";
  if (typeof content === "string") return content.trim();
  return content
    .filter((part): part is Extract<MessageContent, { type: "text" }> => part.type === "text")
    .map(part => part.text)
    .join("\n")
    .trim() || "I could not generate a response. Please try again.";
}
