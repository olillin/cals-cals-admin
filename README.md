# Cal's Cals Admin

Admin page for [Cal's cals](https://cal.olillin.com), features updating the
calendar files from Google Calendar and scraping events from
<https://chalmers.it>.

## Development

```bash
pnpm install
pnpm prisma generate
docker compose up -d
pnpm prisma migrate dev
pnpm run dev
```

## Production build

Run the `compose.prod.yaml` file using
[Docker Compose](https://docs.docker.com/compose).
