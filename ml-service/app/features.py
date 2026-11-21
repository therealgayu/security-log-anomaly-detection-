import pandas as pd
import numpy as np
from typing import List, Dict, Any

FEATURE_COLUMNS = [
    "events_per_min_ip",
    "failed_login_ratio",
    "distinct_users_per_ip",
    "distinct_resources_per_user",
    "off_hours_flag",
    "hour_of_day",
    "status_error_ratio",
    "privilege_change_count"
]


def logs_to_dataframe(logs: List[Any]) -> pd.DataFrame:
    """
    Converts a list of Pydantic models or dicts to a standardized Pandas DataFrame.
    """
    rows = []
    for item in logs:
        if hasattr(item, "model_dump"):
            rows.append(item.model_dump())
        elif hasattr(item, "dict"):
            rows.append(item.dict())
        elif isinstance(item, dict):
            rows.append(item)
        else:
            rows.append(dict(item))

    df = pd.DataFrame(rows)
    if df.empty:
        return pd.DataFrame(columns=["timestamp", "sourceIp", "username", "eventType", "statusCode", "resource"])

    # Ensure required fields exist with defaults
    if "statusCode" not in df.columns:
        df["statusCode"] = 200
    df["statusCode"] = pd.to_numeric(df["statusCode"], errors="coerce").fillna(200).astype(int)

    if "resource" not in df.columns:
        df["resource"] = ""
    df["resource"] = df["resource"].fillna("").astype(str)

    if "username" not in df.columns:
        df["username"] = "unknown"
    df["username"] = df["username"].fillna("unknown").astype(str)

    if "sourceIp" not in df.columns:
        df["sourceIp"] = "127.0.0.1"
    df["sourceIp"] = df["sourceIp"].fillna("127.0.0.1").astype(str)

    if "eventType" not in df.columns:
        df["eventType"] = "file_access"
    df["eventType"] = df["eventType"].fillna("file_access").astype(str).str.lower().str.strip()

    # Parse timestamps
    df["dt"] = pd.to_datetime(df["timestamp"], utc=True, errors="coerce")
    default_dt = pd.Timestamp.now(tz="UTC")
    df["dt"] = df["dt"].fillna(default_dt)

    return df


def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extracts security behavioral and statistical feature vectors per log entity/window:
    1. events_per_min_ip: Frequency of events per minute for the source IP
    2. failed_login_ratio: Ratio of failed logins for the source IP
    3. distinct_users_per_ip: Unique usernames targeted/used per source IP
    4. distinct_resources_per_user: Distinct resources accessed by user
    5. off_hours_flag: Binary flag (1 if event occurred between 22:00 and 06:00 UTC)
    6. hour_of_day: Numeric hour (0 - 23)
    7. status_error_ratio: Error status code ratio (>= 400) for source IP
    8. privilege_change_count: Cumulative privilege change attempts for user
    """
    if df.empty:
        return pd.DataFrame(columns=FEATURE_COLUMNS)

    # 1. Hour of day and off-hours flag (22:00 to 06:00 UTC)
    hours = df["dt"].dt.hour
    df["hour_of_day"] = hours.astype(float)
    df["off_hours_flag"] = ((hours < 6) | (hours >= 22)).astype(float)

    # 2. Events per minute per IP
    df["minute_bucket"] = df["dt"].dt.floor("min")
    ip_min_counts = df.groupby(["sourceIp", "minute_bucket"])["sourceIp"].transform("count")
    df["events_per_min_ip"] = ip_min_counts.astype(float)

    # 3. Failed login ratio per IP
    df["is_failed_login"] = (df["eventType"] == "login_failed").astype(float)
    ip_failed_sums = df.groupby("sourceIp")["is_failed_login"].transform("sum")
    ip_total_counts = df.groupby("sourceIp")["sourceIp"].transform("count")
    df["failed_login_ratio"] = (ip_failed_sums / ip_total_counts.replace(0, 1)).astype(float)

    # 4. Distinct usernames targeted per IP
    users_per_ip = df.groupby("sourceIp")["username"].transform("nunique")
    df["distinct_users_per_ip"] = users_per_ip.astype(float)

    # 5. Distinct resources accessed per user
    res_per_user = df.groupby("username")["resource"].transform("nunique")
    df["distinct_resources_per_user"] = res_per_user.astype(float)

    # 6. Status code error ratio (>= 400) per IP
    df["is_error_status"] = (df["statusCode"] >= 400).astype(float)
    ip_error_sums = df.groupby("sourceIp")["is_error_status"].transform("sum")
    df["status_error_ratio"] = (ip_error_sums / ip_total_counts.replace(0, 1)).astype(float)

    # 7. Privilege change event count per user
    df["is_priv_change"] = (df["eventType"] == "privilege_change").astype(float)
    user_priv_counts = df.groupby("username")["is_priv_change"].transform("sum")
    df["privilege_change_count"] = user_priv_counts.astype(float)

    # Select final ordered feature matrix
    X = df[FEATURE_COLUMNS].copy()
    X = X.fillna(0.0)
    return X
