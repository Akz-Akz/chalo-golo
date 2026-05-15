import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Glasses, Sparkles } from 'lucide-react';

const HAIR = ['Nova spikes', 'Orbit waves', 'Comet crop'];
const OUTFITS = ['Pilot jacket', 'Nebula hoodie', 'Mission suit'];
const GLOWS = ['#7C3AED', '#38BDF8', '#EC4899', '#F97316'];
const ACCESSORIES = ['Visor', 'Signal pin', 'Star shades'];

function indexFrom(value, size) {
  const text = String(value || '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 33 + text.charCodeAt(i)) >>> 0;
  return hash % size;
}

export default function AvatarCard({ profile = {}, compact = false, editable = false, onChange }) {
  const [variant, setVariant] = useState(profile.avatarVariant || 0);
  const xp = Number(profile.xp || 0);
  const level = profile.level || 'spark';
  const glow = GLOWS[(indexFrom(profile.id || profile.name, GLOWS.length) + variant) % GLOWS.length];
  const meta = useMemo(() => ({
    hair: HAIR[(indexFrom(profile.name, HAIR.length) + variant) % HAIR.length],
    outfit: OUTFITS[(indexFrom(level, OUTFITS.length) + variant) % OUTFITS.length],
    accessory: ACCESSORIES[(indexFrom(profile.email, ACCESSORIES.length) + variant) % ACCESSORIES.length],
  }), [profile.name, profile.email, level, variant]);

  const updateVariant = () => {
    const next = (variant + 1) % 4;
    setVariant(next);
    onChange?.({ avatarVariant: next });
  };

  return (
    <motion.div
      className={`cg-avatar-card ${compact ? 'compact' : ''}`}
      style={{ '--avatar-glow': glow }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="cg-avatar-aura" />
      <div className="cg-avatar-orb">
        {profile.profileImage || profile.avatar_url ? (
          <img src={profile.profileImage || profile.avatar_url} alt={profile.name || 'Player avatar'} onError={(event) => { event.currentTarget.style.display = 'none'; }} />
        ) : null}
        <svg viewBox="0 0 160 160" aria-hidden="true" className="cg-avatar-svg">
          <defs>
            <linearGradient id="avatarSuit" x1="0" x2="1">
              <stop stopColor={glow} />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="62" r="30" fill="#f8fafc" opacity="0.95" />
          <path d="M48 132c6-31 20-48 32-48s26 17 32 48" fill="url(#avatarSuit)" />
          <path d="M52 54c7-22 41-31 58-7-18-4-31 2-44 16-4 4-9 1-14-9z" fill="#111827" />
          <rect x="55" y="59" width="50" height="14" rx="7" fill="#070B14" opacity="0.82" />
          <circle cx="67" cy="66" r="3" fill={glow} />
          <circle cx="94" cy="66" r="3" fill="#38BDF8" />
          <path d="M68 79c8 6 17 6 25 0" stroke="#111827" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      </div>
      <div className="cg-avatar-copy">
        <div className="cg-avatar-kicker"><Sparkles size={13} /> {String(level).toUpperCase()} AURA</div>
        <div className="cg-avatar-name">{profile.name || 'Nova Learner'}</div>
        <div className="cg-avatar-xp">{xp} XP synced</div>
        {!compact ? (
          <div className="cg-avatar-traits">
            <span>{meta.hair}</span>
            <span>{meta.outfit}</span>
            <span><Glasses size={12} /> {meta.accessory}</span>
          </div>
        ) : null}
        {editable ? (
          <button type="button" className="cg-ghost-button" onClick={updateVariant}>Cycle avatar style</button>
        ) : null}
      </div>
    </motion.div>
  );
}
