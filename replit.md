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
│   │   ├── widget-editor/ # Widget editor system
│   │   │   ├── index.tsx
│   │   │   ├── widget-types.ts
│   │   │   ├── widget-palette.tsx
│   │   │   ├── widget-properties.tsx
│   │   │   ├── widget-renderer.tsx
│   │   │   └── sortable-widget-list.tsx
│   │   ├── ab-analytics.tsx
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
3. **Onboarding Editor**: Professional drag-and-drop widget editor with mobile preview
4. **Widget System**: 9 widget types (text, image, button, spacer, icon, container, lottie, divider, video)
5. **Layer Controls**: Z-index control, visibility toggle, lock functionality
6. **Advanced Styling**: Shadows, borders, gradients, opacity, padding/margin controls
7. **Google Fonts**: Full integration with font family and weight selection
8. **Version Control**: Draft/published statuses with auto-increment versioning
9. **Public API**: REST endpoints for Flutter app integration
10. **A/B Analytics**: Screen funnel visualization, conversion rates, variant comparison
11. **Dark Mode**: Full dark/light theme support with status-based badge colors

## Widget Types

- **Text**: Rich text with Google Fonts, alignment, colors, letter spacing
- **Image**: URL-based images with object-fit, width/height controls
- **Button**: Customizable buttons with variants, actions, border radius
- **Spacer**: Adjustable vertical spacing
- **Icon**: Lucide icons with size and color customization
- **Container**: Layout containers with flex direction and gap
- **Lottie**: Animation support with loop, autoplay, speed controls
- **Divider**: Horizontal separators with color, thickness, style options
- **Video**: URL-based video with autoplay, muted, loop controls

## Widget Properties

Each widget supports:
- **Name**: Display name in layer list
- **Order & Z-Index**: Layer positioning controls
- **Visibility**: Show/hide toggle
- **Lock**: Prevent accidental edits
- **Padding/Margin**: Spacing controls (top, right, bottom, left)
- **Shadow**: Box shadow with blur, spread, color, offsets
- **Border**: Width, style (solid/dashed/dotted), color, radius
- **Gradient**: Direction, start/end colors
- **Opacity**: Transparency control (0-100%)

## Design System

The app follows RevenueCat/Linear-inspired professional aesthetic with:
- Inter font for UI, JetBrains Mono for code/API keys
- Status badges with color differentiation (green=published, amber=draft)
- Collapsible sections in properties panel
- Mobile device frame preview in editor
- Consistent spacing (2, 3, 4, 6, 8 Tailwind units)
- Subtle hover states and smooth transitions
