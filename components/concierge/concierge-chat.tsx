"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ConciergeHotelCards } from "@/components/concierge/concierge-hotel-cards";
import { ConciergeSuggestedPrompts } from "@/components/concierge/concierge-suggested-prompts";
import { TypingIndicator } from "@/components/concierge/typing-indicator";
import type {
  ConciergeMessage,
  ConciergeStreamEvent,
  TripMode,
} from "@/lib/concierge/types";

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
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, streamText, streaming, scrollToEnd]);

  const sendMessage = useCallback(
    async (text: string, mode?: TripMode) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      const userMsg: ConciergeMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setStreaming(true);
      setStreamText("");

      const activeMode = mode ?? tripMode;
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let accumulated = "";
      let hotels: ConciergeMessage["hotels"];
      let meta: ConciergeMessage["meta"];

      try {
        const res = await fetch("/api/concierge/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history, mode: activeMode }),
          signal: ac.signal,
        });

        if (!res.ok || !res.body) throw new Error("Stream failed");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data: ")) continue;
            const event = JSON.parse(line.slice(6)) as ConciergeStreamEvent;
            if (event.type === "token") {
              accumulated += event.text;
              setStreamText(accumulated);
            } else if (event.type === "meta") {
              meta = event.meta;
            } else if (event.type === "hotels") {
              hotels = event.hotels;
            } else if (event.type === "error") {
              accumulated += `\n\n${event.message}`;
              setStreamText(accumulated);
            }
          }
        }

        const assistantMsg: ConciergeMessage = {
          id: uid(),
          role: "assistant",
          content: accumulated || "I am at your service — how may we refine your journey?",
          createdAt: Date.now(),
          hotels,
          meta,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setStreamText("");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content: "Forgive the interruption — our concierge is momentarily unavailable. Please try again.",
            createdAt: Date.now(),
          },
        ]);
        setStreamText("");
      } finally {
        setStreaming(false);
      }
    },
    [messages, streaming, tripMode],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

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
            disabled={streaming}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="concierge-chat__messages">
        {messages.length === 0 && !streaming ? (
          <div className="concierge-chat__welcome page-enter">
            <p className="font-display text-xl text-[var(--luxury-ink)]">
              Good evening. Where shall we take you?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">
              Destinations, residences, itineraries, and hidden gems — composed with quiet precision.
            </p>
            <ConciergeSuggestedPrompts onSelect={(msg, mode) => void sendMessage(msg, mode)} />
          </div>
        ) : null}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`concierge-bubble concierge-bubble--${msg.role} page-enter`}
          >
            <p className="concierge-bubble__content whitespace-pre-wrap">{msg.content}</p>
            {msg.hotels?.length ? (
              <ConciergeHotelCards hotels={msg.hotels} city={msg.meta?.city} />
            ) : null}
          </div>
        ))}

        {streaming ? (
          <div className="concierge-bubble concierge-bubble--assistant">
            {streamText ? (
              <p className="concierge-bubble__content whitespace-pre-wrap">{streamText}</p>
            ) : (
              <TypingIndicator />
            )}
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
          disabled={streaming}
          aria-label="Message to concierge"
        />
        <button type="submit" className="btn-primary concierge-chat__send" disabled={streaming || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
