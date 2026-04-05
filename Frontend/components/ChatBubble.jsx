import AiMessageContent from "./AiMessageContent";

function AssistantAvatar() {
  return (
    <div
      className="mt-1 h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 p-[1px]"
      aria-hidden
    >
      <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#0b0b0f] text-[11px] font-bold text-orange-300/95">
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
        <div className="mx-auto w-full max-w-[700px] px-2 sm:px-4">
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3.5 text-[15px] leading-relaxed text-red-100/95 sm:px-5 sm:py-4">
            <p className="font-medium tracking-tight">Something went wrong</p>
            <p className="mt-2 text-[14px] text-red-200/85">{safeContent}</p>
          </div>
        </div>
      </div>
    );
  }

  const isShortPrompt =
    safeContent.length < 120 &&
    !/🔥|🎬|📌|60 sec/i.test(safeContent) &&
    safeContent.split("\n").length <= 3;

  const assistantShell = (children) => (
    <div className="hooklab-message-enter flex w-full justify-start">
      <div className="mx-auto flex w-full max-w-[700px] gap-3 px-2 sm:gap-3.5 sm:px-4 md:px-5">
        {!assistantContinued && <AssistantAvatar />}
        <div
          className={`min-w-0 flex-1 space-y-4 pt-0.5 ${assistantContinued ? "pl-10" : ""}`}
        >
          {children}
        </div>
      </div>
    </div>
  );

  const shortText = (
    <div className="px-0.5 py-1 text-[15px] leading-relaxed text-gray-300">
      <p className="whitespace-pre-wrap text-pretty">{safeContent}</p>
    </div>
  );

  if (isShortPrompt) {
    return assistantShell(
      <>
        {shortText}
        {suggestions.length > 0 && (
          <SuggestionChips
            suggestions={suggestions}
            onSuggestionClick={onSuggestionClick}
          />
        )}
      </>
    );
  }

  return assistantShell(
    <>
      <AiMessageContent content={safeContent} />
      {suggestions.length > 0 && (
        <SuggestionChips
          suggestions={suggestions}
          onSuggestionClick={onSuggestionClick}
        />
      )}
    </>
  );
}

function SuggestionChips({ suggestions, onSuggestionClick }) {
  return (
    <div className="pt-2">
      <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500">
        Continue
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSuggestionClick?.(s)}
            className="cursor-pointer rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-left text-sm leading-snug text-gray-300 transition-colors duration-200 hover:border-white/[0.14] hover:bg-white/[0.06] active:scale-[0.99] sm:px-4"
          >
            <span className="text-pretty">{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
