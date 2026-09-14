from sqlalchemy.orm import Session
from src.backend.app.models.asset import Asset
from src.backend.app.models.sensor import SensorReading
from src.backend.app.models.mission import MissionWindow
from src.backend.app.models.maintenance import MaintenanceRecord
import random

def seed_database_if_empty(db: Session):
    existing_count = db.query(Asset).count()
    if existing_count > 0:
        return

    print("[Database Seeder] Initializing 38 aircraft turbofan assets into SQLite database...")
    
    # 38 Fighter Aircraft Assets
    assets_to_create = []
    sensors_to_create = []

    for i in range(1, 39):
        num = str(i).zfill(3)
        asset_id = f"AC-{num}"
        
        # Determine aircraft type & criticality
        if i in [3, 14, 28]:
            criticality = "high"
            asset_type = "F-35A Lightning II" if i == 3 else ("F-15EX Eagle II" if i == 14 else "F/A-18E Super Hornet")
            op_hours = 1420.0 + i * 50
            last_maint = 120
            latest_cycle = 195
        elif i % 7 == 0:
            criticality = "high"
            asset_type = "F-35A Lightning II"
            op_hours = 980.0 + i * 40
            last_maint = 90
            latest_cycle = 160
        elif i % 4 == 0:
            criticality = "medium"
            asset_type = "F-22A Raptor"
            op_hours = 1200.0 + i * 30
            last_maint = 80
            latest_cycle = 150
        else:
            criticality = "low"
            asset_type = "F-35A Lightning II" if i % 2 == 0 else "F-16C Viper"
            op_hours = 600.0 + i * 25
            last_maint = 50
            latest_cycle = 140

        asset_obj = Asset(
            asset_id=asset_id,
            source_asset_id=i,
            asset_type=asset_type,
            mission_criticality=criticality,
            service_age_months=18 + (i % 24),
            total_operating_hours=op_hours,
            maintenance_count=1 + (i % 3),
            last_maintenance_cycle=last_maint,
            latest_cycle=latest_cycle,
            operational_setting_1=0.0008,
            operational_setting_2=0.0005,
            operational_setting_3=100.0
        )
        assets_to_create.append(asset_obj)

        # Generate telemetry readings for each asset
        is_critical = i in [3, 14, 28]
        base_temp = 642.0
        temp_trend = 1.8 if is_critical else 0.2

        for cycle_idx in range(1, 51):
          current_c = latest_cycle - 50 + cycle_idx
          factor = cycle_idx / 50.0

          sensor_obj = SensorReading(
              asset_id=asset_id,
              cycle=current_c,
              s2=round(518.67 + random.uniform(-0.2, 0.2), 2),
              s3=round(base_temp + factor * temp_trend * 45.0 + random.uniform(-2, 2), 2),
              s4=round(1400.0 + factor * temp_trend * 35.0 + random.uniform(-3, 3), 2),
              s7=round(553.4 - factor * temp_trend * 15.0 + random.uniform(-1, 1), 2),
              s8=round(2388.0 + random.uniform(-0.5, 0.5), 2),
              s9=round(9050.0 + random.uniform(-2.0, 2.0), 2),
              s11=round(47.2 + factor * 1.5 + random.uniform(-0.2, 0.2), 2),
              s12=round(521.6 - factor * 5.0 + random.uniform(-0.3, 0.3), 2),
              s14=round(8.42 + factor * 0.2 + random.uniform(-0.02, 0.02), 2),
              s15=round(0.03 + random.uniform(-0.002, 0.002), 4),
              s17=int(392 + random.randint(-1, 1)),
              s20=round(38.8 - factor * (3.5 if is_critical else 0.5) + random.uniform(-0.2, 0.2), 2),
              s21=round(23.3 - factor * (2.2 if is_critical else 0.3) + random.uniform(-0.1, 0.1), 2),
          )
          sensors_to_create.append(sensor_obj)

    db.bulk_save_objects(assets_to_create)
    db.bulk_save_objects(sensors_to_create)

    # Seed Synthetic Mission Windows
    missions = [
        MissionWindow(mission_id="MSN-0001", mission_name="Operation Northern Shield", asset_id="AC-003", start_date="2026-10-31", end_date="2026-11-05", mission_priority="critical", required_cycles=30),
        MissionWindow(mission_id="MSN-0002", mission_name="Exercise Agile Reaper", asset_id="AC-014", start_date="2026-11-02", end_date="2026-11-08", mission_priority="critical", required_cycles=32),
        MissionWindow(mission_id="MSN-0003", mission_name="Pacific Defender Recon", asset_id="AC-028", start_date="2026-11-05", end_date="2026-11-10", mission_priority="high", required_cycles=25),
        MissionWindow(mission_id="MSN-0004", mission_name="Baltic Intercept Patrol", asset_id="AC-007", start_date="2026-11-12", end_date="2026-11-18", mission_priority="high", required_cycles=30),
        MissionWindow(mission_id="MSN-0005", mission_name="Joint Force Air Defense", asset_id="AC-012", start_date="2026-11-20", end_date="2026-11-25", mission_priority="routine", required_cycles=20),
    ]
    db.bulk_save_objects(missions)

    # Seed Knowledge Base Maintenance Records
    maint_records = [
        MaintenanceRecord(
            record_id="MNT-101",
            asset_id="AC-003",
            priority="P1",
            priority_label="CRITICAL",
            relevant_component="INTAKE GASKET / COMPRESSOR",
            action_type="REMOVED & REPLACED",
            action_taken="REMOVED & REPLACED HPC GASKET AND VERIFIED STAGE 4 CLEARANCES"
        ),
        MaintenanceRecord(
            record_id="MNT-102",
            asset_id="AC-014",
            priority="P1",
            priority_label="CRITICAL",
            relevant_component="COMBUSTOR LINER & NOZZLE",
            action_type="INSPECTED & REPLACED",
            action_taken="REPLACED FUEL NOZZLE ASSEMBLY #3 AND RE-COATED LINER BARRIER"
        ),
        MaintenanceRecord(
            record_id="MNT-103",
            asset_id="AC-028",
            priority="P1",
            priority_label="CRITICAL",
            relevant_component="HPT COOLANT DUCT",
            action_type="FLUSHED & CLEARED",
            action_taken="FLUSHED SECONDARY COOLING PASSAGES AND RE-CALIBRATED VALVE ACTUATOR"
        ),
    ]
    db.bulk_save_objects(maint_records)

    db.commit()
    print("[Database Seeder] SQLite database successfully seeded with 38 assets!")

def get_asset_by_id(db: Session, asset_id: str) -> Asset:
    return db.query(Asset).filter(Asset.asset_id == asset_id).first()

def get_all_assets(db: Session) -> list[Asset]:
    return db.query(Asset).all()
