from fastapi import FastAPI, Depends, HTTPException, Security, status
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from . import config
from .schemas import (
    HealthResponse,
    ModelInfoResponse,
    TrainRequest,
    TrainResponse,
    PredictRequest,
    PredictResponse,
    LogPrediction
)
from .features import logs_to_dataframe, extract_features
from .model import global_model

api_key_header = APIKeyHeader(name="X-API-KEY", auto_error=False)


def require_api_key(api_key: str = Security(api_key_header)):
    if not api_key or api_key != config.ML_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-API-KEY authentication header"
        )
    return api_key


app = FastAPI(
    title="Security Log Anomaly Detection Service",
    description="Python FastAPI ML microservice executing Isolation Forest inference for NIIT University Capstone II.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/health", response_model=HealthResponse, tags=["Monitoring"])
def health_check():
    return HealthResponse(
        status="ok",
        service="ml-service",
        modelLoaded=global_model.is_loaded,
        version="1.0.0"
    )


@app.get("/model/info", response_model=ModelInfoResponse, dependencies=[Depends(require_api_key)], tags=["Model"])
def model_info():
    info = global_model.get_info()
    return ModelInfoResponse(**info)


@app.post("/train", response_model=TrainResponse, dependencies=[Depends(require_api_key)], tags=["Model"])
def train_model(payload: TrainRequest):
    if len(payload.logs) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 10 log records are required to train the Isolation Forest pipeline."
        )

    df = logs_to_dataframe(payload.logs)
    X = extract_features(df)

    metadata = global_model.fit(X, contamination=payload.contamination)
    scores, is_anomaly = global_model.predict(X)

    return TrainResponse(
        success=True,
        message="Isolation Forest model trained and serialized successfully.",
        nSamples=len(X),
        anomaliesDetected=int(is_anomaly.sum()),
        contamination=metadata["contamination"],
        trainedAt=metadata["trained_at"],
        features=metadata["features"]
    )


@app.post("/predict", response_model=PredictResponse, dependencies=[Depends(require_api_key)], tags=["Inference"])
def predict_anomalies(payload: PredictRequest):
    if not global_model.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Isolation Forest model is not trained/loaded yet. Run /train or execute train.py first."
        )

    if not payload.logs:
        return PredictResponse(success=True, total=0, anomaliesDetected=0, predictions=[])

    df = logs_to_dataframe(payload.logs)
    X = extract_features(df)

    scores, is_anomaly = global_model.predict(X)

    predictions = []
    for idx, (score, flag) in enumerate(zip(scores, is_anomaly)):
        predictions.append(
            LogPrediction(
                index=idx,
                anomalyScore=float(score),
                isAnomaly=bool(flag)
            )
        )

    return PredictResponse(
        success=True,
        total=len(predictions),
        anomaliesDetected=int(is_anomaly.sum()),
        predictions=predictions
    )
