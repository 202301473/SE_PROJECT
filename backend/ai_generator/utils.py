import google.generativeai as genai
from django.conf import settings
import json

def get_gemini_response(user_message, document_context=""):
    """
    Generates an AI response using the Gemini API based on the user message and document context.
    Returns the raw text response from the AI.
    """
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == '':
        raise ValueError('GEMINI_API_KEY is not configured in your .env file or is empty.')

    genai.configure(api_key=settings.GEMINI_API_KEY)

    system_instruction_text = """You are a helpful legal assistant. Your goal is to help the user create a legal document.
- First, ask follow-up questions to gather all the necessary details.
- When you have enough information, generate the full legal document.
- The document **must** be in well-structured **Markdown format**. Use headings (`#`, `##`), lists (`*`, `-`), bold (`**text**`), and italics (`*text`*) to create a professional and readable document.
- When you are ready to generate the document, provide it in a JSON format like this: ```json{"type": "document", "text": "...your Markdown document here..."}```.
- If the user asks to update some information, you must look for the previous document you generated in the conversation history. You will use that document as the basis for your new version.
- You must then regenerate the **entire** document, incorporating the user's requested changes, and provide it again in the same JSON format. Do not just provide the updated line or a confirmation message.
- **Signature Handling:** If the user uploads a signature, you will see a system message like `(System: The user has uploaded a signature...)` with a URL. When you generate the document, you **must** include this signature at the appropriate signature lines using the provided URL in the correct markdown format: `![Signature]({signature_url})`. **Do NOT acknowledge the system message about the signature upload in your conversational response.**
"""
    
    # Construct the conversation history for Gemini
    # The initial prompt should include the system instruction and the document context if available
    full_user_message = user_message
    if document_context:
        full_user_message = f"Current document content:\n```markdown\n{document_context}\n```\n\nUser request: {user_message}"

    gemini_conversation_history = [
        {"role": "user", "parts": [{"text": system_instruction_text + "\n\n" + full_user_message}]}
    ]

    # Call Gemini API
    chat_completion = genai.GenerativeModel('models/gemini-flash-lite-latest').generate_content(
        gemini_conversation_history,
        generation_config=genai.GenerationConfig(
            temperature=0.7,
            max_output_tokens=2000,
        ),
        safety_settings=[
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]
    )
    
    response_text = chat_completion.candidates[0].content.parts[0].text
    return response_text