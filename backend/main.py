import os
import io
import cv2
import numpy as np
import json
import re
import time
import requests
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from huggingface_hub import InferenceClient
from groq import Groq
from tavily import TavilyClient
from dotenv import load_dotenv

# Load Environment Variables
load_dotenv()

app = FastAPI(title="VeriSight Forensic Engine v2.0")

# Enable CORS for Frontend Communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clients Initialization
hf_client = InferenceClient(api_key=os.getenv("HF_TOKEN"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

# 2025 Model Configuration
PRIMARY_VISION_MODEL = "umm-maybe/AI-image-detector"
FALLBACK_VISION_MODEL = "dima806/deepfake_vs_real_image_detection"
LLM_MODEL = "llama-3.3-70b-versatile"

# --- HELPER: Hugging Face API Request ---
def query_model(image_data, model_id):
    api_url = f"https://router.huggingface.co/hf-inference/models/{model_id}"
    headers = {
        "Authorization": f"Bearer {os.getenv('HF_TOKEN')}",
        "Content-Type": "image/jpeg"
    }
    
    try:
        response = requests.post(api_url, headers=headers, data=image_data, timeout=30)
        
        # Handle Model Loading (503)
        if response.status_code == 503:
            print(f"Model {model_id} is waking up... waiting 15s.")
            time.sleep(15)
            response = requests.post(api_url, headers=headers, data=image_data)

        if response.status_code != 200:
            return {"error": f"API Error {response.status_code}: {response.text[:50]}"}

        return response.json()
    except Exception as e:
        return {"error": str(e)}

# --- ENDPOINT: Media Analysis (Images/Video) ---
@app.post("/analyze-media")
async def analyze_media(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # 1. Video Frame Extraction (Middle Frame)
        if file.content_type.startswith("video"):
            temp_path = f"temp_{int(time.time())}.mp4"
            with open(temp_path, "wb") as f:
                f.write(contents)
            
            cap = cv2.VideoCapture(temp_path)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            cap.set(cv2.CAP_PROP_POS_FRAMES, total_frames // 2) 
            success, frame = cap.read()
            cap.release()
            if os.path.exists(temp_path): os.remove(temp_path)
            
            if not success: 
                raise HTTPException(status_code=500, detail="Failed to extract video frame")
            
            _, buffer = cv2.imencode(".jpg", frame)
            contents = buffer.tobytes()

        # 2. Vision Inference
        result = query_model(contents, PRIMARY_VISION_MODEL)
        
        if "error" in result:
            return {"integrity_score": 0, "is_tampered": True, "report": result["error"]}

        # 3. Robust Label Parsing (Fixes the "0%" bug)
        fake_score = 0.0
        # Models often return labels like 'label_1', 'Fake', or 'Synthetic'
        if isinstance(result, list):
            for prediction in result:
                label = str(prediction.get('label', '')).lower()
                score = prediction.get('score', 0.0)
                if any(x in label for x in ['fake', 'label_1', 'synthetic', 'generated']):
                    fake_score = score
                    break
                elif any(x in label for x in ['real', 'label_0', 'authentic']):
                    fake_score = 1.0 - score

        integrity = int((1 - fake_score) * 100)
        
        return {
            "integrity_score": integrity,
            "is_tampered": fake_score > 0.5,
            "report": f"Analysis complete. Content is {integrity}% likely to be authentic."
        }

    except Exception as e:
        print(f"Analysis Error: {e}")
        return {"integrity_score": 0, "is_tampered": False, "report": f"System Error: {str(e)}"}

# --- ENDPOINT: Fact-Check Claim ---
@app.post("/verify-claim")
async def verify_claim(payload: dict):
    claim = payload.get("text")
    if not claim:
        return {"verdict": "ERROR", "confidence": 0, "explanation": "No claim provided."}

    try:
        # 1. Real-time Search
        search_results = tavily.search(query=claim, search_depth="advanced")
        
        # 2. LLM Synthesis
        prompt = f"""
        VERIFY THIS CLAIM: "{claim}"
        CONTEXT: {search_results}
        
        Return ONLY valid JSON:
        {{
          "verdict": "TRUE" | "FALSE" | "MISLEADING",
          "confidence": 0-100,
          "explanation": "2-sentence summary of findings."
        }}
        """
        
        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=LLM_MODEL,
            response_format={"type": "json_object"}
        )
        
        # 3. Secure Parsing
        raw_content = completion.choices[0].message.content
        data = json.loads(raw_content)

        return {
            "verdict": data.get("verdict", "UNKNOWN").upper(),
            "confidence": int(data.get("confidence", 0)),
            "explanation": data.get("explanation", "Analysis complete.")
        }

    except Exception as e:
        print(f"Verification Error: {e}")
        return {"verdict": "ERROR", "confidence": 0, "explanation": f"API Error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    # Use 127.0.0.1 to avoid IPv6 resolution issues in Next.js
    uvicorn.run(app, host="127.0.0.1", port=8000)