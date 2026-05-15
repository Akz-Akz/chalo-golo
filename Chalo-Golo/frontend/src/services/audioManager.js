import { SOUND_EFFECTS } from './assets.js';

const SETTINGS_KEY = 'chalo_golo_sound_settings';

function readMuted() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')?.muted ?? false;
  } catch {
    return false;
  }
}

class AudioManager {
  constructor() {
    this.cache = new Map();
    this.lastPlayedAt = 0;
    this.muted = readMuted();
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ muted: this.muted }));
    } catch {
      // Storage can fail in private/restricted contexts; sound should degrade quietly.
    }
  }

  isMuted() {
    return this.muted;
  }

  preload() {
    Object.values(SOUND_EFFECTS).flat().forEach((src) => this.getAudio(src));
  }

  getAudio(src) {
    if (!src || typeof Audio === 'undefined') return null;
    if (!this.cache.has(src)) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = 0.55;
      this.cache.set(src, audio);
    }
    return this.cache.get(src);
  }

  play(kind, { force = false } = {}) {
    if (this.muted && !force) return;
    const now = Date.now();
    if (!force && now - this.lastPlayedAt < 320) return;
    const list = SOUND_EFFECTS[kind] || [];
    if (!list.length) return;
    const src = list[Math.floor(Math.random() * list.length)];
    const base = this.getAudio(src);
    if (!base) return;
    const audio = base.paused || base.ended ? base : base.cloneNode(true);
    audio.currentTime = 0;
    audio.volume = kind === 'warning' ? 0.68 : 0.5;
    this.lastPlayedAt = now;
    audio.play().catch(() => {
      // Autoplay policies block audio until user interaction; keep the app smooth.
    });
  }
}

export const audioManager = new AudioManager();
