# Cahier des Charges & PRD — Portail Client Freelance
### Nom de travail : "IntakeFlow" (à renommer)

---

## 1. Contexte & Problème

**Problème identifié (reformulé) :** ce n'est pas seulement un problème de collecte, c'est un problème de traitement après-collecte. Les freelances (designers, devs, consultants, coachs) perdent du temps à chasser leurs clients pour obtenir documents/infos, ET perdent un temps supplémentaire à relire chaque réponse pour vérifier qu'elle est exploitable, complète, cohérente avec la demande. Ils utilisent aujourd'hui un mélange bricolé d'emails, Google Forms, Dropbox et relances manuelles — aucun système centralisé, aucune vérification automatique de la qualité de ce qui est reçu.

**Preuve de marché :** Content Snare résout ce problème et facture $29-99/mois, validant la volonté de payer. Mais son prix et sa complexité de configuration excluent le freelance solo à petit budget — c'est le vide que ce produit vient combler.

**Non-problème (hors scope) :** ce n'est pas un CRM, pas un outil de facturation, pas un gestionnaire de projet. Un seul job : collecter des documents/infos client sans friction, avec visibilité sur le statut.

---

## 2. Objectifs & Critères de succès

| Objectif | Mesure |
|---|---|
| Valider la douleur avant de sur-construire | 10 retours utilisateurs qualifiés avant la fin du MVP |
| Générer du cash immédiat | $500 en 2 semaines via 12+ ventes Founding Member ($49 lifetime, 20 places) |
| Coût de démarrage quasi nul | $0-5/mois d'infra jusqu'à la première vente (Render + Supabase + Brevo gratuits) |
| Zéro maintenance lourde | Pas de support technique continu attendu au lancement |

**Anti-objectif explicite :** ne pas viser l'exhaustivité fonctionnelle dès le MVP. Un produit étroit qui résout une douleur précise bat un produit large mal fini.

---

## 3. Personas

**Persona principal — "Le freelance à plusieurs clients actifs"**
- Designer, développeur, consultant ou coach indépendant
- Gère 3 à 15 clients actifs en parallèle
- Perd 30 min à 2h par semaine à relancer des clients pour des documents/infos manquantes
- Ne veut pas payer $50-99/mois pour un outil qu'il utilise 10 fois par mois
- Cherche une solution qui se configure en moins de 10 minutes, sans tutoriel

**Persona secondaire — "Le client final" (jamais un acheteur, juste un utilisateur)**
- Reçoit un lien, n'a aucune envie de créer de compte
- Veut comprendre en 5 secondes ce qu'on lui demande et pourquoi
- Abandonne si le process a plus de 2 étapes de friction (compte, mot de passe, vérification email)

---

## 4. Périmètre du MVP (2 semaines)

### Dans le scope (Must Have)
1. **Création de portail** : le freelance crée un espace nommé (ex: "Onboarding — Projet X") avec son logo et une liste de demandes (texte libre + upload de fichier)
2. **Lien client sans compte** : génération d'un lien unique/token par client, envoyé par email ou copié manuellement
3. **Page de dépôt client** : le client voit la liste des demandes, répond en texte ou upload un fichier par item, sans créer de compte
4. **Dashboard freelance** : vue de tous les portails actifs avec statut par item (en attente / reçu)
5. **Relance manuelle en un clic** : bouton "renvoyer le rappel" qui déclenche un email via Brevo
6. **Paiement unique** : Gumroad Checkout, accès à vie après un seul paiement ($49-79)
7. **Suppression automatique des fichiers** après un délai configurable (ex: 30 jours) — argument de confiance

### Hors scope MVP (Should/Could Have — v2)
- Signature électronique de documents (v2)
- Multi-utilisateurs par compte freelance (agences) (v2)
- Sous-domaine personnalisé par freelance (v2, dépend de l'achat d'un nom de domaine)
- Intégrations (Zapier, Notion, Slack) (v3+)

### Explicitement exclu (Won't Have)
- Facturation/devis (chevauche des outils existants, pas le problème ciblé)
- Gestion de projet/tâches (hors périmètre)
- Chat en direct freelance-client (complexité inutile au MVP)

---

## 5. Parcours utilisateur (flows)

**Flow freelance :**
1. Inscription (email + mot de passe, Supabase Auth)
2. Création d'un portail : nom, upload logo (optionnel), ajout d'items de demande (texte + type "fichier" ou "texte")
3. Génération du lien unique → copie ou envoi direct par email au client
4. Consultation du dashboard : statut par item, par client
5. Relance manuelle si besoin

**Flow client final :**
1. Reçoit un lien (email ou message direct du freelance)
2. Ouvre la page — voit le logo/nom du freelance, la liste des demandes
3. Répond item par item (upload ou texte), sauvegarde automatique par item (pas de soumission globale qui bloque si un item manque)
4. Confirmation visuelle "reçu" après chaque item complété

---

## 6. Liste des fonctionnalités détaillée (MoSCoW)

| # | Fonctionnalité | Priorité | Complexité build |
|---|---|---|---|
| 1 | Auth freelance (email/mdp) | Must | Faible (Supabase Auth natif) |
| 2 | Création de portail + items de demande | Must | Moyenne |
| 3 | Upload logo freelance | Should | Faible |
| 3b | **Templates de demandes réutilisables** (créer une liste une fois, la réappliquer à chaque nouveau client en 1 clic) | **Must** | Moyenne |
| 4 | Génération lien token unique par client | Must | Moyenne (sécurité à soigner) |
| 5 | Page publique de dépôt (sans compte) | Must | Moyenne-Haute |
| 6 | Upload fichier client (Cloudflare R2) | Must | Moyenne |
| 7 | Réponse texte libre client | Must | Faible |
| 8 | Dashboard statut par portail/client | Must | Moyenne |
| 9 | Email de notification à la création du lien | Must | Faible (Brevo API) |
| 10 | Bouton relance manuelle | Must | Faible |
| 11 | Suppression auto fichiers après délai | Should | Moyenne (cron Cloudflare) |
| 12 | Paiement Gumroad Checkout one-time | Must | Faible-Moyenne |
| 12b | Compteur de places Founding Member restantes (landing page) | Must | Faible |
| 13 | Limite anti-abus (taille fichier, rate limit) | Must | Faible |
| 14 | Page de statut publique pour le client ("j'ai bien tout envoyé") | Should | Faible |
| 15 | Export CSV des réponses texte | Could | Faible |
| 16 | Rappels automatiques programmés | Won't (v2) | Haute |
| 17 | Signature électronique | Won't (v2) | Haute |

---

## 6bis. Fonctionnalités "nouvelle génération" — différenciation réelle

Objectif : pas juste égaler Content Snare/ClientPort en moins cher, mais faire gagner un temps que personne d'autre ne fait gagner. Chaque idée ci-dessous est jugée sur 3 critères : gain de temps réel pour le freelance, simplicité d'usage (zéro courbe d'apprentissage), et coût de build (favoriser le déterministe, zéro IA, sauf mention contraire).

| Fonctionnalité | Le gain de temps concret | Coût/complexité |
|---|---|---|
| **Lien client permanent (pas par projet)** | Aujourd'hui (Content Snare, ClientPort), on régénère un lien à chaque nouveau projet avec le même client. Ici : un seul lien par client, valable à vie, qui accumule tous les projets/demandes dans le temps. Le freelance n'a plus jamais à retrouver/renvoyer un ancien lien. | Faible — juste un changement de modèle de données (lien lié au client, pas au projet) |
| **Kits de démarrage pré-remplis par métier** | À l'inscription, le freelance choisit son métier (designer, dev, coach, photographe...) et récupère une liste de demandes déjà pré-écrite ("logo haute résolution", "accès Analytics", "3 exemples inspirants"). Il n'a rien à taper pour son premier client. | Faible — contenu statique, pas d'IA nécessaire |
| **Validation automatique du type de fichier à l'upload** | Si le freelance demande "logo en PNG" et que le client upload un .jpg, le client voit un message immédiat "ce format n'est pas celui attendu, veux-tu quand même l'envoyer ?" — évite l'aller-retour classique découvert 3 jours après. | Faible — vérification d'extension, déterministe |
| **Relances programmées par défaut (opt-out, pas opt-in)** | Au lieu d'un bouton "relancer" que le freelance doit penser à cliquer, un calendrier de relance par défaut s'active automatiquement (J+3, J+7) dès la création du lien, désactivable en un clic si le freelance ne veut pas. Renverse la charge mentale : il faut agir pour NE PAS relancer, plutôt que penser à relancer. | Faible-Moyenne — logique de scheduling simple (cron), toujours déterministe |
| **Vue "carnet de bord client"** | Historique complet de tout ce qu'un client a déjà envoyé, tous projets confondus, consultable en un endroit — utile pour un freelance qui refait affaire avec le même client des mois plus tard et qui n'a pas à rechercher dans ses anciens emails. | Faible — vue agrégée sur les données déjà stockées |
| **Notification WhatsApp/SMS en secours** (roadmap v2, pas MVP) | Pour les clients qui n'ouvrent jamais leurs emails — un rappel par SMS après 2 relances email ignorées. Gain de temps réel démontré, mais nécessite Twilio (coût par SMS), donc hors budget $0 initial. | Moyenne — coût direct, à activer seulement après revenu généré |

**Ce qui rend ce paquet différenciant sans être un pari risqué :** aucune de ces features ne demande d'IA ni de gros budget — elles reposent sur un changement de modèle de données (lien permanent) et des défauts intelligents (relance automatique, kits pré-remplis), pas sur de la technologie exotique. C'est de l'innovation pragmatique au sens propre : améliorer l'expérience à partir de frictions réelles et documentées, pas inventer un besoin.

**Priorisation recommandée pour le MVP (2 semaines) :** garder "lien permanent par client" et "kits de démarrage par métier" en Must Have (fort impact perçu, faible coût de build) ; repousser "relances programmées par défaut" et "carnet de bord" en juste-après-MVP (v1.1, semaine 3-4) ; garder le SMS strictement en v2 post-revenu.

---

## 6ter. Fonctionnalités IA (Multi-Modèles Gratuit) — traitement intelligent après-collecte

**Décision stratégique : l'IA fait partie intégrante du MVP.** Le produit n'est pas juste une boîte de dépôt, mais une couche de vérification intelligente qui transforme ce que le client envoie en quelque chose d'immédiatement exploitable pour le freelance.

**Stack IA multi-modèles gratuite :** au lieu de dépendre d'un seul fournisseur, on implémente un **router IA** avec failover automatique entre 4 fournisseurs gratuits. Si un provider rate, le prochain prend le relais automatiquement.

### Les 4 providers IA gratuits

| Provider | Modèle recommandé | Base URL | API Key | Contraintes |
|---|---|---|---|---|
| **1. Agnes AI** (prioritaire) | Agnes 2.5 Pro | `https://api.agnes-ai.com/v1` | Clé gratuite sur agnes-ai.com | OpenAI-compatible, gratuit, pas de limite connue. Modèle le plus puissant (SWE-bench 82.7). **Provider de choix.** |
| **2. Google AI Studio** | Gemini 2.5 Flash | `https://generativelanguage.googleapis.com/v1beta/openai/` | Clé gratuite sur aistudio.google.com | 1 500 req/jour, 15-30 RPM selon modèle. Vision native (peut analyser les fichiers uploadés). |
| **3. Cerebras** | Llama 3.1 8B / GPT-OSS 120B | `https://api.cerebras.ai/v1` | Clé gratuite sur cerebras.ai | 1M tokens/jour, 30 RPM, contexte 8K max. Très rapide sur WSE. |
| **4. Groq** | Llama 3.3 70B / Llama 4 Scout | `https://api.groq.com/openai/v1` | Clé gratuite sur groq.com | 30 RPM, 6K TPM, 14 400 req/jour. Le plus rapide en inference brute (300-1000 TPS). |

### Modèle de routage IA

```
┌─────────────────────────────────────────────────┐
│                  Router IA                       │
│                                                  │
│  1. Essayer Agnes AI (prioritaire)               │
│     └── Succès ? → Retourner résultat            │
│     └── Échec ? → Passer à Google                │
│                                                  │
│  2. Essayer Google AI Studio                     │
│     └── Succès ? → Retourner résultat            │
│     └── Échec ? → Passer à Cerebras              │
│                                                  │
│  3. Essayer Cerebras                             │
│     └── Succès ? → Retourner résultat            │
│     └── Échec ? → Passer à Groq                  │
│                                                  │
│  4. Essayer Groq                                 │
│     └── Succès ? → Retourner résultat            │
│     └── Échec ? → Retourner "IA indisponible"    │
│        (le reste du produit fonctionne            │
│         normalement — 100% déterministe)          │
└─────────────────────────────────────────────────┘
```

### Fonctionnalités IA proposées

| Fonctionnalité | Description | Fréquence d'appel | Provider prioritaire |
|---|---|---|---|
| **Vérification de complétude en temps réel** | Quand le client tape une réponse texte trop vague (ex: "notre cible c'est tout le monde"), l'IA détecte le manque de précision et suggère au client de préciser avant soumission | 1 appel court par réponse texte | Agnes AI (meilleur raisonnement) |
| **Résumé automatique de portail complété** | À la complétion d'un portail, un résumé en un paragraphe est généré pour le freelance, condensant toutes les réponses | 1 appel par portail complété (pas par réponse) | Agnes AI ou Gemini (vision + texte) |
| **Détection d'incohérence fichier/demande** | Vérification que le contenu du fichier correspond globalement à ce qui était demandé (au-delà du simple contrôle d'extension) | 1 appel par upload de fichier | Gemini 2.5 Flash (vision native) |

### Coût IA

**Tous les providers sont gratuits.** Le coût produit est **$0** tant qu'on reste dans les limites des free tiers.

- Agnes AI : actuellement gratuit sans limite connue
- Google AI Studio : gratuit jusqu'à 1 500 req/jour
- Cerebras : gratuit jusqu'à 1M tokens/jour
- Groq : gratuit jusqu'à 14 400 req/jour

Même à 10x le volume actuel, le coût reste **$0** grâce au routage entre providers.

### Garde-fous techniques recommandés
1. **Compteur global d'appels IA** côté serveur avec alerte si un usage anormal apparaît (abus, boucle infinie, bug)
2. **Dégradation propre** : en cas d'échec de tous les providers, les features IA affichent "indisponible temporairement" — le reste du produit continue de fonctionner normalement
3. **Timeout par provider** : chaque appel IA a un timeout de 5 secondes. Si un provider ne répond pas dans les délais, le router passe au suivant automatiquement
4. **Cache des résultats IA** : les résumés de portails identiques sont mis en cache (KV ou DB) pour éviter les appels redondants

**Le déterministe reste le socle du produit** — l'IA est une couche d'amélioration optionnelle et dégradable, jamais un point de défaillance critique pour les fonctions core (upload, statut, relance).

---

## 6quater. Modèle de pricing (hybride, révisé)

**Décision : abandon du lifetime deal.** Un paiement unique à vie oblige à maintenir le service indéfiniment sans revenu récurrent pour couvrir l'hébergement, le support, et l'éventuelle bascule vers l'API IA payante. Remplacé par un modèle hybride :

- **Abonnement mensuel de base** : $9-15/mois — accès complet aux fonctionnalités déterministes (portails illimités, templates, lien client permanent, kits de démarrage, relances programmées)
- **Quota IA inclus** : 20 actions IA par mois incluses dans l'abonnement (grâce aux providers gratuits, le coût marginal est $0)
- **Au-delà du quota** : bascule automatique sur les providers payants (Groq Developer, Cerebras Developer) — coût marginal ~$0.01/action

**Pourquoi ce modèle correspond mieux à la réalité technique :** les providers gratuits couvrent largement les besoins du MVP. Le quota de 20 actions/mois est un garde-fou commercial, pas une contrainte technique. Si le volume explose, les providers payants offrent une sortie de secours à coût négligeable.

---

## 6quinquies. Ce que ce changement implique pour le plan de validation

L'IA fait partie du MVP. Avant de lancer, valider en 1-2 jours :
- La vérification de complétude et le résumé automatique sont-ils perçus comme une vraie valeur ajoutée par 3-5 freelances contactés informellement ?
- Si la réponse est mitigée, désactiver l'IA via un feature flag et lancer le core déterministe seul — l'IA peut être réactivée plus tard sans refonte

---

## 6sexies. Notre seule vraie limite technique : le plafond CPU Cloudflare (10ms/requête, tier gratuit)

**Contexte :** Cloudflare Workers gratuit plafonne le temps de calcul serveur à 10ms par requête. En moyenne, un Worker consomme ~2.2ms — largement dans le budget — mais les requêtes plus lourdes (rendu SSR de pages complexes, authentification, parsing JSON volumineux) peuvent monter à 10-20ms et déclencher une erreur si elles dépassent le plafond. C'est la seule contrainte technique réelle de toute la stack choisie (tout le reste — bande passante, stockage, email, IA — est confortablement dans les tiers gratuits ou quasi gratuit à l'usage).

### Plan d'optimisation, par ordre de mise en œuvre

1. **Minimiser le travail serveur par page** : le dashboard freelance et la page de dépôt client doivent faire le minimum de calcul côté serveur — privilégier des requêtes DB simples et directes (pas de jointures complexes calculées à la volée), et déporter un maximum de logique d'affichage vers le client (React côté navigateur), pas vers le rendu serveur
2. **Mise en cache agressive via Cloudflare KV** : les données qui changent peu (structure d'un portail, liste des templates d'un freelance) sont mises en cache plutôt que recalculées à chaque requête — réduit le temps CPU par requête reçue
3. **Regroupement de requêtes (batching)** : éviter les appels multiples séquentiels à Supabase dans une même requête Worker ; grouper les lectures nécessaires en un minimum d'appels
4. **Dégradation progressive si le plafond approche** : si une page approche la limite, simplifier automatiquement la réponse (moins de données chargées d'un coup, pagination plus agressive) plutôt que de risquer une erreur 1102 (dépassement de ressources)
5. **Mesurer avant de s'inquiéter** : tester le temps CPU réel des pages les plus lourdes (dashboard avec plusieurs portails actifs) dès le début du build, pas en fin de développement — permet de détecter tôt si une page approche la limite

### Filet de sécurité si l'optimisation ne suffit pas

Si malgré ces optimisations une page dépasse régulièrement 10ms : **upgrade vers le plan Workers payant à $5/mois**, qui porte la limite à 30 secondes de CPU par requête — un filet de sécurité qui reste nettement moins cher que l'upgrade Render ($20+) ou Vercel Pro ($20) évités précédemment pour rester à budget minimal. Ce n'est donc jamais un risque bloquant, seulement un coût de repli très faible si besoin.

**Conclusion : cette limite est gérable par de bonnes pratiques de base (cache, requêtes simples), et même en cas de dépassement, la solution de repli coûte 4x moins cher que les alternatives déjà écartées.**

---

## 7. Architecture technique proposée

- **Frontend/Backend** : Next.js 16 (App Router), déployé sur **Cloudflare Workers via l'adaptateur OpenNext** (`@opennextjs/cloudflare`) — chemin officiellement recommandé par l'équipe Next.js depuis mars 2026.
- **Stockage de fichiers** : **Cloudflare R2** (10 Go gratuits/mois, egress gratuit) — dans l'écosystème Cloudflare, évite les coûts de sortie de données.
- **Base de données + Auth** : **Supabase** (Postgres + RLS, Auth) — reste sur Supabase pour la DB/Auth.
- **ORM** : **Drizzle ORM** — type-safe, léger, compatible Supabase/Postgres.
- **Validation** : **Zod** — schémas de validation pour toutes les entrées API.
- **UI** : **shadcn/ui** + **Tailwind CSS** — composants accessibles, personnalisables.
- **Formulaires** : **React Hook Form** + **Zod resolver** — validation client et serveur.
- **State management** : **TanStack Query** — cache serveur, refetch automatique, optimistic updates.
- **Paiement** : **Gumroad Checkout/Billing** (abonnement mensuel) + **Gumroad** pour l'offre Founding Member.
- **IA** : **Multi-provider router** (Agnes AI → Google AI Studio → Cerebras → Groq) — tous OpenAI-compatible, failover automatique.
- **Email transactionnel** : **Brevo** (plan gratuit, 300 emails/jour, pour toujours).
- **Cron / suppression fichiers** : **Cloudflare Cron Triggers** (inclus dans Workers gratuit).

### Modèle de données complet

```sql
-- Utilisaires (freelances)
users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  profession TEXT, -- designer, dev, coach, photographe...
  subscription_status TEXT DEFAULT 'free', -- free, founding, active, cancelled
  gumroad_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profils clients (les clients finaux du freelance)
client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portails (espaces de collecte par projet)
portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_profile_id UUID REFERENCES client_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'active', -- active, archived, completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates de demandes (réutilisables)
demand_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  profession_category TEXT, -- filter by profession
  created_at TIMESTAMPTZ DEFAULT NOW()
);

demand_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES demand_templates(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL, -- text, file, multiple_choice, date, number
  expected_format TEXT, -- ex: "PNG", "PDF", "JJ/MM/AAAA"
  required BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  choices TEXT[], -- pour multiple_choice
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items de demande instanciés dans un portail
portal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES portals(id) ON DELETE CASCADE,
  template_item_id UUID REFERENCES demand_template_items(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL, -- text, file, multiple_choice, date, number
  expected_format TEXT,
  required BOOLEAN DEFAULT true,
  choices TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Liens de portail (token unique par accès client)
portal_access_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES portals(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL, -- UUID long, non-devinable
  client_label TEXT, -- nom affiché pour le client
  expires_at TIMESTAMPTZ,
  reminder_schedule TEXT DEFAULT '["3d","7d"]', -- J+3, J+7 par défaut
  reminders_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Soumissions (réponses client)
submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_item_id UUID REFERENCES portal_items(id) ON DELETE CASCADE,
  portal_access_link_id UUID REFERENCES portal_access_links(id) ON DELETE CASCADE,
  content_text TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  status TEXT DEFAULT 'pending', -- pending, received, flagged
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Résumés IA générés
ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES portals(id) ON DELETE CASCADE,
  summary_text TEXT,
  provider_used TEXT, -- agnes, google, cerebras, groq
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs d'appels IA (traçabilité et monitoring)
ai_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES portals(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL, -- completeness_check, summary, file_verification
  provider_attempted TEXT,
  provider_success TEXT,
  status TEXT, -- success, failed, timeout
  error_message TEXT,
  tokens_input INTEGER,
  tokens_output INTEGER,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activité / notifications
activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  portal_id UUID REFERENCES portals(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- portal_created, link_sent, submission_received, reminder_sent, file_expired
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_portals_user_id ON portals(user_id);
CREATE INDEX idx_portal_items_portal_id ON portal_items(portal_id);
CREATE INDEX idx_submissions_portal_item_id ON submissions(portal_item_id);
CREATE INDEX idx_submissions_link_id ON submissions(portal_access_link_id);
CREATE INDEX idx_ai_call_logs_portal_id ON ai_call_logs(portal_id);
CREATE INDEX idx_activity_user_id ON activity_log(user_id);
```

### Sécurité
- **RLS Supabase** : un freelance ne voit que ses propres portails
- **Token de lien client** : UUID long, non-devinable, à usage unique par client
- **Validation stricte** du type/taille de fichier à l'upload
- **Aucune donnée sensible** stockée au-delà du délai annoncé de suppression

---

## 8. Modèle de monétisation

**Voir section 6quater pour le détail complet.** Résumé : offre de lancement "Founding Member" (20 places à $49 accès à vie aux fonctionnalités déterministes) puis bascule en abonnement mensuel $9-15 pour tous les clients suivants. L'IA est incluse dans le quota de 20 actions/mois.

### Offre de lancement "Founding Member"
- **20 places maximum**, $49 paiement unique (Gumroad), accès à vie au socle déterministe (portails illimités, templates, lien client permanent, kits de démarrage, relances programmées)
- **Compteur décroissant visible sur la landing page** ("12/20 places restantes")
- Au-delà des 20 places : bascule automatique vers l'abonnement mensuel classique $9-15/mois
- L'IA (résumés, vérification) est incluse dans le quota de 20 actions/mois — jamais couverte par le lifetime au-delà du quota

### Projection cash sur 2 semaines
20 Founding Members à $49 (net Gumroad ~$44.10 après commission 10%) = **$882 net**, objectif $500 atteint dès 12 ventes sur les 20 places disponibles.

---

## 11. Coûts réels & marges bénéficiaires

### 11.1 Coûts fixes mensuels par phase

| Poste | Phase 1 — Lancement ($0 budget) | Phase 2 — Après upgrade (croissance confirmée) |
|---|---|---|
| Hosting | Cloudflare Workers gratuit — $0 | Cloudflare Workers payant — $5/mois (si besoin) |
| Base de données | Supabase gratuit — $0 | Supabase Pro — $25/mois |
| Email (Brevo) | $0 (300/jour, pour toujours) | $0 tant que sous 300/jour |
| Stockage (R2) | $0 (10 Go gratuits/mois) | ~$1/mois (au-delà de 10 Go) |
| IA (Multi-provider gratuit) | **$0** (4 providers gratuits en routage) | **$0** (quota 20/actions inclus, providers gratuits suffisent) |
| Nom de domaine | $0 (différé jusqu'à la 1ère vente) | ~$1/mois ($12/an) |
| **Total estimé** | **~$2-3/mois** | **~$32-33/mois** |

### 11.2 Marge sur l'offre Founding Member (lifetime, $49, 20 places)

| | Montant |
|---|---|
| Prix brut | $49 |
| Commission Gumroad (10%) | -$4.90 |
| **Net par vente** | **$44.10** |
| **Total sur 20 ventes** | **$882** |
| Coût fixe Phase 1 à couvrir (1er mois) | ~$3 |
| **Marge nette Phase 1 (si 20/20 vendues)** | **~$879** |

### 11.3 Seuil de rentabilité mensuelle récurrente (abonnés, hors lifetime)

| Prix abonnement | Net après Gumroad (10%) | Abonnés pour couvrir Phase 1 (~$3/mois) | Abonnés pour couvrir Phase 2 (~$33/mois) |
|---|---|---|---|
| $9/mois | $8.10 | 1 abonné | 4 abonnés |
| $12/mois | $10.80 | 1 abonné | 3 abonnés |
| $15/mois | $13.50 | 1 abonné | 3 abonnés |

### 11.4 Lecture d'ensemble

- **Court terme (2 semaines) :** l'objectif $500 est atteint dès 12 ventes Founding Member sur les 20 disponibles — largement couvert par la marge sur cette seule offre
- **Moyen terme (mois 2-3) :** il faut recruter 3 à 4 abonnés mensuels pour que le produit s'auto-finance
- **Le coût IA est $0** grâce au routage entre 4 providers gratuits — c'est un avantage compétitif majeur par rapport aux concurrents qui facturent l'IA séparément

---

| Risque | Mitigation |
|---|---|
| Faible différenciation vs Content Snare/Google Forms | Positionnement explicite "pour freelance solo, pas pour agence", prix imbattable, IA incluse |
| Lien `.onrender.com` nuit à la confiance du client final | Page de dépôt très soignée avec branding freelance visible ; upgrade dès cash disponible |
| Délivrabilité email sans domaine propre | Volume faible au départ = risque limité ; migrer vers domaine dès la 1ère vente |
| Abandon client à l'upload (friction) | Zéro compte requis, un item à la fois, sauvegarde automatique |
| Trop de scope avant la 1ère vente | Respecter strictement le tableau MoSCoW — rien hors "Must" avant le lancement |
| Fournisseur IA tombe en panne | Router multi-provider avec failover automatique — un seul provider doit tomber pour que ça continue |

---

## 10. Plan de validation parallèle au build

- Poster l'offre (landing page + Gumroad) sur r/freelance et r/webdev dès le jour 3-4, avant la fin du build complet, pour capter les premières intentions d'achat
- Suivre les objections/commentaires reçus comme signal de priorisation des features "Should Have"
