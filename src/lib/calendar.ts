export function addToCalendar(event: { date: string | number | Date; eventName: string | number | boolean; eventDesc: string | number | boolean; isVirtual: any; location: string | number | boolean; googleMapsLink: any; }) {
  const startDate = new Date(event.date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const endDate = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000)
    .toISOString()
    .replace(/[-:]/g, "")
    .split(".")[0] + "Z";
  const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.eventName
  )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
    event.eventDesc
  )}&location=${encodeURIComponent(event.isVirtual ? event.location : event.googleMapsLink || event.location)}`;
  window.open(calendarUrl, "_blank");
}