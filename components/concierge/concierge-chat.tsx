"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ConciergeSuggestedPrompts } from "@/components/concierge/concierge-suggested-prompts";
import { TypingIndicator } from "@/components/concierge/typing-indicator";
import { getMockConciergeReply } from "@/lib/concierge/mock-responses";
import type { ConciergeMessage, TripMode } from "@/lib/concierge/types";

const THINKING_MS = 900;

function uid() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type Props = {
  fullPage?: boolean;
  onClose?: () => void;
};

const MODE_OPTIONS: { id: TripMode; label: string }[] = [
  { id: "general", label: "Curated" },
  { id: "romantic", label: "Romantic" },
  { id: "family", label: "Family" },
  { id: "business", label: "Business" },
];

export function ConciergeChat({ fullPage = false, onClose }: Props) {
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const [input, setInput] = useState("");
  const [tripMode, setTripMode] = useState<TripMode>("general");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, isThinking, scrollToEnd]);

  const sendMessage = useCallback(
    async (text: string, mode?: TripMode) => {
      const trimmed = text.trim();
      if (!trimmed || isThinking) return;

      const activeMode = mode ?? tripMode;
      const userMsg: ConciergeMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsThinking(true);

      await new Promise((resolve) => setTimeout(resolve, THINKING_MS));

      const assistantMsg: ConciergeMessage = {
        id: uid(),
        role: "assistant",
        content: getMockConciergeReply(trimmed, activeMode),
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);
    },
    [isThinking, tripMode],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const busy = isThinking;

  return (
    <div className={`concierge-chat ${fullPage ? "concierge-chat--page" : ""}`}>
      <header className="concierge-chat__header">
        <div>
          <p className="concierge-chat__eyebrow">AvenirLux</p>
          <h2 className="concierge-chat__title font-display">AI Concierge</h2>
          <p className="concierge-chat__subtitle">Your private luxury travel counsel</p>
        </div>
        <div className="concierge-chat__header-actions">
          {fullPage ? (
            <Link href="/" className="concierge-chat__link">
              Home
            </Link>
          ) : null}
          {onClose ? (
            <button type="button" className="concierge-chat__close" onClick={onClose} aria-label="Close concierge">
              ×
            </button>
          ) : null}
        </div>
      </header>

      <div className="concierge-chat__modes" role="tablist" aria-label="Trip mode">
        {MODE_OPTIONS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={tripMode === m.id}
            className={`concierge-mode-chip ${tripMode === m.id ? "concierge-mode-chip--active" : ""}`}
            onClick={() => setTripMode(m.id)}
            disabled={busy}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="concierge-chat__messages">
        {messages.length === 0 && !isThinking ? (
          <div className="concierge-chat__welcome page-enter">
            <p className="font-display text-xl text-[var(--luxury-ink)]">Good evening. Where shall we take you?</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">
              Destinations, residences, itineraries, and hidden gems — composed with quiet precision.
            </p>
            <p className="mt-3 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
              Preview · sample responses
            </p>
            <ConciergeSuggestedPrompts onSelect={(msg, mode) => void sendMessage(msg, mode)} disabled={busy} />
          </div>
        ) : null}

        {messages.map((msg) => (
          <div key={msg.id} className={`concierge-bubble concierge-bubble--${msg.role} page-enter`}>
            <p className="concierge-bubble__content whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}

        {isThinking ? (
          <div className="concierge-bubble concierge-bubble--assistant">
            <TypingIndicator />
          </div>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="concierge-chat__composer">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for hotels, itineraries, or hidden gems…"
          className="concierge-chat__input"
          disabled={busy}
          aria-label="Message to concierge"
        />
        <button type="submit" className="btn-primary concierge-chat__send" disabled={busy || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
