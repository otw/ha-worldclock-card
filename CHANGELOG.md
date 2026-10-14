# Changelog

## v0.2.1 — HACS image paths

- Place the bundled images directly in `dist/` so HACS installs and serves them alongside the card.
- Correct the illustrated YAML examples and manual copy instructions.

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
