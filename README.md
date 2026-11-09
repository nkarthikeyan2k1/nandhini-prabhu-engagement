# Nandhini & Prabhu — Engagement Invitation

A static, animated engagement invitation (HTML + CSS + vanilla JS), ready for GitHub Pages.

```
/index.html               → redirects to ./engagement/
/engagement/index.html    → the invitation
/engagement/style.css
/engagement/script.js     → CONFIG (all editable details) is at the top
/wedding/index.html       → "Coming soon – Feb 2027" page (same theme)
/assets/images/           → hero.jpg, couple-1.jpg … couple-8.jpg
/assets/audio/bgm.mp3     → background music (a soft tanpura drone placeholder)
/assets/icons/            → favicon.png, apple-touch-icon.png
/.nojekyll
```

## 1. Edit the details (CONFIG)

Open `engagement/script.js`. Everything editable is in the `CONFIG` object at the top:

| Field | What it controls |
|---|---|
| `theme` | `'royal'`, `'midnight'`, `'temple'` or `'pastel'` |
| `showThemeSwitcher` | the little colour picker at bottom-left. **Set to `false` before sending to guests.** |
| `event.date`, `startTime`, `endTime` | date (`YYYY-MM-DD`) and 24-hour times **at the venue**. The countdown uses `utcOffset` (`+05:30`) so it is correct for guests anywhere. |
| `venue.name`, `venue.address` | shown on the cards and used for the map |
| `venue.mapsLink` | paste the Google Maps share link (Share → Copy link). Used by "Get Directions". |
| `venue.mapQuery` | optional — what the embedded map searches for (defaults to name + address) |
| `contact` | name + phone for the tap-to-call line (set `phone: ''` to hide it) |
| `hosts.names` | family names in the closing section |
| `story.lines`, `story.wordplay` | the story text and the "Pra + Na = Prana" wordplay |
| `gallery` | photo list: `src`, `alt` (describe the photo), `caption`, optional `wide: true` |
| `music.src` | path to the music file |

**Also update the `<title>`, `description` and `og:` tags in `engagement/index.html` and `/index.html`** — WhatsApp's link-preview robot does not run JavaScript, so it only sees what is written in the HTML.

### Previewing the themes
Click the swatches at the bottom-left. The page URL changes to `?theme=royal|midnight|temple|pastel`, so you can copy the link and send each version to family to vote. When you have decided, set `CONFIG.theme` and `showThemeSwitcher: false`.

## 2. Replace photos and music

- Keep the exact file names: `hero.jpg`, `couple-1.jpg` … `couple-8.jpg`, `bgm.mp3`.
- Just overwrite the file in `assets/images/` or `assets/audio/` — no code change needed.
- Landscape photos (like a selfie) are detected automatically and get a wide frame.
- A missing gallery file is hidden instead of showing a broken image; a missing `bgm.mp3` hides the music button.
- To add more photos, add another entry to `CONFIG.gallery` (6–8 looks best).
- Change a photo? Update its `alt` and `caption` in `CONFIG.gallery` too.

### Image checklist

| File | Size | Weight |
|---|---|---|
| `hero.jpg` | 1920×1080 (landscape) **or** 1080×1440 (portrait, looks best on phones) | under 400 KB, JPG or WebP |
| `couple-1…8.jpg` | 1200 px on the long side | under 250 KB each |
| `favicon.png` | 192×192 | — |

Tip: [squoosh.app](https://squoosh.app) → MozJPEG, quality 70–80, resize to the sizes above.

Current photos: hero = temple photo; 1 pink saree (smiling), 2 white shirt, 3 purple saree, 4 hills, 5 pink saree (profile), 6 blue shirt, 7 village road, 8 temple photo.

## 3. Deploy on GitHub Pages

1. Create a new repository on GitHub, e.g. `nandhini-prabhu`.
2. Push **the contents of this folder** (so `index.html` is at the repository root):
   ```bash
   git init
   git add .
   git commit -m "Engagement invitation"
   git branch -M main
   git remote add origin https://github.com/USERNAME/nandhini-prabhu.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. After a minute the site is live at `https://USERNAME.github.io/nandhini-prabhu/` (it redirects to `/engagement/`).
5. **For a beautiful WhatsApp preview:** in `engagement/index.html` and `/index.html`, replace
   `../assets/images/hero.jpg` (and `./assets/images/hero.jpg`) in the `og:image` / `twitter:image` tags with the full URL
   `https://USERNAME.github.io/nandhini-prabhu/assets/images/hero.jpg`, then push again.
   WhatsApp caches previews — if the old preview sticks, add `?v=2` to the link you share.

All paths are relative, so the site also works on a custom domain or a `USERNAME.github.io` repository without changes.

## Notes

- Libraries load from CDNs (GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13). If a CDN is blocked, the page still shows everything — just without smooth scrolling / pinning.
- Respects "Reduce motion": no parallax, petals, rotation or smooth scroll; simple fades only.
- The music starts when a guest taps **Open Invitation** (browsers only allow sound after a tap). Their mute choice is remembered for the visit.
- The `.ics` file works with Apple Calendar and Outlook and adds a 1-day reminder.
- Test locally with any static server, e.g. `python3 -m http.server` in this folder, then open http://localhost:8000.
