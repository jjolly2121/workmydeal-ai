function DealActivityForm({ activity, onChange, onSave, onCancel }) {
  return (
    <div className="activity-form">
      <h3>Log Activity</h3>

      <label>
        Activity Type
        <select name="activityType" value={activity.activityType} onChange={onChange}>
          <option value="CALL">Call</option>
          <option value="EMAIL">Email</option>
          <option value="MEETING">Meeting</option>
          <option value="TEXT">Text</option>
        </select>
      </label>

      <label>
        Outcome
        <select name="outcome" value={activity.outcome} onChange={onChange}>
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
          value={activity.notes}
          onChange={onChange}
          placeholder="Activity notes..."
        />
      </label>

      <div className="form-actions">
        <button className="work-button" onClick={onSave}>
          Save Activity
        </button>
        <button className="refresh-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default DealActivityForm;
