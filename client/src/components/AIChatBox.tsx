/**
 * Working chat interface with message history, browser voice dictation, and speech playback for assistant responses.
 * It is intentionally UI-focused: its parent supplies the persistent messages and real tRPC mutation behavior.
 */
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { textForSpeech } from "@/lib/voice";
import { cn } from "@/lib/utils";
import { AlertCircle, Loader2, Mic, MicOff, Send, Sparkles, Square, User, Volume2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

type SpeechResult = { isFinal: boolean; [index: number]: { transcript: string } };
type SpeechRecognitionEventLike = Event & { results: { length: number; [index: number]: SpeechResult } };
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionConstructor = new () => SpeechRecognitionLike;

export type AIChatBoxProps = {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  height?: string | number;
  emptyStateMessage?: string;
  suggestedPrompts?: string[];
  speechLocale?: string;
};

export function AIChatBox({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message…",
  className,
  height = "600px",
  emptyStateMessage = "Start a conversation with AI",
  suggestedPrompts,
  speechLocale = "auto",
}: AIChatBoxProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState<boolean | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [startingSpeechIndex, setStartingSpeechIndex] = useState<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const displayMessages = messages.filter(message => message.role !== "system");

  useEffect(() => {
    const recognizer = (window as typeof window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }).SpeechRecognition
      ?? (window as typeof window & { webkitSpeechRecognition?: RecognitionConstructor }).webkitSpeechRecognition;
    setVoiceSupported(Boolean(recognizer));
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLDivElement | null;
    viewport?.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
  }, [displayMessages.length, isLoading]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;
    window.speechSynthesis?.cancel();
    setSpeakingIndex(null);
    setStartingSpeechIndex(null);
    onSendMessage(message);
    setInput("");
    textareaRef.current?.focus();
  }

  function toggleDictation() {
    if (!voiceSupported) {
      setVoiceError("Voice dictation is not supported by this browser. You can still type your message.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognizer = (window as typeof window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }).SpeechRecognition
      ?? (window as typeof window & { webkitSpeechRecognition?: RecognitionConstructor }).webkitSpeechRecognition;
    if (!recognizer) return;

    const recognition = new recognizer();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = speechLocale === "auto" ? navigator.language || "en-US" : speechLocale;
    recognition.onresult = event => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) transcript += event.results[index][0]?.transcript ?? "";
      setInput(transcript.trim());
    };
    recognition.onerror = event => {
      setVoiceError(event.error === "not-allowed" ? "Microphone permission was denied. Enable it in your browser settings to dictate messages." : "Voice dictation stopped unexpectedly. Please try again or type your message.");
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setVoiceError(null);
    setIsListening(true);
    recognition.start();
  }

  function toggleSpeech(content: string, index: number) {
    if (!("speechSynthesis" in window)) {
      setVoiceError("Voice playback is not supported by this browser.");
      return;
    }
    if (speakingIndex === index || startingSpeechIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      setStartingSpeechIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textForSpeech(content));
    const preferredLocale = speechLocale === "auto" ? navigator.language || "en-US" : speechLocale;
    utterance.lang = preferredLocale;
    const voices = typeof window.speechSynthesis.getVoices === "function" ? window.speechSynthesis.getVoices() : [];
    const matchingVoice = voices.find(voice => voice.lang.toLowerCase() === preferredLocale.toLowerCase())
      ?? voices.find(voice => voice.lang.split("-")[0]?.toLowerCase() === preferredLocale.split("-")[0]?.toLowerCase());
    if (matchingVoice) utterance.voice = matchingVoice;
    else if (speechLocale !== "auto") setVoiceError(`A ${preferredLocale} voice is not installed in this browser. Playback may use the device default voice.`);
    utterance.rate = 1;
    utterance.onstart = () => {
      setStartingSpeechIndex(current => current === index ? null : current);
      setSpeakingIndex(index);
    };
    utterance.onend = () => {
      setStartingSpeechIndex(null);
      setSpeakingIndex(current => current === index ? null : current);
    };
    utterance.onerror = () => {
      setVoiceError("Voice playback could not start. Please try again.");
      setSpeakingIndex(null);
      setStartingSpeechIndex(null);
    };
    setVoiceError(null);
    setStartingSpeechIndex(index);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className={cn("flex flex-col bg-card text-card-foreground", className)} style={{ height }}>
      <div ref={viewportRef} className="min-h-0 flex-1 overflow-hidden">
        {displayMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <Sparkles className="size-12 text-primary/40" />
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">{emptyStateMessage}</p>
            {suggestedPrompts?.length ? <div className="mt-7 flex max-w-2xl flex-wrap justify-center gap-2">{suggestedPrompts.map(prompt => <button key={prompt} type="button" disabled={isLoading} onClick={() => onSendMessage(prompt)} className="rounded-sm border border-white/15 bg-white/[.02] px-4 py-2 text-left text-sm text-[#c6cac0] transition-colors hover:border-[#c7f36b]/45 hover:bg-[#c7f36b]/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">{prompt}</button>)}</div> : null}
          </div>
        ) : (
          <ScrollArea className="h-full"><div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-5 sm:p-8">{displayMessages.map((message, index) => <div key={`${message.role}-${index}`} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" ? <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10"><Sparkles className="size-4 text-primary" /></div> : null}
            <div className={cn("max-w-[86%] rounded-sm px-4 py-3 text-sm leading-6 sm:max-w-[78%]", message.role === "user" ? "bg-primary text-primary-foreground" : "border border-white/10 bg-white/[.035] text-[#dcddd5]")}>
              {message.role === "assistant" ? <><div className="prose prose-sm dark:prose-invert max-w-none"><Streamdown>{message.content}</Streamdown></div><button type="button" onClick={() => toggleSpeech(message.content, index)} className="mt-2 inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[.09em] text-[#9fa69a] transition-colors hover:text-[#c7f36b]">{startingSpeechIndex === index ? <><Loader2 className="size-3 animate-spin" /> STARTING VOICE…</> : speakingIndex === index ? <><Square className="size-3 fill-current" /> STOP VOICE</> : <><Volume2 className="size-3" /> PLAY VOICE</>}</button></> : <p className="whitespace-pre-wrap">{message.content}</p>}
            </div>
            {message.role === "user" ? <div className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary"><User className="size-4 text-secondary-foreground" /></div> : null}
          </div>)}
          {isLoading ? <div className="flex items-start gap-3"><div className="grid size-8 place-items-center rounded-full bg-primary/10"><Sparkles className="size-4 text-primary" /></div><div className="rounded-sm border border-white/10 bg-white/[.035] px-4 py-3"><Loader2 className="size-4 animate-spin text-primary" /></div></div> : null}
          </div></ScrollArea>
        )}
      </div>
      {voiceError ? <div className="mx-4 mb-1 flex items-start gap-2 border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-xs leading-5 text-amber-100/80"><AlertCircle className="mt-0.5 size-3.5 shrink-0" /> <span>{voiceError}</span><button type="button" className="ml-auto text-[10px] uppercase tracking-[.1em] text-amber-100" onClick={() => setVoiceError(null)}>Dismiss</button></div> : null}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-white/10 bg-black/10 p-4">
        <Textarea ref={textareaRef} value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder={placeholder} className="min-h-10 max-h-32 flex-1 resize-none border-white/15 bg-white/[.025] text-[#ecede5] placeholder:text-[#737a70] focus-visible:ring-[#c7f36b]" rows={1} />
        <Button type="button" variant="outline" onClick={toggleDictation} disabled={isLoading} className={cn("size-10 shrink-0 rounded-sm border-white/15 bg-transparent p-0 text-[#c9cdc3] hover:bg-white/10 hover:text-[#c7f36b]", isListening && "border-[#c7f36b]/70 bg-[#c7f36b]/10 text-[#c7f36b]")} aria-label={isListening ? "Stop voice dictation" : "Start voice dictation"}>{isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}</Button>
        <Button type="submit" disabled={!input.trim() || isLoading} className="size-10 shrink-0 rounded-sm bg-primary p-0 text-primary-foreground hover:bg-[#dafb94]" aria-label="Send message">{isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}</Button>
      </form>
      <p className="border-t border-white/5 px-4 py-2 font-mono text-[8px] tracking-[.07em] text-[#72796f]">{isListening ? "VOICE INPUT / LISTENING…" : voiceSupported === false ? "VOICE INPUT / BROWSER NOT SUPPORTED" : "VOICE INPUT / MIC • VOICE OUTPUT / PLAY"}</p>
    </div>
  );
}
