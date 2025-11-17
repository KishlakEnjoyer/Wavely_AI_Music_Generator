import pytest
import json
from django.core.cache import cache
from django.core import mail
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

CustomUser = get_user_model()

@pytest.mark.django_db
class TestAuthentication:
    
    def setup_method(self):
        self.client = APIClient()
        cache.clear()
        mail.outbox = []

    def test_login_success_with_correct_credentials(self):
        user = CustomUser.objects.create_user(
            email='testuser@example.com',
            password='testpassword123',
            username='testuser@example.com',
            first_name='Test',
            last_name='User'
        )

        response = self.client.post(
            '/user/login/',
            {
                'user_email': 'testuser@example.com',  
                'user_password': 'testpassword123'     
            },
            format='json'
        )

        print(f"Login response status: {response.status_code}")
        print(f"Login response data: {response.data}")
        
        assert response.status_code == status.HTTP_200_OK
        assert 'token' in response.data
        assert len(response.data['token']) > 0

    def test_login_failure_with_wrong_password(self):
        user = CustomUser.objects.create_user(
            email='testuser@example.com',
            password='correctpassword123',
            username='testuser@example.com'
        )

        response = self.client.post(
            '/user/login/',
            {
                'user_email': 'testuser@example.com',
                'user_password': 'wrongpassword123'
            },
            format='json'
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_success_with_correct_data(self):
        # ИСПРАВЛЕНО: добавляем поле username
        response_step1 = self.client.post(
            '/user/register_first_step/',
            {
                'email': 'newuser@example.com',
                'password': 'newpassword123',
                'first_name': 'John', 
                'last_name': 'Doe',
                'username': 'newuser@example.com'  
            },
            format='json'
        )

        print(f"Register step1 response status: {response_step1.status_code}")
        print(f"Register step1 response data: {response_step1.data}")
        
        assert response_step1.status_code == status.HTTP_200_OK
        
        cache_key = "register_newuser@example.com"
        cached_data = cache.get(cache_key)
        code = cached_data['code']

        response_step2 = self.client.post(
            '/user/register_last_step/',
            {
                'email': 'newuser@example.com',
                'code': code
            },
            format='json'
        )

        assert response_step2.status_code == status.HTTP_201_CREATED
        assert CustomUser.objects.filter(email='newuser@example.com').exists()

    def test_register_failure_with_wrong_code(self):
        cache_key = "register_test@example.com"
        cache.set(cache_key, {
            'register_data': {
                'email': 'test@example.com',
                'password': 'testpassword123',
                'first_name': 'Test',
                'last_name': 'User',
                'username': 'test@example.com'  
            },
            'code': '123456'
        }, timeout=600)

        response = self.client.post(
            '/user/register_last_step/',
            {
                'email': 'test@example.com',
                'code': '999999'
            },
            format='json'
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert not CustomUser.objects.filter(email='test@example.com').exists()