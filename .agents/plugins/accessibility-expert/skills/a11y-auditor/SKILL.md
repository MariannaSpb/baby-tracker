---
name: a11y-auditor
description: Instructions and logic for performing deep accessibility audits on HTML and Angular templates.
---

# Accessibility Auditor Skill

This skill enables the agent to perform comprehensive WCAG 2.1 AA audits.

## Audit Workflow
1.  **Semantic Check**: Verify that `button`, `nav`, `main`, `header`, `footer`, `section`, `article` are used correctly.
2.  **Interaction Check**: Ensure all clickable elements are at least 44x44px and have visible focus states.
3.  **Labeling Check**: Every input must have a `for`/`id` linked label.
4.  **Aria Check**: Verify correct usage of `aria-live`, `role="status"`, and `aria-label`.
5.  **Contrast Check**: Verify colors against WCAG AA (4.5:1 for normal text).

## Tools & Scripts
When this skill is active, you should:
- Use `npm run lint` to catch automated issues.
- Use the `browser_subagent` to visually inspect components.
- To run a deep audit:
    1. Read the `axe-audit-snippet.js` in the `scripts/` folder.
    2. Inject it into the browser session while the app is running.
    3. Analyze the console output for violations.

## WCAG 2.1 AA Checklist Reference
- **1.1.1 Non-text Content**: Alt text for all images.
- **1.3.1 Info and Relationships**: Proper hierarchy and labels.
- **2.1.1 Keyboard**: Everything reachable via Tab.
- **2.4.7 Focus Visible**: Never remove outline.
- **4.1.2 Name, Role, Value**: Correct ARIA usage.
