This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1) Install dependencies

- Node 18+ recommended
- Install packages

```bash
npm install
```

### 2) Database setup (Prisma + SQLite)

This project uses Prisma ORM with a local SQLite database for storing timelines and activities.

- Ensure `.env` contains:

```bash
DATABASE_URL="file:./dev.db"
```

- Generate the SQLite DB and Prisma Client:

```bash
npx prisma migrate dev --name init
```

This will create `dev.db` and generate the Prisma Client in `src/generated/prisma`.

- Optional: open Prisma Studio to inspect data

```bash
npx prisma studio
```

### 3) Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Notes

- API endpoints live under `src/app/api/timelines/route.ts`:
  - `GET /api/timelines` – list timelines with activities
  - `POST /api/timelines` – create timeline with activities snapshot
  - `PUT /api/timelines` – update timeline and replace activities snapshot
  - `DELETE /api/timelines?id=...` – delete a timeline
- Prisma schema is in `prisma/schema.prisma`.
- If you change the schema, run another migration:

```bash
npx prisma migrate dev --name <change>
```

- To switch to Postgres later, update `DATABASE_URL` and `datasource` in `prisma/schema.prisma`, then run a migration.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
