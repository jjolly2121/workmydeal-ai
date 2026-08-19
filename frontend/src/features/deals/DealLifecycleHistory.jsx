function DealLifecycleHistory({ statusHistory, reactivationHistory }) {
  return (
    <div className="history-section">
      <h3>Lifecycle History</h3>

      {statusHistory.length === 0 ? (
        <p className="empty-history">No lifecycle changes recorded yet.</p>
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
  );
}

export default DealLifecycleHistory;
