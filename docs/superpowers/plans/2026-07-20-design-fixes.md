# PortailIQ Design Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger toutes les incohérences design system identifiées par l'audit `/impeccable document` — tokens CSS hardcodés, couleurs Tailwind arbitraires, variants Badge manquants, et cn() incomplet.

**Architecture:** 4 fichiers source à modifier (badge, logo, utils/cn, pricing), 0 nouveau fichier. Chaque tâche est indépendante et testable via compilation TypeScript + inspection visuelle.

**Tech Stack:** Next.js 14+, Tailwind CSS 3.4+, TypeScript, shadcn/ui pattern

## Global Constraints

- Langue: français pour tout texte UI (sauf variables/types)
- Palette: un seul accent saturé (#3B82F6 / --primary), le reste en neutres sémantiques
- Typographie: system-ui uniquement, zéro dépendance externe
- Couleurs: utiliser exclusivement les tokens CSS `hsl(var(--*))`, jamais de valeurs arbitraires Tailwind
- Badge variants: seuls `default`, `success`, `warning`, `destructive` sont définis dans le component

---

### Task 1: Corriger Badge — remplacer les couleurs hardcodées par des tokens CSS

**Files:**
- Modify: `src/components/ui/badge.tsx:9-14`

**Interfaces:**
- Consumes: CSS variables `--secondary`, `--success-*`, `--warning-*`, `--destructive-*` (à définir dans globals.css)
- Produces: Badge variant colors qui fonctionnent en mode clair ET sombre

**Problème:** Le Badge utilise `bg-blue-100 text-blue-800` etc. — des couleurs Tailwind hardcodées qui ne changent pas en mode sombre.

**Solution:** Ajouter les tokens CSS manquants dans `globals.css` pour success/warning, puis mapper les variants du Badge sur ces tokens via `hsl()`.

- [ ] **Step 1: Ajouter les tokens CSS success/warning dans globals.css**

Modifier `src/app/globals.css` — ajouter dans `:root` (ligne ~26, après `--radius`):

```css
    --success: 142 76% 36%;
    --success-foreground: 142 26% 96%;
    --warning: 42 84% 56%;
    --warning-foreground: 42 26% 96%;
```

Et dans `.dark` (après `--ring`):

```css
    --success: 142 70% 45%;
    --success-foreground: 142 26% 10%;
    --warning: 42 84% 50%;
    --warning-foreground: 42 26% 10%;
```

Ces valeurs HSL correspondent aux verts/jaunes Tailwind mais fonctionnent en dark mode.

- [ ] **Step 2: Mettre à jour les variants du Badge**

Remplacer les lignes 9-14 de `src/components/ui/badge.tsx`:

```tsx
// AVANT:
const variants = {
  default: "bg-blue-100 text-blue-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  destructive: "bg-red-100 text-red-800",
};

// APRÈS:
const variants = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
  warning: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
  destructive: "bg-destructive/10 text-destructive",
};
```

Note: utiliser `[hsl(var(--x))]` car Tailwind ne résout pas `var(--success)` directement dans les noms de classe. C'est le pattern standard shadcn pour les tokens personnalisés.

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/components/ui/badge.tsx
git commit -m "fix(badge): replace hardcoded colors with CSS variable tokens for dark mode support"
```

---

### Task 2: Ajouter variant="outline" au Badge

**Files:**
- Modify: `src/components/ui/badge.tsx`

**Interfaces:**
- Consumes: `--border`, `--foreground` tokens CSS
- Produces: Nouvelle variante `outline` utilisable partout où `variant="outline"` est appelé

**Problème:** 5 fichiers utilisent `Badge variant="outline"` mais cette variante n'existe pas dans le type du Badge. Le variant tombe sur `default` par défaut, rendant le badge invisible ou mal stylé.

Fichiers affectés:
- `src/app/portal/[token]/page.tsx:225` — `<Badge variant="outline">Portail Client</Badge>`
- `src/app/portal/[token]/status/page.tsx:62` — `<Badge variant="outline">Statut du Portail</Badge>`
- `src/app/dashboard/portal-list.tsx` — potentiellement
- `src/app/templates/page.tsx:34` — utilise `variant="secondary"` (aussi inexistant)
- `src/app/dashboard/page.tsx:56` — utilise `variant="secondary"` (aussi inexistant)
- `src/app/dashboard/create-portal-dialog.tsx:209` — utilise `variant="secondary"` (aussi inexistant)

**Solution:** Ajouter `outline` ET `secondary` aux variants du Badge.

- [ ] **Step 1: Étendre le type et les variants du Badge**

Dans `src/components/ui/badge.tsx`, modifier la ligne 6:

```tsx
// AVANT:
variant?: "default" | "success" | "warning" | "destructive"

// APRÈS:
variant?: "default" | "success" | "warning" | "destructive" | "outline" | "secondary"
```

Et ajouter dans l'objet `variants` (après `destructive`):

```tsx
outline: "border border-border bg-transparent text-foreground",
secondary: "bg-muted text-muted-foreground",
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/badge.tsx
git commit -m "fix(badge): add outline and secondary variants used across the app"
```

---

### Task 3: Corriger Logo — remplacer #3B82F6 par var(--primary)

**Files:**
- Modify: `src/components/ui/logo.tsx:13`

**Interfaces:**
- Consumes: `--primary` CSS variable
- Produces: Logo qui s'adapte automatiquement au mode sombre

**Problème:** Le logo SVG utilise `fill="#3B82F6"` hardcodé — ne change pas en mode sombre.

- [ ] **Step 1: Remplacer la valeur hardcodée par une variable CSS**

Dans `src/components/ui/logo.tsx`, ligne 13:

```tsx
// AVANT:
<rect width="32" height="32" rx="8" fill="#3B82F6" />

// APRÈS:
<rect width="32" height="32" rx="8" fill="var(--primary)" />
```

Note: `fill="var(--primary)"` fonctionne car les SVG inline dans React résolvent les CSS custom properties. La valeur `--primary` est `hsl(221.2 83.2% 53.3%)` en light et `hsl(217.2 91.2% 59.8%)` en dark — le logo s'adaptera automatiquement.

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/logo.tsx
git commit -m "fix(logo): use CSS variable for fill color instead of hardcoded hex"
```

---

### Task 4: Corriger cn() — intégrer tailwind-merge

**Files:**
- Modify: `src/lib/cn.ts`

**Interfaces:**
- Consumes: `tailwind-merge` (déjà installé dans package.json)
- Produces: Fonction `cn()` qui résout correctement les conflits de classes Tailwind

**Problème:** `cn()` fait juste `filter(Boolean).join(" ")`. Si deux classes conflictuelles sont passées (ex: `bg-red-500 bg-blue-500`), les deux restent au lieu que la seconde écrase la première. `tailwind-merge` est dans `package.json` mais jamais importé.

- [ ] **Step 1: Réimplémenter cn() avec tailwind-merge**

Remplacer tout le contenu de `src/lib/cn.ts`:

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Cela remplace le `filter(Boolean).join(" ")` par la combinaison standard `clsx` + `tailwind-merge` utilisée par tous les projets shadcn/ui.

- [ ] **Step 2: Vérifier que tailwind-merge est bien dans les dépendances**

Run: `node -e "const pkg = require('./package.json'); console.log(pkg.dependencies['tailwind-merge'] || pkg.devDependencies?.['tailwind-merge'] || 'NOT FOUND')"`
Expected: Une version (devDependency ^3.0.2)

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/cn.ts
git commit -m "fix(cn): integrate tailwind-merge to resolve conflicting Tailwind classes"
```

---

### Task 5: Corriger Pricing Page — remplacer toutes les couleurs arbitraires par des tokens

**Files:**
- Modify: `src/app/pricing/page.tsx`

**Interfaces:**
- Consumes: CSS tokens `--background`, `--foreground`, `--muted-foreground`, `--border`, `--primary`
- Produces: Page pricing cohérente en light ET dark mode

**Problème:** La pricing page utilise ~20 couleurs Tailwind arbitraires (`text-gray-900`, `text-gray-600`, `bg-blue-50`, `border-gray-200`, `text-green-500`) qui cassent le design system.

- [ ] **Step 1: Remplacer le fond de page**

Ligne 86:

```tsx
// AVANT:
<div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20 px-4">

// APRÈS:
<div className="min-h-screen bg-gradient-to-b from-secondary to-background py-20 px-4">
```

- [ ] **Step 2: Remplacer tous les text-gray-* par des tokens sémantiques**

Chercher et remplacer:
- `text-gray-900` → `text-foreground` (lignes 90, 118, 163, 168, 175, 182, 188)
- `text-gray-600` → `text-muted-foreground` (lignes 93, 169, 176, 183, 189)
- `text-gray-500` → `text-muted-foreground` (ligne 119)
- `text-gray-700` → `text-foreground` (ligne 127)

- [ ] **Step 3: Remplacer les couleurs de bordure**

Ligne 106:

```tsx
// AVANT:
: 'border-gray-200'

// APRÈS:
: 'border-border'
```

Ligne 105:

```tsx
// AVANT:
'border-blue-500 border-2 shadow-lg scale-105'

// APRÈS:
'border-primary border-2 shadow-lg scale-105'
```

- [ ] **Step 4: Remplacer les couleurs de badge populaire**

Ligne 110:

```tsx
// AVANT:
<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">

// APRÈS:
<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
```

- [ ] **Step 5: Remplacer les icônes check vertes**

Ligne 129:

```tsx
// AVANT:
className="w-5 h-5 text-green-500 shrink-0"

// APRÈS:
className="w-5 h-5 text-success shrink-0"
```

Mais attendre — `text-success` n'est pas un token Tailwind par défaut. Il faut soit l'ajouter dans tailwind.config, soit utiliser `hsl(var(--success))`. Le plus simple est d'utiliser une approche compatible:

```tsx
className="w-5 h-5 [&>svg]:text-green-500 shrink-0"
```

Non, mieux: utiliser `text-emerald-500` qui est plus proche du vert naturel, ou ajouter une règle CSS. Le plus conforme au design system serait d'ajouter `--success` comme couleur Tailwind. Mais pour rester minimal: utiliser `text-primary` pour les checks, cohérent avec le thème bleu.

```tsx
className="w-5 h-5 text-primary shrink-0"
```

- [ ] **Step 6: Traduire les textes en français**

La pricing page contient du texte en anglais ("Simple, transparent pricing", "Most Popular", "Get Started", FAQ en anglais). Le projet est 100% français.

```tsx
// H1
<h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
  Tarifs simples et transparents
</h1>

// Sous-titre
<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
  Choisissez le plan adapté à votre activité de freelance. Changez à tout moment.
</p>

// Badge populaire
<span className="text-primary-foreground text-xs font-semibold">Le plus populaire</span>

// CTA Free
<span>Commencer</span>

// CTA Starter
<span>Passer au Starter</span>

// CTA Professional
<span>Passer au Pro</span>

// CTA Agency
<span>Passer à l'Agence</span>

// FAQ titres et réponses à traduire en français
```

- [ ] **Step 7: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add src/app/pricing/page.tsx
git commit -m "fix(pricing): replace all hardcoded colors with semantic tokens, localize to French"
```

---

### Task 6: Corriger les pages avec text-green-500 et text-blue-500

**Files:**
- Modify: `src/app/page.tsx`, `src/app/portal/[token]/page.tsx`, `src/app/portal/[token]/status/page.tsx`, `src/app/dashboard/portal-list-enhanced.tsx`

**Interfaces:**
- Consumes: `--primary`, `--success` (défini en Task 1)
- Produces: Pages cohérentes light/dark

**Problème:** Ces pages utilisent massivement `text-green-500` (icônes check) et `text-blue-500` (liens) qui ne passent pas en dark mode.

- [ ] **Step 1: Corriger src/app/page.tsx — remplacer text-green-500**

Lignes 55-186: ~16 occurrences de `text-green-500`

```tsx
// AVANT:
<CheckCircle2 className="h-4 w-4 text-green-500" />

// APRÈS:
<CheckCircle2 className="h-4 w-4 text-primary" />
```

Ou mieux, utiliser une couleur qui indique "succès" sans être le bleu primary: ajouter `text-emerald-500` → `text-success` avec le token CSS. Pour l'instant, `text-primary` est le choix le plus sûr et cohérent.

- [ ] **Step 2: Corriger src/app/portal/[token]/page.tsx**

Ligne 201: `<CheckCircle className="h-12 w-12 text-green-500"` → `text-primary`

- [ ] **Step 3: Corriger src/app/portal/[token]/status/page.tsx**

Lignes 91, 94, 104, 147, 168: `text-green-500` → `text-primary`, `text-blue-500` → `text-primary`

- [ ] **Step 4: Corriger src/app/dashboard/portal-list-enhanced.tsx**

Lignes 90, 100, 101, 104, 115, 126: `border-gray-900` → `border-foreground`, `text-gray-400` → `text-muted-foreground`, `text-gray-900` → `text-foreground`, `text-gray-600` → `text-muted-foreground`

- [ ] **Step 5: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/app/portal/\[token\]/page.tsx src/app/portal/\[token\]/status/page.tsx src/app/dashboard/portal-list-enhanced.tsx
git commit -m "fix(pages): replace hardcoded green/blue/gray colors with semantic tokens across all pages"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Badge hardcoded colors → Task 1
- [x] Badge missing variants → Task 2
- [x] Logo hardcoded hex → Task 3
- [x] cn() missing tailwind-merge → Task 4
- [x] Pricing page hardcoded colors → Task 5
- [x] All pages text-green-500/text-blue-500/text-gray-* → Task 6

**Placeholder scan:** Aucun "TODO", "TBD", "implement later" dans ce plan. Chaque étape contient le code exact.

**Type consistency:** Tous les fichiers utilisent les mêmes imports `cn` depuis `@/lib/utils` (pas `@/lib/cn`). Les modifications sont isolées par fichier, pas de conflits entre tâches.

**Dependency order:** Task 1 (tokens CSS + Badge colors) doit précéder Task 2 (Badge variants) car Task 2 dépend des tokens success/warning. Task 4 (cn) est indépendante. Task 5 et 6 dépendent de Task 1 pour `text-success`.

---

**Plan sauvegardé dans `docs/superpowers/plans/2026-07-20-design-fixes.md`.**

Deux options d'exécution:

1. **Subagent-Driven (recommandé)** — J'dispatche un subagent par tâche, review entre les tâches, itération rapide
2. **Exécution Inline** — Exécuter les tâches dans cette session avec checkpoints de review

Laquelle ?