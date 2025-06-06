import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AnalyticsDashboard({ eventId }: { eventId: string }) {
  const [analytics, setAnalytics] = useState({
    ticketSales: 0,
    revenue: 0,
    attendees: 0,
    engagement: 0,
  });

  useEffect(() => {
    // Mock analytics fetch
    const fetchAnalytics = async () => {
      const response = await fetch(`/api/events/${eventId}/analytics`);
      const data = await response.json();
      setAnalytics(data);
    };
    fetchAnalytics();
  }, [eventId]);

  const data = {
    labels: ["Ticket Sales", "Revenue", "Attendees", "Engagement"],
    datasets: [
      {
        label: "Event Metrics",
        data: [analytics.ticketSales, analytics.revenue, analytics.attendees, analytics.engagement],
        backgroundColor: "#6A0DAD",
      },
    ],
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Event Analytics</h3>
      <Bar data={data} options={{ responsive: true }} />
    </div>
  );
}