(function () {
  const BAND_CONFIG = {
    nightHog: {
      label: "Night Hog",
      className: "nighthog",
      siteUrl: "https://nighthogbr.com",
      gigs: () => window.NIGHT_HOG_GIGS || []
    },
    cover6: {
      label: "Cover 6",
      className: "cover6",
      siteUrl: "https://cover6band.com",
      gigs: () => window.COVER6_GIGS || []
    },
    jazz: {
      label: "Standley, Tupper & Petersen",
      className: "jazz",
      siteUrl: "https://www.batonrougejazz.com",
      gigs: () => window.BATONROUGEJAZZ_GIGS || []
    }
  };

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function dateForSort(gig) {
    const time = gig.startTime && /^\d{2}:\d{2}$/.test(gig.startTime) ? gig.startTime : "23:59";
    return new Date(`${gig.date}T${time}:00`);
  }

  function dateForExpiration(gig) {
    const endTime = gig.endTime && /^\d{2}:\d{2}$/.test(gig.endTime) ? gig.endTime : (gig.startTime || "23:59");
    let endDate = new Date(`${gig.date}T${endTime}:00`);
    if (gig.startTime && gig.endTime && gig.endTime < gig.startTime) {
      endDate.setDate(endDate.getDate() + 1);
    }
    if (Number.isNaN(endDate.getTime())) {
      endDate = new Date(`${gig.date}T23:59:59`);
    }
    return endDate;
  }

  function formatDate(gig) {
    const d = new Date(`${gig.date}T12:00:00`);
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const day = d.getDate();
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    return { month, day, weekday };
  }

  function formatClock(time) {
    if (!time || !/^\d{2}:\d{2}$/.test(time)) return "";
    const [h, m] = time.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${pad(m)} ${suffix}`;
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

  function collectGigs() {
    return Object.values(BAND_CONFIG).flatMap((config) => {
      return config.gigs().map((gig) => ({
        ...gig,
        band: config.label,
        bandClass: config.className,
        siteUrl: config.siteUrl
      }));
    });
  }

  function renderGig(gig) {
    const { month, day, weekday } = formatDate(gig);
    const place = formatPlace(gig);
    const time = formatTime(gig);
    const venue = gig.venue || "TBA";

    const row = document.createElement("div");
    row.className = "gig";
    row.dataset.date = gig.date;
    row.dataset.band = gig.band;

    row.innerHTML = `
      <div class="date">${month} ${day}<span class="day">${weekday}</span></div>
      <div class="info">
        <div class="venue">${escapeHtml(venue)}</div>
        <div class="place">${escapeHtml(place)}</div>
        <div class="time">${escapeHtml(time)}</div>
      </div>
      <div class="band-tag ${gig.bandClass}">${escapeHtml(gig.band)}</div>
    `;
    return row;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function injectSchema(gigs) {
    const graph = gigs.map((gig) => {
      const startDate = gig.startTime ? `${gig.date}T${gig.startTime}:00-05:00` : gig.date;
      let endDate;
      if (gig.endTime) {
        const endDay = new Date(`${gig.date}T12:00:00`);
        if (gig.startTime && gig.endTime < gig.startTime) endDay.setDate(endDay.getDate() + 1);
        endDate = `${endDay.getFullYear()}-${pad(endDay.getMonth() + 1)}-${pad(endDay.getDate())}T${gig.endTime}:00-05:00`;
      }
      const event = {
        "@type": "MusicEvent",
        name: `${gig.band} — ${gig.status === "private" ? gig.venue : `Live at ${gig.venue}`}`,
        startDate,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        performer: {
          "@type": "MusicGroup",
          name: gig.band,
          url: gig.siteUrl
        },
        location: {
          "@type": "Place",
          name: gig.venue || "TBA",
          address: {
            "@type": "PostalAddress",
            addressLocality: gig.city || "Baton Rouge",
            addressRegion: gig.state || "LA",
            addressCountry: "US"
          }
        }
      };
      if (endDate) event.endDate = endDate;
      if (gig.status !== "private") {
        event.offers = {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://jordantuppermusic.com/#shows"
        };
      }
      return event;
    });

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
    document.head.appendChild(script);
  }

  function render() {
    const list = document.getElementById("merged-gig-list");
    const empty = document.getElementById("merged-gig-empty");
    if (!list) return;

    const now = new Date();
    const gigs = collectGigs()
      .filter((gig) => gig.date && dateForExpiration(gig) >= now)
      .sort((a, b) => dateForSort(a) - dateForSort(b));

    list.innerHTML = "";
    if (!gigs.length) {
      if (empty) empty.style.display = "block";
      return;
    }
    if (empty) empty.style.display = "none";

    gigs.forEach((gig) => list.appendChild(renderGig(gig)));
    injectSchema(gigs);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
