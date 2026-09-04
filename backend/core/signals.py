from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Application, Challenge, AuditLog, Startup


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


@receiver(post_save, sender=Startup)
def award_dpiit_verified_badge(sender, instance, **kwargs):
    """Award dpiit_verified badge whenever a startup is saved with dpiit_recognized status."""
    if instance.registration_status == "dpiit_recognized":
        from .badges import award_badge
        award_badge(instance, "dpiit_verified")
