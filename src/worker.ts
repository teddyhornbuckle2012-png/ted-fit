export interface Env {
  STRAVA_CLIENT_ID: string;
  STRAVA_CLIENT_SECRET: string;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle Strava token exchange
    if (url.pathname === '/api/strava/token' && request.method === 'POST') {
      const { code } = await request.json() as { code: string };

      const res = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: env.STRAVA_CLIENT_ID,
          client_secret: env.STRAVA_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
        }),
      });

      const data = await res.json();
      return Response.json(data, { status: res.status });
    }

    // Handle Strava token refresh
    if (url.pathname === '/api/strava/refresh' && request.method === 'POST') {
      const { refresh_token } = await request.json() as { refresh_token: string };

      const res = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: env.STRAVA_CLIENT_ID,
          client_secret: env.STRAVA_CLIENT_SECRET,
          refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const data = await res.json();
      return Response.json(data, { status: res.status });
    }

    // Everything else — serve static PWA assets
    return env.ASSETS.fetch(request);
  },
};
