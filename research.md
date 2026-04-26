You can get a production-grade experience with your current stack by combining conservative GPS filtering, a clean coord pipeline, simple routing/ETA models, and lightweight realtime. Below is a concrete approach for each point, tuned for a 1 km campus and a MapLibre + Supabase stack.

***

## 1. Real-time location accuracy & smoothing

### Raw vs smoothed coordinates

- Phone GPS fixes are already heavily Kalman-filtered inside the receiver; applying another Kalman filter usually does not make them more “accurate” in terms of ground truth, but it can make the visual track smoother. [stackoverflow](https://stackoverflow.com/questions/9735744/kalman-filter-for-gps-android)
- A good pattern is:
  - **Store raw points** (with accuracy, timestamp) for logs/analytics.  
  - **Render smoothed points** in the UI so the marker glides instead of jittering. [neon](https://neon.com/blog/implementing-a-kalman-filter-in-postgres-to-smooth-gps-data)

### Basic filtering pipeline

From the browser Geolocation API you get `coords.latitude`, `coords.longitude`, `coords.accuracy` and optionally `speed` and `heading`. For realtime display, a pragmatic pipeline is: [w3schools](https://www.w3schools.com/html/html5_geolocation.asp)

1. **Accuracy filter**  
   - Drop points with `accuracy` worse than some threshold (e.g. > 50–70 m for your use case), since these will often cause wild jumps. [w3schools](https://www.w3schools.com/html/html5_geolocation.asp)

2. **Speed / jump filter**  
   - Compute implied speed between last accepted point and new point:  
     \(v = \frac{\text{distance(lat1,lng1,lat2,lng2)}}{\Delta t}\) (Haversine).  
   - Reject points that would imply impossible speed, e.g. > 40–50 km/h for bikes/scooters on campus. [nextmv](https://www.nextmv.io/blog/haversine-vs-osrm-distance-and-cost-experiments-on-a-vehicle-routing-problem-vrp)

3. **Short-term smoothing (UI only)**  
   - Use a simple **exponential moving average (EMA)** on lat/lng and maybe heading:
     - \(lat_{smooth} = \alpha \cdot lat_{new} + (1-\alpha) \cdot lat_{prev}\)  
     - \(lng_{smooth} = \alpha \cdot lng_{new} + (1-\alpha) \cdot lng_{prev}\)  
   - For updates every 1–5 s, \(\alpha\) between 0.3–0.7 gives visibly smoother motion without huge lag.

4. **Time-based dead reckoning (optional)**  
   - If you also send heading and speed, you can “predict” a bit forward during gaps: extrapolate position for a few hundred ms while you wait for the next GPS fix.

### Kalman vs simpler filters

- The Kalman filter is a standard way to smooth noisy GPS tracks by explicitly modeling process noise and measurement noise, and has been used successfully on large GPS datasets and in database-side processing. [neon](https://neon.com/blog/implementing-a-kalman-filter-in-postgres-to-smooth-gps-data)
- However, for a campus-scale, mobile-only app, an additional full-blown Kalman filter is often overkill; you already get Kalman-filtered coordinates from the chipset, and what you mostly care about is UI smoothness, which EMA plus interpolation handles well. [stackoverflow](https://stackoverflow.com/questions/9735744/kalman-filter-for-gps-android)
- If you still want a Kalman-based approach, you can apply a 2D constant-velocity Kalman filter (state: x, y, vx, vy) on the client or in a small Node service, but it’s extra complexity with limited benefit for your use case.

### Example TS smoothing utility

Assume you always pass **raw** [lat,lng] and timestamps into this:

```ts
type LatLng = { lat: number; lng: number; t: number }; // t = ms

interface SmootherState {
  last: LatLng | null;
}

const MAX_SPEED_KMH = 40;      // reject impossible jumps
const ACCURACY_MAX_M = 70;     // reject bad fixes
const EMA_ALPHA = 0.5;

export function updateSmoothedPosition(
  state: SmootherState,
  raw: LatLng & { accuracy?: number }
): LatLng | null {
  if (raw.accuracy && raw.accuracy > ACCURACY_MAX_M) return state.last;

  if (!state.last) {
    state.last = raw;
    return raw;
  }

  const dtSec = (raw.t - state.last.t) / 1000;
  if (dtSec <= 0) return state.last;

  const distanceM = haversineMeters(state.last, raw); // implement Haversine
  const speedKmh = (distanceM / dtSec) * 3.6;
  if (speedKmh > MAX_SPEED_KMH) return state.last;

  const lat = EMA_ALPHA * raw.lat + (1 - EMA_ALPHA) * state.last.lat;
  const lng = EMA_ALPHA * raw.lng + (1 - EMA_ALPHA) * state.last.lng;

  const smoothed = { lat, lng, t: raw.t };
  state.last = smoothed;
  return smoothed;
}
```

This keeps the data model simple, drops impossible jumps, and smooths visuals without breaking distance/ETA logic.

***

## 2. Coordinate systems & avoiding [lat,lng]/[lng,lat] bugs

### The mismatch

- MapLibre GL JS follows GeoJSON and expects coordinates as **[longitude, latitude]** arrays. [dituyi](https://www.dituyi.com/wsdk/docs/api/wmapgl-en/classes/LngLat.html)
- The browser Geolocation API exposes `coords.latitude` and `coords.longitude` as separate properties (no array), and most database schemas store `(lat, lng)` in that order. [web.archive](https://web.archive.org/web/20210524175718/https:/www.w3.org/TR/geolocation-API/)

Common real-world bugs from this:

- Markers show up in the wrong continent (e.g. swapped values put you in the ocean off Africa).  
- `fitBounds` or camera center jumps to unexpected areas because [lat,lng] is passed where [lng,lat] is expected. [js.libhunt](https://js.libhunt.com/maplibre-gl-js-changelog?page=13)
- Routing APIs that expect `lat,lng` receive reversed values, so they compute nonsense routes. [developer.mappls](https://developer.mappls.com/documentation/sdk/rest-apis/mappls-routing-api/readme/)

### Safe pattern for CU Bazzar

1. **Define strong types in TS**

```ts
// Domain representation
export interface LatLng {
  lat: number;
  lng: number;
}

// MapLibre-compatible tuple
export type LngLatTuple = [number, number];
```

2. **Normalize as early as possible**

- When you receive data from:
  - Geolocation API  
  - Supabase payload  
  - Any REST endpoint  
- Convert to `LatLng` **once** at the boundary layer.

```ts
export function fromGeolocationPosition(pos: GeolocationPosition): LatLng {
  const { latitude, longitude } = pos.coords; // lat, lng
  return { lat: latitude, lng: longitude };
}
```

3. **Convert only at MapLibre & routing boundaries**

```ts
export function toLngLatTuple(p: LatLng): LngLatTuple {
  return [p.lng, p.lat];  // enforce order in one place
}
```

Then in your React MapLibre code:

```tsx
<Marker longitude={toLngLatTuple(rider).at(0)!}
        latitude={toLngLatTuple(rider).at(1)!} />
```

Or better:

```tsx
const [lng, lat] = toLngLatTuple(rider);
<Marker longitude={lng} latitude={lat} />;
```

4. **Supabase schema**

- In Postgres, either:
  - Store as a `geometry(Point, 4326)` / `geography(Point, 4326)` and always access via helper functions that decode to `{ lat, lng }`; or  
  - Store numeric columns `lat` and `lng` and **never** re-use them as [lng,lat] arrays directly.  
- When broadcasting via Supabase Realtime Broadcast, define a typed payload:

```ts
type RiderLocationEvent = {
  riderId: string;
  lat: number;
  lng: number;
  t: number;
};
```

On the client, immediately wrap into `LatLng` and never pass raw arrays around.

This pattern (strong types + boundary converters) eliminates the class of [lat,lng]/[lng,lat] bugs that MapLibre’s own changelog warns about. [dituyi](https://www.dituyi.com/wsdk/docs/api/wmapgl-en/classes/LngLat.html)

***

## 3. Distance calculation: Haversine vs routing APIs

### How “wrong” is Haversine on campus?

- Haversine computes the great-circle (“as the crow flies”) distance between two coordinates, ignoring the actual road network. [nextmv](https://www.nextmv.io/blog/haversine-vs-osrm-distance-and-cost-experiments-on-a-vehicle-routing-problem-vrp)
- Research on carpooling and routing shows Haversine is excellent as a **cheap pre-filter** but diverges from road distance when there are lakes, blocked streets, or indirect connections. [irjmets](https://www.irjmets.com/upload_newfiles/irjmets71100190335/paper_file/irjmets71100190335.pdf)
- On a dense, walkable campus with relatively direct paths, the ratio of road distance to straight-line distance is typically modest, but can still be noticeably higher where buildings or fences force detours. [irjmets](https://www.irjmets.com/upload_newfiles/irjmets71100190335/paper_file/irjmets71100190335.pdf)

For CU Bazzar:

- Your radius is only about 1 km, so absolute error is in the range of tens to a few hundred meters, not kilometers.  
- For **“how far is the rider”**, Haversine is usually “good enough” if you phrase it as **approximate** distance.  
- For **ETA**, road distance is nicer but you can compensate by calibrating speed (e.g., assume effective speed a bit lower to account for detours).

### Routing options for more accurate distance

All of these can be integrated with MapLibre via simple HTTP + polyline decoding or via a plugin like `@maplibre/maplibre-gl-directions` that supports OSRM- or Mapbox Directions-compatible backends. [npmjs](https://www.npmjs.com/package/@maplibre/maplibre-gl-directions)

**OSRM (Open Source Routing Machine)**  
- High-performance C++ routing engine for OSM data; supports services like `route`, `table`, `match`, and `trip`. [github](https://github.com/Project-OSRM/osrm-backend)
- Extremely fast for short routes but resource-hungry at world scale; community reports note high RAM usage to preprocess and serve global data. [news.ycombinator](https://news.ycombinator.com/item?id=17001422)
- For a **small campus extract**, resource requirements drop dramatically and a small VPS can be enough.

**GraphHopper**

- Java-based routing engine, designed to be fast and memory-efficient; supports driving, walking, cycling, snap to road, isochrones, and map matching. [github](https://github.com/graphhopper/graphhopper)
- Offers both open-source server and a hosted Directions API. [geofabrik](https://www.geofabrik.de/data/routing.html)
- Real-world users report it as almost as fast as OSRM but much lighter on memory at global scale. [news.ycombinator](https://news.ycombinator.com/item?id=17001422)

**Valhalla**

- Open-source routing engine with tiled graph hierarchy, designed for low-memory, regional offline routing. [github](https://github.com/valhalla/valhalla)
- Supports multimodal routing, time/distance matrices, isochrones, and map matching. [github](https://github.com/valhalla/valhalla)
- Good fit if you want to do **offline or region-only** routing (like just your campus).

**Google Directions API**

- Mature routing with excellent global coverage, traffic-aware ETAs, and high-quality polylines. [wpgeodirectory](https://wpgeodirectory.com/google-maps-platform-changes-directory-developers/)
- Pricing: Directions is about 5 USD per 1,000 calls after the 200 USD monthly free credit. [wpgeodirectory](https://wpgeodirectory.com/google-maps-platform-changes-directory-developers/)
  - If each order triggers ~3–5 route recalculations, 200 concurrent orders could easily consume thousands of calls per day; still affordable but no longer “free” for a student startup.

**MapTiler routing**

- MapTiler focuses on OSM-based tiles and navigation styles; it offers routing-related products and navigation maps geared to routing apps. [maptiler](https://www.maptiler.com/maps/streets-transport/)
- Their Cloud pricing gives 5k sessions and 100k API requests/month free, and 25k sessions / 500k requests on the 25 USD/month Flex tier, covering map and related APIs. [launcheurope](https://launcheurope.eu/en/business/products/digital/maptiler/)
- For actual routing, many MapLibre apps pair MapTiler for tiles with OSRM/GraphHopper/Valhalla for routing.

### Recommendation for CU Bazzar

Given your scale (≤200 concurrent orders, small campus):

- **MVP**:  
  - Use **Haversine** on the client to compute distance for display and ETA.  
  - Recalculate often (every location update), which is cheap.  

- **Phase 2 (if you want road-snapped lines and better ETAs)**:  
  - Run a **self-hosted OSRM, GraphHopper, or Valhalla** on a small VM using an OSM extract cropped to the university + 2–3 km buffer. [github](https://github.com/Project-OSRM/osrm-backend)
  - Integrate with MapLibre using `@maplibre/maplibre-gl-directions` (OSRM-compatible) or a simple custom fetch + polyline decode. [maptoolkit](https://www.maptoolkit.com/doc/routing/maplibre-example/)

OSRM or GraphHopper with a campus extract is likely the best “serious” routing option that remains free/low-cost and integrates cleanly with MapLibre. [github](https://github.com/maplibre/maplibre-gl-directions/blob/main/README.md)

***

## 4. ETA calculation for a 1 km campus

### How big players do ETA

Routing/delivery platforms typically combine: [upperinc](https://www.upperinc.com/blog/delivery-eta/)

- Road-network distance and historic average speed for each road segment.  
- Real-time traffic slowdowns from GPS probes and sensors.  
- Per-driver speed profiles (some riders consistently faster).  
- Fixed and variable “service times” (pickup delay at restaurant, drop-off handling time).  
- Periodic recomputation of ETA every 30–60 seconds based on live GPS. [upperinc](https://www.upperinc.com/blog/delivery-eta/)

Some even use ML models incorporating weather, time-of-day, and historical data to predict delay distributions. [upperinc](https://www.upperinc.com/blog/delivery-eta/)

### A realistic model for CU Bazzar

You probably **don’t** need a full ML stack. A practical model for a compact campus:

1. **Components**

   - \(T_{prep}\): estimated order preparation time (restaurant-specific)  
   - \(T_{pickup\_buffer}\): typical wait from “ready” until rider departs (2–3 minutes)  
   - \(D\): distance between rider and customer (Haversine or routed)  
   - \(v_{eff}\): effective average speed (m/s) for on-campus driving/riding  

   ETA to delivery:

   \[
   T_{ETA} = T_{prepRemaining} + T_{pickup\_buffer} + \frac{D}{v_{eff}}
   \]

2. **Campus-specific calibration**

   - Start with a conservative speed, e.g. 8–10 km/h for bikes or ~15–20 km/h for scooters, lower than real to account for zig-zags, signals, and slowdowns. [irjmets](https://www.irjmets.com/upload_newfiles/irjmets71100190335/paper_file/irjmets71100190335.pdf)
   - Log every trip: actual travel time vs \(D\) at that time, then compute an empirical speed distribution and update \(v_{eff}\) periodically.

3. **Dynamic adjustments**

   Even without traffic APIs, you can incorporate:

   - **Rider speed history**: maintain per-rider average speed from recent trips and nudge \(v_{eff}\) for that rider.  
   - **Time-of-day factor**: store average delay multiplier for busy slots (e.g. lunch/dinner).  
   - Recompute ETA every time a new GPS update arrives (1–5 s) so customers see ETA stabilize as the rider approaches.

4. **Implementation details**

   - Compute ETA server-side or in the admin portal using the latest rider position + order stage, then broadcast to both rider and customer.  
   - Keep it simple: avoid exposing too many decimals; round ETA to the nearest minute and show ranges (“5–7 min”) to absorb small errors.

For a 1 km campus, a calibrated distance/speed model with basic buffers will feel very close to Swiggy/Zomato-style ETAs without any heavy traffic modeling. [nextmv](https://www.nextmv.io/blog/haversine-vs-osrm-distance-and-cost-experiments-on-a-vehicle-routing-problem-vrp)

***

## 5. Route line: straight vs road-snapped

### Straight LineString

- A simple GeoJSON `LineString` from rider to customer (two points) is trivial to compute and render.  
- Visually, it shows the **direction** and high-level separation, but not the actual path the rider will take.  
- For short distances on a small map, the straight line usually looks fine and avoids extra API calls.

### Road-snapped polyline

Routing APIs (OSRM, GraphHopper, Google, etc.) return a polyline that follows roads/paths, sometimes compressed (polyline6, flexpolyline) and decoded into many coordinates. [geoapify](https://www.geoapify.com/routing-api/)

- Pros:
  - Path looks “correct” (follows streets, turns).  
  - You can animate the rider marker along the route geometry.  
- Cons:
  - More coordinates → more data over the wire and more draw calls. [reddit](https://www.reddit.com/r/mapbox/comments/okvdsz/editable_mapbox_polyline_to_follow_roads_paths/)
  - You pay per routing request for hosted services (Google, commercial GraphHopper). [geofabrik](https://www.geofabrik.de/data/routing.html)
  - You must handle decoding, updating, and invalidation when start/end change. [github](https://github.com/maplibre/maplibre-style-spec/discussions/696)

### When road-snapping matters

Road-snapping is worth it when:

- The map is central to UX (e.g. navigation screen for drivers).  
- Distances are larger or route choice is non-trivial (multiple highways, etc.).  
- You show turn-by-turn instructions or lane guidance. [geoapify](https://www.geoapify.com/routing-api/)

For CU Bazzar’s **customer** tracking view:

- A straight line between rider and customer is often sufficient, especially over ≤1 km.  
- Road-snapping is a visual nice-to-have rather than a core need.

### Lightweight campus-only alternative

- Export a **campus OSM extract** (just the university + small buffer) and build a simple road/footpath graph.  
- Run a small offline router (Valhalla or GraphHopper) on that extract to generate road-snapped routes only within campus. [wiki.openstreetmap](https://wiki.openstreetmap.org/wiki/GraphHopper)
- Cache route geometries for common pickup–hostel pairs to reduce calls further.

Or, for a very lightweight hack:

- Maintain a small static set of polylines for the **most common paths** (e.g., from each food court to each hostel block) and snap both rider and user to the nearest vertex/segment when drawing the line.

Given your constraints, I’d start with a straight line, and only add road-snapped routes if you later find the UX lacking.

***

## 6. Map provider choice for this use case

You specifically need: 3D buildings, dark theme, frequent marker updates, MapLibre integration, decent performance in Capacitor WebView, offline-friendliness, and low cost.

### MapTiler (with MapLibre)

- Provides OSM-based vector tiles and ready-to-use 3D styles like “MapTiler 3D” for building extrusions. [github](https://github.com/openmaptiles/maptiler-3d-gl-style)
- SDKs and styles are MapLibre-compatible, making it easy to switch from Mapbox GL JS with minimal changes. [woosmap](https://www.woosmap.com/blog/alternative-to-mapbox)
- Pricing: free non-commercial tier with 5k sessions / 100k API requests per month; Flex plan at ~25 USD/month gives 25k sessions / 500k requests and 10 GB hosting. [maptiler](https://www.maptiler.com/cloud/pricing/)
- Map tiles can be self-hosted or used on-prem, enabling offline/air-gapped deployments if you later buy an on-prem license. [maptiler](https://www.maptiler.com/data/pricing/)

### Mapbox

- Mature GL JS SDK with excellent 3D buildings, dark/night styles, and performance on WebGL, including WebViews. [docs.mapbox](https://docs.mapbox.com/ios/maps/examples/building-extrusions/)
- Proprietary license and usage-based pricing; heavier long-term cost and vendor lock-in compared to pure MapLibre + OSM.  
- Still works fine with frequent marker updates via WebGL and requestAnimationFrame.

### Google Maps JS API

- Fantastic data quality, built-in routing/traffic, and strong ETAs, but:  
  - Directions and other “Routes” APIs are priced around 5 USD per 1,000 calls after a 200 USD monthly free credit. [wpgeodirectory](https://wpgeodirectory.com/google-maps-platform-changes-directory-developers/)
  - JS Maps API doesn’t use MapLibre; you’d run a separate SDK, making your stack less cohesive.  
  - Offline tiles are not supported in the same way as self-hosted OSM tiles.

### Pure OSM + self-hosted tiles (OpenMapTiles / MapTiler Engine)

- You can generate MBTiles (vector) for just the campus area using OpenMapTiles/MapTiler Engine and serve them from your own server or bundle tiles for offline use. [maptiler](https://www.maptiler.com/engine/pricing/)
- Works seamlessly with MapLibre GL JS, including 3D buildings via the proper style. [github](https://github.com/openmaptiles/maptiler-3d-gl-style)
- Upfront setup cost (tile generation, hosting) but minimal variable cost, ideal for student projects.

### Offline tile caching

- Generic approach: pre-download vector tiles for zoom levels covering campus and store them in local storage or Capacitor’s filesystem; intercept MapLibre tile requests and serve from the local cache. [stackoverflow](https://stackoverflow.com/questions/5068891/map-tile-caching-for-offline-viewing)
- With self-hosted MBTiles, you can build a custom tile protocol (`maplibregl.addProtocol`) that reads from local storage instead of network. [stackoverflow](https://stackoverflow.com/questions/5068891/map-tile-caching-for-offline-viewing)

### Recommendation

For CU Bazzar:

- **Primary option**: MapLibre GL JS + MapTiler tiles and styles (dark + 3D), on the Flex (25 USD/month) plan or even free in the early stages. [woosmap](https://www.woosmap.com/blog/alternative-to-mapbox)
- **Medium term**, you can:
  - Either continue with MapTiler Cloud (simple)  
  - Or migrate to **self-hosted OpenMapTiles/MapTiler Engine** for campus-only tiles, staying on MapLibre. [maptiler](https://www.maptiler.com/data/pricing/)

Google Maps JS is overkill and more expensive for your very local use case, and Mapbox doesn’t add enough relative to MapLibre + MapTiler to justify its licensing constraints for a student project. [woosmap](https://www.woosmap.com/blog/alternative-to-mapbox)

***

## 7. Supabase Realtime for location broadcasting

### Capabilities & limits

Supabase Realtime uses Postgres logical replication plus a WebSocket server to push changes, and also offers **Broadcast** channels for ephemeral messages like live location. [ably](https://ably.com/compare/firebase-vs-supabase)

- Limits depend on plan: the Free plan allows roughly 200 concurrent connections and ~100 messages per second; Pro plans allow 500 connections and ~500 messages per second, with higher tiers for more. [supabase](https://supabase.com/docs/guides/realtime/limits)
- Benchmarks in Supabase docs show Realtime Broadcast sustaining substantial loads with multiple concurrent WebSocket connections and varying payload sizes, with performance impacted by payload size and channel count. [github](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/realtime/benchmarks.mdx)

For your scenario:

- 200 deliveries × 1 update/second = 200 messages/second in the worst case.  
- This exceeds Free plan message/second limits but fits comfortably in Pro-level limits. [supabase](https://supabase.com/docs/guides/realtime/limits)
- If you update every 2–3 seconds instead, you’re well under 100 messages/second and even Free could be OK initially. [supabase](https://supabase.com/docs/guides/realtime/limits)

### Latency & reliability

- Supabase provides **ordered** message delivery on channels but does not guarantee exactly-once delivery. [ably](https://ably.com/compare/firebase-vs-supabase)
- Multi-region replication is supported for durability, but Broadcast messages are ephemeral (not durable state by design). [ably](https://ably.com/compare/firebase-vs-supabase)
- End-to-end latency will typically be in the tens to low hundreds of milliseconds over WebSockets for a single region.

### Alternatives

**Firebase Realtime Database**

- Built-in realtime sync with strong mobile tooling, but no guarantees of ordered messages or exactly-once delivery either. [ably](https://ably.com/compare/firebase-vs-supabase)
- More tightly integrated with GCP, but you already use Supabase/Postgres.

**Ably**

- Dedicated realtime messaging platform with **global median round-trip latency ~37 ms**, designed for pub/sub over WebSockets. [ably](https://ably.com/docs/platform/architecture/latency)
- Rich features (channels, presence, fallbacks) and stronger SLAs than generic DB-driven realtime, but a separate paid service. [ably](https://ably.com/docs/platform/architecture/latency)

**Raw WebSockets**

- You can run your own Node/Elixir Go WebSocket server to handle GPS updates directly from riders and broadcast to customers.  
- Maximum control and minimal overhead, but you lose Supabase’s ecosystem, auth integration, and reliability guarantees.

### Recommendation

Given you already use Supabase:

- Supabase Realtime Broadcast is **production-viable** for GPS updates every 1–5 seconds with up to ~200 concurrent riders, provided you’re on a plan whose messages/sec and concurrent connection limits you respect. [github](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/realtime/benchmarks.mdx)
- Keep payloads small (riderId, lat, lng, timestamp) to minimize overhead.  
- Implement client-side handling that tolerates occasional lost or late messages (interpolation + last-known position smoothing), since there’s no exactly-once guarantee. [ably](https://ably.com/compare/firebase-vs-supabase)

If you later scale beyond campus or need strict low-latency SLAs, consider adding Ably or a custom WebSocket service for the location channel only, while keeping Supabase for the rest of your stack. [ably](https://ably.com/docs/platform/architecture/latency)

***

## 8. Marker animation & smooth movement

### Basic approach: interpolate between updates

When a new location arrives every 1–5 seconds, you can **animate the marker between the old and new positions** using `requestAnimationFrame`, similar to community patterns for React Map GL and MapLibre examples. [github](https://github.com/visgl/react-map-gl/issues/2305)

Key ideas:

- Keep `prev` and `next` positions (as `LngLatTuple`).  
- On each new GPS fix:
  - Set `prev = currentRenderedPosition`  
  - Set `next = newSmoothedPosition`  
  - Start an animation loop over a fixed duration (e.g. 1000 ms), interpolating along the line.  
- If another update arrives mid-animation, retarget the animation from the current position to the new target.

### Interpolation technique

For simple campus tracking, **linear interpolation (LERP)** between the coordinates is enough:

\[
lng(t) = lng_{prev} + (lng_{next} - lng_{prev}) \cdot p
\]  
\[
lat(t) = lat_{prev} + (lat_{next} - lat_{prev}) \cdot p
\]

where \(p \in [0,1]\) is the progress fraction over the animation duration.

You typically drive this with `requestAnimationFrame`, as demonstrated in MapLibre’s “animate a marker” example. [maplibre](https://www.maplibre.org/maplibre-gl-js/docs/examples/animate-a-marker/)

### Example React + MapLibre pattern

```ts
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function useGlidingMarker(target: LatLng, durationMs: number) {
  const [display, setDisplay] = React.useState<LatLng>(target);
  const prevRef = React.useRef<LatLng>(target);
  const animRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const start = performance.now();
    const startPos = prevRef.current;
    const endPos = target;

    function step(now: number) {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / durationMs);

      setDisplay({
        lat: lerp(startPos.lat, endPos.lat, p),
        lng: lerp(startPos.lng, endPos.lng, p),
      });

      if (p < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        prevRef.current = endPos;
      }
    }

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [target.lat, target.lng, durationMs]);

  return display;
}
```

Usage with MapLibre:

```tsx
const smoothed = useGlidingMarker(riderSmoothedLatLng, 1000);
const [lng, lat] = toLngLatTuple(smoothed);

<Marker longitude={lng} latitude={lat}>
  <RiderIcon />
</Marker>
```

This is conceptually similar to community examples for smooth marker motion in React-map-gl and MapLibre demos. [github](https://github.com/visgl/react-map-gl/issues/2305)

### Advanced: move along a route polyline

If you have road-snapped polylines from a routing API:

- Decode the polyline into a `LineString` of [lng,lat] points. [maptoolkit](https://www.maptoolkit.com/doc/routing/maplibre-example/)
- Build a cumulative distance array along the route and map a progress value \(s\) (0–1) to a coordinate by interpolating between the two nearest points along the route length.  
- Drive the progress with time (constant speed) or with actual distance traveled from GPS.

This is closer to what apps like Uber and Zomato do: they map-match the GPS trace to the road network using services like OSRM’s `match` and then animate the marker along that matched path for a very smooth, “on-road” glide. [github](https://github.com/Project-OSRM/osrm-backend)

For CU Bazzar, you can get 80–90% of that UX by:

- Smoothing your GPS points (EMA + outlier rejection).  
- Interpolating between updates with requestAnimationFrame.  
- Optionally snapping to a campus route polyline for the last bit of polish.

***

If you want, I can next help you with a small, ready-to-drop-in React hook + context setup for CU Bazzar that wires together Supabase Realtime, smoothing, interpolation, and MapLibre marker rendering based on this design.