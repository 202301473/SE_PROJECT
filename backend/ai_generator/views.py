from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from django.conf import settings
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from django.conf import settings
import json
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import cloudinary.uploader

import google.generativeai as genai # Import Gemini client


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def chat(request):
    """
    API endpoint for the conversational legal document generator.
    """
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == '':
        return Response({'error': 'GEMINI_API_KEY is not configured in your .env file or is empty.'}, status=500)

    genai.configure(api_key=settings.GEMINI_API_KEY)

    messages = request.data.get('messages', [])
    if not messages:
        return Response({'error': 'Messages are required'}, status=400)

    try:
        signature_file = request.FILES.get('signature')
        if signature_file:
            try:
                upload_result = cloudinary.uploader.upload(signature_file)
                signature_url = upload_result['secure_url']
                # Append a system message to the user's message
                messages[-1]['text'] += f"\n\n(System: The user has uploaded a signature. Please place it in the appropriate section of the document using the following markdown: ![Signature]({signature_url}))"
            except Exception as e:
                return Response({'error': f'Error uploading signature: {e}'}, status=500)

        system_instruction_text = """You are a helpful legal assistant. Your goal is to help the user create a legal document.
- First, ask follow-up questions to gather all the necessary details.
- When you have enough information, generate the full legal document.
- The document **must** be in well-structured **Markdown format**. Use headings (`#`, `##`), lists (`*`, `-`), bold (`**text**`), and italics (`*text`*) to create a professional and readable document.
- When you are ready to generate the document, provide it in a JSON format like this: ```json{"type": "document", "text": "...your Markdown document here..."}```.
- If the user asks to update some information, you must look for the previous document you generated in the conversation history. You will use that document as the basis for your new version.
- You must then regenerate the **entire** document, incorporating the user's requested changes, and provide it again in the same JSON format. Do not just provide the updated line or a confirmation message.
- **Signature Handling:** If the user uploads a signature, you will see a system message like `(System: The user has uploaded a signature...)` with a URL. When you generate the document, you **must** include this signature at the appropriate signature lines using the provided URL in the correct markdown format: `![Signature]({signature_url})`. **Do NOT acknowledge the system message about the signature upload in your conversational response.**
"""
        
        # Re-prepare messages for Gemini's `generate_content`
        gemini_conversation_history = []
        # Prepend system instruction to the first user message
        first_user_message_found = False
        for message in messages:
            if message['sender'] == 'user':
                if not first_user_message_found:
                    gemini_conversation_history.append({"role": "user", "parts": [{"text": system_instruction_text + "\n\n" + message['text']}]})
                    first_user_message_found = True
                else:
                    gemini_conversation_history.append({"role": "user", "parts": [{"text": message['text']}]})
            else:
                gemini_conversation_history.append({"role": "model", "parts": [{"text": message['text']}]})
        
        # Ensure the last message is from the user for the model to respond
        if not gemini_conversation_history or gemini_conversation_history[-1]['role'] == 'model':
            # This case should ideally not happen if the frontend sends a user message last
            # Or, if it does, it means the model is expected to continue a thought.
            # For now, we assume the last message is always a user message for a new turn.
            pass

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

        print(f"Raw model response object: {chat_completion}")
        print(f"Model response text: {response_text}")

        # The response from the model is just text, so we need to parse it to see
        # if it is a question or the final document.
        # For now, we will assume that if the response contains "```json", it is the final document in JSON format.
        # Otherwise, it is a question.
        if '```json' in response_text:
            # It's the final document
            # Extract the JSON part from the response
            json_str = response_text.split('```json')[1].split('```')[0]
            document_data = json.loads(json_str)
            return Response(document_data)
        else:
            # It's a question
            return Response({'type': 'question', 'text': response_text})

    except Exception as e:
        print(f"Error in chat view: {e}")
        print(f"Type of error: {type(e)}")
        return Response({'error': str(e)}, status=500)