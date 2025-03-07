import gradio as gr
import requests
import json
import azure.cognitiveservices.speech as speechsdk
import random

# ✅ Azure Credentials (Replace with actual credentials)
TRANSLATOR_KEY = "DEhHCE5cQjvgQKgGED6jnRXsHy35nitDr3s08vxI9vxFi2L4ZRKxJQQJ99BCAC8vTInXJ3w3AAAbACOGsQDG" 
TRANSLATOR_REGION = "westus3"
TRANSLATOR_ENDPOINT = "https://api.cognitive.microsofttranslator.com/translate"

SPEECH_KEY = "2zmUjopIuml8BZ90sJrwhAVBmOpigL90C6sxRuskiTiP7Ubb8BTXJQQJ99BCAC8vTInXJ3w3AAAYACOGL6Ku"
SPEECH_REGION = "westus3"
AUTH_URL = f"https://{SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issuetoken"

# ✅ Azure Cognitive Search Credentials
SEARCH_KEY = "SiLteRU8jfS8myu0Ru16ebxIrs5FQz1Yd3tH4Ds4frAzSeCSxKua"
SEARCH_ENDPOINT = "https://cogsearchdemo.search.windows.net"
SEARCH_INDEX = "realestate-us-sample-index"

# ✅ Define Available Languages
LANGUAGES = {
    "English": "en", "French": "fr", "Spanish": "es", "German": "de",
    "Chinese": "zh", "Japanese": "ja", "Hindi": "hi", "Arabic": "ar",
    "Portuguese": "pt", "Russian": "ru", "Korean": "ko", "Italian": "it"
}

# ✅ Function to Verify Index Exists
def verify_index():
    url = f"{SEARCH_ENDPOINT}/indexes?api-version=2023-07-01-Preview"
    headers = {"Content-Type": "application/json", "api-key": SEARCH_KEY}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        indexes = response.json().get("value", [])
        index_names = [idx["name"] for idx in indexes]
        return SEARCH_INDEX in index_names
    return False

# ✅ Function for Cognitive Speech
def speech_to_text():
    speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, region=SPEECH_REGION)
    speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config)
    print("Say something...")
    result = speech_recognizer.recognize_once()
    return result.text if result.reason == speechsdk.ResultReason.RecognizedSpeech else "Speech recognition failed."

# ✅ Function for Text Translation
def translate_text(text, target_language):
    headers = {"Ocp-Apim-Subscription-Key": TRANSLATOR_KEY, "Ocp-Apim-Subscription-Region": TRANSLATOR_REGION, "Content-Type": "application/json"}
    body = [{"text": text}]
    response = requests.post(f"{TRANSLATOR_ENDPOINT}?api-version=3.0&to={target_language}", headers=headers, json=body)
    return response.json()[0]['translations'][0]['text'] if response.status_code == 200 else "Translation Error."

# ✅ Function for Search
def search_cognitive_search(query):
    if not verify_index():
        return "❌ Search Error: Index not found. Verify your index name."
    url = f"{SEARCH_ENDPOINT}/indexes/{SEARCH_INDEX}/docs?api-version=2023-07-01-Preview&search={query}"
    headers = {"Content-Type": "application/json", "api-key": SEARCH_KEY}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        results = response.json()
        return "\n".join([f"🏠 **{doc.get('propertyName', 'Unknown Property')}** - {doc.get('description', 'No description available')} | Price: ${doc.get('price', 'N/A')}" for doc in results.get('value', [])]) or "🔍 No results found."
    return f"❌ Search Error: {response.status_code} - {response.text}"

# ✅ Gradio UI
def create_ui():
    with gr.Blocks(css="body { background-color: #F4F4F4; font-family: Arial, sans-serif; }") as demo:
        gr.HTML('<div class="marquee" style="white-space: nowrap; overflow: hidden; position: relative;"><marquee behavior="scroll" direction="left" style="color:red; font-size:28px; font-weight:bold;">Kyndryl Cloud Practice Automation Team</marquee></div>')
        gr.Markdown("# **Empowering Cognitive AI with Speech, Translation & Search**")
        with gr.Row():
            with gr.Column():
                gr.Markdown("### 🎤 Speech to Text")
                speech_button = gr.Button("Start Speech Recognition", variant="primary")
                speech_output = gr.Textbox(label="Recognized Speech", interactive=False)
                speech_button.click(fn=speech_to_text, inputs=[], outputs=[speech_output])
        with gr.Row():
            with gr.Column():
                gr.Markdown("### 🔠 Text Translation")
                text_input = gr.Textbox(label="Enter Text to Translate")
                language_dropdown = gr.Dropdown(choices=list(LANGUAGES.keys()), label="Select Language", value="English")
                translate_button = gr.Button("Translate", variant="primary")
                output_text = gr.Textbox(label="Translated Text", interactive=False)
                translate_button.click(fn=lambda text, lang: translate_text(text, LANGUAGES[lang]), inputs=[text_input, language_dropdown], outputs=[output_text])
        with gr.Row():
            with gr.Column():
                gr.Markdown("### 🔍 Search")
                search_input = gr.Textbox(label="Enter Property Name or Keyword", interactive=True)
                search_results = gr.Textbox(label="Search Results", interactive=False)
                search_input.input(fn=search_cognitive_search, inputs=[search_input], outputs=[search_results])
    return demo

# ✅ Launch the App
demo = create_ui()
demo.launch()
