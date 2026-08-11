import {
  IWeatherProvider,
  LocationSearchResult,
  FullWeatherData,
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  AirQualityData,
  WeatherAlert,
} from './weatherProvider.interface';
import { logger } from '../utils/logger';

// Helper to translate WMO Weather Interpretation Codes
export function decodeWMOCode(code: number): { condition: string; icon: string } {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', icon: 'Sun' };
    case 1:
      return { condition: 'Mainly Clear', icon: 'SunMedium' };
    case 2:
      return { condition: 'Partly Cloudy', icon: 'CloudSun' };
    case 3:
      return { condition: 'Overcast', icon: 'Cloud' };
    case 45:
    case 48:
      return { condition: 'Foggy', icon: 'CloudFog' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Drizzle', icon: 'CloudDrizzle' };
    case 56:
    case 57:
      return { condition: 'Freezing Drizzle', icon: 'Snowflake' };
    case 61:
      return { condition: 'Slight Rain', icon: 'CloudRain' };
    case 63:
      return { condition: 'Moderate Rain', icon: 'CloudRain' };
    case 65:
      return { condition: 'Heavy Rain', icon: 'CloudRainWind' };
    case 66:
    case 67:
      return { condition: 'Freezing Rain', icon: 'Snowflake' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Snowfall', icon: 'Snowflake' };
    case 77:
      return { condition: 'Snow Grains', icon: 'Snowflake' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', icon: 'CloudRain' };
    case 85:
    case 86:
      return { condition: 'Snow Showers', icon: 'Snowflake' };
    case 95:
      return { condition: 'Thunderstorm', icon: 'CloudLightning' };
    case 96:
    case 99:
      return { condition: 'Thunderstorm with Hail', icon: 'CloudLightning' };
    default:
      return { condition: 'Unknown Condition', icon: 'Cloud' };
  }
}

// AQI Status calculation
export function getAQIStatus(usAqi: number | null): AirQualityData['aqiStatus'] {
  if (usAqi === null || usAqi === undefined) return 'Data unavailable';
  if (usAqi <= 50) return 'Good';
  if (usAqi <= 100) return 'Moderate';
  if (usAqi <= 150) return 'Poor';
  if (usAqi <= 200) return 'Very Poor';
  return 'Hazardous';
}

export class OpenMeteoProvider implements IWeatherProvider {
  async searchLocation(query: string): Promise<LocationSearchResult[]> {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query
      )}&count=10&language=en&format=json`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Geocoding API responded with status ${response.status}`);
      }

      const data: any = await response.json();
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.map((item: any) => ({
        name: item.name,
        country: item.country || '',
        state: item.admin1 || item.admin2 || '',
        latitude: item.latitude,
        longitude: item.longitude,
        timezone: item.timezone || 'UTC',
      }));
    } catch (error) {
      logger.error('OpenMeteo geocoding search failed:', error);
      throw error;
    }
  }

  async getWeatherByCoords(
    lat: number,
    lon: number,
    locationName?: string
  ): Promise<FullWeatherData> {
    try {
      // 1. Fetch Weather Data
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,pressure_msl,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max&timezone=auto`;

      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) {
        throw new Error(`Open-Meteo API responded with status ${weatherRes.status}`);
      }
      const weatherData: any = await weatherRes.json();

      // 2. Fetch Air Quality Data
      let airQualityData: AirQualityData = {
        aqi: 0,
        aqiStatus: 'Data unavailable',
        pm25: null,
        pm10: null,
        co: null,
        no2: null,
        o3: null,
      };

      try {
        const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone&timezone=auto`;
        const aqRes = await fetch(aqUrl);
        if (aqRes.ok) {
          const aqJson: any = await aqRes.json();
          if (aqJson.current) {
            const currentAq = aqJson.current;
            const aqiValue = currentAq.us_aqi ?? 0;
            airQualityData = {
              aqi: Math.round(aqiValue),
              aqiStatus: getAQIStatus(currentAq.us_aqi),
              pm25: currentAq.pm2_5 !== undefined ? Math.round(currentAq.pm2_5) : null,
              pm10: currentAq.pm10 !== undefined ? Math.round(currentAq.pm10) : null,
              co: currentAq.carbon_monoxide !== undefined ? Math.round(currentAq.carbon_monoxide) : null,
              no2: currentAq.nitrogen_dioxide !== undefined ? Math.round(currentAq.nitrogen_dioxide) : null,
              o3: currentAq.ozone !== undefined ? Math.round(currentAq.ozone) : null,
            };
          }
        }
      } catch (aqErr) {
        logger.warn('Air Quality API fetch failed, defaulting to unavailable:', aqErr);
      }

      // 3. Transform Current Weather
      const currentRaw = weatherData.current || {};
      const hourlyRaw = weatherData.hourly || {};
      const dailyRaw = weatherData.daily || {};
      const timezone = weatherData.timezone || 'UTC';

      const decodedCurrent = decodeWMOCode(currentRaw.weather_code || 0);

      // Rain probability for current hour (first index of hourly precipitation_probability)
      const currentRainProb =
        hourlyRaw.precipitation_probability && hourlyRaw.precipitation_probability.length > 0
          ? hourlyRaw.precipitation_probability[0]
          : 0;

      const sunriseToday = dailyRaw.sunrise && dailyRaw.sunrise.length > 0 ? dailyRaw.sunrise[0] : '';
      const sunsetToday = dailyRaw.sunset && dailyRaw.sunset.length > 0 ? dailyRaw.sunset[0] : '';

      // Estimate UV index from current hour
      const currentUvIndex =
        hourlyRaw.uv_index && hourlyRaw.uv_index.length > 0 ? Math.round(hourlyRaw.uv_index[0] * 10) / 10 : 0;

      const current: CurrentWeather = {
        temperature: Math.round(currentRaw.temperature_2m ?? 0),
        feelsLike: Math.round(currentRaw.apparent_temperature ?? 0),
        condition: decodedCurrent.condition,
        weatherCode: currentRaw.weather_code ?? 0,
        icon: decodedCurrent.icon,
        humidity: Math.round(currentRaw.relative_humidity_2m ?? 0),
        windSpeed: Math.round((currentRaw.wind_speed_10m ?? 0) * 10) / 10,
        windDirection: currentRaw.wind_direction_10m ?? 0,
        pressure: Math.round(currentRaw.pressure_msl ?? currentRaw.surface_pressure ?? 1013),
        visibility: 10, // Default 10km standard clear visibility if not directly supplied
        cloudCover: Math.round(currentRaw.cloud_cover ?? 0),
        rainfall: Math.round((currentRaw.precipitation ?? 0) * 10) / 10,
        rainProbability: currentRainProb,
        uvIndex: currentUvIndex,
        sunrise: sunriseToday,
        sunset: sunsetToday,
        timezone,
        isDay: currentRaw.is_day === 1,
      };

      // 4. Transform Hourly Forecast (Next 24 Hours)
      const hourly: HourlyForecastItem[] = [];
      if (hourlyRaw.time && Array.isArray(hourlyRaw.time)) {
        const totalHours = Math.min(hourlyRaw.time.length, 24);
        for (let i = 0; i < totalHours; i++) {
          const code = hourlyRaw.weather_code ? hourlyRaw.weather_code[i] : 0;
          const decoded = decodeWMOCode(code);
          hourly.push({
            time: hourlyRaw.time[i],
            temperature: Math.round(hourlyRaw.temperature_2m ? hourlyRaw.temperature_2m[i] : 0),
            condition: decoded.condition,
            weatherCode: code,
            rainProbability: hourlyRaw.precipitation_probability
              ? hourlyRaw.precipitation_probability[i] || 0
              : 0,
            precipitation: hourlyRaw.precipitation
              ? Math.round((hourlyRaw.precipitation[i] || 0) * 10) / 10
              : 0,
            windSpeed: hourlyRaw.wind_speed_10m
              ? Math.round((hourlyRaw.wind_speed_10m[i] || 0) * 10) / 10
              : 0,
            uvIndex: hourlyRaw.uv_index
              ? Math.round((hourlyRaw.uv_index[i] || 0) * 10) / 10
              : 0,
          });
        }
      }

      // 5. Transform Daily Forecast (7 Days)
      const daily: DailyForecastItem[] = [];
      if (dailyRaw.time && Array.isArray(dailyRaw.time)) {
        for (let i = 0; i < dailyRaw.time.length; i++) {
          const code = dailyRaw.weather_code ? dailyRaw.weather_code[i] : 0;
          const decoded = decodeWMOCode(code);
          const dateStr = dailyRaw.time[i];
          const dateObj = new Date(dateStr);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

          daily.push({
            date: dateStr,
            dayName,
            condition: decoded.condition,
            weatherCode: code,
            tempMax: Math.round(dailyRaw.temperature_2m_max ? dailyRaw.temperature_2m_max[i] : 0),
            tempMin: Math.round(dailyRaw.temperature_2m_min ? dailyRaw.temperature_2m_min[i] : 0),
            rainProbability: dailyRaw.precipitation_probability_max
              ? dailyRaw.precipitation_probability_max[i] || 0
              : 0,
            precipitation: dailyRaw.precipitation_sum
              ? Math.round((dailyRaw.precipitation_sum[i] || 0) * 10) / 10
              : 0,
            uvIndexMax: dailyRaw.uv_index_max
              ? Math.round((dailyRaw.uv_index_max[i] || 0) * 10) / 10
              : 0,
            sunrise: dailyRaw.sunrise ? dailyRaw.sunrise[i] : '',
            sunset: dailyRaw.sunset ? dailyRaw.sunset[i] : '',
          });
        }
      }

      // 6. Generate Real Weather Alerts based on actual threshold criteria
      const alerts: WeatherAlert[] = [];

      // Rain Alert Rule
      if (current.rainProbability >= 70 || current.rainfall > 5) {
        alerts.push({
          id: `rain-${Date.now()}`,
          title: '🌧️ Heavy Rain Alert',
          description: `Rain probability is ${current.rainProbability}% with expected rainfall of ${current.rainfall} mm.`,
          severity: 'warning',
          type: 'rain',
        });
      }

      // Thunderstorm Alert Rule
      if ([95, 96, 99].includes(current.weatherCode)) {
        alerts.push({
          id: `thunder-${Date.now()}`,
          title: '⛈️ Thunderstorm Warning',
          description: 'Thunderstorms and severe localized atmospheric instability expected.',
          severity: 'danger',
          type: 'thunderstorm',
        });
      }

      // Extreme Heat Alert Rule
      if (current.temperature >= 38) {
        alerts.push({
          id: `heat-${Date.now()}`,
          title: '🔥 Extreme Heat Alert',
          description: `Temperature is reaching ${current.temperature}°C. Stay hydrated and avoid direct sunlight.`,
          severity: 'alert',
          type: 'heat',
        });
      }

      // Extreme Cold Alert Rule
      if (current.temperature <= 0) {
        alerts.push({
          id: `cold-${Date.now()}`,
          title: '❄️ Freezing Temperature Alert',
          description: `Sub-zero temperatures of ${current.temperature}°C detected. Keep warm.`,
          severity: 'alert',
          type: 'cold',
        });
      }

      // Strong Wind Alert Rule
      if (current.windSpeed >= 40) {
        alerts.push({
          id: `wind-${Date.now()}`,
          title: '💨 High Wind Warning',
          description: `Wind speed is reaching ${current.windSpeed} km/h. Secure loose outdoor objects.`,
          severity: 'warning',
          type: 'wind',
        });
      }

      // Air Quality Alert Rule
      if (['Poor', 'Very Poor', 'Hazardous'].includes(airQualityData.aqiStatus)) {
        alerts.push({
          id: `aqi-${Date.now()}`,
          title: '😷 Poor Air Quality Alert',
          description: `Air Quality Index is ${airQualityData.aqi} (${airQualityData.aqiStatus}). Sensitive groups should limit outdoor activity.`,
          severity: 'warning',
          type: 'aqi',
        });
      }

      const location: LocationSearchResult = {
        name: locationName || 'Selected Location',
        country: '',
        latitude: lat,
        longitude: lon,
        timezone,
      };

      return {
        location,
        current,
        hourly,
        daily,
        airQuality: airQualityData,
        alerts,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('OpenMeteo getWeatherByCoords failed:', error);
      throw error;
    }
  }
}
