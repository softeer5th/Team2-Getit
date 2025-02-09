import { Route, Routes } from "react-router";
import "./App.css";
import Demo from "./pages/demo";
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

const queryClient = new QueryClient();

function App() {
	const { location, fallback } = useDynamicSuspense();
	useNetworkStatus();
	return (
		<QueryClientProvider client={queryClient}>
			<ErrorBoundary fallback={<ErrorPage />}>
				<Suspense key={location.key} fallback={fallback}>
					<Routes>
						<Route path="/demo" element={<Demo />} />
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
					</Routes>
				</Suspense>
			</ErrorBoundary>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}

export default App;
