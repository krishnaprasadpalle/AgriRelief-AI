import React from "react";

const ClaimFilters = ({ filters, setFilters, claims }) => {
  // Extract unique values from claims for dropdown options
  const unique = (key) => [...new Set(claims.map((c) => c[key]).filter(Boolean))];
  const uniqueGeo = (key) =>
    [...new Set(claims.map((c) => c.geo?.[key]).filter(Boolean))];

  const districts = uniqueGeo("district");
  const villages = uniqueGeo("village");
  const crops = unique("crop");
  const damageTypes = unique("damageType");
  const severities = unique("severity");
  const statuses = [
    "Submitted",
    "AI Reviewing",
    "Under AI Review",
    "Approved",
    "Rejected",
    "Field Inspection Required",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      district: "",
      village: "",
      crop: "",
      damageType: "",
      status: "",
      severity: "",
    });
  };

  const selectClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          🔍 Filter Claims
        </h3>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-4">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search by Claim ID or Farmer Name..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* District */}
        <select name="district" value={filters.district} onChange={handleChange} className={selectClass}>
          <option value="">All Districts</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Village */}
        <select name="village" value={filters.village} onChange={handleChange} className={selectClass}>
          <option value="">All Villages</option>
          {villages.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        {/* Crop */}
        <select name="crop" value={filters.crop} onChange={handleChange} className={selectClass}>
          <option value="">All Crops</option>
          {crops.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Damage Type */}
        <select name="damageType" value={filters.damageType} onChange={handleChange} className={selectClass}>
          <option value="">All Damage Types</option>
          {damageTypes.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Status */}
        <select name="status" value={filters.status} onChange={handleChange} className={selectClass}>
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Severity */}
        <select name="severity" value={filters.severity} onChange={handleChange} className={selectClass}>
          <option value="">All Severities</option>
          {severities.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ClaimFilters;
