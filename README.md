# beast.docs

The documentation site for [Beast](https://github.com/phtn/beast), the
indentation-first component language that compiles `.btsx` into
[TSRX](https://tsrx.dev/) for [Octane](https://octanejs.dev/).

The site is itself a Beast app: pages and components are authored in BTSX,
compiled by `beast-tsrx`, and bundled with Rspack.

## Getting started

```bash
bun install
bun run dev
```

The dev server runs at <http://localhost:8080>.

| Script              | What it does                                         |
| ------------------- | ---------------------------------------------------- |
| `bun run dev`       | Start the Rspack dev server with HMR                 |
| `bun run build`     | Production build into `dist/`                        |
| `bun run size`      | Print raw, gzip, and brotli sizes of `dist/`         |
| `bun run build:size`| Build, then print sizes                              |
| `bun run preview`   | Serve a production-mode build locally                |
| `bun run deploy`    | Build and deploy to Cloudflare with Wrangler         |
| `bun run typecheck` | Type-check `.ts` sources with `tsrx-tsc`             |
| `bun run check`     | `typecheck` followed by `build`                      |

## Stack

- **Language:** BTSX via [`beast-tsrx`](https://www.npmjs.com/package/beast-tsrx), compiled to TSRX
- **Runtime:** `octane`
- **Routing:** a small History API router in `src/lib/router.ts`
- **Bundler:** Rspack (`beastOctane()` adapter from `beast-tsrx/rspack`)
- **Styling:** Tailwind CSS v4 plus hand-written CSS in `src/style.css`
- **Code highlighting:** highlight.js with custom BTSX and TSRX grammars
- **Fonts:** Geist and Geist Mono from Google Fonts (loaded in `index.html`)

## Project layout

```text
index.html                 HTML shell, font links, favicon
rspack.config.ts           Bundler config, output hashing, chunk splitting
wrangler.jsonc             Cloudflare Workers static-assets config
public/                    Static files copied to the site root (icons, _headers)
src/
  main.ts                  App mount
  Root.btsx                Picks the page for the current path, lazy-loaded
  App.btsx                 Landing page (/)
  pages/docs.btsx          Docs page renderer (/docs and /docs/*)
  components/              Header, sidebar, search, code blocks, footer, …
  lib/
    navigation.ts          Sidebar/header navigation, search index, GitHub URL
    docs.ts                All documentation page content
    btsx-hljs.ts           highlight.js setup with BTSX/TSRX grammars
    router.ts              usePathname, navigate, route chunk loaders
    release.ts             Latest Beast release lookup (GitHub API)
    icons/                 SVG icon set and the <Icon> component
```

## Writing docs

Documentation content is data, not markup. Every page lives in `docPages` in
[`src/lib/docs.ts`](src/lib/docs.ts), keyed by its slug (`''` is `/docs`,
`'get-started'` is `/docs/get-started`):

```ts
'get-started': {
  slug: 'get-started',
  eyebrow: 'Get started',
  title: 'Quick start',
  description: 'Scaffold a typed Beast and Octane application.',
  sections: [
    {
      id: 'requirements',
      title: 'Requirements',
      paragraphs: ['Use `bun` or Node.js 22 or newer.'],
      code: { filename: 'Terminal', language: 'bash', code: 'bun create beast@latest my-app' },
      table: { headers: ['Option', 'Effect'], rows: [['`--no-git`', 'Skip git init']] },
      note: { title: 'Alpha software', body: 'APIs may change.', tone: 'warning' }
    }
  ]
}
```

- Text in `paragraphs`, `list`, table cells, and `note.body` supports inline
  code with backticks.
- A section can also have a `list`, a `thumbnail`, and an `external` link.
- To show a page in the sidebar, search, and previous/next links, add it to
  `navigation` in [`src/lib/navigation.ts`](src/lib/navigation.ts). The page
  order follows that list.
- Code block languages: `btsx`, `tsrx`, `ts`/`tsx`/`js`, `css`, `json`,
  `html`/`xml`, and `bash`/`sh`. Use `text` for no highlighting.

The Beast version shown in the hero, sidebar, footer, and status panel is the
`latest` version of `beast-tsrx` on npm, fetched in the browser. Until that
loads, or if it fails, the site shows the `beast-tsrx` version installed at
build time (injected as `__BEAST_VERSION__`). GitHub isn't used: the repo has
no Releases and its tags are behind npm.

## Bundle and code splitting

The production build is split so that visitors download only what their page
needs:

| Chunk        | Contents                                              | Loaded           |
| ------------ | ----------------------------------------------------- | ---------------- |
| `main`       | Mount and router                                      | Always           |
| `framework`  | `octane` runtime                                      | Always           |
| (shared)     | Site shell: header, sidebar, search, icons, footer    | Always           |
| `home`       | Landing page                                          | On `/`           |
| `docs`       | Docs renderer and all page content                    | On `/docs/*`     |
| `highlight`  | highlight.js and the BTSX/TSRX grammars               | After first paint |

- `Root.btsx` lazy-loads each page with Octane's `lazy` and `Suspense`. `Link`
  preloads the target page's chunk on hover or focus.
- Code blocks render as plain text first and are highlighted once the
  `highlight` chunk arrives.
- Every file name carries a content hash, so `framework` stays cached across
  content-only deploys.
- Shell components import from `lib/navigation.ts`, not `lib/docs.ts`. Keep it
  that way, or all the docs content moves back into the initial load.

The build has no size warnings. `framework` is about 220 KiB minified (68 KiB
gzipped), under Rspack's 300 KiB limit. The site uses its own router instead
of `@octanejs/tanstack-router`, which added about 135 KiB. If you need nested
layouts, loaders, or search-param state later, that's the trade-off to revisit.

## Deployment

The site deploys to Cloudflare Workers as static assets, configured in
[`wrangler.jsonc`](wrangler.jsonc):

- `assets.directory` is `./dist`, so only the build output is uploaded.
- `not_found_handling: "single-page-application"` serves `index.html` for
  client-side routes like `/docs/language`.
- `public/_headers` is copied into `dist/` and marks the content-hashed JS and
  CSS as immutable.

In the Cloudflare dashboard, use:

| Setting        | Value                |
| -------------- | -------------------- |
| Build command  | `bun run build`      |
| Deploy command | `npx wrangler deploy` |

`wrangler` is a pinned dev dependency, so the deploy command uses the installed
copy instead of downloading it on each build. To deploy from your machine, run
`bun run deploy`. Everything in `public/` is
copied to the site root on build. Assets are requested from `/`, so deploy the
site at the domain root.

## BTSX gotchas

A few things came up while building this site:

- **Setup can't `await`.** Load async data in `useEffect` or through a hook (see
  `useBeastRelease` in `src/lib/release.ts`).
- **Don't use a bare text line as the whole `if`/`else` branch inside `each`.**
  Octane renders a lone `| #{text}` there as nothing. Wrap it in an element
  (`span #{text}`) or use a ternary.
- **Use `Link` for internal pages.** `src/components/link.btsx` takes `to` and
  navigates without a full page load. For external URLs, use a plain `a`.
- **Use `onInput` for text fields.** In Octane, `onChange` fires on commit, not
  on every keystroke.

Record notable changes in [CHANGELOG.md](CHANGELOG.md).
