import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";

import FarmerLogin from "./pages/farmer/Login";
import FarmerDashboard from "./pages/farmer/Dashboard";
import FarmerRegister from "./pages/farmer/Register";
import ReportDamage from "./pages/farmer/ReportDamage";
import AIResult from "./pages/farmer/AIResult";

import GovernmentLogin from "./pages/government/Login";
import GovernmentDashboard from "./pages/government/Dashboard";
import ClaimDetails from "./pages/government/ClaimDetails";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/farmer" element={<Navigate to="/farmer/login" replace />} />
      <Route path="/farmer/login" element={<FarmerLogin />} />
      <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
      <Route path="/farmer/register" element={<FarmerRegister />} />
      <Route path="/farmer/report" element={<ReportDamage />} />
      <Route path="/farmer/result" element={<AIResult />} />

      <Route path="/government" element={<Navigate to="/government/login" replace />} />
      <Route path="/government/login" element={<GovernmentLogin />} />
      <Route
        path="/government/dashboard"
        element={<GovernmentDashboard />}
      />
      <Route
        path="/government/claim/:id"
        element={<ClaimDetails />}
      />

      <Route path="/admin" element={<Navigate to="/government/login" replace />} />
      <Route path="/admin/dashboard" element={<GovernmentDashboard />} />
      <Route path="/admin/claim/:id" element={<ClaimDetails />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
