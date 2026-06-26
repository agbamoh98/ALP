# AI Learning Platform (ALP)

> An intelligent, AI-powered learning companion that understands your study material, teaches concepts, generates practice content, and adapts to your subscription level.

---

## Project Status

| Version | Name                | Status      |
| ------- | ------------------- | ----------- |
| 0.1     | Foundation          | ✅ Complete |
| 0.2     | Learning Resources  | ✅ Complete |
| 0.3     | Basic AI            | ✅ Complete |
| 0.4     | Learning Experience | 🔜 Planned  |
| 0.5     | Administration      | 🔜 Planned  |
| 0.6     | Usage Limits        | 🔜 Planned  |
| 0.7     | Subscriptions       | 🔜 Planned  |
| 0.8     | Advanced AI         | 🔜 Planned  |
| 1.0     | Public Launch       | 🔜 Planned  |

### What's shipped

**v0.1 — Foundation**
- React + TypeScript + MUI frontend with auth (register, login, JWT)
- Auth microservice (Spring Boot 3, BCrypt, JWT)
- Skeleton services for quiz, flashcard, and progress
- Docker Compose, GitHub Actions CI, versioned prompts in `/prompts/`

**v0.2 — Learning Resources**
- PDF upload with text extraction (Apache PDFBox)
- Plain-text upload
- Resource library (list, view, delete)
- Per-user resource storage with JWT-protected API
- Upload limits: 10 MB (free) / 50 MB (premium)

**v0.3 — Basic AI**
- OpenAI integration via `ai-service` (default model: `gpt-4o-mini` for cheap dev/testing)
- AI summaries (multiple styles)
- Flashcard generation (JSON output)
- Quiz generation (JSON output)
- AI Tutor chat (multi-turn, document-aware)
- Versioned prompts loaded from `/prompts/`
- AI usage logging (tokens, model, response time)

---

## Architecture

```
Browser
  │
React Frontend (TypeScript + MUI)  :5173
  │
┌─────────────────────────────────────┐
│  auth-service              :8081    │
│  learning-resource-service :8082    │
│  ai-service                :8083    │
│  quiz-service              :8084    │  (skeleton)
│  flashcard-service         :8085    │  (skeleton)
│  progress-service          :8086    │  (skeleton)
└─────────────────────────────────────┘
  │
PostgreSQL (Neon in prod / local or Docker in dev)
  │
OpenAI API (gpt-4o-mini default — upgrade model for production)
```

---

## Technology Stack

| Layer           | Technology                              |
| --------------- | --------------------------------------- |
| Frontend        | React 18, TypeScript, Material UI, Vite |
| Backend         | Java 21, Spring Boot 3, Spring Security |
| Database        | PostgreSQL 16                           |
| Auth            | JWT, BCrypt                             |
| AI              | OpenAI (provider-independent design)    |
| Containers      | Docker, Docker Compose                  |
| Frontend Deploy | Vercel                                  |
| Backend Deploy  | Render                                  |
| Database (prod) | Neon PostgreSQL                         |
| CI/CD           | GitHub Actions                          |

---

## Getting Started (Local Development)

### Prerequisites

- Node.js 20+
- Java 21
- Maven 3.9+
- PostgreSQL 16 (local install or via Docker)
- OpenAI API key (for AI features in v0.3+)

### 1. Clone the repository

```bash
git clone https://github.com/agbamoh98/ALP.git
cd ALP
```

### 2. Create databases

If using local PostgreSQL:

```sql
CREATE DATABASE alp_auth;
CREATE DATABASE alp_resources;
CREATE DATABASE alp_ai;
```

With Docker Compose, databases are created automatically via `scripts/init-databases.sh`.

### 3. Configure environment

```bash
# Root (Docker Compose)
cp .env.example .env

# Auth service
cp services/auth-service/.env.example services/auth-service/.env

# AI service (required for summaries, flashcards, quizzes, tutor)
cp services/ai-service/.env.example services/ai-service/.env
# Edit services/ai-service/.env and set OPENAI_API_KEY=sk-...

# Frontend (optional)
cp frontend/.env.example frontend/.env
```

**Important:** Use the same `JWT_SECRET` across auth, resource, and AI services locally. Never commit `.env` files.

### 4. Start services

#### Option A — Docker Compose (all services)

```bash
docker-compose up --build
```

Frontend is served at [http://localhost:3000](http://localhost:3000) in Docker.

#### Option B — Manual (recommended for development)

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Auth service (8081):**

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/alp_auth"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"
$env:JWT_SECRET="alp-dev-secret-key-minimum-256-bits-long-for-hs256-algorithm-ok"
cd services/auth-service
mvn spring-boot:run
```

**Resource service (8082):**

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/alp_resources"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"
$env:JWT_SECRET="alp-dev-secret-key-minimum-256-bits-long-for-hs256-algorithm-ok"
cd services/learning-resource-service
mvn spring-boot:run
```

**AI service (8083):**

```powershell
cd services/ai-service
.\run-local.ps1
```

`run-local.ps1` loads `services/ai-service/.env` and starts the service. On macOS/Linux, export the same variables from `.env` and run `mvn spring-boot:run`.

### 5. Access the app

| Service               | URL                                                          |
| --------------------- | ------------------------------------------------------------ |
| Frontend (dev)        | [http://localhost:5173](http://localhost:5173)               |
| Frontend (Docker)     | [http://localhost:3000](http://localhost:3000)               |
| Auth API              | [http://localhost:8081/api/auth](http://localhost:8081/api/auth) |
| Learning Resource API | [http://localhost:8082/api/resources](http://localhost:8082/api/resources) |
| AI API                | [http://localhost:8083/api/ai](http://localhost:8083/api/ai) |
| AI status (no auth)   | [http://localhost:8083/api/ai/status](http://localhost:8083/api/ai/status) |

### 6. Try the features

1. Register / log in
2. **Upload** a PDF or paste text
3. Open the resource in **Library**
4. Use **AI Learning Tools** — Summary, Flashcards, Quiz, or AI Tutor

---

## Project Structure

```
ALP/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI
├── frontend/                   # React + TypeScript + MUI
├── services/
│   ├── auth-service/           # JWT authentication
│   ├── learning-resource-service/  # PDF/text upload & library
│   ├── ai-service/             # OpenAI orchestration
│   ├── quiz-service/           # skeleton
│   ├── flashcard-service/      # skeleton
│   └── progress-service/       # skeleton
├── prompts/                    # AI prompt files (versioned)
│   ├── assistant.md
│   ├── summarizer.md
│   ├── quiz.md
│   ├── flashcards.md
│   └── chat.md
├── docker-compose.yml
└── README.md
```

---

## Git Workflow

```
main
  └── feature/version-x-feature-name
        └── Pull Request → Review → Merge
```

No direct commits to `main` without review in team workflows.

---

## User Roles

| Role    | Description                                 |
| ------- | ------------------------------------------- |
| GUEST   | View landing page, register, login          |
| FREE    | Core features with daily limits             |
| PREMIUM | Advanced AI, higher limits, priority access |
| ADMIN   | Full platform control                       |

---

## AI Configuration

| Setting            | Default        | Notes                                      |
| ------------------ | -------------- | ------------------------------------------ |
| `OPENAI_MODEL`     | `gpt-4o-mini`  | Cheap for dev/testing; upgrade for prod    |
| `OPENAI_MAX_TOKENS`| `2048`         | Max completion tokens per request          |
| `AI_MAX_CONTENT_CHARS` | `12000`    | Resource text truncated before sending     |
| `PROMPTS_DIR`      | `../../prompts`| Relative to `services/ai-service` at runtime |

Prompt files live in `/prompts/` and are version-controlled. Change the model via `OPENAI_MODEL` in `services/ai-service/.env` when moving beyond local testing.

---

## AI Safety Policy

- Accuracy over completeness — the AI never fabricates facts
- Prompt files are versioned in `/prompts/`
- All AI usage is logged (model, tokens, response time)
- Input validation and JWT auth on every AI endpoint

---

## Contributing

1. Create a branch: `feature/version-0.x-your-feature`
2. Make your changes
3. Open a Pull Request with description, screenshots (if UI), and test results
4. Get at least one review before merging

---

## License

MIT
