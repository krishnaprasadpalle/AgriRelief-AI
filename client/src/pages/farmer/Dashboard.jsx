import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedInFarmer, logoutFarmer } from "../../utils/auth";
import DashboardHeader from "../../components/farmer/dashboard/DashboardHeader";
import ClaimCard from "../../components/farmer/dashboard/ClaimCard";
import NotificationCard from "../../components/farmer/dashboard/NotificationCard";
import EmptyState from "../../components/farmer/dashboard/EmptyState";

const Dashboard = () => {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [claims, setClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [popupNotification, setPopupNotification] = useState(null);

  useEffect(() => {
    const activeFarmer = getLoggedInFarmer();
    if (!activeFarmer) {
      navigate("/farmer/login");
      return;
    }
    setFarmer(activeFarmer);

    // Load claims from localStorage
    const allClaims = JSON.parse(localStorage.getItem("claims")) || [];
    // Filter claims by loggedIn farmer ID
    const farmerClaims = allClaims.filter(
      (c) => c.farmerId === activeFarmer.id && c.status !== "Rejected" && !c.hiddenFromFarmer
    );

    const storedNotifications = JSON.parse(localStorage.getItem("farmerNotifications")) || [];
    const farmerNotifications = storedNotifications
      .filter((n) => n.farmerId === activeFarmer.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setNotifications(farmerNotifications);

    const unreadRejection = farmerNotifications.find(
      (n) => n.category === "Rejected" && !n.read
    );
    if (unreadRejection) {
      setPopupNotification(unreadRejection);
    }

    // Fallback dummy data if no claims are present
    if (farmerClaims.length === 0) {
      const dummyClaims = [
        {
          claimId: "CLM-001",
          farmerId: activeFarmer.id,
          crop: "Paddy",
          damageType: "Flood",
          area: 2.5,
          severity: "High",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: "Under AI Review",
        },
        {
          claimId: "CLM-002",
          farmerId: activeFarmer.id,
          crop: "Cotton",
          damageType: "Heavy Rain",
          area: 1.8,
          severity: "Medium",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: "Approved",
        },
      ];
      setClaims(dummyClaims);
    } else {
      // Sort: newest first
      const sorted = [...farmerClaims].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setClaims(sorted);
    }
  }, [navigate]);

  const handleLogout = () => {
    logoutFarmer();
    navigate("/farmer/login");
  };

  const handleReportRedirect = () => {
    navigate("/farmer/report");
  };

  const defaultNotifications = [
    {
      id: 1,
      category: "Urgent",
      message: "Heavy rainfall compensation has been officially announced.",
      description: "Eligible farmers can expect payouts in their verified bank accounts within 14 business days.",
      date: "Today",
    },
    {
      id: 2,
      category: "Scheme",
      message: "Cyclone relief applications are now open.",
      description: "Apply before July 30, 2026 to avail compensation for damaged crops.",
      date: "2 days ago",
    },
    {
      id: 3,
      category: "Update",
      message: "New climate insurance scheme is now available for registration.",
      description: "Get covered for future erratic weather conditions at a subsidised premium of 1.5%.",
      date: "1 week ago",
    },
  ];

  const handleClosePopup = () => {
    if (!popupNotification) return;
    const allNotifications = JSON.parse(localStorage.getItem("farmerNotifications")) || [];
    const updated = allNotifications.map((item) =>
      item.id === popupNotification.id ? { ...item, read: true } : item
    );
    localStorage.setItem("farmerNotifications", JSON.stringify(updated));
    setNotifications((prev) =>
      prev.map((item) => (item.id === popupNotification.id ? { ...item, read: true } : item))
    );
    setPopupNotification(null);
  };

  if (!farmer) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <svg
            className="animate-spin h-8 w-8 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-gray-500 font-medium">Loading session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:py-8">
      {popupNotification && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 max-w-sm w-full p-6">
            <span className="text-[10px] text-red-600 uppercase font-extrabold tracking-wide">
              Claim Rejected
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-2">
              Your ticket got rejected because of these reasons.
            </h3>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              {popupNotification.description}
            </p>
            <button
              type="button"
              onClick={handleClosePopup}
              className="w-full mt-5 bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 font-bold cursor-pointer transition"
            >
              Okay
            </button>
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto flex flex-col min-h-[90vh] justify-between">
        
        <div>
          {/* Header Component */}
          <DashboardHeader farmerName={farmer.fullName} />

          {/* Quick Action Button */}
          <div className="mb-8">
            <button
              onClick={handleReportRedirect}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-4 px-6 font-bold shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 text-lg cursor-pointer"
            >
              <span>🌾</span> Report Crop Damage
            </button>
          </div>

          {/* My Claims Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span>📋 My Claims</span>
              <span className="text-xs bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                {claims.length} Total
              </span>
            </h2>

            {claims.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {claims.map((claim, index) => (
                  <ClaimCard key={claim.claimId || index} claim={claim} />
                ))}
              </div>
            )}
          </div>

          {/* Government Notifications Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              📢 Government Notifications
            </h2>
            <div className="space-y-3">
              {[...notifications, ...defaultNotifications].map((notif) => (
                <NotificationCard key={notif.id} notification={notif} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section Logout */}
        <div className="border-t border-gray-200/80 pt-6 mt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 text-slate-600 py-3 rounded-xl font-bold transition-all text-center cursor-pointer"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
