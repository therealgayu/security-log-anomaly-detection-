import unittest
from fastapi.testclient import TestClient
from app.main import app
from app import config


class TestMlApi(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["service"], "ml-service")

    def test_model_info_requires_auth(self):
        response = self.client.get("/model/info")
        self.assertEqual(response.status_code, 401)

    def test_model_info_authorized(self):
        response = self.client.get("/model/info", headers={"X-API-KEY": config.ML_API_KEY})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("isLoaded", data)
        self.assertIn("features", data)


if __name__ == "__main__":
    unittest.main()
