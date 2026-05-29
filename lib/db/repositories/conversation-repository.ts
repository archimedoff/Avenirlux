import "server-only";

import { prisma } from "@/lib/db/prisma";

export type StoredConciergeMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  mode?: string;
};

export const conversationRepository = {
  async appendExchange(input: {
    userId: string | null;
    conversationId: string | null;
    userMessage: string;
    assistantMessage: string;
    mode?: string;
  }): Promise<string> {
    const userEntry: StoredConciergeMessage = {
      role: "user",
      content: input.userMessage,
      createdAt: new Date().toISOString(),
      mode: input.mode,
    };
    const assistantEntry: StoredConciergeMessage = {
      role: "assistant",
      content: input.assistantMessage,
      createdAt: new Date().toISOString(),
      mode: input.mode,
    };

    if (input.conversationId) {
      const existing = await prisma.conversation.findFirst({
        where: {
          id: input.conversationId,
          ...(input.userId ? { userId: input.userId } : {}),
        },
      });
      if (existing) {
        const messages = (existing.messages as StoredConciergeMessage[]) ?? [];
        await prisma.conversation.update({
          where: { id: existing.id },
          data: { messages: [...messages, userEntry, assistantEntry] },
        });
        return existing.id;
      }
    }

    const created = await prisma.conversation.create({
      data: {
        userId: input.userId,
        title: input.userMessage.slice(0, 80) || "Concierge",
        messages: [userEntry, assistantEntry],
      },
    });
    return created.id;
  },
};
