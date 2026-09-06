import { NextResponse } from "next/server";

type RawPlace = {
  code?: string;
  name?: string;
  city_name?: string;
  country_name?: string;
  type?: string;
};

export type Place = {
  code: string;
  name: string;
  country: string;
  type: string;
};

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const url = `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(
    q,
  )}&locale=fr&types[]=city&types[]=airport`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return NextResponse.json([]);
    const raw = (await res.json()) as RawPlace[];
    const places: Place[] = raw
      .filter((p) => p.code && (p.name || p.city_name))
      .slice(0, 8)
      .map((p) => ({
        code: p.code as string,
        name: p.name ?? p.city_name ?? (p.code as string),
        country: p.country_name ?? "",
        type: p.type ?? "city",
      }));
    return NextResponse.json(places);
  } catch {
    return NextResponse.json([]);
  }
}
