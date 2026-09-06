"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { HotelOffer } from "@/lib/hotels";

function FitBounds({ hotels }: { hotels: HotelOffer[] }) {
  const map = useMap();
  useEffect(() => {
    if (hotels.length === 0) return;
    const bounds = L.latLngBounds(hotels.map((h) => [h.lat, h.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [map, hotels]);
  return null;
}

function PricePin({ hotel, active, onHover }: { hotel: HotelOffer; active: boolean; onHover: (id: string | null) => void }) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "pin-wrap",
        html: `<div class="pin${active ? " on" : ""}">${hotel.total} €</div>`,
        iconSize: undefined,
      }),
    [hotel.total, active],
  );
  return (
    <Marker
      position={[hotel.lat, hotel.lng]}
      icon={icon}
      zIndexOffset={active ? 1000 : 0}
      eventHandlers={{
        mouseover: () => onHover(hotel.id),
        mouseout: () => onHover(null),
        click: () => window.open(hotel.bookingUrl, "_blank", "noopener"),
      }}
    />
  );
}

export default function HotelMap({
  hotels,
  center,
  activeId,
  onHover,
}: {
  hotels: HotelOffer[];
  center: { lat: number; lng: number };
  activeId: string | null;
  onHover: (id: string | null) => void;
}) {
  return (
    <div className="map-wrap">
      <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds hotels={hotels} />
        {hotels.map((h) => (
          <PricePin key={h.id} hotel={h} active={h.id === activeId} onHover={onHover} />
        ))}
      </MapContainer>
    </div>
  );
}
