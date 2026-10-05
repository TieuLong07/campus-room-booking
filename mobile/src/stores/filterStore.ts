import { create } from "zustand";

interface FilterState {
  searchQuery: string;
  selectedBuilding: string;
  selectedType: string;
  minCapacity: number;
  setSearchQuery: (query: string) => void;
  setSelectedBuilding: (building: string) => void;
  setSelectedType: (type: string) => void;
  setMinCapacity: (capacity: number) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: "",
  selectedBuilding: "ALL",
  selectedType: "ALL",
  minCapacity: 0,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedBuilding: (selectedBuilding) => set({ selectedBuilding }),
  setSelectedType: (selectedType) => set({ selectedType }),
  setMinCapacity: (minCapacity) => set({ minCapacity }),
  resetFilters: () =>
    set({
      searchQuery: "",
      selectedBuilding: "ALL",
      selectedType: "ALL",
      minCapacity: 0,
    }),
}));
