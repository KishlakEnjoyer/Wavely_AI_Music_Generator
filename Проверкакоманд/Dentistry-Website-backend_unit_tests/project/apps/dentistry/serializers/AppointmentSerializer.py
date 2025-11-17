from rest_framework import serializers
from ..models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"

class AppointmentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['appointment_status']

    def validate_appointment_status(self, value):
        # Объект, который сейчас в БД
        instance = self.instance

        old_status = instance.appointment_status
        new_status = value

        # Правило: отменить можно ТОЛЬКО если запись ещё "запланирована"
        if new_status == 'отменен' and old_status != 'запланирован':
            raise serializers.ValidationError(
                "Нельзя отменить запись, которая уже не находится в статусе 'запланирована'."
            )

        # Дополнительно: нельзя "разотменить" запись
        if old_status == 'отменен' and new_status != 'отменен':
            raise serializers.ValidationError(
                "Отменённую запись нельзя вернуть в другой статус."
            )

        return value
