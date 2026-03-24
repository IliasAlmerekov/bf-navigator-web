# BF Navigator App

Fresh Expo SDK 55 baseline for the BF Navigator repository.

## What Was Preserved

- `.claude/`
- `.codex/`
- `.github/`
- `docs/`
- `CONVENTION.md`
- `src/` directory scaffold

The old application code inside `src/` was removed on purpose. Only the folder structure remains so the app can be rebuilt on a clean, current stack.

## Current Stack

- Expo SDK 55
- React 19
- React Native 0.83
- TypeScript 5.9

## Available Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
npm run typecheck
```

## Project Structure

```text
src/
  assets/
  components/
    layout/
    notification/
    route/
    ui/
  constants/
  hooks/
  navigation/
  screens/
    Dashboard/
    Notification/
    Profile/
    RouteOverview/
  services/
    http/
  stores/
  types/
  utils/
```

## Next Step

Start rebuilding the app from `App.tsx` and repopulate `src/` with new modules as needed.
