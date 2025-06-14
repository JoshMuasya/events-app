"use client"

import Image from "next/image";
import { EventSpeakersProps, Speakers } from "@/lib/types";
import { useEffect, useState } from "react";

export default function EventSpeakers({ speakers }: EventSpeakersProps) {
    const [speaker, setSpeaker] = useState<Speakers[]>([]);

    const fetchSpeakers = async () => {
        try {
            const speakerIds = Array.isArray(speakers[0]) ? (speakers as string[]).flat() : (speakers as string[]);

            const query = speakerIds.join(",");
            const response = await fetch(`/api/speaker?ids=${query}`)

            if (!response.ok) throw new Error("Failed to fetch Speakers");

            const data: Speakers[] = await response.json();
            setSpeaker(data)
        } catch (error) {
            console.error("Error fetching speakers:", error);
        }
    }

    useEffect(() => {
        if (speakers?.length) {
            fetchSpeakers();
        }
    }, [speakers])

    if (!speakers.length) return null

    console.log("Speakers", speaker)

    return (
        <div className="mb-10 w-full flex flex-col justify-center align-middle items-center">
            <h2 className="text-2xl font-bold mb-4">Speakers</h2>
            <div className="flex flex-row flex-wrap justify-center align-middle items-center">
                {speaker.map((s) => (
                    <div
                        key={s.id}
                        className="p-4 bg-white/5 rounded-xl border border-white/10 text-center shadow-lg"
                    >
                        {s.profileImage && (
                            <Image
                                src={s.profileImage}
                                alt={s.speakerName}
                                width={96}
                                height={96}
                                className="w-24 h-24 mx-auto rounded-full object-cover mb-4"
                            />
                        )}
                        <h3 className="text-lg font-semibold">{s.speakerName}</h3>
                        {s.description && (
                            <p className="mt-2 text-sm text-gray-300">{s.description}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
