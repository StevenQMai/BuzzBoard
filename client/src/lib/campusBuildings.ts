export type LatLng = { lat: number; lng: number };

// Fallback: center of GT campus (approx).
export const CAMPUS_CENTER: LatLng = { lat: 33.7756, lng: -84.3963 };

/**
 * Common Georgia Tech building coordinates (approx).
 * Values are good-enough for coarse prioritization; unknown buildings fall back to CAMPUS_CENTER.
 */
export const GT_BUILDINGS: Record<string, LatLng> = {
  klaus: { lat: 33.7774, lng: -84.3973 },
  clough: { lat: 33.7748, lng: -84.3966 },
  instructional_center: { lat: 33.7758, lng: -84.3993 },
  culc: { lat: 33.7748, lng: -84.3966 },
  van_leer: { lat: 33.7766, lng: -84.3979 },
  howey: { lat: 33.7778, lng: -84.3988 },
  skiles: { lat: 33.7739, lng: -84.3956 },
  boggs: { lat: 33.7744, lng: -84.3986 },
  love: { lat: 33.7756, lng: -84.3977 },
  crosland: { lat: 33.7749, lng: -84.3958 },
  price_gilbert: { lat: 33.7749, lng: -84.3958 },
  technologic_square: { lat: 33.7769, lng: -84.3896 },
  student_center: { lat: 33.7744, lng: -84.3997 },
  crc: { lat: 33.7754, lng: -84.4033 },
  ferst_center: { lat: 33.7751, lng: -84.3998 },
  ford: { lat: 33.7755, lng: -84.4011 },
  whitaker: { lat: 33.7780, lng: -84.4010 },
  molecular_sciences: { lat: 33.7788, lng: -84.3994 },
  petit: { lat: 33.7759, lng: -84.4019 },
  bioquad: { lat: 33.7784, lng: -84.3983 },
  bobby_dodd: { lat: 33.7727, lng: -84.3925 },
  tech_green: { lat: 33.7760, lng: -84.3970 },
  scheller: { lat: 33.7766, lng: -84.3879 },
  tsquare: { lat: 33.7769, lng: -84.3896 },
  mrdc: { lat: 33.7762, lng: -84.4010 },
  dm_smith: { lat: 33.7736, lng: -84.3953 },
  mason: { lat: 33.7762, lng: -84.3979 },
  rich: { lat: 33.7756, lng: -84.3968 },
  bunger_henry: { lat: 33.7760, lng: -84.3997 },
  architecture: { lat: 33.7760, lng: -84.3961 },
  college_of_computing: { lat: 33.7774, lng: -84.3973 },
  kendeda: { lat: 33.7750, lng: -84.4020 },
  cherry_emerson: { lat: 33.7784, lng: -84.3974 },
  gilbert_hillhouse: { lat: 33.7745, lng: -84.3978 },
  weber: { lat: 33.7742, lng: -84.4006 },
  manufacturing: { lat: 33.7768, lng: -84.4018 },
  centergy: { lat: 33.7771, lng: -84.3889 },
  coda: { lat: 33.7774, lng: -84.3885 },
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(room|rm|suite|ste)\b/g, " ")
    .replace(/[0-9]+/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Attempts to match a free-form location string (from ICS or event Location) to a GT_BUILDINGS key.
 */
export function matchBuildingKey(location: string): string | null {
  const n = normalize(location);
  if (!n) return null;

  // Quick aliases.
  const alias: Array<[RegExp, string]> = [
    [/\bculc\b|\bclough\b/, "clough"],
    [/\bklaus\b/, "klaus"],
    [/\binstructional center\b|\bic\b/, "instructional_center"],
    [/\bvan leer\b/, "van_leer"],
    [/\bhowey\b/, "howey"],
    [/\bskiles\b/, "skiles"],
    [/\bboggs\b/, "boggs"],
    [/\bstudent center\b/, "student_center"],
    [/\bcrc\b|\brecreation\b/, "crc"],
    [/\bford\b/, "ford"],
    [/\bwhitaker\b/, "whitaker"],
    [/\bpetit\b/, "petit"],
    [/\bferst\b/, "ferst_center"],
    [/\btech green\b/, "tech_green"],
    [/\btechnologic(al)? square\b|\btsquare\b/, "tsquare"],
    [/\bscheller\b|\bcollege of business\b/, "scheller"],
    [/\bmrdc\b|\bmanufacturing research\b/, "mrdc"],
    [/\bd\.?m\.?\s*smith\b|\bdm smith\b|\bsmith\b/, "dm_smith"],
    [/\bmason\b/, "mason"],
    [/\brich\b/, "rich"],
    [/\bbunger.henry\b/, "bunger_henry"],
    [/\barchitecture\b/, "architecture"],
    [/\bcollege of computing\b|\bcoc\b/, "college_of_computing"],
    [/\bkendeda\b/, "kendeda"],
    [/\bcherry.emerson\b/, "cherry_emerson"],
    [/\bweber\b/, "weber"],
    [/\bcentergy\b/, "centergy"],
    [/\bcoda\b/, "coda"],
  ];

  for (const [re, key] of alias) {
    if (re.test(n) && GT_BUILDINGS[key]) return key;
  }

  // Generic best match: choose the longest building key whose words appear in the string.
  let best: { key: string; score: number } | null = null;
  for (const key of Object.keys(GT_BUILDINGS)) {
    const keyWords = key.split("_").filter(Boolean);
    const allPresent = keyWords.every((w) => n.includes(w));
    if (!allPresent) continue;
    const score = key.length;
    if (!best || score > best.score) best = { key, score };
  }

  return best?.key ?? null;
}

export function getCoords(location: string): LatLng {
  const key = matchBuildingKey(location);
  return (key && GT_BUILDINGS[key]) || CAMPUS_CENTER;
}

export function haversineDistanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000; // meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

