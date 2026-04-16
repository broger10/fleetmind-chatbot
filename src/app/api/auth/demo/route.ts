const FLEET_BASE_URL = process.env.FLEET_API_URL || 'https://fleetmind.co';

export async function GET() {
  try {
    // Login to the demo account on fleetmind.co
    const loginRes = await fetch(`${FLEET_BASE_URL}/api/auth/demo-login`, {
      redirect: 'manual',
    });

    const setCookies = loginRes.headers.getSetCookie?.() ?? [];
    const sessionCookie = setCookies.find(c =>
      c.startsWith('__Secure-next-auth.session-token=')
    );

    if (!sessionCookie) {
      return Response.json({ error: 'Demo login failed' }, { status: 502 });
    }

    const token = sessionCookie.split('=').slice(1).join('=').split(';')[0];

    // Verify session by fetching user info
    const sessionRes = await fetch(`${FLEET_BASE_URL}/api/auth/session`, {
      headers: { cookie: `__Secure-next-auth.session-token=${token}` },
    });

    if (!sessionRes.ok) {
      return Response.json({ error: 'Session verification failed' }, { status: 502 });
    }

    const session = await sessionRes.json();
    const user = session.user || {};

    return Response.json({
      token,
      name: user.nome && user.cognome ? `${user.nome} ${user.cognome}` : user.name || 'Demo FleetMind',
      email: user.email || 'demo@fleetmind.co',
      isDemo: true,
    });
  } catch {
    return Response.json({ error: 'Connection failed' }, { status: 502 });
  }
}
