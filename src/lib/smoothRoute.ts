/** Catmull-Rom spline interpolation — smooths a polyline between sparse waypoints */
export function smoothCoordinates(coords: [number, number][], pointsPerSegment = 20): [number, number][] {
  if (coords.length < 3) return coords
  const result: [number, number][] = []
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(i - 1, 0)]
    const p1 = coords[i]
    const p2 = coords[i + 1]
    const p3 = coords[Math.min(i + 2, coords.length - 1)]
    for (let t = 0; t < pointsPerSegment; t++) {
      const f = t / pointsPerSegment
      const f2 = f * f
      const f3 = f2 * f
      const lng = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * f + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * f2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * f3)
      const lat = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * f + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * f2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * f3)
      result.push([lng, lat])
    }
  }
  result.push(coords[coords.length - 1])
  return result
}
