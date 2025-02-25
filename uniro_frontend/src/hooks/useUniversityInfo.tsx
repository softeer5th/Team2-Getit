import { create } from "zustand";
import { persist } from "zustand/middleware";
import { University } from "../types/university";

interface UniversityInfoStore {
	university: University | undefined;
	setUniversity: (university: University | undefined) => void;
	resetUniversity: () => void;
}
const useUniversityInfo = create(
	persist<UniversityInfoStore>(
		(set) => ({
			university: undefined,
			setUniversity: (newUniversity: University | undefined) => {
				set(() => ({ university: newUniversity }));
			},
			resetUniversity: () => {
				set(() => ({ university: undefined }));
			},
		}),
		{
			name: "university-info",
		},
	),
);
export default useUniversityInfo;
