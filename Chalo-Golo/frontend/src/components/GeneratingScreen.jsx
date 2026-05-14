import React, { useState, useEffect } from 'react';
import { Sparkles, Check } from 'lucide-react';

const steps = [
  'Analyzing your lifestyle constraints...',
  'Mapping your learning style preferences...',
  'Calibrating roadmap complexity...',
  'Curating free & paid resources...',
  'Running reality check on your timeline...',
  'Finalizing your personalized plan...',
];

export default function GeneratingScreen({ onComplete, type = 'profile' }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotsInterval = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(dotsInterval);
  }, []);

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const t = setTimeout(() => setCurrentStep(s => s + 1), 700);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onComplete, 900);
      return () => clearTimeout(t);
    }
  }, [currentStep, onComplete]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8f7ff 0%, #fff 100%)',
      padding: 40
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'linear-gradient(135deg, #5b47e0, #7c3aed)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 32, animation: 'spin 2s linear infinite',
        boxShadow: '0 8px 32px rgba(75,54,204,0.3)'
      }}>
        <Sparkles size={36} color="#fff" />
      </div>

      <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: '#1f1f1f', textAlign: 'center' }}>
        {type === 'profile' ? 'Building your profile' : 'Generating your roadmap'}{dots}
      </h2>
      <p style={{ color: '#5f5f5f', fontSize: 16, marginBottom: 48, textAlign: 'center' }}>
        Our AI is processing your constraints and preferences
      </p>

      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 20px', borderRadius: 12,
            background: i <= currentStep ? '#fff' : 'transparent',
            boxShadow: i <= currentStep ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.3s ease',
            opacity: i > currentStep ? 0.3 : 1
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: i < currentStep ? '#5b47e0' : i === currentStep ? 'linear-gradient(135deg, #5b47e0, #7c3aed)' : '#e5e5e5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: i <= currentStep ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: 700
            }}>
              {i < currentStep ? <Check size={14} /> : i + 1}
            </div>
            <span style={{ fontSize: 15, fontWeight: i === currentStep ? 600 : 400, color: i <= currentStep ? '#1f1f1f' : '#9ca3af' }}>
              {s}
            </span>
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
