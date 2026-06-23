import { useEffect, useState } from "react";

import { apiFetch } from "../api";

function PipelinePage({ currentUser }) {
  // Pipeline report state is intentionally small: deals, users, and export feedback.
  const [deals, setDeals] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [users, setUsers] = useState([]);

  // Load deal and user data used for role-scoped reporting.
  function loadDeals() {
    apiFetch("/api/deals")
      .then((response) => response.json())
      .then((data) => setDeals(data));
  }

  function loadUsers() {
    apiFetch("/api/users")
      .then((response) => response.json())
      .then((data) => setUsers(data));
  }

  useEffect(() => {
    loadDeals();
    loadUsers();
  }, []);

  // Restrict pipeline visibility based on the current user's role.
  const managerRepIds = users
    .filter((user) => user.managerId === currentUser?.id)
    .map((user) => user.id);

  const visibleDeals = deals.filter((deal) => {
    if (currentUser?.role === "ADMIN") return true;

    if (currentUser?.role === "MANAGER") {
      return (
        managerRepIds.includes(deal.ownerId) || deal.ownerId === currentUser.id
      );
    }

    if (currentUser?.role === "REP") {
      return (
        deal.ownerId === currentUser.id ||
        (!deal.ownerId && deal.owner === currentUser.name)
      );
    }

    return false;
  });

  // Derived metrics power the top summary cards.
  const activeDeals = visibleDeals.filter(
    (deal) => deal.dealStatus === "ACTIVE"
  );

  const totalPipelineValue = activeDeals.reduce(
    (total, deal) => total + Number(deal.dealValue || 0),
    0
  );

  const weightedForecast = activeDeals.reduce((total, deal) => {
    return (
      total +
      Number(deal.dealValue || 0) * (Number(deal.probability || 0) / 100)
    );
  }, 0);

  const averageProbability =
    activeDeals.length === 0
      ? 0
      : activeDeals.reduce(
          (total, deal) => total + Number(deal.probability || 0),
          0
        ) /
        activeDeals.length;

  const totalOpportunities = activeDeals.length;

  const stageOrder = [
    "QUALIFIED",
    "DISCOVERY",
    "PROPOSAL",
    "NEGOTIATION",
    "VERBAL",
    "CLOSED_WON",
  ];

  const statusOrder = [
    { key: "ACTIVE", color: "#2563eb" },
    { key: "DORMANT", color: "#94a3b8" },
    { key: "CRITICAL_REVIEW", color: "#dc2626" },
    { key: "CLOSED_WON", color: "#16a34a" },
    { key: "ARCHIVED", color: "#64748b" },
  ];

  // Display helpers keep chart labels and status visuals consistent.
  function formatEnumText(value) {
    if (!value) return "N/A";

    return value
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function getStageValue(stage) {
    return activeDeals
      .filter((deal) => deal.stage === stage)
      .reduce((total, deal) => total + Number(deal.dealValue || 0), 0);
  }

  function getStatusCount(status) {
    return visibleDeals.filter(
      (deal) => deal.dealStatus === status || deal.stage === status
    ).length;
  }

  function getStatusDonutGradient() {
    const total = statusOrder.reduce(
      (sum, status) => sum + getStatusCount(status.key),
      0
    );

    if (total === 0) {
      return "#e2e8f0";
    }

    let currentPercent = 0;

    return `conic-gradient(${statusOrder
      .map((status) => {
        const count = getStatusCount(status.key);
        const start = currentPercent;
        const end = currentPercent + (count / total) * 100;

        currentPercent = end;

        return `${status.color} ${start}% ${end}%`;
      })
      .join(", ")})`;
  }

  function exportPipelineCsv() {
    const headers = [
      "Deal",
      "Company",
      "Stage",
      "Status",
      "Deal Type",
      "Owner",
      "Value",
      "Probability",
      "Expected Close Date",
      "Last Contact",
      "Next Follow-Up",
    ];

    const rows = activeDeals.map((deal) => [
      deal.dealName,
      deal.companyName,
      deal.stage,
      deal.dealStatus,
      deal.dealType,
      deal.owner,
      Number(deal.dealValue || 0),
      `${deal.probability || 0}%`,
      deal.expectedCloseDate || "",
      deal.lastContactDate || "",
      deal.nextFollowUpDate || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "workmydeal-pipeline-export.csv";
    link.click();

    URL.revokeObjectURL(url);
    setFeedback("Pipeline CSV exported.");
  }

  return (
    <section className="pipeline-page">
      <div className="pipeline-report-header">
        <div>
          <h2>Pipeline Report</h2>
        </div>

        <div className="pipeline-header-actions">
          <label>
            Date Range:
            <select className="date-chip">
              <option>This Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </label>

          <button className="work-button" onClick={exportPipelineCsv}>
            Export CSV
          </button>
        </div>
      </div>

      {feedback && <div className="save-feedback">{feedback}</div>}

      <div className="pipeline-report-metrics">
        <div className="dashboard-card info-card">
          <p>Total Pipeline Value</p>
          <strong>${totalPipelineValue.toLocaleString()}</strong>
        </div>

        <div className="dashboard-card success-card">
          <p>Weighted Forecast</p>
          <strong>${Math.round(weightedForecast).toLocaleString()}</strong>
        </div>

        <div className="dashboard-card warning-card">
          <p>Avg. Win Probability</p>
          <strong>{Math.round(averageProbability)}%</strong>
        </div>

        <div className="dashboard-card purple-card">
          <p>Total Opportunities</p>
          <strong>{totalOpportunities}</strong>
        </div>
      </div>

      <div className="pipeline-report-grid">
        <div className="history-section pipeline-report-card">
          <h3>Pipeline by Stage</h3>

          <div className="pipeline-chart-bars">
            {stageOrder.map((stage) => {
              const value = getStageValue(stage);
              const maxValue = Math.max(...stageOrder.map(getStageValue), 1);
        const heightPercent = Math.max(
          (value / maxValue) * 100,
          value > 0 ? 18 : 0
        );

              return (
                <div key={stage} className="pipeline-chart-column">
                  <div className="pipeline-chart-area">
                    <div
                      className={
                        stage === "CLOSED_WON"
                          ? "pipeline-chart-bar closed-bar"
                          : "pipeline-chart-bar"
                      }
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>

                  <span>{formatEnumText(stage)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="history-section pipeline-report-card">
          <h3>By Status</h3>

          <div className="status-chart-layout">
            <div
              className="status-donut"
              style={{ background: getStatusDonutGradient() }}
            >
              <div className="status-donut-hole"></div>
            </div>

            <div className="status-summary-list">
              {statusOrder.map((status) => (
                <div key={status.key} className="status-summary-row">
                  <span>{formatEnumText(status.key)}</span>
                  <strong>{getStatusCount(status.key)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PipelinePage;
