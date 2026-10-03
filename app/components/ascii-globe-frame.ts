const columns = 64;
const rows = 31;
const shades = ".:-=+*#@";
const points: [number, number, number][] = [];

function addPoint(latitude: number, longitude: number) {
  points.push([
    Math.cos(latitude) * Math.cos(longitude),
    Math.sin(latitude),
    Math.cos(latitude) * Math.sin(longitude),
  ]);
}

// Latitude and longitude lines form the globe's wireframe.
for (let meridian = 0; meridian < 12; meridian++) {
  for (let sample = 0; sample <= 120; sample++) {
    addPoint(-Math.PI / 2 + (sample / 120) * Math.PI, (meridian / 12) * Math.PI * 2);
  }
}
for (let parallel = -3; parallel <= 3; parallel++) {
  for (let sample = 0; sample < 160; sample++) {
    addPoint((parallel / 8) * Math.PI, (sample / 160) * Math.PI * 2);
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
    const column = Math.round(columns / 2 + rotatedX * 23 * perspective);
    const row = Math.round(rows / 2 - tiltedY * 11 * perspective);

    if (column < 0 || column >= columns || row < 0 || row >= rows) continue;
    const index = row * columns + column;
    if (tiltedZ <= depth[index]) continue;
    depth[index] = tiltedZ;
    const shade = Math.max(0, Math.min(shades.length - 1, Math.floor(((tiltedZ + 1) / 2) * shades.length)));
    characters[index] = shades[shade];
  }

  return Array.from({ length: rows }, (_, row) =>
    characters.slice(row * columns, (row + 1) * columns).join(""),
  ).join("\n");
}
