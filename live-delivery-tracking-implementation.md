# CU Bazzar — Live Delivery Tracking Map: Antigravity Prompt

> **How to use this file**: This is a phased implementation plan for rebuilding and fixing the Live Delivery Tracking Map in CU Bazzar. Work through one phase at a time. Do not move to the next phase until the current phase is confirmed working. Each phase builds on the last.
>
> **You have full access to the codebase.** Use your judgment on implementation details within each phase. The goals and constraints are defined — the exact approach is yours to decide.
>
> **Two supporting documents are attached alongside this file:**
> 1. `cu_bazzar_map_context.md` — The full architecture spec for the tracking system (stack, design, data flow, component structure, MapLibre constraints, brand guidelines)
> 2. `perplexity_research.md` — Deep research report covering GPS smoothing, coordinate systems, routing APIs, ETA models, Supabase Realtime limits, and marker animation techniques

---

## Background & Current Problems

CU Bazzar is a campus-only food delivery app for Chandigarh University students. After a student places an order, they are taken to a `/tracking` page that shows a live 3D map with two markers — one for the delivery rider and one for the customer — connected by a dashed line, with real-time distance and ETA displayed.

The map uses **MapLibre GL JS** with **MapTiler** tiles. The rider's GPS is broadcast from an admin portal via **Supabase Realtime Broadcast** (`delivery-tracking` channel, `location-update` event, payload: `{ lat, lng, heading? }`). The customer's location comes from the browser **Geolocation API**.

**Three bugs are currently broken in production:**

1. **Wrong rider location when the order is placed** — The rider marker appears at a hardcoded simulation point (`[76.611, 30.7695]`) instead of the rider's real position, because the Supabase broadcast hasn't fired yet and the simulation kicks in immediately.

2. **Correct location after acceptance but wrong distance** — Once the rider accepts and starts broadcasting, the marker moves to the right place, but the distance shown is incorrect. This is most likely a coordinate order bug (`[lat, lng]` being passed where `[lng, lat]` is expected, or vice versa) somewhere in the pipeline between Supabase → React state → Haversine calculation.

3. **Wrong location and distance again after "Picked Up"** — When the rider taps the "Picked Up" button on their end, something causes the rider position to reset or re-initialize incorrectly, and the distance breaks again. The Supabase channel may be re-subscribing, or the component state may be resetting at the status change.

---

## Stack Reference

| Item | Value |
|---|---|
| Frontend | React + TypeScript + Vite |
| Mobile | Capacitor (Android APK) |
| Styling | Tailwind CSS + Framer Motion |
| Map Library | `maplibre-gl` |
| Tile Provider | MapTiler (`streets-v2-dark`, API Key: `jEk2ccOHJB7MWbvOKKBV`) |
| Backend | Supabase (Postgres + Realtime Broadcast + Auth) |
| Map Component | `src/components/RealTimeSatelliteMap.tsx` |
| Tracking Page | `src/pages/Tracking.tsx` (or equivalent path) |
| CU Campus Center | `[76.6074, 30.7673]` (lng, lat — MapLibre order) |
| Driver Default Sim Start | `[76.6110, 30.7695]` |

---

## Phase 1 — Fix the Coordinate Pipeline (Do This First)

**Goal**: Eliminate all `[lat, lng]` / `[lng, lat]` confusion across the entire data pipeline. This single fix is the most likely cause of bugs 2 and 3.

**What to do:**

Define two strict TypeScript types and enforce them at every boundary:

```ts
// Internal domain type — always use this inside React state and logic
export interface LatLng {
  lat: number;
  lng: number;
}

// MapLibre-compatible tuple — only construct this at MapLibre API call sites
export type LngLatTuple = [number, number]; // [longitude, latitude]
```

Create two converter functions used at every boundary crossing:

```ts
// Use at Geolocation API boundary
export function fromGeolocationPosition(pos: GeolocationPosition): LatLng {
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}

// Use at Supabase broadcast boundary
export function fromSupabasePayload(payload: { lat: number; lng: number }): LatLng {
  return { lat: payload.lat, lng: payload.lng };
}

// Use ONLY when passing to MapLibre (marker.setLngLat, fitBounds, map.flyTo, etc.)
export function toLngLatTuple(p: LatLng): LngLatTuple {
  return [p.lng, p.lat];
}
```

**Rules to enforce:**
- React state (`driverPos`, `userPos`) must always be typed as `LatLng`, never as raw arrays
- Raw arrays `[number, number]` must only exist at the exact line where they are passed to a MapLibre API call
- The Haversine function must accept `LatLng` objects, not raw arrays
- Search the entire `RealTimeSatelliteMap.tsx` and `Tracking.tsx` for any place a coordinate array is constructed manually and verify the order

**Done when:** TypeScript has no `any` types on coordinate values, and there is exactly one place in the code where `[lng, lat]` arrays are constructed — inside `toLngLatTuple`.

---

## Phase 2 — Fix the Rider Marker Visibility Logic

**Goal**: Stop showing a fake simulated rider position. The rider marker should not appear until the first real Supabase broadcast is received.

**What to do:**

- Add a boolean state variable: `const [hasRealFix, setHasRealFix] = useState(false)`
- When the Supabase channel receives its first `location-update` event, set `hasRealFix = true` and never reset it, even on order status changes
- Do not render the rider marker at all when `hasRealFix` is false
- Instead, show a UI overlay text like `"Waiting for rider location..."` in the map area (styled to match the existing badge design — dark background, emerald text)
- Remove the simulation interval entirely, or keep it only as an explicit opt-in debug mode that is never active in production builds
- The route line between rider and customer should also only appear when `hasRealFix` is true

**Important:** The `hasRealFix` flag must survive order status changes. Do not store it in a way that gets reset when the order status updates (e.g. don't derive it from order status — keep it as independent local state in `RealTimeSatelliteMap.tsx`).

**Done when:** On a fresh page load with no Supabase broadcast, the rider marker is invisible and the waiting message shows. As soon as the first broadcast fires, the marker appears at the correct location.

---

## Phase 3 — Fix the Status Change Reset Bug

**Goal**: Stop the rider position and Supabase channel from breaking when the order moves to "Picked Up" or any other status.

**What to do:**

- Audit what happens in `RealTimeSatelliteMap.tsx` and `Tracking.tsx` when the order status changes (Pending → Confirmed → Picked → Delivering → Delivered)
- The Supabase Realtime channel subscription (`supabase.channel('delivery-tracking')`) must be created once on component mount and cleaned up only on component unmount — never re-created on status change
- `driverPos` state must not reset to a default value when status changes
- If `Tracking.tsx` passes the order status as a prop to `RealTimeSatelliteMap`, confirm this prop change does not trigger a re-mount of the map component (check that the map component's key prop is not tied to order status)
- Add a `console.log` for every Supabase channel status change and every `driverPos` update so you can trace exactly what happens on status transition during testing

**Done when:** Tapping "Picked Up" on the rider side causes no visual jump or reset on the customer's tracking screen. The rider marker continues smoothly from its last known position.

---

## Phase 4 — GPS Smoothing & Outlier Rejection

**Goal**: Filter out bad GPS fixes and smooth the incoming rider coordinates before updating state, so the marker doesn't jump on bad signals.

**What to do:**

Implement a stateful smoothing utility with three layers:

1. **Accuracy filter** — Reject any incoming fix where `accuracy > 70` meters (if accuracy is available in the payload; skip this check if it isn't sent)

2. **Speed outlier rejection** — Compute implied speed between the last accepted position and the new one using Haversine. Reject the new point if implied speed exceeds 40 km/h (campus bikes/scooters don't go faster)

3. **Exponential Moving Average (EMA)** — After passing the above filters, smooth the coordinate:
   ```
   smoothedLat = 0.5 * newLat + 0.5 * prevLat
   smoothedLng = 0.5 * newLng + 0.5 * prevLng
   ```
   An alpha of `0.5` is a reasonable starting point — adjust based on how "laggy" vs "jumpy" the marker feels

Apply this smoothing to the rider's incoming coordinates from Supabase **before** calling `setDriverPos`. Do not apply smoothing to the customer's GPS — it's already stable.

**Done when:** In testing, sending a deliberately bad coordinate (e.g. a point 500m away from campus) does not cause the rider marker to jump there.

---

## Phase 5 — Smooth Marker Animation Between GPS Updates

**Goal**: Instead of the rider marker teleporting to each new coordinate, it should glide smoothly between updates using `requestAnimationFrame` interpolation.

**What to do:**

Create a `useGlidingMarker` React hook that:
- Takes the latest `LatLng` target and an animation duration (e.g. `1000ms` — matched to your GPS update interval)
- Interpolates between the previous rendered position and the new target using linear interpolation (LERP) driven by `requestAnimationFrame`
- If a new target arrives mid-animation, retargets the animation from the current interpolated position (no snap)
- Returns the current `display` position which is passed to `marker.setLngLat()`

```ts
// Conceptual structure — implement as you see fit
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function useGlidingMarker(target: LatLng, durationMs: number): LatLng {
  // store prev, animate to target with rAF, return display position
}
```

Use the `display` position (from this hook) to update the MapLibre marker's `setLngLat` call on every animation frame. Do NOT use it for distance or ETA calculation — always use the raw `driverPos` for those.

Also animate the route line's coordinates using the same `display` position so it moves in sync with the marker.

**Done when:** The rider marker visibly glides between GPS updates instead of snapping. The animation should feel fluid at both 1-second and 5-second update intervals.

---

## Phase 6 — ETA Calibration

**Goal**: Make the ETA feel accurate for a campus delivery context rather than using a generic formula.

**Current formula:**
```
ETA (mins) = (distanceKm / 15) * 60
```
This assumes 15 km/h average speed, which may not reflect real campus riding speed including stops, building navigation, etc.

**What to do:**

Replace the hardcoded speed with a configurable constant and add a fixed buffer:

```ts
const CAMPUS_SPEED_KMH = 10;     // conservative campus riding speed
const PICKUP_BUFFER_MINS = 2;    // time to navigate building, hand over order

const travelMins = (distanceKm / CAMPUS_SPEED_KMH) * 60;
const etaMins = Math.round(travelMins + PICKUP_BUFFER_MINS);
```

Display the ETA as a range (`"5–8 mins"`) rather than a precise number, calculated as:
```ts
const low = Math.max(1, etaMins - 1);
const high = etaMins + 2;
display: `${low}–${high} mins`
```

This absorbs small GPS inaccuracies and feels more realistic to users.

Only show ETA when `hasRealFix` is true. Show `"Calculating..."` otherwise.

**Done when:** ETA updates every time a new rider position is received and displays a range that feels realistic for on-campus delivery.

---

## Phase 7 — Road-Snapped Route Line (Optional, Do Last)

**Goal**: Replace the straight dashed line between rider and customer with a line that follows actual campus roads.

> **Only do this phase if the straight line is causing user confusion or the product specifically needs it. It adds meaningful complexity.**

**Recommended approach:**

Use a self-hosted **OSRM** or **GraphHopper** instance loaded with an OSM extract of the Chandigarh University campus + 2–3 km buffer. Do not use Google Directions API (too expensive at scale) or MapTiler routing (limited free tier).

Integration with MapLibre:
- Use `@maplibre/maplibre-gl-directions` (OSRM-compatible) or a simple fetch + polyline decode
- Call the routing API when either `driverPos` or `userPos` changes (debounce to max once every 5 seconds)
- Decode the returned polyline into a GeoJSON `LineString` and update the `route` source using `setData()`
- Cache route geometry for common pickup → hostel block pairs to reduce API calls

If setting up a self-hosted router is not viable right now, skip this phase and keep the straight line. The UX is acceptable for a 1km campus radius.

**Done when:** The line between rider and customer follows campus roads/paths instead of cutting through buildings.

---

## General Constraints to Respect Throughout All Phases

- **Never re-initialize the MapLibre map** on re-renders. The map must be created once in a `useEffect` with a `map.remove()` cleanup. Any state change that causes the map to re-initialize will break everything.
- **Markers can only be added after `map.on('load', ...)` fires.** Gate all marker creation behind `isMapLoaded` state.
- **Tailwind classes do not work on raw DOM elements** created for MapLibre custom markers. Use inline styles or injected `<style>` tags with CSS keyframes.
- **The route line source must be added inside the `map.on('load')` callback**, and updated via `(map.getSource('route') as GeoJSONSource).setData(...)` — never by removing and re-adding the source.
- **Keep the Supabase channel payload small**: `{ lat, lng, heading?, t }` only. No extra data.
- **MapLibre coordinate order is always `[longitude, latitude]`** — enforce this strictly via the `toLngLatTuple` converter from Phase 1, used everywhere.
- **Brand colors**: Rider marker = `#10b981` (emerald), Customer marker = `#6366f1` (indigo), Background = `#0A0A0A`, accent glow = `rgba(16,185,129,0.5)`

---

## Testing Checklist (Run After Each Phase)

- [ ] Fresh page load with no Supabase broadcast → rider marker hidden, "Waiting" message visible
- [ ] First Supabase broadcast fires → rider marker appears at correct coordinates
- [ ] Order moves from Confirmed → Picked Up → no marker jump, no channel reset
- [ ] Distance shown matches approximate real-world distance (walk it on campus to verify)
- [ ] ETA feels reasonable for the displayed distance
- [ ] Rider marker moves smoothly without jumping (test by sending coordinates every 1s and every 5s)
- [ ] No TypeScript errors on coordinate types
- [ ] Map loads correctly in Capacitor Android WebView (test on device, not just browser)
- [ ] `map.remove()` is called cleanly when navigating away from `/tracking`