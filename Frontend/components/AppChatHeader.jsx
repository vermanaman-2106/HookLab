"use client";

import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

export default function AppChatHeader({ onOpenChatMenu }) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <SiteHeader
      variant="app"
      appLeadingSlot={
        typeof onOpenChatMenu === "function" ? (
          <button
            type="button"
            onClick={onOpenChatMenu}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Open chat history"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
        ) : null
      }
      appRightSlot={
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span
            className="hidden max-w-[160px] truncate text-xs text-gray-500 sm:inline"
            title={user?.email ?? undefined}
          >
            {user?.email ?? ""}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="shrink-0 rounded-lg border border-[#2a2a32] bg-[#14141c]/80 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-orange-500/30 hover:text-white"
          >
            Sign out
          </button>
        </div>
      }
    />
  );
}
