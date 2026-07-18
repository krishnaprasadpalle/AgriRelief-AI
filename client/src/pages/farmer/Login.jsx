import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginFarmer } from "../../utils/auth";

const Login = () => {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleMobileChange = (e) => {
    const val = e.target.value;
    // Allow only numbers and limit to 10 digits
    if (/^\d*$/.test(val) && val.length <= 10) {
      setMobile(val);
    }
    if (errors.mobile) {
      setErrors((prev) => ({ ...prev, mobile: "" }));
    }
    setGeneralError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
    setGeneralError("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");

    // Validation
    const validationErrors = {};
    if (!mobile) {
      validationErrors.mobile = "Mobile number is required";
    } else if (mobile.length !== 10) {
      validationErrors.mobile = "Mobile number must be exactly 10 digits";
    }

    if (!password) {
      validationErrors.password = "Password is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    // Simulate login API call for realistic UX loading spinner
    setTimeout(() => {
      try {
        const farmers = JSON.parse(localStorage.getItem("farmers")) || [];
        let farmer = farmers.find(
          (f) => String(f.mobile).trim() === String(mobile).trim()
        );

        if (!farmer && mobile === "9876543219" && password === "password123") {
          // Auto-inject for clean browser testing
          farmer = {
            id: "1234567890",
            fullName: "Ramu K",
            mobile: "9876543219",
            aadhaar: "987654321098",
            district: "Adilabad",
            mandal: "Adilabad Rural",
            village: "Chanda",
            landArea: "3.5",
            cropType: "Paddy",
            ownership: "Owner",
            password: "password123",
            createdAt: new Date().toISOString(),
          };
          farmers.push(farmer);
          localStorage.setItem("farmers", JSON.stringify(farmers));
        }

        if (!farmer) {
          setGeneralError("Farmer not registered.");
          setIsLoading(false);
          return;
        }

        if (farmer.password !== password) {
          setGeneralError("Invalid password.");
          setIsLoading(false);
          return;
        }

        // Login successful
        loginFarmer(farmer, rememberMe);
        setIsLoading(false);
        navigate("/farmer/dashboard");
      } catch (err) {
        setGeneralError("An unexpected error occurred. Please try again.");
        setIsLoading(false);
        console.error(err);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6">
        
        <h1 className="text-3xl font-bold text-center text-green-700">
          Farmer Login
        </h1>

        <p className="text-center text-gray-500 mt-2 text-sm">
          Login to Report Crop Damage & Access AgriRelief AI
        </p>

        {/* Global Alert Message Banner */}
        {generalError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm text-center font-medium">
            {generalError}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-5">
          {/* Mobile Number Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter 10-digit Mobile Number"
              value={mobile}
              onChange={handleMobileChange}
              disabled={isLoading}
              autoComplete="off"
              className={`w-full border rounded-lg p-3 outline-none focus:ring-2 transition ${
                errors.mobile
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-green-600"
              }`}
            />
            {errors.mobile && (
              <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading}
                className={`w-full border rounded-lg p-3 pr-10 outline-none focus:ring-2 transition ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-600"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-3 text-gray-500 hover:text-green-600 focus:outline-none transition cursor-pointer"
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5" />
                ) : (
                  <FaEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Remember Me Box */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-4 w-4"
              />
              Remember Me
            </label>
          </div>

          {/* Submit Button with Loading State */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white rounded-lg py-3 font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          New Farmer?
          <Link
            to="/farmer/register"
            className="text-green-700 font-semibold ml-2 hover:underline"
          >
            Register Here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;