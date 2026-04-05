"use client";

import Link from "next/link";

const NAV = [
  { label: "Use Cases", hash: "use-cases" },
  { label: "Features", hash: "features" },
  { label: "Pricing", hash: "pricing" },
  { label: "Contact", hash: "contact" },
];

export default function SiteHeader({
  ctaHref = "/app",
  ctaLabel = "Try it now",
  variant = "default",
  appRightSlot = null,
  /** Shown before the logo on small screens (e.g. mobile menu) */
  appLeadingSlot = null,
}) {
  const isHero = variant === "hero";
  const isApp = variant === "app";

  const headerClass = isHero
    ? "sticky top-0 z-50 border-0 bg-transparent px-0 py-0 shadow-none backdrop-blur-0"
    : isApp
      ? "sticky top-0 z-40 border-b border-[#1f1f26]/70 bg-[#0b0b0f]/95 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.65)] backdrop-blur-xl backdrop-saturate-150"
      : "sticky top-0 z-50 border-b border-[#1f1f26] bg-[#0b0b0f]/80 backdrop-blur-md";

  const gridOpacity = isHero || isApp ? null : "opacity-[0.45]";

  return (
    <header className={headerClass}>
      {!isHero && !isApp && (
        <div
          className={`pointer-events-none absolute inset-0 hooklab-header-grid ${gridOpacity}`}
          aria-hidden
        />
      )}
      <div
        className={`relative mx-auto max-w-7xl px-4 sm:px-6 ${
          isHero
            ? "py-4 sm:py-5"
            : isApp
              ? "flex min-h-[60px] items-center py-3.5 sm:min-h-[64px] sm:py-4"
              : "py-3.5 sm:py-4"
        }`}
      >
        {isApp ? (
          <div className="flex w-full min-w-0 items-center justify-between gap-2 sm:gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              {appLeadingSlot ? (
                <span className="flex shrink-0 md:hidden">{appLeadingSlot}</span>
              ) : null}
              <Link
                href="/"
                className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5 transition-opacity duration-200 hover:opacity-90"
                aria-label="HookLab AI — home"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 text-sm font-bold text-white shadow-[0_4px_24px_-4px_rgba(249,115,22,0.45)]"
                  aria-hidden
                >
                  H
                </span>
                <span className="truncate text-sm font-semibold tracking-tight text-white">
                  HookLab AI
                </span>
              </Link>
            </div>
            {appRightSlot ? (
              <div className="flex min-w-0 shrink-0 items-center justify-end">
                {appRightSlot}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="relative flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 transition-opacity duration-200 hover:opacity-90"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 text-sm font-bold text-white shadow-[0_4px_24px_-4px_rgba(249,115,22,0.45)]"
                aria-hidden
              >
                H
              </span>
              <span className="text-sm font-semibold tracking-tight text-white">
                HookLab AI
              </span>
            </Link>

            <nav
              className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex md:items-center md:gap-8"
              aria-label="Primary"
            >
              {NAV.map((item) =>
                variant === "hero" ? (
                  <a
                    key={item.hash}
                    href={`#${item.hash}`}
                    className="text-sm font-medium text-gray-400 transition-colors duration-200 hover:text-white"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.hash}
                    href={`/#${item.hash}`}
                    className="text-sm font-medium text-gray-400 transition-colors duration-200 hover:text-white"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            <div className="flex shrink-0 items-center justify-end gap-2">
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_6px_28px_-6px_rgba(249,115,22,0.55),inset_0_1px_0_0_rgba(255,255,255,0.12)] transition-all duration-200 hover:scale-105 hover:shadow-[0_10px_36px_-6px_rgba(249,115,22,0.6)] active:scale-[0.98]"
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
