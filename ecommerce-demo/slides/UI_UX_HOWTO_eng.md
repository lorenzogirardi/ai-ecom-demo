# How To: Quality UI/UX with Claude Code

Guide to getting modern, professional interfaces in projects developed with Claude Code, even without design expertise.

---

## The Problem

> "In other projects with Claude Code, UI/UX creation has been a big problem due to my lack of knowledge in these aspects"

This is common. Without guidance, Claude may generate:
- Inconsistent UI
- Random colors
- Messy layouts
- Non-reusable components

---

## Context: What Happened in Ecommerce-Demo

### Original Requirements

```
FIRST_PROMPT.md:
- "UI in React/Next.js (SSR/SSG)"
- No design system reference
- No color specified
- No style reference
```

### Result Achieved (Without Specific Input)

| Aspect | Result |
|--------|--------|
| CSS Framework | Tailwind CSS |
| Design System | shadcn/ui-inspired |
| Primary color | Professional Cyan/Blue |
| Icons | Lucide (lightweight, modern) |
| Layout | Responsive, mobile-first |
| Components | Reusable, consistent |

---

## Why Did the Design Turn Out Well?

Claude applied **implicit modern conventions**:

### 1. Recognized Stack
```
Next.js + Tailwind = Claude knows what to do
```
Tailwind has clear conventions that Claude knows well.

### 2. shadcn/ui Pattern
```css
/* globals.css - Recognizable pattern */
:root {
  --primary: 199 89% 48%;
  --radius: 0.5rem;
}

.btn { @apply rounded-lg font-medium transition-colors... }
.card { @apply rounded-xl border bg-white shadow-sm }
.input { @apply rounded-lg border focus:ring-2... }
```

### 3. Standard E-commerce Components
Claude knows e-commerce patterns:
- Header with logo, nav, search, cart, user
- Product card with image, price, CTA
- Multi-column footer
- Standard checkout flow

---

## How to Replicate in Future Projects

### Option 1: Explicit Prompt (Recommended)

```
Create frontend with modern, professional design.

UI STACK:
- Next.js 14+ with App Router
- Tailwind CSS
- Lucide icons (npm install lucide-react)

DESIGN SYSTEM:
- Style: shadcn/ui (modern, minimal, professional)
- Colors: CSS variables in globals.css
- Primary color: professional blue/cyan
- Border radius: 0.5rem (rounded-lg)
- Shadows: subtle (shadow-sm, shadow-md)

REQUIRED COMPONENTS:
- Layout: Responsive Header with mobile menu
- Layout: Multi-column Footer
- UI: Button variants (primary, secondary, outline)
- UI: Input with focus states
- UI: Card component

RESPONSIVE:
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Hamburger mobile menu

GLOBALS.CSS:
Use CSS variables for theming:
:root {
  --primary: [color];
  --background: [color];
  --foreground: [color];
}

DO NOT USE:
- Bootstrap
- Material UI
- Styled-components
- CSS modules
```

---

### Option 2: Project CLAUDE.md

Add this section to the initial `CLAUDE.md`:

```markdown
## UI/UX Requirements

### Design System
- Framework: Tailwind CSS
- Style: shadcn/ui inspired (modern, minimal)
- Icons: Lucide React

### Color Palette (CSS Variables)
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 199 89% 48%;        /* Cyan/Blue */
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --muted: 210 40% 96.1%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}

### Component Standards
- Buttons: rounded-lg, transition-colors, focus:ring-2
- Cards: rounded-xl, border, shadow-sm
- Inputs: rounded-lg, border, focus:border-primary
- Spacing: Use Tailwind spacing scale (p-4, m-2, gap-6)

### Layout Patterns
- Header: sticky, backdrop-blur, border-b
- Container: max-w-7xl mx-auto px-4
- Grid: CSS Grid for product listings
- Mobile: hamburger menu under md breakpoint

### Typography
- Font: System font stack (no custom fonts)
- Headings: font-bold, tracking-tight
- Body: text-gray-600 for secondary text

### DO NOT USE
- Bootstrap, Material UI, Chakra
- Inline styles
- Random colors (use palette)
- Fixed widths (use responsive)
```

---

### Option 3: Dedicated Skill

Create `~/.claude/skills/ui-design/SKILL.md`:

```markdown
---
name: ui-design
description: >-
  Modern UI/UX patterns for React/Next.js with Tailwind CSS. shadcn/ui style,
  responsive design, component architecture. Triggers on "ui", "design",
  "layout", "component", "tailwind", "frontend", "header", "footer", "button",
  "card", "responsive", "mobile menu".
  PROACTIVE: Apply these patterns when creating React components.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# UI Design Skill

## Quick Reference

| Element | Pattern |
|---------|---------|
| Buttons | rounded-lg, transition, focus:ring |
| Cards | rounded-xl, border, shadow-sm |
| Inputs | rounded-lg, focus:border-primary |
| Header | sticky, backdrop-blur |
| Container | max-w-7xl mx-auto px-4 |

## Color System (CSS Variables)

:root {
  --primary: 199 89% 48%;
  --secondary: 210 40% 96.1%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --muted: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}

## Component Templates

### Button
className="inline-flex items-center justify-center rounded-lg
           px-4 py-2 font-medium transition-colors
           bg-primary text-white hover:bg-primary/90
           focus:outline-none focus:ring-2 focus:ring-primary/50"

### Card
className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"

### Input
className="w-full rounded-lg border border-gray-300 px-3 py-2
           focus:border-primary focus:outline-none focus:ring-2
           focus:ring-primary/20"

### Header
className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur"

## Responsive Patterns

| Breakpoint | Width | Use |
|------------|-------|-----|
| Default | <640px | Mobile |
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |

### Mobile Menu Pattern
- Show hamburger: md:hidden
- Show desktop nav: hidden md:flex
- Mobile menu: conditional render

## Layout Structure

<Header />           // sticky, z-50
<main>
  <div className="container-custom">  // max-w-7xl mx-auto px-4
    {children}
  </div>
</main>
<Footer />           // mt-auto for sticky footer

## Anti-Patterns

| Avoid | Use Instead |
|-------|-------------|
| Inline styles | Tailwind classes |
| px values | Tailwind spacing (p-4, m-2) |
| Random colors | CSS variables |
| Fixed widths | Responsive (w-full, max-w-*) |
| No focus states | focus:ring-2, focus:border-* |
```

---

## Template: Complete globals.css

Copy this as a base for new projects:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 199 89% 48%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 199 89% 48%;
    --radius: 0.5rem;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}

@layer components {
  .container-custom {
    @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
  }

  .btn {
    @apply inline-flex items-center justify-center rounded-lg
           font-medium transition-colors focus-visible:outline-none
           focus-visible:ring-2 focus-visible:ring-ring
           disabled:pointer-events-none disabled:opacity-50;
  }

  .btn-primary {
    @apply btn bg-primary text-white hover:bg-primary/90;
  }

  .btn-secondary {
    @apply btn bg-secondary text-secondary-foreground hover:bg-secondary/80;
  }

  .btn-outline {
    @apply btn border border-input bg-transparent hover:bg-accent;
  }

  .btn-sm { @apply h-9 px-3 text-sm; }
  .btn-md { @apply h-10 px-4 text-sm; }
  .btn-lg { @apply h-12 px-6 text-base; }

  .input {
    @apply flex h-10 w-full rounded-lg border border-input
           bg-background px-3 py-2 text-sm
           placeholder:text-muted-foreground
           focus:border-primary focus:outline-none
           focus:ring-2 focus:ring-primary/20
           disabled:cursor-not-allowed disabled:opacity-50;
  }

  .card {
    @apply rounded-xl border bg-card shadow-sm;
  }

  .label {
    @apply text-sm font-medium text-foreground;
  }
}
```

---

## Simplified Prompt (Copy-Paste)

For quick projects, use this prompt:

```
Create React/Next.js frontend with:
- Tailwind CSS + shadcn/ui style
- CSS variables for colors (globals.css)
- Lucide icons
- Responsive header with mobile menu
- Multi-column footer
- Components: Button (primary/secondary/outline), Card, Input
- Mobile-first, md breakpoint for desktop
```

---

## Comparison: With vs Without Guidelines

| Without Guidelines | With Guidelines (this how-to) |
|--------------------|-------------------------------|
| Random colors | Consistent palette |
| Mixed styles | Uniform shadcn/ui |
| Not responsive | Mobile-first |
| Inline components | Reusable components |
| Missing focus states | Accessibility OK |

---

## Pre-Project UI Checklist

- [ ] Stack defined (Next.js + Tailwind)
- [ ] Style specified (shadcn/ui)
- [ ] Primary color chosen
- [ ] globals.css template ready
- [ ] Base components requested (btn, card, input)
- [ ] Responsive breakpoints defined
- [ ] Icons specified (Lucide)

---

## Resources

- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/) - Reference components
- [Lucide Icons](https://lucide.dev/icons/)
- [Tailwind UI](https://tailwindui.com/) - E-commerce patterns

---

*Document based on ecommerce-demo experience: professional UI without explicit requirements*
*Version: 1.0.0 - 2026-01-15*
