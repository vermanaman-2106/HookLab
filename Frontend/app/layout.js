import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "HookLab AI — Viral content strategy for creators",
  description:
    "Turn ideas into hooks, scripts, and growth strategy. Built for creators who want to grow faster.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} hooklab-scrollbar h-full antialiased`}
    >
      <body className="hooklab-scrollbar min-h-dvh flex flex-col bg-[#0b0b0f] font-sans text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
