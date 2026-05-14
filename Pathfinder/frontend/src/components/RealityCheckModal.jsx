import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle, ArrowRight, Target } from 'lucide-react';

const timelineStyles = {
  success: {
    bg: '#dcfce7',
    title: '#166534',
    body: '#166534',
    icon: CheckCircle,
  },
  info: {
    bg: '#dbeafe',
    title: '#1d4ed8',
    body: '#1e40af',
    icon: Target,
  },
  warning: {
    bg: '#fef3c7',
    title: '#92400e',
    body: '#78350f',
    icon: AlertTriangle,
  },
};

const getScoreColor = (score) => {
  if (score >= 70) return '#065f46';
  if (score >= 50) return '#d97706';
  return '#dc2626';
};

const getScoreBg = (score) => {
  if (score >= 70) return '#d1fae5';
  if (score >= 50) return '#fef3c7';
  return '#fee2e2';
};

export default function RealityCheckModal({ onAccept, onClose, goalData, userProfile, roadmap }) {
  const [reveal, setReveal] = useState(false);
  const [score, setScore] = useState(0);
  const targetScore = roadmap?.realityCheck?.score ?? 62;
  const verdictLabel = roadmap?.realityCheck?.verdict || 'Feasible with adjustments';
  const verdictColor = roadmap?.realityCheck?.verdictColor || getScoreColor(targetScore);
  const verdictBg = roadmap?.realityCheck?.verdictBg || getScoreBg(targetScore);
  const timelineGap = roadmap?.realityCheck?.timelineGap;
  const timelineStyle = timelineStyles[timelineGap?.severity] || timelineStyles.warning;
  const TimelineIcon = timelineStyle.icon;
  const weeklyHours = userProfile?.weeklyHours || (roadmap ? `${roadmap.weeklyHours} hrs` : '5 hrs');
  const goalText = goalData?.goal || roadmap?.goal || 'this goal';
  const goalSummary = goalText.length > 70 ? `${goalText.slice(0, 67)}...` : goalText;
  const milestones = roadmap?.realityCheck?.viableMilestones || [];
  const adjustments = roadmap?.realityCheck?.adjustments || [];
  const expectedMonths = roadmap?.realityCheck?.userExpectedMonths;
  const estimatedMonths = roadmap?.realityCheck?.estimatedMonths;

  useEffect(() => {
    const timeout = setTimeout(() => setReveal(true), 400);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!reveal) return undefined;

    const interval = setInterval(() => {
      setScore((current) => {
        if (current >= targetScore) {
          clearInterval(interval);
          return targetScore;
        }
        return Math.min(targetScore, current + 2);
      });
    }, 25);

    return () => clearInterval(interval);
  }, [reveal, targetScore]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,10,40,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: 24, backdropFilter: 'blur(6px)'
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, width: '100%', maxWidth: 620,
        maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ background: 'linear-gradient(135deg, #1f1f1f, #2d1b69)', padding: '32px 36px 24px', borderRadius: '24px 24px 0 0', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <X size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ background: '#fbbf24', borderRadius: 10, padding: '8px 10px' }}>
              <Target size={20} color="#1f1f1f" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Reality Check</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>How grounded is your plan?</div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
            Based on your <strong style={{ color: '#fff' }}>{weeklyHours} per week</strong>, Pathfinder calibrated the roadmap for <strong style={{ color: '#fff' }}>{goalSummary}</strong>.
          </div>
        </div>

        <div style={{ padding: '28px 36px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', flexShrink: 0,
            background: reveal ? getScoreBg(score) : '#f3f4f6',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: `4px solid ${reveal ? getScoreColor(score) : '#e5e5e5'}`,
            transition: 'all 0.3s'
          }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: getScoreColor(score) }}>{score}</div>
            <div style={{ fontSize: 11, color: '#5f5f5f', fontWeight: 600 }}>/ 100</div>
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 999, background: verdictBg, color: verdictColor, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
              {verdictLabel}
            </div>
            <div style={{ fontSize: 14, color: '#5f5f5f', lineHeight: 1.6 }}>
              {expectedMonths && estimatedMonths
                ? `You asked for results in about ${expectedMonths} months. Based on your current constraints, Pathfinder estimates about ${estimatedMonths} months for meaningful progress.`
                : 'This score reflects how well your timeline, experience level, and weekly availability line up.'}
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: timelineStyle.bg, borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 14 }}>
            <TimelineIcon size={20} color={timelineStyle.title} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: timelineStyle.title, marginBottom: 6 }}>
                {timelineGap?.title || 'Timeline Reality Gap'}
              </div>
              <div style={{ fontSize: 14, color: timelineStyle.body, lineHeight: 1.5 }}>
                {timelineGap?.message || 'Pathfinder compared your target timeline to the roadmap and applied realistic pacing.'}
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1f1f1f', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={18} color="#065f46" /> What you can viably achieve
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(milestones.length ? milestones : [
                { time: 'Month 1', item: 'Complete the first roadmap phase' },
                { time: 'Month 2', item: 'Finish an applied project milestone' },
                { time: 'Month 4', item: 'Ship something you can share publicly' },
              ]).map(({ time, item }) => (
                <div key={`${time}-${item}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px', background: '#f8faf8', borderRadius: 10 }}>
                  <div style={{ background: '#d1fae5', color: '#065f46', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>{time}</div>
                  <div style={{ fontSize: 14, color: '#1f1f1f' }}>{item}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#f8f7ff', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#5b47e0', marginBottom: 10 }}>Adjustments Pathfinder made to your plan</div>
            {(adjustments.length ? adjustments : ['Balanced your roadmap across learning, practice, and shipping.']).map((item, index) => (
              <div key={`${item}-${index}`} style={{ fontSize: 13, color: '#5f5f5f', marginBottom: 6, paddingLeft: 16, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#7c3aed' }}>•</span> {item}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 36px 32px', display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '2px solid #e5e5e5', background: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', color: '#5f5f5f' }}>
            Let me rethink
          </button>
          <button onClick={onAccept} style={{ flex: 2, padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #5b47e0, #7c3aed)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Accept adjusted plan <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
