import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UniversityInfoStore {
	university: string | undefined;
	setUniversity: (university: string) => void;
	resetUniversity: () => void;
}

const useUniversityInfo = create(
	persist<UniversityInfoStore>(
		(set) => ({
			university: undefined,
			setUniversity: (newUniversity: string) => {
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
