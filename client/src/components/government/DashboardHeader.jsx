import React from "react";

const DashboardHeader = () => {
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-6 shadow-md mb-6 flex justify-between items-center">
      <div>
        <span className="text-blue-100 text-xs font-semibold uppercase tracking-wider block">
          🏛️ Government Officer Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
          AgriRelief Dashboard
        </h1>
        <p className="text-blue-100 text-sm mt-1 font-medium">
          {getGreeting()}, Officer. Review and process farmer claims below.
        </p>
      </div>
      <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-xl font-bold text-white shadow-inner">
        🏛️
      </div>
    </div>
  );
};

export default DashboardHeader;
