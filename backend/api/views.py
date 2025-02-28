from rest_framework.generics import ListCreateAPIView, CreateAPIView, UpdateAPIView, RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .permissions import IsCareersTeam
from .models import User
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
        return self.request.user  # ✅ Restrict access to logged-in user

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)  # Update profile
        self.get_object().update_role()  # Trigger role update after profile update
        return response
        
        # Validation based on role
        # if user.role == "KenSAP":
        #     forbidden_fields = ["gpa", "university", "company"]
        #     required_fields = ["highschool", "kensap_year"]
        # elif user.role == "Undergrad":
        #     forbidden_fields = ["company"]
        #     required_fields = ["gpa", "university"]
        # elif user.role == "Alumni":
        #     forbidden_fields = ["gpa", "university"]
        #     required_fields = ["company"]
        # elif user.role == "CareerMember":
        #     forbidden_fields = []  # CareerMembers can update all fields if needed
        #     required_fields = []
        # else:
        #     forbidden_fields = []
        #     required_fields = []

        # # Check forbidden fields
        # for field in forbidden_fields:
        #     if field in data:
        #         return Response({"error": f"{user.role} students cannot update {field}."}, status=status.HTTP_400_BAD_REQUEST)

        # # Check required fields
        # for field in required_fields:
        #     if field not in data or not data[field]:
        #         return Response({"error": f"{field} is required for {user.role}."}, status=status.HTTP_400_BAD_REQUEST)

        # return super().update(request, *args, **kwargs)

# class ManualRoleUpdateView(UpdateAPIView):
#     queryset = User.objects.all()
#     serializer_class = RoleUpdateSerializer
#     permission_classes = [IsAuthenticated]

#     def perform_update(self, serializer):
#         user = self.get_object()
#         serializer.save()
#         user.transition_to(serializer.validated_data["role"])  # Manually trigger transition

