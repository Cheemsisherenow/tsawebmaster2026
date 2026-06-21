import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const pageNavigation = create(
  persist(
    (set) => ({
      currentPage: "Home",
      changeCurrentPage: (currentPage) => set({ currentPage }),

      selectedOpportunityId: null,
      setSelectedOpportunityId: (id) => set({ selectedOpportunityId: id }),

      savedResources: [],
      hasUnseenSaved: false,

      addSaved: (event) =>
        set((state) => {
          if (state.savedResources.some((r) => String(r.id) === String(event.id))) return {}; // already saved
          return { savedResources: [...state.savedResources, event], hasUnseenSaved: true };
        }),

      toggleSaved: (event) =>
        set((state) => {
          const exists = state.savedResources.some((r) => String(r.id) === String(event.id));
          if (exists) {
            return {
              savedResources: state.savedResources.filter((r) => String(r.id) !== String(event.id)),
            };
          }
          return {
            savedResources: [...state.savedResources, event],
            hasUnseenSaved: true,
          };
        }),

      removeSaved: (id) =>
        set((state) => ({
          savedResources: state.savedResources.filter((r) => String(r.id) !== String(id)),
        })),

      markSavedSeen: () => set({ hasUnseenSaved: false }),
    }),
    {
      name: 'volunteergwinnett',
      partialize: (state) => ({ savedResources: state.savedResources }),
    }
  )
);