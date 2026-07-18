import React from "react";

const DashboardHeader = ({ farmerName }) => {
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good Morning";
    if (hrs < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl p-6 shadow-md mb-6 flex justify-between items-center">
      <div>
        <span className="text-green-100 text-xs font-semibold uppercase tracking-wider block">
          👋 Welcome
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
          {farmerName}
        </h1>
        <p className="text-green-50 text-sm mt-1 font-medium">
          {getGreeting()}, hope you are doing well today.
        </p>
      </div>
      <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-xl font-bold text-white shadow-inner">
        {farmerName ? farmerName.charAt(0).toUpperCase() : "F"}
      </div>
    </div>
  );
};

export default DashboardHeader;
