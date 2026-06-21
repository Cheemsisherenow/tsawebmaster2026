import { create } from "zustand";

export const pageNavigation = create((set) => ({
    currentPage: "Home",
    changeCurrentPage: currentPage => set({currentPage}),
    selectedOpportunityId: null,
  setSelectedOpportunityId: (id) => set({ selectedOpportunityId: id }),
}))