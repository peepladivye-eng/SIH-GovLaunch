// Multilingual translations for GovLaunch (22 Indian languages)
// Currently fully translated: English, Hindi
// Others fall back to English (expand as needed)

import { useLanguage } from '../contexts/LanguageContext';

const en = {
  'nav.home': 'Home', 'nav.dashboard': 'Dashboard', 'nav.challenges': 'Challenges',
  'nav.applications': 'Applications', 'nav.evaluate': 'Evaluate', 'nav.contracts': 'Contracts',
  'nav.scaleup': 'Scale-Up Catalog', 'nav.supervision': 'Supervision', 'nav.audit': 'Audit Trail',
  'nav.discover': 'Discover Challenges', 'nav.myApplications': 'My Applications', 'nav.logout': 'Logout',
  'nav.problemStatements': 'Problem Statements', 'nav.howItWorks': 'How It Works',
  
  'action.submit': 'Submit', 'action.save': 'Save', 'action.cancel': 'Cancel',
  'action.edit': 'Edit', 'action.delete': 'Delete', 'action.view': 'View',
  'action.back': 'Back', 'action.next': 'Next', 'action.login': 'Log In',
  'action.signup': 'Sign Up', 'action.apply': 'Apply', 'action.publish': 'Publish',
  
  'landing.brand': 'GovLaunch', 'landing.tagline': 'DIGITAL INDIA · STARTUP INDIA · 2026',
  'landing.hero.title1': 'Where Startups', 'landing.hero.title2': 'Meet the State.',
  'landing.hero.subtitle': 'Government departments post real problems. Startups compete on merit — not paperwork. Every bid timestamped, every contract auto-drafted.',
  'landing.cta.browse': 'Browse Open Challenges', 'landing.cta.govt': 'Government Department',
  'landing.cta.login': 'Log In', 'landing.stats.open': 'Open', 'landing.stats.challenges': 'Challenges',
  'landing.stats.startups': 'Startups', 'landing.stats.pilots': 'Pilots Scaled',
  'landing.problems.title': 'Active Problem Statements', 'landing.problems.empty': 'No open challenges at the moment',
  'landing.problems.new': 'NEW', 'landing.problems.viewAll': 'View All Challenges',
  'landing.why.title': 'Why Participate?', 'landing.why.startup1': 'Win Government Contracts',
  'landing.why.startup1.desc': 'Top solutions get the opportunity to work directly with government departments at scale.',
  'landing.why.startup2': 'Funding & Support',
  'landing.why.startup2.desc': 'Qualified finalists receive funding to build and test their prototypes in real environments.',
  'landing.why.startup3': 'Boost Your Rating',
  'landing.why.startup3.desc': 'Earn rating points with every evaluation, unlock higher-tier opportunities automatically.',
  'landing.why.startup4': 'Earn Recognition',
  'landing.why.startup4.desc': 'Collect achievement badges, build your trust profile, and showcase measurable impact.',
  
  'status.open': 'Open', 'status.submitted': 'Submitted', 'status.eligible': 'Eligible',
  'status.shortlisted': 'Shortlisted', 'status.contracted': 'Contracted',
  'label.loading': 'Loading...', 'label.budget': 'Budget', 'label.timeline': 'Timeline',
};

const hi = {
  'nav.home': 'होम', 'nav.dashboard': 'डैशबोर्ड', 'nav.challenges': 'चुनौतियाँ',
  'nav.applications': 'आवेदन', 'nav.evaluate': 'मूल्यांकन करें', 'nav.contracts': 'अनुबंध',
  'nav.scaleup': 'स्केल-अप सूची', 'nav.supervision': 'निरीक्षण', 'nav.audit': 'ऑडिट ट्रेल',
  'nav.discover': 'चुनौतियाँ खोजें', 'nav.myApplications': 'मेरे आवेदन', 'nav.logout': 'लॉग आउट',
  'nav.problemStatements': 'समस्या विवरण', 'nav.howItWorks': 'यह कैसे काम करता है',
  
  'action.submit': 'जमा करें', 'action.save': 'सहेजें', 'action.cancel': 'रद्द करें',
  'action.edit': 'संपादित करें', 'action.delete': 'हटाएं', 'action.view': 'देखें',
  'action.back': 'वापस', 'action.next': 'आगे', 'action.login': 'लॉगिन',
  'action.signup': 'साइन अप', 'action.apply': 'आवेदन करें', 'action.publish': 'प्रकाशित करें',
  
  'landing.brand': 'गवलॉन्च', 'landing.tagline': 'डिजिटल इंडिया · स्टार्टअप इंडिया · 2026',
  'landing.hero.title1': 'जहाँ स्टार्टअप', 'landing.hero.title2': 'राज्य से मिलते हैं।',
  'landing.hero.subtitle': 'सरकारी विभाग वास्तविक समस्याएं पोस्ट करते हैं। स्टार्टअप योग्यता पर प्रतिस्पर्धा करते हैं — कागजी कार्रवाई पर नहीं। हर बोली टाइमस्टैम्प्ड, हर अनुबंध स्वतः तैयार।',
  'landing.cta.browse': 'खुली चुनौतियाँ ब्राउज़ करें', 'landing.cta.govt': 'सरकारी विभाग',
  'landing.cta.login': 'लॉगिन', 'landing.stats.open': 'खुली', 'landing.stats.challenges': 'चुनौतियाँ',
  'landing.stats.startups': 'स्टार्टअप', 'landing.stats.pilots': 'स्केल किए गए पायलट',
  'landing.problems.title': 'सक्रिय समस्या विवरण', 'landing.problems.empty': 'फिलहाल कोई खुली चुनौती नहीं',
  'landing.problems.new': 'नया', 'landing.problems.viewAll': 'सभी चुनौतियाँ देखें',
  'landing.why.title': 'क्यों भाग लें?', 'landing.why.startup1': 'सरकारी अनुबंध जीतें',
  'landing.why.startup1.desc': 'शीर्ष समाधानों को बड़े पैमाने पर सरकारी विभागों के साथ सीधे काम करने का अवसर मिलता है।',
  'landing.why.startup2': 'फंडिंग और सहायता',
  'landing.why.startup2.desc': 'योग्य फाइनलिस्ट को वास्तविक वातावरण में अपने प्रोटोटाइप बनाने और परीक्षण करने के लिए धन मिलता है।',
  'landing.why.startup3': 'अपनी रेटिंग बढ़ाएं',
  'landing.why.startup3.desc': 'हर मूल्यांकन के साथ रेटिंग अंक अर्जित करें, स्वचालित रूप से उच्च स्तरीय अवसर अनलॉक करें।',
  'landing.why.startup4': 'मान्यता प्राप्त करें',
  'landing.why.startup4.desc': 'उपलब्धि बैज एकत्र करें, अपनी विश्वास प्रोफ़ाइल बनाएं, और मापने योग्य प्रभाव प्रदर्शित करें।',
  
  'status.open': 'खुला', 'status.submitted': 'प्रस्तुत', 'status.eligible': 'पात्र',
  'status.shortlisted': 'शॉर्टलिस्ट', 'status.contracted': 'अनुबंधित',
  'label.loading': 'लोड हो रहा है...', 'label.budget': 'बजट', 'label.timeline': 'समयरेखा',
};

// Other 20 languages use English as fallback (add translations as needed)
export const translations = {
  en, hi,
  bn: en, te: en, mr: en, ta: en, gu: en, kn: en, ml: en, or: en,
  pa: en, as: en, ur: en, sa: en, sd: en, ne: en, ks: en, ko: en,
  mai: en, mni: en, bo: en, sat: en,
};

export function useTranslation() {
  const { language } = useLanguage();
  const t = (key) => translations[language]?.[key] || translations.en[key] || key;
  return { t, language };
}
