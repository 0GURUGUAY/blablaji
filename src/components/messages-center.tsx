"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { SectionTitle } from "@/components/section-title";
import type { Locale } from "@/lib/locale";
import { getLocalizedContent } from "@/lib/content";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  ensureConversationForBooking,
  fetchConversationMessages,
  fetchMyConversations,
  sendConversationMessage,
  type ConversationMessageRecord,
  type ConversationSummaryRecord,
} from "@/lib/supabase/messages";

type MessagesCenterProps = {
  locale: Locale;
  rideId?: string;
  passengerId?: string;
};

const copy = {
  es: {
    loadingInbox: "Cargando conversaciones...",
    loadingMessages: "Cargando mensajes...",
    emptyInbox: "Todavia no tienes conversaciones.",
    emptyConversation: "Selecciona una conversacion o abre una desde una reserva para empezar a coordinar.",
    linkedOnlyTitle: "Mensajes ligados a un viaje",
    linkedOnlyDescription: "No hay mensajeria libre: una conversacion solo se crea desde una reserva o un viaje compartido.",
    replyPlaceholder: "Escribir un mensaje claro y util...",
    sendError: "No se pudo enviar el mensaje.",
    inboxError: "No se pudo cargar la mensajeria.",
    startError: "No se pudo abrir la conversacion desde esta reserva.",
    validation: "Escribe un mensaje antes de enviarlo.",
    role: {
      driver: "Conductor",
      passenger: "Pasajero",
    },
    activeConversation: "Conversacion activa",
    noMessages: "Todavia no hay mensajes en esta conversacion.",
  },
  fr: {
    loadingInbox: "Chargement des conversations...",
    loadingMessages: "Chargement des messages...",
    emptyInbox: "Tu n'as pas encore de conversations.",
    emptyConversation: "Selectionne une conversation ou ouvre-en une depuis une reservation pour commencer a coordonner.",
    linkedOnlyTitle: "Messages relies a un trajet",
    linkedOnlyDescription: "Il n'y a pas de messagerie libre : une conversation ne se cree que depuis une reservation ou un trajet partage.",
    replyPlaceholder: "Ecrire un message clair et utile...",
    sendError: "Impossible d'envoyer le message.",
    inboxError: "Impossible de charger la messagerie.",
    startError: "Impossible d'ouvrir la conversation depuis cette reservation.",
    validation: "Ecris un message avant de l'envoyer.",
    role: {
      driver: "Conducteur",
      passenger: "Passager",
    },
    activeConversation: "Conversation active",
    noMessages: "Aucun message dans cette conversation pour le moment.",
  },
} as const;

function formatTimestamp(locale: Locale, value: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "es-UY", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function Avatar({ label, imageUrl }: { label: string; imageUrl: string }) {
  return (
    <div
      className={[
        "flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold uppercase",
        imageUrl ? "bg-cover bg-center text-transparent" : "bg-[var(--uy-deep)] text-[var(--uy-paper)]",
      ].join(" ")}
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      aria-hidden="true"
    >
      {imageUrl ? "avatar" : (label.trim()[0] ?? "U")}
    </div>
  );
}

export function MessagesCenter({ locale, rideId, passengerId }: MessagesCenterProps) {
  const content = getLocalizedContent(locale);
  const ui = copy[locale];
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [conversations, setConversations] = useState<ConversationSummaryRecord[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessageRecord[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoadingInbox, setIsLoadingInbox] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  );

  useEffect(() => {
    let isMounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    async function loadInbox() {
      if (!session?.user) {
        setConversations([]);
        setActiveConversationId(null);
        setMessages([]);
        setIsLoadingInbox(false);
        return;
      }

      setIsLoadingInbox(true);
      setError(null);

      try {
        let targetConversationId: string | null = null;

        if (rideId && passengerId) {
          try {
            targetConversationId = await ensureConversationForBooking(supabase, rideId, passengerId);
          } catch (conversationError) {
            if (!cancelled) {
              setError(`${ui.startError} ${conversationError instanceof Error ? conversationError.message : ""}`.trim());
            }
          }
        }

        const nextConversations = await fetchMyConversations(supabase);

        if (cancelled) {
          return;
        }

        setConversations(nextConversations);
        setActiveConversationId((current) => {
          if (targetConversationId && nextConversations.some((conversation) => conversation.id === targetConversationId)) {
            return targetConversationId;
          }

          if (current && nextConversations.some((conversation) => conversation.id === current)) {
            return current;
          }

          return nextConversations[0]?.id ?? null;
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(`${ui.inboxError} ${loadError instanceof Error ? loadError.message : ""}`.trim());
          setConversations([]);
          setActiveConversationId(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingInbox(false);
        }
      }
    }

    void loadInbox();

    return () => {
      cancelled = true;
    };
  }, [passengerId, rideId, session, supabase, ui.inboxError, ui.startError]);

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      if (!activeConversationId) {
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);

      try {
        const nextMessages = await fetchConversationMessages(supabase, activeConversationId);

        if (!cancelled) {
          setMessages(nextMessages);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(`${ui.inboxError} ${loadError instanceof Error ? loadError.message : ""}`.trim());
          setMessages([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMessages(false);
        }
      }
    }

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [activeConversationId, supabase, ui.inboxError]);

  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeConversationId) {
      return;
    }

    if (!draft.trim()) {
      setError(ui.validation);
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await sendConversationMessage(supabase, activeConversationId, draft.trim());
      setDraft("");

      const [nextMessages, nextConversations] = await Promise.all([
        fetchConversationMessages(supabase, activeConversationId),
        fetchMyConversations(supabase),
      ]);

      setMessages(nextMessages);
      setConversations(nextConversations);
    } catch (sendError) {
      setError(`${ui.sendError} ${sendError instanceof Error ? sendError.message : ""}`.trim());
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.88)] p-6 shadow-[0_20px_60px_-45px_rgba(31,77,107,0.22)]">
        <SectionTitle eyebrow={content.messages.eyebrow} title={content.messages.title} description={content.messages.description} />

        <div className="mt-6 rounded-[24px] border border-[color:rgba(19,89,135,0.12)] bg-[linear-gradient(180deg,rgba(247,251,253,0.94),rgba(239,247,252,0.78))] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--uy-deep)]">{ui.linkedOnlyTitle}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{ui.linkedOnlyDescription}</p>
        </div>

        {error ? <p className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</p> : null}

        <div className="mt-6 space-y-3">
          {isLoadingInbox ? <p className="rounded-[24px] bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-600">{ui.loadingInbox}</p> : null}

          {!isLoadingInbox && conversations.length === 0 ? <p className="rounded-[24px] bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-600">{ui.emptyInbox}</p> : null}

          {conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setActiveConversationId(conversation.id)}
                className={[
                  "block w-full rounded-[24px] border p-4 text-left transition",
                  isActive
                    ? "border-[var(--uy-deep)] bg-[color:rgba(19,89,135,0.08)] shadow-[0_18px_40px_-34px_rgba(31,77,107,0.32)]"
                    : "border-transparent bg-[var(--uy-sky-pale)] hover:border-[var(--uy-line)]",
                ].join(" ")}
              >
                <div className="flex items-start gap-4">
                  <Avatar label={conversation.counterpartName} imageUrl={conversation.counterpartAvatarUrl} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{conversation.counterpartName}</p>
                        <p className="text-sm text-slate-500">{ui.role[conversation.role]} · {conversation.route}</p>
                      </div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{formatTimestamp(locale, conversation.lastMessageAt || conversation.createdAt)}</p>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{conversation.lastMessage || content.messages.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <article className="flex min-h-[560px] flex-col rounded-[32px] bg-[linear-gradient(160deg,var(--uy-deep),#0a78d1)] p-6 text-[var(--uy-paper)] shadow-[0_24px_70px_-50px_rgba(0,91,187,0.55)]">
        {activeConversation ? (
          <>
            <div className="border-b border-white/10 pb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--uy-sky)]">{ui.activeConversation}</p>
              <h1 className="mt-2 font-serif text-2xl sm:text-3xl">{activeConversation.counterpartName} · {activeConversation.route}</h1>
            </div>

            <div className="flex-1 space-y-4 py-6">
              {isLoadingMessages ? <p className="text-sm text-[color:rgba(236,247,255,0.88)]">{ui.loadingMessages}</p> : null}
              {!isLoadingMessages && messages.length === 0 ? <p className="text-sm text-[color:rgba(236,247,255,0.88)]">{ui.noMessages}</p> : null}

              {messages.map((message) => {
                const isOwnMessage = message.senderId === session?.user?.id;

                return (
                  <div
                    key={message.id}
                    className={[
                      "max-w-[78%] rounded-[24px] p-4 text-sm leading-7",
                      isOwnMessage
                        ? "ml-auto rounded-br-md bg-[var(--uy-sun)] text-[var(--uy-deep-strong)]"
                        : "rounded-bl-md bg-white/10 text-[#e1ebe7]",
                    ].join(" ")}
                  >
                    {!isOwnMessage ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--uy-sky)]">{message.senderName}</p> : null}
                    <p>{message.body}</p>
                    <p className={["mt-3 text-xs uppercase tracking-[0.16em]", isOwnMessage ? "text-[rgba(28,52,0,0.58)]" : "text-[rgba(225,235,231,0.68)]"].join(" ")}>
                      {formatTimestamp(locale, message.createdAt)}
                    </p>
                  </div>
                );
              })}
            </div>

            <form className="rounded-[26px] bg-white/8 p-4" onSubmit={handleSendMessage}>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={3}
                placeholder={ui.replyPlaceholder}
                className="w-full resize-none rounded-[22px] bg-white/90 px-4 py-5 text-sm text-slate-700 outline-none"
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSending}
                  className="rounded-full bg-[var(--uy-sun)] px-5 py-3 text-sm font-semibold text-[var(--uy-deep-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSending ? `${content.messages.send}...` : content.messages.send}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="max-w-md text-center text-sm leading-7 text-[color:rgba(236,247,255,0.88)]">{ui.emptyConversation}</p>
          </div>
        )}
      </article>
    </section>
  );
}