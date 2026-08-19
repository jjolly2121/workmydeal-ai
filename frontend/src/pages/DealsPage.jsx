import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "../api";
import DealActivityForm from "../features/deals/DealActivityForm";
import DealCreateForm from "../features/deals/DealCreateForm";
import DealFinder from "../features/deals/DealFinder";
import DealLifecycleHistory from "../features/deals/DealLifecycleHistory";
import {
  createEmptyDeal,
  formatEnumText,
  getVisibleDeals,
  searchDeals,
  validateDeal,
} from "../features/deals/dealUtils";

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

  const [newDealData, setNewDealData] = useState(() =>
    createEmptyDeal(currentUser?.name)
  );

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

  // Reset uses the signed-in rep as the default owner for newly created deals.
  function resetNewDealForm() {
    setNewDealData(createEmptyDeal(currentUser?.name));
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
  const visibleDeals = getVisibleDeals(deals, users, currentUser);

  const canViewLifecycleHistory =
    currentUser?.role === "MANAGER" || currentUser?.role === "ADMIN";

  const filteredDeals = searchDeals(visibleDeals, searchTerm);

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

      <DealFinder
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filteredDeals={filteredDeals}
        selectedDealId={selectedDeal?.id}
        onSelectDeal={handleSelectDeal}
      />

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

      {showCreateForm && (
        <DealCreateForm
          deal={newDealData}
          onChange={handleCreateInput}
          onCreate={handleCreateDeal}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {selectedDeal && editData ? (
        <>
          {showActivityForm && (
            <DealActivityForm
              activity={activityData}
              onChange={handleActivityInput}
              onSave={saveActivity}
              onCancel={cancelActivity}
            />
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

          {canViewLifecycleHistory && (
            <DealLifecycleHistory
              statusHistory={statusHistory}
              reactivationHistory={reactivationHistory}
            />
          )}
        </>
      ) : (
        <p>Select or create a deal</p>
      )}
    </section>
  );
}

export default DealsPage;
