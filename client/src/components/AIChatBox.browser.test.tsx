/** @vitest-environment jsdom */
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("streamdown", () => ({
  Streamdown: ({ children }: { children: string }) => children,
}));

import { AIChatBox } from "./AIChatBox";

class FakeUtterance {
  rate = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(public text: string) {}
}

describe("AIChatBox browser controls", () => {
  const speak = vi.fn();
  const cancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    class TestResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    Object.defineProperty(globalThis, "ResizeObserver", { configurable: true, value: TestResizeObserver });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: { speak, cancel } });
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: FakeUtterance });
    Object.defineProperty(globalThis, "SpeechSynthesisUtterance", { configurable: true, value: FakeUtterance });
    Element.prototype.scrollTo = vi.fn();
  });

  afterEach(() => {
    cleanup();
    delete (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition;
    delete (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
  });

  it("submits typed messages through the live workspace callback", async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();
    render(<AIChatBox messages={[]} onSendMessage={onSendMessage} height="320px" />);

    await user.type(screen.getByPlaceholderText("Type your message…"), "Draft a release plan");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(onSendMessage).toHaveBeenCalledWith("Draft a release plan");
  });

  it("explains when browser dictation is unavailable", async () => {
    const user = userEvent.setup();
    render(<AIChatBox messages={[]} onSendMessage={vi.fn()} height="320px" />);

    await waitFor(() => expect(screen.getByText("VOICE INPUT / BROWSER NOT SUPPORTED")).toBeTruthy());
    await user.click(screen.getByRole("button", { name: "Start voice dictation" }));

    expect(screen.getByText("Voice dictation is not supported by this browser. You can still type your message.")).toBeTruthy();
  });

  it("surfaces microphone permission denial and offers speech playback feedback", async () => {
    class FakeRecognition {
      continuous = false;
      interimResults = false;
      lang = "";
      onresult: ((event: Event) => void) | null = null;
      onerror: ((event: Event & { error?: string }) => void) | null = null;
      onend: (() => void) | null = null;
      start = vi.fn(() => this.onerror?.(Object.assign(new Event("error"), { error: "not-allowed" })));
      stop = vi.fn();
    }
    Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: FakeRecognition });

    const user = userEvent.setup();
    render(<AIChatBox messages={[{ role: "assistant", content: "## A concise answer" }]} onSendMessage={vi.fn()} height="320px" />);

    await user.click(screen.getByRole("button", { name: "Start voice dictation" }));
    expect(screen.getByText("Microphone permission was denied. Enable it in your browser settings to dictate messages.")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /play voice/i }));
    expect(speak).toHaveBeenCalledTimes(1);
    expect(screen.getByText("STARTING VOICE…")).toBeTruthy();

    const utterance = speak.mock.calls[0]?.[0] as FakeUtterance;
    utterance.onstart?.();
    await waitFor(() => expect(screen.getByText("STOP VOICE")).toBeTruthy());
  });
});
