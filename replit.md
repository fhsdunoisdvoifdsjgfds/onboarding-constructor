# Onboarding Constructor MVP

A web-based visual editor for creating mobile app onboarding screens with drag-and-drop functionality, version control, and analytics.

## Overview

This application allows users to:
- Create and manage projects with auto-generated API keys
- Build onboarding flows with multiple screens using a drag-and-drop editor
- Publish onboardings and serve them via a public API for Flutter apps
- Track screen view analytics

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Shadcn UI
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Drag & Drop**: @dnd-kit library

## Project Structure

```
├── client/src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Shadcn UI components
│   │   ├── app-sidebar.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── pages/           # Page components
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── projects.tsx
│   │   ├── project-detail.tsx
│   │   ├── onboarding-editor.tsx
│   │   └── analytics.tsx
│   ├── lib/
│   │   ├── auth.tsx     # Auth context and hooks
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── hooks/
│   └── App.tsx          # Main app with routing
├── server/
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database storage layer
│   ├── db.ts           # Database connection
│   └── vite.ts         # Vite integration
├── shared/
│   └── schema.ts        # Database schemas and types
└── design_guidelines.md # Design system documentation
```

## Database Schema

- **users**: id, email, password, createdAt
- **projects**: id, userId, name, publicApiKey, createdAt
- **onboardings**: id, projectId, name, version, status (draft/published), createdAt, updatedAt
- **screens**: id, onboardingId, type, title, description, imageUrl, order, createdAt
- **analyticsEvents**: id, onboardingId, onboardingVersion, screenIndex, timestamp, createdAt

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Projects (JWT required)
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Onboardings (JWT required)
- `GET /api/projects/:id/onboardings` - List onboardings
- `POST /api/projects/:id/onboardings` - Create onboarding
- `GET /api/onboardings/:id` - Get onboarding with screens
- `PATCH /api/onboardings/:id` - Update onboarding
- `DELETE /api/onboardings/:id` - Delete onboarding
- `POST /api/onboardings/:id/publish` - Publish onboarding
- `GET /api/onboardings/:id/analytics` - Get analytics

### Screens (JWT required)
- `POST /api/onboardings/:id/screens` - Add screen
- `PATCH /api/screens/:id` - Update screen
- `DELETE /api/screens/:id` - Delete screen
- `PATCH /api/onboardings/:id/reorder` - Reorder screens

### Public API (No auth required)
- `GET /api/public/onboarding?api_key=XXX` - Get published onboarding config
- `POST /api/public/event` - Record analytics event

## Public API Usage (Flutter Integration)

### Get Onboarding Configuration
```
GET /api/public/onboarding?api_key=YOUR_API_KEY

Response:
{
  "version": 3,
  "screens": [
    {
      "type": "default",
      "title": "Welcome",
      "description": "Welcome to our app",
      "image_url": "https://..."
    }
  ]
}
```

### Send Analytics Event
```
POST /api/public/event
Content-Type: application/json

{
  "api_key": "YOUR_API_KEY",
  "onboarding_version": 3,
  "screen_index": 0,
  "timestamp": 1234567890
}
```

## Running the Application

The application runs on port 5000. Use the "Start application" workflow which runs:
```bash
npm run dev
```

## Database Commands

- `npm run db:push` - Push schema changes to database
- `npm run db:push --force` - Force push schema changes

## Features

1. **User Authentication**: Email/password registration and login with JWT
2. **Project Management**: Create, rename, delete projects with auto-generated API keys
3. **Onboarding Editor**: Drag-and-drop screen ordering with title/description/image editing
4. **Version Control**: Draft/published statuses with auto-increment versioning
5. **Public API**: REST endpoints for Flutter app integration
6. **Analytics**: Screen view tracking and funnel visualization
7. **Dark Mode**: Full dark/light theme support

## Design System

The app follows Linear/Notion-inspired productivity aesthetic with:
- Inter font for UI, JetBrains Mono for code/API keys
- Consistent spacing (2, 3, 4, 6, 8 Tailwind units)
- Mobile preview in editor showing screen content
- Subtle hover states and smooth transitions
