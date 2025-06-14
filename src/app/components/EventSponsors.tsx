"use client"

import Image from "next/image";
import { EventSponsorsProps, Sponsors } from "@/lib/types";
import { useEffect, useState } from "react";

export default function EventSponsors({ sponsors, secondaryColor }: EventSponsorsProps) {
  const [matchedSponsors, setMatchedSponsors] = useState<Sponsors[]>([]);

  const bgColor = secondaryColor

  useEffect(() => {
    async function fetchSponsors() {
      try {
        const sponsorIds = Array.isArray(sponsors[0])
          ? (sponsors as string[]).flat()
          : (sponsors as string[]);

        const query = sponsorIds.join(",");
        const response = await fetch(`/api/sponsor?ids=${query}`);

        if (!response.ok) throw new Error("Failed to fetch sponsors");

        const data: Sponsors[] = await response.json();
        setMatchedSponsors(data);
      } catch (error) {
        console.error("Error fetching sponsors:", error);
      }
    }

    if (sponsors?.length) {
      fetchSponsors();
    }
  }, [sponsors]);

  if (!matchedSponsors.length) return null;

  return (
    <div className="mb-10 w-full flex flex-col justify-center align-middle items-center">
      <h2 className="text-2xl font-bold mb-4">Sponsors</h2>
      <div className="flex flex-row flex-wrap justify-center align-middle items-center">
        {matchedSponsors.map((sponsor) => (
          <div
            key={sponsor.sponsorId}
            className="backdrop-blur-sm rounded-xl p-4 flex flex-row items-center hover:scale-105 transition-transform duration-300"
          >
            <div
              className="flex flex-col justify-center items-center align-middle"
            >
              <div className="relative w-32 h-32 mb-2 p-2 rounded-lg shadow-lg">
                <Image
                  src={sponsor.sponsorLogo}
                  alt={sponsor.sponsorName}
                  fill
                  className="object-contain rounded"
                />
              </div>
              <p className="text-sm text-center font-medium">
                {sponsor.sponsorName}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
