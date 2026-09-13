# MissionGuard AI — Source Code Layout

The source directory contains the complete full-stack implementation divided cleanly among team members:

```
src/
├── .env.example          # Environment variables template
├── README.md             # This document
│
├── ml/                   # [Member 1] Machine Learning pipeline
│   ├── features.py       # Anti-leakage rolling backward feature extractor
│   ├── train.py          # RUL regression & 30-cycle early warning training
│   ├── evaluate.py       # Evaluation on unseen test split
│   ├── predict.py        # Model inference wrapper
│   └── metrics.json      # Unseen test set metrics
│
├── backend/              # [Member 2 & 4] FastAPI REST API & Decision Engine
│   ├── models_artifacts/ # Exported scikit-learn models (rul_model.joblib)
│   └── app/
│       ├── main.py       # FastAPI application entrypoint
│       ├── config.py     # Configuration settings
│       ├── database.py   # SQLAlchemy database connection
│       ├── models/       # Database ORM models
│       ├── schemas/      # Pydantic validation schemas
│       ├── services/     # Decision engines (Risk, Readiness, Maintenance, Bob)
│       └── routes/       # API endpoints
│
└── frontend/             # [Member 3] React 18 + TypeScript + Vite Dashboard
    ├── package.json      # Frontend dependencies
    ├── vite.config.ts    # Vite bundler configuration
    ├── tailwind.config.js# Tailwind CSS styling tokens
    └── src/
        ├── api/          # Typed API client
        ├── components/   # UI components & badges
        └── pages/        # 6 full-featured pages
```
