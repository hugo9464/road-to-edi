import { readFileSync, writeFileSync } from 'fs';

// Parse GPX trackpoints
const gpx = readFileSync('trace.gpx', 'utf-8');
const trkpts = [...gpx.matchAll(/<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)">/g)];
const allCoords = trkpts.map(m => [parseFloat(m[2]), parseFloat(m[1])]); // [lon, lat]

console.log(`Total trackpoints: ${allCoords.length}`);

// Haversine distance in km
function haversine([lon1, lat1], [lon2, lat2]) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Calculate cumulative distances and total
let cumDist = [0];
let totalKm = 0;
for (let i = 1; i < allCoords.length; i++) {
  const d = haversine(allCoords[i - 1], allCoords[i]);
  totalKm += d;
  cumDist.push(totalKm);
}
console.log(`Total distance: ${totalKm.toFixed(1)} km`);

// Detect boat section (segment > 5km between consecutive points)
let boatStartIdx = -1, boatEndIdx = -1;
let maxGap = 0;
for (let i = 1; i < allCoords.length; i++) {
  const d = haversine(allCoords[i - 1], allCoords[i]);
  if (d > maxGap) {
    maxGap = d;
    boatStartIdx = i - 1;
    boatEndIdx = i;
  }
}
console.log(`Largest gap: ${maxGap.toFixed(1)} km at indices ${boatStartIdx}-${boatEndIdx}`);
console.log(`  From: [${allCoords[boatStartIdx]}] to [${allCoords[boatEndIdx]}]`);
console.log(`  Boat start km: ${cumDist[boatStartIdx].toFixed(1)}`);
console.log(`  Boat end km: ${cumDist[boatEndIdx].toFixed(1)}`);

const boatKm = Math.round(maxGap);
const boatStartKm = Math.round(cumDist[boatStartIdx]);
const boatEndKm = Math.round(cumDist[boatEndIdx]);

// Simplify: keep every Nth point to target ~2000 points
const targetPoints = 2000;
const N = Math.max(1, Math.floor(allCoords.length / targetPoints));
const simplified = allCoords.filter((_, i) => i % N === 0 || i === allCoords.length - 1);

// Round coordinates to 6 decimal places
const rounded = simplified.map(([lon, lat]) => [
  Math.round(lon * 1e6) / 1e6,
  Math.round(lat * 1e6) / 1e6,
]);

console.log(`Simplified: ${rounded.length} points (every ${N}th)`);

const geojson = {
  type: "FeatureCollection",
  features: [{
    type: "Feature",
    properties: {
      name: "Paris → Edinburgh",
      totalKm: Math.round(totalKm),
      boatKm,
      boatStartKm,
      boatEndKm,
    },
    geometry: {
      type: "LineString",
      coordinates: rounded,
    },
  }],
};

writeFileSync('public/data/route.geojson', JSON.stringify(geojson));
console.log('Written to public/data/route.geojson');
console.log(`Properties:`, geojson.features[0].properties);
