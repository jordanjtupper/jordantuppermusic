// Jordan Tupper Music merged calendar
// Bulletproof version: tries live feeds first, but uses an embedded fallback so the page never stays stuck on "Loading".
(function () {
  const FEEDS = [
    { label: "Night Hog", className: "nighthog", siteUrl: "https://nighthogbr.com", globalName: "NIGHT_HOG_GIGS", urls: ["https://nighthogbr.com/gigs-feed.js", "https://www.nighthogbr.com/gigs-feed.js"] },
    { label: "Cover 6", className: "cover6", siteUrl: "https://cover6band.com", globalName: "COVER6_GIGS", urls: ["https://cover6band.com/gigs-feed.js", "https://www.cover6band.com/gigs-feed.js"] },
    { label: "Standley, Tupper & Petersen", className: "jazz", siteUrl: "https://batonrougejazz.com", globalName: "BATONROUGEJAZZ_GIGS", urls: ["https://batonrougejazz.com/gigs-feed.js", "https://www.batonrougejazz.com/gigs-feed.js"] }
  ];

  const FALLBACK_GIGS = [
  {
    "date": "2026-06-12",
    "startTime": "20:00",
    "endTime": "23:00",
    "venue": "Scoreboards",
    "city": "Denham Springs",
    "state": "LA",
    "status": "public",
    "band": "Night Hog",
    "bandClass": "nighthog",
    "siteUrl": "https://nighthogbr.com"
  },
  {
    "date": "2026-06-13",
    "startTime": "19:00",
    "endTime": "22:00",
    "venue": "BeerBellys",
    "city": "Plaquemine",
    "state": "LA",
    "status": "public",
    "band": "Night Hog",
    "bandClass": "nighthog",
    "siteUrl": "https://nighthogbr.com"
  },
  {
    "date": "2026-06-19",
    "startTime": "19:00",
    "endTime": "22:00",
    "venue": "Big J's Side Porch",
    "city": "Clinton",
    "state": "LA",
    "status": "public",
    "band": "Night Hog",
    "bandClass": "nighthog",
    "siteUrl": "https://nighthogbr.com"
  },
  {
    "date": "2026-06-20",
    "startTime": "21:00",
    "endTime": "00:00",
    "venue": "Brickyard South",
    "city": "Baton Rouge",
    "state": "LA",
    "status": "public",
    "band": "Night Hog",
    "bandClass": "nighthog",
    "siteUrl": "https://nighthogbr.com"
  },
  {
    "date": "2026-06-27",
    "startTime": "21:00",
    "endTime": "00:00",
    "venue": "The Moonlight Inn",
    "city": "French Settlement",
    "state": "LA",
    "status": "public",
    "band": "Night Hog",
    "bandClass": "nighthog",
    "siteUrl": "https://nighthogbr.com"
  },
  {
    "date": "2026-08-28",
    "startTime": "20:00",
    "endTime": "23:00",
    "venue": "Charlie's Lounge",
    "city": "Addis",
    "state": "LA",
    "status": "public",
    "band": "Night Hog",
    "bandClass": "nighthog",
    "siteUrl": "https://nighthogbr.com"
  },
  {
    "date": "2026-08-29",
    "startTime": "21:00",
    "endTime": "00:00",
    "venue": "The Moonlight Inn",
    "city": "French Settlement",
    "state": "LA",
    "status": "public",
    "band": "Night Hog",
    "bandClass": "nighthog",
    "siteUrl": "https://nighthogbr.com"
  },
  {
    "date": "2026-10-10",
    "startTime": "20:00",
    "endTime": "23:00",
    "venue": "Private Event",
    "city": "Baton Rouge",
    "state": "LA",
    "status": "private",
    "displayTime": "TBA",
    "band": "Night Hog",
    "bandClass": "nighthog",
    "siteUrl": "https://nighthogbr.com"
  },
  {
    "date": "2026-10-24",
    "startTime": "21:00",
    "endTime": "00:00",
    "venue": "The Moonlight Inn",
    "city": "French Settlement",
    "state": "LA",
    "status": "public",
    "band": "Night Hog",
    "bandClass": "nighthog",
    "siteUrl": "https://nighthogbr.com"
  },
  {
    "date": "2026-12-19",
    "startTime": "21:00",
    "endTime": "00:00",
    "venue": "The Moonlight Inn",
    "city": "French Settlement",
    "state": "LA",
    "status": "public",
    "band": "Night Hog",
    "bandClass": "nighthog",
    "siteUrl": "https://nighthogbr.com"
  },
  {
    "date": "2026-06-20",
    "startTime": "15:00",
    "endTime": "18:00",
    "venue": "Reno's on the River",
    "city": "",
    "state": "LA",
    "displayLocation": "Louisiana",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-07-03",
    "startTime": "18:00",
    "endTime": "21:00",
    "venue": "Tequila's",
    "city": "",
    "state": "LA",
    "displayLocation": "Louisiana",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-07-04",
    "startTime": "20:30",
    "endTime": "23:30",
    "venue": "Phil Brady's",
    "city": "Baton Rouge",
    "state": "LA",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-07-18",
    "startTime": "18:00",
    "endTime": "21:00",
    "venue": "Big J's Side Porch",
    "city": "",
    "state": "LA",
    "displayLocation": "Louisiana",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-07-24",
    "startTime": "21:00",
    "endTime": "01:00",
    "venue": "Crazy Dave's",
    "city": "Livingston",
    "state": "LA",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-07-25",
    "startTime": "18:00",
    "endTime": "22:00",
    "venue": "T Rivers Restaurant and Lounge",
    "city": "",
    "state": "LA",
    "displayLocation": "Louisiana",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-07-31",
    "startTime": "20:30",
    "endTime": "00:30",
    "venue": "Locals",
    "city": "",
    "state": "LA",
    "displayLocation": "Louisiana",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-08-01",
    "startTime": "18:00",
    "endTime": "21:00",
    "venue": "Tequila's",
    "city": "Denham Springs",
    "state": "LA",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-08-08",
    "startTime": "",
    "endTime": "",
    "venue": "Sun Outdoors RV Resort",
    "city": "",
    "state": "LA",
    "displayLocation": "Louisiana",
    "displayTime": "TBA",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-08-14",
    "startTime": "21:00",
    "endTime": "01:00",
    "venue": "Swamp Chicken",
    "city": "",
    "state": "LA",
    "displayLocation": "Louisiana",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-08-15",
    "startTime": "18:00",
    "endTime": "21:00",
    "venue": "Tequila's",
    "city": "Zachary",
    "state": "LA",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-08-22",
    "startTime": "18:00",
    "endTime": "21:00",
    "venue": "Victoria's",
    "city": "",
    "state": "LA",
    "displayLocation": "Louisiana",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-08-29",
    "startTime": "18:00",
    "endTime": "21:00",
    "venue": "Big J's Side Porch",
    "city": "",
    "state": "LA",
    "displayLocation": "Louisiana",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-09-05",
    "startTime": "11:30",
    "endTime": "14:30",
    "venue": "Patriot RV Campground",
    "city": "Livingston",
    "state": "LA",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-09-18",
    "startTime": "20:00",
    "endTime": "00:00",
    "venue": "Ragon's",
    "city": "Clinton",
    "state": "LA",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-09-19",
    "startTime": "21:00",
    "endTime": "00:00",
    "venue": "T's Country Bar",
    "city": "",
    "state": "LA",
    "displayLocation": "Louisiana",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-11-07",
    "startTime": "11:30",
    "endTime": "14:30",
    "venue": "Patriot RV Campground",
    "city": "Livingston",
    "state": "LA",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-11-21",
    "startTime": "21:00",
    "endTime": "00:00",
    "venue": "T's Country Bar",
    "city": "",
    "state": "LA",
    "displayLocation": "Louisiana",
    "status": "public",
    "band": "Cover 6",
    "bandClass": "cover6",
    "siteUrl": "https://cover6band.com"
  },
  {
    "date": "2026-06-21",
    "startTime": "10:00",
    "endTime": "13:00",
    "venue": "City Cafe",
    "city": "Baton Rouge",
    "state": "LA",
    "displayTime": "Brunch",
    "detailsHtml": "Jazz Brunch \u00b7 4710 O'Neal Ln, Baton Rouge, LA \u00b7 <a href=\"https://citycafebr.net\" rel=\"noopener\" target=\"_blank\">citycafebr.net</a>",
    "status": "public",
    "band": "Standley, Tupper & Petersen",
    "bandClass": "jazz",
    "siteUrl": "https://batonrougejazz.com"
  },
  {
    "date": "2026-06-24",
    "startTime": "18:00",
    "endTime": "22:00",
    "venue": "The Brakes Bar",
    "city": "Baton Rouge",
    "state": "LA",
    "detailsHtml": "5412 Government St, Baton Rouge, LA \u00b7 <a href=\"https://spokeandhubbr.com/brakes-bar\" rel=\"noopener\" target=\"_blank\">spokeandhubbr.com</a> \u00b7 <a href=\"https://www.facebook.com/thebrakesbarbr/\" rel=\"noopener\" target=\"_blank\">Facebook</a>",
    "status": "public",
    "band": "Standley, Tupper & Petersen",
    "bandClass": "jazz",
    "siteUrl": "https://batonrougejazz.com"
  },
  {
    "date": "2026-06-28",
    "startTime": "10:00",
    "endTime": "13:00",
    "venue": "Copa",
    "city": "Baton Rouge",
    "state": "LA",
    "displayTime": "Brunch",
    "detailsHtml": "Jazz Brunch \u00b7 Baton Rouge, LA",
    "status": "public",
    "band": "Standley, Tupper & Petersen",
    "bandClass": "jazz",
    "siteUrl": "https://batonrougejazz.com"
  },
  {
    "date": "2026-07-01",
    "startTime": "18:00",
    "endTime": "22:00",
    "venue": "The Brakes Bar",
    "city": "Baton Rouge",
    "state": "LA",
    "detailsHtml": "5412 Government St, Baton Rouge, LA \u00b7 <a href=\"https://spokeandhubbr.com/brakes-bar\" rel=\"noopener\" target=\"_blank\">spokeandhubbr.com</a> \u00b7 <a href=\"https://www.facebook.com/thebrakesbarbr/\" rel=\"noopener\" target=\"_blank\">Facebook</a>",
    "status": "public",
    "band": "Standley, Tupper & Petersen",
    "bandClass": "jazz",
    "siteUrl": "https://batonrougejazz.com"
  },
  {
    "date": "2026-07-15",
    "startTime": "18:00",
    "endTime": "22:00",
    "venue": "The Brakes Bar",
    "city": "Baton Rouge",
    "state": "LA",
    "detailsHtml": "5412 Government St, Baton Rouge, LA \u00b7 <a href=\"https://spokeandhubbr.com/brakes-bar\" rel=\"noopener\" target=\"_blank\">spokeandhubbr.com</a> \u00b7 <a href=\"https://www.facebook.com/thebrakesbarbr/\" rel=\"noopener\" target=\"_blank\">Facebook</a>",
    "status": "public",
    "band": "Standley, Tupper & Petersen",
    "bandClass": "jazz",
    "siteUrl": "https://batonrougejazz.com"
  },
  {
    "date": "2026-07-22",
    "startTime": "18:00",
    "endTime": "22:00",
    "venue": "The Brakes Bar",
    "city": "Baton Rouge",
    "state": "LA",
    "detailsHtml": "5412 Government St, Baton Rouge, LA \u00b7 <a href=\"https://spokeandhubbr.com/brakes-bar\" rel=\"noopener\" target=\"_blank\">spokeandhubbr.com</a> \u00b7 <a href=\"https://www.facebook.com/thebrakesbarbr/\" rel=\"noopener\" target=\"_blank\">Facebook</a>",
    "status": "public",
    "band": "Standley, Tupper & Petersen",
    "bandClass": "jazz",
    "siteUrl": "https://batonrougejazz.com"
  },
  {
    "date": "2026-07-26",
    "startTime": "10:00",
    "endTime": "13:00",
    "venue": "Copa",
    "city": "Baton Rouge",
    "state": "LA",
    "detailsHtml": "Baton Rouge, LA",
    "status": "public",
    "band": "Standley, Tupper & Petersen",
    "bandClass": "jazz",
    "siteUrl": "https://batonrougejazz.com"
  },
  {
    "date": "2026-07-29",
    "startTime": "18:00",
    "endTime": "22:00",
    "venue": "The Brakes Bar",
    "city": "Baton Rouge",
    "state": "LA",
    "detailsHtml": "5412 Government St, Baton Rouge, LA \u00b7 <a href=\"https://spokeandhubbr.com/brakes-bar\" rel=\"noopener\" target=\"_blank\">spokeandhubbr.com</a> \u00b7 <a href=\"https://www.facebook.com/thebrakesbarbr/\" rel=\"noopener\" target=\"_blank\">Facebook</a>",
    "status": "public",
    "band": "Standley, Tupper & Petersen",
    "bandClass": "jazz",
    "siteUrl": "https://batonrougejazz.com"
  },
  {
    "date": "2026-08-08",
    "startTime": "11:00",
    "endTime": "14:00",
    "venue": "Community Grocery",
    "city": "Woodville",
    "state": "MS",
    "detailsHtml": "525 Commercial Row, Woodville, MS \u00b7 <a href=\"https://communitygroceryms.com\" rel=\"noopener\" target=\"_blank\">communitygroceryms.com</a> \u00b7 <a href=\"https://www.facebook.com/communitygroceryms/\" rel=\"noopener\" target=\"_blank\">Facebook</a>",
    "status": "public",
    "band": "Standley, Tupper & Petersen",
    "bandClass": "jazz",
    "siteUrl": "https://batonrougejazz.com"
  },
  {
    "date": "2026-08-09",
    "startTime": "10:00",
    "endTime": "13:00",
    "venue": "Copa",
    "city": "Baton Rouge",
    "state": "LA",
    "detailsHtml": "Baton Rouge, LA",
    "status": "public",
    "band": "Standley, Tupper & Petersen",
    "bandClass": "jazz",
    "siteUrl": "https://batonrougejazz.com"
  },
  {
    "date": "2026-08-22",
    "startTime": "11:00",
    "endTime": "14:00",
    "venue": "Community Grocery",
    "city": "Woodville",
    "state": "MS",
    "detailsHtml": "525 Commercial Row, Woodville, MS \u00b7 <a href=\"https://communitygroceryms.com\" rel=\"noopener\" target=\"_blank\">communitygroceryms.com</a> \u00b7 <a href=\"https://www.facebook.com/communitygroceryms/\" rel=\"noopener\" target=\"_blank\">Facebook</a>",
    "status": "public",
    "band": "Standley, Tupper & Petersen",
    "bandClass": "jazz",
    "siteUrl": "https://batonrougejazz.com"
  },
  {
    "date": "2026-09-15",
    "startTime": "17:30",
    "endTime": "20:30",
    "venue": "Bin 77",
    "city": "Baton Rouge",
    "state": "LA",
    "detailsHtml": "Baton Rouge, LA",
    "status": "public",
    "band": "Standley, Tupper & Petersen",
    "bandClass": "jazz",
    "siteUrl": "https://batonrougejazz.com"
  },
  {
    "date": "2026-12-12",
    "venue": "Private Wedding",
    "city": "New Orleans",
    "state": "LA",
    "displayTime": "Private Event",
    "detailsHtml": "New Orleans, LA",
    "status": "private",
    "band": "Standley, Tupper & Petersen",
    "bandClass": "jazz",
    "siteUrl": "https://batonrougejazz.com"
  }
];

  const FEED_TIMEOUT_MS = 3500;
  function pad(value) { return String(value).padStart(2, "0"); }
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function parseDateTime(gig, time, fallback) {
    const t = time && /^\d{2}:\d{2}$/.test(time) ? time : fallback;
    const d = new Date(`${gig.date}T${t}:00`);
    return Number.isNaN(d.getTime()) ? new Date(`${gig.date}T23:59:59`) : d;
  }
  function dateForSort(gig) { return parseDateTime(gig, gig.startTime, "23:59"); }
  function dateForExpiration(gig) {
    let end = parseDateTime(gig, gig.endTime || gig.startTime, "23:59");
    if (gig.startTime && gig.endTime && gig.endTime < gig.startTime) end.setDate(end.getDate() + 1);
    return end;
  }
  function formatDate(gig) {
    const d = new Date(`${gig.date}T12:00:00`);
    return {
      month: d.toLocaleDateString("en-US", { month: "short" }),
      day: d.getDate(),
      weekday: d.toLocaleDateString("en-US", { weekday: "short" })
    };
  }
  function formatClock(time) {
    if (!time || !/^\d{2}:\d{2}$/.test(time)) return "";
    const [h, m] = time.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${pad(m)} ${suffix}`;
  }
  function formatTime(gig) {
    if (gig.displayTime) return gig.displayTime;
    if (gig.startTime && gig.endTime) return `${formatClock(gig.startTime)} – ${formatClock(gig.endTime)}`;
    if (gig.startTime) return formatClock(gig.startTime);
    return "TBA";
  }
  function formatPlace(gig) {
    if (gig.displayLocation) return gig.displayLocation;
    if (gig.city && gig.state) return `${gig.city}, ${gig.state}`;
    if (gig.city) return gig.city;
    if (gig.state) return gig.state;
    return "Louisiana";
  }
  function normalizeExternal(feed) {
    return (window[feed.globalName] || []).map(gig => ({
      ...gig,
      band: feed.label,
      bandClass: feed.className,
      siteUrl: feed.siteUrl
    }));
  }
  function renderGig(gig) {
    const { month, day, weekday } = formatDate(gig);
    const row = document.createElement("div");
    row.className = "gig";
    row.dataset.date = gig.date;
    row.dataset.band = gig.band;
    row.dataset.venue = gig.venue || "";
    row.dataset.place = formatPlace(gig);
    row.dataset.time = formatTime(gig);
    row.dataset.startTime = gig.startTime || "";
    row.dataset.endTime = gig.endTime || "";
    row.innerHTML = `
      <div class="date">${escapeHtml(month)} ${escapeHtml(day)}<span class="day">${escapeHtml(weekday)}</span></div>
      <div class="info">
        <div class="venue">${escapeHtml(gig.venue || "TBA")}</div>
        <div class="place">${escapeHtml(formatPlace(gig))}</div>
        <div class="time">${escapeHtml(formatTime(gig))}</div>
      </div>
      <div class="band-tag ${escapeHtml(gig.bandClass)}">${escapeHtml(gig.band)}</div>
    `;
    return row;
  }
  function injectSchema(gigs) {
    document.querySelectorAll('script[data-generated="jtm-events"]').forEach(s => s.remove());
    const graph = gigs.map(gig => {
      const startDate = gig.startTime ? `${gig.date}T${gig.startTime}:00-05:00` : gig.date;
      let endDate;
      if (gig.endTime) {
        const endDay = new Date(`${gig.date}T12:00:00`);
        if (gig.startTime && gig.endTime < gig.startTime) endDay.setDate(endDay.getDate() + 1);
        endDate = `${endDay.getFullYear()}-${pad(endDay.getMonth()+1)}-${pad(endDay.getDate())}T${gig.endTime}:00-05:00`;
      }
      const event = {
        "@type": "MusicEvent",
        name: `${gig.band} — ${gig.status === "private" ? gig.venue : `Live at ${gig.venue}`}`,
        startDate,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        performer: { "@type": "MusicGroup", name: gig.band, url: gig.siteUrl },
        location: { "@type": "Place", name: gig.venue || "TBA", address: { "@type": "PostalAddress", addressLocality: gig.city || "Baton Rouge", addressRegion: gig.state || "LA", addressCountry: "US" } }
      };
      if (endDate) event.endDate = endDate;
      if (gig.status !== "private") event.offers = { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock", url: "https://jordantuppermusic.com/#shows" };
      return event;
    });
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.generated = "jtm-events";
    script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
    document.head.appendChild(script);
  }
  function loadScriptWithTimeout(url) {
    return new Promise(resolve => {
      const s = document.createElement("script");
      let done = false;
      const finish = ok => { if (done) return; done = true; clearTimeout(timer); resolve(ok); };
      const sep = url.includes("?") ? "&" : "?";
      s.src = `${url}${sep}v=${Date.now()}`;
      s.async = true;
      s.onload = () => finish(true);
      s.onerror = () => { s.remove(); finish(false); };
      const timer = setTimeout(() => { s.remove(); finish(false); }, FEED_TIMEOUT_MS);
      document.head.appendChild(s);
    });
  }
  async function loadFeed(feed) {
    if (Array.isArray(window[feed.globalName])) return true;
    for (const url of feed.urls) {
      const ok = await loadScriptWithTimeout(url);
      if (ok && Array.isArray(window[feed.globalName])) return true;
    }
    return false;
  }
  function getUpcoming(gigs) {
    const now = new Date();
    return gigs.filter(gig => gig.date && dateForExpiration(gig) >= now).sort((a, b) => dateForSort(a) - dateForSort(b));
  }
  function paint(list, empty, gigs, sourceNote) {
    list.innerHTML = "";
    if (!gigs.length) {
      list.innerHTML = '<p class="calendar-loading">No upcoming gigs loaded.</p>';
      if (empty) empty.style.display = "none";
      return;
    }
    if (empty) empty.style.display = "none";
    gigs.forEach(gig => list.appendChild(renderGig(gig)));
    if (sourceNote) {
      const note = document.createElement("p");
      note.className = "calendar-loading";
      note.style.marginTop = "1rem";
      note.textContent = sourceNote;
      list.appendChild(note);
    }
    injectSchema(gigs);
    document.dispatchEvent(new CustomEvent("jtm:gigs-rendered", { detail: { gigs } }));
  }
  async function render() {
    const list = document.getElementById("merged-gig-list") || document.querySelector(".gig-list");
    const empty = document.getElementById("merged-gig-empty");
    if (!list) return;

    // Show fallback immediately so the site never appears broken.
    const fallbackUpcoming = getUpcoming(FALLBACK_GIGS);
    paint(list, empty, fallbackUpcoming, "");

    // Then try to refresh from the three live band feeds.
    const loaded = await Promise.all(FEEDS.map(loadFeed));
    const external = FEEDS.flatMap(feed => normalizeExternal(feed));
    if (external.length) {
      const missing = FEEDS.filter((_, i) => !loaded[i]).map(f => f.label);
      const note = missing.length ? `Calendar loaded. Some feeds did not respond: ${missing.join(", ")}.` : "";
      paint(list, empty, getUpcoming(external), note);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
