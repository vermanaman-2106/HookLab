"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AppChatHeader from "@/components/AppChatHeader";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import ChatSidebar from "@/components/ChatSidebar";
import TypingIndicator, {
  PINTEREST_STEPS,
  VISION_STEPS,
} from "@/components/TypingIndicator";
import SupabaseSetupPrompt from "@/components/SupabaseSetupPrompt";
import { useAuth } from "@/components/AuthProvider";
import {
  analyzeInstagramProfile,
  fetchClarifyQuestions,
  fetchPinterestInspiration,
  generateFromIdea,
} from "@/lib/api";
import { fileToDataUrl, fileToResizedDataUrl } from "@/lib/imageAttachment";
import {
  buildChatPayload,
  deleteChat,
  fetchUserChats,
  formatSupabaseError,
  parseChatPayload,
  userFacingChatsFetchError,
  saveChat,
} from "@/lib/chats";
import {
  Clapperboard,
  Brain,
  ImagePlus,
  Smartphone,
  Rocket,
} from "lucide-react";

const PLAN_OPTIONS = [
  {
    value: "reel",
    label: "Reel Plan",
    description: "Hooks, 60s script, shoot & edit notes",
    icon: Clapperboard,
  },
  {
    value: "strategy",
    label: "Strategy",
    description: "Pillars, ideas, and a 7-day plan",
    icon: Brain,
  },
  {
    value: "post",
    label: "Post Ideas",
    description: "Carousels, captions, and angles",
    icon: Smartphone,
  },
  {
    value: "full",
    label: "Full Plan",
    description: "Reel + strategy in one pass",
    icon: Rocket,
  },
];

const PLAN_LABELS = Object.fromEntries(
  PLAN_OPTIONS.map((o) => [o.value, o.label])
);

const STARTER_IDEAS = [
  "Why my Reels stall after the first 3 seconds",
  "Turning client testimonials into viral stories",
  "Posting consistently without burning out",
];

/** intake → clarify → plan → live */
const PHASE = {
  INTAKE: "intake",
  CLARIFY: "clarify",
  PLAN: "plan",
  LIVE: "live",
};

function buildClarificationSummary(idea, questions, answers) {
  const blocks = questions.map((q, i) => {
    const a = (answers[i] ?? "").trim();
    return `Q: ${q}\nA: ${a || "(no answer)"}`;
  });
  return `Original idea:\n${idea.trim()}\n\n${blocks.join("\n\n")}`;
}

function ensureQuestionChip(text) {
  const t = text.trim();
  if (!t) return t;
  if (/\?\s*$/.test(t)) return t;
  return `${t.replace(/[.!…\s]+$/u, "")}?`;
}

function lastAssistantContent(msgs) {
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].role === "assistant") return msgs[i].content || "";
  }
  return "";
}

function isAffirmativeShortReply(text) {
  const t = (text || "").trim().toLowerCase();
  return (
    t === "y" ||
    t === "yes" ||
    /^(y(es)?|yeah|yep|sure|ok|okay|please|sounds good|do it|show me)\b/.test(t)
  );
}

/** Chip click, paraphrase, or "yes" right after assistant offered Pinterest-style examples */
function isPinterestInspirationFollowUp(action, messagesForContext = []) {
  const t = (action || "").trim().toLowerCase();
  const chipOrParaphrase =
    t.includes("pinterest-style visual inspiration") ||
    t.includes("pinterest style visual inspiration") ||
    (t.includes("visual inspiration") && t.includes("pinterest")) ||
    t.includes("pinterest-style examples") ||
    t.includes("show pinterest-style examples");
  if (chipOrParaphrase) return true;
  if (!isAffirmativeShortReply(action)) return false;
  const last = lastAssistantContent(messagesForContext).toLowerCase();
  return (
    last.includes("pinterest-style examples") ||
    last.includes("pinterest-style visual") ||
    (last.includes("visual inspiration") && last.includes("pinterest"))
  );
}

function buildPinterestContext(idea, lastResult, userAction) {
  return [
    `Follow-up the user selected: ${userAction}`,
    ``,
    `Creator idea (thread context):`,
    (idea || "").trim() || "(not set)",
    ``,
    `Latest HookLab output to ground Pinterest searches (post ideas, carousel, caption):`,
    (lastResult || "").trim() || "(none)",
  ].join("\n");
}

export default function ChatPage() {
  const {
    user,
    loading: authLoading,
    supabase,
    getAccessToken,
    isSupabaseConfigured,
  } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [visionAnalyze, setVisionAnalyze] = useState(false);
  const [pinterestLoading, setPinterestLoading] = useState(false);
  const [attachmentResetKey, setAttachmentResetKey] = useState(0);

  const [phase, setPhase] = useState(PHASE.INTAKE);
  const [idea, setIdea] = useState("");
  const [clarifyQuestions, setClarifyQuestions] = useState([]);
  const [clarifyAnswers, setClarifyAnswers] = useState([]);

  const [lastResult, setLastResult] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [chatRows, setChatRows] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [chatsError, setChatsError] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const skipNextPersist = useRef(false);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const refreshChats = useCallback(async () => {
    if (!user?.id || !supabase) return;
    setChatsLoading(true);
    setChatsError(null);
    try {
      const { data: rows, error } = await fetchUserChats(supabase);
      if (error) {
        setChatRows([]);
        setChatsError(userFacingChatsFetchError(error));
        return;
      }
      setChatRows(rows);
    } catch (e) {
      setChatRows([]);
      setChatsError(userFacingChatsFetchError(e));
    } finally {
      setChatsLoading(false);
    }
  }, [user?.id, supabase]);

  useEffect(() => {
    if (!authLoading && user) {
      void refreshChats();
    }
  }, [authLoading, user, refreshChats]);

  useEffect(() => {
    if (authLoading || !isSupabaseConfigured) return undefined;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevHtmlHeight = html.style.height;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyHeight = body.style.height;
    html.style.overflow = "hidden";
    html.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.height = "100%";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      html.style.height = prevHtmlHeight;
      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
    };
  }, [authLoading, isSupabaseConfigured]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setMobileNavOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const persistState = useCallback(async () => {
    if (!user?.id || !supabase) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    if (messages.length === 0 && !currentChatId) return;

    const payload = buildChatPayload({
      messages,
      phase,
      idea,
      clarifyQuestions,
      clarifyAnswers,
      lastResult,
      suggestions,
    });

    try {
      const { id } = await saveChat(supabase, user.id, payload, currentChatId);
      if (id && id !== currentChatId) {
        setCurrentChatId(id);
      }
      await refreshChats();
    } catch (e) {
      const msg = formatSupabaseError(e);
      const missingChatsTable =
        msg.includes("PGRST205") ||
        /could not find the table.*chats/i.test(msg);
      if (!missingChatsTable) {
        console.error("[persist]", msg);
      }
    }
  }, [
    user?.id,
    supabase,
    messages,
    phase,
    idea,
    clarifyQuestions,
    clarifyAnswers,
    lastResult,
    suggestions,
    currentChatId,
    refreshChats,
  ]);

  useEffect(() => {
    if (authLoading || !user) return;
    const t = setTimeout(() => {
      void persistState();
    }, 650);
    return () => clearTimeout(t);
  }, [
    authLoading,
    user,
    persistState,
    messages,
    phase,
    idea,
    clarifyQuestions,
    clarifyAnswers,
    lastResult,
    suggestions,
    currentChatId,
  ]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      scrollToBottom();
    });
    return () => cancelAnimationFrame(id);
  }, [messages, loading, scrollToBottom]);

  function extractSuggestions(text) {
    const match = text.match(/✨ Next Steps:\n([\s\S]*)/);
    if (!match) return [];

    return match[1]
      .split("\n")
      .map((line) => line.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean)
      .map((s) => ensureQuestionChip(s));
  }

  const handleStarterClick = (text) => {
    setInput(text);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      const el = inputRef.current;
      if (el && typeof el.setSelectionRange === "function") {
        const len = text.length;
        el.setSelectionRange(len, len);
      }
    });
  };

  const handleNewChat = () => {
    skipNextPersist.current = true;
    setMessages([]);
    setInput("");
    setAttachmentResetKey((k) => k + 1);
    setLoading(false);
    setVisionAnalyze(false);
    setPinterestLoading(false);
    setPhase(PHASE.INTAKE);
    setIdea("");
    setClarifyQuestions([]);
    setClarifyAnswers([]);
    setLastResult("");
    setSuggestions([]);
    setCurrentChatId(null);
  };

  const handleSelectChat = (row) => {
    skipNextPersist.current = true;
    const parsed = parseChatPayload(row.messages);
    if (!parsed) return;
    setMessages(parsed.messages);
    setPhase(parsed.phase);
    setIdea(parsed.idea);
    setClarifyQuestions(parsed.clarifyQuestions);
    setClarifyAnswers(parsed.clarifyAnswers);
    setLastResult(parsed.lastResult);
    setSuggestions(parsed.suggestions);
    setCurrentChatId(row.id);
    setInput("");
    setAttachmentResetKey((k) => k + 1);
  };

  const handleDeleteChat = async (id) => {
    try {
      await deleteChat(supabase, id);
      if (currentChatId === id) {
        handleNewChat();
      }
      await refreshChats();
    } catch (e) {
      console.error("[delete chat]", e);
    }
  };

  const startClarifyAfterIdea = async (ideaText) => {
    setLoading(true);
    setPhase(PHASE.CLARIFY);
    const token = getAccessToken();
    try {
      const questions = await fetchClarifyQuestions(ideaText, token);
      setClarifyQuestions(questions);
      setClarifyAnswers([]);

      const q0 = questions[0] ?? "";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Nice — I’ve got the idea. Before I build anything generic, a few quick questions so this plan actually fits you.\n\n${q0}`,
        },
      ]);
    } catch (err) {
      setPhase(PHASE.PLAN);
      setClarifyQuestions([]);
      setClarifyAnswers([]);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "I couldn’t load custom questions — pick a deliverable and I’ll still personalize from your idea.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (payload = {}) => {
    const text =
      typeof payload?.text === "string" ? payload.text.trim() : "";
    const image = payload?.image instanceof File ? payload.image : null;

    if (image) {
      if (loading) return;
      setVisionAnalyze(true);
      setLoading(true);
      const userLine = text || "📸 Instagram profile screenshot";

      let imagePayload = null;
      try {
        const src = await fileToResizedDataUrl(image);
        imagePayload = { src, name: image.name || "Screenshot" };
      } catch {
        try {
          imagePayload = {
            src: await fileToDataUrl(image),
            name: image.name || "Screenshot",
          };
        } catch {
          imagePayload = null;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: userLine,
          ...(imagePayload ? { image: imagePayload } : {}),
        },
      ]);
      try {
        const result = await analyzeInstagramProfile(
          image,
          text,
          getAccessToken()
        );
        setLastResult(result);
        setSuggestions(extractSuggestions(result));
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: result },
        ]);
        setPhase(PHASE.LIVE);
        setIdea((prev) => (text ? text : prev || "Instagram profile audit"));
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "error",
            content:
              err instanceof Error
                ? err.message
                : "Something went wrong. Try again.",
          },
        ]);
      } finally {
        setLoading(false);
        setVisionAnalyze(false);
      }
      return;
    }

    if (!text || loading) return;

    if (phase === PHASE.INTAKE) {
      setIdea(text);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: text },
      ]);
      await startClarifyAfterIdea(text);
      return;
    }

    if (phase === PHASE.CLARIFY && clarifyQuestions.length > 0) {
      const nextAnswers = [...clarifyAnswers, text];
      setClarifyAnswers(nextAnswers);

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: text },
      ]);

      if (nextAnswers.length < clarifyQuestions.length) {
        const qi = clarifyQuestions[nextAnswers.length];
        const followLead =
          nextAnswers.length === 1 ? "Got it.\n\n" : "Love that.\n\n";
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `${followLead}${qi}`,
          },
        ]);
        return;
      }

      setPhase(PHASE.PLAN);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Perfect — I’ve got enough to make this sharp. What do you want me to build first?",
        },
      ]);
      return;
    }

    if (phase === PHASE.PLAN) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: text },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Tap one of the deliverable cards above to generate—that keeps the structure tight. If you’re unsure, Full Plan is the best default.",
        },
      ]);
      return;
    }

    if (phase === PHASE.LIVE) {
      await handleSuggestion(text);
    }
  };

  const handleTypeSelect = async (type) => {
    if (loading) return;

    setLoading(true);

    const displayLabel = PLAN_LABELS[type] ?? type;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: displayLabel },
    ]);

    const summary =
      clarifyQuestions.length > 0 && clarifyAnswers.length > 0
        ? buildClarificationSummary(idea, clarifyQuestions, clarifyAnswers)
        : "";

    const token = getAccessToken();

    try {
      const result = await generateFromIdea(idea, type, "", summary, token);

      setLastResult(result);
      setSuggestions(extractSuggestions(result));

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: result },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Use a chip below or tell me what to refine next.",
        },
      ]);

      setPhase(PHASE.LIVE);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "error",
          content:
            err instanceof Error
              ? err.message
              : "Something went wrong. Try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = async (action) => {
    if (loading) return;

    setLoading(true);
    const priorOutput = lastResult;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: action },
    ]);

    const token = getAccessToken();

    if (isPinterestInspirationFollowUp(action, messages)) {
      setPinterestLoading(true);
      try {
        const context = buildPinterestContext(idea, priorOutput, action);
        const result = await fetchPinterestInspiration(context, token);

        setLastResult(result);
        setSuggestions(extractSuggestions(result));

        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: result },
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Use a chip below or tell me what to refine next.",
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "error",
            content:
              err instanceof Error
                ? err.message
                : "Something went wrong. Try again.",
          },
        ]);
      } finally {
        setPinterestLoading(false);
        setLoading(false);
      }
      return;
    }

    try {
      const result = await generateFromIdea(
        action,
        "full",
        priorOutput,
        "",
        token
      );

      setLastResult(result);
      setSuggestions(extractSuggestions(result));

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: result },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Use a chip below or tell me what to refine next.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "error",
          content:
            err instanceof Error
              ? err.message
              : "Something went wrong. Try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const inputPlaceholder =
    phase === PHASE.CLARIFY
      ? "Answer in your own words…"
      : phase === PHASE.INTAKE
        ? "Ask anything—or attach a profile screenshot…"
        : "Describe your content idea…";

  const showPlanGrid = phase === PHASE.PLAN && !loading;

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0b0b0f] text-sm text-gray-500">
        Loading session…
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="bg-[#0b0b0f]">
        <SupabaseSetupPrompt />
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#0b0b0f] md:h-screen md:flex-row">
      <ChatSidebar
        variant="rail"
        chats={chatRows}
        currentChatId={currentChatId}
        loading={chatsLoading}
        error={chatsError}
        onSelect={handleSelectChat}
        onNewChat={handleNewChat}
        onRefresh={refreshChats}
        onDelete={handleDeleteChat}
      />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#0b0b0f]">
        <AppChatHeader onOpenChatMenu={() => setMobileNavOpen(true)} />

        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#0b0b0f]">
          <div className="hooklab-scrollbar hooklab-chat-scroll mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-y-auto overscroll-y-contain bg-[#0b0b0f] px-4 pb-32 pt-4 sm:px-6 sm:pt-6 sm:pb-36 md:px-8 md:pb-40 lg:px-10 lg:pb-[calc(10rem+env(safe-area-inset-bottom))]">
            {messages.length === 0 && !loading && (
              <div className="hooklab-message-enter flex flex-1 flex-col justify-center py-6 sm:py-10">
                <div className="mx-auto w-full max-w-4xl text-center">
                  <p className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-[13px] font-semibold uppercase tracking-[0.14em] text-transparent">
                    HookLab AI
                  </p>
                  <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    Turn your idea into viral content.
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-gray-400">
                    Describe your idea for hooks and scripts—or upload an
                    Instagram screenshot for a full profile audit, mistakes, and
                    reel ideas.
                  </p>
                </div>

                <div className="mx-auto mt-8 w-full max-w-4xl">
                  <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.08] via-[#111116] to-pink-500/[0.06] p-4 text-left shadow-[0_12px_48px_-20px_rgba(249,115,22,0.2)] sm:p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-orange-400">
                        <ImagePlus className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-300/90">
                          New · Profile audit
                        </p>
                        <p className="mt-1.5 text-[14px] leading-snug text-gray-200">
                          Tap the image button in the composer, attach a JPG or
                          PNG of your profile, add optional context, and send.
                        </p>
                        <p className="mt-2 text-[12px] leading-relaxed text-gray-500">
                          Same chat as your ideas—one premium strategist
                          experience.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mx-auto mt-10 w-full max-w-4xl">
                  <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Try an example
                  </p>
                  <div className="flex flex-col gap-2">
                    {STARTER_IDEAS.map((line) => (
                      <button
                        key={line}
                        type="button"
                        onClick={() => handleStarterClick(line)}
                        className="rounded-full border border-[#1f1f26] bg-[#111116] px-4 py-3 text-left text-[14px] text-gray-200 shadow-[var(--shadow-sm)] transition-all duration-200 hover:border-orange-500/30 hover:bg-[#16161c] hover:shadow-[var(--shadow-md)] active:scale-[0.995]"
                      >
                        <span className="text-pretty">{line}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-8">
              {messages.map((m, i) => {
                const prev = messages[i - 1];
                const assistantContinued =
                  m.role === "assistant" && prev?.role === "assistant";

                const tightAssistantPair =
                  assistantContinued &&
                  (m.content || "").length < 140;

                const assistantAfterUser =
                  m.role === "assistant" && prev?.role === "user";

                return (
                  <div
                    key={m.id}
                    className={[
                      tightAssistantPair ? "-mt-3" : "",
                      assistantAfterUser
                        ? "border-t border-[#1f1f26]/70 pt-8"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <ChatBubble
                      role={m.role}
                      content={m.content}
                      image={m.image}
                      suggestions={
                        m.role === "assistant" && i === messages.length - 1
                          ? suggestions
                          : []
                      }
                      onSuggestionClick={handleSuggestion}
                      isUserTypePick={Object.values(PLAN_LABELS).includes(
                        m.content
                      )}
                      assistantContinued={assistantContinued}
                    />
                  </div>
                );
              })}

              {showPlanGrid && (
                <div className="hooklab-message-enter space-y-3 border-t border-[#1f1f26]/60 pt-8 pl-1 sm:pl-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Choose a deliverable
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {PLAN_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleTypeSelect(opt.value)}
                          className="group flex gap-3 rounded-2xl border border-[#1f1f26] bg-[#111116] p-4 text-left shadow-[0_6px_28px_-12px_rgba(0,0,0,0.45)] transition-all duration-200 hover:scale-[1.01] hover:border-orange-500/35 hover:shadow-[0_12px_40px_-12px_rgba(249,115,22,0.12)] active:scale-[0.99]"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/15 text-orange-400 transition-transform duration-200 group-hover:scale-105">
                            <Icon className="h-5 w-5" strokeWidth={1.75} />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[15px] font-semibold text-white">
                              {opt.label}
                            </span>
                            <span className="mt-0.5 block text-[13px] leading-snug text-gray-400">
                              {opt.description}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {loading && (
                <TypingIndicator
                  key={
                    visionAnalyze
                      ? "vision"
                      : pinterestLoading
                        ? "pinterest"
                        : "default"
                  }
                  steps={
                    visionAnalyze
                      ? VISION_STEPS
                      : pinterestLoading
                        ? PINTEREST_STEPS
                        : undefined
                  }
                />
              )}

              <div ref={bottomRef} />
            </div>
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#1f1f26]/70 bg-[#0b0b0f]/96 shadow-[0_-12px_40px_-8px_rgba(0,0,0,0.6)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[#0b0b0f]/90 md:left-[280px]">
          <ChatInput
            ref={inputRef}
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            disabled={loading}
            placeholder={inputPlaceholder}
            attachmentResetKey={attachmentResetKey}
          />
        </div>
      </div>

      {mobileNavOpen ? (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Chat history"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(88vw,20rem)] max-w-[320px] flex-col pt-[env(safe-area-inset-top)] shadow-[16px_0_40px_-8px_rgba(0,0,0,0.9)]">
            <ChatSidebar
              variant="drawer"
              onClose={() => setMobileNavOpen(false)}
              chats={chatRows}
              currentChatId={currentChatId}
              loading={chatsLoading}
              error={chatsError}
              onSelect={(row) => {
                handleSelectChat(row);
                setMobileNavOpen(false);
              }}
              onNewChat={() => {
                handleNewChat();
                setMobileNavOpen(false);
              }}
              onRefresh={refreshChats}
              onDelete={handleDeleteChat}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
