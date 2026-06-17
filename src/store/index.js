import { create } from "zustand";

export const pageNavigation = create((set) => ({
    currentPage: "Home",
    changeCurrentPage: currentPage => set({currentPage})
}))