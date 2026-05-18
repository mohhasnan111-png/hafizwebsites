# Hafiz Websites — Client Tracker

A premium mobile-first PWA for tracking web design clients, deadlines, payments, and revisions.

## What's included

- `index.html` — the full app (HTML + CSS + JS, no build step required)
- `manifest.json` — makes it installable as an app
- `service-worker.js` — enables offline mode
- `icon.svg` — master logo
- `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` — app icons

## Deploy in 5 steps (about 20 minutes total)

### 1. Create a GitHub account
Go to https://github.com → Sign up.

### 2. Create a new repository
Click the green **New** button. Name it `client-tracker`. Make it **Public**. Don't tick "Add a README." Click **Create repository**.

### 3. Upload all files
On your empty repo page, click **uploading an existing file**. Drag in ALL files from this folder. Click **Commit changes**.

### 4. Deploy with Netlify (free)
- Go to https://netlify.com → Sign up with your GitHub account
- Click **Add new site** → **Import an existing project** → **Deploy with GitHub**
- Pick your `client-tracker` repo
- Leave settings as default. Click **Deploy**
- After 30 seconds you get a URL like `https://something-random.netlify.app`
- Rename under Site settings → Change site name (e.g. `hafiz-clients`)

### 5. Install on your Android phone
- Open the Netlify URL in **Chrome on your phone**
- Tap the three-dot menu → **Add to Home screen** → confirm
- The Hafiz Websites icon appears on your home screen and opens like a real app

## Updating the app later

Edit any file on GitHub (or upload new versions). Netlify auto-rebuilds within a minute. To force the cached version on phones to update, increase the `CACHE_VERSION` value in `service-worker.js` (e.g. change `hafiz-v1` to `hafiz-v2`).

## Google Sheets sync (optional but recommended)

To back up your clients automatically to a Google Sheet:

1. Create a new Google Sheet at sheets.google.com
2. Paste these headers into row 1: `id, name, contact, project, totalAmount, advanceAmount, advanceDate, deliveryDate, stage, domainName, domainType, domainFunding, domainPurchased, hostingType, hostingPurchased, revisionStatus, notes, createdAt`
3. Go to **Extensions → Apps Script**, paste the contents of `google-apps-script.gs`
4. Change `SHARED_SECRET` to any random string you make up
5. Click **Deploy → New deployment → Web app**, set "Who has access" to **Anyone**
6. Copy the Web App URL Google gives you
7. In the app, tap the sync icon (top-left of header), paste the URL and secret, tap **Save & test**

Once connected: every save auto-syncs. View your data on a laptop by opening the sheet. On a new phone, install the app, paste the URL/secret in settings, then tap **Pull from sheet** to restore your clients.

## Backing up your client data

Your client data lives in your phone's browser storage. To back up, you can manually export it by:
- Opening the URL on a desktop browser
- Pressing F12 to open developer tools
- Going to the Application tab → Local Storage → finding `hafiz_clients_v1`
- Copy that JSON and save it somewhere safe

I can add a proper in-app Export/Import button later if needed.

## Known limitations

- Reminders only appear when you open the app (no background push)
- Data is local to one phone — switching phones means starting over (or manually restoring backup)
- Multi-user / team sync not supported (would need a backend)

If any of these matter for your business, the next step would be wrapping this in Capacitor to turn it into a real Android app with native notifications.
