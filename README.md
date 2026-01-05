# Task Manager API ✅

A small Express-based REST API for managing tasks. This project is a simple backend assignment that demonstrates CRUD operations with file-based storage and includes filtering, sorting, and a basic health endpoint.

---

## 🔧 Requirements

- Node.js >= 18
- npm

> The test suite includes a pretest script that enforces Node.js 18 or newer.

## 🚀 Quickstart

Install dependencies:

```bash
npm install
```

Start the application (will use clustering and spawn workers):

```bash
node app.js
```

Run tests:

```bash
npm test
```

---

## 📁 Data storage

Tasks are stored in `task.json` at the project root. The API uses synchronous file reads/writes (see `utils/taskHelper.js`). Note: because the app spawns worker processes when started directly, concurrent writes might need more careful handling for production.

---

## 🧭 API Endpoints

Base path: `/tasks`

- GET `/health`
  - Returns service status, process id and uptime.

- GET `/tasks`
  - Returns all tasks.
  - Query params:
    - `completed=true|false` — filter by completion status
    - `sortBy=createdAt` — sort tasks by creation date

- GET `/tasks/:id`
  - Returns a single task by id.

- GET `/tasks/priority/:level`
  - `:level` must be `low`, `medium`, or `high`.

- POST `/tasks`
  - Create a new task.
  - Body (JSON):
    - `title` (string, required)
    - `description` (string, required)
    - `completed` (boolean, required)
    - `priority` (optional: `low|medium|high`, defaults to `low`)
  - Returns `201` and the created task.

- PUT `/tasks/:id`
  - Update an existing task (partial updates allowed). Validates fields when provided.

- DELETE `/tasks/:id`
  - Remove a task by id.

---

## ✅ Example curl

Create a task:

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk","description":"2 liters","completed":false,"priority":"medium"}'
```

Get all unfinished tasks sorted by creation time:

```bash
curl "http://localhost:3000/tasks?completed=false&sortBy=createdAt"
```

---

## 🛠 Development notes

- The application starts in clustered mode when executed directly (`node app.js`). Workers listen on port `3000`.
- Unit/integration tests use `tap` and `supertest` (`npm test`).

---

## ✍️ Author
Balasabarish

---

