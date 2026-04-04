import { Check, Sparkles } from "lucide-react";

const PREVIEW_USER = "Why my reels are not getting views";

const READY_ROWS = [
  "Viral hooks generated",
  "Script ready",
  "Strategy ready",
];

export default function HeroLivePreview() {
  return (
    <div className="relative mx-auto mt-0 w-full max-w-lg px-4 sm:px-0">
      <div
        className="pointer-events-none absolute -inset-px rounded-[1.35rem] bg-gradient-to-b from-orange-500/20 via-pink-500/8 to-transparent opacity-90 blur-sm"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-3xl border border-[#1f1f26] bg-[#0e0e14]/95 shadow-[0_28px_90px_-28px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_32px_100px_-28px_rgba(249,115,22,0.12)]">
        <div className="flex items-center justify-between border-b border-[#1f1f26]/90 bg-[#060609]/95 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#52525b]" />
              <span className="h-2 w-2 rounded-full bg-[#52525b]" />
              <span className="h-2 w-2 rounded-full bg-[#52525b]" />
            </div>
            <span className="text-[11px] font-medium tracking-wide text-gray-500">
              HookLab
            </span>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.12] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-400/95">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40 opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="hooklab-preview-stagger flex flex-col gap-3">
            <div className="flex justify-end">
              <div className="max-w-[92%] rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2.5 text-[13px] font-medium leading-snug text-white shadow-[0_14px_44px_-14px_rgba(249,115,22,0.55)]">
                {PREVIEW_USER}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg shadow-orange-500/30">
                <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
              </div>
              <p className="min-w-0 flex-1 pt-1 text-[13px] font-medium leading-relaxed text-gray-300">
                Here&apos;s your reel plan—structured and ready to shoot.
              </p>
            </div>

            {READY_ROWS.map((label) => (
              <div
                key={label}
                className="ml-0 flex items-center gap-3 rounded-xl border border-[#1f1f26] bg-[#111116]/95 px-3.5 py-2.5 text-[13px] text-gray-200 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)] sm:ml-12"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
