export function createEmptyDeal(owner = "") {
  return {
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
    owner,
    notes: "",
  };
}

export function validateDeal(data) {
  if (!data?.dealName?.trim()) {
    return "Deal name is required.";
  }

  if (!data?.companyName?.trim()) {
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

export function formatEnumText(value) {
  if (!value) {
    return "N/A";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatMoney(value) {
  const number = Number(value || 0);

  if (number >= 1000000) {
    return `$${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `$${Math.round(number / 1000)}K`;
  }

  return `$${number.toLocaleString()}`;
}

export function getVisibleDeals(deals, users, currentUser) {
  const managerRepIds = users
    .filter((user) => user.managerId === currentUser?.id)
    .map((user) => user.id);

  return deals.filter((deal) => {
    if (deal.dealStatus !== "ACTIVE") {
      return false;
    }

    if (currentUser?.role === "ADMIN") {
      return true;
    }

    if (currentUser?.role === "MANAGER") {
      return managerRepIds.includes(deal.ownerId) || deal.ownerId === currentUser.id;
    }

    if (currentUser?.role === "REP") {
      return (
        deal.ownerId === currentUser.id ||
        (!deal.ownerId && deal.owner === currentUser.name)
      );
    }

    return false;
  });
}

export function searchDeals(deals, searchTerm) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (normalizedSearch.length < 2) {
    return [];
  }

  return deals.filter((deal) => {
    return [
      deal.dealName,
      deal.companyName,
      deal.contactName,
      deal.contactEmail,
      deal.stage,
      deal.dealStatus,
    ].some((value) => value?.toLowerCase().includes(normalizedSearch));
  });
}
