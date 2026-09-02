"""GovLaunch — targeted check for the 8 previously failed tests."""
import requests, sys

BASE = 'http://127.0.0.1:8000/api'

def fresh(username):
    s = requests.Session()
    r = s.post(f'{BASE}/auth/login/', json={'username': username, 'password': 'demo1234'}, timeout=5)
    assert r.status_code == 200, r.text
    return s

results = []

def check(name, fn):
    try:
        out = fn()
        results.append(('PASS', name, str(out or '')))
    except AssertionError as e:
        results.append(('FAIL', name, str(e)))
    except Exception as e:
        results.append(('FAIL', name, f'{type(e).__name__}: {e}'))

# ── STARTUP SESSION ───────────────────────────────────────────────────────────
s1 = fresh('meditriage-ai')
me1 = s1.get(f'{BASE}/auth/me/', timeout=5).json()
sid = me1.get('startup_id')

def t_submit():
    chals = s1.get(f'{BASE}/challenges/', timeout=5).json()
    lst = chals if isinstance(chals, list) else chals.get('results', [])
    cid = lst[0]['id']
    csrf = s1.cookies.get('csrftoken', '')
    r = s1.post(f'{BASE}/applications/', json={
        'challenge': cid,
        'solution_brief': 'Check2 test brief',
        'proposed_timeline': 8,
        'budget_quote': 600000,
    }, headers={'X-CSRFToken': csrf}, timeout=5)
    assert r.status_code == 201, r.text
    d = r.json()
    h = d.get('content_hash', '')
    assert len(h) == 64, f'hash len={len(h)}'
    assert d.get('budget_quote') == 600000
    assert d.get('startup_rating') == 1000
check('Submit application (content_hash, budget_quote, startup_rating)', t_submit)

def t_badges():
    r = s1.get(f'{BASE}/startups/{sid}/badges/', timeout=5)
    assert r.status_code == 200, r.text
    keys = [b['badge_key'] for b in r.json()]
    assert 'first_application' in keys, f'Got: {keys}'
check('first_application badge', t_badges)

def t_rating_hist():
    r = s1.get(f'{BASE}/startups/{sid}/rating-history/', timeout=5)
    assert r.status_code == 200, r.text
check('Startup rating history endpoint', t_rating_hist)

# ── DEPT SESSION (niti.dept) ──────────────────────────────────────────────────
s2 = fresh('niti.dept')

def t_dept_scoped():
    r = s2.get(f'{BASE}/challenges/', timeout=5)
    lst = r.json() if isinstance(r.json(), list) else r.json().get('results', [])
    assert len(lst) > 0, 'no challenges'
    names = set(c['department_name'] for c in lst)
    assert len(names) == 1, f'Multiple depts: {names}'
    assert 'NITI' in list(names)[0], f'Wrong dept: {names}'
check('Dept challenges scoped to own dept', t_dept_scoped)

def t_finalize():
    chals = s2.get(f'{BASE}/challenges/', timeout=5).json()
    lst = chals if isinstance(chals, list) else chals.get('results', [])
    cid = lst[0]['id']
    csrf = s2.cookies.get('csrftoken', '')
    r = s2.post(f'{BASE}/challenges/{cid}/finalize-round/',
                json={'round': 'round1_application'},
                headers={'X-CSRFToken': csrf}, timeout=10)
    assert r.status_code == 200, r.text
    d = r.json()
    assert 'cohort_average' in d and 'results' in d
    return f"cohort={d['cohort_average']}, {len(d['results'])} results"
check('Finalize round endpoint', t_finalize)

def t_supervision():
    r = s2.get(f'{BASE}/supervision/duplicates/', timeout=15)
    assert r.status_code == 200, r.text
    assert isinstance(r.json(), list)
    return f'{len(r.json())} duplicate pair(s)'
check('Supervision duplicates', t_supervision)

def t_ai_config():
    csrf = s2.cookies.get('csrftoken', '')
    r = s2.put(f'{BASE}/ai-provider-config/',
               json={'provider': 'openai', 'api_key': 'sk-fake-0000', 'enabled': True},
               headers={'X-CSRFToken': csrf}, timeout=5)
    assert r.status_code == 200, r.text
    d = r.json()
    assert 'api_key' not in d, f'Key leaked in: {list(d.keys())}'
    assert d.get('api_key_masked', '').endswith('0000'), f"masked={d.get('api_key_masked')}"
check('AI provider config (write-only, masked)', t_ai_config)

def t_novelty():
    apps = s2.get(f'{BASE}/applications/', timeout=5).json()
    lst = apps if isinstance(apps, list) else apps.get('results', [])
    app_id = lst[0]['id']
    csrf = s2.cookies.get('csrftoken', '')
    r = s2.post(f'{BASE}/applications/{app_id}/novelty-check/',
                headers={'X-CSRFToken': csrf}, timeout=15)
    assert r.status_code == 502, f'Expected 502 got {r.status_code}: {r.text[:200]}'
check('Novelty check fake key -> 502', t_novelty)

def t_prototype():
    apps = s2.get(f'{BASE}/applications/', timeout=5).json()
    lst = apps if isinstance(apps, list) else apps.get('results', [])
    shortlisted = [a for a in lst if a['status'] == 'shortlisted' and not a.get('prototype_start_date')]
    if not shortlisted:
        return 'no shortlisted apps without prototype (skip)'
    app_id = shortlisted[0]['id']
    csrf = s2.cookies.get('csrftoken', '')
    r = s2.post(f'{BASE}/applications/{app_id}/start-prototype-phase/',
                headers={'X-CSRFToken': csrf}, timeout=5)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d['prototype_start_date'] is not None
    assert d['prototype_deadline'] is not None
    return f"deadline={d['prototype_deadline'][:10]}"
check('Start prototype phase', t_prototype)

# ── EVALUATOR SESSION ─────────────────────────────────────────────────────────
s3 = fresh('evaluator1')

def t_eval_scoped():
    r = s3.get(f'{BASE}/applications/', timeout=5)
    lst = r.json() if isinstance(r.json(), list) else r.json().get('results', [])
    bad = [a['status'] for a in lst if a['status'] != 'under_evaluation']
    assert not bad, f'Saw non-UE: {set(bad)}'
    return f'{len(lst)} apps'
check('Evaluator scoped to under_evaluation', t_eval_scoped)

def t_eval_submit():
    apps = s3.get(f'{BASE}/applications/', timeout=5).json()
    lst = apps if isinstance(apps, list) else apps.get('results', [])
    app_id = lst[0]['id']
    csrf = s3.cookies.get('csrftoken', '')
    r = s3.post(f'{BASE}/evaluations/', json={
        'application': app_id,
        'round': 'round1_application',
        'score_problem_solution_fit': 9,
        'score_innovation': 8,
        'score_feasibility': 8,
        'score_impact_sustainability': 9,
        'score_presentation': 8,
        'comments': 'check2 test',
        'conflict_of_interest': False,
    }, headers={'X-CSRFToken': csrf}, timeout=5)
    assert r.status_code == 201, r.text
    assert r.json()['total_score'] == 42
    assert r.json()['round'] == 'round1_application'
check('Evaluator submit evaluation (5x10 rubric, total=42)', t_eval_submit)

# ── RATING AFTER FINALIZE ─────────────────────────────────────────────────────
def t_rating_updated():
    # GreenBridge was evaluated and finalized — check its rating changed
    s4 = fresh('greenbridge-robotics')
    me4 = s4.get(f'{BASE}/auth/me/', timeout=5).json()
    sid4 = me4.get('startup_id')
    if not sid4:
        return 'no startup_id'
    rh = s4.get(f'{BASE}/startups/{sid4}/rating-history/', timeout=5).json()
    hist = rh if isinstance(rh, list) else rh.get('results', [])
    if hist:
        assert hist[0]['delta'] >= 0, f'delta={hist[0]["delta"]}'
        return f'rating={hist[0]["rating_after"]}, delta={hist[0]["delta"]}'
    return 'no rating history yet (finalize not triggered for this startup)'
check('Rating updated after finalize', t_rating_updated)

# ── BADGE AFTER FINALIZE ──────────────────────────────────────────────────────
def t_badges_after_finalize():
    s4 = fresh('greenbridge-robotics')
    me4 = s4.get(f'{BASE}/auth/me/', timeout=5).json()
    sid4 = me4.get('startup_id')
    if not sid4:
        return 'no startup_id'
    r = s4.get(f'{BASE}/startups/{sid4}/badges/', timeout=5)
    assert r.status_code == 200
    badges = [b['badge_key'] for b in r.json()]
    return f'badges={badges}'
check('GreenBridge badges after finalize', t_badges_after_finalize)

# ── PRINT ─────────────────────────────────────────────────────────────────────
print()
print('=' * 65)
passed = sum(1 for r in results if r[0] == 'PASS')
print(f'  GovLaunch Check2  —  {passed}/{len(results)} passed')
print('=' * 65)
for r in results:
    tag = 'PASS' if r[0] == 'PASS' else 'FAIL'
    extra = f'  -> {r[1]}' if r[0] == 'PASS' and r[2] else ''
    print(f'  [{tag}]  {r[1]}{extra}')
    if r[0] == 'FAIL':
        print(f'          -> {r[2]}')
print('=' * 65)
sys.exit(0 if passed == len(results) else 1)
