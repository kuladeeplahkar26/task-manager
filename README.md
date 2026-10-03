# Dark-Mode Task Management & File Dashboard

A modern, responsive, dark-themed frontend dashboard built with HTML5, CSS3, and Vanilla JavaScript, matching the reference screenshot.

---

## 📸 Overview & Design System

- **Color Palette**:
  - Background: Deep Charcoal (`#15161a`)
  - Cards & Form Inputs: Dark Gray (`#23252a`)
  - Subtle Borders: Charcoal Slate (`#2d3038`)
  - Primary Accent: Royal Blue (`#2563eb`)
  - Link / Action Accent: Clean Blue (`#3b82f6`)
  - Error / Destructive: Crimson (`#ef4444`)
  - Text: Clean White (`#ffffff`) & Light Gray (`#9ca3af`)
- **Typography**: Modern system sans-serif with Google Font [Inter](https://fonts.google.com/specimen/Inter).
- **Layout**: CSS Grid with dynamic responsive columns (6–7 cards on desktop, 3–4 on tablet, 1 on mobile).

---

## 🚀 Features

1. **Top Task Creation Section**:
   - `Title` input with `"Title goes here.."` placeholder.
   - Larger `Description` field with `"Write your task details here..."` placeholder.
   - Vibrant blue `"Create Task"` button with rounded corners and smooth hover effect.
   - Non-intrusive validation for both empty title and empty description:
     - *"Please enter a title."*
     - *"Please enter task details."*
   - Clears inputs upon successful creation.

2. **Responsive Card Grid**:
   - Matches the reference screenshot layout with initial seed files:
     - `.txt`
     - `adsf.txt`
     - `backendoeftxfhh.txt`
     - `chacha.md.txt`
     - `dbfiles.txt`
     - `helo.js.txt`
     - `kushal.txt`
     - `nilotpalfrontend.txt`
   - Each card displays file title, "read more" link, and a discreet delete action.

3. **Read More Modal**:
   - Centered dark modal dialog with backdrop overlay.
   - Full task title, timestamp, and complete description/content.
   - Close button (X icon & Close button), backdrop click dismissal, and `Escape` key support.
   - Direct option to delete the task from inside the modal.

4. **Task Management & Deletion**:
   - Custom confirmation modal before deleting tasks (*"Are you sure you want to delete..."*).
   - Seamless removal from the DOM and state without reloading the page.
   - Clean empty-state placeholder when all tasks are removed.

5. **Local Storage Persistence**:
   - Persists all tasks to `localStorage`.
   - Browser refresh retains all created, existing, and deleted states.

6. **Accessibility (a11y)**:
   - Semantic HTML5 structure (`<header>`, `<main>`, `<article>`, `<dialog>/modal`).
   - Accessible ARIA labels (`aria-modal`, `aria-labelledby`, `aria-describedby`, `aria-live`).
   - Visible keyboard `:focus-visible` outlines.

---

## 📂 Project Structure

```
class 2 sestion 3/
├── index.html       # Clean semantic HTML5 markup
├── css/
│   └── style.css    # Responsive CSS3 styles & design tokens
├── js/
│   └── app.js       # Vanilla JavaScript logic & localStorage state
└── README.md        # Project documentation
```

---

## 💻 How to Run Locally

You can open `index.html` directly in any web browser, or serve it using any local HTTP server:

```bash
# Using Python
python -m http.server 9000

# Or using Node.js / npx
npx serve -l 9000 .
```

Then visit: `http://localhost:9000`
