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
