# WorkMyDeal Sales Platform Test Guide

This guide walks through the application feature by feature so the project can
be tested after cloning the repository.

## 1. Start The Application

Open two terminal windows from the project root.

Backend:

```bash
cd backend
./mvnw spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open:

```text
http://127.0.0.1:5173/
```

## 2. Demo Accounts

All demo accounts use:

```text
test123
```

| Role | Email | Purpose |
| --- | --- | --- |
| Admin | `admin@test.com` | Full system visibility |
| Manager | `manager@test.com` | First manager team |
| Manager | `manager2@test.com` | Second manager team |
| Rep | `rep1@test.com` | First rep workflow |
| Rep | `rep2@test.com` | Second rep workflow |
| Rep | `rep3@test.com` | Third rep workflow |
| Rep | `rep4@test.com` | Fourth rep workflow |
| Rep | `rep5@test.com` | Fifth rep workflow |
| Rep | `rep6@test.com` | Sixth rep workflow |

Repository note: the application seeds the demo users above, but it does not
preload deal records. Use the import tests below to create neutral sample deals
before auditing deal detail, execution, forecast, and pipeline workflows.

## 3. Admin Test

1. Log in as `admin@test.com`.
2. Confirm the sidebar shows admin-level access.
3. Open Manager Dashboard.
4. Confirm admin can see organization-wide team data.
5. Open Administration.
6. Confirm user records are visible.

Expected result:

- Admin can access broad system views.
- Admin is not limited to one manager team.

## 4. Manager Test

1. Log out.
2. Log in as `manager@test.com`.
3. Open Manager Dashboard.
4. Confirm the manager sees assigned reps and team context.
5. Open Pipeline.
6. Confirm the manager can review team pipeline data.
7. Open Forecast.
8. Confirm forecast-related pages load. Import sample deals first if no deal
   data is visible in a clean local database.

Expected result:

- The manager sees assigned team data.
- The manager does not use the rep-only daily workflow as the primary view.

## 5. Rep Dashboard And Deal Visibility Test

1. Log out.
2. Log in as `rep1@test.com`.
3. Open Dashboard.
4. Confirm the rep sees their own work context.
5. Open Deals.
6. If no deals are visible yet, complete the import test in Section 8 first.
7. Use the search bar and search for:

```text
Sample Opportunity A
```

8. Select a matching deal.

Expected result:

- The rep can search and open owned deals.
- The rep should not see every organization's deals as their personal working set.

## 6. Deal Activity And Notes Test

1. While logged in as a rep, open a deal from the Deals page.
2. Review the deal detail area.
3. Add or review activity information if available in the selected deal workflow.
4. Add or review notes if available in the selected deal workflow.

Expected result:

- Deal context, activity, and notes support the rep's workflow.
- The deal detail view updates without leaving the page.

## 7. Daily Execution Test

1. Stay logged in as a rep. Import sample deals first if the execution list is
   empty in a clean local database.
2. Open Daily Execution.
3. Review recommended or prioritized work items.
4. Mark a task complete if desired.

Expected result:

- The page presents a focused rep workflow.
- Execution guidance supports deciding which deals need attention.

## 8. Import Test: First Upload Should Import

Use the included file:

```text
sample-data/test-import-1.csv
```

Steps:

1. Stay logged in as a rep, such as `rep1@test.com`.
2. Open Deals.
3. Click Import.
4. Select `sample-data/test-import-1.csv`.
5. Confirm the page shows the selected file message.
6. Click Upload.
7. Confirm the browser alert and page message show an import result.

Expected result:

```text
Import complete. Imported: 5 | Skipped: 0 | Errors: 0
```

The exact numbers may vary if the file was already imported earlier in the same
database session.

8. Search for:

```text
Sample Opportunity A
```

Expected result:

- The imported deal appears in the rep's Deals search results.
- The imported deal is assigned to the currently signed-in rep.

## 9. Import Test: Same File Should Skip Duplicates

Use the same file again:

```text
sample-data/test-import-1.csv
```

Steps:

1. Click Import.
2. Select `sample-data/test-import-1.csv` again.
3. Click Upload.

Expected result:

```text
Import complete. Imported: 0 | Skipped: 5 | Errors: 0
```

This verifies duplicate protection based on deal name and company name.

## 10. Import Test: Second File Should Import New Deals

Use the included file:

```text
sample-data/test-import-2.csv
```

Steps:

1. Click Import.
2. Select `sample-data/test-import-2.csv`.
3. Click Upload.
4. Confirm the browser alert and page message show success.

Expected result:

```text
Import complete. Imported: 5 | Skipped: 0 | Errors: 0
```

5. Search for:

```text
Sample Opportunity F
```

Expected result:

- The imported deal appears in the rep's Deals search results.
- The second file imports separately because the deal/company combinations are
  different from the first file.

## 11. Forecast And Pipeline Test

1. Open Forecast.
2. Review weighted pipeline and forecast information.
3. Open Pipeline.
4. Review stage and value information.
5. Use export if desired.

Expected result:

- Forecast and pipeline pages provide visibility into deal value, probability,
  and sales stages.

## 12. Session And Restart Test

1. Stop the backend.
2. Start the backend again.
3. Refresh the frontend.

Expected result:

- The app may return to the login screen because local demo sessions reset.
- Logging in again restores normal access.

## 13. Important Local Database Note

The local version uses H2 for demo data. H2 allows only one backend process to
use the file database at a time. If this error appears:

```text
Database may be already in use
```

stop the duplicate backend process and run only one `./mvnw spring-boot:run`
session.

## 14. Summary Of Expected Results

The complete audit should show:

- Login works for Admin, Manager, and Rep users.
- Role-based visibility changes by account type.
- Reps can search and manage their deal workflow.
- Daily Execution supports prioritized work.
- Manager Dashboard, Forecast, and Pipeline support management visibility.
- Import succeeds for new files.
- Import skips duplicate deal/company combinations.
- Imported deals belong to the signed-in rep.
