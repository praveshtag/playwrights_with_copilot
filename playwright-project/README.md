# Playwright Project

Minimal Playwright + TypeScript project scaffold.

Prerequisites
- Node.js (16+ recommended)

Setup
1. Install dependencies:

```powershell
cd c:\playwrights_with_copilot\playwright-project
npm install --save-dev @playwright/test
npx playwright install
```

2. Run tests:

```powershell
npm run test
```

Useful scripts
- `npm run test` — run tests headless
- `npm run test:headed` — run tests headed
- `npm run test:debug` — run Playwright Debug Mode

Files
- `playwright.config.ts` — Playwright configuration
- `tests/example.spec.ts` — sample test

Next steps
- Add more tests in `tests/`.
- Add CI workflow (GitHub Actions) to run `npx playwright test`.
