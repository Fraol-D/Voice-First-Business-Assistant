import type { Metadata } from "next";
import { AssistantWorkspace } from "@/components/assistant/assistant-workspace";

export const metadata: Metadata = {
  title: "Assistant · Meri",
  description: "Run your business by voice. Record sales, track expenses, and ask questions.",
};

export default function AssistantPage() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <AssistantWorkspace />
    </main>
  );
}
