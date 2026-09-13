# Solution Overview: MissionGuard AI

**Team:** AeroX  
**Tagline:** *"Know what's mission-ready. Predict what's next. Act before failure."*

---

## 1. Executive Summary

**MissionGuard AI** is an operational decision-support copilot designed for defense aerospace fleet maintenance. Rather than merely alerting that a component might degrade at some indefinite future time, MissionGuard answers the critical operational question:

> **"Can this specific engine safely complete its upcoming mission window, and if not, why, and what exact maintenance action must be executed first?"**

---

## 2. The End-to-End Decision Chain: DETECT → PREDICT → ASSESS → EXPLAIN → PRIORITIZE → ACT

```
[ Sensor Telemetry & Logs ]
            ↓ (Step 1: Detect)
[ Anti-Leakage Feature Pipeline (Rolling Trends & Deltas) ]
            ↓ (Step 2: Predict)
[ ML Models: RUL Regression + 30-Cycle Early Warning ]
            ↓ (Step 3: Assess)
[ Mission-Window Compatibility & Readiness Scoring ]
            ↓ (Step 4: Explain)
[ Evidence-Based Reasoning (Thermal & Friction Drift) ]
            ↓ (Step 5: Prioritize)
[ Maintenance Ranking Engine (P1 Critical, P2 Urgent, P3 Scheduled) ]
            ↓ (Step 6: Act)
[ IBM Bob Copilot Conversational Decision Assistant ]
```

---

## 3. Core Architectural Differentiators

### A. Mission-Window Aware Decision Making
Traditional predictive maintenance tools output a single number: "Estimated RUL = 25 cycles". The commander is left asking: *Is 25 cycles enough?*
MissionGuard links engine telemetry directly to **upcoming mission requirements**. If Mission MSN-0001 requires 30 cycles starting in 2 weeks, an asset with 25 cycles RUL is flagged as **NOT READY** (buffer: -5 cycles). If a mission requires 10 cycles, the same asset is **READY WITH MONITORING**. Readiness is a dynamic operational calculation, not a static sensor threshold.

### B. Leakage-Proof Machine Learning
Trained on NASA C-MAPSS turbofan data using strictly asset-partitioned splits (Train: 27 engines, Validation: 6 engines, Test: 5 engines). Feature engineering uses only backward-looking rolling statistics (5, 10, 20 cycle windows) ensuring zero look-ahead bias.

### C. Human-Explainable Evidence Generation
Readiness scores (0–100) are accompanied by structured, verifiable evidence bullet points derived from real physical sensor changes (e.g. HPC outlet temperature $s_2$ drift, core speed $s_9$ drop, and 30-cycle early warning probability).

### D. Knowledge-Grounded Maintenance Prioritization
Instead of generic alerts, the prioritization engine maps identified degradation patterns to relevant maintenance actions from aviation logbooks (e.g. *"Borescope inspection of compressor blades; verify fuel flow stand-off clamp"*), providing actionable guidance while maintaining transparent data provenance.

### E. Load-Bearing IBM Bob Copilot
IBM Bob is not a generic conversational wrapper. Bob invokes 9 structured MCP/REST tools (`get_fleet_summary`, `get_not_ready_assets`, `get_asset_prediction`, `get_asset_risk`, `get_maintenance_recommendations`, etc.) to answer complex operational questions instantly with hard evidence.
