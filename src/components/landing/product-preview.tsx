const metrics = [
  { label: "Sales", value: "ETB 8,450", tone: "text-foreground" },
  { label: "Expenses", value: "ETB 2,180", tone: "text-foreground" },
  { label: "Cash position", value: "ETB 6,270", tone: "text-positive" },
  { label: "Outstanding", value: "ETB 3,400", tone: "text-attention" },
] as const;

const activity = [
  {
    title: "Sale recorded",
    detail: "12 shirts — ETB 4,800",
    tone: "bg-positive",
  },
  {
    title: "Inventory added",
    detail: "20 shirts",
    tone: "bg-accent",
  },
  {
    title: "Customer balance updated",
    detail: "Abebe — ETB 1,200",
    tone: "bg-attention",
  },
] as const;

const waveDelays = [0, 0.12, 0.04, 0.2, 0.08, 0.16, 0.02];

export function ProductPreview() {
  return (
    <div
      id="demo"
      className="enter-up w-full min-w-0 scroll-mt-24 rounded-xl border border-line bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
      style={{ animationDelay: "160ms" }}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-white/15" />
            <span className="size-2 rounded-full bg-white/15" />
            <span className="size-2 rounded-full bg-white/15" />
          </div>
          <p className="text-sm text-muted">Assistant</p>
        </div>
        <p className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-[11px] text-faint">
          Demo business
        </p>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <div className="voice-glow rounded-lg border border-accent/25 bg-accent-dim p-3.5 sm:p-4">
          <div className="flex min-w-0 items-start gap-3 sm:items-center">
            <div
              className="flex h-7 items-end gap-[3px]"
              aria-hidden="true"
            >
              {waveDelays.map((delay, index) => (
                <span
                  key={index}
                  className="wave-bar w-[3px] rounded-full bg-accent"
                  style={{
                    height: `${10 + (index % 4) * 4}px`,
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>
            <p className="min-w-0 text-sm text-foreground">
              “What did I sell today?”
            </p>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted break-words">
            <span className="text-accent">Assistant</span>
            {" — You sold ETB 8,450 today across 17 transactions."}
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-sm font-medium text-foreground">Today</h3>
            <p className="text-xs text-faint">Demo data</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-line bg-surface-2 px-3 py-3 transition-colors hover:border-white/12"
              >
                <p className="text-[11px] text-faint">{metric.label}</p>
                <p
                  className={`mt-1 text-sm font-medium tabular-nums sm:text-[15px] ${metric.tone}`}
                >
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-foreground">
            Activity
          </h3>
          <ul className="space-y-2">
            {activity.map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-lg border border-transparent px-1 py-1.5 transition-colors hover:border-line hover:bg-surface-2"
              >
                <span
                  className={`mt-1.5 size-1.5 shrink-0 rounded-full ${item.tone}`}
                />
                <div>
                  <p className="text-sm text-foreground">{item.title}</p>
                  <p className="text-sm text-muted">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
