"""
Aakaash360 Database Schema & SQLAlchemy Models
SQLite Database Architecture for Persona-Aware Telemetry & Route Safety
"""

import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    create_engine,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    active_persona = Column(String(64), default="Athletes / Runners", nullable=False)
    home_latitude = Column(Float, default=35.6762)
    home_longitude = Column(Float, default=139.6503)
    home_city = Column(String(100), default="Tokyo")
    unit_system = Column(String(16), default="metric")  # metric, imperial, nautical
    theme_preference = Column(String(16), default="dark")  # dark, light, stratosphere
    soundscape_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    preferences = relationship("PersonaPreference", back_populates="user", cascade="all, delete-orphan")
    routes = relationship("SavedRoute", back_populates="user", cascade="all, delete-orphan")
    alert_thresholds = relationship("AlertThreshold", back_populates="user", cascade="all, delete-orphan")
    alarms = relationship("BioSyncAlarm", back_populates="user", cascade="all, delete-orphan")


class PersonaPreference(Base):
    __tablename__ = "persona_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    persona_name = Column(String(64), nullable=False)  # e.g. "Cyclists", "Farmers", "Pilots / Aviation"
    category = Column(String(64), nullable=False)      # e.g. "Fitness & Sports", "Work & Industry"
    pinned_parameters = Column(JSON, nullable=False)   # List of high-priority keys
    bento_parameters = Column(JSON, nullable=False)    # List of secondary keys
    custom_weights = Column(JSON, default=dict)        # Weight multipliers for hazard scoring
    is_favorite = Column(Boolean, default=False)

    user = relationship("User", back_populates="preferences")


class CachedWeather(Base):
    __tablename__ = "cached_weather"

    id = Column(Integer, primary_key=True, autoincrement=True)
    location_key = Column(String(64), index=True, nullable=False)  # "lat_lon" rounded
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    city_name = Column(String(100), nullable=True)
    weather_payload = Column(JSON, nullable=False)  # Full Open-Meteo snapshot
    air_quality_payload = Column(JSON, nullable=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class SavedRoute(Base):
    __tablename__ = "saved_routes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    route_name = Column(String(120), nullable=False)
    origin_name = Column(String(120), nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lon = Column(Float, nullable=False)
    dest_name = Column(String(120), nullable=False)
    dest_lat = Column(Float, nullable=False)
    dest_lon = Column(Float, nullable=False)
    waypoints = Column(JSON, default=list)  # List of {lat, lon, label}
    activity_type = Column(String(32), default="cycling")  # cycling, running, driving, flight
    hazard_score = Column(Float, default=0.0)  # Calculated risk score (0-100)
    departure_suggestion = Column(String(120), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="routes")


class AlertThreshold(Base):
    __tablename__ = "alert_thresholds"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    persona_name = Column(String(64), nullable=False)
    parameter_key = Column(String(64), nullable=False)  # "wind_gusts", "aqi_pm25", "rain_prob", "uv_index"
    operator = Column(String(8), default=">")           # ">", "<", ">="
    threshold_value = Column(Float, nullable=False)
    is_enabled = Column(Boolean, default=True)
    notification_channel = Column(String(32), default="in_app")  # in_app, email, push

    user = relationship("User", back_populates="alert_thresholds")


class BioSyncAlarm(Base):
    __tablename__ = "bio_sync_alarms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    alarm_type = Column(String(32), nullable=False)  # "night_before_20h", "morning_readiness_06h", "route_hazard"
    title = Column(String(120), nullable=False)
    message = Column(Text, nullable=False)
    scheduled_for = Column(DateTime, nullable=False, index=True)
    is_dispatched = Column(Boolean, default=False)
    is_read = Column(Boolean, default=False)
    telemetry_snapshot = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="alarms")


# Database Initialization Helper
def init_db(database_url: str = "sqlite:///./aakaash360.db"):
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine, SessionLocal
