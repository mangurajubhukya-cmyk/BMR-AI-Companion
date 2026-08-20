import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createConversation: vi.fn(),
  createMessage: vi.fn(),
  deleteConversation: vi.fn(),
  getConversationForUser: vi.fn(),
  invokeLLM: vi.fn(),
  listConversationMessages: vi.fn(),
  listConversationSummaries: vi.fn(),
  listLLMModels: vi.fn(),
  renameConversation: vi.fn(),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: mocks.invokeLLM,
  listLLMModels: mocks.listLLMModels,
}));

vi.mock("./db", () => ({
  createConversation: mocks.createConversation,
  createMessage: mocks.createMessage,
  deleteConversation: mocks.deleteConversation,
  getConversationForUser: mocks.getConversationForUser,
  listConversationMessages: mocks.listConversationMessages,
  listConversationSummaries: mocks.listConversationSummaries,
  renameConversation: mocks.renameConversation,
}));

import { appRouter } from "./routers";

const user = {
  id: 1,
  openId: "test-user",
  email: "test@example.com",
  name: "Test User",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createAuthContext(): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("conversations.send model failure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createConversation.mockResolvedValue(42);
    mocks.getConversationForUser.mockResolvedValue({ id: 42, userId: 1, title: "Test chat" });
    mocks.createMessage.mockResolvedValue(1);
    mocks.listConversationMessages.mockResolvedValue([{ id: 1, conversationId: 42, role: "user", content: "Hello", createdAt: new Date() }]);
    mocks.listLLMModels.mockResolvedValue({ data: [{ id: "gpt-4o-mini" }] });
    mocks.invokeLLM.mockRejectedValue(new Error("Model temporarily unavailable"));
  });

  it("surfaces the model failure to the client after recording the user message", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    await expect(caller.conversations.send({ content: "Hello" })).rejects.toThrow("Model temporarily unavailable");
    expect(mocks.createMessage).toHaveBeenCalledWith({ conversationId: 42, role: "user", content: "Hello" });
  });
});
