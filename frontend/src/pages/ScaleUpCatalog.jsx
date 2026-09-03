import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useSpring, useInView } from 'motion/react';
import { TrendingUp, Building2, CheckCircle, Zap, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/toast';

// 3D tilt
function TiltCard({ children, style, onClick }) {
  const ref = useRef(null);
  const rx = useSpring(0, { stiffness: 200, damping: 22 });
  const ry = useSpring(0, { stiffness: 200, damping: 22 });
  const onMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    rx.set(((e.clientY - rect.top) / rect.height - 0.5) * -10);
    ry.set(((e.clientX - rect.left) / rect.width - 0.5) * 10);
  }, [rx, ry]);
  return (
    <motion.div ref={ref} onMouseMove={onMove}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
      onClick={onClick}
      style={{ ...style, rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', perspective: 800 }}
      whileHover={{ scale: 1.02, boxShadow: '0 16px 48px rgba(0,0,0,0.1)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}>
      {children}
    </motion.div>
  );
}

export default function ScaleUpCatalog() {
  const { toast } = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [justAdopted, setJustAdopted] = useState({});
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.getScaleUpEntries().then(d => setEntries(Array.isArray(d) ? d : d?.results ?? [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleAdopt = async (entryId) => {
    try {
      await api.updateScaleUpEntry(entryId, { adopted: true });
      toast({ title: 'Adopted!', description: 'Pilot added to your department.' });
      setJustAdopted(p => ({ ...p, [entryId]: true }));
      const data = await api.getScaleUpEntries();
      setEntries(Array.isArray(data) ? data : data?.results ?? []);
    } catch {
      toast({ title: 'Error', description: 'Failed to adopt pilot', variant: 'destructive' });
    }
  };

  if (loading) return <div style={{ padding: 24, color: '#94A3B8', fontSize: 14 }}>Loading…</div>;

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 20, marginBottom: 32,
          background: 'linear-gradient(135deg, #0D1117 0%, #0A0E1A 55%, #0C1020 100%)',
          border: '1px solid rgba(255,255,255,0.08)', padding: '28px 36px',
        }}
      >
        <motion.div animate={{ x: [0,20,0], y: [0,-14,0] }} transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -50, left: -50, width: 260, height: 260, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13,148,136,0.22) 0%, transparent 70%)', filter: 'blur(35px)', pointerEvents: 'none' }} />
        <motion.div animate={{ x: [0,-14,0], y: [0,18,0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%)', filter: 'blur(35px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(13,148,136,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(13,148,136,0.3)' }}>
            <TrendingUp size={24} color="#2DD4BF" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>
              Scale-Up Catalog
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
              {entries.length} proven pilot{entries.length !== 1 ? 's' : ''} ready for wider adoption
            </p>
          </div>
        </div>
      </motion.div>

      {/* Cards */}
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: '#94A3B8', fontSize: 14 }}>
          No scale-up entries yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {entries.map((entry, i) => {
            const adopted = entry.adopted_count > 0 || entry.has_adopted || justAdopted[entry.id];
            return (
              <Reveal key={entry.id} delay={i * 0.07}>
                <TiltCard style={{
                  borderRadius: 18, background: '#fff',
                  border: adopted ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                  overflow: 'hidden', position: 'relative',
                  boxShadow: adopted ? '0 4px 20px rgba(16,185,129,0.12)' : '0 2px 12px rgba(0,0,0,0.05)',
                }}>
                  {/* Proven ribbon */}
                  {adopted && (
                    <div style={{
                      position: 'absolute', top: 12, right: -20, background: 'linear-gradient(90deg, #059669, #10B981)',
                      color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 28px 4px 10px',
                      letterSpacing: '0.08em', transform: 'rotate(0deg)',
                      boxShadow: '0 2px 8px rgba(16,185,129,0.4)',
                      borderRadius: '4px 0 0 4px',
                    }}>
                      PROVEN PILOT
                    </div>
                  )}

                  {/* Top bar */}
                  <div style={{ height: 4, background: adopted ? 'linear-gradient(90deg, #059669, #10B981)' : 'linear-gradient(90deg, #0D9488, #0891B2)' }} />

                  <div style={{ padding: '20px 22px 22px' }}>
                    {/* Title */}
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0B0F19', lineHeight: 1.4, marginBottom: 8, paddingRight: adopted ? 60 : 0 }}>
                      {entry.pilot_name || entry.original_challenge_title || 'Untitled Pilot'}
                    </h3>

                    {/* Dept + startup */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                      <Building2 size={13} />
                      <span>{entry.originating_department_name || entry.startup_name || '—'}</span>
                    </div>

                    {/* Outcome */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                      <TrendingUp size={15} color="#0D9488" style={{ flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.55, margin: 0 }}>
                        {entry.outcome_summary || 'Successful pilot with measurable outcomes.'}
                      </p>
                    </div>

                    {/* Adopters */}
                    {entry.adopting_departments?.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ display: 'flex' }}>
                          {entry.adopting_departments.slice(0, 4).map((dept, idx) => (
                            <motion.div key={idx}
                              initial={justAdopted[entry.id] && idx === entry.adopting_departments.length - 1
                                ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                              title={dept.name || dept}
                              style={{
                                width: 26, height: 26, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0D9488, #0891B2)',
                                border: '2px solid #fff', marginLeft: idx > 0 ? -8 : 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                              }}>
                              <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>
                                {(dept.name || dept).charAt(0)}
                              </span>
                            </motion.div>
                          ))}
                          {entry.adopting_departments.length > 4 && (
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#E2E8F0',
                              border: '2px solid #fff', marginLeft: -8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: 9, fontWeight: 700, color: '#64748B' }}>
                                +{entry.adopting_departments.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>
                          {entry.adopting_departments.length} dept{entry.adopting_departments.length > 1 ? 's' : ''} adopted
                        </span>
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>
                        {entry.adopted_count || 0} adoptions
                      </span>

                      {user.role === 'department' && (
                        entry.has_adopted ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#059669', fontWeight: 600 }}>
                            <CheckCircle size={15} />
                            Adopted
                          </div>
                        ) : (
                          <motion.button onClick={() => handleAdopt(entry.id)}
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '7px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                              background: 'linear-gradient(135deg, #0D9488, #0891B2)',
                              color: '#fff', fontSize: 13, fontWeight: 600,
                              boxShadow: '0 3px 12px rgba(13,148,136,0.35)',
                            }}
                          >
                            <Zap size={14} /> Adopt
                          </motion.button>
                        )
                      )}
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
