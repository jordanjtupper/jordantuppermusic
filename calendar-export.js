/* Jordan Tupper Music calendar export helper
   Safe version: waits for the visible gig list to render before adding Google Calendar links.
   If the main calendar fails to load, this file will not break the page. */
(function () {
  function pad(n) { return String(n).padStart(2, '0'); }

  function parseDateFromGig(gig) {
    const raw = gig.getAttribute('data-date') || gig.dataset.date;
    if (!raw) return null;
    const d = new Date(raw + 'T00:00:00');
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function extractText(gig, selector) {
    const el = gig.querySelector(selector);
    return el ? el.textContent.trim() : '';
  }

  function normalizeTimeText(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
  }

  function parseTimeRange(timeText) {
    const clean = normalizeTimeText(timeText).toLowerCase();
    if (!clean || clean.includes('tba') || clean.includes('private')) {
      return { startHour: 19, startMinute: 0, endHour: 22, endMinute: 0 };
    }

    const parts = clean.split(/\s*[–-]\s*/);
    function parseOne(t, fallbackAmPm) {
      const m = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      if (!m) return null;
      let hour = parseInt(m[1], 10);
      const minute = m[2] ? parseInt(m[2], 10) : 0;
      const ampm = m[3] || fallbackAmPm || '';
      if (ampm === 'pm' && hour !== 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;
      return { hour, minute, ampm };
    }

    const endAmPmMatch = parts[1] ? parts[1].match(/(am|pm)/i) : null;
    const implied = endAmPmMatch ? endAmPmMatch[1].toLowerCase() : undefined;
    const start = parseOne(parts[0], implied) || { hour: 19, minute: 0 };
    const end = parseOne(parts[1] || '', undefined) || { hour: start.hour + 3, minute: start.minute };
    return { startHour: start.hour, startMinute: start.minute, endHour: end.hour, endMinute: end.minute };
  }

  function toGoogleDate(date, hour, minute) {
    const d = new Date(date);
    d.setHours(hour, minute, 0, 0);
    // Google accepts UTC compact timestamps. Convert local to UTC.
    return d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      '00Z';
  }

  function addButtons() {
    const gigs = Array.from(document.querySelectorAll('.gig'));
    if (!gigs.length) return false;

    gigs.forEach(function (gig) {
      if (gig.querySelector('.add-google-calendar')) return;

      const date = parseDateFromGig(gig);
      if (!date) return;

      const venue = extractText(gig, '.venue') || extractText(gig, '.gig-venue h3') || 'Performance';
      const place = extractText(gig, '.place') || extractText(gig, '.gig-venue p') || 'Baton Rouge, LA';
      const timeText = extractText(gig, '.time') || extractText(gig, '.gig-time') || '';
      const band = extractText(gig, '.band-tag') || 'Jordan Tupper';
      const times = parseTimeRange(timeText);

      const start = toGoogleDate(date, times.startHour, times.startMinute);
      let endDate = new Date(date);
      if (times.endHour < times.startHour) endDate.setDate(endDate.getDate() + 1);
      const end = toGoogleDate(endDate, times.endHour, times.endMinute);

      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: band + ' at ' + venue,
        dates: start + '/' + end,
        details: 'Performance listed at jordantuppermusic.com',
        location: venue + ', ' + place
      });

      const link = document.createElement('a');
      link.className = 'add-google-calendar';
      link.href = 'https://calendar.google.com/calendar/render?' + params.toString();
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Add to Google Calendar';
      link.style.display = 'inline-block';
      link.style.marginTop = '6px';
      link.style.fontSize = '0.8rem';

      const info = gig.querySelector('.info') || gig.querySelector('.gig-venue') || gig;
      info.appendChild(link);
    });

    return true;
  }

  let tries = 0;
  const timer = setInterval(function () {
    tries += 1;
    if (addButtons() || tries > 30) clearInterval(timer);
  }, 300);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addButtons);
  } else {
    addButtons();
  }
})();
