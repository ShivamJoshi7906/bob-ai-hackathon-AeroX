# Setup & Installation Guide: MissionGuard AI

**Team:** AeroX  
**Challenge:** D1 — Mission Readiness & Predictive Maintenance Copilot  

---

## 1. Prerequisites

Ensure your development environment has the following installed:
- **Python**: Version 3.10 to 3.13 (`python --version`)
- **Node.js**: Version 18+ (`node --version`)
- **npm**: Version 9+ (`npm --version`)
- **Git**: Version 2.30+ (`git --version`)

---

## 2. Environment Setup

### 2.1 Clone the Repository
```bash
git clone https://github.com/ShivamJoshi7906/bob-ai-hackathon-AeroX.git
cd bob-ai-hackathon-AeroX
```

### 2.2 Configure Environment Variables
Copy the example environment file:
```bash
cp src/.env.example src/.env
```
*(Default settings in `.env` are pre-configured for local execution with zero manual setup required).*

---

## 3. Backend & ML Setup

### 3.1 Install Python Dependencies
```bash
pip install fastapi uvicorn pydantic sqlalchemy pandas numpy scikit-learn joblib pytest
```

### 3.2 Initialize Database & Ingest Dataset
```bash
python data/load_data.py
```
*Output: Seeds SQLite database `missionguard.db` with 38 assets, 8,169 sensor readings, 74 maintenance records, 38 mission windows, and component health records.*

### 3.3 Train ML Models & Compute Test Metrics
```bash
python src/ml/train.py
python src/ml/evaluate.py
```
*Output: Generates trained model artifact `src/backend/models_artifacts/rul_model.joblib` and writes real evaluation metrics to `src/ml/metrics.json`.*

### 3.4 Launch FastAPI Backend
```bash
uvicorn src.backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/health`

---

## 4. Frontend Setup

### 4.1 Install Node Dependencies
In a new terminal:
```bash
cd src/frontend
npm install
```

### 4.2 Start Vite Development Server
```bash
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 5. Verification & Testing

### 5.1 Run Automated Tests
```bash
# Backend, ML, and Data Schema Tests
pytest tests/
```

### 5.2 Validate Frontend Build
```bash
cd src/frontend
npm run build
```

---

## 6. Troubleshooting Guide

| Issue / Error | Likely Cause | Solution |
|---|---|---|
| `ModuleNotFoundError: No module named 'src'` | Running python from subfolder | Run scripts from repository root, or set `PYTHONPATH=.` |
| `FileNotFoundError: rul_model.joblib` | Model training step skipped | Run `python src/ml/train.py` before starting backend |
| `CORS error in browser console` | Frontend running on non-standard port | Ensure `src/backend/app/main.py` includes CORS origin `http://localhost:5173` |
| `Port 8000 already in use` | Another process holding port 8000 | Kill existing process or specify another port: `--port 8001` (and update frontend `VITE_API_URL`) |
| `yq: command not found` (in GitHub Actions) | Missing yq binary | GitHub Action workflow automatically installs yq |
