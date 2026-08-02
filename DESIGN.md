---
name: PortaiLIQ
description: Portail client pour freelances — collecte structurée d'informations
colors:
  primary: "#3B82F6"
  primary-deep: "#1D4ED8"
  secondary: "#F1F5F9"
  muted: "#F1F5F9"
  destructive: "#EF4444"
  border: "#E2E8F0"
  background: "#FFFFFF"
  foreground: "#0A0F1A"
  card: "#FFFFFF"
  card-foreground: "#0A0F1A"
  ring: "#3B82F6"
typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  muted:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    color: "#6B7280"
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.025em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "80px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.lg}"
    padding: "8px 32px"
    size: "h-9"
  button-primary-hover:
    backgroundColor: "hsl(var(--primary)/0.9)"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "8px 32px"
    borderColor: "{colors.border}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "0px"
    borderColor: "{colors.border}"
  badge:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
---

# Design System: PortaiLIQ

## 1. Overview

**Creative North Star: "The Professional Handshake"**

PortaiLIQ est un outil professionnel pour freelances. Son interface visuelle doit inspirer confiance, clarté et simplicité — comme une poignée de main professionnelle. Le design est sobre, fonctionnel, sans fioritures. Chaque élément sert un but concret : collecter des informations clients de manière structurée.

Ce système rejette explicitement les clichés SaaS : pas de gradients arc-en-ciel, pas de hero-metrics, pas de cartes identiques répétées en grille infinie. L'esthétique est celle d'un outil métier sérieux, pas d'une landing page startup.

**Key Characteristics:**
- Palette restrictive : un seul accent saturé (bleu), le reste en neutres fonctionnels
- Typographie système native : aucune dépendance externe, chargement instantané
- Ombres minimales : profondeur par tonalité, pas par élévation
- Composants shadcn/ui : accessibles, interopérables, sans surcharge
- Langue : anglais (international) — métadonnées et copie cohérentes en anglais
- **Signature** : la voix mono « machine » (tokens, statuts, métadonnées de fichiers) + l'artefact « portail client » en direct dans le hero — on démontre le produit, on ne le décrit pas

## 2. Colors

Palette professionnelle centrée sur un bleu primaire unique. Toutes les couleurs sont définies en HSL via CSS custom properties pour supporter le mode clair/sombre.

### Primary

- **Azure Pro** (#3B82F6 / hsl(221.2, 83.2%, 53.3%)): Couleur d'action principale. Boutons CTA, liens, focus rings, bordures de mise en avant. En mode sombre, bascule vers un bleu plus lumineux (hsl(217.2, 91.2%, 59.8%)) pour maintenir la lisibilité sur fond foncé.

### Secondary

- **Cloud** (#F1F5F9 / hsl(210, 40%, 96.1%)): Fond secondaire pour badges, zones de survol, arrière-plans de cartes inactives. Utilisé comme toile de fond pour les éléments de hiérarchie inférieure.

### Destructive

- **Alert Red** (#EF4444 / hsl(0, 84.2%, 60.2%)): Erreurs, suppressions, champs invalides. Jamais utilisé comme couleur décorative.

### Neutral

- **Ink** (#0A0F1A / hsl(222.2, 84%, 4.9%)): Texte principal, titres. Presque noir, légèrement teinté vers le bleu pour rester cohérent avec la palette.
- **Steel** (#6B7280 / hsl(215.4, 16.3%, 46.9%)): Texte secondaire, descriptions, placeholders.
- **Frame** (#E2E8F0 / hsl(214.3, 31.8%, 91.4%)): Bordures, séparateurs, diviseurs visuels.

**The One Accent Rule.** Le bleu primaire (#3B82F6) est la seule couleur saturée autorisée sur n'importe quelle surface. Les autres couleurs sont des neutres fonctionnels. Sa rareté est le point.

### Mode sombre

Le mode sombre inverse les rôles : fond passe à hsl(222.2, 84%, 4.9%), texte à hsl(210, 40%, 98%). Les surfaces secondaires/muted/accent basculent vers hsl(217.2, 32.6%, 17.5%). Le destructif devient hsl(0, 62.8%, 30.6%) pour un rouge plus doux sur fond sombre.

## 3. Typography

**Display Font:** system-ui stack (hérite du OS natif)
**Body Font:** system-ui stack (identique au display)
**Label Font:** system-ui stack (identique)

**Character:** Sans native. Un seul family, plusieurs poids. Pas de juxtaposition de polices similaires — le système utilise la différence de poids (400, 500, 600, 700) pour créer la hiérarchie. Zéro dépendance externe, zéro délai de chargement.

**Voix machine (mono, `font-mono`):** le produit est littéralement basé sur des tokens (`portal/acme-7f3a9c`). Tout ce qui est machine — tokens, statuts (`AWAITING`), noms de fichiers (`brief_v2.pdf · 2.4 MB`), compteurs (`3 of 5`), suffixe de prix (`/mo`) — s'écrit en mono. La paire délibérée est **humain (sans) vs machine (mono)** : le lecteur entend immédiatement ce qui est langage de l'outil. Aucune dépendance externe (stack `ui-monospace` native).

### Hierarchy

- **Display** (700, clamp(2.25rem, 5vw, 3.75rem), 1.1): Titres hero uniquement (`h1` sur la landing page). Letter-spacing: -0.02em.
- **Hero = démonstration, pas description** : deux colonnes sur `lg` (copy à gauche, artefact « portail client » à droite). L'artefact est une vraie carte produit — en-tête client + token mono + statut, champs remplis, un champ en attente (dashed), footer « collecting » avec la barre `Progress`. Une seule pastille animée (`animate-ping`, neutralisée via `motion-reduce:animate-none`) signale le live. C'est LA signature de la landing : tout le reste reste sobre.
- **Headline** (700, 1.875rem, 1.2): Titres de section (`h2`), titres de carte (`CardTitle`). Letter-spacing: -0.01em.
- **Body** (400, 1rem, 1.6): Paragraphe, description de contenu. Line length: 65-75ch max.
- **Muted** (400, 0.875rem, 1.5, #6B7280): Sous-titres, descriptions secondaires, métadonnées.
- **Label** (600, 0.75rem, 1, uppercase): Labels de formulaire, badges, étiquettes. Letter-spacing: 0.025em.

## 4. Elevation

**Flat-by-default, tonal layering.** Ce système n'utilise pas d'ombres pour la profondeur quotidienne. Les surfaces sont empilées par tonalité : blanc (#FFFFFF) > secondary (#F1F5F9) > border (#E2E8F0). Une seule ombre légère (`shadow-sm`) sur les cartes pour les distinguer du fond. L'élévation structurelle (dialogues, toasts) utilise des overlays (`z-50` pour dialogues, `top-right` fixe pour toasts Sonner).

## 5. Components

### Buttons (via CVA)

- **Shape:** Bord légèrement arrondi (6px internal, via `rounded-md` Tailwind).
- **Primary (default):** Fond bleu (#3B82F6), texte blanc. Hover: opacité 90%.
- **Destructive:** Fond rouge (#EF4444), texte blanc. Hover: opacité 90%.
- **Outline:** Fond transparent, bordure grise, texte foreground. Hover: fond secondary.
- **Secondary:** Fond secondary (#F1F5F9), texte sombre. Hover: opacité 80%.
- **Ghost:** Fond transparent, texte foreground. Hover: fond accent.
- **Link:** Texte primary, souligné au hover.
- **Sizes:** default (h-9), sm (h-8), lg (h-10), icon (h-9 w-9).

### Cards

- **Shape:** Coins arrondis (12px / `rounded-xl`).
- **Background:** Blanc en mode clair, hsl(222.2, 84%, 4.9%) en mode sombre.
- **Border:** 1px solid `--border` (#E2E8F0).
- **Shadow:** `shadow-sm` (subtile, pas d'élévation agressive).
- **Padding:** Header/content: 24px, avec 6px d'espace vertical entre les éléments du header.
- **Variante dashed:** Bordure en pointillés pour les états vides (empty states).

### Badges

- **Shape:** Pill complet (`rounded-full`).
- **Default:** Fond secondary, texte foreground.
- **Success:** Fond vert clair, texte vert foncé.
- **Warning:** Fond jaune clair, texte jaune foncé.
- **Destructive:** Fond rouge clair, texte rouge foncé.
- **Padding:** 2px horizontal, 10px vertical.
- **Note:** Les variantes utilisent des couleurs Tailwind hardcodées (blue-100, green-100...) au lieu de tokens CSS — ceci brise le mode sombre pour ces variants. À corriger.

### Inputs

- **Shape:** `rounded-md` (6px).
- **Border:** 1px `--input` par défaut. Focus: `ring` (bleu primaire, 1px).
- **Padding:** 8px horizontal, 8px vertical.
- **Destructive:** Bordure rouge.
- **Placeholder:** Couleur `--muted-foreground`.

### Textarea

- Identique à Input mais min-height: 320px, ring-focus 2px.

### Dialog

- **Overlay:** `bg-black/80` en fixed inset.
- **Content:** Centré (left 50%, top 50%), max-width 512px, `rounded-lg` (6px).
- **Animations:** fade-in/out, zoom-in/out (95%), slide (depuis top 48%).
- **Header:** Espacement vertical 1.5, alignement responsive (col sur mobile, row sur sm+).

### Progress

- **Track:** Fond secondary, hauteur 8px, `rounded-full`.
- **Fill:** Fond primary, transition CSS.

### Toast (Sonner)

- **Position:** Top-right fixe.
- **Style:** Fond background, texte foreground, bordure border.
- **Library:** Sonner v2 (pas Radix Toast).

### Logo

- Carré bleu (#3B82F6), bordures arrondies (8px), coche blanche. 32x32px standard, 48x48px size="lg".

### Navigation

- **Header dashboard:** Bordure inférieure, fond card, container 2xl max.
- **Liens:** Couleur primary, soulignés au hover.
- **Desktop-first:** Menu horizontal, pas de hamburger/menu mobile implémenté.

## 6. Do's and Don'ts

### Do:
- **Do** utiliser les tokens CSS sémantiques (`bg-primary`, `text-foreground`, `border-border`) partout dans le code. Ne jamais hardcoder des couleurs Tailwind arbitraires dans les pages.
- **Do** garder une seule couleur saturée par écran (le bleu primary). Le reste en neutres.
- **Do** utiliser `container mx-auto px-4` comme wrapper page standard.
- **Do** employer `bg-gradient-to-br from-background to-muted` pour les fonds de section plein écran (hero, auth pages, portal public).
- **Do** maintenir la hiérarchie typographique : display → headline → body → muted → label.
- **Do** utiliser `text-wrap: balance` sur les titres h1-h3 pour des lignes équilibrées.
- **Do** rédiger la copie en anglais (international) dès le départ — métadonnées et copie restent dans la même langue.
- **Do** privilégier l'accessibilité : focus-visible ring sur tous les éléments interactifs, contraste ≥ 4.5:1 pour le texte corps.

### Don't:
- **Don't** utiliser de couleurs Tailwind arbitraires (`bg-blue-50`, `text-gray-900`, `border-gray-200`) dans les pages — c'est exactement ce qui arrive sur la pricing page actuelle. Utiliser les tokens sémantiques.
- **Don't** hardcoder `#3B82F6` dans les composants SVG — utiliser `var(--primary)` ou `hsl(var(--primary))`.
- **Don't** utiliser `border-left` ou `border-right` > 1px comme accent décoratif sur les cartes ou alertes.
- **Don't** utiliser de `background-clip: text` avec gradient pour le texte.
- **Don't** empiler des cartes identiques en grille infinie. Chaque carte doit avoir une raison d'exister.
- **Don't** ajouter de "01 · About / 02 · Process" eyebrow au-dessus de chaque section.
- **Don't** utiliser glassmorphism par défaut (blur + glass cards décoratives).
- **Don't** inventer des tokens CSS qui n'existent pas dans `globals.css`.
- **Don't** mélanger les conventions de radius (`rounded-lg` vs `rounded-xl` vs `rounded-md`) au sein d'un même composant.
