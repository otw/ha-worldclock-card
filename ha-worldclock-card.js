/* World Clock Card for Home Assistant. No build step or remote dependencies. */
const WORLD_CLOCK_TAG = 'ha-worldclock-card';

const WORLD_CLOCK_STYLE = `
  :host { display: block; }
  ha-icon { display: inline-grid; place-items: center; flex: none;
    width: var(--mdc-icon-size, 20px); height: var(--mdc-icon-size, 20px); }
  ha-icon svg { display: block; width: 100%; height: 100%; fill: none;
    stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  ha-card {
    display: block;
    box-sizing: border-box;
    container-type: inline-size;
    overflow: hidden;
    padding: 20px;
    border-radius: var(--ha-card-border-radius, 24px);
    background: var(--ha-card-background, var(--card-background-color, #1c1b1f));
    color: var(--primary-text-color, #f4f1f5);
    border: 1px solid var(--ha-card-border-color, rgba(127,127,127,.16));
    box-shadow: var(--ha-card-box-shadow, 0 2px 10px rgba(0,0,0,.08));
    font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
  }
  .header { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
  .header[hidden], .primary-date[hidden], .secondary-date[hidden], .zone-abbr[hidden],
  .day-icon[hidden], .avatar[hidden], .avatar img[hidden], .avatar ha-icon[hidden] { display: none; }
  .header-icon { display: grid; place-items: center; width: 40px; height: 40px; flex: none;
    border-radius: 14px; color: var(--primary-color, #9dc7ff);
    background: color-mix(in srgb, var(--primary-color, #9dc7ff) 15%, transparent); }
  .header-icon ha-icon { --mdc-icon-size: 22px; }
  h2 { margin: 0; font-size: 17px; line-height: 1.2; font-weight: 650; }
  .primary-label { display: flex; align-items: center; gap: 8px;
    color: var(--secondary-text-color, #aaa7ad); font-size: 12px; font-weight: 650;
    letter-spacing: .04em; }
  .zone-abbr { color: var(--secondary-text-color, #aaa7ad); font-size: 12px; font-weight: 500; }
  .primary-time { display: flex; align-items: center; gap: 9px; margin-top: 9px;
    font-size: clamp(36px, 10cqw, 48px); line-height: 1.08; font-weight: 650;
    letter-spacing: -.05em; font-variant-numeric: tabular-nums; }
  .primary-time .day-icon { --mdc-icon-size: 23px; color: var(--primary-color, #9dc7ff); }
  .primary-date { margin-top: 7px; color: var(--secondary-text-color, #aaa7ad); font-size: 13px; }
  .zones { display: grid; gap: 8px; margin-top: 18px; padding-top: 14px;
    border-top: 1px solid var(--divider-color, rgba(127,127,127,.15)); }
  .zones:empty { display: none; }
  .zone { display: flex; align-items: center; gap: 11px; min-width: 0; padding: 9px 11px;
    border-radius: 16px; background: var(--secondary-background-color, rgba(127,127,127,.1)); }
  .avatar { display: grid; place-items: center; width: 38px; height: 38px; flex: none;
    overflow: hidden; border-radius: 13px; color: var(--primary-color, #9dc7ff);
    background: color-mix(in srgb, var(--primary-color, #9dc7ff) 13%, transparent); }
  .avatar img { width: 100%; height: 100%; object-fit: cover; }
  .avatar ha-icon { --mdc-icon-size: 20px; }
  .zone-text { min-width: 0; flex: 1; }
  .zone-name { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-size: 13px; font-weight: 650; }
  .secondary-date { display: block; margin-top: 2px; overflow: hidden; text-overflow: ellipsis;
    white-space: nowrap; color: var(--secondary-text-color, #aaa7ad); font-size: 11px; }
  .zone-right { display: flex; align-items: center; gap: 7px; flex: none; }
  .zone-clock { display: block; text-align: right; font-size: 16px; font-weight: 650;
    font-variant-numeric: tabular-nums; }
  .zone-right .day-icon { --mdc-icon-size: 17px; color: var(--primary-color, #9dc7ff); }
  .zone-right .zone-abbr { display: block; margin-top: 2px; text-align: right; font-size: 10px; }
  .zone-right .zone-abbr[hidden] { display: none; }
  @container (min-width: 520px) {
    .zones.auto { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  .zones.grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @container (max-width: 420px) {
    .zones.grid { grid-template-columns: 1fr; }
  }
  @container (max-width: 330px) {
    .zone { padding: 8px; gap: 8px; }
    .zone-clock { font-size: 14px; }
    .avatar { width: 34px; height: 34px; }
  }
`;

function normalizeConfig(input) {
  if (!input || typeof input !== 'object' || !Array.isArray(input.zones) ||
      input.zones.length < 1 || input.zones.length > 12) {
    throw new Error('World Clock Card needs 1–12 zones');
  }
  const zones = input.zones.map((zone, index) => {
    if (!zone || typeof zone.name !== 'string' || !zone.name.trim() ||
        typeof zone.timezone !== 'string' || !zone.timezone.trim()) {
      throw new Error(`Zone ${index + 1} needs a name and IANA timezone`);
    }
    try { new Intl.DateTimeFormat('en-US', { timeZone: zone.timezone }); }
    catch { throw new Error(`Invalid timezone: ${zone.timezone}`); }
    return { name: zone.name.trim(), timezone: zone.timezone, image: zone.image,
      entity_id: zone.entity_id };
  });
  const hourFormat = String(input.hour_format ?? 'auto');
  if (!['auto', '12', '24'].includes(hourFormat)) throw new Error('hour_format must be auto, 12, or 24');
  const dateFormat = input.date_format ?? 'long';
  if (!['long', 'short', 'none'].includes(dateFormat)) throw new Error('date_format must be long, short, or none');
  const layout = input.layout ?? 'auto';
  if (!['auto', 'list', 'grid'].includes(layout)) throw new Error('layout must be auto, list, or grid');
  const start = input.day_start_hour ?? 6;
  const end = input.day_end_hour ?? 18;
  if (![start, end].every((value) => Number.isInteger(value) && value >= 0 && value <= 23) || start === end) {
    throw new Error('day_start_hour and day_end_hour must be different hours from 0 to 23');
  }
  const locale = input.locale || undefined;
  if (locale) {
    try { new Intl.DateTimeFormat(locale); }
    catch { throw new Error(`Invalid locale: ${locale}`); }
  }
  return {
    title: typeof input.title === 'string' ? input.title.trim() : '',
    zones, locale, hour_format: hourFormat, date_format: dateFormat, layout,
    show_seconds: input.show_seconds === true,
    show_time_zone: input.show_time_zone === true,
    show_day_night: input.show_day_night !== false,
    show_secondary_date: input.show_secondary_date !== false,
    show_images: input.show_images !== false,
    day_start_hour: start, day_end_hour: end,
  };
}

function formatZone(now, zone, config) {
  const locale = config.locale || 'en-US';
  const timeOptions = { timeZone: zone.timezone, hour: 'numeric', minute: '2-digit' };
  if (config.show_seconds) timeOptions.second = '2-digit';
  if (config.hour_format === '12') timeOptions.hourCycle = 'h12';
  if (config.hour_format === '24') timeOptions.hourCycle = 'h23';
  const time = new Intl.DateTimeFormat(locale, timeOptions).format(now);
  const date = new Intl.DateTimeFormat(locale, { timeZone: zone.timezone,
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(now);
  const shortDate = new Intl.DateTimeFormat(locale, { timeZone: zone.timezone,
    weekday: 'short', month: 'short', day: 'numeric' }).format(now);
  const zoneName = new Intl.DateTimeFormat(locale, { timeZone: zone.timezone,
    timeZoneName: 'short' }).formatToParts(now).find((part) => part.type === 'timeZoneName')?.value || '';
  const hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: zone.timezone,
    hour: 'numeric', hourCycle: 'h23' }).formatToParts(now).find((part) => part.type === 'hour')?.value);
  const start = config.day_start_hour ?? 6;
  const end = config.day_end_hour ?? 18;
  const isDay = start < end ? hour >= start && hour < end : hour >= start || hour < end;
  return { time, date, shortDate, zoneName, isDay };
}

function resolveImage(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const image = value.trim();
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith('/')) return image;
  if (/^[a-z][a-z\d+.-]*:/i.test(image) || image.startsWith('//')) return null;
  return `/local/${image.replace(/^local\//, '')}`;
}

function nextTickDelay(now, showSeconds) {
  const interval = showSeconds ? 1000 : 60000;
  return interval - (now.getTime() % interval);
}

const WorldClockBase = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;
class HAWorldclockCard extends WorldClockBase {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${WORLD_CLOCK_STYLE}</style><ha-card>
      <div class="header" hidden><span class="header-icon"><ha-icon icon="mdi:clock-outline"></ha-icon></span><h2></h2></div>
      <div class="primary-label"><span id="primary-name"></span><span class="zone-abbr" id="primary-zone"></span></div>
      <div class="primary-time"><span id="primary-time"></span><ha-icon class="day-icon" id="primary-icon"></ha-icon></div>
      <div class="primary-date" id="primary-date"></div>
      <div class="zones auto" id="zones"></div>
    </ha-card>`;
    this._rows = [];
    this._timer = null;
  }

  static getStubConfig() {
    return { type: `custom:${WORLD_CLOCK_TAG}`, zones: [
      { name: 'Local time', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' },
      { name: 'London', timezone: 'Europe/London' },
    ] };
  }

  setConfig(input) {
    this._config = normalizeConfig(input);
    this._build();
    this._tick();
    if (this.isConnected) this._schedule();
  }

  set hass(value) {
    this._hass = value;
    if (this._config) {
      this._tick();
      this._updateImages();
    }
  }

  connectedCallback() {
    if (!this._config) return;
    this._tick();
    this._schedule();
  }

  disconnectedCallback() {
    clearTimeout(this._timer);
    this._timer = null;
  }

  getCardSize() { return Math.max(3, 2 + (this._config?.zones.length || 1)); }
  getGridOptions() { return { columns: 12, min_columns: 6, rows: Math.min(8, this.getCardSize()), min_rows: 3 }; }

  _build() {
    const config = this._config;
    const header = this.shadowRoot.querySelector('.header');
    header.hidden = !config.title;
    header.querySelector('h2').textContent = config.title;
    this.shadowRoot.getElementById('primary-name').textContent = config.zones[0].name;
    const container = this.shadowRoot.getElementById('zones');
    container.className = `zones ${config.layout}`;
    container.replaceChildren();
    this._rows = config.zones.slice(1).map((zone) => {
      const row = document.createElement('div');
      row.className = 'zone';
      row.innerHTML = `<span class="avatar"><img alt="" hidden><ha-icon icon="mdi:earth"></ha-icon></span>
        <span class="zone-text"><span class="zone-name"></span><span class="secondary-date"></span></span>
        <span class="zone-right"><span><span class="zone-clock"></span><span class="zone-abbr"></span></span>
        <ha-icon class="day-icon"></ha-icon></span>`;
      row.querySelector('.zone-name').textContent = zone.name;
      container.append(row);
      return row;
    });
    this._updateImages();
  }

  _updateImages() {
    if (!this._config) return;
    this._rows.forEach((row, index) => {
      const zone = this._config.zones[index + 1];
      const entityPicture = zone.entity_id && this._hass?.states?.[zone.entity_id]?.attributes?.entity_picture;
      const src = this._config.show_images ? resolveImage(entityPicture || zone.image) : null;
      const image = row.querySelector('img');
      const icon = row.querySelector('.avatar ha-icon');
      if (src) {
        if (image.getAttribute('src') !== src) image.setAttribute('src', src);
        image.hidden = false;
        icon.hidden = true;
      } else {
        image.removeAttribute('src');
        image.hidden = true;
        icon.hidden = false;
      }
    });
  }

  _tick() {
    if (!this._config) return;
    const now = new Date();
    const config = { ...this._config, locale: this._config.locale || this._hass?.locale?.language || navigator.language || 'en-US' };
    const primary = formatZone(now, config.zones[0], config);
    this.shadowRoot.getElementById('primary-time').textContent = primary.time;
    const primaryDate = this.shadowRoot.getElementById('primary-date');
    primaryDate.textContent = config.date_format === 'short' ? primary.shortDate : primary.date;
    primaryDate.hidden = config.date_format === 'none';
    const primaryZone = this.shadowRoot.getElementById('primary-zone');
    primaryZone.textContent = primary.zoneName;
    primaryZone.hidden = !config.show_time_zone;
    this._setDayIcon(this.shadowRoot.getElementById('primary-icon'), primary.isDay);
    this._rows.forEach((row, index) => {
      const details = formatZone(now, config.zones[index + 1], config);
      row.querySelector('.zone-clock').textContent = details.time;
      const date = row.querySelector('.secondary-date');
      date.textContent = details.shortDate;
      date.hidden = !config.show_secondary_date;
      const zoneName = row.querySelector('.zone-abbr');
      zoneName.textContent = details.zoneName;
      zoneName.hidden = !config.show_time_zone;
      this._setDayIcon(row.querySelector('.day-icon'), details.isDay);
    });
  }

  _setDayIcon(icon, isDay) {
    icon.hidden = !this._config.show_day_night;
    icon.setAttribute('icon', isDay ? 'mdi:weather-sunny' : 'mdi:moon-waning-crescent');
    icon.setAttribute('aria-label', isDay ? 'Daytime' : 'Nighttime');
  }

  _schedule() {
    clearTimeout(this._timer);
    if (!this.isConnected) return;
    this._timer = setTimeout(() => {
      this._tick();
      this._schedule();
    }, nextTickDelay(new Date(), this._config.show_seconds));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(WORLD_CLOCK_TAG)) {
  customElements.define(WORLD_CLOCK_TAG, HAWorldclockCard);
  window.customCards = window.customCards || [];
  if (!window.customCards.some((card) => card.type === WORLD_CLOCK_TAG)) {
    window.customCards.push({ type: WORLD_CLOCK_TAG, name: 'World Clock Card',
      description: 'Material styled clocks for multiple time zones' });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { normalizeConfig, formatZone, resolveImage, nextTickDelay };
}
