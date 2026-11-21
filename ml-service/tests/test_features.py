import unittest
import pandas as pd
from app.features import logs_to_dataframe, extract_features, FEATURE_COLUMNS


class TestFeatureExtraction(unittest.TestCase):
    def test_logs_to_dataframe_empty(self):
        df = logs_to_dataframe([])
        self.assertIsInstance(df, pd.DataFrame)

    def test_feature_extraction_columns(self):
        sample_logs = [
            {
                "timestamp": "2026-11-21T02:30:00Z",
                "sourceIp": "198.51.100.44",
                "username": "alice.chen",
                "eventType": "login_failed",
                "statusCode": 401,
                "resource": "/auth/login"
            },
            {
                "timestamp": "2026-11-21T10:00:00Z",
                "sourceIp": "192.168.1.15",
                "username": "bob.miller",
                "eventType": "login_success",
                "statusCode": 200,
                "resource": "/api/v1/dashboard"
            }
        ]

        df = logs_to_dataframe(sample_logs)
        X = extract_features(df)

        self.assertIsInstance(X, pd.DataFrame)
        self.assertEqual(len(X), 2)
        for col in FEATURE_COLUMNS:
            self.assertIn(col, X.columns)
        self.assertEqual(X["off_hours_flag"].iloc[0], 1.0)  # 02:30 is off-hours
        self.assertEqual(X["off_hours_flag"].iloc[1], 0.0)  # 10:00 is business hours


if __name__ == "__main__":
    unittest.main()
