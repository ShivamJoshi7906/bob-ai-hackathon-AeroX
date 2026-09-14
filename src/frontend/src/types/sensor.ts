export interface SensorReading {
  cycle: number;
  s2?: number;  // HPC Outlet Temp (K)
  s3?: number;  // Combustor Outlet Temp (K)
  s4?: number;  // LPT Outlet Temp (K)
  s7?: number;  // HPC Pressure (psia)
  s8?: number;  // Fan Speed (rpm)
  s9?: number;  // Core Speed (rpm)
  s11?: number; // Static Pressure (psia)
  s12?: number; // Fuel Ratio (pps/psi)
  s14?: number; // Bypass Ratio
  s15?: number; // Bleed Enthalpy
  s17?: number; // HP Turbine Speed
  s20?: number; // HPT Coolant (lbf)
  s21?: number; // LPT Coolant (lbf)
  [key: string]: number | undefined;
}

export interface SensorMeta {
  key: string;
  name: string;
  unit: string;
  warningThreshold: number;
  criticalThreshold: number;
  normalRange: string;
}
