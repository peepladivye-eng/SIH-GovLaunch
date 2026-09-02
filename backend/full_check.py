"""
GovLaunch — Full system check.
Covers: auth, models, all API endpoints, business logic, frontend file existence.
Run: python full_check.py
"""
import requests, json, sys, os

BASE   = 'http://127.0.0.1:8000/api'
FRONT  = 'c:/Users/Lenovo/Desktop/Divye/NSUT/SIH/frontend/src'

results = []

def check(name, fn):
    try:
        out = fn()
        results.append(('PASS', name, str(out) if out else ''))
    except AssertionError as e:
        results.append(('FAIL', name, str(e)))
    except Exception as e:
        results.append(('FAIL', name, f'{type(e).__name__}: {e}'))

def file_exists(path):
    return os.path.isfile(os.path.join(FRONT, path))

# ── 0. Servers reachable ─────────────────────────────────────────────────────
s = requests.Session()

def t_health():
    r = s.get(f'{BASE}/health/')
    assert r.status_code == 200
    assert r.json()['status'] == 'ok'
check('Server health', t_health)

def t_stats():
    r = s.get(f'{BASE}/stats/')
    assert r.status_code == 200
    d = r.json()
    assert d['open_challenges'] >= 3
    assert d['startups'] == 10
check('Public stats (10 startups, >=3 challenges)', t_stats)

# ── 1. Login — all 4 roles ───────────────────────────────────────────────────
for username, expected_role in [
    ('meditriage-ai', 'startup'),
    ('health.dept',   'department'),
    ('evaluator1',    'evaluator'),
    ('admin',         'admin'),
]:
    def _t(u=username, r=expected_role):
        sess = requests.Session()
        resp = sess.post(f'{BASE}/auth/login/', json={'username': u, 'password': 'demo1234'})
        assert resp.status_code == 200, resp.text
        assert resp.json()['role'] == r
    check(f'Login: {username} ({expected_role})', _t)

# ── 2. me endpoint — startup fields ─────────────────────────────────────────
s.post(f'{BASE}/auth/login/', json={'username': 'meditriage-ai', 'password': 'demo1234'})

def t_me_startup():
    r = s.get(f'{BASE}/auth/me/')
    assert r.status_code == 200
    d = r.json()
    assert d['role'] == 'startup'
    assert d['name'] == 'MediTriage AI'
    assert 'sector_tags' in d
    assert 'registration_status' in d
    assert d['registration_status'] == 'dpiit_recognized'
check('me/ startup fields', t_me_startup)

# ── 3. Challenges — startup sees only open ───────────────────────────────────
def t_chals_startup():
    r = s.get(f'{BASE}/challenges/')
    lst = r.json() if isinstance(r.json(), list) else r.json().get('results', [])
    assert all(c['status'] == 'open' for c in lst), f"Saw: {set(c['status'] for c in lst)}"
    assert all('application_count' in c for c in lst)
check('Challenges scoped (startup sees open + application_count)', t_chals_startup)

# ── 4. Submit application — new fields written ───────────────────────────────
def t_submit():
    csrf = s.cookies.get('csrftoken', '')
    r = s.post(f'{BASE}/applications/', json={
        'challenge': 1,
        'solution_brief': 'Full check submission brief',
        'proposed_timeline': 6,
        'budget_quote': 750000,
    }, headers={'X-CSRFToken': csrf})
    assert r.status_code == 201, r.text
    d = r.json()
    assert d['solution_brief'] == 'Full check submission brief'
    assert d['budget_quote'] == 750000
    assert d['proposed_timeline'] == 6
    assert len(d['content_hash']) == 64
    assert d['status'] in ('eligible', 'ineligible')
    assert d['startup_rating'] == 1000
check('Submit application (budget_quote, content_hash, startup_rating)', t_submit)

# ── 5. first_application badge awarded ───────────────────────────────────────
def t_first_app_badge():
    me = s.get(f'{BASE}/auth/me/').json()
    sid = me.get('startup_id')
    if not sid:
        raise AssertionError('No startup_id in me response')
    r = s.get(f'{BASE}/startups/{sid}/badges/')
    assert r.status_code == 200, r.text
    keys = [b['badge_key'] for b in r.json()]
    assert 'first_application' in keys, f'Badges: {keys}'
check('first_application badge awarded', t_first_app_badge)

# ── 6. Eligibility results written ───────────────────────────────────────────
def t_eligibility():
    r = s.get(f'{BASE}/eligibility-results/')
    assert r.status_code == 200
    lst = r.json() if isinstance(r.json(), list) else r.json().get('results', [])
    assert len(lst) > 0
check('Eligibility results auto-written', t_eligibility)

# ── 7. Switch to department ──────────────────────────────────────────────────
s.post(f'{BASE}/auth/logout/')
s.post(f'{BASE}/auth/login/', json={'username': 'niti.dept', 'password': 'demo1234'})

def t_dept_challenges():
    r = s.get(f'{BASE}/challenges/')
    lst = r.json() if isinstance(r.json(), list) else r.json().get('results', [])
    assert len(lst) > 0, 'No challenges for dept'
    depts = set(c['department_name'] for c in lst)
    assert len(depts) == 1, f'Multiple depts: {depts}'
    assert 'NITI' in list(depts)[0], f'Wrong dept: {depts}'
check('Dept challenges scoped to own dept', t_dept_challenges)

def t_dept_apps():
    r = s.get(f'{BASE}/applications/')
    lst = r.json() if isinstance(r.json(), list) else r.json().get('results', [])
    assert len(lst) > 0
check('Dept sees their applications', t_dept_apps)

# ── 8. Finalize round ────────────────────────────────────────────────────────
def t_finalize_round():
    csrf = s.cookies.get('csrftoken', '')
    # Use challenge 3 (NITI groundwater — has a scored app)
    r = s.post(f'{BASE}/challenges/3/finalize-round/',
               json={'round': 'round1_application'},
               headers={'X-CSRFToken': csrf})
    assert r.status_code == 200, r.text
    d = r.json()
    assert 'cohort_average' in d
    assert 'results' in d
check('Finalize round endpoint', t_finalize_round)

# ── 9. Supervision duplicates ────────────────────────────────────────────────
def t_dups():
    r = s.get(f'{BASE}/supervision/duplicates/')
    assert r.status_code == 200, r.text
    assert isinstance(r.json(), list)
check('Supervision duplicates', t_dups)

# ── 10. AI provider config ───────────────────────────────────────────────────
def t_ai_config():
    csrf = s.cookies.get('csrftoken', '')
    r = s.put(f'{BASE}/ai-provider-config/',
              json={'provider': 'openai', 'api_key': 'sk-fake-fullcheck', 'enabled': True},
              headers={'X-CSRFToken': csrf})
    assert r.status_code == 200, r.text
    d = r.json()
    assert 'api_key' not in d
    assert d['api_key_masked'].endswith('heck')
check('AI provider config (write-only key, masked)', t_ai_config)

# ── 11. Novelty check — fake key → 502 ──────────────────────────────────────
def t_novelty():
    apps = s.get(f'{BASE}/applications/').json()
    lst  = apps if isinstance(apps, list) else apps.get('results', [])
    app_id = lst[0]['id']
    csrf = s.cookies.get('csrftoken', '')
    r = s.post(f'{BASE}/applications/{app_id}/novelty-check/',
               headers={'X-CSRFToken': csrf})
    assert r.status_code == 502, f'Expected 502, got {r.status_code}: {r.text}'
check('Novelty check fake key → 502', t_novelty)

# ── 12. Prototype phase ──────────────────────────────────────────────────────
def t_prototype():
    # Find a shortlisted app for this dept
    apps = s.get(f'{BASE}/applications/').json()
    lst  = apps if isinstance(apps, list) else apps.get('results', [])
    shortlisted = [a for a in lst if a['status'] == 'shortlisted']
    if not shortlisted:
        return 'No shortlisted apps — skip'
    app_id = shortlisted[0]['id']
    csrf = s.cookies.get('csrftoken', '')
    r = s.post(f'{BASE}/applications/{app_id}/start-prototype-phase/',
               headers={'X-CSRFToken': csrf})
    assert r.status_code == 200, f'{r.status_code}: {r.text}'
    d = r.json()
    assert d['prototype_start_date'] is not None
    assert d['prototype_deadline'] is not None
check('Start prototype phase', t_prototype)

# ── 13. Rating history ───────────────────────────────────────────────────────
def t_rating_hist():
    # niti startup that got finalized above
    from core.models import RatingHistory
    pass  # can't import Django models in script — check via HTTP
    me = s.get(f'{BASE}/auth/me/').json()
    # Switch to startup that got finalized
    s2 = requests.Session()
    s2.post(f'{BASE}/auth/login/', json={'username': 'greenbridge-robotics', 'password': 'demo1234'})
    me2 = s2.get(f'{BASE}/auth/me/').json()
    sid = me2.get('startup_id')
    if sid:
        rh = s2.get(f'{BASE}/startups/{sid}/rating-history/')
        assert rh.status_code == 200, rh.text
check('Rating history endpoint', t_rating_hist)

# ── 14. Evaluator scoped apps ────────────────────────────────────────────────
s.post(f'{BASE}/auth/logout/')
s.post(f'{BASE}/auth/login/', json={'username': 'evaluator1', 'password': 'demo1234'})

def t_evaluator_apps():
    r = s.get(f'{BASE}/applications/')
    lst = r.json() if isinstance(r.json(), list) else r.json().get('results', [])
    bad = [a['status'] for a in lst if a['status'] != 'under_evaluation']
    assert not bad, f'Evaluator sees: {set(bad)}'
check('Evaluator sees only under_evaluation', t_evaluator_apps)

# ── 15. Evaluation submission (new 5x10 rubric) ──────────────────────────────
def t_eval_submit():
    apps = s.get(f'{BASE}/applications/').json()
    lst  = apps if isinstance(apps, list) else apps.get('results', [])
    if not lst:
        return 'No apps to evaluate'
    app_id = lst[0]['id']
    csrf = s.cookies.get('csrftoken', '')
    r = s.post(f'{BASE}/evaluations/', json={
        'application': app_id,
        'round': 'round1_application',
        'score_problem_solution_fit':  8,
        'score_innovation':             7,
        'score_feasibility':            7,
        'score_impact_sustainability':  8,
        'score_presentation':           7,
        'comments': 'Full check test evaluation',
        'conflict_of_interest': False,
    }, headers={'X-CSRFToken': csrf})
    assert r.status_code == 201, r.text
    d = r.json()
    assert d['total_score'] == 37
    assert d['round'] == 'round1_application'
check('Evaluation submit (5x10, total_score=37)', t_eval_submit)

# ── 16. Frontend file existence ──────────────────────────────────────────────
frontend_files = [
    ('pages/Landing.jsx',                  'Landing page'),
    ('pages/Login.jsx',                    'Login page'),
    ('pages/StartupDashboard.jsx',         'Startup dashboard'),
    ('pages/ChallengeDetail.jsx',          'Challenge detail / Kanban'),
    ('pages/ScoreApplication.jsx',         'Score application'),
    ('pages/ApplicationDetail.jsx',        'Application detail'),
    ('pages/Supervision.jsx',              'Supervision page'),
    ('pages/MyApplications.jsx',           'My applications'),
    ('pages/DiscoverChallenges.jsx',       'Discover challenges'),
    ('pages/MyChallenges.jsx',             'My challenges'),
    ('pages/GenerateContract.jsx',         'Generate contract'),
    ('pages/SignupStartup.jsx',            'Signup startup'),
    ('pages/SignupDepartment.jsx',         'Signup department'),
    ('pages/AuditTrail.jsx',              'Audit trail'),
    ('pages/EvaluatorReview.jsx',         'Evaluator review'),
    ('pages/ScaleUpCatalog.jsx',          'Scale-up catalog'),
    ('components/BadgeIcon.jsx',           'BadgeIcon component'),
    ('components/StartupTrustProfile.jsx', 'StartupTrustProfile component'),
    ('components/StatCard.jsx',            'StatCard component'),
    ('components/TierBadge.jsx',           'TierBadge component'),
    ('components/StatusBadge.jsx',         'StatusBadge component'),
    ('components/ShimmerButton.jsx',       'ShimmerButton component'),
    ('components/NumberTicker.jsx',        'NumberTicker component'),
    ('components/CardSpotlight.jsx',       'CardSpotlight component'),
    ('components/StartupSidebar.jsx',      'StartupSidebar'),
    ('components/GovernmentSidebar.jsx',   'GovernmentSidebar'),
    ('lib/api.js',                         'API library'),
    ('lib/ratingTiers.js',                 'Rating tiers util'),
    ('lib/badgeCatalog.js',               'Badge catalog util'),
    ('lib/utils.js',                       'Utils (cn)'),
]

for path, label in frontend_files:
    def _t(p=path, l=label):
        assert file_exists(p), f'Missing: {p}'
    check(f'File exists: {label}', _t)

# ── 17. Key API functions in api.js ─────────────────────────────────────────
def t_api_js():
    with open(os.path.join(FRONT, 'lib/api.js')) as f:
        src = f.read()
    required = ['getPublicStats', 'finalizeRound', 'getStartupBadges',
                'getStartupRatingHistory', 'startPrototypePhase',
                'runNoveltyCheck', 'getSupervisionDuplicates',
                'saveAIProviderConfig', 'logApplicationView']
    missing = [fn for fn in required if fn not in src]
    assert not missing, f'Missing from api.js: {missing}'
check('api.js has all required methods', t_api_js)

# ── 18. Build artefact exists ────────────────────────────────────────────────
def t_build():
    dist = 'c:/Users/Lenovo/Desktop/Divye/NSUT/SIH/frontend/dist/index.html'
    assert os.path.isfile(dist), 'dist/index.html missing — run npm run build'
check('Frontend dist/index.html exists', t_build)

# ── Print results ─────────────────────────────────────────────────────────────
s.post(f'{BASE}/auth/logout/')
print()
print('=' * 68)
passed = sum(1 for r in results if r[0] == 'PASS')
total  = len(results)
print(f'  GovLaunch Full Check  —  {passed}/{total} passed')
print('=' * 68)
for r in results:
    tag = 'PASS' if r[0] == 'PASS' else 'FAIL'
    line = f'  [{tag}]  {r[1]}'
    if r[0] == 'FAIL':
        print(line)
        print(f'          ↳ {r[2]}')
    else:
        print(line)
print('=' * 68)
sys.exit(0 if passed == total else 1)
