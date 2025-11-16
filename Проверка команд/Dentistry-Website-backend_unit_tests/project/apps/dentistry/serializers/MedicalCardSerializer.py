from rest_framework import serializers
from ..models import MedicalCard


class MedicalCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalCard
        fields = "__all__"