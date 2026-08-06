# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Toolchain is pinned by `mise.toml` (Node 26 + `@angular/cli`). If `node`/`ng` are not on `PATH`, prefix commands with `mise exec --`.

```bash
npm start                        # dev server, development configuration (points at https://localhost:7121)
npm run start:prod               # dev server against the production API
npm run build                    # production build → dist/portfolio-ui/browser
npm test -- --watch=false        # single test run (watch defaults to true in a TTY)
npm run lint                     # eslint . ; lint:fix to autofix
npx prettier --check <paths>     # formatting is enforced by CI but has no npm script
```

Running a subset of tests (`@angular/build:unit-test`, Vitest runner, jsdom environment):

```bash
npm test -- --watch=false --include src/app/page/articles/articles.spec.ts
npm test -- --watch=false --filter '^Articles'    # regex over suite/test names
```

## Architecture

Angular 22 standalone application, zoneless-style, no NgModules. Data comes from an external profile API (`environment.api.url`); `src/environments/environment.development.ts` is swapped in by the `development` build configuration.

### Route → resolver → component-input pipeline

This is the central pattern and spans several files. `provideRouter(..., withComponentInputBinding())` in `app.config.ts` means **resolved route data is bound directly to component `input.required()` signals by key name**. To add a page:

1. Add a method to `ProfileApi` (`src/app/services/api/profile-api/profile-api.ts`) — the single HTTP surface, all URLs built as `${environment.api.url}/api/${environment.api.version}/...`.
2. Add a `ResolveFn` in `src/app/resolvers/profile-resolver/` that `inject(ProfileApi)`s and reads `route.params['profileId']`.
3. Register it in `app.routes.ts` under `resolve: { someKey: someResolver }`.
4. Declare `readonly someKey = input.required<T>()` in the component — the names must match.

Every profile route also spreads `profileProfileResolver` (`profileId` + `profileNavi`). `Nav` and `Footer` do **not** take inputs; they read `profileId`/`profileNavi` off `ActivatedRoute.snapshot.data`, so any page rendering `<app-nav>` must resolve those keys.

`withNavigationErrorHandler` redirects **any** resolver failure to `/404`, which makes API/DI errors look like a routing problem — check the console for the logged original error before assuming the route is wrong.

`indexRandomRedirect` (`src/app/redirectFn/`) sends `/` to either `/profiles` or a hard-coded profile id at random.

### Migration in progress

Pages were ported from the static reference design to the live API. `src/app/page/articles-item/articles-item.ts` is the last page still reading `src/app/data/portfolio.ts` (a copy of the design's mock data) instead of a resolver — port it to `profileArticlesItemResolver` (which already exists and is already wired in `app.routes.ts`) rather than extending the mock data. Similarly `shared/pagination` still uses `@Input`/`@Output` decorators while everything else uses signal inputs, and its `onChange` is not yet wired by the list pages.

### Services and helpers

- `@Service()` (Angular 22) replaces `@Injectable({providedIn:'root'})` for DI-registered services — used by `ProfileApi` and `IndexHtmlBuilder`.
- `Accent` and `DateStr` are **plain classes instantiated inline in components** (`new Accent(Colors.text)`), not injected. `Accent.color` is a stateful round-robin over a Tailwind class list, so each read advances the cycle — that is the intent for per-item accent coloring.
- `IndexHtmlBuilder` renders the `<<class1,class2,"text">>` mini-syntax stored in profile copy into `<span class="...">` markup; see the doc comment for the grammar.
- `Reveal` (`shared/reveal.ts`, selector `appReveal`) is a scroll-in animation directive with an IntersectionObserver plus a 1.4s failsafe.

### Models

`src/app/models/cms/` mirrors the CMS payload shapes (`CollectionType<T>` = `{data, meta}`, `SingleType<T>`, `Article`, `Review`, `Blocks`, …) — fields are broadly `| null`, so components defensively default (`?? []`, fallback pagination objects). `src/app/models/` root holds the profile API DTOs whose fields are snake_case (`first_name`), matching the backend.

### Styling

Tailwind v4 via PostCSS (`.postcssrc.json`), no `tailwind.config.js`. The entire theme (daisyUI-derived oklch palette, fonts, `--container-shell/read/list`) lives in the `@theme` block of `src/styles.css`. Classes generated only from data strings (e.g. those in `Colors`) need `@source inline(...)` entries there or they get purged. Per-component styles have a hard 8kB budget in production builds.

### `design/`

Reference-only port of the original HTML/Angular design (different persona, Angular 17 idioms, mock data). It is excluded from ESLint and is not built — treat it as a visual spec, never import from it.

## Conventions

- Prettier: **no semicolons**, single quotes, `printWidth: 100`, `trailingComma: "none"`, `singleAttributePerLine` (HTML templates use the `angular` parser).
- Angular CLI's suffix-free naming: files are `articles.ts` / `articles.html` / `articles.css` / `articles.spec.ts` in a directory per page under `src/app/page/`, and classes are `Articles`, not `ArticlesComponent`.
- `tsconfig.json` enables `noPropertyAccessFromIndexSignature`, so route params/data must be read with brackets: `route.params['profileId']`.
- Specs are the CLI-generated "should create" smoke tests; components under test that use `RouterLink` need `provideRouter([])` in the testing providers.

## Release

`package.json` `version` is the source of truth. Pushing to `main` creates a GitHub release from the latest git tag, and `release.yml` fails the build if the tag (minus `v`) does not equal `package.json` version — bump the version and tag together. Release builds and pushes a Docker image (`Dockerfile`: Node build → nginx-unprivileged on :8080, `nginx.conf` provides the SPA `try_files` fallback).
