# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `bun run dev` (Vite on port 3000)
- **Build**: `bun run build`
- **Preview**: `bun run preview`
- **Type check**: `bunx tsc --noEmit`
- No test framework configured

## Architecture

Offline-first dictionary PWA built with React 18 + TypeScript + Vite. Users search a ~100MB WordNet SQLite database that runs entirely in the browser via sql.js (WASM).

**State**: Jotai atoms with `atomWithStorage` for localStorage persistence (`src/atoms.tsx`). Atoms cover search history, bookmarks, database metadata, and download progress.

**Database lifecycle**: On first visit, the service worker (`public/sw.js`) pre-caches `wordnetFull.db` into the Cache API (`offline-dictionary-db-v1`). AppContent fetches it (served from cache by SW), streams it into memory, and creates a sql.js `Database` instance. `cacheUtils.ts` provides `downloadDatabase`, `deleteDatabaseFromCache`, and `isDatabaseCached` for managing the cache from the main thread. AppContent reconciles cache state with localStorage metadata on startup.

**Routing**: React Router v7 with routes: `/history`, `/bookmarks`, `/study`, `/settings`, `/word/:word`. AppContent owns all routes and global state.

**Styling**: Plain CSS files co-located with components. CSS variables for theming defined in `src/colors.css`. Font Awesome for icons, JetBrains Mono font.

## Key files

- `src/components/AppContent/AppContent.tsx` - Main component: loads DB, defines routes, manages global state
- `src/utils.ts` - Search queries, bookmark operations, random word selection
- `src/cacheUtils.ts` - Cache API operations for database storage
- `src/constants/databases.ts` - Available database definitions (currently only wordnetFull)
- `src/interfaces.ts` - Core TypeScript interfaces (Definition, Database, DatabaseInfo)
- `public/sw.js` - Service worker with cache-first strategy for .db files

## Notes

- The SW cache name `offline-dictionary-db-v1` is used in both `sw.js` and `cacheUtils.ts` as a string literal (SW is plain JS, can't share imports).
- `tsconfig.json` has `noUnusedLocals` and `noUnusedParameters` enabled — prefix unused params with `_`.
- The codebase should have zero TS errors — run `bunx tsc --noEmit` to verify.
