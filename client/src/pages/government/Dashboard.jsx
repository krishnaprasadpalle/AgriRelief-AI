import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedInOfficer, logoutOfficer } from "../../utils/auth";
import DashboardHeader from "../../components/government/DashboardHeader";
import StatisticsCards from "../../components/government/StatisticsCards";
import ClaimFilters from "../../components/government/ClaimFilters";
import ClaimTable from "../../components/government/ClaimTable";
import ClaimCard from "../../components/government/ClaimCard";
import EmptyState from "../../components/government/EmptyState";

const Dashboard = () => {
  const navigate = useNavigate();
  const [officer, setOfficer] = useState(null);
  const [claims, setClaims] = useState([]);
  const [farmersMap, setFarmersMap] = useState({});
  
  const [filters, setFilters] = useState({
    search: "",
    district: "",
    village: "",
    crop: "",
    damageType: "",
    status: "",
    severity: "",
  });

  // ── Auth Guard & Load Data ────────────────────────────────────────────────
  useEffect(() => {
    const activeOfficer = getLoggedInOfficer();
    if (!activeOfficer) {
      navigate("/government/login");
      return;
    }
    setOfficer(activeOfficer);

    // Load farmers to map farmerId -> name
    const allFarmers = JSON.parse(localStorage.getItem("farmers")) || [];
    const fMap = {};
    allFarmers.forEach((f) => {
      fMap[f.id] = f.fullName;
    });
    setFarmersMap(fMap);

    // Load claims
    const allClaims = JSON.parse(localStorage.getItem("claims")) || [];
    // Sort by latest submission
    allClaims.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setClaims(allClaims);
  }, [navigate]);

  const handleLogout = () => {
    logoutOfficer();
    navigate("/government/login");
  };

  const handleViewClaim = (claimId) => {
    navigate(`/government/claim/${claimId}`);
  };

  if (!officer) return null;

  // ── Filter Logic ──────────────────────────────────────────────────────────
  const filteredClaims = claims.filter((claim) => {
    const farmerName = farmersMap[claim.farmerId] || "";
    
    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchId = claim.claimId?.toLowerCase().includes(q);
      const matchName = farmerName.toLowerCase().includes(q);
      if (!matchId && !matchName) return false;
    }

    // District
    if (filters.district && claim.geo?.district !== filters.district) {
      return false;
    }

    // Village
    if (filters.village && claim.geo?.village !== filters.village) {
      return false;
    }

    // Crop
    if (filters.crop && claim.crop !== filters.crop) {
      return false;
    }

    // Damage Type
    if (filters.damageType && claim.damageType !== filters.damageType) {
      return false;
    }

    // Status
    if (filters.status && claim.status !== filters.status) {
      return false;
    }

    // Severity
    if (filters.severity && claim.severity !== filters.severity) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation / Top Bar */}
        <div className="flex justify-between items-center bg-white border border-gray-200/60 rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Official Portal · {officer.name}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-red-600 hover:text-red-700 border border-red-200 bg-red-50 hover:bg-red-100/80 px-3 py-1.5 rounded-lg cursor-pointer transition select-none"
          >
            Logout
          </button>
        </div>

        {/* Dashboard Header */}
        <DashboardHeader />

        {/* Dynamic Statistics Cards */}
        <StatisticsCards claims={claims} />

        {/* Filters */}
        <ClaimFilters
          filters={filters}
          setFilters={setFilters}
          claims={claims}
        />

        {/* Claims View list */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight">
              📄 Submitted Claims List ({filteredClaims.length})
            </h2>
          </div>

          {filteredClaims.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Responsive Cards for mobile/tablet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {filteredClaims.map((claim) => (
                  <ClaimCard
                    key={claim.claimId}
                    claim={claim}
                    farmerName={farmersMap[claim.farmerId] || "Unknown"}
                    onView={handleViewClaim}
                  />
                ))}
              </div>

              {/* Table for large screens */}
              <ClaimTable
                claims={filteredClaims}
                farmersMap={farmersMap}
                onView={handleViewClaim}
              />
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;