import React from "react";

const EmptyState = () => {
  return (
    <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
      <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">
        🌾
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">
        No Claims Filed Yet
      </h3>
      <p className="text-gray-400 text-sm max-w-sm">
        If you have experienced crop loss due to flood, drought, or storm, report a claim to receive AI-powered assessment.
      </p>
    </div>
  );
};

export default EmptyState;
