# backend/api/views_chatbot.py
from openai import OpenAI
import logging
from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from .models import ChatConversation, ChatMessage, Assessment
from .serializers import ChatConversationSerializer, ChatMessageSerializer

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=getattr(settings, "OPENAI_API_KEY", None))

# Simple per-user rate limiting (day-based) - optional
from django.core.cache import cache

def _increment_user_message_count(user_id):
    key = f"chat_count_user_{user_id}_{timezone.now().date()}"
    count = cache.get(key, 0) + 1
    cache.set(key, count, 24 * 3600)
    return count

def _user_message_count(user_id):
    key = f"chat_count_user_{user_id}_{timezone.now().date()}"
    return cache.get(key, 0)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat_with_ai(request):
    """
    POST /api/chatbot/ 
    body: { message: str, conversation_id?: int, max_tokens?: int }
    Returns: {reply, conversation_id}
    """
    user = request.user
    message = (request.data.get("message") or "").strip()
    conv_id = request.data.get("conversation_id")
    max_tokens = int(request.data.get("max_tokens", 512))

    if not message:
        return Response({"error": "No message provided"}, status=status.HTTP_400_BAD_REQUEST)

    # Basic rate limiting: e.g. 400 messages/day limit (adjust as needed)
    count = _user_message_count(user.user_id)
    if count >= 1000:  # <-- change limit as required
        return Response({"error": "Daily message limit reached."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

    # get or create conversation
    if conv_id:
        conv = ChatConversation.objects.filter(pk=conv_id, user=user).first()
    else:
        conv = None

    if not conv:
        conv = ChatConversation.objects.create(user=user, title=None)

    # Save user message
    user_msg = ChatMessage.objects.create(conversation=conv, sender="user", text=message)

    # Build prompt context using user's assessment (if any)
    context_pieces = []
    try:
        assessment = user.assessment
        context_pieces.append(f"Field={assessment.field}")
        context_pieces.append(f"GPA={assessment.gpa}")
        # include top skill scores (sample)
        context_pieces.append(f"Coding={assessment.coding_skills}/10")
        context_pieces.append(f"ProblemSolving={assessment.problem_solving_skills}/10")
        if assessment.recommended_career:
            context_pieces.append(f"RecommendedCareer={assessment.recommended_career}")
    except Assessment.DoesNotExist:
        assessment = None

    user_context = "; ".join(context_pieces) if context_pieces else "No assessment data"

    # System prompt — adjust to taste
    system_prompt = (
        "You are Kazini, an empathetic career mentor for university students. "
        "Provide concise, actionable advice and suggest next steps (skills to learn, courses, or internships) when relevant. "
        "If unsure, be honest and give safe resources. Keep answers friendly and short."
    )

    messages_for_model = [
        {"role": "system", "content": system_prompt},
        {"role": "system", "content": f"User context: {user_context}"},
        {"role": "user", "content": message},
    ]

    try:
        # Call OpenAI ChatCompletion
        # Use an appropriate model; change model name as you prefer / have access to.
        resp = client.chat.completions.create(
            model="gpt-4o-mini",  # change if needed
            messages=messages_for_model,
            max_tokens=max_tokens,
            temperature=0.2,
        )

        # Extract AI response text
        ai_text = ""
        # support streaming / multiple choices: take the first
        choice = resp.choices[0]
        if hasattr(choice, "message"):
            ai_text = choice.message.content or ""
        else:
            ai_text = choice.text or ""

        # Save AI message
        ai_msg = ChatMessage.objects.create(conversation=conv, sender="ai", text=ai_text)

        # Update conversation last_activity / title (if empty)
        if not conv.title:
            # derive a short title from first AI reply or user message
            conv.title = (ai_text[:120] + "...") if len(ai_text) > 120 else ai_text[:120]
        conv.last_activity = timezone.now()
        conv.save(update_fields=["title", "last_activity"])

        # increment counter
        _increment_user_message_count(user.id)

        return Response({
            "reply": ai_text,
            "conversation_id": conv.id,
            "message_id": ai_msg.id,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.exception("OpenAI call failed: %s", e)
        # Provide fallback responses based on user context
        fallback_responses = [
            "Based on your profile, I recommend exploring roles in software development and data analysis.",
            "To improve your career prospects, consider developing skills in project management and communication.",
            "Internships are a great way to gain experience! Look for opportunities in your field of study.",
            "Focus on building a strong portfolio and networking with professionals in your industry.",
            "Consider taking online courses to develop in-demand skills like programming or digital marketing.",
            "Research companies you're interested in and tailor your applications to their specific needs."
        ]
        
        # Use user context to provide more relevant fallback
        if "Computer Science" in user_context or "coding" in user_context.lower():
            fallback_text = "With a Computer Science background, I recommend exploring software engineering, data science, or cybersecurity roles. Consider building projects to showcase your skills!"
        elif "Business" in user_context:
            fallback_text = "For business students, I suggest looking into consulting, marketing, or finance roles. Internships and case study competitions can help build experience."
        else:
            fallback_text = fallback_responses[hash(message) % len(fallback_responses)]
        
        # Save AI fallback message
        ai_msg = ChatMessage.objects.create(conversation=conv, sender="ai", text=fallback_text)
        
        return Response({
            "reply": fallback_text,
            "conversation_id": conv.id,
            "message_id": ai_msg.id,
        }, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_conversations(request):
    """GET /api/chatbot/history/ — paginated list of user's conversations"""
    user = request.user
    qs = ChatConversation.objects.filter(user=user).order_by("-last_activity")
    paginator = PageNumberPagination()
    paginator.page_size = 20
    page = paginator.paginate_queryset(qs, request)
    serializer = ChatConversationSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_conversation_messages(request, conv_id):
    """GET /api/chatbot/conversations/<conv_id>/messages/"""
    user = request.user
    conv = ChatConversation.objects.filter(pk=conv_id, user=user).first()
    if not conv:
        return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)
    msgs = conv.messages.all().order_by("created_at")
    serializer = ChatMessageSerializer(msgs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def message_feedback(request, conv_id, message_id):
    """
    POST /api/chatbot/conversations/<conv_id>/messages/<message_id>/feedback/
    body: { feedback: 1 | 0 }
    """
    user = request.user
    conv = ChatConversation.objects.filter(pk=conv_id, user=user).first()
    if not conv:
        return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    msg = conv.messages.filter(pk=message_id).first()
    if not msg:
        return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)

    fb = request.data.get("feedback")
    try:
        fb_val = int(fb)
        if fb_val not in (0, 1):
            raise ValueError()
    except Exception:
        return Response({"error": "feedback must be 0 or 1"}, status=status.HTTP_400_BAD_REQUEST)

    msg.feedback = fb_val
    msg.save(update_fields=["feedback"])
    return Response({"message": "Feedback saved"}, status=status.HTTP_200_OK)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_conversation(request, conv_id):
    conv = ChatConversation.objects.filter(pk=conv_id, user=request.user).first()
    if not conv:
        return Response({"error":"Not found"}, status=404)
    conv.delete()
    return Response({"message":"deleted"}, status=200)

