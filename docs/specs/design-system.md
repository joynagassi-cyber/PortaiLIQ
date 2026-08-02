# Spec: Design System & UI Guidelines

> Visual rules for PortaiLIQ. Based on DESIGN.md, adapted for English.

## Colors

All colors via CSS custom properties in `globals.css`. Use Tailwind utility classes that map to these variables.

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--primary` | `hsl(221.2, 83.2%, 53.3%)` (#3B82F6) | `hsl(217.2, 91.2%, 59.8%)` | CTAs, links, focus rings |
| `--secondary` | `hsl(210, 40%, 96.1%)` (#F1F5F9) | `hsl(217.2, 32.6%, 17.5%)` | Badges, inactive surfaces |
| `--destructive` | `hsl(0, 84.2%, 60.2%)` (#EF4444) | `hsl(0, 62.8%, 30.6%)` | Errors, delete buttons |
| `--background` | `hsl(0, 0%, 100%)` (#FFFFFF) | `hsl(222.2, 84%, 4.9%)` | Page backgrounds |
| `--foreground` | `hsl(222.2, 84%, 4.9%)` (#0A0F1A) | `hsl(210, 40%, 98%)` | Text |
| `--muted` | `hsl(210, 40%, 96.1%)` | `hsl(217.2, 32.6%, 17.5%)` | Secondary text |
| `--muted-foreground` | `hsl(215.4, 16.3%, 46.9%)` (#6B7280) | `hsl(215, 20.2%, 65.1%)` | Placeholders, hints |
| `--border` | `hsl(214.3, 31.8%, 91.4%)` (#E2E8F0) | `hsl(217.2, 32.6%, 17.5%)` | Dividers, card borders |
| `--card` | `hsl(0, 0%, 100%)` | `hsl(222.2, 84%, 4.9%)` | Card backgrounds |
| `--ring` | `hsl(221.2, 83.2%, 53.3%)` | Same as light | Focus outlines |

## Typography

All system fonts. No external font imports.

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Display | `clamp(2.25rem, 5vw, 3.75rem)` | 700 | 1.1 | Hero h1 only |
| Headline | `1.875rem` (30px) | 700 | 1.2 | Section h2, CardTitle |
| Body | `1rem` (16px) | 400 | 1.6 | Paragraphs, descriptions |
| Muted | `0.875rem` (14px) | 400 | 1.5 | Subtitles, metadata |
| Label | `0.75rem` (12px) | 600 | 1 | Form labels, badges |

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight gaps |
| `sm` | 8px | Small gaps |
| `md` | 16px | Default gap |
| `lg` | 24px | Section padding |
| `xl` | 32px | Page padding |
| `xxl` | 80px | Hero/section margins |

## Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 4px | Tight elements |
| `md` | 6px | Inputs, buttons |
| `lg` | 8px | Logo, small elements |
| `xl` | 12px | Cards |
| `full` | 9999px | Badges, avatars |

## Component Rules

### Buttons
- Primary: `bg-primary text-primary-foreground rounded-lg`
- Outline: `border border-border bg-background rounded-lg`
- Ghost: `hover:bg-muted rounded-md`
- Sizes: default (h-9), sm (h-8), lg (h-10), icon (h-9 w-9)

### Cards
- `rounded-xl border border-border bg-card shadow-sm`
- Header: padding 24px, gap 6px
- Content: padding 24px
- Dashed variant for empty states: `border-dashed`

### Badges
- `rounded-full px-2.5 py-0.5 text-xs font-medium`
- Default: `bg-secondary text-foreground`
- Success: `bg-green-100 text-green-800` (dark mode aware)
- Warning: `bg-yellow-100 text-yellow-800`
- Destructive: `bg-red-100 text-red-800`

### Inputs
- `rounded-md border border-input bg-background px-3 py-2`
- Focus: `ring-ring ring-offset-2`
- Placeholder: `text-muted-foreground`

### Logo
- 32x32px default, 48x48px large
- Blue square with white checkmark
- Uses `var(--primary)` not hardcoded hex

## Page Layout

Standard wrapper:
```tsx
<div className="min-h-screen bg-gradient-to-br from-background to-muted">
  <div className="container mx-auto px-4 py-8">
    {/* Content */}
  </div>
</div>
```

Dashboard header:
```tsx
<header className="border-b bg-card">
  <div className="container mx-auto px-4 py-4 flex items-center justify-between">
    {/* Nav */}
  </div>
</header>
```

## Accessibility

- Focus visible ring on all interactive elements
- Contrast ratio ≥ 4.5:1 for body text
- Alt text on all images
- ARIA labels on icon-only buttons
- Keyboard navigable forms

## Dark Mode

Toggle via `next-themes`. CSS variables handle the switch automatically. No JS dark-mode classes needed.

## Anti-Patterns (enforced by RULES.md)

- ❌ `bg-blue-500` → use `bg-primary`
- ❌ `text-gray-900` → use `text-foreground`
- ❌ `border-gray-200` → use `border-border`
- ❌ Hardcoded `#3B82F6` in SVGs → use `var(--primary)`
- ❌ `border-l-4 border-blue-500` on cards → tonal elevation only
- ❌ `bg-gradient-to-r from-purple-500 to-pink-500` → one accent only
- ❌ `bg-clip-text text-transparent bg-gradient-to-r` → solid colors only

## Files

| File | Role |
|------|------|
| `src/app/globals.css` | CSS custom properties (design tokens) |
| `tailwind.config.ts` | Tailwind theme extension |
| `DESIGN.md` | Full design system documentation |
