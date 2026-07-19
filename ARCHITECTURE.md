/**
 * IntakeFlow — Architecture Complète
 * 
 * Portail Client Freelance — SaaS de collecte d'informations client
 * Stack: Next.js 16 + Supabase + Cloudflare Workers + Gumroad + Multi-Provider IA
 */

// ============================================================
// STRUCTURE DU PROJET
// ============================================================
/*
intakeflow/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Layout racine (providers, fonts, CSS)
│   │   ├── globals.css               # Tailwind + design tokens
│   │   ├── page.tsx                  # Landing page publique
│   │   │
│   │   ├── signin/
│   │   │   └── page.tsx              # Page connexion
│   │   ├── signup/
│   │   │   └── page.tsx              # Page inscription
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Dashboard freelance (auth requis)
│   │   ├── portal/
│   │   │   └── [token]/
│   │   │       └── page.tsx          # Portail public client (token-based)
│   │   │
│   │   ├── api/                      # API Routes (Serverless)
│   │   │   ├── ai/
│   │   │   │   └── route.ts          # POST — Router IA multi-provider
│   │   │   ├── auth/
│   │   │   │   └── route.ts          # POST — Supabase Auth (sign up / sign in)
│   │   │   ├── cron/
│   │   │   │   └── cleanup/
│   │   │   │       └── route.ts      # GET — Cloudflare Cron (suppression fichiers expirés)
│   │   │   ├── dashboard/
│   │   │   │   └── route.ts          # GET — Stats + listes dashboard
│   │   │   ├── links/
│   │   │   │   └── route.ts          # POST — Créer un lien d'accès portail
│   │   │   ├── portals/
│   │   │   │   ├── route.ts          # GET/POST — Liste + création portails
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts      # GET/PUT/DELETE — Détail portail
│   │   │   │       └── items/
│   │   │   │           └── route.ts  # GET/POST — Items d'un portail
│   │   │   ├── portal/
│   │   │   │   └── [token]/
│   │   │   │       └── route.ts      # GET — Détails portail public (token)
│   │   │   ├── reminders/
│   │   │   │   └── route.ts          # POST — Relance manuelle email
│   │   │   ├── submissions/
│   │   │   │   └── route.ts          # POST — Dépôt réponse client (public)
│   │   │   ├── Gumroad/
│   │   │   │   ├── checkout/
│   │   │   │   │   └── route.ts      # POST — Créer session Gumroad
│   │   │   │   └── webhook/
│   │   │   │       └── route.ts      # POST — Webhook Gumroad
│   │   │   └── upload/
│   │   │       └── route.ts          # POST — Upload fichier vers R2
│   │   │
│   │   └── pricing/
│   │       └── page.tsx              # Page tarif (à créer)
│   │
│   ├── components/                   # Composants React
│   │   ├── providers.tsx             # QueryClient + TooltipProvider
│   │   └── ui/                       # Composants shadcn/ui
│   │       ├── button.tsx            # Bouton (CVA variants)
│   │       ├── card.tsx              # Card, CardHeader, CardTitle, CardContent
│   │       ├── input.tsx             # Input (CVA variants)
│   │       ├── badge.tsx             # Badge (default/success/warning/destructive)
│   │       ├── progress.tsx          # Barre de progression
│   │       ├── toast.tsx             # Toast notification
│   │       └── logo.tsx              # Logo SVG IntakeFlow
│   │
│   ├── db/                           # Base de données
│   │   ├── index.ts                  # Connexion Drizzle → Postgres
│   │   ├── schema.ts                 # Définitions tables Drizzle ORM
│   │   └── migrations/               # Migrations générées par drizzle-kit
│   │
│   └── lib/                          # Utilitaires & config
│       ├── ai-router.ts              # Router IA multi-provider (failover)
│       ├── brevo.ts                  # Client email Brevo
│       ├── cn.ts                     # Utility cn() pour Tailwind
│       ├── r2.ts                     # Upload Cloudflare R2
│       ├── Gumroad.ts                 # Instance Gumroad
│       ├── supabase.ts               # Client Supabase (côté client)
│       ├── supabase-server.ts        # Client Supabase (côté serveur, cookies)
│       ├── utils.ts                  # Helpers (token, date, file)
│       └── validation.ts             # Schémas Zod + types inférés
│
├── public/                           # Fichiers statiques
│   └── favicon.ico
│
├── .env.example                      # Variables d'environnement (template)
├── .gitignore
├── drizzle.config.ts                 # Config Drizzle ORM
├── next.config.js                    # Config Next.js (standalone output)
├── package.json
├── tailwind.config.ts                # Config Tailwind + animations
├── tsconfig.json                     # Config TypeScript
└── wrangler.toml                     # Config Cloudflare Workers
*/

// ============================================================
// ARCHITECTURE DÉTAILLÉE
// ============================================================
/*
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Navigateur)                       │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Landing  │ │Dashboard │ │ Portail  │ │ Pricing      │  │
│  │ Page     │ │(auth)    │ │(token)   │ │ Page         │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘  │
│       │             │             │              │           │
│  ┌────▼─────────────▼─────────────▼──────────────▼───────┐  │
│  │              React + TanStack Query                   │  │
│  │         (Cache serveur, optimistic updates)           │  │
│  └────────────────────┬────────────────────────────────┘  │
└───────────────────────┼───────────────────────────────────┘
                        │ HTTP/HTTPS
┌───────────────────────▼───────────────────────────────────┐
│              Cloudflare Workers (Edge)                     │
│         OpenNext adapter — Next.js Serverless             │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │              Next.js API Routes                   │   │
│  │                                                   │   │
│  │  Auth ──→ Supabase Auth                           │   │
│  │  CRUD ──→ Drizzle ORM → Supabase Postgres         │   │
│  │  Upload ──→ Cloudflare R2                         │   │
│  │  Email  ──→ Brevo SMTP API                        │   │
│  │  Payment ──→ Gumroad API                           │   │
│  │  AI     ──→ Multi-Provider Router (failover)      │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ┌───────────────────────────────────────────┐           │
│  │         Cloudflare KV (Cache)             │           │
│  │  - Structure portail                      │           │
│  │  - Templates freelance                    │           │
│  │  - Résultats IA (cache)                   │           │
│  └───────────────────────────────────────────┘           │
│                                                           │
│  ┌───────────────────────────────────────────┐           │
│  │      Cloudflare Cron Triggers             │           │
│  │  - Suppression fichiers expirés (30j)     │           │
│  │  - Nettoyage soumissions old              │           │
│  └───────────────────────────────────────────┘           │
└───────────────────────────────────────────────────────────┘
                        │
┌───────────────────────▼───────────────────────────────────┐
│              SERVICES EXTERNES                             │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Supabase │  │   R2     │  │  Brevo   │  │ Gumroad  │ │
│  │ Postgres │  │  Storage │  │   Email  │  │ Payment │ │
│  │   Auth   │  │  (10Go)  │  │ (300/j)  │  │         │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │              AI PROVIDERS                         │   │
│  │                                                   │   │
│  │  1. Agnes AI (prioritaire)                        │   │
│  │  2. Google AI Studio                              │   │
│  │  3. Cerebras                                      │   │
│  │  4. Groq                                          │   │
│  │                                                   │   │
│  │  Tous OpenAI-compatible → même interface          │   │
│  │  Failover auto si provider tombe                  │   │
│  └───────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
*/

// ============================================================
// FLUX DE DONNÉES PRINCIPAUX
// ============================================================
/*
1. INSCRIPTION FREELANCE
   SignupPage → POST /api/auth → Supabase Auth → DB (users)
   → Redirection vers Dashboard

2. CRÉATION PORTAIL
   Dashboard → POST /api/portals → DB (portals)
   → Dashboard affiche nouveau portail

3. AJOUT ITEM
   Dashboard → POST /api/portals/[id]/items → DB (portal_items)
   → Item ajouté à la liste du portail

4. GÉNÉRATION LIEN CLIENT
   Dashboard → POST /api/links → DB (portal_access_links)
   → Token généré + lien copié/envoyé par email (Brevo)

5. DÉPÔT CLIENT (public, sans compte)
   Portail [token] → POST /api/submissions → DB (submissions)
   → Si fichier → Upload R2 → URL stockée en DB
   → AI check (facultatif) → Complétude vérifiée
   → Confirmation visuelle "reçu"

6. RELANCE MANUELLE
   Dashboard → POST /api/reminders → Brevo API
   → Email de rappel envoyé au client

7. PAIEMENT Gumroad
   Pricing → POST /api/Gumroad/checkout → Gumroad API
   → Session checkout → Redirection Gumroad
   → Webhook → POST /api/Gumroad/webhook → Update DB (users.subscription)

8. RÉSUMÉ IA (après complétion portail)
   Dashboard → POST /api/ai → Router IA
   → Agnes AI → Google → Cerebras → Groq (failover)
   → DB (ai_summaries) + DB (ai_call_logs)
*/

// ============================================================
// COMPOSANTS REACT — LISTE COMPLÈTE
// ============================================================
/*
UI (shadcn/ui):
├── Button                    # Bouton avec variants (default, destructive, ghost...)
├── Card                      # Carte avec Header/Title/Content
├── Input                     # Champ texte avec validation
├── Badge                     # Label coloré (statut, type)
├── Progress                  # Barre de progression
├── Toast                     # Notification popup
├── LogoIcon                  # Logo SVG IntakeFlow
└── Providers                 # QueryClient + TooltipProvider

Pages:
├── LandingPage               # Page d'accueil + offre Founding Member
├── SignInPage                # Formulaire connexion
├── SignUpPage                # Formulaire inscription
├── DashboardPage             # Dashboard freelance (vide, Phase 1)
└── PublicPortalPage          # Portail client public (token-based)

À construire (Phase 2+):
├── PortalCreatePage          # Création de portail
├── PortalDetailPage          # Détail d'un portail + items
├── TemplateManagerPage       # Gestion des templates
├── ClientProfilePage         # Gestion des profils clients
├── PricingPage               # Page tarifs + Gumroad checkout
└── SettingsPage              # Paramètres compte
*/

// ============================================================
// API ROUTES — RÉSUMÉ
// ============================================================
/*
Auth:
  POST /api/auth            → Supabase Auth (sign up / sign in)

Portails:
  GET    /api/portals        → Liste portails utilisateur
  POST   /api/portals        → Créer portail
  GET    /api/portals/[id]   → Détail portail + items
  PUT    /api/portals/[id]   → Mettre à jour portail
  DELETE /api/portals/[id]   → Supprimer portail
  GET    /api/portals/[id]/items → Items d'un portail
  POST   /api/portals/[id]/items → Ajouter item

Liens:
  POST /api/links            → Générer lien accès portail (token)

Soumissions (public):
  POST /api/submissions      → Dépôt réponse client

Portail public (token):
  GET  /api/portal/[token]   → Détails portail pour client public

Relances:
  POST /api/reminders        → Envoyer email de relance (Brevo)

AI:
  POST /api/ai               → Router IA multi-provider

Gumroad:
  POST /api/Gumroad/checkout  → Créer session checkout
  POST /api/Gumroad/webhook   → Webhook paiement

Upload:
  POST /api/upload           → Upload fichier vers R2

Cron:
  GET  /api/cron/cleanup     → Suppression fichiers expirés
*/

// ============================================================
// SCHÉMA DE BASE DE DONNÉES — RÉSUMÉ
// ============================================================
/*
Tables principales (12 tables):

users                     → Utilisaires (freelances)
  ├─ id, email, password_hash
  ├─ display_name, avatar_url, profession
  └─ subscription_status, Gumroad_customer_id

client_profiles           → Profils clients du freelance
  ├─ id, user_id (FK)
  └─ name, email

portals                   → Portails de collecte
  ├─ id, user_id (FK), client_profile_id (FK)
  ├─ name, description, logo_url, status
  └─ created_at, updated_at

demand_templates          → Templates de demandes
  ├─ id, user_id (FK)
  └─ name, profession_category

demand_template_items     → Items de template
  ├─ id, template_id (FK)
  ├─ label, description, item_type
  ├─ expected_format, required, choices, sort_order
  └─ created_at

portal_items              → Items instanciés dans un portail
  ├─ id, portal_id (FK), template_item_id (FK)
  ├─ label, description, item_type
  ├─ expected_format, required, choices, sort_order
  └─ created_at

portal_access_links       → Liens d'accès tokenisés
  ├─ id, portal_id (FK)
  ├─ token (UUID unique), client_label
  ├─ expires_at, reminder_schedule, reminders_enabled
  └─ created_at

submissions               → Réponses client
  ├─ id, portal_item_id (FK), portal_access_link_id (FK)
  ├─ content_text, file_url, file_name, file_size, file_type
  ├─ status (pending/received/flagged)
  └─ submitted_at, updated_at

ai_summaries              → Résumés IA générés
  ├─ id, portal_id (FK)
  ├─ summary_text, provider_used, tokens_used
  └─ created_at

ai_call_logs              → Logs d'appels IA
  ├─ id, portal_id (FK)
  ├─ task_type, provider_attempted, provider_success
  ├─ status, error_message
  ├─ tokens_input, tokens_output, duration_ms
  └─ created_at

activity_log              → Journal d'activité
  ├─ id, user_id (FK), portal_id (FK)
  ├─ action, metadata (JSONB)
  └─ created_at

Indexes:
  - idx_portals_user_id
  - idx_portal_items_portal_id
  - idx_submissions_portal_item_id
  - idx_submissions_link_id
  - idx_ai_call_logs_portal_id
  - idx_activity_user_id
*/

// ============================================================
// ROUTAGE IA — DÉTAIL TECHNIQUE
// ============================================================
/*
Le router IA (src/lib/ai-router.ts) implémente un circuit breaker pattern:

1. Chaque provider est configuré avec une priorité
2. Les requêtes sont tentées dans l'ordre de priorité
3. Timeout de 5 secondes par provider
4. Si un provider retourne une erreur HTTP ou timeout → passage au suivant
5. Si TOUS les providers échouent → retour erreur 503 au client
6. Chaque appel est logué dans ai_call_logs pour monitoring

Interface commune (OpenAI-compatible):
  POST {baseURL}/chat/completions
  Body: { model, messages, max_tokens, temperature }
  Response: { choices: [{ message: { content } }], usage: { prompt_tokens, completion_tokens } }

Tous les providers exposent la même interface:
  - Agnes AI:    https://api.agnes-ai.com/v1
  - Google:      https://generativelanguage.googleapis.com/v1beta/openai/
  - Cerebras:    https://api.cerebras.ai/v1
  - Groq:        https://api.groq.com/openai/v1

Modèles par provider:
  - Agnes AI:    agnes-2.5-pro (prioritaire — meilleur raisonnement)
  - Google:      gemini-2.5-flash (vision native pour fichiers)
  - Cerebras:    llama3.1-8b ou gpt-oss-120b (rapide, 1M tokens/jour gratuit)
  - Groq:        llama-3.3-70b (le plus rapide en inference brute)
*/

// ============================================================
// PLANIFICATION PAR PHASE
// ============================================================
/*
PHASE 1 (2-3 jours) — Fondations
  ✓ Structure Next.js + TypeScript + Tailwind
  ✓ Schéma Drizzle ORM + tables SQL
  ✓ Pages: Landing, Sign In, Sign Up, Dashboard (vide)
  ✓ API: Auth Supabase, Dashboard data
  ✓ Composants UI: Button, Card, Input, Badge, Progress, Toast
  ✗ Router IA (configuré mais pas intégré)
  ✗ Upload R2
  ✗ Gumroad
  ✗ Brevo

PHASE 2 — Portails & Items
  ✓ API: CRUD portails, items, liens
  ✓ API: Génération token unique
  ✗ UI: PortalCreatePage, PortalDetailPage
  ✗ UI: TemplateManagerPage
  ✗ UI: ClientProfilePage

PHASE 3 — Portail Public & Upload
  ✓ API: Portail public (token-based)
  ✓ API: Submissions (public)
  ✓ API: Upload R2
  ✗ UI: PublicPortalPage (formulaire dynamique par item)
  ✗ Router IA: Intégration check complétude

PHASE 4 — Dashboard Temps Réel & Notifications
  ✗ API: Reminders (Brevo)
  ✗ UI: Dashboard temps réel (statuts, filtres)
  ✗ Router IA: Résumé automatique portail complété

PHASE 5 — Paiements
  ✗ API: Gumroad checkout + webhook
  ✗ UI: PricingPage
  ✗ Middleware: Vérification subscription

PHASE 6 — IA Complète
  ✓ Router IA: Multi-provider configuré
  ✗ UI: Indicateur IA dans le dashboard
  ✗ Feature: Vérification complétude en temps réel
  ✗ Feature: Résumé automatique portail
  ✗ Feature: Vérification fichier/demande
*/
