import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedInOfficer, loginOfficer } from "../../utils/auth";

const Login = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (getLoggedInOfficer()) {
      navigate("/government/dashboard");
    }
  }, [navigate]);

  const validate = () => {
    const newErrors = {};
    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number or officer ID is required.";
    } else if (mobile.trim().length < 4) {
      newErrors.mobile = "Please enter a valid identifier.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setGeneralError("");
    
    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      const identifier = mobile.trim();
      const pwd = password.trim();

      if (
        (identifier === "9876543210" && pwd === "password123") ||
        (identifier === "admin" && pwd === "admin") ||
        (identifier === "officer" && pwd === "password123") ||
        (identifier === "AGR-TG-HYD-0001" && pwd === "password123") ||
        (identifier === "AGR-AP-GNT-0005" && pwd === "password123")
      ) {
        const isTg = identifier === "AGR-TG-HYD-0001" || identifier === "9876543210" || identifier === "officer";
        const officerUser = {
          username: identifier,
          role: "Government Officer",
          name: isTg ? "Dr. K. Prasad (District Officer - Telangana)" : "Shri M. Venkateswarlu (District Officer - Andhra Pradesh)",
          id: identifier.startsWith("AGR") ? identifier : "OFF-8821",
        };
        loginOfficer(officerUser, rememberMe);
        setIsLoading(false);
        navigate("/government/dashboard");
      } else {
        setIsLoading(false);
        setGeneralError("Invalid credentials. Please use the official registered officer credentials.");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        
        {/* Emblem or Logo header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-700 text-white rounded-full flex items-center justify-center text-3xl shadow-md border-2 border-white">
            🏛️
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
            Government of India
          </h2>
          <p className="mt-1 text-sm text-gray-500 font-semibold uppercase tracking-wider">
            Disaster Management & Relief Portal
          </p>
        </div>

        {/* Login form card */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          <h3 className="text-lg font-bold text-slate-800 text-center mb-6">
            Officer Secure Sign In
          </h3>

          {generalError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              ⚠️ {generalError}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            
            {/* Input Mobile / ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Officer ID / Mobile Number
              </label>
              <input
                type="text"
                autoComplete="off"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: "" }));
                }}
                placeholder="e.g. 9876543210"
                className={`w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition text-sm ${
                  errors.mobile ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.mobile && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.mobile}</p>
              )}
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  placeholder="••••••••"
                  className={`w-full border rounded-xl p-3 pr-10 outline-none focus:ring-2 focus:ring-blue-500 transition text-sm ${
                    errors.password ? "border-red-400" : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-xs font-semibold text-gray-500">
                  Keep me signed in
                </span>
              </label>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white py-3 px-4 rounded-xl font-bold transition shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mx-auto cursor-pointer"
          >
            ← Return to Landing Page
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;