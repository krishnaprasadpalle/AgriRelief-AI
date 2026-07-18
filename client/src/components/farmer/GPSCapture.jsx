const GPSCapture = ({
  formData,
  setFormData,
  errors,
}) => {

  const captureLocation = () => {

    if (!navigator.geolocation) {
      alert("Geolocation is not supported in your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(

      (position) => {

        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));

      },

      () => {
        alert("Unable to fetch your location.");
      }

    );
  };

  return (
    <div className="space-y-5">

      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Latitude
        </label>

        <input
          type="text"
          value={formData.latitude}
          readOnly
          placeholder="Capture GPS Location"
          className="w-full border rounded-lg p-3 bg-gray-100"
        />
        {errors?.latitude && (
          <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>
        )}

      </div>

      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Longitude
        </label>

        <input
          type="text"
          value={formData.longitude}
          readOnly
          placeholder="Capture GPS Location"
          className="w-full border rounded-lg p-3 bg-gray-100"
        />
        {errors?.longitude && (
          <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>
        )}

      </div>

      <button
        type="button"
        onClick={captureLocation}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold cursor-pointer"
      >
        📍 Capture Current Location
      </button>

    </div>
  );
};

export default GPSCapture;