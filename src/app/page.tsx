import { ProductPreview } from "@/components/landing/product-preview";

const navLinks = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#demo", label: "Demo" },
] as const;

const steps = [
  {
    title: "Speak",
    body: "Tell the assistant what happened — a sale, an expense, a restock, or a customer debt.",
  },
  {
    title: "Record",
    body: "Your words become structured business activity, not a transcript sitting in a chat.",
  },
  {
    title: "Understand",
    body: "See sales, expenses, inventory, and outstanding payments in one place.",
  },
  {
    title: "Decide",
    body: "Ask questions about your business and get answers based on your recorded data.",
  },
] as const;

const capabilities = [
  {
    title: "Capture business activity",
    body: "Record sales, expenses, purchases, inventory changes, and customer debts by voice.",
  },
  {
    title: "See what is happening",
    body: "Get a simple view of your business activity and performance.",
  },
  {
    title: "Ask your business",
    body: "Ask questions about sales, inventory, expenses, and money owed.",
  },
  {
    title: "Make better decisions",
    body: "Use your own business data to answer practical operational questions.",
  },
] as const;

function Mark() {
  return (
    <span
      className="flex size-7 items-center justify-center rounded-md border border-line bg-surface-2"
      aria-hidden="true"
    >
      <span className="flex h-3 items-end gap-px">
        <span className="h-1.5 w-0.5 rounded-full bg-accent/70" />
        <span className="h-3 w-0.5 rounded-full bg-accent" />
        <span className="h-2 w-0.5 rounded-full bg-accent/80" />
      </span>
    </span>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-5 sm:px-8">
          <a
            href="#product"
            className="flex min-w-0 flex-1 items-center gap-2.5 md:flex-none"
          >
            <Mark />
            <span className="truncate text-sm font-medium tracking-tight">
              Voice-First Business Assistant
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <details className="relative md:hidden">
              <summary className="cursor-pointer list-none rounded-md border border-line px-2.5 py-1.5 text-sm text-muted">
                Menu
              </summary>
              <div className="absolute right-0 mt-2 w-44 rounded-lg border border-line bg-surface p-2 shadow-lg">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </details>
            <a
              href="#demo"
              className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              <span className="sm:hidden">Try</span>
              <span className="hidden sm:inline">Try the assistant</span>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section
          id="product"
          className="relative overflow-hidden scroll-mt-16"
        >
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14 lg:py-20">
            <div className="min-w-0">
              <p
                className="enter-up text-sm font-medium text-accent"
                style={{ animationDelay: "40ms" }}
              >
                Your business, in your voice.
              </p>
              <h1
                className="enter-up mt-4 max-w-xl text-[2.35rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]"
                style={{ animationDelay: "90ms" }}
              >
                Run your business by voice.
              </h1>
              <p
                className="enter-up mt-6 max-w-lg text-base leading-7 text-muted sm:text-[17px]"
                style={{ animationDelay: "140ms" }}
              >
                Speak naturally about sales, expenses, inventory, and customer
                debts. The assistant turns what you say into structured business
                records and helps you understand what is happening in your
                business.
              </p>
              <div
                className="enter-up mt-8 flex flex-wrap items-center gap-3"
                style={{ animationDelay: "200ms" }}
              >
                <a
                  href="#demo"
                    className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  Try the assistant
                </a>
                <a
                  href="#how-it-works"
                    className="rounded-md border border-line px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface-2"
                >
                  See how it works
                </a>
              </div>
            </div>
            <ProductPreview />
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-16 border-t border-line"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <p className="text-sm font-medium text-accent">How it works</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight">
              Speak. Record. Understand. Decide.
            </h2>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-lg border border-line bg-surface p-5 transition-colors duration-200 hover:border-accent/35"
                >
                  <p className="font-mono text-xs text-faint">
                    0{index + 1}
                  </p>
                  <h3 className="mt-3 text-base font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {step.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <p className="text-sm font-medium text-accent">Capabilities</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight">
              Everyday operations, without the forms.
            </h2>
            <div className="mt-10 grid gap-3 md:grid-cols-2">
              {capabilities.map((item) => (
                <article
                  key={item.title}
                  className="rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent/35"
                >
                  <h3 className="text-base font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 sm:py-20">
            <h2 className="text-3xl font-semibold tracking-tight">
              Run your business by voice.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted">
              Capture what happens in the shop, keep a live view of the
              business, and ask questions when you need to decide.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#demo"
                className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Try the assistant
              </a>
              <a
                href="#how-it-works"
                className="rounded-md border border-line px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface-2"
              >
                See how it works
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-sm font-medium">Voice-First Business Assistant</p>
            <p className="mt-1 text-sm text-muted">
              Run your business by voice.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <a href="#product" className="hover:text-foreground">
              Product
            </a>
            <a href="#how-it-works" className="hover:text-foreground">
              How it works
            </a>
            <a
              href="https://github.com/Fraol-D/Voice-First-Business-Assistant"
              className="hover:text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
