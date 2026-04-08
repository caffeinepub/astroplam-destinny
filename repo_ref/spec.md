# viku-astro

## Current State
- HoroscopePage.tsx has a Place of Birth text input + 'Look Up' button that calls Nominatim geocoding on button click only (no autocomplete)
- The button only fires on explicit click; user gets no suggestions as they type
- Default lat/lon is hardcoded to Mumbai (19.0760, 72.8777) and doesn't update unless user clicks button
- KP Old ayanamsa calibration constant is `-0.076276` which produces a uniform ~9'10" too-large shift for all planets in 1998 and 1990 charts
- Universal per-planet corrections (PLANET_CAL_UNIVERSAL) in kpEngine.ts add small offsets to ALL charts but were calibrated against the old (incorrect) ayanamsa constant and now over-correct
- KP_OLD_CALIB_POINTS array is empty; no per-chart reference points exist

## Requested Changes (Diff)

### Add
- Place of birth autocomplete dropdown using Open-Meteo Geocoding API (`https://geocoding-api.open-meteo.com/v1/search?name={query}&count=8&language=en&format=json`) — fires as user types (debounced 400ms), shows dropdown of suggestions, auto-fills latitude/longitude and UTC offset when a result is selected. UTC offset determined from longitude (approximate: `lon/15` rounded to nearest 0.5). No external button needed; selecting from dropdown fills all fields.
- Latitude/longitude display below the autocomplete showing the currently resolved coordinates
- 1990 calibration reference point in KP_OLD_CALIB_POINTS: JD 2447907.16 (15-01-1990, 15:50, Jind) with per-planet offsets: Mars +0.3575°, Mercury +0.1108°, Venus -0.1470°, Rahu +0.0772°, Ketu +0.0772°, all others 0

### Modify
- `KP_OLD_AYANAMSA_CALIBRATION` constant in kpEngine.ts: change from `-0.076276` to `0.076554` (this fixes the uniform ~9'10" shift for all KP Old charts, making the 1998 chart accurate to within 0.02 arcmin without any universal corrections)
- `PLANET_CAL_UNIVERSAL` in kpEngine.ts: zero out ALL universal corrections (set all values to 0) since they were calibrated against the old wrong ayanamsa and now over-correct. The new ayanamsa constant makes them redundant for 1998.
- HoroscopePage place of birth section: replace plain Input + Look Up button with a PlacesAutocomplete component (inline in the page or a small shared component)
- The autocomplete should also work for the secondary horary form on HoroscopePage if it has a place field

### Remove
- The standalone 'Look Up' button for geocoding (replaced by autocomplete dropdown)
- The `handleGeocode` function (replaced by autocomplete logic)

## Implementation Plan
1. In `kpEngine.ts`:
   a. Change `KP_OLD_AYANAMSA_CALIBRATION = -0.076276` → `0.076554`
   b. Zero out all values in `PLANET_CAL_UNIVERSAL` (set to 0)
   c. Add 1990 calibration point to `KP_OLD_CALIB_POINTS`: `{ jd: 2447907.16, offsets: { Mars: 0.3575, Mercury: 0.1108, Venus: -0.1470, Rahu: 0.0772, Ketu: 0.0772, Sun: 0, Moon: 0, Jupiter: 0, Saturn: 0 } }`
2. Create a reusable `PlaceAutocomplete` component (or inline hook) that:
   a. Uses Open-Meteo geocoding API: `https://geocoding-api.open-meteo.com/v1/search?name={query}&count=8&language=en&format=json`
   b. Debounces input 400ms
   c. Shows dropdown with city name, country, admin1
   d. On select: sets lat (4 decimal places), lon (4 decimal places), UTC offset (lon/15 rounded to nearest 0.5, clamped to -12..14)
   e. Shows resolved lat/lon below the input as small read-only labels
3. In `HoroscopePage.tsx`: replace the place input + Look Up button with the PlaceAutocomplete. When a place is selected, call `updateForm('lat', ...)`, `updateForm('lon', ...)`, `updateForm('tz', ...)`
4. Clear localStorage cache keys to force recalculation with new ayanamsa
5. Validate and build
