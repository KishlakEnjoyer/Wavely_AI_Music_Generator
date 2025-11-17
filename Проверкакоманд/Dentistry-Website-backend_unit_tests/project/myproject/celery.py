import os
import django
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

app = Celery('myproject')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

@app.task
def cancel_expired_appointments():
    from django.utils import timezone
    from datetime import timedelta
    from apps.dentistry.models import Appointment

    cutoff_time = timezone.now() - timedelta(minutes=30)
    expired = Appointment.objects.filter(
        appointment_date__lt=cutoff_time,
        appointment_status='запланирован'
    )
    print(cutoff_time)
    count = expired.update(appointment_status='отменен')
    print(f"Отменено {count} записей.")