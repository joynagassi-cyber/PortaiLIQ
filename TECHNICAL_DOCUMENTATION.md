# PortaiLIQ - Documentation Technique

## 🎯 Vue d'ensemble

PortaiLIQ est une plateforme SaaS permettant aux freelances de collecter des informations et documents auprès de leurs clients de manière structurée et professionnelle.

## 🏗️ Architecture

### Frontend
- **Framework** : Next.js 16 (App Router)
- **UI** : React 20, TypeScript, Tailwind CSS, shadcn/ui
- **State** : React Hook Form, TanStack Query

### Backend
- **Runtime** : Cloudflare Workers (OpenNext adapter)
- **Base de données** : Supabase (PostgreSQL)
- **ORM** : Drizzle ORM
- **Validation** : Zod
- **Auth** : Supabase Auth

### Stockage & Services
- **Fichiers** : Cloudflare R2 / Vercel Blob
- **Email** : Brevo (transactionnel)
- **IA** : Multi-provider (Agnes AI, Google, Cerebras, Groq)
- **Paiement** : Gumroad

## 📁 Structure du Projet

```
PortaiLIQ/
├── src/
│   ├── app/                    # Pages Next.js
│   │   ├── api/               # API Routes
│   │   ├── dashboard/         # Dashboard freelance
│   │   ├── portal/            # Portails clients
│   │   ├── templates/         # Gestion des templates
│   │   └── ...
│   ├── components/            # Composants React
│   │   └── ui/               # Composants shadcn/ui
│   ├── db/                   # Schéma base de données
│   │   └── schema.ts        # Définitions Drizzle
│   └── lib/                  # Utilitaires
│       ├── ai-router.ts     # Router IA
│       ├── brevo.ts         # Services email
│       ├── gumroad.ts       # Intégration paiement
│       └── r2.ts           # Services stockage
├── supabase/
│   └── migrations/          # Migrations SQL
└── prisma/                  # Configuration ORM
```

## 🔑 Fonctionnalités Clés

### 1. Gestion des Portails
- Création de portails personnalisés
- Ajout d'items (texte, fichier, email, etc.)
- Génération de liens uniques
- Suivi des soumissions

### 2. Interface Client
- Formulaire responsive
- Upload de fichiers avec validation
- Suivi de progression
- Confirmation de réception

### 3. Dashboard Freelance
- Vue d'ensemble des portails
- Statistiques en temps réel
- Gestion des relances
- Export des données

### 4. Système de Templates
- Templates réutilisables
- Kits de démarrage par métier
- Personnalisation facile
- Partage entre portails

### 5. Notifications Email
- Email de bienvenue
- Confirmations de réception
- Relances automatiques
- Notifications personnalisées

### 6. Intelligence Artificielle
- Vérification de complétude
- Résumé automatique
- Détection d'incohérences
- Multi-providers avec failover

## 🗄️ Modèle de Données

### Tables Principales
- `users` : Utilisateurs (freelances)
- `portals` : Portails de collecte
- `portal_items` : Éléments du portail
- `portal_access_links` : Liens d'accès clients
- `submissions` : Réponses des clients
- `demand_templates` : Templates de demandes
- `client_profiles` : Profils clients

### Relations Clés
- User 1:N Portals
- Portal 1:N Portal Items
- Portal 1:N Access Links
- Access Link 1:N Submissions

## 🔒 Sécurité

### Authentification
- Supabase Auth (JWT)
- Protection des routes API
- Validation des tokens

### Autorisation
- Row Level Security (RLS)
- Vérification propriétaire
- Accès limité aux données

### Validation
- Schémas Zod côté client et serveur
- Validation des fichiers uploadés
- Sanitisation des entrées

## 🚀 Déploiement

### Environnements
- **Development** : Next.js dev server
- **Staging** : Cloudflare Workers
- **Production** : Cloudflare Workers + Supabase

### Variables d'Environnement
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# Brevo
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=...

# Stockage
BLOB_READ_WRITE_TOKEN=...

# IA
AGNES_AI_API_KEY=...
GOOGLE_AI_STUDIO_API_KEY=...
CEREBRAS_API_KEY=...
GROQ_API_KEY=...

# Paiement
GUMROAD_SECRET_KEY=...
```

## 📈 Performance

### Optimisations
- Cache Cloudflare KV
- Requêtes SQL indexées
- Chargement paresseux des composants
- Compression des réponses

### Monitoring
- Logs d'appels IA
- Statistiques d'utilisation
- Métriques de performance
- Alertes d'erreur

## 🔮 Roadmap

### Phase 1 (✅ Terminé)
- Infrastructure de base
- Auth et DB
- Portails et items
- Upload de fichiers

### Phase 2 (✅ Terminé)
- Notifications email
- Dashboard freelance
- Templates de demandes
- Kits de démarrage

### Phase 3 (🚧 En cours)
- Intégration IA
- Vérification automatique
- Résumé intelligent
- Détection d'incohérences

### Phase 4 (📅 Planifié)
- Lien client permanent
- Carnet de bord client
- Export CSV
- Optimisations performance

### Phase 5 (📅 Planifié)
- Applications mobiles
- Intégrations tierces
- Fonctionnalités avancées
- Scaling production

## 🤝 Contribution

### Guidelines
1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Push vers la branche
5. Ouvrir une Pull Request

### Standards
- Code TypeScript strict
- Tests unitaires obligatoires
- Documentation à jour
- Conventions de commit

## 📞 Support

- Documentation : /docs
- Issues : GitHub Issues
- Email : support@portaliq.app
- Discord : communautaire

---

**Développé avec ❤️ par l'équipe PortaiLIQ**
