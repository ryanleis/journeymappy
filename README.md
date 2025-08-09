# Journey Timeline (Next.js)

This is a Next.js App Router project for building and sharing visual timelines.

## One-line Automated Install

On macOS/zsh:

```bash
chmod +x scripts/install.sh && scripts/install.sh
```

This will:
- Ensure `.env` has `DATABASE_URL="file:./dev.db"`
- Install npm dependencies
- Run Prisma migrate (or generate if already migrated)

Then start the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

## Getting Started - Manual Install

### 1) Install dependencies

- Node 18+ recommended
- Install packages

```bash
npm install
```

No extra configuration is required for PDF (jspdf), PPTX (pptxgenjs), image export (html-to-image), or CSV/Excel imports (papaparse/xlsx); these are installed via npm.

### 2) Database setup (Prisma + SQLite)

This project uses Prisma ORM with a local SQLite database for storing timelines and activities.

- Ensure `.env` contains:

```bash
DATABASE_URL="file:./dev.db"
```

- Create the SQLite DB and generate the Prisma Client:

```bash
npx prisma migrate dev --name init
```

This will create `dev.db` and generate the Prisma Client.

- Optional: open Prisma Studio to inspect data

```bash
npx prisma studio
```

If you pull new schema changes later, run:

```bash
npx prisma migrate dev --name <change>
# or if no new migrations are needed
npx prisma generate
```

### 3) Run the development server

```bash
npm run dev
```

Open http://localhost:3000.

## Features

- Save and manage multiple timelines (Name + Last Modified)
- Two layouts: inline and outline
- Smart placement of activity boxes with collision avoidance and scroll-on-overflow
- Display Mode (press F to open, ESC to close)
- iOS-like styling with theming

### Share & Export (Share icon menu)
- Export to PDF (configurable layouts)
- Export to PowerPoint (PPTX) with timeline line, markers, connectors, and rounded activity boxes
- Export as PNG or JPG (captures the on-page timeline)
- Download as JSON, or generate a shareable link

### Import Activities (Import icon menu)
- Import from CSV or Excel (.xlsx/.xls)
- Import from JSON:
  - Either an array of activities, or
  - A Share export JSON containing an `activities` array
- Colors/themes in a Share JSON are auto-applied on import
- CSV template download provided

## API & Schema

- API routes: `src/app/api/timelines/route.ts`
  - GET /api/timelines – list timelines with activities
  - POST /api/timelines – create a timeline with activities snapshot
  - PUT /api/timelines – update timeline and replace activities snapshot
  - DELETE /api/timelines?id=... – delete a timeline
- Prisma schema: `prisma/schema.prisma`

## Shortcuts

- F – Open Display Mode
- ESC – Exit Display Mode

## Troubleshooting

- Prisma client errors after pulling changes:
  - Run `npx prisma generate` (or `npx prisma migrate dev` if schema changed)
- Image export captures the current timeline region; ensure the timeline is visible on the page.

## Deploy

Follow the Next.js deployment docs for your target platform. SQLite is file-based; for hosted environments consider switching to Postgres and updating `DATABASE_URL` accordingly, then run a migration.
