# Bus Radar — Full Project Context

> This file is the single source of truth for the Bus Radar project.
> It must be read and updated after every meaningful change.
> Last updated: 2026-05-16

---

## 1. What Is Bus Radar?

Bus Radar is a **realtime crowdsourced bus tracking web application**.

A person riding a bus opens the webpage, enters the **bus number**, and taps
**Start Broadcasting**. Their phone's GPS coordinates are continuously sent
to Firebase Realtime Database. Any other person opening the same webpage
sees **all active buses plotted on a live map**, with markers updating in
realtime as the buses move.

**No accounts. No login. No app install. Just open a link and go.**

---

## 2. Core User Flow

```
RIDER ON BUS (Broadcaster)
  1. Opens Bus Radar webpage on phone browser
  2. Enters bus number (e.g. "42" or "Route 7A")
  3. Taps "Start Broadcasting"
  4. Browser requests GPS permission → user grants
  5. GPS coordinates stream continuously to Firebase
  6. Phone can be locked / backgrounded (best effort)
  7. Taps "Stop" when done, or data auto-expires

PERSON WAITING / TRACKING (Viewer)
  1. Opens Bus Radar webpage on any device
  2. Sees a full-screen map
  3. All active buses appear as labeled markers
  4. Markers move in realtime as buses move
  5. No input required — just watch
```

---

## 3. Current Project State

### What Exists Right Now

| File | Purpose |
|------|---------|
| `index.html` | Single page: fullscreen map + floating control panel |
| `script.js` | Firebase init, GPS, Leaflet map, marker management, staleness |
| `style.css` | Fullscreen map layout, floating controls, mobile-responsive styling |
| `context.md` | This file — full project documentation |

### What Works Right Now

- User enters a **bus number** and starts **anonymous** broadcasting
- GPS coordinates are captured via `navigator.geolocation.watchPosition()`
- Coordinates are written to Firebase at path `buses/{busNumber}`
- A unique `deviceId` is auto-generated per session via `crypto.randomUUID()`
- **Fullscreen Leaflet.js map** with OpenStreetMap tiles
- **Bus markers** appear on map with permanent bus number tooltip labels
- Markers **move in realtime** as coordinates update
- Markers are **removed** when broadcasting stops
- **Staleness handling**: markers fade at 2min, disappear at 5min
- Mobile-optimized floating control panel overlaid on map
- Status indicator shows broadcasting state
- Multi-device realtime sync is **confirmed working**

### Firebase Data Structure (Current)

```
buses/
  {busNumber}/
    lat: number
    lng: number
    timestamp: number
    deviceId: string
```

---

## 4. Target MVP (What We Are Building Now)

### The Goal

Transform the current working prototype into a **usable bus tracking MVP**
with these specific capabilities:

1. User enters a **bus number** (not a name)
2. Broadcasting is **anonymous** (no name required)
3. A unique **device ID** is auto-generated per browser session
4. GPS coordinates are sent to Firebase under the bus number
5. **All active buses are shown on a fullscreen map** (Leaflet.js + OpenStreetMap)
6. Map markers display the **bus number** as a label
7. Markers **update position in realtime** as coordinates change
8. Multiple buses can broadcast simultaneously
9. Viewers see all buses without needing to input anything

### Target Firebase Data Structure

```
buses/
  {busNumber}/
    lat: number
    lng: number
    timestamp: number
    deviceId: string    ← auto-generated, prevents write conflicts
```

**Design decision:** One active location per bus number. If two people
broadcast the same bus number, the latest write wins. This is acceptable
for MVP — in practice, rarely will two people broadcast the same bus.

### Target Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML (single page) |
| Logic | Vanilla JavaScript (ES modules) |
| Styling | Vanilla CSS |
| Map | Leaflet.js (loaded via CDN) |
| Tiles | OpenStreetMap (free, no API key) |
| Database | Firebase Realtime Database |
| Hosting | GitHub Pages |

### What Is Explicitly NOT In Scope

- User authentication / accounts
- Route definitions or route matching
- ETA calculations
- Bus occupancy tracking
- Driver vs rider modes
- Admin dashboard
- Notifications / alerts
- Offline support / PWA
- Native mobile apps
- Performance optimization
- Analytics
- Multi-language support

---

## 5. Architecture

```
┌─────────────────┐
│  BROADCASTER     │
│  (Phone Browser) │
│                  │
│  Bus Number: 42  │
│  GPS → Firebase  │
└───────┬─────────┘
        │ set() on every GPS update
        ▼
┌─────────────────────────────────────────────┐
│  FIREBASE REALTIME DATABASE                  │
│                                              │
│  buses/                                      │
│    42/                                       │
│      lat: 12.9716                            │
│      lng: 77.5946                            │
│      timestamp: 1747405200000                │
│      deviceId: "abc123"                      │
│    7A/                                       │
│      lat: 12.9800                            │
│      lng: 77.6100                            │
│      timestamp: 1747405201000                │
│      deviceId: "def456"                      │
└───────┬─────────────────────────────────────┘
        │ onValue() realtime listener
        ▼
┌─────────────────┐
│  VIEWER          │
│  (Any Browser)   │
│                  │
│  Fullscreen Map  │
│  Bus 42 📍       │
│  Bus 7A 📍       │
└─────────────────┘
```

### Data Flow

1. Broadcaster's browser calls `watchPosition()` → gets lat/lng
2. On each GPS update, `set(ref(db, 'buses/{busNumber}'), data)` writes to Firebase
3. All connected clients have `onValue(ref(db, 'buses'))` listener
4. When Firebase data changes, listener fires with full snapshot
5. JavaScript updates Leaflet markers on the map (add, move, or remove)

### Device ID Generation

Each browser session generates a random ID:
```javascript
const deviceId = crypto.randomUUID();
```
This is used only to tag which device is broadcasting a given bus.
It is NOT used as the Firebase key — the bus number is the key.

---

## 6. File Structure (Target)

```
web/
  index.html      ← single page: map + controls
  style.css       ← all styling (NEW)
  script.js       ← all logic: Firebase, GPS, Leaflet
  context.md      ← this file
```

Single-page app. No build tools. No frameworks. No bundler.
Everything loads via CDN (Firebase SDK, Leaflet.js, Leaflet CSS).

---

## 7. Implementation Tasks (Ordered)

All tasks completed on 2026-05-16.

### ✅ Task 1: Add Leaflet.js map to the page
### ✅ Task 2: Restructure data model (name → bus number)
### ✅ Task 3: Display bus markers on the map
### ✅ Task 4: Remove text-based broadcaster list
### ✅ Task 5: Mobile-optimized layout and basic styling
### ✅ Task 6: Staleness handling (2min fade, 5min remove)

---

## 8. Firebase Configuration

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBi6J7XXCB-8wYP6U3VjDivJpbYZ0oeD2w",
    authDomain: "bus-radar-mvp.firebaseapp.com",
    databaseURL:
        "https://bus-radar-mvp-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bus-radar-mvp",
    storageBucket: "bus-radar-mvp.firebasestorage.app",
    messagingSenderId: "784601192060",
    appId: "1:784601192060:web:549753dcb64972ef009bf9"
};
```

### Firebase Realtime Database Rules

Current rules should allow open read/write for MVP:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

> ⚠️ These rules are insecure and for development only.
> Authentication and validation rules will be added post-MVP.

---

## 9. Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Bus number as Firebase key | Simple, human-readable, one location per bus |
| Last-write-wins for same bus | Avoids complex conflict resolution in MVP |
| `crypto.randomUUID()` for deviceId | Built-in, no dependencies, unique enough |
| Leaflet.js for maps | Free, open-source, lightweight, CDN-available |
| OpenStreetMap tiles | Free, no API key required, good global coverage |
| No build tools | Keeps deployment trivial (just push HTML/JS/CSS) |
| Single HTML page | Simplest possible architecture for MVP |
| CDN for all libraries | No npm, no node_modules, no bundler needed |

---

## 10. Known Limitations (Accepted for MVP)

1. **No authentication** — anyone can broadcast any bus number
2. **No validation** — bus numbers are free-text, not validated against a route database
3. **Name collisions** — two people broadcasting bus "42" will overwrite each other
4. **No background GPS** — most mobile browsers stop GPS when tab is backgrounded
5. **No offline support** — requires internet connection at all times
6. **No data expiration** — Firebase entries persist until explicitly removed
7. **Exposed API keys** — Firebase config is in client-side code (standard for Firebase web apps, security comes from rules)
8. **Single region** — default map center is hardcoded

---

## 11. Testing Strategy

| Test | Method |
|------|--------|
| Map loads correctly | Open page in browser, verify tiles render |
| GPS broadcasting works | Start broadcasting, check Firebase console |
| Realtime sync works | Broadcast on phone A, watch map on phone B |
| Multiple buses display | Broadcast with different bus numbers from 2 devices |
| Stop removes marker | Stop broadcasting, verify marker disappears |
| Mobile layout works | Open on phone, verify controls are usable |

---

## 12. Change Log

| Date | Change |
|------|--------|
| 2026-05-16 | Phase 1 complete: GPS access working |
| 2026-05-16 | Phase 2 complete: Firebase realtime sync working (name-based) |
| 2026-05-16 | context.md created, MVP implementation plan defined |
| 2026-05-16 | Task 1: Leaflet.js map added (fullscreen, OpenStreetMap tiles) |
| 2026-05-16 | Task 2: Data model changed to `buses/{busNumber}`, anonymous broadcasting |
| 2026-05-16 | Task 3: Bus markers displayed on map with realtime position updates |
| 2026-05-16 | Task 4: Text-based broadcaster list removed, map is sole visualization |
| 2026-05-16 | Task 5: Mobile-optimized CSS, floating control panel, status indicator |
| 2026-05-16 | Task 6: Staleness handling (2min opacity fade, 5min removal) |

---

*End of context. Update this file after every meaningful change.*
