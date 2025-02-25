# Ceevee UI

React Router based UI application for Ceevee project.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 🔄 React Router for routing

## Development

### Installation

```bash
  yarn install
```

### Local Development

```bash
  yarn dev
```

Your application will be available at `http://localhost:3000`.

### Production Build

```bash
  yarn build
```

## Docker Operations

Build and run the UI container:
```bash
  docker compose up --build -d ceevee-ui
```

Stop the UI container:
```bash
  docker compose down ceevee-ui
```

View UI logs:
```bash
  docker logs ceevee-ui --tail=100
```

Access container shell:
```bash
  docker compose exec ceevee-ui sh
```

## Environment Variables

Create `.env` file based on `.env.example` for local development or `.env.docker` for Docker deployment.