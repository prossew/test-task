import { create } from "zustand";

type FiltersStore = {
  selectedCategories: string[];
  needsRevision: boolean;
  setSelectedCategories: (categories: string[]) => void;
  toggleCategory: (category: string) => void;
  setNeedsRevision: (value: boolean) => void;
  reset: () => void;
};

export const useFiltersStore = create<FiltersStore>((set, get) => ({
  selectedCategories: [],
  needsRevision: false,
  setSelectedCategories: (categories) =>
    set({ selectedCategories: categories }),
  toggleCategory: (category) => {
    const prev = get().selectedCategories;
    set({
      selectedCategories: prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    });
  },
  setNeedsRevision: (value) => set({ needsRevision: value }),
  reset: () => set({ selectedCategories: [], needsRevision: false }),
}));
