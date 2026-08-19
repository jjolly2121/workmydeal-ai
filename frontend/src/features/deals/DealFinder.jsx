import { formatEnumText, formatMoney } from "./dealUtils";

function DealFinder({
  searchTerm,
  onSearchChange,
  filteredDeals,
  selectedDealId,
  onSelectDeal,
}) {
  const normalizedSearch = searchTerm.trim();

  return (
    <div className="deal-finder">
      <input
        className="deal-search"
        placeholder="Search by deal, company, contact, stage, or status..."
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <div className="deal-finder-list">
        {normalizedSearch.length < 2 ? (
          <div className="deal-finder-empty">
            Type at least 2 characters to find a deal.
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="deal-finder-empty">No deals match your search.</div>
        ) : (
          filteredDeals.map((deal) => (
            <button
              key={deal.id}
              type="button"
              className={
                selectedDealId === deal.id
                  ? "deal-finder-item active"
                  : "deal-finder-item"
              }
              onClick={() => onSelectDeal(deal)}
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
  );
}

export default DealFinder;
