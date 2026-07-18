import React from "react";

const StatisticsCards = ({ claims }) => {
  const total = claims.length;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = claims.filter(
    (c) => c.timestamp && c.timestamp.slice(0, 10) === today
  ).length;
  const pending = claims.filter(
    (c) => c.status === "Submitted" || c.status === "AI Reviewing" || c.status === "Under AI Review"
  ).length;
  const approved = claims.filter((c) => c.status === "Approved").length;
  const rejected = claims.filter((c) => c.status === "Rejected").length;
  const inspection = claims.filter(
    (c) => c.status === "Field Inspection Required"
  ).length;

  const cards = [
    { label: "Total Claims", value: total, icon: "📋", color: "bg-slate-50 border-slate-200 text-slate-700" },
    { label: "Today", value: todayCount, icon: "📅", color: "bg-blue-50 border-blue-200 text-blue-700" },
    { label: "Pending", value: pending, icon: "🕐", color: "bg-amber-50 border-amber-200 text-amber-700" },
    { label: "Approved", value: approved, icon: "✅", color: "bg-green-50 border-green-200 text-green-700" },
    { label: "Rejected", value: rejected, icon: "❌", color: "bg-red-50 border-red-200 text-red-700" },
    { label: "Inspection", value: inspection, icon: "🔍", color: "bg-orange-50 border-orange-200 text-orange-700" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`border rounded-xl p-4 ${card.color} flex flex-col items-center text-center shadow-sm`}
        >
          <span className="text-xl mb-1">{card.icon}</span>
          <span className="text-2xl font-extrabold">{card.value}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider mt-1 opacity-80">
            {card.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;
