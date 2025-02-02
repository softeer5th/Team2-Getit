import { Route, Routes } from "react-router";
import "./App.css";
import Demo from "./pages/demo";
import LandingPage from "./pages/landing";
import UniversitySearchPage from "./pages/universitySearch";
import MapPage from "./pages/map";
import BuildingSearchPage from "./pages/buildingSearch";
import NavigationResultPage from "./pages/navigationResult";
import ReportRoutePage from "./pages/reportRoute";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Demo />} />
			<Route path="/landing" element={<LandingPage />} />
			<Route path="/university" element={<UniversitySearchPage />} />
			<Route path="/building" element={<BuildingSearchPage />} />
			<Route path="/map" element={<MapPage />} />
			<Route path="/result" element={<NavigationResultPage />} />
			<Route path="/report" element={<ReportRoutePage />} />
		</Routes>
	);
}

export default App;
