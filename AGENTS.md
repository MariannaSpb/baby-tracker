# AGENTS.md — Baby Tracker

## Project Overview
A personal mobile-first web application for tracking newborn sleep, feeds, and diapers. Designed specifically for sleep-deprived parents to use one-handed, often in low-light night conditions.

- **Stack**: Angular 21+, TypeScript, SCSS.
- **Goal**: Superior accessibility via AI-driven design and strict adherence to standards.

## Project Structure
```text
src/app/
├── core/               # Singleton services (localStorage), global models
├── components/         # Feature components (Dashboard, Feed, etc.)
├── shared/             # Reusable UI components and base models
└── app.routes.ts       # Application routing setup
public/                 # Global assets
angular.json            # Build and workspace configuration
```

## Commands
```bash
npm run start           # Local development server
npm run build           # Production build to dist/
npm run deploy          # Deploy to GitHub Pages
npm run lint            # Run ESLint with Accessibility checks
npm run test            # Run unit tests via Vitest/Jasmine
```

## Accessibility (A11y) Rules — CRITICAL
This is the **most critical** part of the app. Every change MUST be validated against these rules.

### HTML & Structure
- **Semantic HTML Only**: Use `button`, `nav`, `main`, `header`, `footer`, `section`, `article`.
- **No Div Bullying**: Never use `div` or `span` as interactive elements (buttons/links).
- **Images**: Every image needs an `alt` attribute. Decorative images use `alt=""`.
- **Hierarchy**: Heading hierarchy must be logical (h1 → h2 → h3). Never skip levels for styling.
- **Regions**: Use ARIA landmarks and `aria-labelledby` to define page regions.

### Forms & User Input
- **Labels**: Every input must have an associated `<label>` with matching `for`/`id`.
- **No Placeholders**: Never use `placeholder` as the only label or for critical instructions.
- **Validation**: Required fields MUST have `aria-required="true"`.
- **Errors**: Error messages MUST be linked to inputs via `aria-describedby`.

### Interaction & Feedback
- **Touch Targets**: All interactive elements MUST be at least **44x44px**.
- **Focus Management**: Focus styles must stay visible. Never remove `outline: none` without a high-visibility replacement.
- **Descriptive Text**: Buttons and links must have descriptive text or an `aria-label`.
- **Dynamic Content**: Use `role="status"` or `aria-live="polite"` for dynamic updates (e.g., live timers, status banners).

### Color & Contrast
- **WCAG AA Compliance**: 
  - Normal text: min 4.5:1 contrast.
  - Large text (18px+): min 3:1 contrast.
- **Meaning**: Never convey information via color alone (e.g., use an icon or text alongside red for errors).

### Angular Specifics
- **ARIA Attributes**: Use `[attr.aria-*]` for all dynamic ARIA attributes.
- **Routing**: `RouterLink` elements must have descriptive text for screen readers.

## Conventions
- **Component Pattern**: Use **Standalone components** only. Use **Signals** for state.
- **DI**: Always use `inject()` function.
- **Change Detection**: Strict `ChangeDetectionStrategy.OnPush`.

## Boundaries
- **Always**: Use `inject()`. Verify every new component passes the Accessibility check.
- **Never**: Use `@HostBinding`, `@HostListener`, or `NgModules`. Remove focus outlines.
- **Ask**: Before adding any 3rd-party dependencies.
