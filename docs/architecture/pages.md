# Pages Documentation

## Home
`src/pages/Home.tsx`
- The landing page of the application.
- Composed of Hero, Stats, Features, Pricing, and Contact sections wrapped in MainLayout.

## Signup
`src/pages/Signup.tsx`
- User registration page.
- Contains a form with fields: Name, Professional Title, Email, Password.
- Integrates with the backend `/auth/signup` endpoint.
- Redirects to Login page upon successful registration.

## Login
`src/pages/Login.tsx`
- User authentication page (implementation pending).

## Dashboard
`src/pages/Dashboard.tsx`
- Main authenticated application page.
- Includes profile completion modal when required fields are missing.
- Supports AI assistance for required profile fields via the backend `/ai/profile/help-required` endpoint.
