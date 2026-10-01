export type PersonaCategory =
  | 'Fitness & Sports'
  | 'Outdoor Adventure'
  | 'Travel & Transit'
  | 'Work & Industry'
  | 'Special Interests'
  | 'General Users'
  | 'Logistics & Energy';

export interface PersonaDefinition {
  id: string;
  name: string;
  category: PersonaCategory;
  description: string;
  pinned: string[]; // High-Priority Parameters (Hero Card)
  bento: string[];  // Secondary Parameters (Collapsible Bento Grid)
  tagline: string;
}

export const PERSONA_REGISTRY: Record<string, PersonaDefinition> = {
  // 1. Fitness & Sports
  'Athletes / Runners': {
    id: 'athletes_runners',
    name: 'Athletes / Runners',
    category: 'Fitness & Sports',
    description: 'Pacing against thermal exhaustion, lung particulate stress, and hydration loss.',
    pinned: ['Precipitation Timing', 'Wind Speed & Direction', 'Temperature', 'Heat Index', 'UV Index', 'AQI'],
    bento: ['Humidity', 'Barometric Pressure'],
    tagline: 'Cardiovascular efficiency and hydration safety'
  },
  'Cyclists': {
    id: 'cyclists',
    name: 'Cyclists',
    category: 'Fitness & Sports',
    description: 'Crosswind vector calculations, gust shear, and tire asphalt traction.',
    pinned: ['Wind Direction', 'Sudden Gusts', 'Rain Windows', 'Visibility', 'Temperature'],
    bento: ['Humidity', 'UV Index'],
    tagline: 'Aerodynamic drag and cross-gust protection'
  },
  'Sports Players': {
    id: 'sports_players',
    name: 'Sports Players',
    category: 'Fitness & Sports',
    description: 'Wet-bulb thermal stress, field turf moisture, and match playability.',
    pinned: ['Rain Probability', 'Wet-Bulb Temp', 'Wind Speed', 'Ground Conditions (Soil Moisture)'],
    bento: ['Cloud Cover', 'Barometric Pressure'],
    tagline: 'Field traction and heat stress compliance'
  },
  'Fitness Enthusiasts': {
    id: 'fitness_enthusiasts',
    name: 'Fitness Enthusiasts',
    category: 'Fitness & Sports',
    description: 'Optimizing daily outdoor workout windows for peak energy and clean air.',
    pinned: ['UV Index', 'Heat Stress', 'AQI', 'Outdoor Workout Safety Windows'],
    bento: ['Wind Speed', 'Light Rain Chance'],
    tagline: 'Daily environmental wellness window'
  },

  // 2. Outdoor Adventure
  'Hikers / Trekkers': {
    id: 'hikers_trekkers',
    name: 'Hikers / Trekkers',
    category: 'Outdoor Adventure',
    description: 'High-altitude squalls, sudden temperature drops, and lightning shelter.',
    pinned: ['Sudden Rain', 'Thunderstorm Warnings', 'Temperature Drops', 'Wind Speed', 'Visibility'],
    bento: ['UV Index', 'Pressure Shifts'],
    tagline: 'Mountain pass safety and convective storm detection'
  },
  'Campers': {
    id: 'campers',
    name: 'Campers',
    category: 'Outdoor Adventure',
    description: 'Overnight minimum chill, flysheet tent peg load, and morning dew point.',
    pinned: ['Nighttime Low Temp', 'Rain Onset', 'Wind Gusts', 'Humidity'],
    bento: ['Sunrise / Sunset Times', 'Dew Point'],
    tagline: 'Tent structural integrity and thermal sleeping rating'
  },
  'Fishermen': {
    id: 'fishermen',
    name: 'Fishermen',
    category: 'Outdoor Adventure',
    description: 'Barometric feeding triggers, chop, swell height, and squall onset.',
    pinned: ['Wind Speed', 'Wave Heights', 'Storm Warnings', 'Rain', 'Barometric Pressure Trends'],
    bento: ['Water Temp', 'Cloud Cover'],
    tagline: 'Marine chop and barometric feeding barometer'
  },
  'Boaters / Sailors': {
    id: 'boaters_sailors',
    name: 'Boaters / Sailors',
    category: 'Outdoor Adventure',
    description: 'Tacking velocity vectors, maritime pressure shifts, and gale warnings.',
    pinned: ['Wind Vectors', 'Wave Height', 'Pressure Shifts', 'Severe Storm Alerts'],
    bento: ['Tide Predictions', 'Visibility'],
    tagline: 'Navigational wind shear and sea state telemetry'
  },
  'Beachgoers': {
    id: 'beachgoers',
    name: 'Beachgoers',
    category: 'Outdoor Adventure',
    description: 'Sun photoprotection, shore winds, and comfortable swimming windows.',
    pinned: ['UV Index', 'Air Temp', 'Wind Strength', 'Rain Probability', 'Water / Sea Conditions'],
    bento: ['Humidity', 'Cloud Cover'],
    tagline: 'Peak solar UV index and coastal breeze comfort'
  },

  // 3. Travel & Transit
  'Pilots / Aviation': {
    id: 'pilots_aviation',
    name: 'Pilots / Aviation',
    category: 'Travel & Transit',
    description: 'VFR/IFR flight clearance, cloud ceiling altitude, crosswind shear, and METAR/TAF.',
    pinned: ['Wind Speed / Shear', 'Visibility', 'Cloud Ceiling', 'Turbulence', 'METAR / TAF Reports'],
    bento: ['Barometric Pressure', 'Dew Point'],
    tagline: 'Runway vectors, density altitude, and flight ceilings'
  },
  'Drivers / Commuters': {
    id: 'drivers_commuters',
    name: 'Drivers / Commuters',
    category: 'Travel & Transit',
    description: 'Road aquaplaning risks, sudden radiation fog banks, and black ice glaze.',
    pinned: ['Heavy Rain', 'Fog / Low Visibility', 'Black Ice Risks', 'Severe Road Weather Alerts'],
    bento: ['Wind Gusts', 'Ambient Temp'],
    tagline: 'Highway visibility and slick surface traction'
  },
  'Motorcyclists': {
    id: 'motorcyclists',
    name: 'Motorcyclists',
    category: 'Travel & Transit',
    description: 'Lean angle traction, bridge cross-gusts, and asphalt surface thermals.',
    pinned: ['Rain Probability', 'Wind Cross-Gusts', 'Road Surface Temp', 'Visibility'],
    bento: ['Humidity', 'Cloud Cover'],
    tagline: 'Tire adhesion and lateral cross-gust alerts'
  },
  'Travelers / Tourists': {
    id: 'travelers_tourists',
    name: 'Travelers / Tourists',
    category: 'Travel & Transit',
    description: 'Sightseeing weather windows, rapid temperature deltas, and transit delays.',
    pinned: ['Destination Forecasts', 'Rain Windows', 'Extreme Temp Shifts', 'Travel Disruptions'],
    bento: ['Local UV Index', 'Humidity'],
    tagline: 'Itinerary optimization and excursion planning'
  },

  // 4. Work & Industry
  'Farmers': {
    id: 'farmers',
    name: 'Farmers',
    category: 'Work & Industry',
    description: 'Soil moisture saturation, spray drift wind limits, and nocturnal frost glaze.',
    pinned: ['Accumulated Rainfall', 'Soil Temp & Moisture', 'Wind Velocity', 'Frost Warnings', 'Solar Radiation'],
    bento: ['Humidity', 'Dew Point'],
    tagline: 'Crop root irrigation and pesticide spray drift safety'
  },
  'Gardeners': {
    id: 'gardeners',
    name: 'Gardeners',
    category: 'Work & Industry',
    description: 'Photosynthetically active radiation (PAR), soil moisture, and freeze protection.',
    pinned: ['Rain Scheduling', 'Soil Moisture', 'Frost Risks', 'Ambient Temp', 'Sunlight Hours (PAR)'],
    bento: ['Humidity', 'Wind Speed'],
    tagline: 'Plant hydration scheduling and sunlight exposure'
  },
  'Construction Workers': {
    id: 'construction_workers',
    name: 'Construction Workers',
    category: 'Work & Industry',
    description: 'Tower crane wind shut-off limits, lightning detection, and wet concrete curing.',
    pinned: ['High Wind Limits (Cranes)', 'Lightning Detection', 'Heavy Rain', 'Extreme Heat Stress'],
    bento: ['Humidity', 'Morning Dew'],
    tagline: 'OSHA structural wind limits and site safety compliance'
  },
  'Outdoor Laborers': {
    id: 'outdoor_laborers',
    name: 'Outdoor Laborers',
    category: 'Work & Industry',
    description: 'Wet-bulb globe temperature (WBGT), mandatory hydration cycles, and lightning muster.',
    pinned: ['Heat Index / Stress', 'UV Radiation', 'Sudden Storms', 'Lightning Alerts'],
    bento: ['Wind Speed', 'Air Quality'],
    tagline: 'Physiological heat stress and storm evacuation triggers'
  },
  'Event Organizers': {
    id: 'event_organizers',
    name: 'Event Organizers',
    category: 'Work & Industry',
    description: 'Outdoor canopy wind load tolerance, guest thermal safety, and rain contingency.',
    pinned: ['Rain Timing', 'Wind Gusts (Tents/Stages)', 'Extreme Temp', 'Severe Weather Alerts'],
    bento: ['Cloud Cover', 'Humidity'],
    tagline: 'Temporary infrastructure wind rating and crowd comfort'
  },

  // 5. Special Interests
  'Photographers': {
    id: 'photographers',
    name: 'Photographers',
    category: 'Special Interests',
    description: 'Golden hour optical scattering, cloud layer stratification, and blue hour light.',
    pinned: ['Cloud Cover Density', 'Sunrise / Sunset Timing', 'Golden Hour Windows', 'Visibility'],
    bento: ['Precipitation', 'Haze (AOD)'],
    tagline: 'Atmospheric light diffusion and horizon transparency'
  },
  'Astronomy Enthusiasts': {
    id: 'astronomy_enthusiasts',
    name: 'Astronomy Enthusiasts',
    category: 'Special Interests',
    description: 'Boundary layer seeing index, celestial transparency, and dew point suppression.',
    pinned: ['Cloud Cover Tiers', 'Atmospheric Seeing', 'Humidity (Dew Point)', 'Moon Phases'],
    bento: ['Wind Speed', 'Temperature'],
    tagline: 'Telescope optical seeing and dark sky transparency'
  },
  'Pet Owners': {
    id: 'pet_owners',
    name: 'Pet Owners',
    category: 'Special Interests',
    description: 'Asphalt pavement temperature (>50°C paw burn), thunderstorm sensitivity, and AQI.',
    pinned: ['Pavement / Surface Heat Index', 'Rain / Storm Alerts', 'AQI', 'Outdoor Comfort Index'],
    bento: ['Humidity', 'Cold Snaps'],
    tagline: 'Paw safety, pavement thermal index, and walk times'
  },
  'Parents': {
    id: 'parents',
    name: 'Parents',
    category: 'Special Interests',
    description: 'Stroller walk sun shielding, playground surface heat, and pediatric respiratory AQI.',
    pinned: ['UV Index', 'Extreme Heat / Cold Protection Alerts', 'Sudden Rain Tracking', 'Air Quality'],
    bento: ['Wind Chill', 'Humidity'],
    tagline: 'Family outdoor safety and infant skin photoprotection'
  },

  // 6. General Users
  'General Users': {
    id: 'general_users',
    name: 'General Users',
    category: 'General Users',
    description: 'Everyday clothing suggestions, umbrella alerts, and commute weather.',
    pinned: ['"What Should I Wear?" Index', 'Rain Prediction', 'Current Temp', 'Severe Warnings'],
    bento: ['UV Index', 'Wind Speed'],
    tagline: 'Everyday attire guidance and umbrella reminders'
  },

  // 7. Logistics & Energy
  'Logistics / Delivery': {
    id: 'logistics_delivery',
    name: 'Logistics / Delivery',
    category: 'Logistics & Energy',
    description: 'High-sided vehicle crosswind tipping, flash flood corridors, and route delays.',
    pinned: ['Severe Rain', 'High Wind Corridors', 'Road Visibility', 'Regional Disruption Alerts'],
    bento: ['Temperature Drops'],
    tagline: 'Fleet dispatch safety and wind shear corridors'
  },
  'Transport Operators': {
    id: 'transport_operators',
    name: 'Transport Operators',
    category: 'Logistics & Energy',
    description: 'Rail thermal buckle risks, dense fog signal obscurity, and track washouts.',
    pinned: ['Dense Fog Limits', 'Heavy Rain Flooding', 'Track Temp Extremes', 'High Winds'],
    bento: ['Visibility Indices'],
    tagline: 'Rail and transit infrastructure environmental thresholds'
  },
  'Energy Companies': {
    id: 'energy_companies',
    name: 'Energy Companies',
    category: 'Logistics & Energy',
    description: 'Direct normal solar irradiance (DNI), wind turbine power curve, and grid demand.',
    pinned: ['Solar Radiation', 'Wind Power Speeds', 'Demand Spikes', 'Storm Path Tracking'],
    bento: ['Cloud Opacity'],
    tagline: 'Renewable energy yield forecasting and grid resilience'
  },
  'Industrial Operations': {
    id: 'industrial_operations',
    name: 'Industrial Operations',
    category: 'Logistics & Energy',
    description: 'Stack emissions boundary layer dispersion, flammable storage, and chemical boiling.',
    pinned: ['Plant Safety Conditions', 'Emission Wind Dispersion', 'Extreme Temp Thresholds'],
    bento: ['Barometric Pressure'],
    tagline: 'Plume dispersion physics and industrial heat thresholds'
  },
  'Emergency Services': {
    id: 'emergency_services',
    name: 'Emergency Services',
    category: 'Logistics & Energy',
    description: 'First-responder lightning safety, swiftwater flash flooding, and wildland wind shifts.',
    pinned: ['Severe Weather Cells', 'Lightning Strikes', 'Flash Flood Indicators', 'Heatwave Severity'],
    bento: ['Wind Shear', 'Water Levels'],
    tagline: 'Tactical situational awareness and rapid storm alerts'
  }
};

export interface RoutePoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  bearingToNext?: number;
  crosswindKmh?: number;
  hazardRisk: 'low' | 'moderate' | 'high';
}

export interface TransitRoute {
  id: string;
  title: string;
  origin: string;
  destination: string;
  distanceKm: number;
  activityType: 'cycling' | 'running' | 'driving' | 'aviation';
  points: RoutePoint[];
  departureSuggestion: string;
  overallScore: number;
}
