import { VirtualEventFeaturesProps } from "@/lib/types";

export default function VirtualEventFeatures({ isVirtual }: VirtualEventFeaturesProps) {
  if (!isVirtual) return null;
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold">Virtual Event Features</h2>
      <div className="flex gap-4">
        <button className="px-4 py-2 rounded bg-gray-500 text-white">Join Live Chat</button>
        <button className="px-4 py-2 rounded bg-gray-500 text-white">Submit Q&A</button>
        <button className="px-4 py-2 rounded bg-gray-500 text-white">Join Breakout Room</button>
      </div>
    </div>
  );
}