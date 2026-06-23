# WorkMyDeal AI System Blueprint

## Product Identity

WorkMyDeal AI is a lifecycle-aware B2B sales execution system that helps sales representatives move opportunities forward through prioritized work queues, cadence-based outreach, and contract-timing awareness.

## Core Philosophy

Opportunities do not disappear. Their cadence changes.

The system does not treat opportunities as simply won or lost. Instead, opportunities remain active, dormant, or won depending on timing, relationship state, and deal momentum.

## Core Workflow

1. System evaluates all opportunities.
2. System builds a prioritized execution queue.
3. Rep works the next opportunity.
4. Rep logs a touchpoint.
5. Rep updates notes, stage, probability, or timing.
6. System recalculates priority and cadence.
7. Rep moves to the next opportunity.

## Primary Screen

The Task Page / Daily Execution View is the heart of the system.

The purpose of the Task Page is to let a user complete a focused call block without manually sorting through a spreadsheet.

## Core Objects

### Deal

A Deal represents the current state of an opportunity.

### Activity

An Activity represents a historical touchpoint on a deal.

### Note

A Note represents separate user-entered context attached to a deal. The Deal also keeps a short summary/context field for quick viewing.

### Forecast Record

A Forecast Record stores a weighted forecast snapshot when a deal is created or updated.

### Reactivation History

Reactivation History records when a dormant or non-active deal is returned to active workflow.

### Touch Template

A Touch Template stores reusable outreach categories, example messages, and default frequencies.

### Audit History

Audit History records sensitive system activity such as user changes, logins, activities, notes, templates, and deal updates.

### Auth Session

An Auth Session stores a token issued at login and used by the frontend on protected API requests.

## Core Engines

### Lifecycle Engine

Determines whether an opportunity is Active, Dormant, or Won.

### Cadence Engine

Determines how often the opportunity should be touched.

### Priority Engine

Determines which opportunity should appear next.

### Execution Engine

Builds the work queue for the Task Page.

## Implemented Architecture

The current Version 1 implementation uses:

- React frontend with role-based navigation for Rep, Manager, and Admin users.
- Spring Boot REST API controllers.
- Spring Data JPA repositories.
- H2 file database by default for local development/demo use.
- PostgreSQL runtime support through the `postgres` Spring profile.
- BCrypt password hashing.
- Token-backed session records for authenticated API requests.
- Apache POI for backend Excel pipeline export.
- CSV exports in frontend report views.
- CSV/XLSX deal import for rep-owned deal uploads.

## Authentication Flow

1. The login page posts credentials to `/api/auth/login`.
2. The backend validates the BCrypt password and creates an `AuthSession`.
3. The frontend stores `currentUser` and `authToken` in local storage.
4. Frontend API calls use `apiFetch`, which sends `X-Auth-Token`.
5. The backend interceptor protects `/api/**` endpoints except login and validation routes.
6. Logout posts to `/api/auth/logout` and deactivates the session.

The `/api/auth/login` endpoint is the canonical login path.

## Data Storage Modes

Default local mode uses H2:

```properties
spring.datasource.url=jdbc:h2:file:./data/workmydeal-db
```

PostgreSQL mode is available with:

```bash
SPRING_PROFILES_ACTIVE=postgres
```

The PostgreSQL profile is configured in `application-postgres.properties`.

## SDD Alignment Notes

The implemented system now includes the major SDD entities and concepts:

- Users
- Deals
- Cadence rules
- Tasks
- Activities
- Notes
- Forecast records
- Status history
- Reactivation history
- Touch templates
- Audit history
- Auth sessions

## Demo User Design

The local demo seeds a repeatable organization structure:

- One Admin user with full visibility.
- Two Manager users.
- Six Rep users.
- Each Manager oversees three assigned Reps.
- Deal records are intentionally not seeded in the public repository.

This structure supports role-based demonstrations where Reps can create or
import their own deals, Managers see their assigned team, and Admins see the
full system.

## Import And Export

Reps can upload `.csv` or `.xlsx` deal files from the Deals page. Imported deals
are assigned to the currently signed-in user through the user's `owner` and
`ownerId` values.

Expected import columns:

```text
dealName,companyName,dealValue,stage,probability
```

The system also supports reporting exports through frontend CSV downloads and a
backend Excel pipeline export service.

The implementation keeps a few compatibility paths:

- `TaskController` is the canonical daily execution/task route.
- `ForecastController` is the canonical forecast route for both live forecast insights and stored forecast records.
- H2 remains the default demo database even though PostgreSQL support is available.

## Remaining Technical Notes

- The frontend lint command currently passes with zero errors.
- Backend tests currently pass with the included Spring Boot test setup.
- The production PostgreSQL database must be created and configured before running with the `postgres` profile.
