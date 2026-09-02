from django.contrib import admin
from .models import User, Department, Startup, Challenge, Application, EligibilityResult, Evaluation, Contract, ScaleUpEntry, AuditLog

admin.site.register(User)
admin.site.register(Department)
admin.site.register(Startup)
admin.site.register(Challenge)
admin.site.register(Application)
admin.site.register(EligibilityResult)
admin.site.register(Evaluation)
admin.site.register(Contract)
admin.site.register(ScaleUpEntry)
admin.site.register(AuditLog)
