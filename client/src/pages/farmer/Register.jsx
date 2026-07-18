import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateRegistration } from "../../utils/validation";
import PersonalInfo from "../../components/farmer/PersonalInfo";
import LocationInfo from "../../components/farmer/LocationInfo";
import FarmInfo from "../../components/farmer/FarmInfo";
import SecurityInfo from "../../components/farmer/SecurityInfo";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    aadhaar: "",

    district: "",
    mandal: "",
    village: "",

    landArea: "",
    cropType: "",
    ownership: "",

    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "district") {
        updated.mandal = "";
        updated.village = "";
      }

      if (name === "mandal") {
        updated.village = "";
      }

      return updated;
    });

    // Clear specific field error as user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // ==========================
  // Register Button Function
  // ==========================

  const handleRegister = () => {
    setErrors({});
    setGeneralError("");
    setSuccessMessage("");

    // Validate form inputs
    const validationErrors = validateRegistration(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Fetch existing farmers from localStorage
      const existingFarmers = JSON.parse(localStorage.getItem("farmers")) || [];

      // Check for duplicate mobile or Aadhaar numbers
      const isMobileDuplicate = existingFarmers.some(
        (f) => String(f.mobile).trim() === String(formData.mobile).trim()
      );
      const isAadhaarDuplicate = existingFarmers.some(
        (f) => String(f.aadhaar).trim() === String(formData.aadhaar).trim()
      );

      if (isMobileDuplicate || isAadhaarDuplicate) {
        const dupErrors = {};
        if (isMobileDuplicate) {
          dupErrors.mobile = "Mobile number is already registered";
        }
        if (isAadhaarDuplicate) {
          dupErrors.aadhaar = "Aadhaar number is already registered";
        }
        setErrors(dupErrors);
        setGeneralError("A farmer with this mobile number or Aadhaar already exists.");
        return;
      }

      // Construct farmer object
      const newFarmer = {
        id: Date.now().toString(),
        fullName: formData.fullName.trim(),
        mobile: formData.mobile.trim(),
        aadhaar: formData.aadhaar.trim(),
        district: formData.district,
        mandal: formData.mandal,
        village: formData.village,
        landArea: formData.landArea,
        cropType: formData.cropType,
        ownership: formData.ownership,
        password: formData.password,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      existingFarmers.push(newFarmer);
      localStorage.setItem("farmers", JSON.stringify(existingFarmers));

      // Set success message
      setSuccessMessage("Farmer registered successfully! Redirecting to login...");

      // Clear all fields
      setFormData({
        fullName: "",
        mobile: "",
        aadhaar: "",
        district: "",
        mandal: "",
        village: "",
        landArea: "",
        cropType: "",
        ownership: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/farmer/login");
      }, 2000);

    } catch (e) {
      setGeneralError("An error occurred during registration. Please try again.");
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">

        <h1 className="text-3xl font-bold text-green-700 text-center">
          Farmer Registration
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Register to access AgriRelief AI
        </p>

        {/* Global/Success message alerts */}
        {successMessage && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm text-center font-medium">
            {successMessage}
          </div>
        )}
        {generalError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm text-center font-medium">
            {generalError}
          </div>
        )}

        {/* Personal Information */}

        <div className="mt-8">

          <h2 className="text-xl font-semibold text-slate-800 mb-5">
            👤 Personal Information
          </h2>

          <PersonalInfo
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />

        </div>

        {/* Farm Location */}

        <div className="mt-8">

          <h2 className="text-xl font-semibold text-slate-800 mb-5">
            📍 Farm Location
          </h2>

          <LocationInfo
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />

        </div>



        {/* Farm Details */}

        <div className="mt-8">

          <h2 className="text-xl font-semibold text-slate-800 mb-5">
            🌾 Farm Details
          </h2>

          <FarmInfo
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />

        </div>

        {/* Security */}

        <div className="mt-8">

          <h2 className="text-xl font-semibold text-slate-800 mb-5">
            🔒 Account Security
          </h2>

          <SecurityInfo
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />

        </div>

        {/* Register Button */}

        <div className="mt-10">

          <button
            type="button"
            onClick={handleRegister}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition duration-300 cursor-pointer"
          >
            Register
          </button>

        </div>

      </div>
    </div>
  );
};

export default Register;