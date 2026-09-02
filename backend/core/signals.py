from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Application, Challenge, AuditLog


@receiver(pre_save, sender=Application)
def log_application_status_change(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = Application.objects.get(pk=instance.pk)
            if old.status != instance.status:
                AuditLog.objects.create(
                    actor="system",
                    action=f"Application status changed from {old.status} to {instance.status}",
                    target=f"Application #{instance.pk}: {instance.startup} -> {instance.challenge}"
                )
        except Application.DoesNotExist:
            pass


@receiver(pre_save, sender=Challenge)
def log_challenge_status_change(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = Challenge.objects.get(pk=instance.pk)
            if old.status != instance.status:
                AuditLog.objects.create(
                    actor="system",
                    action=f"Challenge status changed from {old.status} to {instance.status}",
                    target=f"Challenge #{instance.pk}: {instance.title}"
                )
        except Challenge.DoesNotExist:
            pass
