---
name: Nexus Enterprise
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1440px
---

## Brand & Style
The design system is engineered for high-utility HR Management Systems, prioritizing clarity, trust, and efficiency. It adopts a **Corporate Modern** aesthetic—a balance of professional reliability and contemporary SaaS fluidity. The visual language is designed to handle high data density without overwhelming the user, employing generous whitespace within functional containers and a systematic approach to information hierarchy. 

The target audience includes HR administrators, department heads, and employees who require quick access to complex information. The emotional response is one of "organized calm"—users should feel that the platform is powerful enough to manage global workforces while remaining intuitive and accessible.

## Colors
This design system utilizes a structured palette to differentiate between actions, statuses, and data categories. 

- **Primary (Corporate Blue):** Used for main actions, navigation states, and branding. It conveys authority and stability.
- **Secondary (Teal):** Used for accent elements, growth-related metrics, and secondary interactive components to provide visual variety without breaking professionalism.
- **Semantic Colors:** Success, Warning, and Danger are reserved strictly for status indicators, validation feedback, and critical alerts.
- **Neutral Palette:** A sophisticated range of cool grays (from `Slate-50` to `Slate-900`) is used for borders, text, and surfaces to maintain high contrast and readability in both light and dark modes.

## Typography
The system relies on **Inter**, a typeface optimized for screen readability and high-density interfaces. 

- **Hierarchy:** We use font weight (Medium 500 and Semi-bold 600) rather than excessive size increases to denote hierarchy, keeping the layout compact.
- **Readability:** Body text is set at 14px or 16px to ensure long-form data entry and reading do not cause eye strain.
- **Labels:** `label-sm` is utilized for table headers and small captions, using uppercase with slight letter spacing to differentiate it from interactive body text.

## Layout & Spacing
The design system employs a **12-column fluid grid** for main content areas, with a max-width of 1440px to prevent excessive line lengths on ultra-wide monitors.

- **Spacing Rhythm:** Based on a 4px baseline grid. Most components use `16px (md)` padding for standard density and `8px (sm)` for high-density data views.
- **Sidebar:** A fixed-width navigation sidebar (256px expanded, 64px collapsed) persists on the left.
- **Breakpoints:**
  - **Mobile (<768px):** Single column, margins reduced to 16px, navigation moves to a bottom bar or hamburger menu.
  - **Tablet (768px - 1024px):** Condensed sidebar, 2-column grid for cards.
  - **Desktop (>1024px):** Full sidebar, 12-column grid, 32px outer margins.

## Elevation & Depth
Depth is created through **Tonal Layers** and subtle shadows rather than heavy skeuomorphism. 

- **Level 0 (Background):** `bg-light` (#F8FAFC) or `bg-dark` (#0F172A).
- **Level 1 (Cards/Surface):** Pure white (light mode) or Slate-800 (dark mode) with a 1px border (#E2E8F0 / #1E293B). 
- **Level 2 (Interactive/Floating):** Used for dropdowns and tooltips. These feature an **Ambient Shadow**: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`.
- **Level 3 (Modals):** High-diffusion shadow to pull the element forward, with a backdrop blur (8px) on the obscured content.

## Shapes
The shape language is **Soft (0.25rem)**. This provides a professional, "buttoned-up" look that feels modern but avoids the playfulness of fully rounded UI.

- **Standard Elements:** 4px (0.25rem) radius for buttons, input fields, and small tags.
- **Large Elements:** 8px (0.5rem) radius for cards, modals, and containers.
- **Avatars:** Circular (9999px) to provide a soft organic contrast against the structured grid.

## Components
Consistent styling across the HRMS ensures a low learning curve for complex tasks.

- **High-Density Data Tables:** Use `body-sm` for row content and `label-sm` for headers. Row height is fixed at 48px. Use zebra-striping (Slate-50) for readability in large datasets. Hover states must be clearly defined with a light blue tint.
- **Analytics Cards:** Feature a `headline-sm` title, a `display-lg` primary metric, and a small trend indicator (Success/Danger text with an icon).
- **Kanban Boards:** For recruitment pipelines. Columns should have a subtle background tint (Slate-100) with a 1px dashed border for empty states. Cards within the Kanban use Level 1 elevation.
- **Sidebar Navigation:** Use a high-contrast dark background for light mode (and vice versa) to anchor the UI. Active states use a left-edge 4px primary color border and a subtle background highlight.
- **Professional Forms:** Labels are always positioned above the input. Inputs use a 1px border; on focus, they gain a 2px primary color ring with 20% opacity. 
- **Buttons:**
  - *Primary:* Solid #2563EB with white text.
  - *Secondary:* Ghost style with primary color border and text.
  - *Tertiary:* Text only, used for "Cancel" or low-priority actions.
- **Chips/Badges:** Use a light background version of the semantic colors (e.g., Success green at 10% opacity) with high-contrast text for status indicators.