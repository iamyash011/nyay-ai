"""Users serializers and views — register + profile."""
from django.contrib.auth import get_user_model
from rest_framework import serializers, generics, permissions
from rest_framework.response import Response

User = get_user_model()


# ── Serializers ────────────────────────────────────────────────────────────────
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "phone", "preferred_language"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "phone",
            "preferred_language", "subscription_tier",
            "date_joined", "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login"]


# ── Views ──────────────────────────────────────────────────────────────────────
class RegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/ — Create a new user account."""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/auth/profile/ — Get or update authenticated user profile."""
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
