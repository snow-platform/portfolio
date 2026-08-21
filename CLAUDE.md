# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

No toolchain manager is checked in — `mise.toml` was removed in `de8ae83` and its `.gitignore` entry in `e4e1b59`, so `npm` scripts run against whatever `node` is on `PATH` (`README.md` still tells you to `mise install`; ignore it). CI (`checks.yml`) and the `Dockerfile` both build on Node 26; `release-create.yml`'s check job still says Node 22.

```bash
npm start                        # dev server, development configuration (points at https://localhost:7121)
npm run start:prod               # dev server against the production API
npm run build                    # production build → dist/portfolio-ui/browser
npm test -- --watch=false        # single test run (watch defaults to true in a TTY)
npm run lint                     # eslint . ; lint:fix to autofix
npx prettier --check <paths>     # no npm script, and NOT a CI gate — see below
```

CI (`checks.yml` → `snow-platform/workflows/.../default-check-node.yml@main`) runs exactly `npm run lint`, `npm run test`, `npm run build` — **no Prettier step**, and the tree is not Prettier-clean (`npx prettier --check src` warns on ~35 files; 65 repo-wide with `design/`). So format only the files you touch and never run `prettier --write .`, which would bury the change in an unrelated reformat. Note also that `checks.yml` is `branches-ignore: main`: a push straight to `main` skips it and is checked only by `release-create.yml`'s own check job.

Running a subset of tests (`@angular/build:unit-test`, Vitest runner, jsdom environment):

```bash
npm test -- --watch=false --include src/app/page/articles/articles.spec.ts
npm test -- --watch=false --filter '^Articles'    # regex over suite/test names
```

## Architecture

Angular 22 standalone application, zoneless-style, no NgModules. Data comes from an external profile API (`environment.api.url`); `src/environments/environment.development.ts` is swapped in by the `development` build configuration.

`tsconfig.json` never turns on `strict` (nor `strictTemplates`) — only the `noImplicit*` / `noPropertyAccessFromIndexSignature` family plus `strictInjectionParameters`. `strictNullChecks` is therefore **off**, which is why the pervasive `| null` on the CMS models compiles even where nothing narrows it: the defensive `?? []`, `?.` and fallback objects throughout the pages are a hand-maintained convention, not something the compiler is enforcing. Keep writing them, and expect a large error surface if `strict` is ever switched on.

Two things that look missing but are not. `app.config.ts` never calls `provideHttpClient()` — in Angular 22 the whole chain (`HttpClient` → `HttpHandler` → `FetchBackend`) is `providedIn: 'root'`, so `ProfileApi`'s `inject(HttpClient)` resolves without it; add it only when interceptors or XSRF config are needed. And `App` (`app.ts`) renders **either** the loading spinner **or** `<router-outlet>`, keyed on `router.currentNavigation()` — page content does not exist in the DOM mid-navigation, which is why router-driven specs must await the navigation before querying.

### Route → resolver → component-input pipeline

This is the central pattern and spans several files. `provideRouter(..., withComponentInputBinding())` in `app.config.ts` means **resolved route data is bound directly to component `input.required()` signals by key name**. To add a page:

1. Add a method to `ProfileApi` (`src/app/services/api/profile-api/profile-api.ts`) — the single HTTP surface, URLs built as `${environment.api.url}/api/${environment.api.version}/...` (`getProfilesCard` is the one exception, it hardcodes `/api/v1/`).
2. Add a `ResolveFn` in `src/app/resolvers/profile-resolver/` that `inject(ProfileApi)`s and reads `route.params['profileId']`.
3. Register it in `app.routes.ts` under `resolve: { someKey: someResolver }`.
4. Declare `readonly someKey = input.required<T>()` in the component — the names must match.

Every profile route also spreads `profileProfileResolver` (`profileId` + `profileNavi`). `Nav` and `Footer` do **not** take inputs; they read `profileId`/`profileNavi` off `ActivatedRoute.snapshot.data`, so any page rendering `<app-nav>` must resolve those keys. The two routes with no profile in scope resolve neither key and use the shell-free variants instead — that is the whole reason those exist: `/profiles` renders `NavEmpty` + `FooterEmpty`, `/404` renders `FooterEmpty` and no nav at all.

`withNavigationErrorHandler` redirects **any** resolver failure to `/404`, which makes API/DI errors look like a routing problem — check the console for the logged original error before assuming the route is wrong.

`indexRandomRedirect` (`src/app/redirectFn/`) sends `/` to either `/profiles` or a hard-coded profile id at random.

### Block rendering (article and review bodies)

The body of a single article or review is the CMS dynamic zone in `data.blocks`. `Blocks` (`src/app/models/cms/blocks.ts`) is a union discriminated on `__component` — `shared.rich-text`, `shared.quote`, `shared.slider`, `shared.media`. Two rules follow from the payload: the **array order is the authored order**, so render by index (`id` is a per-component-type sequence and says nothing about position), and **any type may appear at any index**, so dispatch on `__component` rather than position.

`shared/block-list` (`app-block-list`, input `blocks`) owns that dispatch. It maps each block to a `BlockView` in a `computed()`, dropping blocks the CMS left empty (a `shared.media` with `file: null` is normal), and exposes `asViewText`/`asViewQuote`/`asViewSlider`/`asViewMedia` narrowing accessors so the template stays type-safe without relying on `@switch` narrowing. Inter-block spacing belongs to its container (`gap-8`), which is why `.prose > :first-child` / `:last-child` zero out edge margins. `shared/slider` (`app-slider`) renders the `shared.slider` files one at a time with wrap-around navigation.

The `shared.rich-text` body is Markdown, rendered with **`marked`** (a real dependency, `^18`) called directly in `block-list.ts` as `marked.parse(block.body, { async: false })` — the synchronous overload, because the mapping happens inside a `computed()`. Its output goes to `[innerHTML]`, so Angular's sanitizer is what strips unsafe markup; `marked` is not configured to sanitize.

Every page reads the live API — the design's mock data (`src/app/data/portfolio.ts`) is gone. `shared/pagination` still uses `@Input`/`@Output` decorators while everything else uses signal inputs, and its `onChange` is not wired by any of the three list pages that render it — the control renders and clamps but changes nothing. Paging is unwired at the other end too: the list resolvers call `getProfileArticles(id)` / `getProfileLearnings(id)` with no page argument, so the API's `page = 1, size = 10` defaults always apply. Making pagination work means touching both ends (a query param the resolver reads, plus the page's `onChange`). Its `current` getter is also misnamed: it returns the page _count_ (`ceil(total / size)`), not the current page.

### Services and helpers

- `@Service()` (Angular 22) replaces `@Injectable({providedIn:'root'})` for DI-registered services — used by `ProfileApi` and `IndexHtmlBuilder`.
- `Accent` and `DateStr` are **plain classes instantiated inline in components** (`new Accent(Colors.text)`), not injected. `Accent` and the `Colors` class-list table live together in `services/color/accent.service.ts` — the one file that kept the old `.service.ts` suffix. `Accent.color` is a stateful round-robin over a Tailwind class list, so each read advances the cycle — that is the intent for per-item accent coloring. Because each read advances it, do not bind `accent.color` on a single-item page; use a literal class.
- The two CMS derivation helpers are **stateless modules, not classes**: they declare top-level functions and export one const object of them (`media` in `services/media/media-src.ts`, `view` in `services/cms/item-view.ts`). A component that needs one in a template holds it as a field — `readonly view = view`, `protected readonly media = media` — which resolves to the import, not to the field. `media` picks the url/thumbnail/alt/caption out of a nullable CMS upload; `view` derives what both detail pages show around their blocks (published date, estimated reading time, cover, author, initials) from an `Article | Review` — reading time counts words in the `shared.rich-text` blocks only, at 200 wpm, and returns `''` when there are none; `initials` needs a two-word author name and falls back to `'@@'`.
- `IndexHtmlBuilder` is the only `HtmlBuilder` implementation: it renders the `<<class1,class2,"text">>` mini-syntax stored in profile copy into `<span class="...">` markup for `[innerHTML]`; see its doc comment for the grammar. It splits on spaces, so a marker can never contain one — a space **inside** the quoted text is written `<>` and substituted back (`A <<text-primary,"one<>two">> b`). Malformed markers render as a literal `<<Error Parsing = …>>` rather than throwing. Article/review Markdown does **not** go through this interface — it goes through `marked` in `block-list.ts`.
- `Reveal` (`shared/reveal.ts`, selector `appReveal`) is a scroll-in animation directive with an IntersectionObserver plus a 1.4s failsafe.

### Models

`src/app/models/cms/` mirrors the CMS payload shapes (`CollectionType<T>` = `{data, meta}`, `SingleType<T>`, `Article`, `Review`, `Blocks`, …) — fields are broadly `| null`, so components defensively default (`?? []`, fallback pagination objects). `Review` is `Article` plus `meaning`, so `item-view.ts`'s `Item = Article | Review` covers everything else. `meaning` is the only field that diverges, and the only one the pages treat differently: the learn card and the learn detail page render it (the card truncates it to one line with `truncate` + `min-w-0`), the article pages have nothing equivalent. Tags are gone from both types — the CMS may still send a `tags` array, but nothing in `src/` models or renders it, and `src/app/models/cms/tag.ts` is now unreferenced. `Cover` is the one media shape the CMS returns, so it also types author avatars and block files. `src/app/models/` root holds the profile API DTOs whose fields are snake_case (`first_name`), matching the backend.

### Styling

Tailwind v4 via PostCSS (`.postcssrc.json`), no `tailwind.config.js`. The entire theme (daisyUI-derived oklch palette, fonts, `--container-shell/read/list`) lives in the `@theme` block of `src/styles.css`. Tailwind scans the `.ts` sources, so the class lists in `Colors` survive — they appear there as literals. What needs an `@source inline(...)` entry is a class that only ever arrives in **API copy**, i.e. the classes named inside `IndexHtmlBuilder`'s `<<…>>` markers; the two entries currently there (`line-through`, `text-white`) exist for exactly that and appear nowhere in `src/`. Per-component styles have a hard 8kB budget in production builds.

The `.prose` rules in the `@layer components` block of `src/styles.css` are hand-rolled — neither `@tailwindcss/typography` nor daisyUI is installed — and they are the styling contract for **`marked`'s** output. Anything `marked` can emit needs a rule there (that is why `ol` uses a CSS counter, the dash bullet is scoped to `ul > li`, and `pre code` resets the inline-code chrome). Both lists are `list-none` with the marker drawn as an absolutely positioned `::before` on a `relative` `li`; that is deliberate, so whatever `marked` nests inside an `<li>` — a sublist, the `<p>` of a loose list, inline `<strong>`/`<code>` — flows inside the item instead of becoming a sibling of the marker. Two leftovers from the hand-written builder that `marked` replaced: the block comment above the rules still credits `MarkdownHtmlBuilder`, and the `.prose pre .tok-k/.tok-s/.tok-c` syntax-highlight rules are dead — `marked` emits no `tok-*` classes.

### `design/`

Reference-only port of the original HTML/Angular design (different persona, Angular 17 idioms, mock data). It is excluded from ESLint and is not built — treat it as a visual spec, never import from it.

## Conventions

- Prettier: **no semicolons**, single quotes, `printWidth: 100`, `trailingComma: "none"`, `singleAttributePerLine` (HTML templates use the `angular` parser).
- Angular CLI's suffix-free naming: files are `articles.ts` / `articles.html` / `articles.css` / `articles.spec.ts` in a directory per page under `src/app/page/`, and classes are `Articles`, not `ArticlesComponent`.
- `tsconfig.json` enables `noPropertyAccessFromIndexSignature`, so route params/data must be read with brackets: `route.params['profileId']`.
- Two naming traps: the 404 page's class is `Error` (it shadows the global inside `app.routes.ts`, which imports it), and the index page is imported as `./page/index` — directory-index resolution to `page/index/index.ts`, not a barrel file. `src/app/tokens/index-profile.ts` is unused outside its own spec; the hard-coded profile id lives in `indexRandomRedirect` and in `Error`, not in that token.
- Specs for the leaf components are still the CLI-generated "should create" smoke tests; those that use `RouterLink` need `provideRouter([])` in the testing providers.
- **Every page spec drives the real router instead of a bare `TestBed`** — `npm test -- --watch=false` is 47 passed across 13 files. A bare `TestBed` cannot render a page: `Footer` dereferences `snapshot.data['profileNavi'].socials` non-optionally (`TypeError: … reading 'socials'`), `Nav` reads `profileId`/`profileNavi` the same way, and the `input.required()` keys arrive only through `withComponentInputBinding()`. So each page spec registers its own route carrying the `data` its resolvers would have produced (`profileId`, `profileNavi`, plus the page's own key) and navigates to it with `RouterTestingHarness`. Fixtures are inline module consts, typed through `as unknown as T`, trimmed to the fields the template reads.
- The detail-page specs show the same shape: `articles-item.spec.ts` / `learn-item.spec.ts` drive the real router via `RouterTestingHarness` with route `data`, so resolver data, `withComponentInputBinding()` and the nav shell all behave as they do at runtime. Fixtures are inline in the spec — trimmed copies of the `sample/article.json` / `sample/review.json` CMS payloads, which were never tracked and are no longer on disk, so treat the specs themselves as the record of the payload shape. Each also has a `bare` fixture (nothing optional filled in) served from its own route, so the fallbacks — author initials, no cover, no blocks, no `meaning` panel — are covered by navigating instead of by a second `TestBed`.
- Those two specs assert block _order_ through a `kinds()` helper that classifies each child of the `app-block-list` column, which is what pins the "render by array index, dispatch on `__component`" contract. `meaning` is the field the review pages render and the article pages do not, so `learn-item.spec.ts` and `learn.spec.ts` set it on their fixtures deliberately — it is what makes the two otherwise-parallel detail specs differ.

## Release

`package.json` `version` is the source of truth. Pushing to `main` (`release-create.yml`) creates a GitHub release from the latest git tag; publishing that release triggers `release.yml`, which first fails the build if the tag minus `v` does not equal `package.json` version — bump the version and tag together. (That check is its own reusable workflow, `release-check-version.yml`, called by `release.yml`.) It then builds and pushes a Docker image to `ghcr.io/<repo>-ui` (`Dockerfile`: Node build → nginx-unprivileged on :8080, `nginx.conf` provides the SPA `try_files` fallback) and deploys it with `docker compose up -d` on the self-hosted `desperation` runner. `docker-compose.yml` pins `ghcr.io/snow-platform/portfolio-ui:${VERSION}` and joins the pre-existing external `proxy` network, so a local `docker compose up` needs `VERSION` set and that network to exist. Its `build.platforms: [linux/amd64, linux/arm64]` applies only to that local build path — the CI `docker/build-push-action` step sets no `platforms`, so the published image is single-arch for the runner.
