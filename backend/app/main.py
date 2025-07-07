import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# backend/app/main.py

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.core import settings, setup_cors

# 1) instantiate your FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_prefix=settings.API_PREFIX,  # e.g. "/api" in the docs
)

# 2) wire up CORS
setup_cors(app)

# 3) include all your routers under the same /api prefix
from app.routers.query import router as query_router
from app.routers.formulation import router as formulation_router
from app.routers.costing import router as costing_router
from app.routers.branding import router as branding_router
from app.routers.query_router import router as query_suggestions_router
from app.routers.mailchimp_router import router as mailchimp_router
from app.routers.auth_router import router as auth_router
from app.routers.scientific_reasoning import router as scientific_reasoning_router
from app.routers.market_research import router as market_research_router
from app.routers.optimization_router import router as optimization_router

app.include_router(query_router, prefix=settings.API_PREFIX + "/v1")
app.include_router(formulation_router, prefix=settings.API_PREFIX + "/v1")
app.include_router(costing_router, prefix=settings.API_PREFIX + "/v1")
app.include_router(branding_router, prefix=settings.API_PREFIX + "/v1")
app.include_router(query_suggestions_router, prefix=settings.API_PREFIX + "/v1")
app.include_router(mailchimp_router, prefix=settings.API_PREFIX + "/v1")
app.include_router(auth_router, prefix=settings.API_PREFIX + "/v1")
app.include_router(scientific_reasoning_router, prefix=settings.API_PREFIX + "/v1")
app.include_router(market_research_router, prefix=settings.API_PREFIX + "/v1")
app.include_router(optimization_router, prefix=settings.API_PREFIX + "/v1")

# 4) serve static files (frontend build)
try:
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
except:
    pass  # static directory might not exist in development
