import { FC } from "react";

interface MapProps {
  url: string;
}

const Map: FC<MapProps> = ({ url }) => {
  return (
    <div className="w-full h-96 mt-4">
      <iframe
        src={url}
        width="100%"
        height="100%"
        className="border-0 rounded-lg"
        allowFullScreen
        loading="lazy"
        title="Event Location Map"
      />
    </div>
  );
};

export default Map;