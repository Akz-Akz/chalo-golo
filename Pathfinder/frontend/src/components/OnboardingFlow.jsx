import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Sparkles, Check,
  GraduationCap, Zap, Briefcase, Star, BookOpen, Monitor, Search, Lock, Lightbulb, CheckCircle,
  Rocket, Moon, Clock, Dumbbell, Play, Wrench, Users, Leaf, Settings, TrendingUp, DollarSign,
  Brain, Layers, Target, HelpCircle, AlertCircle, AlertTriangle, Wind, Frown, Flame
} from 'lucide-react';
import { onboardingQuestions } from '../data/dummyData';

const ICON_MAP = {
  GraduationCap, Zap, Briefcase, Star, BookOpen, Monitor, Search, Lock, Lightbulb, CheckCircle,
  Rocket, Moon, Clock, Dumbbell, Play, Wrench, Users, Leaf, Settings, TrendingUp, DollarSign,
  Brain, Layers, Target, HelpCircle, AlertCircle, AlertTriangle, Wind, Frown, Flame
};

function OptionIcon({ name, size = 22, color, ...props }) {
  const C = ICON_MAP[name];
  return C ? <C size={size} color={color} {...props} /> : null;
}

export default function OnboardingFlow({ onComplete, userName }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [animating, setAnimating] = useState(false);
  const q = onboardingQuestions[step];
  const total = onboardingQuestions.length;
  const progress = ((step) / total) * 100;

  const handleAnswer = (key, val) => setAnswers(a => ({ ...a, [key]: val }));
  const toggleMulti = (key, val) => {
    const current = answers[key] || [];
    const next = current.includes(val) ? current.filter((item) => item !== val) : [...current, val];
    handleAnswer(key, next);
  };

  const canContinue = () => {
    if (!q) return false;
    const v = answers[q.id];
    if (q.type === 'text') return v && v.trim().length > 0;
    if (q.type === 'multiselect') return Array.isArray(v) && v.length > 0;
    if (q.type === 'choice' && q.allowMultiple) return Array.isArray(v) && v.length > 0;
    return !!v;
  };

  const goNext = () => {
    if (!canContinue()) return;
    if (step < total - 1) {
      setAnimating(true);
      setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 200);
    } else {
      onComplete(answers);
    }
  };

  const goBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'Enter' || !q) return;

      const value = answers[q.id];
      const canAdvance = q.type === 'text'
        ? Boolean(value && value.trim().length > 0)
        : q.type === 'multiselect'
          ? Array.isArray(value) && value.length > 0
          : q.type === 'choice' && q.allowMultiple
            ? Array.isArray(value) && value.length > 0
            : Boolean(value);

      if (!canAdvance) return;

      if (step < total - 1) {
        setAnimating(true);
        setTimeout(() => { setStep((current) => current + 1); setAnimating(false); }, 200);
      } else {
        onComplete(answers);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [answers, onComplete, q, step, total]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
      {/* Progress Bar */}
      <div style={{ height: 4, background: '#e5e5e5', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, #5b47e0, #7c3aed)', width: `${progress}%`, transition: 'width 0.4s ease', borderRadius: '0 4px 4px 0' }} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', marginTop: 4 }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: '#1f1f1f' }}>Pathfinder</div>
        <div style={{ fontSize: 14, color: '#5f5f5f', fontWeight: 600 }}>
          Step <span style={{ color: '#5b47e0' }}>{step + 1}</span> of {total}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 40px' }}>
        <div style={{
          width: '100%', maxWidth: 680,
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(10px)' : 'translateY(0)',
          transition: 'all 0.2s ease'
        }}>
          {step === 0 && userName && (
            <div style={{ marginBottom: 16, fontSize: 16, color: '#6b6b6b' }}>
              Hey <strong>{userName}</strong>, let's build your profile — takes about 2 minutes.
            </div>
          )}

          <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 12, color: '#1f1f1f' }}>
            {q.question}
          </h1>
          <p style={{ fontSize: 16, color: '#5f5f5f', marginBottom: 36, lineHeight: 1.5 }}>{q.subtitle}</p>

          {/* TEXT INPUT */}
          {q.type === 'text' && (
            <div style={{ position: 'relative' }}>
              <input
                autoFocus
                type="text"
                placeholder={q.placeholder}
                value={answers[q.id] || ''}
                onChange={e => handleAnswer(q.id, e.target.value)}
                style={{
                  width: '100%', padding: '18px 20px', borderRadius: 14,
                  border: '2px solid #e5e5e5', fontSize: 18, outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                  background: '#fff'
                }}
                onFocus={e => e.target.style.borderColor = '#5b47e0'}
                onBlur={e => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>
          )}

          {/* CHOICE */}
          {q.type === 'choice' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {q.options.map(opt => {
                const selected = answers[q.id] === opt.value;
                return (
                  <button key={opt.value} onClick={() => handleAnswer(q.id, opt.value)} style={{
                    padding: '20px 24px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                    border: selected ? '2px solid #5b47e0' : '2px solid #e8e5e0',
                    background: selected ? '#ede9ff' : '#fff',
                    transition: 'all 0.15s ease', display: 'flex', flexDirection: 'column', gap: 4
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ color: selected ? '#5b47e0' : '#6b6b6b', display: 'flex' }}>
                        <OptionIcon name={opt.icon} size={22} />
                      </span>
                      {selected && <Check size={16} color="#5b47e0" />}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: selected ? '#5b47e0' : '#1c1917', marginTop: 8 }}>{opt.label}</div>
                    {opt.desc && <div style={{ fontSize: 13, color: '#6b6b6b' }}>{opt.desc}</div>}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === 'multiselect' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {q.options.map((opt) => {
                  const selected = (answers[q.id] || []).includes(opt.value);
                  return (
                    <button key={opt.value} onClick={() => toggleMulti(q.id, opt.value)} style={{
                      padding: '20px 24px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                      border: selected ? '2px solid #5b47e0' : '2px solid #e8e5e0',
                      background: selected ? '#ede9ff' : '#fff',
                      transition: 'all 0.15s ease', display: 'flex', flexDirection: 'column', gap: 4
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ color: selected ? '#5b47e0' : '#6b6b6b', display: 'flex' }}>
                          <OptionIcon name={opt.icon} size={22} />
                        </span>
                        {selected && <Check size={16} color="#5b47e0" />}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: selected ? '#5b47e0' : '#1c1917', marginTop: 8 }}>{opt.label}</div>
                      {opt.desc && <div style={{ fontSize: 13, color: '#6b6b6b' }}>{opt.desc}</div>}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 14, fontSize: 13, color: '#9ca3af' }}>
                Choose as many as you want. Pathfinder will blend them into your plan.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 12, marginTop: 36, alignItems: 'center' }}>
            {step > 0 && (
              <button onClick={goBack} style={{
                padding: '14px 20px', borderRadius: 12, border: '2px solid #e5e5e5',
                background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                fontWeight: 600, color: '#5f5f5f', fontSize: 15
              }}>
                <ArrowLeft size={18} /> Back
              </button>
            )}
            <button onClick={goNext} disabled={!canContinue()} style={{
              flex: 1, padding: '16px', borderRadius: 12,
              background: canContinue() ? 'linear-gradient(135deg, #5b47e0, #7c3aed)' : '#e5e5e5',
              color: canContinue() ? '#fff' : '#9ca3af',
              cursor: canContinue() ? 'pointer' : 'not-allowed',
              fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              border: 'none', transition: 'all 0.2s'
            }}>
              {step === total - 1 ? (
                <><Sparkles size={18} /> Build My Profile</>
              ) : (
                <>Continue <ArrowRight size={18} /></>
              )}
            </button>
          </div>

          {/* Keyboard hint */}
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#9ca3af' }}>
            Press <kbd style={{ background: '#f3f4f6', padding: '2px 7px', borderRadius: 5, fontSize: 12, border: '1px solid #e5e5e5' }}>Enter</kbd> to continue
          </div>
        </div>
      </div>
    </div>
  );
}
