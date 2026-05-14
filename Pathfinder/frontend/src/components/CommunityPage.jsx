import React, { useState } from 'react';
import { Search, Users, Calendar, Trophy, MapPin, Heart, MessageCircle, Share2, Filter, Bell, X, ChevronDown, Lock, Check, Star } from 'lucide-react';
import { dummyPeers, dummyEvents, dummyAchievements } from '../data/dummyData';

const GOAL_FILTERS = ['All', 'ML / AI', 'Web Dev', 'Mobile', 'Design', 'Startup', 'Other'];
const STATUS_FILTERS = ['All', 'Actively learning', 'Practicing', 'Looking for mentor', 'Open to collab'];
const DISTANCE_FILTERS = ['All', 'Under 5 km', 'Under 20 km', 'Online only'];

export default function CommunityPage({ onBack, userName }) {
  const [tab, setTab] = useState('peers');
  const [connected, setConnected] = useState([]);
  const [liked, setLiked] = useState([]);
  const [search, setSearch] = useState('');
  const [rsvpd, setRsvpd] = useState([]);

  // Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [filterGoal, setFilterGoal] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDistance, setFilterDistance] = useState('All');

  const activeFilterCount = [filterGoal, filterStatus, filterDistance].filter(f => f !== 'All').length;

  const clearFilters = () => {
    setFilterGoal('All');
    setFilterStatus('All');
    setFilterDistance('All');
  };

  const toggleConnect = (id) => setConnected(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]);
  const toggleLike = (id) => setLiked(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id]);
  const toggleRsvp = (id) => setRsvpd(r => r.includes(id) ? r.filter(x => x !== id) : [...r, id]);

  const tabs = [
    { id: 'peers', label: 'Peers', icon: <Users size={16} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={16} /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy size={16} /> },
  ];

  const filteredPeers = dummyPeers.filter(peer => {
    if (search && !peer.goal.toLowerCase().includes(search.toLowerCase()) && !peer.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filterGoal !== 'All') {
      const goalLower = filterGoal.toLowerCase();
      if (!peer.goal.toLowerCase().includes(goalLower) && !peer.tags.some(t => t.toLowerCase().includes(goalLower))) return false;
    }
    if (filterStatus !== 'All' && peer.status !== filterStatus) return false;
    if (filterDistance !== 'All') {
      const km = parseFloat(peer.distance);
      if (filterDistance === 'Under 5 km' && km >= 5) return false;
      if (filterDistance === 'Under 20 km' && km >= 20) return false;
      if (filterDistance === 'Online only' && !peer.distance.toLowerCase().includes('online')) return false;
    }
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '20px 32px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <button onClick={onBack} style={{ background: '#fff', border: '1.5px solid #e5e5e5', borderRadius: 10, padding: '6px 10px', fontSize: 12, cursor: 'pointer', marginBottom: 8 }}>
                ← Back to Dashboard
              </button>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1f1f1f', marginBottom: 2 }}>Community Hub</h1>
              <p style={{ fontSize: 14, color: '#5f5f5f' }}>Connect, collaborate, and learn with peers at the same stage, {userName || 'friend'}.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="text" placeholder="Search peers, skills..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ padding: '9px 12px 9px 34px', borderRadius: 10, border: '1.5px solid #e5e5e5', fontSize: 14, outline: 'none', width: 200, background: '#f9f9f9' }}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowFilter(f => !f)}
                  style={{
                    padding: '9px 14px', borderRadius: 10,
                    border: `1.5px solid ${activeFilterCount > 0 ? '#5b47e0' : '#e5e5e5'}`,
                    background: activeFilterCount > 0 ? '#ebdfff' : '#fff',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 600,
                    color: activeFilterCount > 0 ? '#5b47e0' : '#5f5f5f'
                  }}
                >
                  <Filter size={14} /> Filter
                  {activeFilterCount > 0 && (
                    <span style={{ background: '#5b47e0', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown size={12} style={{ transform: showFilter ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {/* Filter Dropdown Panel */}
                {showFilter && (
                  <div style={{
                    position: 'absolute', right: 0, top: 46, background: '#fff',
                    border: '1.5px solid #e5e5e5', borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200, width: 280, padding: 20
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: '#1f1f1f' }}>Filters</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {activeFilterCount > 0 && (
                          <button onClick={clearFilters} style={{ fontSize: 12, color: '#5b47e0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                            Clear all
                          </button>
                        )}
                        <button onClick={() => setShowFilter(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    <FilterGroup label="Goal / Domain" options={GOAL_FILTERS} value={filterGoal} onChange={setFilterGoal} />
                    <FilterGroup label="Status" options={STATUS_FILTERS} value={filterStatus} onChange={setFilterStatus} />
                    <FilterGroup label="Distance" options={DISTANCE_FILTERS} value={filterDistance} onChange={setFilterDistance} />

                    <button
                      onClick={() => setShowFilter(false)}
                      style={{ width: '100%', padding: '10px', marginTop: 4, background: 'linear-gradient(135deg, #5b47e0, #7c3aed)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                    >
                      Apply filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10,
                border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.15s',
                background: tab === t.id ? '#5b47e0' : 'transparent',
                color: tab === t.id ? '#fff' : '#5f5f5f'
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Click-away to close filter */}
      {showFilter && <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setShowFilter(false)} />}

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>

        {/* PEERS TAB */}
        {tab === 'peers' && (
          <div>
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', marginBottom: 24, border: '1.5px solid #e0e7ff', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ color: '#5b47e0', flexShrink: 0, marginTop: 1 }}><Lock size={18} /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#5b47e0', marginBottom: 4 }}>Anonymous by default</div>
                <div style={{ fontSize: 13, color: '#5f5f5f', lineHeight: 1.5 }}>All peers are shown anonymously. Once both of you accept a connection request, you can choose to reveal your profile details.</div>
              </div>
            </div>

            {filteredPeers.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 16, padding: '40px', textAlign: 'center', color: '#5f5f5f' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: '#c4b8ff' }}><Search size={40} /></div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No peers match your filters</div>
                <div style={{ fontSize: 14, marginBottom: 16 }}>Try adjusting your search or filters.</div>
                <button onClick={clearFilters} style={{ padding: '8px 16px', borderRadius: 10, background: '#5b47e0', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {filteredPeers.map(peer => (
                  <div key={peer.id} style={{ background: '#fff', borderRadius: 18, padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', transition: 'transform 0.2s', cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: peer.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: peer.text, flexShrink: 0 }}>
                        {peer.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: '#1f1f1f' }}>{peer.alias}</div>
                        <div style={{ fontSize: 13, color: '#5b47e0', fontWeight: 600 }}>{peer.goal}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} /> {peer.distance} away • {peer.status}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                      {peer.tags.map(tag => <span key={tag} style={{ background: '#f3f4f6', color: '#5f5f5f', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20 }}>{tag}</span>)}
                      {peer.mutual > 0 && <span style={{ background: '#ebdfff', color: '#5b47e0', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20 }}>{peer.mutual} mutual</span>}
                    </div>
                    <button onClick={() => toggleConnect(peer.id)} style={{
                      width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid',
                      borderColor: connected.includes(peer.id) ? '#5b47e0' : '#e5e5e5',
                      background: connected.includes(peer.id) ? '#ebdfff' : '#fff',
                      color: connected.includes(peer.id) ? '#5b47e0' : '#1f1f1f',
                      fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s'
                    }}>
                      {connected.includes(peer.id) ? <><Check size={13} /> Request Sent</> : 'Connect Anonymously'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EVENTS TAB */}
        {tab === 'events' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {dummyEvents.map(event => (
              <div key={event.id} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: event.featured ? `2px solid ${event.color}` : '2px solid transparent' }}>
                <div style={{ padding: '24px 28px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div style={{ background: `${event.color}15`, borderRadius: 14, padding: '12px 14px', textAlign: 'center', flexShrink: 0, minWidth: 60 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: event.color, textTransform: 'uppercase' }}>{event.date.split(',')[0].split(' ')[0]}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: event.color }}>{event.date.split(',')[0].split(' ')[1]?.split('–')[0]?.split('–')[0] || '?'}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1f1f1f' }}>{event.title}</h3>
                      {event.featured && <span style={{ background: event.color, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>FEATURED</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13, color: '#5f5f5f', marginBottom: 10 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {event.location}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bell size={13} /> {event.seats}</span>
                    </div>
                    <p style={{ fontSize: 14, color: '#5f5f5f', lineHeight: 1.5, marginBottom: 14 }}>{event.desc}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {event.tags.map(t => <span key={t} style={{ background: '#f3f4f6', color: '#5f5f5f', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{t}</span>)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => toggleRsvp(event.id)} style={{
                      padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, transition: 'all 0.15s',
                      background: rsvpd.includes(event.id) ? '#d1fae5' : event.color,
                      color: rsvpd.includes(event.id) ? '#065f46' : '#fff'
                    }}>
                      {rsvpd.includes(event.id) ? <><Check size={13} /> RSVP'd</> : 'RSVP'}
                    </button>
                    <span style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>{event.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {tab === 'achievements' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #5b47e0, #7c3aed)', borderRadius: 20, padding: '24px 28px', marginBottom: 24, color: '#fff' }}>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><Trophy size={18} /> Showcase your progress</div>
              <div style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.5, marginBottom: 16 }}>Share milestones with the community. Experts and mentors can see your progress for faster feedback and assessment.</div>
              <button style={{ padding: '10px 20px', background: '#fff', color: '#5b47e0', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                + Share Achievement
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {dummyAchievements.map(ach => (
                <div key={ach.id} style={{ background: '#fff', borderRadius: 18, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #5b47e0, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    {ach.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#1f1f1f' }}>{ach.user}</span>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{ach.time}</span>
                    </div>
                    <div style={{ fontSize: 15, color: '#1f1f1f', marginBottom: 10, lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 6 }}><Star size={14} color="#f59e0b" fill="#f59e0b" /><strong>{ach.achievement}</strong></div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                      {ach.tags.map(t => <span key={t} style={{ background: '#ebdfff', color: '#5b47e0', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>{t}</span>)}
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <button onClick={() => toggleLike(ach.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: liked.includes(ach.id) ? '#ef4444' : '#9ca3af', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Heart size={15} fill={liked.includes(ach.id) ? '#ef4444' : 'none'} /> {ach.likes + (liked.includes(ach.id) ? 1 : 0)}
                      </button>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                        <MessageCircle size={15} /> Reply
                      </button>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Share2 size={15} /> Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
              borderColor: value === opt ? '#5b47e0' : '#e5e5e5',
              background: value === opt ? '#ebdfff' : '#fff',
              color: value === opt ? '#5b47e0' : '#5f5f5f',
              transition: 'all 0.15s'
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
