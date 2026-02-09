# Environment Setup

This project uses Vite's environment variable handling.

## Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

## Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL of the Backend API. | `http://localhost:3000/api` |

**Note:** In the Docker Compose environment, requests to `/api` are proxied by Nginx to the backend container, so the frontend usually communicates with the relative path `/api` or the full public URL.

## Vite Configuration (`vite.config.ts`)
The `server.allowedHosts` configuration has been updated to allow the public domain:
```typescript
allowedHosts: [
  'frontend',
  'localhost',
  '127.0.0.1',
  'vou-falar-com-meu-socio.lcdev.click'
]
```
This is necessary to prevent "Blocked request" errors when accessing the frontend via the public domain.
