-- ====================================================================
-- Aakaash360: Spatial Atmospheric Telemetry & Persona Intelligence
-- SQLite Production Schema Definition
-- ====================================================================

PRAGMA foreign_keys = ON;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    active_persona VARCHAR(64) NOT NULL DEFAULT 'Athletes / Runners',
    home_latitude REAL DEFAULT 35.6762,
    home_longitude REAL DEFAULT 139.6503,
    home_city VARCHAR(100) DEFAULT 'Tokyo',
    unit_system VARCHAR(16) DEFAULT 'metric',
    theme_preference VARCHAR(16) DEFAULT 'dark',
    soundscape_enabled BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- 2. Persona Preferences & Priority Mappings
CREATE TABLE IF NOT EXISTS persona_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    persona_name VARCHAR(64) NOT NULL,
    category VARCHAR(64) NOT NULL,
    pinned_parameters TEXT NOT NULL, -- JSON array of high-priority keys
    bento_parameters TEXT NOT NULL,  -- JSON array of secondary keys
    custom_weights TEXT DEFAULT '{}', -- JSON object of custom multipliers
    is_favorite BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_persona_prefs_user ON persona_preferences (user_id);
CREATE INDEX IF NOT EXISTS idx_persona_name ON persona_preferences (persona_name);

-- 3. Cached Weather Ingestion
CREATE TABLE IF NOT EXISTS cached_weather (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_key VARCHAR(64) NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    city_name VARCHAR(100),
    weather_payload TEXT NOT NULL,      -- JSON payload from Open-Meteo
    air_quality_payload TEXT,          -- JSON payload from Air Quality API
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cached_weather_key ON cached_weather (location_key);
CREATE INDEX IF NOT EXISTS idx_cached_weather_expires ON cached_weather (expires_at);

-- 4. Micro-Climate Saved Routes
CREATE TABLE IF NOT EXISTS saved_routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    route_name VARCHAR(120) NOT NULL,
    origin_name VARCHAR(120) NOT NULL,
    origin_lat REAL NOT NULL,
    origin_lon REAL NOT NULL,
    dest_name VARCHAR(120) NOT NULL,
    dest_lat REAL NOT NULL,
    dest_lon REAL NOT NULL,
    waypoints TEXT DEFAULT '[]', -- JSON array of coordinates
    activity_type VARCHAR(32) DEFAULT 'cycling',
    hazard_score REAL DEFAULT 0.0,
    departure_suggestion VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saved_routes_user ON saved_routes (user_id);

-- 5. Custom Alert Thresholds
CREATE TABLE IF NOT EXISTS alert_thresholds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    persona_name VARCHAR(64) NOT NULL,
    parameter_key VARCHAR(64) NOT NULL,
    operator VARCHAR(8) DEFAULT '>',
    threshold_value REAL NOT NULL,
    is_enabled BOOLEAN DEFAULT 1,
    notification_channel VARCHAR(32) DEFAULT 'in_app',
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_alert_thresholds_user ON alert_thresholds (user_id);

-- 6. Bio-Sync Alarms & Night-Before Alerts
CREATE TABLE IF NOT EXISTS bio_sync_alarms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    alarm_type VARCHAR(32) NOT NULL,
    title VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    scheduled_for TIMESTAMP NOT NULL,
    is_dispatched BOOLEAN DEFAULT 0,
    is_read BOOLEAN DEFAULT 0,
    telemetry_snapshot TEXT, -- JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_alarms_scheduled ON bio_sync_alarms (scheduled_for);
CREATE INDEX IF NOT EXISTS idx_alarms_user ON bio_sync_alarms (user_id);
