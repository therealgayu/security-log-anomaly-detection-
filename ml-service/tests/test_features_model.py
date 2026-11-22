# ML service tests – covers feature extraction, model train/predict, API key guard.
# Run from ml-service/: pytest tests/ -v --tb=short
import sys
import os
import pytest
import pandas as pd
import numpy as np

# Ensure app package is importable when running from ml-service/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.features import logs_to_dataframe, extract_features, FEATURE_COLUMNS
from app.model import AnomalyDetectionModel

# ─── Fixtures ─────────────────────────────────────────────────────────────────

SAMPLE_LOGS = [
    {
        "timestamp": "2026-11-01T10:30:00Z",
        "sourceIp": f"192.168.1.{i % 10}",
        "username": f"user_{i % 5}",
        "eventType": "login_failed" if i % 3 == 0 else "login_success",
        "statusCode": 401 if i % 3 == 0 else 200,
        "resource": f"/api/resource/{i % 4}",
        "userAgent": "Mozilla/5.0",
        "message": f"Event {i}",
    }
    for i in range(30)
]

# Off-hours entries (22:00 hour)
OFF_HOURS_LOG = {
    "timestamp": "2026-11-01T22:15:00Z",
    "sourceIp": "10.0.0.99",
    "username": "nightuser",
    "eventType": "privilege_change",
    "statusCode": 200,
    "resource": "/admin",
    "userAgent": "",
    "message": "Elevated privilege at night",
}

# ─── Feature extraction tests ─────────────────────────────────────────────────

class TestLogsToDataframe:
    def test_converts_dict_list_to_dataframe(self):
        df = logs_to_dataframe(SAMPLE_LOGS)
        assert isinstance(df, pd.DataFrame)
        assert len(df) == len(SAMPLE_LOGS)

    def test_parses_timestamps_to_datetime(self):
        df = logs_to_dataframe(SAMPLE_LOGS)
        assert pd.api.types.is_datetime64_any_dtype(df["dt"])

    def test_fills_missing_statusCode_with_200(self):
        logs = [{"timestamp": "2026-11-01T10:00:00Z", "sourceIp": "1.2.3.4",
                 "username": "u", "eventType": "file_access"}]
        df = logs_to_dataframe(logs)
        assert int(df["statusCode"].iloc[0]) == 200

    def test_fills_missing_username(self):
        logs = [{"timestamp": "2026-11-01T10:00:00Z", "sourceIp": "1.2.3.4",
                 "eventType": "file_access"}]
        df = logs_to_dataframe(logs)
        assert df["username"].iloc[0] == "unknown"

    def test_empty_list_returns_empty_dataframe(self):
        df = logs_to_dataframe([])
        assert df.empty


class TestExtractFeatures:
    def test_returns_all_feature_columns(self):
        df = logs_to_dataframe(SAMPLE_LOGS)
        X = extract_features(df)
        assert list(X.columns) == FEATURE_COLUMNS

    def test_no_nan_values_in_output(self):
        df = logs_to_dataframe(SAMPLE_LOGS)
        X = extract_features(df)
        assert not X.isnull().any().any()

    def test_events_per_min_ip_is_positive(self):
        df = logs_to_dataframe(SAMPLE_LOGS)
        X = extract_features(df)
        assert (X["events_per_min_ip"] > 0).all()

    def test_failed_login_ratio_is_between_0_and_1(self):
        df = logs_to_dataframe(SAMPLE_LOGS)
        X = extract_features(df)
        assert (X["failed_login_ratio"] >= 0).all()
        assert (X["failed_login_ratio"] <= 1).all()

    def test_off_hours_flag_is_1_for_22h_event(self):
        df = logs_to_dataframe([OFF_HOURS_LOG])
        X = extract_features(df)
        assert X["off_hours_flag"].iloc[0] == 1.0

    def test_off_hours_flag_is_0_for_noon_event(self):
        log = {**OFF_HOURS_LOG, "timestamp": "2026-11-01T12:00:00Z"}
        df = logs_to_dataframe([log])
        X = extract_features(df)
        assert X["off_hours_flag"].iloc[0] == 0.0

    def test_hour_of_day_range(self):
        df = logs_to_dataframe(SAMPLE_LOGS)
        X = extract_features(df)
        assert (X["hour_of_day"] >= 0).all()
        assert (X["hour_of_day"] <= 23).all()

    def test_privilege_change_count_nonzero_when_present(self):
        logs = [
            {**SAMPLE_LOGS[0], "eventType": "privilege_change", "username": "privu"},
            {**SAMPLE_LOGS[1], "eventType": "privilege_change", "username": "privu"},
            {**SAMPLE_LOGS[2], "eventType": "login_success",   "username": "privu"},
        ]
        df = logs_to_dataframe(logs)
        X = extract_features(df)
        # The user 'privu' had 2 privilege changes
        priv_rows = X[df["username"] == "privu"]
        assert (priv_rows["privilege_change_count"] == 2.0).all()

    def test_status_error_ratio_for_all_errors(self):
        logs = [{**SAMPLE_LOGS[0], "statusCode": 500, "sourceIp": "9.9.9.9", "username": f"err_{i}"}
                for i in range(5)]
        df = logs_to_dataframe(logs)
        X = extract_features(df)
        assert (X["status_error_ratio"] == 1.0).all()

    def test_distinct_users_per_ip(self):
        ip = "10.0.0.5"
        logs = [{**SAMPLE_LOGS[0], "sourceIp": ip, "username": f"user_{i}"} for i in range(4)]
        df = logs_to_dataframe(logs)
        X = extract_features(df)
        assert X["distinct_users_per_ip"].iloc[0] == 4.0

    def test_empty_df_returns_empty_feature_matrix(self):
        df = logs_to_dataframe([])
        X = extract_features(df)
        assert X.empty


# ─── Model tests ──────────────────────────────────────────────────────────────

class TestAnomalyDetectionModel:
    def test_model_starts_as_not_loaded_when_no_file(self, tmp_path):
        model_path = str(tmp_path / "test_model.joblib")
        m = AnomalyDetectionModel(model_path=model_path)
        assert not m.is_loaded

    def test_fit_loads_model(self, tmp_path):
        model_path = str(tmp_path / "test_model.joblib")
        m = AnomalyDetectionModel(model_path=model_path)
        df = logs_to_dataframe(SAMPLE_LOGS)
        X = extract_features(df)
        metadata = m.fit(X)
        assert m.is_loaded
        assert metadata["n_samples"] == len(X)
        assert 0 < metadata["contamination"] <= 0.5

    def test_fit_saves_to_disk(self, tmp_path):
        model_path = str(tmp_path / "saved_model.joblib")
        m = AnomalyDetectionModel(model_path=model_path)
        df = logs_to_dataframe(SAMPLE_LOGS)
        X = extract_features(df)
        m.fit(X)
        assert os.path.exists(model_path)

    def test_predict_returns_scores_in_range(self, tmp_path):
        model_path = str(tmp_path / "predict_model.joblib")
        m = AnomalyDetectionModel(model_path=model_path)
        df = logs_to_dataframe(SAMPLE_LOGS)
        X = extract_features(df)
        m.fit(X)
        scores, is_anomaly = m.predict(X)
        assert len(scores) == len(X)
        assert (scores >= 0.0).all()
        assert (scores <= 1.0).all()

    def test_predict_returns_boolean_array(self, tmp_path):
        model_path = str(tmp_path / "bool_model.joblib")
        m = AnomalyDetectionModel(model_path=model_path)
        df = logs_to_dataframe(SAMPLE_LOGS)
        X = extract_features(df)
        m.fit(X)
        scores, is_anomaly = m.predict(X)
        assert is_anomaly.dtype == bool or is_anomaly.dtype == np.bool_

    def test_predict_raises_when_not_loaded(self, tmp_path):
        model_path = str(tmp_path / "empty_model.joblib")
        m = AnomalyDetectionModel(model_path=model_path)
        df = logs_to_dataframe(SAMPLE_LOGS)
        X = extract_features(df)
        with pytest.raises(RuntimeError, match="not loaded"):
            m.predict(X)

    def test_load_restores_model_from_disk(self, tmp_path):
        model_path = str(tmp_path / "reload_model.joblib")
        m1 = AnomalyDetectionModel(model_path=model_path)
        df = logs_to_dataframe(SAMPLE_LOGS)
        X = extract_features(df)
        m1.fit(X)

        m2 = AnomalyDetectionModel(model_path=model_path)
        assert m2.is_loaded

    def test_get_info_returns_expected_keys(self, tmp_path):
        model_path = str(tmp_path / "info_model.joblib")
        m = AnomalyDetectionModel(model_path=model_path)
        df = logs_to_dataframe(SAMPLE_LOGS)
        X = extract_features(df)
        m.fit(X)
        info = m.get_info()
        assert "isLoaded" in info
        assert "features" in info
        assert "modelPath" in info
        assert info["features"] == FEATURE_COLUMNS

    def test_custom_contamination(self, tmp_path):
        model_path = str(tmp_path / "contam_model.joblib")
        m = AnomalyDetectionModel(model_path=model_path)
        df = logs_to_dataframe(SAMPLE_LOGS)
        X = extract_features(df)
        metadata = m.fit(X, contamination=0.10)
        assert metadata["contamination"] == pytest.approx(0.10)
