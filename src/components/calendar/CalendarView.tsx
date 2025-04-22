
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock events data for demonstration
const mockEvents = [
  {
    id: "1",
    title: "Team Meeting",
    date: new Date(new Date().setHours(10, 0, 0, 0)),
    endTime: new Date(new Date().setHours(11, 0, 0, 0)),
    attendees: ["John Doe", "Jane Smith", "Bob Johnson"],
  },
  {
    id: "2",
    title: "Client Call",
    date: new Date(new Date().setHours(13, 30, 0, 0)),
    endTime: new Date(new Date().setHours(14, 30, 0, 0)),
    attendees: ["John Doe", "Client A"],
  },
  {
    id: "3",
    title: "Project Planning",
    date: new Date(new Date().setHours(15, 0, 0, 0)),
    endTime: new Date(new Date().setHours(16, 0, 0, 0)),
    attendees: ["John Doe", "Jane Smith", "Project Team"],
  },
  // Events for tomorrow
  {
    id: "4",
    title: "Daily Standup",
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(9, 30, 0, 0)),
    attendees: ["Dev Team"],
  },
];

const CalendarView: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState(mockEvents);

  // Filter events for the selected day
  const selectedDateEvents = events.filter(
    (event) => 
      date && 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
  );

  // Helper to format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Has events function for calendar
  const hasEvents = (day: Date) => {
    return events.some(
      (event) =>
        event.date.getDate() === day.getDate() &&
        event.date.getMonth() === day.getMonth() &&
        event.date.getFullYear() === day.getFullYear()
    );
  };

  return (
    <div className="grid md:grid-cols-5 gap-4 h-full">
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              modifiers={{
                hasEvents: (date) => hasEvents(date),
              }}
              modifiersClassNames={{
                hasEvents: "bg-primary/20 font-bold text-primary",
              }}
            />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-3">
        <Card className="h-full">
          <CardContent className="p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">
                {date ? date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
              </h3>
              <Button size="sm" variant="outline">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                Add Event
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-40px)]">
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border rounded-md bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(event.date)} - {formatTime(event.endTime)}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {event.attendees.map((attendee, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {attendee}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-2 opacity-50"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  <p>No events scheduled for this day</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                    Schedule an event
                  </Button>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
