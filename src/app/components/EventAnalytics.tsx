import { EventAnalyticsProps } from "@/lib/types";
import dynamic from "next/dynamic";

const AnalyticsDashboard = dynamic(() => import("@/app/components/AnalyticsDashboard"), { ssr: false });

export default function EventAnalytics({ isStaff, eventId }: EventAnalyticsProps) {
  if (!isStaff) return null;
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold">Analytics</h2>
      <AnalyticsDashboard eventId={eventId} />
    </div>
  );
}