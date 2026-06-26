# AI Learning Platform (ALP)

> An intelligent, AI-powered learning companion that understands your study material, teaches concepts, generates practice content, and adapts to your subscription level.

---

## Project Status


| Version | Name                | Status        |
| ------- | ------------------- | ------------- |
| 0.1     | Foundation          | ✅ In Progress |
| 0.2     | Learning Resources  | 🔜 Planned    |
| 0.3     | Basic AI            | 🔜 Planned    |
| 0.4     | Learning Experience | 🔜 Planned    |
| 0.5     | Administration      | 🔜 Planned    |
| 0.6     | Usage Limits        | 🔜 Planned    |
| 0.7     | Subscriptions       | 🔜 Planned    |
| 0.8     | Advanced AI         | 🔜 Planned    |
| 1.0     | Public Launch       | 🔜 Planned    |


---



## Architecture

```
Browser
  │
React Frontend (TypeScript + MUI)
  │
┌─────────────────────────────────────┐
│  auth-service          :8081        │
│  learning-resource-service :8082    │
│  ai-service            :8083        │
│  quiz-service          :8084        │
│  flashcard-service     :8085        │
│  progress-service      :8086        │
└─────────────────────────────────────┘
  │
PostgreSQL (Neon in prod / Docker in dev)
  │
AI Provider (OpenAI → Anthropic → Gemini)
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

- Docker Desktop
- Node.js 20+
- Java 21
- Maven 3.9+



### 1. Clone the repository

```bash
git clone https://github.com/your-org/alp.git
cd alp
```



### 2. Configure environment

```bash
# Copy and fill in each service's env file
cp services/auth-service/.env.example services/auth-service/.env
cp frontend/.env.example frontend/.env
```



### 3. Start all services

```bash
docker-compose up --build
```



### 4. Access the app


| Service               | URL                                            |
| --------------------- | ---------------------------------------------- |
| Frontend              | [http://localhost:5173](http://localhost:5173) |
| Auth API              | [http://localhost:8081](http://localhost:8081) |
| Learning Resource API | [http://localhost:8082](http://localhost:8082) |
| AI API                | [http://localhost:8083](http://localhost:8083) |
| Quiz API              | [http://localhost:8084](http://localhost:8084) |
| Flashcard API         | [http://localhost:8085](http://localhost:8085) |
| Progress API          | [http://localhost:8086](http://localhost:8086) |


---



## Project Structure

```
ALP/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI
├── frontend/                   # React + TypeScript + MUI
├── services/
│   ├── auth-service/           # JWT Authentication
│   ├── learning-resource-service/
│   ├── ai-service/
│   ├── quiz-service/
│   ├── flashcard-service/
│   └── progress-service/
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
  └── develop
        └── feature/version-x-feature-name
              └── Pull Request → Review → Merge
```

**No direct commits to** `main` **or** `develop`**.**

---



## User Roles


| Role    | Description                                 |
| ------- | ------------------------------------------- |
| GUEST   | View landing page, register, login          |
| FREE    | Core features with daily limits             |
| PREMIUM | Advanced AI, higher limits, priority access |
| ADMIN   | Full platform control                       |


---



## AI Safety Policy

- Accuracy over completeness — the AI never fabricates facts
- Prompt files are versioned in `/prompts/`
- All AI usage is logged (model, tokens, cost, response time)
- Input validation and rate limiting on every AI endpoint

---



## Contributing

1. Create a branch: `feature/version-0.1-your-feature`
2. Make your changes
3. Open a Pull Request with description, screenshots (if UI), and test results
4. Get at least one review before merging

---



## License

MIT