# PortaiLIQ - Portail Client pour Freelances

Un SaaS qui permet aux freelances de créer des portails clients personnalisés pour collecter des informations de manière structurée et professionnelle.

## 🚀 Fonctionnalités

- **Création de portails** : Créez des portails clients personnalisés avec des champs configurables
- **Champs variés** : Texte, email, téléphone, URL, nombre, sélection, fichier
- **Lien partageable** : Partagez facilement vos portails à vos clients
- **Assistant IA** : Génération intelligente des champs recommandés
- **Rappels automatisés** : Envoyez des rappels email aux clients
- **Tableau de bord** : Suivez toutes les soumissions en temps réel
- **Paiement Gumroad** : Plan gratuit (3 portails) et plan Pro (9€/mois)

## 🛠️ Stack Technique

- **Frontend** : Next.js 16 (App Router), React 20, TypeScript, Tailwind CSS, shadcn/ui
- **Backend** : Cloudflare Workers (OpenNext adapter)
- **Base de données** : Supabase (PostgreSQL) avec Drizzle ORM
- **Authentification** : Supabase Auth (Email, Google, GitHub)
- **Stockage** : Cloudflare R2
- **Paiement** : Gumroad (Checkout & Billing)
- **Email** : Brevo
- **IA** : Multi-provider router (Agnes AI, Google AI Studio, Cerebras, Groq)

## 📋 Prérequis

- Node.js 20+
- Un compte Supabase
- Un compte Cloudflare (pour Workers & R2)
- Un compte Gumroad
- Un compte Brevo (pour les emails)
- Clés API pour les providers IA (tous ont des free tiers)

## ⚙️ Installation

### 1. Clone le projet

```bash
git clone <repository-url>
cd PortaiLIQ
```

### 2. Installe les dépendances

```bash
npm install
```

### 3. Configure les variables d'environnement

```bash
cp .env.example .env.local
```

Modifie `.env.local` avec tes propres clés :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Gumroad
Gumroad_SECRET_KEY=sk_test_your_key
Gumroad_WEBHOOK_SECRET=whsec_your_secret

# IA Providers
AGNES_AI_API_KEY=your_key
GOOGLE_AI_API_KEY=your_key
CEREBRAS_API_KEY=your_key
GROQ_API_KEY=your_key

# R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret

# Brevo
BREVO_API_KEY=your_key
```

### 4. Configure Supabase

1. Crée un projet sur [supabase.com](https://supabase.com)
2. Dans le SQL Editor, exécute le fichier `supabase/migrations/001_initial_schema.sql`
3. Récupère ton URL et ta clé anon dans Settings > API

### 5. Démarre le serveur de développement

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) pour voir l'application.

## 📁 Structure du Projet

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   │   ├── ai/             # Endpoint IA avec router multi-provider
│   │   ├── portals/        # CRUD portails
│   │   ├── submissions/    # Soumissions clients
│   │   ├── Gumroad/         # Paiements Gumroad
│   │   └── cron/           # Tâches planifiées
│   ├── auth/               # Routes d'authentification
│   ├── dashboard/          # Tableau de bord freelance
│   ├── portal/[token]/     # Portail public client
│   ├── signin/             # Page de connexion
│   ├── signup/             # Page d'inscription
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # Composants shadcn/ui
│   └── providers.tsx       # Providers (theme, etc.)
├── lib/
│   ├── supabase/           # Clients Supabase
│   ├── ai-router.ts        # Router IA avec failover
│   ├── validation.ts       # Schémas Zod
│   └── utils.ts            # Fonctions utilitaires
└── db/
    ├── schema.ts           # Schéma Drizzle ORM
    └── index.ts            # Connexion DB
```

## 🔑 Routes API

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/portals` | Créer un portail |
| GET | `/api/portals` | Liste les portails de l'utilisateur |
| PUT | `/api/portals` | Met à jour un portail |
| DELETE | `/api/portals?id=<id>` | Supprime un portail |
| POST | `/api/portals/[id]/items` | Ajoute un élément à un portail |
| GET | `/api/portals/[id]/items` | Liste les éléments d'un portail |
| POST | `/api/portal/[token]` | Soumet un formulaire client |
| POST | `/api/ai` | Endpoint assistant IA |
| POST | `/api/Gumroad/checkout` | Crée une session de paiement |
| POST | `/api/Gumroad/webhook` | Webhook Gumroad |

## 🤖 IA Multi-Provider

L'application utilise un router IA avec failover automatique :

1. **Agnes AI** (priorité 1) - Gratuit, modèle flash
2. **Google AI Studio** (priorité 2) - 60 req/min gratuit
3. **Cerebras** (priorité 3) - 100K tokens/jour gratuit
4. **Groq** (priorité 4) - 3000 req/jour gratuit

Chaque requête IA est loguée dans la table `ai_logs` pour le suivi de l'utilisation.

## 🚀 Déploiement

### Cloudflare Workers

```bash
# Installe Wrangler CLI
npm install -g wrangler

# Connecte-toi à Cloudflare
wrangler login

# Déploie
wrangler deploy
```

### Variables d'environnement Cloudflare

```bash
wrangler secret put NEXT_PUBLIC_SUPABASE_URL
wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
wrangler secret put Gumroad_SECRET_KEY
# ... etc
```

## 📝 Scripts

```bash
npm run dev          # Démarre le serveur de développement
npm run build        # Compile pour la production
npm run start        # Démarre le serveur de production
npm run lint         # Lance ESLint
```

## 🔒 Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- **Validation Zod** sur toutes les entrées API
- **Rate limiting** sur les endpoints publics
- **Tokens uniques** pour les portails clients
- **CSRF protection** via cookies HttpOnly

## 📄 License

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! Ouvrez une issue ou une pull request.

---

Développé avec ❤️ par [Votre Nom]
