import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

ML_PORT = int(os.getenv("ML_PORT", "8000"))
ML_HOST = os.getenv("ML_HOST", "0.0.0.0")
ML_API_KEY = os.getenv("ML_API_KEY", "slads_ml_secret_key_2026")
MODEL_PATH = os.getenv("MODEL_PATH", str(BASE_DIR / "models" / "isolation_forest.joblib"))
CONTAMINATION_RATE = float(os.getenv("CONTAMINATION_RATE", "0.03"))
RANDOM_STATE = int(os.getenv("RANDOM_STATE", "42"))
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
LOG_LEVEL = os.getenv("LOG_LEVEL", "info")
