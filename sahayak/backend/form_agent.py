import os
import json
import requests
import io

# Try to import Gemini and PIL, but provide fallbacks
GEMINI_AVAILABLE = False
PIL_AVAILABLE = False

try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        vision_model = genai.GenerativeModel('gemini-2.5-flash')
        text_model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        GEMINI_AVAILABLE = True
        print("✓ Gemini API configured")
    else:
        print("⚠️ GEMINI_API_KEY not set - using mock mode")
except Exception as e:
    print(f"⚠️ Gemini API not available: {e} - using mock mode")

try:
    from PIL import Image
    from PIL import UnidentifiedImageError
    PIL_AVAILABLE = True
except ImportError:
    print("⚠️ PIL not available - image processing will use fallback")

SARVAM_API_KEY = "sk_t2c100b6_kM3Cedw3NYEXaHKKTLI7PoYt"

# ==========================================
# 🗄️ MOCK DATABRICKS DATA LAYER 
# ==========================================
def fetch_user_360(user_id):
    """Mocks pulling verified data from Databricks Gold/Silver tables."""
    print(f"🔍 Fetching Unified Ledger data for {user_id}...")
    
    return {
        "verified_profile": {
            "name": "Lakshmi",
            "age": 42,
            "occupation": "Farmer",
            "annual_income": "₹1,20,000",
            "village": "Rampur"
        },
        "verified_assets": [
            {"asset_type": "Agricultural Land", "asset_value": "₹4,50,000", "details": "2.5 Acres in Rampur"},
            {"asset_type": "Livestock", "asset_value": "₹30,000", "details": "4 Goats, 2 Cows"}
        ],
        "active_insurance": [
            {"policy_type": "Crop Insurance", "status": "Active", "coverage_amount": "₹50,000"}
        ]
    }

# ==========================================
# 🤖 MOCK FALLBACK FUNCTIONS
# ==========================================
def mock_extract_form_schema(image_bytes):
    """Fallback when Gemini is not available"""
    print("📋 Using mock form schema extraction")
    return {
        "applicant_name": None,
        "age": None,
        "occupation": None,
        "annual_income": None,
        "land_ownership": None,
        "bank_account": None,
        "aadhar_number": None,
        "purpose_of_loan": None
    }

def mock_autofill_form(empty_schema, user_context):
    """Fallback semantic mapping when Gemini is not available"""
    print("🧠 Using mock semantic auto-fill")
    filled = empty_schema.copy()
    
    # Simple mapping logic
    if "verified_profile" in user_context:
        profile = user_context["verified_profile"]
        if "applicant_name" in filled and filled["applicant_name"] is None:
            filled["applicant_name"] = profile.get("name")
        if "age" in filled and filled["age"] is None:
            filled["age"] = profile.get("age")
        if "occupation" in filled and filled["occupation"] is None:
            filled["occupation"] = profile.get("occupation")
        if "annual_income" in filled and filled["annual_income"] is None:
            filled["annual_income"] = profile.get("annual_income")
    
    if "verified_assets" in user_context and user_context["verified_assets"]:
        land_details = " | ".join([a["details"] for a in user_context["verified_assets"] if "Land" in a["asset_type"]])
        if "land_ownership" in filled and filled["land_ownership"] is None and land_details:
            filled["land_ownership"] = land_details
    
    return filled

def mock_extract_from_image(image_bytes, missing_fields):
    """Fallback when Gemini vision is not available"""
    print("📸 Using mock image extraction")
    # Return empty - user will need to type the data
    return {field: None for field in missing_fields}

def mock_extract_from_text(text, missing_fields):
    """Fallback when Gemini text processing is not available"""
    print("⌨️ Using mock text extraction")
    # Simple keyword extraction
    extracted = {}
    text_lower = text.lower()
    
    for field in missing_fields:
        # Try to extract simple patterns
        if "aadhar" in field.lower() or "aadhaar" in field.lower():
            # Look for 12-digit number
            import re
            match = re.search(r'\b\d{12}\b', text)
            if match:
                extracted[field] = match.group(0)
        elif "bank" in field.lower() and "account" in field.lower():
            # Look for bank account pattern
            import re
            match = re.search(r'\b\d{9,18}\b', text)
            if match:
                extracted[field] = match.group(0)
        elif field.lower() in text_lower:
            # Try to extract the value after the field name
            parts = text.split(":")
            if len(parts) > 1:
                extracted[field] = parts[1].strip()
    
    return extracted

# ==========================================
# 🤖 THE ITERATIVE FORM AGENT
# ==========================================
class SmartFormSession:
    def __init__(self, user_id, target_language="hi-IN"):
        self.user_id = user_id
        self.language = target_language
        self.form_state = {} 
    
    # ---------------------------------------------------------
    # STEP 1: INITIALIZE & SEMANTIC AUTO-FILL
    # ---------------------------------------------------------
    def initialize_from_blank(self, blank_form_image_bytes):
        print("🤖 [Vision] Extracting schema from blank form...")
        
        if PIL_AVAILABLE and GEMINI_AVAILABLE:
            try:
                image = Image.open(io.BytesIO(blank_form_image_bytes))
                schema_prompt = "Extract all empty fields required in this form into a JSON object. Use clear snake_case keys. Set all values to null."
                
                res = vision_model.generate_content([image, schema_prompt])
                clean_schema = res.text.replace("```json", "").replace("```", "").strip()
                empty_schema = json.loads(clean_schema)
            except Exception as e:
                print(f"Vision API error: {e} - using fallback")
                empty_schema = mock_extract_form_schema(blank_form_image_bytes)
        else:
            empty_schema = mock_extract_form_schema(blank_form_image_bytes)
        
        # Fetch Databricks Data
        user_context = fetch_user_360(self.user_id)
        
        print("🧠 [Logic] Semantically mapping ULI data to the form...")
        
        if GEMINI_AVAILABLE:
            try:
                mapping_prompt = f"""
                You are a data-entry assistant. 
                Here is a blank form schema: {empty_schema}
                Here is the user's verified database record: {json.dumps(user_context, default=str)}
                
                TASK: Fill in as many null values in the schema as possible using the database record. 
                - Make logical connections (e.g. use 'farm_size' for 'land_area' or 'property_details' for 'land').
                - If a field absolutely cannot be answered by the database record (like a specific signature or physical proof), leave it as null.
                - Return ONLY the updated JSON.
                """
                
                filled_res = text_model.generate_content(mapping_prompt)
                clean_filled = filled_res.text.replace("```json", "").replace("```", "").strip()
                self.form_state = json.loads(clean_filled)
            except Exception as e:
                print(f"Logic API error: {e} - using fallback")
                self.form_state = mock_autofill_form(empty_schema, user_context)
        else:
            self.form_state = mock_autofill_form(empty_schema, user_context)
                
        return self.check_status()

    # ---------------------------------------------------------
    # STEP 2: PROCESS USER INPUT (Images/Audio/Text)
    # ---------------------------------------------------------
    def process_user_input(self, text_input=None, uploaded_image_bytes=None):
        missing_keys = [k for k, v in self.form_state.items() if v is None]
        
        if uploaded_image_bytes and PIL_AVAILABLE and GEMINI_AVAILABLE:
            print("📸 [Vision] Scanning uploaded document...")
            try:
                image = Image.open(io.BytesIO(uploaded_image_bytes))
                prompt = f"Extract information to fill these specific missing fields: {missing_keys}. Return ONLY a JSON object with the keys and extracted values."
                res = vision_model.generate_content([image, prompt])
                clean_json = res.text.replace("```json", "").replace("```", "").strip()
                extracted = json.loads(clean_json)
                self._update_state(extracted)
            except Exception as e:
                print(f"Vision Extraction Error: {e} - using fallback")
                extracted = mock_extract_from_image(uploaded_image_bytes, missing_keys)
                self._update_state(extracted)
                
        elif text_input:
            print("⌨️ [Logic] Parsing user text/voice input...")
            
            if GEMINI_AVAILABLE:
                try:
                    prompt = f"The user said: '{text_input}'. Use this to fill these missing fields: {missing_keys}. Return ONLY a JSON object with the keys and extracted values."
                    res = text_model.generate_content(prompt)
                    clean_json = res.text.replace("```json", "").replace("```", "").strip()
                    extracted = json.loads(clean_json)
                    self._update_state(extracted)
                except Exception as e:
                    print(f"Text Extraction Error: {e} - using fallback")
                    extracted = mock_extract_from_text(text_input, missing_keys)
                    self._update_state(extracted)
            else:
                extracted = mock_extract_from_text(text_input, missing_keys)
                self._update_state(extracted)
                    
        return self.check_status()

    def _update_state(self, new_data):
        """Helper to merge new data without overwriting existing good data."""
        for k, v in new_data.items():
            if k in self.form_state and v is not None:
                self.form_state[k] = v

    # ---------------------------------------------------------
    # STEP 3: CHECK STATUS & TRANSLATE (Sarvam)
    # ---------------------------------------------------------
    def check_status(self):
        missing_keys = [k.replace('_', ' ').title() for k, v in self.form_state.items() if v is None]
        
        if not missing_keys:
            english_prompt = "Perfect! All fields are verified and filled. Your document is ready to submit."
            status = "COMPLETE"
        else:
            english_prompt = f"I've filled your bank and land records automatically. Please provide the following to finish: {', '.join(missing_keys)}. You can type it or upload a photo of the document."
            status = "INCOMPLETE"

        # Translate to Native Language
        localized_prompt = self._translate_to_native(english_prompt)

        return {
            "status": status,
            "current_data": self.form_state,
            "missing_fields": missing_keys,
            "ui_message": localized_prompt,
            "english_ui_message": english_prompt
        }

    def _translate_to_native(self, text):
        if self.language == "en-IN" or self.language.lower() == "english": 
            return text
            
        print(f"🌐 [Sarvam] Translating to {self.language}...")
        try:
            payload = {"input": text, "source_language_code": "en-IN", "target_language_code": self.language, "speaker_gender": "Female"}
            res = requests.post("https://api.sarvam.ai/translate", json=payload, headers={"api-subscription-key": SARVAM_API_KEY}, timeout=5)
            if res.status_code == 200:
                return res.json().get("translated_text", text)
        except Exception as e:
            print(f"Translation error: {e}")
        return text # Fallback to English
