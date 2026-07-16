import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";

import FarmerLogin from "./pages/farmer/Login";
import FarmerDashboard from "./pages/farmer/Dashboard";
import ReportDamage from "./pages/farmer/ReportDamage";
import AIResult from "./pages/farmer/AIResult";

import GovernmentLogin from "./pages/government/Login";
import GovernmentDashboard from "./pages/government/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/farmer/login" element={<FarmerLogin />} />
      <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
      <Route path="/farmer/report" element={<ReportDamage />} />
      <Route path="/farmer/result" element={<AIResult />} />

      <Route path="/government/login" element={<GovernmentLogin />} />
      <Route
        path="/government/dashboard"
        element={<GovernmentDashboard />}
      />
    </Routes>
  );
}

export default App;