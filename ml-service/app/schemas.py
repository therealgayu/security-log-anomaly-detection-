from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime


class LogRecordSchema(BaseModel):
    timestamp: Any = Field(..., description="ISO datetime string or numeric timestamp")
    sourceIp: str = Field(..., description="IPv4 or IPv6 client address")
    username: str = Field(..., description="Account or user identifier")
    eventType: str = Field(..., description="Security event category")
    statusCode: Optional[int] = Field(200, description="HTTP or system status code")
    resource: Optional[str] = Field("", description="Target URL, path or file accessed")
    userAgent: Optional[str] = Field("", description="Client browser or agent identifier")
    message: Optional[str] = Field("", description="Descriptive event log message")
    isAnomaly: Optional[bool] = Field(None, description="Optional ground-truth anomaly indicator")


class TrainRequest(BaseModel):
    logs: List[LogRecordSchema] = Field(..., min_length=10, description="Collection of security logs for model fitting")
    contamination: Optional[float] = Field(None, ge=0.001, le=0.5, description="Expected anomaly proportion")


class TrainResponse(BaseModel):
    success: bool
    message: str
    nSamples: int
    anomaliesDetected: int
    contamination: float
    trainedAt: str
    features: List[str]


class LogPrediction(BaseModel):
    index: int
    anomalyScore: float = Field(..., ge=0.0, le=1.0, description="Normalized anomaly score (0=normal, 1=severe anomaly)")
    isAnomaly: bool = Field(..., description="True if marked as an outlier")


class PredictRequest(BaseModel):
    logs: List[LogRecordSchema] = Field(..., min_length=1, description="List of security logs to evaluate")


class PredictResponse(BaseModel):
    success: bool
    total: int
    anomaliesDetected: int
    predictions: List[LogPrediction]


class ModelInfoResponse(BaseModel):
    isLoaded: bool
    trainedAt: Optional[str] = None
    nSamples: Optional[int] = None
    features: List[str] = []
    params: Dict[str, Any] = {}
    modelPath: str


class HealthResponse(BaseModel):
    status: str
    service: str
    modelLoaded: bool
    version: str
