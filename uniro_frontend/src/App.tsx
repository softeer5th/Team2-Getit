import { Route, Routes } from "react-router";
import "./App.css";
import LandingPage from "./pages/landing";
import UniversitySearchPage from "./pages/universitySearch";
import MapPage from "./pages/map";
import BuildingSearchPage from "./pages/buildingSearch";
import NavigationResultPage from "./pages/navigationResult";
import ReportRoutePage from "./pages/reportRoute";
import ReportForm from "./pages/reportForm";
import ReportRiskPage from "./pages/reportRisk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDynamicSuspense } from "./hooks/useDynamicSuspense";
import OfflinePage from "./pages/offline";
import useNetworkStatus from "./hooks/useNetworkStatus";
import ErrorPage from "./pages/error";
import { Suspense } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ErrorBoundary from "./components/error/ErrorBoundary";
import Errortest from "./pages/errorTest";
import NotFoundPage from "./pages/notFound";
import { MapProvider } from "./map/mapContext";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 300000,
		},
	},
});

function App() {
	const { location, fallback } = useDynamicSuspense();
	useNetworkStatus();

	return (
		<QueryClientProvider client={queryClient}>
			<MapProvider>
				<ErrorBoundary key={location.key} fallback={<ErrorPage />}>
					<Suspense fallback={fallback}>
						<Routes>
							<Route path="/" element={<LandingPage />} />
							<Route path="/university" element={<UniversitySearchPage />} />
							<Route path="/building" element={<BuildingSearchPage />} />
							<Route path="/map" element={<MapPage />} />
							<Route path="/form" element={<ReportForm />} />
							<Route path="/result" element={<NavigationResultPage />} />
							<Route path="/report/route" element={<ReportRoutePage />} />
							<Route path="/report/risk" element={<ReportRiskPage />} />
							/** 에러 페이지 */
							<Route path="/error" element={<ErrorPage />} />
							<Route path="/error/offline" element={<OfflinePage />} />
							<Route path="/error/test" element={<Errortest />} />
							<Route path="*" element={<NotFoundPage />} />
						</Routes>
					</Suspense>
				</ErrorBoundary>
				<ReactQueryDevtools initialIsOpen={false} />
			</MapProvider>
		</QueryClientProvider>
	);
}

export default App;
