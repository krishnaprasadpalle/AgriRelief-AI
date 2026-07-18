import React from "react";

const NotificationCard = ({ notification }) => {
  const getBadgeStyle = (category) => {
    switch (category) {
      case "Urgent":
        return "bg-red-100 text-red-700 border-red-200";
      case "Scheme":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="bg-white border-l-4 border-green-600 rounded-r-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border ${getBadgeStyle(notification.category)}`}>
            {notification.category}
          </span>
          <span className="text-[10px] text-gray-400 font-semibold">{notification.date}</span>
        </div>
        <h4 className="text-sm font-semibold text-slate-800 leading-snug">
          {notification.message}
        </h4>
        {notification.description && (
          <p className="text-xs text-gray-500 mt-1">{notification.description}</p>
        )}
      </div>
      {notification.link && (
        <a
          href={notification.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-green-700 hover:text-green-800 hover:underline flex items-center gap-1 cursor-pointer"
        >
          View details →
        </a>
      )}
    </div>
  );
};

export default NotificationCard;
