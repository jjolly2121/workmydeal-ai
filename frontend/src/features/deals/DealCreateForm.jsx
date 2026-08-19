function DealCreateForm({ deal, onChange, onCreate, onCancel }) {
  return (
    <div className="activity-form">
      <label>
        Deal Name
        <input name="dealName" value={deal.dealName} onChange={onChange} />
      </label>

      <label>
        Company
        <input name="companyName" value={deal.companyName} onChange={onChange} />
      </label>

      <label>
        Contact Name
        <input name="contactName" value={deal.contactName} onChange={onChange} />
      </label>

      <label>
        Contact Phone
        <input name="contactPhone" value={deal.contactPhone} onChange={onChange} />
      </label>

      <label>
        Contact Email
        <input
          name="contactEmail"
          type="email"
          value={deal.contactEmail}
          onChange={onChange}
        />
      </label>

      <label>
        Value
        <input
          name="dealValue"
          type="number"
          value={deal.dealValue}
          onChange={onChange}
        />
      </label>

      <div className="form-actions">
        <button className="work-button" onClick={onCreate}>
          Create Deal
        </button>
        <button className="refresh-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default DealCreateForm;
