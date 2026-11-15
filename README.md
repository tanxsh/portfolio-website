# Portfolio — ISBA2438

A personal portfolio built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Scripts

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Dev server at http://localhost:3000           |
| `npm run build`   | Production build (also runs TypeScript check) |
| `npm run start`   | Serve the production build                    |
| `npm run lint`    | ESLint                                        |
| `npm test`        | Unit tests (Vitest)                           |

## Pages

| Route                          | What it shows                          |
| ------------------------------ | -------------------------------------- |
| `/`                            | Landing page                           |
| `/about-me`                    | Bio, skills, education                 |
| `/projects`                    | Project cards, linked from `src/data/projects.ts` |
| `/projects/[slug]`             | Project detail (unknown slugs get a friendly `not-found.tsx`) |
| `/contact-me`                  | Contact form posting to `/api/contact` |
| `/contact-me-server-form`      | Contact form posting to the API below  |

## Architecture

The contact form flow, top to bottom:

```
src/app/contact-me/page.tsx             ┐ pages (server components)
src/app/contact-me-server-form/page.tsx ┘
  └── src/components/ContactForm.tsx         form UI (client component)
        │  fetch POST with { name, email, message } to the endpoint prop
        │  (default /api/contact-server-form; /contact-me uses /api/contact)
        ▼
src/app/api/contact-server-form/route.ts ┐ route handlers (POST), thin
src/app/api/contact/route.ts             ┘ wrappers over shared logic
  └── src/lib/contactRequest.ts              shared POST handling: parse body,
        ├── src/lib/validateContact.ts       trims input, applies field rules,
        │                                    returns { valid, errors, data }
        │                                    400 with field errors if invalid
        └── src/lib/contactStore.ts          appends { id, name, email,
            │                                message, submittedAt }
            ▼
            data/contacts.json               storage; written atomically via a
                                             .tmp file + rename; a missing or
                                             empty file counts as [], while
                                             corrupt or non-array JSON throws
                                             (500 response, file untouched)
```

Notes:

- Pages live in `src/app` and use file-system routing; the shared `Navbar`
  (`src/components/Navbar.tsx`) is rendered by the root layout
  `src/app/layout.tsx`.
- Project content is data-driven from `src/data/projects.ts`;
  `/projects/[slug]` uses `generateStaticParams` for the known slugs and
  `notFound()` for anything else.
- Validation rules live only in `src/lib/validateContact.ts` (the server is
  the source of truth); `ContactForm` renders whatever errors the API returns
  and performs no client-side validation.
- `data/contacts.json` is runtime data and git-ignored.
- Blog posts live in `data/blogs.json` and are served by `/api/blogs`
  (`GET` returns posts newest-first and is never cached; `POST` creates one),
  handled by `src/lib/blogRequest.ts`. Both stores share the JSON file
  helpers in `src/lib/jsonFileStore.ts`.
