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

### Block rendering (article and review bodies)

The body of a single article or review is the CMS dynamic zone in `data.blocks`. `Blocks` (`src/app/models/cms/blocks.ts`) is a union discriminated on `__component` — `shared.rich-text`, `shared.quote`, `shared.slider`, `shared.media`. Two rules follow from the payload: the **array order is the authored order**, so render by index (`id` is a per-component-type sequence and says nothing about position), and **any type may appear at any index**, so dispatch on `__component` rather than position.

`shared/block-list` (`app-block-list`, input `blocks`) owns that dispatch. It maps each block to a `BlockView` in a `computed()`, dropping blocks the CMS left empty (a `shared.media` with `file: null` is normal), and exposes `asViewText`/`asViewQuote`/`asViewSlider`/`asViewMedia` narrowing accessors so the template stays type-safe without relying on `@switch` narrowing. Inter-block spacing belongs to its container (`gap-8`), which is why `.prose > :first-child` / `:last-child` zero out edge margins. `shared/slider` (`app-slider`) renders the `shared.slider` files one at a time with wrap-around navigation.

`src/app/data/portfolio.ts` (a copy of the design's mock data) is now **unreferenced** — every page reads the live API. `shared/pagination` still uses `@Input`/`@Output` decorators while everything else uses signal inputs, and its `onChange` is not yet wired by the list pages.

### Services and helpers

- `@Service()` (Angular 22) replaces `@Injectable({providedIn:'root'})` for DI-registered services — used by `ProfileApi` and `IndexHtmlBuilder`.
- `Accent` and `DateStr` are **plain classes instantiated inline in components** (`new Accent(Colors.text)`), not injected. `Accent.color` is a stateful round-robin over a Tailwind class list, so each read advances the cycle — that is the intent for per-item accent coloring. Because each read advances it, do not bind `accent.color` on a single-item page; use a literal class.
- The two CMS derivation helpers are **stateless modules, not classes**: they declare top-level functions and export one const object of them (`media` in `services/media/media-src.ts`, `view` in `services/cms/item-view.ts`). A component that needs one in a template holds it as a field — `readonly view = view`, `protected readonly media = media` — which resolves to the import, not to the field. `media` picks the url/thumbnail/alt/caption out of a nullable CMS upload; `view` derives what both detail pages show around their blocks (published date, estimated reading time, cover, author, initials) from an `Article | Review`.
- Both `HtmlBuilder` implementations turn stored copy into markup for `[innerHTML]`: `IndexHtmlBuilder` renders the `<<class1,class2,"text">>` mini-syntax in profile copy into `<span class="...">`, and `MarkdownHtmlBuilder` renders the Markdown in `shared.rich-text` bodies into `.prose` HTML (headings, lists, quotes, fenced code, rules, and inline emphasis/code/links). Both escape their input first; see their doc comments for the grammars. There is deliberately **no Markdown dependency** — adding one would mean a release version bump.
- `Reveal` (`shared/reveal.ts`, selector `appReveal`) is a scroll-in animation directive with an IntersectionObserver plus a 1.4s failsafe.

### Models

`src/app/models/cms/` mirrors the CMS payload shapes (`CollectionType<T>` = `{data, meta}`, `SingleType<T>`, `Article`, `Review`, `Blocks`, …) — fields are broadly `| null`, so components defensively default (`?? []`, fallback pagination objects). `Review` is structurally identical to `Article`, hence `item-view.ts`'s `Item = Article | Review`. `Cover` is the one media shape the CMS returns, so it also types author avatars and block files. `src/app/models/` root holds the profile API DTOs whose fields are snake_case (`first_name`), matching the backend.

### Styling

Tailwind v4 via PostCSS (`.postcssrc.json`), no `tailwind.config.js`. The entire theme (daisyUI-derived oklch palette, fonts, `--container-shell/read/list`) lives in the `@theme` block of `src/styles.css`. Classes generated only from data strings (e.g. those in `Colors`) need `@source inline(...)` entries there or they get purged. Per-component styles have a hard 8kB budget in production builds.

The `.prose` rules in the `@layer components` block of `src/styles.css` are hand-rolled — neither `@tailwindcss/typography` nor daisyUI is installed — and they are the styling contract for `MarkdownHtmlBuilder` output. Anything that builder can emit needs a rule there (that is why `ol` uses a CSS counter, the dash bullet is scoped to `ul > li`, and `pre code` resets the inline-code chrome).

### `design/`

Reference-only port of the original HTML/Angular design (different persona, Angular 17 idioms, mock data). It is excluded from ESLint and is not built — treat it as a visual spec, never import from it.

## Conventions

- Prettier: **no semicolons**, single quotes, `printWidth: 100`, `trailingComma: "none"`, `singleAttributePerLine` (HTML templates use the `angular` parser).
- Angular CLI's suffix-free naming: files are `articles.ts` / `articles.html` / `articles.css` / `articles.spec.ts` in a directory per page under `src/app/page/`, and classes are `Articles`, not `ArticlesComponent`.
- `tsconfig.json` enables `noPropertyAccessFromIndexSignature`, so route params/data must be read with brackets: `route.params['profileId']`.
- Most specs are the CLI-generated "should create" smoke tests; components under test that use `RouterLink` need `provideRouter([])` in the testing providers. Six of them (`articles`, `career`, `index`, `learn`, `profiles`, `profiles-item`) currently **fail**: `TestBed.createComponent` renders `<app-nav>`/`<app-footer>`, which read `profileId`/`profileNavi` off `ActivatedRoute.snapshot.data` — `Footer` dereferences `profileNavi.socials` non-optionally — and a bare `TestBed` has neither. The detail pages avoid this by driving the real router: see `articles-item.spec.ts` / `learn-item.spec.ts`, which use `RouterTestingHarness` with route `data`, so resolver data, `withComponentInputBinding()` and the nav shell all behave as they do at runtime.

## Release

`package.json` `version` is the source of truth. Pushing to `main` creates a GitHub release from the latest git tag, and `release.yml` fails the build if the tag (minus `v`) does not equal `package.json` version — bump the version and tag together. Release builds and pushes a Docker image (`Dockerfile`: Node build → nginx-unprivileged on :8080, `nginx.conf` provides the SPA `try_files` fallback).
