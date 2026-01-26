# Frontend (Nuxt 3)
This folder contains the Nuxt 3 frontend for SeatSystem.

## Prerequisites
- Node.js >= 18 and npm

## Install & run (development)
````
cd frontend
npm install
npm run dev
````

## Linting & formatting
````
cd frontend
npm run lint
npm run lint:fix
npm run format
````

## Notes
- The app uses Nuxt 3, Pinia for state, TailwindCSS for styles.
- API requests are in `services/api.ts` — update base URL if backend runs on a different host/port.

# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
