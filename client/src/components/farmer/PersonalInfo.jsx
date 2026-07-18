const PersonalInfo = ({ formData, handleChange, errors }) => {
  return (
    <div className="space-y-5">

      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Full Name <span className="text-red-500">*</span>
        </label>

        <input
          id="fullName"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
        {errors?.fullName && (
          <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="mobile"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Mobile Number <span className="text-red-500">*</span>
        </label>

        <input
          id="mobile"
          type="tel"
          name="mobile"
          maxLength={10}
          value={formData.mobile}
          onChange={handleChange}
          placeholder="Enter mobile number"
          className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
        {errors?.mobile && (
          <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="aadhaar"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Aadhaar Number <span className="text-red-500">*</span>
        </label>

        <input
          id="aadhaar"
          type="text"
          name="aadhaar"
          maxLength={12}
          value={formData.aadhaar}
          onChange={handleChange}
          placeholder="Enter 12-digit Aadhaar Number"
          className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
        {errors?.aadhaar && (
          <p className="text-red-500 text-xs mt-1">{errors.aadhaar}</p>
        )}
      </div>

    </div>
  );
};

export default PersonalInfo;