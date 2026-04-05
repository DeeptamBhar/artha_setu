import os
import sys

# Ensure both the backend directory and its parent are in Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)

# Add both directories to path
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Import the LangGraph agent - now it should find it in current directory
from sahayak_agent import run_autonomous_agent
from form_agent import SmartFormSession

import certifi
os.environ['SSL_CERT_FILE'] = certifi.where()

app = Flask(__name__, static_folder="../dist", static_url_path="/")
CORS(app)

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(app.static_folder + "/" + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    audio_bytes = file.read()
    
    import asyncio
    import base64
    import ssl
    import subprocess
    import tempfile
    try:
        ssl._create_default_https_context = ssl._create_unverified_context
    except Exception:
        pass
    from sarvamai import AsyncSarvamAI

    async def get_transcription():
        webm_path = tempfile.mktemp(suffix=".webm")
        wav_path = tempfile.mktemp(suffix=".wav")
        
        with open(webm_path, 'wb') as f:
            f.write(audio_bytes)
            
        try:
            subprocess.run(["ffmpeg", "-y", "-i", webm_path, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav_path], check=True, capture_output=True)
            with open(wav_path, "rb") as f:
                final_wav_bytes = f.read()
        except Exception as ffmpeg_err:
            print(f"FFMPEG Error: {ffmpeg_err}")
            final_wav_bytes = audio_bytes
        finally:
            if os.path.exists(webm_path): os.remove(webm_path)
            if os.path.exists(wav_path): os.remove(wav_path)

        audio_data = base64.b64encode(final_wav_bytes).decode("utf-8")
        client = AsyncSarvamAI(api_subscription_key="sk_vtv3xlat_nXpG4ZEsnMX2xHp6vyamFSAv")
        async with client.speech_to_text_streaming.connect(
            model="saaras:v3",
            mode="transcribe",
            language_code="unknown",
            high_vad_sensitivity=True
        ) as ws:
            await ws.transcribe(audio=audio_data)
            response = await ws.recv()
            return response
    
    try:
        res = asyncio.run(get_transcription())
        
        transcript = ""
        if isinstance(res, dict):
            transcript = res.get("transcript", "") or res.get("text", "") or res.get("data", "")
        elif hasattr(res, "transcript"):
            transcript = res.transcript
        elif hasattr(res, "text"):
            transcript = res.text
        else:
            import json
            try:
                js = json.loads(res)
                transcript = js.get("transcript", "") or js.get("text", "") or js.get("data", "")
            except Exception:
                transcript = str(res)
                
        return jsonify({"transcript": transcript})
    except Exception as e:
        print(f"Transcription Error: {e}")
        return jsonify({"error": str(e), "transcript": ""}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    if not data:
        return jsonify({"error": "No input data provided"}), 400
        
    user_text = data.get('message', '')
    user_id = data.get('user_id', '101')
    language = data.get('language', 'english')
    
    print(f"\n--- NEW INBOUND REQUEST ---")
    print(f"Message: {user_text} | User: {user_id} | Lang: {language}")
    
    try:
        result = run_autonomous_agent(user_text, user_id, language)
        return jsonify(result)
    except Exception as e:
        print(f"Server Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "spoken_response": "Sahayak server encountered an internal error processing your request.",
            "ui_directive": "IDLE",
            "genui_data": {}
        }), 500

import traceback

SESSION_STORE = {}

@app.route('/api/form/init', methods=['POST'])
def form_init():
    try:
        user_id = request.form.get('user_id', '101')
        language = request.form.get('language', 'hi-IN')
        
        if 'file' not in request.files:
            return jsonify({"error": "No form image found"}), 400
            
        file_bytes = request.files['file'].read()
        
        session = SmartFormSession(user_id=user_id, target_language=language)
        SESSION_STORE[user_id] = session
        
        result = session.initialize_from_blank(file_bytes)
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/form/process', methods=['POST'])
def form_process():
    try:
        user_id = request.form.get('user_id', '101')
        text_input = request.form.get('text', None)
        
        if user_id not in SESSION_STORE:
            return jsonify({"error": "No active session map. Upload a blank form first!"}), 400
            
        session = SESSION_STORE[user_id]
        
        uploaded_image_bytes = None
        if 'file' in request.files:
            uploaded_image_bytes = request.files['file'].read()
            
        result = session.process_user_input(text_input, uploaded_image_bytes)
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    print(f"🚀 Starting Sahayak Backend Agent Server on port {port}")
    print(f"Python path: {sys.path}")
    print(f"Current directory: {os.getcwd()}")
    print(f"Script directory: {current_dir}")
    app.run(host='0.0.0.0', port=port, debug=False)
