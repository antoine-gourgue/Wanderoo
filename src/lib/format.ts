/** Heure "HH:mm" à partir d'un ISO, sans conversion de fuseau (heure locale telle qu'écrite). */
export function hhmm(iso: string): string {
  const m = iso.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "--:--";
}

/** Durée en minutes → "2h45" / "3h". */
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

const CITY: Record<string, string> = {
  PAR: "Paris",
  CDG: "Paris",
  ORY: "Paris",
  LIS: "Lisbonne",
  BCN: "Barcelone",
  MAD: "Madrid",
  FCO: "Rome",
  AMS: "Amsterdam",
  LON: "Londres",
  NYC: "New York",
  JFK: "New York",
  ATH: "Athènes",
  OSL: "Oslo",
  KEF: "Reykjavík",
  MRS: "Marseille",
};

export function cityName(code: string): string {
  return CITY[code.toUpperCase()] ?? code.toUpperCase();
}
