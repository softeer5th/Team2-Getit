import { create } from "zustand";
import { persist } from "zustand/middleware";
import { University } from "../data/types/university";
interface UniversityInfoStore {
	university: University | undefined;
	setUniversity: (university: University) => void;
	resetUniversity: () => void;
}
const useUniversityInfo = create(
	persist<UniversityInfoStore>(
		(set) => ({
			university: undefined,
			setUniversity: (newUniversity: University) => {
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
