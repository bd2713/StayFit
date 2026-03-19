from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class ChatMessageReq(BaseModel):
    message: str

class ChatMessageRes(BaseModel):
    id: UUID
    role: str
    message: str
    timestamp: datetime

    model_config = {"from_attributes": True}
