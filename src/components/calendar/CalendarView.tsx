
import React, { useState, useEffect, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventModal from "./EventModal";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Type for an event (meeting)
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  endTime: Date;
  attendees: string[];
}

const CalendarView: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { user } = useAuth();

  // Fetch events from Supabase for current user
  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const start = new Date(date ?? new Date());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    // Fetch up to 1 week range to show dots, but filter for daily display
    const minDate = new Date(start);
    minDate.setDate(start.getDate() - 7);
    const maxDate = new Date(start);
    maxDate.setDate(start.getDate() + 7);

    // get all meetings for this user for +-7 days for calendar marks
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("user_id", user.id)
      .gte("start_time", minDate.toISOString())
      .lte("end_time", maxDate.toISOString());

    if (error) {
      toast.error("Failed to fetch events.");
      setLoading(false);
      return;
    }
    setEvents(
      (data ?? []).map(evt => ({
        id: evt.id,
        title: evt.title,
        description: evt.description ?? "",
        date: new Date(evt.start_time),
        endTime: new Date(evt.end_time),
        attendees: evt.attendees ?? [],
      }))
    );
    setLoading(false);
  }, [user, date]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Add new event to Supabase
  const handleAddEvent = async (event: {
    title: string;
    startTime: Date;
    endTime: Date;
    description?: string;
    attendees: string;
  }) => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("meetings").insert({
      user_id: user.id,
      title: event.title,
      description: event.description,
      start_time: event.startTime.toISOString(),
      end_time: event.endTime.toISOString(),
      attendees: event.attendees
        ? event.attendees
            .split(",")
            .map(a => a.trim())
            .filter(Boolean)
        : [],
      is_virtual: false,
    });
    if (error) {
      toast.error("Failed to add event");
    } else {
      toast.success("Event created!");
      setModalOpen(false);
      fetchEvents();
    }
    setLoading(false);
  };

  // Filter events for the selected day
  const selectedDateEvents = events.filter(
    (event) =>
      date &&
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
  );

  // Helper to format time
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
                {date
                  ? date.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select a date"}
              </h3>
              <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : selectedDateEvents.length > 0 ? (
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
                        {/* <Button variant="ghost" size="icon">
                          ... implement edit/delete later ...
                        </Button> */}
                      </div>
                      {event.attendees?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {event.attendees.map((attendee, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {attendee}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {event.description && (
                        <p className="text-xs mt-2 text-muted-foreground">{event.description}</p>
                      )}
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
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setModalOpen(true)}>
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
      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddEvent}
        date={date}
        isLoading={loading}
      />
    </div>
  );
};

export default CalendarView;

// NOTE: This file is now quite long. You should consider splitting it into smaller components!
