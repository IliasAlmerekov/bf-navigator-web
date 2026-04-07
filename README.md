# Barrier-Free Navigator Web

Barrier-Free Navigator Web is an early-stage prototype for accessible public transport navigation. It is designed for people with reduced mobility and explores how route planning can account for real-world barriers such as broken elevators, inaccessible transfers, and mobility-specific needs before a journey begins.

The project focuses on a calm, accessibility-first user experience and route-planning flows that are easier to understand and safer to rely on for users who need barrier-free travel options.

## What This Prototype Covers

- accessible route-planning flows for mobility-impaired users
- interface patterns built with accessibility as a primary constraint
- exploration of barrier-free alternatives and route risk visibility
- frontend validation of product and UX ideas before a full production build

## Tech Stack

- React 19
- TypeScript
- Vite
- TanStack Router
- Vitest + React Testing Library
- ESLint, Prettier, and Stylelint

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open the local URL shown by Vite in your browser.

## Useful Commands

```bash
npm run build
npm run test
npm run lint
npm run typecheck
npm run preview
```

## Project Structure

```text
src/
  pages/      page-level UI and interaction flows
  routes/     router definitions
  types/      shared type definitions

docs/
  agents/     planning and research artifacts

public/       static assets
```

## Accessibility

Accessibility is the primary constraint of this project, not a secondary enhancement. UI decisions, interaction patterns, and implementation choices are expected to support keyboard navigation, screen readers, clear structure, and reduced-motion preferences from the start.
