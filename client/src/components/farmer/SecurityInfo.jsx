import { useState } from "react";

const SecurityInfo = ({ formData, handleChange, errors }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-5">

      {/* Password */}

      <div>

        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password
          <span className="text-red-500"> *</span>
        </label>

        <input
          id="password"
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter Password"
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-600"
        />
        {errors?.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password}</p>
        )}

      </div>

      {/* Confirm Password */}

      <div>

        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Confirm Password
          <span className="text-red-500"> *</span>
        </label>

        <input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter Password"
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-600"
        />
        {errors?.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
        )}

      </div>

      {/* Show Password */}

      <label className="flex items-center gap-2">

        <input
          type="checkbox"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
        />

        Show Password

      </label>

    </div>
  );
};

export default SecurityInfo;