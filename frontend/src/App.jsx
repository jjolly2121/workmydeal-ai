import { useEffect, useState } from "react";

import Dashboard from "./pages/Dashboard";
import ExecutionPage from "./pages/ExecutionPage";
import DealsPage from "./pages/DealsPage";
import ForecastPage from "./pages/ForecastPage";
import PipelinePage from "./pages/PipelinePage";
import CadencesPage from "./pages/CadencesPage";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdministrationPage from "./pages/AdministrationPage";
import LoginPage from "./pages/LoginPage";
import { apiFetch } from "./api";

function clearStoredAuth() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("authToken");
}

function getStoredUser() {
  const savedUser = localStorage.getItem("currentUser");
  const token = localStorage.getItem("authToken");

  if (!savedUser || !token) {
    clearStoredAuth();
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    clearStoredAuth();
    return null;
  }
}

function App() {
  // Persisted user state keeps the app on the right starting page after refresh.
  const [activePage, setActivePage] = useState(() => {
    const user = getStoredUser();

    return user?.role === "MANAGER" || user?.role === "ADMIN"
      ? "manager"
      : "dashboard";
  });

  const [selectedDealId, setSelectedDealId] = useState(null);

  // Authentication stores the active user and backend session token for API calls.
  const [currentUser, setCurrentUser] = useState(() => {
    return getStoredUser();
  });
  const [isCheckingAuth, setIsCheckingAuth] = useState(() => {
    return Boolean(currentUser && localStorage.getItem("authToken"));
  });

  // Backend demo resets clear sessions, so stale browser tokens must be removed.
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!currentUser || !token) {
      return;
    }

    apiFetch("/api/auth/validate")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Session could not be validated.");
        }

        return response.json();
      })
      .then((result) => {
        if (!result.valid) {
          clearStoredAuth();
          setCurrentUser(null);
          setActivePage("dashboard");
        }
      })
      .catch(() => {
        clearStoredAuth();
        setCurrentUser(null);
        setActivePage("dashboard");
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, [currentUser]);

  function openDealFromAnywhere(dealId) {
    setSelectedDealId(dealId);
    setActivePage("deals");
  }

  function loginUser(user, token) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("authToken", token);
    setCurrentUser(user);

    if (user.role === "MANAGER" || user.role === "ADMIN") {
      setActivePage("manager");
    } else {
      setActivePage("dashboard");
    }
  }

  function logoutUser() {
    const token = localStorage.getItem("authToken");

    if (token) {
      apiFetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }).catch(() => {});
    }

    clearStoredAuth();
    setCurrentUser(null);
    setSelectedDealId(null);
    setActivePage("dashboard");
  }

  // Restrict visible pages based on the current user's role.
  function canView(page) {
    if (!currentUser) {
      return false;
    }

    if (currentUser.role === "ADMIN") {
      return true;
    }

    if (currentUser.role === "MANAGER") {
      return ["manager", "deals", "forecast", "pipeline"].includes(page);
    }

    return ["dashboard", "execution", "deals", "forecast", "pipeline"].includes(
      page
    );
  }

  // Navigation goes through permission checks so hidden pages cannot be opened.
  function goToPage(page) {
    if (canView(page)) {
      setActivePage(page);
    }
  }

  if (isCheckingAuth) {
    return (
      <main className="login-page">
        <section className="login-card">
          <h2>Checking Session</h2>
          <p className="subtitle">Preparing your workspace</p>
        </section>
      </main>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={loginUser} />;
  }

  return (
    <main className="app-layout">
      {/* Primary navigation and signed-in user context. */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-mark">📈</div>

          <div>
            <strong>WorkMyDeal</strong>
          </div>
        </div>

        <nav className="sidebar-nav">
          {canView("dashboard") && (
            <button
              className={
                activePage === "dashboard"
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={() => goToPage("dashboard")}
            >
              <span>🏠</span>
              Dashboard
            </button>
          )}

          {canView("execution") && (
            <button
              className={
                activePage === "execution"
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={() => goToPage("execution")}
            >
              <span>✅</span>
              Daily Execution
            </button>
          )}

          {canView("manager") && (
            <button
              className={
                activePage === "manager"
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={() => goToPage("manager")}
            >
              <span>📊</span>
              Manager Dashboard
            </button>
          )}

          {canView("deals") && (
            <button
              className={
                activePage === "deals" ? "sidebar-link active" : "sidebar-link"
              }
              onClick={() => goToPage("deals")}
            >
              <span>📁</span>
              Deals
            </button>
          )}

          {canView("forecast") && (
            <button
              className={
                activePage === "forecast"
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={() => goToPage("forecast")}
            >
              <span>📈</span>
              Forecast
            </button>
          )}

          {canView("pipeline") && (
            <button
              className={
                activePage === "pipeline"
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={() => goToPage("pipeline")}
            >
              <span>📋</span>
              Pipeline Report
            </button>
          )}

          {canView("cadences") && (
            <button
              className={
                activePage === "cadences"
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={() => goToPage("cadences")}
            >
              <span>🔁</span>
              Cadence Rules
            </button>
          )}

          {canView("administration") && (
            <button
              className={
                activePage === "administration"
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={() => goToPage("administration")}
            >
              <span>⚙️</span>
              Administration
            </button>
          )}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{currentUser.name?.charAt(0) || "U"}</div>

          <div>
            <strong>{currentUser.name}</strong>
            <span>{currentUser.role}</span>
          </div>

          <button className="sidebar-logout" onClick={logoutUser}>
            Logout
          </button>
        </div>
      </aside>

      {/* Render the selected workspace without changing the surrounding shell. */}
      <section className="app-content">
        {activePage === "dashboard" && canView("dashboard") && (
          <Dashboard currentUser={currentUser} />
        )}

        {activePage === "execution" && canView("execution") && (
          <ExecutionPage
            currentUser={currentUser}
            onOpenDeal={openDealFromAnywhere}
          />
        )}

        {activePage === "deals" && canView("deals") && (
          <DealsPage currentUser={currentUser} selectedDealId={selectedDealId} />
        )}

        {activePage === "forecast" && canView("forecast") && (
          <ForecastPage currentUser={currentUser} />
        )}

        {activePage === "pipeline" && canView("pipeline") && (
          <PipelinePage currentUser={currentUser} />
        )}

        {activePage === "manager" && canView("manager") && (
          <ManagerDashboard currentUser={currentUser} />
        )}

        {activePage === "administration" && canView("administration") && (
          <AdministrationPage />
        )}

        {activePage === "cadences" && canView("cadences") && <CadencesPage />}
      </section>
    </main>
  );
}

export default App;
