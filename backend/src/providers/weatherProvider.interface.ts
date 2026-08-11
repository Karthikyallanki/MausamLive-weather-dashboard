export interface LocationSearchResult {
  name: string;
  country: string;
  state?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface CurrentWeather {
  temperature: number; // °C
  feelsLike: number; // °C
  condition: string;
  weatherCode: number;
  icon: string;
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: number; // degrees
  pressure: number; // hPa
  visibility: number; // km
  cloudCover: number; // %
  rainfall: number; // mm
  rainProbability: number; // %
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
  location: LocationSearchResult;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality: AirQualityData;
  alerts: WeatherAlert[];
  lastUpdated: string;
}

export interface IWeatherProvider {
  searchLocation(query: string): Promise<LocationSearchResult[]>;
  getWeatherByCoords(lat: number, lon: number, locationName?: string): Promise<FullWeatherData>;
}
