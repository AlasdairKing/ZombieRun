# Zombies-Run — Product Specification

**Version:** 0.1 (Initial Draft)
**Status:** Pre-development
**Date:** May 2026

---

## 1. Elevator Pitch

> *"A running app with zombies so you have to change your route and run round them. As you get fitter, add more zombies and monsters to make it more challenging. Uses your caveman fear to make you fit!"*

---

## 2. Competitive Landscape

### 2.1 Existing App — Zombies, Run!

The most established competitor is **Zombies, Run!** (Six to Start / OliveX, launched 2012), available on iOS and Android. It has ~300,000 monthly active users and ~50,000 paying subscribers.

**Key differences from this project:**

| Feature | Zombies, Run! | Zombies-Run (this project) |
|---|---|---|
| Core mechanic | Audio drama storytelling | Real-time map-based NPC avoidance |
| Zombie interaction | Audio cues trigger speed-up | Zombie positions visible on live map |
| Routing | Fixed pace, no route change required | Route diversion is the core gameplay |
| Difficulty scaling | Story progression | Zombie density scales with user fitness |
| Map display | Post-run log only | Live map during run |

**Conclusion:** Zombies, Run! is an audio-first narrative app. Zombies-Run is a **map-first, route-disruption** fitness game. The core gameplay loop is meaningfully different and defensible.

---

## 3. Product Vision

Zombies-Run uses the primal human instinct to flee danger as a motivational engine for fitness. Unlike conventional running apps that track distance and time, or audio apps that tell stories, Zombies-Run creates a **live, evolving threat on the runner's actual route**, forcing real-time decisions about where to run.

As the user's fitness improves, the challenge grows — more zombies, faster zombies, tighter corridors — creating a natural and self-regulating progression system.

---

## 4. Target Platforms

**PWA (Progressive Web App)** — deployed as a website, installable on home screen on both iOS and Android. No app store submission required.

**Tech stack:** HTML / TypeScript

---

## 5. Core Features (v1.0 Scope)

### 5.1 Live Map View

- The runner sees their real-time GPS position on a map (road/path network, not satellite).
- Zombie NPCs are displayed as icons on the map.
- Zombies move along roads and footpaths using the available routing network (e.g. OpenStreetMap / Google Roads API).
- The runner's "safe" corridor is visually clear — blocked routes appear threatened.

### 5.2 Zombie NPC Pathfinding

- Zombies are spawned at points near (but not on top of) the runner's start position.
- Zombies move along the road/path network toward the runner's last known position.
- Movement speed: slower than a walking human (approximately 1–1.5 mph) so the runner always has escape options.
- Zombies cannot spawn inside or immediately adjacent to traffic (see Safety section).
- Zombie spawn locations are constrained to pedestrian-accessible paths only.

### 5.3 Fitness-Based Difficulty Scaling

- On first use, a brief calibration run establishes baseline pace and distance.
- Zombie count and density increases as the user's running sessions improve over time.
- Progression is gradual — a new runner starts with 1–2 zombies in a large area.
- Difficulty recedes if the user skips sessions or shows declining performance.

### 5.4 Session Tracking

- Records distance, duration, pace, and route taken per session.
- Displays post-run summary: zombies avoided, route changes made, distance covered.
- Stores session history locally and optionally synced to device health APIs (Apple Health / Google Fit).

### 5.5 Audio Feedback

- Proximity alerts as a supplement to the map: a sound when a zombie gets within a threshold distance.
- Works alongside the user's own music.
- Audio is secondary — the map is the primary interface.

---

## 6. Design Philosophy

This is a personal art project. The screen is the primary interface — the live map with zombie positions is the game. The tension of watching a zombie close in and having to decide where to run *is* the experience. No safety guardrails, no audio-only fallback, no route restrictions. The player looks at the map and runs.

---

## 7. Out of Scope for v1.0 (Future Roadmap)

The following have been explicitly deferred and must not be designed into the v1.0 architecture in ways that block their future addition:

| Feature | Notes |
|---|---|
| **Monetisation** | Freemium, subscription, or IAP model — deferred. Design so it can be added cleanly. |
| **Augmented Reality (AR)** | Showing zombies through the phone camera. Significant additional safety risk if screen-facing; deferred. |
| **Customisable zombie characters** | e.g. "upload a photo of your zombie ex-wife." Fun idea, social/sharing angle. |
| **Quests and power-ups** | Collectible items on the map; timed challenges; special mission runs. |

---

## 8. Open Questions

1. **Mapping data source:** OpenStreetMap (free, no API key needed, good pedestrian data) vs Google Maps API (more accurate, costs at scale). For a personal project, OSM + Leaflet.js is the obvious starting point.
2. **Routing engine:** How do zombies pathfind along the road network? Options: OSRM (self-hosted), GraphHopper, or a simplified custom graph built from OSM data. Zombie pathfinding does not need to be perfect — convincing is enough.
3. **PWA geolocation:** Browser Geolocation API works well on Android; iOS has some PWA quirks (background location is restricted). Need to confirm whether GPS continues updating when the screen sleeps on iOS.
4. **Backend or fully offline?** Session data could be stored in localStorage for a no-backend v1.0. A backend becomes necessary if multiplayer or cloud sync are ever added.
5. **Zombie spawn density tuning:** What radius from the player do zombies spawn? How is "too many to be fun" vs "too few to be scary" calibrated? Needs playtesting.

---

## 9. Success Metrics (v1.0)

- It's fun to play.
- The zombie threat feels real enough to change how you run.
- Sessions are long enough that fitness actually improves over time.

---

*Document owner: TBD. Next review: before development kickoff.*
