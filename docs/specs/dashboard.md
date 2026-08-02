# Spec: Dashboard

> Freelancer dashboard showing stats, portal list, and quick actions.

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard/stats` | Required | Aggregate stats |
| GET | `/api/dashboard/portals` | Required | Portal list with submission counts |

## Stats Endpoint

### GET /api/dashboard/stats → 200 OK

```json
{
  "totalPortals": 8,
  "activePortals": 5,
  "archivedPortals": 3,
  "totalSubmissions": 23,
  "pendingSubmissions": 9,
  "completedSubmissions": 14,
  "planTier": "professional",
  "portalLimit": null
}
```

## Business Logic

1. **Auth check** → middleware verifies user is logged in via Google OAuth
2. **License check** → verify active Gumroad license
3. **Stats calculation:**
   - `totalPortals` = COUNT(portals WHERE user_id = auth.user.id)
   - `activePortals` = COUNT WHERE status = 'active'
   - `totalSubmissions` = COUNT(submissions) JOIN portals ON portal_id
   - `pendingSubmissions` = COUNT WHERE status = 'pending'
   - `completedSubmissions` = COUNT WHERE status = 'received'
4. **Cache** → KV cache with 5-minute TTL

## Dashboard Page

### GET /dashboard → 200 OK

Components:
1. **Header** — Logo, user email, sign out
2. **Stats row** — 4 cards: Portals, Items, Submissions, Plan
3. **Portal list** — `PortalList` component with search/filter
4. **Empty state** — "No portals yet" + "Create Portal" button

### Stats Cards

| Card | Value | Source |
|------|-------|--------|
| Portals | `{totalPortals}` active / {planLimit || "∞"} max | API |
| Items | `{totalItems}` | SUM(portal_items per portal) |
| Submissions | `{totalSubmissions}` received | API |
| Plan | `{planTier capitalized}` | License check |

### Plan Display

| License Status | Display |
|---------------|---------|
| No license | "No Plan — Upgrade Required" |
| starter | "Starter — {activePortals}/5 portals" |
| professional | "Professional — Unlimited" |
| agency | "Agency — Team Seats: {used}/{limit}" |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User has no license | Show upgrade banner + link to pricing |
| User at portal limit | "Upgrade to create more portals" |
| No portals created | Show empty state with CTA |
| Dashboard stats API fails | Show fallback: "0" for all counts |
| User email not verified by Google | Block access, show "Verify your email" |

## Files

| File | Role |
|------|------|
| `src/app/dashboard/page.tsx` | Dashboard page (server component) |
| `src/app/dashboard/portal-list.tsx` | Portal list client component |
| `src/app/dashboard/create-portal-dialog.tsx` | Create portal dialog |
| `src/app/api/dashboard/route.ts` | Stats API endpoint |
