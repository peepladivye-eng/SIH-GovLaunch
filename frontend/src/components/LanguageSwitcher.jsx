import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGES } from '../lib/languages';

export default function LanguageSwitcher({ variant = 'sidebar' }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  if (variant === 'landing') {
    // Compact version for landing page header
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <motion.button
          onClick={() => setOpen(!open)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500,
          }}
        >
          <Globe size={14} />
          {currentLang.code.toUpperCase()}
        </motion.button>
        
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8,
                background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)', minWidth: 200,
                maxHeight: 320, overflowY: 'auto', zIndex: 1000,
              }}
            >
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setOpen(false); }}
                  style={{
                    width: '100%', padding: '10px 14px', border: 'none',
                    background: language === lang.code ? '#F8FAFC' : 'transparent',
                    textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontSize: 13, color: '#0B0F19', fontWeight: language === lang.code ? 600 : 400,
                    borderBottom: '1px solid #F1F5F9',
                  }}
                >
                  <span>{lang.nativeName}</span>
                  {language === lang.code && <Check size={14} color="#0D9488" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full version for sidebar
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ x: 3 }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 10, border: 'none',
          background: open ? '#F0F9FF' : 'transparent',
          color: open ? '#0369A1' : '#64748B', fontSize: 14, fontWeight: 500,
          cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
        }}
      >
        <Globe size={18} />
        <span style={{ flex: 1 }}>{currentLang.nativeName}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: 10 }}
        >
          ▼
        </motion.span>
      </motion.button>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 4,
              background: '#fff', borderRadius: 10, border: '1px solid #E2E8F0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxHeight: 280,
              overflowY: 'auto', zIndex: 100,
            }}
          >
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                style={{
                  width: '100%', padding: '9px 14px', border: 'none',
                  background: language === lang.code ? '#F0F9FF' : 'transparent',
                  textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: 13, color: language === lang.code ? '#0369A1' : '#475569',
                  fontWeight: language === lang.code ? 600 : 400,
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                <span>{lang.nativeName}</span>
                {language === lang.code && <Check size={13} color="#0D9488" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
