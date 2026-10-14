const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { normalizeConfig, formatZone, resolveImage, nextTickDelay, HAWorldclockCard } = require('../ha-worldclock-card.js');

test('rejects an invalid IANA time zone before rendering', () => {
  assert.throws(
    () => normalizeConfig({ zones: [{ name: 'Example', timezone: 'Mars/Olympus_Mons' }] }),
    /Mars\/Olympus_Mons/,
  );
});

test('formats the correct New York clock across the spring DST jump', () => {
  const config = normalizeConfig({
    zones: [{ name: 'New York', timezone: 'America/New_York' }],
    hour_format: '12',
  });
  const before = formatZone(new Date('2026-03-08T06:30:00Z'), config.zones[0], config);
  const after = formatZone(new Date('2026-03-08T07:30:00Z'), config.zones[0], config);
  assert.equal(before.time, '1:30 AM');
  assert.equal(after.time, '3:30 AM');
  assert.equal(after.date, 'Sunday, March 8, 2026');
  assert.equal(after.isDay, false);
});

test('uses the configured 24-hour format and each zone’s own date', () => {
  const config = normalizeConfig({
    zones: [{ name: 'Tokyo', timezone: 'Asia/Tokyo' }],
    hour_format: '24',
  });
  const result = formatZone(new Date('2026-10-14T23:05:00Z'), config.zones[0], config);
  assert.equal(result.time, '08:05');
  assert.equal(result.date, 'Thursday, October 15, 2026');
  assert.equal(result.isDay, true);
});

test('resolves local images without adding an external avatar request', () => {
  assert.equal(resolveImage('cities/stuttgart.jpg'), '/local/cities/stuttgart.jpg');
  assert.equal(resolveImage('/local/cities/sf.png'), '/local/cities/sf.png');
  assert.equal(resolveImage(), null);
  assert.equal(resolveImage('javascript:alert(1)'), null);
});

test('uses rounded-square artwork by default and supports circular custom images', () => {
  const base = { zones: [{ name: 'Tahoe', timezone: 'America/Los_Angeles', image: '/hacsfiles/ha-worldclock-card/images/tahoe.webp' }] };
  assert.equal(normalizeConfig(base).image_shape, 'rounded-square');
  assert.equal(normalizeConfig({ ...base, image_shape: 'circle' }).image_shape, 'circle');
  assert.throws(() => normalizeConfig({ ...base, image_shape: 'hexagon' }), /image_shape/);
});

test('schedules the next update on the next minute or second boundary', () => {
  const now = new Date('2026-10-14T12:34:45.250Z');
  assert.equal(nextTickDelay(now, false), 14750);
  assert.equal(nextTickDelay(now, true), 750);
});

test('lets Home Assistant sections size the card to its content', () => {
  const options = HAWorldclockCard.prototype.getGridOptions();
  assert.equal(options.columns, 12);
  assert.equal(Object.hasOwn(options, 'rows'), false);
  assert.equal(Object.hasOwn(options, 'min_rows'), false);
  assert.equal(HAWorldclockCard.prototype.getCardSize.call({ _config: { title: 'World clock', zones: [{}, {}] } }), 5);
});

test('ships the same card and all example images in the HACS dist package', () => {
  const root = path.join(__dirname, '..');
  assert.equal(fs.readFileSync(path.join(root, 'dist/ha-worldclock-card.js'), 'utf8'),
    fs.readFileSync(path.join(root, 'ha-worldclock-card.js'), 'utf8'));
  for (const name of ['san-francisco', 'stuttgart', 'tahoe']) {
    assert.ok(fs.statSync(path.join(root, 'dist/images', `${name}.webp`)).size > 1000);
  }
});
