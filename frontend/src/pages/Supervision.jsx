import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, ShieldCheck, Save, Cpu, AlertTriangle, CheckCircle, Key, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/toast';

const FIELD = {
  width: '100%', padding: '10px 14px', borderRadius: 10, height: 44,
  border: '1.5px solid #E2E8F0', background: '#F8FAFC',
  fontSize: 14, color: '#0B0F19', outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Inter',sans-serif", transition: 'border-color 0.15s, box-shadow 0.15s',
};

function Toggle({ checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ cursor: 'pointer', width: 44, height: 24, borderRadius: 100,
      background: checked ? 'linear-gradient(90deg,#0D9488,#0891B2)' : '#E2E8F0',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <motion.div animate={{ x: checked ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
    </div>
  );
}

const PROVIDER_INFO = {
  openai:    { name: 'OpenAI GPT-4o',              placeholder: 'sk-...',       color: '#10B981' },
  anthropic: { name: 'Anthropic Claude',            placeholder: 'sk-ant-...',   color: '#7C3AED' },
  gemini:    { name: 'Google Gemini',               placeholder: 'AIzaSy...',    color: '#F59E0B' },
};

export default function Supervision() {
  const { toast } = useToast();
  const [dupes, setDupes]       = useState([]);
  const [dupeLoading, setDL]    = useState(true);
  const [cfg, setCfg]           = useState(null);
  const [cfgLoading, setCL]     = useState(true);
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey]     = useState('');
  const [enabled, setEnabled]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [keyFocus, setKeyFocus] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getSupervisionDuplicates().then(d => setDupes(Array.isArray(d) ? d : [])).catch(() => setDupes([])).finally(() => setDL(false)),
      api.getAIProviderConfig().then(c => { if (c) { setCfg(c); setProvider(c.provider); setEnabled(c.enabled); } }).catch(() => {}).finally(() => setCL(false)),
    ]);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { provider, enabled };
      if (apiKey.trim()) payload.api_key = apiKey.trim();
      const saved = await api.saveAIProviderConfig(payload);
      setCfg(saved); setApiKey('');
      toast({ title: 'Configuration saved.' });
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const pInfo = PROVIDER_INFO[provider] ?? PROVIDER_INFO.openai;

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", maxWidth: 800 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 20, marginBottom: 32,
          background: 'linear-gradient(135deg, #0D1117 0%, #0A0E1A 55%, #0C1020 100%)',
          border: '1px solid rgba(255,255,255,0.08)', padding: '28px 32px',
        }}>
        <motion.div animate={{ x: [0,16,0], y: [0,-10,0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13,148,136,0.22) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(13,148,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(13,148,136,0.25)' }}>
            <ShieldCheck size={22} color="#2DD4BF" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>Supervision</h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>Detect duplicate submissions and configure AI-assisted novelty checks</p>
          </div>
        </div>
      </motion.div>

      {/* ── Flagged Duplicates ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <AlertTriangle size={18} color="#D97706" />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0B0F19', margin: 0 }}>Flagged Duplicates</h2>
          {!dupeLoading && (
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94A3B8', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 100, padding: '2px 10px' }}>
              {dupes.length} flagged
            </span>
          )}
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          {dupeLoading ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>Computing TF-IDF similarities…</div>
          ) : dupes.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <CheckCircle size={22} color="#10B981" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0B0F19', marginBottom: 4 }}>No duplicates detected</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>All submissions have unique solution briefs above the 75% similarity threshold.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Startup A', 'Startup B', 'Similarity', 'Earlier Submission'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dupes.map((row, i) => {
                    const pct = Math.round(row.similarity * 100);
                    const isHigh = row.similarity >= 0.9;
                    return (
                      <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#0B0F19' }}>{row.application_a.startup_name}</td>
                        <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#0B0F19' }}>{row.application_b.startup_name}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: isHigh ? '#FEE2E2' : '#FEF3C7', color: isHigh ? '#DC2626' : '#D97706' }}>
                            {pct}%
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#64748B' }}>
                            <Clock size={13} />
                            {row.earlier === 'application_a' ? row.application_a.startup_name : row.application_b.startup_name}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── AI Provider ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Cpu size={18} color="#4F46E5" />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0B0F19', margin: 0 }}>AI Provider</h2>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${pInfo.color}, ${pInfo.color}44)`, transition: 'background 0.3s' }} />
          <div style={{ padding: '24px' }}>
            {cfgLoading ? (
              <div style={{ color: '#94A3B8', fontSize: 14 }}>Loading configuration…</div>
            ) : (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Provider selector */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Provider</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {Object.entries(PROVIDER_INFO).map(([key, info]) => {
                      const active = provider === key;
                      return (
                        <motion.button key={key} type="button" onClick={() => setProvider(key)}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          style={{ flex: 1, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                            border: `2px solid ${active ? info.color : '#E2E8F0'}`,
                            background: active ? `${info.color}0e` : '#F8FAFC',
                            transition: 'all 0.15s' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: active ? info.color : '#374151' }}>{info.name}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Key size={13} /> API Key
                    </label>
                    {cfg?.api_key_masked && (
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8', background: '#F1F5F9', padding: '2px 8px', borderRadius: 4 }}>
                        Current: {cfg.api_key_masked}
                      </span>
                    )}
                  </div>
                  <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                    placeholder={cfg ? 'Leave blank to keep existing key' : pInfo.placeholder}
                    onFocus={() => setKeyFocus(true)} onBlur={() => setKeyFocus(false)}
                    style={{ ...FIELD, borderColor: keyFocus ? pInfo.color : '#E2E8F0', boxShadow: keyFocus ? `0 0 0 3px ${pInfo.color}18` : 'none' }} />
                </div>

                {/* Enabled toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0B0F19' }}>Enable AI Novelty Checks</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>When enabled, departments can run AI analysis on any application</div>
                  </div>
                  <Toggle checked={enabled} onChange={setEnabled} />
                </div>

                {/* Save */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <motion.button type="submit" disabled={saving}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 22px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                      background: saving ? '#94A3B8' : `linear-gradient(135deg, ${pInfo.color}, ${pInfo.color}cc)`,
                      color: '#fff', fontWeight: 700, fontSize: 14,
                      boxShadow: `0 4px 14px ${pInfo.color}35`,
                    }}>
                    <Save size={16} />
                    {saving ? 'Saving…' : cfg ? 'Update Configuration' : 'Save Configuration'}
                  </motion.button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
