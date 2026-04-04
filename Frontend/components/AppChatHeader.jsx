"use client";

import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function AppChatHeader() {
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
