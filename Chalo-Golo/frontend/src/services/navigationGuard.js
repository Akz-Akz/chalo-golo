const APPROVED_UNTIL_KEY = 'chalo_golo_approved_navigation_until';
const APPROVED_HOSTS = [
  'coursera.org',
  'edx.org',
  'khanacademy.org',
  'freecodecamp.org',
  'youtube.com',
  'youtu.be',
  'github.com',
  'developer.mozilla.org',
  'docs.python.org',
  'learn.microsoft.com',
  'cloud.google.com',
  'aws.amazon.com',
  'udemy.com',
  'nptel.ac.in',
  'mit.edu',
  'stanford.edu',
  'harvard.edu',
  'reddit.com',
  'dev.epicgames.com',
  'unity.com',
  'learn.unity.com',
  'hubspot.com',
  'figma.com',
  'google.com',
];

function hostAllowed(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    return APPROVED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

export function markApprovedLearningNavigation(url) {
  if (!hostAllowed(url)) return false;
  try {
    sessionStorage.setItem(APPROVED_UNTIL_KEY, String(Date.now() + 8000));
  } catch {
    // Session storage is only an optimization for the focus guard.
  }
  window.dispatchEvent(new CustomEvent('chalo:approved-navigation', { detail: { url } }));
  return true;
}

export function consumeApprovedNavigationWindow() {
  try {
    const until = Number(sessionStorage.getItem(APPROVED_UNTIL_KEY) || 0);
    if (until > Date.now()) return true;
    sessionStorage.removeItem(APPROVED_UNTIL_KEY);
  } catch {
    return false;
  }
  return false;
}

export function isApprovedLearningUrl(url) {
  return hostAllowed(url);
}
