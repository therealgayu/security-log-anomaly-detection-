import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

from .features import FEATURE_COLUMNS
from . import config


class AnomalyDetectionModel:
    """
    Scikit-Learn Isolation Forest pipeline wrapped with StandardScaler
    and mathematical sigmoid score normalization to [0.0, 1.0].
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or config.MODEL_PATH
        self.pipeline: Optional[Pipeline] = None
        self.metadata: Dict[str, Any] = {
            "trained_at": None,
            "n_samples": None,
            "contamination": config.CONTAMINATION_RATE,
            "features": FEATURE_COLUMNS,
            "params": {}
        }
        self.load()

    @property
    def is_loaded(self) -> bool:
        return self.pipeline is not None

    def fit(self, X: pd.DataFrame, contamination: Optional[float] = None) -> Dict[str, Any]:
        """
        Fits a new StandardScaler + IsolationForest pipeline on the extracted feature matrix.
        """
        c_rate = contamination if contamination is not None else config.CONTAMINATION_RATE
        n_samples = len(X)

        scaler = StandardScaler()
        forest = IsolationForest(
            n_estimators=100,
            contamination=c_rate,
            random_state=config.RANDOM_STATE,
            n_jobs=-1
        )

        pipeline = Pipeline([
            ("scaler", scaler),
            ("forest", forest)
        ])

        pipeline.fit(X)
        self.pipeline = pipeline

        self.metadata = {
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "n_samples": n_samples,
            "contamination": c_rate,
            "features": FEATURE_COLUMNS,
            "params": forest.get_params()
        }

        self.save()
        return self.metadata

    def predict(self, X: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predicts anomaly scores and binary outlier flags for feature matrix X.
        Returns:
            normalized_scores: float array in [0.0, 1.0], where 1.0 = highly anomalous
            is_anomaly: boolean array, True if detected as an outlier (-1)
        """
        if not self.is_loaded:
            raise RuntimeError("Model artifact is not loaded. Train the model before running inference.")

        forest: IsolationForest = self.pipeline.named_steps["forest"]
        scaler: StandardScaler = self.pipeline.named_steps["scaler"]

        X_scaled = scaler.transform(X)
        raw_decisions = forest.decision_function(X_scaled)
        raw_predictions = forest.predict(X_scaled)

        # Sigmoid normalization mapping decision_function into [0.0, 1.0]
        # In scikit-learn, decision_function < 0 represents anomalies.
        # Mapping: score = 1 / (1 + exp(4 * decision_function))
        # When decision == 0, score = 0.5.
        # When decision < 0 (anomalous), score > 0.5 up to 1.0.
        # When decision > 0 (normal), score < 0.5 down to 0.0.
        normalized_scores = 1.0 / (1.0 + np.exp(np.clip(raw_decisions * 4.0, -20.0, 20.0)))
        normalized_scores = np.round(normalized_scores, 4)

        is_anomaly = raw_predictions == -1
        return normalized_scores, is_anomaly

    def save(self, target_path: Optional[str] = None) -> None:
        path = target_path or self.model_path
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        payload = {
            "pipeline": self.pipeline,
            "metadata": self.metadata
        }
        joblib.dump(payload, path)

    def load(self, target_path: Optional[str] = None) -> bool:
        path = target_path or self.model_path
        if os.path.exists(path):
            try:
                payload = joblib.load(path)
                self.pipeline = payload.get("pipeline")
                self.metadata = payload.get("metadata", {})
                return True
            except Exception as e:
                print(f"[Model Warning] Could not load model from {path}: {e}")
                self.pipeline = None
                return False
        return False

    def get_info(self) -> Dict[str, Any]:
        return {
            "isLoaded": self.is_loaded,
            "trainedAt": self.metadata.get("trained_at"),
            "nSamples": self.metadata.get("n_samples"),
            "features": FEATURE_COLUMNS,
            "params": self.metadata.get("params", {}),
            "modelPath": self.model_path
        }


# Global model singleton
global_model = AnomalyDetectionModel()
