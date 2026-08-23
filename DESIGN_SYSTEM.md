# AgentGrid Design System

## Brand Identity

**Product**: AgentGrid — Autonomous AI Infrastructure Marketplace & Orchestrator
**Team**: Team LENA
**Network**: Algorand TestNet
**Protocol**: x402 (RFC 7235) + AVM Exact Scheme

---

## Color Palette

### Core Brand Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `brand.emerald` | `#00DC82` | 0, 220, 130 | Primary brand, CTAs, active states, success |
| `brand.emeraldDim` | `rgba(0, 220, 130, 0.10)` | — | Backgrounds for emerald-emphasis areas |
| `brand.mint` | `#10B981` | 16, 185, 129 | Secondary brand, hover states |
| `brand.lime` | `#4ADE80` | 74, 222, 128 | Accent highlights |
| `brand.white` | `#FFFFFF` | 255, 255, 255 | Text on dark backgrounds |
| `brand.silver` | `#E2E8F0` | 226, 232, 240 | Muted text |
| `brand.dark` | `#050706` | 5, 7, 6 | Near-black backgrounds |

### Grid Neutral Scale (Backgrounds & Borders)

| Token | Hex | Usage |
|-------|-----|-------|
| `grid.950` | `#040605` | **Primary page background** (near-black with green undertone) |
| `grid.900` | `#080C0A` | Card backgrounds, modal overlays |
| `grid.850` | `#0D1310` | Elevated cards, input backgrounds |
| `grid.800` | `#141D18` | Borders, dividers |
| `grid.750` | `#1B2620` | Hover borders, scrollbar thumb |
| `grid.700` | `#26362E` | Active borders, focus rings |
| `grid.600` | `#3A5245` | Disabled borders |
| `grid.500` | `#6B8777` | Muted text, placeholder |
| `grid.400` | `#9FB3A8` | Secondary text, labels |
| `grid.300` | `#D1DDD6` | Primary text on dark |
| `grid.200` | `#E8EFEA` | High-contrast text |
| `grid.100` | `#F5F8F6` | Near-white text |

### Signal Colors (Semantic States)

| Token | Hex | Usage |
|-------|-----|-------|
| `signal.emerald` | `#00DC82` | Success, confirmed, active, online |
| `signal.emeraldDim` | `rgba(0, 220, 130, 0.12)` | Success backgrounds |
| `signal.amber` | `#00DC82` | **Unified to emerald** — Warning/attention (uses brand emerald) |
| `signal.amberDim` | `rgba(0, 220, 130, 0.12)` | Warning backgrounds |
| `signal.cyan` | `#10B981` | Quality metrics, high reliability |
| `signal.cyanDim` | `rgba(16, 185, 129, 0.12)` | Quality backgrounds |
| `signal.rose` | `#EF4444` | Error, failed, offline, critical |
| `signal.roseDim` | `rgba(239, 68, 68, 0.12)` | Error backgrounds |

---

## Typography

### Font Families

```css
/* Sans-serif: UI text, body, labels */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Serif: Headlines, branding, display text */
font-family: 'Source Serif 4', Georgia, Cambria, serif;

/* Monospace: Code, addresses, tx IDs, metrics, tabular numbers */
font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
```

### Font Features

```css
font-feature-settings: "cv02", "cv03", "cv04", "cv11"; /* Sans: stylistic alternates */
font-feature-settings: "tnum"; /* Mono: tabular numerals */
font-variant-numeric: tabular-nums;
```

### Type Scale

| Element | Size | Weight | Font | Usage |
|---------|------|--------|------|-------|
| Hero Title | `text-5xl` → `text-8xl` | Extrabold | Mono | Landing page "AGENTGRID" |
| Section Title | `text-xl` → `text-2xl` | Bold | Mono | Page/section headers |
| Card Title | `text-sm` | Bold | Mono | Card headers |
| Body Text | `text-sm` → `text-base` | Normal | Sans | Paragraphs, descriptions |
| Label/Small | `text-xs` → `text-[10px]` | Medium | Mono | Form labels, metadata |
| Micro | `text-[9px]` → `text-[10px]` | Bold | Mono | Badges, pills, chips |
| Code/Monospace | `text-[11px]` → `text-[14px]` | Normal | Mono | Terminal output, addresses |

---

## Spacing System

Based on **4px grid** (Tailwind default):

| Scale | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps, icon-text |
| `space-2` | 8px | Standard gaps |
| `space-3` | 12px | Medium gaps |
| `space-4` | 16px | Card padding, section gaps |
| `space-5` | 20px | Large gaps |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Major section spacing |
| `space-10` | 40px | Page padding |
| `space-16` | 64px | Hero spacing |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded` | 4px | Buttons, small elements |
| `rounded-lg` | 8px | Cards, modals, inputs |
| `rounded-xl` | 12px | Large cards, panels |
| `rounded-2xl` | 16px | Modals, major panels |
| `rounded-full` | 9999px | Pills, badges, avatars, navbar |

---

## Shadows & Glows

```css
/* Subtle panel shadow */
--shadow-subtle-panel: 0 4px 24px -2px rgba(0, 0, 0, 0.85);

/* Brand glow (emerald) — used sparingly on primary CTAs */
--shadow-glow-emerald: 0 0 20px rgba(16, 185, 129, 0.5);

/* Modal/dialog elevation */
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.95);

/* Spotlight overlay (tour guide) */
--shadow-spotlight: 0 0 35px rgba(16, 185, 129, 0.8), 
                    0 0 0 9999px rgba(0, 0, 0, 0.65);
```

---

## Component Patterns

### Buttons

| Variant | Classes | Usage |
|---------|---------|-------|
| **Primary** | `bg-brand-emerald text-black font-bold hover:bg-brand-emerald/90 active:scale-95 shadow-glow-emerald` | Main CTAs, confirm actions |
| **Secondary** | `bg-white/[0.08] hover:bg-brand-emerald hover:text-black text-white border border-white/[0.1]` | Alternative actions |
| **Ghost** | `text-grid-400 hover:text-white hover:bg-white/[0.04]` | Toolbar, navbar |
| **Danger** | `text-signal-rose hover:bg-signal-rose/10` | Destructive actions |
| **Icon-only** | `p-1.5 rounded hover:bg-white/[0.06]` | Close, settings |

**States**:
- `disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none`
- `active:scale-95` (press feedback)
- `transition-all duration-200`

### Cards

```css
/* Base card */
.bg-grid-900.border.border-grid-800.rounded-xl.p-5.space-y-3

/* Status variants */
.active     → .border-grid-800.hover:border-grid-700
.degraded   → .border-signal-amber/40.bg-signal-amberDim/10
.offline    → .border-signal-rose/40.bg-signal-roseDim/10.opacity-70
```

### Inputs

```css
/* Default */
.w-full.bg-grid-950.border.border-grid-750.rounded.p-2.text-grid-100
.focus:outline-none.focus:border-signal-amber

/* Disabled */
.disabled:opacity-50.disabled:cursor-not-allowed

/* Error */
.border-signal-rose.focus:border-signal-rose
```

### Badges / Pills

```css
/* Status */
.px-2.py-0.5.rounded.text-[10px].font-mono.uppercase.tracking-tight

/* Colors */
.online/active    → .bg-signal-emeraldDim.text-signal-emerald.border-signal-emerald/30
.degraded/warning → .bg-signal-amberDim.text-signal-amber.border-signal-amber/30
.offline/error    → .bg-signal-roseDim.text-signal-rose.border-signal-rose/30
.quality          → .bg-grid-800.text-signal-cyan.border-signal-cyan/30
.neutral          → .bg-grid-800.text-grid-400
```

### Tables

```css
/* Container */
.overflow-x-auto

/* Table */
.w-full.text-left.font-mono.text-xs

/* Header */
.bg-grid-950/60.text-grid-400.text-[10px].uppercase.border-b.border-grid-800
th { @apply py-3 px-4; }

/* Body */
.divide-y.divide-grid-800/60
tr { @apply hover:bg-grid-850/50.transition-all; }

/* Selected row (rank 1) */
.bg-signal-amberDim/10.border-l-2.border-signal-amber

/* Rank badge */
.px-2.py-0.5.rounded.text-[10px].font-bold
#1 → .bg-signal-amber.text-grid-950
#2 → .bg-grid-750.text-grid-200
#3+ → .text-grid-500
```

---

## Layout Structure

### Page Wrapper

```tsx
<div className="min-h-screen max-w-full overflow-x-hidden bg-grid-950 text-grid-100 flex flex-col font-sans grid-bg-pattern relative selection:bg-signal-amber/20 selection:text-signal-amber">
  {/* Navbar - fixed top */}
  <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/85 backdrop-blur-2xl">
  
  {/* Main content */}
  <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-6 relative z-10 overflow-x-hidden">
  
  {/* Footer */}
  <footer className="border-t border-grid-850 bg-grid-950/80 backdrop-blur-md py-6 mt-16 relative z-10">
```

### Grid Background Pattern

```css
.grid-bg-pattern {
  background-color: #040605; /* grid.950 */
}
/* Optional: subtle CSS grid lines via background-image */
```

### Container Widths

| Context | Max Width |
|---------|-----------|
| Full page | `max-w-full` (100vw) |
| Content | `max-w-5xl` (64rem / 1024px) |
| Command Center | `max-w-4xl` (56rem / 896px) |
| Modals | `max-w-lg` (32rem / 512px) |
| Forms | `max-w-2xl` (42rem / 672px) |

---

## Animation & Motion

### Keyframes

```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes slideDown {
  0% { opacity: 0; transform: translateY(-8px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}
```

### Utility Classes

| Class | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `animate-fadeIn` | 200ms | ease-out | Page/section entrance |
| `animate-slideDown` | 250ms | cubic-bezier(0.4, 0, 0.2, 1) | Summary bar, dropdowns |
| `animate-pulse-subtle` | 2s | cubic-bezier(0.4, 0, 0.6, 1) | Live indicators |
| `animate-spin` | 1s | linear | Loading spinners |
| `transition-all duration-200` | 200ms | ease | Hover, focus, press |
| `transition-colors` | 150ms | ease | Color changes only |

### Motion Guidelines

- **Respect `prefers-reduced-motion`** — Disable `PixelSnow`, `Shuffle`, `animate-pulse-subtle` (except critical status), tour animations
- **Max 250ms** for UI transitions
- **No infinite loops** except: live status pulse, tour spotlight
- **Staggered entrance** for lists/grids (50-100ms per item)

---

## Responsive Breakpoints

| Breakpoint | Width | Tailwind | Usage |
|------------|-------|----------|-------|
| Mobile | < 640px | default | Single column, stacked cards |
| Tablet | 640px - 1024px | `sm:` | 2-column grids, side-by-side |
| Desktop | 1024px - 1280px | `md:` | 3-column grids, inline forms |
| Large | > 1280px | `lg:` | Full layout, generous spacing |

### Mobile-First Patterns

- **Cards**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Forms**: Stack on mobile, inline on `md:`
- **Navigation**: Drawer on mobile, pill bar on `lg:`
- **Tables**: Horizontal scroll with sticky first column on mobile
- **Text**: `text-[10px]` mobile → `text-xs` tablet → `text-sm` desktop

---

## Accessibility

### Color Contrast (WCAG AA)

| Combination | Ratio | Status |
|-------------|-------|--------|
| `grid.100` on `grid.950` | 15.3:1 | ✅ AAA |
| `grid.300` on `grid.950` | 9.2:1 | ✅ AAA |
| `grid.400` on `grid.950` | 5.8:1 | ✅ AA |
| `grid.500` on `grid.950` | 3.7:1 | ⚠️ Large text only |
| `brand.emerald` on `grid.950` | 4.1:1 | ✅ AA (large) |
| `signal.rose` on `grid.950` | 5.1:1 | ✅ AA |

**Rule**: Never use `grid.500` or `grid.600` for critical information. Minimum `text-xs` (12px) for `grid.400+`.

### Focus Management

```css
/* Visible focus ring */
.focus:outline-none.focus-visible:ring-2.focus-visible:ring-brand-emerald.focus-visible:ring-offset-2.focus-visible:ring-offset-grid-950

/* Skip link */
.skip-link { @apply absolute -top-10 left-4 z-50 px-4 py-2 bg-brand-emerald text-black rounded-lg focus:top-4; }
```

### ARIA Patterns

| Component | ARIA Attributes |
|-----------|-----------------|
| Modal | `role="dialog" aria-modal="true" aria-labelledby="title-id"` |
| Live region | `aria-live="polite"` (progress), `aria-live="assertive"` (errors) |
| Navigation | `aria-current="page"` on active tab |
| Buttons | `aria-label` for icon-only |
| Tables | `<caption>`, `th scope="col"` |
| Tabs | `role="tablist"`, `role="tab"`, `aria-selected` |

### Keyboard Navigation

- **Tab** — Forward focus
- **Shift+Tab** — Backward focus
- **Enter/Space** — Activate buttons
- **Escape** — Close modals, drawers, tours
- **Arrow keys** — Slider controls, tab panels

---

## Icon System

**Library**: Lucide React (`lucide-react`)

| Category | Icons |
|----------|-------|
| Navigation | `Menu`, `X`, `ChevronDown`, `ChevronUp`, `ArrowRight`, `ArrowLeft` |
| Status | `CheckCircle2`, `XCircle`, `AlertTriangle`, `AlertCircle`, `Radio` |
| AI/Compute | `Cpu`, `Server`, `Zap`, `Brain`, `Bot` |
| Blockchain | `Coins`, `ShieldCheck`, `Link`, `ExternalLink` |
| Data | `Database`, `HardDrive`, `Layers`, `Activity`, `TrendingUp` |
| Time | `Clock`, `Timer`, `History` |
| Wallet | `Wallet`, `Smartphone`, `QrCode` |
| Actions | `Send`, `RefreshCw`, `Copy`, `Check`, `Download`, `FileText`, `Save`, `Plus` |
| Search/Filter | `Search`, `Filter`, `SlidersHorizontal` |

**Sizing**:
- Inline with text: `w-3.5 h-3.5` (14px) or `w-4 h-4` (16px)
- Standalone: `w-5 h-5` (20px) or `w-6 h-6` (24px)
- Large display: `w-8 h-8` (32px) or `w-12 h-12` (48px)

---

## Visual Effects

### PixelSnow (Landing Background)

```tsx
<PixelSnow
  color="#ffffff"
  flakeSize={0.035}
  minFlakeSize={1.8}
  pixelResolution={200}
  speed={1.0}
  density={0.28}
  direction={125}
  brightness={1.0}
  depthFade={8}
  farPlane={20}
  gamma={0.4545}
  variant="square"
/>
```
- **Opacity**: 30% (`opacity-30`)
- **Reduced motion**: Disabled entirely

### Shuffle Text (Hero Title)

```tsx
<Shuffle
  text="AGENTGRID"
  duration={0.5}
  stagger={0.04}
  triggerOnHover={true}
  className="text-white"
/>
```
- **Reduced motion**: Instant swap

### Tour Guide Spotlight

```css
/* Overlay */
bg-black/85 backdrop-blur-md

/* Spotlight box */
.border-2.border-brand-emerald.bg-brand-emerald/10
.shadow-[0_0_35px_rgba(16,185,129,0.8),0_0_0_9999px_rgba(0,0,0,0.65)]
.animate-pulse

/* Popover */
.bg-[#0c120e].border-2.border-brand-emerald/70.rounded-2xl.p-5
.shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(16,185,129,0.25)]
.backdrop-blur-2xl
```

---

## Screen Inventory

| Screen | Route | Key Components |
|--------|-------|----------------|
| Landing | `/` | `LandingPage`, `PixelSnow`, `Shuffle` |
| Command Center | `/command` | `CommandCenter`, `ExecutionPipeline` |
| Marketplace | `/grid` | `MarketplaceGrid`, `PurchaseConfirmModal`, `RegisterGpuModal` |
| Routing Matrix | `/routing` | `RoutingMatrix` (sliders, table) |
| Algorand Ledger | `/ledger` | `AlgorandLedger` (accounts table, tx table) |
| Analytics HUD | `/analytics` | `AnalyticsHUD` (KPIs, task history) |
| x402 Testbed | `/x402-demo` | `DirectX402Demo` (3-phase flow) |
| Merchant x402 | `/merchant-demo` | `MerchantX402Demo` (raw HTTP flow) |

---

## Modal Stack (z-index)

| Layer | z-index | Components |
|-------|---------|------------|
| Base | 10 | Navbar |
| Modal backdrop | 50 | `ProviderRegisterModal`, `PeraTestnetModal`, `PurchaseConfirmModal`, `RegisterGpuModal` |
| Tour overlay | 100 | `TourGuideButton` spotlight |
| Toast/Alert | 110 | (Future) |

---

## Scrollbar Styling

```css
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: #080C0A; }
::-webkit-scrollbar-thumb { background: #1B2620; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #00DC82; }
```

---

## Selection Styling

```css
::selection {
  background-color: rgba(16, 185, 129, 0.2); /* brand.emerald / 20% */
  color: #00DC82; /* brand.emerald */
}
```

---

## Code Block Styling

```css
pre, code {
  max-width: 100%;
  word-break: break-word;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  line-height: 1.6;
}

pre {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: #040605; /* grid.950 */
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 12px;
}
```

---

## Implementation Notes

### Tailwind Config (Key Extensions)

```js
// tailwind.config.js
theme: {
  extend: {
    colors: { grid: {...}, brand: {...}, signal: {...} },
    fontFamily: { sans: [...], serif: [...], mono: [...] },
    boxShadow: { 
      'glow-emerald': '0 0 20px rgba(16,185,129,0.5)',
      'subtle-panel': '0 4px 24px -2px rgba(0,0,0,0.85)'
    },
    animation: {
      'fadeIn': 'fadeIn 200ms ease-out',
      'slideDown': 'slideDown 250ms cubic-bezier(0.4,0,0.2,1)',
      'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4,0,0.6,1) infinite',
    }
  }
}
```

### CSS Variables (for dynamic theming)

```css
:root {
  --color-bg-primary: #040605;
  --color-bg-card: #080C0A;
  --color-bg-elevated: #0D1310;
  --color-border: #141D18;
  --color-border-hover: #26362E;
  --color-text-primary: #D1DDD6;
  --color-text-secondary: #9FB3A8;
  --color-text-muted: #6B8777;
  --color-brand: #00DC82;
  --color-brand-dim: rgba(0, 220, 130, 0.10);
  --color-success: #00DC82;
  --color-warning: #00DC82;
  --color-info: #10B981;
  --color-error: #EF4444;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

---

## Future Enhancements

- [ ] Dark/Light mode toggle (currently dark-only)
- [ ] High-contrast mode
- [ ] Custom scrollbar for Firefox
- [ ] Animated route transitions (Framer Motion)
- [ ] Skeleton loaders for async cards
- [ ] Command palette (⌘K)
- [ ] Density compact/cozy toggle