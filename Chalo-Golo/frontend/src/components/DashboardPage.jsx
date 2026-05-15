import React, { useState, useRef, useEffect } from 'react';
import { Plus, Map, Clock, MoreHorizontal, Sparkles, TrendingUp, Calendar, Users, CheckCircle, ChevronRight, Bell, Zap, LogOut, User, ChevronDown, Key, Check, X, Brain, Volume2, VolumeX, Swords } from 'lucide-react';
import { setAIKey, hasAIKey } from '../lib/roadmapEngine.js';
import AvatarCard from './AvatarCard.jsx';
import AppLogo from './AppLogo.jsx';
import { useUiStore } from '../stores/uiStore.js';

export default function DashboardPage({ thoughts = [], onGoToCommunity, onGoToSchedule, onViewRoadmap, onCreateThought, onDeleteThought, userProfile, onLogout, onOpenMiniGame, onOpenBattle, onProfileUpdate }) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiKeyInput, setAiKeyInput] = useState('');
  const [aiKeyStatus, setAiKeyStatus] = useState({ saved: hasAIKey(), message: '' });
  const soundsMuted = useUiStore((s) => s.soundsMuted);
  const setSoundsMuted = useUiStore((s) => s.setSoundsMuted);
  const profileRef = useRef(null);

  useEffect(() => {
    if (aiModalOpen) {
      setAiKeyInput('');
      setAiKeyStatus({ saved: hasAIKey(), message: '' });
    }
  }, [aiModalOpen]);

  const handleSaveAIKey = () => {
    const trimmed = aiKeyInput.trim();
    if (!trimmed) {
      setAiKeyStatus({ saved: false, message: 'Enter a Groq key starting with gsk_' });
      return;
    }
    const ok = setAIKey(trimmed);
    if (ok) {
      setAiKeyStatus({ saved: true, message: 'Key saved. New roadmaps will use AI.' });
      setAiKeyInput('');
    } else {
      setAiKeyStatus({ saved: hasAIKey(), message: 'Invalid key — Groq keys start with gsk_' });
    }
  };

  const handleRemoveAIKey = () => {
    setAIKey('');
    setAiKeyStatus({ saved: false, message: 'Key removed. Using local engine only.' });
  };

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const userName = userProfile?.name || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const activeCount = thoughts.filter((thought) => thought.status === 'active').length;
  const primaryThought = thoughts.find((thought) => thought.status === 'active') || thoughts[0] || null;
  const primaryRoadmap = primaryThought?.roadmap || null;
  const allModules = thoughts.flatMap((thought) => thought.roadmap?.phases?.flatMap((phase) => phase.modules) || []);
  const completedModules = allModules.filter((module) => module.done).length;
  const totalModules = allModules.length;
  const weeklyHoursLabel = userProfile?.weeklyHours || (primaryRoadmap ? `${primaryRoadmap.weeklyHours} hrs` : '4-8');
  const timelineGap = primaryRoadmap?.realityCheck?.timelineGap;
  const upcomingModules = primaryRoadmap
    ? primaryRoadmap.phases.flatMap((phase) =>
        phase.modules
          .filter((module) => !module.done)
          .map((module) => ({
            ...module,
            phaseName: phase.name,
          }))
      ).slice(0, 3)
    : [];
  const insightText = primaryThought
    ? timelineGap?.severity === 'warning'
      ? timelineGap.message
      : `Start with "${upcomingModules[0]?.title || primaryThought.nextTask}" to stay on pace with your ${weeklyHoursLabel} schedule.`
    : 'Create your first thought and Chalo Golo will build a roadmap around your schedule, budget, and experience level.';

  return (
    <div className="cg-page-shell" style={{ minHeight: '100vh' }}>
      <div className="cg-nav-shell" style={{ padding: '0 32px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24, height: 64 }}>
          <AppLogo size={34} />
          {[
            { label: 'Dashboard', active: true },
            { label: 'Community', onClick: onGoToCommunity },
            { label: 'Schedule', onClick: onGoToSchedule },
          ].map((item) => (
            <button key={item.label} onClick={item.onClick} style={{
              padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              background: item.active ? '#f8f7ff' : 'transparent',
              color: item.active ? '#5b47e0' : '#5f5f5f'
            }}>{item.label}</button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#5b47e0', background: '#f5f3ff', padding: '6px 10px', borderRadius: 999 }}>
              {userProfile?.level?.toUpperCase?.() || 'SPARK'} • {userProfile?.xp ?? 0} XP
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ea580c', background: '#fff7ed', padding: '6px 10px', borderRadius: 999 }}>
              streak {userProfile?.streak ?? 0}
            </div>
            {onOpenMiniGame ? (
              <button
                type="button"
                onClick={onOpenMiniGame}
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(90deg,#a855f7,#fb923c)',
                  color: '#0f172a',
                }}
              >
                Dopamine reset
              </button>
            ) : null}
            {onOpenBattle ? (
              <button
                type="button"
                onClick={onOpenBattle}
                className="cg-icon-text-button"
              >
                <Swords size={14} /> Battle
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setSoundsMuted(!soundsMuted)}
              className="cg-icon-button"
              title={soundsMuted ? 'Unmute sound effects' : 'Mute sound effects'}
            >
              {soundsMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
          <button style={{ position: 'relative', background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Bell size={18} color="#5f5f5f" />
            <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '2px solid #fff' }} />
          </button>
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button onClick={() => setProfileOpen(p => !p)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 4px 4px',
              borderRadius: 24, border: '1.5px solid #e8e5e0', background: profileOpen ? '#f5f3ff' : '#fff',
              cursor: 'pointer', transition: 'all 0.15s'
            }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #5b47e0, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 13 }}>
                {userProfile?.profileImage ? <img src={userProfile.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (userName[0] || 'U').toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1c1917', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</span>
              <ChevronDown size={14} color="#6b6b6b" style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>

            {profileOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 240,
                background: '#fff', borderRadius: 16, border: '1px solid #e8e5e0',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden'
              }}>
                {/* User info */}
                <div style={{ padding: '16px 18px', borderBottom: '1px solid #f0ede8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #5b47e0, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 16, flexShrink: 0 }}>
                      {userProfile?.profileImage ? <img src={userProfile.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (userName[0] || 'U').toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1c1917', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
                      {userProfile?.guest
                        ? <span style={{ fontSize: 11, background: '#fef3c7', color: '#d97706', padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>Guest Mode</span>
                        : <div style={{ fontSize: 12, color: '#6b6b6b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userProfile?.email || ''}</div>
                      }
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: '10px 18px', borderBottom: '1px solid #f0ede8' }}>
                  {userProfile?.weeklyHours && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b6b6b', marginBottom: 6 }}>
                      <Clock size={13} color="#9c9589" /> {userProfile.weeklyHours} hrs/week available
                    </div>
                  )}
                  {userProfile?.occupation && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b6b6b' }}>
                      <User size={13} color="#9c9589" /> {userProfile.occupation.charAt(0).toUpperCase() + userProfile.occupation.slice(1)}
                    </div>
                  )}
                  {!userProfile?.weeklyHours && !userProfile?.occupation && (
                    <div style={{ fontSize: 13, color: '#9c9589' }}>No profile details yet</div>
                  )}
                </div>

                {/* AI Settings */}
                <div style={{ padding: '8px 8px 0' }}>
                  <button onClick={() => { setProfileOpen(false); setAiModalOpen(true); }} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    borderRadius: 10, border: 'none', background: 'none', cursor: 'pointer',
                    color: '#1c1917', fontWeight: 600, fontSize: 13, textAlign: 'left',
                    transition: 'background 0.15s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Brain size={15} color="#5b47e0" />
                    <span style={{ flex: 1 }}>AI Resource Suggestions</span>
                    {hasAIKey() && (
                      <span style={{ fontSize: 10, background: '#ecfdf5', color: '#059669', padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>ON</span>
                    )}
                  </button>
                </div>

                {/* Logout */}
                <div style={{ padding: '8px' }}>
                  <button onClick={() => { setProfileOpen(false); onLogout && onLogout(); }} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    borderRadius: 10, border: 'none', background: 'none', cursor: 'pointer',
                    color: '#dc2626', fontWeight: 600, fontSize: 13, textAlign: 'left',
                    transition: 'background 0.15s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div className="cg-dashboard-hero">
            <div>
              <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
                {greeting}, {userName}
              </h1>
              <p style={{ fontSize: 16, color: '#cbd5e1' }}>
                You have <strong style={{ color: '#38BDF8' }}>{activeCount} active goal{activeCount === 1 ? '' : 's'}</strong> in progress. Keep going.
              </p>
            </div>
            <AvatarCard profile={userProfile} compact editable onChange={onProfileUpdate} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Active Goals', value: String(activeCount), icon: <TrendingUp size={20} />, color: '#5b47e0', bg: '#ebdfff' },
            { label: 'Hours this week', value: weeklyHoursLabel, icon: <Clock size={20} />, color: '#0284c7', bg: '#e0f2fe' },
            { label: 'Modules Done', value: totalModules ? `${completedModules}/${totalModules}` : '0', icon: <CheckCircle size={20} />, color: '#065f46', bg: '#d1fae5' },
            { label: 'Community Peers', value: '6', icon: <Users size={20} />, color: '#7c3aed', bg: '#ede9fe' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: '#fff', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1f1f1f' }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1f1f1f' }}>Your Thoughts</h2>
              <button onClick={onCreateThought} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 14 }}>
                <Plus size={16} /> New Thought
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {thoughts.length === 0 && (
                <div style={{ background: '#fff', borderRadius: 20, padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1f1f1f', marginBottom: 8 }}>No thoughts yet</div>
                  <div style={{ fontSize: 14, color: '#5f5f5f', marginBottom: 16 }}>
                    Add your first thought and Chalo Golo will generate a personalized roadmap instead of showing any prewritten sample tabs.
                  </div>
                  <button onClick={onCreateThought} style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: '#5b47e0', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    Create your first thought
                  </button>
                </div>
              )}

              {thoughts.map((thought) => (
                <div key={thought.id} style={{ background: '#fff', borderRadius: 20, padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: `2px solid ${thought.status === 'active' ? `${thought.color}30` : '#f3f4f6'}`, transition: 'transform 0.2s', position: 'relative' }}
                  onMouseEnter={(event) => { event.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(event) => { event.currentTarget.style.transform = 'translateY(0)'; }}
                  onClick={() => { if (menuOpenId === thought.id) setMenuOpenId(null); }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1f1f1f' }}>{thought.title}</h3>
                        <span style={{ background: thought.status === 'active' ? `${thought.color}20` : '#f3f4f6', color: thought.status === 'active' ? thought.color : '#9ca3af', fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20 }}>
                          {thought.status === 'active' ? 'ACTIVE' : 'PLANNING'}
                        </span>
                        <span style={{ background: '#f3f4f6', color: '#5f5f5f', fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20 }}>
                          {thought.category}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: '#5f5f5f' }}>{thought.phase} • {thought.eta}</div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <button onClick={() => setMenuOpenId(menuOpenId === thought.id ? null : thought.id)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <MoreHorizontal size={16} color="#9ca3af" />
                      </button>
                      {menuOpenId === thought.id && (
                        <div style={{ position: 'absolute', right: 0, top: 36, background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 200, minWidth: 140 }}>
                          <button
                            onClick={() => { setMenuOpenId(null); onDeleteThought && onDeleteThought(thought.id); }}
                            style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 600, fontSize: 13, textAlign: 'left', borderRadius: 10 }}
                          >
                            Delete thought
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {thought.progress > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#5f5f5f' }}>Overall Progress</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: thought.color }}>{thought.progress}%</span>
                      </div>
                      <div style={{ height: 6, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${thought.progress}%`, background: `linear-gradient(90deg, ${thought.color}, ${thought.color}90)`, borderRadius: 4, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  )}

                  {thought.status === 'active' && (
                    <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '12px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
                      <Zap size={14} color={thought.color} />
                      <div>
                        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>NEXT UP</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1f1f1f' }}>{thought.nextTask}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {(thought.tags || []).map((tag) => (
                      <span key={tag} style={{ background: '#f3f4f6', color: '#5f5f5f', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20 }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => onViewRoadmap(thought)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: thought.color, color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Map size={14} /> View Roadmap
                    </button>
                    {thought.realityScore ? (
                      <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706' }}>Reality: {thought.realityScore}/100</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              <button onClick={onCreateThought} style={{
                background: '#fff', borderRadius: 20, padding: '24px', border: '2px dashed #e5e5e5',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                transition: 'all 0.15s', color: '#9ca3af'
              }}
                onMouseEnter={(event) => { event.currentTarget.style.borderColor = '#5b47e0'; event.currentTarget.style.color = '#5b47e0'; }}
                onMouseLeave={(event) => { event.currentTarget.style.borderColor = '#e5e5e5'; event.currentTarget.style.color = '#9ca3af'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px dashed currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={20} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Add new thought</div>
                <div style={{ fontSize: 13 }}>A goal, skill, or idea you want to pursue</div>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Calendar size={18} color="#5b47e0" />
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1f1f1f' }}>Today's Plan</div>
              </div>

              {upcomingModules.length === 0 ? (
                <div style={{ fontSize: 13, color: '#5f5f5f', lineHeight: 1.6, marginBottom: 16 }}>
                  Your next actions will appear here once you create a thought and generate a roadmap.
                </div>
              ) : (
                upcomingModules.map((item, index) => (
                  <div key={`${item.phaseName}-${item.title}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ color: '#5b47e0', fontSize: 12, fontWeight: 700, width: 70, flexShrink: 0, paddingTop: 2 }}>
                      {['Today', 'Next', 'Later'][index]}
                    </div>
                    <div style={{ flex: 1, borderLeft: '2px solid #5b47e0', paddingLeft: 12 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1f1f1f' }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{item.phaseName} • {item.hours} hrs</div>
                    </div>
                  </div>
                ))
              )}

              <button onClick={() => (primaryThought ? onViewRoadmap(primaryThought) : onCreateThought)} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #e5e5e5', background: '#fff', fontWeight: 600, fontSize: 13, color: '#5f5f5f', cursor: 'pointer' }}>
                {primaryThought ? 'Open Active Roadmap' : 'Create Your First Thought'}
              </button>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #5b47e0, #7c3aed)', borderRadius: 20, padding: '24px', color: '#fff' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 8, flexShrink: 0 }}>
                  <Sparkles size={18} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>AI Insight</div>
              </div>
              <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6 }}>
                {insightText}
              </p>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1f1f1f' }}>Community</div>
                <button onClick={onGoToCommunity} style={{ fontSize: 13, color: '#5b47e0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View all <ChevronRight size={14} />
                </button>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#5f5f5f', marginBottom: 10 }}>
                  {primaryRoadmap ? `3 peers near you are exploring ${primaryRoadmap.domainLabel.toLowerCase()} too` : '3 peers near you are learning similar topics'}
                </div>
                <div style={{ display: 'flex', gap: -8 }}>
                  {['ML', 'WD', 'AI'].map((avatar, index) => (
                    <div key={avatar} style={{ width: 32, height: 32, borderRadius: '50%', background: ['#e0f2fe', '#ebdfff', '#d1fae5'][index], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: ['#0284c7', '#5b47e0', '#065f46'][index], border: '2px solid #fff', marginLeft: index > 0 ? -8 : 0 }}>
                      {avatar}
                    </div>
                  ))}
                  <div style={{ marginLeft: 10, fontSize: 13, color: '#5f5f5f', display: 'flex', alignItems: 'center' }}>+3 more</div>
                </div>
              </div>
              <div style={{ background: '#fef3c7', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
                {primaryRoadmap?.realityCheck?.adjustments?.[0] || 'People with similar goals are sharing events, wins, and study momentum here.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Settings Modal */}
      {aiModalOpen && (
        <div
          onClick={() => setAiModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(28, 25, 23, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20, backdropFilter: 'blur(4px)'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 20, padding: 28, maxWidth: 480, width: '100%',
              boxShadow: '0 24px 64px rgba(28, 25, 23, 0.25)', border: '1px solid #e8e5e0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #ede9ff, #ddd6fe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={22} color="#5b47e0" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1c1917' }}>AI Resource Suggestions</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b6b6b' }}>Powered by Groq (Llama)</p>
                </div>
              </div>
              <button onClick={() => setAiModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, color: '#6b6b6b' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#3d3a36', lineHeight: 1.6, marginBottom: 16 }}>
              Add your Groq API key to get <strong>specific, real, tailored learning resources</strong> instead of generic platform links. When enabled, Chalo Golo will ask AI to suggest the best courses, videos, and tutorials for your exact goal.
            </p>

            <div style={{ background: '#fafaf8', borderRadius: 12, padding: 14, marginBottom: 16, border: '1px solid #e8e5e0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9c9589', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
                Status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {aiKeyStatus.saved ? (
                  <>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>
                      AI enrichment active — new roadmaps will use Groq
                    </span>
                  </>
                ) : (
                  <>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9c9589' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#6b6b6b' }}>
                      Using local engine only (no key)
                    </span>
                  </>
                )}
              </div>
            </div>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#3d3a36', marginBottom: 6 }}>
              Groq API Key
            </label>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <Key size={16} color="#9c9589" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={aiKeyInput}
                onChange={e => setAiKeyInput(e.target.value)}
                placeholder="gsk_..."
                autoComplete="off"
                spellCheck="false"
                style={{
                  width: '100%', padding: '12px 14px 12px 40px', borderRadius: 10,
                  border: '1.5px solid #e8e5e0', fontSize: 14, color: '#1c1917',
                  fontFamily: 'ui-monospace, monospace', background: '#fff', outline: 'none',
                  transition: 'border-color 0.15s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#5b47e0'}
                onBlur={e => e.currentTarget.style.borderColor = '#e8e5e0'}
              />
            </div>

            {aiKeyStatus.message && (
              <div style={{
                fontSize: 12, color: aiKeyStatus.saved ? '#059669' : '#dc2626',
                marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6
              }}>
                {aiKeyStatus.saved ? <Check size={14} /> : <X size={14} />}
                {aiKeyStatus.message}
              </div>
            )}

            <p style={{ fontSize: 11, color: '#9c9589', lineHeight: 1.5, marginBottom: 16 }}>
              Your key is stored only in your browser's localStorage and is sent directly to Groq — never to Chalo Golo servers. You can also set <code style={{ fontSize: 10 }}>VITE_GROQ_API_KEY</code> in <code style={{ fontSize: 10 }}>.env.local</code>. Get a key at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: '#5b47e0', textDecoration: 'none', fontWeight: 600 }}>console.groq.com/keys</a>
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleSaveAIKey}
                disabled={!aiKeyInput.trim()}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none',
                  background: aiKeyInput.trim() ? '#5b47e0' : '#e8e5e0',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: aiKeyInput.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <Check size={16} /> Save Key
              </button>
              {hasAIKey() && (
                <button
                  onClick={handleRemoveAIKey}
                  style={{
                    padding: '12px 16px', borderRadius: 10, border: '1.5px solid #fecaca',
                    background: '#fff', color: '#dc2626', fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
