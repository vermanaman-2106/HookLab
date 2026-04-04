"use client";

import { Loader2, MessageSquarePlus, RefreshCw, Trash2 } from "lucide-react";
import { chatTitleFromPayload } from "@/lib/chats";

export default function ChatSidebar({
  chats,
  currentChatId,
  loading,
  error,
  onSelect,
  onNewChat,
  onRefresh,
  onDelete,
}) {
  return (
    <aside className="flex max-h-[min(42vh,360px)] min-h-0 w-full shrink-0 flex-col border-b border-[#1f1f26] bg-[#08080c] md:sticky md:top-0 md:h-dvh md:max-h-none md:w-[280px] md:border-b-0 md:border-r">
      <div className="flex min-h-[60px] shrink-0 items-center justify-between gap-2 border-b border-[#1f1f26]/70 bg-[#08080c] px-4 py-3.5 sm:min-h-[64px] sm:px-6 sm:py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
          Chats
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/[0.04] hover:text-white disabled:opacity-40"
            title="Reload chats"
            aria-label="Reload chats"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            type="button"
            onClick={onNewChat}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500/90 to-pink-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            New
          </button>
        </div>
      </div>

      {error ? (
        <div className="shrink-0 border-b border-amber-500/25 bg-[#08080c] px-3 py-2.5 text-[12px] leading-snug text-amber-100/90 md:px-4">
          {error}
        </div>
      ) : null}

      <nav
        className="hooklab-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 py-2"
        aria-label="Chat history"
      >
        {loading && chats.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : chats.length === 0 ? (
          <p className="px-2 py-6 text-center text-[13px] leading-relaxed text-gray-500">
            No saved chats yet. Start typing — conversations save after each
            reply.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {chats.map((row) => {
              const active = row.id === currentChatId;
              const title = chatTitleFromPayload(row.messages);
              const created = row.created_at
                ? new Date(row.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";
              return (
                <li key={row.id}>
                  <div
                    className={`group flex items-stretch gap-0.5 rounded-xl transition-colors ${
                      active
                        ? "bg-white/[0.06] ring-1 ring-orange-500/25"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(row)}
                      className="min-w-0 flex-1 px-3 py-2.5 text-left"
                    >
                      <span className="block truncate text-[13px] font-medium text-gray-200">
                        {title}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-gray-600">
                        {created}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(row.id);
                      }}
                      className="flex shrink-0 items-center rounded-r-xl px-2 text-gray-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
                      title="Delete chat"
                      aria-label="Delete chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
}
