import { useEffect, useState } from "react";

import { apiFetch } from "../api";

function ManagerDashboard({ currentUser }) {
  // Manager view combines team deals, execution work, and optional report state.
  const [deals, setDeals] = useState([]);
  const [executionQueue, setExecutionQueue] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showFullTeamReport, setShowFullTeamReport] = useState(false);

  // Load manager data from the same sources used by rep dashboards.
  function loadData() {
    apiFetch("/api/deals")
      .then((response) => response.json())
      .then((data) => {
        setDeals(data);
      });

    apiFetch("/api/tasks")
      .then((response) => response.json())
      .then((data) => {
        setExecutionQueue(data);
      });

    apiFetch("/api/users")
      .then((response) => response.json())
      .then((data) => setUsers(data));

    apiFetch("/api/activities")
      .then((response) => response.json())
      .then((data) => setActivities(data));
  }

  useEffect(() => {
    loadData();
  }, []);

  // Managers see their direct reports; admins see the full team.
  const managerRepIds = users
    .filter((user) => user.managerId === currentUser?.id)
    .map((user) => user.id);

  const visibleDeals = deals.filter((deal) => {
    if (currentUser?.role === "ADMIN") {
      return true;
    }

    if (currentUser?.role === "MANAGER") {
      return (
        managerRepIds.includes(deal.ownerId) || deal.ownerId === currentUser.id
      );
    }

    return false;
  });

  const visibleDealIds = visibleDeals.map((deal) => deal.id);

  const visibleExecutionQueue = executionQueue.filter((task) =>
    visibleDealIds.includes(task.dealId)
  );

  // Deal groups and task groups drive the manager summary cards.
  const activeDeals = visibleDeals.filter(
    (deal) => deal.dealStatus === "ACTIVE"
  );

  const dormantDeals = visibleDeals.filter(
    (deal) => deal.dealStatus === "DORMANT"
  );

  const requiredTasks = visibleExecutionQueue.filter(
    (task) => task.needsAttention
  );

  const completedOrCurrentTasks = visibleExecutionQueue.filter(
    (task) => !task.needsAttention
  );

  const highPriority = visibleExecutionQueue.filter(
    (task) => task.priorityScore >= 80
  );

  const overdueTasks = visibleExecutionQueue.filter((task) => task.overdue);

  // Forecast math mirrors the rep dashboard but expands to the manager's scope.
  const teamPipeline = activeDeals.reduce(
    (total, deal) => total + Number(deal.dealValue || 0),
    0
  );

  const teamWeightedForecast = activeDeals.reduce((total, deal) => {
    const value = Number(deal.dealValue || 0);
    const probability = Number(deal.probability || 0);

    return total + value * (probability / 100);
  }, 0);

  const ownerSummary = activeDeals.reduce((summary, deal) => {
    const owner = deal.owner || "Unassigned";

    if (!summary[owner]) {
      summary[owner] = {
        count: 0,
        pipeline: 0,
        weighted: 0,
      };
    }

    summary[owner].count += 1;
    summary[owner].pipeline += Number(deal.dealValue || 0);
    summary[owner].weighted +=
      Number(deal.dealValue || 0) * (Number(deal.probability || 0) / 100);

    return summary;
  }, {});

  // Activity trends help managers see whether execution is increasing or slowing.
  const visibleActivities = activities.filter((activity) =>
    visibleDealIds.includes(activity.deal?.id)
  );

  const activityTrendDays = [...Array(7)].map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));

    const dateKey = date.toISOString().split("T")[0];

    return {
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: visibleActivities.filter((activity) =>
        activity.activityDate?.startsWith(dateKey)
      ).length,
    };
  });

  const totalRecentActivities = activityTrendDays.reduce(
    (total, day) => total + day.count,
    0
  );

  const maxActivityCount = Math.max(
    ...activityTrendDays.map((day) => day.count),
    1
  );

  // Utility and action helpers support the optional full team report.
  function reactivateDeal(deal) {
    const updatedDeal = {
      ...deal,
      dealStatus: "ACTIVE",
      contractStatus: "MONTH_TO_MONTH",
    };

    apiFetch(`/api/deals/${deal.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedDeal),
    })
      .then((response) => response.json())
      .then(() => {
        setFeedback("Opportunity reactivated.");
        loadData();
      });
  }

  function exportTeamReportCsv() {
    const headers = [
      "Owner",
      "Active Deals",
      "Pipeline Value",
      "Weighted Forecast",
      "High Priority",
      "Overdue",
      "Required Tasks",
      "Dormant Deals",
    ];

    const rows = Object.keys(ownerSummary).map((owner) => {
      const ownerDeals = activeDeals.filter(
        (deal) => (deal.owner || "Unassigned") === owner
      );

      const ownerExecution = executionQueue.filter((task) =>
        ownerDeals.some((deal) => deal.id === task.dealId)
      );

      return [
        owner,
        ownerSummary[owner].count,
        Math.round(ownerSummary[owner].pipeline),
        Math.round(ownerSummary[owner].weighted),
        ownerExecution.filter((task) => task.priorityScore >= 80).length,
        ownerExecution.filter((task) => task.overdue).length,
        ownerExecution.filter((task) => task.needsAttention).length,
        dormantDeals.length,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "workmydeal-team-report.csv";
    link.click();

    URL.revokeObjectURL(url);
    setFeedback("Team report exported.");
  }

  return (
    <section className="manager-page">
      <div className="manager-header">
        <div>
          <h2>Manager Dashboard - Sales Team</h2>
        </div>

        <div className="manager-header-actions">
          <div className="date-chip">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>

          <button className="refresh-button" onClick={loadData}>
            ↻
          </button>
        </div>
      </div>

      {feedback && <div className="save-feedback">{feedback}</div>}

      {/* Top metrics show team-level pipeline value and risk pressure. */}
      <div className="manager-metric-grid">
        <div className="dashboard-card info-card">
          <p>Team Pipeline</p>
          <strong>${teamPipeline.toLocaleString()}</strong>
        </div>

        <div className="dashboard-card success-card">
          <p>Team Forecast</p>
          <strong>${Math.round(teamWeightedForecast).toLocaleString()}</strong>
        </div>

        <div className="dashboard-card danger-card">
          <p>Overdue Required Tasks</p>
          <strong>{overdueTasks.length}</strong>
        </div>

        <div className="dashboard-card warning-card">
          <p>Dormant Opportunities</p>
          <strong>{dormantDeals.length}</strong>
        </div>
      </div>

      {/* Summary tables help a manager compare ownership and risk quickly. */}
    <div className="manager-summary-grid">
        <div className="history-section manager-table-card">
          <h3>Pipeline by Owner</h3>

          <div className="manager-table">
            <div className="manager-table-row manager-table-header">
              <span>Owner</span>
              <span>Pipeline Value</span>
            </div>

            {Object.entries(ownerSummary).map(([owner, data]) => (
              <div key={owner} className="manager-table-row">
                <span>{owner}</span>
                <strong>${data.pipeline.toLocaleString()}</strong>
              </div>
            ))}

            <div className="manager-table-row manager-table-total">
              <span>Total</span>
              <strong>${teamPipeline.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        <div className="history-section manager-table-card">
          <h3>Risk Summary</h3>

          <div className="manager-table">
            <div className="manager-table-row manager-table-header">
              <span>Risk Level</span>
              <span># Deals</span>
              <span>Pipeline Value</span>
            </div>

            <div className="manager-table-row">
              <span>High</span>
              <span>{highPriority.length}</span>
              <strong>
                $
                {activeDeals
                  .filter((deal) => Number(deal.probability || 0) < 40)
                  .reduce(
                    (total, deal) => total + Number(deal.dealValue || 0),
                    0
                  )
                  .toLocaleString()}
              </strong>
            </div>

            <div className="manager-table-row">
              <span>Medium</span>
              <span>{requiredTasks.length}</span>
              <strong>
                $
                {activeDeals
                  .filter(
                    (deal) =>
                      Number(deal.probability || 0) >= 40 &&
                      Number(deal.probability || 0) < 70
                  )
                  .reduce(
                    (total, deal) => total + Number(deal.dealValue || 0),
                    0
                  )
                  .toLocaleString()}
              </strong>
            </div>

            <div className="manager-table-row">
              <span>Low</span>
              <span>{completedOrCurrentTasks.length}</span>
              <strong>
                $
                {activeDeals
                  .filter((deal) => Number(deal.probability || 0) >= 70)
                  .reduce(
                    (total, deal) => total + Number(deal.dealValue || 0),
                    0
                  )
                  .toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="manager-bottom-actions">
            <button
              className="view-all-link"
              onClick={() => setShowFullTeamReport(!showFullTeamReport)}
            >
              {showFullTeamReport
                ? "Hide Full Team Report"
                : "View Full Team Report"}
            </button>

            <button className="refresh-button" onClick={exportTeamReportCsv}>
              Export Team Report
            </button>
          </div>
      </div>
    </div>

    <div className="history-section manager-table-card">
      <h3>Activity Trend - Last 7 Days</h3>

      <div className="activity-trend-grid">
        {activityTrendDays.map((day) => (
          <div key={day.label} className="activity-trend-column">
            <div className="activity-trend-bar-wrap">
              <div
                className="activity-trend-bar"
                style={{
                  height: `${Math.max((day.count / maxActivityCount) * 100, 8)}%`,
                }}
              ></div>
            </div>
            <strong>{day.count}</strong>
            <span>{day.label}</span>
          </div>
        ))}
      </div>

      <p className="empty-history">
        {totalRecentActivities} logged activities across visible team deals.
      </p>
    </div>

    {/* The expanded report gives more detail without crowding the default view. */}
      {showFullTeamReport && (
        <div className="manager-report-grid">
          <div className="history-section">
            <h3>Owner / Rep Performance</h3>

            {Object.entries(ownerSummary).map(([owner, data]) => (
              <div key={owner} className="manager-report-row">
                <strong>{owner}</strong>
                <span>{data.count} active deals</span>
                <p>
                  Pipeline: ${data.pipeline.toLocaleString()} | Weighted: $
                  {Math.round(data.weighted).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="history-section">
            <h3>Dormant Opportunities</h3>

            {dormantDeals.length === 0 ? (
              <p className="empty-history">No dormant opportunities.</p>
            ) : (
              dormantDeals.map((deal) => (
                <div key={deal.id} className="manager-report-row">
                  <strong>{deal.dealName}</strong>
                  <span>Owner: {deal.owner || "Unassigned"}</span>
                  <p>Contract End: {deal.contractEndDate || "Not set"}</p>

                  <button
                    className="refresh-button"
                    onClick={() => reactivateDeal(deal)}
                  >
                    Reactivate
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ManagerDashboard;
