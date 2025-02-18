import { create } from "zustand";
import { University } from "../data/types/university";

interface UniversityProps {
    univId: number;
    setUnivId: (univId: number) => void;
    university: University | undefined;
    setUniversity: (univ: University) => void;
}

const useUniversity = create<UniversityProps>((set) => ({
    univId: -1,
    setUnivId: (newId: number) => set({ univId: newId }),
    university: undefined,
    setUniversity: (newUniv: University) => set({ university: newUniv }),
}));

export default useUniversity;
