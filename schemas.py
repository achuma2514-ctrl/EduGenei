from pydantic import BaseModel, Field

class QuestionRequest(BaseModel):
    question: str

class TextRequest(BaseModel):
    text: str

class QuizRequest(BaseModel):
    topic: str
    num_questions: int = Field(default=5, ge=1, le=20)

class QuizResponse(BaseModel):
    topic: str
    questions: list

class TextResponse(BaseModel):
    result: str

class LearningPathResponse(BaseModel):
    topic: str
    result: list | str
