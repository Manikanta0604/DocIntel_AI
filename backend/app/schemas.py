from pydantic import BaseModel, Field


class Source(BaseModel):
    document_id: str
    filename: str
    page: int | None = None
    chunk: str
    score: float


class QueryRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)
    top_k: int = Field(default=5, ge=1, le=10)


class QueryResponse(BaseModel):
    answer: str
    provider: str
    sources: list[Source]


class DocumentRecord(BaseModel):
    document_id: str
    filename: str
    chunks: int
