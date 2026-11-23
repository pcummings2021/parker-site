const columns = 96;
const rows = 45;
const shades = ".:-=+*#@";
const points: [number, number, number][] = [];
type Point = [number, number, number];
const shipShades = "*#@";

function drawShips(angle: number, characters: string[], depth: Float32Array) {
  for (let ship = 0; ship < 5; ship++) {
    const direction = ship % 2 === 0 ? 1 : -1;
    const phase = angle * (0.7 + ship * 0.06) * direction + ship * Math.PI * 2 / 5;
    const inclination = [0.25, -0.65, 1, -0.4, 0.8][ship];
    const node = ship * 0.7;
    const radius = 1.1;

    function toWorld(forward: number, outward: number, height: number): Point {
      // A wedge's nose follows the orbit tangent; its raised spine gives it depth.
      const x = (radius + outward) * Math.cos(phase) - forward * Math.sin(phase) * direction;
      const orbitZ = (radius + outward) * Math.sin(phase) + forward * Math.cos(phase) * direction;
      const y = orbitZ * Math.sin(inclination) + height * Math.cos(inclination);
      const z = orbitZ * Math.cos(inclination) - height * Math.sin(inclination);
      return [x * Math.cos(node) + z * Math.sin(node), y, -x * Math.sin(node) + z * Math.cos(node)];
    }

    const vertices = [
      toWorld(0.2, 0, 0),
      toWorld(-0.11, -0.1, 0),
      toWorld(-0.11, 0.1, 0),
      toWorld(-0.07, 0, 0.12),
    ];

    for (const [a, b, c] of [[0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]]) {
      const origin = vertices[a];
      const u = vertices[b].map((value, i) => value - origin[i]);
      const v = vertices[c].map((value, i) => value - origin[i]);
      const normal = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const normalLength = Math.hypot(...normal);
      const light = Math.abs((normal[0] * -0.4 + normal[1] * 0.6 + normal[2] * 0.7) / normalLength);

      for (let s = 0; s <= 1; s += 0.025) {
        for (let t = 0; t <= 1 - s; t += 0.025) {
          const [x, y, z] = origin.map((value, i) => value + u[i] * s + v[i] * t);
          const perspective = 4 / (4 - z);
          const column = Math.round(columns / 2 + x * 36 * perspective);
          const row = Math.round(rows / 2 - y * 17 * perspective);
          if (column < 0 || column >= columns || row < 0 || row >= rows) continue;

          // Hide the far-side ships behind the globe, even between wire lines.
          const screenRadius = ((column - columns / 2) / 36) ** 2 + ((rows / 2 - row) / 17) ** 2;
          const discriminant = 1 - 15 * screenRadius / 16;
          if (discriminant >= 0 && z < (screenRadius / 4 + Math.sqrt(discriminant)) / (1 + screenRadius / 16)) continue;

          const index = row * columns + column;
          if (z <= depth[index]) continue;
          depth[index] = z;
          const brightness = (0.35 + light * 0.55) * (0.85 + z * 0.15);
          characters[index] = shipShades[Math.min(shipShades.length - 1, Math.floor(brightness * shipShades.length))];
        }
      }
    }
  }
}

function addPoint(latitude: number, longitude: number) {
  points.push([
    Math.cos(latitude) * Math.cos(longitude),
    Math.sin(latitude),
    Math.cos(latitude) * Math.sin(longitude),
  ]);
}

// Latitude and longitude lines form the globe's wireframe.
for (let meridian = 0; meridian < 16; meridian++) {
  for (let sample = 0; sample <= 160; sample++) {
    addPoint(-Math.PI / 2 + (sample / 160) * Math.PI, (meridian / 16) * Math.PI * 2);
  }
}
for (let parallel = -4; parallel <= 4; parallel++) {
  for (let sample = 0; sample < 240; sample++) {
    addPoint((parallel / 10) * Math.PI, (sample / 240) * Math.PI * 2);
  }
}

export function renderGlobe(angle: number): string {
  const characters = new Array<string>(columns * rows).fill(" ");
  const depth = new Float32Array(columns * rows).fill(-Infinity);
  const tilt = 0.4 + Math.sin(angle * 0.5) * 0.12;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const sinTilt = Math.sin(tilt);
  const cosTilt = Math.cos(tilt);

  for (const [x, y, z] of points) {
    const rotatedX = x * cos + z * sin;
    const rotatedZ = -x * sin + z * cos;
    const tiltedY = y * cosTilt - rotatedZ * sinTilt;
    const tiltedZ = y * sinTilt + rotatedZ * cosTilt;
    const perspective = 4 / (4 - tiltedZ);
    const column = Math.round(columns / 2 + rotatedX * 36 * perspective);
    const row = Math.round(rows / 2 - tiltedY * 17 * perspective);

    if (column < 0 || column >= columns || row < 0 || row >= rows) continue;
    const index = row * columns + column;
    if (tiltedZ <= depth[index]) continue;
    depth[index] = tiltedZ;
    const shade = Math.max(0, Math.min(shades.length - 1, Math.floor(((tiltedZ + 1) / 2) * shades.length)));
    characters[index] = shades[shade];
  }

  drawShips(angle, characters, depth);

  return Array.from({ length: rows }, (_, row) =>
    characters.slice(row * columns, (row + 1) * columns).join(""),
  ).join("\n");
}
