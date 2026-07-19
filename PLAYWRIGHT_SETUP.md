# 🧪 Playwright E2E Tests — PortaiLIQ

## Installation

```bash
# Install Playwright and browsers
npm install --save-dev @playwright/test
npx playwright install
```

## Configuration

Le fichier `playwright.config.ts` est configuré avec :
- **3 projets** : Chromium, Firefox, WebKit
- **Screenshot** sur échec
- **Trace collection** pour le debugging
- **Video recording** sur échec
- **WebServer** démarre automatiquement le dev server

## Lancer les Tests

```bash
# Lancer tous les tests
npx playwright test

# Lancer un projet spécifique
npx playwright test --project=chromium

# Mode headed (voir le navigateur)
npx playwright test --headed

# Ouvrir l'UI mode (recommandé pour debugger)
npx playwright test --ui

# Générer un rapport HTML
npx playwright show-report
```

## Structure des Tests

```
e2e/
├── home.spec.ts          # Tests page d'accueil
├── dashboard.spec.ts     # Tests dashboard
└── auth.spec.ts          # Tests d'authentification
```

## Bonnes Pratiques

1. **Ne pas tester l'auth en E2E** — Utiliser des fixtures ou state persistence
2. **Utiliser `test.describe`** pour grouper les tests logiques
3. **Nommer les tests clairement** — `should ...` ou `should not ...`
4. **Ne pas hardcoder les timeouts** — Utiliser les defaults
5. **Collecter les traces** — Utile pour debugger les échecs en CI

## CI/CD Integration

Dans GitHub Actions ou GitLab CI :

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npx playwright test --reporter=github
```
