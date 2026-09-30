import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.rag import router as rag_router

app = FastAPI(
    title="MausamLive Hybrid RAG Service",
    description="Microservice providing hybrid live weather + vector knowledge retrieval and grounded generation.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rag_router)

@app.get("/")
def root():
    return {
        "service": "MausamLive RAG Service",
        "status": "online",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
