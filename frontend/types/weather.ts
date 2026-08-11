export interface LocationResult {
  name: string;
  country: string;
  state?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  condition: string;
  weatherCode: number;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  cloudCover: number;
  rainfall: number;
  rainProbability: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  timezone: string;
  isDay: boolean;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  condition: string;
  weatherCode: number;
  rainProbability: number;
  precipitation: number;
  windSpeed: number;
  uvIndex: number;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  condition: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  rainProbability: number;
  precipitation: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface AirQualityData {
  aqi: number;
  aqiStatus: 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Hazardous' | 'Data unavailable';
  pm25: number | null;
  pm10: number | null;
  co: number | null;
  no2: number | null;
  o3: number | null;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'warning' | 'alert' | 'danger';
  type: 'rain' | 'thunderstorm' | 'heat' | 'cold' | 'wind' | 'aqi';
}

export interface FullWeatherData {
  location: LocationResult;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality: AirQualityData;
  alerts: WeatherAlert[];
  lastUpdated: string;
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  message: string;
  type: string;
  location: string;
  isRead: boolean;
  createdAt: string;
}

export type UnitSystem = 'metric' | 'imperial';
