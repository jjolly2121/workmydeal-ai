import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "../api";

function ForecastPage({ currentUser }) {
  // Forecast state controls deal data, insight data, and optional filters.
  const [deals, setDeals] = useState([]);
  const [forecastInsights, setForecastInsights] = useState([]);
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [ownerFilter, setOwnerFilter] = useState("ALL");
  const [feedback, setFeedback] = useState("");
  const [users, setUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [stageFilter, setStageFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const canFilterOwners =
    currentUser?.role === "MANAGER" || currentUser?.role === "ADMIN";

  const loadUsers = useCallback(() => {
    apiFetch("/api/users")
      .then((response) => response.json())
      .then((data) => setUsers(data));
  }, []);

  const loadForecastInsights = useCallback((dealData) => {
    const activeDealData = dealData.filter(
      (deal) => deal.dealStatus === "ACTIVE"
    );

    Promise.all(
      activeDealData.map((deal) =>
        apiFetch(`/api/forecast/deals/${deal.id}/insight`).then(
          (response) => response.json()
        )
      )
    ).then((data) => setForecastInsights(data));
  }, []);

  // Forecast insights are loaded after deals so each active opportunity can be scored.
  const loadDeals = useCallback(() => {
    apiFetch("/api/deals")
      .then((response) => response.json())
      .then((data) => {
        setDeals(data);
        loadForecastInsights(data);
      });
  }, [loadForecastInsights]);

  useEffect(() => {
    loadDeals();
    loadUsers();
  }, [loadDeals, loadUsers]);

  // Helpers centralize forecast dates, labels, and weighted value math.
  function getForecastInsight(id) {
    return forecastInsights.find((item) => item.dealId === id);
  }

  function getWeightedValue(deal) {
    return Number(deal.dealValue || 0) * (Number(deal.probability || 0) / 100);
  }

  function getMonthOptions() {
    const now = new Date();

    return [0, 1, 2].map((offset) => {
      const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);

      return {
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`,
        label: date.toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
      };
    });
  }

  function getCloseDate(deal) {
    const insight = getForecastInsight(deal.id);
    return deal.expectedCloseDate || insight?.predictedCloseDate || null;
  }

  function getForecastBucketLabel(deal) {
    const closeDate = getCloseDate(deal);

    if (!closeDate) {
      return "Unscheduled";
    }

    const closeMonth = closeDate.slice(0, 7);
    const matchingMonth = monthOptions.find(
      (month) => month.value === closeMonth
    );

    return matchingMonth ? matchingMonth.label : "Outside Forecast";
  }

  // Forecast controls cover the current month, next two months, or all buckets.
  const monthOptions = getMonthOptions();

  const selectedMonthLabel =
    monthFilter === "ALL"
      ? "All Forecast Months"
      : monthOptions.find((month) => month.value === monthFilter)?.label ||
        "Forecast";

  const activeDeals = deals.filter((deal) => deal.dealStatus === "ACTIVE");

  // Restrict forecast visibility to the signed-in user's role.
  const managerRepIds = users
    .filter((user) => user.managerId === currentUser?.id)
    .map((user) => user.id);

  const visibleDeals = activeDeals.filter((deal) => {
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

  const owners = [
    "ALL",
    ...new Set(visibleDeals.map((deal) => deal.owner).filter(Boolean)),
  ];

  // Apply month, owner, stage, and risk filters before calculating totals.
  const filteredDeals = visibleDeals.filter((deal) => {
    const closeDate = getCloseDate(deal);

    if (!closeDate) return false;

    const closeMonth = closeDate.slice(0, 7);
    const forecastMonths = monthOptions.map((month) => month.value);
    const currentMonth = forecastMonths[0];
    const nextMonth = forecastMonths[1];
    const thirdMonth = forecastMonths[2];

    let monthMatch;

    if (monthFilter === "ALL") {
      monthMatch =
        closeMonth <= currentMonth ||
        closeMonth === nextMonth ||
        closeMonth === thirdMonth;
    } else if (monthFilter === currentMonth) {
      monthMatch = closeMonth <= currentMonth;
    } else {
      monthMatch = closeMonth === monthFilter;
    }

    const ownerMatch = ownerFilter === "ALL" || deal.owner === ownerFilter;
    const stageMatch = stageFilter === "ALL" || deal.stage === stageFilter;

    const insight = getForecastInsight(deal.id);
    const riskMatch =
      riskFilter === "ALL" || insight?.forecastRisk === riskFilter;

    return monthMatch && ownerMatch && stageMatch && riskMatch;
  });

  const closedOpportunityTotal = deals.filter((deal) => {
    const isClosedWon =
      deal.stage === "CLOSED_WON" || deal.dealStatus === "CLOSED_WON";

    if (!isClosedWon || !deal.expectedCloseDate) return false;

    const closeMonth = deal.expectedCloseDate.slice(0, 7);
    const forecastMonths = monthOptions.map((month) => month.value);

    if (monthFilter === "ALL") {
      return forecastMonths.includes(closeMonth);
    }

    return closeMonth === monthFilter;
  }).length;

  const weightedForecast = filteredDeals.reduce(
    (total, deal) => total + getWeightedValue(deal),
    0
  );

  const pipelineValue = filteredDeals.reduce(
    (total, deal) => total + Number(deal.dealValue || 0),
    0
  );

  const missingCloseDates = visibleDeals.filter(
    (deal) => !getCloseDate(deal)
  ).length;

  // Export mirrors the visible forecast table and insight columns.
  function handleExportForecast() {
    const headers = [
      "Deal",
      "Close Date",
      "Forecast Bucket",
      "Confidence",
      "Risk",
      "Value",
      "Probability",
      "Weighted",
      "Reason",
    ];

    const rows = filteredDeals.map((deal) => {
      const insight = getForecastInsight(deal.id);
      const closeDate = getCloseDate(deal);

      return [
        deal.dealName,
        closeDate || "",
        getForecastBucketLabel(deal),
        insight?.confidenceLevel || "",
        insight?.forecastRisk || "",
        Number(deal.dealValue || 0),
        `${deal.probability || 0}%`,
        Math.round(getWeightedValue(deal)),
        insight?.reason || "",
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
    link.download = "workmydeal-forecast-intelligence-export.csv";
    link.click();

    URL.revokeObjectURL(url);
    setFeedback("Forecast intelligence CSV exported.");
  }

  return (
    <section className="forecast-page">
      <div className="forecast-page-header">
        <h2>Forecast - {selectedMonthLabel}</h2>

        <div className="forecast-header-actions">
          <select
            className="date-chip"
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
          >
            <option value="ALL">All Forecast Months</option>

            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <button
            className="refresh-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="forecast-filter-panel">
          <label>
            Stage
            <select
              value={stageFilter}
              onChange={(event) => setStageFilter(event.target.value)}
            >
              <option value="ALL">All Stages</option>
              <option value="NEW_LEAD">New Lead</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="DISCOVERY">Discovery</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="VERBAL">Verbal</option>
            </select>
          </label>

          <label>
            Risk
            <select
              value={riskFilter}
              onChange={(event) => setRiskFilter(event.target.value)}
            >
              <option value="ALL">All Risk</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="AT_RISK">At Risk</option>
            </select>
          </label>
        </div>
      )}

      {feedback && <div className="save-feedback">{feedback}</div>}

      {missingCloseDates > 0 && (
        <div className="conflict-warning">
          Missing close dates detected: {missingCloseDates} active
          opportunities are using predicted close logic.
        </div>
      )}

      {canFilterOwners && (
        <div className="forecast-controls compact-forecast-controls">
          <label>
            Owner
            <select
              value={ownerFilter}
              onChange={(event) => setOwnerFilter(event.target.value)}
            >
              {owners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="forecast-metric-grid">
        <div className="dashboard-card info-card">
          <p>Total Pipeline Value</p>
          <strong>${pipelineValue.toLocaleString()}</strong>
        </div>

        <div className="dashboard-card success-card">
          <p>Weighted Forecast</p>
          <strong>${Math.round(weightedForecast).toLocaleString()}</strong>
        </div>

        <div className="dashboard-card danger-card">
          <p>Closed Won (MTD)</p>
          <strong>{closedOpportunityTotal}</strong>
        </div>

        <div className="dashboard-card info-card">
          <p>Open Opportunities</p>
          <strong>{filteredDeals.length}</strong>
        </div>
      </div>

      <div className="forecast-table">
        {/* Forecast table shows filtered opportunities and weighted value. */}
        <div className="forecast-row forecast-header">
          <div>Company</div>
          <div>Deal Value</div>
          <div>Probability</div>
          <div>Weighted Forecast</div>
          <div>Close Date</div>
          <div>Stage</div>
        </div>

        {filteredDeals.length === 0 ? (
          <div className="empty-history">
            No opportunities match current filters.
          </div>
        ) : (
          filteredDeals.map((deal) => {
            const closeDate = getCloseDate(deal);

            return (
              <div key={deal.id} className="forecast-row">
                <div>{deal.companyName || deal.dealName}</div>
                <div>${Number(deal.dealValue || 0).toLocaleString()}</div>
                <div>{deal.probability || 0}%</div>
                <div>
                  ${Math.round(getWeightedValue(deal)).toLocaleString()}
                </div>
                <div>{closeDate || "Unscheduled"}</div>
                <div>{deal.stage?.replaceAll("_", " ") || "N/A"}</div>
              </div>
            );
          })
        )}

        <div className="forecast-total-row">
          <div className="forecast-total">
            <h3>Total Weighted Forecast</h3>
            <strong>${Math.round(weightedForecast).toLocaleString()}</strong>
          </div>

          <button className="refresh-button" onClick={handleExportForecast}>
            Export Forecast
          </button>
        </div>
      </div>
    </section>
  );
}

export default ForecastPage;
