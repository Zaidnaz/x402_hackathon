# AgentGrid Frontend Design Handoff

## 1. Product Direction

AgentGrid is a focused operations workspace for routing AI workloads to model and GPU providers, settling payments on Algorand TestNet, and inspecting the resulting execution receipt.

The interface should feel like a quiet technical control room: dense enough for comparison, calm enough for repeated use, and explicit about payment and execution state.

Primary user goals:

1. Submit a task in natural language.
2. Understand why a provider route was selected.
3. Approve or observe x402 payment settlement.
4. Follow streamed execution output and failover events.
5. Inspect provider health, analytics, and on-chain receipts.
6. Register providers and adjust spending governance.

## 2. Visual Language

### Tone

- Technical, trustworthy, restrained, and transparent.
- Use status colors to communicate state, not decoration.
- Prefer information hierarchy and readable spacing over ornamental cards.
- Keep the main action obvious: `Start a task` / `Run agent`.

### Palette

The existing Tailwind theme uses these semantic families:

- `grid-*`: application surfaces, borders, primary and secondary text.
- `brand-emerald` / `brand-mint`: successful actions, active state, settlement confirmation.
- `signal-amber`: attention, approval, provider registration, pending work.
- `signal-cyan`: supporting metrics and model metadata.
- `signal-rose`: failure, rejected payment, provider outage, reroute warning.

Do not introduce a new color family for individual screens. Use the existing semantic colors so status meaning stays consistent.

### Background and surfaces

- App shell: full-height light grid workspace using `grid-bg-pattern`.
- Header/footer: dark translucent surfaces with borders and backdrop blur.
- Panels: `bg-grid-900` with `border-grid-800` or `border-grid-750`.
- Cards: use for repeated records, provider entries, receipts, and dialogs only.
- Keep page sections unframed where possible; avoid nesting cards inside cards.

### Typography

- Serif display face for high-level entry headings such as `Start with a task`.
- Sans for explanatory copy and readable body text.
- Monospace for technical values: transaction IDs, ALGO amounts, HTTP headers, model IDs, timestamps, and provider telemetry.
- Use compact uppercase micro-labels for section metadata.
- Do not use oversized display text inside tables, dialogs, or dense operational panels.

## 3. Layout Rules

### App shell

`client/src/App.tsx` owns the shell:

- `Navbar` is sticky at the top.
- Main content is centered with a responsive max width.
- Footer remains visually quiet and confirms `Algorand TestNet` and `x402`.
- Horizontal overflow must remain hidden at the document level.
- Mobile navigation uses a horizontal quick bar plus an expandable menu.

### Navigation

Tabs currently map to:

- `landing`: About / entry screen.
- `command`: task console and live execution pipeline.
- `grid`: marketplace directory.
- `routing`: route comparison matrix.
- `ledger`: accounts and transaction history.
- `analytics`: usage, savings, SLA, and task archive.
- `x402-demo`: raw HTTP 402 walkthrough.

The primary navigation item is `Tasks`. Secondary destinations should stay visually quieter.

### Responsive behavior

- Mobile-first layout with one-column panels.
- Use two or three columns only at `md`/`lg` widths.
- Buttons must have stable dimensions and never resize when loading text appears.
- Tables need horizontal scrolling or a deliberate compact/mobile representation.
- Dialogs must use `max-h-[90vh]` and internal scrolling.
- Text must wrap inside its parent; never allow transaction IDs or long provider names to break the layout.

## 4. Screen Specifications

### Landing / About

Component: `LandingPage.tsx`

Must include:

- Clear value proposition.
- Primary `Start a task` action.
- Secondary `Browse providers` action.
- Short four-step flow: understand, route, settle, return.
- Three capability signals: inspectable routing, receipts, failure-aware choices.

The landing screen is an orientation surface, not a marketing page. The actual task console should be reachable in one click.

### Task Console

Component: `CommandCenter.tsx`

Required states:

- Empty: focused prompt input and example prompts.
- Editing: auto-growing textarea, `Advanced` controls.
- Submitting: disabled input/action and spinner.
- Running: `ExecutionPipeline` is visible and updates through SSE.
- Approval required: show estimated ALGO amount, threshold, route, and `Approve & pay`.
- Failed: show human-readable error and allow `New Task` / retry.
- Completed: show output, route, payment receipt, total cost, and duration.

Advanced controls:

- Priority: balanced, cost, speed, quality.
- Optional failover simulation.
- Future numeric constraints should use inputs/sliders with explicit units and validation.

### Execution Pipeline

Component: `ExecutionPipeline.tsx`

Represent the event order clearly:

1. Understand request.
2. Scan marketplace.
3. Choose route.
4. Request x402 payment.
5. Pay on Algorand.
6. Reroute if needed.
7. Run workload.
8. Verify telemetry.

Each step needs a visible state:

- Pending: neutral icon and muted text.
- Active: emerald spinner and current message.
- Complete: emerald check and stable summary.
- Failed: rose alert with actionable error.
- Approval: amber callout with explicit user action.

The result panel must support streamed text, copy-to-clipboard, and a final on-chain explorer link. Multi-step plans should collapse completed steps into summaries while keeping the active step expanded.

### Marketplace

Component: `MarketplaceGrid.tsx`

Display:

- Provider name and region.
- GPU type, VRAM, interconnect, price, and latency.
- Model quality, context window, token rates, and modalities.
- x402 support and current status.

Interactions:

- Filter tabs: all, models, GPU fleet.
- Refresh catalog with visible loading state.
- Cycle compute status only when the backend confirms the mutation.
- Register a model or compute provider through `ProviderRegisterModal`.

Failed refresh or mutation must display an inline alert. Do not silently log an error and leave the user guessing.

### Routing Matrix

Component: `RoutingMatrix.tsx`

Make tradeoffs scannable:

- Cost.
- Latency.
- Quality.
- Reliability.
- Budget/SLA adherence.
- Pareto-optimal status.

The selected route must be visually distinct, but alternatives must remain readable. Explain the selected route in plain language before exposing raw scoring details.

### Ledger

Component: `AlgorandLedger.tsx`

Display:

- Agent, provider, and treasury accounts.
- ALGO balances.
- Copyable addresses.
- Transaction ID, round, amount, protocol fee, status, and timestamp.
- Links to AlgoKit Lora and Pera Explorer.

Never label a transaction confirmed unless the returned record says `confirmed`. Empty states should explain how to create the first settlement.

### Analytics

Component: `AnalyticsHUD.tsx`

Show:

- Cost reduction.
- SLA adherence.
- Average pipeline latency.
- Failover count.
- Completed task history.
- Exportable JSON receipts.

Metrics need a refresh action and a visible loading state. Empty history should be useful and should link the user back to the task console.

### x402 Testbed

Component: `DirectX402Demo.tsx`

Use a three-phase progression:

1. Unauthenticated request returns HTTP 402.
2. User signs the required TestNet payment through Pera Wallet.
3. Authorized request returns the protected payload.

The UI must never fabricate a successful payment token or imply settlement happened when no wallet transaction was signed. Network and wallet failures must remain visible and retryable.

### Modals

Components:

- `PeraTestnetModal.tsx`
- `ProviderRegisterModal.tsx`
- `SpendingPolicyModal.tsx`

Rules:

- `role="dialog"`, `aria-modal="true"`, and an accessible title.
- Close button always available.
- Internal scrolling on short screens.
- Inputs have visible labels, units, and constraints.
- Submit buttons show progress and prevent duplicate requests.
- Backend failures appear inside the modal.
- Never close a modal on a failed mutation.

## 5. Accessibility Requirements

- Every icon-only button needs an `aria-label` or useful `title`.
- Every form control needs a label or accessible name.
- Use `role="alert"` for errors and approval-required messages.
- Maintain visible keyboard focus states.
- Do not communicate state by color alone; pair color with text or icons.
- Links opening a new tab use `target="_blank"` and `rel="noreferrer"`.
- Respect reduced motion with a `prefers-reduced-motion` fallback for nonessential animations.

## 6. Design Acceptance Checklist

- The first screen makes task submission obvious.
- All API-backed actions show loading, success, and failure states.
- Payment state is truthful: pending, signed, confirmed, rejected, or unavailable.
- No panel overflows on a 375px-wide viewport.
- Long IDs and provider names do not overlap neighboring controls.
- Keyboard users can reach every action and close every dialog.
- Production build succeeds with `npm run build:client`.
