import { MbscCalendarEvent } from "@mobiscroll/react";

export function generateRandomEvents(count: number = 20): MbscCalendarEvent[] {
  const events: MbscCalendarEvent[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    // Random date within 5 days before and after today
    const randomDays = Math.floor(Math.random() * 11) - 5; // -5 to +5
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + randomDays);

    // Random start time between 8 AM and 6 PM
    const startHour = 8 + Math.floor(Math.random() * 10);
    const startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45

    const start = new Date(eventDate);
    start.setHours(startHour, startMinute, 0, 0);

    // Random duration between 30 minutes and 24 hours (max)
    const maxDurationMinutes = 24 * 60; // 24 hours in minutes
    const durationMinutes =
      30 + Math.floor(Math.random() * (maxDurationMinutes - 30));
    const end = new Date(start.getTime() + durationMinutes * 60000);

    events.push({
      id: i + 1,
      start: start.toISOString().slice(0, 16), // Format: "2025-10-02T14:30"
      end: end.toISOString().slice(0, 16),
      title: eventTitles[Math.floor(Math.random() * eventTitles.length)],
      resource: Math.floor(Math.random() * 15) + 1, // Random resource 1-15
    });
  }

  return events;
}

const eventTitles = [
  "Team Meeting",
  "Project Review",
  "Client Call",
  "Code Review",
  "Sprint Planning",
  "Lunch Break",
  "Workshop",
  "Training Session",
  "Daily Standup",
  "Product Demo",
];
