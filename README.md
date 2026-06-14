# SCT_WD_4
to do web app
Premium To-Do Web Application Plan
A state-of-the-art, responsive To-Do application built using vanilla HTML, CSS, and JavaScript. The app features a premium dark-themed glassmorphism interface, custom categories/lists, task editing, completion animations, and due-date tracking with local storage persistence.

User Review Required
No breaking changes or third-party backend servers are used. The app is fully self-contained and local. Please verify the aesthetic preferences:

Defaulting to a high-end, futuristic dark theme with violet/magenta glow effects.
Google Fonts (Outfit) and Lucide Icons (CDN) for clean, premium styling.
Open Questions
None at the moment. The plan covers all requests (lists, complete, edit, date/time setting) with a focus on rich aesthetics.

Proposed Changes
Core Frontend
[NEW] 
index.html
Create semantic HTML5 structure.
SEO tags, description, viewport.
Link Google Fonts (Outfit) and Lucide Icons (CDN).
Single <h1> for page structure.
Layout: Side navigation for list management (e.g. Personal, Work, + Add List) and a main section for tasks.
Task detail modal for custom date/time, descriptions, and edits.
[NEW] 
style.css
Implement CSS custom properties (colors, glassmorphic blurs, gradients, shadows).
Modern scrollbars and fluid responsive design (sidebar collapses to bottom navigation or off-canvas on mobile).
Micro-animations: Add task bounce, checkmark morph, list transition, and glow hover effects.
[NEW] 
app.js
Maintain app state: lists, active list, and tasks.
Persist state to localStorage.
Support:
Adding/deleting lists.
Adding/editing/deleting tasks within lists.
Marking tasks completed.
Assigning date & time due, and sorting tasks (e.g., active vs completed, sorted by date).
Handle DOM manipulation, event listeners, and interactive animations.
Verification Plan
Automated Tests
N/A (Vanilla JS client-side app).

Manual Verification
Launch local dev server or open index.html in a web browser.
Verify ability to add a custom list (e.g., "Shopping").
Verify adding tasks with due date & time.
Edit an existing task's title and date/time.
Verify checking a task plays completion animation.
Verify layout is mobile responsive.
Reload page and check that tasks and lists persist in localStorage.
