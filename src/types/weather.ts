export interface LocationTelemetry {
  id?: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
}

export interface CurrentWeatherTelemetry {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  pressure: number;
  surfacePressure: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  weatherCode: number;
  precipitation: number;
  cloudCover: number;
  cloudCoverLow: number;
  cloudCoverMid: number;
  cloudCoverHigh: number;
  uvIndex: number;
  directRadiation: number;
  visibility: number;
  isDay: boolean;
}

export interface AirQualityTelemetry {
  europeanAqi?: number;
  usAqi?: number;
  pm2_5?: number;
  pm10?: number;
  nitrogenDioxide?: number;
  ozone?: number;
  sulphurDioxide?: number;
  carbonMonoxide?: number;
  aerosolOpticalDepth?: number;
  dust?: number;
}

export interface HourlyTelemetryPoint {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex: number;
  visibility: number;
  cloudCover: number;
}

export interface DailyTelemetryPoint {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  apparentTemperatureMax: number;
  apparentTemperatureMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windGustsMax: number;
  windDirectionDominant: number;
}

export interface WeatherAlert {
  id: string;
  title: string;
  severity: 'critical' | 'severe' | 'moderate' | 'advisory';
  category: 'wind' | 'air_quality' | 'thermal' | 'precipitation' | 'uv' | 'pressure';
  headline: string;
  description: string;
  guidance: string;
  timestamp: string;
  validUntil: string;
  metricValue: string;
}

export interface AtmosphericSnapshot {
  location: LocationTelemetry;
  current: CurrentWeatherTelemetry;
  airQuality: AirQualityTelemetry;
  hourly: HourlyTelemetryPoint[];
  daily: DailyTelemetryPoint[];
  alerts: WeatherAlert[];
  lastUpdated: string;
}

export type UnitSystem = 'metric' | 'imperial' | 'nautical';

export type ThemeMode = 'dark' | 'light' | 'stratosphere';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
