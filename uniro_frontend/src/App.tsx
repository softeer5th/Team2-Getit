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
import ReportHazardPage from "./pages/reportHazard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OfflinePage from "./pages/offline";
import useNetworkStatus from "./hooks/useNetworkStatus";
import ErrorPage from "./pages/error";

const queryClient = new QueryClient();

function App() {
	useNetworkStatus();

	return (
		<QueryClientProvider client={queryClient}>
			<Routes>
				<Route path="/" element={<Demo />} />
				<Route path="/landing" element={<LandingPage />} />
				<Route path="/university" element={<UniversitySearchPage />} />
				<Route path="/building" element={<BuildingSearchPage />} />
				<Route path="/map" element={<MapPage />} />
				<Route path="/form" element={<ReportForm />} />
				<Route path="/result" element={<NavigationResultPage />} />
				<Route path="/report/route" element={<ReportRoutePage />} />
				<Route path="/report/hazard" element={<ReportHazardPage />} />

				/** 에러 페이지 */
				<Route path="/error" element={<ErrorPage />} />
				<Route path="/error/offline" element={<OfflinePage />} />
			</Routes>
		</QueryClientProvider>
	);
}

export default App;
