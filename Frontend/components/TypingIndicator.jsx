"use client";

import { useEffect, useState } from "react";

const DEFAULT_STEPS = [
  "Analyzing your idea…",
  "Generating hooks…",
  "Building your script…",
];

const VISION_STEPS = [
  "Analyzing your growth stage…",
  "Understanding your positioning…",
  "Identifying scaling bottlenecks…",
  "Designing your next growth move…",
];

const PINTEREST_STEPS = [
  "Finding visual inspiration…",
  "Curating Pinterest ideas…",
];

export default function TypingIndicator({ steps: stepsProp }) {
  const steps =
    Array.isArray(stepsProp) && stepsProp.length > 0
      ? stepsProp
      : DEFAULT_STEPS;
  const [i, setI] = useState(0);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setI((n) => (n + 1) % steps.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [steps]);

  const label = steps[i] ?? steps[0];

  return (
    <div
      className="hooklab-message-enter flex items-center gap-3 rounded-2xl border border-[#1f1f26] bg-[#111116] px-5 py-4 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.55)]"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex gap-1.5" aria-hidden>
        <span className="hooklab-dot h-2 w-2 rounded-full bg-orange-400" />
        <span className="hooklab-dot h-2 w-2 rounded-full bg-pink-400" />
        <span className="hooklab-dot h-2 w-2 rounded-full bg-orange-400" />
      </div>
      <span
        key={label}
        className="text-sm font-medium text-gray-300 transition-opacity duration-200"
      >
        {label}
      </span>
    </div>
  );
}

export { VISION_STEPS, PINTEREST_STEPS };
