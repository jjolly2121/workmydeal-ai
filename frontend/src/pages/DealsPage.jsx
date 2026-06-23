import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "../api";

function DealsPage({ currentUser, selectedDealId }) {
  // Page state is grouped around deal selection, feedback, and form visibility.
  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activities, setActivities] = useState([]);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [importStatus, setImportStatus] = useState("");
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [reactivationHistory, setReactivationHistory] = useState([]);

  const [activityData, setActivityData] = useState({
    activityType: "CALL",
    outcome: "SPOKE_WITH_CONTACT",
    notes: "",
  });

  const [newDealData, setNewDealData] = useState({
    dealName: "",
    companyName: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    contactInformation: "",
    dealValue: "",
    probability: 25,
    stage: "NEW_LEAD",
    dealStatus: "ACTIVE",
    dealType: "COMMERCIAL",
    expectedCloseDate: "",
    contractStatus: "NONE",
    owner: currentUser?.name || "",
    notes: "",
  });

  // Load core deal data from the Spring Boot API.
  function loadDeals() {
    apiFetch("/api/deals")
      .then((response) => response.json())
      .then((data) => {
        setDeals(data);
      });
  }

  const loadActivities = useCallback((dealId) => {
    apiFetch(`/api/deals/${dealId}/activities`)
      .then((response) => response.json())
      .then((data) => setActivities(data));
  }, []);

  function loadUsers() {
    apiFetch("/api/users")
      .then((response) => response.json())
      .then((data) => setUsers(data));
  }

  const loadStatusHistory = useCallback((dealId) => {
    apiFetch(`/api/deals/${dealId}/history`)
      .then((response) => response.json())
      .then((data) => setStatusHistory(data));
  }, []);

  const loadNotes = useCallback((dealId) => {
    apiFetch(`/api/deals/${dealId}/notes`)
      .then((response) => response.json())
      .then((data) => setNotes(data));
  }, []);

  const loadReactivationHistory = useCallback((dealId) => {
    apiFetch(`/api/deals/${dealId}/reactivation/history`)
      .then((response) => response.json())
      .then((data) => setReactivationHistory(data));
  }, []);

  // Initial page load brings in both deals and users for role-aware filtering.
  useEffect(() => {
    loadDeals();
    loadUsers();
  }, []);

  // Allow other pages to deep-link directly into a selected deal.
  // Selecting a deal also refreshes the related activity and lifecycle context.
  const handleSelectDeal = useCallback((deal) => {
    setSelectedDeal(deal);
    setEditData(deal);
    setFeedback("");
    setError("");
    setIsEditing(false);
    setShowMoreActions(false);
    setShowActivityForm(false);

    loadActivities(deal.id);
    loadStatusHistory(deal.id);
    loadNotes(deal.id);
    loadReactivationHistory(deal.id);
  }, [loadActivities, loadStatusHistory, loadNotes, loadReactivationHistory]);

  useEffect(() => {
    if (selectedDealId === null) {
      return;
    }

    const matchingDeal = deals.find((deal) => deal.id === selectedDealId);

    if (matchingDeal) {
      queueMicrotask(() => handleSelectDeal(matchingDeal));
    }
  }, [selectedDealId, deals, handleSelectDeal]);

  // Shared form handlers keep create, edit, and activity forms controlled.
  function handleInputChange(event) {
    const { name, value } = event.target;
    setEditData({ ...editData, [name]: value });
  }

  function handleCreateInput(event) {
    const { name, value } = event.target;
    setNewDealData({ ...newDealData, [name]: value });
  }

  function handleActivityInput(event) {
    const { name, value } = event.target;
    setActivityData({ ...activityData, [name]: value });
  }

  // Keep validation close to the save/create actions that rely on it.
  function validateDeal(data) {
    if (!data.dealName || !data.dealName.trim()) {
      return "Deal name is required.";
    }

    if (!data.companyName || !data.companyName.trim()) {
      return "Company name is required.";
    }

    if (Number(data.dealValue) <= 0) {
      return "Deal value must be greater than 0.";
    }

    if (Number(data.probability) < 0 || Number(data.probability) > 100) {
      return "Probability must be between 0 and 100.";
    }

    return "";
  }

  // Reset uses the signed-in rep as the default owner for newly created deals.
  function resetNewDealForm() {
    setNewDealData({
      dealName: "",
      companyName: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      contactInformation: "",
      dealValue: "",
      probability: 25,
      stage: "NEW_LEAD",
      dealStatus: "ACTIVE",
      dealType: "COMMERCIAL",
      expectedCloseDate: "",
      contractStatus: "NONE",
      owner: currentUser?.name || "",
      notes: "",
    });
  }

  // Create and save flows normalize numeric/date fields before sending to the API.
  function handleCreateDeal() {
    setFeedback("");
    setError("");

    const validationError = validateDeal(newDealData);

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      ...newDealData,
      owner: currentUser.name,
      ownerId: currentUser.id,
      dealValue: Number(newDealData.dealValue),
      probability: Number(newDealData.probability),
      expectedCloseDate: newDealData.expectedCloseDate || null,
      contractEndDate: newDealData.contractEndDate || null,
    };

    apiFetch("/api/deals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Deal could not be created.");
        }

        return response.json();
      })
      .then((createdDeal) => {
        setSelectedDeal(createdDeal);
        setEditData(createdDeal);
        setFeedback("Deal created successfully.");
        setShowCreateForm(false);
        resetNewDealForm();
        loadDeals();
        loadActivities(createdDeal.id);
        loadStatusHistory(createdDeal.id);
      })
      .catch((err) => {
        setError(`Deal could not be created: ${err.message}`);
      });
  }

  // CSV import is kept on this page so reps can bulk-load deal records in context.
  function handleImportCsv() {
    if (!importFile) {
      const message = "Please select a CSV or XLSX file first.";

      setError(message);
      setImportStatus(message);
      return;
    }

    setFeedback("");
    setError("");
    setImportStatus(`Uploading ${importFile.name}...`);
    setIsEditing(false);
    setShowMoreActions(false);

    const formData = new FormData();
    formData.append("file", importFile);
    formData.append("ownerId", currentUser.id);
    formData.append("ownerName", currentUser.name);

    apiFetch("/api/import/csv", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Import failed.");
        }

        return response.json();
      })
      .then((result) => {
        const message = `Import complete. Imported: ${result.imported} | Skipped: ${result.skipped} | Errors: ${result.errors}`;

        setFeedback(message);
        setImportStatus(message);
        window.alert(message);
        setImportFile(null);
        loadDeals();
      })
      .catch(() => {
        const message = "Import failed. Check the file format and try again.";

        setError(message);
        setImportStatus(message);
        window.alert(message);
      });
  }

  function handleSaveDeal() {
    setFeedback("");
    setError("");

    const validationError = validateDeal(editData);

    if (validationError) {
      setError(validationError);
      return;
    }

    const updatedDeal = {
      ...editData,
      notes: editData.notes || "",
      dealValue: Number(editData.dealValue),
      probability: Number(editData.probability),
      expectedCloseDate: editData.expectedCloseDate || null,
      contractEndDate: editData.contractEndDate || null,
      noticeWindowStartDays: Number(editData.noticeWindowStartDays || 120),
      noticeWindowEndDays: Number(editData.noticeWindowEndDays || 90),
      renewalTermMonths: Number(editData.renewalTermMonths || 12),
    };

    if (updatedDeal.stage === "CLOSED_WON") {
      updatedDeal.dealStatus = "CLOSED_WON";
    }

    if (updatedDeal.dealStatus === "CLOSED_WON") {
      updatedDeal.stage = "CLOSED_WON";
    }

    apiFetch(`/api/deals/${selectedDeal.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedDeal),
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Deal could not be saved.");
        }

        return response.json();
      })
      .then((savedDeal) => {
        setSelectedDeal(savedDeal);
        setEditData(savedDeal);
        setIsEditing(false);
        setFeedback(
          "Deal saved. Priority, forecast, and execution data will recalculate."
        );
        loadDeals();
        loadStatusHistory(savedDeal.id);
      })
      .catch((err) => {
        setError(`Deal could not be saved: ${err.message}`);
      });
  }

  // Quick status actions reuse the same update endpoint as the full edit form.
  function markClosedWon() {
    setFeedback("");
    setError("");

    const updatedDeal = {
      ...editData,
      dealStatus: "CLOSED_WON",
      stage: "CLOSED_WON",
    };

    apiFetch(`/api/deals/${selectedDeal.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedDeal),
    })
      .then((response) => response.json())
      .then((savedDeal) => {
        setSelectedDeal(savedDeal);
        setEditData(savedDeal);
        setFeedback(
          "Deal saved. Priority, forecast, and execution data will recalculate."
        );
        setIsEditing(false);
        loadDeals();
        loadStatusHistory(savedDeal.id);
      });
  }

  // Activity notes stay attached to the selected opportunity.
  function saveActivity() {
    apiFetch(`/api/deals/${selectedDeal.id}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activityData),
    }).then(() => {
      setFeedback("Activity saved.");
      setShowActivityForm(false);
      setActivityData({
        activityType: "CALL",
        outcome: "SPOKE_WITH_CONTACT",
        notes: "",
      });
      loadActivities(selectedDeal.id);
    });
  }

  function saveNote() {
    if (!noteText.trim()) {
      setError("Note text is required.");
      return;
    }

    apiFetch(`/api/deals/${selectedDeal.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: currentUser?.id,
        authorName: currentUser?.name,
        noteText,
      }),
    }).then(() => {
      setFeedback("Note saved.");
      setNoteText("");
      loadNotes(selectedDeal.id);
    });
  }

  function cancelEdit() {
    setEditData(selectedDeal);
    setIsEditing(false);
    setFeedback("");
    setError("");
  }

  function cancelActivity() {
    setShowActivityForm(false);
    setActivityData({
      activityType: "CALL",
      outcome: "SPOKE_WITH_CONTACT",
      notes: "",
    });
    setFeedback("");
    setError("");
  }

  // Formatting helpers keep enum and money display consistent across the page.
  function formatEnumText(value) {
    if (!value) {
      return "N/A";
    }

    return value
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

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

  function updateDealStatus(status) {
    setFeedback("");
    setError("");

    const updatedDeal = {
      ...editData,
      dealStatus: status,
    };

    apiFetch(`/api/deals/${selectedDeal.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedDeal),
    })
      .then((response) => response.json())
      .then((savedDeal) => {
        setSelectedDeal(savedDeal);
        setEditData(savedDeal);
        setFeedback(`Opportunity moved to ${formatEnumText(status)}.`);
        loadDeals();
        loadStatusHistory(savedDeal.id);
        loadReactivationHistory(savedDeal.id);
      });
  }

  // Managers see their reps' deals; reps see only their own assigned deals.
  const managerRepIds = users
    .filter((user) => user.managerId === currentUser?.id)
    .map((user) => user.id);

  const visibleDeals = deals.filter((deal) => {
    if (deal.dealStatus !== "ACTIVE") {
      return false;
    }

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

  const canViewLifecycleHistory =
    currentUser?.role === "MANAGER" || currentUser?.role === "ADMIN";

  const normalizedSearch = searchTerm.trim().toLowerCase();

  // Require at least two characters so large deal lists do not flood the page.
  const filteredDeals =
    normalizedSearch.length < 2
      ? []
      : visibleDeals.filter((deal) => {
          return (
            deal.dealName?.toLowerCase().includes(normalizedSearch) ||
            deal.companyName?.toLowerCase().includes(normalizedSearch) ||
            deal.contactName?.toLowerCase().includes(normalizedSearch) ||
            deal.contactEmail?.toLowerCase().includes(normalizedSearch) ||
            deal.stage?.toLowerCase().includes(normalizedSearch) ||
            deal.dealStatus?.toLowerCase().includes(normalizedSearch)
          );
        });

  const visibleActivities = showAllActivities
    ? activities
    : activities.slice(0, 3);

  return (
    <section className="deals-page">
      {/* Header actions expose creation, import, and secondary deal status tools. */}
      <div className="deals-page-header">
        <div>
          <h2>Deals</h2>
          <p>Opportunity management</p>
        </div>

        <div className="deal-actions">
          <button
            className="refresh-button"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? "Close" : "Create"}
          </button>

          <label className="small-import-button">
            Import
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(event) => {
                const file = event.target.files[0];

                setImportFile(file);
                setFeedback("");
                setError("");
                setImportStatus(
                  file ? `${file.name} selected. Click Upload.` : ""
                );
              }}
            />
          </label>

          {importFile && (
            <button
              className="refresh-button compact-button"
              onClick={handleImportCsv}
            >
              Upload
            </button>
          )}

          {selectedDeal && editData && (
            <>
              <button
                className="refresh-button"
                onClick={() => setShowMoreActions(!showMoreActions)}
              >
                More ▾
              </button>
            </>
          )}
        </div>
      </div>

      {importStatus && (
        <div className="import-status-message">{importStatus}</div>
      )}

      {feedback && <div className="save-feedback">{feedback}</div>}
      {error && <div className="form-error">{error}</div>}

      {/* Search keeps the main page focused until the user chooses a specific deal. */}
      <div className="deal-finder">
        <input
          className="deal-search"
          placeholder="Search by deal, company, contact, stage, or status..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <div className="deal-finder-list">
          {normalizedSearch.length < 2 ? (
            <div className="deal-finder-empty">
              Type at least 2 characters to find a deal.
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="deal-finder-empty">
              No deals match your search.
            </div>
          ) : (
            filteredDeals.map((deal) => (
              <button
                key={deal.id}
                type="button"
                className={
                  selectedDeal?.id === deal.id
                    ? "deal-finder-item active"
                    : "deal-finder-item"
                }
                onClick={() => handleSelectDeal(deal)}
              >
                <span>
                  <strong>{deal.dealName || "Untitled Deal"}</strong>
                  <small>{deal.companyName || "No company"}</small>
                </span>

                <span className="deal-finder-meta">
                  {formatEnumText(deal.stage)} · {formatMoney(deal.dealValue)}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {showMoreActions && (
        <div className="more-actions-menu">
          <button onClick={() => updateDealStatus("ACTIVE")}>Reactivate</button>
          <button onClick={() => updateDealStatus("DORMANT")}>
            Mark Dormant
          </button>
          <button onClick={markClosedWon}>Mark Closed Won</button>

          <button
            className="danger-action"
            onClick={() => {
              const confirmed = window.confirm(
                "Are you sure you want to archive this opportunity?"
              );

              if (confirmed) {
                updateDealStatus("ARCHIVED");
              }
            }}
          >
            Archive
          </button>
        </div>
      )}

      {/* Minimal create form captures the required fields before the full edit view. */}
      {showCreateForm && (
        <div className="activity-form">
          <label>
            Deal Name
            <input
              name="dealName"
              value={newDealData.dealName}
              onChange={handleCreateInput}
            />
          </label>

          <label>
            Company
            <input
              name="companyName"
              value={newDealData.companyName}
              onChange={handleCreateInput}
            />
          </label>

          <label>
            Contact Name
            <input
              name="contactName"
              value={newDealData.contactName}
              onChange={handleCreateInput}
            />
          </label>

          <label>
            Contact Phone
            <input
              name="contactPhone"
              value={newDealData.contactPhone}
              onChange={handleCreateInput}
            />
          </label>

          <label>
            Contact Email
            <input
              name="contactEmail"
              type="email"
              value={newDealData.contactEmail}
              onChange={handleCreateInput}
            />
          </label>

          <label>
            Value
            <input
              name="dealValue"
              type="number"
              value={newDealData.dealValue}
              onChange={handleCreateInput}
            />
          </label>

          <div className="form-actions">
            <button className="work-button" onClick={handleCreateDeal}>
              Create Deal
            </button>

            <button
              className="refresh-button"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedDeal && editData ? (
        <>
          {/* Activity capture supports the execution and follow-up views. */}
          {showActivityForm && (
            <div className="activity-form">
              <h3>Log Activity</h3>

              <label>
                Activity Type
                <select
                  name="activityType"
                  value={activityData.activityType}
                  onChange={handleActivityInput}
                >
                  <option value="CALL">Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">Meeting</option>
                  <option value="TEXT">Text</option>
                </select>
              </label>

              <label>
                Outcome
                <select
                  name="outcome"
                  value={activityData.outcome}
                  onChange={handleActivityInput}
                >
                  <option value="SPOKE_WITH_CONTACT">Spoke With Contact</option>
                  <option value="NO_ANSWER">No Answer</option>
                  <option value="LEFT_VOICEMAIL">Left Voicemail</option>
                  <option value="SENT_EMAIL">Sent Email</option>
                  <option value="PROPOSED">Proposed</option>
                </select>
              </label>

              <label>
                Notes
                <textarea
                  name="notes"
                  value={activityData.notes}
                  onChange={handleActivityInput}
                  placeholder="Activity notes..."
                />
              </label>

              <div className="form-actions">
                <button className="work-button" onClick={saveActivity}>
                  Save Activity
                </button>

                <button className="refresh-button" onClick={cancelActivity}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="deal-detail-grid">
            {/* Main opportunity record with edit controls for core deal fields. */}
            <div className="history-section deal-info-card">
              <div className="card-title-row">
                <h3>Opportunity Information</h3>

                <div className="opportunity-card-actions">
                  {isEditing ? (
                    <>
                      <button className="work-button" onClick={handleSaveDeal}>
                        Save
                      </button>

                      <button className="refresh-button" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="work-button"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </button>
                  )}

                  <button
                    className="refresh-button"
                    onClick={() => setShowActivityForm(!showActivityForm)}
                  >
                    Add Activity
                  </button>
                </div>
              </div>

              <div className="detail-row">
                <span>Deal Name:</span>
                {isEditing ? (
                  <input
                    name="dealName"
                    value={editData.dealName || ""}
                    onChange={handleInputChange}
                  />
                ) : (
                  <strong>{editData.dealName || "N/A"}</strong>
                )}
              </div>

              <div className="detail-row">
                <span>Company Name:</span>
                {isEditing ? (
                  <input
                    name="companyName"
                    value={editData.companyName || ""}
                    onChange={handleInputChange}
                  />
                ) : (
                  <strong>{editData.companyName || "N/A"}</strong>
                )}
              </div>

              <div className="detail-row">
                <span>Contact:</span>
                {isEditing ? (
                  <input
                    name="contactName"
                    value={editData.contactName || ""}
                    onChange={handleInputChange}
                  />
                ) : (
                  <strong>{editData.contactName || "N/A"}</strong>
                )}
              </div>

              <div className="detail-row">
                <span>Deal Value:</span>
                {isEditing ? (
                  <input
                    name="dealValue"
                    type="number"
                    value={editData.dealValue || ""}
                    onChange={handleInputChange}
                  />
                ) : (
                  <strong>${Number(editData.dealValue || 0).toLocaleString()}</strong>
                )}
              </div>

              <div className="detail-row">
                <span>Probability:</span>
                {isEditing ? (
                  <input
                    name="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={editData.probability || ""}
                    onChange={handleInputChange}
                  />
                ) : (
                  <strong>{editData.probability || 0}%</strong>
                )}
              </div>

              <div className="detail-row">
                <span>Stage:</span>
                {isEditing ? (
                  <select
                    name="stage"
                    value={editData.stage || "NEW_LEAD"}
                    onChange={handleInputChange}
                  >
                    <option value="NEW_LEAD">New Lead</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="DISCOVERY">Discovery</option>
                    <option value="PROPOSAL">Proposal</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="VERBAL">Verbal</option>
                    <option value="CLOSED_WON">Closed Won</option>
                  </select>
                ) : (
                  <strong>{formatEnumText(editData.stage)}</strong>
                )}
              </div>

              <div className="detail-row">
                <span>Status:</span>
                {isEditing ? (
                  <select
                    name="dealStatus"
                    value={editData.dealStatus || "ACTIVE"}
                    onChange={handleInputChange}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DORMANT">Dormant</option>
                    <option value="CLOSED_WON">Closed Won</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                ) : (
                  <strong>{formatEnumText(editData.dealStatus)}</strong>
                )}
              </div>

              <div className="detail-row">
                <span>Expected Close Date:</span>
                {isEditing ? (
                  <input
                    name="expectedCloseDate"
                    type="date"
                    value={editData.expectedCloseDate || ""}
                    onChange={handleInputChange}
                  />
                ) : (
                  <strong>{editData.expectedCloseDate || "Not set"}</strong>
                )}
              </div>

              <div className="detail-row">
                <span>Contract End Date:</span>
                {isEditing ? (
                  <input
                    name="contractEndDate"
                    type="date"
                    value={editData.contractEndDate || ""}
                    onChange={handleInputChange}
                  />
                ) : (
                  <strong>{editData.contractEndDate || "Not set"}</strong>
                )}
              </div>

              <div className="detail-row">
                <span>Owner:</span>
                {isEditing ? (
                  <input
                    name="owner"
                    value={editData.owner || ""}
                    onChange={handleInputChange}
                  />
                ) : (
                  <strong>{editData.owner || "N/A"}</strong>
                )}
              </div>
            </div>

            <div className="deal-side-stack">
              {/* Recent activity and notes give context without leaving the deal view. */}
              <div className="history-section">
                <h3>Activity History</h3>

                {activities.length === 0 ? (
                  <p className="empty-history">No activities yet.</p>
                ) : (
                  <>
                    <div className="history-list">
                      {visibleActivities.map((activity) => (
                        <div key={activity.id} className="history-item">
                          <strong>{formatEnumText(activity.activityType)}</strong>
                          <span>{formatEnumText(activity.outcome)}</span>
                          <p>{activity.notes}</p>
                        </div>
                      ))}
                    </div>

                    {activities.length > 3 && (
                      <button
                        className="view-all-link"
                        onClick={() => setShowAllActivities(!showAllActivities)}
                      >
                        {showAllActivities
                          ? "Show fewer activities"
                          : "View All Activity"}
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="history-section">
                <h3>Notes</h3>

                {isEditing ? (
                  <textarea
                    name="notes"
                    value={editData.notes || ""}
                    onChange={handleInputChange}
                    placeholder="Add context, timing, decision maker, or current blocker."
                  />
                ) : (
                  <p>
                    {showAllNotes
                      ? editData.notes || "No notes yet."
                      : (editData.notes || "No notes yet.").slice(0, 120)}
                  </p>
                )}

                {editData.notes && editData.notes.length > 120 && (
                  <button
                    className="view-all-link"
                    onClick={() => setShowAllNotes(!showAllNotes)}
                  >
                    {showAllNotes ? "Show fewer notes" : "View All Notes"}
                  </button>
                )}

                <div className="activity-form inline-note-form">
                  <label>
                    Add Note
                    <textarea
                      value={noteText}
                      onChange={(event) => setNoteText(event.target.value)}
                      placeholder="Add a separate note for this deal."
                    />
                  </label>

                  <button className="work-button" onClick={saveNote}>
                    Save Note
                  </button>
                </div>

                {notes.length > 0 && (
                  <div className="history-list">
                    {notes.map((note) => (
                      <div key={note.id} className="history-item">
                        <strong>{note.authorName || "Unknown"}</strong>
                        <span>
                          {note.createdAt
                            ? new Date(note.createdAt).toLocaleString()
                            : "Unknown date"}
                        </span>
                        <p>{note.noteText}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lifecycle history is limited to leadership/admin users. */}
          {canViewLifecycleHistory && (
            <div className="history-section">
              <h3>Lifecycle History</h3>

              {statusHistory.length === 0 ? (
                <p className="empty-history">
                  No lifecycle changes recorded yet.
                </p>
              ) : (
                <div className="history-list">
                  {statusHistory.map((item) => (
                    <div key={item.id} className="history-item">
                      <strong>{item.fieldChanged}</strong>
                      <span>
                        {item.oldValue || "None"} to {item.newValue || "None"}
                      </span>
                      <p>
                        Changed by {item.changedBy || "Unknown"} on{" "}
                        {item.changedAt
                          ? new Date(item.changedAt).toLocaleString()
                          : "Unknown date"}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {reactivationHistory.length > 0 && (
                <>
                  <h3>Reactivation History</h3>

                  <div className="history-list">
                    {reactivationHistory.map((item) => (
                      <div key={item.id} className="history-item">
                        <strong>{item.triggerType}</strong>
                        <span>{item.reactivatedBy || "Unknown"}</span>
                        <p>
                          {item.reason || "No reason provided."}{" "}
                          {item.reactivatedAt
                            ? new Date(item.reactivatedAt).toLocaleString()
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <p>Select or create a deal</p>
      )}
    </section>
  );
}

export default DealsPage;
