---
name: Baby Tracker Project Rules
description: Core development rules, design principles, and technical best practices for the Baby Tracker application.
---

# Baby Tracker Project Rules

This document outlines the core principles and technical requirements for developing the Baby Tracker app in the Antigravity environment.

## 1. Project Context & Design Goals
- **Goal**: A personal web app for tracking newborn sleep, feeds, and diapers.
- **User Persona**: Sleep-deprived parent, often using the app one-handed at night.
- **Design Principles**:
  - **Mobile-first**: Optimized for mobile browsers (max-width: 430px).
  - **Environment-ready**: High contrast and soft colors for night use. Light background, soft colors.
  - **One-hand operation**: Large touch targets (minimum 44x44px).
  - **Performance**: Fast loading and minimal UI.

## 2. Technical Stack (Angular 21+)
- **Standalone Only**: Always use standalone components. Do NOT use `NgModules`.
- **Signals**: Use Signals for all state management (`input()`, `output()`, `computed()`).
  - Do NOT use `mutate` on signals; use `update` or `set`.
  - Use `ChangeDetectionStrategy.OnPush` for all components.
- **Native Control Flow**: Use `@if`, `@for`, and `@switch` instead of structural directives like `*ngIf`, `*ngFor`.
- **Dependency Injection**: Use the `inject()` function instead of constructor injection.
- **Forms**: Use **Reactive Forms** exclusively.
- **Styles**: Use SCSS. Custom components only (no 3rd party UI libraries).
- **Optimization**: Use `NgOptimizedImage` for all static images (except base64).
- **Routing**: Implement lazy loading for feature routes.

## 3. Component Architecture & Templates
- **Host Bindings**: Do NOT use `@HostBinding` or `@HostListener`. Use the `host` property in the component decorator.
- **Templates**: 
  - Prefer inline templates for small components. 
  - Keep templates simple and avoid complex logic.
  - Do NOT use `ngClass` or `ngStyle`; use `class` and `style` bindings instead (e.g., `[class.active]="isActive"`).
  - Use the `async` pipe to handle observables in templates.
  - Do NOT assume globals (like `new Date()`) are available in templates.
- **State**: Keep transformations pure and predictable. Use `computed()` for derived state.
- **Paths**: Use relative paths for component-bound external templates/styles.

## 4. Services & Logic
- **Architecture**: Design services around a single responsibility.
- **Singleton**: Use `providedIn: 'root'` for singleton services.
- **Functions**: Use the `inject()` function to consume services.

## 5. Accessibility (A11y) - CRITICAL
- **Standards**: Must pass all AXE checks and follow WCAG AA minimums.
- **HTML**:
  - Use semantic tags (`button`, `nav`, `main`, `header`, `footer`, `section`, `article`).
  - Never use `div` or `span` for interactive elements.
  - Every image MUST have an `alt` attribute (empty `alt=""` for decorative images).
  - Logical heading hierarchy (h1 → h2 → h3, no skipping levels).
- **Interaction**:
  - Minimum 44x44px touch targets.
  - Visible focus styles (always!). Never remove outline without replacement.
  - Buttons must have descriptive text or an `aria-label`.
  - `RouterLink` elements must have descriptive text.
- **Forms**:
  - Labels MUST be linked to inputs via `for`/`id`.
  - Never use `placeholder` as the only label.
  - Use `aria-required="true"` and `aria-describedby` for error messages.
- **Color**: Minimum 4.5:1 contrast for normal text (3:1 for large text 18px+); never convey info by color alone.
- **Angular Dynamic ARIA**: Use `[attr.aria-*]` for dynamic ARIA attributes.

## 6. Coding Standards
- **TypeScript**: 
  - Strict type checking. 
  - Prefer type inference when the type is obvious.
  - Avoid `any`; use `unknown` if unsure.
- **Angular Defaults**: `standalone: true` is the default in Angular v20+; do not explicitly set it in `@Component` or `@Directive` decorators.
