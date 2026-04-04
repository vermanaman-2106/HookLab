import Link from "next/link";

export default function SupabaseSetupPrompt() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
      <p className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-transparent">
        Configuration
      </p>
      <h1 className="mt-4 text-center text-2xl font-semibold text-white">
        Supabase environment variables are missing
      </h1>
      <p className="mt-4 text-center text-[15px] leading-relaxed text-gray-400">
        Add <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-orange-200/90">
          NEXT_PUBLIC_SUPABASE_URL
        </code>{" "}
        and{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-orange-200/90">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>{" "}
        to <code className="text-gray-300">Frontend/.env.local</code>, then restart{" "}
        <code className="text-gray-300">npm run dev</code>. Copy from your Supabase
        project: Settings → API.
      </p>
      <p className="mt-6 text-center text-sm text-gray-500">
        See <code className="text-gray-400">Frontend/.env.example</code> for all
        variables.
      </p>
      <p className="mt-8 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-orange-400 hover:text-orange-300"
        >
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
