import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import useUniversityInfo from "../../hooks/useUniversityInfo";
type Props = {
	isLoading: boolean;
	loadingContent?: string;
};
const Loading = ({ isLoading, loadingContent }: Props) => {
	const { university } = useUniversityInfo();

	return (
		<AnimatePresence>
			{isLoading && (
				<motion.div
					key="loading-overlay"
					initial={{ opacity: 1 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
					className="fixed inset-0 flex flex-col items-center justify-center w-full max-w-[450px] mx-auto bg-white 
					bg-[url(/public/loading/background.svg)] bg-no-repeat bg-center bg-contain z-50"
				>
					{university && (
						<div className="flex flex-row items-center justify-center bg-white rounded-3xl space-x-1">
							<img src={university?.imageUrl} className="h-4 w-4 ml-2 my-2" />
							<p className="text-kor-body2 mr-2 my-1">{university?.name}</p>
						</div>
					)}
					<p className="text-kor-body2 mt-3">{university ? loadingContent : "로딩중입니다."}</p>
					<img src="/loading/spinner.gif" className="w-12 h-12 mt-8" />
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default Loading;
