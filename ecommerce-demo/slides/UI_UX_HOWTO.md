# How To: UI/UX di Qualità con Claude Code

Guida per ottenere interfacce moderne e professionali nei progetti sviluppati con Claude Code, anche senza competenze di design.

---

## Il Problema

> "In altri progetti con Claude Code, la creazione di UI/UX è stata molto un problema per mia incapacità e conoscenza di questi aspetti"

Questo è comune. Senza indicazioni, Claude può generare:
- UI inconsistenti
- Colori casuali
- Layout disordinati
- Componenti non riusabili

---

## Contesto: Cosa è Successo in Ecommerce-Demo

### Requisiti Originali

```
FIRST_PROMPT.md:
- "UI in React/Next.js (SSR/SSG)"
- Nessun riferimento a design system
- Nessun colore specificato
- Nessun riferimento a stile
```

### Risultato Ottenuto (Senza Input Specifico)

| Aspetto | Risultato |
|---------|-----------|
| Framework CSS | Tailwind CSS |
| Design System | shadcn/ui-inspired |
| Colore primario | Cyan/Blue professionale |
| Icone | Lucide (leggere, moderne) |
| Layout | Responsive, mobile-first |
| Componenti | Riusabili, consistenti |

---

## Perché il Design è Venuto Bene?

Claude ha applicato **convenzioni moderne implicite**:

### 1. Stack Riconosciuto
```
Next.js + Tailwind = Claude sa cosa fare
```
Tailwind ha convenzioni chiare che Claude conosce bene.

### 2. Pattern shadcn/ui
```css
/* globals.css - Pattern riconoscibile */
:root {
  --primary: 199 89% 48%;
  --radius: 0.5rem;
}

.btn { @apply rounded-lg font-medium transition-colors... }
.card { @apply rounded-xl border bg-white shadow-sm }
.input { @apply rounded-lg border focus:ring-2... }
```

### 3. Componenti Standard E-commerce
Claude conosce i pattern e-commerce:
- Header con logo, nav, search, cart, user
- Product card con immagine, prezzo, CTA
- Footer multi-colonna
- Checkout flow standard

---

## Come Replicare in Futuri Progetti

### Opzione 1: Prompt Esplicito (Raccomandato)

```
Crea il frontend con design moderno e professionale.

STACK UI:
- Next.js 14+ con App Router
- Tailwind CSS
- Lucide icons (npm install lucide-react)

DESIGN SYSTEM:
- Stile: shadcn/ui (moderno, minimal, professionale)
- Colori: CSS variables in globals.css
- Colore primario: blu/cyan professionale
- Border radius: 0.5rem (rounded-lg)
- Shadows: subtle (shadow-sm, shadow-md)

COMPONENTI RICHIESTI:
- Layout: Header responsive con mobile menu
- Layout: Footer multi-colonna
- UI: Button variants (primary, secondary, outline)
- UI: Input con focus states
- UI: Card component

RESPONSIVE:
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Mobile menu hamburger

GLOBALS.CSS:
Usa CSS variables per theming:
:root {
  --primary: [colore];
  --background: [colore];
  --foreground: [colore];
}

NON USARE:
- Bootstrap
- Material UI
- Styled-components
- CSS modules
```

---

### Opzione 2: CLAUDE.md del Progetto

Aggiungi questa sezione nel `CLAUDE.md` iniziale:

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

### Opzione 3: Skill Dedicata

Crea `~/.claude/skills/ui-design/SKILL.md`:

```markdown
---
name: ui-design
description: >-
  Modern UI/UX patterns per React/Next.js con Tailwind CSS. Stile shadcn/ui,
  responsive design, component architecture. Triggers on "ui", "design",
  "layout", "component", "tailwind", "frontend", "header", "footer", "button",
  "card", "responsive", "mobile menu".
  PROACTIVE: Applica questi pattern quando crei componenti React.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# UI Design Skill

## Quick Reference

| Elemento | Pattern |
|----------|---------|
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

| Evita | Usa invece |
|-------|------------|
| Inline styles | Tailwind classes |
| px values | Tailwind spacing (p-4, m-2) |
| Random colors | CSS variables |
| Fixed widths | Responsive (w-full, max-w-*) |
| No focus states | focus:ring-2, focus:border-* |
```

---

## Template: globals.css Completo

Copia questo come base per nuovi progetti:

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

## Prompt Semplificato (Copia-Incolla)

Per progetti veloci, usa questo prompt:

```
Crea frontend React/Next.js con:
- Tailwind CSS + shadcn/ui style
- CSS variables per colori (globals.css)
- Lucide icons
- Header responsive con mobile menu
- Footer multi-colonna
- Componenti: Button (primary/secondary/outline), Card, Input
- Mobile-first, breakpoint md per desktop
```

---

## Confronto: Con vs Senza Indicazioni

| Senza Indicazioni | Con Indicazioni (questo how-to) |
|-------------------|----------------------------------|
| Colori random | Palette consistente |
| Mix di stili | shadcn/ui uniforme |
| Non responsive | Mobile-first |
| Componenti inline | Componenti riusabili |
| Focus states mancanti | Accessibilità OK |

---

## Checklist Pre-Progetto UI

- [ ] Stack definito (Next.js + Tailwind)
- [ ] Stile specificato (shadcn/ui)
- [ ] Colore primario scelto
- [ ] globals.css template pronto
- [ ] Componenti base richiesti (btn, card, input)
- [ ] Responsive breakpoints definiti
- [ ] Icone specificate (Lucide)

---

## Risorse

- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/) - Componenti di riferimento
- [Lucide Icons](https://lucide.dev/icons/)
- [Tailwind UI](https://tailwindui.com/) - Pattern e-commerce

---

*Documento basato sull'esperienza ecommerce-demo: UI professionale senza requisiti espliciti*
*Versione: 1.0.0 - 2026-01-15*
