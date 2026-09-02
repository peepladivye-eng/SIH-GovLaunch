"""
GovLaunch Badge Catalog & award helper.
9 triggered badges — do not add more.
"""
from .models import StartupBadge

BADGE_CATALOG = {
    "dpiit_verified":         {"label": "DPIIT Verified",           "icon": "ShieldCheck",    "desc": "DPIIT registration verified successfully"},
    "first_application":      {"label": "First Application",        "icon": "Rocket",          "desc": "Submitted your first application"},
    "round1_qualifier":       {"label": "Round 1 Qualifier",        "icon": "ClipboardCheck",  "desc": "Qualified for Round 2"},
    "high_performer":         {"label": "High Performer",           "icon": "TrendingUp",      "desc": "Scored 40+ in Round 1"},
    "prototype_builder":      {"label": "Prototype Builder",        "icon": "Wrench",          "desc": "Started building your prototype"},
    "round2_qualifier":       {"label": "Round 2 Qualifier",        "icon": "Award",           "desc": "Qualified for final evaluation"},
    "contract_winner":        {"label": "Contract Winner",          "icon": "Trophy",          "desc": "Secured the contract and made an impact"},
    "sustainability_champion":{"label": "Sustainability Champion",  "icon": "Leaf",            "desc": "Top scorer in Impact & Sustainability"},
    "innovation_excellence":  {"label": "Innovation Excellence",    "icon": "Lightbulb",       "desc": "Top scorer in Innovation & Uniqueness"},
}


def award_badge(startup, badge_key: str) -> bool:
    """
    Idempotent: creates the badge if it doesn't exist, ignores if it does.
    Returns True if newly created, False if already existed.
    """
    _, created = StartupBadge.objects.get_or_create(
        startup=startup, badge_key=badge_key
    )
    return created
