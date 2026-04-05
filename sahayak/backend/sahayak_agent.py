import json
import re
import requests
import datetime
import uuid
import os
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from databricks.vector_search.client import VectorSearchClient

# Import SQL Warehouse helper
from sql_warehouse import execute_query, execute_update, SQL_AVAILABLE

# ==========================================
# MLFLOW CONFIGURATION FOR SERVERLESS
# ==========================================
try:
    import mlflow
    # Set local tracking for serverless environments
    mlflow.set_tracking_uri("file:///tmp/mlflow")
    os.makedirs("/tmp/mlflow", exist_ok=True)
    MLFLOW_AVAILABLE = True
    print("✓ MLflow configured for serverless mode")
except Exception as e:
    MLFLOW_AVAILABLE = False
    print(f"⚠️ MLflow disabled: {e}")
    
    # Create dummy decorator if MLflow unavailable
    class DummyMLflow:
        @staticmethod
        def trace(name=None):
            def decorator(func):
                return func
            return decorator
        
        @staticmethod
        def start_run(*args, **kwargs):
            class DummyRun:
                def __enter__(self):
                    return self
                def __exit__(self, *args):
                    pass
            return DummyRun()
    
    mlflow = DummyMLflow()

print(f"✅ SQL Warehouse connection: {'AVAILABLE' if SQL_AVAILABLE else 'UNAVAILABLE (using mock data)'}")

# ==========================================
# 0. DEFINE THE GRAPH STATE
# ==========================================
class SahayakState(TypedDict):
    user_id: str
    role: str
    language: str
    user_input: str
    english_query: str
    messages: List[Any]
    context_data: Dict[str, Any]
    ui_directive: str
    genui_payload: Dict[str, Any]
    final_speech: str

# ==========================================
# 1. DEFINE THE TOOLS (NOW USING SQL WAREHOUSE)
# ==========================================

def tool_read_finance(user_id: str):
    """Fetches credit limit, used amount, and status from SQL Warehouse."""
    results = execute_query(f"SELECT * FROM workspace.financial.credit_lines WHERE user_id = '{user_id}'")
    
    if results and len(results) > 0:
        print(f"✅ Retrieved finance data from SQL Warehouse for user {user_id}")
        return results[0]
    
    # Fallback mock data if SQL unavailable
    print(f"⚠️ Using mock finance data for user {user_id}")
    return {
        "user_id": user_id,
        "account_balance": 12500, 
        "avg_monthly_income": 4500, 
        "total_limit": 50000, 
        "used_amount": 25000, 
        "status": "ACTIVE"
    }

def tool_read_transactions(user_id: str, limit: int = 10):
    """Fetches recent transaction history from SQL Warehouse."""
    results = execute_query(
        f"SELECT * FROM workspace.financial.unified_transactions "
        f"WHERE user_id = '{user_id}' "
        f"ORDER BY timestamp DESC LIMIT {limit}"
    )
    
    if results:
        print(f"✅ Retrieved {len(results)} transactions from SQL Warehouse for user {user_id}")
        return results
    
    # Fallback mock data
    print(f"⚠️ Using mock transaction data for user {user_id}")
    return [
        {"id": "tx1", "transaction_status": "SUCCESS", "amount": 2000, "timestamp": "2026-04-01"},
        {"id": "tx2", "transaction_status": "SUCCESS", "amount": 1500, "timestamp": "2026-03-28"}
    ]

def tool_read_assets(user_id: str):
    """Fetches verified land/livestock records from SQL Warehouse."""
    results = execute_query(f"SELECT * FROM workspace.financial.asset_registry WHERE user_id = '{user_id}'")
    
    if results:
        print(f"✅ Retrieved {len(results)} assets from SQL Warehouse for user {user_id}")
        return results
    
    print(f"⚠️ No assets found for user {user_id}")
    return []

def tool_read_insurance(user_id: str):
    """Checks insurance policies from SQL Warehouse."""
    results = execute_query(f"SELECT * FROM workspace.financial.insurance_registry WHERE user_id = '{user_id}'")
    
    if results:
        print(f"✅ Retrieved {len(results)} insurance policies from SQL Warehouse for user {user_id}")
        return results
    
    print(f"⚠️ No insurance policies found for user {user_id}")
    return []

def tool_update_credit(user_id: str, new_limit: float = None, status: str = None):
    """Updates account status or limit via SQL Warehouse."""
    success = False
    
    if new_limit:
        success = execute_update(
            f"UPDATE workspace.financial.credit_lines SET total_limit = {new_limit} WHERE user_id = '{user_id}'"
        )
    
    if status:
        success = execute_update(
            f"UPDATE workspace.financial.credit_lines SET status = '{status}' WHERE user_id = '{user_id}'"
        )
    
    if success:
        print(f"✅ Updated credit state for user {user_id}")
        return "SUCCESS: Credit state updated."
    else:
        print(f"⚠️ Credit update simulation (SQL unavailable)")
        return "SUCCESS: Credit state updated (mock)."

def tool_emergency_lock(user_id: str):
    """Immediate kill-switch for fraud prevention via SQL Warehouse."""
    success = execute_update(
        f"UPDATE workspace.financial.credit_lines SET status = 'FROZEN' WHERE user_id = '{user_id}'"
    )
    
    if success:
        print(f"🔒 Account frozen for user {user_id}")
    else:
        print(f"⚠️ Account freeze simulation (SQL unavailable)")
    
    return "SECURITY_ALERT: Account Frozen."

def tool_search_policies(query: str) -> str:
    """Vector Search for government schemes/subsidies."""
    try:
        vsc = VectorSearchClient(disable_notice=True)
        index = vsc.get_index(endpoint_name="sahayak_vs_endpoint", index_name="workspace.financial.policy_corpus_index")
        results = index.similarity_search(query_text=query, columns=["text"], num_results=2)
        docs = [doc[0] for doc in results.get("result", {}).get("data_array", [])]
        return " | ".join(docs) if docs else "No specific policies found."
    except Exception as e:
        print(f"⚠️ Vector search failed: {e}")
        return "PM Vishwakarma: Collateral-free loans up to 3 lakh. MUDRA: 50k for small shops."

def tool_log_behavior(user_id: str, category: str, insight: str):
    """Saves user persona/goals to Behavioral Vault via SQL Warehouse."""
    insight_id = str(uuid.uuid4())[:8]
    success = execute_update(
        f"INSERT INTO workspace.financial.user_behavioral_insights "
        f"VALUES ('{insight_id}', '{user_id}', '{category}', '{insight}', 100, True, current_timestamp(), 'active')"
    )
    
    if success:
        print(f"✅ Logged behavior for user {user_id}")
        return "Memory Updated."
    else:
        print(f"⚠️ Behavior log simulation (SQL unavailable)")
        return "Memory Updated (mock)."

# ==========================================
# 2. CONFIGURATION
# ==========================================

# Configuration for Sarvam AI
SARVAM_API_KEY = "sk_t2c100b6_kM3Cedw3NYEXaHKKTLI7PoYt"
SARVAM_BASE_URL = "https://api.sarvam.ai/v1"
SARVAM_TRANSLATE_URL = "https://api.sarvam.ai/translate"

# Headers required for all Sarvam API calls
headers = {
    "api-subscription-key": SARVAM_API_KEY,
    "Content-Type": "application/json"
}

def sahayak_json_serializer(obj):
    """JSON serializer for objects not serializable by default (dates/timestamps)"""
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    return str(obj)

# ==========================================
# 3. DEFINE THE LANGGRAPH NODES
# ==========================================

def inbound_node(state: SahayakState):
    """Native -> English via Sarvam API."""
    if state['language'] == "en-IN" or state['language'].lower() == "english":
        print("⏩ Skipping Inbound: Already English")
        state['english_query'] = state['user_input']
        return state
    
    print(f"🌐 [Inbound] Translating {state['language']} -> English...")
    
    payload = {
        "input": state['user_input'],
        "source_language_code": state['language'],
        "target_language_code": "en-IN",
        "speaker_gender": "Male"
    }
    
    try:
        res = requests.post(SARVAM_TRANSLATE_URL, json=payload, headers={"api-subscription-key": SARVAM_API_KEY}, timeout=10)
        print(f"🔍 [DEBUG] Inbound translation status: {res.status_code}")
        if res.status_code == 200:
            state['english_query'] = res.json().get("translated_text", state['user_input'])
            print(f"✅ Success: {state['english_query']}")
        else:
            print(f"❌ Inbound Error {res.status_code}: {res.text}")
            state['english_query'] = state['user_input']
    except Exception as e:
        print(f"⚠️ Inbound Exception: {e}")
        import traceback
        traceback.print_exc()
        state['english_query'] = state['user_input']
    return state

def brain_node(state: SahayakState):
    user_id = state['user_id']
    print(f"🧠 [Brain] Analyzing financials for {user_id}...")
    
    # 1. ATOMIC DATA FETCHING
    try:
        finance_state = tool_read_finance(user_id)
        recent_tx = tool_read_transactions(user_id, limit=3)
        policy_matches = tool_search_policies(state['english_query']) 
        has_failed_tx = any(tx.get('transaction_status') == 'FAILED' for tx in recent_tx)
        print(f"✅ Data fetched successfully")
    except Exception as e:
        print(f"⚠️ Data fetching error: {e}")
        finance_state = {"account_balance": 12500, "avg_monthly_income": 4500}
        recent_tx = []
        policy_matches = "No policies available"
        has_failed_tx = False
    
    # 2. THE MASTER SYSTEM PROMPT
    system_prompt = f"""
    You are 'Sahayak', an advanced, proactive Rural Financial Concierge for BharatBricks.
    Your goal is to analyze user data, detect hidden patterns, and select the most helpful GenUI Widget.

    --- AVAILABLE DATA ---
    CURRENT_FINANCE: {json.dumps(finance_state, default=sahayak_json_serializer)}
    RECENT_TX: {json.dumps(recent_tx, default=sahayak_json_serializer)}
    SUBSIDY_RAG: {policy_matches}
    
    --- THE WIDGET CATALOG & PAYLOAD CONTRACTS ---
    You must choose ONE 'ui_directive' from the list below. 
    Your 'genui_payload' MUST exactly match the JSON keys specified for that widget.

    1. WIDGET_PROACTIVE_ALERT: {{"severity": "HIGH/CRITICAL", "pattern_detected": "...", "action_cta": "..."}}
    2. WIDGET_LOAN_SIMULATOR: {{"eligible_amount": 50000.0, "interest_rate": 7.5, "tenure_options_months": [3, 6, 12]}}
    3. WIDGET_TRUST_SCORECARD: {{"score": 85, "factors": ["...", "..."], "status": "Good"}}
    4. WIDGET_SCHEME_MATCH: {{"scheme_name": "...", "benefit_amount": "...", "eligibility_status": "..."}}
    5. WIDGET_INSURANCE_RENEW: {{"policy_type": "...", "expiry_date": "...", "renewal_premium": 500.0}}
    6. WIDGET_CROP_MARKET: {{"commodity": "...", "current_price": 2400.0, "trend": "UP/DOWN"}}
    7. WIDGET_EXPENSE_PIE: {{"categories": {{"Agri": 100.0, "Household": 50.0, "Debt": 20.0}}}}
    8. WIDGET_ATM_LOCATOR: {{"nearest_branches": [{{"name": "...", "distance_km": 2.5}}]}}
    9. WIDGET_DOC_STATUS: {{"application_id": "...", "current_stage": "...", "pending_action": "..."}}
    10. WIDGET_REPAY_TIMELINE: {{"total_due": 5000.0, "next_emi_date": "...", "emi_amount": 1000.0}}
    11. WIDGET_VILLAGE_LEADERBOARD: {{"group_name": "...", "total_savings": 45000.0, "group_rank": 2}}
    12. WIDGET_QR_RECEIVE: {{"merchant_name": "...", "upi_id": "..."}}
    13. WIDGET_SMART_INVEST: {{"surplus_amount": 5000.0, "suggestion": "...", "est_return": "..."}}

    --- RESPONSE PROTOCOL ---
    1. Start with a <think> block. Explain your logic based on the data provided. 
       If math or ratios are involved, calculate them step-by-step here.
    2. After </think>, return ONLY a strict JSON object. No markdown formatting.

    REQUIRED JSON FORMAT:
    {{
      "spoken_en": "Your empathetic response in English",
      "ui_directive": "CHOSEN_WIDGET_NAME",
      "genui_payload": {{ ...exact keys from the catalog above... }}
    }}
    """
    
    chat_payload = {
        "model": "sarvam-m", 
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": state['english_query']}
        ],
        "temperature": 0.1
    }
    
    raw_content = ""
    try:
        print("🔄 Calling Sarvam AI API...")
        print(f"📦 Request URL: {SARVAM_BASE_URL}/chat/completions")
        print(f"🔑 API Key (first 20 chars): {SARVAM_API_KEY[:20]}...")
        
        res = requests.post(
            f"{SARVAM_BASE_URL}/chat/completions", 
            json=chat_payload, 
            headers=headers,
            timeout=30
        )
        
        print(f"📡 API Response Status: {res.status_code}")
        print(f"📄 Response Headers: {dict(res.headers)}")
        
        if res.status_code != 200:
            error_text = res.text
            print(f"❌ API Error Response: {error_text}")
            raise Exception(f"API returned status {res.status_code}: {error_text[:200]}")

        res_json = res.json()
        print(f"✅ API Response received, parsing...")
        
        if not res_json.get('choices'):
            print(f"❌ No choices in response: {res_json}")
            raise Exception(f"No choices in API response: {res_json}")

        raw_content = res_json['choices'][0]['message']['content']
        print(f"✅ Received response from AI (length: {len(raw_content)} chars)")
        print(f"📄 First 200 chars: {raw_content[:200]}")
        
        # --- ROBUST EXTRACTION ---
        thinking_text = "No reasoning captured."
        clean_json_str = raw_content

        if "<think>" in raw_content:
            parts = raw_content.split("<think>", 1)[1].split("</think>", 1)
            thinking_text = parts[0].strip()
            if len(parts) > 1:
                clean_json_str = parts[1].strip()
            else:
                clean_json_str = ""
            print(f"✅ Extracted thinking block ({len(thinking_text)} chars)")

        for fluff in ["```json", "```", "'''json", "'''"]:
            clean_json_str = clean_json_str.replace(fluff, "")
        clean_json_str = clean_json_str.strip()

        print(f"🧹 Cleaned JSON string (first 200 chars): {clean_json_str[:200]}")
        
        # Parse JSON
        ai_response = json.loads(clean_json_str)
        print(f"✅ JSON parsed successfully")
        print(f"📦 AI Response keys: {list(ai_response.keys())}")
        
        state['context_data']['ai_reasoning'] = thinking_text 
        state['ui_directive'] = ai_response.get("ui_directive", "WIDGET_TRUST_SCORECARD")
        state['genui_payload'] = ai_response.get("genui_payload", {})
        state['messages'].append(ai_response.get("spoken_en", "Analysis complete."))
        
        print(f"✅ Brain node completed successfully")
        print(f"📱 UI Directive: {state['ui_directive']}")
        print(f"💬 Message: {state['messages'][-1][:100]}...")
        
    except requests.exceptions.Timeout:
        print(f"❌ REQUEST TIMEOUT - API took longer than 30 seconds")
        state['ui_directive'] = "WIDGET_TRUST_SCORECARD"
        state['genui_payload'] = {"score": 75, "factors": ["Timeout occurred"], "status": "Unknown"}
        state['messages'].append("I'm having trouble connecting to my AI service right now. Please try again in a moment.")
        state['context_data']['ai_reasoning'] = "Request timeout error"
        
    except requests.exceptions.ConnectionError as e:
        print(f"❌ CONNECTION ERROR - Cannot reach Sarvam AI API")
        print(f"Details: {e}")
        state['ui_directive'] = "WIDGET_TRUST_SCORECARD"
        state['genui_payload'] = {"score": 75, "factors": ["Connection error"], "status": "Unknown"}
        state['messages'].append("I cannot reach my AI service at the moment. Please check your internet connection and try again.")
        state['context_data']['ai_reasoning'] = f"Connection error: {str(e)[:100]}"
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON PARSE ERROR at position {e.pos}")
        print(f"Raw content was: {raw_content[:500]}")
        print(f"Cleaned JSON was: {clean_json_str[:500]}")
        state['ui_directive'] = "WIDGET_TRUST_SCORECARD"
        state['genui_payload'] = {"score": 75, "factors": ["Parse error"], "status": "Unknown"}
        state['messages'].append("I received a response but couldn't understand it. Let me try a simpler approach.")
        state['context_data']['ai_reasoning'] = f"JSON parse error: {str(e)}"
        
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR in brain_node")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"📄 Raw content snippet: {raw_content[:200] if raw_content else 'No content'}")
        import traceback
        traceback.print_exc()
        
        state['ui_directive'] = "WIDGET_TRUST_SCORECARD"
        state['genui_payload'] = {"score": 75, "factors": ["System error"], "status": "Unknown"}
        state['messages'].append(f"I encountered a technical issue. Please try rephrasing your question.")
        state['context_data']['ai_reasoning'] = f"Error: {type(e).__name__}: {str(e)[:100]}"
        
    return state

def outbound_node(state: SahayakState):
    """English -> Native via Sarvam API."""

    if state['language'] == "en-IN" or state['language'].lower() == "english":
        print("⏩ Skipping Outbound: Already English")
        state['final_speech'] = state['messages'][-1] if state.get('messages') else ""
        return state
    
    if not state.get('messages'): 
        state['final_speech'] = "No response available"
        return state
    
    eng_text = state['messages'][-1]
    print(f"🌐 [Outbound] Translating English -> {state['language']}...")
    print(f"📝 Text to translate: {eng_text[:100]}...")
    
    payload = {
        "input": eng_text,
        "source_language_code": "en-IN",
        "target_language_code": state['language'],
        "speaker_gender": "Female"
    }
    
    try:
        res = requests.post(SARVAM_TRANSLATE_URL, json=payload, headers={"api-subscription-key": SARVAM_API_KEY}, timeout=10)
        print(f"🔍 [DEBUG] Outbound translation status: {res.status_code}")
        if res.status_code == 200:
            state['final_speech'] = res.json().get("translated_text", eng_text)
            print(f"✅ Success: {state['final_speech'][:100]}...")
        else:
            print(f"❌ Outbound Error {res.status_code}: {res.text}")
            state['final_speech'] = eng_text
    except Exception as e:
        print(f"⚠️ Outbound Exception: {e}")
        import traceback
        traceback.print_exc()
        state['final_speech'] = eng_text
    return state

# ==========================================
# 4. BUILD THE GRAPH
# ==========================================
workflow = StateGraph(SahayakState)

workflow.add_node("inbound", inbound_node)
workflow.add_node("brain", brain_node)
workflow.add_node("outbound", outbound_node)

workflow.set_entry_point("inbound")
workflow.add_edge("inbound", "brain")
workflow.add_edge("brain", "outbound")
workflow.add_edge("outbound", END)

sahayak_app = workflow.compile()

# ==========================================
# 5. WRAPPER FOR FLASK SERVER.PY
# ==========================================
def run_autonomous_agent(user_text, user_id, language="hi-IN"):
    """Main entry point called by server.py"""
    print(f"\n{'='*60}")
    print(f"🚀 Sahayak Agent Starting")
    print(f"User: {user_id} | Input: {user_text} | Language: {language}")
    print(f"{'='*60}\n")
    
    initial_state = {
        "user_id": user_id,
        "user_input": user_text,
        "language": language,
        "role": "USER",
        "messages": [],
        "context_data": {}, 
        "final_speech": "",
        "ui_directive": "IDLE",
        "genui_payload": {}
    }

    try:
        # Try with MLflow if available
        if MLFLOW_AVAILABLE:
            try:
                with mlflow.start_run(run_name="Sahayak_Session"):
                    final_state = sahayak_app.invoke(initial_state)
            except Exception as mlflow_err:
                print(f"⚠️ MLflow error (continuing without): {mlflow_err}")
                final_state = sahayak_app.invoke(initial_state)
        else:
            final_state = sahayak_app.invoke(initial_state)
        
        result = {
            "spoken_response": final_state.get("final_speech", ""),
            "ui_directive": final_state.get("ui_directive", "IDLE"),
            "genui_data": final_state.get("genui_payload", {}),
            "ai_reasoning": final_state.get("context_data", {}).get("ai_reasoning", "")
        }
        
        print(f"\n✅ Agent completed successfully")
        print(f"💬 Response: {result['spoken_response'][:100]}...")
        print(f"📱 Directive: {result['ui_directive']}")
        print(f"{'='*60}\n")
        
        return result
        
    except Exception as e:
        print(f"❌ EXECUTION FAILED in run_autonomous_agent: {e}")
        import traceback
        traceback.print_exc()
        return {
            "spoken_response": "I'm sorry, I encountered a technical issue. Please try again.",
            "ui_directive": "IDLE",
            "genui_data": {},
            "ai_reasoning": f"Error: {str(e)}"
        }

# Optional: Keep the run_scenario function for notebook testing
def run_scenario(user_id, user_input, language="hi-IN", role="USER"):
    """Helper function for notebook/testing - calls run_autonomous_agent"""
    result = run_autonomous_agent(user_input, user_id, language)
    
    print(f"\n{'='*60}")
    print(f"🚀 SCENARIO RESULT for {user_id}")
    print(f"{'='*60}")
    print(f"\n🤔 AI THINKING:\n{result.get('ai_reasoning', 'N/A')}")
    print(f"\n🗣️ FINAL SPEECH ({language}):\n{result.get('spoken_response', 'N/A')}")
    print(f"\n📱 UI DIRECTIVE: {result.get('ui_directive', 'IDLE')}")
    print(f"\n📦 GEN-UI PAYLOAD:")
    print(json.dumps(result.get('genui_data', {}), indent=2))
    print(f"{'='*60}\n")
    
    return result
