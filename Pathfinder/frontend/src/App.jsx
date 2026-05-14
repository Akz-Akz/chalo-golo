import React, { useEffect, useState, useCallback } from 'react';
import { ArrowRight, Sparkles, Target, Zap, Users, BookMarked, Map, Shield, Check, Lock,
  UserCircle, Lightbulb, Brain, CheckCircle, AlertTriangle } from 'lucide-react';
import './App.css';

import AuthPage from './components/AuthPage';
import OnboardingFlow from './components/OnboardingFlow';
import GeneratingScreen from './components/GeneratingScreen';
import DashboardPage from './components/DashboardPage';
import CreateThought from './components/CreateThought';
import RoadmapPage from './components/RoadmapPage';
import CommunityPage from './components/CommunityPage';
import SchedulePage from './components/SchedulePage';
import RealityCheckModal from './components/RealityCheckModal';
import { authService, dataService } from './supabaseClient';
import { generateRoadmapWithBackend } from './lib/roadmapEngine';

const initialProfile = dataService.loadProfile();
const getInitialPage = (profile) => {
  if (!profile) return 'landing';
  return profile.guest || profile.onboardingComplete ? 'dashboard' : 'onboarding';
};

const buildSessionProfile = (sessionUser, storedProfile) => {
  const canReuseStoredProfile = storedProfile && (!storedProfile.id || storedProfile.id === sessionUser.id);
  return {
    ...(canReuseStoredProfile ? storedProfile : {}),
    email: sessionUser.email,
    id: sessionUser.id,
    name: sessionUser.user_metadata?.full_name || (canReuseStoredProfile ? storedProfile?.name : null) || sessionUser.email?.split('@')[0] || 'User',
    provider: sessionUser.app_metadata?.provider || 'email',
    guest: false,
  };
};

function App() {
  const [page, setPage] = useState(getInitialPage(initialProfile));
  const [userProfile, setUserProfile] = useState(initialProfile);
  const [activeThought, setActiveThought] = useState(null);
  const [pendingThought, setPendingThought] = useState(null);
  const [showCreateThought, setShowCreateThought] = useState(false);
  const [showRealityCheck, setShowRealityCheck] = useState(false);
  const [thoughts, setThoughts] = useState([]);
  const [apiNotice, setApiNotice] = useState('');

  useEffect(() => {
    const bootstrapAuth = async () => {
      // If opened as an OAuth popup, close after session is established
      if (window.opener && !window.opener.closed) {
        const { data } = await authService.getSession();
        if (data?.session?.user) {
          window.close();
          return;
        }
      }

      const { data } = await authService.getSession();
      const sessionUser = data?.session?.user;
      if (sessionUser) {
        const storedProfile = dataService.loadProfile();
        const merged = buildSessionProfile(sessionUser, storedProfile);
        setUserProfile(merged);
        dataService.saveProfile(merged);
        setPage(getInitialPage(merged));
        const remoteThoughts = await dataService.loadThoughtsForUser(sessionUser.id);
        setThoughts(remoteThoughts);
      } else {
        setThoughts(dataService.loadThoughts());
      }
    };
    bootstrapAuth();
  }, []);

  // useCallback gives handleAuth a stable reference so AuthPage's useEffect
  // (which depends on onAuth) only runs once and never re-subscribes.
  const handleAuth = useCallback((data) => {
    const storedProfile = dataService.loadProfile();
    const canReuseStoredProfile = storedProfile && (!data.id || !storedProfile.id || storedProfile.id === data.id);
    const nextProfile = {
      ...(canReuseStoredProfile ? storedProfile : {}),
      ...data,
      guest: Boolean(data.guest),
      onboardingComplete: data.guest ? true : Boolean(canReuseStoredProfile && storedProfile?.onboardingComplete),
    };

    setUserProfile(nextProfile);
    dataService.saveProfile(nextProfile);
    if (data.id) {
      dataService.loadThoughtsForUser(data.id).then(setThoughts);
    } else {
      setThoughts(dataService.loadThoughts());
    }
    setPage(getInitialPage(nextProfile));
  }, []);

  const handleOnboardingComplete = (answers) => {
    const nextProfile = { ...userProfile, ...answers, onboardingComplete: true, guest: false };
    setUserProfile(nextProfile);
    dataService.saveProfile(nextProfile);
    setPage('generating');
  };

  const handleThoughtComplete = async (answers) => {
    setShowRealityCheck(false);
    const roadmap = await generateRoadmapWithBackend({
      goal: answers.goal,
      thoughtData: answers,
      profile: userProfile || {},
    });
    if (roadmap?._source === 'ai-enriched') {
      setApiNotice('Roadmap enriched with AI-suggested resources tailored to your goal.');
    } else if (roadmap?._source === 'local' && roadmap?._apiError) {
      setApiNotice('AI backend unavailable — roadmap generated locally.');
    } else if (roadmap?._source === 'local' && roadmap?._aiError) {
      setApiNotice('AI enrichment failed — using curated local resources.');
    } else {
      setApiNotice('');
    }
    setPendingThought({
      ...answers,
      roadmap,
    });
    setShowCreateThought(false);
    setPage('generating-roadmap');
  };

  const handleDeleteThought = async (thoughtId) => {
    const updated = await dataService.deleteThoughtForUser(userProfile?.id, thoughtId);
    setThoughts(updated);
  };

  const handleLogout = useCallback(async () => {
    await authService.signOut();
    dataService.clearProfile();
    setUserProfile(null);
    setThoughts([]);
    setActiveThought(null);
    setPendingThought(null);
    setApiNotice('');
    setPage('landing');
  }, []);

  const closeRealityCheck = () => {
    setShowRealityCheck(false);
    setPendingThought(null);
    setPage('dashboard');
  };

  const handleRealityAccept = async () => {
    const roadmap = pendingThought?.roadmap;
    const firstPhase = roadmap?.phases?.[0];
    const firstModule = firstPhase?.modules?.find((m) => !m.done) || firstPhase?.modules?.[0];
    const thought = {
      id: crypto.randomUUID(),
      title: pendingThought?.goal || 'Untitled Goal',
      goal: pendingThought?.goal || 'Untitled Goal',
      category: roadmap?.domainLabel || 'Goal',
      status: 'active',
      progress: 0,
      phase: firstPhase ? `${firstPhase.name}` : 'Planning',
      nextTask: firstModule ? firstModule.title : 'Review your roadmap',
      eta: roadmap?.totalWeeks ? `${roadmap.totalWeeks} weeks estimated` : 'Roadmap ready',
      color: '#5b47e0',
      tags: (roadmap?.projects?.[0]?.tech || []).slice(0, 3),
      createdAt: new Date().toISOString(),
      realityScore: roadmap?.realityCheck?.score ?? null,
      roadmap,
      thoughtData: pendingThought,
      weeklyHours: userProfile?.weeklyHours || null,
    };
    const updatedThoughts = await dataService.upsertThoughtForUser(userProfile?.id, thought);
    setThoughts(updatedThoughts);
    setShowRealityCheck(false);
    setPendingThought(null);
    setActiveThought(thought);
    setPage('roadmap');
  };

  if (page === 'roadmap') return <RoadmapPage thought={activeThought} onBack={() => setPage('dashboard')} userProfile={userProfile} />;
  if (page === 'community') return <CommunityPage onBack={() => setPage('dashboard')} userName={userProfile?.name} />;
  if (page === 'schedule') return <SchedulePage thoughts={thoughts} userProfile={userProfile} onBack={() => setPage('dashboard')} onViewRoadmap={(t) => { setActiveThought(t); setPage('roadmap'); }} />;
  if (page === 'generating') return <GeneratingScreen onComplete={() => setPage('dashboard')} type="profile" />;
  if (page === 'generating-roadmap') return (
    <>
      <GeneratingScreen onComplete={() => setShowRealityCheck(true)} type="roadmap" />
      {showRealityCheck && <RealityCheckModal goalData={pendingThought} roadmap={pendingThought?.roadmap} userProfile={userProfile} onAccept={handleRealityAccept} onClose={closeRealityCheck} />}
    </>
  );
  if (page === 'onboarding') return <OnboardingFlow onComplete={handleOnboardingComplete} userName={userProfile?.name} />;
  if (page === 'auth') return <AuthPage onAuth={handleAuth} />;
  if (page === 'dashboard') return (
    <>
      {apiNotice && (
        <div style={{ background: '#fef3c7', borderTop: '2px solid #f59e0b', padding: '10px 24px', fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} /> {apiNotice}</span>
          <button onClick={() => setApiNotice('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', fontWeight: 700, fontSize: 16 }}>×</button>
        </div>
      )}
      <DashboardPage thoughts={thoughts} userProfile={userProfile} onGoToCommunity={() => setPage('community')} onGoToSchedule={() => setPage('schedule')} onViewRoadmap={(t) => { setActiveThought(t); setPage('roadmap'); }} onCreateThought={() => setShowCreateThought(true)} onDeleteThought={handleDeleteThought} onLogout={handleLogout} />
      {showCreateThought && <CreateThought onComplete={handleThoughtComplete} onCancel={() => setShowCreateThought(false)} userProfile={userProfile} />}
      {showRealityCheck && <RealityCheckModal goalData={pendingThought} roadmap={pendingThought?.roadmap} userProfile={userProfile} onAccept={handleRealityAccept} onClose={closeRealityCheck} />}
    </>
  );

  // LANDING PAGE
  return (
    <div className="app-container">
      <div className="container">
        <header className="navbar">
          <div className="logo">Pathfinder</div>
          <nav className="nav-links">
            <a href="#">How it works</a>
            <a href="#">Features</a>
            <a href="#">Community</a>
          </nav>
          <div className="nav-actions">
            <button className="btn-outline" onClick={() => setPage('auth')}>Log in</button>
            <button className="btn-primary" onClick={() => setPage('auth')}>Get Started Free</button>
          </div>
        </header>

        <main>
          <section className="hero">
            <div className="badge">
              <Sparkles size={14} /> AI-POWERED GOAL ARCHITECTURE
            </div>
            <h1>Your goals. Your constraints.<br />Your roadmap.</h1>
            <p>Pathfinder builds a personalised plan around your real life — your schedule, your budget, your experience level. No generic advice. No wasted effort.</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => setPage('auth')}>
                Start for free <ArrowRight size={18} />
              </button>
              <button className="btn-demo" onClick={() => { const p = { name: 'Demo User', guest: true }; dataService.saveProfile(p); setUserProfile(p); setPage('dashboard'); }}>
                View Live Demo
              </button>
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                [<Lock size={11} />, 'Data stays on device'],
                [<Brain size={11} />, 'AI-personalized roadmaps'],
                [<Users size={11} />, 'Community matching'],
                [<CheckCircle size={11} />, 'Reality-checked plans'],
              ].map(([icon, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6b6b6b', fontWeight: 500 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#ede9ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#5b47e0' }}>{icon}</span> {label}
                </div>
              ))}
            </div>
          </section>

          <section className="preview-section">
            <div className="preview-card">
              <h3>SAMPLE ROADMAP</h3>
              <h2>Machine Learning Path</h2>
              <div className="progress-bar">
                <div className="progress-segment active"></div>
                <div className="progress-segment semi"></div>
                <div className="progress-segment"></div>
                <div className="progress-segment"></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['Phase 1: Foundation', true, 40], ['Phase 2: Core ML', false, 0], ['Phase 3: Deep Learning', false, 0], ['Phase 4: Deploy & Portfolio', false, 0]].map(([name, active, pct]) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: active ? '#5b47e0' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {active
                        ? <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>▶</span>
                        : <Lock size={12} color="#9ca3af" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: active ? '#1f1f1f' : '#9ca3af', marginBottom: 4 }}>{name}</div>
                      <div style={{ height: 4, background: '#f3f4f6', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#5b47e0', borderRadius: 4 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: active ? '#5b47e0' : '#9ca3af', fontWeight: 600 }}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="insights-col">
              <div className="insight-card purple">
                <div className="icon-circle"><Sparkles size={24} /></div>
                <h3>AI Insight</h3>
                <p>"Front-loading Python basics now unlocks your ML modules 12 days earlier based on your 5–8 hrs/week."</p>
              </div>
              <div className="insight-card orange">
                <div className="icon-circle"><Target size={24} color="#d97706" /></div>
                <h3>Reality Check</h3>
                <p>Timeline adjusted 3 months → 8 months. Recalibrated so you don't burn out. <strong>Score: 62/100</strong></p>
              </div>
            </div>
          </section>
        </main>
      </div>

      <section className="features-section">
        <div className="container">
          <div className="features-header">
            <h2>Designed for reality.</h2>
            <p>Everything you need to pursue any goal — around your actual life, budget, and skill level.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper"><BookMarked size={28} /></div>
              <h3>Deep-question intake</h3>
              <p>We ask about your finances, schedule, and what has stopped you before. Then we build around all of it.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}><Map size={28} /></div>
              <h3 style={{ color: '#065f46' }}>Personalized roadmap</h3>
              <p>Phase-based plan that adjusts to missed days, limited budgets, and beginner constraints automatically.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: '#ffecd1', color: '#9a3412' }}><Target size={28} /></div>
              <h3 style={{ color: '#9a3412' }}>Reality check system</h3>
              <p>We score your timeline against real data before you start. No 30-day unrealistic promises.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}><Users size={28} /></div>
              <h3 style={{ color: '#0284c7' }}>Anonymous peer matching</h3>
              <p>Connect with nearby learners. Start anonymous — reveal identity only when both agree.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}><Zap size={28} /></div>
              <h3 style={{ color: '#db2777' }}>Project generator</h3>
              <p>AI-suggested hands-on projects precisely matched to your skill gaps and available time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: '#fef9c3', color: '#ca8a04' }}><Shield size={28} /></div>
              <h3 style={{ color: '#ca8a04' }}>Private by design</h3>
              <p>All personal data stays on your device. Nothing is sent to any server in demo mode. Ever.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container">
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, textAlign: 'center' }}>How it works</h2>
          <p style={{ fontSize: 17, color: '#5f5f5f', textAlign: 'center', marginBottom: 56 }}>From zero to a reality-checked roadmap in under 5 minutes.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { step: '01', title: 'Build your profile', desc: 'Answer 8 questions about your lifestyle, finances, and learning style. Takes 2 minutes.', icon: <UserCircle size={32} /> },
              { step: '02', title: 'Create a thought', desc: 'Tell us your goal — learning, startup, or career change. Voice input available too.', icon: <Lightbulb size={32} /> },
              { step: '03', title: 'AI builds your plan', desc: 'Full roadmap with curated resources, timeline, and projects calibrated to your constraints.', icon: <Brain size={32} /> },
              { step: '04', title: 'Reality-check and go', desc: 'We flag unrealistic timelines before you commit. Accept the adjusted plan and start.', icon: <CheckCircle size={32} /> },
            ].map((s) => (
              <div key={s.step} style={{ textAlign: 'center', padding: '32px 24px', background: '#f5f3ff', borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'center', color: '#5b47e0', marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5b47e0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Step {s.step}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1c1917', marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: '#6b6b6b', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="container">
          <h2>Ready to build your own success story?</h2>
          <div className="cta-actions">
            <button className="btn-secondary" onClick={() => setPage('auth')}>Start Free — No account needed</button>
            <button className="btn-secondary" style={{ backgroundColor: '#0a0814' }} onClick={() => { const p = { name: 'Demo User', guest: true }; dataService.saveProfile(p); setUserProfile(p); setPage('dashboard'); }}>
              View Live Demo
            </button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Pathfinder</h3>
              <p>AI-powered goal architecture built around your real constraints. Hackathon project — Phase 1 demo.</p>
            </div>
            <div className="footer-links">
              <h4>THE TEAM</h4>
              <ul>
                {['Sri', 'Rishi', 'Arkesh', 'Likith'].map(n => <li key={n}><a href="#">{n}</a></li>)}
              </ul>
            </div>
            <div className="footer-links">
              <h4>PRODUCT</h4>
              <ul>
                {['How it works', 'Features', 'Community', 'Privacy'].map(n => <li key={n}><a href="#">{n}</a></li>)}
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div>© 2025 PATHFINDER. HACKATHON PROJECT. ALL DATA STAYS ON YOUR DEVICE.</div>
            <div className="footer-bottom-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
