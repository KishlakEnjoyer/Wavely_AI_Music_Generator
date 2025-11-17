import uuid

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, AbstractUser
from django.conf import settings


class Profession(models.Model):
    profession_id = models.AutoField(primary_key=True)
    profession_title = models.CharField(max_length=100, blank=True, null=True)
    profession_time = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'profession'


class Workers(models.Model):
    workers_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True)
    workers_description = models.CharField(max_length=100, blank=True, null=True)
    workers_profession = models.ForeignKey(Profession, models.DO_NOTHING, blank=True, null=True)
    workers_experience = models.IntegerField(blank=True, null=True)
    workers_status = models.CharField(max_length=10, blank=True, null=True)
    workers_img = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'workers'


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('запланирован', 'запланирован'),
        ('отменен', 'отменен'),
        ('завершен', 'завершен'),
    ]

    appointment_id = models.AutoField(primary_key=True)
    appointment_workers = models.ForeignKey('Workers', models.DO_NOTHING, blank=True, null=True)
    appointment_user = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, blank=True, null=True)
    appointment_services = models.ForeignKey('Services', models.DO_NOTHING, blank=True, null=True)
    appointment_date = models.DateTimeField(blank=True, null=True)
    appointment_status = models.CharField(max_length=12, blank=True, choices=STATUS_CHOICES, default='запланирован')

    class Meta:
        managed = True
        db_table = 'appointment'


class Feedback(models.Model):
    feedback_id = models.AutoField(primary_key=True)
    feedback_user = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, blank=True, null=True)
    feedback_date = models.DateTimeField(blank=True, null=True)
    feedback_text = models.TextField(blank=True, null=True)
    feedback_rating = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'feedback'


class MedicalCard(models.Model):
    medical_card_id = models.AutoField(primary_key=True)
    medical_card_user = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, blank=True, null=True)
    medical_card_workers = models.ForeignKey('Workers', models.DO_NOTHING, blank=True, null=True)
    medical_card_services = models.ForeignKey('Services', models.DO_NOTHING, blank=True, null=True)
    medical_card_date = models.DateTimeField(blank=True, null=True)
    medical_card_status = models.CharField(max_length=12, blank=True, null=True)
    medical_card_diagnosis = models.CharField(max_length=75, blank=True, null=True)
    medical_card_purpose = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'medical_card'


class Services(models.Model):
    services_id = models.AutoField(primary_key=True)
    services_title = models.CharField(max_length=60, blank=True, null=True)
    services_description = models.TextField(blank=True, null=True)
    services_price = models.IntegerField(blank=True, null=True)
    services_img = models.TextField(blank=True, null=True)
    services_profession = models.ForeignKey(Profession, models.DO_NOTHING, blank=True, null=True)
    services_status = models.CharField(max_length=7, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'services'


class CustomUser(AbstractUser):
    user_id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=45, blank=True, unique=True)
    user_date_birth = models.DateField(blank=True, null=True)
    user_img = models.TextField(blank=True, null=True)
    user_role = models.CharField(default="пользователь", max_length=50)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        managed = True
        db_table = 'user'
