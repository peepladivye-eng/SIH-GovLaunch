"""
GovLaunch end-to-end engine check.
Run: python check_engine.py
"""
import requests, json, sys

BASE = 'http://127.0.0.1:8000/api'
s = requests.Session()

results = []

def check(name, fn):
    try:
        fn()
        results.append(('PASS', name, ''))
    except AssertionError as e:
        results.append(('FAIL', name, str(e)))
    except Exception as e:
        results.append(('FAIL', name, type(e).__name__ + ': ' + str(e)))


# ── 1. Health ────────────────────────────────────────────────────────────────
def t_health():
    r = s.get(f'{BASE}/health/')
    assert r.status_code == 200, r.text
    assert r.json()['status'] == 'ok'
check('GET /api/health/', t_health)

# ── 2. Public stats ──────────────────────────────────────────────────────────
def t_stats():
    r = s.get(f'{BASE}/stats/')
    assert r.status_code == 200, r.text
    d = r.json()
    assert 'open_challenges' in d and 'startups' in d and 'pilots_scaled' in d
    assert d['open_challenges'] >= 0 and d['startups'] >= 0
check('GET /api/stats/ (public, no auth)', t_stats)

# ── 3. Login — startup ───────────────────────────────────────────────────────
def t_login_startup():
    r = s.post(f'{BASE}/auth/login/', json={'username': 'meditriage-ai', 'password': 'demo1234'})
    assert r.status_code == 200, r.text
    assert r.json()['role'] == 'startup'
check('POST /api/auth/login/ (startup)', t_login_startup)

# ── 4. me ────────────────────────────────────────────────────────────────────
def t_me():
    r = s.get(f'{BASE}/auth/me/')
    assert r.status_code == 200, r.text
    d = r.json()
    assert d['role'] == 'startup'
    assert d.get('name') == 'MediTriage AI'
    assert 'sector_tags' in d
    assert 'registration_status' in d
check('GET /api/auth/me/ (startup fields)', t_me)

# ── 5. Challenges — startup sees open only ───────────────────────────────────
def t_challenges_startup():
    r = s.get(f'{BASE}/challenges/')
    assert r.status_code == 200, r.text
    lst = r.json() if isinstance(r.json(), list) else r.json().get('results', [])
    bad = [c['status'] for c in lst if c['status'] != 'open']
    assert not bad, f'Non-open challenges visible to startup: {bad}'
check('GET /api/challenges/ (startup sees open only)', t_challenges_startup)

# ── 6. Applications — startup scoped to own ─────────────────────────────────
def t_apps_startup():
    r = s.get(f'{BASE}/applications/')
    assert r.status_code == 200, r.text
    lst = r.json() if isinstance(r.json(), list) else r.json().get('results', [])
    names = set(a.get('startup_name') for a in lst)
    assert names <= {'MediTriage AI'}, f'Foreign apps leaked: {names}'
check('GET /api/applications/ (startup scoped)', t_apps_startup)

# ── 7. Submit application ────────────────────────────────────────────────────
def t_submit_app():
    csrf = s.cookies.get('csrftoken', '')
    # FIX 3: fetch real challenge id dynamically — autoincrement grows across reseeds
    open_chals = s.get(f'{BASE}/challenges/').json()
    open_chals = open_chals if isinstance(open_chals, list) else open_chals.get('results', [])
    assert len(open_chals) > 0, 'No open challenges visible to startup'
    real_challenge_id = open_chals[0]['id']
    r = s.post(f'{BASE}/applications/', json={
        'challenge': real_challenge_id,
        'solution_brief': 'Automated engine check test submission',
        'proposed_timeline': 8,
        'budget_quote': 500000,
    }, headers={'X-CSRFToken': csrf})
    assert r.status_code == 201, r.text
    d = r.json()
    assert d['startup_name'] == 'MediTriage AI'
    assert d['solution_brief'] == 'Automated engine check test submission'
    assert d['budget_quote'] == 500000
    assert d['proposed_timeline'] == 8
    assert d['status'] in ('eligible', 'ineligible', 'submitted')
check('POST /api/applications/ (fields + eligibility)', t_submit_app)

# ── 8. Eligibility results written ──────────────────────────────────────────
def t_eligibility():
    r = s.get(f'{BASE}/eligibility-results/')
    assert r.status_code == 200, r.text
    lst = r.json() if isinstance(r.json(), list) else r.json().get('results', [])
    assert len(lst) > 0, 'No eligibility results found'
check('GET /api/eligibility-results/ (auto-written on submit)', t_eligibility)

# ── Switch to department ─────────────────────────────────────────────────────
s.post(f'{BASE}/auth/logout/')

# ── 9. Login — department ────────────────────────────────────────────────────
def t_login_dept():
    # FIX 2: send X-CSRFToken on department login just like every other POST
    csrf = s.cookies.get('csrftoken', '')
    r = s.post(f'{BASE}/auth/login/', json={'username': 'health.dept', 'password': 'demo1234'},
               headers={'X-CSRFToken': csrf})
    assert r.status_code == 200, r.text
    assert r.json()['role'] == 'department'
check('POST /api/auth/login/ (department)', t_login_dept)

# ── 10. Department challenges scoped ────────────────────────────────────────
def t_challenges_dept():
    r = s.get(f'{BASE}/challenges/')
    assert r.status_code == 200, r.text
    lst = r.json() if isinstance(r.json(), list) else r.json().get('results', [])
    assert len(lst) > 0, 'Department sees 0 challenges'
    wrong = [c['department_name'] for c in lst if c['department_name'] != 'Ministry of Health & Family Welfare']
    assert not wrong, f'Wrong dept challenges: {wrong}'
    # application_count present
    assert all('application_count' in c for c in lst), 'application_count missing from challenge'
check('GET /api/challenges/ (dept scoped + application_count)', t_challenges_dept)

# ── 11. Department applications ──────────────────────────────────────────────
def t_apps_dept():
    r = s.get(f'{BASE}/applications/')
    assert r.status_code == 200, r.text
    lst = r.json() if isinstance(r.json(), list) else r.json().get('results', [])
    assert len(lst) > 0, 'Department sees 0 applications'
check('GET /api/applications/ (department scoped)', t_apps_dept)

# ── 12. Supervision duplicates ───────────────────────────────────────────────
def t_duplicates():
    r = s.get(f'{BASE}/supervision/duplicates/')
    assert r.status_code == 200, r.text
    d = r.json()
    assert isinstance(d, list), f'Expected list, got: {type(d)}'
    print(f'      → {len(d)} duplicate pair(s) found (threshold ≥0.75)')
check('GET /api/supervision/duplicates/ (TF-IDF cosine)', t_duplicates)

# ── 13. AI provider config GET (no config yet) ───────────────────────────────
def t_ai_config_get():
    r = s.get(f'{BASE}/ai-provider-config/')
    assert r.status_code == 200, r.text
check('GET /api/ai-provider-config/ (dept)', t_ai_config_get)

# ── 14. AI provider config PUT ───────────────────────────────────────────────
def t_ai_config_put():
    csrf = s.cookies.get('csrftoken', '')
    r = s.put(f'{BASE}/ai-provider-config/', json={
        'provider': 'openai', 'api_key': 'sk-fake-test-key-0000', 'enabled': True
    }, headers={'X-CSRFToken': csrf, 'Referer': 'http://localhost:5173'})
    assert r.status_code == 200, r.text
    d = r.json()
    # api_key must NOT be in response
    assert 'api_key' not in d, f'api_key leaked in response: {d}'
    # masked key must be present
    assert 'api_key_masked' in d, f'api_key_masked missing: {d}'
    assert d['api_key_masked'].endswith('0000'), f'Mask wrong: {d["api_key_masked"]}'
    assert d['provider'] == 'openai'
check('PUT /api/ai-provider-config/ (write-only key + masked)', t_ai_config_put)

# ── 15. Novelty check — fake key returns 502 ────────────────────────────────
def t_novelty_fake_key():
    lst = s.get(f'{BASE}/applications/').json()
    lst = lst if isinstance(lst, list) else lst.get('results', [])
    if not lst:
        raise AssertionError('No applications to test against')
    app_id = lst[0]['id']
    csrf = s.cookies.get('csrftoken', '')
    r = s.post(f'{BASE}/applications/{app_id}/novelty-check/',
               headers={'X-CSRFToken': csrf})
    assert r.status_code == 502, f'Expected 502 with fake key, got {r.status_code}: {r.text}'
    assert 'error' in r.json(), f'No error field: {r.json()}'
check('POST /api/applications/:id/novelty-check/ (fake key → 502)', t_novelty_fake_key)

# ── Switch to evaluator — fresh session to avoid cookie contamination ─────────
s.post(f'{BASE}/auth/logout/')
s_eval = requests.Session()
s_eval.post(f'{BASE}/auth/login/', json={'username': 'evaluator1', 'password': 'demo1234'})

# ── 16. Evaluator sees only under_evaluation ────────────────────────────────
def t_apps_evaluator():
    r = s_eval.get(f'{BASE}/applications/')
    assert r.status_code == 200, r.text
    lst = r.json() if isinstance(r.json(), list) else r.json().get('results', [])
    bad = [a['status'] for a in lst if a['status'] != 'under_evaluation']
    assert not bad, f'Evaluator sees non-under_evaluation apps: {set(bad)}'
check('GET /api/applications/ (evaluator filtered)', t_apps_evaluator)

# ── Print results ────────────────────────────────────────────────────────────
s.post(f'{BASE}/auth/logout/')

print()
print('=' * 62)
passed = sum(1 for r in results if r[0] == 'PASS')
total = len(results)
print(f'  GovLaunch Engine Check  —  {passed}/{total} passed')
print('=' * 62)
for r in results:
    icon = 'PASS' if r[0] == 'PASS' else 'FAIL'
    print(f'  [{icon}]  {r[1]}')
    if r[0] == 'FAIL':
        print(f'          {r[2]}')
print('=' * 62)
sys.exit(0 if passed == total else 1)
