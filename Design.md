# Beat Store — UI/UX Design Document
**For AI Agent Implementation**  
**Version:** 1.0  
**Scope:** Full application — Storefront + Admin Dashboard

---

## 1. Design Philosophy

The beat store is a single-producer UK Drill and Trap beat marketplace. The visual identity is built on one principle: **raw, uncompromising restraint**. No gradients. No decorative noise. No colour distractions. The music is the product — everything else gets out of the way.

The aesthetic is monochrome-dominant: near-black backgrounds, white typography, surgical use of grey for hierarchy. The only moments of colour are semantic — green for published/success states, muted red for sold/error states, in the admin only. The storefront uses no colour at all beyond black, white, and greys.

This is not a generic dark-mode SaaS UI. It should feel like it belongs in the same world as the music — cold, deliberate, high-contrast.

---

## 2. Typography

### Fonts
Import both fonts from Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Role | Font | Weight | Size |
|---|---|---|---|
| Store name / hero headings | Syne | 700 | 24–48px |
| Section headings | Syne | 600 | 18–22px |
| Sub-headings / labels | Syne | 500 | 14–16px |
| Body / UI text | Syne | 400 | 13–15px |
| Order refs / codes | DM Mono | 400 | 12–13px |
| Beat metadata (BPM, key) | DM Mono | 400 | 12–13px |

### Type Scale

```css
--text-xs:   11px;
--text-sm:   12px;
--text-base: 13px;
--text-md:   14px;
--text-lg:   16px;
--text-xl:   18px;
--text-2xl:  22px;
--text-3xl:  28px;
--text-4xl:  36px;
```

### Line Heights
- UI elements: `line-height: 1.4`
- Body copy: `line-height: 1.65`
- Headings: `line-height: 1.15`

### Letter Spacing
- All-caps labels: `letter-spacing: 0.08em`
- Store name: `letter-spacing: 0.12em`
- Normal text: `letter-spacing: 0`

---

## 3. Colour System

The application supports both **dark mode** (default) and **light mode**, switchable via a toggle available in both the storefront nav and the admin sidebar. The user's preference is persisted in `localStorage` under the key `beat-store-theme`.

The root element (`<html>`) carries a `data-theme` attribute: `data-theme="dark"` or `data-theme="light"`. All colours are defined as CSS custom properties scoped to each theme.

### CSS Variable Definitions

```css
:root[data-theme="dark"] {
  /* Backgrounds */
  --bg-base:          #0a0a0a;
  --bg-surface:       #111111;
  --bg-elevated:      #161616;
  --bg-overlay:       #1e1e1e;
  --bg-hover:         #1a1a1a;

  /* Borders */
  --border-subtle:    #141414;
  --border-default:   #1e1e1e;
  --border-strong:    #2a2a2a;
  --border-focus:     #555555;

  /* Text */
  --text-primary:     #ffffff;
  --text-secondary:   #888888;
  --text-muted:       #444444;
  --text-disabled:    #2e2e2e;

  /* Accent (interactive primary) */
  --accent:           #ffffff;
  --accent-fg:        #000000;
  --accent-hover:     #e0e0e0;

  /* Semantic — admin only */
  --badge-success-bg:   #1a2a1a;
  --badge-success-text: #4a9a4a;
  --badge-danger-bg:    #2a1a1a;
  --badge-danger-text:  #9a4a4a;
  --badge-neutral-bg:   #1a1a1a;
  --badge-neutral-text: #666666;
  --badge-warning-bg:   #2a2010;
  --badge-warning-text: #9a7a30;

  /* Waveform */
  --waveform-played:    #ffffff;
  --waveform-unplayed:  #2a2a2a;
  --waveform-active:    #888888;

  /* Audio player */
  --player-bg:        #111111;
  --player-border:    #1e1e1e;

  /* Scrubber */
  --scrubber-track:   #2a2a2a;
  --scrubber-fill:    #ffffff;
  --scrubber-thumb:   #ffffff;
}

:root[data-theme="light"] {
  /* Backgrounds */
  --bg-base:          #f5f5f3;
  --bg-surface:       #ffffff;
  --bg-elevated:      #f0f0ee;
  --bg-overlay:       #e8e8e6;
  --bg-hover:         #f8f8f6;

  /* Borders */
  --border-subtle:    #efefed;
  --border-default:   #e4e4e2;
  --border-strong:    #d0d0ce;
  --border-focus:     #999999;

  /* Text */
  --text-primary:     #0a0a0a;
  --text-secondary:   #666666;
  --text-muted:       #aaaaaa;
  --text-disabled:    #cccccc;

  /* Accent */
  --accent:           #0a0a0a;
  --accent-fg:        #ffffff;
  --accent-hover:     #222222;

  /* Semantic — admin only */
  --badge-success-bg:   #eaf4ea;
  --badge-success-text: #2a6a2a;
  --badge-danger-bg:    #f4eaea;
  --badge-danger-text:  #8a2a2a;
  --badge-neutral-bg:   #f0f0f0;
  --badge-neutral-text: #666666;
  --badge-warning-bg:   #f4f0e0;
  --badge-warning-text: #7a5a10;

  /* Waveform */
  --waveform-played:    #0a0a0a;
  --waveform-unplayed:  #e0e0e0;
  --waveform-active:    #888888;

  /* Audio player */
  --player-bg:        #ffffff;
  --player-border:    #e4e4e2;

  /* Scrubber */
  --scrubber-track:   #e0e0e0;
  --scrubber-fill:    #0a0a0a;
  --scrubber-thumb:   #0a0a0a;
}
```

### Theme Toggle Implementation

```javascript
function initTheme() {
  const saved = localStorage.getItem('beat-store-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('beat-store-theme', next);
}

// Call on page load
initTheme();
```

The toggle button icon switches between a sun icon (when in dark mode, indicating you can switch to light) and a moon icon (when in light mode).

---

## 4. Spacing & Layout

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Border Radius
```css
--radius-sm:   4px;
--radius-md:   6px;
--radius-lg:   8px;
--radius-xl:   12px;
--radius-full: 9999px;
```

### Breakpoints
```css
--bp-sm:  640px;
--bp-md:  768px;
--bp-lg:  1024px;
--bp-xl:  1280px;
--bp-2xl: 1440px;
```

### Page Max Width
Storefront content max-width: `1200px`, centred with `margin: 0 auto` and `padding: 0 24px`.

---

## 5. Global Components

### 5.1 Buttons

All buttons use `font-family: 'Syne', sans-serif` and `cursor: pointer`.

**Primary button** — filled, high contrast:
```css
.btn-primary {
  background: var(--accent);
  color: var(--accent-fg);
  border: none;
  padding: 8px 18px;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 500;
  transition: background 0.15s ease, transform 0.1s ease;
}
.btn-primary:hover { background: var(--accent-hover); }
.btn-primary:active { transform: scale(0.98); }
```

**Secondary button** — outlined:
```css
.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-strong);
  padding: 8px 18px;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 400;
  transition: border-color 0.15s, color 0.15s;
}
.btn-secondary:hover { border-color: var(--border-focus); color: var(--text-primary); }
```

**Ghost button** — no border, subtle hover:
```css
.btn-ghost {
  background: transparent;
  color: var(--text-muted);
  border: none;
  padding: 6px 10px;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: background 0.15s, color 0.15s;
}
.btn-ghost:hover { background: var(--bg-overlay); color: var(--text-secondary); }
```

**Icon button** — square, ghost style:
```css
.btn-icon {
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text-muted);
  width: 32px; height: 32px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.15s, color 0.15s;
}
.btn-icon:hover { border-color: var(--border-focus); color: var(--text-secondary); }
```

**Danger button** (admin only):
```css
.btn-danger {
  background: transparent;
  color: var(--badge-danger-text);
  border: 1px solid var(--badge-danger-bg);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}
.btn-danger:hover { background: var(--badge-danger-bg); }
```

---

### 5.2 Form Inputs

All inputs use:
```css
.input {
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-family: 'Syne', sans-serif;
  font-size: var(--text-base);
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
}
.input::placeholder { color: var(--text-muted); }
.input:focus { border-color: var(--border-focus); }
.input:disabled { opacity: 0.4; cursor: not-allowed; }
```

**Label style** (all-caps, muted, small):
```css
.label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: block;
  margin-bottom: 5px;
}
```

**Select** — same as input, with custom arrow using `background-image`.

**Textarea** — same as input, `resize: vertical`, `min-height: 80px`.

**Form group** — `margin-bottom: 16px`.

---

### 5.3 Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 500;
  white-space: nowrap;
}
.badge-success { background: var(--badge-success-bg); color: var(--badge-success-text); }
.badge-danger   { background: var(--badge-danger-bg);  color: var(--badge-danger-text); }
.badge-neutral  { background: var(--badge-neutral-bg); color: var(--badge-neutral-text); }
.badge-warning  { background: var(--badge-warning-bg); color: var(--badge-warning-text); }
```

Usage:
- `badge-success` → Published, Active, Non-exclusive sold
- `badge-danger`  → Exclusive sold, Unpublished, Expired
- `badge-neutral` → Inactive, No cap
- `badge-warning` → Cap nearly reached (≥ 80% of cap filled)

---

### 5.4 Modal / Overlay

All modals use a full-screen overlay behind a centred panel.

```css
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.72);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.15s ease;
}
.modal-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: 28px;
  width: 100%; max-width: 480px;
  animation: slideUp 0.2s ease;
}
@keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
```

Modal header: title (Syne 500, 16px, `--text-primary`) left, close button (icon, ghost) right, separated from content by `border-bottom: 1px solid var(--border-subtle)` and `padding-bottom: 16px; margin-bottom: 20px`.

Close on overlay click and `Escape` key.

---

### 5.5 Toast Notifications

Toasts appear in the bottom-right corner. Stack if multiple.

```css
.toast-container {
  position: fixed; bottom: 24px; right: 24px;
  display: flex; flex-direction: column; gap: 8px;
  z-index: 200;
}
.toast {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 12px 16px;
  font-size: var(--text-base);
  color: var(--text-primary);
  display: flex; align-items: center; gap: 10px;
  min-width: 260px;
  animation: slideInRight 0.2s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}
@keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
```

Toast types: success (green left border `3px solid var(--badge-success-text)`), error (red left border), neutral (no border accent). Auto-dismiss after 4 seconds.

---

### 5.6 Loading States

**Skeleton loader** — for async content areas:
```css
.skeleton {
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  position: relative; overflow: hidden;
}
.skeleton::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent 0%, var(--bg-overlay) 50%, transparent 100%);
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
```

**Spinner** — for button loading states. 16px circular spinner, `border: 2px solid var(--border-strong)`, `border-top-color: var(--text-primary)`, rotation animation.

---

## 6. Storefront Layout

### 6.1 Global Nav

Full-width, `position: sticky; top: 0; z-index: 50`.

```
[STORE NAME]                    [Beats] [Licensing] [Contact]    [🌙] [Login] [Sign up]
```

Specifications:
- Background: `var(--bg-base)` with `border-bottom: 1px solid var(--border-subtle)`
- Height: `60px`
- Store name: Syne 700, 16px, letter-spacing 0.12em, `var(--text-primary)`
- Nav links: Syne 400, 13px, `var(--text-muted)`. Active page link: `var(--text-primary)` with `border-bottom: 1px solid var(--text-primary)`
- Theme toggle button: icon button, sun icon in dark mode, moon icon in light mode
- Login: secondary button
- Sign up: primary button
- On mobile (< 768px): hamburger menu collapses nav links. Store name remains visible. Theme toggle and auth buttons remain visible.

---

### 6.2 Persistent Audio Player

Fixed to the bottom of the viewport. `position: fixed; bottom: 0; left: 0; right: 0; z-index: 50`.

```
[cover] [title / genre · BPM]    [⏮] [▶/⏸] [⏭]    [0:48 ══════════░░░░░ 2:22]    [↓ MP3] [Buy — $29.99 ▾]
```

Specifications:
- Height: `68px`
- Background: `var(--player-bg)`
- Border-top: `1px solid var(--player-border)`
- Left section (200px): 40×40px cover art placeholder (rounded 5px) + beat title (14px 500 `text-primary`) + subtitle line ("UK Drill · 140 BPM", 11px `text-muted`, DM Mono)
- Transport controls: three icon buttons (skip-back, play/pause, skip-forward). Play/pause is a filled circle (32px, accent bg, accent-fg icon).
- Scrubber: flex-1. Elapsed time (DM Mono, 11px, `text-muted`) — track (4px height, `scrubber-track`, rounded) with a filled portion (`scrubber-fill`) — total time. Track is clickable/draggable to seek.
- Right section: MP3 download button (secondary, small, with download icon), Buy button (primary, shows active beat's non-exclusive price, with dropdown caret to switch between Non-excl / Excl license).
- When no beat is selected: player is visible but controls are disabled and text shows "Select a beat to preview".
- Player persists across navigation without resetting (use global audio state).

**License selector dropdown** (appears above Buy button on click):
- Floating panel, `border-radius: var(--radius-lg)`, `border: 1px solid var(--border-default)`, `background: var(--bg-surface)`
- Two rows (if both license types available): "Non-exclusive — $X.XX" and "Exclusive — $X.XX" with the exclusive row showing "N licenses already sold" in muted text beneath
- Selecting a row sets the checkout license type and dismisses the dropdown

---

## 7. Storefront Pages

### 7.1 Beat Catalogue (Home — `/`)

This is the primary page. The URL is the root.

#### Header / Hero Strip
Directly below the nav. Full-width strip, `padding: 32px 0 24px`.

```
PRODUCER'S BEATS                          [64 beats]
UK Drill & Trap · London
```

- Heading: Syne 700, 36px, `var(--text-primary)`, letter-spacing 0.06em
- Subline: Syne 400, 14px, `var(--text-muted)`
- Beat count: DM Mono, 12px, `var(--text-muted)`, aligned right

---

#### Filter Bar
Sticky below nav at `top: 60px` (nav height). `background: var(--bg-base)`. `border-bottom: 1px solid var(--border-subtle)`. `padding: 10px 0`.

Layout (left to right):
1. Search input — 220px wide, with search icon prefix
2. Genre select — "All genres" default
3. BPM select — options: "Any BPM", "60–90", "90–120", "120–140", "140–160", "160+"
4. Key select — chromatic keys, "Any key" default
5. Mood tags — multi-select pill group: "Dark", "Melodic", "Aggressive", "Chill", "Cinematic". Active pill: `background: var(--accent)`, `color: var(--accent-fg)`. Inactive: `background: var(--bg-overlay)`, `color: var(--text-secondary)`.
6. Spacer (flex: 1)
7. View toggle: list icon and grid icon buttons. Active view icon is `var(--text-primary)`, inactive is `var(--text-muted)`.
8. Sort select — "Newest", "Oldest", "Price: Low to High", "Price: High to Low", "Most previewed"

Active filters show a count badge on a "Clear filters" ghost button that appears when any filter is active.

---

#### Beat List (Default View)

A vertical list of beat rows. Each row is a single horizontal bar.

**Column structure** (7 columns, grid):
```
[36px play] [44px cover] [flex-1 title+tags] [72px bpm] [64px key] [flex-0.8 price] [120px actions]
```

**Table header row:**
- `padding: 8px 16px`
- Column labels: `var(--text-xs)`, `var(--text-muted)`, uppercase, letter-spacing 0.08em
- Columns labelled: (no label for play/cover), TITLE, BPM, KEY, LICENSE, (no label for actions)
- `border-bottom: 1px solid var(--border-default)`

**Beat row (normal state):**
- `padding: 11px 16px`
- `border-bottom: 1px solid var(--border-subtle)`
- `background: transparent`
- On hover: `background: var(--bg-hover)`
- Transition: `background 0.1s ease`

**Play button** (36px column):
- Circle, 32px diameter
- Default: `border: 1px solid var(--border-strong)`, transparent bg, play icon `var(--text-muted)`
- Hover: `border-color: var(--border-focus)`, icon `var(--text-secondary)`
- Active (this beat is playing): filled `var(--accent)` bg, pause icon `var(--accent-fg)`

**Cover art** (44px column):
- 40×40px square, `border-radius: var(--radius-md)`
- If the producer has uploaded artwork: show the image
- Placeholder: `background: var(--bg-overlay)`, music note icon centred, `var(--text-muted)`

**Title + tags** (flex-1):
- Beat title: Syne 500, 14px, `var(--text-primary)`
- Tag pills below: 11px, `background: var(--bg-overlay)`, `color: var(--text-muted)`, `padding: 2px 6px`, `border-radius: var(--radius-sm)`. Display genre + mood tags, max 3 visible.
- `margin-bottom: 3px` between title and tags

**BPM** (72px):
- DM Mono, 13px, `var(--text-secondary)`

**Key** (64px):
- DM Mono, 13px, `var(--text-secondary)`

**License / Price** (flex-0.8):
- If both licenses available:
  - Line 1: "Non-excl." label (11px muted) + price (Syne 500, 13px, `var(--text-primary)`)
  - Line 2: "Excl." label (11px muted) + price (12px `var(--text-secondary)`)
- If only non-exclusive: single price line
- If only exclusive: "Exclusive — $X" single line
- If exclusive sold: no price, show "EXCLUSIVE SOLD" badge

**Actions** (120px, right-aligned, flex):
- Download icon button (secondary icon button, downloads the free watermarked MP3)
- Buy button (primary, "Buy" label, 80px wide)
- If exclusive sold: only show disabled "SOLD" button (secondary disabled style, full width of actions column)

**Beat row (exclusive sold state):**
- Entire row opacity: `0.45`
- Cursor: `default`
- Play button still functional (can still preview even if sold)
- No hover background change

**Beat row (active / currently playing):**
- `background: var(--bg-elevated)`
- Play button is filled (pause icon)
- Stays highlighted while playing

---

#### Beat Grid (Alternate View)

Triggered by the grid view toggle in the filter bar.

Grid: `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`, `gap: 16px`.

**Beat card:**
- `background: var(--bg-surface)`
- `border: 1px solid var(--border-default)`
- `border-radius: var(--radius-xl)`
- `overflow: hidden`

**Card cover area:**
- `aspect-ratio: 1`
- Cover image or placeholder (same as list view)
- On hover: show a centred play button overlay (semi-transparent dark bg, white play icon circle)
- BPM overlay: bottom-right corner, `background: rgba(0,0,0,0.65)`, DM Mono, 11px, padding 3px 8px, `border-radius: var(--radius-sm)`

**Card body** (`padding: 12px`):
- Beat title: Syne 500, 14px, `var(--text-primary)`, `margin-bottom: 4px`
- Genre + key: DM Mono, 11px, `var(--text-muted)`, `margin-bottom: 10px`
- Price row: non-exclusive price prominent (Syne 500, 16px, `var(--text-primary)`), exclusive price smaller below
- Action row: Buy button (full width, primary) with download icon button beside it

---

### 7.2 Beat Detail Modal

Clicking a beat title (not the play button) opens a detail modal over the catalogue.

Modal max-width: 640px.

**Modal content:**

Top section (two columns):
- Left: beat cover art, 200×200px, `border-radius: var(--radius-lg)`
- Right: beat title (Syne 700, 22px), genre + key + BPM metadata row (DM Mono, 13px, `var(--text-muted)`), mood tags (same pill style)

Audio preview section:
- Full-width waveform visualisation (not interactive in this view — static representation)
- Play/pause button
- Time elapsed / total

Waveform: array of 60 vertical bars, each `width: 2px`, `border-radius: 1px`, height proportional to a pre-generated random waveform stored per beat. Played bars: `var(--waveform-played)`. Unplayed: `var(--waveform-unplayed)`. Current position bar: `var(--waveform-active)`. Clicking a position on the waveform seeks to that position.

License selection section:
- Heading: "Choose a license" (Syne 500, 14px, `var(--text-primary)`)
- License option cards (horizontal, side-by-side if both available):

**License card:**
```
Non-exclusive                Exclusive
$29.99                       $199.99
Multiple buyers allowed      One buyer only — yours forever
N licenses already sold      12 non-excl. already sold
[Select]                     [Select]
```
- Default: `border: 1px solid var(--border-default)`
- Selected: `border: 2px solid var(--accent)`
- Card padding: 16px, `border-radius: var(--radius-lg)`
- License name: Syne 500, 14px
- Price: Syne 700, 20px
- Description: 12px `var(--text-muted)`
- "N licenses already sold" note: DM Mono, 11px, `var(--text-muted)`, only shown on exclusive card if non-exclusive sales exist
- Select button: secondary button, full width, becomes primary when selected

Footer row:
- Download MP3 (free) — secondary button with download icon
- Checkout button — primary button, full width, disabled until a license is selected

---

### 7.3 Checkout Flow

#### Guest Checkout Modal

Triggered by the Buy button (on any beat row, card, or detail modal). Opens as a modal.

**Step 1 — License confirmation**
- Shows selected beat cover + title
- Shows selected license type and price
- If a discount code was entered (see below): shows discounted price and code applied
- Discount code input: text input with "Apply" button inline. On successful apply: input goes green-bordered, shows discount amount. On invalid: red-bordered, error message below.
- If a bulk discount applies automatically: show "Bulk discount applied" with savings amount
- "Proceed to payment" primary button

**Step 2 — Customer details (guest only)**
- Name input (required)
- Email input (required)
- Checkbox: "Create an account with this email" (optional)
  - If checked: show password input below
- "Proceed to payment" primary button

**Step 3 — Payment**
- Paystack payment modal opens. The modal is Paystack's native UI — do not replicate it. The application's modal sits behind while Paystack's modal is active.
- On Paystack success callback: show processing spinner with "Confirming your payment…" text
- On webhook confirmation: transition to success state

**Step 4 — Success state (replaces modal content)**
- Checkmark icon (large, `var(--text-primary)`)
- "You're all set." heading (Syne 700, 22px)
- "We've sent your download link to [email]" subtext
- Order reference: DM Mono, `var(--text-muted)` — "Save this: ORD-XXXX"
- "Continue browsing" ghost button (closes modal)
- If account was created: "Visit your dashboard" primary button

#### Returning Customer Checkout
- Logged-in customers skip Step 2 (details auto-filled)
- Same Steps 1, 3, 4

---

### 7.4 Customer Dashboard (`/dashboard`)

Accessible to registered customers only. Redirects to login if unauthenticated.

Layout: full-page, nav visible. No sidebar. Single column, max-width 800px, centred.

**Header:**
- "My Purchases" heading (Syne 700, 28px)
- Subtitle: "N beats purchased" (Syne 400, 14px, `var(--text-muted)`)

**Purchase list:**
Each purchase is a card (`background: var(--bg-surface)`, `border: 1px solid var(--border-default)`, `border-radius: var(--radius-lg)`, `padding: 16px`).

Card layout:
```
[40px cover] [Beat title — license type — purchase date]    [Re-download ↓]
```
- Beat title: Syne 500, 14px
- License type badge: `badge-success` for non-exclusive, `badge-neutral` for exclusive
- Date: DM Mono, 12px, `var(--text-muted)`
- Re-download button: secondary button with download icon. On click: generates a new signed URL server-side and initiates download. Shows spinner while generating.

Empty state: "No purchases yet." centred, with "Browse beats" primary button.

**Account settings section** (below purchase list, separated by `margin-top: 48px`):
- Subheading: "Account" (Syne 600, 16px)
- Inline edit fields: Name, Email
- Change password option
- Save button (primary)
- Log out ghost button (red text, `var(--badge-danger-text)`)

---

### 7.5 Lost Download Link Page (`/resend-link`)

Full page. Centred single card, max-width 400px.

**Card:**
- Heading: "Lost your download?" (Syne 700, 22px)
- Body: "Enter the email and order reference from your purchase confirmation." (14px `var(--text-secondary)`)
- Email input
- Order reference input (placeholder: "ORD-XXXX", DM Mono)
- Submit button: primary, full width, "Send me a new link"
- On success: replace card content with confirmation message
- On failure (no matching order): show inline error below reference input

---

### 7.6 Login & Sign Up Pages (`/login`, `/signup`)

Both pages: centred card, max-width 400px, `margin-top: 80px`.

**Login card:**
- Heading: "Welcome back" (Syne 700, 22px)
- Email + Password inputs
- "Forgot password?" ghost link (right-aligned below password field)
- Login primary button
- Divider: "— or —" (`var(--text-muted)`)
- "Don't have an account? Sign up" link

**Sign up card:**
- Heading: "Create an account" (Syne 700, 22px)
- Name, Email, Password inputs
- Password strength indicator bar below password field
- Sign up primary button
- "Already have an account? Log in" link

Both handled via Clerk's `<SignIn>` and `<SignUp>` components, but styled to match the application's design tokens (Clerk supports CSS variables customisation via its `appearance` prop).

---

### 7.7 Licensing Info Page (`/licensing`)

Static page. Single column, max-width 720px.

Three section cards, one per license type. Each card:
- License name heading (Syne 700, 20px)
- Bullet list of what the license includes (streams allowed, commercial use, credit required, etc.)
- Price info note: "Starting from $X.XX — set per beat"
- CTA: "Browse beats" ghost button

**Important note section** at bottom:
Plain prose explaining what happens when exclusive is purchased after non-exclusive sales. No decorative elements — just clean typography.

---

## 8. Admin Dashboard Layout

### 8.1 Shell

The admin area lives under `/admin/*`. All routes redirect to `/admin/login` if the user is not authenticated as the producer.

Full-height flex layout:

```
[188px sidebar] [flex:1 main content]
```

**Sidebar:**
- `background: var(--bg-surface)` (slightly lighter than base)
- `border-right: 1px solid var(--border-subtle)`
- `position: fixed; top: 0; left: 0; height: 100vh; width: 188px`
- `overflow-y: auto`

**Main content area:**
- `margin-left: 188px`
- `min-height: 100vh`
- `background: var(--bg-base)`
- Inner scroll, not full-page scroll

### 8.2 Sidebar Contents

Top section (no scroll):
```
PRODUCER                          (store name, Syne 700, 14px, letter-spacing 0.08em)
Beat Store Admin                  (Syne 400, 11px, text-muted)
```
`padding: 18px 16px 14px`, `border-bottom: 1px solid var(--border-subtle)`

**Nav items** (each):
```css
.admin-nav-item {
  display: flex; align-items: center; gap: 9px;
  width: 100%;
  padding: 9px 16px;
  background: transparent;
  border: none;
  border-right: 2px solid transparent;
  color: var(--text-muted);
  font-family: 'Syne', sans-serif;
  font-size: var(--text-base);
  text-align: left;
  cursor: pointer;
  transition: background 0.1s, color 0.1s, border-color 0.1s;
}
.admin-nav-item:hover { background: var(--bg-elevated); color: var(--text-secondary); }
.admin-nav-item.active {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border-right-color: var(--accent);
}
```

Nav items in order:
1. Dashboard icon + "Overview"
2. Music note icon + "Beats"
3. Receipt icon + "Orders"
4. Tag icon + "Promotions"
5. Settings icon + "Settings"

Bottom of sidebar (pinned):
- Theme toggle (sun/moon icon + label "Light mode" / "Dark mode", ghost nav item style)
- "View store ↗" ghost link (opens storefront in new tab)
- Logged-in user email (DM Mono, 11px, `var(--text-muted)`)
- Log out button (ghost, danger colour on hover)

### 8.3 Top Bar

Inside main content area. `position: sticky; top: 0; z-index: 40`.
`background: var(--bg-surface)`, `border-bottom: 1px solid var(--border-subtle)`, `height: 52px`, `padding: 0 24px`.

Left: current page title (Syne 500, 15px, `var(--text-primary)`)
Right: notification icon button, admin avatar circle (initials, 30px, `background: var(--bg-overlay)`)

---

## 9. Admin Pages

### 9.1 Overview (`/admin`)

Content area padding: `24px`.

#### Metric Cards Row
4 cards, equal-width grid (`grid-template-columns: repeat(4, 1fr)`, `gap: 12px`).

Each metric card:
- `background: var(--bg-elevated)`
- `border: 1px solid var(--border-subtle)`
- `border-radius: var(--radius-lg)`
- `padding: 14px 16px`
- Label: `var(--text-xs)`, `var(--text-muted)`, uppercase, letter-spacing 0.08em, `margin-bottom: 6px`
- Value: Syne 500, 22px, `var(--text-primary)`
- Sub-note: 11px, `var(--text-muted)` (or success/danger colour for growth indicators)

Cards:
1. "Total revenue" — value: lifetime USD total — sub: "All time"
2. "This month" — value: current month total — sub: "↑ X% vs last month" (green if positive, red if negative)
3. "Licenses sold" — value: total count — sub: "X non-excl · Y excl"
4. "Avg. conversion" — value: "X.X%" — sub: "Preview → purchase"

#### Revenue Chart
Below metric cards. `margin-top: 16px`.

Card container: `background: var(--bg-surface)`, `border: 1px solid var(--border-default)`, `border-radius: var(--radius-lg)`, `padding: 20px`.

Header row: "Monthly revenue" (Syne 500, 13px, `var(--text-secondary)`) left, year selector (ghost select, right-aligned).

Bar chart: 12 months across the x-axis. Each bar is a `div` column:
- Bar column: `display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 1`
- Bar rect: `width: 100%; background: var(--bg-overlay); border-radius: 3px 3px 0 0`. The bar representing the current month uses `var(--accent)` background.
- Month label below: DM Mono, 10px, `var(--text-muted)`
- Tooltip on hover: small floating panel showing the exact revenue figure (DM Mono, 12px)

Two-column row below chart:

**License split** (right, 200px):
- "License split" label
- Two progress bars: Non-exclusive (count and filled bar) and Exclusive (count and partial bar). Bars use `var(--accent)` for non-exclusive, `var(--border-focus)` for exclusive.

#### Beat Performance Table
Below the chart row. `margin-top: 16px`.

Card container: same card style.
Header: "Beat performance" (Syne 500, 13px, `var(--text-secondary)`) left, "View all beats →" ghost link right.

Table columns: Beat title | Previews | Purchases | Conversion | Non-excl sold | Excl sold

Each row: `font-size: var(--text-base)`. Beat title: `var(--text-primary)`. All other cells: DM Mono, `var(--text-secondary)`.

#### Recent Orders Table
Below beat performance. Same card style.
Header: "Recent orders" left, "View all →" ghost link right.

Columns: Order ref | Customer | Beat | License | Amount | Date

- Order ref: DM Mono, `var(--text-muted)`
- Customer: full email, `var(--text-secondary)`
- Beat: `var(--text-primary)`
- License: badge (success for non-excl, neutral for excl)
- Amount: Syne 500, `var(--text-primary)`
- Date: DM Mono, `var(--text-muted)`

---

### 9.2 Beats (`/admin/beats`)

#### Page Header
"Beats" title left, beat count note ("4 beats · 3 published") in `var(--text-muted)` beside it, "Upload beat" primary button right.

#### Beat Table

Card container: same as above.

Columns: `grid-template-columns: 44px 1fr 160px 110px 90px 90px`
- Cover (44px)
- Beat info (flex-1): title + metadata line
- Licenses (160px): license types and prices
- Sales (110px): "X / Y non-excl" + preview count
- Status (90px): badge
- Actions (90px): edit icon btn + unpublish/publish icon btn + delete icon btn (danger colour)

**Beat row details:**
- Cover: 36×36px, same placeholder as storefront
- Title: Syne 500, 13px, `var(--text-primary)`
- Metadata line: DM Mono, 11px, `var(--text-muted)` — "UK Drill · 140 BPM · F Min"
- License info: two-line, 11px — "Non-excl $29.99" / "Excl $199.99" or single line if only one
- Sales: "12 / 20" (DM Mono, 12px) — numerator is sold, denominator is cap (dash if no cap). Preview count below in 11px muted.
- Status badge: Published (success), Unpublished (neutral), Excl. sold (danger, full row dimmed at 0.5 opacity)
- Actions: edit (opens upload/edit modal), eye-off/eye (toggle publish), trash (opens confirm delete modal)

**Confirm delete modal:**
- Warning: "Delete [Beat Title]?"
- Body: "This cannot be undone. Existing license holders will not be affected."
- Cancel (secondary) + Delete (danger button)

---

### 9.3 Upload / Edit Beat Modal

Opens as a full-screen modal (max-width: 640px, scrollable content).

Sections:

**1 — Files**
- Watermarked MP3 upload zone: dashed border, `border-color: var(--border-strong)`, rounded lg. Drag-and-drop or click to browse. On upload: shows filename + filesize + remove button.
- Clean WAV upload zone: same style. Label notes: "This file is private — only sent to paying customers."
- Cover art upload zone: smaller, square aspect ratio preview once uploaded.

**2 — Metadata**
- Beat title (text input)
- Genre (select: UK Drill, Trap, Drill, Melodic Drill, Boom Bap, Other)
- BPM (number input, min 60, max 220)
- Key (select: all 12 chromatic keys, major/minor variants)
- Mood tags (multi-select pill group: Dark, Melodic, Aggressive, Chill, Cinematic, Gritty, Atmospheric)

**3 — Licensing**
Three-section accordion (expanded by default):

*Non-exclusive section:*
- Toggle switch: "Enable non-exclusive" (default: on)
- Price input (USD, number, step 0.01)
- Sales cap input: number input with label "Max licenses (leave blank for unlimited)"

*Exclusive section:*
- Toggle switch: "Enable exclusive" (default: on)
- Price input (USD)

*Both section (info):*
- Static info: "If a customer purchases the exclusive license, the beat will be removed from your store. Existing non-exclusive holders keep their rights."

**4 — Visibility**
- Toggle: "Publish immediately" — if off, beat is saved as draft

**Footer:**
- Cancel (ghost) + Save beat (primary) buttons

---

### 9.4 Orders (`/admin/orders`)

#### Filter Bar
- Date range: select (All time, Today, This week, This month, Last 3 months, Custom)
- Beat: select (All beats + each beat name)
- License type: select (All, Non-exclusive, Exclusive)
- Search: text input searching by customer email or order reference
- Right side: summary stats shown inline — "47 orders · $4,280.00 total" (DM Mono, 12px, `var(--text-muted)`)

#### Order Table

Card container.

Columns: `grid-template-columns: 90px 1fr 1fr 100px 80px 90px 70px 32px`
- Order ref (DM Mono)
- Customer email
- Beat title
- License badge
- Amount (Syne 500)
- Date (DM Mono)
- Downloads ("2 / 3" format, DM Mono)
- Expand icon button

**Expanded row** (clicking the expand icon):
- Slides down to reveal a sub-row panel with:
  - Full customer name (if registered account)
  - Paystack transaction reference
  - Download link expiry status ("Expired", "Expires in 18h", or "Expires in X min")
  - "Resend download link" secondary button — on click: regenerates signed URL and resends email, shows toast confirmation

---

### 9.5 Promotions (`/admin/promotions`)

Two sections on the page, stacked vertically.

#### Section 1 — Discount Codes

Header row: "Discount codes" (Syne 500, 14px) left, "+ New code" primary button right.

Card container.

**Code table columns:** `grid-template-columns: 130px 1fr 80px 80px 90px 80px`
- Code: DM Mono, `var(--text-primary)`
- Description: "X% off any beat" or "$X off [beat name]", `var(--text-secondary)`
- Used: DM Mono, "14 / 50" or "14 / ∞"
- Expires: DM Mono, date or "No expiry"
- Status: badge (Active / Inactive / Expired)
- Actions: edit icon, deactivate/activate toggle icon

**New/Edit code modal:**
- Code string input (auto-generate button beside it)
- Discount type: toggle pills ("Percentage" / "Fixed amount")
- Discount value input (shows "%" or "$" prefix based on type)
- Applies to: "Any beat" (default) or specific beat select
- Usage limit: number input (blank = unlimited)
- Expiry date: date picker (blank = no expiry)
- Stackable with bulk discount: checkbox
- Save button

#### Section 2 — Bulk Discount Rules

Header row: "Bulk discounts" (Syne 500, 14px) left, "+ New rule" primary button right.

Card container.

**Rule rows:** each rule displayed as a single row:
- "Buy [X]+ beats, get [Y]% off" description (Syne 400, 13px, `var(--text-primary)`)
- Stackable / not stackable note (11px, `var(--text-muted)`)
- Status badge
- Edit + delete actions

**New/Edit rule modal:**
- Minimum quantity input: "Buy at least X beats in one order"
- Discount percent input
- Stackable toggle: "Allow stacking with discount codes"
- Active toggle
- Save button

#### Section 3 — Beat Giveaways

Header: "Giveaways — free beats" left, explanation note right.

List of beats currently set to free. Toggle button on each: "Set to free" / "Remove giveaway".

Note: Setting a beat to free prices its non-exclusive license at $0. The checkout flow skips payment and goes directly to the download link delivery step.

---

### 9.6 Settings (`/admin/settings`)

Single column, max-width 520px, card sections stacked.

**Section 1 — Store profile**
- Store name (text input)
- Bio / description (textarea)
- Profile photo upload (square crop, 200×200px)

**Section 2 — Social links**
- Instagram URL
- Twitter / X URL
- YouTube URL
- SoundCloud URL

**Section 3 — Featured beats**
- Multi-select list of published beats
- Drag to reorder (up to 6 featured)
- Featured beats are pinned to the top of the catalogue with a subtle "Featured" label

**Section 4 — Notification preferences**
- Toggle: "Email me when a beat is sold" (default: on)
- Notification email address (pre-filled with producer's account email, editable)

**Section 5 — Account**
- Change password (secondary button, opens modal)
- Admin email display (DM Mono, `var(--text-muted)`)
- Log out danger button

Each section is a card (`background: var(--bg-surface)`, `border: 1px solid var(--border-default)`, `border-radius: var(--radius-lg)`, `padding: 20px`). Section heading: Syne 500, 13px, `var(--text-secondary)`, `margin-bottom: 16px`.

Save changes button (primary) appears below each section independently.

---

## 10. Email Templates

Emails are plain HTML sent via Resend. All emails use inline CSS (no external stylesheets). Use a consistent template wrapper.

### Template Wrapper

```html
<div style="background:#0a0a0a;padding:40px 24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#111111;border-radius:8px;padding:32px;border:1px solid #1e1e1e;">
    <!-- Header -->
    <p style="font-size:13px;font-weight:700;color:#ffffff;letter-spacing:0.12em;margin:0 0 28px;">PRODUCER</p>
    <!-- Content -->
    <!-- Footer -->
    <div style="border-top:1px solid #1e1e1e;margin-top:28px;padding-top:20px;">
      <p style="font-size:11px;color:#444444;margin:0;">yourbeats.com · Unsubscribe</p>
    </div>
  </div>
</div>
```

### Email 1 — Purchase Confirmation (to customer)

Subject: `Your beat is ready — [Beat Title]`

Content:
- Heading: "You're all set." (Syne/Helvetica 700, 22px, white)
- Body: "Here's your download link for [Beat Title] ([License Type] License)."
- Download button: large white button, black text, "Download [Beat Title] (WAV)"
- Link expires: DM Mono, muted — "Link expires in 48 hours · 3 downloads available"
- Order details block (grey surface card):
  - Order ref: DM Mono
  - Beat: beat title
  - License: type
  - Amount paid: USD
  - Date: formatted
- Footer note: "Save your order reference — you'll need it to request a new link if yours expires."
- Note on non-exclusive: "You hold a non-exclusive license. Credit the producer as: Prod. [Producer Name]"

### Email 2 — Resent Download Link (to customer)

Subject: `New download link — [Beat Title]`

Content:
- Heading: "Here's your new link."
- Download button (same style)
- "Your previous download count carries over. You have [X] downloads remaining."
- Order ref reminder

### Email 3 — New Sale Notification (to producer)

Subject: `New sale — [Beat Title] · [License Type] · $X`

Content:
- Heading: "You made a sale."
- Sale details: beat, license type, amount, customer email, order ref
- "Log in to your dashboard to view the full order."
- Link to admin orders page

---

## 11. Interaction & Motion

### Principles
- Transitions are fast (100–200ms) and functional — they communicate state change, not decoration.
- No entrance animations on page load (content appears immediately).
- Modals slide up + fade in (200ms).
- Toasts slide in from the right (200ms).
- Row hover states transition at 100ms.
- Audio player scrubber updates smoothly during playback.
- Theme toggle: entire page transitions colour tokens at `transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease` applied to `html`.

### Audio State Machine

```
IDLE → LOADING → PLAYING → PAUSED → ENDED
              ↑                   ↓
              └──── PLAYING ←─────┘ (re-play)
```

- `IDLE`: no beat selected. Player shows "Select a beat" message.
- `LOADING`: play button tapped, audio buffering. Play button shows spinner.
- `PLAYING`: audio playing. Play button shows pause icon. Row is highlighted. Scrubber updates every 250ms.
- `PAUSED`: pause tapped. Scrubber frozen. Row highlight remains.
- `ENDED`: audio finished. Scrubber resets to 0. State returns to `IDLE` but beat remains selected.

Selecting a different beat while `PLAYING` or `PAUSED`: immediately loads and plays the new beat. Previous beat row loses highlight.

---

## 12. Responsive Design

The storefront is designed for desktop-first but must work on mobile.

### Storefront — Mobile (< 768px)

**Nav:** Hamburger icon replaces the nav link group. Tapping opens a full-screen slide-in menu from the right. Store name, theme toggle, login/signup remain in the top bar.

**Filter bar:** Scrollable horizontal row. View toggle hidden (defaults to list on mobile). BPM and key filters collapse into a single "Filters" button that opens a bottom sheet.

**Beat list:** Columns collapse to 3: play button | cover + title + tags | price + buy button. BPM and Key hidden (visible on beat detail modal).

**Beat grid:** Single column on small screens.

**Audio player:** Condensed — cover art hidden, controls centred, scrubber full width below title/buy row. Height increases to `88px`.

**Checkout modal:** Full-screen on mobile (no modal panel — the modal fills the viewport with a back button).

**Customer dashboard:** Single column, cards stack.

### Admin — Mobile (< 1024px)

Admin is designed for desktop use. On screens below 1024px, show a banner: "For the best admin experience, use a desktop browser." The admin remains usable but the sidebar collapses to a top bar with a hamburger menu.

---

## 13. Accessibility

- All icon-only buttons have `aria-label` attributes.
- Form inputs are associated with `<label>` elements via `htmlFor` / `id`.
- Modals trap focus when open and return focus to the trigger element on close.
- Keyboard navigation: all interactive elements are reachable via Tab. Beat rows are playable via Enter/Space when focused.
- Colour contrast: all text/background combinations meet WCAG AA (4.5:1 minimum for body text, 3:1 for large text).
- Audio player has an `aria-live` region announcing the currently playing beat name.
- Theme toggle button has `aria-label="Switch to light mode"` / `"Switch to dark mode"` depending on current state.
- Skip-to-content link at the top of each page.

---

## 14. Page Route Map

```
/                          → Beat catalogue (storefront home)
/licensing                 → Licensing info page
/login                     → Customer login
/signup                    → Customer signup
/dashboard                 → Customer dashboard (auth required)
/resend-link               → Lost download link recovery
/order/[ref]               → Order success / download page (post-purchase)

/admin                     → Admin overview (auth required, producer only)
/admin/beats               → Beat management
/admin/orders              → Order management
/admin/promotions          → Promotions management
/admin/settings            → Store settings
/admin/login               → Admin login
```

---

## 15. Component File Structure (Next.js App Router)

```
app/
  (storefront)/
    page.tsx                    ← Beat catalogue
    layout.tsx                  ← Storefront nav + audio player wrapper
    licensing/page.tsx
    login/page.tsx
    signup/page.tsx
    dashboard/page.tsx
    resend-link/page.tsx
    order/[ref]/page.tsx

  (admin)/
    admin/
      layout.tsx                ← Admin shell (sidebar + topbar)
      page.tsx                  ← Overview
      beats/page.tsx
      orders/page.tsx
      promotions/page.tsx
      settings/page.tsx
      login/page.tsx

components/
  storefront/
    Nav.tsx
    AudioPlayer.tsx
    BeatList.tsx
    BeatRow.tsx
    BeatGrid.tsx
    BeatCard.tsx
    BeatDetailModal.tsx
    CheckoutModal.tsx
    FilterBar.tsx
    LicenseSelector.tsx

  admin/
    AdminNav.tsx
    TopBar.tsx
    MetricCard.tsx
    RevenueChart.tsx
    BeatTable.tsx
    UploadBeatModal.tsx
    OrderTable.tsx
    DiscountCodeModal.tsx
    BulkDiscountModal.tsx

  shared/
    Button.tsx
    Input.tsx
    Badge.tsx
    Modal.tsx
    Toast.tsx
    ThemeToggle.tsx
    Skeleton.tsx
    Spinner.tsx

lib/
  audio-state.ts              ← Global audio player state (Zustand)
  theme.ts                    ← Theme init + toggle logic
  paystack.ts                 ← Paystack initialisation helpers
  download.ts                 ← Signed URL generation
  formatters.ts               ← Currency, date, duration formatters
```

---

## 16. Global State

Use **Zustand** for client-side global state.

### Audio Store (`lib/audio-state.ts`)

```typescript
interface AudioStore {
  currentBeat: Beat | null;
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'ended';
  progress: number;          // 0–1
  duration: number;          // seconds
  selectedLicense: 'non-exclusive' | 'exclusive' | null;

  selectBeat: (beat: Beat) => void;
  play: () => void;
  pause: () => void;
  seek: (progress: number) => void;
  setLicense: (type: 'non-exclusive' | 'exclusive') => void;
}
```

### Cart Store (`lib/cart-state.ts`)

```typescript
interface CartItem {
  beat: Beat;
  license: 'non-exclusive' | 'exclusive';
}

interface CartStore {
  items: CartItem[];
  discountCode: string | null;
  discountValue: number;       // 0–1 (percentage) or fixed USD

  addItem: (beat: Beat, license: string) => void;
  removeItem: (beatId: string) => void;
  applyCode: (code: string) => Promise<boolean>;
  clearCart: () => void;
  total: () => number;
}
```

---

*End of design document.*