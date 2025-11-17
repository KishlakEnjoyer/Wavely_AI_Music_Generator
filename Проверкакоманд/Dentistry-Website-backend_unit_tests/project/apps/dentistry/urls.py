from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ServiceSet, FeedbackViewSet, ProfessionView, WorkersSet, MedicalCardSet, AppointmentSet

router = DefaultRouter()
router.register(prefix='user', viewset=UserViewSet, basename='user')
router.register(prefix='feedback', viewset=FeedbackViewSet, basename='feedback')
router.register(prefix='appointment', viewset=AppointmentSet, basename='appointment')
router.register(prefix='service', viewset=ServiceSet, basename='service')
router.register(prefix='workers', viewset=WorkersSet, basename='workers')
router.register(prefix='medical_card_set', viewset=MedicalCardSet, basename='medical_card_set')

urlpatterns = [
    path('', include(router.urls)),
    path('profession/', ProfessionView.as_view(), name='profession'),
    ]