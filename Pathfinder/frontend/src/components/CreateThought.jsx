import React, { useState, useRef } from 'react';
import { ArrowRight, ArrowLeft, Mic, MicOff, Sparkles, X, Check,
  GraduationCap, Zap, Briefcase, Star, BookOpen, Monitor, Search, Lock, Lightbulb, CheckCircle,
  Rocket, Moon, Clock, Dumbbell, Play, Wrench, Users, Leaf, Settings, TrendingUp, DollarSign,
  Brain, Layers, Target, HelpCircle, AlertCircle, AlertTriangle, Wind, Frown, Flame
} from 'lucide-react';
import { thoughtQuestions } from '../data/dummyData';

const ICON_MAP = {
  GraduationCap, Zap, Briefcase, Star, BookOpen, Monitor, Search, Lock, Lightbulb, CheckCircle,
  Rocket, Moon, Clock, Dumbbell, Play, Wrench, Users, Leaf, Settings, TrendingUp, DollarSign,
  Brain, Layers, Target, HelpCircle, AlertCircle, AlertTriangle, Wind, Frown, Flame
};

function OptionIcon({ name, size = 20, color }) {
  const C = ICON_MAP[name];
  return C ? <C size={size} color={color} /> : null;
}

export default function CreateThought({ onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const q = thoughtQuestions[step];
  const total = thoughtQuestions.length;

  const handleAnswer = (key, val) => setAnswers(a => ({ ...a, [key]: val }));

  const toggleMulti = (key, val) => {
    const curr = answers[key] || [];
    const next = curr.includes(val) ? curr.filter(x => x !== val) : [...curr, val];
    handleAnswer(key, next);
  };

  const canContinue = () => {
    if (!q) return false;
    const v = answers[q.id];
    if (q.type === 'multiselect') return true; // optional
    if (q.type === 'choice' && q.allowMultiple) return Array.isArray(v) && v.length > 0;
    if (q.type === 'textarea') return v && v.trim().length > 2;
    if (q.type === 'scale') return v !== undefined;
    return !!v;
  };

  const goNext = () => {
    if (!canContinue()) return;
    if (step < total - 1) {
      setStep(s => s + 1);
    } else {
      onComplete(answers);
    }
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input requires Chrome browser.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const r = new SR();
      r.continuous = true;
      r.interimResults = false;
      r.onresult = (e) => {
        const text = Array.from(e.results).map(r => r[0].transcript).join(' ');
        handleAnswer(q.id, text);
      };
      r.onend = () => setListening(false);
      recognitionRef.current = r;
      r.start();
      setListening(true);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,10,40,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, width: '100%', maxWidth: 700,
        maxHeight: '90vh', overflow: 'auto', padding: 48, position: 'relative',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)'
      }}>
        {/* Close */}
        <button onClick={onCancel} style={{ position: 'absolute', top: 20, right: 20, background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={18} />
        </button>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
          {thoughtQuestions.map((_, i) => (
            <div key={i} style={{
              height: 4, flex: 1, borderRadius: 4,
              background: i <= step ? '#5b47e0' : '#e5e5e5',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        <div style={{ marginBottom: 8, fontSize: 13, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Question {step + 1} of {total}
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, marginBottom: 10, color: '#1f1f1f' }}>{q.question}</h2>
        <p style={{ fontSize: 15, color: '#5f5f5f', marginBottom: 28, lineHeight: 1.5 }}>{q.subtitle}</p>

        {/* TEXTAREA */}
        {q.type === 'textarea' && (
          <div>
            <textarea
              autoFocus
              placeholder={q.placeholder}
              value={answers[q.id] || ''}
              onChange={e => handleAnswer(q.id, e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '16px', borderRadius: 12, border: '2px solid #e5e5e5',
                fontSize: 16, outline: 'none', resize: 'vertical', lineHeight: 1.6,
                boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#5b47e0'}
              onBlur={e => e.target.style.borderColor = '#e5e5e5'}
            />
            {q.voice && (
              <button onClick={toggleVoice} style={{
                marginTop: 12, display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 10, border: '2px solid',
                borderColor: listening ? '#ef4444' : '#e5e5e5',
                background: listening ? '#fef2f2' : '#f9f9f9', cursor: 'pointer',
                fontWeight: 600, fontSize: 14, color: listening ? '#ef4444' : '#5f5f5f',
                animation: listening ? 'pulse 1.5s ease-in-out infinite' : 'none'
              }}>
                {listening ? <><MicOff size={16} /> Stop Recording</> : <><Mic size={16} /> Speak Instead</>}
              </button>
            )}
          </div>
        )}

        {/* SCALE */}
        {q.type === 'scale' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {q.labels.map((label, i) => {
                const selected = answers[q.id] === i;
                return (
                  <button key={i} onClick={() => handleAnswer(q.id, i)} style={{
                    flex: 1, padding: '14px 8px', borderRadius: 10, cursor: 'pointer',
                    border: selected ? '2px solid #5b47e0' : '2px solid #e5e5e5',
                    background: selected ? '#ebdfff' : '#f9f9f9',
                    fontWeight: selected ? 700 : 500, fontSize: 13,
                    color: selected ? '#5b47e0' : '#5f5f5f', transition: 'all 0.15s',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{i + 1}</div>
                    <div style={{ fontSize: 11, lineHeight: 1.3 }}>{label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CHOICE */}
        {q.type === 'choice' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {q.options.map(opt => {
              const selected = q.allowMultiple ? (answers[q.id] || []).includes(opt.value) : answers[q.id] === opt.value;
              return (
                <button key={opt.value} onClick={() => (q.allowMultiple ? toggleMulti(q.id, opt.value) : handleAnswer(q.id, opt.value))} style={{
                  padding: '16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                  border: selected ? '2px solid #5b47e0' : '2px solid #e8e5e0',
                  background: selected ? '#ede9ff' : '#fff', transition: 'all 0.15s',
                  display: 'flex', flexDirection: 'column', gap: 4
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: selected ? '#5b47e0' : '#6b6b6b', display: 'flex' }}>
                      <OptionIcon name={opt.icon} size={20} />
                    </span>
                    {q.allowMultiple && selected && <Check size={14} color="#5b47e0" />}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: selected ? '#5b47e0' : '#1c1917', marginTop: 4 }}>{opt.label}</span>
                  {opt.desc && <span style={{ fontSize: 12, color: '#6b6b6b' }}>{opt.desc}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* MULTISELECT */}
        {q.type === 'multiselect' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {q.options.map(opt => {
              const selected = (answers[q.id] || []).includes(opt.value);
              return (
                <button key={opt.value} onClick={() => toggleMulti(q.id, opt.value)} style={{
                  padding: '14px 18px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                  border: selected ? '2px solid #5b47e0' : '2px solid #e8e5e0',
                  background: selected ? '#ede9ff' : '#fff', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <span style={{ color: selected ? '#5b47e0' : '#6b6b6b', display: 'flex' }}>
                    <OptionIcon name={opt.icon} size={18} />
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: selected ? '#5b47e0' : '#1c1917' }}>{opt.label}</span>
                  {selected && <Check size={14} color="#5b47e0" style={{ marginLeft: 'auto' }} />}
                </button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              padding: '14px 20px', borderRadius: 12, border: '2px solid #e5e5e5',
              background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#5f5f5f',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 15
            }}>
              <ArrowLeft size={18} /> Back
            </button>
          )}
          <button onClick={goNext} disabled={!canContinue()} style={{
            flex: 1, padding: '16px', borderRadius: 12, border: 'none',
            background: canContinue() ? 'linear-gradient(135deg, #5b47e0, #7c3aed)' : '#e5e5e5',
            color: canContinue() ? '#fff' : '#9ca3af',
            cursor: canContinue() ? 'pointer' : 'not-allowed',
            fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            {step === total - 1 ? <><Sparkles size={18} /> Generate My Roadmap</> : <>Continue <ArrowRight size={18} /></>}
          </button>
        </div>

        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
      </div>
    </div>
  );
}
