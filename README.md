# Jordan Tupper Music Google Calendar Export

Upload `calendar-export.js` to the root of `jordantuppermusic.com`.

Then add this before the closing `</body>` tag, after `jordan-calendar.js`:

```html
<script src="/calendar-export.js"></script>
```

Add this near the Upcoming Shows heading:

```html
<a id="calendar-download" class="calendar-download" href="#">Download performance calendar (.ics)</a>
```

The cleanest long-term setup is to have `jordan-calendar.js` expose the merged gigs as:

```js
window.JORDAN_ALL_GIGS = mergedGigs;
window.JTCalendarExport.createDownloadButton(window.JORDAN_ALL_GIGS);
```

For Google Calendar sharing with Amanda:

1. Upload the site.
2. Visit jordantuppermusic.com.
3. Download `jordan-tupper-performances.ics`.
4. In Google Calendar, create or open a calendar named `Jordan Tupper Performances`.
5. Import the `.ics` file into that calendar.
6. Share that Google Calendar with Amanda.

For a true live subscription, host a static file at:

```text
https://jordantuppermusic.com/jordan-tupper-performances.ics
```

Then Amanda can subscribe to that URL. The next step would be adding a GitHub Action to regenerate that `.ics` file automatically from the three gig feeds.
