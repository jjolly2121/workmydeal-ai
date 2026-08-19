# WorkMyDeal AI

WorkMyDeal AI is a full-stack sales execution and forecasting platform built to
showcase practical product engineering: a React frontend, Spring Boot REST API,
role-aware workflows, local persistence, spreadsheet import, reporting exports,
and rule-based prioritization.

The application is intentionally designed as a portfolio-ready prototype. It
uses neutral sample data and does not include employer, customer, or production
sales records.

## What It Demonstrates

- Full-stack React + Spring Boot application architecture
- REST API design with controllers, services, repositories, models, and DTOs
- BCrypt password hashing and backend-stored token sessions
- Write-only password serialization and administrator checks on user-management endpoints
- Role-aware workflows for admins, managers, and sales reps
- Deal management with notes, activity history, ownership, and status tracking
- Rule-based priority scoring and daily execution recommendations
- Forecasting using weighted pipeline calculations
- Manager dashboard and team visibility
- CSV/XLSX import with duplicate detection
- CSV and Excel-style reporting/export support
- H2 local database setup with optional PostgreSQL profile

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Recharts, CSS |
| Backend | Java, Spring Boot, Spring Data JPA |
| Database | H2 for local development, PostgreSQL profile included |
| Security | BCrypt password hashing, backend token sessions |
| Files | CSV/XLSX import, CSV/Excel-style export |
| Tooling | npm, Maven, ESLint, JUnit/Spring Boot tests |

## Project Structure

```text
.
├── backend/        # Spring Boot API, services, models, repositories
├── frontend/       # React/Vite user interface
│   ├── src/features/deals/  # Deal components, shared logic, and tests
│   └── src/styles/          # Feature-level stylesheets
├── docs/           # Portfolio documentation and test guide
├── sample-data/    # Neutral import files for testing
├── test-api.http   # Optional local API request examples
└── README.md
```

Generated folders and local data are intentionally excluded from Git:

```text
frontend/node_modules/
frontend/dist/
backend/target/
backend/data/
.DS_Store
```

## Demo Users

The local seed data creates users only. Deal records are created manually or by
importing the neutral sample CSV files.

All demo accounts use:

```text
test123
```

| Role | Email | Visibility |
| --- | --- | --- |
| Admin | `admin@test.com` | Full system visibility |
| Manager | `manager@test.com` | First assigned team |
| Manager | `manager2@test.com` | Second assigned team |
| Rep | `rep1@test.com` | Own deals/workflow |
| Rep | `rep2@test.com` | Own deals/workflow |
| Rep | `rep3@test.com` | Own deals/workflow |
| Rep | `rep4@test.com` | Own deals/workflow |
| Rep | `rep5@test.com` | Own deals/workflow |
| Rep | `rep6@test.com` | Own deals/workflow |

## Run Locally

### Prerequisites

- Java 17 or newer
- Node.js and npm
- Internet access for first dependency install

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend URL:

```text
http://127.0.0.1:5173/
```

### Optional PostgreSQL profile

The PostgreSQL profile reads connection settings from environment variables:

```bash
export WORKMYDEAL_DB_URL=jdbc:postgresql://localhost:5432/workmydeal
export WORKMYDEAL_DB_USERNAME=workmydeal
export WORKMYDEAL_DB_PASSWORD=choose-a-local-password
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=postgres
```

Do not commit database passwords or production connection strings.

## Import Test Data

The repository includes neutral sample imports:

```text
sample-data/test-import-1.csv
sample-data/test-import-2.csv
```

Expected columns:

```text
dealName,companyName,dealValue,stage,probability
```

Example:

```csv
dealName,companyName,dealValue,stage,probability
Sample Opportunity A,Example Account A,25000,PROPOSAL,75
Sample Opportunity B,Example Account B,18000,NEGOTIATION,60
```

Imported deals are assigned to the currently signed-in user.

## Build And Test

Frontend:

```bash
cd frontend
npm install
npm run lint
npm test
npm run build
```

Backend:

```bash
cd backend
./mvnw test
```

## Documentation

- [System Blueprint](docs/SYSTEM_BLUEPRINT.md)
- [Test Guide](docs/TEST_GUIDE.md)

## Privacy Note

This repository is prepared for public portfolio use. It does not include
employer data, customer data, production credentials, local database files, or
real sales records. Sample accounts and opportunities are fictional and exist
only to demonstrate the application workflow.

## Security Scope

This remains a local portfolio prototype rather than a production identity system. Passwords are stored as BCrypt hashes and excluded from JSON responses. Session tokens are sent in request headers, and user-management mutations plus audit-history access require an administrator account. A hosted version should replace the custom session layer with a maintained authentication framework, add resource-level authorization tests, rotate and revoke sessions centrally, and keep demo seeding disabled.

## Future Enhancements

- JWT authentication and stricter Spring Security authorization
- Hosted PostgreSQL deployment
- Stronger import validation and preview mapping
- CRM/email/calendar integrations
- Advanced forecasting analytics and AI-assisted recommendations
