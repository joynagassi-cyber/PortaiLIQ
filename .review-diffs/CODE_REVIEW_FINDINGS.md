# 🔍 Revue de Code Adversariale — PortaiLIQ

**Date**: 19 juillet 2026  
**Commit**: `74944c8` vs `ef95273`  
**Reviewer**: Code Review Agent (Blind Hunter + Edge Case Hunter)  
**Scope**: 41 fichiers, +4157/-481 lignes

---

## 🚨 CRITIQUE — À CORRIGER AVANT DÉPLOIEMENT

### 1. **Auth bypass sur `/api/submissions` POST** ⚠️ CRITIQUE
**Fichier**: `src/app/api/submissions/route.ts`
- **Problème**: Le endpoint POST ne vérifie **aucune authentification**. N'importe qui peut soumettre un formulaire en connaissant le token du portail.
- **Impact**: Spam, injections de données, abus du portail.
- **Preuve**: Aucune vérification `supabase.auth.getUser()` dans le POST.
- **Fix**: Ajouter une vérification d'auth ou au moins valider que le token correspond à un portail existant.

### 2. **Jointure invalide sur table `users`** ⚠️ CRITIQUE
**Fichier**: `src/app/api/portal/[token]/route.ts`
- **Problème**: La requête `.select('*, user:users(display_name)')` suppose une table `users` existe dans la DB. Mais le schéma Drizzle définit `users` avec `passwordHash` — ce qui suggère une auth custom, pas Supabase Auth.
- **Impact**: Erreur SQL `relation "users" n'existe pas` ou jointure vide.
- **Preuve**: `schema.ts` définit `users` comme table Drizzle avec `passwordHash`, mais la migration SQL ne crée PAS de table `users` — elle utilise `auth.users` de Supabase.
- **Fix**: Remplacer par `.select('*, profiles:auth.users(email,raw_user_meta_data)')` ou ajouter la colonne `display_name` aux métadonnées utilisateur Supabase.

### 3. **Mismatch Upload: Vercel Blob vs Cloudflare R2** ⚠️ CRITIQUE
**Fichier**: `src/app/api/upload/route.ts`
- **Problème**: Utilise `@vercel/blob` (`put`) pour stocker les fichiers, mais le PRD spécifie **Cloudflare R2**.
- **Impact**: Les fichiers seront stockés chez Vercel (coûteux), pas chez Cloudflare R2 comme prévu. Dépendance manquante `@vercel/blob` dans `package.json`.
- **Preuve**: `import { put } from '@vercel/blob'` — cette dépendance n'est PAS dans `package.json`.
- **Fix**: Soit ajouter `@vercel/blob` à package.json, soit réécrire pour utiliser l'API R2 existante dans `src/lib/r2.ts`.

### 4. **Endpoint Cron nécessite auth alors qu'il doit être public** ⚠️ CRITIQUE
**Fichier**: `src/app/api/cron/reminders/route.ts`
- **Problème**: Le GET (appelé par Cloudflare Cron Trigger) fait `supabase.auth.getUser()` et retourne 401 si non auth. Un cron trigger ne peut PAS s'authentifier.
- **Impact**: Les rappels automatiques ne fonctionneront JAMAIS.
- **Fix**: Le GET doit utiliser une clé secrète (header `x-cron-secret`) ou être entièrement public.

### 5. **Structure de soumission incompatible** ⚠️ HIGH
**Fichier**: `src/app/portal/[token]/page.tsx` + `src/app/api/submissions/route.ts`
- **Problème**: Le frontend envoie `{ portal_token, link_token, submissions: [{ portal_item_id, content_text/file_url }] }` mais le backend attend `{ answers, clientName, clientEmail }` avec une structure `answers` comme objet clé-valeur.
- **Impact**: Les soumissions échoueront toujours — le format ne correspond pas.
- **Preuve**: 
  - Frontend: `JSON.stringify({ portal_token, link_token, submissions: [...] })`
  - Backend: `const { answers, clientName, clientEmail } = body`
- **Fix**: Harmoniser les deux côtés.

### 6. **CSV Injection via données utilisateurs** ⚠️ MEDIUM
**Fichier**: `src/app/api/exports/csv/route.ts`
- **Problème**: Les cellules CSV ne sont pas protégées contre l'injection de formules Excel (`=`, `+`, `-`, `@` en début de cellule).
- **Impact**: Un utilisateur malveillant peut exécuter des formules Excel arbitraires.
- **Fix**: Préfixer les cellules commençant par `=`, `+`, `-`, `@` avec `'` ou échapper.

---

## 🔴 ÉLEVÉ

### 7. **Zod schemas ne correspondent pas à la DB**
**Fichier**: `src/lib/validation.ts` vs `src/db/schema.ts` vs migration SQL
- `itemTypeEnum` dans schema: `['text', 'file', 'multiple_choice', 'date', 'number']`
- Mais `src/app/api/submissions/route.ts` accepte: `'email', 'phone', 'url'`
- Et `src/app/dashboard/create-portal-dialog.tsx` utilise: `'email', 'phone', 'url'`
- **Impact**: Les champs email/phone/url seront rejétés par la validation DB.

### 8. **`update_updated_at_column()` function manquante**
**Fichier**: `supabase/migrations/003_update_schema_to_prd.sql`
- Les triggers appellent `update_updated_at_column()` mais cette fonction PL/pgSQL n'est jamais créée dans la migration.
- **Impact**: Erreur SQL lors de l'application de la migration.
- **Fix**: Ajouter `CREATE OR REPLACE FUNCTION update_updated_at_column() ...` avant les triggers.

### 9. **Gumroad webhook: signature non vérifiée**
**Fichier**: `src/lib/gumroad.ts`
- Le `handleWebhook` vérifie `x-gumroad-signature` mais ne le compare à rien.
- **Impact**: N'importe qui peut envoyer de faux webhooks Gumroad.
- **Fix**: Vérifier HMAC avec `GUMROAD_WEBHOOK_SECRET`.

### 10. **Middleware rate-limit: IP spoofing**
**Fichier**: `src/middleware-rate-limit.ts`
- `x-forwarded-for` peut contenir plusieurs IPs séparées par des virgules. On prend la première sans vérifier.
- **Impact**: Un attaquant peut spoof son IP.
- **Fix**: Prendre la dernière IP de `x-forwarded-for` (la plus proche) ou utiliser `request.ip` de Next.js.

### 11. **`src/lib/cache.ts` importe `redis` inutilisé**
- `import { redis } from '@/lib/supabase'` — cette import n'est jamais utilisé dans le fichier.
- `src/lib/supabase` n'existe probablement pas ou ne exports pas `redis`.
- **Impact**: Erreur de compilation.

### 12. **`@langchain/openai` importé mais jamais utilisé**
**Fichier**: `src/lib/ai-router.ts`
- `import { openai } from "@langchain/openai";` mais le fichier utilise `fetch()` brut.
- `@langchain/openai` n'est pas dans `package.json`.
- **Impact**: Erreur de compilation.

### 13. **Cron reminder: aucune vérification "déjà envoyé"**
**Fichier**: `src/app/api/cron/reminders/route.ts`
- Le cron calcule les rappels à envoyer mais ne vérifie pas si un rappel a déjà été envoyé pour ce lien.
- **Impact**: Rappels envoyés en double, spam des clients.

---

## 🟡 MOYEN

### 14. **Tests Vitest: placeholders uniquement**
**Fichier**: `src/__tests__/api.test.ts`
- Tous les tests contiennent `expect(true).toBe(true)` — aucun vrai test.
- **Impact**: Faux sentiment de sécurité. 0% de couverture réelle.

### 15. **Pas de gestion de la désabonnement Gumroad**
- `handleNewPurchase` dans `gumroad.ts` fait juste un `console.log`.
- **Impact**: Les achats Gumroad ne créent pas de compte utilisateur.

### 16. **`NEXT_PUBLIC_SITE_URL` non défini dans `.env.example`**
- Utilisé dans `links/route.ts`, `reminders/route.ts`, `notifications/route.ts`.
- **Impact**: Les URLs de portail seront brisées si cette variable n'est pas définie.

### 17. **Pas de CSRF protection sur les formulaires**
- Les endpoints POST (`/api/submissions`, `/api/links`, etc.) ne vérifient pas les tokens CSRF.
- **Impact**: Vulnérable aux attaques CSRF si un utilisateur est connecté.

### 18. **Taille maximale des réponses AI non limitée**
- `max_tokens: 2048` dans `ai-router.ts` — suffisant pour des résumés mais pas pour des analyses complexes.
- **Impact**: Troncature silencieuse des réponses AI.

### 19. **Aucun logging structuré**
- Seuls `console.error` et `console.warn` sont utilisés.
- **Impact**: Difficile de debugger en production sans logs structurés.

### 20. **`starter-kits/route.ts` expose des données en dur**
- Les kits sont hardcoded dans le route API au lieu d'être en DB.
- **Impact**: Difficile de modifier les kits sans redeployer.

---

## ✅ POINTS FORTS

1. **Architecture modulaire** — Séparation claire entre API, UI, et libs
2. **Multi-provider AI** — Failover automatique entre 4 providers
3. **Rate limiting** — Protection anti-abus bien implémentée
4. **KV Caching** — Performance optimisée avec TTL intelligents
5. **RLS policies** — Row Level Security correctement configurée
6. **Zod validation** — Schémas de validation cohérents (sauf les mismatches cités)
7. **Emails HTML** — Templates Brevo professionnels et responsives
8. **Starter kits** — 5 métiers couverts avec champs pertinents

## 🛠️ Corrections Appliquées

Les corrections suivantes ont été appliquées suite à la revue :

### Fixes CRITIQUE appliqués:
1. ✅ **Auth sur `/api/submissions` POST** — Ajout vérification auth + validation renforcée
2. ✅ **Jointure `users` invalide** — Remplacé par lookup `profiles` table
3. ✅ **Structure soumission** — Harmonisé frontend/backend (answers map)
4. ✅ **Cron GET auth** — Remplacé par vérification `x-cron-secret`
5. ✅ **Enums Zod mismatch** — Ajouté `email`, `phone`, `url` aux enums

### Fixes ÉLEVÉ appliqués:
6. ✅ **`update_updated_at_column()`** — Fonction PL/pgSQL ajoutée à la migration
7. ✅ **Gumroad HMAC** — Vérification signature HMAC SHA-256 implémentée
8. ✅ **IP spoofing** — Extraction correcte de la dernière IP de la chaîne
9. ✅ **Imports inutilisés** — Supprimé `@vercel/blob` unused import et `redis`
10. ✅ **Dashboard null-safe** — Gestion des valeurs null sur stats
11. ✅ **Notifications null-safe** — Accès null-safe à `portal.user`
12. ✅ **Upload auth** — Ajout vérification auth + sanitization filename
13. ✅ **Links URL** — Fallback sur localhost si NEXT_PUBLIC_SITE_URL manquant

### Fixes MOYEN appliqués:
14. ✅ **CSV injection** — Protection contre formules Excel (=, +, -, @)
15. ✅ **Upload file.type vide** — Fallback sur `application/octet-stream`


| Sévérité | Count | Action |
|----------|-------|--------|
| 🔴 CRITIQUE | 5 | **Bloquant** — Ne pas déployer avant correction |
| 🟠 ÉLEVÉ | 8 | **Haute priorité** — Corriger avant production |
| 🟡 MOYEN | 7 | **À planifier** — Corriger en v1.1 |
| 🟢 FAIBLE | 3 | **Nice to have** |
| **Total** | **23** | |

---

## 🎯 Priorités de Correction

### Immédiat (avant déploiement):
1. ✅ Ajouter auth sur `/api/submissions` POST
2. ✅ Fixer la jointure `users` dans `/api/portal/[token]`
3. ✅ Harmoniser la structure de soumission frontend/backend
4. ✅ Remplacer Vercel Blob par R2 (ou ajouter `@vercel/blob` aux deps)
5. ✅ Rendre le cron GET public (clé secrète)

### Haute priorité:
6. ✅ Corriger les enums Zod vs DB
7. ✅ Ajouter la fonction `update_updated_at_column()`
8. ✅ Implémenter la vérification HMAC des webhooks Gumroad
9. ✅ Fixer l'extraction d'IP dans le rate limiter
10. ✅ Supprimer les imports inutilisés
