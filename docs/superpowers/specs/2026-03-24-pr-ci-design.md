# PR CI Design

## Goal

Add a pull-request-only GitHub Actions pipeline for `main` that blocks merges until core quality and security checks pass.

## Workflow Shape

- Trigger on `pull_request` for `main`
- Cancel outdated runs with workflow-level concurrency
- Keep jobs independent for faster feedback and easier branch protection setup

## Required PR Checks

- `quality`: Prettier, ESLint, Stylelint
- `build`: TypeScript build plus Vite production bundle
- `unit-tests`: Vitest smoke coverage for the current app shell
- `dependency-audit`: `npm audit` at `high` severity threshold
- `secrets`: PR diff secret scanning with TruffleHog
- `prompt-security`: enforce Promptfoo setup once prompt assets or LLM SDKs are introduced
- `codeql (javascript-typescript)`
- `codeql (actions)`

## Security Notes

- `prompt-security` stays green while the repository has no LLM or prompt surface
- If prompt assets or LLM SDKs are added later, the workflow fails until Promptfoo is configured
- `codeql` requires GitHub code scanning support on the repository

## Manual GitHub Setup

- Configure `main` branch protection or a ruleset manually in GitHub
- Mark the checks above as required before merge
- Require pull requests, approvals, up-to-date branches, and resolved conversations
