import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/toast';

// ── Similarity badge ─────────────────────────────────────────────────────────
function SimilarityBadge({ value }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.9
    ? { bg: '#FEE2E2', text: '#DC2626' }   // danger
    : { bg: '#FEF3C7', text: '#D97706' };  // warning
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {pct}%
    </span>
  );
}

// ── Switch (plain, no dep) ───────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        checked ? 'bg-[--gov-accent]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function Supervision() {
  const { toast } = useToast();

  // ── Duplicates ─────────────────────────────────────────────────────────────
  const [duplicates, setDuplicates]       = useState([]);
  const [dupeLoading, setDupeLoading]     = useState(true);

  // ── AI Provider Config ─────────────────────────────────────────────────────
  const [existingCfg, setExistingCfg]     = useState(null);   // null = not loaded yet
  const [provider, setProvider]           = useState('openai');
  const [apiKey, setApiKey]               = useState('');
  const [enabled, setEnabled]             = useState(true);
  const [cfgSaving, setCfgSaving]         = useState(false);
  const [cfgLoading, setCfgLoading]       = useState(true);

  useEffect(() => {
    // Fetch both in parallel
    Promise.all([
      api.getSupervisionDuplicates()
        .then(d => setDuplicates(Array.isArray(d) ? d : []))
        .catch(() => setDuplicates([]))
        .finally(() => setDupeLoading(false)),

      api.getAIProviderConfig()
        .then(cfg => {
          if (cfg) {
            setExistingCfg(cfg);
            setProvider(cfg.provider);
            setEnabled(cfg.enabled);
            // Don't prefill the key input — show masked placeholder instead
          }
        })
        .catch(() => {})
        .finally(() => setCfgLoading(false)),
    ]);
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setCfgSaving(true);
    try {
      const payload = { provider, enabled };
      // Only send api_key if user typed something new
      if (apiKey.trim()) payload.api_key = apiKey.trim();
      const saved = await api.saveAIProviderConfig(payload);
      setExistingCfg(saved);
      setApiKey('');
      toast({ title: 'Configuration saved.' });
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setCfgSaving(false);
    }
  };

  const providerPlaceholder = {
    openai:    'sk-...',
    anthropic: 'sk-ant-...',
    gemini:    'AIzaSy...',
  }[provider] ?? 'API key…';

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-space-grotesk font-bold text-[--text-primary] flex items-center gap-2">
          <ShieldCheck size={24} className="text-[--gov-accent]" />
          Supervision
        </h1>
        <p className="text-sm text-[--text-secondary] mt-1">
          Detect duplicate submissions and configure AI-assisted novelty checks.
        </p>
      </div>

      {/* ── Section 1: Flagged Duplicates ───────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[--text-primary]">Flagged Duplicates</h2>

        {dupeLoading ? (
          <p className="text-sm text-[--text-secondary]">Computing similarities…</p>
        ) : duplicates.length === 0 ? (
          <p className="text-sm text-gray-500">No flagged duplicates found.</p>
        ) : (
          <Card className="rounded-xl border-[--border] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[--surface-alt]">
                  <tr>
                    <th className="text-left p-4 font-medium text-[--text-secondary]">Startup A</th>
                    <th className="text-left p-4 font-medium text-[--text-secondary]">Startup B</th>
                    <th className="text-left p-4 font-medium text-[--text-secondary]">Similarity</th>
                    <th className="text-left p-4 font-medium text-[--text-secondary]">Earlier Submission</th>
                  </tr>
                </thead>
                <tbody>
                  {duplicates.map((row, i) => (
                    <tr key={i} className="border-t border-[--border]">
                      <td className="p-4 font-medium text-[--text-primary]">
                        {row.application_a.startup_name}
                      </td>
                      <td className="p-4 font-medium text-[--text-primary]">
                        {row.application_b.startup_name}
                      </td>
                      <td className="p-4">
                        <SimilarityBadge value={row.similarity} />
                      </td>
                      <td className="p-4 text-[--text-secondary]">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {row.earlier === 'application_a'
                            ? row.application_a.startup_name
                            : row.application_b.startup_name}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      {/* ── Section 2: AI Provider ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[--text-primary]">AI Provider</h2>

        {cfgLoading ? (
          <p className="text-sm text-[--text-secondary]">Loading configuration…</p>
        ) : (
          <Card className="rounded-xl border-[--border] shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">
                {existingCfg ? 'Update Configuration' : 'Configure Provider'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveConfig} className="space-y-5">
                {/* Provider selector */}
                <div>
                  <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                    Provider
                  </label>
                  <select
                    value={provider}
                    onChange={e => setProvider(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-[--border] bg-white px-3 py-2 text-sm text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--gov-accent]"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="gemini">Gemini</option>
                  </select>
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                    API Key
                    {existingCfg?.api_key_masked && (
                      <span className="ml-2 text-xs font-mono text-gray-400">
                        (current: {existingCfg.api_key_masked})
                      </span>
                    )}
                  </label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder={existingCfg ? 'Leave blank to keep existing key' : providerPlaceholder}
                    autoComplete="off"
                  />
                </div>

                {/* Enabled toggle */}
                <div className="flex items-center gap-3">
                  <Toggle checked={enabled} onChange={setEnabled} />
                  <span className="text-sm text-[--text-primary]">
                    {enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={cfgSaving}
                  className="bg-[--gov-accent] hover:bg-[--gov-accent-light] text-white"
                >
                  <Save size={16} className="mr-2" />
                  {cfgSaving ? 'Saving…' : existingCfg ? 'Update Configuration' : 'Save Configuration'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
