# QuizCraft — Test Platform

Веб-платформа для створення, публікації, проходження онлайн-тестів та аналізу результатів.

---

## 🛠 Стек технологій

- **Backend**: Python 3.12, **FastAPI**, **Pydantic v2**, файлове збереження даних (JSON в `backend/data/`).
- **Frontend**: **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **shadcn/ui**, **Redux Toolkit** (RTK Query).
- **Tooling & Quality**:
  - Python: `uv`, `ruff` (linter + formatter), `mypy` (type checker), `pytest`.
  - Frontend: `npm`, `oxlint` (linter), `prettier` (formatter), `tsc` (type checker).

---

## 🚀 Швидкий запуск

### 1. Автоматичний запуск (Windows)
Просто запустіть файл:
```powershell
.\start.bat
```
Він автоматично запустить бекенд на порту `8001` та фронтенд на порту `5174`.

### 2. Ручний запуск

#### Бекенд (`backend/`):
```powershell
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8001
```
API документація буде доступна за адресою: `http://localhost:8001/docs`

#### Фронтенд (`frontend/`):
```powershell
cd frontend
npm install
npm run dev
```
Фронтенд буде доступний за адресою: `http://localhost:5174`

---

## 🔍 Якість коду: Лінтер, Форматер та Тайп-чекер

У проекті налаштовано 3 взаємодоповнюючі рівні перевірки коду:

| Інструмент | Бекенд (Python) | Фронтенд (TypeScript) | Що перевіряє / Роль |
| :--- | :--- | :--- | :--- |
| **Лінтер (Linter)** | `uv run ruff check .` | `npm run lint` (`oxlint`) | **Якість та помилки коду**: знаходить невикористані змінні, мертвий код, порушення правил хуків React, потенційні баги та антипатерни. |
| **Форматер (Formatter)** | `uv run ruff format .` | `npm run format` (`prettier`) | **Стиль та оформлення**: автоматично приводить весь код до єдиного стандарту (відступи, лапки, перенесення рядків, коми). |
| **Тайп-чекер (Type Checker)** | `uv run mypy app tests` | `npm run typecheck` (`tsc -b`) | **Типізація**: статично перевіряє типи даних, правильність інтерфейсів, функцій та контрактів API, запобігаючи помилкам на кшталт `NoneType` або `undefined`. |

---

## 🤖 Налаштування для ШІ-агентів та PathFilters

У репозиторії налаштовано інфраструктуру для роботи AI-агентів (Claude, Antigravity) з чіткою фільтрацією шляхів (`PathFilters`):
- **[CLAUDE.md](./CLAUDE.md)** — інструкція та довідник для Claude Code.
- **[Agents.MD](./Agents.MD)** — загальний гайд та правила для агентів.
- **`.agents/rules/`** — правила, обмежені через `PathFilters`:
  - `shared-rules.md` (`PathFilters: ["**/*"]`) — загальні стандарти для всього репозиторію;
  - `backend-*.md` (`PathFilters: ["backend/**"]`) — бекенд-архітектура, стандарти коду та безпека;
  - `frontend-*.md` (`PathFilters: ["frontend/**"]`) — фронтенд-архітектура, стандарти React/TypeScript та безпека.
- **`.agents/skills/`** — навички запуску, тестування та додавання фіч (`backend-*`, `frontend-*`), кожна зі своїм `PathFilters`.
- **`.agents/hooks/` та `hooks.json`** — автоматичні хуки валідації дій агентів з `PathFilters` фільтрацією подій.
