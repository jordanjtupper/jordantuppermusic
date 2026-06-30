/* Jordan Tupper Music calendar export helpers
   - Builds individual Google Calendar links
   - Builds a downloadable/subscribable .ics file from loaded gig feeds
   - Designed to work with the gig feed objects we created for Night Hog, Cover 6, and Baton Rouge Jazz
*/

(function () {
  const FEEDS = [
    'https://nighthogbr.com/gigs-feed.js',
    'https://cover6band.com/gigs-feed.js',
    'https://batonrougejazz.com/gigs-feed.js'
  ];

  function pad(n) { return String(n).padStart(2, '0'); }

  function normalizeText(value) {
    return String(value || '')
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
  }

  function parseLocalDateTime(date, time) {
    const [y, m, d] = String(date).split('-').map(Number);
    const [hh, mm] = String(time || '19:00').split(':').map(Number);
    return new Date(y, m - 1, d, hh || 0, mm || 0, 0);
  }

  function toGoogleDate(dt) {
    return dt.getFullYear() + pad(dt.getMonth() + 1) + pad(dt.getDate()) + 'T' + pad(dt.getHours()) + pad(dt.getMinutes()) + '00';
  }

  function toICSDate(dt) {
    // Floating local time, which works well for a Louisiana performance calendar
    return dt.getFullYear() + pad(dt.getMonth() + 1) + pad(dt.getDate()) + 'T' + pad(dt.getHours()) + pad(dt.getMinutes()) + '00';
  }

  function getGigStart(gig) {
    return parseLocalDateTime(gig.date, gig.startTime || gig.start || gig.timeStart || '19:00');
  }

  function getGigEnd(gig) {
    const start = getGigStart(gig);
    if (gig.endTime || gig.end || gig.timeEnd) return parseLocalDateTime(gig.date, gig.endTime || gig.end || gig.timeEnd);
    return new Date(start.getTime() + 3 * 60 * 60 * 1000);
  }

  function gigTitle(gig) {
    const band = gig.band || gig.project || 'Jordan Tupper';
    const venue = gig.venue || 'Performance';
    return `${band} at ${venue}`;
  }

  function gigLocation(gig) {
    return [gig.venue, gig.city, gig.state].filter(Boolean).join(', ');
  }

  function gigDescription(gig) {
    const parts = [];
    if (gig.band || gig.project) parts.push(`Band: ${gig.band || gig.project}`);
    if (gig.status === 'private') parts.push('Private event');
    if (gig.url) parts.push(gig.url);
    parts.push('Generated from jordantuppermusic.com performance calendar.');
    return parts.join('\n');
  }

  function googleCalendarUrl(gig) {
    const start = getGigStart(gig);
    const end = getGigEnd(gig);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: gigTitle(gig),
      dates: `${toGoogleDate(start)}/${toGoogleDate(end)}`,
      details: gigDescription(gig),
      location: gigLocation(gig),
      ctz: 'America/Chicago'
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function buildICS(gigs) {
    const now = new Date();
    const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Jordan Tupper Music//Performance Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Jordan Tupper Performances',
      'X-WR-CALDESC:Night Hog, Cover 6, and Standley, Tupper & Petersen performances',
      'X-WR-TIMEZONE:America/Chicago'
    ];

    gigs.forEach((gig, idx) => {
      const start = getGigStart(gig);
      const end = getGigEnd(gig);
      const uid = `${gig.date}-${(gig.band || 'jtm').replace(/[^a-z0-9]/gi, '').toLowerCase()}-${(gig.venue || 'gig').replace(/[^a-z0-9]/gi, '').toLowerCase()}-${idx}@jordantuppermusic.com`;
      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;TZID=America/Chicago:${toICSDate(start)}`,
        `DTEND;TZID=America/Chicago:${toICSDate(end)}`,
        `SUMMARY:${normalizeText(gigTitle(gig))}`,
        `LOCATION:${normalizeText(gigLocation(gig))}`,
        `DESCRIPTION:${normalizeText(gigDescription(gig))}`,
        'END:VEVENT'
      );
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  function installGoogleLinks(containerSelector = '.gig') {
    document.querySelectorAll(containerSelector).forEach((row) => {
      if (row.querySelector('.add-google-calendar')) return;
      const gig = row.__gigData;
      if (!gig) return;
      const link = document.createElement('a');
      link.className = 'add-google-calendar';
      link.href = googleCalendarUrl(gig);
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Add to Google Calendar';
      row.appendChild(link);
    });
  }

  function createDownloadButton(gigs, targetId = 'calendar-download') {
    const target = document.getElementById(targetId);
    if (!target) return;
    const ics = buildICS(gigs);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    target.href = url;
    target.download = 'jordan-tupper-performances.ics';
    target.textContent = 'Download performance calendar (.ics)';
  }

  window.JTCalendarExport = {
    googleCalendarUrl,
    buildICS,
    createDownloadButton,
    installGoogleLinks
  };
})();
