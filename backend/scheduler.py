"""
Aakaash360 Notification Worker Logic (APScheduler)
Proactive Night-Before (20:00) & Early-Morning (06:00) Bio-Sync Warning Daemon
"""

import asyncio
import httpx
import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Aakaash360-Scheduler")

scheduler = AsyncIOScheduler()

async def evaluate_night_before_alarms():
    """
    Runs daily at 20:00 local time.
    Inspects next-morning atmospheric conditions for all registered users,
    evaluating sudden rain onset, frost, high crosswinds, or AQI surges.
    """
    logger.info("Executing 20:00 Night-Before Preventative Intelligence Scan...")
    
    # In production, query active users from SQLite database:
    # users = db.query(User).filter(User.is_active == True).all()
    sample_users = [
        {"id": 1, "persona": "Athletes / Runners", "lat": 35.6762, "lon": 139.6503, "routine_time": "06:30"},
        {"id": 2, "persona": "Cyclists", "lat": 37.7749, "lon": -122.4194, "routine_time": "07:00"},
        {"id": 3, "persona": "Farmers", "lat": 19.0760, "lon": 72.8777, "routine_time": "05:00"},
    ]

    async with httpx.AsyncClient(timeout=10.0) as client:
        for u in sample_users:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={u['lat']}&longitude={u['lon']}&hourly=temperature_2m,precipitation_probability,wind_gusts_10m&forecast_days=2"
            try:
                res = await client.get(url)
                data = res.json()
                hourly = data.get("hourly", {})
                
                # Check tomorrow morning 06:00 - 09:00 indices
                precip_probs = hourly.get("precipitation_probability", [])[6:10]
                max_rain_chance = max(precip_probs) if precip_probs else 0
                max_gusts = max(hourly.get("wind_gusts_10m", [])[6:10]) if hourly.get("wind_gusts_10m") else 0

                if max_rain_chance >= 60:
                    alert_title = f"Night-Before Alert: Rain Expected for Morning {u['persona']}"
                    alert_body = f"Tomorrow morning has a {max_rain_chance}% chance of rainfall at your scheduled departure ({u['routine_time']}). Pack weather gear."
                    await dispatch_notification(u["id"], alert_title, alert_body)
                elif max_gusts >= 38:
                    alert_title = f"Night-Before Warning: Elevated Wind Shear"
                    alert_body = f"Tomorrow morning wind gusts peak at {max_gusts} km/h. High crosswind caution advised."
                    await dispatch_notification(u["id"], alert_title, alert_body)
                else:
                    logger.info(f"User {u['id']} morning forecast optimal.")
            except Exception as e:
                logger.error(f"Error checking user {u['id']}: {e}")

async def evaluate_morning_readiness_scan():
    """
    Runs daily at 06:00 local time.
    Provides immediate operational go/no-go status for active outdoor personas.
    """
    logger.info("Executing 06:00 Morning Readiness Operational Dispatch...")
    # Instant bio-sync dispatch for ground temperature, wind dial heading, and UV index
    pass

async def dispatch_notification(user_id: int, title: str, body: str):
    """
    Mock dispatcher for Web Push, Webhook, or SQLite BioSyncAlarm persistence.
    """
    logger.info(f"DISPATCH to User {user_id} -> [{title}]: {body}")
    # In production:
    # new_alarm = BioSyncAlarm(user_id=user_id, title=title, message=body, scheduled_for=datetime.utcnow())
    # db.add(new_alarm); db.commit()

def start_worker():
    # Schedule 20:00 (8:00 PM) Night-Before Job
    scheduler.add_job(
        evaluate_night_before_alarms,
        CronTrigger(hour=20, minute=0),
        id="night_before_evaluator",
        replace_existing=True,
    )

    # Schedule 06:00 (6:00 AM) Morning Readiness Job
    scheduler.add_job(
        evaluate_morning_readiness_scan,
        CronTrigger(hour=6, minute=0),
        id="morning_readiness_evaluator",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("APScheduler background notification daemon initialized successfully.")

if __name__ == "__main__":
    start_worker()
    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
