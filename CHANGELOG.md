# Changelog

## v0.3.0 — Hawaii artwork and illustrated showcase

- Add an original Diamond Head and Waikiki illustration as `builtin:hawaii`, bundled in the card script for HACS and manual installs.
- Showcase San Francisco, Lake Tahoe, and Hawaii in the demo, README gallery, and screenshot.
- Keep Stuttgart artwork and its `builtin:stuttgart` option available.

## v0.2.2 — Self-contained artwork

- Bundle all three illustrations inside the card JavaScript so they display with HACS and manual installs without separate image requests.
- Use `image: builtin:san-francisco`, `builtin:stuttgart`, or `builtin:tahoe` in dashboard YAML.
- Keep the standalone image files in `artwork/` for reuse and provide a reproducible build script.

## v0.2.1 — HACS image-path attempt (superseded)

- Moved the image files beside the script in `dist/`. The tested HACS installation still did not serve them; use v0.2.2.

## v0.2.0 — Illustrated places

- Add original, reusable comic style artwork for San Francisco, Stuttgart, and Lake Tahoe.
- Display an optional image for the primary clock as well as secondary clocks.
- Use rounded-square artwork by default, with `image_shape: circle` for custom portraits.
- Package the images with the JavaScript in `dist/` so HACS installs the complete card.

## v0.1.1 — Section sizing fix

- Let Home Assistant size the card to its content in sections views, so titled clocks and longer city lists are not clipped.
- Account for the optional title when estimating masonry card height.

## v0.1.0 — Initial public release

- Material styled world clock with responsive dark and light themes.
- Configurable IANA time zones, locale, 12/24-hour format, dates, images, and day/night icons.
- Daylight saving aware time formatting and minute-aligned updates.
- Dependency-free replacement compatible with existing `ha-worldclock-card` YAML.
- Public sample screenshot, demo, tests, and installation guide.
