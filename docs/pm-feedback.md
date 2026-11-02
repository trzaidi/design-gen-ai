# Week 5 feedback and iteration

## Feedback received

| Source | Exact feedback |
| --- | --- |
| PM and Feedback Group | "It's great." No specific changes requested. |

Because no specific issues were raised, this iteration targets the rubric's
usability and visual-design criteria and the prompt "Would I use this app more
than once?", using a self-audit of the Week 4 build.

## Self-audit findings and changes

| Problem found | Change | Verification |
| --- | --- | --- |
| Signed-in members had to leave the archive to vote ("Rate in the arena →"). | Vote buttons are on every card everywhere, with instant (optimistic) score updates that roll back on failure. | Mock-backed browser test: score updated in under 60 ms and persisted. |
| New members were blocked by a manual first/last name form before voting. | Profile is created from the Google name at sign-in; the form is prefilled when edited. | Callback upserts through the owner-only `profiles` RLS policies. |
| Rating a feed of 100 cards is tedious; nothing pulls you back. | New Judge mode: one caption at a time, ← / → / S / Z keyboard shortcuts, progress bar, skip, undo, and a completion screen. | Keyboard votes and undo verified against the mock (POST, POST, DELETE). |
| Rankings were only visible in a "Top" sort. | Home leaderboard (top 3 this week, all-time fallback), rank badges, live stats. | Rendered with sample data. |
| Captions couldn't be shared. | `/c/[id]` page per caption with Open Graph preview, share/copy button, newer/older paging. | Valid IDs render; invalid IDs show the 404 page. |
| Generator picture choice was a dropdown and the locked scene was confusing. | Thumbnail picker, tone cards with descriptions, explanation when the scene is locked, live result panel with "Try another take". | Pending and error states verified; tone selection persists after a failed attempt. |
| Navigation was a row of small uppercase links; no mobile pattern. | Sticky header with active state and profile chip; bottom tab bar on phones; footer links; skip link. | Checked at 1440 px and phone width with no horizontal overflow. |
| No loading or error states. | Skeleton loading UI, branded 404 and error pages. | Build output lists the routes. |
| Archive couldn't be filtered. | Tone filter chips and Newest/Top sort on the home page. | Rendered with sample data. |
| Content felt generic; nothing tied it to Columbia (owner suggestion). | Seven freely licensed Wikimedia Commons photos of real campus spots (Butler/South Lawn, Low, Alma Mater, 116th St, John Jay, Lerner, College Walk) with scenes built on campus lore: CUIT training emails after the 2025 breach, Public Safety alerts, the 1 train, the housing lottery, the swim test. Daily scenes and the AI prompt now target Columbia students. Every card credits its photo, and a /credits page lists the licenses. | Picker, cards, and credits verified in the browser. Requires migration `20261019120000_allow_columbia_meme_images.sql`. |


## October 25 owner feedback

The owner found that generated captions were missing pictures and asked to attach suitable pictures or remove those records, then expand Columbia material using real campus events.

- Attached matching existing assets to all ten pictureless captions; retained all 17 captions and 18 votes. The scoped repair is recorded in `2026-10-25-caption-pictures.sql`.
- Added 15 image-backed, sourced topic presets and a public `/material` page. Topics include the October 23 CUIT settlement update, emailed security lessons, September campus-access rules, meal-plan mechanics, Butler, housing and registration.
- The generator now starts with a topic and picture, supports custom setups with a chosen picture, and rejects missing or unknown images before using an AI attempt.
- Admin media forms now use a required gallery selector and show previews.
- Build, lint and seven tests passed, including image availability, topical input integrity, picture validation and New York daily rotation.
- Source dates are shown in the interface; examples and scenarios are labeled as jokes. No specific unverified PM request is claimed.

## Week 7 iteration (November 1, 2026)

PM feedback for Week 6 was that the work is great and he is not worried about the submissions, with no specific changes requested. The owner asked that profile photo uploads work and that any limit explain itself.

- A self-audit found that profile photos over 1 MB always failed, because server actions default to a 1 MB request body. The limit is now 4.4 MB, under Vercel's 4.5 MB cap, and photos up to 4 MB are accepted.
- Type and size are checked when a photo is chosen, before any upload. The message gives the file's size, the 4 MB limit and the reason for it. The server repeats both checks with the same wording, and the form shows a preview.
- Every caption model call is logged for the admin panel's observability pages: status, response, finish reason, tokens, latency and provider error code. Logging never blocks a member's generation.
- Verified with a browser test against a mock backend: a 5 MB photo is refused with the explanation, and a 3 MB photo uploads and saves.

