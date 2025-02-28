from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class RegisterUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'phone', 'role']

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])  # Hash password
        return User.objects.create(**validated_data)

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['highschool', 'kensap_year', 'gpa', 'university', 'major', 'minor', 'graduation_year', 'company', 'city']
    
    def validate(self, data):
     user = self.instance  # The logged-in user

     if user.role == "KenSAP":
        # ❌ Previously, we blocked university updates. Now, we allow it.
        forbidden_fields = ['gpa', 'company']  # Removed 'university'
        for field in forbidden_fields:
            if field in data and data[field]:  # Block only non-empty values
                raise serializers.ValidationError(f"KenSAP students cannot update {field}.")

        # ✅ Ensure KenSAP students provide highschool and kensap_year
        if not data.get('highschool') or not data.get('kensap_year'):
            raise serializers.ValidationError("KenSAP students must provide a highschool and Kensap year.")

     if user.role == "Undergrad":
        if 'gpa' not in data or not data['gpa']:
            raise serializers.ValidationError("Undergraduates must have a GPA.")
        if 'university' not in data or not data['university']:
            raise serializers.ValidationError("Undergraduates must provide a university.")

     if user.role == "Alumni":
        if 'company' not in data or not data['company']:
            raise serializers.ValidationError("Alumni must have a company field.")

     return data

    
    def update(self, instance, validated_data):
        """
        After updating the profile, check if the user qualifies for a role transition.
        """
        instance = super().update(instance, validated_data)
        instance.update_role()  # Ensure role transition is checked
        return instance