from rest_framework import serializers
from .UserSerializers import ProfileSerializer
from ..models import Feedback

class LeaveFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['feedback_date', 'feedback_text', 'feedback_rating']

class GetFeedbackSerializer(serializers.ModelSerializer):
    feedback_user = ProfileSerializer(read_only=True)

    class Meta:
        model = Feedback
        fields = ["feedback_rating", "feedback_text", "feedback_date", "feedback_user"]