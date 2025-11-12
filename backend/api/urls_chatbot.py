# backend/api/urls_chatbot.py
from django.urls import path
from .views_chatbot import chat_with_ai, list_conversations, get_conversation_messages, message_feedback

urlpatterns = [
    path("chatbot/", chat_with_ai, name="chatbot"),
    path("chatbot/history/", list_conversations, name="chatbot-history"),
    path("chatbot/conversations/<int:conv_id>/messages/", get_conversation_messages, name="chatbot-messages"),
    path("chatbot/conversations/<int:conv_id>/messages/<int:message_id>/feedback/", message_feedback, name="chatbot-feedback"),
]
