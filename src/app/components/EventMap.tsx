"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { memo } from "react";

interface EventMapProps {
  isVirtual: boolean;
  coordinates?: { lat: number; lng: number };
}

const mapContainerStyle = {
  height: "400px",
  width: "100%",
  borderRadius: "0.5rem",
};

const defaultCenter = {
  lat: 0,
  lng: 0,
};

const EventMap: React.FC<EventMapProps> = ({ isVirtual, coordinates }) => {
  console.log("Coordinates", coordinates)

  if (isVirtual) {
    return (
      <div className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-4 text-center text-[#6A0DAD]">
        <p>This is a virtual event. Join via the provided link.</p>
      </div>
    );
  }

  if (!coordinates || isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
    return (
      <div className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-4 text-center text-[#6A0DAD]">
        <p>Location coordinates are unavailable.</p>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={coordinates || defaultCenter}
        zoom={15}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
        }}
      >
        <Marker position={coordinates} />
      </GoogleMap>
    </LoadScript>
  );
};

export default memo(EventMap);