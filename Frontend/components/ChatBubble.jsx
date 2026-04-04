import AiMessageContent from "./AiMessageContent";

function AssistantAvatar() {
  return (
    <div
      className="mt-1.5 h-7 w-7 shrink-0 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 p-[1px] shadow-md shadow-orange-500/25"
      aria-hidden
    >
      <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0b0b0f] text-[11px] font-bold text-orange-300">
        H
      </div>
    </div>
  );
}

export default function ChatBubble({
  role,
  content,
  suggestions = [],
  onSuggestionClick,
  isUserTypePick = false,
  assistantContinued = false,
}) {
  const safeContent =
    typeof content === "string"
      ? content
      : content?.result || JSON.stringify(content);

  if (role === "user") {
    return (
      <div className="hooklab-message-enter flex justify-end">
        <div
          className={`max-w-[min(100%,78%)] rounded-2xl px-4 py-3.5 text-[15px] leading-relaxed text-white shadow-[0_8px_28px_-8px_rgba(249,115,22,0.35)] transition-transform duration-200 ${
            isUserTypePick
              ? "border border-orange-500/35 bg-[#111116] text-gray-100 ring-1 ring-orange-500/25"
              : "bg-gradient-to-r from-orange-500 to-pink-500"
          }`}
        >
          <p className="whitespace-pre-wrap text-pretty">{safeContent}</p>
        </div>
      </div>
    );
  }

  if (role === "error") {
    return (
      <div className="hooklab-message-enter flex justify-start">
        <div className="max-w-[min(100%,95%)] rounded-2xl border border-red-500/35 bg-red-950/50 px-5 py-4 text-[15px] leading-relaxed text-red-100 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)]">
          <p className="font-medium tracking-tight">Something went wrong</p>
          <p className="mt-2 text-[14px] text-red-200/90">{safeContent}</p>
        </div>
      </div>
    );
  }

  const isShortPrompt =
    safeContent.length < 120 &&
    !/🔥|🎬|📌|60 sec/i.test(safeContent) &&
    safeContent.split("\n").length <= 3;

  const threadPad = assistantContinued ? "pl-10" : "pl-1";

  const shortBubble = (
    <div className="rounded-2xl border border-[#1f1f26] bg-[#111116] px-5 py-4 text-[15px] leading-relaxed text-gray-300 shadow-[0_8px_32px_-14px_rgba(0,0,0,0.55)]">
      <p className="whitespace-pre-wrap text-pretty">{safeContent}</p>
    </div>
  );

  if (isShortPrompt) {
    return (
      <div className={`hooklab-message-enter flex justify-start ${threadPad}`}>
        <div className="flex w-full max-w-[min(100%,92%)] gap-3">
          {!assistantContinued && <AssistantAvatar />}
          <div className="min-w-0 flex-1 space-y-3 pt-0.5">
            {shortBubble}
            {suggestions.length > 0 && (
              <SuggestionChips
                suggestions={suggestions}
                onSuggestionClick={onSuggestionClick}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`hooklab-message-enter flex justify-start ${threadPad}`}>
      <div className="flex w-full max-w-[min(100%,92%)] gap-3">
        {!assistantContinued && <AssistantAvatar />}
        <div className="min-w-0 flex-1 space-y-4 pt-0.5">
          <AiMessageContent content={safeContent} />
          {suggestions.length > 0 && (
            <SuggestionChips
              suggestions={suggestions}
              onSuggestionClick={onSuggestionClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SuggestionChips({ suggestions, onSuggestionClick }) {
  return (
    <div className="pt-1">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500">
        Continue
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSuggestionClick?.(s)}
            className="cursor-pointer rounded-full border border-[#262630] bg-[#15151c] px-4 py-2 text-left text-sm leading-snug text-gray-300 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:border-[#35354a] hover:bg-[#1c1c24] active:scale-[0.98]"
          >
            <span className="text-pretty">{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
