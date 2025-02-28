from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User, University

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
    university = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.all(), required=False, allow_null=True
    )
    custom_university = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "highschool", "kensap_year", "gpa", "university", "custom_university",
            "major", "minor", "graduation_year", "company", "city"
        ]
    
    def validate(self, data):
        user = self.instance  # The logged-in user

        if user.role == "KenSAP":
            forbidden_fields = ['gpa', 'company']  # KenSAP students can't update these
            for field in forbidden_fields:
                if field in data and data[field]:
                    raise serializers.ValidationError(f"KenSAP students cannot update {field}.")
            
            # Ensure KenSAP students provide highschool and Kensap year
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
        Allows users to search for universities dynamically.
        If they enter a new university name, it's only added if no match is found.
        """
        custom_uni = validated_data.pop("custom_university", "").strip()

        if custom_uni:
            # Check if the university already exists
            university = University.objects.filter(name__iexact=custom_uni).first()
            if not university:
                university = University.objects.create(name=custom_uni)
            instance.university = university  # Assign the found or newly created university

        instance = super().update(instance, validated_data)
        instance.update_role()  # Ensure role transition is checked
        return instance