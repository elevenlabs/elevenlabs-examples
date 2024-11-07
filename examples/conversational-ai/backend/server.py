# backend/server.py
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes should be defined before static file handling
@app.get("/api/signed-url")
async def get_signed_url():
    agent_id = os.getenv("AGENT_ID")
    xi_api_key = os.getenv("XI_API_KEY")
    
    if not agent_id or not xi_api_key:
        raise HTTPException(status_code=500, detail="Missing environment variables")
    
    url = f"https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id={agent_id}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                url,
                headers={"xi-api-key": xi_api_key}
            )
            response.raise_for_status()
            data = response.json()
            return {"signedUrl": data["signed_url"]}
            
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail="Failed to get signed URL")

# Mount static files for specific assets (CSS, JS, etc.)
app.mount("/static", StaticFiles(directory="dist"), name="static")

# Serve index.html for root path
@app.get("/")
async def serve_root():
    return FileResponse("dist/index.html")

# Catch-all route to serve index.html for client-side routing
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # First try to serve from static directory
    static_file = Path(f"dist/{full_path}")
    if static_file.exists() and static_file.is_file():
        return FileResponse(static_file)
    
    # If not found, serve index.html for client-side routing
    return FileResponse("dist/index.html")