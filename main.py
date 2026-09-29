from pathlib import Path

from fastapi import FastAPI, HTTPException, Request

from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import HTMLResponse

from fastapi.staticfiles import StaticFiles

from fastapi.templating import Jinja2Templates


from config import get_settings

from schemas import (
    QuestionRequest,
    TextRequest,
    QuizRequest,
    QuizResponse,
    TextResponse,
    LearningPathResponse
)

from qna import answer_question

from explanation_module import explain_topic

from quiz_module import generate_quiz

from summary_module import summarize_text

from learning_path import (
    get_learning_recommendations
)


BASE_DIR = Path(__file__).resolve().parent

settings = get_settings()


app = FastAPI(

    title="EduGenie",

    description=(
        "Google Gemini Powered Learning Assistant"
    ),

    version=settings.app_version
)


app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"]
)


app.mount(

    "/static",

    StaticFiles(
        directory=BASE_DIR / "static"
    ),

    name="static"
)


templates = Jinja2Templates(

    directory=BASE_DIR / "templates"
)


@app.get(
    "/",
    response_class=HTMLResponse
)
async def home(request: Request):

    return templates.TemplateResponse(
    request=request,
    name="index.html",
    context={
        "app_name": settings.app_name
    }
)


@app.get("/health")
@app.get("/api/health")
async def health():

    return {

        "status": "ok",

        "app": settings.app_name,

        "version": settings.app_version,

        "gemini_configured":
            bool(settings.gemini_api_key),

        "demo_mode":
            settings.demo_mode,

        "local_explainer":
            settings.use_local_explainer
    }


@app.post(
    "/qa",
    response_model=TextResponse
)
async def qa(request: QuestionRequest):

    try:

        answer = answer_question(
            request.question.strip()
        )

        return {
            "result": answer
        }

    except Exception as error:

        raise HTTPException(

            status_code=502,

            detail=str(error)
        )


@app.post(
    "/explain",
    response_model=TextResponse
)
async def explain(request: TextRequest):

    try:

        answer = explain_topic(
            request.text.strip()
        )

        return {
            "result": answer
        }

    except Exception as error:

        raise HTTPException(

            status_code=502,

            detail=str(error)
        )


@app.post(
    "/quiz",
    response_model=QuizResponse
)
async def quiz(request: QuizRequest):

    try:

        questions = generate_quiz(

            request.topic.strip(),

            request.num_questions
        )

        return {

            "topic":
                request.topic.strip(),

            "questions":
                questions
        }

    except Exception as error:

        raise HTTPException(

            status_code=502,

            detail=str(error)
        )


@app.post(
    "/summarize",
    response_model=TextResponse
)
async def summarize(request: TextRequest):

    try:

        summary = summarize_text(

            request.text.strip()
        )

        return {

            "result": summary
        }

    except Exception as error:

        raise HTTPException(

            status_code=502,

            detail=str(error)
        )


@app.post(
    "/learn/recommendations",
    response_model=LearningPathResponse
)
async def recommendations(
    request: TextRequest
):

    try:

        topic = request.text.strip()

        recommendations = (
            get_learning_recommendations(
                topic
            )
        )

        return {

            "topic": topic,

            "result": recommendations
        }

    except Exception as error:

        raise HTTPException(

            status_code=502,

            detail=str(error)
        )