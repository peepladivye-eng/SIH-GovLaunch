#!/usr/bin/env python3
"""
Auto-translate all UI strings to 22 Indian languages using Google Translate.
Run: python translate_all.py
Output: translations_all_languages.json
"""

# Language codes for 22 constitutionally recognized Indian languages
LANGUAGES = {
    'en': 'English',
    'hi': 'Hindi',
    'bn': 'Bengali', 
    'te': 'Telugu',
    'mr': 'Marathi',
    'ta': 'Tamil',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'or': 'Odia',
    'pa': 'Punjabi',
    'as': 'Assamese',
    'ur': 'Urdu',
    'sa': 'Sanskrit',
    'sd': 'Sindhi',
    'ne': 'Nepali',
    'ks': 'Kashmiri',
    'kok': 'Konkani',  # Changed from 'ko' to 'kok' for Konkani
    'mai': 'Maithili',
    'mni': 'Manipuri',
    'brx': 'Bodo',  # Changed from 'bo' to 'brx' for Bodo
    'sat': 'Santali',
}

# Master English dictionary
EN_STRINGS = {
    # Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.challenges': 'Challenges',
    'nav.applications': 'Applications',
    'nav.evaluate': 'Evaluate',
    'nav.contracts': 'Contracts',
    'nav.scaleup': 'Scale-Up Catalog',
    'nav.supervision': 'Supervision',
    'nav.audit': 'Audit Trail',
    'nav.discover': 'Discover Challenges',
    'nav.myApplications': 'My Applications',
    'nav.logout': 'Logout',
    'nav.problemStatements': 'Problem Statements',
    'nav.howItWorks': 'How It Works',
    
    # Actions
    'action.submit': 'Submit',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.view': 'View',
    'action.back': 'Back',
    'action.next': 'Next',
    'action.login': 'Log In',
    'action.signup': 'Sign Up',
    'action.apply': 'Apply',
    'action.publish': 'Publish',
    'action.filter': 'Filter',
    'action.search': 'Search',
    
    # Landing page
    'landing.brand': 'GovLaunch',
    'landing.tagline': 'DIGITAL INDIA · STARTUP INDIA · 2026',
    'landing.hero.title1': 'Where Startups',
    'landing.hero.title2': 'Meet the State.',
    'landing.hero.subtitle': 'Government departments post real problems. Startups compete on merit — not paperwork. Every bid timestamped, every contract auto-drafted.',
    'landing.cta.browse': 'Browse Open Challenges',
    'landing.cta.govt': 'Government Department',
    'landing.cta.login': 'Log In',
    'landing.stats.open': 'Open',
    'landing.stats.challenges': 'Challenges',
    'landing.stats.startups': 'Startups',
    'landing.stats.pilots': 'Pilots Scaled',
    'landing.problems.title': 'Active Problem Statements',
    'landing.problems.empty': 'No open challenges at the moment',
    'landing.problems.new': 'NEW',
    'landing.problems.viewAll': 'View All Challenges',
    'landing.why.title': 'Why Participate?',
    'landing.why.startup1': 'Win Government Contracts',
    'landing.why.startup1.desc': 'Top solutions get the opportunity to work directly with government departments at scale.',
    'landing.why.startup2': 'Funding & Support',
    'landing.why.startup2.desc': 'Qualified finalists receive funding to build and test their prototypes in real environments.',
    'landing.why.startup3': 'Boost Your Rating',
    'landing.why.startup3.desc': 'Earn rating points with every evaluation, unlock higher-tier opportunities automatically.',
    'landing.why.startup4': 'Earn Recognition',
    'landing.why.startup4.desc': 'Collect achievement badges, build your trust profile, and showcase measurable impact.',
    'landing.trust.title': 'Built on Trust',
    'landing.trust.dpiit': 'DPIIT Verified Platform',
    'landing.trust.transparent': 'Transparent Evaluation',
    'landing.trust.equal': 'Equal Opportunity',
    'landing.trust.secure': 'Data Security',
    'landing.footer.govt': 'A Digital India Initiative',
    
    # Status
    'status.draft': 'Draft',
    'status.open': 'Open',
    'status.closed': 'Closed',
    'status.submitted': 'Submitted',
    'status.eligible': 'Eligible',
    'status.ineligible': 'Ineligible',
    'status.screening': 'Screening',
    'status.under_evaluation': 'Under Evaluation',
    'status.shortlisted': 'Shortlisted',
    'status.rejected': 'Rejected',
    'status.contracted': 'Contracted',
    
    # Labels
    'label.loading': 'Loading...',
    'label.budget': 'Budget',
    'label.timeline': 'Timeline',
    'label.department': 'Department',
    'label.startup': 'Startup',
    'label.challenge': 'Challenge',
    'label.application': 'Application',
    'label.weeks': 'weeks',
    'label.days': 'days',
    'label.new': 'New',
    'label.postedToday': 'Posted Today',
}

def translate_all():
    """Translate all strings to all languages using deep-translator."""
    try:
        from deep_translator import GoogleTranslator
    except ImportError:
        print("Installing deep-translator...")
        import subprocess, sys
        subprocess.check_call([sys.executable, "-m", "pip", "install", "deep-translator"])
        from deep_translator import GoogleTranslator
    
    import json
    
    all_translations = {'en': EN_STRINGS}
    
    for lang_code, lang_name in LANGUAGES.items():
        if lang_code == 'en':
            continue
        
        print(f"\nTranslating to {lang_name} ({lang_code})...")
        translated = {}
        
        for key, text in EN_STRINGS.items():
            try:
                # Skip brand name and technical terms
                if key in ['landing.brand', 'landing.tagline']:
                    translated[key] = text
                    continue
                
                result = GoogleTranslator(source='en', target=lang_code).translate(text)
                translated[key] = result
                print(f"  OK {key}")
            except Exception as e:
                print(f"  FAIL {key}: {e}")
                translated[key] = text  # Fallback to English
        
        all_translations[lang_code] = translated
    
    # Write to JSON
    output_file = '../frontend/src/lib/translations_all.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_translations, f, ensure_ascii=False, indent=2)
    
    print(f"\nTranslations saved to {output_file}")
    print(f"Total: {len(LANGUAGES)} languages x {len(EN_STRINGS)} strings = {len(LANGUAGES) * len(EN_STRINGS)} translations")

if __name__ == '__main__':
    translate_all()
