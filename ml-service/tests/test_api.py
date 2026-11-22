# ML FastAPI endpoint integration tests
# Tests all endpoints: /health, /model/info, /train, /predict – including API key guard.
# Run from ml-service/: pytest tests/ -v --tb=short
import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from app.main import app

VALID_API_KEY = os.getenv("ML_API_KEY", "slads_ml_secret_key_2026")

client = TestClient(app)

# ─── Helpers ──────────────────────────────────────────────────────────────────

def api_headers():
    return {"X-API-KEY": VALID_API_KEY}


TRAIN_LOGS = [
    {
        "timestamp": f"2026-11-01T{10 + (i % 12):02d}:00:00Z",
        "sourceIp": f"192.168.1.{i % 10 + 1}",
        "username": f"user_{i % 5}",
        "eventType": "login_failed" if i % 4 == 0 else "login_success",
        "statusCode": 401 if i % 4 == 0 else 200,
        "resource": f"/api/v1/resource_{i % 3}",
        "userAgent": "TestAgent/1.0",
        "message": f"Test event {i}",
    }
    for i in range(30)
]


# ─── GET /health ──────────────────────────────────────────────────────────────

class TestHealthEndpoint:
    def test_health_returns_200(self):
        res = client.get("/health")
        assert res.status_code == 200

    def test_health_response_structure(self):
        res = client.get("/health")
        body = res.json()
        assert body["status"] == "ok"
        assert body["service"] == "ml-service"
        assert "modelLoaded" in body
        assert "version" in body

    def test_health_requires_no_api_key(self):
        res = client.get("/health")
        assert res.status_code == 200


# ─── GET /model/info ──────────────────────────────────────────────────────────

class TestModelInfoEndpoint:
    def test_model_info_requires_api_key(self):
        res = client.get("/model/info")
        assert res.status_code == 401

    def test_model_info_returns_401_for_wrong_key(self):
        res = client.get("/model/info", headers={"X-API-KEY": "wrong_key"})
        assert res.status_code == 401

    def test_model_info_returns_200_with_valid_key(self):
        res = client.get("/model/info", headers=api_headers())
        assert res.status_code == 200

    def test_model_info_response_structure(self):
        res = client.get("/model/info", headers=api_headers())
        body = res.json()
        assert "isLoaded" in body
        assert "features" in body
        assert "modelPath" in body
        assert isinstance(body["features"], list)


# ─── POST /train ──────────────────────────────────────────────────────────────

class TestTrainEndpoint:
    def test_train_requires_api_key(self):
        res = client.post("/train", json={"logs": TRAIN_LOGS})
        assert res.status_code == 401

    def test_train_returns_401_for_wrong_key(self):
        res = client.post("/train", json={"logs": TRAIN_LOGS},
                          headers={"X-API-KEY": "badkey"})
        assert res.status_code == 401

    def test_train_succeeds_with_enough_logs(self):
        res = client.post("/train", json={"logs": TRAIN_LOGS},
                          headers=api_headers())
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert body["nSamples"] == len(TRAIN_LOGS)
        assert isinstance(body["features"], list)

    def test_train_response_includes_trained_at(self):
        res = client.post("/train", json={"logs": TRAIN_LOGS},
                          headers=api_headers())
        body = res.json()
        assert body["trainedAt"] is not None

    def test_train_returns_400_or_422_with_fewer_than_10_logs(self):
        res = client.post("/train", json={"logs": TRAIN_LOGS[:5]},
                          headers=api_headers())
        assert res.status_code in (400, 422)

    def test_train_with_custom_contamination(self):
        payload = {"logs": TRAIN_LOGS, "contamination": 0.05}
        res = client.post("/train", json=payload, headers=api_headers())
        assert res.status_code == 200
        body = res.json()
        assert abs(body["contamination"] - 0.05) < 1e-6

    def test_train_contamination_out_of_range_returns_422(self):
        payload = {"logs": TRAIN_LOGS, "contamination": 0.99}  # > 0.5
        res = client.post("/train", json=payload, headers=api_headers())
        assert res.status_code == 422


# ─── POST /predict ────────────────────────────────────────────────────────────

class TestPredictEndpoint:
    @pytest.fixture(autouse=True)
    def ensure_model_trained(self):
        """Train the model before each predict test."""
        client.post("/train", json={"logs": TRAIN_LOGS}, headers=api_headers())

    def test_predict_requires_api_key(self):
        res = client.post("/predict", json={"logs": TRAIN_LOGS[:5]})
        assert res.status_code == 401

    def test_predict_returns_scores_for_valid_logs(self):
        res = client.post("/predict", json={"logs": TRAIN_LOGS[:10]},
                          headers=api_headers())
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert body["total"] == 10
        assert len(body["predictions"]) == 10

    def test_predict_scores_are_in_valid_range(self):
        res = client.post("/predict", json={"logs": TRAIN_LOGS},
                          headers=api_headers())
        predictions = res.json()["predictions"]
        for p in predictions:
            assert 0.0 <= p["anomalyScore"] <= 1.0
            assert isinstance(p["isAnomaly"], bool)

    def test_predict_has_correct_index_sequence(self):
        res = client.post("/predict", json={"logs": TRAIN_LOGS[:5]},
                          headers=api_headers())
        predictions = res.json()["predictions"]
        indices = [p["index"] for p in predictions]
        assert indices == list(range(5))

    def test_predict_empty_logs_returns_422(self):
        res = client.post("/predict", json={"logs": []},
                          headers=api_headers())
        assert res.status_code == 422

    def test_predict_anomalies_detected_count_matches_flags(self):
        res = client.post("/predict", json={"logs": TRAIN_LOGS},
                          headers=api_headers())
        body = res.json()
        flagged = sum(1 for p in body["predictions"] if p["isAnomaly"])
        assert body["anomaliesDetected"] == flagged
