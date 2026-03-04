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
- User authentication page.
- Handles login with email and password.
- Integrates with backend `/auth/login`.
- Stores user data in local storage.

## Dashboard
`src/pages/Dashboard.tsx`
- Main authenticated application page.
- Includes profile completion modal when required fields are missing.
- Supports AI assistance for required profile fields via the backend `/ai/profile/help-required` endpoint.

## Profile
`src/pages/Profile.tsx`
- User profile management.
- Allows viewing and editing personal and professional information.
- Includes AI assistance for profile enhancement.

## Projects
`src/pages/Projects.tsx`
- Lists user projects.
- Allows creating new projects and importing existing ones.
- Provides search and sorting functionality.

## Project Details
`src/pages/ProjectDetails.tsx`
- Detailed view of a specific project.
- Organized into phases: Reconnaissance, Hat-Trick, Delivery.
- Contains tabs for various project modules (Discovery, Architecture, Engineering, etc.).
- Allows generating project stages via AI.
- The Structured Discovery tab includes: a scrollable project description panel, a 40vh chat panel, and the generated discovery output (or an empty-state warning).

## Settings
`src/pages/Settings.tsx`
- Application settings page.
- Currently a placeholder for future configuration options.
