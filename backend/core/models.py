from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    role = models.CharField(max_length=20, choices=[
        ('department', 'Department'), ('startup', 'Startup'),
        ('evaluator', 'Evaluator'), ('admin', 'Admin')
    ])

class Department(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    ministry = models.CharField(max_length=200)
    verified = models.BooleanField(default=True)
    def __str__(self): return self.name

class Startup(models.Model):
    REGISTRATION_CHOICES = [
        ('unregistered', 'Unregistered'),
        ('incorporated', 'Incorporated'),
        ('dpiit_recognized', 'DPIIT Recognized'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    dpiit_id = models.CharField(max_length=50, blank=True, default='')
    sector_tags = models.JSONField(default=list)
    team_size = models.IntegerField()
    pitch_summary = models.TextField()
    founded_year = models.IntegerField()
    registration_status = models.CharField(
        max_length=20, choices=REGISTRATION_CHOICES,
        default='unregistered'
    )
    def __str__(self): return self.name

class Challenge(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    background = models.TextField()
    outcome_metrics = models.TextField()
    constraints = models.TextField()
    budget_ceiling = models.IntegerField()
    timeline_weeks = models.IntegerField()
    eligibility_rules = models.JSONField(default=dict)
    sector_tags = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'), ('open', 'Open'), ('closed', 'Closed')
    ], default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.title

class Application(models.Model):
    startup = models.ForeignKey(Startup, on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    solution_brief = models.TextField()
    proposed_timeline = models.IntegerField(null=True, blank=True)
    budget_quote = models.BigIntegerField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=[
        ('submitted', 'Submitted'), ('screening', 'Screening'),
        ('eligible', 'Eligible'), ('ineligible', 'Ineligible'),
        ('under_evaluation', 'Under Evaluation'),
        ('shortlisted', 'Shortlisted'), ('rejected', 'Rejected'),
        ('contracted', 'Contracted')
    ], default='submitted')
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return f'{self.startup} -> {self.challenge}'

class EligibilityResult(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE)
    rule_name = models.CharField(max_length=100)
    passed = models.BooleanField()
    reason = models.TextField()

class Evaluation(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE)
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE)
    score_technical = models.IntegerField()
    score_novelty = models.IntegerField()
    score_team = models.IntegerField()
    score_pilot_readiness = models.IntegerField()
    score_cost = models.IntegerField()
    comments = models.TextField(blank=True, default='')
    conflict_of_interest = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

class Contract(models.Model):
    application = models.OneToOneField(Application, on_delete=models.CASCADE)
    ip_clause_text = models.TextField()
    data_clause_text = models.TextField()
    cybersecurity_checklist_text = models.TextField()
    milestones = models.JSONField(default=list)
    pdf_file = models.FileField(upload_to='contracts/', null=True, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)

class ScaleUpEntry(models.Model):
    original_challenge_title = models.CharField(max_length=200)
    originating_department_name = models.CharField(max_length=200)
    outcome_summary = models.TextField()
    adopting_departments = models.JSONField(default=list)


class AuditLog(models.Model):
    actor = models.CharField(max_length=200)
    action = models.CharField(max_length=200)
    target = models.CharField(max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['-timestamp']


# ── Supervision Layer ─────────────────────────────────────────────────────────

class AIProviderConfig(models.Model):
    PROVIDER_CHOICES = [
        ('openai', 'OpenAI'),
        ('anthropic', 'Anthropic'),
        ('gemini', 'Gemini'),
    ]
    department = models.OneToOneField(Department, on_delete=models.CASCADE,
                                      related_name='ai_config')
    provider   = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    api_key    = models.CharField(max_length=500)   # write-only, never serialised back
    enabled    = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.department} — {self.provider}'


class NoveltyCheck(models.Model):
    VERDICT_CHOICES = [
        ('likely_novel',    'Likely Novel'),
        ('similar_exists',  'Similar Solutions Exist'),
        ('not_assessed',    'Not Assessed'),
    ]
    application     = models.OneToOneField(Application, on_delete=models.CASCADE,
                                           related_name='novelty_check')
    verdict         = models.CharField(max_length=20, choices=VERDICT_CHOICES,
                                       default='not_assessed')
    similar_products = models.JSONField(default=list)
    explanation     = models.TextField(blank=True, default='')
    checked_at      = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'NoveltyCheck #{self.application_id} — {self.verdict}'
