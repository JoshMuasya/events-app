import { FC } from "react"; // Import FC from react
import { EventMapProps } from "@/lib/types";
import Map from "./Map";

const EventMap: FC<EventMapProps> = ({ isVirtual, direction }) => {
  if (isVirtual || !direction) return null;
  return (
    <div className="mb-6 w-full">
      <h2 className="text-2xl font-semibold">Location Map</h2>
      <Map url={direction} />
    </div>
  );
};

export default EventMap;