<img width="786" height="431" alt="image" src="https://github.com/user-attachments/assets/a9de0c62-0ffb-4170-8acc-156e6c6b23fb" /># College Clubs Frontend

This is a React + Vite frontend for a college clubs website project.

## Included pages
- Login page styled like a college ERP portal
- First-time club selection page
- Clubs and events feed page with:
  - `All Clubs`
  - `My Clubs`
  - individual club filters
  - update option for `My Clubs`

## Project structure

- `src/pages/LoginPage.jsx`
- `src/pages/OnboardingPage.jsx`
- `src/pages/FeedPage.jsx`
- `src/components/HeaderNav.jsx`
- `src/components/EventCard.jsx`
- `src/components/ClubChip.jsx`
- `src/data/clubs.js`
- `src/data/events.js`
- `src/utils/captcha.js`
- `src/utils/storage.js`

## Run in VS Code

1. Open this folder in VS Code.
2. Open Terminal in VS Code.
3. Run:

```bash
npm install
npm run dev
```

4. Open the local link shown in the terminal, usually `http://localhost:5173`.

## Replace with your real college image

Put your campus image here:

- `public/assets/college-hero.jpg`

Then refresh the browser.

## Current behavior

- Login uses a generated captcha.
- First login sends the student to club selection.
- Selected clubs are saved in browser localStorage.
- Later logins go straight to the feed.
- `Update My Clubs` opens the club selection page again.


