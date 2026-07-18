import React from "react";

const EmptyState = () => (
  <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
    <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl mb-4">
      📋
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-1">No Claims Found</h3>
    <p className="text-gray-400 text-sm max-w-sm">
      No farmer claims match your current filters. Try adjusting filter criteria or wait for new submissions.
    </p>
  </div>
);

export default EmptyState;
