/*
  Jordan Tupper Music — automatic ICS builder
  Pulls public gig feeds from Night Hog, Cover 6, and Baton Rouge Jazz,
  merges them, removes past gigs, and writes gigs.ics.
*/

const fs = require('fs');
const vm = require('vm');
const crypto = require('crypto');

const FEEDS = [
  {
    url: 'https://nighthogbr.com/gigs-feed.js',
    globalNames: ['NIGHT_HOG_GIGS', 'nightHogGigs', 'gigs'],
    fallbackBand: 'Night Hog',
  },
  {
    url: 'https://cover6band.com/gigs-feed.js',
    globalNames: ['COVER6_GIGS', 'cover6Gigs', 'gigs'],
    fallbackBand: 'Cover 6',
  },
  {
    url: 'https://batonrougejazz.com/gigs-feed.js',
    globalNames: ['BATON_ROUGE_JAZZ_GIGS', 'batonRougeJazzGigs', 'jazzGigs', 'gigs'],
    fallbackBand: 'Standley, Tupper & Petersen',
  },
];

const OUTPUT = 'gigs.ics';
const TIMEZONE = 'America/Chicago';

function escapeICS(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function foldLine(line) {
  const max = 73;
  let out = '';
  while (line.length > max) {
    out += line.slice(0, max) + '\r\n ';
    line = line.slice(max);
  }
  return out + line;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function dateOnly(dateStr) {
  return String(dateStr || '').slice(0, 10);
}

function addOneDay(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

function formatDate(dateStr) {
  const d = dateOnly(dateStr).replace(/-/g, '');
  return d;
}

function normalizeTime(t) {
  if (!t) return null;
  let s = String(t).trim().toLowerCase();
  if (!s || s === 'tba' || s === 'private event' || s === 'brunch') return null;
  s = s.replace(/\s+/g, '');
  const ampm = s.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/);
  if (ampm) {
    let h = Number(ampm[1]);
    const m = Number(ampm[2] || '00');
    if (ampm[3] === 'pm' && h !== 12) h += 12;
    if (ampm[3] === 'am' && h === 12) h = 0;
    return `${pad(h)}${pad(m)}00`;
  }
  const twentyFour = s.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFour) return `${pad(Number(twentyFour[1]))}${pad(Number(twentyFour[2]))}00`;
  return null;
}

function dateTimeLocal(dateStr, timeStr) {
  const d = formatDate(dateStr);
  const t = normalizeTime(timeStr);
  return t ? `${d}T${t}` : null;
}

function inferEndTime(startTime) {
  const t = normalizeTime(startTime);
  if (!t) return null;
  let h = Number(t.slice(0, 2));
  const m = t.slice(2, 4);
  h = (h + 3) % 24;
  return `${pad(h)}${m}00`;
}

async function fetchFeed(feed) {
  const res = await fetch(feed.url, { headers: { 'User-Agent': 'JordanTupperMusic-ICS-Builder/1.0' } });
  if (!res.ok) throw new Error(`Failed to fetch ${feed.url}: ${res.status}`);
  const code = await res.text();

  const sandbox = { window: {}, globalThis: {}, console };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { timeout: 5000, filename: feed.url });

  for (const name of feed.globalNames) {
    if (Array.isArray(sandbox[name])) return sandbox[name];
    if (sandbox.window && Array.isArray(sandbox.window[name])) return sandbox.window[name];
    if (sandbox.globalThis && Array.isArray(sandbox.globalThis[name])) return sandbox.globalThis[name];
  }

  const arrays = Object.values(sandbox).filter(Array.isArray);
  if (arrays.length) return arrays[0];
  throw new Error(`No gig array found in ${feed.url}`);
}

function normalizeGig(raw, fallbackBand) {
  const date = raw.date || raw.startDate || raw.day;
  if (!date) return null;

  const startTime = raw.startTime || raw.start || raw.timeStart || raw.time || null;
  const endTime = raw.endTime || raw.end || raw.timeEnd || null;
  const venue = raw.venue || raw.name || raw.title || 'Gig';
  const city = raw.city || raw.location || raw.place || '';
  const state = raw.state || '';
  const band = raw.band || raw.project || fallbackBand;

  const location = [city, state].filter(Boolean).join(', ') || raw.address || '';
  const timeLabel = raw.timeLabel || raw.displayTime || raw.time || [startTime, endTime].filter(Boolean).join(' – ') || 'TBA';

  return {
    date: dateOnly(date),
    startTime,
    endTime,
    venue,
    location,
    band,
    timeLabel,
    private: raw.private || raw.status === 'private' || /private/i.test(String(venue)),
    url: raw.url || raw.link || '',
  };
}

function gigStartMs(gig) {
  const t = normalizeTime(gig.startTime) || '000000';
  return new Date(`${gig.date}T${t.slice(0,2)}:${t.slice(2,4)}:00-05:00`).getTime();
}

function buildICS(gigs) {
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jordan Tupper Music//Performance Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS('Jordan Tupper Performances')}`,
    `X-WR-TIMEZONE:${TIMEZONE}`,
  ];

  for (const gig of gigs) {
    const uidBase = `${gig.date}-${gig.band}-${gig.venue}-${gig.location}`;
    const uid = crypto.createHash('sha1').update(uidBase).digest('hex') + '@jordantuppermusic.com';
    const summary = `${gig.band} — ${gig.venue}`;
    const description = `${gig.band} performance at ${gig.venue}. Time: ${gig.timeLabel}. Source: jordantuppermusic.com`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`SUMMARY:${escapeICS(summary)}`);
    lines.push(`DESCRIPTION:${escapeICS(description)}`);
    if (gig.location) lines.push(`LOCATION:${escapeICS(gig.location)}`);

    const dtStart = dateTimeLocal(gig.date, gig.startTime);
    const dtEnd = dateTimeLocal(gig.date, gig.endTime) || (gig.startTime ? `${formatDate(gig.date)}T${inferEndTime(gig.startTime)}` : null);

    if (dtStart) {
      lines.push(`DTSTART;TZID=${TIMEZONE}:${dtStart}`);
      if (dtEnd) lines.push(`DTEND;TZID=${TIMEZONE}:${dtEnd}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${formatDate(gig.date)}`);
      lines.push(`DTEND;VALUE=DATE:${addOneDay(gig.date)}`);
    }

    if (gig.url) lines.push(`URL:${escapeICS(gig.url)}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

(async () => {
  const all = [];
  for (const feed of FEEDS) {
    try {
      const rawGigs = await fetchFeed(feed);
      rawGigs.map(g => normalizeGig(g, feed.fallbackBand)).filter(Boolean).forEach(g => all.push(g));
      console.log(`Loaded ${rawGigs.length} gigs from ${feed.url}`);
    } catch (err) {
      console.error(err.message);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = all
    .filter(g => new Date(`${g.date}T23:59:59-05:00`) >= today)
    .sort((a, b) => gigStartMs(a) - gigStartMs(b));

  if (!upcoming.length) {
    console.warn('No upcoming gigs found. Writing empty calendar file.');
  }

  fs.writeFileSync(OUTPUT, buildICS(upcoming), 'utf8');
  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/all-gigs.json', JSON.stringify(upcoming, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${OUTPUT} with ${upcoming.length} upcoming gigs.`);
})();
