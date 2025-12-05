# Design Guidelines: Onboarding Constructor MVP

## Design Approach

**Selected System:** Linear/Notion-inspired productivity aesthetic
**Justification:** This is a utility-focused productivity tool requiring clarity, efficiency, and professional polish. The interface demands complex interactions (drag-and-drop, multi-level navigation, data visualization) where established patterns ensure usability.

**Key Design Principles:**
- **Clarity over decoration** - Every element serves a function
- **Purposeful hierarchy** - Clear visual relationships between elements
- **Spatial efficiency** - Dense but not cluttered information display
- **Predictable interactions** - Standard patterns for complex operations

---

## Typography

**Font Family:** 
- Primary: Inter (via Google Fonts)
- Monospace: JetBrains Mono (for API keys, JSON previews)

**Type Scale:**
- Page titles: text-2xl font-semibold (24px)
- Section headers: text-lg font-semibold (18px)
- Card titles: text-base font-medium (16px)
- Body text: text-sm (14px)
- Labels/captions: text-xs text-gray-600 (12px)
- Code/API keys: text-xs font-mono (12px)

**Hierarchy Rules:**
- All headings use semibold weight
- Body text uses regular weight
- Interactive elements (buttons, links) use medium weight
- Muted secondary text uses text-gray-600

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 3, 4, 6, 8, 12, 16**

**Application:**
- Component padding: p-4, p-6
- Card spacing: space-y-4
- Section gaps: gap-6, gap-8
- Page margins: px-6, py-8
- Tight groupings: gap-2, gap-3
- Large separations: mb-12, mt-16

**Grid System:**
- Dashboard lists: Single column on mobile, 2-3 columns on desktop (grid-cols-1 md:grid-cols-2 xl:grid-cols-3)
- Editor layout: Sidebar (w-80) + Main canvas (flex-1)
- Analytics: 2-4 column stat cards (grid-cols-2 lg:grid-cols-4)

**Container Strategy:**
- Main content: max-w-7xl mx-auto px-6
- Modals/drawers: max-w-2xl
- Forms: max-w-xl

---

## Component Library

### Navigation
- **Top Navigation Bar:** Fixed header with logo, project switcher (dropdown), user menu (avatar + dropdown)
- **Sidebar:** Collapsible left sidebar (w-64) with nested navigation for Projects → Onboardings → Screens

### Cards & Lists
- **Project Cards:** Rounded-lg border with hover:shadow-md transition, display name, creation date, onboarding count
- **Onboarding List Items:** Compact rows with name, version badge, status pill (draft/published), actions menu
- **Screen Cards (in editor):** Drag handles, thumbnail preview, title/description preview, edit/delete icons

### Forms & Inputs
- **Text Inputs:** Rounded-md border with focus:ring-2 focus:border-blue-500, label above with text-sm font-medium
- **Buttons:** 
  - Primary: Solid fill, rounded-md, px-4 py-2, font-medium
  - Secondary: Border outline, same padding
  - Danger: Red variant for delete actions
  - Icon buttons: Square p-2 for compact actions
- **Dropdowns:** Custom select with chevron icon, rounded-md border
- **Toggle/Status Pills:** Small rounded-full badges (draft: gray, published: green)

### Data Display
- **Tables:** Simple striped rows (even:bg-gray-50), sticky header, sortable columns with arrow icons
- **Stat Cards:** Bordered cards with large number (text-3xl font-bold), label below (text-sm text-gray-600)
- **Empty States:** Centered content with icon, heading, description, and CTA button

### Editor-Specific Components
- **Canvas Area:** Central workspace with dotted grid background (bg-gray-50 with subtle pattern)
- **Screen Preview Cards:** Mobile-frame-styled previews (w-80, aspect-[9/19.5] border-8 border-gray-800 rounded-3xl) showing title, description, image placeholder
- **Drag Drop Zone:** Clear drop indicators with dashed borders when dragging
- **Property Panel:** Right sidebar (w-96) with tabbed sections for screen properties

### Modals & Overlays
- **Modals:** Centered overlay with backdrop blur, max-w-2xl, rounded-lg shadow-xl
- **Drawers:** Slide-in from right (w-96), for quick edits without losing context
- **Toasts:** Top-right corner notifications with icons (success: green, error: red)

### Analytics Dashboard
- **Summary Cards:** 4-column grid showing total views, active onboardings, avg completion rate
- **Chart Containers:** Bordered cards with header (title + time range selector) and chart area
- **Screen Funnel:** Vertical step list showing view counts with percentage drop-off

---

## Animations

**Use sparingly:**
- Hover states: subtle scale (hover:scale-105) on interactive cards
- Modal entrance: fade + scale from center (duration-200)
- Dropdown menus: slide down (duration-150)
- Drag and drop: smooth position transitions (transition-transform)
- NO page transitions, NO scroll animations

---

## Images

**Hero Section:** NOT applicable - this is a dashboard application

**Image Usage:**
- **Project cards:** Optional thumbnail/icon (48x48 rounded)
- **Screen previews in editor:** Display user-provided image_url in mobile frame mockup
- **Empty states:** Simple illustrations (use Undraw or similar, single accent color)
- **Authentication pages:** Optional side panel with abstract gradient background (no complex imagery)

**Image Placement:**
- Onboarding screen previews: Centered within mobile frame mockup
- Empty state illustrations: Centered above text, max-w-xs