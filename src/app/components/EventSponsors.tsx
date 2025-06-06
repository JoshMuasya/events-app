import { EventDetail, EventSponsorsProps } from "@/lib/types";

export default function EventSponsors({ sponsors }: EventSponsorsProps) {
  if (!sponsors) return null;
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold">Sponsors</h2>
      <div className="flex flex-wrap gap-4">
        {/* Placeholder for sponsor logos */}
        {/* {sponsors.map((sponsor, index) => (
          <Image
            key={index}
            src={sponsor.logo}
            alt={sponsor.name}
            width={100}
            height={100}
            className="object-contain"
          />
        ))} */}
      </div>
    </div>
  );
}