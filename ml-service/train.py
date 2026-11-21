import argparse
import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, precision_score, recall_score, f1_score

from app.features import extract_features, logs_to_dataframe, FEATURE_COLUMNS
from app.model import AnomalyDetectionModel
from app import config


def parse_args():
    parser = argparse.ArgumentParser(description="Train Isolation Forest on Security Log Dataset")
    default_csv = Path(__file__).resolve().parent.parent / "backend" / "sample_logs.csv"
    if not default_csv.exists():
        default_csv = Path(__file__).resolve().parent / "sample_logs.csv"

    parser.add_argument("--csv", type=str, default=str(default_csv), help="Path to input CSV logs dataset")
    parser.add_argument("--contamination", type=float, default=config.CONTAMINATION_RATE, help="Expected contamination proportion")
    parser.add_argument("--out", type=str, default=config.MODEL_PATH, help="Output destination for serialized joblib model")
    return parser.parse_args()


def main():
    args = parse_args()
    csv_path = Path(args.csv)

    if not csv_path.exists():
        print(f"[Error] CSV file not found at: {csv_path}")
        print("Please run `node scripts/generateSampleLogs.js` in /backend or pass --csv <path>")
        sys.exit(1)

    print(f"[Training] Loading logs dataset from: {csv_path}")
    raw_df = pd.read_csv(csv_path)
    print(f"[Training] Loaded {len(raw_df)} log rows.")

    # Check for ground-truth label column
    has_labels = False
    y_true = None
    for label_col in ["isAnomaly", "is_anomaly", "anomaly", "label"]:
        if label_col in raw_df.columns:
            has_labels = True
            y_true = raw_df[label_col].astype(bool).values
            print(f"[Training] Ground-truth label column detected: '{label_col}' ({y_true.sum()} positive anomalies)")
            break

    # Standardize and extract features
    df = logs_to_dataframe(raw_df.to_dict(orient="records"))
    print("[Training] Extracting behavioral & statistical feature matrix...")
    X = extract_features(df)
    print(f"[Training] Feature matrix shape: {X.shape}")
    print(f"[Training] Features: {', '.join(FEATURE_COLUMNS)}")

    # Initialize and train model
    model = AnomalyDetectionModel(model_path=args.out)
    print(f"[Training] Fitting StandardScaler + IsolationForest (contamination={args.contamination})...")
    meta = model.fit(X, contamination=args.contamination)
    print(f"[Training] Model successfully trained and saved to: {args.out}")

    # Evaluate predictions
    scores, is_anomaly = model.predict(X)
    n_detected = int(is_anomaly.sum())
    print(f"[Results] Detected anomalies: {n_detected} / {len(X)} ({((n_detected/len(X))*100):.2f}%)")

    # If ground-truth labels exist, compute and display classification metrics
    if has_labels and y_true is not None:
        print("\n" + "=" * 60)
        print("MODEL EVALUATION ON INJECTED ANOMALIES")
        print("=" * 60)
        prec = precision_score(y_true, is_anomaly, zero_division=0)
        rec = recall_score(y_true, is_anomaly, zero_division=0)
        f1 = f1_score(y_true, is_anomaly, zero_division=0)
        cm = confusion_matrix(y_true, is_anomaly)

        try:
            auc = roc_auc_score(y_true, scores)
        except Exception:
            auc = 0.0

        print(f"Precision: {prec:.4f}")
        print(f"Recall:    {rec:.4f}")
        print(f"F1-Score:  {f1:.4f}")
        print(f"ROC-AUC:   {auc:.4f}")
        print("\nConfusion Matrix:")
        print(f"  [ [True Normal: {cm[0][0]}, False Alarm: {cm[0][1]}],")
        print(f"    [Missed Anomaly: {cm[1][0]}, Caught Anomaly: {cm[1][1]}] ]")
        print("\nClassification Report:")
        print(classification_report(y_true, is_anomaly, target_names=["Normal", "Anomaly"], zero_division=0))
        print("=" * 60)


if __name__ == "__main__":
    main()
