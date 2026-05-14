import React, { useState } from 'react';
import { ArrowLeft, Clock, BookOpen, Video, Code2, ExternalLink, ChevronRight, Calendar, CheckCircle, Circle,
  Brain, Globe, Smartphone, Palette, Rocket, MessageSquare, Dumbbell, Music, Target,
  ChefHat, DollarSign, Timer, Camera, Megaphone, BarChart2, PenLine, Gamepad2
} from 'lucide-react';

const DOMAIN_ICONS = {
  Brain, Globe, Code2, Smartphone, Palette, Rocket, MessageSquare, Dumbbell, Music, Target,
  ChefHat, DollarSign, Timer, Camera, Megaphone, BarChart2, PenLine, Gamepad2
};
function DomainIcon({ name, size = 20, color }) {
  const C = DOMAIN_ICONS[name] || Target;
  return <C size={size} color={color} />;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TODAY_IDX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0=Mon

function getWeekDates() {
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  return DAYS.map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - dayOfWeek + i);
    return d;
  });
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function SchedulePage({ thoughts = [], userProfile, onBack, onViewRoadmap }) {
  const [completedModules, setCompletedModules] = useState({});
  const weekDates = getWeekDates();

  const activeThoughts = thoughts.filter(t => t.status === 'active' && t.roadmap);
  const allPendingModules = activeThoughts.flatMap(thought =>
    (thought.roadmap?.phases || []).flatMap((phase, pi) =>
      (phase.modules || []).map((mod, mi) => ({
        ...mod,
        thoughtId: thought.id,
        thoughtTitle: thought.title,
        thoughtColor: thought.color || '#5b47e0',
        phaseName: phase.name,
        phaseIdx: pi,
        modIdx: mi,
        key: `${thought.id}-${pi}-${mi}`,
      }))
    ).filter(mod => !mod.done)
  );

  // Distribute modules across the week based on hours per day
  const weeklyHours = Number(userProfile?.weeklyHours) || 8;
  const hoursPerDay = Math.max(1, Math.round(weeklyHours / 5));

  // Build a simple schedule: assign modules to days greedily
  const schedule = DAYS.map(() => []);
  let dayHours = DAYS.map(() => 0);
  let modIdx = 0;

  for (let day = 0; day < 7 && modIdx < allPendingModules.length; day++) {
    // Weekends get half the hours
    const cap = day >= 5 ? Math.max(1, Math.round(hoursPerDay / 2)) : hoursPerDay;
    while (dayHours[day] < cap && modIdx < allPendingModules.length) {
      const mod = allPendingModules[modIdx];
      const modHours = mod.hours || 2;
      if (dayHours[day] + modHours <= cap + 2) {
        schedule[day].push(mod);
        dayHours[day] += modHours;
        modIdx++;
      } else {
        break;
      }
    }
  }

  const toggleDone = (key) => {
    setCompletedModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalScheduledHours = dayHours.reduce((a, b) => a + b, 0);
  const doneCount = Object.values(completedModules).filter(Boolean).length;
  const totalScheduled = schedule.flat().length;

  const typeIcon = (type) => {
    if (type === 'Video' || type === 'YouTube') return <Video size={13} />;
    if (type === 'Project') return <Code2 size={13} />;
    return <BookOpen size={13} />;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e5e5e5', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#5f5f5f', fontSize: 14 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#1f1f1f', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={20} color="#5b47e0" /> Weekly Schedule
          </div>
          <div style={{ fontSize: 13, color: '#5f5f5f' }}>
            Week of {formatDate(weekDates[0])} — {formatDate(weekDates[6])} • {totalScheduledHours} hrs planned
          </div>
        </div>
        {totalScheduled > 0 && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
            {doneCount}/{totalScheduled} done this week
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

        {activeThoughts.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: '60px 40px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: '#c4b8ff' }}><Calendar size={56} /></div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1f1f1f', marginBottom: 8 }}>No schedule yet</div>
            <div style={{ fontSize: 15, color: '#5f5f5f', marginBottom: 24 }}>
              Create a thought and generate a roadmap to see your weekly learning plan here.
            </div>
            <button onClick={onBack} style={{ padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #5b47e0, #7c3aed)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Summary strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
              {[
                { label: 'Active goals', value: String(activeThoughts.length), color: '#5b47e0', bg: '#ebdfff' },
                { label: 'Hrs this week', value: String(totalScheduledHours), color: '#0284c7', bg: '#e0f2fe' },
                { label: 'Modules scheduled', value: String(totalScheduled), color: '#7c3aed', bg: '#ede9fe' },
                { label: 'Completed', value: `${doneCount}/${totalScheduled}`, color: '#065f46', bg: '#d1fae5' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Weekly grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
              {DAYS.map((day, i) => {
                const isToday = i === TODAY_IDX;
                const isPast = i < TODAY_IDX;
                const items = schedule[i];
                return (
                  <div key={day} style={{
                    background: '#fff', borderRadius: 16,
                    border: isToday ? '2px solid #5b47e0' : '2px solid transparent',
                    boxShadow: isToday ? '0 4px 16px rgba(75,54,204,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                    overflow: 'hidden', opacity: isPast ? 0.7 : 1
                  }}>
                    {/* Day header */}
                    <div style={{
                      padding: '10px 12px',
                      background: isToday ? 'linear-gradient(135deg, #5b47e0, #7c3aed)' : '#f8f9fa',
                      display: 'flex', flexDirection: 'column', gap: 2
                    }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: isToday ? '#fff' : '#1f1f1f' }}>{day}</div>
                      <div style={{ fontSize: 11, color: isToday ? 'rgba(255,255,255,0.8)' : '#9ca3af' }}>{formatDate(weekDates[i])}</div>
                      {dayHours[i] > 0 && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? 'rgba(255,255,255,0.9)' : '#5b47e0', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                          <Clock size={10} /> {dayHours[i]}h
                        </div>
                      )}
                    </div>

                    {/* Modules */}
                    <div style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80 }}>
                      {items.length === 0 ? (
                        <div style={{ fontSize: 11, color: '#d1d5db', textAlign: 'center', paddingTop: 12, fontStyle: 'italic' }}>
                          {isPast ? 'Completed' : 'Rest day'}
                        </div>
                      ) : (
                        items.map(mod => {
                          const done = completedModules[mod.key];
                          return (
                            <div key={mod.key} style={{
                              background: done ? '#f0fdf4' : `${mod.thoughtColor}10`,
                              borderRadius: 10, padding: '8px 10px',
                              borderLeft: `3px solid ${done ? '#22c55e' : mod.thoughtColor}`,
                              opacity: done ? 0.75 : 1
                            }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                <button onClick={() => toggleDone(mod.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, marginTop: 1, color: done ? '#22c55e' : '#9ca3af' }}>
                                  {done ? <CheckCircle size={14} /> : <Circle size={14} />}
                                </button>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: done ? '#065f46' : '#1f1f1f', lineHeight: 1.3, textDecoration: done ? 'line-through' : 'none' }}>
                                    {mod.title}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                                    <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center' }}>{typeIcon(mod.type)}</span>
                                    <span style={{ fontSize: 10, color: '#9ca3af' }}>{mod.hours}h · {mod.platform}</span>
                                  </div>
                                  {mod.url && (
                                    <a href={mod.url} target="_blank" rel="noopener noreferrer"
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 4, fontSize: 10, color: mod.thoughtColor, fontWeight: 600, textDecoration: 'none' }}>
                                      Open <ExternalLink size={9} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active goals with roadmap links */}
            <div style={{ marginTop: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1f1f1f', marginBottom: 16 }}>Your Active Goals</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeThoughts.map(thought => {
                  const phases = thought.roadmap?.phases || [];
                  const activePhase = phases.find(p => p.status === 'active') || phases[0];
                  const pendingCount = phases.flatMap(p => p.modules || []).filter(m => !m.done).length;
                  return (
                    <div key={thought.id} style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${thought.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <DomainIcon name={thought.roadmap?.domainIcon || 'Target'} size={22} color={thought.color || '#5b47e0'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: '#1f1f1f', marginBottom: 2 }}>{thought.title}</div>
                        <div style={{ fontSize: 13, color: '#5f5f5f' }}>
                          {activePhase ? `Phase: ${activePhase.name}` : 'No active phase'} • {pendingCount} modules remaining
                        </div>
                      </div>
                      <button onClick={() => onViewRoadmap(thought)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: thought.color, color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        View Roadmap <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
