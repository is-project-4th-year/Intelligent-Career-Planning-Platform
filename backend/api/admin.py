from django.contrib import admin
from .models import ChatConversation, ChatMessage, User

admin.site.register(User)
admin.site.register(ChatConversation)
admin.site.register(ChatMessage)

