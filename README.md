# Jordan Tupper Music merged calendar

Upload these files to the root of the `jordantuppermusic.com` GitHub repo:

- `index.html`
- `jordan-calendar.js`

This page reads these three public feed files:

- `https://nighthogbr.com/gigs-feed.js`
- `https://cover6band.com/gigs-feed.js`
- `https://www.batonrougejazz.com/gigs-feed.js`

Do not edit Jordan Tupper Music gigs manually anymore. Update dates on each band's `gigs-feed.js` file, and the Jordan site will pull them together, sort them, hide past dates, and generate event schema.

Important: the band sites must already have their `gigs-feed.js` files uploaded and published.
