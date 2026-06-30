(function () {
  const FEEDS = [
    {
      label: "Night Hog",
      className: "nighthog",
      siteUrl: "https://nighthogbr.com",
      globalName: "NIGHT_HOG_GIGS",
      urls: ["https://nighthogbr.com/gigs-feed.js", "https://www.nighthogbr.com/gigs-feed.js"]
    },
    {
      label: "Cover 6",
      className: "cover6",
      siteUrl: "https://cover6band.com",
      globalName: "COVER6_GIGS",
      urls: ["https://cover6band.com/gigs-feed.js", "https://www.cover6band.com/gigs-feed.js"]
    },
    {
      label: "Standley, Tupper & Petersen",
      className: "jazz",
      siteUrl: "https://batonrougejazz.com",
      globalName: "BATONROUGEJAZZ_GIGS",
      urls: ["https://batonrougejazz.com/gigs-feed.js", "https://www.batonrougejazz.com/gigs-feed.js"]
    }
  ];

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
      <div class="date">${month} ${day}<span class="day">${weekday}</span></div>
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
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = url;
      s.async = false;
      s.onload = () => resolve(url);
      s.onerror = () => { s.remove(); reject(new Error(url)); };
      document.head.appendChild(s);
    });
  }
  async function loadFeed(feed) {
    if (Array.isArray(window[feed.globalName])) return true;
    for (const url of feed.urls) {
      try {
        await loadScript(url);
        if (Array.isArray(window[feed.globalName])) return true;
      } catch (_) {}
    }
    return false;
  }
  async function render() {
    const list = document.getElementById("merged-gig-list") || document.querySelector(".gig-list");
    const empty = document.getElementById("merged-gig-empty");
    if (!list) return;
    list.innerHTML = '<p class="calendar-loading">Loading upcoming shows…</p>';
    const loaded = await Promise.all(FEEDS.map(loadFeed));
    const missing = FEEDS.filter((_, i) => !loaded[i]).map(f => f.label);
    const all = FEEDS.flatMap(feed => (window[feed.globalName] || []).map(gig => ({ ...gig, band: feed.label, bandClass: feed.className, siteUrl: feed.siteUrl })));
    const now = new Date();
    const gigs = all.filter(gig => gig.date && dateForExpiration(gig) >= now).sort((a, b) => dateForSort(a) - dateForSort(b));
    list.innerHTML = "";
    if (!gigs.length) {
      list.innerHTML = `<p class="calendar-loading">No upcoming gigs loaded.${missing.length ? " Missing feeds: " + escapeHtml(missing.join(", ")) + "." : ""}</p>`;
      if (empty) empty.style.display = "none";
      return;
    }
    if (empty) empty.style.display = "none";
    gigs.forEach(gig => list.appendChild(renderGig(gig)));
    if (missing.length) {
      const note = document.createElement("p");
      note.className = "calendar-loading";
      note.style.marginTop = "1rem";
      note.textContent = `Some feeds did not load: ${missing.join(", ")}.`;
      list.appendChild(note);
    }
    injectSchema(gigs);
    document.dispatchEvent(new CustomEvent("jtm:gigs-rendered", { detail: { gigs } }));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
