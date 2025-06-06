import { EventDescriptionProps } from "@/lib/types";

export default function EventDescription({ description }: EventDescriptionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold">Description</h2>
      <p>{description}</p>
    </div>
  );
}