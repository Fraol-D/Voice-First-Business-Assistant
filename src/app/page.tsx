const flow = [
  "Voice",
  "Validated Business Event",
  "Business State",
  "Analysis",
  "Decision",
] as const;

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[var(--line)] px-6 py-5 sm:px-10">
        <p className="text-sm tracking-[0.18em] uppercase text-[var(--muted)]">
          Voice-First Business Assistant
        </p>
        <p className="text-sm text-[var(--muted)]">STARK 2026</p>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16 sm:px-10">
        <p className="mb-6 text-sm font-medium tracking-[0.22em] uppercase text-[var(--accent)]">
          Early-stage hackathon project
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Voice-First Business Assistant
        </h1>
        <p className="mt-6 max-w-2xl text-2xl leading-snug text-[var(--muted)] sm:text-3xl">
          Run your business by voice.
        </p>
        <p className="mt-8 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
          A voice-first operating assistant for microbusinesses. This repository
          currently holds the project definition, ideation record, and planned
          architecture. Product implementation has not started.
        </p>

        <section className="mt-16 border-t border-[var(--line)] pt-10">
          <h2 className="text-sm tracking-[0.18em] uppercase text-[var(--muted)]">
            Intended core flow
          </h2>
          <ol className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {flow.map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span className="rounded-full border border-[var(--line)] px-4 py-2 text-sm">
                  {step}
                </span>
                {index < flow.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="hidden text-[var(--muted)] sm:inline"
                  >
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] px-6 py-5 text-sm text-[var(--muted)] sm:px-10">
        Built during the STARK Official Hackathon 2026.
      </footer>
    </div>
  );
}
