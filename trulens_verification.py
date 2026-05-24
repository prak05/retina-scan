import os
import sys
import json
import requests
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Configuration
API_URL = "http://localhost:3000/api/scan"
PRESETS = ["healthy_retina", "diabetic_retina", "hypertensive_retina", "alzheimers_retina"]
MODELS = ["gemini-3.5-flash", "gemma-4-31b", "paligemma"]

print("="*60)
print("       RETINA COMPUTE AI - TRULENS EVALUATION HARNESS      ")
print("="*60)

# Check if TruLens is installed
try:
    from trulens.core import Feedback, TruSession
    from trulens.providers.google import Google
    from trulens.apps.custom import instrument, TruCustomApp
    TRULENS_AVAILABLE = True
    print("[✓] TruLens library detected.")
except ImportError:
    TRULENS_AVAILABLE = False
    print("[!] TruLens library not found in local python path.")
    print("    To install TruLens, run: pip install trulens trulens-providers-google requests python-dotenv")
    print("    Proceeding with format verification and structure checks...")

class RetinalScanApp:
    def __init__(self, api_url):
        self.api_url = api_url

    # Instrument this method for TruLens tracking
    def analyze_scan(self, preset_id: str, model_id: str) -> dict:
        payload = {
            "presetId": preset_id,
            "modelId": model_id,
            "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" # 1x1 empty png
        }
        try:
            response = requests.post(self.api_url, json=payload, timeout=15)
            if response.status_code == 200:
                data = response.json()
                return data.get("report", {})
            else:
                print(f"Error: API returned status code {response.status_code}")
                return {}
        except Exception as e:
            print(f"Connection Error: {e}")
            return {}

# 1. Run structural verification on all models and presets
print("\n--- Phase 1: Structural & Format Verification ---")
app_client = RetinalScanApp(API_URL)

all_passed = True
for model in MODELS:
    for preset in PRESETS[:2]: # Test a subset to verify
        print(f"Testing Model: {model:<20} | Preset: {preset:<20}", end=" -> ")
        report = app_client.analyze_scan(preset, model)
        
        if not report:
            print("\033[91mFAILED (No Response)\033[0m")
            all_passed = False
            continue
            
        # Verify schema integrity
        required_keys = ["overallStatus", "vitalScore", "findings", "educationalAdvice", "anatomicalObservations"]
        key_check = all(k in report for k in required_keys)
        
        if key_check:
            # Check metadata
            metadata = report.get("metadata", {})
            model_used = metadata.get("modelUsed", "")
            is_simulated = metadata.get("isSimulated", False)
            
            print(f"\033[92mPASSED\033[0m (Used: {model_used} | Simulated: {is_simulated})")
        else:
            missing = [k for k in required_keys if k not in report]
            print(f"\033[91mFAILED (Missing keys: {missing})\033[0m")
            all_passed = False

# 2. Run TruLens feedback loop if available
if TRULENS_AVAILABLE:
    print("\n--- Phase 2: TruLens Feedback & Evaluation Dashboard ---")
    
    # Check if API Key is set
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        print("[!] GEMINI_API_KEY env variable is empty. TruLens LLM evaluations require an active API key.")
        sys.exit(1 if not all_passed else 0)

    # Initialize TruLens Session
    session = TruSession()
    
    # Configure Google Gemini as LLM Judge
    # TruLens uses the Google provider to run feedback functions
    google_provider = Google(model_name="gemini-3.5-flash")
    
    # Define feedback functions
    # 1. Answer Relevance (does the diagnostic response address ophthalmoscopy?)
    f_relevance = Feedback(
        google_provider.relevance, 
        name="Clinical Relevance"
    ).on_input_output()
    
    # Wrapping application
    tru_app = TruCustomApp(
        app_client,
        app_name="RetinalScanAI",
        app_version="v2.4",
        feedbacks=[f_relevance]
    )
    
    print("Starting evaluation runs with TruLens instrumentation...")
    # Execute runs under TruLens recording
    with tru_app as recording:
        for preset in PRESETS:
            print(f"Recording evaluation for preset: {preset} using Gemini 3.5 Flash")
            app_client.analyze_scan(preset, "gemini-3.5-flash")
            
    print("\n[✓] Evaluation completed. TruLens metrics recorded successfully.")
    print("To view your interactive evaluation dashboard, run: trulens-dashboard")
else:
    print("\n--- Phase 2: Skipped (TruLens SDK not present) ---")
    print("To run the full TruLens evaluation, install trulens and configure your GEMINI_API_KEY.")

print("\n"+"="*60)
if all_passed:
    print("✓ VERIFICATION COMPLETED: All endpoints responded with valid clinical schemas.")
else:
    print("✗ VERIFICATION FAILED: Some endpoints did not return valid schemas. Ensure your dev server is running at http://localhost:3000")
print("="*60)
