import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "../api";

function ExecutionPage({ currentUser }) {
  // Execution state tracks the daily queue and the inline touch-point form.
  const [executionQueue, setExecutionQueue] = useState([]);
  const [touchTemplates, setTouchTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [expandedDealId, setExpandedDealId] = useState(null);
  const [showAllRequired, setShowAllRequired] = useState(false);
  const [showAllStretch, setShowAllStretch] = useState(false);

  const [touchData, setTouchData] = useState({
    activityType: "CALL",
    outcome: "NO_ANSWER",
    stage: "",
    notes: "",
  });

  // Load the current user's execution queue from the backend scoring service.
  const loadExecutionQueue = useCallback(() => {
    apiFetch(
      `/api/tasks?userId=${
        currentUser.id
      }&role=${currentUser.role}&name=${encodeURIComponent(currentUser.name)}`
    )
      .then((response) => response.json())
      .then((data) => setExecutionQueue(data));
  }, [currentUser.id, currentUser.name, currentUser.role]);

  // Active templates give reps a quick starting point for common touch types.
  const loadTouchTemplates = useCallback(() => {
    apiFetch("/api/touch-templates")
      .then((response) => response.json())
      .then((data) =>
        setTouchTemplates(
          data.filter((template) => template.activeStatus !== false)
        )
      );
  }, []);

  useEffect(() => {
    loadExecutionQueue();
    loadTouchTemplates();
  }, [loadExecutionQueue, loadTouchTemplates]);

  // Controlled touch-point inputs keep the save payload predictable.
  function handleTouchInput(event) {
    const { name, value } = event.target;
    setTouchData({ ...touchData, [name]: value });
  }

  function handleTemplateSelection(event) {
    const templateId = event.target.value;
    const selectedTemplate = touchTemplates.find(
      (template) => String(template.id) === templateId
    );

    setSelectedTemplateId(templateId);

    if (selectedTemplate?.exampleMessage) {
      setTouchData({
        ...touchData,
        notes: selectedTemplate.exampleMessage,
      });
    }
  }

  // Saving a touch point also updates deal stage/status when the outcome implies it.
  function saveTouchPoint(dealId) {
    const activityPayload = {
      activityType: touchData.activityType,
      outcome: touchData.outcome,
      notes: touchData.notes,
    };

    apiFetch(`/api/deals/${dealId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activityPayload),
    })
      .then(() => apiFetch(`/api/deals/${dealId}`))
      .then((response) => response.json())
      .then((deal) => {
        let updatedStage = touchData.stage || deal.stage;
        let updatedStatus = deal.dealStatus;

        if (!touchData.stage) {
          if (touchData.outcome === "PROPOSED") updatedStage = "PROPOSAL";
          if (touchData.outcome === "VERBAL") updatedStage = "VERBAL";
          if (touchData.outcome === "NEGOTIATING") {
            updatedStage = "NEGOTIATION";
          }
        }

        if (
          touchData.outcome === "CLOSED_WON" ||
          touchData.stage === "CLOSED_WON"
        ) {
          updatedStage = "CLOSED_WON";
          updatedStatus = "CLOSED_WON";
        }

        return apiFetch(`/api/deals/${dealId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...deal,
            stage: updatedStage,
            dealStatus: updatedStatus,
          }),
        });
      })
      .then(() =>
        apiFetch(`/api/tasks/${dealId}/complete`, {
          method: "POST",
        })
      )
      .then(() => {
        setFeedback("Touch point saved.");
        setExpandedDealId(null);
        setTouchData({
          activityType: "CALL",
          outcome: "NO_ANSWER",
          stage: "",
          notes: "",
        });
        setSelectedTemplateId("");
        loadExecutionQueue();
      });
  }

  // Export keeps the execution workflow available without requiring a backend file response.
  function exportExecutionCsv() {
    const headers = [
      "Deal",
      "Priority Score",
      "Cadence",
      "Needs Attention",
      "Overdue",
      "Completed",
      "Last Contact",
      "Next Follow-Up",
      "Reason",
    ];

    const rows = executionQueue.map((task) => [
      task.dealName,
      task.priorityScore,
      task.cadenceLevel,
      task.needsAttention ? "Yes" : "No",
      task.overdue ? "Yes" : "No",
      task.completed ? "Yes" : "No",
      task.lastContactDate || "",
      task.nextFollowUpDate || "",
      task.reason || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "workmydeal-execution-export.csv";
    link.click();

    URL.revokeObjectURL(url);
    setFeedback("Execution CSV exported.");
  }

  // Split work into required and stretch lists for the daily execution screen.
  const requiredTasks = executionQueue.filter(
    (task) => task.needsAttention && !task.completed
  );

  const stretchTasks = executionQueue.filter(
    (task) => !task.needsAttention && !task.completed
  );

  function getTaskLabel(task) {
    const reason = task.reason || "";
    const cadence = task.cadenceLevel || "";
    const stage = task.stage || "";

    if (reason.toLowerCase().includes("contract")) {
      return "Contract renewal review";
    }

    if (stage === "PROPOSAL" || reason.toLowerCase().includes("proposal")) {
      return "Follow up on proposal";
    }

    if (stage === "VERBAL") {
      return "Call decision maker";
    }

    if (task.priorityScore >= 80) {
      return "High priority follow-up";
    }

    if (cadence.toLowerCase().includes("relationship")) {
      return "Relationship touch";
    }

    if (cadence.toLowerCase().includes("value")) {
      return "Value message email";
    }

    if (!task.needsAttention) {
      return "Industry update";
    }

    return "Follow up with account";
  }

  const visibleRequiredTasks = showAllRequired
    ? requiredTasks
    : requiredTasks.slice(0, 3);

  const visibleStretchTasks = showAllStretch
    ? stretchTasks
    : stretchTasks.slice(0, 3);

  // Render helper keeps required and stretch rows visually consistent.
  function renderTaskRow(task) {
    return (
      <div key={task.dealId}>
        <div className="execution-row">
          <strong>{getTaskLabel(task)}</strong>

          <span>{task.dealName}</span>

          <span>{task.nextFollowUpDate || "Not scheduled"}</span>

          <span
            className={
              task.priorityScore >= 80
                ? "priority-badge high"
                : task.priorityScore >= 50
                ? "priority-badge medium"
                : "priority-badge low"
            }
          >
            {task.priorityScore >= 80
              ? "High"
              : task.priorityScore >= 50
              ? "Medium"
              : "Low"}
          </span>

          <button
            className="refresh-button"
            onClick={() =>
              setExpandedDealId(
                expandedDealId === task.dealId ? null : task.dealId
              )
            }
          >
            {expandedDealId === task.dealId ? "Cancel" : "Work Deal"}
          </button>
        </div>

        {expandedDealId === task.dealId && (
          <div className="activity-form execution-touch-form">
            <h4>Touch Point</h4>

            <label>
              Activity Type
              <select
                name="activityType"
                value={touchData.activityType}
                onChange={handleTouchInput}
              >
                <option value="CALL">Call</option>
                <option value="EMAIL">Email</option>
                <option value="TEXT">Text</option>
                <option value="MEETING">Meeting</option>
              </select>
            </label>

            <label>
              Outcome
              <select
                name="outcome"
                value={touchData.outcome}
                onChange={handleTouchInput}
              >
                <option value="NO_ANSWER">No Answer</option>
                <option value="LEFT_VOICEMAIL">Left Voicemail</option>
                <option value="SPOKE_WITH_CONTACT">
                  Spoke With Contact, See Notes
                </option>
                <option value="SENT_EMAIL">Sent Email</option>
                <option value="SENT_TEXT">Sent Text</option>
              </select>
            </label>

            <label>
              Update Stage
              <select
                name="stage"
                value={touchData.stage}
                onChange={handleTouchInput}
              >
                <option value="">Keep Current Stage</option>
                <option value="NEW_LEAD">New Lead</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="DISCOVERY">Discovery</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="VERBAL">Verbal</option>
                <option value="CLOSED_WON">Closed Won</option>
              </select>
            </label>

            <label>
              Touch Template
              <select
                value={selectedTemplateId}
                onChange={handleTemplateSelection}
              >
                <option value="">No template</option>
                {touchTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.touchCategory}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Notes
              <textarea
                name="notes"
                value={touchData.notes}
                onChange={handleTouchInput}
                placeholder="What happened on this touch?"
              />
            </label>

            <button
              className="work-button"
              onClick={() => saveTouchPoint(task.dealId)}
            >
              Save Touch Point
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="queue-section">
      <div className="section-header">
        <div>
          <h2>Daily Execution</h2>
        </div>

        <div className="section-actions">
          <div className="execution-complete-box">
            Required Tasks Complete?<br />
            {requiredTasks.length === 0
              ? "Yes"
              : `No - ${requiredTasks.length} remaining`}
          </div>

          <button className="refresh-button" onClick={exportExecutionCsv}>
            Export Execution
          </button>
        </div>
      </div>

      {feedback && <div className="save-feedback">{feedback}</div>}

      {/* Required tasks are the must-do items for the current day. */}
      <div className="execution-section">
        <h3>Required Tasks ({requiredTasks.length})</h3>

        <div className="execution-table">
          <div className="execution-row execution-header">
            <span>Task</span>
            <span>Related To</span>
            <span>Due Date</span>
            <span>Priority</span>
          </div>

          {requiredTasks.length === 0 ? (
            <p className="empty-history">No required work.</p>
          ) : (
            visibleRequiredTasks.map((task) => renderTaskRow(task))
          )}

          {requiredTasks.length > 3 && (
            <button
              className="view-all-link"
              onClick={() => setShowAllRequired(!showAllRequired)}
            >
              {showAllRequired
                ? "Show fewer required tasks"
                : "View all required tasks"}
            </button>
          )}
        </div>
      </div>

      {/* Stretch tasks keep productive follow-up available after required work. */}
      <div className="execution-section">
        <h3>Stretch Tasks ({stretchTasks.length})</h3>

        <div className="execution-table">
          <div className="execution-row execution-header">
            <span>Task</span>
            <span>Related To</span>
            <span>Due Date</span>
            <span>Priority</span>
          </div>

          {stretchTasks.length === 0 ? (
            <p className="empty-history">No stretch work.</p>
          ) : (
            visibleStretchTasks.map((task) => renderTaskRow(task))
          )}

          {stretchTasks.length > 3 && (
            <button
              className="view-all-link"
              onClick={() => setShowAllStretch(!showAllStretch)}
            >
              {showAllStretch
                ? "Show fewer stretch tasks"
                : "View all stretch tasks"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default ExecutionPage;
