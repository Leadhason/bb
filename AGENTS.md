## Source of Truth

This project has two governing documents. Before writing any code, making any architectural decision, or implementing any UI element, you must consult the relevant document. Do not infer, assume, or improvise anything that is covered by either document.

### Spec.md — Project Scope & Architecture
`Spec.md` is the single source of truth for:
- Feature scope — what is and is not part of this application
- Data models and database schema
- Business rules and logic
- API and backend behaviour
- Third-party service integrations
- Build phases and implementation order

If a decision involves what the application does, how data flows, or how services are integrated — consult `Spec.md` first. If the answer is not in `Spec.md`, ask for clarification before proceeding. Do not expand scope beyond what is defined.

### Design.md — UI/UX
`Design.md` is the single source of truth for:
- Design tokens (colours, typography, spacing, border radius)
- Light and dark mode implementation
- Component specifications and visual states
- Page layouts and route structure
- Interaction and animation behaviour
- Responsive design rules
- Accessibility requirements

If a decision involves how something looks, feels, or behaves visually — consult `Design.md` first. Do not introduce new fonts, colours, components, or layout patterns that are not defined in `Design.md`.

### Conflicts
If you encounter a conflict between `Spec.md` and `Design.md`, flag it explicitly and ask for resolution before proceeding. Do not resolve conflicts silently.