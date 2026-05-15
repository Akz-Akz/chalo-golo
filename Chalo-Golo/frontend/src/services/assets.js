export const APP_LOGO = '/images/logo.png';

export const PROFILE_PICTURES = [
  '/images/profile-pictures/Black%20panther%20.jpeg',
  '/images/profile-pictures/batman.jpeg',
  '/images/profile-pictures/cat%20meme1.jpeg',
  '/images/profile-pictures/cat%20meme2.jpeg',
  '/images/profile-pictures/cat%20meme3.jpeg',
  '/images/profile-pictures/iron%20man.jpeg',
  '/images/profile-pictures/silver%20man%20.jpeg',
  '/images/profile-pictures/spiderman.jpeg',
  '/images/profile-pictures/superman.jpeg',
  '/images/profile-pictures/thor.jpeg',
];

export const WARNING_IMAGES = {
  2: '/images/warning-2.png',
  3: '/images/warning-3.png',
};

export const SOUND_EFFECTS = {
  win: [
    '/sound-effects/win/my-movie-6_0RlWMvM.mp3',
    '/sound-effects/win/spiderman-meme-song.mp3',
  ],
  warning: [
    '/sound-effects/warning/999-social-credit-siren.mp3',
    '/sound-effects/warning/among-us-role-reveal-sound.mp3',
  ],
  lose: [
    '/sound-effects/lose/faaah.mp3',
  ],
};

export function pickProfilePicture(seed = '') {
  if (!PROFILE_PICTURES.length) return null;
  const text = String(seed || crypto.randomUUID?.() || Date.now());
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return PROFILE_PICTURES[hash % PROFILE_PICTURES.length];
}

export function ensureProfileImage(profile = {}) {
  if (!profile) return profile;
  const existing = profile.profileImage || profile.avatar_url || profile.avatarUrl;
  if (existing) return { ...profile, profileImage: existing, avatar_url: existing };
  const picked = pickProfilePicture(profile.id || profile.email || profile.name);
  return { ...profile, profileImage: picked, avatar_url: picked };
}
