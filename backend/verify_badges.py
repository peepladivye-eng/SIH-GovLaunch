"""Quick verification: dpiit_verified badge was awarded to all dpiit_recognized startups."""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'govlaunch.settings')
django.setup()

from core.models import Startup, StartupBadge

print('=== dpiit_verified badge check ===')
all_ok = True
for s in Startup.objects.all().order_by('name'):
    has = StartupBadge.objects.filter(startup=s, badge_key='dpiit_verified').exists()
    expected = s.registration_status == 'dpiit_recognized'
    ok = has == expected
    if not ok:
        all_ok = False
    mark = 'OK  ' if ok else 'FAIL'
    print(f'  [{mark}]  {s.name:<30} status={s.registration_status:<18} badge={has}')

total_dpiit  = Startup.objects.filter(registration_status='dpiit_recognized').count()
total_badges = StartupBadge.objects.filter(badge_key='dpiit_verified').count()
print()
print(f'  dpiit_recognized startups : {total_dpiit}')
print(f'  dpiit_verified badges     : {total_badges}')
assert total_dpiit == total_badges, f'MISMATCH: {total_dpiit} startups vs {total_badges} badges'
print('  PASS — counts match exactly')
print()

# Also confirm GreenBridge + NeuroPath do NOT have the badge
for name in ['GreenBridge Robotics', 'NeuroPath Diagnostics']:
    try:
        s = Startup.objects.get(name=name)
        has = StartupBadge.objects.filter(startup=s, badge_key='dpiit_verified').exists()
        assert not has, f'{name} should NOT have dpiit_verified!'
        print(f'  [OK  ]  {name} correctly has NO dpiit_verified badge')
    except Startup.DoesNotExist:
        print(f'  [SKIP]  {name} not found in DB')
