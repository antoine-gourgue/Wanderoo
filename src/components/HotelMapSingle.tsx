"use client";

import dynamic from "next/dynamic";
import type { HotelOffer } from "@/lib/hotels";

const HotelMap = dynamic(() => import("@/components/HotelMap"), {
  ssr: false,
  loading: () => <div className="map-wrap map-loading" aria-hidden="true" />,
});

export default function HotelMapSingle({ hotel }: { hotel: HotelOffer }) {
  return <HotelMap hotels={[hotel]} center={{ lat: hotel.lat, lng: hotel.lng }} activeId={hotel.id} onHover={() => {}} />;
}
