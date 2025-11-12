# api/utils.py
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.utils.timezone import now
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

def generate_verification_token(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    user.email_verification_token = token
    user.email_verification_sent_at = now()
    user.save(update_fields=["email_verification_token", "email_verification_sent_at"])
    return uid, token

def send_verification_email(user, uid, token):
    verification_url = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"
    subject = "Verify Your Email – Kazìni"
    html_message = render_to_string("emails/verify_email.html", {"user": user, "verification_url": verification_url})
    plain_message = strip_tags(html_message)
    email = EmailMultiAlternatives(subject, plain_message, settings.EMAIL_HOST_USER, [user.email])
    email.attach_alternative(html_message, "text/html")
    email.send()
