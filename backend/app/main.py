
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.services.nasa_power import router as nasa_router
from app.api.crop_rotation import router as crop_rotation_router


app = FastAPI(
    title="AgroShift API",
    description="NASA-powered agricultural decision support system",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://agroshift.netlify.app"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):517[0-9]",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Welcome to AgroShift API",
        "status": "running"
    }


@app.get("/api/health")
def health():
    return {
        "project": "AgroShift",
        "status": "healthy",
        "version": "1.0.0"
    }


# Existing NASA climate API
app.include_router(nasa_router)

# New crop rotation API
app.include_router(crop_rotation_router)
