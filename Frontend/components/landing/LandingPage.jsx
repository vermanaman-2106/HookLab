import Link from "next/link";
import { ArrowRight, Check, ImagePlus, Sparkles, Rocket } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import HeroLivePreview from "./HeroLivePreview";

const problemPoints = [
  "Posting without strategy",
  "Weak hooks that don’t stop the scroll",
  "Inconsistent output and burnout",
  "Growth feels random—not repeatable",
];

const solutionPoints = [
  "Viral hooks tailored to your idea",
  "Scroll-stopping scripts and structure",
  "Growth and positioning you can reuse",
  "Instant, structured output every time",
  "Instagram profile audits from a screenshot—mistakes, strategy, reel ideas",
];

const steps = [
  {
    n: "01",
    title: "Enter your idea",
    body: "One sentence is enough—we’ll unpack the angle.",
  },
  {
    n: "02",
    title: "Choose what you want",
    body: "Reel plan, posts, strategy, or a full package.",
  },
  {
    n: "03",
    title: "Get viral-ready content",
    body: "Hooks, script, edits—and smart follow-ups.",
  },
];

const primaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_8px_32px_-6px_rgba(249,115,22,0.55),0_0_0_1px_rgba(255,255,255,0.08)_inset] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_16px_48px_-8px_rgba(249,115,22,0.65),0_0_40px_-8px_rgba(236,72,153,0.35)] active:scale-[0.98]";

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#0b0b0f] text-white">
      {/* Hero: single surface — background, nav, content, preview, horizon glow */}
      <section id="hero" className="relative z-10 scroll-mt-0">
        <div
          className="pointer-events-none absolute inset-0 -z-10 min-h-full overflow-hidden bg-[#0b0b0f]"
          aria-hidden
        >
          <div className="absolute inset-0 hooklab-header-grid opacity-[0.28]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(249,115,22,0.14),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_85%_25%,rgba(236,72,153,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_15%_55%,rgba(249,115,22,0.06),transparent_45%)]" />
          <div
            className="hooklab-orb hooklab-orb--a absolute -top-32 left-1/2 h-[min(520px,90vw)] w-[min(520px,90vw)] -translate-x-1/2 rounded-full bg-gradient-to-br from-orange-500/[0.35] via-pink-500/[0.2] to-transparent blur-[100px]"
          />
          <div className="hooklab-orb hooklab-orb--b absolute right-[-20%] top-[24%] h-[380px] w-[380px] rounded-full bg-gradient-to-tl from-pink-500/[0.28] via-orange-400/[0.12] to-transparent blur-[90px] sm:right-0" />
          {/* Horizon arc — depth at bottom of hero */}
          <div className="hooklab-hero-horizon absolute bottom-0 left-0 right-0 h-[min(42vh,400px)]" />
          <div className="pointer-events-none absolute bottom-[-10%] left-1/2 h-[min(48vh,520px)] w-[min(120vw,960px)] -translate-x-1/2 rounded-[100%] bg-gradient-to-t from-orange-500/[0.2] via-pink-500/[0.08] to-transparent opacity-90 blur-3xl" />
        </div>

        <SiteHeader variant="hero" />

        <div className="relative mx-auto max-w-3xl px-4 pb-8 text-center sm:px-6">
          <div className="mt-16 flex flex-col items-center gap-3 sm:mt-20">
            <a
              href="#profile-audit"
              className="group inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-gradient-to-r from-orange-500/10 to-pink-500/10 px-3.5 py-1.5 text-[12px] font-medium text-orange-200/90 shadow-sm transition-all duration-200 hover:border-orange-500/40 hover:from-orange-500/15 hover:to-pink-500/15"
            >
              <ImagePlus className="h-3.5 w-3.5 shrink-0 text-orange-400" aria-hidden />
              <span>New: Instagram profile audit</span>
              <span className="text-orange-300/70 transition-colors group-hover:text-orange-200">
                See how →
              </span>
            </a>
            <a
              href="#features"
              className="group inline-flex items-center gap-1.5 rounded-full border border-[#1f1f26] bg-[#111116] px-3.5 py-1.5 text-[12px] font-medium text-gray-400 shadow-sm transition-all duration-200 hover:border-[#2a2a32] hover:bg-[#16161c] hover:text-gray-200"
            >
              <span>Hooks, scripts & strategy</span>
              <span className="text-gray-500 transition-colors group-hover:text-orange-400/90">
                Explore →
              </span>
            </a>
          </div>

          <h1 className="mt-8 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl sm:leading-[1.08] lg:text-6xl lg:leading-[1.05]">
            Turn your ideas into{" "}
            <span className="bg-gradient-to-r from-orange-300 via-orange-200 to-pink-400 bg-clip-text text-transparent">
              content people actually watch
            </span>
            .
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-400 sm:text-xl sm:leading-relaxed">
            Hooks, scripts, and strategy in one thread—or{" "}
            <span className="text-gray-300">
              upload an Instagram screenshot
            </span>{" "}
            for a strategist-grade profile audit, mistakes, and reel ideas.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-4">
            <Link href="/app" className={`${primaryCtaClass} w-full sm:w-auto`}>
              <Rocket className="h-4 w-4" aria-hidden />
              Try it now
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center rounded-full border border-[#1f1f26] bg-[#111116]/80 px-8 py-3.5 text-sm font-medium text-gray-300 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-[1.02] hover:border-gray-600 hover:bg-[#16161c] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] active:scale-[0.98] sm:w-auto"
            >
              See how it works
            </a>
          </div>
          <p className="mt-6 text-[13px] font-medium text-gray-500">
            Type an idea or attach a profile screenshot—both ship in one thread.
          </p>
        </div>

        <div className="relative z-10 pb-20 pt-4 sm:pb-28 sm:pt-6">
          <HeroLivePreview />
        </div>
      </section>

      {/* Profile audit spotlight */}
      <section
        id="profile-audit"
        className="relative z-10 scroll-mt-24 border-b border-[#1f1f26]/70 bg-gradient-to-b from-[#060609] via-[#0b0b0f] to-[#0b0b0f] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[1.35rem] border border-orange-500/20 bg-[#111116] shadow-[0_24px_100px_-32px_rgba(249,115,22,0.25)]">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-orange-500/20 to-pink-500/10 blur-3xl"
              aria-hidden
            />
            <div className="relative grid gap-8 p-6 sm:grid-cols-[1fr,auto] sm:items-center sm:gap-10 sm:p-10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-300/90">
                  <ImagePlus className="h-3.5 w-3.5" aria-hidden />
                  Vision · New
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  See your Instagram like a{" "}
                  <span className="bg-gradient-to-r from-orange-300 to-pink-400 bg-clip-text text-transparent">
                    growth strategist
                  </span>
                </h2>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-gray-400">
                  Drop a screenshot of your profile. HookLab reads bio, grid,
                  highlights, and signals—then returns an honest audit, critical
                  mistakes, a step-by-step strategy, and viral reel ideas built
                  for your niche.
                </p>
                <ul className="mt-6 space-y-2.5 text-[14px] text-gray-300">
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                    Profile audit, positioning, and what&apos;s actually working
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-400" />
                    Uncomfortable truths—not generic tips
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                    Reel ideas and a clear fix path you can act on today
                  </li>
                </ul>
              </div>
              <div className="flex shrink-0 flex-col items-stretch gap-3 sm:min-w-[200px]">
                <Link
                  href="/app"
                  className={`${primaryCtaClass} justify-center`}
                >
                  <ImagePlus className="h-4 w-4" aria-hidden />
                  Try profile audit
                </Link>
                <p className="text-center text-[11px] leading-relaxed text-gray-500 sm:text-left">
                  JPG or PNG · Works beside the rest of HookLab in the same chat
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section
        id="use-cases"
        className="relative z-10 scroll-mt-24 border-t border-[#1f1f26]/80 bg-gradient-to-b from-[#08080c] to-[#0b0b0f] py-20 sm:py-28"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-[1.65rem] font-semibold tracking-tight sm:text-3xl lg:text-[2rem]">
            Most creators are doing content wrong.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[15px] text-gray-400">
            The feed rewards clarity and repetition—not more noise.
          </p>
          <ul className="mx-auto mt-12 grid max-w-2xl gap-4 sm:grid-cols-2">
            {problemPoints.map((item) => (
              <li
                key={item}
                className="group flex items-start gap-3 rounded-2xl border border-[#1f1f26] bg-[#111116] px-4 py-4 text-[15px] text-gray-300 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/35 hover:shadow-[0_12px_40px_-16px_rgba(249,115,22,0.15)]"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400 transition-transform duration-300 group-hover:scale-110">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Solution */}
      <section
        id="features"
        className="relative z-10 scroll-mt-24 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-[1.65rem] font-semibold tracking-tight sm:text-3xl lg:text-[2rem]">
              HookLab AI fixes that.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-400">
              One assistant that speaks strategy and execution—in the same
              thread.
            </p>
          </div>
          <ul className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {solutionPoints.map((item) => (
              <li
                key={item}
                className="group flex items-start gap-3 rounded-2xl border border-[#1f1f26] bg-[#111116] px-4 py-4 text-[15px] text-gray-200 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/25 hover:shadow-[0_12px_40px_-16px_rgba(16,185,129,0.12)]"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 transition-transform duration-300 group-hover:scale-110">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative z-10 scroll-mt-24 border-t border-[#1f1f26]/80 bg-gradient-to-b from-[#0b0b0f] to-[#08080c] py-20 sm:py-28"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-[1.65rem] font-semibold tracking-tight sm:text-3xl lg:text-[2rem]">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-[15px] text-gray-400">
            Three steps from idea to publish-ready structure.
          </p>
          <div className="mx-auto mt-14 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="group rounded-2xl border border-[#1f1f26] bg-[#111116] p-6 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-500/25 hover:shadow-[0_16px_48px_-16px_rgba(249,115,22,0.12)]"
              >
                <span className="text-xs font-bold tabular-nums text-orange-400/90">
                  {s.n}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo / depth */}
      <section className="relative z-10 scroll-mt-24 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-[1.65rem] font-semibold tracking-tight sm:text-3xl lg:text-[2rem]">
            What you get
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[15px] text-gray-400">
            Structured output—hooks, script beats, and why it works—ready to
            adapt.
          </p>

          <div className="relative mx-auto mt-12 max-w-2xl">
            <div
              className="pointer-events-none absolute -inset-1 rounded-[1.15rem] bg-gradient-to-r from-orange-500/15 via-transparent to-pink-500/15 opacity-60 blur-xl"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-2xl border border-[#1f1f26] bg-[#111116] shadow-[0_24px_80px_-28px_rgba(0,0,0,0.75)]">
              <div className="flex items-center gap-2 border-b border-[#1f1f26] bg-[#0a0a0e] px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3f3f46]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3f3f46]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3f3f46]" />
                </div>
                <span className="ml-2 text-[11px] font-medium text-gray-500">
                  Studio — Reel plan
                </span>
              </div>
              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2.5 text-[13px] font-medium text-white shadow-[0_12px_40px_-12px_rgba(249,115,22,0.4)]">
                    Why my hooks get skipped in 2 seconds
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 text-xs font-bold text-white shadow-md shadow-orange-500/20">
                    H
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="rounded-xl border border-[#1f1f26] bg-[#0b0b0f] p-4 shadow-inner">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        🔥 Viral hooks
                      </p>
                      <p className="mt-2 text-[13px] leading-relaxed text-gray-300">
                        “You’re not boring—your first line is lying for you.”
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#1f1f26] bg-[#0b0b0f] p-4 shadow-inner">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        🎬 60 sec script
                      </p>
                      <p className="mt-2 text-[13px] leading-relaxed text-gray-400">
                        0–3s pattern interrupt → callout → mistake → fix →
                        close.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="rounded-full border border-[#1f1f26] bg-[#16161c] px-3 py-1.5 text-[11px] text-gray-400 transition-colors duration-200 hover:border-orange-500/30">
                        Sharpen hooks?
                      </span>
                      <span className="rounded-full border border-[#1f1f26] bg-[#16161c] px-3 py-1.5 text-[11px] text-gray-400 transition-colors duration-200 hover:border-orange-500/30">
                        30 sec version?
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        id="pricing"
        className="relative z-10 scroll-mt-24 border-t border-[#1f1f26]/80 bg-gradient-to-b from-[#0b0b0f] to-[#060609] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Sparkles className="mx-auto h-8 w-8 text-orange-400/90" />
          <h2 className="mt-6 text-[1.65rem] font-semibold tracking-tight sm:text-3xl lg:text-[2rem]">
            Start creating better content today.
          </h2>
          <p className="mt-3 text-[15px] text-gray-400">
            Open the app—run an idea or upload a profile screenshot in under a
            minute.
          </p>
          <Link
            href="/app"
            className={`${primaryCtaClass} mt-10 px-10 py-4`}
          >
            Try HookLab AI
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer
        id="contact"
        className="relative z-10 scroll-mt-24 border-t border-[#1f1f26] py-10 text-center text-[12px] text-gray-500"
      >
        <p>
          © {new Date().getFullYear()} HookLab AI. Drafts are yours to review.
        </p>
      </footer>
    </div>
  );
}
