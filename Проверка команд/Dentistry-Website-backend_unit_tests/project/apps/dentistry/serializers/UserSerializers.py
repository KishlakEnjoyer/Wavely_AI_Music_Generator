from rest_framework import serializers
from django.contrib.auth import authenticate
from ..models import CustomUser


class LoginSerializer(serializers.Serializer):
    user_email = serializers.EmailField(required=True)
    user_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        email = data.get('user_email')
        password = data.get('user_password')

        if not email or not password:
            raise serializers.ValidationError("Email и пароль обязательны.")

        user = authenticate(username=email, password=password)
        if not user:
            raise  serializers.ValidationError("Неверный email или пароль")

        print(user)
        data['user'] = user
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(required=True, write_only=True)

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'first_name', 'last_name', )

class RegisterLastStepSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('email', 'code', )



class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['user_id', 'first_name', 'last_name', 'username', 'email', 'user_date_birth', 'user_img', 'user_role']

class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'user_date_birth']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'user_date_birth': {'required': False}
        }
