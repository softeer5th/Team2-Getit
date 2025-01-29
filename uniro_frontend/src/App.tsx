import { Route, Routes } from "react-router";
import "./App.css";
import Demo from "./pages/demo";
import LandingPage from "./pages/landing";
import UniversitySearchPage from "./pages/search";
import RouteResultPage from "./pages/result";
import DetailResultPage from "./pages/detailResult";
import MergedRoutePage from "./pages/combinedResult";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Demo />} />
			<Route path="/landing" element={<LandingPage />} />
			<Route path="/university" element={<UniversitySearchPage />} />
			<Route path="/result" element={<RouteResultPage />} />
			<Route path="/result/detail" element={<DetailResultPage />} />
			<Route path="/result/combined" element={<MergedRoutePage />} />
		</Routes>
	);
}

export default App;
