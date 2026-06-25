const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';

function getRedirectUri(): string {
  return `${window.location.origin}/settings`;
}

export async function initiateStravaAuth(): Promise<void> {
  // VITE_STRAVA_CLIENT_ID is the public app ID — safe in the browser.
  // The secret never touches the frontend; the Worker handles token exchange.
  const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
  if (!clientId) {
    console.error('VITE_STRAVA_CLIENT_ID is not set');
    return;
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: 'activity:read_all',
  });
  window.location.href = `${STRAVA_AUTH_URL}?${params}`;
}

export async function handleStravaCallback(code: string): Promise<boolean> {
  const res = await fetch('/api/strava/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) return false;
  const data = await res.json() as {
    access_token: string;
    refresh_token: string;
    athlete?: object;
  };
  localStorage.setItem('strava_access_token', data.access_token);
  localStorage.setItem('strava_refresh_token', data.refresh_token);
  if (data.athlete) {
    localStorage.setItem('strava_athlete', JSON.stringify(data.athlete));
  }
  return true;
}

export async function getValidAccessToken(): Promise<string | null> {
  const accessToken = localStorage.getItem('strava_access_token');
  const storedRefreshToken = localStorage.getItem('strava_refresh_token');

  if (!storedRefreshToken) return null;
  if (accessToken) return accessToken;

  const res = await fetch('/api/strava/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: storedRefreshToken }),
  });
  if (!res.ok) return null;
  const data = await res.json() as { access_token?: string };
  if (data.access_token) {
    localStorage.setItem('strava_access_token', data.access_token);
    return data.access_token;
  }
  return null;
}

export function disconnectStrava(): void {
  localStorage.removeItem('strava_access_token');
  localStorage.removeItem('strava_refresh_token');
  localStorage.removeItem('strava_athlete');
}

export function getStravaAthlete(): object | null {
  const raw = localStorage.getItem('strava_athlete');
  return raw ? JSON.parse(raw) : null;
}
