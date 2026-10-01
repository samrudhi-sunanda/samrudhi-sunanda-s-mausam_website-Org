import {
  AtmosphericSnapshot,
  CurrentWeatherTelemetry,
  DailyTelemetryPoint,
  HourlyTelemetryPoint,
  LocationTelemetry,
  WeatherAlert,
  AirQualityTelemetry,
} from '../types/weather';

export const PRESET_LOCATIONS: LocationTelemetry[] = [
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, elevation: 40, timezone: 'Asia/Tokyo' },
  { name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777, elevation: 14, timezone: 'Asia/Kolkata' },
  { name: 'San Francisco', country: 'United States', admin1: 'California', latitude: 37.7749, longitude: -122.4194, elevation: 16, timezone: 'America/Los_Angeles' },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, elevation: 25, timezone: 'Europe/London' },
  { name: 'Reykjavik', country: 'Iceland', latitude: 64.1466, longitude: -21.9426, elevation: 18, timezone: 'Atlantic/Reykjavik' },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, elevation: 5, timezone: 'Asia/Dubai' },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, elevation: 15, timezone: 'Asia/Singapore' },
  { name: 'Zurich', country: 'Switzerland', latitude: 47.3769, longitude: 8.5417, elevation: 408, timezone: 'Europe/Zurich' },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, elevation: 19, timezone: 'Australia/Sydney' },
];

export function getWindCardinal(degrees: number): string {
  const normalized = (degrees % 360 + 360) % 360;
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'
  ];
  const index = Math.round(normalized / 22.5);
  return directions[index];
}

export function getBeaufortScale(kmh: number): { scale: number; description: string; impact: string } {
  if (kmh < 1) return { scale: 0, description: 'Calm', impact: 'Smoke rises vertically. Sea like a mirror.' };
  if (kmh <= 5) return { scale: 1, description: 'Light Air', impact: 'Direction shown by smoke drift, not wind vanes.' };
  if (kmh <= 11) return { scale: 2, description: 'Light Breeze', impact: 'Wind felt on face; leaves rustle; vanes moved.' };
  if (kmh <= 19) return { scale: 3, description: 'Gentle Breeze', impact: 'Leaves and small twigs in constant motion.' };
  if (kmh <= 28) return { scale: 4, description: 'Moderate Breeze', impact: 'Dust and loose paper raised; small branches move.' };
  if (kmh <= 38) return { scale: 5, description: 'Fresh Breeze', impact: 'Small trees in leaf begin to sway; crested wavelets.' };
  if (kmh <= 49) return { scale: 6, description: 'Strong Breeze', impact: 'Large branches in motion; whistling in telephone wires.' };
  if (kmh <= 61) return { scale: 7, description: 'High Wind / Near Gale', impact: 'Whole trees in motion; resistance felt walking against wind.' };
  if (kmh <= 74) return { scale: 8, description: 'Gale', impact: 'Twigs break off trees; generally impedes progress.' };
  if (kmh <= 88) return { scale: 9, description: 'Strong Gale', impact: 'Slight structural damage occurs (chimney-pots and slates removed).' };
  if (kmh <= 102) return { scale: 10, description: 'Storm', impact: 'Trees uprooted; considerable structural damage.' };
  if (kmh <= 117) return { scale: 11, description: 'Violent Storm', impact: 'Widespread damage; very rarely experienced.' };
  return { scale: 12, description: 'Hurricane Force', impact: 'Devastating destruction.' };
}

export function getWmoWeatherDetails(code: number, isDay: boolean = true): {
  label: string;
  description: string;
  category: 'clear' | 'clouds' | 'fog' | 'rain' | 'snow' | 'thunderstorm';
} {
  switch (code) {
    case 0:
      return { label: isDay ? 'Clear Sky' : 'Clear Night', description: 'Cloudless skies with excellent optical transparency', category: 'clear' };
    case 1:
      return { label: 'Mainly Clear', description: 'Scattered high cirrus or minor fair-weather cumulus', category: 'clear' };
    case 2:
      return { label: 'Partly Cloudy', description: 'Scattered cumulus clouds covering 25-50% of sky', category: 'clouds' };
    case 3:
      return { label: 'Overcast', description: 'Dense stratus layer covering entire celestial dome', category: 'clouds' };
    case 45:
      return { label: 'Radiation Fog', description: 'Dense boundary-layer ground fog with reduced horizontal visibility', category: 'fog' };
    case 48:
      return { label: 'Depositing Rime Fog', description: 'Supercooled fog particles forming ice rime on surfaces', category: 'fog' };
    case 51:
      return { label: 'Light Drizzle', description: 'Sparse micro-droplets with minimal surface accumulation', category: 'rain' };
    case 53:
      return { label: 'Moderate Drizzle', description: 'Continuous fine precipitation with ground moistening', category: 'rain' };
    case 55:
      return { label: 'Dense Drizzle', description: 'High droplet density causing surface water film', category: 'rain' };
    case 61:
      return { label: 'Slight Rain', description: 'Gentle intermittent rain showers', category: 'rain' };
    case 63:
      return { label: 'Moderate Rain', description: 'Continuous steady rain from nimbostratus clouds', category: 'rain' };
    case 65:
      return { label: 'Heavy Rain', description: 'Intense precipitation with potential surface runoff', category: 'rain' };
    case 71:
      return { label: 'Slight Snowfall', description: 'Light dry snow flurries', category: 'snow' };
    case 73:
      return { label: 'Moderate Snowfall', description: 'Steady dendritic snowfall accumulating on cold ground', category: 'snow' };
    case 75:
      return { label: 'Heavy Snowfall', description: 'Dense snowfall with severe visibility reduction', category: 'snow' };
    case 77:
      return { label: 'Snow Grains', description: 'Tiny opaque ice grains falling from boundary layer', category: 'snow' };
    case 80:
      return { label: 'Slight Rain Showers', description: 'Brief convective showers with rapid clearing', category: 'rain' };
    case 81:
      return { label: 'Moderate Rain Showers', description: 'Convective cell showers with wind gusts', category: 'rain' };
    case 82:
      return { label: 'Violent Rain Showers', description: 'Torrential downpour with localized squalls', category: 'rain' };
    case 85:
      return { label: 'Slight Snow Showers', description: 'Intermittent snow flurries', category: 'snow' };
    case 86:
      return { label: 'Heavy Snow Showers', description: 'Intense snow squalls with rapid accumulation', category: 'snow' };
    case 95:
      return { label: 'Thunderstorm', description: 'Active convective lightning storm with turbulent downdrafts', category: 'thunderstorm' };
    case 96:
    case 99:
      return { label: 'Severe Hail Thunderstorm', description: 'Severe convective storm with lightning and solid ice hail', category: 'thunderstorm' };
    default:
      return { label: 'Atmospheric State Nominal', description: 'Standard ambient tropospheric conditions', category: 'clouds' };
  }
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<LocationTelemetry> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.county || 'Current Position';
      const country = addr.country || '';
      const admin1 = addr.state || addr.region || '';
      return {
        name: cityName,
        country: country,
        admin1: admin1,
        latitude: Math.round(latitude * 1000) / 1000,
        longitude: Math.round(longitude * 1000) / 1000,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
  } catch (e) {
    console.warn('Reverse geocoding failed, falling back to coordinate label:', e);
  }
  return {
    name: 'Live GPS Position',
    country: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
    latitude: Math.round(latitude * 1000) / 1000,
    longitude: Math.round(longitude * 1000) / 1000,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export async function searchLocations(query: string): Promise<LocationTelemetry[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=7&language=en&format=json`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];
    return data.results.map((r: any) => ({
      id: r.id,
      name: r.name,
      country: r.country,
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude,
      elevation: r.elevation,
      timezone: r.timezone,
    }));
  } catch (err) {
    console.error('Location search error:', err);
    return [];
  }
}

export async function fetchAtmosphericSnapshot(loc: LocationTelemetry): Promise<AtmosphericSnapshot> {
  const { latitude, longitude, timezone = 'auto' } = loc;

  // 1. Fetch Open-Meteo Weather Forecast
  const weatherParams = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'cloud_cover_low',
      'cloud_cover_mid',
      'cloud_cover_high',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'uv_index',
      'direct_radiation',
      'visibility'
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'pressure_msl',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'uv_index',
      'visibility',
      'cloud_cover'
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant'
    ].join(','),
    timezone: timezone || 'auto',
    forecast_days: '7',
  });

  // 2. Fetch Open-Meteo Air Quality
  const aqiParams = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      'european_aqi',
      'us_aqi',
      'pm10',
      'pm2_5',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'sulphur_dioxide',
      'ozone',
      'aerosol_optical_depth',
      'dust'
    ].join(','),
    timezone: timezone || 'auto',
  });

  const [weatherRes, aqiRes] = await Promise.all([
    fetch(`https://api.open-meteo.com/v1/forecast?${weatherParams.toString()}`),
    fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${aqiParams.toString()}`).catch(() => null),
  ]);

  if (!weatherRes.ok) {
    throw new Error(`Open-Meteo weather API failed with status ${weatherRes.status}`);
  }

  const weatherData = await weatherRes.json();
  let aqiData: any = null;
  if (aqiRes && aqiRes.ok) {
    try {
      aqiData = await aqiRes.json();
    } catch {
      aqiData = null;
    }
  }

  // Parse Current Telemetry
  const cur = weatherData.current;
  const current: CurrentWeatherTelemetry = {
    time: cur.time,
    temperature: Math.round(cur.temperature_2m * 10) / 10,
    apparentTemperature: Math.round(cur.apparent_temperature * 10) / 10,
    humidity: Math.round(cur.relative_humidity_2m),
    pressure: Math.round(cur.pressure_msl),
    surfacePressure: Math.round(cur.surface_pressure),
    windSpeed: Math.round(cur.wind_speed_10m * 10) / 10,
    windGusts: Math.round(cur.wind_gusts_10m * 10) / 10,
    windDirection: Math.round(cur.wind_direction_10m),
    weatherCode: cur.weather_code,
    precipitation: cur.precipitation ?? 0,
    cloudCover: cur.cloud_cover ?? 0,
    cloudCoverLow: cur.cloud_cover_low ?? 0,
    cloudCoverMid: cur.cloud_cover_mid ?? 0,
    cloudCoverHigh: cur.cloud_cover_high ?? 0,
    uvIndex: Math.round((cur.uv_index ?? 0) * 10) / 10,
    directRadiation: Math.round(cur.direct_radiation ?? 0),
    visibility: cur.visibility ?? 10000,
    isDay: cur.is_day === 1,
  };

  // Parse Air Quality
  const aqiCur = aqiData?.current;
  const airQuality: AirQualityTelemetry = {
    europeanAqi: aqiCur?.european_aqi ?? Math.min(100, Math.round((aqiCur?.pm2_5 ?? 15) * 1.8)),
    usAqi: aqiCur?.us_aqi ?? Math.min(250, Math.round((aqiCur?.pm2_5 ?? 15) * 3)),
    pm2_5: Math.round((aqiCur?.pm2_5 ?? 12) * 10) / 10,
    pm10: Math.round((aqiCur?.pm10 ?? 24) * 10) / 10,
    nitrogenDioxide: Math.round((aqiCur?.nitrogen_dioxide ?? 18) * 10) / 10,
    ozone: Math.round((aqiCur?.ozone ?? 45) * 10) / 10,
    sulphurDioxide: Math.round((aqiCur?.sulphur_dioxide ?? 6) * 10) / 10,
    carbonMonoxide: Math.round((aqiCur?.carbon_monoxide ?? 280)),
    aerosolOpticalDepth: aqiCur?.aerosol_optical_depth ? Math.round(aqiCur.aerosol_optical_depth * 100) / 100 : undefined,
    dust: aqiCur?.dust ? Math.round(aqiCur.dust * 10) / 10 : undefined,
  };

  // Parse Hourly Points (Next 24-48 hours)
  const hourlyRaw = weatherData.hourly;
  const hourly: HourlyTelemetryPoint[] = [];
  if (hourlyRaw && hourlyRaw.time) {
    const count = Math.min(48, hourlyRaw.time.length);
    for (let i = 0; i < count; i++) {
      hourly.push({
        time: hourlyRaw.time[i],
        temperature: Math.round(hourlyRaw.temperature_2m[i] * 10) / 10,
        apparentTemperature: Math.round(hourlyRaw.apparent_temperature[i] * 10) / 10,
        humidity: Math.round(hourlyRaw.relative_humidity_2m[i]),
        precipitationProbability: hourlyRaw.precipitation_probability[i] ?? 0,
        precipitation: hourlyRaw.precipitation[i] ?? 0,
        weatherCode: hourlyRaw.weather_code[i] ?? 0,
        pressure: Math.round(hourlyRaw.pressure_msl[i] ?? 1013),
        windSpeed: Math.round(hourlyRaw.wind_speed_10m[i] * 10) / 10,
        windDirection: Math.round(hourlyRaw.wind_direction_10m[i] ?? 0),
        windGusts: Math.round(hourlyRaw.wind_gusts_10m[i] * 10) / 10,
        uvIndex: hourlyRaw.uv_index[i] ?? 0,
        visibility: hourlyRaw.visibility[i] ?? 10000,
        cloudCover: hourlyRaw.cloud_cover[i] ?? 0,
      });
    }
  }

  // Parse Daily Points
  const dailyRaw = weatherData.daily;
  const daily: DailyTelemetryPoint[] = [];
  if (dailyRaw && dailyRaw.time) {
    for (let i = 0; i < dailyRaw.time.length; i++) {
      daily.push({
        date: dailyRaw.time[i],
        weatherCode: dailyRaw.weather_code[i],
        temperatureMax: Math.round(dailyRaw.temperature_2m_max[i] * 10) / 10,
        temperatureMin: Math.round(dailyRaw.temperature_2m_min[i] * 10) / 10,
        apparentTemperatureMax: Math.round(dailyRaw.apparent_temperature_max[i] * 10) / 10,
        apparentTemperatureMin: Math.round(dailyRaw.apparent_temperature_min[i] * 10) / 10,
        sunrise: dailyRaw.sunrise[i],
        sunset: dailyRaw.sunset[i],
        uvIndexMax: Math.round(dailyRaw.uv_index_max[i] * 10) / 10,
        precipitationSum: Math.round((dailyRaw.precipitation_sum[i] ?? 0) * 10) / 10,
        precipitationProbabilityMax: dailyRaw.precipitation_probability_max[i] ?? 0,
        windSpeedMax: Math.round(dailyRaw.wind_speed_10m_max[i] * 10) / 10,
        windGustsMax: Math.round(dailyRaw.wind_gusts_10m_max[i] * 10) / 10,
        windDirectionDominant: Math.round(dailyRaw.wind_direction_10m_dominant[i] ?? 0),
      });
    }
  }

  // Atmospheric Anomaly and Active Alerts Synthesis
  const alerts = detectAtmosphericAlerts(current, airQuality, hourly, loc.name);

  return {
    location: {
      ...loc,
      elevation: weatherData.elevation ?? loc.elevation,
      timezone: weatherData.timezone ?? loc.timezone,
    },
    current,
    airQuality,
    hourly,
    daily,
    alerts,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

function detectAtmosphericAlerts(
  current: CurrentWeatherTelemetry,
  aqi: AirQualityTelemetry,
  hourly: HourlyTelemetryPoint[],
  cityName: string
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const now = new Date();
  const formatTime = (hoursAhead: number) => {
    const d = new Date(now.getTime() + hoursAhead * 3600000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 1. Wind & Kinetic Shear Alert
  if (current.windGusts >= 60 || current.windSpeed >= 45) {
    alerts.push({
      id: 'alert-wind-critical',
      title: 'High Gale & Wind Shear Warning',
      severity: 'critical',
      category: 'wind',
      headline: `Severe boundary layer gusts peaking at ${current.windGusts} km/h`,
      description: `High kinetic wind energy detected over ${cityName}. Elevated crosswind shear impairs small aircraft, drone operations, and high-profile road vehicles.`,
      guidance: 'Ground lightweight UAVs immediately. Secure temporary outdoor structures and exercise caution in elevated zones.',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      validUntil: formatTime(6),
      metricValue: `${current.windGusts} km/h gusts`,
    });
  } else if (current.windGusts >= 40 || current.windSpeed >= 28) {
    alerts.push({
      id: 'alert-wind-moderate',
      title: 'Elevated Gust & Crosswind Watch',
      severity: 'moderate',
      category: 'wind',
      headline: `Breezy conditions with gust surges to ${current.windGusts} km/h`,
      description: `Surface winds from ${getWindCardinal(current.windDirection)} (${current.windDirection}°) generating moderate mechanical turbulence.`,
      guidance: 'Drone pilots: trim compensation required. Moderate chop on open water bodies.',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      validUntil: formatTime(4),
      metricValue: `${current.windGusts} km/h gusts`,
    });
  }

  // 2. Air Quality & Aerosol Stagnation Alert
  if ((aqi.europeanAqi && aqi.europeanAqi >= 75) || (aqi.pm2_5 && aqi.pm2_5 >= 45)) {
    alerts.push({
      id: 'alert-aqi-severe',
      title: 'Air Stagnation & Particulate Warning',
      severity: 'severe',
      category: 'air_quality',
      headline: `Aerosol PM2.5 particulate concentration at ${aqi.pm2_5} µg/m³`,
      description: `Atmospheric thermal inversion has trapped fine particulate matter near the surface. European AQI is at ${aqi.europeanAqi}.`,
      guidance: 'Individuals with asthma or cardiopulmonary conditions should limit strenuous outdoor exertion. Use HEPA filtration indoors.',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      validUntil: formatTime(8),
      metricValue: `PM2.5: ${aqi.pm2_5} µg/m³`,
    });
  } else if (aqi.pm2_5 && aqi.pm2_5 >= 25) {
    alerts.push({
      id: 'alert-aqi-advisory',
      title: 'Moderate Particulate Haze Advisory',
      severity: 'advisory',
      category: 'air_quality',
      headline: `Elevated PM2.5 levels (${aqi.pm2_5} µg/m³)`,
      description: `Slight aerosol hazing detected in boundary layer. Air quality is acceptable for healthy population but noticeable.`,
      guidance: 'Sensitive groups should consider pacing strenuous outdoor cardiovascular activities.',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      validUntil: formatTime(6),
      metricValue: `AQI: ${aqi.europeanAqi ?? 40}`,
    });
  }

  // 3. Solar UV Radiation Alert
  if (current.uvIndex >= 8) {
    alerts.push({
      id: 'alert-uv-critical',
      title: 'Very High Solar UV Radiation Alert',
      severity: 'severe',
      category: 'uv',
      headline: `UV Index reaching ${current.uvIndex} with ${current.directRadiation} W/m² direct irradiance`,
      description: `Intense solar photon flux. Unprotected skin damage can occur in under 15 minutes of midday solar exposure.`,
      guidance: 'Apply SPF 50+ broad-spectrum sunscreen, wear UV-blocking eyewear, and seek shade between 11:00 and 16:00.',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      validUntil: formatTime(4),
      metricValue: `UV ${current.uvIndex}`,
    });
  } else if (current.uvIndex >= 6) {
    alerts.push({
      id: 'alert-uv-advisory',
      title: 'High Solar UV Index Advisory',
      severity: 'moderate',
      category: 'uv',
      headline: `Solar UV Index at ${current.uvIndex}`,
      description: `Direct sunlight requires solar photoprotection. Direct radiation measured at ${current.directRadiation} W/m².`,
      guidance: 'Wear hat and sunglasses. Reapply sunscreen if spending extended time outside.',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      validUntil: formatTime(3),
      metricValue: `UV ${current.uvIndex}`,
    });
  }

  // 4. Thermal Extremes Alert (Heat Stress / Frost Freezing)
  if (current.temperature >= 35 || current.apparentTemperature >= 38) {
    alerts.push({
      id: 'alert-thermal-heat',
      title: 'Extreme Heat & Hyperthermia Advisory',
      severity: 'severe',
      category: 'thermal',
      headline: `Apparent temperature reaching ${current.apparentTemperature}°C`,
      description: `High thermodynamic stress combining ambient heat (${current.temperature}°C) with ${current.humidity}% humidity. High risk of dehydration and heat exhaustion.`,
      guidance: 'Stay hydrated, seek air-conditioned environments, and avoid peak sun outdoor workouts.',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      validUntil: formatTime(6),
      metricValue: `${current.apparentTemperature}°C feels like`,
    });
  } else if (current.temperature <= 0) {
    alerts.push({
      id: 'alert-thermal-cold',
      title: 'Sub-Zero Surface Freezing & Frost Watch',
      severity: 'moderate',
      category: 'thermal',
      headline: `Ambient temperature at ${current.temperature}°C with frost formation`,
      description: `Sub-freezing air mass. Elevated risk of black ice glaze on bridges, overpasses, and exposed elevated roadways.`,
      guidance: 'Exercise caution while driving or cycling on shaded surfaces. Protect frost-sensitive vegetation.',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      validUntil: formatTime(8),
      metricValue: `${current.temperature}°C`,
    });
  }

  // 5. Barometric Pressure Tendency (Rapid cyclonic drop)
  if (hourly.length >= 4) {
    const pressureDelta3h = hourly[0].pressure - hourly[3].pressure;
    if (pressureDelta3h >= 3.5) {
      alerts.push({
        id: 'alert-pressure-drop',
        title: 'Rapid Barometric Pressure Drop',
        severity: 'severe',
        category: 'pressure',
        headline: `Pressure plunged by ${pressureDelta3h.toFixed(1)} hPa in past 3 hours`,
        description: `Rapid barometric decompression signals an incoming active frontal squall line or cyclonic trough.`,
        guidance: 'Expect sudden wind shifts, developing convective updrafts, and abrupt precipitation within 2-4 hours.',
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        validUntil: formatTime(4),
        metricValue: `-${pressureDelta3h.toFixed(1)} hPa/3h`,
      });
    }
  }

  // 6. Precipitation / Thunderstorm Alert
  if (current.weatherCode >= 95) {
    alerts.push({
      id: 'alert-thunderstorm',
      title: 'Active Convective Thunderstorm Warning',
      severity: 'critical',
      category: 'precipitation',
      headline: 'Lightning discharge and intense vertical updrafts in vicinity',
      description: 'Severe convective cloud system with electrical activity, sudden squalls, and localized torrential rain.',
      guidance: 'Seek substantial indoor shelter. Stay clear of open fields, tall trees, and metal structures.',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      validUntil: formatTime(2),
      metricValue: 'Thunderstorm (WMO 95)',
    });
  } else if (current.precipitation >= 3 || current.weatherCode >= 63) {
    alerts.push({
      id: 'alert-heavy-rain',
      title: 'Hydrometeor Precipitation Watch',
      severity: 'moderate',
      category: 'precipitation',
      headline: `Active rainfall accumulation (${current.precipitation} mm/h)`,
      description: 'Sustained rain lowering optical visibility and increasing road surface aquaplaning hazards.',
      guidance: 'Allow extra braking distance. Keep headlights on during vehicle transit.',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      validUntil: formatTime(3),
      metricValue: `${current.precipitation} mm/h`,
    });
  }

  // If no critical alerts detected, provide a nominal atmospheric status alert
  if (alerts.length === 0) {
    alerts.push({
      id: 'alert-nominal',
      title: 'Atmospheric Boundary Layer Stable',
      severity: 'advisory',
      category: 'wind',
      headline: `Nominal synoptic conditions over ${cityName}`,
      description: `Pressure gradient is balanced at ${current.pressure} hPa with mild wind vectors (${current.windSpeed} km/h) and moderate air quality.`,
      guidance: 'Standard operations cleared. Ideal parameters for flight, marine transit, and outdoor activities.',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      validUntil: formatTime(12),
      metricValue: 'Equilibrium',
    });
  }

  return alerts;
}

// Format utilities
export function formatSpeed(kmh: number, unit: 'metric' | 'imperial' | 'nautical'): string {
  if (unit === 'nautical') {
    return `${(kmh * 0.539957).toFixed(1)} kts`;
  }
  if (unit === 'imperial') {
    return `${(kmh * 0.621371).toFixed(1)} mph`;
  }
  return `${kmh.toFixed(1)} km/h`;
}

export function formatTemp(celsius: number, unit: 'metric' | 'imperial' | 'nautical'): string {
  if (unit === 'imperial') {
    return `${Math.round((celsius * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatPressure(hpa: number, unit: 'metric' | 'imperial' | 'nautical'): string {
  if (unit === 'imperial') {
    return `${(hpa * 0.02953).toFixed(2)} inHg`;
  }
  return `${hpa} hPa`;
}
