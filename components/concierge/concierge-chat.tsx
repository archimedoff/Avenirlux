"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ConciergeHotelCards } from "@/components/concierge/concierge-hotel-cards";
import { ConciergeSuggestedPrompts } from "@/components/concierge/concierge-suggested-prompts";
import { TypingIndicator } from "@/components/concierge/typing-indicator";
import { useTranslations } from "@/lib/i18n/use-translations";
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

type RetryPayload = { text: string; mode: TripMode };

export function ConciergeChat({ fullPage = false, onClose }: Props) {
  const { t } = useTranslations("concierge");
  const { t: tc } = useTranslations("common");
  const MODE_OPTIONS: { id: TripMode; label: string }[] = [
    { id: "general", label: t("modeGeneral") },
    { id: "romantic", label: t("modeRomantic") },
    { id: "family", label: t("modeFamily") },
    { id: "business", label: t("modeBusiness") },
  ];
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const [input, setInput] = useState("");
  const [tripMode, setTripMode] = useState<TripMode>("general");
  const [isThinking, setIsThinking] = useState(false);
  const [providerLabel, setProviderLabel] = useState<string | null>(null);
  const [retryPayload, setRetryPayload] = useState<RetryPayload | null>(null);
  const [openAiConfigured, setOpenAiConfigured] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, isThinking, retryPayload, scrollToEnd]);

  useEffect(() => {
    fetch("/api/concierge/health")
      .then((r) => r.json())
      .then((data: { openai?: { configured?: boolean } }) => {
        setOpenAiConfigured(Boolean(data.openai?.configured));
      })
      .catch(() => setOpenAiConfigured(null));
  }, []);

  const sendMessage = useCallback(
    async (text: string, mode?: TripMode) => {
      const trimmed = text.trim();
      if (!trimmed || isThinking) return;

      const activeMode = mode ?? tripMode;
      setRetryPayload(null);

      const userMsg: ConciergeMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };

      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsThinking(true);

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;

      const assistantId = uid();
      let assistantContent = "";
      let assistantHotels: ConciergeMessage["hotels"];
      let assistantMeta: ConciergeMessage["meta"];
      let streamFailed = false;

      const upsertAssistant = () => {
        if (streamFailed && !assistantContent) return;
        setMessages((prev) => {
          const rest = prev.filter((m) => m.id !== assistantId);
          return [
            ...rest,
            {
              id: assistantId,
              role: "assistant" as const,
              content: assistantContent,
              createdAt: Date.now(),
              hotels: assistantHotels,
              meta: assistantMeta,
            },
          ];
        });
      };

      const removeAssistantPlaceholder = () => {
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      };

      try {
        const res = await fetch("/api/concierge/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, mode: activeMode, history }),
          signal: abort.signal,
        });

        if (res.status === 429) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          removeAssistantPlaceholder();
          setRetryPayload({ text: trimmed, mode: activeMode });
          assistantContent = data.error ?? t("rateLimit");
          streamFailed = true;
          upsertAssistant();
          return;
        }

        if (!res.ok || !res.body) {
          removeAssistantPlaceholder();
          setRetryPayload({ text: trimmed, mode: activeMode });
          assistantContent = t("serviceError");
          streamFailed = true;
          upsertAssistant();
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let receivedToken = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;

            let event: ConciergeStreamEvent;
            try {
              event = JSON.parse(line.slice(5).trim()) as ConciergeStreamEvent;
            } catch {
              continue;
            }

            if (event.type === "token") {
              if (!receivedToken) {
                receivedToken = true;
                setIsThinking(false);
              }
              assistantContent += event.text;
              upsertAssistant();
            } else if (event.type === "meta") {
              assistantMeta = { mode: event.mode, city: event.city };
              setProviderLabel(event.aiStatus === "live" ? t("liveCounsel") : null);
              upsertAssistant();
            } else if (event.type === "hotels") {
              assistantHotels = event.hotels;
              upsertAssistant();
            } else if (event.type === "failure" && event.retryable) {
              removeAssistantPlaceholder();
              setRetryPayload({ text: trimmed, mode: activeMode });
              streamFailed = true;
            } else if (event.type === "error") {
              removeAssistantPlaceholder();
              setRetryPayload({ text: trimmed, mode: activeMode });
              assistantContent = t("requestError");
              streamFailed = true;
              upsertAssistant();
            }
          }
        }

        if (!receivedToken && !streamFailed && !assistantContent) {
          removeAssistantPlaceholder();
          setRetryPayload({ text: trimmed, mode: activeMode });
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        removeAssistantPlaceholder();
        setRetryPayload({ text: trimmed, mode: activeMode });
        assistantContent = t("connectionError");
        streamFailed = true;
        upsertAssistant();
      } finally {
        setIsThinking(false);
        abortRef.current = null;
      }
    },
    [isThinking, tripMode, messages, t],
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
          <p className="concierge-chat__eyebrow">{t("eyebrow")}</p>
          <h2 className="concierge-chat__title font-display">{t("title")}</h2>
          <p className="concierge-chat__subtitle">
            {t("subtitle")}
            {providerLabel ? (
              <span className="concierge-chat__provider"> · {providerLabel}</span>
            ) : null}
          </p>
        </div>
        <div className="concierge-chat__header-actions">
          {fullPage ? (
            <Link href="/" className="concierge-chat__link">
              {tc("home")}
            </Link>
          ) : null}
          {onClose ? (
            <button type="button" className="concierge-chat__close" onClick={onClose} aria-label={t("close")}>
              ×
            </button>
          ) : null}
        </div>
      </header>

      <div className="concierge-chat__modes" role="tablist" aria-label={t("tripModeLabel")}>
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
        {openAiConfigured === false && messages.length === 0 && !isThinking ? (
          <div className="concierge-setup-hint page-enter" role="status">
            <p className="font-medium text-[var(--luxury-ink)]">{t("setupTitle")}</p>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">{t("setupHint")}</p>
          </div>
        ) : null}

        {messages.length === 0 && !isThinking && openAiConfigured !== false ? (
          <div className="concierge-chat__welcome page-enter">
            <p className="font-display text-xl text-[var(--luxury-ink)]">{t("welcomeTitle")}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">
              {t("welcomeBody")}
            </p>
            <p className="mt-3 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
              {t("welcomeHint")}
            </p>
            <ConciergeSuggestedPrompts onSelect={(msg, mode) => void sendMessage(msg, mode)} disabled={busy} />
          </div>
        ) : null}

        {messages.map((msg) => (
          <div key={msg.id} className={`concierge-bubble concierge-bubble--${msg.role} page-enter`}>
            {msg.content ? (
              <p className="concierge-bubble__content whitespace-pre-wrap">{msg.content}</p>
            ) : null}
            {msg.role === "assistant" && msg.hotels?.length ? (
              <ConciergeHotelCards hotels={msg.hotels} />
            ) : null}
          </div>
        ))}

        {retryPayload ? (
          <div className="concierge-error-banner page-enter" role="alert">
            <p className="text-sm text-[var(--foreground-muted)]">{t("serviceError")}</p>
            <button
              type="button"
              className="btn-secondary mt-3 text-sm"
              disabled={busy}
              onClick={() => {
                const payload = retryPayload;
                setRetryPayload(null);
                void sendMessage(payload.text, payload.mode);
              }}
            >
              {t("retry")}
            </button>
          </div>
        ) : null}

        {isThinking ? (
          <div className="concierge-bubble concierge-bubble--assistant">
            <p className="sr-only">{t("composing")}</p>
            <TypingIndicator />
          </div>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="concierge-chat__composer">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("inputPlaceholder")}
          className="concierge-chat__input"
          disabled={busy}
          aria-label={t("inputAria")}
          aria-busy={busy}
        />
        <button type="submit" className="btn-primary concierge-chat__send" disabled={busy || !input.trim()}>
          {busy ? "…" : tc("send")}
        </button>
      </form>
    </div>
  );
}
