"use client";

import { useState } from "react";
import DateRangeCalendar from "@/components/DateRangeCalendar";

/** Calendrier de la fiche : affiche le séjour et laisse explorer d'autres dates (non persisté). */
export default function StayCalendar({ start, end }: { start: string; end: string }) {
  const [range, setRange] = useState<[string, string]>([start, end]);
  return (
    <div className="lst-cal">
      <DateRangeCalendar start={range[0]} end={range[1]} onChange={(s, e) => setRange([s, e])} />
    </div>
  );
}
