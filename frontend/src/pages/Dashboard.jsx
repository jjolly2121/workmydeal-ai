import { useCallback, useEffect, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { apiFetch } from "../api";

function Dashboard({ currentUser }) {
  // Dashboard state combines deal records, daily work, and users for role scope.
  const [deals, setDeals] = useState([]);
  const [executionQueue, setExecutionQueue] = useState([]);
  const [users, setUsers] = useState([]);

  // Load the dashboard sources separately so each API stays easy to trace.
  const loadDashboardData = useCallback(() => {
    apiFetch("/api/deals")
      .then((response) => response.json())
      .then((data) => setDeals(data));

    apiFetch(
      `/api/tasks?userId=${
        currentUser.id
      }&role=${currentUser.role}&name=${encodeURIComponent(currentUser.name)}`
    )
      .then((response) => response.json())
      .then((data) => setExecutionQueue(data));

    apiFetch("/api/users")
      .then((response) => response.json())
      .then((data) => setUsers(data));
  }, [currentUser.id, currentUser.name, currentUser.role]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const today = new Date().toISOString().split("T")[0];

  // Restrict visible deals based on the current user's role.
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

    if (currentUser?.role === "REP") {
      return (
        deal.ownerId === currentUser.id ||
        (!deal.ownerId && deal.owner === currentUser.name)
      );
    }

    return false;
  });

  // Derived deal groups drive the summary cards and charts.
  const activeDeals = visibleDeals.filter(
    (deal) => deal.dealStatus === "ACTIVE"
  );

  const dormantDeals = visibleDeals.filter(
    (deal) => deal.dealStatus === "DORMANT"
  );

  const archivedDeals = visibleDeals.filter(
    (deal) => deal.dealStatus === "ARCHIVED"
  );

  const visibleDealIds = visibleDeals.map((deal) => deal.id);

  const visibleExecutionQueue = executionQueue.filter((task) =>
    visibleDealIds.includes(task.dealId)
  );

  // Daily execution metrics separate required work from optional stretch work.
  const requiredTasks = visibleExecutionQueue.filter(
    (task) => task.needsAttention
  );
  const stretchTasks = visibleExecutionQueue.filter(
    (task) => !task.needsAttention
  );

  const requiredRemaining = requiredTasks.filter((task) => !task.completed);
  const stretchRemaining = stretchTasks.filter((task) => !task.completed);

  const highPriority = visibleExecutionQueue.filter(
    (task) => task.priorityScore >= 80 && !task.completed
  );

  const overdueTasks = visibleExecutionQueue.filter(
    (task) => task.overdue && !task.completed
  );

  // Forecast totals use active deals only, matching the working pipeline view.
  const pipelineValue = activeDeals.reduce((total, deal) => {
    return total + Number(deal.dealValue || 0);
  }, 0);

  const weightedForecast = activeDeals.reduce((total, deal) => {
    const value = Number(deal.dealValue || 0);
    const probability = Number(deal.probability || 0);

    return total + value * (probability / 100);
  }, 0);

  const topDeals = [...visibleExecutionQueue]
    .filter((task) => !task.completed)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5);

  const topDealsWithDetails = topDeals.map((task) => {
    const matchingDeal = visibleDeals.find((deal) => deal.id === task.dealId);

    return {
      ...task,
      companyName: matchingDeal?.companyName || "N/A",
      dealValue: matchingDeal?.dealValue || 0,
      expectedCloseDate: matchingDeal?.expectedCloseDate || "Not set",
    };
  });

  const currentMonth = new Date().toISOString().slice(0, 7);

  const currentMonthDeals = visibleDeals.filter((deal) => {
    const closeDate = deal.expectedCloseDate || deal.contractEndDate;

    if (!closeDate) {
      return false;
    }

    return closeDate.slice(0, 7) === currentMonth;
  });

  const criticalReviewDeals = currentMonthDeals.filter(
    (deal) =>
      deal.dealStatus === "CRITICAL_REVIEW" ||
      deal.lifecycleState === "CRITICAL_REVIEW" ||
      deal.stage === "AT_RISK"
  );

  const closedWonDeals = currentMonthDeals.filter(
    (deal) => deal.dealStatus === "CLOSED_WON" || deal.stage === "CLOSED_WON"
  );

  const statusData = [
    {
      name: "Active",
      value: activeDeals.length,
    },
    {
      name: "Dormant",
      value: dormantDeals.length,
    },
    {
      name: "Critical Review",
      value: criticalReviewDeals.length,
    },
    {
      name: "Closed Won",
      value: closedWonDeals.length,
    },
    {
      name: "Archived",
      value: archivedDeals.length,
    },
  ];

  const totalDeals =
    activeDeals.length +
    dormantDeals.length +
    criticalReviewDeals.length +
    closedWonDeals.length +
    archivedDeals.length;

  // Formatting helpers keep dashboard labels compact.
  function formatMoney(value) {
    const number = Number(value || 0);

    if (number >= 1000000) {
      return `$${(number / 1000000).toFixed(1)}M`;
    }

    if (number >= 1000) {
      return `$${Math.round(number / 1000)}K`;
    }

    return `$${number.toLocaleString()}`;
  }

  function formatDate(dateValue) {
    if (!dateValue || dateValue === "Not set") {
      return "Not set";
    }

    const date = new Date(dateValue + "T00:00:00");

    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "2-digit",
      year: "2-digit",
    });
  }

  function shortenText(text, maxLength = 14) {
    if (!text) return "N/A";

    return text.length > maxLength ? text.slice(0, maxLength) + "" : text;
  }

  return (
    <section className="dashboard-page">
      <div className="section-header">
        <div>
          <h2>Dashboard</h2>
        </div>

        <div className="date-chip">{new Date().toLocaleDateString()}</div>
      </div>

      {/* Summary cards give the rep a quick read on today's work and value. */}
      <div className="dashboard-grid dashboard-grid-five">
        <div className="dashboard-card danger-card">
          <p>High Priority</p>
          <strong>{highPriority.length}</strong>
          <span>Deals</span>
        </div>

        <div className="dashboard-card warning-card">
          <p>Required Tasks</p>
          <strong>{requiredRemaining.length}</strong>
          <span>Due Today</span>
        </div>

        <div className="dashboard-card info-card">
          <p>Stretch Tasks</p>
          <strong>{stretchRemaining.length}</strong>
          <span>Available</span>
        </div>

        <div className="dashboard-card success-card">
          <p>Pipeline Value</p>
          <strong>{formatMoney(pipelineValue)}</strong>
          <span>Total</span>
        </div>

        <div className="dashboard-card purple-card">
          <p>Weighted Forecast</p>
          <strong>{formatMoney(weightedForecast)}</strong>
          <span>This Month</span>
        </div>
      </div>

      {/* Visual summaries mirror the dashboard cards with more detail. */}
      <div className="dashboard-main">
        <div className="chart-card">
          <h3>Deal Status Overview - Current Month</h3>

          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={38}
                outerRadius={60}
              >
                <Cell fill="#2563eb" />
                <Cell fill="#f59e0b" />
                <Cell fill="#dc2626" />
                <Cell fill="#16a34a" />
                <Cell fill="#64748b" />
              </Pie>

              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  fill: "#0f172a",
                }}
              >
                {totalDeals}
              </text>

              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: "11px",
                  fill: "#64748b",
                }}
              >
                Total Deals
              </text>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="chart-legend">
            <div>
              <span className="legend-dot active"></span> Active (
              {activeDeals.length})
            </div>
            <div>
              <span className="legend-dot dormant"></span> Dormant (
              {dormantDeals.length})
            </div>
            <div>
              <span className="legend-dot critical"></span> Critical Review (
              {criticalReviewDeals.length})
            </div>
            <div>
              <span className="legend-dot closed"></span> Closed Won (
              {closedWonDeals.length})
            </div>
            <div>
              <span className="legend-dot archived"></span> Archived (
              {archivedDeals.length})
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Top 5 Opportunities by Priority</h3>

          {topDeals.length === 0 ? (
            <p className="empty-history">No open priority opportunities.</p>
          ) : (
            <div className="priority-table">
              <div className="priority-row priority-header">
                <span>Deal</span>
                <span>Company</span>
                <span>Priority</span>
                <span>Value</span>
                <span>Close Date</span>
              </div>

              {topDealsWithDetails.map((deal) => (
                <div
                  key={deal.dealId}
                  className="priority-row priority-row-five"
                >
                  <strong>{shortenText(deal.dealName, 14)}</strong>
                  <span>{shortenText(deal.companyName, 16)}</span>
                  <span>{deal.priorityScore}</span>
                  <span>${Number(deal.dealValue || 0).toLocaleString()}</span>
                  <span>{formatDate(deal.expectedCloseDate)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alert cards call out work that needs immediate review. */}
      <div className="dashboard-main alert-row">
        <div className="chart-card alert-card">
          <div className="alert-content">
            <div className="alert-icon document-icon"></div>

            <div className="alert-text">
              <h3>Overdue Required Tasks</h3>
              <strong>{overdueTasks.length}</strong>
              <p>Require your attention</p>
            </div>
          </div>
        </div>

        <div className="chart-card renewal-card">
          <div className="alert-content">
            <div className="alert-icon renewal-icon"></div>

            <div className="alert-text">
              <h3>Contract Renewals Next 120 Days</h3>
              <strong>
                {
                  activeDeals.filter((deal) => {
                    if (!deal.contractEndDate) {
                      return false;
                    }

                    const contractDate = new Date(deal.contractEndDate);
                    const todayDate = new Date(today);
                    const daysUntilExpiration =
                      (contractDate - todayDate) / (1000 * 60 * 60 * 24);

                    return (
                      deal.contractStatus === "IN_CONTRACT" &&
                      daysUntilExpiration >= 0 &&
                      daysUntilExpiration <= 120
                    );
                  }).length
                }
              </strong>
              <p>Require review</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
