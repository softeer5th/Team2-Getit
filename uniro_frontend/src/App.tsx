import { Route, Routes } from "react-router";
import "./App.css";
import Demo from "./pages/demo";
import LandingPage from "./pages/landing";
import UniversitySearchPage from "./pages/search";
import MapPage from "./pages/map";
import BuildingSearchPage from "./pages/buildingSearch";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Demo />} />
			<Route path="/landing" element={<LandingPage />} />
			<Route path="/university" element={<UniversitySearchPage />} />
			<Route path="/building" element={<BuildingSearchPage />} />
			<Route path="/map" element={<MapPage />} />
		</Routes>
	);
}

export default App;
