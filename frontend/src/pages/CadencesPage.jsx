import { useEffect, useState } from "react";

import { apiFetch } from "../api";

function CadencesPage() {
  // Cadence rules are editable admin configuration used by Daily Execution.
  const [cadences, setCadences] = useState([]);
  const [touchTemplates, setTouchTemplates] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  // Load seeded cadence rules from the backend configuration table.
  function loadCadences() {
    apiFetch("/api/cadences")
      .then((response) => response.json())
      .then((data) => setCadences(data))
      .catch(() => setError("Cadence rules could not be loaded."));
  }

  function loadTouchTemplates() {
    apiFetch("/api/touch-templates")
      .then((response) => response.json())
      .then((data) => setTouchTemplates(data))
      .catch(() => setError("Touch templates could not be loaded."));
  }

  useEffect(() => {
    loadCadences();
    loadTouchTemplates();
  }, []);

  // Frequency updates are validated here before saving to the API.
  function updateFrequency(cadence, value) {
    const frequencyDays = Number(value);

    if (frequencyDays <= 0) {
      setError("Frequency must be greater than 0.");
      return;
    }

    setError("");
    setFeedback("");

    const updatedCadence = {
      ...cadence,
      frequencyDays,
    };

    apiFetch(`/api/cadences/${cadence.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedCadence),
    })
      .then((response) => response.json())
      .then(() => {
        setFeedback("Cadence frequency updated.");
        loadCadences();
      })
      .catch(() => setError("Cadence frequency could not be updated."));
  }

  // Pausing a cadence keeps the rule available without deleting configuration.
  function toggleCadence(cadence) {
    setError("");
    setFeedback("");

    const updatedCadence = {
      ...cadence,
      activeStatus: !cadence.activeStatus,
    };

    apiFetch(`/api/cadences/${cadence.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedCadence),
    })
      .then((response) => response.json())
      .then(() => {
        setFeedback("Cadence rule updated.");
        loadCadences();
      })
      .catch(() => setError("Cadence rule could not be updated."));
  }

  function updateTouchTemplate(template, fieldName, value) {
    const updatedTemplate = {
      ...template,
      [fieldName]:
        fieldName === "defaultFrequency" ? Number(value || 0) : value,
    };

    apiFetch(`/api/touch-templates/${template.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTemplate),
    })
      .then((response) => response.json())
      .then(() => {
        setFeedback("Touch template updated.");
        loadTouchTemplates();
      })
      .catch(() => setError("Touch template could not be updated."));
  }

  // Rule names are stored as enums but displayed in a readable format.
  function formatRuleName(value) {
    if (!value) {
      return "Unknown Rule";
    }

    return value.replaceAll("_", " ");
  }

  return (
    <section className="cadences-page">
      <div className="section-header">
        <div>
          <h2>Cadence Rules</h2>
          <p>
            Admin configuration for the automatic cadence engine used by Daily
            Execution.
          </p>
        </div>
      </div>

      {feedback && <div className="save-feedback">{feedback}</div>}
      {error && <div className="form-error">{error}</div>}

      <div className="cadence-explainer">
        <h3>How Cadence Works</h3>
        <p>
          Sales reps do not manually create cadences. WorkMyDeal automatically
          evaluates each opportunity’s stage, status, contract timing, and
          activity history to decide when it should appear in Daily Execution.
        </p>
      </div>

      <div className="cadence-table">
        {/* Rules table shows the timing inputs that drive automatic follow-up. */}
        <div className="cadence-header-row">
          <span>Rule</span>
          <span>Frequency</span>
          <span>Trigger</span>
          <span>Required</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {cadences.length === 0 ? (
          <div className="empty-history">
            No cadence rules found. Restart the backend to seed default cadence
            rules.
          </div>
        ) : (
          cadences.map((cadence) => (
            <div key={cadence.id} className="cadence-row">
              <span>{formatRuleName(cadence.cadenceType)}</span>

              <div className="cadence-frequency">
                <input
                  className="inline-frequency"
                  type="number"
                  min="1"
                  value={cadence.frequencyDays || ""}
                  onChange={(event) =>
                    updateFrequency(cadence, event.target.value)
                  }
                />
                <span>days</span>
              </div>

              <span>{cadence.touchCategory || "General"}</span>
              <span>{cadence.requiredFlag ? "Yes" : "No"}</span>
              <span>{cadence.activeStatus ? "Active" : "Paused"}</span>

              <span>
                <button
                  className="refresh-button"
                  onClick={() => toggleCadence(cadence)}
                >
                  {cadence.activeStatus ? "Disable" : "Reactivate"}
                </button>
              </span>
            </div>
          ))
        )}
      </div>

      <div className="history-section">
        <h3>Touch Templates</h3>

        {touchTemplates.length === 0 ? (
          <p className="empty-history">No touch templates found.</p>
        ) : (
          <div className="touch-template-grid">
            {touchTemplates.map((template) => (
              <div key={template.id} className="touch-template-card">
                <label>
                  Category
                  <input
                    value={template.touchCategory || ""}
                    onChange={(event) =>
                      updateTouchTemplate(
                        template,
                        "touchCategory",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Default Frequency
                  <input
                    type="number"
                    min="1"
                    value={template.defaultFrequency || ""}
                    onChange={(event) =>
                      updateTouchTemplate(
                        template,
                        "defaultFrequency",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Example Message
                  <textarea
                    value={template.exampleMessage || ""}
                    onChange={(event) =>
                      updateTouchTemplate(
                        template,
                        "exampleMessage",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default CadencesPage;
