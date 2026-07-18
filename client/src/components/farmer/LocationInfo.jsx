import { telanganaLocations } from "../../data/telanganaLocations";

const LocationInfo = ({ formData, handleChange, errors }) => {
  const districts = Object.keys(telanganaLocations);

  const mandals =
    formData.district
      ? Object.keys(telanganaLocations[formData.district])
      : [];

  const villages =
    formData.district && formData.mandal
      ? telanganaLocations[formData.district][formData.mandal]
      : [];

  return (
    <div className="space-y-5">

      {/* District */}

      <div>
        <label
          htmlFor="district"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          District <span className="text-red-500">*</span>
        </label>

        <select
          id="district"
          name="district"
          value={formData.district}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-600"
        >
          <option value="">Select District</option>

          {districts.map((district) => (
            <option
              key={district}
              value={district}
            >
              {district}
            </option>
          ))}
        </select>
        {errors?.district && (
          <p className="text-red-500 text-xs mt-1">{errors.district}</p>
        )}
      </div>

      {/* Mandal */}

      <div>
        <label
          htmlFor="mandal"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Mandal <span className="text-red-500">*</span>
        </label>

        <select
          id="mandal"
          name="mandal"
          value={formData.mandal}
          onChange={handleChange}
          disabled={!formData.district}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-600"
        >
          <option value="">Select Mandal</option>

          {mandals.map((mandal) => (
            <option
              key={mandal}
              value={mandal}
            >
              {mandal}
            </option>
          ))}
        </select>
        {errors?.mandal && (
          <p className="text-red-500 text-xs mt-1">{errors.mandal}</p>
        )}
      </div>

      {/* Village */}

      <div>
        <label
          htmlFor="village"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Village <span className="text-red-500">*</span>
        </label>

        <select
          id="village"
          name="village"
          value={formData.village}
          onChange={handleChange}
          disabled={!formData.mandal}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-600"
        >
          <option value="">Select Village</option>

          {villages.map((village) => (
            <option
              key={village}
              value={village}
            >
              {village}
            </option>
          ))}
        </select>
        {errors?.village && (
          <p className="text-red-500 text-xs mt-1">{errors.village}</p>
        )}
      </div>

    </div>
  );
};

export default LocationInfo;