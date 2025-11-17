from rest_framework import serializers

from .UserSerializers import ProfileSerializer
from ..models import Workers


class WorkersSerializer(serializers.ModelSerializer):
    workers_name = serializers.CharField(source='user.first_name', read_only=True)
    workers_lastname = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = Workers
        fields = ['workers_id', 'workers_description', 'workers_experience', 'workers_status',
                  'workers_img', 'workers_name', 'workers_lastname', 'workers_profession', 'user_id']
