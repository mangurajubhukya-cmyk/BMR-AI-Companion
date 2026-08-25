/** @vitest-environment jsdom */
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const workspace = vi.hoisted(() => {
  const invalidate = vi.fn();
  return {
    auth: { user: { name: "Mira" }, loading: false, isAuthenticated: true, logout: vi.fn().mockResolvedValue(undefined) },
    conversations: [] as Array<{ id: number; title: string; updatedAt: Date }>,
    details: new Map<number, { conversation: { id: number; title: string }; messages: Array<{ role: "user" | "assistant"; content: string }> }>(),
    mutations: { sendOptions: undefined as any, rename: vi.fn(), delete: vi.fn() },
    toast: { error: vi.fn(), success: vi.fn() },
    startLogin: vi.fn(),
    invalidate,
  };
});

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => workspace.auth }));
vi.mock("@/const", () => ({ startLogin: workspace.startLogin }));
vi.mock("sonner", () => ({ toast: workspace.toast }));
vi.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button> }));
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/AIChatBox", () => ({
  AIChatBox: ({ messages, onSendMessage }: { messages: Array<{ content: string }>; onSendMessage: (message: string) => void }) => (
    <div data-testid="chat-surface"><span data-testid="message-count">{messages.length}</span><button onClick={() => onSendMessage("Verify live response")}>Send test message</button></div>
  ),
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ conversations: { list: { invalidate: workspace.invalidate }, get: { invalidate: workspace.invalidate } } }),
    conversations: {
      list: { useQuery: () => ({ data: workspace.conversations, isLoading: false }) },
      get: { useQuery: (input: { conversationId: number }) => ({ data: workspace.details.get(input.conversationId), isLoading: false }) },
      send: { useMutation: (options: unknown) => { workspace.mutations.sendOptions = options; return { mutate: vi.fn(), isPending: false }; } },
      
      rename: { useMutation: () => ({ mutate: workspace.mutations.rename }) },
      delete: { useMutation: () => ({ mutate: workspace.mutations.delete }) },
    },
    billing: { checkout: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) } },
  },
}));

import Home from "./Home";

function seedWorkspace() {
  const now = new Date();
  workspace.conversations = [
    { id: 1, title: "First decision", updatedAt: now },
    { id: 2, title: "Missing record", updatedAt: now },
  ];
  workspace.details = new Map([[1, { conversation: { id: 1, title: "First decision" }, messages: [{ role: "assistant", content: "Saved answer" }] }]]);
}

describe("Companion workspace browser-like controls", () => {
  beforeEach(() => {
    cleanup();
    seedWorkspace();
    workspace.auth = { user: { name: "Mira" }, loading: false, isAuthenticated: true, logout: vi.fn().mockResolvedValue(undefined) };
    workspace.mutations.sendOptions = undefined;
    workspace.mutations.rename.mockReset();
    workspace.mutations.delete.mockReset();
    workspace.toast.error.mockReset();
    workspace.toast.success.mockReset();
    workspace.startLogin.mockReset();
    vi.stubGlobal("prompt", vi.fn(() => "Renamed decision"));
  });

  afterEach(() => {
    cleanup();
    window.history.replaceState({}, "", "/");
    vi.unstubAllGlobals();
  });

  it("selects sidebar history, tolerates a missing conversation, and invokes rename/delete controls", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(screen.getByRole("heading", { name: "First decision" })).toBeTruthy());

    await user.click(screen.getAllByRole("button", { name: /Missing record/ })[0]);
    await waitFor(() => expect(screen.getByRole("heading", { name: "New conversation" })).toBeTruthy());

    await user.click(screen.getAllByRole("button", { name: "New chat" })[0]);
    expect(screen.getByRole("heading", { name: "New conversation" })).toBeTruthy();
    expect(screen.getByTestId("message-count").textContent).toBe("0");

    await user.click(screen.getAllByLabelText("Rename First decision")[0]);
    expect(workspace.mutations.rename).toHaveBeenCalledWith({ conversationId: 1, title: "Renamed decision" });
    await user.click(screen.getAllByLabelText("Delete First decision")[0]);
    expect(workspace.mutations.delete).toHaveBeenCalledWith({ conversationId: 1 });
  });

  it("handles profile logout and reports AI failures through an actionable toast", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getAllByRole("button", { name: "Sign out" })[0]);
    await waitFor(() => expect(workspace.auth.logout).toHaveBeenCalledTimes(1));

    const sendOptions = workspace.mutations.sendOptions as { onError: (error: { message: string }) => void };
    sendOptions.onError({ message: "Model provider unavailable" });
    expect(workspace.toast.error).toHaveBeenCalled();
  });

  it("offers the signed-out workspace entry route", async () => {
    const user = userEvent.setup();
    workspace.auth = { user: null as unknown as { name: string }, loading: false, isAuthenticated: false, logout: vi.fn() };
    render(<Home />);
    await user.click(screen.getByRole("button", { name: /Open your workspace/i }));
    expect(workspace.startLogin).toHaveBeenCalledTimes(1);
  });

  it("shows a clear BMR Pro return state after successful Stripe Checkout", async () => {
    window.history.replaceState({}, "", "/?checkout=success");
    render(<Home />);

    await waitFor(() => expect(workspace.toast.success).toHaveBeenCalledWith(
      "BMR Pro checkout complete",
      expect.objectContaining({ description: expect.stringContaining("Stripe subscription") })
    ));
  });
});
