# DAIY Lab — field notes from an independent AI workshop

A single-page static website for DAIY Lab (a name that plays on *DIY* and *AI*).
Plain HTML/CSS/JS — no dependencies, no build step, no trackers.

**Live:** https://22johngalt.github.io/DIY/

## Structure

| File | Contents |
|---|---|
| `index.html` | All copy and markup — one page, seven blocks (header, hero, building, principles, process, invitation, footer) |
| `styles.css` | Design system (palette, type, grid) + responsive rules + motion styles |
| `main.js` | ~60 lines of vanilla JS: IntersectionObserver for reveal/assembly motion |
| `favicon.svg` | Small emblem (plate, core, fasteners) |

## Run locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

No install, no build.

## Editing content

- All copy lives directly in `index.html` — search by section comment (e.g. `02 · What we're building`).
- The diagram labels (`Fig. 1`) are SVG `<text>` in `index.html`.

## Replace the contact placeholder

Search `index.html` for `hello@daiylab.example`. It appears twice:

1. The `mailto:` link in the Invitation section (marked with `<!-- CONTACT PLACEHOLDER -->`)
2. The visible placeholder note underneath

Swap both for the lab's real mailbox, then delete the visible note line.

## Deployment

GitHub Pages serves the `main` branch root of this repo. Any push to `main`
rebuilds the site automatically within a minute.

## Notes

- Motion is subtle, tied to scroll, and fully disabled under `prefers-reduced-motion`.
- Content is visible without JavaScript; animation is progressive enhancement only.
- System fonts only (serif display / sans body / mono labels) — zero font downloads.
