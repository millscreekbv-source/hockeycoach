// Wedstrijdprogramma van een club, voor de Hockey Coach-app.
// De clubsite (Duda) toont het programma uit LISA via openbare "collecties"; de browser van de
// app mag die niet zelf ophalen (geen CORS), dus deze functie haalt ze op en filtert per team.
// GET ?club=shinty            → { teams: [{ name, category }] }
// GET ?club=shinty&team=MO10  → { club, team, matches: [...] }

const CLUBS = {
  shinty: {
    name: 'DMHC Shinty',
    base: 'https://www.shinty.nl/rts/collections/public/3b42a41e/runtime/collection/',
  },
};

const PAGE_SIZE = 100;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      // Ontzie de clubsite: het CDN van Netlify bewaart het antwoord een half uur
      'Cache-Control': 'public, max-age=300',
      'Netlify-CDN-Cache-Control': status === 200 ? 'public, s-maxage=1800, stale-while-revalidate=3600' : 'no-store',
    },
  });
}

async function getCollection(base, name) {
  const values = [];
  for (let page = 0; page < 50; page++) {
    const url = `${base}${encodeURIComponent(name)}/query-data?pageSize=${PAGE_SIZE}&pageNumber=${page}&query=%28%29&language=DUTCH`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.status === 404) break;
    if (!res.ok) throw new Error(`clubsite gaf ${res.status} voor ${name}`);
    const data = await res.json();
    values.push(...(data.values || []));
    if (!data.page || page + 1 >= data.page.totalPages) break;
  }
  return values.map(v => v.data).filter(Boolean);
}

const ownTeamName = d => String(d.home_team_is_current ? d.home_team_name : d.away_team_name || '').trim();

function isoDate(nl) {
  const [d, m, y] = String(nl || '').split('-');
  return y && m && d ? `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` : '';
}

function normalize(d) {
  const home = !!d.home_team_is_current;
  const loc = d.location || {};
  const a = loc.address || {};
  const street = [a.street, [a.house_number, a.house_number_extension].filter(Boolean).join('')].filter(Boolean).join(' ');
  return {
    extId: d.id,
    code: d.code || '',
    date: isoDate(d.date),
    time: d.time || '',
    arrival: d.arrival_time || '',
    home,
    opponent: String(home ? d.away_team_name : d.home_team_name || '').trim(),
    opponentClub: (home ? d.away_team_club_name : d.home_team_club_name) || '',
    field: d.field || '',
    locationName: loc.name || '',
    address: [street, a.city].filter(Boolean).join(', '),
    geo: a.geo && a.geo.latitude ? { lat: a.geo.latitude, lng: a.geo.longitude } : null,
    referees: d.referees || '',
    cancelled: !!d.is_cancelled,
    category: d.sub_category || d.category || '',
    maxAge: d.max_age || null,
    remarks: [d.club_remarks, d.extra_remarks].filter(Boolean).join(' · '),
  };
}

export default async req => {
  const params = new URL(req.url).searchParams;
  const club = CLUBS[params.get('club')];
  if (!club) return json({ error: 'Deze club wordt (nog) niet ondersteund.' }, 400);
  const team = (params.get('team') || '').trim();
  try {
    const index = await getCollection(club.base, 'Toekomstige_wedstrijden');
    const months = [...new Set(index.map(d => d.collectionname).filter(Boolean))];
    const all = (await Promise.all(months.map(m => getCollection(club.base, m)))).flat();
    if (!team) {
      const teams = new Map();
      all.forEach(d => { const n = ownTeamName(d); if (n && !teams.has(n)) teams.set(n, d.sub_category || d.category || ''); });
      return json({ club: club.name, teams: [...teams].map(([name, category]) => ({ name, category }))
        .sort((x, y) => x.name.localeCompare(y.name, 'nl', { numeric: true })) });
    }
    const matches = all.filter(d => ownTeamName(d) === team).map(normalize)
      .sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time));
    return json({ club: club.name, team, matches, fetchedAt: new Date().toISOString() });
  } catch (e) {
    return json({ error: `Programma ophalen bij de clubsite mislukt (${e.message}).` }, 502);
  }
};
