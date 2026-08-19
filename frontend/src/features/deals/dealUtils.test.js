import { describe, expect, it } from "vitest";

import {
  createEmptyDeal,
  formatEnumText,
  formatMoney,
  getVisibleDeals,
  searchDeals,
  validateDeal,
} from "./dealUtils";

const activeDeals = [
  {
    id: 1,
    dealName: "Northwind Renewal",
    companyName: "Northwind",
    contactName: "Alex",
    contactEmail: "alex@example.com",
    dealValue: 25000,
    stage: "PROPOSAL",
    dealStatus: "ACTIVE",
    ownerId: 10,
    owner: "Rep One",
  },
  {
    id: 2,
    dealName: "Contoso Expansion",
    companyName: "Contoso",
    dealValue: 1250000,
    stage: "NEGOTIATION",
    dealStatus: "ACTIVE",
    ownerId: 20,
    owner: "Rep Two",
  },
  {
    id: 3,
    dealName: "Archived Deal",
    companyName: "Old Account",
    dealValue: 5000,
    stage: "DISCOVERY",
    dealStatus: "ARCHIVED",
    ownerId: 10,
    owner: "Rep One",
  },
];

const users = [
  { id: 5, role: "MANAGER", name: "Manager" },
  { id: 10, role: "REP", name: "Rep One", managerId: 5 },
  { id: 20, role: "REP", name: "Rep Two", managerId: 6 },
];

describe("deal form defaults and validation", () => {
  it("creates a new active commercial deal for the supplied owner", () => {
    expect(createEmptyDeal("Rep One")).toMatchObject({
      owner: "Rep One",
      probability: 25,
      stage: "NEW_LEAD",
      dealStatus: "ACTIVE",
      dealType: "COMMERCIAL",
    });
  });

  it("returns the first actionable validation message", () => {
    expect(validateDeal(createEmptyDeal())).toBe("Deal name is required.");
    expect(
      validateDeal({
        dealName: "Renewal",
        companyName: "",
        dealValue: 100,
        probability: 25,
      })
    ).toBe("Company name is required.");
    expect(
      validateDeal({
        dealName: "Renewal",
        companyName: "Northwind",
        dealValue: 100,
        probability: 25,
      })
    ).toBe("");
  });
});

describe("deal visibility and search", () => {
  it("limits representatives to their own active deals", () => {
    const visible = getVisibleDeals(activeDeals, users, users[1]);
    expect(visible.map((deal) => deal.id)).toEqual([1]);
  });

  it("includes a manager's active team deals", () => {
    const visible = getVisibleDeals(activeDeals, users, users[0]);
    expect(visible.map((deal) => deal.id)).toEqual([1]);
  });

  it("requires two characters and searches across deal fields", () => {
    expect(searchDeals(activeDeals, "n")).toEqual([]);
    expect(searchDeals(activeDeals, "north").map((deal) => deal.id)).toEqual([1]);
    expect(searchDeals(activeDeals, "negotiation").map((deal) => deal.id)).toEqual([2]);
  });
});

describe("deal formatting", () => {
  it("formats enum labels and compact currency consistently", () => {
    expect(formatEnumText("CLOSED_WON")).toBe("Closed Won");
    expect(formatMoney(25000)).toBe("$25K");
    expect(formatMoney(1250000)).toBe("$1.3M");
  });
});
