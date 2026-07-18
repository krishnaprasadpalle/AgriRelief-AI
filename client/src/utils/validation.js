export const validateRegistration = (formData) => {
  const errors = {};

  // Full Name
  if (!formData.fullName || !formData.fullName.trim()) {
    errors.fullName = "Full Name is required";
  }

  // Mobile
  if (!formData.mobile) {
    errors.mobile = "Mobile number is required";
  } else {
    const mobileStr = String(formData.mobile).trim();
    if (mobileStr.length !== 10 || !/^\d{10}$/.test(mobileStr)) {
      errors.mobile = "Invalid mobile number";
    }
  }

  // Aadhaar
  if (!formData.aadhaar) {
    errors.aadhaar = "Aadhaar number is required";
  } else {
    const aadhaarStr = String(formData.aadhaar).trim();
    if (aadhaarStr.length !== 12 || !/^\d{12}$/.test(aadhaarStr)) {
      errors.aadhaar = "Aadhaar must be exactly 12 digits";
    }
  }

  // District
  if (!formData.district || !formData.district.trim()) {
    errors.district = "District is required";
  }

  // Mandal
  if (!formData.mandal || !formData.mandal.trim()) {
    errors.mandal = "Mandal is required";
  }

  // Village
  if (!formData.village || !formData.village.trim()) {
    errors.village = "Village is required";
  }


  // Land Area
  if (!formData.landArea) {
    errors.landArea = "Land Area is required";
  } else {
    const area = Number(formData.landArea);
    if (isNaN(area) || area <= 0) {
      errors.landArea = "Land Area must be greater than 0";
    }
  }

  // Crop Type
  if (!formData.cropType || !formData.cropType.trim()) {
    errors.cropType = "Crop Type is required";
  }

  // Ownership
  if (!formData.ownership || !formData.ownership.trim()) {
    errors.ownership = "Ownership is required";
  }

  // Password
  if (!formData.password) {
    errors.password = "Password is required";
  } else if (formData.password.length < 8) {
    errors.password = "Password too short";
  }

  // Confirm Password
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Confirm Password is required";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Password and Confirm Password must match";
  }

  return errors;
};
