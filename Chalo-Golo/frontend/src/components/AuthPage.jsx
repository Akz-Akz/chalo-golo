import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Shield, Eye, EyeOff, Mail, KeyRound, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import { authService } from '../supabaseClient';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const otpRefs = useRef([]);

  // Keep a stable ref to onAuth so effects never need to depend on it.
  // This prevents the useEffect below from re-running on every render
  // (which would cause an infinite re-subscription loop).
  const onAuthRef = useRef(onAuth);
  useEffect(() => { onAuthRef.current = onAuth; });

  // Subscribe to auth state changes ONCE on mount.
  // Handles: Google OAuth popup callback, OTP magic link, email confirm redirect.
  useEffect(() => {
    // Check for any existing session (e.g. returning from email magic link)
    authService.getSession().then(({ data }) => {
      const user = data?.session?.user;
      if (user) {
        onAuthRef.current({
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          id: user.id,
          provider: user.app_metadata?.provider || 'email',
        });
      }
    });

    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        onAuthRef.current({
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          id: user.id,
          provider: user.app_metadata?.provider || 'email',
        });
      }
    });
    return () => subscription?.unsubscribe();
  }, []); // empty deps — runs only once, uses ref for onAuth

  const clearMessages = () => { setError(''); setSuccess(''); };

  // Google OAuth via popup — keeps the user on this page.
  // If Google provider is not enabled in Supabase, the popup shows the error
  // and we detect the closed popup and display a helpful in-app message.
  const handleGoogleSignIn = async () => {
    clearMessages();
    setLoading(true);
    try {
      const { data, error: oauthError } = await authService.signInWithGoogle();
      if (oauthError) {
        setError(oauthError.message || 'Google sign-in failed.');
        setLoading(false);
        return;
      }
      if (!data?.url) {
        setError('Could not get Google sign-in URL. Check Supabase config.');
        setLoading(false);
        return;
      }

      // Open OAuth URL in a popup so the user stays on this page
      const popup = window.open(
        data.url,
        'google-oauth',
        'width=520,height=660,left=200,top=80,resizable=yes,scrollbars=yes'
      );

      if (!popup || popup.closed) {
        // Popup was blocked — fall back to full-page redirect
        window.location.assign(data.url);
        return;
      }

      // Poll until the popup closes, then check for a session
      const timer = setInterval(async () => {
        try {
          if (popup.closed) {
            clearInterval(timer);
            const { data: sessData } = await authService.getSession();
            const user = sessData?.session?.user;
            if (user) {
              onAuthRef.current({
                email: user.email,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                id: user.id,
                provider: user.app_metadata?.provider || 'google',
              });
            } else {
              setError(
                'Google sign-in failed or was cancelled. ' +
                'If you see "provider is not enabled", go to your Supabase dashboard → ' +
                'Authentication → Providers → Google and enable it with your Google OAuth credentials.'
              );
              setLoading(false);
            }
          }
        } catch {
          clearInterval(timer);
          setLoading(false);
        }
      }, 600);
    } catch (e) {
      setError('Google sign-in failed: ' + (e.message || 'unknown error'));
      setLoading(false);
    }
  };

  const handleEmailPassSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!form.email || !form.password) {
      setError('Please fill in email and password');
      return;
    }
    if (mode === 'signup' && !form.name) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    try {
      let result;
      if (mode === 'signup') {
        result = await authService.signUpWithPassword(form);
      } else {
        result = await authService.signInWithPassword(form);
      }
      const { data, error: authError } = result;
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      if (mode === 'signup' && data?.user && !data?.session) {
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setMode('login');
        setLoading(false);
        return;
      }
      if (data?.session) {
        onAuthRef.current({
          email: data.user.email,
          name: data.user.user_metadata?.full_name || form.name || data.user.email?.split('@')[0],
          id: data.user.id,
          provider: 'email',
        });
      }
    } catch (e) {
      setError('Auth failed: ' + (e.message || 'network error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    clearMessages();
    if (!otpEmail) { setError('Enter an email first'); return; }
    setLoading(true);
    try {
      const { error: otpError } = await authService.sendEmailOTP(otpEmail);
      if (otpError) { setError(otpError.message); setLoading(false); return; }
      setSuccess(`Check ${otpEmail} for a 6-digit code or a secure sign-in link.`);
      setMode('otp-verify');
      setOtpCode(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (e) {
      setError('Failed to send OTP: ' + (e.message || 'unknown'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    clearMessages();
    const token = otpCode.join('');
    if (token.length !== 6) { setError('Please enter the 6-digit code'); return; }
    setLoading(true);
    try {
      const { data, error: verifyError } = await authService.verifyEmailOTP({ email: otpEmail, token });
      if (verifyError) {
        setError((verifyError.message || 'Invalid or expired code') + '. If your email contained a sign-in link instead, open that link and come back here.');
        setLoading(false);
        return;
      }
      if (data?.session) {
        onAuthRef.current({
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          id: data.user.id,
          provider: 'otp',
        });
      }
    } catch (e) {
      setError('Verification failed: ' + (e.message || 'unknown'));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEmailLink = async () => {
    clearMessages();
    setLoading(true);
    try {
      const { data } = await authService.getSession();
      const user = data?.session?.user;
      if (!user) {
        setError('No session found yet. Open the email link in this browser, then try again.');
      } else {
        onAuthRef.current({
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          id: user.id,
          provider: user.app_metadata?.provider || 'email',
        });
      }
    } catch (e) {
      setError('Could not refresh your session: ' + (e.message || 'unknown'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpKey = (idx, val) => {
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, 6).split('');
      const next = ['', '', '', '', '', ''];
      digits.forEach((d, i) => { next[i] = d; });
      setOtpCode(next);
      otpRefs.current[Math.min(digits.length, 5)]?.focus();
      return;
    }
    if (!/^\d?$/.test(val)) return;
    const next = [...otpCode];
    next[idx] = val;
    setOtpCode(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpBackspace = (e, idx) => {
    if (e.key === 'Backspace' && !otpCode[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const isOtp = mode === 'otp-send' || mode === 'otp-verify';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-color)', alignItems: 'stretch' }}>
      {/* Left Panel */}
      <div style={{
        flex: 1, background: 'linear-gradient(135deg, #5b47e0 0%, #7c3aed 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', color: '#fff', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 48 }}>Chalo Golo</div>
          <h2 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.2, marginBottom: 24 }}>
            Chalo Golo<br />Walk toward<br />your goals.
          </h2>
          <p style={{ fontSize: 18, opacity: 0.85, lineHeight: 1.6, maxWidth: 360, marginBottom: 48 }}>
            Learning made simple, personal, and realistic around your budget, hours, and experience.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['Personalized roadmap from your real constraints', 'Resources curated to your learning style & budget', 'Reality check before you commit to a timeline', 'Community of peers at the same stage as you'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={13} /></div>
                <span style={{ fontSize: 15, opacity: 0.9 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 32, left: 60, right: 60, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 20px' }}>
          <Shield size={18} />
          <span style={{ fontSize: 13 }}>Secure auth via Supabase. Your data stays yours.</span>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, overflow: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {!isOtp && (
            <>
              <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: 28 }}>
                {[['login', 'Sign In'], ['signup', 'Create Account']].map(([m, label]) => (
                  <button key={m} onClick={() => { setMode(m); clearMessages(); }} style={{
                    flex: 1, padding: '10px', borderRadius: 10, fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                    background: mode === m ? '#fff' : 'transparent',
                    color: mode === m ? '#1f1f1f' : '#5f5f5f',
                    boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                  }}>{label}</button>
                ))}
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                {mode === 'signup' ? 'Start your journey' : 'Welcome back'}
              </h1>
              <p style={{ color: '#5f5f5f', fontSize: 15, marginBottom: 24 }}>
                {mode === 'signup' ? 'Create an account in seconds.' : 'Continue where you left off.'}
              </p>

              {/* Google OAuth */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{
                  width: '100%', padding: '13px 16px', borderRadius: 10,
                  border: '1.5px solid #e5e5e5', background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  fontWeight: 600, fontSize: 15, cursor: loading ? 'wait' : 'pointer',
                  transition: 'all 0.15s', marginBottom: 16, color: '#1f1f1f'
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.borderColor = '#5b47e0')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e5e5')}
              >
                <GoogleIcon /> Continue with Google
              </button>

              {/* OTP option */}
              <button
                type="button"
                onClick={() => { setMode('otp-send'); clearMessages(); setOtpEmail(form.email); }}
                disabled={loading}
                style={{
                  width: '100%', padding: '13px 16px', borderRadius: 10,
                  border: '1.5px solid #e5e5e5', background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  fontWeight: 600, fontSize: 15, cursor: loading ? 'wait' : 'pointer',
                  marginBottom: 24, color: '#1f1f1f'
                }}
              >
                <KeyRound size={18} /> Continue with Email (OTP)
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: '#e5e5e5' }} />
                <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>OR PASSWORD</span>
                <div style={{ flex: 1, height: 1, background: '#e5e5e5' }} />
              </div>

              <form onSubmit={handleEmailPassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {mode === 'signup' && (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name</label>
                    <input type="text" placeholder="Your name" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      style={inputStyle} />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
                  <input type="email" placeholder="you@example.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      style={{ ...inputStyle, paddingRight: 48 }} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && <MessageBar type="error">{error}</MessageBar>}
                {success && <MessageBar type="success">{success}</MessageBar>}

                <button type="submit" disabled={loading} style={submitButtonStyle(loading)}>
                  {loading ? 'Please wait...' : (mode === 'signup' ? 'Create Account' : 'Sign In')} <ArrowRight size={18} />
                </button>
              </form>

              <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 16 }}>
                Or{' '}
                <button type="button" onClick={() => onAuth({ name: 'Guest', email: 'guest@demo.com', guest: true })}
                  style={{ color: '#5b47e0', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  skip — continue as guest
                </button>
              </div>
            </>
          )}

          {/* OTP SEND SCREEN */}
          {mode === 'otp-send' && (
            <>
              <button onClick={() => { setMode('login'); clearMessages(); }}
                style={{ background: 'none', border: 'none', color: '#5f5f5f', fontSize: 14, marginBottom: 20, cursor: 'pointer', padding: 0 }}>
                ← Back
              </button>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Sign in with Email</h1>
              <p style={{ color: '#5f5f5f', fontSize: 15, marginBottom: 28 }}>
                We'll email you a passwordless sign-in message. Depending on your Supabase email template, it may contain a 6-digit code or a secure sign-in link.
              </p>
              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
                  <input type="email" placeholder="you@example.com" value={otpEmail} autoFocus
                    onChange={e => setOtpEmail(e.target.value)} style={inputStyle} />
                </div>
                {error && <MessageBar type="error">{error}</MessageBar>}
                {success && <MessageBar type="success">{success}</MessageBar>}
                <button type="submit" disabled={loading} style={submitButtonStyle(loading)}>
                  {loading ? 'Sending...' : 'Send email sign-in'} <Mail size={18} />
                </button>
              </form>
            </>
          )}

          {/* OTP VERIFY SCREEN */}
          {mode === 'otp-verify' && (
            <>
              <button onClick={() => { setMode('otp-send'); clearMessages(); }}
                style={{ background: 'none', border: 'none', color: '#5f5f5f', fontSize: 14, marginBottom: 20, cursor: 'pointer', padding: 0 }}>
                ← Use a different email
              </button>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Check your email</h1>
              <p style={{ color: '#5f5f5f', fontSize: 15, marginBottom: 28 }}>
                We sent a passwordless email to <strong style={{ color: '#1f1f1f' }}>{otpEmail}</strong>. Enter the 6-digit code if you received one, or open the email link and Chalo Golo will detect the session automatically.
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
                {otpCode.map((digit, idx) => (
                  <input key={idx} ref={el => (otpRefs.current[idx] = el)}
                    type="text" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={e => handleOtpKey(idx, e.target.value)}
                    onKeyDown={e => handleOtpBackspace(e, idx)}
                    style={{
                      width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
                      borderRadius: 10, border: '2px solid #e5e5e5', outline: 'none',
                      background: '#fff'
                    }}
                    onFocus={e => e.target.style.borderColor = '#5b47e0'}
                    onBlur={e => e.target.style.borderColor = '#e5e5e5'} />
                ))}
              </div>

              {error && <MessageBar type="error">{error}</MessageBar>}
              {success && <MessageBar type="success">{success}</MessageBar>}

              <button onClick={handleVerifyOTP} disabled={loading || otpCode.join('').length !== 6}
                style={{ ...submitButtonStyle(loading || otpCode.join('').length !== 6), marginTop: 10 }}>
                {loading ? 'Verifying...' : 'Verify & Sign in'}
              </button>

              <button type="button" onClick={handleCheckEmailLink} disabled={loading}
                style={{ width: '100%', padding: '10px', marginTop: 12, background: '#f8f7ff', border: '1px solid #e5e5e5', borderRadius: 10, color: '#5b47e0', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                I clicked the email link
              </button>

              <button type="button" onClick={handleSendOTP} disabled={loading}
                style={{ width: '100%', padding: '10px', marginTop: 12, background: 'none', border: 'none', color: '#5b47e0', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Resend email
              </button>
            </>
          )}

          <div style={{ marginTop: 32, padding: '14px 18px', background: '#f8f7ff', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Sparkles size={16} color="#5b47e0" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: '#5f5f5f', lineHeight: 1.5 }}>
              After sign-in, answer 8 quick questions so Chalo Golo can fully personalize your roadmap to your lifestyle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '1.5px solid #e5e5e5', fontSize: 15, outline: 'none',
  boxSizing: 'border-box', background: '#fff', transition: 'border-color 0.15s'
};

const submitButtonStyle = (disabled) => ({
  padding: '14px 16px', borderRadius: 10, border: 'none',
  background: disabled ? '#e5e5e5' : 'linear-gradient(135deg, #5b47e0, #7c3aed)',
  color: disabled ? '#9ca3af' : '#fff',
  fontWeight: 700, fontSize: 15,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  cursor: disabled ? 'not-allowed' : 'pointer', marginTop: 8
});

function MessageBar({ type, children }) {
  const bg = type === 'error' ? '#fef2f2' : '#f0fdf4';
  const color = type === 'error' ? '#dc2626' : '#065f46';
  const Icon = type === 'error' ? AlertCircle : CheckCircle2;
  return (
    <div style={{ background: bg, color, padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <Icon size={16} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{children}</span>
    </div>
  );
}
