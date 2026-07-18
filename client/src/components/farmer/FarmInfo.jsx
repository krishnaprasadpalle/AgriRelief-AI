const FarmInfo = ({ formData, handleChange, errors }) => {
  return (
    <div className="space-y-5">

      {/* Land Area */}

      <div>
        <label
          htmlFor="landArea"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Land Area (Acres)
          <span className="text-red-500"> *</span>
        </label>

        <input
          id="landArea"
          type="number"
          step="0.1"
          name="landArea"
          value={formData.landArea}
          onChange={handleChange}
          placeholder="Example: 2.5"
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-600"
          required
        />
        {errors?.landArea && (
          <p className="text-red-500 text-xs mt-1">{errors.landArea}</p>
        )}
      </div>

      {/* Crop Type */}

      <div>

        <label
          htmlFor="cropType"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Primary Crop
          <span className="text-red-500"> *</span>
        </label>

        <select
          id="cropType"
          name="cropType"
          value={formData.cropType}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-600"
          required
        >
          <option value="">Select Crop</option>

          <option value="Paddy">Paddy</option>
          <option value="Cotton">Cotton</option>
          <option value="Maize">Maize</option>
          <option value="Chilli">Chilli</option>
          <option value="Groundnut">Groundnut</option>
          <option value="Sugarcane">Sugarcane</option>

        </select>
        {errors?.cropType && (
          <p className="text-red-500 text-xs mt-1">{errors.cropType}</p>
        )}

      </div>

      {/* Land Ownership */}

      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Land Ownership
          <span className="text-red-500"> *</span>
        </label>

        <div className="space-y-2">

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ownership"
              value="Owner"
              checked={formData.ownership === "Owner"}
              onChange={handleChange}
            />
            Owner
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ownership"
              value="Tenant"
              checked={formData.ownership === "Tenant"}
              onChange={handleChange}
            />
            Tenant
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ownership"
              value="Both"
              checked={formData.ownership === "Both"}
              onChange={handleChange}
            />
            Both
          </label>

        </div>
        {errors?.ownership && (
          <p className="text-red-500 text-xs mt-1">{errors.ownership}</p>
        )}

      </div>

    </div>
  );
};

export default FarmInfo;