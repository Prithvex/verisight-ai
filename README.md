Since we have corrected the code structure in your `main.py`, here are the exact steps to get your backend server up and running properly.

### 1. The "Clean Start" Steps

Before running the command, ensure no other instance of the server is hanging in the background.

1. **Open your Terminal/Command Prompt** and navigate to your backend folder.
2. **Activate your Environment** (if you are using one):
    - **Windows:** `.\venv\Scripts\activate`
    - **Mac/Linux:** `source venv/bin/activate`
3. **Install Dependencies** (only if you haven't recently):Bash
    
    `pip install fastapi uvicorn opencv-python numpy requests python-dotenv huggingface_hub groq tavily-python`
    

---

### 2. The Execution Command

There are two ways to run your backend. Since you have the `if __name__ == "__main__":` block at the bottom of your file, use **Option A**.

### **Option A: Direct Python Run (Recommended)**

This uses the configuration we wrote at the bottom of your script.

Bash

`python main.py`

### **Option B: Uvicorn Standard Run**

Use this if you want "Auto-Reload" (the server restarts automatically whenever you save a change in the code).

Bash

`uvicorn main:app --reload --port 8000`

---

### 3. How to Verify it is Working

Once you run the command, look for this specific line in your terminal:

INFO: Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)

([http://127.0.0.1:8000](http://127.0.0.1:8000/))' message highlighted]

**To test the connection manually:**

1. Open your browser and go to: `http://127.0.0.1:8000/docs`
2. You should see the **FastAPI Swagger UI** with your two endpoints: `/analyze-media` and `/verify-claim`.
3. If this page loads, your backend is 100% ready to talk to your frontend.

---

### 4. Common "Startup" Errors

| **Error** | **Solution** |
| --- | --- |
| **Address already in use** | Another app is on port 8000. Use `uvicorn main:app --port 8001` or close the other terminal. |
| **ModuleNotFoundError** | You are missing a library. Run `pip install [module_name]`. |
| **JSONDecodeError** | Usually means your `.env` file is missing a key or has a typo in the API token. |

### Final Project Setup

Now that the backend is running, go to your **Frontend Terminal** and run:

`Bash`

`npm run dev` 

# Readme

Markdown

# 🔍 VeriSight AI: Forensic Engine v2.0

VeriSight is a high-performance forensic analysis tool designed to detect deepfakes, synthetic media, and verify factual claims in real-time. By combining advanced computer vision models with LLM-powered fact-checking, VeriSight provides a comprehensive integrity score for digital content.

---

## 🚀 Key Features

- **Deepfake Detection:** Analyzes images and video frames for GAN and Diffusion-based artifacts.
- **Real-time Fact Checking:** Cross-references text claims against global databases using Tavily Search and Groq LLMs.
- **Integrity Scoring:** Provides a 0-100% authenticity confidence level for every scan.
- **Forensic Reporting:** Generates a brief summary explaining the "why" behind the verdict.
- **Unified Dashboard:** A modern React/Next.js interface for easy media uploads and investigations.

---

## 🛠 Tech Stack

| Component | Technology |
| --- | --- |
| **Frontend** | Next.js 14, Tailwind CSS, Lucide React |
| **Backend** | FastAPI (Python 3.10+) |
| **Vision Models** | Hugging Face (umm-maybe/AI-image-detector) |
| **LLM / Search** | Groq (Llama 3.3), Tavily Search API |
| **Deployment** | Vercel |
|  |  |

---

## ⚙️ Setup & Installation

### 1. Clone the Repository

```bash
git clone [<https://github.com/your-username/verisight-ai.git>](<https://github.com/your-username/verisight-ai.git>)
cd verisight-ai
2. Configure Environment Variables
Create a .env file in the root directory and add your API keys:

Code snippet

HF_TOKEN=your_huggingface_token
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
3. Backend Setup (FastAPI)
Bash

# Move to backend folder (if separate) or stay in root
python -m venv venv
source venv/bin/activate  # On Windows use: venv\\Scripts\\activate
pip install -r requirements.txt
python main.py
The API will be available at <http://127.0.0.1:8000>

4. Frontend Setup (Next.js)
Bash

npm install
npm run dev
The dashboard will be available at <http://localhost:3000>

📡 API Endpoints
POST /analyze-media
Upload an image or video to check for synthetic manipulation.

Input: Multipart Form Data (file)

Output: { "integrity_score": 85, "is_tampered": false, "report": "..." }

POST /verify-claim
Fact-check a text string against real-world news.

Input: JSON { "text": "Claim to verify" }

Output: { "verdict": "TRUE", "confidence": 92, "explanation": "..." }

📁 Repository Structure
Plaintext

verisight-ai/
├── api/                 # FastAPI Backend
│   ├── index.py         # Main entry point
│   └── requirements.txt  # Python dependencies
├── src/                 # Next.js Frontend
│   ├── components/      # UI Components (Upload, Results)
│   └── app/             # Main application pages
├── public/              # Static assets
├── vercel.json          # Deployment configuration
└── .env                 # API Keys (Excluded from Git)
🛡 License
Distributed under the MIT License. See LICENSE for more information.

🤝 Contact
Your Name - Prithvirajxshinde@gmail.com

Project Link: <https://github.com/your-username/verisight-ai>

---

### Tips for a better README:
* **Add Screenshots:** Once your UI is running, take a screenshot of the dashboard and add it to a `/public` folder. Then, use `![Dashboard](./public/screenshot.png)` in the README.
* **Live Demo:** If you deploy to Vercel, add a "Live Demo" link at the very top.
* **Badges:** You can add status badges from [Shields.io](<https://shields.io/>) (e.g., "Build: Passing", "License: MIT").

**Would you like me to help you write a more detailed "How it Works" section that explains the math behind the 0-100% integrity score?**
```
