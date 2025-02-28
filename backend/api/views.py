from rest_framework.generics import ListCreateAPIView, CreateAPIView, UpdateAPIView, RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .permissions import IsCareersTeam
from .models import University, User
from .serializers import UserSerializer, RegisterUserSerializer, ProfileUpdateSerializer
from django.http import JsonResponse
from django.views import View
from django.db.utils import IntegrityError
from django.core.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)

class HomeView(View):
    def get(self, request):
        return JsonResponse({"message": "Welcome to the KenSAP Careers API!"})

class RegisterUserView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterUserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                if serializer.validated_data.get("role") == "CareerMember":
                    return Response({"error": "CareerMembers cannot self-register."}, status=status.HTTP_400_BAD_REQUEST)
                
                user = serializer.save()
                return Response({"message": "User registered successfully", "user_id": user.user_id}, status=status.HTTP_201_CREATED)
            except IntegrityError:
                logger.error("IntegrityError: Email already exists.")
                return Response({"error": "Email already exists."}, status=status.HTTP_400_BAD_REQUEST)
            except ValidationError as e:
                logger.error(f"ValidationError: {e}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        logger.warning(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListCreateView(ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsCareersTeam]  # Restrict access to Careers Team only

class ProfileUpdateView(RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = ProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Ensures users can only update their own profile."""
        return self.request.user  

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        data = request.data.copy()  

        university_name = data.pop("university", "").strip()

        if university_name:
            # Check if the university exists; if not, create it
            university, created = University.objects.get_or_create(name__iexact=university_name)
            data["university"] = university.id  # Assign the university ID

        serializer = self.get_serializer(user, data=data, partial=True)
        if serializer.is_valid():
            self.perform_update(serializer)
            user.update_role()  # Ensure role transition is checked
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)