import { Route, Routes } from "react-router";
import "./App.css";
import LandingPage from "./pages/landing";
import UniversitySearchPage from "./pages/universitySearch";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDynamicSuspense } from "./hooks/useDynamicSuspense";
import OfflinePage from "./pages/offline";
import useNetworkStatus from "./hooks/useNetworkStatus";
import ErrorPage from "./pages/error";
import { lazy, Suspense } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ErrorBoundary from "./components/error/ErrorBoundary";
import NotFoundPage from "./pages/notFound";
import { MapProvider } from "./map/mapContext";
import CacheProvider from "./map/mapCacheContext";
import MapSSEPage from "./pages/mapSSE";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 300000,
		},
	},
});

const BuildingSearchPage = lazy(() => import("./pages/buildingSearch"));
const MapPage = lazy(() => import("./pages/map"));
const ReportForm = lazy(() => import("./pages/reportForm"));
const NavigationResultPage = lazy(() => import("./pages/navigationResult"));
const ReportRoutePage = lazy(() => import("./pages/reportRoute"));
const ReportRiskPage = lazy(() => import("./pages/reportRisk"));

function App() {
	const { location, fallback } = useDynamicSuspense();
	useNetworkStatus();

	return (
		<QueryClientProvider client={queryClient}>
			<MapProvider>
				<CacheProvider>
					<ErrorBoundary key={location.key} fallback={<ErrorPage />}>
						<Suspense fallback={fallback}>
							<Routes>
								<Route path="/" element={<LandingPage />} />
								<Route path="/university" element={<UniversitySearchPage />} />
								<Route path="/building" element={<BuildingSearchPage />} />
								<Route path="/map" element={<MapPage />} />
								<Route path="/map/sse" element={<MapSSEPage />} />
								<Route path="/form" element={<ReportForm />} />
								<Route path="/result" element={<NavigationResultPage />} />
								<Route path="/report/route" element={<ReportRoutePage />} />
								<Route path="/report/risk" element={<ReportRiskPage />} />
								/** 에러 페이지 */
								<Route path="/error" element={<ErrorPage />} />
								<Route path="/error/offline" element={<OfflinePage />} />
								<Route path="*" element={<NotFoundPage />} />
							</Routes>
						</Suspense>
					</ErrorBoundary>
					<ReactQueryDevtools initialIsOpen={false} />
				</CacheProvider>
			</MapProvider>
		</QueryClientProvider>
	);
}

export default App;
