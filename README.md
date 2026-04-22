# SFBS Frontend — Advanced Frontend Applications (AFA)

**Team:** Muhammad · Mohab Tawfik · Salma Essamiri
**Stack:** React 18 · TypeScript · Vite · Redux Toolkit · Tailwind CSS · i18n · Vitest

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/sfbs-team/sfbs-frontend.git
cd sfbs-frontend
npm install

# 2. Copy env file
cp .env.example .env

# 3. Start dev server (make sure sfbs-backend is running on port 8000)
npm run dev       # → http://localhost:3000

# 4. Run tests
npm test

# 5. Run tests with coverage
npm run test:coverage
```

---

## Sprint Plan — AFA Course

### Sprint 1 — Week II→IV: Setup + Architecture + Basic Views

| Member | Commit | Deliverable |
|--------|--------|-------------|
| Muhammad | Sprint 1 [Muhammad] | Vite + React + TS project setup, routing, folder structure |
| Mohab | Sprint 1 [Mohab] | Component architecture diagram (draw.io) |
| Salma | Sprint 1 [Salma] | Figma UI mockups — all screens |

**Week IV deliverable:** Application mockups + component architecture ✅

---

### Sprint 2 — Week VI→VIII: Routing + State Management

| Member | Commit | Deliverable |
|--------|--------|-------------|
| Muhammad | Sprint 2 [Muhammad] | All pages with mock data, protected routes (guards) |
| Mohab | Sprint 2 [Mohab] | Redux Toolkit — auth, facilities, bookings, UI slices |
| Salma | Sprint 2 [Salma] | React Hook Form + Zod validation, responsive design (RWD) |

**Week VI deliverable:** Framework setup + routing + basic views ✅
**Week VIII deliverable:** State management + navigation ✅

---

### Sprint 3 — Week X→XII: API Integration + i18n + Tests

| Member | Commit | Deliverable |
|--------|--------|-------------|
| Muhammad | Sprint 3 [Muhammad] | Axios API service + interceptors, live backend connection |
| Mohab | Sprint 3 [Mohab] | i18next — English / Polish / Arabic (RTL), themes (dark/light) |
| Salma | Sprint 3 [Salma] | Vitest component tests — ≥30% coverage |

**Week X deliverable:** External API integration ✅
**Week XII deliverable:** i18n + themes + component tests ✅

---

### Sprint 4 — Week XIV→XV: Performance + Polish + Final

| Member | Commit | Deliverable |
|--------|--------|-------------|
| Muhammad | Sprint 4 [Muhammad] | Lighthouse optimization (target ≥ 90) |
| Mohab | Sprint 4 [Mohab] | UI/UX refinement + accessibility |
| Salma | Sprint 4 [Salma] | E2E tests (Cypress) + technical documentation |

---

## AFA Requirements Checklist

- [x] React 18 + TypeScript (Thin Client)
- [x] Vite build tool
- [x] Redux Toolkit (state management)
- [x] React Router v6 (routing + protected routes)
- [x] React Hook Form + Zod (form validation)
- [x] Axios with interceptors (API communication)
- [x] i18next — EN / PL / AR (internationalization)
- [x] Dark / Light theme toggle
- [x] Tailwind CSS (responsive design RWD)
- [x] Vitest + Testing Library (≥30% component coverage)
- [x] Protected Routes (Guards)
- [x] OAuth2 Google login route
- [x] GitHub Projects task board

---

## Project Structure

```
src/
├── components/     ← Shared UI components (Badge, Button, Input, Navbar…)
├── pages/          ← Route-level pages (Home, Facilities, Bookings…)
├── store/          ← Redux Toolkit slices (auth, facilities, bookings, ui)
├── services/       ← Axios API service + endpoint functions
├── types/          ← TypeScript interfaces
├── i18n/           ← Translations (EN, PL, AR)
├── styles/         ← Tailwind global CSS
└── tests/          ← Vitest component + store tests
```
