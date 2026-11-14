# HelpDesk Pro

A local support desk for a real queue: overdue work, owners, replies, internal notes, and a record of what changed.

Day-to-day use is in [docs/HOW-TO-USE.md](docs/HOW-TO-USE.md). There is no sign-in. Pick who you are in the sidebar.

## Setup

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Create `.env` if it is missing:

```
DATABASE_URL="file:./dev.db"
```

Then open [http://localhost:3000](http://localhost:3000). The seed loads 12 sample tickets so the overview is usable immediately.
