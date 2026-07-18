/**
 * weatherService.js
 * Fetches current weather data from Open-Meteo API.
 * No API key required. Only called after GPS is confirmed.
 *
 * Open-Meteo docs: https://open-meteo.com/en/docs
 */

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>} Weather data object
 */
export const fetchWeather = async (latitude, longitude) => {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "wind_speed_10m",
        "precipitation",
        "weather_code",
      ].join(","),
      hourly: "precipitation_probability",
      forecast_days: "1",
      timezone: "Asia/Kolkata",
    });

    const response = await fetch(`${OPEN_METEO_URL}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Open-Meteo error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current || {};
    const hourly = data.hourly || {};

    // Get current hour's precipitation probability (index closest to now)
    const currentHour = new Date().getHours();
    const rainProbability = hourly.precipitation_probability
      ? hourly.precipitation_probability[currentHour] ?? null
      : null;

    return {
      temperature: current.temperature_2m ?? null,
      humidity: current.relative_humidity_2m ?? null,
      windSpeed: current.wind_speed_10m ?? null,
      precipitation: current.precipitation ?? null,
      rainProbability,
      weatherCode: current.weather_code ?? null,
      description: getWeatherDescription(current.weather_code),
    };
  } catch (error) {
    console.warn("Weather fetch failed:", error.message);
    return {
      temperature: null,
      humidity: null,
      windSpeed: null,
      precipitation: null,
      rainProbability: null,
      weatherCode: null,
      description: "Unavailable",
      error: true,
    };
  }
};

/**
 * WMO Weather Code to human-readable description.
 * See: https://open-meteo.com/en/docs#weathervariables
 */
const getWeatherDescription = (code) => {
  if (code === null || code === undefined) return "Unknown";
  if (code === 0) return "Clear Sky";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 9) return "Overcast";
  if (code <= 19) return "Fog / Mist";
  if (code <= 29) return "Drizzle";
  if (code <= 39) return "Rain";
  if (code <= 49) return "Freezing Rain";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain Showers";
  if (code <= 79) return "Snow";
  if (code <= 84) return "Rain Showers";
  if (code <= 94) return "Thunderstorm";
  if (code <= 99) return "Thunderstorm with Hail";
  return "Unknown";
};
