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

**Note:** In the current infrastructure setup, Nginx exposes the backend via the API subdomain (for example: `https://api.vou-falar-com-meu-socio.lcdev.click`). If the frontend is making requests to `/api/*` as a relative path, you must ensure your reverse proxy routes `/api/*` to the backend, or update the frontend to call the API subdomain directly.

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
