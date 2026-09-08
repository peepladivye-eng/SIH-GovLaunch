// 22 officially recognised languages of India (Eighth Schedule of the Constitution)
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر' },
  { code: 'ko', name: 'Konkani', nativeName: 'कोंकणी' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্' },
  { code: 'bo', name: 'Bodo', nativeName: 'बड़ो' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
];

export const getLanguageName = (code) => {
  const lang = LANGUAGES.find(l => l.code === code);
  return lang ? lang.nativeName : code;
};
