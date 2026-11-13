# 🎧 Left or Right?

A small web page that plays a short tone in your left ear, right ear, or both, so you can quickly check that your headphones or speakers are working and are not swapped.

**Try it:** https://juliusalfeche.github.io/audiotest/

## How to use

1. Put on your headphones (or face your speakers) and turn the volume to a comfortable level.
2. Press **Left**, **Both**, or **Right**. A short tone plays (about half a second).
3. You should hear it only on the side you chose. If it comes from the wrong side, your headphones are on backwards or the audio output is swapped.

Pressing the active button again stops the tone early.

## Features

- Plays a 440 Hz sine tone at a low, headphone-safe volume.
- Left, right, or both channels, using the browser's Web Audio API (`StereoPannerNode`).
- Works offline once loaded, and can be installed as an app (PWA).
- No libraries, no tracking, no external requests. Plain HTML, CSS and JavaScript.
- Keyboard and screen reader friendly.

## Project structure

```
audiotest/
├── index.html          the page
├── sw.js               service worker (offline support); must stay in the root
├── manifest.json       app install info
├── assets/
│   ├── css/style.css   styling
│   ├── js/script.js    tone logic
│   └── icons/          logo (SVG + PNG sizes, maskable version for Android)
├── LICENSE
└── README.md
```

## Colors

| Use | Color |
|---|---|
| Accent (pressed tile) | `#d32f2f` |
| Page background | `#121212` |
| Tiles | `#1a1a1a` (hover `#212121`) |
| Text / muted text | `#dddddd` / `#9f9f9f` |

All colors are defined once at the top of `assets/css/style.css`.

## Run it locally

Service workers need a web server (not just double-clicking the file). From this folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Updating

When you change any file, also change the version in `sw.js` (`CACHE_NAME = 'audio-test-v6'` → `'audio-test-v7'`), so installed copies refresh.

## License

MIT. See [LICENSE](LICENSE).
