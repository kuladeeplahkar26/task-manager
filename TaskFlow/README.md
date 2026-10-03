# TaskFlow – Task Manager Web Application

A full-stack Task Manager web application built with **Node.js**, **Express.js**, **HTML5**, **CSS3**, and the built-in **File System (`fs`)** module.

Each task is stored as an individual `.txt` file inside the `tasks/` directory, satisfying all requirements of the college assignment without requiring an external database.

---

## 📁 Project Folder Structure

```
TaskFlow/
├── app.js               # Main Express application with routes and fs operations
├── package.json         # Project metadata, dependencies, and start scripts
├── README.md            # Documentation and execution instructions
├── tasks/               # Directory storing individual task .txt files (auto-created)
│   ├── sample-express-routing.txt
│   ├── sample-file-system-operations.txt
│   └── sample-modern-ui-styling.txt
└── public/
    └── style.css        # Responsive modern Blue & White CSS design system
```

---

## 🛠️ Required Concepts Demonstrated

| Concept | Implementation in Code |
| :--- | :--- |
| `express.urlencoded({ extended: true })` | Configured as middleware to parse submitted HTML form bodies. |
| `req.body` | Used in `POST /create` to access `req.body.title` and `req.body.description`. |
| `req.params` | Used in dynamic route `GET /task/:filename` to extract `req.params.filename`. |
| `fs.writeFile()` | Asynchronously creates and writes each new task `.txt` file into `tasks/`. |
| `fs.readdir()` | Asynchronously reads the `tasks/` directory to list all saved `.txt` files. |
| `fs.readFile()` | Asynchronously reads the contents of individual task files. |
| `path.join()` | Safely constructs cross-platform filesystem paths for file operations. |
| Security & Validation | Prevents directory traversal attacks, rejects empty inputs, and escapes HTML output. |

---

## 🌐 Express Routes

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Lists all saved tasks as responsive cards with shortened descriptions. |
| `GET` | `/create` | Displays the task creation form with title and description inputs. |
| `POST` | `/create` | Receives form data, generates a unique filename, saves `.txt` file, and redirects to `/`. |
| `GET` | `/task/:filename` | Displays the full task title and complete description with a back button. |

---

## 🚀 Step-by-Step Instructions to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (version 16 or newer recommended)

### 1. Open Terminal and Navigate to Project Directory
```bash
cd TaskFlow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Application
Run the standard start script:
```bash
npm start
```

Or run in development watch mode (Node.js 18+):
```bash
npm run dev
```

### 4. Open in Your Browser
Visit:
```
http://localhost:3000
```

---

## 🎨 UI Features

- **Modern Blue & White Theme**: Professional, clean aesthetic with rounded cards and subtle depth.
- **Card Grid Layout**: Responsive grid that adapts effortlessly between desktop, tablet, and mobile displays.
- **Read More**: Distinct interactive button on every task card linking directly to dynamic details route.
- **Empty State**: Friendly illustration and message when no tasks are currently stored.
- **Alert Feedback**: Instant banners on successful task creation or when errors occur.
