// Simple in-memory recent matches store with optional web localStorage fallback
let recent = [];

export function addRecentMatch(entry) {
  try {
    recent.unshift({ ...entry, ts: Date.now() });
    recent = recent.slice(0, 20);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('ludo_recent_matches', JSON.stringify(recent));
    }
  } catch {}
}

export function getRecentMatches() {
  try {
    if (recent.length === 0 && typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem('ludo_recent_matches');
      if (raw) recent = JSON.parse(raw) || [];
    }
  } catch {}
  return recent;
}
