import type { Metadata } from "next";
import Link from "next/link";
import { AssistantWorkspace } from "@/components/assistant/assistant-workspace";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Assistant · Meri",
  description: "Record business events and ask questions against stored business data.",
};

export default function AssistantPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-line bg-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link href="/" className="text-base font-semibold tracking-tight">
            Meri
          </Link>
          <nav className="flex items-center gap-3 text-sm text-muted">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="text-foreground">Assistant</span>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <AssistantWorkspace />
      </main>
    </div>
  );
}
